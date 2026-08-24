---
title: "Keeping WebSockets Without Keeping Cloudflare Workers Awake — Durable Objects Hibernation"
description: "WebSocket plus Durable Objects worked, but idle connections kept the object awake. Hibernation keeps connections while sleeping the DO — with auth, client resync, workerd tests, and ops checks."
zennSlug: workers-hono-websocket-hibernation
emoji: "🧊"
---

I implemented WebSocket on Cloudflare Workers; connections and notifications worked. I thought I was done.

But in my use case, most connection time is idle. I only want to say "refetch" when something updates, yet keeping the Durable Object awake for that felt wasteful.

So I migrated to Durable Objects' Hibernation WebSocket API. But swapping `accept()` for `acceptWebSocket()` alone is not enough. On hibernation, class fields disappear and `constructor` runs again. Updates right after connect or during reconnect are easy to miss.

This article connects Hono auth routes, the Durable Object, client resync, workerd tests, and production checks in one flow.

# Design for Hibernation first

With Hibernation, WebSocket connections remain but Durable Object memory does not. That difference drives the architecture.

## What I am building

I do not sync data bodies over WebSocket — only notify that something changed.
```text
1. Clients A and B connect to the Durable Object for the same user
2. The Hono API updates the database
3. The Hono API publishes an invalidation to the Durable Object
4. The Durable Object broadcasts it to connected clients
5. Each client refetches the latest data from the ordinary Hono API
```
```text
client A ─┐
          ├─ WebSocket ─> Durable Object(user:123)
client B ─┘                         ↑
                                   │ publish
Hono API ── DB update ─────────────┘
```
One Durable Object per user ID. Same user on phone and PC still reaches the same object.

Two reasons to use Hibernation in this setup:

- Aggregate WebSocket connections scattered across isolates per user
- During idle notification time, hibernate the Durable Object without dropping connections

Why Durable Objects at all is covered in detail here:

https://zenn.dev/rdlabo/articles/workers-hono-sse-vs-websocket

## What survives Hibernation, what does not

Hibernation is not WebSocket disconnect. Connections stay on Cloudflare's network; the Durable Object JavaScript runtime is evicted from memory.

When a message or request arrives, the object is recreated, `constructor` runs, then the handler is called. While hibernating, Billable Duration is not charged.

https://developers.cloudflare.com/durable-objects/best-practices/websockets/

What survives and what does not:

| Target | After Hibernation |
|---|---|
| WebSocket connection to client | Remains |
| Socket-specific info from `serializeAttachment()` | Remains |
| Durable Object Storage data | Remains |
| class fields, `Map`, arrays | Gone |
| State assuming running timers | Unusable |

You cannot treat a `Map` like this as source of truth on a normal WebSocket server:
```ts
private sockets = new Map<string, WebSocket>();
```
After Hibernation, class fields reset to initial values while sockets stay connected. Always get the current connection list from `this.ctx.getWebSockets()`.

# Implementing Hibernation WebSocket

From Wrangler registration through Hono auth, Durable Object connection, publish, and heartbeat — in order.

## 1. Register the Durable Object

Add binding and migration in Wrangler first. Even a room without Storage needs migration when adding a Durable Object class.
```toml
[[durable_objects.bindings]]
name = "REALTIME"
class_name = "RealtimeRoom"

[[migrations]]
tag = "realtime-v1"
new_sqlite_classes = ["RealtimeRoom"]
```
Named-export the class from the Worker entrypoint:
```ts
export { RealtimeRoom } from './realtime/room';
export default app;
```
When replacing an existing Durable Object, do not casually rewrite class names or migration history. New add, rename, and delete mean different things for migrations.

https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/

## 2. Authenticate in Hono, then hand off Upgrade

Do not let clients connect directly to the Durable Object. Authenticate on a Hono route, then delegate to the user's object.
```ts
const app = new Hono<{ Bindings: Env }>();

app.get('/realtime/socket', async (c) => {
  if (c.req.header('upgrade')?.toLowerCase() !== 'websocket') {
    return c.text('Expected Upgrade: websocket', 426);
  }

  const offer = parseProtocol(c.req.header('sec-websocket-protocol'));
  if (!offer?.token) {
    return c.text('Forbidden resource', 403);
  }

  let userId: number;
  try {
    const decoded = await verifyIdToken(offer.token);
    userId = await findUserId(decoded.uid);
  } catch {
    return c.text('Forbidden resource', 403);
  }

  const id = c.env.REALTIME.idFromName(`user:${userId}`);
  const stub = c.env.REALTIME.get(id);

  // Do not forward the authentication token to the Durable Object
  return stub.fetch('https://do/connect', {
    headers: {
      Upgrade: 'websocket',
      'Sec-WebSocket-Protocol': 'realtime-v1',
      ...(offer.clientId ? { 'x-client-id': offer.clientId } : {}),
    },
  });
});
```
The browser `WebSocket` constructor cannot attach arbitrary headers. Without Cookie auth, I receive the auth token and client ID via `Sec-WebSocket-Protocol`:
```ts
new WebSocket(url, [
  'realtime-v1',
  `auth.${idToken}`,
  `client.${clientId}`,
]);
```
After Hono auth, remove the token from the request to the Durable Object and return only the application protocol in the 101 response. Also: do not put the token in query parameters, do not log request headers, validate subprotocol charset and length.

If session Cookie works for your web app, you do not need to load the token into subprotocol.

## 3. Write a Hibernation-ready Durable Object

Below is the full room. For clarity I use Workers API directly, not library helpers.
```ts
import { DurableObject } from 'cloudflare:workers';

interface SocketAttachment {
  clientId?: string;
  connectedAt: string;
}

export class RealtimeRoom extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    // Let the runtime answer pings without waking JavaScript
    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair('ping', 'pong'),
    );
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/connect') {
      return this.connect(request);
    }
    if (url.pathname === '/publish' && request.method === 'POST') {
      return this.publish(request);
    }
    return new Response('Not Found', { status: 404 });
  }

  private connect(request: Request): Response {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    const attachment: SocketAttachment = {
      clientId: request.headers.get('x-client-id') ?? undefined,
      connectedAt: new Date().toISOString(),
    };
    server.serializeAttachment(attachment);

    // Register with the Hibernation API instead of server.accept()
    this.ctx.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
      headers: { 'Sec-WebSocket-Protocol': 'realtime-v1' },
    } as ResponseInit & { webSocket: WebSocket });
  }

  private async publish(request: Request): Promise<Response> {
    const payload = await request.json();
    const message = JSON.stringify(payload);

    // Recover connected sockets from the runtime after hibernation
    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.send(message);
      } catch {
        socket.close(1011, 'publish failed');
      }
    }
    return new Response(null, { status: 204 });
  }

  webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): void {
    // Auto-response handles pings, so they normally do not reach this handler
    const attachment = socket.deserializeAttachment() as SocketAttachment;
    console.warn('[Realtime] ignored message', attachment.clientId, message);
  }

  webSocketClose(socket: WebSocket, code: number, reason: string): void {
    // For older compatibility dates, normalize invalid codes to 1000
    const replyCode = [1005, 1006, 1015].includes(code) ? 1000 : code;
    socket.close(replyCode, reason);
  }

  webSocketError(socket: WebSocket): void {
    socket.close(1011, 'websocket error');
  }
}
```
Hibernation requires `this.ctx.acceptWebSocket(server)`, `getWebSockets()`, and WebSocket handler methods together. Web Standard API with ordinary `server.accept()` and `addEventListener('message', ...)` cannot hibernate a connected object the same way.

With `compatibility_date` on or after `2026-04-07`, the runtime auto-responds to close frames, so `socket.close()` inside `webSocketClose()` is unnecessary. The normalization above remains for older compatibility dates.

Attachment travels with the socket and survives Hibernation while the connection is healthy. Limit is 16,384 bytes. Large state or state needed after disconnect goes to Durable Object Storage.

https://developers.cloudflare.com/durable-objects/api/state/#websocket-hibernation-api

## 4. Publish from Hono after updates

After a DB update, get the stub with the same naming rule as the target user:
```ts
type RealtimeEvent = {
  topic: 'status' | 'talkList' | 'notification';
  userId: number;
  at: string;
  originId?: string;
};

async function publish(env: Env, event: RealtimeEvent): Promise<void> {
  const id = env.REALTIME.idFromName(`user:${event.userId}`);
  const response = await env.REALTIME.get(id).fetch('https://do/publish', {
    method: 'POST',
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error(`Realtime publish failed: ${response.status}`);
  }
}
```
When sending multiple topics to the same user, batch into one message array. One Durable Object invocation and one WebSocket message beats three publishes for `talk`, `talkList`, and `status` — fewer subrequests and client refetches.

If the sending client already optimistically updated, `originId` can skip self echo. But suppressing self echo for values the client alone cannot confirm causes missed updates; judge per topic.

## 5. Heartbeat that does not break Hibernation

Running ping from the Durable Object with `setInterval()` or alarms wakes the object. Even idle connections then incur Duration, alarm invocations, and Storage writes — erasing Hibernation's benefit.

`setWebSocketAutoResponse()` has the Workers runtime respond directly to specific request messages. It does not wake JavaScript.
```ts
this.ctx.setWebSocketAutoResponse(
  new WebSocketRequestResponsePair('ping', 'pong'),
);
```
The browser WebSocket API cannot send protocol-level ping frames; here `ping` and `pong` are application-level string messages. Cloudflare's runtime also auto-responds to protocol-level ping frames.

On the client I send `ping` every 30 seconds; if no `pong` or normal event for 70 seconds, treat as half-open, disconnect, and reconnect. 30 and 70 are project choices, not spec.

Note: Hibernation applies when the Durable Object is the WebSocket server. Outbound WebSockets opened from a Durable Object cannot hibernate.

# Resync the client

Even with WebSocket connected, offline or pre-connect updates are not automatically recovered.

## Connected is not the same as synced

This is what I fixed most after implementation.

WebSocket is a notification path while connected, not a durable message queue. Invalidates while the client was offline are not auto-replayed after reconnect.

This race also exists:
```text
Fetch initial data over REST
  ↓ An update occurs in this interval
WebSocket connection opens
```
If an update lands between first REST and WebSocket open, connect succeeds with stale data.

So the client always full-syncs on first open and after reconnect:
```ts
socket.addEventListener('open', () => {
  fetchLatestState();
});

socket.addEventListener('message', (event) => {
  const events = JSON.parse(String(event.data));
  invalidateAffectedQueries(events);
});
```
For stricter behavior, carry server revision or ETag and compare with the client's value. Low-frequency polling fallback while the connection is unhealthy also works.

Done is not "101 Switching Protocols returned."

- Updates during disconnect converge via resync
- Updates in the first-connect gap are not lost
- Repeated reconnect does not duplicate sockets
- After logout or user switch, old tokens do not connect

## Do not speed up reconnect until it succeeds

On connect failure, exponential backoff from 1s to about 30s:
```text
1s -> 2s -> 4s -> 8s -> 16s -> 30s
```
Resetting backoff to 1s because TCP/WebSocket opened briefly creates a fast reconnect loop when the server drops right after open. Reset backoff only after receiving `pong` or a normal application event and confirming the connection works.

Token fetch is async. Hold a connection generation; if generation at start and completion differ, discard the result so an old token fetch during logout does not connect.

# Verify Hibernation

Not just local runs — tests that intentionally hibernate the object and production metrics.

## Test on workerd

Unit tests that `new` the class directly cannot confirm runtime keeping sockets while recreating the object. Use `@cloudflare/vitest-pool-workers` and `cloudflare:test`.
```ts
import { env } from 'cloudflare:workers';
import { evictDurableObject } from 'cloudflare:test';

const nextMessage = (socket: WebSocket): Promise<string> =>
  new Promise((resolve) => {
    socket.addEventListener('message', (event) => {
      resolve(String(event.data));
    }, { once: true });
  });

it('publishes to connected sockets after hibernation', async () => {
  const id = env.REALTIME.idFromName('user:10');
  const stub = env.REALTIME.get(id);

  const response = await stub.fetch('https://do/connect', {
    headers: { Upgrade: 'websocket', 'x-client-id': 'client-a' },
  });
  const client = (
    response as Response & { webSocket: WebSocket | null }
  ).webSocket!;
  client.accept();

  await evictDurableObject(stub, { webSockets: 'hibernate' });

  const received = nextMessage(client);
  await stub.fetch('https://do/publish', {
    method: 'POST',
    body: JSON.stringify({ topic: 'status', userId: 10 }),
  });

  expect(JSON.parse(await received)).toMatchObject({ topic: 'status' });
});
```
At minimum, verify:

- Broadcast to two or more connections
- Delivery after `evictDurableObject(..., { webSockets: 'hibernate' })`
- Attachment restores
- Auto-response returns `pong` to `ping`
- No alarm created
- No illegal close codes
- Auth token not forwarded to Durable Object

https://developers.cloudflare.com/durable-objects/examples/testing-with-durable-objects/

## What to watch after deploy

Local tests passing does not prove hibernation in production — check metrics.

https://developers.cloudflare.com/durable-objects/observability/metrics-and-analytics/

For this setup I used:

- alarm invocations at 0
- RealtimeRoom Storage row writes at 0
- Duration during auto-response-only periods not growing proportionally to connection time
- WebSocket errors at 0
- Message count vs foreground connection count within expectation

WebSocket Hibernation reduces Duration but does not make connection requests or received WebSocket messages free in request terms. Received messages count as 1 request per 20 messages. Outbound messages from Durable Object to client and received protocol-level pings are not billed. Replace connection count and receive frequency with your numbers.

https://developers.cloudflare.com/durable-objects/platform/pricing/

# Decide scope

Identify where Hibernation fits; split what to commonize from what stays in the application.

## When Hibernation is a poor fit

Value is small when:

- Ordinary Worker SSE is enough and aggregation is unnecessary
- Messages flow constantly and the object rarely hibernates
- Every offline event must be delivered individually
- You already use a managed realtime service
- You want outbound WebSocket client behavior

Work that must deliver reliably while offline belongs in a Queue or durable event log, not WebSocket. WebSocket is only "tell connected clients quickly."

## What I extracted to workers-hono-kit

After rolling this out to multiple projects, I extracted thin Workers API parts into `@rdlabo/workers-hono-kit`:

- Upgrade header validation and `WebSocketPair` creation
- Serialize attachment and `acceptWebSocket()`
- Broadcast via `getWebSockets()`
- Runtime auto-response setup
- Close code normalization
- Retry only retriable Durable Object errors

Add the package to an existing Workers + Hono project:
```bash
npm install @rdlabo/workers-hono-kit
```
Minimal setup replaces direct Workers API upgrade, broadcast, and auto-response with helpers:
```ts
import {
  acknowledgeHibernationWebSocketClose,
  broadcastHibernationWebSockets,
  configureHibernationAutoResponse,
  upgradeHibernationWebSocket,
} from '@rdlabo/workers-hono-kit';

export class RealtimeRoom extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    configureHibernationAutoResponse({
      state: ctx,
      ping: 'ping',
      pong: 'pong',
    });
  }

  connect(request: Request): Response {
    return upgradeHibernationWebSocket({
      state: this.ctx,
      request,
      protocol: 'realtime-v1',
      attachment: { connectedAt: new Date().toISOString() },
    });
  }

  publish(event: unknown): void {
    broadcastHibernationWebSockets(this.ctx, event);
  }

  webSocketClose(socket: WebSocket, code: number, reason: string): void {
    acknowledgeHibernationWebSocketClose(socket, code, reason);
  }
}
```
Wrangler bindings, migrations, and named export on the entrypoint are still required with the library. Helpers are thin parts for safe Hibernation API use, not wiring for the whole Durable Object.

https://github.com/rdlabo-dev/workers-hono-kit/blob/main/src/realtime/hibernation.ts

Room selection from user ID, topics, auth, and resync strategy stay in the application. Pushing that far into a library would turn product-specific design into shared spec.

# Summary

What mattered with Hibernation WebSocket was not the `acceptWebSocket()` API alone.

Connections remain; memory does not. So refresh the connection list from runtime; put socket-specific info in attachment; delegate heartbeat to runtime; and do not treat WebSocket as delivery source of truth — converge via REST on first connect and after reconnect.

Only after designing that far did I get realtime notifications that stay connected without staying resident.

See you next time.
