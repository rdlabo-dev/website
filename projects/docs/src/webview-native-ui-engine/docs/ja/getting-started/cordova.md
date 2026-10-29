---
title: "Cordovaプラグインへの組み込み"
sourceRevision: "c19dcb524732763438ff82a606cb2fe937763878fbcdf135f27d3818980e22eb"
---
# Cordovaプラグインへの組み込み

同じnpmパッケージ、Swiftライブラリ、Android AARでCapacitorとCordovaに対応します。Engineはプラグインのメンテナーが使うライブラリであり、別途登録するCordovaプラグインではありません。Cordovaアプリに`@capacitor/core`やCapacitorのネイティブSDKは不要です。

利用側のプラグインは、配置、サイズ、重なり順も含め、ネイティブビューと対応するDOMを引き続き所有します。`native-ad`や`#player`など、既存のセレクターを提供してください。DOMは初期化後に追加してもかまいません。画像の準備、スクロール処理、オーバーレイ、復元にはEngineの共通実装を使います。

必須入力と所有権は、[ネイティブ初期化](initialization.md)を参照してください。以下のプラットフォーム例は、Cordova固有の起動、通知転送、終了処理を追加します。コンストラクターでは任意でも、`runtime`にはCordovaを指定してください。

フィード内にネイティブ広告を表示するCordovaプラグインでは、アプリがDOMの置き場所を、プラグインがSDKとのやり取りをすでに所有しています。この方式は、Capacitor依存を追加したりSDKのクリック処理を置き換えたりせず、その置き場所と投影を接続します。読み込んだコンテンツのキャプチャは、別途許可されている必要があります。

## 要件

標準WebViewを使うcordova-ios 8.1.1とcordova-android 15.1.0で連携を検証しています。Engine自体はiOS 15以上、Android API 23以上を必要とします。CordovaホストやSDKによっては、さらに高い最低バージョンが必要です。Androidの合成済みキャプチャにはAPI 26以上が必要です。

## Webの投影先を選ぶ

`native-ad`や`#player`などのレイアウト済みコンテナを、投影した外観を置くレイヤーに用意します。登録後に挿入してもかまいませんが、投影開始時には存在しなければなりません。ネイティブビューの矩形だけでは、DOMの重なりのツリー内での意図した場所を特定できません。セレクターを選ぶ前に、[コンテナの対応表](../reference/containers.md)を確認してください。Ionicアプリでは[オーバーレイ対応](../configuration/ionic-overlays.md)を一度追加します。他のフレームワークは、通知を通じて自身の画面遷移のライフサイクルを報告します。

## 依存関係

以下のすべての依存にある`<engine-version>`を、同じ公開リリースのバージョンに置き換えます。例をAPIに一致させるため、そのリリースタグのドキュメントを読んでください。

Webパッケージとネイティブライブラリで、同じEngineリリースを使います。APIは1.0未満なので、バージョンを固定し、依存のロックファイルを保持してください。

```sh
npm install --save-exact '@webview-native-ui/engine@<engine-version>'
```

利用側のプラグインでもネイティブ依存を宣言します。npmのインストールだけでは、どちらのネイティブライブラリもリンクされません。

Swift Package Managerの場合：

```swift
.package(url: "https://github.com/webview-native-ui/engine.git", exact: "<engine-version>")
// プラグインターゲットの依存に追加:
.product(name: "WebViewNativeUIEngine", package: "engine")
```

プラグインのAndroid Gradle設定の場合：

```groovy
dependencies {
    implementation 'io.github.webview-native-ui:engine:<engine-version>'
}
```

利用側ビルドの依存リポジトリに、`google()`と`mavenCentral()`を維持します。

## iOS

CordovaのSwiftPMプラグインでは、プラグインターゲットの依存としてCordovaとEngineの両方を宣言します。どちらのフレームワークもEngineターゲットの依存にはなりません。プラグインの既存のSwiftPMプロダクトとソースファイル宣言を維持してください。

最初のアプリ呼び出しより前にレンダラーを表示する場合、`plugin.xml`のiOSプラットフォーム節でプラグインを起動時に登録します。

```xml
<platform name="ios" package="swift">
    <config-file target="config.xml" parent="/*">
        <feature name="ExamplePlugin">
            <param name="ios-package" value="ExamplePlugin" />
            <param name="onload" value="true" />
        </feature>
    </config-file>
    <!-- プラグインの既存のソースファイル宣言を維持します。 -->
</platform>
```

重複した節を追加せず、既存のプラットフォーム節にこれらの項目を統合します。[組み込みフィクスチャ](https://github.com/webview-native-ui/engine/tree/v0.0.8/tests/cordova/plugin)には、plugin.xml、SwiftPM、Gradleの完全な設定があります。

例は既存レンダラーを拡張するものです。`nativeView`は取り付け・配置済みのビューであり、Engineが作成するビューではありません。

```swift
import Cordova
import WebKit
import WebViewNativeUIEngine

@objc(ExamplePlugin)
class ExamplePlugin: CDVPlugin {
    private var projection: NativeUIProjection?
    private var nativeView: UIView?

    override func pluginInitialize() {
        // 既存のレンダラーでnativeViewを作成し、取り付けて配置します。
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
            // 登録できない場合は既存のWebフォールバックを維持します。
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

iOSのレンダラーを後から読み込む場合、ビューを取り付けてから登録を作成し、レンダラーを置き換える前に古い登録を破棄します。

プラグインの既存の表示・コンテンツ通知を、`projection?.receive("shown")`、`receive("hidden")`、`receive("contentChanged")`で転送します。既存のコールバック・イベント配信の横、またはプラグイン共通の通知メソッドに置いてください。`receive`はEngineのセッションだけを更新し、アプリへのコールバックを二重に配信しません。JS起動前に発行された、一致する投影先は初回接続用に保持されます。

Cordova iOS組み込みの`WkWebView.convertFilePath`が、準備済みPNGを配信します。Engineが内部で解決するため、ファイルプラグイン、追加の権限、作者が提供するURL変換関数は不要です。デフォルトの許可オリジンには`app://localhost`が含まれます。アプリがスキームやホスト名を変える場合は、実際の信頼するオリジンを渡してください。

## Android

既存のCordovaプラグインのGradle設定で、Maven依存を宣言します。`CordovaPluginPathHandler`のシグネチャを使う場合は、`implementation 'androidx.webkit:webkit:1.14.0'`も宣言します。Cordova内部のWebKit依存は、プラグインのコンパイルクラスパスに公開されていないためです。最初のWebViewナビゲーション前に初期化が実行されるよう、プラグインの`plugin.xml`のAndroidプラットフォーム節に次の登録を統合します。

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

iOSと同様に、既存の通知箇所で`projection?.receive(eventName, data)`を使います。更新と投影先の意味は、共通の[通知の契約](../configuration/events.md)を参照してください。ネイティブビューの作成と配置はUIスレッドに残します。レンダラーを非同期に読み込む場合も、`install(web)`は`pluginInitialize()`に残し、ビューの準備後に登録を作成します。レンダラーを置き換える前に古い登録を閉じてください。

`PathHandler`は同一オリジンの画像要求をEngineへ委譲します。アプリ専用キャッシュ内にある、その登録のPNGだけを配信し、無関係なパスには`null`を返します。プラグインに既存のハンドラーがあれば、`projection?.handleResource(path) ?: existingHandler.handle(path)`で組み合わせます。複数の登録では、一致する所有者へ委譲します。ハンドラーはWebViewのライフタイム中インストールしたままにします。WebViewClientの置換やストレージ権限は不要です。

デフォルトはCordovaの`https://localhost`と`http://localhost`に対応します。ホスト名を変える場合は、`install`と各登録に同じ明示的なオリジン集合を渡します。この連携では、ワイルドカードのオリジンや`file://`のアプリオリジンには対応しません。

## ライフタイムと検証

登録をWebViewのライフタイム中は保持します。Engineはドキュメントの再読み込み後に再接続し、古いドキュメントの画像状態を消去します。プラグインが`onReset`でネイティブUIを破棄する場合、ビューの提供元を更新し、適切な投影先を通知してください。破棄済みビューを登録が参照したままにしてはいけません。プラグインまたはWebViewの破棄時に登録を破棄します。

Cordova連携には、標準のCordova WebViewリソースハンドラーが必要です。Capacitorアプリ内でCordovaプラグインを動かす場合は、この連携の対象外です。ホストはCapacitorの組み込み方式を使ってください。セレクター、レイアウト、キャプチャのルールは、共通の[DOMとネイティブサーフェスの要件](../reference/projection.md#dom-and-native-surface-requirements)を参照してください。[Ionicオーバーレイ対応](../configuration/ionic-overlays.md)は引き続き任意で、通常のCordovaアプリでは有効化する必要はありません。

組み込みフィクスチャは、Cordova CLI 13、cordova-ios 8.1.1、cordova-android 15.1.0と、それぞれの標準WebViewを使います。JSブリッジのモックだけでなく、実際のPNGのハンドオフ、ネイティブの復元、ドキュメント再読み込みをまたぐ非表示状態の維持を確認します。古いCordovaリリースやカスタムWebViewエンジンには、別の検証が必要です。

起動済みのシミュレーター・エミュレーターで、実際の利用側のチェックを実行します。

```sh
npm run test:cordova -- ios SIMULATOR_UDID
npm run test:cordova -- android emulator-5554
```

スクリプトは使い捨てのアプリを作成し、ローカルのSwiftPM/Maven Engine成果物を使い、表示された一時ディレクトリにアプリの結果を記録します。npmやMavenへの公開は行いません。AndroidにはJDK 21以上、SDK 36、`ANDROID_HOME`が必要で、iOSにはXcodeが必要です。

## 次の手順：任意の動作を選ぶ

通知の振り分け、値の反映、キャプチャのタイミング、フォールバック方針は、[設定ガイド](../configuration/README.md)を使います。これらの共通設定は、プラットフォームの追加セットアップではありません。コントロールをすでにバッチ処理するレンダラーは、[高度なAPI](../advanced/README.md)を参照してください。
