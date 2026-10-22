---
title: "Capacitor での Cloudflare バインディング"
---

# Capacitor での Cloudflare バインディング

これは HTTP リクエストのディスパッチであり、Cloudflare サービスのクライアント実装ではありません。ビルドはクラウド依存を検出し、**ローカルのアプリケーションハンドラーが実行される前に**、元のリクエストを既存のデプロイ済み Worker に送ります。Worker は自身のバインディング、認証情報、RPC、ストレージ、ライフサイクルを使用します。汎用の公開バインディングプロキシ、クライアント用の認証情報バンドル、自動リトライ、オフラインキューはありません。

## リモートサービス

Vite と esbuild のプラグインは、D1、Hyperdrive、R2、Service Bindings、Queue producer に加え、次の Wrangler 宣言を検出します。

| サービス | バインディング名を含む設定 |
| --- | --- |
| Durable Objects（Container namespace を含む） | `durable_objects.bindings[].name` |
| Workers AI | `ai.binding` |
| Vectorize | `vectorize[].binding` |
| AI Search | `ai_search[].binding`, `ai_search_namespaces[].binding` |
| Workflows | `workflows[].binding` |
| Analytics SQL | `analytics.binding` |
| Analytics Engine | `analytics_engine_datasets[].binding` |
| Browser Run | `browser.binding` |
| Images | `images.binding` |
| Stream / Media Transformations | `stream.binding`, `media.binding` |
| Rate Limiting | `ratelimits[].name` |
| mTLS | `mtls_certificates[].binding` |
| Secrets Store | `secrets_store_secrets[].binding` |
| メール送信 | `send_email[].name` |
| Workers for Platforms | `dispatch_namespaces[].binding` |

JSON、JSONC、TOML、名前付き環境に対応しています。既存のサービスバインディングと同様に、すべての環境の名前を保守的に考慮します。実際に実行されるリソースはデプロイ済み Worker の環境によって決まります。Wrangler の開発用オプション `remote: false` を指定しても、Capacitor でクラウドサービスがローカルになるわけではありません。リソース ID、モデル / インデックス名、証明書、シークレット値を Wrangler からクライアントへコピーすることはありません。

```ts
workersCapacitorPlugin({
  worker: "src/worker.ts",
  workerConfig: "wrangler.jsonc", // 自動検出される場合は省略可能
  remoteBindings: ["PAYMENT_SECRET", "FUTURE_SERVICE"],
});
```

`remoteBindings` は Wrangler にない通常の秘密情報や他ツールのバインディングなど、サーバー専用の名前を追加します。既知サービスの検出を置き換えません。同じ名前を `localBindings` にも指定することはできません。`baseURL` にデプロイ済み HTTPS Worker URL を設定し、オリジンを上書きする場合のみ `remote.origin` を指定します。クライアントランタイムの `env` やバンドラーの defines にサーバーの秘密情報を注入しないでください。

`binding` を含む未知の設定オブジェクトや、`name` を使うネストした `bindings` エントリー（`unsafe.bindings` など）は、その名前を `remoteBindings` に明示的に指定しない限りビルドエラーになります。これは構造に基づく検出であり、完全な Wrangler スキーマ検証ではありません。将来追加される任意の宣言形式や、ダッシュボードだけで設定したシークレットには引き続き明示的な名前の指定が必要です。`vars` と `define` の値はバインディング宣言として解釈されず、env にもコピーされません。

リモートバインディングを一つでも使うリクエストは、同じハンドラーがローカル設定の KV を読む場合でも、全体をリモートで実行します。リクエスト全体でクラウド側のインスタンスを使います。保守的に Worker 全体をリモートへ切り替えることで、共有状態、追加エクスポート、ミドルウェア、エラー処理を維持します。生成された `workers-capacitor-server.json` レポートを確認してください。

### 実行方法を選ぶ

Vite・esbuild プラグインの `execution` は、Worker 全体のモード（`"network"`・`"local"`）またはルート許可の配列を受け付けます。ランタイムの `workersCapacitor()` ではなくビルドプラグインに設定します。

| 形式 | 動作 |
| --- | --- |
| `execution: "network"`（既定値） | Worker 全体をデプロイ先で実行し、その実装をクライアント Worker グラフから除外。 |
| `execution: [{ method: "GET", path: "/" }]` | 選択したルート実装と保持する依存関係の端末配布を許可。サーバー依存や不確かな境界があればリモートを維持。 |
| `execution: "local"` | Worker 全体と依存関係の配布を許可。単独動作用で、ルート分離解析や自動リモートフォールバックは行わない。 |

既存 Worker のエントリーとデプロイ済み HTTPS URL を `baseURL` として使い始めます。Capacitor 化のためのルート分類は不要です。Worker をリモート実行しながら公開クライアントアセットをローカル同梱できます。動作を確認した後、必要なら配布可能なルートを明示的に選択します。`/api/` のような REST API 接頭辞があっても、その他のルートに非公開データがないとは限りません。

ソース全体を端末へ配布できる単独動作の Worker の場合:

```ts
workersCapacitorPlugin({
  worker: "src/worker.ts",
  execution: "local",
});
```

この形式は Hono のルート解析なしで動作し、設定されたサーバー専用バインディングとライフサイクル要件を拒否します。D1・Firebase Admin の模倣、未宣言の認証情報すべての検査、ランタイム互換性の保証は行いません。

### ローカルルートを選ぶ

既存の Hono アプリでは配列で選択したルートだけを許可します。

```ts
workersCapacitorPlugin({
  worker: "src/worker.ts",
  execution: [
    { method: "GET", path: "/" },
    { method: "*", path: "/app/*" },
  ],
});
```

選択は受信 URL ではなくビルド時の Hono 登録に対して行います。例は次の実装と保持する依存関係を許可します。

| 既存の登録 | 選択されるか |
| --- | --- |
| `app.get("/", handler)` | はい |
| `app.get("/app", handler)` | はい。Hono と同じ |
| `app.get("/app/home", handler)` | はい |
| `app.post("/app/notes", handler)` | はい |
| `app.get("/app/news/:id", handler)` | はい。実際のパラメーター値は Hono が照合 |
| `app.get("/application", handler)` | いいえ |
| `app.get("/api/news", handler)` | いいえ |

許可はローカル実行を保証しません。検出したサーバー依存、共有状態、重なるサーバーハンドラー・ミドルウェアにより選択したルートもリモートに残る場合があります。未知・未選択の要求もリモートのため、現在の登録すべてを選んでも配列形式はリモート先（明示的な `remote.origin` または `baseURL` のオリジン）が必須です。空配列は何も許可しません。

生成された `workers-capacitor-server.json`（D1 のみなら `workers-capacitor-d1.json`）の `remote` と `reason` を確認します。空でない選択でローカルハンドラーがなければ警告します。解析可能な Hono グラフで対応登録に何も一致しなければビルド失敗です。非対応 Worker グラフは Worker 全体のリモートへフォールバックして理由を報告します。

この設定はルートを作りません。`/app/missing` は既存の許可済み登録に一致しなければリモートです。`app.get("/app/*", handler)` などの選択したワイルドカード登録も Hono の要求処理の意味を維持します。

#### パスとメソッドの構文

- `"/about"`、`"/posts/:id"`、`"/posts/:id{[0-9]+}"` など正確な登録パスはその登録を許可し、URL 照合は Hono が行います。
- `"/app/*"` のようなリテラル接頭辞末尾のワイルドカードは `/app` 自体と `/app/` 以下を許可し、`/application`・`/app-private` は選びません。`/v1.0/*`・`/@me/*` の静的接頭辞に対応します。
- `"*"` と `"/*"` は対応する登録パスをすべて選択します。
- JavaScript の `RegExp`（例: `{ method: "GET", path: /^\/pages\// }`）は登録文字列を検査します。必要に応じて `^` と `$` で固定します。`g`・`y` を含め照合は毎回インデックス 0 から始め、指定した正規表現は変更しません。
- 大文字 HTTP メソッドはそのメソッドの登録を選びます。`method: "*"` は対応する直接 HTTP メソッド登録と `app.all()` を含みますが、ミドルウェアを独立して許可しません。適用可能な場合の GET による HEAD 処理など、Hono の意味を維持します。

パターンは将来のビルドで追加される一致登録も許可します。`"*"` メソッドはそのパスへの将来の POST・DELETE も含みます。広い配布許可を意図しない場合は狭いパターンを使ってください。

Hono の選択は export されたルーターへの直接登録に対応します。OpenNext は静的 GET・バージョン制約のある別の[生成ビルドプロファイル](opennext.md#route-execution)を使います。マウントルート（`app.route()`）、`basePath`、`on()` は許可対象として解決しません。任意の Hono パターン同士の包含は推論せず、`"/posts/:id"` は別登録の `"/posts/:slug"`・`"/posts/123"` を許可しません。登録パターンをコピーするかリテラル接頭辞のワイルドカードを使います。

#### Worker 全体モードと全ルート選択の違い

`execution: [{ method: "*", path: "*" }]` は引き続きルートを解析・分離し、リモート接続を要求して検出したサーバー境界を維持します。`execution: "local"` はその解析なしで Worker 全体を配布し、単独動作できます。ルート選択エラーを避けるためだけに `"local"` へ切り替えないでください。アプリ実装全体の配布を許可する設定です。

#### TypeScript の設定

両ツールエントリーは同じ型を export します。

```ts
import type { WorkerExecution } from "cf-workers-native/tooling/vite";

const execution = [
  { method: "GET", path: "/" },
  { method: "*", path: "/app/*" },
] as const satisfies WorkerExecution;
```

### 端末に移せるもの

端末所有者は同梱コード、ソースマップ、固定データを読み取り変更できます。配列実行は選択した実装と保持依存関係の配布許可であり、認証検出や秘密情報スキャンではありません。`settings.title` を読むハンドラーが `settings` 内の非公開の兄弟値を保持する場合があります。固定トークンの検査はトークンと保護データを両方配布しかねません。許可せずサーバーに残してください。HTTP メソッド、純粋性、HTML 出力、`ssr: false`、事前レンダリングでは配布適性を判断できません。

サーバーバインディング、未解決の実行依存、共有可変状態、不確かなルーティングはリモート境界を広げます。ミドルウェアが選択ルートに同行できるのは、無条件の `await next()` パススルーだけです。他は重なるハンドラーとともにリモートに残します。独自のエラー・not-found ハンドラーもリモート実行にします。クライアントのソースマップ生成前にリモート実装と専用依存を除外します。

クライアントの `env`、バンドラー defines、`workerFiles`、公開アセットに秘密情報を入れないでください。これらは Worker ソース除外の対象外です。別同梱のクライアントアセットもルーティングを迂回するため公開用に限ります。リモート操作にはサーバー認証・認可が必要で、どの実行形式も代替しません。network モードの KV・ASSETS は既定でリモートです。他の形式は該当する明示的なバインディング方針が必要です。ルート選択で非対応 Worker 形状は network へ戻ります。OpenNext には[限定的な生成ビルド連携](opennext.md#route-execution)があり、Void など非対応フレームワークのグラフはリモートに残ります。

元の HTTP ハンドラー内での Durable Object の HTTP / RPC 呼び出しは、このディスパッチ経路でサポートされています。**このトランスポートは WebSocket / HTTP upgrade に対応しておらず**、明示的に拒否します。WebSocket にはデプロイ済み Worker への別の接続を使ってください。このリリースは WebSocket の自動ルーティングを提供しません。

設定された Cron ハンドラー、Queue consumer、Durable Objects / Workflows の `exports` 宣言がある場合は、HTTP ハンドラーを含む Worker 全体をリモートに維持します。クライアントはスケジュールイベント、alarm、Workflow step、キュー消費をシミュレートしません。検出可能な設定宣言のない Email ハンドラーやその他のサーバーイベントは、その用途だけでは自動検出されません。

## リモート ASSETS バインディング

Wrangler に `assets` セクションがあるルート選択ビルドには `assetsExecution: "remote"` が必要です。network は既定で選びます。HTML 処理、SPA/404、制御ファイル、range/conditional、キャッシュの意味を含む ASSETS 経由の処理はデプロイ済み Worker に残り、クライアントは実装しません。

```ts
workersCapacitorPlugin({ worker: "src/worker.ts", assetsExecution: "remote" });
```

asset-first・パターンベースのルーティングや名前のないバインディング宣言は、デプロイ先の順序を保つため Worker ディスパッチをリモートに維持します。`run_worker_first: true` と名前があれば、通常の保守的解析で明示的に選択した独立ルートをローカルにできます。`env.ASSETS` を使うハンドラーはリモートです。アセットディレクトリーから Capacitor への自動コピーはしません。

**この変更はローカル ASSETS を実装・export しません。** 将来の実装には HTML 処理、制御ファイル、conditional/range、workerd・ネイティブの同等性を含む完全な契約が必要です。`assetsExecution: "local"` は部分実装を有効にせず明示的に失敗します。同梱ドキュメントアセットは別です。Vite の `publicDir`（esbuild ならビルド前のコピー）は Worker ディスパッチを迂回する正確なローカルパスを登録します。サーバーミドルウェア、認可、Cloudflare のレスポンスヘッダー・制御ファイル処理が不要な公開ファイルだけに使ってください。[OpenNext](opennext.md#bundle-client-assets-alongside-remote-pages) と [Void](void.md) の例はサーバー処理をリモートに残してクライアントスクリプトを同梱します。

## 検証と制限

アプリケーション Worker の基準は Miniflare `5.20261012.0-beta`、compatibility date `2026-10-01` で、アプリケーションの追加互換性フラグは使用しません。検証単位はビルドが生成する HTTP ディスパッチであり、クラウドバインディング API のローカルエミュレーションではありません。

- `npm test`: バインディング検出、方針エラー、未知名の診断、サーバーコード除外、リモート順序、upgrade 拒否。配布テストは縮小 JavaScript とソースマップの両方で保護 HTML/JSON、公開・非公開混在設定、ヘルパー分岐、無視値、マウント・重複ルートを検査します。
- `demo` の `npm run test:d1-migration`: workerd・ブラウザーのディスパッチと Vite/esbuild を検証し、独立した公開描画を維持して全出力アセットから保護データを除外します。未認証 401、認証済みの非公開レスポンスという元の Hono 動作も確認します。
- `demo` の `npm run test:cloudflare-bindings`: 実 workerd の Durable Object HTTP・RPC・ストレージ、状態変更なしの認可拒否、リモート ASSETS、成果物、Chromium/WebKit の direct/Worker モード、worker-first・asset-first、Vite 開発起動。ブラウザーの横取りでなく実ローカル HTTPS サーバーを使います。304 はテストサーバーでブラウザー HTTP キャッシュを無効にして観測し、Range は workerd への同一要求と比較します。転送の検証であり Cloudflare キャッシュのクライアント再現ではありません。
- Cloud AI、インデックス、Workflows は HTTP ディスパッチ名としての検証で、模倣 API や有料ライブサービスの検証ではありません。ネイティブ転送の契約は既存のリモートサービスと共通です。

Cache API、HTMLRewriter、ローカル ASSETS は別個の未完了の互換性単位です。パッケージは本番用の alias や export でこれらを有効にしません。

## 参考資料

- [Wrangler 設定](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Assets バインディングとルーティング](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [AI Search バインディング](https://developers.cloudflare.com/workers/runtime-apis/bindings/ai-search/)
- [Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
