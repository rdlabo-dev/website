---
title: ネイティブアプリへの埋め込み
---

# 既存のネイティブアプリに Workers UI を埋め込む

既存の UIKit、SwiftUI、Android アプリの画面に Workers ページを追加します。ネイティブのエントリーポイント、ナビゲーション、ルート画面を維持し、SDK の WebView 内で Workers のルートと描画を再利用します。

ネイティブ設定は [iOS](#ios) または [Android](#android) を選びます。両方とも以下の[共通 Web ビルド](#shared-web-build)と同じランタイム設定を使います。新規モバイルアプリや汎用プラグインには [Capacitor 連携](integration.md)を使用します。

Web プロジェクトでアセットをビルドし、アプリにネイティブ SDK を追加して、ネイティブ API で Workers 画面を開閉します。Capacitor は SDK が内部解決するため、ネイティブアプリに Capacitor 設定や CLI は不要です。

**0.1.2 Preview:** `cf-workers-native@0.1.2` と対応する[ネイティブ依存](#dependency-setup)を導入します。Android は WebView の `MULTI_PROFILE` とローカルビルドした SDK 成果物が必須で、公開 Maven リリースはまだありません。

## 共通の Web ビルド

Workers アプリは cf-workers-native と同じ Worker ソース、オプション、[Vite/esbuild 設定](build-setup.md)を使います。対象プラットフォームのエントリーを選びます。

```ts
import { workersIOS } from "cf-workers-native/ios";

const app = workersIOS({
  baseURL: "https://worker.invalid",
  render: "/",
});
await app.ready;
```

Android は同じオプションで `cf-workers-native/android` の `workersAndroid` を import します。両方とも `ready`、`execution`、`drain()`、`dispose()` を返し、ネイティブ画面の終了を Worker ランタイムの破棄へ接続します。マニフェストとランタイムチャンクを含む生成アセットディレクトリーをそのまま維持します。Web プロジェクトや CI でビルドし、ネイティブプロジェクトに npm、`node_modules`、Capacitor CLI、`capacitor.config.*` は不要です。

ターゲットごとに小さな Web エントリーをビルドします。たとえば `src/main.ts` に上記の `workersIOS` 初期化を置き、ルートの `index.html` を次にします。

```html
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

独立したモバイル Vite 設定を使います。

```ts
// vite.mobile.config.ts
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "cf-workers-native/tooling/vite";

export default defineConfig({
  plugins: [workersCapacitorPlugin({ worker: "./src/worker.ts" })],
  build: { outDir: "dist-mobile" },
});
```

Web プロジェクトで `npx vite build --config vite.mobile.config.ts` を実行します。プラグイン名は 3 ホスト共通で `workersCapacitorPlugin` です。既定では Worker をリモート実行するため、`https://worker.invalid` をデプロイ済み Worker オリジンに置き換えてください。生成 Worker と公開アセットは[フレームワークガイド](build-setup.md#frameworks)に従います。Android のエントリーは `workersAndroid` を使い、各ターゲットの出力を分離します。

`index.html` を含む出力ディレクトリー**全体**をネイティブアプリに同梱します。クラウドのデプロイ出力をこのビルド先にせず、Cloudflare ビルドにプラグインを追加しないでください。ローカルルート許可とリモート認証は [Capacitor](integration.md) と同じです。SDK は同梱エントリーを起動し、`render: "/"` が初期 Worker ページを選びます。`ready` はランタイム初期化を通知し、ページのスクリプトや画像の完了ではありません。

## 依存関係の設定

npm パッケージは `cf-workers-native` の 1 つです。`/ios`、`/android`、`/capacitor` は別パッケージでなくサブパス import です。パッケージルートのランタイムエントリーはありません。`WorkersIOS` は SwiftPM product、`io.github.rdlabo:cf-workers-native-android` は Android Maven アーティファクトです。

改名後の npm パッケージは公開準備中です。公開後は Web プロジェクトに 0.1.2 Preview を導入します。

```sh
npm install cf-workers-native@0.1.2
```

それまでは対応するチェックアウトから JavaScript パッケージの tarball を作成します。

```sh
# SDK のチェックアウト内:
npm install
npm pack

# Web プロジェクト内:
npm install /path/to/cf-workers-native/cf-workers-native-0.1.2.tgz
```

`npm pack` は `prepack` でビルドし、上のファイル名は現在のソース版を使います。SDK ツリーへのリンクを避けるため、チェックアウトではなく tarball を導入します。チェックアウト内のアプリでは再帰パスになる場合があります。iOS Swift パッケージと Android 公開物も同じ Git リビジョンを使います。公開済み `workers-capacitor@0.1.1` にはこれらのエントリーはありません。

旧 npm からの移行では `cf-workers-native` 導入前に `workers-capacitor` 依存を削除します。[移行手順](integration.md#migrating-from-the-old-npm-package)を参照し、Web プロジェクトには新名だけを残してください。

ネイティブプロジェクトが使用するのは生成アセットとネイティブ依存だけです。ソースの npm・ビルドツールは Web ビルドか CI で使用します。

## iOS

`https://github.com/rdlabo-dev/cf-workers-native` を Swift パッケージに追加し、0.1.2 Preview npm に対応する `v0.1.2` タグ（ソースビルドなら一致するリビジョン）に固定して `WorkersIOS` product を選びます。ネイティブ依存ツールチェーンが要求する Xcode 26 / Swift 6.2 以降を使います。生成アセットを `WorkerWeb` などのフォルダーリソースとして追加し、メインアクターでそのディレクトリーからコントローラーを作ります。

```swift
import WorkersIOS

let assets = Bundle.main.resourceURL!.appendingPathComponent("WorkerWeb")
let workers = try WorkersViewController(assets: assets)
workers.onStartupError = { message in
    // 既存のネイティブ画面にエラーを表示します。
    print(message)
}
```

通常の UIKit の子コントローラー包含、または既存画面からの表示を使います。取り除く・閉じる前に終了を await します。

```swift
try await workers.close()
```

JavaScript の破棄に失敗してもリソースを解放します。エラーはアプリに適した方法で報告してください。閉じたコントローラーは再利用できないため、再度開く際は新しく作ります。

SwiftUI ではビューの寿命中コントローラーを保持し、`WorkersView(controller: workers)` を埋め込みます。Representable の破棄時に自動的に閉じます。SDK が自身の Capacitor 設定と Workers プラグイン登録を行うため、アプリでの登録や application delegate の置き換えは不要です。

Worker 起動が失敗すると埋め込みランタイムを解放し、`startupError` と `onStartupError` で通知します。SDK はネイティブナビゲーションを戻したり置き換えたりしません。コントローラーの初回表示から 30 秒以内に起動を完了する必要があります。JavaScript からエラー報告できないエントリースクリプトの欠落・破損も検出します。明示的に閉じると保留中の起動通知をキャンセルします。

## Android

アプリの依存に SDK の Android Maven 公開物を追加し、生成 Web ディレクトリーを `src/main/assets/` 配下（例: `worker-web`）に含めます。公開物が Capacitor と他のネイティブ依存を解決します。新しい座標は `io.github.rdlabo:cf-workers-native-android:0.1.2` です。公開準備中のため、それまでは[独立した Android 利用側](../demo/tests/native-embedding/android/README.md)でローカル Maven をビルドします。公開後は Maven Central から取得します。Java 21 と Android SDK 36 を使い、`ANDROID_HOME` を導入済み SDK に設定します。アプリの依存リポジトリーに `google()` と `mavenCentral()` を含めます。Groovy の `build.gradle`:

```groovy
dependencies {
    implementation 'io.github.rdlabo:cf-workers-native-android:0.1.2'
}
android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_21
        targetCompatibility JavaVersion.VERSION_21
    }
    packaging.resources {
        excludes += 'META-INF/INDEX.LIST'
        merges += 'META-INF/io.netty.versions.properties'
    }
}
```

リソース規則はネイティブ通信依存のメタデータを統合します。ローカル SDK 開発・リリース確認は[独立した Android 利用側](../demo/tests/native-embedding/android/README.md)を参照してください。生成ディレクトリーを `src/main/assets/worker-web/` に維持し、その直下に `index.html` を置きます。

既存 Activity から SDK 所有の画面を開きます。

```java
import jp.rdlabo.workerscapacitor.WorkersNative;

if (WorkersNative.isSupported()) {
    WorkersNative.open(this, "worker-web");
} else {
    // Show an unsupported-WebView message in your existing native UI.
}
```

既存 Activity は ComponentActivity のままで構いません。SDK が AppCompatActivity と WebView を所有し、アプリでの継承元変更、Capacitor ブリッジ初期化、Workers プラグイン登録は不要です。

端末の Android WebView は AndroidX WebKit の `MULTI_PROFILE` 対応が必須です。利用可否が不明な端末では画面を提示する前に `WorkersNative.isSupported()` を確認します。非対応時は `open()` が `UnsupportedOperationException` を投げます。WebView の更新で対応する可能性があります。

SDK は Cookie、ストレージ、Service Worker ルーティングに専用の永続 WebView プロファイルを使います。ホストのセッション Cookie、Java の `CookieHandler`、Service Worker クライアントは変更しません。SDK Cookie はホストと分離され、画面を開き直しても保持します。このホストでは Capacitor のアプリ全体用コアプラグインは登録しません。

有効にできる SDK 画面は同時に 1 つです。Activity の再生成は旧ランタイムの所有権解放を待ってから後継を開始します。起動は 30 秒以内に完了する必要があり、失敗・未完了なら SDK 画面を閉じて既存 Activity に戻ります。

## 互換性

JS とネイティブ SDK のリビジョンを揃えます。新ホストは既存の cf-workers-native ランタイム・ビルドツールを共有し、Cloudflare デプロイ入力の変更やリモート Worker の追加デプロイは行いません。

汎用ネイティブプラグインは既存の [Capacitor 連携](native-rendering-api.md)を使用します。埋め込みホストが提供するのは Workers UI とそのランタイム接続です。

## 検証

ホストアプリで開く、遷移、フォーム送信、認証、閉じる、再度開くという実際のユーザーフローを確認します。iOS は UIKit ビューの除去・SwiftUI ビューの破棄、Android は回転・Activity 再生成も含めます。既存のホストセッションと WebView フローが動くことを確認します。Android SDK Cookie は別プロファイルなので、ホスト WebView のログインが移ると仮定しないでください。Worker の認証・認可を維持します。[共通のセキュリティー指針](integration.md#5-security-the-device-is-not-a-trusted-server)を参照してください。

独立した [iOS 利用側](../demo/tests/native-embedding/ios/README.md)・[Android 利用側](../demo/tests/native-embedding/android/README.md)は、起動失敗、エントリー欠落、起動期限後の正常動作など再現可能な SDK 受け入れ検証を提供します。対象はシミュレーター・エミュレーターで、実機動作や WebView 解放の測定ではありません。Capacitor デモでの一般フレームワーク受け入れ検証は、埋め込みホスト内でも全フローを検証したという主張ではありません。
