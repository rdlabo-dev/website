---
title: "Capacitor で Hyperdrive を使う Workers"
sourceRevision: "c72828b69fcb330db8390fc94ec9f8decade14a36c533e2e7fcfe7b7ced0da8e"
headingAliases: {"setup":"%E8%A8%AD%E5%AE%9A","execution-and-code-removal":"%E5%AE%9F%E8%A1%8C%E3%81%A8%E3%82%B3%E3%83%BC%E3%83%89%E9%99%A4%E5%A4%96","security-boundaries":"%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E3%81%AE%E5%A2%83%E7%95%8C","verification":"%E6%A4%9C%E8%A8%BC"}
---
既存の Worker エントリー、ルート、データベースドライバー、SQL を再利用します。Capacitor ビルドは、サーバー操作のためにデプロイ済み Worker への HTTP ディスパッチを生成します。

```text
Capacitor: POST /api/orders
  → HTTPS https://existing-worker.example/api/orders
  → existing Worker authentication, authorization and validation
  → existing database driver → Hyperdrive → PostgreSQL or MySQL
  → existing HTTP response → Capacitor
```

クライアントが送るのは既存の HTTP リクエストであり、SQL やデータベースプロトコルではありません。Hyperdrive のバインディング、認証情報、pooling、caching は Cloudflare に残ります。このパッケージは Hyperdrive をエミュレートせず、モバイル端末をオリジンのデータベースへ接続せず、汎用 SQL エンドポイントを作らず、サーバーのデプロイも行いません。

## 設定

`hyperdrive` エントリーを含む既存の Wrangler 設定（名前付き環境を含む）を維持します。Vite / esbuild プラグインはバインディング名だけを読み取り、ID と `localConnectionString` の値をクライアントにコピーしません。

```ts
// Capacitor の vite.config.ts
import { workersCapacitorPlugin } from "workers-capacitor/tooling/vite";
export default {
  plugins: [workersCapacitorPlugin({ worker: "worker/src/index.ts" })],
};
```

Worker エントリー付近にある最寄りの Wrangler JSON、JSONC、TOML 設定を使用し、見つからなければビルドルートを使います。別のファイルを選ぶには、ビルドルートからの相対パスで `workerConfig` を指定します。他の設定ツールには `hyperdriveBindings: ["HYPERDRIVE"]` を指定します。明示的な `d1Bindings` と `hyperdriveBindings` は、それぞれ自身の種類のバインディングの検出だけを上書きします。D1 と Hyperdrive は共存できます。明示的な空配列はその種類の検出を無効にするため、Worker が実際に使用するサーバーバインディングの検出を無効にしないでください。

```ts
import { workersCapacitor } from "workers-capacitor";
const runtime = workersCapacitor({
  baseURL: "https://local.invalid/",
  remote: {
    origin: "https://existing-worker.example",
    // 任意: アプリケーションの既存のユーザーセッションを使用します。
    getToken: () => existingSession.getToken(),
  },
});
await runtime.ready;
const response = await fetch("/api/orders", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ productId: "example", quantity: 1 }),
});
```

デプロイ済み Worker には引き続き、通常の Hyperdrive 設定、対応するドライバー、互換性フラグが必要です。Cloudflare の [MySQL](https://developers.cloudflare.com/hyperdrive/examples/connect-to-mysql/) と [PostgreSQL](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/) のガイドを参照してください。既存の ORM コードも同じ境界に従いますが、すべての ORM やドライバーのバージョンを認定するものではありません。

## 実行とコード除外

静的に解析でき、サーバー操作から独立した Hono ルートはローカルに残ります。一致する操作に Hyperdrive が必要なら、ローカルのアプリケーションミドルウェアを実行する前にリクエスト全体を既存の Worker へ送ります。インポートした helper とサーバードライバーの import は、クライアントの JavaScript と source map を生成する前にハンドラーとともに除外します。direct と Dedicated Worker モードは同じ生成境界を使います。

トップレベルの connection pool、共有可変状態、Cookie 依存、未知の初期化、不確実なルーティングがあると、Worker 全体をリモートに維持する場合があります。一般的な Fetch Handler は Worker 全体の委譲を使います。ビルドは判断を警告し、モード、理由、ルート登録を含む `workers-capacitor-server.json` を出力します。D1 のみのビルドは互換性のため `workers-capacitor-d1.json` を維持します。Hyperdrive バインディングを `localBindings` に宣言することはできません。

トランザクションと接続のクリーンアップは既存のサーバーハンドラー内に残ります。401 とネットワーク障害は自動リトライやローカルフォールバックを起こしません。書き込みがコミットされた後でもレスポンスが失敗することはあります。ユーザーによる安全な再試行が必要なアプリケーションは、既存のサーバー側の冪等性ポリシーを実装する必要があります。Worker 全体の委譲は、インターセプトするすべてのリクエストに接続を必要とします。

## セキュリティの境界

- `remote.origin` は HTTPS のオリジンである必要があり、認証情報、パス、クエリ、fragment を含めてはいけません。リダイレクトはそのオリジン内に留めます。外部 OAuth / SSO は別の統合が必要です。
- サーバーはユーザーを認証し、各リソースへのアクセスを認可しなければなりません。クライアントのルーティングと SQL 除外は認可の制御ではありません。Worker のパラメーターバインド、入力検証、適切なデータベース権限を維持してください。
- ユーザースコープの認証情報を使ってください。クライアントの `env`、token callback、ログ、公開アセットに、データベースの認証情報や Cloudflare 管理トークンを置かないでください。生成時のコード除外は、手動でコピーした公開ファイルのスキャンや、その他のローカルコード内にハードコードされた任意のシークレットの検出を行いません。
- ネイティブ Cookie セッションはリモートホストの Cookie store を使います。`Set-Cookie` は host が処理し、ページのレスポンスから除去します。HttpOnly はスクリプトによる Cookie へのアクセスを防ぎますが、侵害されたスクリプトの認証済みリクエストは防ぎません。
- アダプターは既存の Worker のナビゲーションのために、アプリローカルの `Origin` / `Referer` をリモートオリジンへマッピングします。そのため、サーバーは変換後の Origin だけを信頼できるユーザーの意図の証拠として扱えません。使用中の CSRF トークン検証を維持し、WebView のコンテンツ / ナビゲーションとネイティブブリッジへのアクセスを制限して、実際のアプリケーションで XSS / CSRF を評価してください。これはネイティブトランスポートでのブラウザ相当の SameSite / CSRF 保護を保証するものではありません。
- 通常のブラウザでは引き続き credentials を許可する CORS が必要で、ブラウザの Cookie ポリシーに従います。ブラウザでの manual リモートリダイレクトは未対応です。
- ブラウザのアップロードとネイティブ Fetch の redirect-follow アップロードはバッファリングします。共通トランスポートのデフォルト上限は 8 MiB で、`remote.maxBufferedBodyBytes` から設定できます。上限を超えた本文はディスパッチ前に拒否します。ネイティブの manual / error リダイレクトモードはストリーミングします。上限はアプリ全体のメモリを制限しないため、大きな本文を確保する前にアプリケーション側で制限してください。

共通のトランスポートと Cookie の動作は [D1 ガイド](d1-transparent-migration.md)に詳しく記載しています。Hyperdrive はビルド時のバインディング認識を追加するもので、別の認証情報やネットワークトランスポートを追加しません。

## 検証

`npm test` は、JSON / JSONC / TOML と名前付き環境の検出、D1 と Hyperdrive が混在する override、local binding の拒否、ネストした設定の検出、driver / helper / SQL コードの除外、トップレベル pool によるフォールバックを検証します。

ブラウザ統合では、パッケージをビルドしてデモの依存関係をインストールし、**破棄可能な専用の MySQL テストデータベース**を用意してください。スイートは `private_counters` を作成し、`alice` / `bob` 行をリセットします。アプリケーションデータを指定しないでください。その後、次を実行します。

```sh
npm run build
cd demo
HYPERDRIVE_TEST_MYSQL_URL='mysql://root:hyperdrive-test-only@127.0.0.1:3306/hyperdrive_test' npm run test:hyperdrive-migration
```

同じ未変更のフィクスチャ Worker が、ローカル Hyperdrive バインディングと mysql2 を使い、workerd 上で実際の MySQL に対して実行されます。ブラウザの HTTPS リクエストはテスト harness がインターセプトし、そのローカル Worker にディスパッチします。テストは Vite / esbuild、Chromium / WebKit、direct / Dedicated Worker、選択的 / Worker 全体の委譲、Vite 開発時の再ビルド、認可、リクエストごとに 1 回のデータベース更新、HEAD、ネットワークを使わないローカルルート、クライアントの JS と source map に SQL / driver / 設定マーカーがないことを確認します。レポートは `demo/artifacts/hyperdrive-integration/` に出力します。CI は独自の MySQL サービスを用意します。

これはローカル Hyperdrive バインディングとデータベースの動作を確認するもので、本番 Hyperdrive の pooling / caching や実機の HTTPS を検証するものではありません。PostgreSQL / ORM の import はコンパイラーの除外対象として検証し、実際の PostgreSQL クエリは対象外です。先行する D1 のネイティブ受け入れ検証は共通トランスポートを対象とし、Hyperdrive のネイティブ受け入れ結果ではありません。サーバーのデプロイ、本番の認証情報、実機はこの検証に含まれません。
