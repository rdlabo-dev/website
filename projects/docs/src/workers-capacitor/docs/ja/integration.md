---
title: "既存の Workers アプリケーションを Capacitor と統合する"
sourceRevision: "7a6366b906960848bc8dab302e7541d0c0b0826af7561572c9b64b41ece31dec"
headingAliases: {"how-existing-worker-pages-reach-the-screen":"%E6%97%A2%E5%AD%98%E3%81%AE-worker-%E3%83%9A%E3%83%BC%E3%82%B8%E3%81%8C%E7%94%BB%E9%9D%A2%E3%81%AB%E5%B1%8A%E3%81%8F%E4%BB%95%E7%B5%84%E3%81%BF","prompt-to-give-your-ai-assistant":"ai-%E3%82%A2%E3%82%B7%E3%82%B9%E3%82%BF%E3%83%B3%E3%83%88%E3%81%AB%E6%B8%A1%E3%81%99%E3%83%97%E3%83%AD%E3%83%B3%E3%83%97%E3%83%88","workflow":"%E4%BD%9C%E6%A5%AD%E6%89%8B%E9%A0%86","1.-inspect-the-application-and-choose-the-integration":"1.-%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%92%E8%AA%BF%E6%9F%BB%E3%81%97%E3%81%A6%E7%B5%B1%E5%90%88%E6%96%B9%E6%B3%95%E3%82%92%E9%81%B8%E3%81%B6","2.-install-capacitor-and-this-package":"2.-capacitor-%E3%81%A8%E3%81%93%E3%81%AE%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E3%82%92%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E3%81%99%E3%82%8B","3.-configure-and-build-the-native-application":"3.-%E3%83%8D%E3%82%A4%E3%83%86%E3%82%A3%E3%83%96%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%92%E8%A8%AD%E5%AE%9A%E3%81%97%E3%81%A6%E3%83%93%E3%83%AB%E3%83%89%E3%81%99%E3%82%8B","4.-preserve-behavior-and-fix-only-actual-incompatibilities":"4.-%E5%8B%95%E4%BD%9C%E3%82%92%E7%B6%AD%E6%8C%81%E3%81%97%E3%80%81%E5%AE%9F%E9%9A%9B%E3%81%AE%E9%9D%9E%E4%BA%92%E6%8F%9B%E6%80%A7%E3%81%A0%E3%81%91%E3%82%92%E4%BF%AE%E6%AD%A3%E3%81%99%E3%82%8B","next.js%3A-distinguish-rendering-from-data-execution":"next.js%3A-%E3%83%AC%E3%83%B3%E3%83%80%E3%83%AA%E3%83%B3%E3%82%B0%E3%81%A8%E3%83%87%E3%83%BC%E3%82%BF%E5%AE%9F%E8%A1%8C%E3%82%92%E5%8C%BA%E5%88%A5%E3%81%99%E3%82%8B","when-configuration-is-insufficient":"%E8%A8%AD%E5%AE%9A%E3%81%A0%E3%81%91%E3%81%A7%E3%81%AF%E8%A7%A3%E6%B1%BA%E3%81%97%E3%81%AA%E3%81%84%E5%A0%B4%E5%90%88","optional-later-optimization%3A-local-initial-rendering":"%E7%B5%B1%E5%90%88%E5%BE%8C%E3%81%AE%E4%BB%BB%E6%84%8F%E3%81%AE%E6%9C%80%E9%81%A9%E5%8C%96%3A-%E3%83%AD%E3%83%BC%E3%82%AB%E3%83%AB%E3%81%A7%E3%81%AE%E5%88%9D%E6%9C%9F%E6%8F%8F%E7%94%BB","5.-security%3A-the-device-is-not-a-trusted-server":"5.-%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%3A-%E7%AB%AF%E6%9C%AB%E3%81%AF%E4%BF%A1%E9%A0%BC%E3%81%A7%E3%81%8D%E3%82%8B%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%81%A7%E3%81%AF%E3%81%AA%E3%81%84","what-the-build-removes":"%E3%83%93%E3%83%AB%E3%83%89%E3%81%8C%E9%99%A4%E5%A4%96%E3%81%99%E3%82%8B%E3%82%82%E3%81%AE","authenticate-and-authorize-remote-operations":"%E3%83%AA%E3%83%A2%E3%83%BC%E3%83%88%E6%93%8D%E4%BD%9C%E3%82%92%E8%AA%8D%E8%A8%BC%E3%83%BB%E8%AA%8D%E5%8F%AF%E3%81%99%E3%82%8B","anonymous-users-when-no-login-ui-is-needed":"%E3%83%AD%E3%82%B0%E3%82%A4%E3%83%B3-ui-%E3%81%8C%E4%B8%8D%E8%A6%81%E3%81%AA%E5%A0%B4%E5%90%88%E3%81%AE%E5%8C%BF%E5%90%8D%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC","treat-packaged-code-and-data-as-extractable":"%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E5%86%85%E3%81%AE%E3%82%B3%E3%83%BC%E3%83%89%E3%81%A8%E3%83%87%E3%83%BC%E3%82%BF%E3%81%AF%E5%8F%96%E3%82%8A%E5%87%BA%E3%81%9B%E3%82%8B%E3%82%82%E3%81%AE%E3%81%A8%E3%81%97%E3%81%A6%E6%89%B1%E3%81%86","6.-verify-the-existing-application-in-capacitor":"6.-capacitor-%E3%81%A7%E6%97%A2%E5%AD%98%E3%81%AE%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%92%E6%A4%9C%E8%A8%BC%E3%81%99%E3%82%8B","2-install-capacitor-and-this-package":"2.-capacitor-%E3%81%A8%E3%81%93%E3%81%AE%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E3%82%92%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E3%81%99%E3%82%8B","3-configure-and-build-the-native-application":"3.-%E3%83%8D%E3%82%A4%E3%83%86%E3%82%A3%E3%83%96%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%92%E8%A8%AD%E5%AE%9A%E3%81%97%E3%81%A6%E3%83%93%E3%83%AB%E3%83%89%E3%81%99%E3%82%8B","5-security-the-device-is-not-a-trusted-server":"5.-%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%3A-%E7%AB%AF%E6%9C%AB%E3%81%AF%E4%BF%A1%E9%A0%BC%E3%81%A7%E3%81%8D%E3%82%8B%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%81%A7%E3%81%AF%E3%81%AA%E3%81%84"}
---
アプリケーションのリポジトリにアクセスできる AI コーディングアシスタントに、このガイドを渡してください。目的は、アプリケーションコードの変更を最小限に抑え、既存の Workers アプリケーションを Capacitor で動かすことです。まず Capacitor を追加して既存の Worker エントリーを接続し、クラウドビルド、レンダリング、ルート、業務ロジック、認証を維持します。

最も重要な成功基準は、最小限の統合作業でネイティブアプリケーションが動くことです。新しいアーキテクチャを作ることではありません。アプリケーションが通常の HTML ドキュメント、リンク、フォームを使っている場合はそれらを維持してください。SPA への変換、新しいクライアント router、App Shell の再設計、SSR / API の分離、ハイドレーションの追加は前提条件ではありません。

## 既存の Worker ページが画面に届く仕組み

`render` を使うと、ライブラリは Worker のレスポンスを WebView のドキュメントリクエストへのレスポンスとして渡します。WebView はその HTML をページとして描画し、script を実行してリソースを読み込みます。アプリケーション側で既存の DOM に HTML を挿入したり、iframe に表示したりする必要はありません。

```text
WebView opens /notes at the app's local origin
  → the library receives the document request
  → generated dispatch selects local or remote execution
      local:  the existing Fetch handler runs on the device
      remote: the request goes to the existing deployed Worker
  → response status, headers and HTML body return through the document bridge
  → WebView renders the page
```

両方の実行経路が同じドキュメントレスポンスの仕組みを使います。D1 を使うページは認証、クエリ、SSR をリモート Worker に維持でき、互換性のある独立したページはローカルで描画できます。安全に分離できない場合、ビルドは Worker 全体をリモート実行に選ぶことがあります。これはリクエストのディスパッチであり、D1 の個々の操作をランタイム間で移動するものではありません。

通常のリンクをたどると、同じ仕組みで次のドキュメントリクエストが発生します。対応するフォーム送信と同一オリジンのリダイレクトも、ドキュメントナビゲーションを維持します。既存のクライアントスクリプトは、フレームワークが使用する対話機能やハイドレーションを提供できます。バンドル済みアセットは Worker router を迂回し、その他のリクエストは設定されたルーティングに従います。再設計を考える前に、アプリケーションの既存のページモデルを維持してください。

iOS のブリッジは `WKURLSchemeHandler`、Android は Service Worker を使います。表示ページはアプリローカルの URL（通常 iOS は `capacitor://localhost`、Android は `https://localhost`）を維持し、Worker は論理的な HTTP(S) URL を受け取ります。これはネイティブドキュメントレンダリングであり、リモートのブラウザタブやローカル HTTP サーバーではありません。フォーム、リダイレクト、アセット、ライフサイクルの制限は[ネイティブレンダリングガイド](native-rendering-api.md)を参照してください。ブラウザやフレームワークのあらゆる機能を保証するものではありません。

## AI アシスタントに渡すプロンプト

```text
Follow https://github.com/rdlabo-dev/workers-capacitor/blob/v0.1.0/docs/integration.md
to bring this app to iOS and Android with workers-capacitor.
Preserve its pages, routes and authentication; verify it on the target platforms.
```

対象プラットフォーム、app ID / アプリ名、利用できる場合は既存のテスト Worker のオリジンを伝えてください。アシスタントはリポジトリからエントリー、フレームワーク、script を推測し、推測できないプロダクト上の選択やアクセス権だけを質問します。

## 作業手順

以下のセキュリティと検証の手順に従ってください。クラウドへのデプロイとアプリの公開には、ユーザーの明示的な承認が必要です。

1. アプリケーションを調査し、ネイティブ HTML レンダリングか Fetch のみの統合を選びます。
2. アプリケーションに Capacitor とこのパッケージをインストールします。
3. ネイティブビルドを設定し、既存の Worker を接続します。
4. 動作が変わっていないことを検証し、実証された非互換性だけを修正します。
5. セキュリティを確認し、実際のアプリケーションフローを検証します。

## 1. アプリケーションを調査して統合方法を選ぶ

[フレームワーク統合一覧](build-setup.md#frameworks)から始めてください。Workers 上の Angular SSR はまだ未検証です。ビルドツールへの対応だけではフレームワークのサポートを保証しません。Void は生成エントリーのガイドとバージョン要件に従ってください。

Worker エントリー、ビルド script、Wrangler 設定、ページルート、ミドルウェア、認証コードを読んでください。次の判断は恒久的な進捗文書を追加するのではなく、実装計画に記録します。

- HTML、JSON、静的アセットを生成するルートはどれか。
- 描画前に D1、他のバインディング、シークレット、セッションを必要とするページはどれか。
- ローカル実行できる依存関係と、既存のデプロイ済み Worker が必要な依存関係は何か。
- API 呼び出しを何が認証し、どこで所有権 / 認可を強制するか。
- ナビゲーションで追加のサーバーレンダリング済みコンテンツを要求するか。最初のページだけでなく、ネストした layout、リダイレクト、フレームワークのデータリクエスト、mutation を含める。
- ローカルで利用可能でなければならないアセットとランタイム API は何か。

既存のクラウドビルドを維持してください。Vite / esbuild の統合は Capacitor ビルドだけに追加します。Node HTTP サーバーの追加、ネイティブ controller の置換、iframe の埋め込み、アプリケーションコードへのライブラリ内部のトランスポートファイルのインポートは行わないでください。

アプリケーションを維持できる最小の統合を選びます。

- **Worker API を呼ぶ既存のフロントエンド:** そのフロントエンドを維持し、マウント前に Fetch のみのランタイムを初期化します。レンダリングの移行は不要です。
- **HTML を返す Worker（Hono / TSX、Workers Express、OpenNext）:** `render` によるネイティブドキュメントレンダリングを使います。対応する範囲で router とレンダリングを維持します。
- **クラウド依存のリクエスト:** リモート実行を設定し、ビルドレポートを確認します。既存のハンドラーを変更しないでください。動作を維持するために必要なら、Worker 全体がリモートになる結果も問題ありません。

## 2. Capacitor とこのパッケージをインストールする

Capacitor 8 と互換性のあるプラットフォームパッケージを使います。[Capacitor のインストールガイド](https://capacitorjs.com/docs/getting-started)に従ってプラットフォーム SDK を準備します。アプリケーションパッケージ内で実行してください（既存の Capacitor 設定があれば再利用します）。

```sh
npm install @capacitor/core@8 @capacitor/ios@8 @capacitor/android@8
npm install -D @capacitor/cli@8 typescript
npx cap init
```

以下の Vite の例では、まだ導入されていなければ `vite@7` を開発依存に追加します。対応する esbuild 設定がすでにある場合は、Vite を追加せずそれを維持してください。

アプリケーション独自の ID / 名前と `webDir: "www"` を設定します。iOS には Swift Package Manager を使います。このライブラリには CocoaPods 統合が含まれていません。npm から 0.1.0 Preview リリースをインストールします。

```sh
npm install workers-capacitor
```

ネイティブターゲットのビルド前に、[ネイティブ SDK 要件と Android Gradle リソースルール](development.md#native-demo)を確認してください。Android のリソースルールはアプリケーションの `android/app/build.gradle` に記載します。

Capacitor / ネイティブプロジェクトはライブラリのソースツリーではなく、アプリケーションパッケージに置いてください。不必要に第 2 のアプリケーションを作らず、既存の依存関係と script を再利用します。

## 3. ネイティブアプリケーションを設定してビルドする

Worker が描画するアプリケーションでは、既存の Worker に次のファイルを追加します。

```text
src/worker.ts             Existing Worker entry
capacitor/index.html     Runtime bootstrap only
capacitor/main.ts        Runtime initialization
capacitor/vite.config.ts Separate native build
capacitor.config.ts      webDir: "www"
```

```html
<!-- capacitor/index.html -->
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Application</title>
  </head>
  <body>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
```

```ts
// capacitor/vite.config.ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "workers-capacitor/tooling/vite";
const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  root: here("."),
  base: "/",
  plugins: [
    workersCapacitorPlugin({
      worker: here("../src/worker.ts"),
      workerConfig: here("../wrangler.jsonc"),
    }),
  ],
  build: { outDir: here("../www"), emptyOutDir: true, target: "es2022" },
});
```

この例は Vite を使います。既存の esbuild ビルドがある場合は、代わりに [esbuild の設定](build-setup.md#esbuild)を使ってください。対応済みのビルドを置き換えるだけのために Vite を導入しないでください。ブラウザ互換の JavaScript にはプレーンなブラウザ ESM を使えますが、ネイティブドキュメントアセットの準備は自動では行いません。

実際のアプリケーションに合わせてパスを調整します。OpenNext のエントリーは生成された `.open-next/worker.js` です。先にビルドし、ASSETS を使う場合はリモートを明示的に設定してください。追加設定は[バインディングガイド](cloudflare-bindings.md)に記載しています。

```ts
// capacitor/main.ts — ローカルドキュメントの設定
import { workersCapacitor } from "workers-capacitor";
const runtime = workersCapacitor({
  baseURL: "https://worker.invalid/",
  render: "/",
});
await runtime.ready;
```

ビルドレポートがリモートルートまたは Worker 全体のリモート実行を選んだ場合は、このオプションに `remote: { origin: "https://your-worker.example.com" }` を追加し、既存の認証を接続します。生成されたその境界にはリモート設定が必要です。ローカルのみのビルドでは `remote` を省略します。生成されたリモート境界がないのに渡すと拒否します。[バインディング設定ガイド](cloudflare-bindings.md)を参照してください。

`baseURL` は論理的な Worker オリジンであり、それ自体がクラウド接続ではありません。`remote.origin` がデプロイ済み HTTPS Worker を指定します。生成されたディスパッチでは相対 API リクエストのパスを維持し、選ばれたリクエストがそのサーバーに届きます。アプリのローカルオリジンは通常、iOS が `capacitor://localhost`、Android が `https://localhost` です。[URL の契約](runtime.md#url-contract)を参照してください。

`render` はリンクやフォームを含むネイティブドキュメントレンダリングを選ぶもので、フォーム専用のオプションではありません。別途ビルドする既存のフロントエンドでは `render` を省略し、UI をマウントする前に Fetch のみのランタイムを初期化して、`https://your-worker.example.com/api/` のような API 専用の `baseURL` 境界を使います。フロントエンドは API 境界の外に置いてください。プラグインのエントリーには対応する API Worker を指定し、そのリモートディスパッチレポートも確認します。

ビルドしてインストールします（ネイティブプラットフォームの追加はそれぞれ一度だけです）。

```sh
npx vite build --config capacitor/vite.config.ts
npx cap add ios
npx cap add android
npx cap sync
npx cap run ios
# または: npx cap run android
```

sync の前には毎回ビルドしてください。ドキュメントレンダリングは Vite 開発サーバーではなく、バンドル済みアセットを使います。ライフサイクルとアセットは[ネイティブレンダリング](native-rendering-api.md)を参照してください。

## 4. 動作を維持し、実際の非互換性だけを修正する

アプリケーションのリファクタリングを提案する前に、既存のエントリーをビルドして実行します。[リモートバインディングガイド](cloudflare-bindings.md)に従って、バインディングと既存の Worker への接続を設定します。`remote.origin` は接続先を指定するもので、それ自体でルートを分類するわけではありません。ビルドプラグインがアプリケーションと設定からディスパッチを生成します。

SSR 出力だけでなく、クライアント初期化も確認してください。`window.location.origin` から HTTP(S) エンドポイントを導出するクライアントライブラリは、ハイドレーション完了前に iOS の `capacitor://` scheme を拒否する場合があります。固定した [flare-stack-blog フィクスチャ](../demo/tests/upstream/flare-stack-blog/README.md)は、Better Auth でこれを再現します。ライブラリが明示的な HTTPS エンドポイントに対応する場合は、その設定を認証、Cookie、ルーティングと合わせて検証してください。リモート Worker 実行だけでは表示ページのオリジンは変わりません。初期化を通すためにオリジンを偽装したり、認証チェックを無効にしたりしないでください。

| 既存のアプリケーション | 最初の統合方法 | 検証する境界 |
| --- | --- | --- |
| HTML を返す Hono / TSX | `export default app`、テンプレート、ルート、フォームを維持し、`render` を使います | 互換性のあるハンドラーは、待ち受け HTTP サーバーなしでローカル描画します |
| Workers Express | Workers の Fetch Handler エントリーと既存のルートを維持します | 対応する Workers Express は、任意の Node.js サーバーアプリケーションとは異なります |
| D1 クエリに続く SSR | クエリと HTML レスポンスを一緒に維持し、リクエストを既存の Worker にディスパッチします | D1 はリモートに残り、SQL を fetch に書き換えたり、新しい JSON エンドポイントを作ったりする必要はありません |
| ページを保護するセッションミドルウェア | ミドルウェアとサーバー管理セッションを維持します | Cookie / 共有状態への依存で Worker 全体のリモート実行を選ぶ場合があります |
| Next.js / OpenNext | 既存のクラウド出力をビルドし、`.open-next/worker.js` を選びます | クラウド依存により、生成された Worker 全体がリモートに残る場合があります |
| クラウド ASSETS | `assetsExecution: "remote"` を設定します | ローカル ASSETS は未実装です。既存のクラウドアセットの動作を維持します |

静的に解析できる Hono アプリケーションでは、ビルドが独立したルートをローカルに残す場合があります。安全にリクエストを分離できなければ、一般的な Fetch Handler や Workers Express も含め、Worker 全体のリモート実行を選びます。出力の `workers-capacitor-d1.json` または `workers-capacitor-server.json` を確認してください。ローカル実行を強制するためにバインディングを除去したり、認証を迂回したり、別の router を作ったりしないでください。

例えば、ユーザーを認証して D1 を問い合わせ、SSR HTML を返すページは、その全手順をデプロイ済み Worker 上に維持できます。端末はレスポンスを描画し、既存の対話モデルを使います。これには接続が必要で、D1 をローカルで使えるようにするものではありません。[D1 ディスパッチ](d1-transparent-migration.md)と [OpenNext サンプル](../demo/opennext/README.md)を参照してください。リモート実行はアプリケーションを維持するための正式な方法であり、後から再設計が必要な未完了の移行ではありません。

### Next.js: レンダリングとデータ実行を区別する

`dynamic(..., { ssr: false })` は、その Client Component のサーバー prerendering を無効にします。JavaScript が WebView 内で描画します。ページ全体のサーバー処理を無効にしたり、データベースクエリを端末へ移したり、自動でリモート API を作ったりするものではありません。[Next.js の遅延読み込み](https://nextjs.org/docs/app/guides/lazy-loading)を参照してください。

変更を提案する前に、各クエリの実際の実行場所を確認してください。

| 既存クエリの場所 | 維持する動作 |
| --- | --- |
| HTTP API を呼ぶ `useQuery`、SWR、クライアントコード | WebView がクライアントコードを実行し、API がサーバー操作を処理します。既存のエンドポイントと認証を維持します。 |
| D1 を問い合わせる親 Server Component または `getServerSideProps` | 子コンポーネントが `ssr: false` でも、クエリはサーバーに依存します。対応するリモートリクエストディスパッチを使ってください。 |
| クライアントコードにインポートした直接の D1 アクセス | WebView では実行できません。`ssr: false` は HTTP 呼び出しに変換しません。的を絞った修正をする前に、不正な境界を特定します。 |

すでにクライアント描画 → API リクエスト → D1 の構造であるアプリケーションは、その構造を維持してください。Capacitor 統合のために API レイヤーを増やしたり、SSR を強制したり、クエリライブラリを置き換えたりしないでください。クエリが通常の HTTP API ではなく Server Actions などのフレームワークトランスポートを使う場合は、同じサポートがあると仮定せず、文書化されたフレームワークの制限と照合して検証してください。

フラグ、HTTP 200 レスポンス、レスポンス本文内に見つかった文字列から、実際の SSR を推測しないでください。ページの script が動く前に、期待するコンテンツがドキュメント要素として存在することを確認します。script 内の文字列やシリアライズ済み RSC データは描画済み HTML ではありません。初期 HTML だけではビルド時 prerendering とリクエスト時 SSR を区別できません。フレームワークのビルドメタデータで prerender 済みルートを確認し、新しいリクエスト依存値がドキュメント要素に現れることからリクエスト時レンダリングを検証します。証拠がなければ、描画時点が不明な初期 HTML として報告してください。次に JavaScript を有効にして比較し、API / フレームワークのリクエストを観測します。一つのページにサーバーレンダリングされた layout とクライアント専用データ領域が同時にある場合もあります。アプリ全体に一律の SSR ラベルを付けず、領域と検証したルートごとに記録してください。

コンポーネント描画と Worker ディスパッチは別の判断です。ビルド統合は `ssr: false` をローカルルートの指示として解釈しません。クラウド依存を持つ生成済み OpenNext Worker は、初期ドキュメントと API リクエストについて Worker 全体のリモート実行を選ぶ場合があります。ビルドレポートを確認し、実際のリクエストをテストしてください。クライアント描画の画面だけでは、ローカル起動やオフラインでの利用可能性を確認できません。

### 設定だけでは解決しない場合

失敗を再現し、設定、ライブラリに文書化された制限、アプリケーションの前提のどれに起因するかを特定します。まず設定を修正してください。アプリケーションの変更が必要な場合は、失敗した動作に範囲を絞り、クラウドの動作が維持されることを検証します。

- **Origin のみの CSRF チェック:** 観測されたヘッダーは保持します。iOS でフォームの Origin が欠落した場合、検証済みのローカル main-frame initiator からだけ復元します。他のリクエストは Origin がない場合があります。トークン検証などの CSRF 保護を維持し、無効にしないでください。
- **外部認証リダイレクト:** リモートトランスポートは別のオリジンへのリダイレクトを拒否します。必要なアプリケーションでは明示的な[外部ブラウザ認証統合](../demo/authentication/README.md)を使い、この境界を避けるだけのために identity provider を置き換えないでください。
- **Passkeys / WebAuthn:** リモート HTML を描画しても、ドキュメントのローカルオリジンは維持されます。ブラウザでの認証成功はネイティブの登録や PRF サポートを保証しません。relying-party domain、プラットフォームの認証情報統合、app / domain association を検証し、オリジンチェックを迂回しないでください。[pknotes フィクスチャ](../demo/tests/upstream/pknotes/README.md)に現在のネイティブ境界を記載しています。
- **未対応のランタイム / フレームワーク動作:** [互換性一覧](compatibility.md)と [OpenNext の制限](opennext.md)を参照してください。依存関係の置換や描画方式の変更前に、失敗する機能を実証します。import や SSR レスポンスの成功は、フレームワークの完全なサポートを保証しません。

未解決の制限を明示的に報告してください。空のデータ、成功の mock、書き込みを繰り返す可能性のある自動リトライで隠してはいけません。

### 統合後の任意の最適化: ローカルでの初期描画

基本統合が動いた後、アプリケーションがローカル起動や測定可能な改善を必要とする場合だけ取り組んでください。互換性のある既存 SSR はローカル Worker で実行でき、クライアントの操作やハイドレーション前に HTML を得られます。SSR は維持する価値があります。ローカル実行はクライアント専用レンダリングを意味しません。

その renderer がリモートデータを待つ場合、ローカル描画の App Shell と認証済みデータリクエストの分離は、リファクタリングの選択肢の一つです。自動ではなく、通常の統合作業の範囲外です。テンプレート、ナビゲーション、認可を維持し、速度向上を主張する前に、有用なコンテンツと操作可能なコントロールが表示されるまでを測定してください。Next.js ではハイドレーションだけでサーバー依存はなくなりません。[OpenNext の制限](opennext.md)を参照してください。このガイドを完了するためだけに、クラウドアプリを static export に変更したり、新しい API を追加したりしないでください。

## 5. セキュリティ: 端末は信頼できるサーバーではない

### ビルドが除外するもの

ビルドが生成するリモート境界により、サーバーハンドラーと未使用の helper（SQL を含む）は、source map 生成前にクライアントのモジュールグラフから除外します。Worker 全体のリモートモードではアプリケーション実装を含めません。これは**ビルド時の除外**であり、元ソースの削除や実行時の SQL sanitizer ではありません。[コード除外](d1-transparent-migration.md#code-removal-and-execution-boundaries)を参照してください。

ハードコードされたすべてのシークレットを検出するわけではありません。手動で公開アセットにコピーしたファイル、`workerFiles`、bundler define、クライアント `env`、ログ、無関係なクライアント import から機密情報が漏れる場合があります。パッケージ内の JS、source map、アセットを確認してください。元のサーバーモジュールを別途インポートして、除外を迂回してはいけません。

### リモート操作を認証・認可する

非公開データと書き込みについては、Worker がセッションまたは bearer token を検証し、各操作を認可する必要があります。ユーザー ID は信頼できないリクエストフィールドではなく、検証済みの identity から取得してください。データベースクエリを認可された owner / tenant の範囲に絞ります。ユーザー A がユーザー B のレコードを読んだり変更したりできないことをテストしてください。

CORS、隠れたエンドポイント、SQL 除外、端末が渡す ID、埋め込みの共有 API key は認証ではありません。既存の認証があれば維持してください。このライブラリは認証情報を転送しますが、identity の発行やポリシーの強制はしません。公開読み取りエンドポイントは適切な制限を設け、意図的に公開のままにできます。

### ログイン UI が不要な場合の匿名ユーザー

既存の認証がないアプリケーションでは、ゲスト identity の選択肢として Firebase Anonymous Authentication を使えます。登録画面なしで UID を作成できます。毎回の起動で新しいアカウントを作るのではなく、既存のセッションを維持してください。[Firebase の匿名サインインガイド](https://firebase.google.com/docs/auth/web/anonymous-auth)を参照してください。

初期化済みの host 側の認証インスタンスを `remote.getToken` で接続します。

```ts
remote: {
  origin: "https://your-worker.example.com",
  getToken: async () => {
    const user = auth.currentUser; // Firebase auth は起動前に初期化済み
    if (!user) throw new Error("Authentication required");
    return user.getIdToken(); // SDK を使って期限切れトークンを更新します
  },
}
```

これは接続用の疑似コードであり、同梱の Firebase アダプターではありません。既存の認証がなく、ゲスト identity がアクセスポリシーに適する場合だけ使ってください。匿名サインインが必要か判断する前に既存のセッションを復元し、保護されたリクエストは認証の準備完了まで待たせ、失敗を明示的に処理します。アプリにすでに公開のローカル読み込み画面がある場合、認証でそれをブロックする必要はありません。新しい App Shell の追加も不要です。

トークン取得は分離された Worker ではなく host に置いてください。ネイティブのドキュメントページとランタイム host は別の JavaScript コンテキストです。ページ側の Firebase インスタンスが自動的に host のインスタンスになるわけではありません。Android は host を別途 bootstrap します。最初の UI closure だけが保持するトークンはそこでは利用できません。対話的なサインインを重複させずに host で認証情報を復元するか、provider token を既存 Worker の HttpOnly セッションと交換してください。[外部ブラウザの例](../demo/authentication/README.md)は後者を示しています。

サーバーは Firebase の [ID token 検証要件](https://firebase.google.com/docs/auth/admin/verify-id-tokens)と Workers 互換の verifier を使い、署名、有効期限、issuer、project audience を検証する必要があります。JWT claim のデコードだけでは不十分です。Firebase Security Rules は D1 を保護しません。Worker に認可を実装してください。

匿名 identity は実在の人、信頼できる端末、公式アプリのインストールを証明しません。誰でもゲストアカウントを作成できます。ゲスト権限、リクエストレート、費用のかかる操作を制限し、ローカル認証情報を失ってもデータを維持する必要がある場合はアカウント連携を提供してください。ユーザー認証とは別に、不正利用対策として [App Check](https://firebase.google.com/docs/app-check) を検討してください。このライブラリはネイティブ attestation や App Check 検証を提供しません。

[Cloudflare Access](https://developers.cloudflare.com/workers/configuration/cloudflare-access/) は、社内アプリケーションなどアクセス制御された利用者向けの選択肢であり、ゲスト identity サービスの代用品ではありません。配布するアプリに共有の Access service-token secret を埋め込まないでください。

### パッケージ内のコードとデータは取り出せるものとして扱う

Capacitor のバンドルは検査できます。JS、ネイティブソース、アプリにコンパイルした `.env` 値、バンドル済みファイルに、Cloudflare 管理トークン、サービスアカウントの秘密鍵、データベース認証情報、特権サービストークンを埋め込まないでください。難読化してもシークレットは安全になりません。公開クライアント識別子 / 設定とサーバー認証情報は別物であり、信頼の証明として使用してはいけません。

ユーザーの認証情報には有効期限、失効 / ログアウト処理、プラットフォームに適した保存方法が必要です。OS に保護されたストレージは露出を減らしますが、侵害された端末を信頼できるようにはしません。トークンや非公開レスポンスをログに記録せず、アカウント変更時にはユーザースコープのキャッシュデータを消してください。リモート Worker は呼び出し側に受け取りを許可したデータだけを返す必要があります。

リモート HTML はアプリケーションの document WebView 内でクライアントスクリプトを実行します。プラグイン呼び出しの発生元はそこであり、リモート Worker ではありません。ナビゲーション後の描画ページから、独自プラグインの呼び出し、結果、ネイティブイベント配信を検証してください。iOS は独立した Capacitor document controller を作成するため、元の host に手動登録したプラグインインスタンスや listener が引き継がれるとは仮定しません。Android は表示用のアプリケーション WebView を維持します。[ネイティブ受け入れシナリオ](../demo/tests/README.md#native-plugin-calls-from-remote-pages)は自動登録されるパッケージプラグインを確認し、ナビゲーション / 再起動後の呼び出し結果、ネイティブイベント、エラーを含みます。新しいドキュメントは新しい listener を登録します。古いページの listener はドキュメント置換をまたいで残りません。任意の独自プラグインのライフサイクルや、手動の host 登録はこの範囲外です。

ネイティブドキュメントは Capacitor プラグインにアクセスできます。信頼できないコンテンツを escape し、任意の HTML をアプリケーションコードとして描画しないでください。Cookie 認証では CSRF 保護を維持します。観測した Origin と Fetch Metadata ヘッダーは保持します。iOS main-frame のフォームで Origin が欠落する場合、ネイティブブリッジは検証済みのローカル WebKit security origin からだけ復元します。sandbox 内や不明な initiator にそのオリジンを付与することはありません。他のネイティブリクエストでも Origin が省略される可能性があります。CSRF 保護を維持し、Origin を認証として扱わないでください。外部オリジンへのリダイレクトは拒否します。OAuth / SSO には明示的な外部ブラウザ統合が必要です。[リモートトランスポートの境界](d1-transparent-migration.md)を参照してください。

## 6. Capacitor で既存のアプリケーションを検証する

受け入れとは、新しいエントリーと設定で既存のアプリケーションが動作し、すべてのアプリケーションコード変更が実証された非互換性に基づいていることです。ネイティブのフローを既存のクラウドアプリケーションと比較してください。レンダリングの再設計や性能向上を統合の条件にしないでください。

実際のユーザーフローで対象の iOS / Android をテストします。

- アプリを起動し、既存の初期ページ、script、style、画像、操作を確認します。ハイドレーションはアプリケーションが使う場合だけ確認します。
- リンクをたどる、戻る、フォームを送信する、同一オリジンのリダイレクトをたどる操作を行います。該当する場合は既存の deep link 動作もテストします。
- 認証し、非公開データを読み、一度更新し、再起動してサインアウトします。以前のアカウントからの分離を含め、データベースの状態とセッションの動作を検証します。
- 欠落 / 期限切れ / 偽造された認証情報と、別ユーザーのデータへのアクセスを拒否します。Cookie 認証の mutation に対する CSRF 保護を検証します。
- バックエンドを切断または遅延させます。選択した実行モードの接続依存を報告し、偽の成功や書き込みの繰り返しなしに、明示的に失敗することを検証します。Worker 全体をリモートにするアプリケーションに、ローカル起動は必須ではありません。
- ビルドレポートとパッケージのアセットを検査します。ローカル / リモートのディスパッチが選択した設定と一致し、除外したサーバー SQL / helper がなく、特権認証情報を埋め込んでいないことを確認します。
- アプリケーションの既存のクラウドテストを実行し、統合がサーバーの動作を変えていないことを確認します。ブラウザテストはネイティブのナビゲーション / セッションテストの代わりにはなりません。

追加した統合ファイル、必要になった各アプリケーション変更と理由、実行したコマンド、検証したプラットフォーム、実行境界、残る制限を報告してください。シミュレーター / エミュレーターと実機の確認、リモート実行とローカル互換性を区別します。デプロイ済みテストバックエンドやネイティブ SDK がなければ、完了と主張せず、何を検証でき、何を検証できなかったかを示してください。
