---
title: "Measuring and Improving Cloudflare Workers Performance with a Shared Hono Logger"
description: "How perfLog middleware, Workers Logs, and Analytics Engine help identify slow Hono routes, measure improvements with p50 and p95, and guide deeper investigation with Workers Tracing."
zennSlug: workers-hono-perflog-vs-tracing
emoji: "📈"
updatedAt: "2026-10-28"
translatedProseBlocks:
  - d2e696ef2830842585442cf4def12a9e4f2cb923f12ca4add32f99d90f051ddd
  - da91a4584f5fb292f02d9ae25d08c2abd1b02b30f8d2efbe1574d6db2a721c65
---

After migrating from NestJS to Hono + Cloudflare Workers, I noticed that a few APIs were particularly slow. Some projects received so few requests that waiting for a slow one with `wrangler tail` was not a practical way to investigate.

Before I could improve performance, I needed to identify the slow endpoints. Cloudflare Workers Tracing provides a detailed view of fetch and binding calls within a single request, but my first priority was to collect p50 and p95 measurements for each Hono route.

I added a shared performance logging layer to `@rdlabo/workers-hono-kit` for use across multiple Hono projects. The middleware, called `perfLog`, records a consistent set of fields for every request. I can then aggregate the data to see which endpoints are consistently slow and whether their p50 or p95 improves after a change.

p50 is the median: half of all requests finish within that time. p95 is the time within which 95% of requests finish. These percentiles help distinguish typical performance from the slower tail, a difference that averages can obscure.

This article explains why I moved measurement into a shared library, what `perfLog` records, how the data is stored in Workers Logs and Analytics Engine, and how to find slow endpoints and confirm improvements. I use Workers Tracing when I need to go inside an endpoint I already found.

# What the performance logging layer needed

By "logging layer," I mean a small component that stores and aggregates the fields needed to compare API performance in a consistent format. It does not replace application logs or the full capabilities of Tracing.

To use it across Hono projects, I needed it to:

- Aggregate by the route matched by Hono rather than by raw URL
- Support later analysis of low-traffic services without waiting on a live tail
- Use the same schema and SQL across all projects
- Preserve the application’s API response if a telemetry destination fails or configuration is missing

Knowing that an API is slow does not tell me which individual request trace to open. I needed a starting point that groups requests by route and narrows the investigation to slow routes.

| What you want to observe | Workers Tracing | perfLog + Analytics Engine |
|---|---|---|
| Breakdown of fetch and binding calls within one request | Well supported | Not available |
| CPU time, wall time, outcome | On root span | `t_app` and status only |
| p50 / p95 per route | Needs trace search/aggregation | Fixed schema SQL |
| Compare by colo, cold/warm | Needs attributes or custom logic | Dimensions from the start |
| Compare data from several weeks ago | Limited by dashboard retention | Analytics Engine retains three months |
| Specific application steps | Custom spans | Total time through the middleware only |

The point is not that perfLog is more capable than Tracing. perfLog identifies requests worth investigating; Tracing reveals what happens inside them.

```text
every request
  └─ perfLog
       ├─ Workers Logs      inspect recent raw data
       └─ Analytics Engine aggregate trends by route and compare before/after

when a slow route is found
  └─ Workers Tracing       drill into one request
```

## What Workers Tracing shows

With Tracing enabled, these spans are recorded without code changes:

- Outbound `fetch()`
- Binding calls such as KV, R2, Durable Objects
- Handler totals for fetch, scheduled, queue, etc.

https://developers.cloudflare.com/workers/observability/traces/

The root span includes `cloudflare.cpu_time_ms`, `cloudflare.wall_time_ms`, `cloudflare.colo`, outcome, invocation ID, and more.

https://developers.cloudflare.com/workers/observability/traces/spans-and-attributes/

```toml
[observability.traces]
enabled = true
head_sampling_rate = 0.05
```

Tracing provides much more detail when you need a timeline showing where time was spent in external API calls, bindings, and application steps.

## Questions perfLog answers first

After moving from NestJS to Hono + Workers, I first wanted answers to questions such as:

- Which endpoints are slow even on warm requests?
- What are p50 / p95 for `/user/status`?
- Did p50 / p95 improve before and after parallelizing serial queries?
- Is slowness only on cold requests?
- Are requests arriving outside Tokyo also slow?

These are easier to spot by grouping requests on the same dimensions and computing percentiles before opening traces one by one.

# Why measurement lives in a shared library

I considered putting measurement code directly in each project. If column order, route folding, or cold detection differ slightly, the same SQL cannot compare projects. Error handling on write and sampling must also match everywhere.

So I implemented `perfLog` as Hono middleware that leaves one small data point per request and added it to `@rdlabo/workers-hono-kit`. Each project adds one middleware line and emits performance logs in the same schema.

The Analytics Engine binding type is a small interface with only the `writeDataPoint()` I need, defined inside the kit. That avoids forcing `@cloudflare/workers-types` on consumers. Cloudflare’s actual binding can be assigned directly to that interface.

https://github.com/rdlabo-dev/workers-hono-kit/blob/main/src/middleware/perf-log.ts

## Minimum setup: install, middleware, binding

```sh
npm install @rdlabo/workers-hono-kit
```

```ts
import { perfLog } from '@rdlabo/workers-hono-kit';

const app = new Hono<AppBindings>();

app.use('*', perfLog());
app.use('*', requestId());
app.use('*', containerMiddleware());
app.route('/', apiRouter);
```

Register it first so `next()` wraps the whole application—including auth, container middleware, and route handlers.

In `wrangler.toml`, add settings for recent raw data in Workers Logs and an Analytics Engine binding for aggregation.

```toml
[observability]
enabled = true

[vars]
PERF_LOG = "1"

[[analytics_engine_datasets]]
binding = "PERF"
dataset = "myapp_perf"
```

With bare `perfLog()`, it reads `PERF_LOG` and `PERF` from Hono's `c.env` and writes to both. You can start with one sink only.

Simplified middleware flow:

```ts
const start = Date.now();
await next();
const tApp = Date.now() - start;

dataset.writeDataPoint({
  doubles: [tApp, cold ? 1 : 0, c.res.status],
  blobs: [matchedRoute, colo, c.req.method],
  indexes: [matchedRoute],
});
```

The real implementation also short-circuits when output is not configured, applies sampling, hashes long indexes, and protects against Analytics Engine write failures.

## Data recorded for each request

Analytics Engine columns and Workers Logs JSON are fixed as follows.

| Analytics Engine | Meaning | Workers Logs |
|---|---|---|
| `double1` | `t_app`, elapsed ms inside Hono app | `perf.t_app` |
| `double2` | 1 if cold, 0 if warm | `perf.cold` |
| `double3` | HTTP status | `perf.status` |
| `blob1` / `index1` | Hono matched route pattern | `perf.path` |
| `blob2` | `request.cf.colo` | `perf.colo` |
| `blob3` | HTTP method | `perf.method` |

Analytics Engine’s generic column names are difficult to interpret on their own, so the middleware gives them a fixed meaning through this schema. Reusing the same SQL across Hono projects was one reason to put the middleware in the shared kit.

## Use route pattern, not raw URL

Storing `/users/123` as-is creates a separate series per user ID. I use the route pattern Hono matched.

```text
/users/123      → /users/:userId
/users/456      → /users/:userId
/wp-login.php   → (unmatched)
```

Grouping IDs under their route patterns limits cardinality. Unmatched requests, including many bot requests and 404s, are grouped as `(unmatched)`.

Analytics Engine indexes are limited to 96 bytes, so longer route patterns get a stable hash in `index1`. The full path remains in `blob1`, so display and grouping do not lose it.

https://developers.cloudflare.com/analytics/analytics-engine/limits/

## What `t_app` includes

`t_app` is not whole-Worker time—it is how long `perfLog` waited on `next()`.

For example, if secrets and DB connections run in container middleware, that time is included. If you build the container in the Worker's `fetch()` before Hono, that work is outside `t_app`.

```text
Worker fetch
  ├─ work performed outside Hono app ← not included in t_app
  └─ perfLog
       └─ auth / container / handler  ← included in t_app
```

Do not naively compare cold `t_app` across projects whose middleware order differs. Its primary purpose is to identify slow endpoints and compare performance before and after changes within each project.

On Workers, `Date.now()` advances at I/O boundaries due to Spectre mitigations. `t_app` is closer to wall time including I/O waits for DB and external APIs, not a CPU profile. That property helped find APIs dominated by DB round-trips.

https://developers.cloudflare.com/workers/runtime-apis/performance/

## Cold is an approximate per-isolate flag

I use a module-scope flag and treat only the first request in that isolate as cold.

```ts
let isolateWarm = false;

const cold = !isolateWarm;
isolateWarm = true;
```

This is not a Cloudflare-guaranteed cold start metric. If several requests arrive in parallel on first use, the second may be classified warm while still waiting on initialization. It is a practical approximation to separate cold-looking outliers from steady values, not strict classification.

# Output to both Workers Logs and Analytics Engine

`perfLog` has two sinks: Workers Logs for immediate checks and Analytics Engine for later aggregation. Below is how the minimum setup switches internally.

## Calling perfLog() without options reads Hono env

When you pass env into Hono with `app.fetch(request, env, ctx)`, calling `perfLog()` without options reads:

- `PERF`: Analytics Engine dataset binding
- `PERF_LOG === '1'`: output to Workers Logs

```ts
app.use('*', perfLog());
```

If your application does not pass bindings into Hono env, provide them explicitly:

```ts
app.use(
  '*',
  perfLog({
    console: env.PERF_LOG === '1',
    dataset: env.PERF,
    sampleRate: 1,
  }),
);
```

Explicit options override env fallback. For example, `console: false` stops console output even when `PERF_LOG='1'`.

## Workers Logs for recent checks

With `[observability]` and `PERF_LOG = "1"`, each request emits structured JSON like:

```json
{
  "perf": {
    "cold": false,
    "colo": "NRT",
    "method": "GET",
    "path": "/user/status",
    "status": 200,
    "t_app": 842
  }
}
```

Workers Logs Query Builder can filter on `$.perf.path` and `$.perf.colo`. Data is retained, so you do not wait for a request at query time.

https://developers.cloudflare.com/workers/observability/logs/workers-logs/

`wrangler tail` is useful immediately after setup or on Workers with heavy traffic. On low-traffic projects, however, the request I want to inspect may never arrive while the tail is open. That was an early obstacle when building perfLog. I store data in Workers Logs or Analytics Engine so I can inspect it later instead of waiting for it live.

## Analytics Engine for percentile aggregation

The dataset for the `PERF` binding is created on first `writeDataPoint()`—no upfront provisioning. With named environments, this binding is not auto-inherited; define it on `env.production` too.

Analytics Engine writes do not block the request. Middleware also catches write errors so observation failure does not turn a response that would have been 200 into 500.

https://developers.cloudflare.com/analytics/analytics-engine/get-started/

Analytics Engine retains data for three months and aggregates percentiles via SQL API. For comparing low-traffic before/after across weeks, that is easier than Tracing or Workers Logs with 3- or 7-day retention.

https://developers.cloudflare.com/analytics/analytics-engine/sql-api/

# Find slow endpoints first

After adding measurement, I do not start with colo differences or Smart Placement. I filter to warm requests that arrived at home colo and look for slow endpoints. Here, colo is the three-letter Cloudflare data center code in `request.cf.colo`.

## Warm p50 / p95 by path, slowest first

```sql
SELECT
  blob1 AS path,
  quantileExactWeighted(0.5)(double1, _sample_interval) AS p50,
  quantileExactWeighted(0.95)(double1, _sample_interval) AS p95,
  sum(_sample_interval) AS n
FROM myapp_perf
WHERE timestamp > now() - INTERVAL '7' DAY
  AND double2 = 0
  AND blob2 IN ('NRT', 'KIX')
  AND blob3 != 'OPTIONS'
  AND blob1 != '(unmatched)'
  AND double3 < 400
GROUP BY path
ORDER BY p95 DESC
LIMIT 25
```

What matters here is `_sample_interval`. Analytics Engine may apply adaptive sampling, so use `sum(_sample_interval)` and `quantileExactWeighted()` instead of `count()` or ordinary `quantile()`. The `n` in the query results is the request count adjusted for that sampling weight.

https://developers.cloudflare.com/analytics/analytics-engine/sampling/

`OPTIONS` is mostly 0 ms CORS preflight; `(unmatched)` is mostly bots and 404s. Including them as-is dilutes overall p50, so I exclude them for endpoint latency investigation.

4xx and 5xx can follow different paths than success, so I separate steady endpoint latency from them. That is not hiding errors—I check `double3 >= 400` in separate status aggregations.

Routes with high volume and high p50 or p95 are first fix candidates. Using these filters, I found a status endpoint that took about two seconds even for warm requests because it awaited several queries in sequence.

## Separate cold-only slowness

```sql
SELECT
  double2 AS cold,
  quantileExactWeighted(0.5)(double1, _sample_interval) AS p50,
  quantileExactWeighted(0.9)(double1, _sample_interval) AS p90,
  sum(_sample_interval) AS n
FROM myapp_perf
WHERE timestamp > now() - INTERVAL '7' DAY
  AND blob3 != 'OPTIONS'
  AND blob1 != '(unmatched)'
  AND double3 < 400
GROUP BY cold
```

If warm requests are fast but cold requests are slow, investigate secret retrieval, database connections, and cache initialization. If warm requests are also slow, look at the work performed for every request: query counts, indexes, and external API calls.

## Compare before and after with the same SQL

```sql
SELECT
  toStartOfDay(timestamp) AS day,
  quantileExactWeighted(0.5)(double1, _sample_interval) AS p50,
  quantileExactWeighted(0.95)(double1, _sample_interval) AS p95,
  sum(_sample_interval) AS n
FROM myapp_perf
WHERE timestamp > now() - INTERVAL '14' DAY
  AND blob1 = '/user/status'
  AND double2 = 0
  AND double3 < 400
GROUP BY day
ORDER BY day
```

Compare the periods before and after deploying changes such as parallelizing sequential queries, adding indexes, or moving notifications to a Queue. I track p50 and p95 because a handful of slow requests can skew the average.

## Investigating a status endpoint that took about two seconds

Following the status endpoint from the per-path aggregation into its code, I found that it awaited independent read queries one after another.

```ts
const profile = await repository.getProfile(userId);
const tags = await repository.getTags(userId);
const unread = await repository.getUnread(userId);
```

After confirming that no query depended on another’s result and that changing their order would not affect authorization or side effects, I started them in parallel.

```ts
const [profile, tags, unread] = await Promise.all([
  repository.getProfile(userId),
  repository.getTags(userId),
  repository.getUnread(userId),
]);
```

Do not mechanically parallelize every sequential `await`. On the same DB connection they may still serialize on the wire; writes, cache invalidation, and post-authorization side effects need order. Sometimes one merged query is better.

Then I return to perfLog and compare p50 and p95 before and after deploy on the same route, warm, success-only conditions. The same data helps identify slow endpoints and confirm the improvement, so the investigation does not end with “it feels faster.”

## colo is not where the Worker runs

`perf.colo` is `request.cf.colo`—the edge where the request arrived. With Smart Placement moving the Worker near the DB, this value is not the Worker's execution location.

With Placement enabled, Cloudflare adds a `cf-placement` header. For example, `remote-LHR` means the request was forwarded and the Worker ran near London. The docs note this header may be removed while in beta. To track execution location over time, Tracing's `cloudflare.colo` also works.

https://developers.cloudflare.com/workers/configuration/placement/

After enabling Smart Placement, `t_app` for requests arriving at distant edges may fall to levels similar to requests arriving near the database. Conversely, an isolated cold request just after deployment or from a region with little traffic may still be slow. Do not conclude "Smart Placement is not working" from one distant colo sample—confirm execution location with `cf-placement` or Tracing, filter to warm, and check you have enough samples.

On services with few users, fixing one endpoint that takes 2 seconds often beats colo comparison. I use colo comparison as triage after finding slow endpoints.

# Locate the bottleneck with perfLog, then investigate with Tracing

My investigation followed this sequence:

1. Compute warm path p50 / p95 in Analytics Engine
2. Pick endpoints that are slow and heavily used
3. Open Workers Tracing for a matching request and inspect fetch and binding breakdown
4. Wrap DB queries or service steps in custom spans if needed
5. Fix code and deploy
6. Compare before and after with the same Analytics Engine SQL

Use custom spans in Tracing to give application-specific steps meaningful names.

https://developers.cloudflare.com/workers/observability/traces/custom-spans/

perfLog alone cannot tell you how much of an 842 ms request was spent on each query. Tracking several weeks of trends across all routes using Tracing alone would require additional work to provide the fixed dimensions and retention period I needed.

I use the two tools for different stages: finding candidates across the application, then investigating individual requests in detail.

# Be explicit about perfLog’s limits

It is small middleware, so what it cannot measure is clear:

- `t_app` is not CPU time
- Work before the Hono app is not included
- Completion time of work passed to `waitUntil()` is not included
- cold/warm is approximate via isolate flag
- No per-query breakdown inside a route
- Not end-to-end latency including client-to-edge network

Use Tracing or Workers Metrics to investigate CPU time, Tracing to inspect individual requests, and frontend measurements to understand the user’s experience.

I also did not casually add dimensions beyond route pattern, colo, method, and status. I do not put user ID, email, or request body in performance logs—to avoid PII and cardinality growth.

# Consider sampling and cost for each destination

`perfLog({ sampleRate })` throttles only Analytics Engine writes. Workers Logs use `observability.head_sampling_rate`; Tracing uses `observability.traces.head_sampling_rate` separately.

With low traffic, discarding samples makes analysis harder, so I keep Analytics Engine’s `sampleRate` at 1. As traffic grows, I review the volume and cost for each destination before reducing its sampling rate.

As of August 11, 2026, Workers Tracing was free during beta, and Cloudflare had announced that billing would begin on October 1, 2026. Each span is counted as an observability event.

At the time the original article was written, future pricing for Analytics Engine had also been published, but billing had not yet started. Prices and start dates can change, so check the official information when reading this article.

https://developers.cloudflare.com/analytics/analytics-engine/pricing/

# Summary

Performance work does not start by staring at slow requests. You first need to know which endpoints are slow, by how much, and how often.

To do that, I added a performance logging layer to the shared library that records route, colo, cold/warm state, status, and `t_app` in a consistent schema. Each Hono project adds a single `perfLog()` middleware call. The stored data makes it possible to identify slow endpoints and compare percentiles before and after a change.

Once I have found a slow endpoint, I use Workers Tracing to examine fetch calls, bindings, and application steps within a request. After fixing a cause such as sequential queries, I return to perfLog’s p50 and p95 to measure the effect.

Measure performance, narrow down the candidates, investigate the cause, and compare the same metrics after the fix. Packaging this workflow as a library lets me apply it consistently across multiple projects.

See you next time.
