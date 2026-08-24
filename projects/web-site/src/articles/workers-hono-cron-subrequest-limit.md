---
title: "Cron N+1 Surfaced on Cloudflare Workers — Splitting Full Runs into a Queue"
description: "A Cron job that listed users once then called an external API per user hit subrequest limits on Workers. Even after higher limits, bounded Queue consumers beat one heroic invocation."
zennSlug: workers-hono-cron-subrequest-limit
emoji: "🚧"
---

I moved a Cron Trigger job that updates every user's state to Cloudflare Workers.

Fetch target IDs once from the DB, call an external API once per target — "one list query + N per target," an N+1 shape. On EC2 cron it ran as one long full batch, so I did not feel that structure strongly.

Here N+1 is not the classic ORM pattern of reading related records one by one. But external I/O still grows with target count N. On Cloudflare Workers, subrequest limits per invocation made this N+1 show up as execution failure.

Later Cloudflare raised the Paid default limit from 1,000 to 10,000 and allows up to 10 million. Did that mean no design change was needed?

Even with relaxed limits today, I think Cron should not execute all N items in one run.

# How N+1 appeared in Cron

The original flow was one DB query to find targets and N external API calls per target.
```text
1: List target users
N: Call the external API for each user
```
Processing all targets in one Cron run grows subrequests with N.

## What is a subrequest

Calling `fetch()` from a Worker, or Cloudflare services like R2, KV, D1, or Queue, counts as subrequests. Redirect chains count each redirect, not one.

Limits as of August 2026:

| plan | subrequests per invocation |
|---|---:|
| Free | 50 external, 1,000 Cloudflare internal |
| Paid | default 10,000, configurable up to 10 million |

https://developers.cloudflare.com/workers/platform/limits/#subrequests

February 2026 change details:

https://developers.cloudflare.com/changelog/post/2026-02-11-subrequests-limit/

Older articles and library comments may still say "Paid is 1,000." When I reviewed workers-hono-kit, stale numbers remained — always check current official docs.

## As N grows, one invocation grows
```ts
export default {
  async scheduled(_event, env) {
    const users = await repository.findAllTargetUsers();

    for (const user of users) {
      await reloadExternalState(user.id); // external fetch
    }
  },
};
```
One external API call per user means at least N subrequests for N users. Redirects and other Cloudflare service calls can push the total higher. Even within limits today, growing business data will exceed them someday.

The problem is not limits alone:

- Cron Trigger wall time is at most 15 minutes
- At most 6 outbound connections can wait simultaneously in one invocation
- On partial failure, hard to know how far completion got
- Retry reruns users already succeeded
- Spikes load on external API rate limits

Raising the limit to 100k does not remove holding N in one invocation.

# Split N into Queue consumers

Instead of one large run, Cron enumerates work; Queue consumers execute in small pieces.

This does not eliminate N external API calls system-wide. It splits N across consumer invocations and keeps each invocation below a fixed batch size.

## Cron enumerates; Queue executes

Now Cron Trigger only enumerates target IDs and enqueues them.
```ts
async scheduled(_event: ScheduledEvent, env: Env) {
  const userIds = await repository.findTargetUserIds();

  for (const chunk of chunks(userIds, 100)) {
    await env.RELOAD_QUEUE.sendBatch(
      chunk.map((userId) => ({ body: { userId } })),
    );
  }
}
```
Queues `sendBatch()` accepts up to 100 messages, 256KB total. With small messages carrying IDs only, Cron fan-out changes like this:
```text
Before: N external API calls
After: ceil(N / 100) sendBatch calls
```
For 1,000 users, one external API call per user inside Cron is at least 1,000 subrequests. Sending to Queue in chunks of 100 makes Cron-side Queue subrequests 10.

https://developers.cloudflare.com/queues/configuration/batching-retries/

Consumers fix work per invocation with `max_batch_size`:
```toml
[[queues.consumers]]
queue = "reload-user"
max_batch_size = 10
max_batch_timeout = 5
max_retries = 3
dead_letter_queue = "reload-user-dlq"
```
With one external API call per message, as users grow, each consumer invocation handles at most 10 external calls. N jobs remain, but each invocation is bounded to at most 10.

## Producer batches also have failure boundaries

Parallel `sendBatch()` finishes Cron faster but obscures failure position and connection count. Producer is not user-facing, so I send batches sequentially. This flow is commonized as `sendInChunks()` in `@rdlabo/workers-hono-kit`.
```ts
for (const batch of batches) {
  await queue.sendBatch(batch);
}
```
If something fails midway, earlier batches are already accepted. Simple full Cron retry duplicates work, so consumers are idempotent under at-least-once delivery.

https://developers.cloudflare.com/queues/reference/delivery-guarantees/

## Send IDs only; consumer refetches

Reading all data in Cron and stuffing messages makes snapshots stale at processing time and grows message size.
```ts
{ userId: 123 }
```
Queue carries small identifiers; the consumer reads DB state at processing time. If the user is no longer a target, no-op.

# When to raise the limit instead

On Paid, Wrangler can raise subrequest limits:
```toml
[limits]
subrequests = 50_000
```
Valid when processing is already checkpointable, external rate limits are managed, and there is a clear reason to keep one invocation. Especially for long-running work like Workflows.

But raising limits only to "make today's full loop pass" means absorbing growing N in ever larger invocations. The same problem returns as data grows.

# Summary

Cloudflare Workers Paid subrequest limits are much looser than before.

Still, running "one list + N per target" in one Cron invocation carries wall time, retry, rate limit, and observability problems.

Splitting into a Queue does not remove N external API calls system-wide. What changed is who holds N and at what size. Cron enumerates and sends batches; consumers execute at most 10 with retries — limiting how things break when N grows.

Even when limit numbers change, bounding work still matters.

See you next time.
