---
title: "基本的な初期化"
sourceRevision: "55b35c15a1050e71982b5937734839562c86c9252cc3ac4451fad5da632c0f9c"
---
# ネイティブビューの登録を初期化する

プラグインがネイティブビューと対応するWebコンテナを所有する場合は、`NativeUIProjection`から始めます。登録はランタイムを起動し、そのコンテナをバインドして、画像のハンドオフと復元を調整します。この方式にレンダラーAPIは不要です。

依存のインストール、プラグインのライフサイクルフック、通知の転送は、[Capacitor](capacitor.md)または[Cordova](cordova.md)のガイドを参照してください。以下の例は、それらのフック内での最小の登録と、必須入力を示します。初期化後の任意の動作は設定ガイドにまとめています。高度なAPIには別の入口があります。

たとえば、プラグインがすでにネイティブのタブバーを描画しているところへ、アプリがWebの設定シートを開くとします。バーとフォールバックのナビゲーションホストを登録すれば、Engineはキャプチャしたバーをシートの下に置き、閉じたときにネイティブ入力を復元できます。プラグインは既存のタブ選択APIを維持します。

## 最小の初期化

レンダラーがネイティブビューを取り付けた後に、登録を1つ作成して保持します。セレクターは後から追加されるDOMコンテナに一致してもかまいませんが、ネイティブ表示はコンテナが存在するまで待ちます。[対応するレイアウト領域](../reference/containers.md)を用意してください。

CapacitorのSwiftプラグインでは、`load()`または既存レンダラーの初期化処理内に記述します。

```swift
projection = try NativeUIProjection(
    webView: bridge?.webView,
    plugin: jsName,
    projectionSelector: "#native-ui-fallback",
    view: { [weak self] in self?.nativeView }
)
```

CapacitorのKotlinプラグインでは、**最初のWebViewナビゲーションより前**に、`load()`で共有チャネルをインストールします。登録自体は、後からビューの準備ができたときに作成してもかまいません。

```kotlin
NativeUIProjection.install(bridge.webView)
projection = NativeUIProjection(
    window = activity.window,
    webView = bridge.webView,
    plugin = pluginHandle.id,
    projectionSelector = "#native-ui-fallback",
    view = { nativeView }
)
```

どちらのコードも、組み込みガイドのエラー処理の範囲内に置きます。初期化に失敗した場合は既存のWebフォールバックを維持します。`projection`と`nativeView`はプラグインのプロパティです。レンダラーの終了時には、iOSの`destroy()`またはAndroidの`close()`で登録を破棄します。ネイティブのライフサイクル呼び出しはすべてUIスレッドで行います。

Cordovaも、`runtime: .cordova` / `runtime = Runtime.CORDOVA`と、独自のWebView・プラグイン識別情報を使う同じ登録方式です。フックとAndroidのリソースハンドラーは、[Cordovaガイド](cordova.md)に従ってください。

## 必須入力

| 入力 | プラットフォーム | 識別する対象と理由 |
| --- | --- | --- |
| `webView` | iOS / Android | 投影先のドキュメントとブリッジを所有する、アプリのWebViewです。Swiftはoptionalな参照を受け入れ、WebViewがない場合は初期化のエラー処理へ例外を投げます。 |
| `plugin` | iOS / Android | 既存のプラグイン識別情報により、他のEngine利用側ではなく、このプラグインへ通知を振り分けます。CapacitorではiOSの`jsName`、Androidの`pluginHandle.id`、Cordovaでは設定されたサービス名です。 |
| `projectionSelector` | iOS / Android | 表示開始時に、存在するWebコンテナ1つだけに一致するCSSセレクターです。画像に正しいレイアウトとオーバーレイレイヤーを与えます。ネイティブの矩形だけでは、そのDOMレイヤーを特定できません。 |
| `view` | iOS / Android | レンダラーの現在のネイティブビュー、または存在しない場合にnil/nullを返すコールバックです。このレンダラーのライフタイム内の現在のビューを返してください。レンダラーを置き換える場合は登録を破棄し、新しく作成します。レイアウトと通常の可視性はプラグインが所有します。 |
| `window` | Android | WebViewとネイティブサーフェスを含むウィンドウです。合成済みのキャプチャと操作の追跡に必要です。 |

これらの入力は所有権を確立します。コンテンツがいつ変わるか、アプリの画面遷移でいつ表示を変更すべきかをEngineへ伝えるものではありません。

## 次の手順：変化するUIを設定する

最小の登録は所有権を確立します。続いて[任意の設定](../configuration/README.md)で、イベントの接続、値の反映、キャプチャ、失敗時の方針を確認してください。各設定にデフォルトと必要になる場面を記載しています。[高度なAPI](../advanced/README.md)は、レンダラーがすでにバッチ処理、配置、更新の調整を管理している場合だけ参照してください。

[ドキュメント概要](../README.md)
