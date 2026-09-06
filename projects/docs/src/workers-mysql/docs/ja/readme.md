---
title: はじめに
---

Cloudflare Workers向けのMySQL、Hyperdrive、Drizzle基盤です。呼び出し単位のprimary/replicaアクセス、デッドロック再試行、任意のDrizzle helper、Node.jsのmigration・テストツールを組み合わせ、スキーマと認証情報はアプリが所有します。

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

## 最初のクエリを実行する

[最初のMySQLクエリを実行する](/docs/quickstart)では、使い捨てのローカルDBへ接続し、テーブルを作らず実際のSELECT結果を確認できます。その後、Hyperdriveの完全なWorker例へ進めます。

## エントリポイント

| import | 責務 |
| --- | --- |
| `@rdlabo/workers-mysql` | Workers MySQL・Hyperdriveランタイム、再試行、書き込み結果、JST通信ヘルパー |
| `@rdlabo/workers-mysql/drizzle` | Drizzle設定とJSTカラム |
| `@rdlabo/workers-mysql/migrations` | Node.jsのmigration・既存DBベースライン |
| `@rdlabo/workers-mysql/testing` | ローカルMySQL/DrizzleテストDBとfake |

## クイックスタート

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

固定 `+09:00` の保存ヘルパーはMySQLの通信契約です。[`@rdlabo/workers-timezone`](/workers-timezone/docs/readme) のIANA表示タイムゾーンには追従しません。

## Hono連携

Honoのリクエストコンテナーは `@rdlabo/workers-hono-kit/mysql` のアダプターを使います。

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

kit `0.12.0` でimportの境界が変わります。旧 `/db` とDB関連の `/testing` exportは `@deprecated` 付きの互換パスとして維持され、削除予定はありません。対応表は[移行](/docs/migration)を参照してください。
