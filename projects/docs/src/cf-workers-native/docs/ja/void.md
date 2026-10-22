---
title: "Void React Pages"
---

# Void React Pages

[Void](https://void.cloud/) はフルスタックアプリを Cloudflare Worker とクライアントアセットへビルドします。以下は **Void / @void/react 1.1.12、React Pages、D1** を対象に、同梱クライアントアセットと既存リモート Worker を使います。明示的なルート許可で対応する公開 GET ハンドラーも端末へ配布できます。

## Void アプリをモバイルへ

Void での開発を続けながら、ユーザー向けに iOS・Android 版を追加します。このガイドは Void が生成する Worker とクライアントアセットをモバイルビルドへ接続します。

初めてのモバイルアプリなら [Capacitor 設定](integration.md#2-install-capacitor-and-this-package)から始め、独立したモバイルビルドで以下の Void 設定を使います。既存ネイティブアプリなら [iOS・Android 埋め込みガイド](native-embedding.md)で、同じビルド設定と対象ホストのランタイムエントリーを選びます。

以下の受け入れ検証は Capacitor 連携を対象とします。既存ネイティブアプリへの Void 埋め込みにはアプリ固有フローの確認が必要です。

## ビルドと接続

まず Node **24.21.0 以降**を使い、既存の Void アプリケーションを通常どおりビルドします。`voidPlugin()` と `voidReact()` の設定は変更しないでください。Void は `dist/ssr/index.js`、`dist/ssr/wrangler.json`、`dist/client/` を出力します。

分離した Capacitor の Vite 7 設定で、これらの生成ファイルを使います。Void 自身の Vite 設定とバージョンは変更しないでください。

```ts
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "cf-workers-native/tooling/vite";

export default defineConfig({
  publicDir: "../dist/client",
  plugins: [
    workersCapacitorPlugin({
      worker: "../dist/ssr/index.js",
      workerConfig: "../dist/ssr/wrangler.json",
      assetsExecution: "remote",
    }),
  ],
  build: { outDir: "../www", emptyOutDir: true },
});
```

これらのパスは、Capacitor ビルドのルートが `capacitor/` などのアプリケーションのサブディレクトリであることを前提としています。出力先は Void の `dist/` と分けてください。生成された設定が D1 と ASSETS のバインディングを提供するため、`void.config.ts` の解析やバインディング名の手動の重複定義は不要です。Capacitor ビルドの `workers-capacitor-server.json` レポートで、実行モードが `worker` であることを確認してください。

Capacitor のエントリーは通常の公開 API を使います。

```ts
import { workersCapacitor } from "cf-workers-native/capacitor";

const runtime = workersCapacitor({
  baseURL: "https://worker.invalid/",
  remote: { origin: "https://your-deployed-worker.example" },
  render: "/",
});
await runtime.ready;
```

既存 Worker がページ、loader、action を処理し、D1 もそこに残ります。`publicDir` は生成クライアントアセットをアプリへコピーし、ホストは正確なパスをローカル配信するため、ハイドレーションと操作は同梱 JavaScript・CSS を使います。`assetsExecution: "remote"` は Worker ASSETS バインディングをリモートに保つ設定で、同梱ファイル配信を妨げません。`mode: "worker"` はサーバー実行を表し、アセット配信ではありません。ホストはレスポンスをドキュメントとして表示します。導入、認証、描画は[連携ガイド](integration.md)を参照してください。ネイティブテストも同じ設定です。

## 公開 GET ルートの実行

`execution` に明示的な GET 許可がある場合、ビルドプラグインは正確に Void 1.1.12 の生成出力を認識し、サーバー依存のない静的公開 HTTP ハンドラーと React Pages を分離できます。D1 ルート、変更操作、Cookie・Authorization 付き要求、動的パス、内部パスはリモートです。独自 middleware、layout、head 設定は最適化を無効にします。未知の登録はミドルウェアを落とさず拒否します。

Capacitor プラグインに `execution: [{ method: "GET", path: "/about" }, { method: "GET", path: "/api/hello" }]` などを追加します。`workers-capacitor-server.json` の `mode: "routes"` と各 `remote` で結果を確認します。許可は選択ハンドラーと保持固定データの配布を認めるもので、公開性の証明ではありません。他の要求にはデプロイ済み HTTPS Worker URL を `baseURL` とし、必要なら `remote.origin` で上書きします。

ブラウザー検証は Chromium/WebKit の Vite・esbuild で公開 SSR/API、リモート選択、JavaScript・ソースマップからの DB コード除外を確認します。ライブラリービルド後 `npm --prefix demo run test:void:routes` で再現できます。ネイティブは Vite と iOS 26.1 シミュレーター・Android API 36.1 エミュレーターで、ローカル公開 SSR、ハイドレーション後の React 状態更新、API、認証付きリモート選択、DB アサーション付き D1 フォーム挿入、client-only ページ遷移を確認します。両プラットフォームは順に実行します。

```sh
VOID_ROUTES=1 UPSTREAM_PLATFORM=ios UPSTREAM_DEVICE=<simulator-UUID> node --test demo/tests/void/native.test.mjs
VOID_ROUTES=1 UPSTREAM_PLATFORM=android UPSTREAM_DEVICE=<emulator-serial> node --test demo/tests/void/native.test.mjs
```

これは生成ルート用のプロファイルで、Void ランタイム一般のローカル互換性ではありません。未知の generator・非対応ルーティングはリモート Worker 境界を維持します。

## SSR とクライアント専用ページ

`export const ssr = false` はページコンポーネントのサーバーレンダリング HTML を抑制します。D1 を使う loader を端末で安全に実行できるようにするものでは**ありません**。そのリクエストはリモートに維持してください。Void は Worker で loader データを取得し、ブラウザがコンポーネントを描画します。通常の SSR ページは初期 HTML を受け取り、Void のクライアントアセットでハイドレーションします。どちらの場合も、既存のアプリケーションを SPA に変換したり、フォームを独自の API 呼び出しに置き換えたりする必要はありません。

## 検証の境界

[単独サンプル](../demo/void/README.md)とテストは D1 付きローカル workerd の生成 Worker、Capacitor リモートビルドと fetch 転送、初期 SSR、React ハイドレーション、DB アサーション付きフォーム action を Chromium/WebKit で確認します。client-only ページは同じ D1 loader を使い、初期 HTML にはなくクライアント描画後に表示されます。端末ビルドにサーバースキーマと SQL がないことも確認します。クライアントコンポーネントは意図的に含めます。

ブラウザテストではネットワーク配信をローカル workerd で代替します。ネイティブテスト（`demo/tests/void/native.test.mjs`）は HTTPS と公開ドキュメント API を使い、iOS 26.1 シミュレーターと Android API 36 エミュレーターで、D1 を使う SSR、ハイドレーション、データベースのアサーションを伴うフォーム挿入、クライアント専用レンダリングを検証します。

Capacitor の iOS ナビゲーションには **1.1.12 以降**を使ってください。[Void 1.1.12](https://github.com/voidzero-dev/void/releases/tag/v1.1.12) には、私たちが行った [Capacitor ナビゲーションの upstream 修正](https://github.com/voidzero-dev/void/pull/485)が含まれています。テストは router に patch を当てたり、Capacitor のデフォルトオリジン `capacitor://localhost` を変更したりせず、公開済みの 1.1.12 パッケージを使います。1.1.12 より前のバージョンはこの scheme を拒否します。初期 HTML レスポンスが得られるだけでは、ナビゲーションが動くことを確認できません。

Void 固有の実機検証、デプロイ済み Cloudflare 連携、本番認証、ネイティブプラグインイベント、Vue、Svelte、Solid、他の Void バインディング、Worker 全体のローカル実行は未検証です。

Worker と Capacitor アセットは同じアプリビルドから作ってください。異なる版の独立デプロイはハイドレーションや action を壊す場合があり、古いインストール済みアプリもデプロイ済み Worker と互換性を保つ必要があります。同梱されないパスは Worker へ送ります。

認証、ミドルウェア、レスポンスヘッダー規則を迂回できる公開ファイルだけを同梱します。Capacitor は `_headers`・`_redirects` を適用せず、Vite は Void 生成の `.assetsignore` も尊重しません。そこに `.dev.vars` や `wrangler.json` を記載してもネイティブ同梱から除外されません。コピー前に `dist/client` を確認し、Cloudflare で除外するファイルがあれば必要な公開物だけを別ディレクトリーに準備して `publicDir` に指定します。非公開データ、サーバー出力、`_headers`、`_redirects` は含めないでください。事前描画 HTML は自動的にローカル描画対象にはなりません。初期ページと D1 には接続が必要で、オフライン SSR ではありません。

認証と認可はアプリケーションの責任です。サンプルには認証がないため、本番データのエンドポイントとしてデプロイしてはいけません。サーバーコードの除外は汎用のシークレット検出ではありません。クライアントページ、公開変数、Capacitor 設定に認証情報を埋め込まないでください。
