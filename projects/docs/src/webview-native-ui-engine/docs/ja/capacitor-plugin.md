---
title: Capacitorプラグインへの組み込み
sourceRevision: "29a853bd743ebc097648db337c854079bf03fecfa6669d14dfc2cf0eda593f64"
---
# Capacitorプラグインへの組み込み

公開している`registerPlugin()`のエクスポートを変えずに、既存のCapacitorプラグインへWeb投影と復元を追加します。プラグインはネイティブレンダラーとアプリ向けAPIを維持し、EngineがネイティブビューとDOMフォールバックを連携させます。

このガイドでは依存関係、登録、通知、終了処理を説明します。共通のDOM要件、キャプチャ方針、高度な組み込みは[投影の動作](projection.md)を参照してください。

## 要件

このパッケージはCapacitor 8（`>=8.0.0 <9`）への対応を宣言しています。Engineライブラリ自体にはiOS 15以上とAndroid API 23以上が必要ですが、利用側のCapacitorバージョンやSDKがさらに高い最小バージョンを要求する場合があります。Androidの合成済みキャプチャにはAPI 26以上と、[投影リファレンス](projection.md#dom-and-native-surface-requirements)で説明するWebView機能が必要です。

## プラグイン内へのインストール

```sh
npm install --save-exact @webview-native-ui/engine@0.0.1
```

npmアーカイブにはTypeScript宣言、ESM、Swiftソース、podspecが含まれます。利用側プラグインでもネイティブ依存を宣言する必要があります。npm依存を追加するだけでは、SwiftライブラリもAndroid AARもリンクされません。

主なネイティブ配布方法はSwift Package Managerです。プラグインから、リポジトリルートのライブラリに依存します。

```swift
.package(url: "https://github.com/webview-native-ui/engine.git", exact: "0.0.1")
// プラグインターゲットの依存関係:
.product(name: "WebViewNativeUIEngine", package: "engine")
```

新しい座標は`0.0.1`から始まります。APIが1.0未満の間は、npm、SwiftPM、Gradle、CocoaPodsを同じEngineリリースに固定し、内容を確認して更新してください。再現可能なビルドのため、アプリは依存関係のロックファイルを保持します。

SwiftPMは、このリポジトリの`v0.0.1`などのバージョンタグを解決します。未リリースの組み込みテストでは、ローカルチェックアウトまたは検証済みコミットの明示指定を使ってください。

`import WebViewNativeUIEngine`にCapacitorへの登録は不要です。npm側がDOM計測とWeb画像の受け渡しを提供し、SwiftPMはnpmのhoistingとは独立してネイティブ依存を解決します。

### Android: Maven依存の追加

利用側プラグインの`android/build.gradle`に、npm依存と同じEngineバージョンを追加します。

```groovy
dependencies {
    implementation 'io.github.webview-native-ui:engine:0.0.1'
}
```

利用側ビルドの依存リポジトリに`google()`と`mavenCentral()`があることを確認してください。リポジトリを一元管理するビルドでは、`android/settings.gradle`に統合します。

```groovy
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}
```

プロジェクト単位のリポジトリを使う場合は、既存の`repositories`ブロックに追加します。npmパッケージのインストールでは、このGradle依存は追加されません。POMとAARがCentralから入手できるバージョンを使ってください。`PUBLISHING`は受け付けを確認するだけで、まだダウンロードを保証しません。

### npm経由のCocoaPods互換性

CocoaPodsはnpmに同梱されたSwiftソースとpodspecを使うため、CocoaPods Trunkへの公開は不要です。プラグインのメンテナーは、プラグインのpodspecに対応する依存を宣言します。

```ruby
s.dependency 'WebViewNativeUIEngine', '0.0.1'
```

メンテナーは、次の初回のみ必要なアプリ設定も説明する必要があります。対応するEngineバージョンをnpmの直接依存としてインストールし、ローカルpodを**アプリのターゲット内、かつCapacitorが再生成する`def capacitor_pods`の外側**に追加します。

```sh
npm install --save-exact @webview-native-ui/engine@0.0.1
```

```ruby
# ios/App/Podfile; adjust the path for a different native project layout.
target 'App' do
  capacitor_pods
  pod 'WebViewNativeUIEngine', :path => '../../node_modules/@webview-native-ui/engine'
end
```

`npx cap sync ios`を実行し、再ビルドします。更新時は、Engineの直接依存のバージョンを利用側プラグインの依存と揃えてください。node_modulesの配置が標準と異なる場合は、インストールされたEngineパッケージのディレクトリを`:path`に指定します。npm依存だけではPodは登録されず、podspecの依存宣言でこのローカルパスは指定できません。Engineは意図的に、Capacitorプラグイン登録やPodfile書き換えフックを持ちません。SwiftPMの利用者にはこのCocoaPods設定は不要です。

## ネイティブプラグインからの登録

プラグインの通常の`registerPlugin()`エクスポートと公開メソッドを維持します。ネイティブレンダラーを作成した後で登録を作成し、保持してください。EngineはSwift・AndroidライブラリにWebランタイムを同梱し、現在および今後のドキュメントで起動して、既存のフォールバックDOMを見つけ、プラグインの通知を購読します。アプリから別のJS初期化処理は呼びません。

組み込みには3つの責務があります。

1. 利用側は、適切なレイヤーに、レイアウト済みの既存Webフォールバックコンテナーを用意します。この投影先を必須の`projectionSelector: string`として渡します。`null`やDOM自動作成モードはありません。
2. プラグインは、各プラットフォームでネイティブビューと通知名を1回登録します。
3. プラグインは更新後に通知を送信し、終了時に登録を解放します。

### iOS: `CAPPlugin`クラスへの登録追加

`ios/Sources/ExamplePlugin/ExamplePlugin.swift`で登録をプロパティとして保持し、**既存レンダラーがビューを作成・接続した後**に`load()`内で初期化します。

この差分の`nativeView`は、プラグインがすでに所有している`UIView`です。既存の描画コードはコメントで示しています。

`identifier`ではなく、既存の**`jsName`**を使ってください。CapacitorはJSプラグイン呼び出しとイベント購読に`jsName`を使います。Engine設定でプラグイン名を重複指定しないでください。

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
         // 既存のコードでnativeViewをここで作成・接続します。
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

`bridge?.webView`をそのまま渡します。WebViewが利用できない場合は、Engineが初期化エラーを同じ`catch`へ投げるため、別のguardや強制アンラップは不要です。

既存の`initialize`・`show`メソッドで後からビューを作る場合は、`load()`ではなく、そのビュー作成後に登録を置きます。レンダラーの生存期間に対して登録を1つ保持し、更新ごとに作成しないでください。レンダラーを置き換える際は、新しい登録の前に古い登録を破棄します。

### Android: `Plugin`クラスへの登録追加

`android/src/main/java/<your-package>/ExamplePlugin.kt`にも対応する変更を加えます。**`pluginHandle.id`**は`@CapacitorPlugin`から得られるCapacitorの登録済みプラグイン名であり、別の名前文字列は不要です。

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
         // 既存のコードでnativeViewをここで作成・接続します。
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

Androidでは、SDKのビューが後から用意される場合も、最初のナビゲーション前にプラグインの`load()`内で`NativeUIProjection.install(bridge.webView)`を呼びます。インストールも登録と同じエラー処理の範囲に含めてください。失敗したら既存のWebフォールバックを維持し、ナビゲーション後にインストールを再試行しないでください。以降の登録は、メインフレーム限定・オリジン制限付きのチャネルを共有し、読み込み済みWebViewに新しいメッセージリスナーを追加しません。これにより、非同期に読み込まれるAdMobビューの登録時に再現されたWebViewのネイティブクラッシュを回避します。登録のコンストラクターがチャネルをインストールできるのは、未ナビゲーションのWebViewだけです。遅いタイミングのインストールは、危険な注入を試みる代わりに、対処方法のわかるエラーで失敗します。同じWebView上のすべての登録で、同じ許可オリジンを使う必要があります。登録を閉じるとその所有者だけがチャネルから削除され、他のスロットは動作を続けます。共通チャネルはWebViewの生存期間中インストールされたままですが、利用側プラグインは引き続き登録を保持・終了する必要があります。

両方の差分は、非公開プロパティ、ネイティブ登録、通知のオーバーライド、更新通知、終了処理を追加します。`pluginMethods`にEngineのメソッドを追加せず、公開JSラッパーやアプリ側のEngine初期化処理も追加しません。

既存の`registerPlugin()`エクスポートを維持してください。登録と`notifyListeners`で同じイベント名を使います。プラグインがすでに適切なイベント（`tabSelected`など）を送信している場合は、二重に送信せず、そのイベントを指定してください。

### 起動中の通知

上記の通知オーバーライドにより、Webランタイムが購読する前でも、Engineは最後に一致した投影先を保持できます。別の状態変数や初期状態コールバックは不要です。通常どおりすべての通知を`super`へ転送してください。Engineは通知、更新、ユーザー操作を再実行せず、状態だけを記録します。投影先の通知がない場合は、ネイティブビューの表示状態から初期投影先を推定します。監視したい通知より前に登録が存在している必要があります。

複数の登録を所有するプラグインでは、各登録へ通知を渡します。`receiveListeners.match`が所有するサーフェスを選択します。外観の更新は投影先を変更しません。接続前のネイティブ配置と表示状態は、引き続きレンダラーが管理します。

既定のWebフォールバックでは、準備済み画像もネイティブスクロールバインディングもない状態でスクロールすると、レンダラーがネイティブを投影先とする通知によって現在のネイティブ配置を確認するまで、Webフォールバックを表示し続けます。外観更新だけでは、その確認にはなりません。ネイティブを使う失敗時の復旧を選ぶ利用側は、自身でネイティブのジオメトリを最新に保つ必要があります。

### 送信するイベント

受信イベントの宣言は、すべて`receiveListeners`に置きます。`update`のリストは画像を更新し、`projection`のリストは投影先を選択し、任意の`match`は所有するサーフェスへの通知を絞り込みます。

| 通知 | 既存プラグインでの送信箇所 |
| --- | --- |
| `appearanceChanged`（`update`イベント） | `setColors`など、ネイティブの外観更新が成功した後 |
| `transitionStarted`（`web`） | フォールバックDOMが動き始める前、またはWebレイヤーがネイティブビューを覆う前 |
| `shown`（`native`） | プラグインの既存表示処理の後、またはWeb投影から戻るとき |
| `hidden`（`none`） | プラグインの既存非表示処理の後 |

例にある名前は、利用側が決める規約であり、Engineの予約済みメソッドではありません。`update`イベントは、要求された投影先を変えずに準備済み画像を更新します。`setColors`を再び呼び出すことはありません。

DOMが動く前に`transitionStarted`、再びネイティブ投影を要求するときに`shown`、プラグイン自身の非表示処理の後に`hidden`を送信します。ネイティブキャプチャ、URL変換、画像準備、描画確認、画像の撤去、リスナーの解放はEngine内で処理します。Engineはプラグインの`show`、`hide`、選択、広告読み込みメソッドを呼びません。レンダラーを破棄するときは、iOSでは`projection.destroy()`、Androidでは`projection.close()`で登録を終了します。登録を生存期間全体で保持し、ネイティブAPIはUIスレッド上で呼んでください。

## DOM、スクロール、オーバーレイ

登録ごとに、Web投影を置くべきレイヤーにレイアウト済みDOMコンテナーを1つ用意します。登録後の挿入も可能です。ネイティブビューの配置とサイズはプラグインが引き続き管理し、Engineはどちらのビューも作成・サイズ指定しません。

カスタム要素、SDKコンテンツ、複数サーフェスを組み込む前に、[DOMとネイティブサーフェスの要件](projection.md#dom-and-native-surface-requirements)を確認してください。スクロール追従と画像の受け渡しは登録の内部で処理します。Ionicアプリでは、必要に応じて起動時に[Ionicオーバーレイ対応](projection.md#ionic-overlay-support-optional)を1回有効にします。他のフレームワークでは、それぞれの遷移・オーバーレイのライフサイクルから、設定した投影通知を送信します。

## アニメーションするネイティブコントロール

ネイティブの外観が更新されると、既定では50 msのデバウンス後に置き換え用の画像を準備します。
更新通知の後もコントロールのアニメーションが続く場合は、ネイティブ側の登録で`captureDelayMs`を設定してください（Swift: `captureDelayMs: 600`、Kotlin: `captureDelayMs = 600`）。
この設定が変更するのはバックグラウンドでの画像準備であり、オーバーレイを表示するタイミングではありません。
キャッシュの動作と計測に基づく指針については、[キャプチャのタイミング](projection.md#capture-timing)を参照してください。

### 投影用DOM

Engineはフォールバックコンテナー内に再利用可能な画像を保持し、open ShadowRootがあればその中に配置します。配置オプションは不要です。レンダラーが子要素を調べる場合は、`data-native-ui-projection-node`が付いたノードを除外してください。[DOM要件](projection.md#dom-and-native-surface-requirements)を参照してください。
