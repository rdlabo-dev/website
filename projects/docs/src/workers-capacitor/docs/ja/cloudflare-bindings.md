---
title: "Capacitor での Cloudflare バインディング"
sourceRevision: "2614065a1973822464f7a50d38788917803364e1b1784ffca10d870697dd2523"
headingAliases: {"remote-services":"%E3%83%AA%E3%83%A2%E3%83%BC%E3%83%88%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9","remote-assets-binding":"%E3%83%AA%E3%83%A2%E3%83%BC%E3%83%88-assets-%E3%83%90%E3%82%A4%E3%83%B3%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0","verification-and-limits":"%E6%A4%9C%E8%A8%BC%E3%81%A8%E5%88%B6%E9%99%90","references":"%E5%8F%82%E8%80%83%E8%B3%87%E6%96%99"}
---
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
  kvExecution: { SETTINGS: "local" },
});
```

`remoteBindings` は、Wrangler に記載されていない通常のシークレットや、他のツールで設定されたバインディングを含む、サーバー専用の名前を追加します。既知のサービスの検出を置き換えるものではありません。同じ名前を `localBindings` にも指定することはできません。既存のリモートサービスと同様に、`workersCapacitor` に `remote.origin` を指定してください。サーバーのシークレットを、クライアントランタイムの `env` やバンドラーの define 経由で注入しないでください。

`binding` を含む未知の設定オブジェクトや、`name` を使うネストした `bindings` エントリー（`unsafe.bindings` など）は、その名前を `remoteBindings` に明示的に指定しない限りビルドエラーになります。これは構造に基づく検出であり、完全な Wrangler スキーマ検証ではありません。将来追加される任意の宣言形式や、ダッシュボードだけで設定したシークレットには引き続き明示的な名前の指定が必要です。`vars` と `define` の値はバインディング宣言として解釈されず、env にもコピーされません。

リモートバインディングを一つでも使うリクエストは、同じハンドラーがローカル設定の KV を読む場合でも、全体をリモートで実行します。リクエスト全体でクラウド側のインスタンスを使います。保守的に Worker 全体をリモートへ切り替えることで、共有状態、追加エクスポート、ミドルウェア、エラー処理を維持します。生成された `workers-capacitor-server.json` レポートを確認してください。

元の HTTP ハンドラー内での Durable Object の HTTP / RPC 呼び出しは、このディスパッチ経路でサポートされています。**このトランスポートは WebSocket / HTTP upgrade に対応しておらず**、明示的に拒否します。WebSocket にはデプロイ済み Worker への別の接続を使ってください。このリリースは WebSocket の自動ルーティングを提供しません。

設定された Cron ハンドラー、Queue consumer、Durable Objects / Workflows の `exports` 宣言がある場合は、HTTP ハンドラーを含む Worker 全体をリモートに維持します。クライアントはスケジュールイベント、alarm、Workflow step、キュー消費をシミュレートしません。検出可能な設定宣言のない Email ハンドラーやその他のサーバーイベントは、その用途だけでは自動検出されません。

## リモート ASSETS バインディング

Wrangler に `assets` セクションがある場合は `assetsExecution: "remote"` が必須です。HTML 処理、SPA / 404 ルーティング、制御ファイル、range / conditional リクエスト、キャッシュのセマンティクスを含むすべてのアセット処理は、デプロイ済み Worker 側に残ります。クライアントはこれらの API を実装しません。

```ts
workersCapacitorPlugin({ worker: "src/worker.ts", assetsExecution: "remote" });
```

asset-first やパターンベースのルーティング（およびバインディング名のない宣言）では、デプロイ先のルーティング順序をクライアントコードが迂回できないよう、すべてのリクエストをリモートにします。`run_worker_first: true` とバインディング名がある場合は、通常の保守的な解析により独立したルートをローカルに維持できます。`env.ASSETS` を使うハンドラーはリモートで実行します。アセットディレクトリの内容が Capacitor に自動コピーされることはありません。

**この変更ではローカル ASSETS を実装もエクスポートもしていません。** 将来のローカル実装は、HTML 処理、制御ファイル、conditional / range の動作、workerd / ネイティブとの同等性を含む、ASSETS の完全な契約を満たす必要があります。`assetsExecution: "local"` は不完全な実装を有効化するのではなく、明示的に失敗します。既存のドキュメントアセット配信は別の機能であり、変更されていません。

## 検証と制限

アプリケーション Worker の基準は Miniflare `5.20261012.0-beta`、compatibility date `2026-10-01` で、アプリケーションの追加互換性フラグは使用しません。検証単位はビルドが生成する HTTP ディスパッチであり、クラウドバインディング API のローカルエミュレーションではありません。

- `npm test`: バインディング検出、ポリシーエラー、未知のバインディングの診断、サーバーコードの除外、リモートルーティングの優先順位、upgrade の拒否を検証します。
- `demo` の `npm run test:cloudflare-bindings`: 実際の workerd の Durable Object HTTP、RPC、ストレージ、状態を変更しない認可拒否、リモート ASSETS、Vite / esbuild の成果物検査、Chromium / WebKit の direct / Worker モード、worker-first / asset-first 両方のルーティング、Vite 開発時の起動を検証します。リクエストはブラウザのルートインターセプトではなく、実際のローカル HTTPS サーバーを使います。条件付き 304 レスポンスは、テストサーバーでブラウザの HTTP キャッシュを無効にして観測します。Range レスポンスは、同じリクエストを workerd へ直接送った結果と比較します。これは転送を検証するもので、クライアント側で Cloudflare のキャッシュ動作を再現するものではありません。
- Cloud AI、インデックス、Workflows は HTTP ディスパッチの名前として検証しており、API のエミュレーションや有料の実サービスのテストではありません。ネイティブトランスポートの契約は既存のリモートサービスと共有しています。

Cache API、HTMLRewriter、ローカル ASSETS は別個の未完了の互換性単位です。パッケージは本番用の alias や export でこれらを有効にしません。

## 参考資料

- [Wrangler 設定](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Assets バインディングとルーティング](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [AI Search バインディング](https://developers.cloudflare.com/workers/runtime-apis/bindings/ai-search/)
- [Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
