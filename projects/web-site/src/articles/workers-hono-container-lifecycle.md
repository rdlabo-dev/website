---
title: "Building a DI Container on Every Request Was Slow in Hono on Cloudflare Workers"
description: "Split Hono app, secrets, and DB connections across isolate and invocation scopes so Workers reuse what is safe to reuse without mixing request state."
zennSlug: workers-hono-container-lifecycle
emoji: "📦"
---

When I migrated from NestJS to Hono, the first thing that tripped me up was dependency injection.

Hono is small and easy to work with, but unlike NestJS it does not ship with a DI container out of the box. So on every request I was loading config, calling Secrets Manager, connecting to the database, and assembling services.

It worked. But on Workers, doing all of that on every request was too heavy.

The slowness was not from assembling the container as a plain object. The problem was that route registration on the Hono app, Secrets Manager I/O, and even primary / replica connections I did not use were all running on every container build.

In the end, I reuse the Hono app and heavy initialization within an isolate, and create only the DB wrapper and handler-invocation-specific container on each request. The actual DB connection opens when it is first needed in that invocation.

# Match lifetimes to Workers

I stopped treating the Hono app, heavy initialization, and DB connection as the same lifetime and decided how far each one can be reused.

## Do not think of the container as a single lifetime

The mistake was framing it as a binary choice: singleton or request scope. In practice, each dependency has a different lifetime.

```text
isolate scope
  Hono app
  validated configuration
  secrets fetched from Secrets Manager

handler invocation scope
  primary / replica connections (created lazily on first use)
  invocation container
  authentication data such as userId (HTTP requests only)
```

The Hono app is route definitions, so there is no need to rebuild it every time. Secrets do not need to be fetched again on every request within the same isolate. On the other hand, I create mysql2 connections per HTTP request, Scheduled handler, and Queue consumer invocation, and leave cleanup at the end to Workers.

## Build the Hono app at module scope

```ts
const app = new Hono<AppBindings>();

app.use('*', containerMiddleware());
app.route('/users', usersRoute);

export default app;
```

Module scope is reused within the same isolate. However, you must not assign a request-specific container here. The same isolate can handle multiple requests in parallel, so state would mix. The app at module scope is treated as immutable after route registration.

https://developers.cloudflare.com/workers/reference/how-workers-works/#compute-per-request

HTTP-request-specific values go on Hono's Context.

```ts
app.use('*', async (c, next) => {
  const container = await createInvocationContainer(c.env, c.executionCtx);
  c.set('container', container);
  await next();
});
```

Hono's Context is created per request, and values from `c.set()` live only within that request. Even when reusing the module-scope app, putting the container on Context keeps it from being shared across requests.

https://hono.dev/docs/api/context#set-get

## Memoize heavy initialization per Promise

For Secrets Manager, I cache not only the result but also the in-flight Promise. That way, when several requests arrive right after a cold start, I do not duplicate the same external call.

```ts
function createIsolateMemo<T, A>(loader: (arg: A) => Promise<T>) {
  let cached: Promise<T> | undefined;

  return (arg: A): Promise<T> => {
    cached ??= loader(arg).catch((error) => {
      cached = undefined;
      throw error;
    });
    return cached;
  };
}
```

If a failed Promise stays cached, that isolate will keep failing forever. So on reject I clear the cache so the next request can retry.

Successful values are kept for as long as the isolate lives. If you need to rotate secrets immediately in production, use a TTL or explicit reset instead of unbounded memoization.

## Create DB connections per invocation

At first this felt backwards. If the isolate is reused, I wanted to reuse connections too.

But Hyperdrive holds a connection pool to the origin DB on Cloudflare's side. Cloudflare's official guidance is not to put the database client in global scope and to create it per handler invocation.

https://developers.cloudflare.com/hyperdrive/concepts/connection-lifecycle/

You still do not need to connect to both primary and replica at the start of every invocation. I create a DB wrapper per invocation and lazily open only the connection that is needed when read or write is first called. Within the same invocation, that connection is reused.

In the current Cloudflare docs, you do not need to call `end()` on client connections created in the handler. Workers cleans them up when the invocation ends, and Hyperdrive keeps the origin-side pool. Calling `end()` manually can race with DB work registered via `waitUntil()`, so I do not call it from the app.

https://developers.cloudflare.com/hyperdrive/concepts/connection-lifecycle/#cleaning-up-client-connections

# Use the same boundary at every entry point

Fixing HTTP requests alone is not enough if Queue and Scheduled handlers use different lifetimes.

## Apply the same boundary to non-HTTP entry points

If container creation lives only in Hono middleware, Cron Triggers and Queue consumers get a separate implementation. In practice, one side often ends up with different timezone or secret-cache behavior.

So I kept middleware as a thin adapter and call shared `withContainer()` from `scheduled` and `queue`. HTTP uses the same `createInvocationContainer()`.

```ts
export default {
  fetch: (request, env, ctx) => app.fetch(request, env, ctx),

  scheduled(_event, env, ctx) {
    ctx.waitUntil(withContainer(env, ctx, (ctn) => ctn.jobs.run()));
  },

  queue(batch, env, ctx) {
    return withContainer(env, ctx, (ctn) => ctn.queue.process(batch));
  },
};
```

## Put test overrides at the entry point

Once I started writing service locators in each route, production code got polluted for test convenience. I added one override on the container middleware so routes always read `c.get('container')`.

```ts
app.use('*', containerMiddleware(fakeContainer));
```

That lets me hit the same routes with unit tests without a DB and with tests that use real MySQL.

# Minimal setup with a shared library

I extracted the isolate memo and Hyperdrive connection pieces above into `@rdlabo/workers-hono-kit`. Add it to an existing Hono + Hyperdrive project.

```bash
npm install @rdlabo/workers-hono-kit
```

```ts
import { createIsolateMemo } from '@rdlabo/workers-hono-kit';
import {
  createHyperdriveDatabase,
  DRIZZLE_ORM_OPTIONS,
} from '@rdlabo/workers-hono-kit/db';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './db';

const resolveConfig = createIsolateMemo(async (env: Env) => {
  return loadConfig(env);
});

async function createInvocationContainer(env: Env, executionCtx: ExecutionContext) {
  const config = await resolveConfig(env);
  const db = createHyperdriveDatabase({
    primaryHyperdrive: env.HYPERDRIVE_PRIMARY,
    replicaHyperdrive: env.HYPERDRIVE_REPLICA,
    createOrm: (primary) =>
      drizzle(primary, { schema, ...DRIZZLE_ORM_OPTIONS }),
  });

  return buildContainer({ config, db, executionCtx });
}

async function withContainer<T>(
  env: Env,
  executionCtx: ExecutionContext,
  run: (container: Container) => Promise<T>,
): Promise<T> {
  const container = await createInvocationContainer(env, executionCtx);
  return run(container);
}
```

In HTTP middleware, if a test override is set I use a fixed container; in production I build an invocation container.

```ts
const containerMiddleware =
  (override?: Container): MiddlewareHandler<AppBindings> =>
  async (c, next) => {
    const container =
      override ?? await createInvocationContainer(c.env, c.executionCtx);
    c.set('container', container);
    await next();
  };

app.use('*', containerMiddleware());
```

Non-HTTP entry points use the same factory.

```ts
scheduled(_event, env, ctx) {
  ctx.waitUntil(
    withContainer(env, ctx, (container) => container.jobs.run()),
  );
}
```

`createHyperdriveDatabase()` handles lazy creation and reuse of primary / replica connections within an invocation. Putting the container on HTTP Context and test overrides stays in application middleware. I leave connection teardown to Workers.

https://github.com/rdlabo-dev/workers-hono-kit/blob/main/src/db/database.ts

# Summary

Adding a DI framework to Hono was not the answer. What I needed was to align dependency lifetimes with Workers execution units.

Hono app and config at isolate scope; DB wrapper and container per invocation; actual DB connections lazily within the invocation; follow-up via `waitUntil()` or Queue. After drawing those boundaries, I reduced cold-start external I/O and connection contention.

I moved the shared parts into isolate memo and DB helpers in `@rdlabo/workers-hono-kit`, but what matters more than the library is how you split lifetimes.

See you next time.
