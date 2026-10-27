---
title: Cordovaプラグインへの組み込み
sourceRevision: "b9c7dbc4c2b9f20415a214817f7c002e4cd9de3db914149ed6bd3ed59f7a00c9"
---
# Cordovaプラグインへの組み込み

同じnpmパッケージ、Swiftライブラリ、Android AARがCapacitorとCordovaに対応します。Engineはプラグインのメンテナーが使うライブラリであり、個別に登録するCordovaプラグインではありません。Cordovaアプリに`@capacitor/core`やCapacitorのネイティブSDKは不要です。

ネイティブビューと対応するDOMの配置、サイズ、重なり順は、利用側プラグインが引き続き管理します。`native-ad`や`#player`などの既存セレクターを指定してください。DOMは初期化後に追加しても構いません。画像準備、スクロール処理、オーバーレイ、復元には共通のEngine実装を使います。

## 要件

標準WebViewを使用したcordova-ios 8.1.1とcordova-android 15.1.0で組み込みを検証しています。Engine自体にはiOS 15以上とAndroid API 23以上が必要ですが、CordovaホストやSDKがさらに高い最小バージョンを要求する場合があります。Androidの合成済みキャプチャにはAPI 26以上が必要です。

## 依存関係

Webパッケージとネイティブライブラリで、同じEngineリリースを使います。APIは1.0未満の段階なので、バージョンを固定し、依存関係のロックファイルを保持してください。

```sh
npm install --save-exact @webview-native-ui/engine@0.0.1
```

利用側プラグインでもネイティブ依存を宣言します。npmのインストールだけでは、いずれのネイティブライブラリもリンクされません。

Swift Package Managerの場合:

```swift
.package(url: "https://github.com/webview-native-ui/engine.git", exact: "0.0.1")
// プラグインターゲットの依存関係:
.product(name: "WebViewNativeUIEngine", package: "engine")
```

プラグインのAndroid Gradle設定の場合:

```groovy
dependencies {
    implementation 'io.github.webview-native-ui:engine:0.0.1'
}
```

利用側ビルドの依存リポジトリに`google()`と`mavenCentral()`を含めてください。

## iOS

CordovaのSwiftPMプラグインでは、プラグインターゲットの依存としてCordovaとEngineの両方を宣言します。どちらのフレームワークもEngineターゲットの依存にはなりません。プラグインの既存SwiftPMプロダクトとソースファイルの宣言を維持します。

アプリからの最初の呼び出し前にレンダラーを表示する必要がある場合は、`plugin.xml`のiOSプラットフォームセクションでプラグインを起動時に登録します。

```xml
<platform name="ios" package="swift">
    <config-file target="config.xml" parent="/*">
        <feature name="ExamplePlugin">
            <param name="ios-package" value="ExamplePlugin" />
            <param name="onload" value="true" />
        </feature>
    </config-file>
    <!-- プラグインの既存ソースファイル宣言を維持します。 -->
</platform>
```

プラットフォームセクションを重複追加せず、既存セクションへこれらの設定を統合してください。[組み込み検証用の構成](https://github.com/webview-native-ui/engine/tree/v0.0.1/tests/cordova/plugin)には、plugin.xml、SwiftPM、Gradleの完全な設定があります。

例では既存のレンダラーを拡張します。`nativeView`は接続・配置済みのビューであり、Engineが作成するビューではありません。

```swift
import Cordova
import WebKit
import WebViewNativeUIEngine

@objc(ExamplePlugin)
class ExamplePlugin: CDVPlugin {
    private var projection: NativeUIProjection?
    private var nativeView: UIView?

    override func pluginInitialize() {
        // 既存のレンダラーでnativeViewをここで作成・接続・配置します。
        do {
            projection = try NativeUIProjection(
                webView: webView as? WKWebView,
                plugin: "ExamplePlugin",
                projectionSelector: "#player",
                receiveListeners: .init(
                    update: ["contentChanged"],
                    projection: .init(native: ["shown"], web: ["covered"], none: ["hidden"])
                ),
                runtime: .cordova,
                view: { [weak self] in self?.nativeView }
            )
        } catch {
            // 登録が利用できない場合は既存のWebフォールバックを維持します。
            NSLog("Native UI projection unavailable: %@", String(describing: error))
        }
    }

    override func dispose() {
        projection?.destroy()
        projection = nil
        super.dispose()
    }
}
```

iOSレンダラーを後から読み込む場合は、ビューを接続してから登録を作成します。レンダラーを置き換える前に、古い登録を破棄してください。

プラグインの既存の表示・コンテンツ通知を、`projection?.receive("shown")`、`receive("hidden")`、`receive("contentChanged")`で転送します。既存のコールバック・イベント送信箇所、またはプラグインの共通通知メソッドに追加してください。`receive`はEngineセッションだけを更新し、アプリへ2回目のコールバックを送信しません。JS起動前に送信された、一致する投影先は初回接続用に保持されます。

Cordova iOS組み込みの`WkWebView.convertFilePath`が準備済みPNGを配信します。Engineが内部で解決するため、ファイルプラグイン、追加権限、開発者によるURL変換関数は不要です。既定の許可オリジンには`app://localhost`が含まれます。アプリのスキームやホスト名を変更した場合は、実際に信頼するオリジンを渡してください。

## Android

既存のCordovaプラグインのGradle設定にMaven依存を宣言します。`CordovaPluginPathHandler`のシグネチャを使う場合は、`implementation 'androidx.webkit:webkit:1.14.0'`も宣言してください。Cordova内部のWebKit依存は、プラグインのコンパイルクラスパスに公開されません。最初のWebViewナビゲーション前に初期化されるよう、プラグインの`plugin.xml`のAndroidプラットフォームセクションに次の登録を統合します。

```xml
<platform name="android">
    <config-file target="res/xml/config.xml" parent="/*">
        <feature name="ExamplePlugin">
            <param name="android-package" value="com.example.ExamplePlugin" />
            <param name="onload" value="true" />
        </feature>
    </config-file>
    <!-- 既存のソースファイルとGradleフレームワークの宣言を維持します。 -->
</platform>
```

```kotlin
import android.view.View
import android.webkit.WebView
import io.github.webview_native_ui.engine.NativeUIProjection
import org.apache.cordova.CordovaPlugin
import org.apache.cordova.CordovaPluginPathHandler

class ExamplePlugin : CordovaPlugin() {
    private var projection: NativeUIProjection? = null
    private var nativeView: View? = null

    override fun pluginInitialize() {
        val web = webView.view as WebView
        projection = runCatching {
            // One origin-restricted channel per WebView, shared with later registrations.
            NativeUIProjection.install(web)
            // Existing renderer creates, attaches and positions nativeView here.
            NativeUIProjection(
                window = cordova.activity.window,
                webView = web,
                plugin = serviceName,
                projectionSelector = "#player",
                receiveListeners = NativeUIProjection.ReceiveListeners(
                    update = listOf("contentChanged"),
                    projection = NativeUIProjection.ReceiveListeners.Projection(
                        native = listOf("shown"), web = listOf("covered"), none = listOf("hidden")
                    )
                ),
                runtime = NativeUIProjection.Runtime.CORDOVA,
                view = { nativeView }
            )
        }.onFailure {
            android.util.Log.e(javaClass.simpleName, "Native UI projection unavailable", it)
        }.getOrNull()
    }

    override fun getPathHandler() = CordovaPluginPathHandler { path ->
        projection?.handleResource(path)
    }

    override fun onDestroy() {
        projection?.close()
        projection = null
        super.onDestroy()
    }
}
```

iOSと同様に、既存の通知箇所で`projection?.receive(eventName, data)`を使います。ネイティブビューの作成と配置はUIスレッドで行います。レンダラーを非同期に読み込む場合は、`install(web)`を`pluginInitialize()`に残し、ビューの準備後に登録を作成してください。そのレンダラーを置き換える前に、古い登録を閉じます。

`PathHandler`は同一オリジンの画像リクエストをEngineへ委譲します。アプリ専用キャッシュストレージにある、その登録のPNGだけを配信し、無関係なパスには`null`を返します。プラグインに既存ハンドラーがある場合は、`projection?.handleResource(path) ?: existingHandler.handle(path)`で組み合わせます。登録が複数ある場合は、一致する所有者へ委譲します。ハンドラーはWebViewの生存期間中、インストールされたままにしてください。WebViewClientの置き換えやストレージ権限は不要です。

既定値はCordovaの`https://localhost`と`http://localhost`に対応します。ホスト名を変更する場合は、`install`と各登録に同じ明示的なオリジン集合を渡してください。この組み込みでは、ワイルドカードオリジンと`file://`のアプリオリジンには対応しません。

## 生存期間と検証

WebViewの生存期間中は登録を保持します。Engineはドキュメント再読み込み後に再接続し、古いドキュメントの画像状態を消去します。プラグインが`onReset`でネイティブUIを破棄する場合は、ビュープロバイダーを更新して適切な投影先を通知してください。破棄済みビューを指す登録を残してはいけません。プラグイン・WebViewを破棄するときに登録を解放します。

Capacitorの登録は既存の既定値を維持します。Cordovaの組み込みには標準のCordova WebViewリソースハンドラーが必要です。Capacitorアプリ内でCordovaプラグインを動かす構成はこの組み込みの対象外で、ホストはCapacitor向けの組み込みを使う必要があります。セレクター、レイアウト、キャプチャの規則は共通の[DOMとネイティブサーフェスの要件](projection.md#dom-and-native-surface-requirements)を参照してください。[Ionicオーバーレイ対応](projection.md#ionic-overlay-support-optional)は任意で、通常のCordovaアプリでは有効化不要です。

組み込み検証用の構成は、Cordova CLI 13、cordova-ios 8.1.1、cordova-android 15.1.0と標準WebViewを使います。JSブリッジのモックだけでなく、実際のPNG受け渡し、ネイティブ復元、ドキュメント再読み込み後の非表示状態の保持を検証します。古いCordovaリリースやカスタムWebViewエンジンは、別途検証が必要です。

起動済みのシミュレーター・エミュレーターで、実際の利用側のチェックを実行します。

```sh
npm run test:cordova -- ios SIMULATOR_UDID
npm run test:cordova -- android emulator-5554
```

スクリプトは使い捨てのアプリを作成し、ローカルのSwiftPM・MavenのEngineアーティファクトを使って、表示された一時ディレクトリにアプリの実行結果を記録します。npmやMavenへの公開は行いません。AndroidにはJDK 21以上、SDK 36、`ANDROID_HOME`が、iOSにはXcodeが必要です。

## アニメーションするネイティブコントロール

ネイティブの外観が更新されると、既定では50 msのデバウンス後に置き換え用の画像を準備します。
更新通知の後もコントロールのアニメーションが続く場合は、ネイティブ側の登録で`captureDelayMs`を設定してください（Swift: `captureDelayMs: 600`、Kotlin: `captureDelayMs = 600`）。
この設定が変更するのはバックグラウンドでの画像準備であり、オーバーレイを表示するタイミングではありません。
キャッシュの動作と計測に基づく指針については、[キャプチャのタイミング](projection.md#capture-timing)を参照してください。
