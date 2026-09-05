---
title: 移行とテスト
---

これらはNode.jsツール用でありWorkerのリクエストバンドル用ではありません。専用エントリポイントを使います。migration、認証情報、fixture、DBの用意は利用アプリが所有します。

## Drizzle設定

`/drizzle` の `workersDrizzleConfig` はsnake_caseのMySQL Drizzle Kit設定を作ります。`database`、`schema`、`out` を明示してください。

この関数は `DB_SECRET` を自動で読み、設定されている場合はその接続情報が明示した `database`、host、port、user、passwordおよび `DB_*` 環境変数より優先されます。migration実行前にsecretの接続先を確認してください。ローカルの `database` 指定だけでは接続先をそのDBに限定できません。

`resolveDbSecret()` は `DB_SECRET` のJSON（`host`、`username`、`password`、`dbname`、任意の `port`）を読みます。未設定なら `undefined`、不正ならフォールバックせず例外になります。secretをコミット・ログ出力しないでください。

## 既存DBのベースライン

`/migrations` の `baselineMigrations({ db, migrationsFolder })` は最初のmigrationを**スキーマSQLを実行せず適用済みとして記録**します。既存スキーマとの一致は検証しません。実行前に比較、バックアップ、認証情報の確認を行ってください。

新規DBには通常のDrizzle migratorを使い、baselineは使いません。空のDBや想定外の履歴を拒否し、baseline markerが存在すれば何もしません。

CLIは `workers-mysql-db-baseline --migrations ./drizzle` です。`DB_SECRET` または `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD`、`DB_NAME` を使います。migration情報を書き込むコマンドでありdry-runではありません。`/baseline-cli` はツール連携用に `runBaselineCli` をexportします。

## ローカルテスト

`/testing` の `createTestDb({ dbName, migrationsFolder, connection })` はfixtureヘルパーを返します。隔離した使い捨てDBと明示的なローカル接続設定を使います。

- `resetSchema()` は**DBを削除・再作成**し、migrationを適用します。
- `truncateAll(pool)` はmigration管理テーブルを除くテーブル内容を削除します。
- `seed(pool, table, row)` はfixtureを挿入します。
- `createTestPool()` はpoolを作ります。終了時に `pool.end()` で閉じてください。
- `mysqlReachable()` は接続可否を調べ、スキーマの正しさは検証しません。

共有・本番データを接続先にしないでください。テスト実行ごとに異なるDB名を使います。`createPoolDatabase({ pool, orm })` は読み書きで1つのpoolを使い、`dispose()` で閉じます。`createNoopDatabase()` は空の読み取り結果を返し、想定外の書き込み・トランザクションで例外になります。実MySQLに対する受け入れテストの代わりではありません。

型は[API](/docs/api)を参照してください。

