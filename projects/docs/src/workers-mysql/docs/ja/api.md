---
title: API
---

公開exportをimportパスごとに示します。完全なジェネリック型のシグネチャはインストール済みのTypeScript宣言を参照してください。寿命と再試行の動作は[ランタイム](/docs/runtime)から確認できます。

## `@rdlabo/workers-mysql`

#### `function` createHyperdriveDatabase

`{ primaryHyperdrive, replicaHyperdrive, createOrm, connectionOptions? }` を受け取り `HyperdriveDatabase<TDrizzle>` を返します。`read<Row>` はreplica、`query<Rows>` と `readTransaction` はprimaryを使います。`write` と `transaction` はアプリのORMコールバックをawaitします。`dispose` は何もしません。

#### `function` createMysqlDatabase

`{ orm, replica }` を受け取り `Database<TDrizzle>` を返します。既存ハンドルは呼び出し元が所有します。`databaseFrom(orm, replica)` は位置引数版です。

#### `function` hyperdriveConnectionOptions

`hyperdriveConnectionOptions(hyperdrive, extra?)` は構造的な `HyperdriveLike` bindingからmysql2設定を作ります。既定値は[Drizzleと日付](/docs/drizzle)を参照してください。

#### `function` withMysqlConnections

`withMysqlConnections({ primary, replica }, ctx, fn, connectionOptions?)` は両接続を開き、`fn({ primary, replica })` をawaitします。`ctx` は互換性用で、明示的な解放には使いません。

#### `function` retryWhenDeadlock

`retryWhenDeadlock(fn, retries = 3, delay = 100)` はラップされたcauseを含む `ER_LOCK_DEADLOCK` を再試行します。`retries` は最大試行回数、待機時間は `delay` ミリ秒ずつ線形に増加します。他の例外は再throwします。コールバック全体が再実行され得ます。

#### 書き込み結果と日付

`insertIdOf`、`affectedRowsOf`、`insertedIdsOf` はmysql2/Drizzleの書き込み結果を抽出します。`MYSQL_TIMEZONE`、`toJstDate`、`jstTimestampParams`、`jstDatetimeParams`、`jstDateParams` は独立した固定JST通信契約を実装します。

公開型：`Database`、`DisposableDatabase`、`HyperdriveDatabase`、`ReadTransaction`、`QueryRunner`、`TxOf`、`CreateMysqlDatabaseOptions`、`CreateHyperdriveDatabaseOptions`、`Connection`、`Pool`、`HyperdriveLike`、`ExecutionContextLike`、`DzWriteResult`。

## `@rdlabo/workers-mysql/drizzle`

任意のDrizzle peerが必要です。`jstTimestamp`、`jstDatetime`、`jstDate`、`jstOnUpdateNow`、`DRIZZLE_ORM_OPTIONS`、`workersDrizzleConfig`、`resolveDbSecret` をexportします。型は `WorkersDrizzleConfigOptions` と `ResolvedDbSecret` です。`honoDrizzleConfig` と `HonoDrizzleConfigOptions` は非推奨の互換名です。設定・secret解決はNode.jsツール用、カラムヘルパーはWorkerスキーマ用です。

## `@rdlabo/workers-mysql/migrations`

Node.js専用の `baselineMigrations`、`readBaselineEntry`、`resolveDbSecret` と、型 `BaselineMigrationsOptions`、`BaselineResult`、`BaselineEntry`、`ResolvedDbSecret` をexportします。[移行とテスト](/docs/tooling)の安全条件を確認してください。

## `@rdlabo/workers-mysql/testing`

Node.jsテスト用の `createTestDb`、`createPoolDatabase`、`createNoopDatabase` を提供します。型は `TestDb`、`CreateTestDbOptions`、`TestDbConnection`、`CreatePoolDatabaseOptions`、`Database`、`DisposableDatabase`、`QueryRunner`、`TxOf` です。

## `@rdlabo/workers-mysql/baseline-cli`

`runBaselineCli(): Promise<void>` は引数と環境変数を使ってbaselineを実行します。シェルでは同梱の `workers-mysql-db-baseline` を使ってください。

