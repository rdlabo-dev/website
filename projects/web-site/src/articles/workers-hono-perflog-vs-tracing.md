---
title: "I Packaged a Hono Performance Logging Layer to Measure and Improve Cloudflare Workers Speed"
description: "Use perfLog middleware with Workers Logs and Analytics Engine to find slow routes by p50/p95, then drill into Workers Tracing for a single request."
zennSlug: workers-hono-perflog-vs-tracing
emoji: "📈"
---

After I migrated from NestJS to Hono + Cloudflare Workers, some APIs stood out as slow. Some projects also had low request volume, so waiting for slow moments with `wrangler tail` did not move investigation forward.

To improve, I first had to find slow endpoints. Cloudflare Workers Tracing traces fetch and bindings in detail for one request, but what I wanted first was p50 and p95 accumulated per Hono route.

So I added a performance logging layer usable across multiple Hono projects to `@rdlabo/workers-hono-kit`. The middleware is named `perfLog`. It records the same fields once per request so I can aggregate later: which endpoint is consistently slow, and whether p50 or p95 dropped before and after a fix.

p50 is the median—half of requests finish within that time. p95 is the boundary within which 95% of requests finish. Averages alone hide normal speed vs the slow tail; percentiles separate them.

This article explains why I moved measurement into a shared library, what `perfLog` records, how it lands in Workers Logs and Analytics Engine, and how to find slow endpoints and confirm improvements. I use Workers Tracing when I need to go inside an endpoint I already found.

# What the performance logging layer needed

Here, "logging layer" does not replace application logs or all of Tracing. It is a small layer that keeps and aggregates only what I need to compare API speed, in the same shape.

To roll it out across Hono projects, I required:

- Aggregate by Hono matched route, not raw URL
- Work with low traffic—check later without waiting on live tail
- Same schema and SQL across all projects
- Do not break the real API response when the measurement target fails or config is missing

Even when I know "the API is slow," I cannot open one-request traces for every endpoint first. I needed an entry point that bundles all requests by route and narrows slow routes.

| What you want to observe | Workers Tracing | perfLog + Analytics Engine |
|---|---|---|
| Breakdown of fetch and bindings in one request | Strong | Unknown |
| CPU time, wall time, outcome | On root span | `t_app` and status only |
| p50 / p95 per route | Needs trace search/aggregation | Fixed schema SQL |
| Compare by colo, cold/warm | Needs attributes or custom logic | Dimensions from the start |
| Compare weeks ago | Dashboard retention limits | Analytics Engine keeps 3 months |
| Specific in-app steps | Custom spans | Middleware total only |

This is not claiming perfLog is more capable than Tracing. perfLog finds candidates; Tracing goes inside them.

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

For following a timeline of external APIs, bindings, and which in-app step waited, Tracing is far more detailed.

## Questions perfLog answers first

After moving from NestJS to Hono + Workers, the trends I wanted first looked like:

- Which endpoints are slow even on warm requests?
- What are p50 / p95 for `/user/status`?
- Did p50 / p95 improve before and after parallelizing serial queries?
- Is slowness only on cold requests?
- Are requests arriving outside Tokyo also slow?

These are easier to spot by grouping requests on the same dimensions and computing percentiles before opening traces one by one.

# Why measurement lives in a shared library

I considered putting measurement code directly in each project. If column order, route folding, or cold detection differ slightly, the same SQL cannot compare projects. Error handling on write and sampling must also match everywhere.

So I implemented `perfLog` as Hono middleware that leaves one small data point per request and added it to `@rdlabo/workers-hono-kit`. Each project adds one middleware line and emits performance logs in the same schema.

The Analytics Engine binding type is a small interface with only the `writeDataPoint()` I need, defined inside the kit. That avoids forcing `@cloudflare/workers-types` on consumers. Cloudflare's real binding assigns directly to that interface.

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

## One request data layout

Analytics Engine columns and Workers Logs JSON are fixed as follows.

| Analytics Engine | Meaning | Workers Logs |
|---|---|---|
| `double1` | `t_app`, elapsed ms inside Hono app | `perf.t_app` |
| `double2` | 1 if cold, 0 if warm | `perf.cold` |
| `double3` | HTTP status | `perf.status` |
| `blob1` / `index1` | Hono matched route pattern | `perf.path` |
| `blob2` | `request.cf.colo` | `perf.colo` |
| `blob3` | HTTP method | `perf.method` |

Generic Analytics Engine columns are hard to read as numbers alone, so the middleware pins this schema. Using the same SQL across Hono projects was one reason to put it in the shared kit.

## Use route pattern, not raw URL

Storing `/users/123` as-is creates a separate series per user ID. I use the route pattern Hono matched.

```text
/users/123      → /users/:userId
/users/456      → /users/:userId
/wp-login.php   → (unmatched)
```

Folding IDs limits cardinality and groups bots and 404 access as `(unmatched)`.

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

Do not naively compare cold `t_app` across projects whose middleware order differs. It is an indicator for slow endpoints and before/after within each project first.

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

## Bare call reads Hono env

When you pass env into Hono with `app.fetch(request, env, ctx)`, bare `perfLog()` reads:

- `PERF`: Analytics Engine dataset binding
- `PERF_LOG === '1'`: output to Workers Logs

```ts
app.use('*', perfLog());
```

If you do not pass bindings into Hono env, specify explicitly:

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

`wrangler tail` is handy right after wiring or on high-traffic Workers. On low-traffic projects, the request I need may not arrive while tail is open—that blocked me when I built perfLog. Instead of always watching live, I retain data in Workers Logs or Analytics Engine and look later.

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

What matters here is `_sample_interval`. Analytics Engine may apply adaptive sampling, so use `sum(_sample_interval)` and `quantileExactWeighted()` instead of `count()` or ordinary `quantile()`. The `n` in results reflects that weight.

https://developers.cloudflare.com/analytics/analytics-engine/sampling/

`OPTIONS` is mostly 0 ms CORS preflight; `(unmatched)` is mostly bots and 404s. Including them as-is dilutes overall p50, so I exclude them for endpoint latency investigation.

4xx and 5xx can follow different paths than success, so I separate steady endpoint latency from them. That is not hiding errors—I check `double3 >= 400` in separate status aggregations.

Routes with high volume and high p50 or p95 are first fix candidates. With this cut, I found a status endpoint that took ~2 seconds even when warm because it awaited several queries serially.

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

If only cold is slow, suspect secrets fetch, DB connection, cache warmup, etc. If warm is also slow, look at query count, indexes, external APIs per request.

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

Compare across deploy day for parallelizing serial queries, adding indexes, moving notifications to a Queue, etc. I keep p50 and p95 because averages get pulled by a few slow requests.

## Dig into a ~2 second status endpoint

Tracing from path aggregation to code, the status endpoint awaited read queries that did not depend on each other.

```ts
const profile = await repository.getProfile(userId);
const tags = await repository.getTags(userId);
const unread = await repository.getUnread(userId);
```

After confirming the next query did not use the previous result and order did not affect authorization or side effects, I started them in parallel.

```ts
const [profile, tags, unread] = await Promise.all([
  repository.getProfile(userId),
  repository.getTags(userId),
  repository.getUnread(userId),
]);
```

Do not mechanically parallelize every sequential `await`. On the same DB connection they may still serialize on the wire; writes, cache invalidation, and post-authorization side effects need order. Sometimes one merged query is better.

Then I return to perfLog and compare p50 and p95 before and after deploy on the same route, warm, success-only conditions. The same data finds slow endpoints and confirms improvement—you do not stop at "it feels faster."

## colo is not where the Worker runs

`perf.colo` is `request.cf.colo`—the edge where the request arrived. With Smart Placement moving the Worker near the DB, this value is not the Worker's execution location.

With Placement enabled, Cloudflare adds a `cf-placement` header. For example, `remote-LHR` means the request was forwarded and the Worker ran near London. The docs note this header may be removed while in beta. To track execution location over time, Tracing's `cloudflare.colo` also works.

https://developers.cloudflare.com/workers/configuration/placement/

After Smart Placement, `t_app` for requests landing at distant edges may drop to levels similar to requests from DB-near colos. Conversely, a single cold request right after deploy or from a low-frequency region may be slow alone. Do not conclude "Smart Placement is not working" from one distant colo sample—confirm execution location with `cf-placement` or Tracing, filter to warm, and check you have enough samples.

On services with few users, fixing one endpoint that takes 2 seconds often beats colo comparison. I use colo comparison as triage after finding slow endpoints.

# Find the place with perfLog, go inside with Tracing

My actual investigation order:

1. Compute warm path p50 / p95 in Analytics Engine
2. Pick endpoints that are slow and heavily used
3. Open Workers Tracing for a matching request and inspect fetch and binding breakdown
4. Wrap DB queries or service steps in custom spans if needed
5. Fix code and deploy
6. Compare before and after with the same Analytics Engine SQL

Use Tracing custom spans when you want names on app-specific steps.

https://developers.cloudflare.com/workers/observability/traces/custom-spans/

perfLog alone cannot tell "which query took how many of 842 ms." Following weeks of trends for all routes with Tracing alone would need separate ops for fixed dimensions and retention.

I split broad search and deep dig instead of substituting one for the other.

# Know perfLog limits too

It is small middleware, so what it cannot measure is clear:

- `t_app` is not CPU time
- Work before the Hono app is not included
- Completion time of work passed to `waitUntil()` is not included
- cold/warm is approximate via isolate flag
- No per-query breakdown inside a route
- Not end-to-end latency including client-to-edge network

For CPU, use Tracing or Workers Metrics; for inside a request, Tracing; for client feel, frontend measurement.

I also did not casually add dimensions beyond route pattern, colo, method, and status. I do not put user ID, email, or request body in performance logs—to avoid PII and cardinality growth.

# Think sampling and cost separately

`perfLog({ sampleRate })` throttles only Analytics Engine writes. Workers Logs use `observability.head_sampling_rate`; Tracing uses `observability.traces.head_sampling_rate` separately.

On low traffic, dropping samples makes analysis harder, so I keep Analytics Engine `sampleRate` at 1. When traffic grows, I lower per-sink volume after checking cost.

As of August 11, 2026, Workers Tracing is free during beta; Cloudflare announced billing from October 1, 2026. Traces count observability events per span.

Analytics Engine pricing is published for the future but is not billed yet at this writing. Pricing and start dates can change—recheck official info when you read this.

https://developers.cloudflare.com/analytics/analytics-engine/pricing/

# Summary

Performance work does not start by staring at slow requests. You first need to know which endpoints are slow, by how much, and how often.

For that I added a performance logging layer to the shared library that keeps route, colo, cold/warm, status, and `t_app` in one schema. Each Hono project wires `perfLog()` in one line. From retained data you find slow endpoints and compare before and after with percentiles.

After finding a slow endpoint, Workers Tracing dives into fetch, bindings, and application steps for one request. After fixing causes such as serial queries, check effect again with perfLog p50 and p95.

Measure, narrow, investigate, compare with the same numbers after the fix. Library packaging was to roll that flow out the same way across projects.

See you next time.
