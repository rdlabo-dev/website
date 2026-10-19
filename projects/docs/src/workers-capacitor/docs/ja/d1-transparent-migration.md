---
title: "Capacitor で D1 を使う Workers"
sourceRevision: "6c07daba080bb3b8d7adacd08e5e6ca4032e0c8b382f96a11aad49e2a91bd2ce"
headingAliases: {"setup":"%E8%A8%AD%E5%AE%9A","how-execution-is-selected":"%E5%AE%9F%E8%A1%8C%E5%85%88%E3%81%AE%E9%81%B8%E6%8A%9E%E6%96%B9%E6%B3%95","code-removal-and-execution-boundaries":"%E3%82%B3%E3%83%BC%E3%83%89%E9%99%A4%E5%A4%96%E3%81%A8%E5%AE%9F%E8%A1%8C%E5%A2%83%E7%95%8C","shared-transport-security-and-upload-limits":"%E5%85%B1%E9%80%9A%E3%83%88%E3%83%A9%E3%83%B3%E3%82%B9%E3%83%9D%E3%83%BC%E3%83%88%E3%81%AE%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E3%81%A8%E3%82%A2%E3%83%83%E3%83%97%E3%83%AD%E3%83%BC%E3%83%89%E5%88%B6%E9%99%90","verification":"%E6%A4%9C%E8%A8%BC"}
---
既存の Worker エントリーと HTTP ルートを使います。ビルド統合はサーバーの操作をデプロイ済み Worker に維持し、クライアントのディスパッチを生成します。アプリケーション開発者が別の REST API を作ったり、D1 呼び出しを fetch に置き換えたり、第 2 の router を管理したりする必要はありません。

## 設定

```ts
// vite.config.ts — Capacitor ビルドのみ
import { workersCapacitorPlugin } from "workers-capacitor/tooling/vite";

export default {
  plugins: [workersCapacitorPlugin({ worker: "worker/src/index.ts" })],
};
```

プラグインは Worker エントリー付近にある最寄りの Wrangler JSON / JSONC / TOML 設定、またはビルドルートから `d1_databases` を読み取ります。名前付き環境のバインディング名も含まれます。設定内のシークレットとデータベース ID は生成クライアントにコピーしません。明示的な `workerConfig` パスはビルドルートを基準にします。他の設定ツールを使う場合は `d1Bindings: ["DB"]` を指定してください。esbuild プラグインも同じオプションを受け付けます。

```ts
// アプリの起動 — 業務用 Worker は変更しません
import { workersCapacitor } from "workers-capacitor";

const runtime = workersCapacitor({
  baseURL: "https://local.invalid/",
  remote: {
    origin: "https://existing-worker.example.com",
    // 任意: リクエストに Authorization ヘッダーがまだない場合、既存の
    // セッションを接続します。新しいログインシステムではありません。
    getToken: () => existingSession.getToken(),
  },
});
await runtime.ready;

// 既存の URL と HTTP 契約は変更しません。
const response = await fetch("/api/counters/alice");
```

デプロイ済み Worker は、既存の認証、認可、入力検証、業務処理、D1 バインディングを維持します。汎用 SQL エンドポイント、query-ID エンドポイント、クライアントの D1 実装、スキーマ移行 API はなく、Cloudflare 管理トークンをクライアントに置くこともありません。サーバーのデプロイは別の操作です。

## 実行先の選択方法

静的解析が可能な Hono アプリケーションでは、コンパイラーがローカルモジュールの import / re-export、helper、mount した router、チェーンした登録、ミドルウェアを追跡します。同じ Hono マッチング規則を持つ selector を生成します。一致する操作に一つでもサーバー実行が必要なら、**ローカルのアプリケーションミドルウェアやハンドラーが実行される前に**リクエスト全体を既存の Worker へ送ります。fallthrough と重なり合うルートも対象です。純粋なルートはローカルに残ります。

D1 バインディング、サーバーの `env` 値、未知の依存関係の動作、動的プロパティアクセス、サーバー操作と共有する可変状態は、サーバー境界を広げます。`workersCapacitor({ env })` で供給する `env` バインディングは、ビルドオプション `localBindings: ["LABEL"]` により明示的にローカルに維持できます。D1 バインディングは local と宣言できません。未知のトップレベル初期化、内部 router ディスパッチ、暗黙のグローバル状態、Cookie / ヘッダーの状態も、Worker 全体をサーバーに維持する要因です。解析は意図的に保守的であり、人が安全に分離できる範囲より多くの処理をサーバーへ送ることがあります。

分割してディスパッチの意味を維持できない場合、生成クライアントは**すべてのリクエストを既存の Worker に委譲**し、そのアプリケーション実装を一切含めません。一般的な Fetch Handler と Workers Express もこれに含まれます。ビルドは Worker の書き換えを要求する代わりに理由を報告します。このモードではインターセプトするすべてのリクエストに接続が必要であり、既存アプリケーションをオフラインで利用可能にするものではありません。操作を部分的に実行した後の D1 エラーを捕捉してこのモードを選ぶことはありません。

D1 のみのビルドでは、どちらの統合も選択したモードとルート / ミドルウェア登録を記述する `workers-capacitor-d1.json` を出力します。このレポートは診断用メタデータであり、アプリケーション開発者が管理する第 2 の router ではありません。

## コード除外と実行境界

コンパイラーは、バンドラーがクライアントの source map を作る前にローカルグラフを生成します。除外したハンドラーとその未使用 helper は、`sourcesContent` を含む生成ソースに存在しません。同じグラフを direct と Dedicated Worker の実行に使います。元の Worker モジュールをクライアントに別途インポートすると、除外を迂回することになるため拒否します。サーバーソース、SQL / migration ファイル、サーバーの source map を手動で公開アセットにコピーしないでください。それらは生成モジュールグラフに含まれません。パッケージングにはクリーンな出力ディレクトリを使ってください。

どちらの実行モードでも selector と接続は host で実行します。セッションのコールバックは host に残り、Dedicated Worker へ structured clone しません。リモートオリジンがローカルのインターセプト URL と重なる場合も、リクエストは既存の外向きトランスポートへ直接送ります。ローカル fetch の再帰は使いません。ネイティブリクエストは既存の TCP / TLS トランスポートと所有権付き socket スコープを使います。ブラウザリクエストは CORS を維持し、WebKit / HTTP/1 対応のためアップロード本文をバッファリングします。ネイティブの manual ドキュメントリクエストはストリーミングを維持します。Fetch の follow モードは、同一オリジンの 307 / 308 で本文を再送できるよう、アップロードをバッファリングします。

パス、クエリ、メソッド、本文、レスポンスの status を維持します。`getToken` がなければ既存の Authorization ヘッダーを再利用します。`getToken` がある場合は、リクエストごとに現在のトークンで置き換えます。トークンがなければ古い bearer 認証情報を削除します。

ネイティブ Capacitor では、既存のサーバー管理 Cookie セッションにリモートホスト用の OS Cookie store を使います。Set-Cookie はリダイレクト前に host が処理し、HttpOnly Cookie は描画したドキュメントに公開しません。Path、有効期限、永続 Cookie のログアウトの意味を維持します。ローカルドキュメントの Cookie を無条件に転送することはありません。Cookie に依存する Worker は全体をデプロイ済み Worker で実行し、ログイン、プロフィール、ログアウトを一つのセッション境界で処理します。ユーザーは既存のログインページでサインインします。別のデスクトップブラウザの Cookie はインポートしません。既存の Worker UI を描画するには、`remote: { origin }` とともに `render: "/"` を使います。

設定したリモートオリジン内でのネイティブリダイレクトは HTTP の意味を維持します。303 は POST を GET に変更し、307 / 308 はメソッド / 本文を保持し、manual ドキュメントリダイレクトはアプリケーションの論理オリジンにマッピングします。リダイレクトチェーンには上限があります。別のオリジンへのリダイレクトは、認証情報を送る前に拒否します。外部 OAuth / SSO フローには明示的な外部ブラウザ統合が必要であり、ここでは提供しません。ローカルの `document.cookie` でリモートの非 HttpOnly Cookie を読むことに依存するクライアントスクリプトも橋渡ししません。

通常のブラウザでは、リモートリクエストに `credentials: "include"` を使います。デプロイ済み Worker の CORS レスポンスは、実際のアプリの Origin と credentials を許可する必要があります。ワイルドカードの Access-Control-Allow-Origin では不十分です。ブラウザの Cookie プライバシー規則と SameSite 規則も適用されます。ブラウザは manual リダイレクトの location を隠すため、リモートリダイレクトはそこで明示的な未対応エラーになります。したがって、ネイティブドキュメントの受け入れ検証はブラウザ API テストから推測せず、iOS / Android で実施してください。

401 とネットワーク障害は、自動リトライやローカルフォールバックをせず返します。abort とランタイム破棄は保留中の認証情報取得 / トランスポートをキャンセルし、遅れて届いたトークンで破棄後に送信することはありません。SQL の除外はサーバー実装の公開を減らしますが、サーバー側の認可を置き換えたり、それ以外のローカルアプリケーションコードにハードコードされた任意のシークレットを特定したりするものではありません。

## 共通トランスポートのセキュリティとアップロード制限

既存の Worker のナビゲーションでは、アプリローカルの `Origin` と `Referer` ヘッダーをリモートオリジンにマッピングします。書き換えた Origin だけを、信頼できるユーザーの意図の証明として扱わないでください。使用しているアプリケーションの CSRF トークン検証を維持し、WebView のコンテンツ / ナビゲーションとネイティブブリッジへのアクセスを制限してください。HttpOnly は Cookie をスクリプトから隠しますが、侵害されたスクリプトが認証済みリクエストを送ることは防ぎません。ネイティブ Cookie トランスポートは、ブラウザ相当の SameSite / CSRF 保護を保証しません。

ブラウザのアップロードと、ネイティブ Fetch の redirect-follow アップロードは、デフォルトで最大 8 MiB までバッファリングします。`remote.maxBufferedBodyBytes` には非負の安全な整数（バイト単位）を設定します。上限を超えると本文の producer をキャンセルし、ネットワークへのディスパッチ前に拒否します。ゼロは空の本文だけを許可します。ネイティブの manual / error リダイレクトモードはストリーミングを維持します。この上限が制限するのはトランスポートのバッファリングであり、アプリケーション全体の heap 使用量や呼び出し側が確保済みの本文ではありません。大きなアップロードを確保する前にアプリケーションで制限し、さらに大きなオブジェクトには R2 の multipart upload を使ってください。

Hyperdrive も同じトランスポートを使います。バインディング設定と追加のデータベース境界は [Hyperdrive ガイド](hyperdrive-transparent-migration.md)を参照してください。

## 検証

ルートの `npm test` はコンパイラー / 設定とリモートランタイムのテストを含みます。ルートでビルドし、デモの依存関係をインストールした後に実行します。

```sh
cd demo
npm run test:d1-migration
```

この統合は、変更していない通常の Hono Worker とローカル workerd D1 を使います。Vite / esbuild、Chromium / WebKit、direct / isolated 実行について、選択的実行と Worker 全体の実行の両方で公開 API からの起動を確認します。既存の読み書き動作、データベースの状態、認可、リトライしない 401、HEAD、ネットワークを使わないローカルルート、JS と source map からの SQL / helper マーカー除外を確認します。Vite 開発時の起動、元ソースの拒否、ファイル編集後の再コンパイルも確認します。これは互換性 CI ジョブに含まれます。

再現可能なネイティブ検証には、新しい npm tarball の利用側プロジェクト、独立した app ID、ローカル HTTPS テストサーバー、シミュレーター / debug 利用側だけが信頼するテスト証明書を使います。

```sh
node demo/tests/experiments/d1/native-server.mjs
# npm run build の後、別のシェルで実行:
node demo/tests/experiments/d1/native-prepare.mjs
node demo/tests/experiments/d1/native-run.mjs ios <simulator-uuid>
node demo/tests/experiments/d1/native-run.mjs android <emulator-serial>
```

テストデータベースを共有するため、プラットフォームは順番に実行してください。Android はデフォルトで Android Studio の Java 21 を使い、`D1_JAVA_HOME` で上書きできます。`native-prepare.mjs --refresh` は候補を再パックし、同じ隔離した利用側を更新します。レポート、ログ、パッケージ integrity、サーバー側の DB スナップショットは `demo/artifacts/d1-native/` にあります。ブラウザのレポートと検査済みバンドルは `demo/artifacts/d1-integration/` にあります。

描画した Cookie セッションの受け入れ検証には、同じスクリプトに `--ui` を付けます。

```sh
node demo/tests/experiments/d1/native-server.mjs --ui
node demo/tests/experiments/d1/native-prepare.mjs --ui
node demo/tests/experiments/d1/native-run.mjs ios <simulator-uuid> --ui
node demo/tests/experiments/d1/native-run.mjs android <emulator-serial> --ui
```

独立した UI 利用側は `render: "/ui/account"` と、Capacitor をインポートしない通常の Worker を使います。テスト専用の DOM ドライバーが、描画された WebView の入力欄を埋め、実際のフォーム / リンクを操作します。ナビゲーションを API 呼び出しに置き換えることはありません。同じ Worker が workerd で動きます。テストは CSS / JS アセット、ログイン、POST / 303 / GET による 1 回の D1 書き込み、詳細へのナビゲーション、プロセス再起動後の永続セッション、ログアウト、再度の再起動後も未認証であることを確認します。サーバー側の D1 スナップショット、スクリーンショット、レポートは `demo/artifacts/d1-native-ui/` に保存します。プラットフォームは順番に実行してください。`native-prepare.mjs --ui --refresh` は新しいパッケージ tarball からその利用側を更新します。
