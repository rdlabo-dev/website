---
title: "OpenNext と vinext のサポート"
sourceRevision: "f815343802c28850c0a4ea7420f4812a61fcc436813858b454f575229db30bc7"
headingAliases: {"execution-and-configuration":"%E5%AE%9F%E8%A1%8C%E3%81%A8%E8%A8%AD%E5%AE%9A","what-the-runtime-provides":"%E3%83%A9%E3%83%B3%E3%82%BF%E3%82%A4%E3%83%A0%E3%81%8C%E6%8F%90%E4%BE%9B%E3%81%99%E3%82%8B%E3%82%82%E3%81%AE","embedding-traced-files-(workerfiles)":"%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B9%E3%81%95%E3%82%8C%E3%81%9F%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E5%9F%8B%E3%82%81%E8%BE%BC%E3%81%BF%EF%BC%88workerfiles%EF%BC%89","async-context-(the-real-boundary)":"%E9%9D%9E%E5%90%8C%E6%9C%9F%E3%82%B3%E3%83%B3%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%EF%BC%88%E5%AE%9F%E9%9A%9B%E3%81%AE%E5%A2%83%E7%95%8C%EF%BC%89","upstream-application-acceptance":"upstream-%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E5%8F%97%E3%81%91%E5%85%A5%E3%82%8C%E6%A4%9C%E8%A8%BC","current-gaps":"%E7%8F%BE%E5%9C%A8%E3%81%AE%E6%9C%AA%E5%AF%BE%E5%BF%9C%E4%BA%8B%E9%A0%85"}
---
OpenNext と vinext は Workers の互換性プロファイルを使います。サポートはリクエストを実行する場所によって異なり、リモートレンダリングの成功はフレームワークのローカル互換性を保証しません。[独立した OpenNext サンプル](../demo/opennext/README.md)はこれらの経路を分離し、テストドライバーをアプリケーションの外に置いています。

## 実行と設定

- D1 と asset-first ルーティングを使う場合、生成された OpenNext Worker 全体をリモートで実行します。`worker: ".open-next/worker.js"`、`assetsExecution: "remote"`、デプロイ先 HTTPS の `remote.origin` を設定してください。サーバーアプリケーションや仮想ファイルシステムのファイルは端末に配布しません。この構成で `workerFiles` は不要です。
- ローカル実行は生成された Worker を Dedicated Worker 内で使用します。サンプルのテスト専用プロファイルは、公開 SSR ページ、クライアントハイドレーション、静的画像 / CSS、Next.js のリンク、ミドルウェアを検証します。D1 やローカル ASSETS は提供しません。
- Vite プラグインは、生成された ESM `.mjs` ファイル内の組み込み `require()` 呼び出しを変換します。これは Capacitor のビルド設定であり、Cloudflare ビルドは独立したままです。

残っているランタイムの制約は [Node 一覧](compatibility.md)を参照してください。

## ランタイムが提供するもの

| 対象 | 実装 |
| --- | --- |
| `cloudflare:workers` `env` | 分離トランスポートは `worker.fetch` 前に realm 全体の proxy を設定します。direct ディスパッチは設定しません。リクエスト単位ではなく、最初のモジュール評価中には利用できません。可能な場合はハンドラーの引数を使ってください。 |
| `cloudflare:workers` `DurableObject` | OpenNext がエクスポートする DO サブクラス（queue、tag cache、cache purge）を解決・構築するための基底クラスです。DO ストレージはありません。これらを除外するには、`open-next.config` に `incrementalCache: "dummy"`、`tagCache: "dummy"`、`queue: "dummy"` を設定します。 |
| `node:async_hooks` | スコープ付き ALS の近似実装です（下記「非同期コンテキスト」を参照）。 |
| `node:fs` / `node:fs/promises` | 読み取り専用のインメモリ仮想ファイルシステムです。`readFile(Sync)`、`readdir(Sync)`、`existsSync`、`stat(Sync)`、`lstat(Sync)`、`realpathSync`、`promises.{readFile,readdir,stat,lstat,realpath,access}` に対応します。書き込みは例外を投げます。 |
| `node:module` | `builtinModules`、`isBuiltin`、`createRequire`（VFS の `.json` のみ。実行可能なモジュールは例外を投げます）。 |
| `node:stream/web` | 独自の stream アダプターで、host にバイトストリームがない場合の fallback をパッケージに含みます。Workers の stream と完全に同等かは未検証です。 |
| `node:util` | モジュール独自の util 実装と共有契約です。残る export / engine の差は一覧に記載しています。 |
| その他の `node:*` | モジュール独自の実装と依存ライブラリによる fallback です。現在の alias 表は `src/tooling/shared.ts` にあります。インポート可能であることはモジュール全体の受け入れを意味しません。Node 一覧を参照してください。 |

## トレースされたファイルの埋め込み（`workerFiles`）

ローカルの生成済み OpenNext `worker.js` エントリーでは、両方のバンドラープラグインが `.next` の JSON manifest と、トレースされた `package.json` ファイルを自動収集します。生成された JavaScript、source map、NFT trace、ビルド解析出力は、ファイルシステムのデータとして埋め込みません。リモート Worker の置換ではサーバーファイルを収集しません。

`node:fs` で読む追加のアプリケーションデータは、ディレクトリではなく個別のパスとして `workerFiles` に指定してください。

```ts
workersCapacitorPlugin({
  worker: ".open-next/worker.js",
  // アプリケーションが追加のデータファイルを読み込む場合だけ必要です:
  workerFiles: ["./templates/email.txt"],
});
```

ネイティブのローカルテストは、テストドライバーを取り付けるために生成エントリーをラップするので、その[設定](../demo/tests/opennext/local/vite.config.ts)で同じメタデータを明示的に指定しています。自動検出の対象は生成された OpenNext エントリーであり、任意の wrapper モジュールやサードパーティの実行時データではありません。

VFS の検索は区切り文字を正規化し、suffix で照合するため、トレースされた絶対パスはバンドルのビルド時ディレクトリに関係なく解決できます。

## 非同期コンテキスト（実際の境界）

- Capacitor の Vite / esbuild プラグインは、top-level `await` を維持しながら async 関数と generator を Promise の継続処理へ変換します。互換実装はコールバック登録時にコンテキストを取得し、同期スコープごとに復元します。同時またはネストした非同期スコープは別々の store を使います。共有 ALS 契約のためにディスパッチを直列化する必要はなくなりました。
- `run` / `exit` に渡された未変換のネイティブ async コールバックは、別のリクエストの store を黙って漏らすことなく、実行前に拒否します。動的コードや外部でビルドしたモジュールにも、同じ変換が必要です。
- 変換と alias は Capacitor ビルドだけに適用します。Cloudflare はネイティブの `node:async_hooks` を維持し、Worker アプリケーションのソースは変更しません。
- direct モードの patch は UI の realm にも影響します。ALS に依存するアプリケーションは分離された Worker を優先してください。OpenNext の完全なネイティブ受け入れ検証は、共有 ALS 契約とは別です。

## upstream アプリケーションの受け入れ検証

[公式 App Router の受け入れフィクスチャ](../demo/tests/upstream/opennext/README.md)は upstream の OpenNext アプリケーションを固定し、アプリケーションのソースと設定を維持します。ハイドレーション済み Server Actions、リダイレクト / クエリパラメーター付きフォーム action、Suspense の loading fallback を使う遅延 SSR を検証します。ネイティブテストは公開 API を通じたリモート Worker 実行と WebView のハイドレーションを検証し、ローカル Server Action のサポートを保証するものではありません。ブラウザの基準テストは CI で別途実行します。再現コマンドと proxy / streaming テストの境界はフィクスチャを参照してください。

## 現在の未対応事項

- サンプルのネイティブシナリオは公開ページとリモートの D1 / セッションフローを対象とし、任意の Next.js アプリケーションや release ビルドの性能は対象外です。
- **バインディング:** クラウドサービスには[リモートバインディング設定](cloudflare-bindings.md)を使うか、direct モードで明示的なローカル KV を使ってください。ASSETS はリモートのみです。これらの一般的な統合は OpenNext の cache / binding 互換性を保証しません。smoke 設定は dummy cache を使います。
- `createRequire` は `.json` のみ読み込みます。トレースされた実行可能ファイルは事前に OpenNext がバンドルする必要があります（実際にバンドルされています）。
- `/_next/image` はリモート Worker の IMAGES バインディングを使います。`/images` フィクスチャはネイティブレンダリングを通じて、実際の PNG から WebP への変換と出力寸法を確認します。公開 HTTPS のシナリオは、iOS 27.0.1 の iPhone 15 Pro Max で、テスト CA をインストールせずにデプロイ済み Cloudflare IMAGES バインディングも検証します。独自の `cdn-cgi` loader は未検証です。
- document host は観測された Origin / Fetch Metadata を保持します。iOS でフォームの Origin が欠落している場合、検証済みのローカル main-frame initiator に限って復元します。opaque または不明な initiator は信頼しないままです。CSRF 検証を維持してください。サンプルはランダムトークンと Secure、HttpOnly の `__Host-` Cookie を使用します。
- OpenNext のネイティブ harness は、バンドルサイズ、起動からハイドレーションまでの時間（トランスポートと起動ツールを含む）、取得可能な場合はハイドレーション後の host プロセス RSS を `demo/artifacts/opennext-native/*-performance.json` に記録します。これらは Debug の単一サンプル測定で、成果物に実行環境を記載します。実機 iOS の RSS は収集せず `null` として報告します。RSS には別プロセスの WebView renderer / GPU を含めず、アプリケーション全体やピークのメモリ使用量ではありません。Pixel 8a / Android 17 のサンプルはローカルとリモートの実行を対象にし、iPhone 15 Pro Max のサンプルは公開 HTTPS 上のデプロイ済み Worker と D1 を使います。release ビルドの起動時間分布とピークメモリは未検証です。
