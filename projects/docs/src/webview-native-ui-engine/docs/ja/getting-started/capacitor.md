---
title: "Capacitorプラグインへの組み込み"
sourceRevision: "2dede6099bb18549e5df650943c33a37b1519afe268c4896ab9e6a6caed254ce"
---
# Capacitorプラグインへの組み込み

公開している`registerPlugin()`のエクスポートを変えずに、既存のCapacitorプラグインへWeb投影と復元を追加します。プラグインはネイティブレンダラーとアプリケーションAPIを維持し、EngineがネイティブビューとDOMフォールバックを連携させます。

このガイドでは、依存関係、登録、通知、終了処理を扱います。最小の呼び出し、必須入力、所有権は、[ネイティブ初期化](initialization.md)から確認してください。以下のプラグイン差分では、イベントの接続とライフタイムの処理を追加します。厳密な契約とプラットフォームの制約は、[投影リファレンス](../reference/projection.md)を参照してください。

Capacitorのタブバープラグインでは、アプリは同じ表示・選択メソッドを使い続けるべきです。ネイティブプラグインに登録を追加し、成功した更新を転送すれば、各アプリが画像ハンドオフを実装せずに、Webモーダルでバーを覆えます。

## 要件

このパッケージはCapacitor 8（`>=8.0.0 <9`）への対応を宣言しています。EngineライブラリはiOS 15以上、Android API 23以上を必要とします。利用側のCapacitorバージョンやSDKによっては、さらに高い最低バージョンが必要です。Androidの合成済みキャプチャにはAPI 26以上と、[投影リファレンス](../reference/projection.md#dom-and-native-surface-requirements)に記載されたWebView機能が必要です。

## Webの投影先を選ぶ

登録ごとに、Web投影を置くレイヤーにレイアウト済みのDOMコンテナを1つ用意します。登録後に挿入してもかまいません。ネイティブビューの配置とサイズは引き続きプラグインが管理します。Engineは、どちらのビューも代わりに作成・サイズ設定しません。

セレクターを接続する前に、[対応コンテナ](../reference/containers.md)を選んでください。カスタム要素、SDKコンテンツ、複数サーフェスを組み込む前に、[DOMとネイティブサーフェスの要件](../reference/projection.md#dom-and-native-surface-requirements)を確認します。スクロール追従と画像のハンドオフは登録内で処理します。Ionicアプリでは、起動時に一度だけ任意の[Ionicオーバーレイ対応](../configuration/ionic-overlays.md)を有効にできます。他のフレームワークは、自身の画面遷移やオーバーレイのライフサイクルから、設定した投影通知を発行します。

## プラグイン内にインストールする

以下のすべての依存にある`<engine-version>`を、同じ公開リリースのバージョンに置き換えます。例をAPIに一致させるため、そのリリースタグのドキュメントを読んでください。

```sh
npm install --save-exact '@webview-native-ui/engine@<engine-version>'
```

npmアーカイブには、TypeScript宣言、ESM、Swiftソース、podspecが含まれます。ネイティブ依存も利用側のプラグインで宣言する必要があります。npm依存だけでは、SwiftライブラリもAndroid AARもリンクされません。

主なネイティブ配布方式はSwift Package Managerです。プラグインからリポジトリルートのライブラリに依存します。

```swift
.package(url: "https://github.com/webview-native-ui/engine.git", exact: "<engine-version>")
// プラグインターゲットの依存に追加:
.product(name: "WebViewNativeUIEngine", package: "engine")
```

APIが1.0未満の間は、npm、SwiftPM、Gradle、CocoaPodsで同じEngineリリースを固定し、意図的に更新してください。アプリは再現可能なビルドのために、依存のロックファイルを保持します。

SwiftPMは、このリポジトリの`v0.0.1`などのバージョンタグを解決します。未リリース版の組み込みテストには、ローカルチェックアウトまたは検証済みの明示的なコミットを使います。

`import WebViewNativeUIEngine`にはCapacitorの登録は不要です。npm側はDOM計測とWeb画像のハンドオフを提供し、SwiftPMはnpmのhoistingとは独立してネイティブ依存を解決します。

### Android：Maven依存を追加する

利用側プラグインの`android/build.gradle`に、npm依存と同じEngineバージョンを追加します。

```groovy
dependencies {
    implementation 'io.github.webview-native-ui:engine:<engine-version>'
}
```

利用側ビルドの依存リポジトリに、`google()`と`mavenCentral()`があることを確認します。リポジトリを一元管理するビルドでは、`android/settings.gradle`へ統合してください。

```groovy
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}
```

プロジェクト単位のリポジトリを使うビルドでは、既存の`repositories`ブロックへ追加します。npmパッケージのインストールでは、このGradle依存は追加されません。POMとAARをCentralから取得できるバージョンを使ってください。`PUBLISHING`は受理を示すだけで、まだダウンロードを保証しません。

### npm経由のCocoaPods互換性

CocoaPodsはnpmに同梱されたSwiftソースとpodspecを使うため、CocoaPods Trunkへの公開は不要です。プラグインのメンテナーが、プラグインのpodspecに対応する依存を宣言します。

```ruby
s.dependency 'WebViewNativeUIEngine', '<engine-version>'
```

メンテナーは、アプリ側で一度だけ行う次のセットアップも文書化する必要があります。対応するEngineバージョンをnpmの直接依存としてインストールし、Capacitorが再生成する`def capacitor_pods`の**外側、かつアプリケーションのtarget内**にローカルpodを追加します。

```sh
npm install --save-exact '@webview-native-ui/engine@<engine-version>'
```

```ruby
# ios/App/Podfile; adjust the path for a different native project layout.
target 'App' do
  capacitor_pods
  pod 'WebViewNativeUIEngine', :path => '../../node_modules/@webview-native-ui/engine'
end
```

`npx cap sync ios`を実行して再ビルドします。更新時は、Engineの直接依存のバージョンを利用側プラグインの依存と揃えます。標準と異なるnode_modules配置では、`:path`をインストール済みEngineパッケージのディレクトリへ向けます。npm依存だけではPodは登録されず、podspecの依存ではこのローカルパスを指定できません。Engineは意図的にCapacitorプラグイン登録やPodfile書き換えフックを持ちません。SwiftPM利用側に、このCocoaPodsの設定は不要です。

## ネイティブプラグインから登録する

プラグインの通常の`registerPlugin()`エクスポートと公開メソッドは変えず、ネイティブレンダラーの作成後に登録を作成して保持します。EngineはSwift/AndroidライブラリにWebランタイムを同梱し、現在と今後のドキュメント内で起動して、既存のフォールバックDOMを見つけ、プラグイン通知を購読します。アプリが別のJS初期化関数を呼ぶ必要はありません。

通知すべき成功した変更と起動時の振り分けは、[通知の契約](../configuration/events.md)で定義しています。

組み込みには3つの責務があります。

1. 利用側は、正しいレイヤーに存在するレイアウト済みのWebフォールバックコンテナを用意します。この投影先を、必須の`projectionSelector: string`として渡します。`null`やDOM自動作成のモードはありません。
2. プラグインは、各プラットフォームでネイティブビューと通知名を一度登録します。
3. プラグインは更新後に通知を発行し、終了処理で登録を解放します。

### iOS：`CAPPlugin`クラスに登録を追加する

`ios/Sources/ExamplePlugin/ExamplePlugin.swift`で登録をプロパティとして保持し、**既存のレンダラーがビューを作成・取り付けた後**に`load()`で初期化します。

この差分の`nativeView`は、プラグインがすでに所有する`UIView`です。既存の描画処理はコメントで表しています。

`identifier`ではなく、既存の**`jsName`**を使ってください。CapacitorはJSプラグイン呼び出しとイベント購読に`jsName`を使います。Engine設定でプラグイン名を繰り返し定義しないでください。

```diff
 import Capacitor
 import UIKit
+import WebViewNativeUIEngine

 @objc(ExamplePlugin)
 public class ExamplePlugin: CAPPlugin, CAPBridgedPlugin {
     public let identifier = "ExamplePlugin"
     public let jsName = "Example"
     public let pluginMethods: [CAPPluginMethod] = [
         CAPPluginMethod(name: "setColors", returnType: CAPPluginReturnPromise)
     ]
     private var nativeView: UIView?
+    private var projection: NativeUIProjection?

     public override func load() {
         // 既存のコードでnativeViewを作成し、取り付けます。
+        do {
+            projection = try NativeUIProjection(
+                webView: bridge?.webView,
+                plugin: jsName,
+                projectionSelector: "#native-ui-fallback",
+                receiveListeners: .init(
+                    update: ["appearanceChanged"],
+                    projection: .init(
+                        native: ["shown"],
+                        web: ["transitionStarted"],
+                        none: ["hidden"]
+                    )
+                ),
+                view: { [weak self] in
+                    self?.nativeView
+                }
+            )
+        } catch {
+            CAPLog.print("Native UI projection unavailable: \(error)")
+        }
     }

     @objc func setColors(_ call: CAPPluginCall) {
         DispatchQueue.main.async {
             // 既存のコードで要求された色をnativeViewに適用します。
+            self.notifyListeners("appearanceChanged", data: [:])
             call.resolve()
         }
     }
+
+    public override func notifyListeners(_ eventName: String, data: [String: Any]?, retainUntilConsumed: Bool) {
+        projection?.receive(eventName, data: data)
+        super.notifyListeners(eventName, data: data, retainUntilConsumed: retainUntilConsumed)
+    }
+
+    deinit {
+        projection?.destroy()
+    }
 }
```

`bridge?.webView`を直接渡します。WebViewが利用できなければ、Engineは同じ`catch`へ初期化エラーを投げます。別のguardやforce unwrapは不要です。

既存の`initialize` / `show`メソッドで後からビューを作成する場合、`load()`ではなく、そのビュー作成後に登録を置きます。レンダラーのライフタイム中に登録は1つだけ保持し、更新ごとに増やさないでください。レンダラーの置換時は、古い登録を破棄してから置換先を登録します。

### Android：`Plugin`クラスに登録を追加する

`android/src/main/java/<your-package>/ExamplePlugin.kt`に対応する変更を加えます。**`pluginHandle.id`**は`@CapacitorPlugin`から得られるCapacitorの登録済みプラグイン名です。別の名前文字列は不要です。

```diff
 import android.view.View
 import com.getcapacitor.Plugin
 import com.getcapacitor.PluginCall
 import com.getcapacitor.PluginMethod
 import com.getcapacitor.annotation.CapacitorPlugin
+import android.util.Log
+import com.getcapacitor.JSObject
+import io.github.webview_native_ui.engine.NativeUIProjection
+import io.github.webview_native_ui.engine.NativeUIProjection.ReceiveListeners

 @CapacitorPlugin(name = "Example")
 class ExamplePlugin : Plugin() {
     private var nativeView: View? = null
+    private var projection: NativeUIProjection? = null

     override fun load() {
         // 既存のコードでnativeViewを作成し、取り付けます。
+        projection = runCatching {
+            NativeUIProjection.install(bridge.webView)
+            NativeUIProjection(
+                window = activity.window,
+                webView = bridge.webView,
+                plugin = pluginHandle.id,
+                projectionSelector = "#native-ui-fallback",
+                receiveListeners = ReceiveListeners(
+                    update = listOf("appearanceChanged"),
+                    projection = ReceiveListeners.Projection(
+                        native = listOf("shown"),
+                        web = listOf("transitionStarted"),
+                        none = listOf("hidden")
+                    )
+                ),
+                view = { nativeView }
+            )
+        }.onFailure {
+            Log.e(javaClass.simpleName, "Native UI projection unavailable", it)
+        }.getOrNull()
     }

     @PluginMethod
     fun setColors(call: PluginCall) {
         activity.runOnUiThread {
             // 既存のコードで要求された色をnativeViewに適用します。
+            notifyListeners("appearanceChanged", JSObject())
             call.resolve()
         }
     }
+
+    override fun notifyListeners(eventName: String, data: JSObject, retainUntilConsumed: Boolean) {
+        projection?.receive(eventName, data)
+        super.notifyListeners(eventName, data, retainUntilConsumed)
+    }
+
+    override fun handleOnDestroy() {
+        projection?.close()
+        projection = null
+        super.handleOnDestroy()
+    }
 }
```

Androidでは、SDKビューが後から届く場合も、最初のナビゲーションより前に、プラグインの`load()`で`NativeUIProjection.install(bridge.webView)`を呼びます。インストールを登録と同じエラー処理の範囲に含めてください。失敗した場合は既存のWebフォールバックを維持し、ナビゲーション後にインストールを再試行しないでください。その後の登録は、メインフレーム限定・オリジン制限付きのチャネルを共有し、読み込み済みWebViewに新しいメッセージリスナーを追加しません。ナビゲーション前にチャネルをインストールすると、非同期に読み込まれるビューを登録する際のWebViewのネイティブクラッシュを避けられます。登録のコンストラクターがチャネルをインストールできるのは、まだナビゲーションしていないWebViewだけです。遅いインストールは危険な注入を試みず、対処可能なエラーで失敗します。同じWebView上のすべての登録は同じ許可オリジンを使う必要があります。登録を閉じるとチャネルからその所有者だけを除くため、他の登録済みビューは動作し続けます。共有チャネルはWebViewのライフタイム中インストールされたままですが、利用側のプラグインは引き続き各登録を保持し、閉じる必要があります。

どちらの差分も、非公開プロパティ、ネイティブ登録、通知のoverride、更新通知、終了処理を追加します。`pluginMethods`にEngineメソッドを追加せず、公開JSラッパーやアプリ側Engine初期化関数も追加しません。

プラグインの既存の`registerPlugin()`エクスポートを維持します。登録と`notifyListeners`では同じイベント名を使ってください。すでに適切なイベント（`tabSelected`など）を発行していれば、二重に発行せず、そのイベントをリストへ記載します。

## 組み込みを検証する

コントロールを表示し、外観を変更してから、上を覆うWebオーバーレイを開閉します。準備済みの外観が現在のコントロールのものであること、現在の位置でネイティブ操作に戻ることを確認します。非表示、コンテナの置換、プラグインの終了処理も確認してください。遅れた応答が退場済みのコンテンツを表示してはいけません。画像がない場合も試し、選んだWebフォールバックを検証します。

対応する実機で、実際のコントロールと背景を使ってください。ブリッジの成功だけでは見た目の連続性は検証できません。ページごとにコントロールをすでにバッチ処理するレンダラーでは、ハンドオフごとに登録の仕組みを重複させず、[レンダラーガイド](../advanced/renderer.md)へ進んでください。

## 次の手順：任意の動作を選ぶ

通知の振り分け、値の反映、キャプチャのタイミング、フォールバック方針は、[設定ガイド](../configuration/README.md)を使います。これらの共通設定は、プラットフォームの追加セットアップではありません。コントロールをすでにバッチ処理するレンダラーは、[高度なAPI](../advanced/README.md)を参照してください。
