---
title: "ランタイムの動作"
sourceRevision: "999dcc5042e210b3c55afc4419f302d9469f43d1f69a6c5be3583f30147ba8c1"
headingAliases: {"fetch-only-integration":"fetch-%E3%81%AE%E3%81%BF%E3%81%AE%E7%B5%B1%E5%90%88","execution-preference":"%E5%AE%9F%E8%A1%8C%E7%92%B0%E5%A2%83%E3%81%AE%E5%84%AA%E5%85%88%E8%A8%AD%E5%AE%9A","initialization-and-cleanup":"%E5%88%9D%E6%9C%9F%E5%8C%96%E3%81%A8%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%A2%E3%83%83%E3%83%97","explicit-worker-sources":"worker-%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E6%98%8E%E7%A4%BA%E6%8C%87%E5%AE%9A","url-contract":"url-%E3%81%AE%E5%A5%91%E7%B4%84","how-local-requests-are-selected":"%E3%83%AD%E3%83%BC%E3%82%AB%E3%83%AB%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88%E3%81%AE%E9%81%B8%E6%8A%9E%E6%96%B9%E6%B3%95","endpoint-examples":"%E3%82%A8%E3%83%B3%E3%83%89%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%81%AE%E4%BE%8B","compatibility-and-limitations":"%E4%BA%92%E6%8F%9B%E6%80%A7%E3%81%A8%E5%88%B6%E9%99%90","verified-api-behavior":"%E6%A4%9C%E8%A8%BC%E6%B8%88%E3%81%BF%E3%81%AE-api-%E5%8B%95%E4%BD%9C","framework-and-platform-limits":"%E3%83%95%E3%83%AC%E3%83%BC%E3%83%A0%E3%83%AF%E3%83%BC%E3%82%AF%E3%81%A8%E3%83%97%E3%83%A9%E3%83%83%E3%83%88%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0%E3%81%AE%E5%88%B6%E9%99%90","security-and-network-boundaries":"%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E3%81%A8%E3%83%8D%E3%83%83%E3%83%88%E3%83%AF%E3%83%BC%E3%82%AF%E3%81%AE%E5%A2%83%E7%95%8C","worker-transport-and-resource-lifetime":"worker-%E3%83%88%E3%83%A9%E3%83%B3%E3%82%B9%E3%83%9D%E3%83%BC%E3%83%88%E3%81%A8%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E3%83%A9%E3%82%A4%E3%83%95%E3%82%BF%E3%82%A4%E3%83%A0","execution-environment-and-async-context":"%E5%AE%9F%E8%A1%8C%E7%92%B0%E5%A2%83%E3%81%A8%E9%9D%9E%E5%90%8C%E6%9C%9F%E3%82%B3%E3%83%B3%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88"}
---
判断は二つに分かれます。クラウドバインディングのディスパッチはリクエストをローカルとリモートのどちらで実行するかを選び、`prefer` はローカルの JavaScript 環境を選びます。ローカルの Dedicated Web Worker は端末上で動き、Cloudflare 上で動くわけではありません。

## Fetch のみの統合

Worker API を呼び出す既存のフロントエンドでは、[Capacitor ビルド](build-setup.md)で Worker を設定し、`render` を省略します。UI をマウントする前に初期化してください。

```ts
import { workersCapacitor } from "workers-capacitor";

const runtime = workersCapacitor({
  baseURL: "https://api.example.com/api/",
});
await runtime.ready;

const response = await fetch("/api/hello");
```

既存の UI は通常の Fetch 呼び出しをそのまま使います。境界に一致するリクエストは設定したローカルまたはリモートの Worker を使用し、境界外のリクエストは通常の Fetch の動作を維持します。クラウドに依存するルートは、[統合ガイド](integration.md)に従ってバインディングとリモートオリジンを設定してください。

## 実行環境の優先設定

デフォルトの `prefer: "worker"` は、Dedicated Web Worker が利用でき、初期 `env` にプレーンなデータだけが含まれる場合に Dedicated Web Worker を起動します。Worker が存在しない場合、コンストラクターが SecurityError / NotSupportedError を返す場合、または `env` がメソッド / 独自プロトタイプ / accessor（ローカル KV バインディングなど）を含む場合は、リクエストを処理する前に direct 実行を選びます。`prefer: "direct"` は Worker を作成せずに direct モジュールを読み込みます。direct 実行は常に利用可能な基盤です。モジュールやアプリケーションのエラーは、direct 実行が利用不可能であることを意味しません。

`runtime.ready` を await し、`runtime.execution`（`"worker"` または `"direct"`）を調べると選択結果がわかります。direct のコードは選択された場合だけ動的にインポートします。選択は一度だけです。起動スクリプトの失敗やリクエストエラーは報告し、別の環境で再実行することはありません。これは未対応の Workers API をすべて自動検出するものではありません。選択後に `env` を変更しても再選択は行いません。Worker の選択は保守的であり、列挙不可の独自プロパティや null prototype を持たないプリミティブ、通常のオブジェクト、配列（循環参照を含む）を受け付けます。structured clone 可能な他の型も、現在は direct を選択します。

## 初期化とクリーンアップ

インストールは同期的に fetch をインターセプトします。Worker モードのリクエストは起動を待ちます。direct モジュールの読み込み中に一致したリクエストは、top-level await のデッドロックを防ぐため明示的に拒否します。UI のリクエストを開始する前に `runtime.ready` を await してください。ランタイムはモジュール初期化時の呼び出しと同時に発生した UI の呼び出しを区別できないため、direct の読み込み中は両方とも拒否します。`await runtime.ready` により、UI の描画前に起動の成功 / 失敗を確認できます。`await workersCapacitor(...)` は Worker の起動を待ち**ません**。

インストールは一つだけサポートします。`await runtime.dispose()` は fetch を復元し、Dedicated Worker を終了して、必要な非同期クリーンアップの完了を待ちます。終了時には未完了のローカル呼び出し / 本文読み取りを拒否し、バックグラウンド処理の追跡を解放します。

## Worker ソースの明示指定

direct ハンドラーの明示的なインポートと、標準的な `new Worker(new URL(...), { type: "module" })` ファクトリーに対応しています。`prefer` にはプラグイン設定、または `createWorker` と `loadDirect` の両方を備えた明示的なソースが必要です。ハンドラーかファクトリーの片方だけから、第 2 の候補を作り出すことはできません。

direct インポートも引き続きサポートします。`import worker from "./worker"` は `fetch` を持つオブジェクトを渡し、UI のグローバルスコープで実行します。このモードの Hono にビルドプラグインは不要ですが、Workers Express には互換性プラグインが必要です。Worker のサブリクエストが UI インターセプトの外に留まるのは `runtime.execution` が `"worker"` の場合だけです。direct フォールバックは UI のグローバル環境を共有します。

Worker やその依存関係がモジュール評価中に Workers 拡張（`Headers.getAll("set-cookie")` や `Request.cf` など）を使う場合は、[ビルド設定ガイド](build-setup.md)のように Vite / esbuild プラグインで `worker` を設定してください。どちらの実行モードでも、ランタイムはエントリーとその依存関係を読み込む前に Web API をインストールします。direct の静的インポートでは、`workersCapacitor()` がこれらの API を初期化する前にモジュールが評価されます。インストールした実装を使うのは初期化後の呼び出しだけです。プレーンな JavaScript でモジュール評価前の初期化が必要な場合は、[`loadDirect` ソース](build-setup.md#browser-es-modules-no-bundler)を使ってください。

## URL の契約

### ローカルリクエストの選択方法

アダプターはリクエスト URL を解決し、アドレスとパスの両方を確認します。

1. URL は、実行中のアプリの**プロトコルとホスト**（ポートを含む）、または `baseURL` に設定したオリジンのいずれかに一致する必要があります。
2. パスは `baseURL` のパス境界と等しいか、その配下である必要があります。`/api/` の場合、`/api` と `/api/hello` は一致しますが、`/apiary` は一致しません。

一致したリクエストは通常ローカル Worker で実行します。クラウドバインディングのビルド統合を使う場合、生成された selector はローカル実行の前に既存のデプロイ済み Worker に送ることがあります。アダプターはパスとクエリを保持しながら、オリジンを `baseURL` のオリジンに置き換えます。プロトコルだけではローカル実行を選択しません。`capacitor://other-host/api/hello` は `capacitor://localhost` で動くアプリに一致しません。

Capacitor のデフォルト設定で、`fetch("/api/hello")` は次の経路を通ります（`<base>` の上書きがなく、`baseURL: "https://api.example.com/api/"` の場合）。

| プラットフォーム | 解決後のアプリのリクエスト URL | ローカル Worker が受け取る URL |
| --- | --- | --- |
| iOS | `capacitor://localhost/api/hello` | `https://api.example.com/api/hello` |
| Android | `https://localhost/api/hello` | `https://api.example.com/api/hello` |

アダプターは実行中のアプリの URL を使うため、独自の scheme / hostname 設定も同じ比較で処理します。生成されたリモート境界がなければ、これらはローカルの JavaScript 呼び出しです。どちらも `api.example.com` に HTTP リクエストを送信しません。リモート実行が選ばれたリクエストは、設定した `remote.origin` を使います。

### エンドポイントの例

`baseURL: "https://api.example.com/api/"` で、アプリを `https://localhost/` から配信している場合（`<base>` の上書きなし）:

| `fetch()` に渡す URL | リクエスト先エンドポイント | 処理するもの |
| --- | --- | --- |
| `/api/hello?name=A` | `https://api.example.com/api/hello?name=A` | ローカル Worker |
| `https://api.example.com/api/hello` | `https://api.example.com/api/hello` | ローカル Worker |
| `/api` | `https://api.example.com/api` | ローカル Worker |
| `/apiary` | `https://localhost/apiary` | 元の fetch |
| `/outside.txt` | `https://localhost/outside.txt` | 元の fetch |
| `https://other.example/api/hello` | `https://other.example/api/hello` | 元の fetch |

ローカル実行の場合、エンドポイントは Worker の Fetch Handler が受け取る URL です。そのサーバーに HTTP リクエストを送るわけではありません。

`baseURL` のパスは境界を選ぶものであり、リクエストのパスに**追加されません**。相対パスはまず `document.baseURI`（`<base href>` を含む）を基準に解決し、document がなければ location を使います。境界内の同一アプリの URL（iOS の `capacitor://localhost` を含む）はベースオリジンにマッピングされます。同一アプリのすべての fetch をインターセプトする意図がある場合だけ、ルートの base URL を設定してください。ローカルの 404 / 500 や例外で、ネットワークへの再試行は行いません。Fetch のみのモードでは、この fetch アダプターは UI ナビゲーション、XHR、画像、他の WebView をインターセプトしません。`render` を使う場合は、別の[ネイティブドキュメントブリッジ](native-rendering-api.md)が、対応するドキュメントナビゲーション、フォーム、リソースリクエストを処理します。

## 互換性と制限

### 検証済みの API 動作

- 対象: Hono と Workers Express の GET / POST / HEAD、クエリとルートパラメーター、JSON 本文、ミドルウェア、404 / 500、同時リクエスト、Request 入力、論理 URL。
- 任意の `env` で、呼び出し側の値を fetch ハンドラーの第 2 引数に注入します。分離モードでは呼び出しごとに clone するため、関数 / ネイティブプラグインのオブジェクトは渡せず、オブジェクトの同一性も維持されません。Wrangler のシークレット値やクラウドバインディングオブジェクトはインポートしません。ビルドプラグインはバインディング設定を読み、ローカル / リモート実行を選びます。`cloudflare:workers` の名前付き `env` は部分的なアダプターです。分離トランスポートはディスパッチ前に realm 全体の proxy を更新しますが、direct 実行では値を設定せず、モジュールの初期化も最初のディスパッチ前に行われます。移植可能なアクセスにはハンドラーの `env` 引数を使ってください。proxy はリクエストごとの分離を提供しません。
- `ctx.waitUntil()` はレスポンスを遅延させずに Promise を追跡し、`runtime.drain()` がその完了を待ちます。エラーは任意の `onBackgroundError` に渡します（デフォルトは console）。OS のサスペンド / 終了で保留中の処理が停止する可能性があります。
- Fetch の abort は呼び出し側を reject し、signal を伝播します。任意のアプリケーション処理を強制停止することはできません。ローカル呼び出しでは Cookie、リダイレクト追従、`Response.url` の設定、credentials / cache ポリシー、CORS の強制をエミュレートしません。

不完全な Node モジュール、Workers API、クラウドサービス、ネイティブトランスポートの制約は[互換性と制限](compatibility.md)を参照してください。[アプリケーション統合の制限](compatibility.md#application-integration-limits)には、iOS の Better Auth、passkey、外部ブラウザ OAuth、Void のルーティング、live analytics、シミュレーター検証と実機の境界も記載しています。

### フレームワークとプラットフォームの制限

- Workers の HTTP リクエスト / レスポンスのストリーミングとネイティブ TCP は共通契約で検証しています。ファイル配信、WebSocket、その他の Node モジュール、非同期コンテキストの伝播には、それぞれ互換性対応が必要です。状態は一覧に記録しています。互換性レイヤーは汎用の Node ランタイムではありません。
- `passThroughOnException`、WorkerEntrypoint / RPC、Service Worker 形式は未対応です。Workers 固有の Request フィールドは互換性一覧に明記した範囲だけを対象とします。`Request.cf` はローカルで保持しますが、Cloudflare のネットワークメタデータは設定しません。Worker の評価時に、インストール前の自身のローカルエンドポイントを fetch してはいけません。
- CapacitorHttp の fetch patch は未検証です。この Preview では無効にしてください。パッケージにはネイティブ TCP / TLS トランスポートとドキュメント統合のソース（iOS SPM / Android Gradle）を含みます。通常のブラウザはブラウザの Fetch を使います。ネイティブのドキュメントレンダリングには Capacitor が必要です。

### セキュリティとネットワークの境界

- アプリに含めるすべてのものはユーザーが読めると考えてください。データベースの認証情報、サービストークン、その他のサーバーシークレットを埋め込まないでください。
- リモート実行境界が検出された場合、ビルドは SQL を含むサーバー実装をクライアントバンドルから除外します。これは汎用のシークレットスキャナーではありません。リリース前に生成されたビルドレポートとバンドル済みアセットを確認してください。
- デプロイ済み Worker でリクエストを認証・認可してください。`remote.getToken` は既存の bearer 認証情報を渡せます。ネイティブレンダリングはサーバー管理の Cookie セッションをサポートしますが、ライブラリ自体は認証システムを提供しません。`remote.origin` に URL を設定しても、そのエンドポイントが保護されるわけではありません。
- Worker が生成する HTML は、アプリの Capacitor プラグインへのアクセス権を持って動きます。信頼できるアプリケーションコンテンツだけを描画し、この統合で任意の外部ページを表示しないでください。

クライアント / サーバーの境界と移行時の確認事項は[統合のセキュリティガイド](integration.md)を参照してください。

Worker を direct インポートすると、条件に一致した Worker のサブリクエストが UI ハンドラーに再入する可能性があります。Capacitor の外向き HTTP(S) は、Dedicated Worker から中継する場合も含め、パッケージのネイティブトランスポートを使います。このトランスポートはブラウザの CORS 強制の外でヘッダー、リダイレクト、レスポンスのバイトを処理します。通常のブラウザでは外向きリクエストにブラウザの Fetch を使い、CORS とヘッダーの制約を受けます。どちらの実行モードも workerd isolate ではありません。

### Worker トランスポートとリソースのライフタイム

分離トランスポートは、pull 駆動の MessagePort チャンクでアップロードとレスポンスをストリーミングします（アップロードは 64 KiB 単位に分割）。アップロードハンドラーは EOF 前に実行でき、キャンセル時にアップロード reader を解放します。status / statusText / headers、本文のキャンセル、ヘッダー後の abort、バックグラウンド処理の完了を保持します。無効 / 使用済み / ロック済みのレスポンスと status-0 の opaque / error レスポンスは拒否します。エラーは name / message を保持しますが、同一性や stack は保持しません。独自の abort / cancel reason は Worker に転送しません。未消費のレスポンス本文は、消費、キャンセル、破棄するまでリソースを保持します。`drain()` が追跡するのはバックグラウンド処理であり、本文の消費ではありません。

## 実行環境と非同期コンテキスト

元の Worker ハンドラーが Cloudflare のエントリーのまま残ります。Vite / esbuild プラグインは Capacitor / ブラウザ用ビルドだけに導入してください。その alias がローカル API 実装を選び、Cloudflare ビルドではネイティブの `node:*` と `cloudflare:*` を維持します。`getExecutionEnvironment()`（`workers-capacitor/environment` からも利用可能）は、Cloudflare Workers、ネイティブ Capacitor host、ブラウザ Worker、ブラウザ、未知の realm を区別します。ブラウザの Dedicated Worker は Cloudflare Workers ではありません。Cloudflare Workers 内で Capacitor ランタイムをインストールすると、グローバルを変更する前に失敗します。

Capacitor ビルドはモジュールレベルの `await` を保持しながら async 関数と generator を変換します。これにより AsyncLocalStorage のスコープは直ちに復元され、Promise の継続処理はそれぞれ自身の store を維持します。アプリケーションのハンドラーは変更不要です。このビルドパイプラインの外で（`eval` などにより）作られたネイティブ async コールバックは、ALS スコープのコールバックとして拒否します。Cloudflare は引き続き独自のネイティブ非同期コンテキスト実装を使います。

iOS と Android では、ドキュメントレスポンスを段階的に取得します。ネイティブのドキュメントアップロードは引き続きバッファリング境界を通り、8 MiB を超えると結合前に拒否します。ストリーミングアップロードには Fetch のみのランタイムを使ってください。LocalStorage KV のストリーム読み取りは制限されたチャンクを遅延デコードしますが、ストレージ API 自体はエンコード済みレコード全体を返す必要があります。同期ストレージ / 容量の制限も引き続き適用されます。
