---
title: 最初のMySQLクエリを実行する
---

テーブルやアプリのスキーマを作らず、パッケージを通して実際のMySQLの結果を読みます。その後、ローカルNode.js接続からWorkersのHyperdrive bindingへ移す際の違いを確認します。

IANA表示日付は[Workers Timezone＋ESLint](/workers-timezone/docs/quickstart)の領域で、DBの固定 `+09:00` 保存ヘルパーとは独立しています。

## 1. ローカルの演習環境を用意する

Node.js 24、npm、Docker、未使用のローカルポート3307が必要です。次のコマンドは使い捨てのローカルDBを作ります。記載のパスワードはこのlocalhost演習専用です。

```sh
mkdir workers-mysql-demo
cd workers-mysql-demo
npm init -y
npm pkg set type=module
npm install @rdlabo/workers-mysql@0.12.2 mysql2@3 drizzle-orm@0.45
npm install --save-dev tsx@4 @types/node@24
```

パッケージは内部依存としてmysql2を含みます。この例ではアプリが所有するpoolを作るためmysql2とDrizzleも直接importするので、直接依存として宣言します。

```sh
docker run --name workers-mysql-docs-demo --rm -d \
  -p 127.0.0.1:3307:3306 \
  -e MYSQL_ROOT_PASSWORD=local-demo \
  -e MYSQL_DATABASE=demo \
  mysql:8.4
```

起動を待ち、次のコマンドで `mysqld is alive` が表示されることを確認します。

```sh
docker exec workers-mysql-docs-demo mysqladmin ping -h 127.0.0.1 -uroot -plocal-demo
```

## 2. クエリを実行して接続を閉じる

`demo.ts` として保存します。この演習は両方の役割に同じローカルpoolを使うため、replicaへの振り分けを検証するものではありません。

```ts
import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { createMysqlDatabase } from '@rdlabo/workers-mysql';

const pool = createPool({
  host: '127.0.0.1',
  port: 3307,
  user: 'root',
  password: 'local-demo',
  database: 'demo',
});
const db = createMysqlDatabase({ orm: drizzle(pool), replica: pool });

try {
  const rows = await db.read<{ value: number }>('SELECT ? AS value', [42]);
  console.log(rows[0]?.value);
} finally {
  await pool.end();
}
```

```sh
npx tsx demo.ts
```

期待する出力です。

```text
42
```

`db.read()` を通じて、プレースホルダー付きの `SELECT` の結果を取得できました。テーブルの作成・変更は行いません。接続エラーになる場合は、コンテナーの起動完了とポート3307が使えることを確認してください。

終了時は使い捨てのDBを停止します。`--rm` で起動しているため、停止するとコンテナーと演習データも削除されます。

```sh
docker stop workers-mysql-docs-demo
```

## 3. Workers・Hyperdriveへ移す

Node.jsではアプリがpoolを所有して閉じます。Workersでは `nodejs_compat` を有効にし、DBへ接続する `DB` というHyperdrive bindingを設定して、呼び出しごとにデータベースを生成します。

bindingの設定後、次の完全なWorker例で `[{"value":42}]` を返せます。両方の役割に1つのbindingを使い、生SQLを実行するためスキーマは不要です。

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
    const rows = await db.query<Array<{ value: number }>>('SELECT ? AS value', [42]);
    return Response.json(rows);
  },
};
```

primaryのSELECTは `query()`、replicaの読み取りは `read()` を使います。型付きテーブルクエリが必要になったらORMスキーマを追加します。[ランタイム](/docs/runtime)で呼び出し寿命・snapshot read・再試行、[Drizzleと日付](/docs/drizzle)でカラム・保存時刻を確認できます。

Honoのリクエストコンテナーには[kitの `/mysql` アダプター](/workers-hono-kit/docs/data-layer)を追加します。再試行済みのDBメソッドをさらにretry loopで包まないでください。transaction callbackは再実行されるため、メール・決済など外部への副作用を外へ置きます。
