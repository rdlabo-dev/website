---
title: はじめに
---

Cloudflare Workers向けのMySQL、Hyperdrive、Drizzle基盤です。

mysql2がNode.jsのネットワークAPIを使うため、WorkerでNode.js互換モードを有効にします。

```toml
# wrangler.toml
compatibility_flags = ["nodejs_compat"]
```

## インストール

```bash
npm install @rdlabo/workers-mysql
```

`mysql2` は直接依存に含まれます。`/drizzle` または `/testing` を使う場合は `drizzle-orm` を追加します。

```bash
npm install drizzle-orm
```

Drizzleをpeer依存にすることで、アプリとスキーマが同じ型を共有できます。

公開接続型はNode.jsの型定義を使います。Workersにデプロイする場合も `@types/node@>=20.19.43` が必須peerです。pnpmなど厳密なパッケージ配置でもグローバル型が見えるよう、TypeScriptアプリから直接追加してください。

```sh
npm install -D @types/node@20
# pnpm users:
pnpm add -D @types/node@20
```

ツール環境に合う対応メジャーバージョンを使ってください。pnpmではpeerの自動インストールだけではグローバル型がコンパイラから見えない場合があります。

## エントリポイント

| import | 責務 |
| --- | --- |
| `@rdlabo/workers-mysql` | Workers MySQL・Hyperdriveランタイム、再試行、書き込み結果、JST通信ヘルパー |
| `@rdlabo/workers-mysql/drizzle` | Drizzle設定とJSTカラム |
| `@rdlabo/workers-mysql/migrations` | Node.jsのmigration・既存DBベースライン |
| `@rdlabo/workers-mysql/testing` | ローカルMySQL/DrizzleテストDBとfake |

## ランタイム

Workerの呼び出しごとにデータベースを作成します。以下の断片では `env` がアプリのHyperdrive binding、`schema` がアプリ所有のDrizzleスキーマです。

```ts
import { createHyperdriveDatabase } from '@rdlabo/workers-mysql';
import { DRIZZLE_ORM_OPTIONS } from '@rdlabo/workers-mysql/drizzle';
import { drizzle } from 'drizzle-orm/mysql2';

const db = createHyperdriveDatabase({
  primaryHyperdrive: env.PRIMARY,
  replicaHyperdrive: env.REPLICA,
  createOrm: (connection) => drizzle(connection, { schema, ...DRIZZLE_ORM_OPTIONS }),
});
```

`nodejs_compat` を有効にすればルートimportはWorkersで利用でき、DrizzleやNode専用のmigrationコードを読み込みません。

## Hono連携

Hono middlewareは `@rdlabo/workers-hono-kit/mysql` のアダプターに残ります。データベースパッケージ自体はHonoに依存しません。

```ts
import { createContainerRuntime } from '@rdlabo/workers-hono-kit/mysql';
```

このアダプターはkit `0.12.0` から利用できます。両方のパッケージをインストールします。

```sh
npm install @rdlabo/workers-mysql @rdlabo/workers-hono-kit
```

## ドキュメント

- [ランタイム](/docs/runtime)：リクエスト寿命、primary/replica読み取り、再試行の安全性。
- [Drizzleと日付](/docs/drizzle)：スキーマ所有、任意peer、固定JST保存。
- [移行とテスト](/docs/tooling)：Node.jsツールと破壊的テストヘルパー。
- [API](/docs/api)：エントリポイントごとのexport。
- [移行](/docs/migration)：kitの互換import。

ガイドは参照元ソースリビジョンに対応します。インストール済みバージョンについては対応するリリースタグも確認してください。

## workers-hono-kitからの移行

kit `0.12.0` でimportの境界が変わります。旧 `/db` とDB関連の `/testing` exportは一時的に非推奨の互換パスとして残ります。対応表は[移行](/docs/migration)を参照してください。

