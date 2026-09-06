---
title: HTTP・認証
---

Hono Workers API向けのValidation、Firebase認証、NestJS形式の共通エラーレスポンス、レスポンス最終処理です。

## Validation

`validate(target, schema, options?)` はZod schemaをHonoへ接続し、NestJS `ValidationPipe`互換形状の `400` を返します。任意のreporterを一度だけ束縛するには `createValidate({ sentry })` を使います。

```ts
import { createValidate, zNumOptional } from '@rdlabo/workers-hono-kit';
import { z } from 'zod';

const validate = createValidate({ sentry });
const querySchema = z.object({ page: zNumOptional() });

app.get('/items', validate('query', querySchema), async (c) => {
  const query = c.req.valid('query');
  return c.json(await listItems(query.page));
});
```

## 認証

`createAuthMiddleware()` はtoken headerを読み、Firebase ID tokenを検証し、必要ならアプリのuser IDを解決してHono contextへ保存します。Remote JWKSをcacheして検証するには `createRemoteFirebaseVerifier(projectId)`、Identity Toolkitの `getUser`・`deleteUser` が必要なら `createServiceAccountVerifier()` を使います。

共通identity、再認証、機能credentialの失敗はstable auth-failure body helperで区別します。

## Error・routing契約

- `createAppErrorHandler()` はquery failure、mysql2分類、任意reportingを構成します。
- `createHttpErrorHandler()` は `HTTPException` を共通JSON error bodyへ変換します。
- `notFoundHandler()` は `Cannot METHOD path` を含む404を返します。
- `normalizeTrailingSlash()` はredirectせず末尾slashを除き、request bodyを維持します。
- `finalizeResponse()` はweak ETagを追加し、`If-None-Match`一致時に304を返します。

`createMaintenanceMiddleware()` はCORSの後、container・DB middlewareの前にmountし、maintenance応答で高コストな基盤を初期化しないようにします。

## Background処理・可観測性

`createWaitUntilDefer(ctx)` はbackground workを `waitUntil` へ登録し、rejectを記録します。`perfLog()` はapplication latency、colo、cold/warm、route、statusをWorkers Logsと任意のAnalytics Engineへ出力します。

## 次のステップ

MySQL・Hyperdriveは[データ層](/docs/data-layer)、export一覧は[API](/docs/api)を参照してください。
