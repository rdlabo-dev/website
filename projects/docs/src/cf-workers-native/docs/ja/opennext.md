---
title: "OpenNext と vinext のサポート"
---

# OpenNext と vinext のサポート

OpenNext と vinext は Workers の互換性プロファイルを使います。サポートはリクエストを実行する場所によって異なり、リモートレンダリングの成功はフレームワークのローカル互換性を保証しません。[独立した OpenNext サンプル](../demo/opennext/README.md)はこれらの経路を分離し、テストドライバーをアプリケーションの外に置いています。

標準サンプルは Next.js 16.4.2 を使います。ルート分離は OpenNext 1.20.12 と正確に Next.js 15.5.28 の互換プロファイルも維持します。Next.js 15 の上流保守期間を延長するものではありません。旧版は `next build` と `opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion` を使い、ルート分離も 15.5.28 だけに同じサポート期間例外を適用します。16.4.2 は `next build --webpack` で、サポート検査は有効です。Node middleware/proxy と未知のビルド形式は全体がリモートに残ります。

## 実行と設定

### ルートの実行

`next build --webpack` で作った OpenNext 1.20.12 / Next.js 16.4.2 App Router 出力では、Vite・esbuild が明示選択した静的 GET ルートを分離できます。通常の生成 Worker を `worker` に指定し、追加の準備スクリプトやラッパーは不要です。

```ts
workersCapacitorPlugin({
  worker: "../.open-next/worker.js",
  assetsExecution: "remote",
  execution: [
    { method: "GET", path: "/" },
    { method: "GET", path: "/api/message" },
  ],
});
```

既存の `.next` と `.open-next` から別のローカルエントリーを生成し、`next build` の実行やデプロイ済み Worker の上書きはしません。許可は登録パスに適用し、wildcard・RegExp は Hono と同じ規則です。対応する静的ルートの実要求照合は完全一致のままです。

ミドルウェアに一致するルート、動的・グループ化ルート、未選択パス、GET 以外、認証情報付き要求、Next プロトコル要求はリモートです。この分離経路は RSC 遷移、Server Actions、ローカルミドルウェア実行に対応しません。リモートに残る登録はレポートに記載します。選択出力が Cloudflare 環境を必要とすれば選択全体をリモートに維持します。

標準の `defineCloudflareConfig` で `incrementalCache`、`tagCache`、`queue` を `"dummy"` に設定した構成に対応します。他の版、独自 OpenNext 設定、Next の rewrites/headers/独自 redirects/base paths、非公開の生成環境データはリモートに残ります。元の Worker をデプロイしたまま通常どおり `remote.origin` を設定します。生成ランタイムファイルは Worker エントリーの隣に維持してください。

ルート許可は実装と保持依存関係を含みます。秘密検出ではないため、配布許可前に共有コードと固定データを確認します。プラグインは既知の Next 生成 preview/action 鍵をローカル出力から分離しますが、任意のアプリ認証情報を除去しません。明示的な `workerFiles` とコピーする公開アセットはアプリの責務です。

[ルート実行フィクスチャ](../demo/tests/opennext/split/README.md)は Vite/esbuild と Chromium/WebKit を対象にします。ネイティブ分離は iOS 26.1・Android API 36.1 でハイドレーション、リモートへの RSC 遷移、プラグインイベント、HttpOnly セッション、D1 フォーム更新、CSRF 拒否、期限切れ、再起動後保持、ログアウトを確認します。公開 HTTPS ルートも専用 Worker・D1 を使う iOS 27.0.1 の iPhone 15 Pro Max で通過しています。期限切れはローカル workerd で確認します。ネイティブランナーに `OPENNEXT_SPLIT=1` を指定します。[リリース差異フィクスチャ](../demo/tests/opennext/releases/README.md)は別々のクライアント・Worker で互換 HTTP・フォームの展開を検証しますが、保持された Server Action クロージャーや破壊的 API・スキーマ変更の互換性は保証しません。

### Worker 全体の実行

- D1 と asset-first ルーティングでは、同梱アセット以外の要求を生成 OpenNext Worker 全体でリモート実行します。`worker: ".open-next/worker.js"`、`assetsExecution: "remote"`、デプロイ済み HTTPS の `remote.origin` を設定します。サーバーアプリは端末バンドルから除外します。`workerFiles` は未指定にしてください。明示選択ファイルは配布されますが、この用途では不要です。
- ローカル実行は Dedicated Worker で生成 Worker を使います。サンプルのテスト専用プロファイルは公開 SSR、ハイドレーション、静的画像・CSS、Next.js リンク、ミドルウェアを検証し、D1・ローカル ASSETS は提供しません。実行の実証で、配布可能な AppShell ではありません。生成サーバー JavaScript はサーバー専用コードや Next 生成鍵を含み得ます。ファイルシステムメタデータの削除だけでは配布して安全になりません。
- Vite プラグインは生成 ESM の `.mjs` 内の組み込み `require()` を変換します。Capacitor ビルドの設定で、Cloudflare ビルドは独立のままです。

### リモートページとともにクライアントアセットを同梱する

Capacitor の Vite で `publicDir` を既存の OpenNext アセット出力に設定します。サンプルは設定ファイル基準の絶対パスです。

```ts
export default defineConfig({
  root: here("."),
  publicDir: here("../.open-next/assets"),
  plugins: [
    workersCapacitorPlugin({
      worker: here("../.open-next/worker.js"),
      assetsExecution: "remote",
    }),
  ],
  build: { outDir: here("../www"), emptyOutDir: true },
});
```

import と `here` は[完全な設定](../demo/opennext/capacitor/vite.config.ts)を参照してください。同梱した `/_next/static/` の JavaScript、CSS、公開画像は Capacitor が配信します。HTML、RSC 遷移、ミドルウェア、セッション、D1、`/_next/image` は Worker に残ります。ハイドレーションとクライアントイベントは同梱スクリプトで WebView 内を実行します。レポートの `mode: "worker"` はサーバーハンドラーを表し、全アセットがリモートという意味ではありません。

デプロイする Worker と同梱アセットは同じアプリビルドから作り、更新時も古いインストール済みアプリとの互換性を維持します。不在のアセットパスは Worker へ戻します。認証・レスポンスヘッダー処理を迂回できる公開アセットだけをコピーしてください。Capacitor は同梱ファイルに Cloudflare の `_headers`・`_redirects` を適用せず、Vite の `publicDir` も通常の esbuild コピーも `.assetsignore` を尊重しません。除外ファイルが混じる場合は必要な公開物だけを別ディレクトリーに準備します。server-functions や prerender キャッシュは `publicDir` にコピーしないでください。事前描画ページにもミドルウェア、リダイレクト、再検証が必要な場合があるため、prerender だけでローカル選択はしません。初期ページ要求には接続が必要です。

esbuild は `workersCapacitorPlugin` 付き `build()` の呼び出し**前**に公開アセットを Capacitor 出力へコピーします。プラグインは既存ファイルをドキュメントアセットマニフェストに含めます。起動用 `index.html` をフレームワークのページと分離し、パス衝突を避けてください。追加のアセット API は不要です。

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

## 明示的なランタイムファイル（`workerFiles`）

サーバービルドディレクトリーは端末のファイルシステムへコピーしません。`.json` 拡張子だけでは公開と判断できません。Next.js マニフェストはサーバー生成鍵・設定を含む場合があります。検証済みローカルレンダラーはこれらをコードと一緒にコピーする必要はありません。

`node:fs` で読む公開アプリデータは、ディレクトリーでなく個別パスの `workerFiles` で選べます。そのまま配布するため、全ユーザー向けのデータだけを指定します。

```ts
workersCapacitorPlugin({
  worker: "./src/worker.ts",
  execution: "local", // すべての端末への配布を許可したコードと依存関係だけに使用します。
  // このローカル Worker が読む公開データ:
  workerFiles: ["./templates/email.txt"],
});
```

VFS の検索は区切り文字を正規化し、suffix で照合するため、トレースされた絶対パスはバンドルのビルド時ディレクトリに関係なく解決できます。

## 非同期コンテキスト（実際の境界）

- Capacitor の Vite / esbuild プラグインは、top-level `await` を維持しながら async 関数と generator を Promise の継続処理へ変換します。互換実装はコールバック登録時にコンテキストを取得し、同期スコープごとに復元します。同時またはネストした非同期スコープは別々の store を使います。共有 ALS 契約のためにディスパッチを直列化する必要はなくなりました。
- `run` / `exit` に渡された未変換のネイティブ async コールバックは、別のリクエストの store を黙って漏らすことなく、実行前に拒否します。動的コードや外部でビルドしたモジュールにも、同じ変換が必要です。
- 変換と alias は Capacitor ビルドだけに適用します。Cloudflare はネイティブの `node:async_hooks` を維持し、Worker アプリケーションのソースは変更しません。
- direct モードの patch は UI の realm にも影響します。ALS に依存するアプリケーションは分離された Worker を優先してください。OpenNext の完全なネイティブ受け入れ検証は、共有 ALS 契約とは別です。

## upstream アプリケーションの受け入れ検証

[公式 App Router の受け入れフィクスチャ](../demo/tests/upstream/opennext/README.md)は upstream の OpenNext アプリケーションを固定し、アプリケーションのソースと設定を維持します。ハイドレーション済み Server Actions、リダイレクト / クエリパラメーター付きフォーム action、Suspense の loading fallback を使う遅延 SSR を検証します。ネイティブテストは公開 API を通じたリモート Worker 実行と WebView のハイドレーションを検証し、ローカル Server Action のサポートを保証するものではありません。ブラウザの基準テストは CI で別途実行します。再現コマンドと proxy / streaming テストの境界はフィクスチャを参照してください。

## 現在の未対応事項

- サンプルのネイティブ検証は公開ページとリモート D1・セッションのフローが対象で、任意の Next.js アプリや Release 性能ではありません。
- **バインディング:** クラウドサービスや direct モードの明示的なローカル KV は[リモートバインディング設定](cloudflare-bindings.md)を使います。ASSETS はリモート専用です。汎用連携は OpenNext キャッシュ・バインディング互換性の保証ではなく、smoke 設定は dummy キャッシュを使います。
- `createRequire` が読むのは `.json` のみです。実行可能な追跡ファイルは OpenNext で同梱済みである必要があります（実際に同梱されています）。
- `/_next/image` はリモート Worker の IMAGES を使います。`/images` は実 PNG→WebP 変換と寸法をネイティブ描画で確認します。公開 HTTPS は iOS 27.0.1 の iPhone 15 Pro Max でテスト CA なしにデプロイ済み IMAGES も検証します。独自 `cdn-cgi` loader は未検証です。
- ホストは観測した Origin/Fetch Metadata を維持します。iOS は検証済みローカル main-frame の要求元だけで欠落したフォーム Origin を復元し、opaque・未知の要求元は信頼しません。CSRF 検証を維持します。サンプルは乱数トークンと Secure・HttpOnly の `__Host-` Cookie を使います。
- ネイティブ受け入れは機能動作の確認です。以前の単発 Debug 時間、バンドルサイズ、ホスト RSS は探索的測定で回帰予算ではなく、現在の機能ハーネスは収集しません。Release 起動時間の分布とピークメモリーは未検証です。
