---
title: Hono APIをローカルで試す
---

Hono APIへ共通のHTTP動作を追加します。health応答のweak ETagと、存在しないルートのJSON応答を、ポート起動やCloudflareアカウントなしで確認できます。

## 1. 小さなプロジェクトを作る

この演習はNode.js 24とnpmを使います。コマンドは対象のkitリリースを固定しています。npmは必須peerも導入します。peerを自動導入しない設定では[インストール要件](/docs/getting-started)を確認してください。

```sh
mkdir hono-kit-demo
cd hono-kit-demo
npm init -y
npm pkg set type=module
npm install @rdlabo/workers-hono-kit@0.12.2 hono@4
npm install --save-dev tsx@4
```

## 2. 2つのリクエストを送る

`demo.ts` として保存します。`app.request()` は同じプロセス内でHonoアプリを呼び出します。

```ts
import { Hono } from 'hono';
import { createAppErrorHandler, finalizeResponse, notFoundHandler } from '@rdlabo/workers-hono-kit';

const app = new Hono();
app.use('*', finalizeResponse());
app.onError(createAppErrorHandler());
app.notFound(notFoundHandler);
app.get('/health', (c) => c.json({ ok: true }));

const healthy = await app.request('/health');
console.log(healthy.status, await healthy.text());
console.log('weak etag:', healthy.headers.get('etag')?.startsWith('W/'));

const missing = await app.request('/missing');
console.log(missing.status, await missing.text());
```

```sh
npx tsx demo.ts
```

期待する出力です。JSONのプロパティ順序は問いません。

```text
200 {"ok":true}
weak etag: true
404 {"message":"Cannot GET /missing","error":"Not Found","statusCode":404}
```

kitが追加するHTTP動作を確認できました。この演習ではWorkers bindingの作成、ユーザー認証、デプロイ済みサービスの検証は行っていません。

## 3. 実アプリへ組み込む

middlewareとルート登録を残し、動作確認用のリクエストを取り除いて `app` をWorker handlerとしてexportします。次は[HTTP・認証](/docs/http-auth)へ進みます。DBが必要になったら[MySQLアダプター](/docs/data-layer)を追加してください。

既存kitから更新する場合は[0.12のimport移行](/docs/data-layer)を確認します。旧 `/db`・`/business-time` は互換exportで、新しい連携には独立パッケージを使います。

## 次のステップ

| 必要なもの | 最初に使うもの |
| --- | --- |
| HonoのHTTP・認証・Queueの共通処理 | `@rdlabo/workers-hono-kit` |
| Honoの有無に依存しないMySQLアクセス | [Workers MySQL](/workers-mysql/docs/quickstart) |
| 日時変換と新しいコードの検査 | [Workers Timezone＋ESLint](/workers-timezone/docs/quickstart) |
| 開発時のコード規約チェック | [ESLint Plugin Rules](/eslint-plugin-rules/docs/quickstart) |

kitは再利用する基盤処理を提供します。ルート、業務ルール、認証情報、DBスキーマはアプリが所有します。まず必要なhelperを1つ導入でき、すべてのエントリポイントを採用する必要はありません。
