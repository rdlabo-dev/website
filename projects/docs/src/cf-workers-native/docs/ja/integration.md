---
title: "既存の Workers アプリケーションを Capacitor と統合する"
sourceRevision: "1915798ff91011d23d9112d443021b39438de8d45ebbc9771d9c1ffc4423ea6c"
---

# 既存の Workers アプリケーションを Capacitor と統合する

既存の [iOS](native-embedding.md#ios)・[Android](native-embedding.md#android) アプリは埋め込みガイドを使います。このガイドは、新しいモバイルアプリの作成や汎用 Capacitor プラグインの利用を含む Capacitor アプリ向けです。

既存の Workers ページを Capacitor で iOS・Android アプリにします。モバイルビルドを追加して Worker エントリーを接続し、ネイティブ Shell とプラグインに Capacitor を使います。クラウドビルド、描画、ルート、業務ロジック、認証は維持します。

以下の[ワークフロー](#workflow)を自分で進めるか、リポジトリーにアクセスできるアシスタントへ[連携プロンプト](#prompt-to-give-your-ai-assistant)を渡してください。

最も重要な成功基準は、最小限の統合作業でネイティブアプリケーションが動くことです。新しいアーキテクチャを作ることではありません。アプリケーションが通常の HTML ドキュメント、リンク、フォームを使っている場合はそれらを維持してください。SPA への変換、新しいクライアント router、App Shell の再設計、SSR / API の分離、ハイドレーションの追加は前提条件ではありません。

## 始める前に

この手順はWorkersのWebアプリを持ち、モバイル版を追加したい開発者向けです。Capacitorがネイティブプロジェクトを提供し、cf-workers-nativeが既存のWorkerページとリクエストを接続します。

次のものを用意してください。

- アプリケーションのソースと動作するWebビルド。最初の例には[Hono / Expressのページ](../demo/rendering/README.md)や[Void + D1](../demo/void/README.md)を使えます。
- クラウドを使うページ・データ・認証向けの、デプロイ済みの**テスト用**Worker URL。D1とサーバーの認証情報はそのWorkerに保持します。
- Nodeとプラットフォーム開発ツール。iOSではmacOSとXcode、AndroidではAndroidのツールチェーンが必要です。[Capacitorの環境設定](https://capacitorjs.com/docs/getting-started/environment-setup)と、フレームワークのバージョン要件に従ってください。
- モバイルプロジェクトのアプリ名とID。初回の実行にはシミュレーターかエミュレーターで十分です。

最初の到達点は、アプリで既存のページが表示され、リンクで遷移でき、フォームまたはデータ操作が成功することです。その後、[受け入れチェックリスト](#6-verify-the-existing-application-in-capacitor)でログインやセッション処理を含む全フローを検証します。Web認証にはモバイル向けのコールバック設定が必要な場合があるため、対象アプリで評価してください。

このガイドでは、モバイルビルドの設定とネイティブプロジェクトのセットアップが必要です。署名、ストアアカウント、申請、審査はアプリの動作後に進めます。

## AI アシスタントに渡すプロンプト

```text
Follow https://github.com/rdlabo-dev/cf-workers-native/blob/v0.1.8/docs/integration.md
to bring this app to iOS and Android with cf-workers-native.
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

- **Worker API を呼ぶ既存フロントエンド:** 維持し、マウント前に Fetch-only ランタイムを初期化します。描画移行は不要です。
- **HTML を返す Worker（Hono/TSX、Workers Express、OpenNext）:** `render` によるネイティブドキュメント描画を使い、対応するルーターと描画を維持します。
- **クラウド依存の要求:** リモート実行を設定し、ビルドレポートを確認します。既存ハンドラーは維持します。Worker 全体のリモートディスパッチは互換性フォールバックで、すべてのクライアントアセットをリモート取得する必要はありません。安全な公開クライアント出力を同梱し、アセット要求を別に検証します。

## 2. Capacitor とこのパッケージをインストールする

Capacitor 8 と互換性のあるプラットフォームパッケージを使います。[Capacitor のインストールガイド](https://capacitorjs.com/docs/getting-started)に従ってプラットフォーム SDK を準備します。アプリケーションパッケージ内で実行してください（既存の Capacitor 設定があれば再利用します）。

```sh
npm install @capacitor/core@8 @capacitor/ios@8 @capacitor/android@8
npm install -D @capacitor/cli@8 typescript
npx cap init
```

以下の Vite の例では、まだ導入されていなければ `vite@7` を開発依存に追加します。対応する esbuild 設定がすでにある場合は、Vite を追加せずそれを維持してください。

アプリ固有の ID・名前と `webDir: "www"` を設定します。iOS は Swift Package Manager を使います。CocoaPods 連携はありません。npmのPreviewを正確なバージョンでインストールしてください。`latest`タグには0.xのPreviewリリースも含まれます。

```sh
npm install --save-exact cf-workers-native@0.1.7
```

ソースビルドを使う場合は、チェックアウトからパッケージ tarball を作ります。

```sh
# SDK のチェックアウト内:
npm install
npm pack

# アプリパッケージ内:
npm install /path/to/cf-workers-native/cf-workers-native-0.1.7.tgz
```

`npm pack` は `prepack` で SDK をビルドします。チェックアウトのディレクトリーではなく生成 tarball を導入してください。ディレクトリー導入は SDK ツリーへのシンボリックリンクになり、アプリがその中にある場合は再帰パスになることがあります。上の tarball 名は現在のソースバージョンです。

導入パッケージ名は `cf-workers-native` ですが、チェックアウトのディレクトリー名はリポジトリー名のままで構いません。公開済みの旧 `workers-capacitor@0.1.1` Preview にはここで示すインポートはありません。[文書化されたJS・ネイティブの依存セット](native-embedding.md#dependency-setup)を使用するか、ソースビルドの依存を同じリビジョンに揃えてください。

### 旧 npm パッケージから移行する

すでに `workers-capacitor` に依存するアプリは、新名を導入する前に削除します。両方を残すと Capacitor が同じネイティブプラグインを二重検出・登録する可能性があります。アプリ側で 0.1.7 を使う場合:

```sh
npm uninstall workers-capacitor
npm install --save-exact cf-workers-native@0.1.7
```

ランタイムのインポートを `workers-capacitor` から `cf-workers-native/capacitor` に変更し、他のサブパスも `cf-workers-native` 接頭辞へ変更します。既存のコマンドでモバイル Web アセットを再ビルドし、`npx cap sync` でネイティブ依存を再生成します。新規アプリは上の導入手順を直接使います。

ネイティブターゲットのビルド前に [SDK 要件と Android Gradle リソース規則](development.md#capacitor-native-demo)を確認します。Android の規則はアプリの `android/app/build.gradle` に置きます。

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
import { workersCapacitorPlugin } from "cf-workers-native/tooling/vite";
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
import { workersCapacitor } from "cf-workers-native/capacitor";
const runtime = workersCapacitor({
  baseURL: "https://your-worker.example.com/",
  render: "/",
});
await runtime.ready;
```

リモートルート・Worker 全体のリモート実行では、送信先の既定値は `new URL(baseURL).origin` です。デプロイ先がこの論理オリジンと異なる場合だけ `remote.origin` を指定します。`remote: { getToken: async () => getExistingSessionToken() }` などの認証オプションに URL の再指定は不要です。セッション管理はアプリの責務です。

`baseURL` のパスは横取りの境界で、要求に追加する接頭辞ではありません。ローカル専用ビルドはローカルのままです。リモート先は HTTPS が必須です。仮の論理 `baseURL` を使う既存連携は、デプロイ済み URL に置き換えるか明示的な `remote.origin` を維持してください。省略時は設定不足エラーでなく `baseURL` のオリジンを選びます。不正な明示値は置き換えず拒否します。アプリオリジンは iOS が `capacitor://localhost`、Android が通常 `https://localhost` のままです。[URL 契約](runtime.md#url-contract)を参照してください。

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

アプリのリファクタリングを提案する前に既存エントリーをビルド・実行します。[リモートバインディングガイド](cloudflare-bindings.md)でバインディングと接続を設定します。`remote.origin`（省略時は `baseURL` オリジン）は送信先であり、それ自体はルートを分類しません。プラグインがアプリと設定からディスパッチを生成します。

SSR 出力だけでなく、クライアント初期化も確認してください。`window.location.origin` から HTTP(S) エンドポイントを導出するクライアントライブラリは、ハイドレーション完了前に iOS の `capacitor://` scheme を拒否する場合があります。固定した [flare-stack-blog フィクスチャ](../demo/tests/upstream/flare-stack-blog/README.md)は、Better Auth でこれを再現します。ライブラリが明示的な HTTPS エンドポイントに対応する場合は、その設定を認証、Cookie、ルーティングと合わせて検証してください。リモート Worker 実行だけでは表示ページのオリジンは変わりません。初期化を通すためにオリジンを偽装したり、認証チェックを無効にしたりしないでください。

| 既存のアプリケーション | 最初の統合方法 | 検証する境界 |
| --- | --- | --- |
| HTML を返す Hono / TSX | `export default app`、テンプレート、ルート、フォームを維持し、`render` を使います | 互換性のあるハンドラーは、待ち受け HTTP サーバーなしでローカル描画します |
| Workers Express | Workers の Fetch Handler エントリーと既存のルートを維持します | 対応する Workers Express は、任意の Node.js サーバーアプリケーションとは異なります |
| D1 クエリに続く SSR | クエリと HTML レスポンスを一緒に維持し、リクエストを既存の Worker にディスパッチします | D1 はリモートに残り、SQL を fetch に書き換えたり、新しい JSON エンドポイントを作ったりする必要はありません |
| ページを保護するセッションミドルウェア | ミドルウェアとサーバー管理セッションを維持します | Cookie / 共有状態への依存で Worker 全体のリモート実行を選ぶ場合があります |
| Next.js / OpenNext | 既存のクラウド出力をビルドし、`.open-next/worker.js` を選びます | クラウド依存により、生成された Worker 全体がリモートに残る場合があります |
| クラウド ASSETS | `assetsExecution: "remote"` を設定します | ローカル ASSETS は未実装です。既存のクラウドアセットの動作を維持します |

既定の `execution: "network"` は既存 Worker をサーバーに維持します。基本連携が動く前にルートの列挙を求めないでください。必要な場合は `execution` 配列で選択実装と保持依存の配布を明示許可します。Hono 登録と[限定的な OpenNext 生成ビルド](opennext.md#route-execution)に対応します。サーバー境界を維持し、分離が不確かなら全体をリモートにできます。`workers-capacitor-d1.json`・`workers-capacitor-server.json` を確認してください。空でない選択でローカルハンドラーがなければ警告します。

パターンは受信 URL でなく登録を選びます。Hono は登録パターン、対応 OpenNext は静的ルートパスを使います。`/app/*` は `/app` 自体と子孫を含み、将来の登録も許可し得ます。`method: "*"` の使用前に範囲を確認します。GET、HTML、REST API 接頭辞、既知バインディングがないことから配布許可を推測しないでください。単独アプリは `execution: "local"` で解析なしに全体を配布できますが、保護境界の回避に使わないでください。[実行設定](cloudflare-bindings.md#choosing-execution)を参照してください。

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

Vite の `publicDir`、または esbuild 出力へのビルド前コピーで公開アセットを同梱します。サーバーハンドラーがリモートでもホストがその正確なパスをローカル配信します。認可・ミドルウェアが不要な公開ファイルだけをコピーしてください。Cloudflare アセット制御ファイルはローカル適用しません。[OpenNext](opennext.md#bundle-client-assets-alongside-remote-pages)・[Void](void.md) の設定を参照し、古いインストール済みアプリを含めクライアント・サーバーの互換性を保ってください。

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

### サーバー専用ファイルの宣言

Capacitor の Vite・esbuild プラグインで `serverOnly` を使うと、特定のソースモジュール・ファイルの配布を禁止できます。

```ts
workersCapacitorPlugin({
  worker: "./src/worker.ts",
  execution: [{ method: "GET", path: "/public" }],
  serverOnly: ["./src/server/signing.ts", "./secrets/test-key.pem"],
  remoteBindings: ["SIGNING_KEY"],
});
```

宣言は Vite の root、esbuild の `absWorkingDir`（既定は cwd）からの正確な既存ファイルパスで、絶対パスも使えます。ディレクトリーと glob は宣言ではありません。シンボリックリンクの別名は同じ保護ファイルへ解決します。`remoteBindings` はバインディング名、`serverOnly` はバインディングに触れないファイルも保護します。どちらも秘密の値を含まず、本番認証情報を取得しません。

`network` は引き続き Worker コードを除外します。`local` は同梱インポートに宣言ファイルがあれば失敗します。ルート許可では宣言依存が Worker をリモートに保ちます。現在はそのファイル境界を越えた分離を試みず、保守的に Worker 全体を維持します。`serverOnly` 指定時は生成フレームワーク最適化にも保守的な汎用解析を使います。ルート許可でファイル禁止を上書きできません。

別の直接・推移的クライアント import、`workerFiles`、Vite public コピー（シンボリックリンクを含む）、通常の Vite/esbuild アセット import にも宣言ファイルは含められません。Vite はインライン化した CSS/HTML の追跡入力と、別名を含む静的 `new URL(..., import.meta.url)` も確認します。禁止ファイルの混入は内容でなくソースパスを示して失敗します。生成 Dedicated Worker 内にも適用します。

これは本番ビルドの配布境界で、汎用の秘密スキャナーではありません。プラグインと組み込みバンドラーの import・アセット処理が対象です。由来を持たず注入・コピーする独自プラグイン・外部スクリプト、変換済み内容を含む事前コンパイル成果物、ビルド後追加ファイルは別の成果物確認が必要です。defines とクライアント `env` の未宣言秘密値は検査しません。公開検証鍵・設定は明示宣言しなければ許可し、変数名 `KEY` だけで拒否しません。

`demo/tests/build/server-only.test.ts` の実行可能な人工フィクスチャは非公開モジュールを import する Worker をビルドし、許可モバイル JS・map・ファイルにマーカーがないことと、両アダプターでクライアント import・コピーを拒否することを確認します。`npm run build` 後、`cd demo && npx vitest run --config tests/vitest.build.config.ts tests/build/server-only.test.ts` で実行します。実際のサーバー認証情報はサーバー側ストレージ・バインディングに保持し、ユーザー認証情報は後述の既存認証フローで実行時に取得してください。

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
    return user.getIdToken(); // SDK で期限切れトークンを更新します
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
