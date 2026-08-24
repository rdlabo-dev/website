---
title: "Workers KV vs Cache API — Where Each Belongs"
description: "After moving from ElastiCache to Cloudflare, per-key KV billing surfaced waste. Split short-lived colo-local responses into Cache API and cross-colo artifacts into KV."
zennSlug: workers-kv-cache-api-boundary
emoji: "🧭"
---

ElastiCache is already running. So 30 `GET`s for a list of 30 items does not change the bill.

Right after moving to Cloudflare Workers, I moved those Redis keys to Workers KV. Both are key-value stores. Both support TTL. As a port, it felt natural.

Until I read the pricing table.

![Cloudflare invoice with account ID and invoice ID redacted](/images/workers-kv-cache-api-boundary/cloudflare-invoice-redacted.png)

Soon after the Cloudflare migration, a $31.64 invoice arrived. Not a disaster. Still enough to make me sweat. I rushed to review the breakdown.

With KV, reads and writes are counted per key. Counts that melted into ElastiCache's monthly fee showed up on Cloudflare with a price tag on every operation.

So I moved short-lived responses to Cache API and kept only what must be shared across colos in KV. Cost triggered the change, but what remained was "how widely do I need to share this data."

# 1. On ElastiCache, 30 GETs in one request stayed inside the monthly fee

ElastiCache charges for the node you provision. It is not unlimited reads, but while headroom remains, one more `GET` does not appear on the invoice as one operation.

With that mindset I moved Redis keys to KV. Attachments per thread; a list request with 30 items reads 30 keys inside it. On AWS that was ordinary.

Workers KV Paid pricing as of August 2026:

| Operation | Included per month | Overage |
| --- | ---: | ---: |
| key read | 10 million | $0.50 / 1M |
| key write | 1 million | $5.00 / 1M |
| key delete | 1 million | $5.00 / 1M |
| key list | 1 million | $5.00 / 1M |

[Cloudflare: Workers KV Pricing](https://developers.cloudflare.com/kv/platform/pricing/)

Reading a missing key still costs one read. A bulk read saves one round trip, but billing counts keys retrieved.

If a list API runs 100k times per month, that is 3M reads. At 1M per month, 30M reads. Subtract 10M included: 20M overage at $10.

$10 will not bankrupt me. But the same design spreads to other lists, other users, other features. Write overage is 10× read. Counts I overlooked on ElastiCache because "it is already running" suddenly mattered.

# 2. Workers has Cache API

Cloudflare Workers can operate Cloudflare's cache directly via Cache API. `caches.default.match()` reads a response; `caches.default.put()` stores one.

And `match()` and `put()` on Cache API do not have per-operation pricing like KV.

Calling Cache API does not add another Worker request. It runs inside the Worker already handling the request. CPU is still consumed, but absorbed into the same invocation, so compared with KV the extra cost of Cache API is effectively zero.

[Cloudflare: Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)

So should everything move to Cache API?

No. Cache API content is not replicated outside the data center where it was stored. Cloudflare calls a data center a colo. A response stored in Tokyo does not appear in San Jose's cache.

[Cloudflare: Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/)

Cache API trades a bit of hit rate for no per-operation fee. Another colo means a miss. If I can rebuild, that is fine.

KV, on the other hand, can be read from multiple colos. It is eventually consistent; updates may take time to appear from other colos.

[Cloudflare: How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)

Roles split like this:

| Property needed | Storage |
| --- | --- |
| Reusable in the same colo; regenerable if lost | Cache API |
| Read across colos; replication delay acceptable | Workers KV |
| Immediate consistency, atomic updates, strict locks | DB or Durable Objects |

It was not about long vs short TTL. It was sharing scope.

# 3. Moved short-lived responses to Cache API

First I moved public group responses, Google Places, weather, holidays, and similar results. Same input yields the same response; if cache disappears I can rebuild from DB or external APIs.

At the handler start I check Cache API; on hit I return without hitting the DB.
```ts
const key = new Request(new URL('/_edge-cache/public/123', request.url));
const cached = await caches.default.match(key).catch(() => undefined);
if (cached) return cached;

const response = Response.json(await service.findPublicData('123'));
response.headers.set('Cache-Control', 'public, max-age=60');
await caches.default.put(key, response.clone()).catch(() => undefined);
return response;
```
On cache hit, KV reads are zero and no DB connection or query runs.

But only public responses are targets. Putting user-ID- or permission-varying responses under the same key is an accident before it is a savings. Every input that determines the response goes into the key.

I treat `match()` and `put()` failures as cache miss. Cache must not make a response that could be returned fail.

# 4. Turned 30 keys into one list key

Attachments moved to Cache API too, but changing storage alone left 30 operations. So I cached "the entire list being displayed" instead of per thread.
```ts
const ids = [...new Set(threadIds)].sort((a, b) => a - b);
const hash = await sha256(ids.join(','));
const key = new Request(
  new URL(`/_edge-cache/attachments/${hash}`, request.url),
);
```
`[3, 2, 2, 1]` and `[1, 2, 3]` share one key. Thirty KV reads for a list of thirty became one Cache API `match()`.

When source data changes, a short TTL lets entries expire naturally. Reverse-mapping every list combination for deletion is more complex than the cache body itself.

Cache API limits remain: `cache.delete()` only clears the colo where it runs. Data that must vanish from all colos immediately does not belong here.

# 5. Generated artifacts that must be read in any colo stay in KV

Sitemap stays in KV. I wanted daily-generated XML readable no matter which colo the next request hits.

But I do not need to read KV on every delivery. Cache API sits in front.
```text
request
  -> Cache API (1 hour)
  -> Workers KV (daily generated XML, 26 hours)
  -> Regenerate from the database
```
Requests from the same colo return from Cache API; only a colo's first request reads KV. KV is storage for cross-colo artifacts; Cache API is storage for recently served responses.

It was not a binary choice between KV and Cache API. Layering caches with different sharing scopes reduces KV reads while reusing the same artifact in another colo.

# 6. Even when effectively free, do not use it for locks

Cache API cannot guard correctness. It is colo-local with no durability or atomic operations.

For example, a stamp that `lastLogin` was updated within five minutes is fine. If cache disappears or concurrent requests slip through, I only get a few extra DB writes.

It cannot handle double payment or inventory reservation. Another colo has no same entry, and nothing is atomic between `match()` and `put()`.

Cache API is a hint to reduce wasted work. It is not a lock that guarantees correctness. I decide that boundary before price.

# 7. The pricing table was a design review

Using Workers KV as cache was not wrong. If I need the same value across colos, paying for that sharing scope makes sense.

What I got wrong was moving every Redis key to KV just because TTL exists.

Now I decide sharing scope first:

- Responses reusable in the same colo → Cache API
- Artifacts to read across colos → Workers KV
- Immediate consistency or strict locks → DB or Durable Objects

On ElastiCache, 30 reads in one request ended with "it is already running." On Workers KV, 30 reads show up as 30. Cloudflare did not make it expensive; I had simply not been counting.

Cache API trades a bit of hit rate for effectively no extra cost. KV is for sharing scope I truly need.

I thought I was reading a pricing table; I ended up reviewing design.

See you next time.
