---
title: はじめに
---

Cloudflare WorkersのHono API向けに、weak ETag、NestJS形式の検証・エラーレスポンス、Firebase認証、AWS、AI Gateway、Stripe、KV、Queue、Realtime、Offlineの共通部品を提供します。ドメインロジックとDBスキーマは利用側で管理します。

## エントリポイント

| Import | 責務 |
| --- | --- |
| `@rdlabo/workers-hono-kit` | HTTP、認証、Firebase、AWS、AI、Stripe、KV、Queue |
| `@rdlabo/workers-hono-kit/mysql` | `@rdlabo/workers-mysql` 向けHonoコンテナーアダプター |
| `@rdlabo/workers-hono-kit/offline` | Offline Replicaのwire・cursor・journal・互換性契約 |
| `@rdlabo/workers-hono-kit/realtime` | Durable Object WebSocket・retry |
| `@rdlabo/workers-hono-kit/testing` | 認証helper、fake、Stripe fixture、互換DBテストexport |
| `@rdlabo/workers-hono-kit/db` | workers-mysqlへの非推奨の互換パス |
| `@rdlabo/workers-hono-kit/business-time` | workers-timezoneへの非推奨の互換パス |

ルートはMySQL、Drizzle、Node専用migrationを読み込みません。MySQL利用側は独立パッケージを導入し、Hono固有の接続は `/mysql` に置きます。

## インストール

```sh
npm install @rdlabo/workers-hono-kit
```

型宣言付きESMです。toolingにはNode.js 20以降が必要で、Stripeは直接依存として含まれます。npmは必須peerをインストールします。peerを自動導入しない設定では、次を追加してください。

```sh
npm install hono zod @hono/zod-validator jose aws4fetch ai-gateway-provider
```

任意の機能は別途導入します。AI SDKのモデルwrapperには `ai`、MySQL・Hyperdriveには `@rdlabo/workers-mysql` と必要に応じて `drizzle-orm`、IANAタイムゾーンには `@rdlabo/workers-timezone` を使います。

0.12.0以降の `/testing` はDB互換exportを静的に再公開します。FirebaseやKVのfakeだけを使う場合も `@rdlabo/workers-mysql` と `drizzle-orm` が必要です。

0.12.0ではルートのMySQL exportが独立パッケージと `/mysql` へ移りました。更新前に[データ層の移行ガイド](/docs/data-layer)を確認してください。

## クイックスタート

weak ETag、共通エラー形式、404 JSONを持つ最小のHonoアプリです。

```ts
import { Hono } from 'hono';
import { createAppErrorHandler, finalizeResponse, notFoundHandler } from '@rdlabo/workers-hono-kit';

const app = new Hono();

app.use('*', finalizeResponse());
app.onError(createAppErrorHandler());
app.notFound(notFoundHandler);

app.get('/health', (c) => c.json({ ok: true }));

export default app;
```

## 互換importの非推奨化

`/db`、`/business-time`、DB関連の `/testing` exportには独立パッケージを案内する `@deprecated` が付きます。互換aliasは実行時の同一性とシグネチャを維持し、削除予定はありません。

kitが所有する `reopenGuardedPaymentFailedSet`、`/mysql` の `createContainerRuntime`、Firebase・認証・KV・Stripeのテストhelperは、この移行では非推奨になりません。

## ドキュメント

- [HTTP・認証](/docs/http-auth)
- [データ層・MySQL移行](/docs/data-layer)
- [Realtime・Offline](/docs/realtime-offline)
- [テスト・運用](/docs/testing-operations)
- [API](/docs/api)
