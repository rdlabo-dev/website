---
title: データ層
---

DBの基盤は `@rdlabo/workers-mysql`、Honoコンテナー連携はkitの `/mysql` を使います。固定 `+09:00` の保存処理とIANA表示タイムゾーンは独立しています。`mysql2` は独立パッケージの直接依存で、`/drizzle` または `/testing` 利用時に `drizzle-orm` を追加します。

Workersでmysql2のNode.jsネットワークAPIを使うため、次を設定します。

```toml
# wrangler.toml
compatibility_flags = ["nodejs_compat"]
```

```sh
npm install @rdlabo/workers-mysql drizzle-orm
npm install -D @types/node@20
```

開発用tarballの導入は[Development](https://github.com/rdlabo-dev/workers-hono-kit/blob/v0.12.2/packages/hono-kit/docs/development.md)を参照してください。

## 0.12.0への移行

パッケージ境界に破壊的変更があります。更新前にimportを変更してください。

| 旧import | 移行先 |
| --- | --- |
| kitルートの `createContainerRuntime` | `@rdlabo/workers-hono-kit/mysql` |
| kitルートの `retryWhenDeadlock` | `@rdlabo/workers-mysql` |
| kit `/db` のDB helper | `@rdlabo/workers-mysql`、`/drizzle`、`/migrations` |
| kit `/testing` のDB helper | `@rdlabo/workers-mysql/testing` |

旧 `/db` とDB関連 `/testing` は `@deprecated` 付きの互換exportとして維持され、削除予定はありません。kitの `/mysql` は非推奨ではありません。`/testing` はDB helperを静的に再公開するため、FirebaseやKVのfakeだけを使う場合もMySQLパッケージと `drizzle-orm` が必要です。

## Hyperdriveデータベース

`createHyperdriveDatabase()` はprimary・replica接続を遅延作成します。`read()` はreplica、`query()` は書き込み直後の整合性が必要なprimaryの生SELECT、書き込みとtransactionはprimary Drizzleを使います。

`readTransaction()` はDrizzleと生SQLの読み取りを1つのprimary repeatable-read snapshotで実行します。専用のキャッシュ接続上で直列化し、通常のprimary処理や他のtransactionと境界が混ざらないようにします。mysql2の致命的接続エラー時は単独readまたは読み取りtransaction全体を新しい接続で最大1回再試行します。書き込みはcommit状態が曖昧なため再試行しません。呼び出し終了時の接続解放はWorkersが行います。

```ts
import { createHyperdriveDatabase } from '@rdlabo/workers-mysql';
import { DRIZZLE_ORM_OPTIONS } from '@rdlabo/workers-mysql/drizzle';
import { drizzle } from 'drizzle-orm/mysql2';

const db = createHyperdriveDatabase({
  primaryHyperdrive: env.DB_PRIMARY,
  replicaHyperdrive: env.DB_REPLICA,
  createOrm: (primary) => drizzle(primary, { schema, ...DRIZZLE_ORM_OPTIONS }),
});

const rows = await db.read<Item>('SELECT * FROM items WHERE id = ?', [id]);
const freshRows = await db.query<Item[]>('SELECT * FROM items WHERE id = ?', [id]);
await db.write((dz) => dz.insert(items).values(input));
await db.transaction((tx) => tx.insert(items).values(input));

const snapshot = await db.readTransaction(async ({ orm, query }) => ({
  items: await orm.select().from(items),
  count: await query<{ count: number }[]>('SELECT COUNT(*) count FROM items'),
}));
```

MySQLは各transaction試行で `READ ONLY` を強制します。Drizzleには読み取り専用transaction型がないため、コンパイル時にも制限したい場合は `orm` をSELECT専用のfacadeで包みます。

callback内から `readTransaction()` を再帰呼び出ししないでください。同じ直列処理経路で外側の終了を待つため停止します。ネストするsnapshot helperは外側のreaderを再利用します。

低レベル接続には `hyperdriveConnectionOptions()` を使います。JavaScriptの日付変換の既定値は `+09:00` で、MySQL session timezoneは変更しません。Honoの標準リクエストコンテナーは次から読み込みます。

```ts
import { createContainerRuntime } from '@rdlabo/workers-hono-kit/mysql';
```

## 書き込みと再試行

- `retryWhenDeadlock()` は `ER_LOCK_DEADLOCK` を試行間に `delay × attempt` 待って再試行します。
- `insertIdOf()`、`affectedRowsOf()`、`insertedIdsOf()` は書き込み結果を正規化します。
- `withMysqlConnections()` はスコープ付き処理のprimary・replica接続を並列で開きます。

## DrizzleとJST

日付カラムは `jstTimestamp`、`jstDatetime`、`jstDate` を使います。custom timestamp型には `.onUpdateNow()` がないため `jstOnUpdateNow()` を組み合わせます。小数にはDrizzleの `decimal(name, { precision, scale, mode: 'number' })` を直接使います。

業務時刻の変換はDBの固定 `+09:00` 通信契約と別です。非推奨のkit `/business-time` から独立パッケージへ移行します。

```sh
npm install @rdlabo/workers-timezone
```

```ts
import { addBusinessDays, toBusinessDateTime } from '@rdlabo/workers-timezone';

toBusinessDateTime(new Date('2026-07-05T21:00:00Z'));
// '2026-07-06 06:00:00'

addBusinessDays('2026-07-06', 3);
// '2026-07-09'
```

## 次のステップ

[Realtime・Offline](/docs/realtime-offline)または[Workers MySQL](/workers-mysql/docs/readme)を参照してください。
