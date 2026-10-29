---
title: "登録設定"
sourceRevision: "306aef1f74b9dd314d2883b647c9e28e4cd936a2c7290d9183eb97d8d1dcab21"
---
# ネイティブ登録の設定

まず[基本的な初期化](../getting-started/initialization.md)を確認してください。以下は同じ登録に対する設定です。コンポーネントに必要なものだけを追加します。

## 任意の動作

任意とはデフォルト値があるという意味であり、UIが変化する場合に通知を省略できるという意味ではありません。たとえば、タブバーの位置が変わらなくてもタブの選択は外観を変えるため、選択成功の通知を`receiveListeners.update`に含めます。

| 入力 | 省略時 | 設定する場面と理由 |
| --- | --- | --- |
| `receiveListeners` | プラグインイベントを購読しません。初期の表示意図はネイティブビューの可視性から決まり、内部のDOM・スクロール処理は動作します。 | タブ選択で強調項目が変わる場合、`update`で画像とバインド値を更新し、`projection`で表示を変更し、`match`でサーフェスごとに振り分けます。[イベントの接続](events.md#choose-successful-update-and-presentation-events)とCordovaガイドの`receive`転送を参照してください。 |
| `readValues` | ネイティブからDOMへの値の読み取りを行いません。 | フォールバックが非表示の間にネイティブのトグルが変化する場合、現在の状態を読み取り、再表示時に古い値に戻らないようにします。[値のバインディング](values.md)を参照してください。 |
| `values` | `readValues`があれば、返されたすべてのキーを`data-native-ui-value-*`属性にします。`readValues`がなければ値を反映しません。 | カスタム要素が属性ではなく`checked`から描画する場合、そのキーをホストのプロパティに対応付けます。アプリケーションイベントは生成しません。 |
| `captureDelayMs` | 50 msのデバウンス後に画像を準備します。 | 選択イベントの時点でタブの強調表示がまだアニメーション中なら、ピクセルが安定するまで待ちます。[キャプチャのタイミング](capture.md)を参照してください。オーバーレイの表示開始は遅らせません。 |
| `canCapture` | trueを返します。Engineによるジオメトリとプラットフォームの確認は引き続き適用されます。 | SDKがキャプチャ可能な静的コンテンツから制限付き動画へ切り替わる場合、不適切なキャプチャを防ぎます。現在のコンテンツの適格性を返してください。 |
| `failedFallback` | 適切な画像がなければ通常のWebフォールバックを使います。 | SDKビューに利用可能なWebの代替がない場合、レンダラーが配置を維持しているときに限り、自動的な移動中もネイティブ表示を維持します。明示的なWebの被覆と`none`が優先されます。[失敗時の方針](../reference/projection.md#native-surface-requirements)を参照してください。 |
| `allowedOrigins` | iOS: `capacitor://localhost`, `app://localhost`, `https://localhost`, `http://localhost`。Android: `https://localhost`, `http://localhost`。 | ローカルのホスト名を変更したアプリでは、チャネルを接続できるよう、信頼するオリジンを完全一致で指定します。Androidでは`install`とすべての登録に同じオリジンを使います。 |
| `runtime` | Capacitor。 | **Cordova連携では必須**です。通知とリソースURLでCordovaの転送方式を使うよう、Cordovaを選択します。 |
| `captureMode` (Android) | 背景の表示も含む`COMPOSITED`。 | 不透明なカードが周囲のコンテンツを横切ってスクロールする場合、`VIEW`はウィンドウの周囲のピクセルを含めず、カードだけをキャプチャします。半透明コンテンツ、動画、SurfaceViewには使わないでください。[キャプチャの適格性](../reference/platforms.md#android-capture-modes)を参照してください。 |

Engineは[表示意図](../reference/state.md)とコンポーネントの値を別々に公開します。いずれもアプリ側のEngineラッパーは不要です。Ionicオーバーレイの検出は登録引数ではなく、個別に有効化する[共有初期化関数](ionic-overlays.md)です。他のフレームワークはライフサイクルを明示的に通知します。

[ドキュメント概要](../README.md)
