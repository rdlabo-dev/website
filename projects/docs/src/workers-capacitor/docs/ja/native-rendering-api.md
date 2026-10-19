---
title: "workersCapacitor によるネイティブドキュメントレンダリング"
sourceRevision: "42174a2c590917a75ae4961d2b75e2b1f2bef3710168432b5e2d1ca99de8da6f"
headingAliases: {"installation":"%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB","application-entry":"%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%A8%E3%83%B3%E3%83%88%E3%83%AA%E3%83%BC","native-plugins":"%E3%83%8D%E3%82%A4%E3%83%86%E3%82%A3%E3%83%96%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3","build-configuration":"%E3%83%93%E3%83%AB%E3%83%89%E8%A8%AD%E5%AE%9A","native-implementation":"%E3%83%8D%E3%82%A4%E3%83%86%E3%82%A3%E3%83%96%E5%AE%9F%E8%A3%85","scope-and-limits":"%E7%AF%84%E5%9B%B2%E3%81%A8%E5%88%B6%E9%99%90","demo-and-validation":"%E3%83%87%E3%83%A2%E3%81%A8%E6%A4%9C%E8%A8%BC","shutdown-and-trust-boundary":"%E7%B5%82%E4%BA%86%E3%81%A8%E4%BF%A1%E9%A0%BC%E5%A2%83%E7%95%8C","absolute-article-links":"%E8%A8%98%E4%BA%8B%E3%81%B8%E3%81%AE%E7%B5%B6%E5%AF%BE%E3%83%AA%E3%83%B3%E3%82%AF"}
---
パッケージには Capacitor 8 用のネイティブ接続が含まれます（8.5.3 で検証済み）。iOS は Swift Package Manager、Android は Gradle を使います。この Preview に CocoaPods は含まれません。

## インストール

[Preview のインストール手順](integration.md#2-install-capacitor-and-this-package)に従って、Capacitor アプリケーションへパッケージをインストールします。

Vite / esbuild プラグインで Worker を設定し、`workersCapacitor({ baseURL, render: "/" })` を呼び出します。同期前に Web アセットをビルドしてください。

```sh
npm run build
npx cap sync
npx cap run ios # または android
```

Capacitor CLI がネイティブプラグインを検出して登録します。アプリケーションは通常の Activity / ViewController を維持し、手動登録やネイティブソースのコピーは不要です。ブラウザの Fetch のみの API は、Capacitor をインストールしなくても利用できます。

## アプリケーションエントリー

```ts
import { workersCapacitor } from "workers-capacitor";

const app = workersCapacitor({
  baseURL: "https://worker.invalid",
  render: "/",
});
await app.ready;
```

`render` は最初のローカルドキュメントのパスです。省略すると既存の Fetch のみの動作を維持します。ドキュメントモードの `baseURL` には、API パス prefix のない HTTP(S) の**オリジン**が必要です。Worker はその論理オリジン配下の URL を受け取りますが、表示されるページは Capacitor のローカル URL（デフォルトの iOS は `capacitor://`、Android は `https://`）を維持します。生成されたディスパッチは、ハンドラーを呼ぶ前にローカル実行または設定済みのリモート Worker を選択できます。どちらも同じネイティブブリッジを通してドキュメントを返します。ローカルの失敗をリモートで再試行することはなく、ローカル HTTP サーバーも起動しません。[リモート実行の設定](integration.md#3-configure-and-build-the-native-application)を参照してください。

Hono と Workers Express は同じ `worker.fetch(request, env, ctx)` 境界を使います。それぞれのアプリケーション router は、ページには完全な HTML、API には JSON を返します。アダプターはアプリケーション router を追加しません。既存の `worker`、`env`、`prefer`、`drain()`、バックグラウンドエラー処理はランタイム host に引き続き適用されます。

`ready` は Worker とネイティブ接続の初期化完了を意味し、すべての画像やページスクリプトの読み込み完了を意味しません。`await app.dispose()` はドキュメント接続とランタイムを解放します。Fetch のみの破棄も、ネットワークリソース、遅延モジュール、以前の Android のドキュメント登録を解放している間は非同期になる場合があります。再初期化前にクリーンアップを完了させる必要がある場合は、常に `await app.dispose()` を使ってください。ドキュメントの起動エラーは元の fetch 実装を復元します。Fetch のみの Worker の起動エラーは、明示的に破棄するまでローカルリクエストを拒否し続けます。

## iOS Safe Area

Worker ドキュメントの WebView は、`ios.contentInset` を省略した場合、content inset のデフォルトが `automatic` になります。`capacitor.config.ts` または `capacitor.config.json` に明示した値が優先され、Capacitor の既存の選択肢 `automatic`、`scrollableAxes`、`never`、`always` を使えます。

CSS で Safe Area を処理し、edge-to-edge のコンテンツが必要なアプリケーションでは、次のように設定します。

```ts
const config: CapacitorConfig = {
  // その他の Capacitor 設定...
  ios: { contentInset: "never" },
};
```

この設定を変更したら `npx cap sync ios` を実行してください。このデフォルトはネイティブの Worker ドキュメントビューに適用されます。通常の Fetch のみの WebView は Capacitor の通常の動作を維持します。新しい `workersCapacitor` オプションは不要です。

## ネイティブプラグイン

写真の撮影、share sheet の表示、操作後の触覚フィードバックなど、ユーザーに役立つ機能を選びましょう。[公式 Capacitor プラグイン](https://capacitorjs.com/docs/apis)を確認し、選んだプラグインのインストールと権限設定に従ってください。

1. アプリケーションに Capacitor 8 と互換性のあるプラグインをインストールし、必要な iOS / Android の権限を設定して、Web アセットを再ビルドし、`npx cap sync` を実行します。
2. ユーザー操作に応じて、ページのクライアント側 JavaScript からプラグインを呼び出します。ネイティブ機能は端末の機能なので、SSR や Worker ハンドラーからは呼び出さないでください。リモートで描画するページでは、そのページのクライアントビルドにプラグインの JavaScript、Capacitor アプリケーションにネイティブパッケージを含めます。
3. 権限の拒否、別画面へ移動して戻る操作、アプリの resume も含め、各対象プラットフォームで確認します。ページの mount 時に listener を登録し、unmount 時に解除してください。新しいドキュメントには新しい listener が必要です。同じページを Web でも使う場合は、プラグインが対応する Web の動作または代替 UI を用意します。

Capacitor の手順は [Using Plugins](https://capacitorjs.com/docs/basics/using-plugins)、このライブラリの document host に関する情報は[プラグインのライフサイクル境界](integration.md#treat-packaged-code-and-data-as-extractable)を参照してください。

## ビルド設定

既存の Vite / esbuild プラグインが、ドキュメントアセットを自動で準備します。

```ts
workersCapacitorPlugin({
  worker: "./workers/hono.tsx", // または Workers Express のエントリー。
});
```

実行時にドキュメントレンダリングを選ぶのは `render` だけです。アプリケーションが `form[action]` を使うかどうかとは無関係です。Fetch のみのアプリケーションでも小さな内部アセットをビルドに含めますが、`render` を設定しない限り Service Worker を登録したり、ネイティブドキュメントの描画を開始したりしません。

ネイティブレンダリングでは Vite の `base: '/'` を使い、Capacitor の copy / sync 前にビルドしてください。Vite の開発サーバーは Fetch のみの開発で引き続き使えますが、ネイティブドキュメントレンダリングにはバンドル済みアセットが必要です。esbuild は `outfile` の隣または `outdir` にアセットを書き込みます（インメモリの `write: false` ビルドはネイティブドキュメントアセットを準備しません）。別途コピーする静的ファイルはビルド前に出力ディレクトリに置き、asset manifest に含まれるようにしてください。

生成された `workers-capacitor-assets.json` はバンドル済みアセットを特定し、それらは Worker router を迂回します。それ以外のローカルパスはすべて Worker に到達します。Android は `workers-capacitor-sw.js` を使ってブラウザネイティブの Request / Response とリダイレクトを処理します。これらのファイル名は実装用アセットであり、アプリケーションからインポートするものではありません。raw ESM の構成では、相当する SW ファイルと asset manifest を自分で用意する必要があります。アセット統合の自動化は現在 Vite と esbuild を対象としています。

## ネイティブ実装

- iOS は通常のアプリケーション controller を維持します。プラグインは既存の WebView をランタイム host として保持し、内部のドキュメント controller を追加します。scheme handler はドキュメント WebView の作成前に登録します。host はライブラリの既存の Worker トランスポートを通じて同じ Fetch Handler を呼び出します。
- Android は通常の Activity と表示用 WebView を維持します。プラグインはバンドル済み bootstrap の内部 host モードを使い、永続的な host を作成します。Service Worker がリクエストをその host に転送し、通常のブラウザナビゲーションを通じてレスポンスを返します。bootstrap は host でも再実行されるため、アプリケーション起動の副作用をランタイム起動の後や並列の位置に置かないでください。
- パッケージのネイティブソースは `native/` にあります。`Package.swift` と Android ライブラリプロジェクトは npm tarball に含みます。測定 / レポートの hook は `demo/tests/` にあり、ネイティブ実装には含めません。

アプリケーションの Activity / ViewController の置換、iframe、Turbo、HTML DOM の置換は不要です。二つの WebView のライフサイクルはアダプター内部で管理します。

## 範囲と制限

これは Preview リリースです。ドキュメントレンダリングはネイティブ専用であり、通常のブラウザ / Electron / Tauri でのドキュメント起動は実装していません。既存のブラウザでの Fetch のみの動作は変わりません。レスポンス本文は上限付きチャンクで pull します。ドキュメントのアップロードは引き続きバッファリングし、上限は 8 MiB です。Worker のレスポンスでは HTTP キャッシュを無効にします。外部へのリダイレクトは拒否します。iOS のページ側 Fetch ブリッジは、ブラウザ内部の Response slot ではなく JavaScript プロパティでリダイレクトメタデータを表現します。iOS の multipart form 補完は同じウィンドウのローカル POST 送信を対象とし、名前付きウィンドウや iframe の target はサポートしません。観測された Origin と Fetch Metadata ヘッダーは保持します。iOS がフォームの Origin を省略した場合、検証済みのローカル main-frame の WebKit security origin からだけ復元します。opaque または不明な initiator は信頼しないままです。他のネイティブリクエストでも Origin が省略される可能性があります。検証済みトークンなどの CSRF 保護を維持してください。Origin は認証ではありません。

ネイティブの host / child ライフサイクル、保留リクエストのタイムアウト、明示的な破棄を実装しています。アプリプロセスの終了 / 再起動、background / foreground、データを削除せずアセットを更新して再インストールする操作、終了後の再初期化は、一部の実機シナリオを含めパッケージのネイティブフィクスチャで検証しています。対象端末で自身のアプリケーションを検証してください。WebView のクラッシュ復旧、メモリ圧迫、任意のサードパーティプラグインのライフサイクル動作はこの範囲外です。

## デモと検証

[demo/rendering](../demo/rendering) に、読みやすい Hono / TSX と Workers Express の例があります。ルートの HTML、リンク、POST 後の 303 リダイレクト、JSON エンドポイントを含みます。通常の Fetch のみのデモは別です。

`tests/unit/documents.test.ts` は公開エントリー、起動エラー、復元、破棄、ルーティングを検証します。Service Worker のテストは POST のバイト、リダイレクトのマッピング、更新後の asset manifest 変更を検証します。`demo/tests/build/documents.test.ts` では Vite と esbuild の両方で公開エントリーをビルドします。

`demo/tests/fixtures/apps/packaged-native` のパッケージ用ネイティブ受け入れフィクスチャは、同じ公開 API を呼び出します。テスト専用の Worker wrapper が返された HTML にブラウザテストドライバーを追加します。実際の tarball から独立した利用側にインストールし、通常の `cap add` / `cap sync` を使います。ネイティブコードや登録への patch はありません。再現コマンドは `demo/tests/README.md` を参照してください。

### 終了と信頼境界

Android の終了時と起動失敗時には、このライブラリの Service Worker だけを無効化して登録解除します。Fetch のみの起動も以前のドキュメント登録を削除します。アプリを使う前に `ready` を await してください。すでに制御されているページは、ナビゲーションを待たずにネイティブのリクエスト処理へ切り替わります。無効状態は Service Worker が idle により終了しても保持します。終了プロトコルのない古いトランスポートは、登録解除後の再読み込みが必要です。この移行が保留中の場合、Android の Fetch のみの `dispose()` は Promise を返すことがあります。

ルートスコープにある既存のアプリケーション Service Worker は上書きしません。代わりにドキュメントレンダリングが競合を報告します。クリーンアップ時に他のアプリケーション登録は削除しません。

バンドルされた Worker とそれが生成する HTML は、信頼できるアプリケーションコードです。ページは Capacitor のローカルオリジンで動き、バンドルされた HTML と同様にアプリケーションのネイティブプラグインへアクセスできます。レンダリングは信頼できない HTML の sandbox ではありません。アプリケーションは信頼できない値を escape し、任意のリモート HTML を信頼されたアプリケーションページとして描画してはいけません。この信頼モデルは iOS と Android の両方に適用されます。

### 記事への絶対リンク

設定された `baseURL` オリジンへの通常の main-frame リンクは、クエリと fragment を保持して対応するローカルドキュメントパスへ移動します。アプリケーションが絶対リンクを生成する場合は、その Worker のオリジンに `baseURL` を合わせてください。相対リンクの通常の動作は維持します。

ハンドラーはフレームワークが処理する click、修飾キー、download、self 以外の target を尊重します。外部オリジン、iframe のリンク、絶対指定の form action、任意のプログラムによるナビゲーションは書き換えません。この動作には Android の WebView document-start script サポートが必要です。iOS は既存の document-start script を使います。
