---
title: テスト・運用
---

Hono Workersアプリ向けのテストhelper、Queue分割、運用CLI、trust boundaryです。

## Testing entry point

`@rdlabo/workers-hono-kit/testing` はproduction codeから読み込みません。DB helperは `@rdlabo/workers-mysql/testing` への非推奨の互換exportで、Firebase・HTTP・Stripe・KV・Queueのfakeはkitが提供します。

| Helper                                                          | 用途                                                      |
| --------------------------------------------------------------- | --------------------------------------------------------- |
| `createTestDb()`                                                | Drizzle migrationを適用したtest DBを作る。                |
| `FakeFirebaseVerifier`                                          | 登録済みin-memory Firebase tokenを検証する。              |
| `createPoolDatabase()` / `createNoopDatabase()`                 | Test用Database実装を提供する。                            |
| `authHeaders()` / `registerFirebaseToken()` / `provisionUser()` | 認証付きroute testを準備する。                            |
| `configurableFake()`                                            | 未設定memberで明示的に失敗するpartial fakeを作る。        |
| `fakeKv()` / `fakeQueue()`                                      | In-memory Workers binding fakeを使う。                    |
| Stripe fixture factory                                          | 型付きevent、session、subscription、price、intentを作る。 |

`/testing` はDB helperを静的に再公開するため、DB以外のfakeだけを使う場合も `@rdlabo/workers-mysql` と `drizzle-orm` が必要です。

## Queue

`sendInChunks()` はWorkers subrequest上限内にqueue sendを分割します。`processBatch()` はmessage batchを逐次処理し、同時subrequestを1に抑えます。`queueDisposition: 'discard'` を明示したerrorはack、それ以外はretryします。`createQueueErrorHandler()` はloggingと任意の最終attempt reportingを追加します。

## 運用CLI

kitは開発AWS credential同期、subrequest fanout検査、Realtime bundle検査、Durable Object metrics照会のcommandを公開します。DB baselineの正本は `workers-mysql-db-baseline` で、旧 `workers-hono-kit-db-baseline` は互換期間中に委譲します。Infrastructureを変更する前に、インストール済みversionのCLIを使ってください。

## Trust boundary

AWS、Firebase、AI Gateway、Stripe、DB clientはアプリ側で設定します。Domain固有credential、schema、認可policyを共有kitへ置かないでください。`createRolePolicy()` はstorage非依存のrole・relation mappingに限定し、roleとpermissionの正本はアプリが所有します。

## 次のステップ

export表は[Testing APIs](/docs/api-testing)、コマンド詳細は[CLI](/docs/cli)、パッケージ全体は[API](/docs/api)を参照してください。
