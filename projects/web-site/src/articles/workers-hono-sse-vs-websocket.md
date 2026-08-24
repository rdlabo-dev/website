---
title: "SSE Is Simpler — But I Still Chose WebSocket on Cloudflare Workers"
description: "Server-sent events looked easier for one-way invalidate notifications. On Workers with Durable Objects, idle SSE kept the object awake — WebSocket Hibernation was the way out."
zennSlug: workers-hono-sse-vs-websocket
emoji: "🔌"
---

When implementing realtime updates, I want to pick SSE first.

If the server only notifies the client, bidirectional communication is unnecessary and it extends HTTP. On the browser, create an `EventSource`. When I moved my project from NestJS to Hono, I chose SSE along that line.

But after running on Cloudflare Workers for a while, "easier to implement" alone was not enough. I eventually migrated to Durable Objects' WebSocket Hibernation API.

This article is not how to implement WebSocket, but why I changed the decision from SSE to WebSocket.

# Starting from SSE

I started from the usual call: one-way server-to-client notification means SSE.

## Conclusion first

- Returning SSE from an ordinary Worker does not charge Workers Duration for connection time itself
- I chose Durable Objects because I needed to aggregate connections scattered across Worker isolates per user
- The problem was keeping the aggregating Durable Object awake for the entire SSE connection
- WebSocket adds implementation items, but with the Hibernation API the Durable Object can hibernate while connections remain
- For low-frequency invalidate notifications, idle time dominated more than implementation size

So this is not "SSE is expensive, WebSocket is cheap." It is a decision for **when Durable Objects hold connection state and most traffic is idle.**

## Why I chose SSE

I did not need to stream data bodies.
```text
server -> client: status-invalidated
client -> API: GET the latest data
```
Notify only that something changed; the client refetches via the ordinary API. SSE is straightforward for this.

WebSocket adds Upgrade, subprotocol, reconnect, close codes, ping/pong — things HTTP did not make me think about. On a conventional server stack I would still start with SSE.

## Why Durable Objects were necessary

This comes before protocol choice.

Cloudflare Workers run on multiple isolates per request. The isolate holding a client's SSE connection and the isolate receiving a data-update POST are not necessarily the same.

Putting connected clients in module-scope `Set` shares that list only inside the isolate.
```ts
// This Set is visible only within the same isolate
const clients = new Set<WritableStreamDefaultWriter>();
```
Then when another isolate handles POST, I cannot tell which connection to invalidate. If the same user connects from phone and PC, I must deliver the same update to multiple connections.

I needed:

- Aggregate connections per user in one place
- Manage the current connection list
- Publish from ordinary Hono API to all that user's connections
- Align processing order for the same user

Durable Objects route to the same object from name or ID and mediate multiple clients inside one object. So I derive a Durable Object ID from user ID and always send connections and publish to the same object.

https://developers.cloudflare.com/durable-objects/
```text
client A ─┐
          ├─> Durable Object(user:123)
client B ─┘            ↑
                       │ publish
Hono API ──────────────┘
```
Hono update routes save to the DB, then call the target user's Durable Object. The Durable Object delivers invalidate only to terminals connected at that moment. Each terminal refetches data bodies via ordinary Hono API.
```ts
const room = env.REALTIME.getByName(`user:${userId}`);
await room.publish({ type: 'status-invalidated' });
```
Besides Durable Objects, external pub/sub or WebSocket services exist. Conversely, if there is only one connection and no publish from another request, returning SSE directly from an ordinary Worker is enough.

In my project I wanted aggregation and delivery finished inside Cloudflare, so I chose Durable Objects. Then I compared SSE and WebSocket.

# Decision criteria on Workers

Compare not just API ergonomics but which runtime stays awake during idle and what gets billed.

## Look at "who stays awake," not just "connected"

Cloudflare Workers Standard pricing centers on request count and CPU time, not time streaming an HTTP response. So returning SSE from an ordinary Worker is not automatically "expensive because long connection."

https://developers.cloudflare.com/workers/platform/pricing/

Mediating delivery to multiple clients with a Durable Object changes the story. A Durable Object is subject to Duration while a response stream or WebSocket is in progress and hibernation conditions are not met.

https://developers.cloudflare.com/durable-objects/platform/pricing/

In my project, notifications have no messages most of the time. Connections are open but application code does nothing. Keeping the object awake for that idle time did not fit well.

## The escape hatch only WebSocket Hibernation had

With Durable Objects' Hibernation WebSocket API, client connections remain on Cloudflare's network while idle objects are evicted from memory. When a message arrives, the object is recreated from the constructor.

https://developers.cloudflare.com/durable-objects/best-practices/websockets/

That was the decisive gap vs SSE. Not that WebSocket in general is cheaper, but **Durable Objects have a hibernation API dedicated to WebSocket servers** — a platform difference.

Official pricing examples also show a large Duration gap between 100 Durable Objects always running vs Hibernation running only during message processing. Those amounts assume connection count and message frequency; do not map them directly to your service.

## What increased in the migration

It did not become free or simple. The migration added:

- Auth info and client ID via `Sec-WebSocket-Protocol`
- Restoration assuming in-memory state disappears after Hibernation
- ping/pong from runtime
- Exponential backoff and reconnect
- Compatibility during a mixed SSE/WebSocket transition
- Durable Object tests on real workerd

After the first migration I also fixed missed first sync, old client Upgrade, worker bundle including dependencies, object isolation, and more. In another project I verified restoration on reconnect and publish volume.

So if connection count is low, SSE from an ordinary Worker works, or messages flow constantly and hibernation is impossible, moving to WebSocket has less value.

# Order of judgment

I think this order works:

1. Is bidirectional communication really needed
2. Must connections be bundled in a Durable Object
3. How much of connection time is idle
4. Can post-Hibernation state stay small
5. Can you operate client implementation including reconnect

If only the first question matters, SSE wins. Including 2–4, WebSocket Hibernation becomes strong on Workers.

# Summary

The convention "SSE is simpler for one-way server notification" is still correct. I chose WebSocket anyway because of Durable Object lifecycle, not communication direction.

Compare not protocols alone but how the platform handles idle connections. Moving to Workers added one more axis to that judgment.

See you next time.
