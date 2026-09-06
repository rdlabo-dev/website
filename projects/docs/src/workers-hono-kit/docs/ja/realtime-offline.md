---
title: Realtime・Offline
---

Durable Object WebSocket helperと、table非依存のOffline Replica契約です。Product schema、Zod shape、domain policyはアプリ側に残します。

## Durable Object Realtime

Rootと `/realtime` entry pointは同じRealtime基本機能を公開します。

- `configureHibernationAutoResponse()` はJavaScriptを起こさずruntime ping/pongを設定します。
- `upgradeHibernationWebSocket()` はsocket accept前に状態を添付します。
- `broadcastHibernationWebSockets()` は `getWebSockets()` で復元したsocketへbroadcastします。
- `acknowledgeHibernationWebSocketClose()` と `closeHibernationWebSocket()` はclose処理を正規化します。
- `retryDurableObjectOperation()` は `retryable` かつ非 `overloaded` のerrorだけをretryします。attemptごとに新しいstubを作成してください。
- `invokeDurableObjectFetch()` はDO呼び出しの構造化response・error契約を維持します。

WebSocket protocol parserはupgrade前にsubprotocol offerを検証します。

## Offline Replica契約

`@rdlabo/workers-hono-kit/offline` はtable非依存です。Product schema、Zod object、public column allowlist、schema hash、domain policyはアプリ側に残します。

`defineRestDbMethodConverter()` は純粋なREST method ↔ table converterを型付けします。Nullable/default columnを含め、表現する全table・columnが必須です。Create methodがauto increment `id` を所有しない場合はproduct側table schemeから明示的に除外します。

Wire helperは値を正規化します。

- `toReplicaIsoDatetime()` → UTC ISO-8601
- `toReplicaDateOnly()` → `YYYY-MM-DD` または `null`
- `toTinyIntFlag()` / `fromTinyIntFlag()` → boolean/tinyint変換
- `replicaNowIso(clock?)` → 注入可能な現在時刻

Journal helperはcursor coverage、retention、mutation transaction、rebaselineを検査します。Wire compatibility helperはcanonical fingerprintを保ちつつ、明示した旧fingerprintを受理できます。

## 次のステップ

[テスト・運用](/docs/testing-operations)、またはconverter・wireの詳細は[Offline API](/docs/api-offline)を参照してください。
