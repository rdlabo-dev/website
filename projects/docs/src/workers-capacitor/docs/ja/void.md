---
title: "Void React Pages"
sourceRevision: "974c3f831f1e1a7f302fed9a277d899aeae20f7069e4fe5875bcf63bb5b7fd61"
headingAliases: {"build-and-connect":"%E3%83%93%E3%83%AB%E3%83%89%E3%81%A8%E6%8E%A5%E7%B6%9A","ssr-and-client-only-pages":"ssr-%E3%81%A8%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E5%B0%82%E7%94%A8%E3%83%9A%E3%83%BC%E3%82%B8","verification-boundary":"%E6%A4%9C%E8%A8%BC%E3%81%AE%E5%A2%83%E7%95%8C"}
---
[Void](https://void.cloud/) はフルスタックアプリケーションを Cloudflare Worker とクライアントアセットにビルドします。以下の統合は、既存のリモート Worker を使う **Void / @void/react 1.1.12、React Pages、D1** を対象にしています。この構成はリモート Worker 実行を通じて iOS と Android に対応します。ローカルの Void ランタイム互換性は確認されていません。

## ビルドと接続

まず Node **24.21.0 以降**を使い、既存の Void アプリケーションを通常どおりビルドします。`voidPlugin()` と `voidReact()` の設定は変更しないでください。Void は `dist/ssr/index.js`、`dist/ssr/wrangler.json`、`dist/client/` を出力します。

分離した Capacitor の Vite 7 設定で、これらの生成ファイルを使います。Void 自身の Vite 設定とバージョンは変更しないでください。

```ts
workersCapacitorPlugin({
  worker: "../dist/ssr/index.js",
  workerConfig: "../dist/ssr/wrangler.json",
  assetsExecution: "remote",
});
```

これらのパスは、Capacitor ビルドのルートが `capacitor/` などのアプリケーションのサブディレクトリであることを前提としています。出力先は Void の `dist/` と分けてください。生成された設定が D1 と ASSETS のバインディングを提供するため、`void.config.ts` の解析やバインディング名の手動の重複定義は不要です。Capacitor ビルドの `workers-capacitor-server.json` レポートで、実行モードが `worker` であることを確認してください。

Capacitor のエントリーは通常の公開 API を使います。

```ts
import { workersCapacitor } from "workers-capacitor";

const runtime = workersCapacitor({
  baseURL: "https://worker.invalid/",
  remote: { origin: "https://your-deployed-worker.example" },
  render: "/",
});
await runtime.ready;
```

既存の Worker がページリクエスト、loader、action、アセットをリモートで処理します。D1 へのアクセスもそこで行います。ライブラリの document host はレスポンスをドキュメントとして表示します。Capacitor のインストール、認証、ドキュメントレンダリングは[統合ガイド](integration.md)を参照してください。ネイティブテストもこの構成を使います。

## SSR とクライアント専用ページ

`export const ssr = false` はページコンポーネントのサーバーレンダリング HTML を抑制します。D1 を使う loader を端末で安全に実行できるようにするものでは**ありません**。そのリクエストはリモートに維持してください。Void は Worker で loader データを取得し、ブラウザがコンポーネントを描画します。通常の SSR ページは初期 HTML を受け取り、Void のクライアントアセットでハイドレーションします。どちらの場合も、既存のアプリケーションを SPA に変換したり、フォームを独自の API 呼び出しに置き換えたりする必要はありません。

## 検証の境界

[独立したサンプル](../demo/void/README.md)とそのテストは、D1 を持つローカル workerd 内の生成済み Worker、Capacitor のリモートビルドと fetch トランスポート、初期 SSR HTML、React ハイドレーション、データベースのアサーションを伴うフォーム action を Chromium と WebKit で検証します。クライアント専用ページは同じ D1 loader を再利用し、初期 HTML には含まれませんがクライアント描画後に表示されます。端末ビルドにサーバーのスキーマ / アプリケーションコードが含まれないことも確認します。

ブラウザテストではネットワーク配信をローカル workerd で代替します。ネイティブテスト（`demo/tests/void/native.test.mjs`）は HTTPS と公開ドキュメント API を使い、iOS 26.1 シミュレーターと Android API 36 エミュレーターで、D1 を使う SSR、ハイドレーション、データベースのアサーションを伴うフォーム挿入、クライアント専用レンダリングを検証します。

Capacitor の iOS ナビゲーションには **1.1.12 以降**を使ってください。[Void 1.1.12](https://github.com/voidzero-dev/void/releases/tag/v1.1.12) には、私たちが行った [Capacitor ナビゲーションの upstream 修正](https://github.com/voidzero-dev/void/pull/485)が含まれています。テストは router に patch を当てたり、Capacitor のデフォルトオリジン `capacitor://localhost` を変更したりせず、公開済みの 1.1.12 パッケージを使います。1.1.12 より前のバージョンはこの scheme を拒否します。初期 HTML レスポンスが得られるだけでは、ナビゲーションが動くことを確認できません。

Void 固有の実機受け入れ検証、デプロイ済み Cloudflare との統合、本番認証、ネイティブプラグインイベント、Vue、Svelte、Solid、その他の Void バインディング、ローカル実行は未検証です。

認証と認可はアプリケーションの責任です。サンプルには認証がないため、本番データのエンドポイントとしてデプロイしてはいけません。サーバーコードの除外は汎用のシークレット検出ではありません。クライアントページ、公開変数、Capacitor 設定に認証情報を埋め込まないでください。
