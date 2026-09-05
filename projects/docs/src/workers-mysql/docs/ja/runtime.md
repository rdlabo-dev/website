---
title: ランタイム
---

Workerで `nodejs_compat` を有効にし、[はじめに](/docs/readme)の依存を追加してください。`mysql2` は含まれており、Honoには依存しません。アプリがHyperdrive binding、スキーマ、ORMファクトリーを渡します。

## 呼び出し単位の寿命

`createHyperdriveDatabase` はモジュールのグローバル領域ではなく呼び出し内で作成します。接続は遅延生成され、そのDBインスタンスで再利用されます。ランタイムが呼び出し終了時に接続を片付け、互換用 `dispose()` は何もしません。

以下は1つのHyperdrive bindingを両方の役割に使うWorkerの例です。replicaがある場合は `replicaHyperdrive` に別のbindingを渡せます。

```ts
import { createHyperdriveDatabase, type HyperdriveLike } from '@rdlabo/workers-mysql';
import { DRIZZLE_ORM_OPTIONS } from '@rdlabo/workers-mysql/drizzle';
import { drizzle } from 'drizzle-orm/mysql2';

interface Env {
  DB: HyperdriveLike;
}

export default {
  async fetch(_request: Request, env: Env): Promise<Response> {
    const db = createHyperdriveDatabase({
      primaryHyperdrive: env.DB,
      replicaHyperdrive: env.DB,
      createOrm: (connection) => drizzle(connection, DRIZZLE_ORM_OPTIONS),
    });
    const rows = await db.query<Array<{ value: number }>>('SELECT ? AS value', [1]);
    return Response.json(rows);
  },
};
```

## 読み取りと書き込み

| 操作 | 接続先 | 結果の型引数 |
| --- | --- | --- |
| `read<Row>(sql, params?)` | Replica | 1行の型。戻り値は `Row[]` |
| `query<Rows>(sql, params?)` | Primary SELECT | `Row[]` など結果全体 |
| `readTransaction(fn)` | Primaryの一貫したスナップショット | コールバック結果 |
| `write(fn)` | Primary ORM | await済みコールバック結果 |
| `transaction(fn)` | Primaryトランザクション | await済みコールバック結果 |

replicaの遅延を許容できない読み取りには `query` を使います。Hyperdriveのクエリキャッシュは別の設定事項です。SQL文字列への値の埋め込みではなくプレースホルダーを使ってください。

`readTransaction` は同じ読み取り専用スナップショットの `{ orm, query }` を渡します。専用接続で直列実行されるため、コールバックから再帰呼び出ししないでください。

## 再試行の境界

DB操作はデッドロックを再試行します。コールバックから書き込みbuilderまたはPromiseをreturn/awaitしてください。トランザクション全体が再実行され得るため、メール・決済など外部の副作用は外に置きます。すでに再試行する操作をさらに `retryWhenDeadlock` で包まないでください。

HyperdriveのSELECTと読み取り専用トランザクションは、致命的な接続エラー時に新しい接続でさらに1回再実行できます。書き込み・書き込みトランザクションは接続切断で再実行しません。成否が不明な場合があるため、リクエストを再試行する前にアプリの冪等性を設計してください。

`createMysqlDatabase({ orm, replica })` と `databaseFrom(orm, replica)` は既存ハンドルを包み、呼び出し元が接続を片付けます。追加のprimary読み取りメソッドを持つHyperdrive型ではなく `Database` を返します。Honoのcontainerにはkit `0.12.0` 以降の `@rdlabo/workers-hono-kit/mysql` を使います。

接続の既定値は[Drizzleと日付](/docs/drizzle)、exportは[API](/docs/api)を参照してください。

