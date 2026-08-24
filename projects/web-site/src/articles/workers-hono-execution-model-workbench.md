---
title: "If EC2 Is a Rented Office and Lambda Is a Meeting Room, Cloudflare Workers Is a Workbench"
description: "A metaphor for the Workers execution model: why server code broke after moving NestJS to Hono + Workers, and how to decide where state and work live and how long they last."
zennSlug: workers-hono-execution-model-workbench
emoji: "🛠️"
---

If EC2 is a rented office, I think of Lambda as a rented meeting room. Cloudflare Workers is closer to a small workbench.

These are not precise technical terms, of course. But when I moved NestJS from EC2 to Hono + Workers, thinking in this metaphor made the trouble I hit much easier to understand.

This article does not try to explain the Workers execution model exhaustively. It organizes why code that ran fine on a server broke on Workers.

The short answer: what I needed to rethink in the migration was not the processing itself, but **where to put state and work, and how long to keep them**.

# Execution environments as places

Before explaining runtime specs precisely, here is how I picture the "space" I get on EC2, Lambda, and Workers.

## EC2 is a rented office

On EC2, I can leave my application in the room I rent.

- Keep processes running
- Hold a DB connection pool
- Grow in-memory cache
- Run timers
- Put local files on disk

Restarts and Auto Scaling exist, of course, but the basic unit of application design is a "long-lived server." It feels like a rented office where I can leave my furniture in place.

## Lambda is a rented meeting room

On Lambda, I rent a room when an event arrives and do the work there. The same execution environment may be reused, but I cannot assume it persists.

Still, it is a meeting room, so a single invocation can carry a reasonably sized chunk of work. Inside AWS I can use building facilities such as IAM Role credential chains and VPC.

## Workers is a workbench

Workers, by default, feel like spreading tools on a workbench near where the request arrived, then packing up when done. But that bench is not necessarily mine alone.

The same isolate may serve the next request too. From the app I cannot decide how long it stays, whether the next request uses the same place, or how many requests share it.

Mapping the metaphor back to the execution model, the differences look like this.

| | EC2 | Lambda | Workers |
|---|---|---|---|
| Basic design unit | Long-lived process | Invocation | Request / event |
| Execution environment reuse | Managed by me | Sometimes | Sometimes |
| Concurrent work in the same environment | Depends on app layout | Environment per invocation | One isolate may handle multiple requests |
| Work after the response | Can run while the process remains | Follows invocation lifetime | Passed explicitly to `waitUntil()` and similar |

Without keeping these differences in mind, I brought in designs that assumed a "long-lived process" like on EC2—and several incidents followed.

# Four troubles on the workbench

Treating Workers like a rented office caused problems around initialization, background work, shared state, and distance to the DB.

## Trouble 1: Fetching every tool on every request

At first I assumed "on Workers I rebuild everything every time" and assembled the Hono app, Secrets Manager values, config, and services on every request. Preparation ended up taking longer than the work itself.

That does not mean I can leave a DB connection on the workbench either. Cloudflare's Hyperdrive official examples also create a mysql2 connection per request and leave the pool behind to Hyperdrive.

```text
Reuse in the isolate: Hono app, validated immutable configuration, safe shared memoization
Create per request: DB connection, request container, authentication state
```

What I keep at module scope is limited to things I can rebuild if they disappear and that are safe when shared across multiple requests. I cannot pass I/O objects such as streams or connections created in one request to the next.

I drew the boundary not by "can I reuse this?" but by "is it OK if this disappears?" and "is it safe when used concurrently?"

[Hyperdrive connection lifecycle](https://developers.cloudflare.com/hyperdrive/concepts/connection-lifecycle/)

## Trouble 2: Thinking I could keep working after the response

On EC2, even `void somePromise()` after the response may keep running while the process remains. On Workers, unregistered work after the response completes may be cut off.

So the response could succeed while notifications or DB writes I started afterward never finished.

Passing a Promise to `ctx.waitUntil()` lets an HTTP Worker run for up to 30 seconds after sending the response or after the client disconnects. But I cannot push everything to the background.

Work that uses request-scoped DB connections or that affects whether the response succeeds must be `await`ed before the response. Short work like logs or cache updates goes to `waitUntil()`. Jobs that need retries or delivery guarantees go to a Queue. When using a Queue, the consumer runs the job, but enqueueing itself is `await`ed before the response.

[Cloudflare Workers `waitUntil()`](https://developers.cloudflare.com/workers/runtime-apis/context/#waituntil)

## Trouble 3: Sharing tools and hitting races

I can reuse the isolate's global scope, but it is not single-user. Putting "the current user" or a per-request container in module variables mixes them under concurrent requests on the same isolate.

A test in isolation can look correct; under concurrent access, user or container can swap mid-request to another request's values.

What belongs in globals is, in principle, immutable config and shared cache that I can regenerate if lost. Request-specific values go on Hono's `Context`.

```ts
app.use('*', async (c, next) => {
  const container = await createRequestContainer(c.env, c.executionCtx);
  c.set('container', container);
  await next();
});
```

The problem was not global variables themselves—it was **escaping request-owned state into globals**.

## Trouble 4: Forgetting the distance between the workbench and the DB

Workers run near the user by default, but that does not mean they are near RDS. Serially `await`ing independent DB queries adds round-trip time between the edge and origin for each query.

Code that did not stand out when EC2 sat in the same region as RDS suddenly slowed after the Workers move—for this reason. I needed to reduce round trips, not only optimize placement.

```text
Sequential query latency ≒ Worker-to-DB round-trip time × number of queries
```

Parallelize independent queries and batch what can be batched. When communication with backends like the DB dominates, use Smart Placement or explicit Placement to move the Worker closer to the backend.

[Cloudflare Workers Placement](https://developers.cloudflare.com/workers/configuration/placement/)

# Designing for the workbench

I do not throw everything away. I separate what can stay on the workbench from what needs another place.

## Designing as a workbench

When I read Workers code now, I first split things into these four buckets.

| Lifetime | What to put there | Decision criteria |
|---|---|---|
| Deploy unit | Module code, Hono app definition | OK to share across all requests? |
| Isolate unit | Immutable config, memo safe to share | Can it survive loss and concurrent use? |
| Request unit | DB connection, DI container, user context | Can it be cleaned up by response time? |
| After response | Short work that finishes in `waitUntil()` | OK for the response to succeed if this fails? |

State or work that must survive past a request does not stay on the workbench. I put it explicitly elsewhere: DB for normal persistent data, Queue for async jobs, Durable Objects when I need consistent state and ordering for a specific ID.

Durable Objects are not a permanent office either. In-memory state does not survive hibernation or eviction, so important state goes to Storage and the design must allow reconstruction.

[Durable Objects lifecycle](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/)

## Five workbench review questions

After the migration, code review checks these five things.

1. Who owns this state?
2. How long does it need to live?
3. Is it safe when used concurrently from multiple requests?
4. Can I rebuild or retry if the execution environment disappears mid-flight?
5. How many round trips to the backend?

I do not need to memorize every Workers-specific API. If I can answer these five, I catch many design mistakes early.

# Summary

What changed moving from EC2 to Workers was not server size—it was where state and work live and how long they last.

A workbench is convenient: ready where I need it, and cleanup is handled for me. But it does not pair well with designs that leave personal belongings out or keep working after handoff.

Keep at module scope only what is fine to lose and safe under concurrent use. Finish work required for the response before responding. Pass state and work that cross requests explicitly to DB, Queue, Durable Objects, and the like.

Keeping those three in mind makes it easier to draw boundaries for containers, DB connections, `waitUntil()`, and Queues. The design change the Workers migration needed was not lifting server code as-is, but rearranging work so it completes safely on the workbench.

See you next time.
