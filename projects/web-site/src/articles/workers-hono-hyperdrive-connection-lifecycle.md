---
title: "Create a mysql2 Connection on Every Request Even With Hyperdrive—Why Not to Put It in Global Scope on Cloudflare Workers"
description: "Separate the Worker-side Hyperdrive client from Hyperdrive's origin connection pool, and manage mysql2 per invocation without calling connection.end()."
zennSlug: workers-hono-hyperdrive-connection-lifecycle
emoji: "🔄"
---

When I connect from Cloudflare Workers to RDS MySQL, I use Hyperdrive.

At first, calling `mysql2.createConnection()` on every request looked wasteful. On a Node.js server you often put a connection pool in module scope, and Workers isolates are reused too. Reusing the connection seemed faster.

With Hyperdrive, though, I do not put the Worker-side `mysql2 connection` in global scope. I create it inside the handler every time. That does not mean opening a new TCP connection to origin MySQL on every request. Hyperdrive pools origin connections on Cloudflare's side.

This article separates two lifetimes that both look like "connections" and explains how I handle mysql2 within a Hono request.

# Think about two different connections

The confusion came from treating the connection from Worker to Hyperdrive and the connection from Hyperdrive to origin MySQL as the same thing.

## Create the Worker-side connection per request

What `mysql2.createConnection()` builds is the database client from Worker to Hyperdrive. Cloudflare's official [Connection lifecycle](https://developers.cloudflare.com/hyperdrive/concepts/connection-lifecycle/) says to create the database client inside handlers such as `fetch` or `queue`, not in global scope.

Workers do not allow I/O objects to span requests. A client or driver-level pool in global scope goes stale and causes query errors on later requests.

Avoid this pattern:

```ts
// Do not keep a driver connection in global scope
let connection: Connection | undefined;

async function getConnection(env: Env) {
  connection ??= await createConnection(connectionOptions(env.HYPERDRIVE));
  return connection;
}
```

Isolate reuse and safely reusing I/O objects inside that isolate across the next request are different things.

Durable Objects, which can hold state across multiple requests, are a separate case. The official docs treat them as [a distinct consideration](https://developers.cloudflare.com/hyperdrive/concepts/connection-lifecycle/#durable-objects-and-persistent-connections). This article focuses on ordinary stateless Worker handlers.

## Hyperdrive reuses origin connections

Hyperdrive sits between Workers and the origin database and maintains a DB connection pool inside Cloudflare's network. According to the [official documentation](https://developers.cloudflare.com/hyperdrive/concepts/connection-lifecycle/#how-connections-are-managed), that avoids repeating TCP, TLS, and database authentication round trips to origin on every request.

The official [mysql2 connection example](https://developers.cloudflare.com/hyperdrive/examples/connect-to-mysql/mysql-drivers-and-libraries/mysql2/) also creates a new connection on each request.

> Create a new connection on each request. Hyperdrive maintains the underlying database connection pool, so creating a new connection is fast.

So what you create each time is a lightweight client connection at the edge. Hyperdrive handles the slow origin connection setup and reuses pooled connections across invocations.

# Manage connections per request

I create a mysql2 connection within a request and do not reuse it after that request's queries finish.

## Create the connection inside the handler

Right now I align request container creation with connection lifetime.

```ts
async function withMysql<T>(
  env: Env,
  run: (db: { primary: Connection; replica: Connection }) => Promise<T>,
): Promise<T> {
  const [primary, replica] = await Promise.all([
    createConnection(connectionOptions(env.PRIMARY)),
    createConnection(connectionOptions(env.REPLICA)),
  ]);

  return run({ primary, replica });
}
```

I use the same connections until `run()` completes. I use the same boundary per invocation for HTTP requests, Queue consumers, and Workflows. Work registered via `waitUntil()` is part of the same invocation.

## You do not need to call `connection.end()`

The current Cloudflare docs under [Cleaning up client connections](https://developers.cloudflare.com/hyperdrive/concepts/connection-lifecycle/#cleaning-up-client-connections) state:

> You do not need to call ... `connection.end()` (or similar) to clean up database clients.

Client connections from Worker to Hyperdrive are cleaned up automatically when the request or invocation ends. Connections from Hyperdrive to origin MySQL stay open in the pool.

Previously I passed `connection.end()` to `waitUntil()` in middleware cleanup.

```ts
app.use('*', async (c, next) => {
  const db = await createDb(c.env);
  c.set('db', db);

  try {
    await next();
  } finally {
    c.executionCtx.waitUntil(db.dispose());
  }
});
```

That is not only unnecessary—it races with other DB work registered via `waitUntil()`.

Suppose post-response work waits for another async step before writing to the DB.

```ts
async function writeAuditLog(db: Database) {
  const values = await buildAuditLog();
  await db.insert(auditLogs).values(values);
}

c.executionCtx.waitUntil(writeAuditLog(db));
```

`waitUntil()` does not order or coordinate multiple Promises. While `buildAuditLog()` is still running, `db.dispose()` can run first, and the background side queries a closed connection—errors like `Cannot enqueue Query after invoking quit`.

If the background task swallows errors, the API returns 200 OK, nothing shows up in logs, and only the DB update is missing. Even when I treat a task as non-fatal after a successful response, I at least log it or send it to Sentry.

```ts
const task = writeAuditLog(db).catch((error) => {
  console.warn('[background] task failed', error);
});
c.executionCtx.waitUntil(task);
```

Automatic cleanup here does not mean you can fire-and-forget untracked queries. Reads and writes that define response success are `await`ed before the response. Only truly best-effort work goes into `waitUntil()`; if you need retry guarantees, use a Queue.

## mysql2 settings I needed

When creating a connection from a Hyperdrive binding, at minimum you need `disableEval: true`. The Workers runtime cannot use the driver's eval path.

```ts
function connectionOptions(hyperdrive: Hyperdrive) {
  return {
    host: hyperdrive.host,
    user: hyperdrive.user,
    password: hyperdrive.password,
    database: hyperdrive.database,
    port: hyperdrive.port,
    disableEval: true,
  };
}
```

In my projects I also add `timezone: '+09:00'`. That is not required for Hyperdrive. It is the conversion basis when mysql2 reads and writes JavaScript `Date` values—not a `SET time_zone` on the MySQL session. I added it for compatibility with existing data that assumes JST.

The [official Cloudflare mysql2 setup](https://developers.cloudflare.com/hyperdrive/examples/connect-to-mysql/mysql-drivers-and-libraries/mysql2/) requires mysql2 3.13.0 or later. To run the DB driver, set `nodejs_compat` and a matching compatibility date. Do not copy settings from old articles—check the current official example.

## Use the same connection inside a transaction

"Do not reuse connections" does not mean creating a new connection per query. Within one request container I reuse the same connection. A transaction uses that connection from start through commit or rollback.

The boundaries are:

```text
origin connection pool: managed by Hyperdrive
driver connection: managed by the request
transaction: managed by the service/use case
```

# Summary

The pattern of putting `createPool()` in global scope on a Node.js server does not carry over to Workers. Workers do not share I/O objects across requests, and Hyperdrive owns the origin-side pool.

With Hyperdrive, let Hyperdrive reuse connections to origin and create a mysql2 connection per request on the Hono side. I do not call `end()` from the app; Workers runtime cleans up client connections.

What mattered more than the intuition that "creating every time is slow" was understanding that the connection you create each time and the connection being reused are different things.

See you next time.
