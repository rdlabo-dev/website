---
title: API
---

`@rdlabo/ionic-theme-ios27` v1.2.0-3 が公開するJavaScript APIのリファレンスです。CSSとSassのentry pointはREADMEで説明します。

## Effect

#### `function` registerTabBarEffect

`(targetElement: HTMLElement) => registeredEffect | undefined`

Ionic Tab BarにLiquid Glassの選択effectを登録します。

#### `function` registerSegmentEffect

`(targetElement: HTMLElement) => registeredEffect | undefined`

Ionic SegmentにLiquid Glassの選択effectを登録します。

#### `interface` registeredEffect

| Member        | Type         | Description                                            |
| ------------- | ------------ | ------------------------------------------------------ |
| **`destroy`** | `() => void` | 登録時に作成したlistenerとeffect elementを削除します。 |

#### `interface` EffectScales

| Prop         | Type     | Description                     |
| ------------ | -------- | ------------------------------- |
| **`small`**  | `string` | Small effectのscaleです。       |
| **`medium`** | `string` | Medium effectのscaleです。      |
| **`large`**  | `string` | Large effectのscaleです。       |
| **`xlarge`** | `string` | Extra Large effectのscaleです。 |

## Searchable Tab Bar

#### `function` attachTabBarSearchable

`(ionTabBar: HTMLElement, ionFabButton: HTMLElement, ionFooter: HTMLElement) => TabBarSearchableFunction`

Searchable Tab Barのtransitionを設定し、event handlerを返します。

#### `enum` TabBarSearchableType

| Member      | Value     | Description                   |
| ----------- | --------- | ----------------------------- |
| **`Enter`** | `"enter"` | Searchable modeへ入ります。   |
| **`Leave`** | `"leave"` | Searchable modeから戻ります。 |

#### `type alias` TabBarSearchableFunction

`(event: Event, type: TabBarSearchableType) => Promise<void>`

## Animation

#### `function` withNativeUIShellTransition

`(builder: AnimationBuilder) => AnimationBuilder`

Ionicの画面遷移builderをラップし、返されるアニメーションを維持しながら、ネイティブ部品の退避、スワイプの進捗、キャンセルを連携します。パッケージrootと `/vertical-bars` からexportされます。`navAnimation` に登録し、遷移ごとに新しい `Animation` を使ってください。本パッケージの `iosTransitionAnimation` には既に組み込まれています。Ionic標準と独自builderの設定は[既存テーマでの導入](/docs/iphone-duo-with-original-theme)を参照してください。

#### `function` iosTransitionAnimation

`(navEl: HTMLElement, opts: TransitionOptions) => Animation`

PackageのiOS navigation transitionを生成します。

#### `function` setConfig

`(config: Partial<IosTransitionConfig>) => void`

画面遷移の角丸半径を設定します。既定値は `0` で、ネイティブアプリでは計測したWebViewの半径を渡せます。

#### `interface` IosTransitionConfig

| Prop         | Type     | Description          |
| ------------ | -------- | -------------------- |
| **`radius`** | `number` | 画面遷移の角丸半径。 |

#### `function` popoverEnterAnimation

`(baseEl: HTMLElement, opts?: any) => Animation`

iOS Popoverのenter animationを生成します。

#### `function` popoverLeaveAnimation

`(baseEl: HTMLElement) => Animation`

iOS Popoverのleave animationを生成します。

## Searchbar

#### `function` supportSeachbarCancelButtonIcon

`(searchbar: HTMLIonSearchbarElement) => SearchbarCancelButtonIconSupport`

iOS modeでIonicの `cancelButtonIcon` を描画する一時的な補助です。公開API名の `Seachbar` はこの綴りでimportします。初期化済みの要素を渡してください。

#### `interface` SearchbarCancelButtonIconSupport

| Member | Type | Description |
| --- | --- | --- |
| **`refresh`** | `() => void` | JavaScriptプロパティで変更した `cancelButtonIcon` を再読込します。 |
| **`destroy`** | `() => void` | observerと挿入アイコンを削除して文字表示を復元します。 |

## Native UI Shell (Experimental)

次のAPIと型は `@rdlabo/ionic-theme-ios27/native` からimportします。[Native UI Shellガイド](/docs/native-ui-shell)に導入条件とフォールバックを記載しています。

#### `function` enableNativeUIShell

`(options?: NativeUIShellOptions) => Promise<NativeUIShellHandle>`

起動時に一度呼びます。同じ設定で繰り返すと稼働中のruntimeを共有し、稼働中に異なる設定を指定するとエラーになります。非対応環境ではWeb状態のhandleを返します。`enabled: false` で稼働中のネイティブ描画を停止し、Web描画に戻します。

#### `function` configureNativeTransition

`() => Promise<WebViewMetrics>`

ネイティブWebViewの角丸半径を取得し、ネイティブ部品を有効にせず画面遷移へ適用します。他のプラットフォームでは半径は `0` です。

#### `interface` NativeUIShellOptions

| Prop           | Type                    | Description                                              |
| -------------- | ----------------------- | -------------------------------------------------------- |
| **`enabled`**  | `boolean`               | ネイティブ描画を全体で有効にします。既定値は `true`。    |
| **`controls`** | `NativeUIShellControls` | 指定時は `true` の部品だけをネイティブ描画の対象にします。 |

#### `interface` NativeUIShellControls

| Prop          | Type      | Description                |
| ------------- | --------- | -------------------------- |
| **`tabs`**    | `boolean` | タブバーとネイティブ検索。 |
| **`toolbar`** | `boolean` | toolbar、戻る・メニュー。 |
| **`segment`** | `boolean` | segment。                 |
| **`fab`**     | `boolean` | FAB。                     |

#### `interface` NativeUIShellHandle

| Member | Type | Description |
| --- | --- | --- |
| **`getStatus`** | `() => NativeUIShellStatus` | 現在の状態を取得します。 |
| **`suspend`** | `() => Promise<NativeUIShellSuspension>` | `resume()` まで対象部品をWeb描画に戻します。 |
| **`destroy`** | `() => Promise<void>` | Web描画を復元し、ネイティブ部品とruntimeを破棄します。 |

#### `interface` NativeUIShellSuspension

| Member       | Type                  | Description                                              |
| ------------ | --------------------- | -------------------------------------------------------- |
| **`resume`** | `() => Promise<void>` | 一時停止を解除します。すべて解除すると再描画を評価します。 |

#### `interface` WebViewMetrics

| Prop         | Type     | Description              |
| ------------ | -------- | ------------------------ |
| **`radius`** | `number` | WebViewの角丸半径。      |

#### `interface` NativeUIShellStatus

```ts
interface NativeUIShellStatus {
  state: 'web' | 'native' | 'stopped';
  projected: number;
  updates: number;
  reason?: string;
}
```

`projected` はネイティブ描画中の部品数、`updates` は更新数、`reason` はWebフォールバック・停止理由です。bridge障害による `stopped` から自動再接続はしません。handleを `destroy()` してから再度有効化します。

#### `type alias` NativeUIShellComponent

`'ion-button' | 'ion-buttons' | 'ion-back-button' | 'ion-menu-button' | 'ion-tab-bar' | 'ion-segment' | 'ion-fab'`

runtimeが扱うコンポーネントtagのunionです。個別の対応条件はガイドを参照してください。

## iPhone Duo / Vertical Control Area（実験的機能）

次のAPIは `@rdlabo/ionic-theme-ios27/vertical-bars` または `@rdlabo/ionic-theme-ios27/native` からimportします。独立したentry pointはiOS 27テーマや完全なNative UI Shellなしで動作します。導入方法、toolchainの要件、Webフォールバックは[iPhone Duo対応](/docs/iphone-duo)を参照してください。

#### `function` enableVerticalControlArea

`() => Promise<VerticalControlAreaHandle>`

縦の領域の操作部品だけにruntimeを起動します。これと `enableNativeUIShell()` の一方だけを起動してください。同じ設定で繰り返すと共有し、稼働中に異なる設定を指定するとエラーになります。

#### `function` setVerticalControlAreaPlacement

`(placement: VerticalBarEdge | VerticalBarPlacement, rtl?: boolean) => void`

`ion-app` のマウント後、アプリが選んだ配置をCSSとWeb・ネイティブの操作部品へ適用します。論理方向は最も近い `dir` 属性か明示的な `rtl` で解決します。`null` を渡すと通常のレイアウトへ戻ります。

#### `interface` VerticalControlAreaHandle

`NativeUIShellHandle` に `setPlacement` を追加した型です。`setVerticalControlAreaPlacement` と同じ関数です。

| Member | Type | 説明 |
| --- | --- | --- |
| **`setPlacement`** | `(placement: VerticalBarEdge \| VerticalBarPlacement, rtl?: boolean) => void` | Webとネイティブの部品に配置を適用します。 |

#### `type alias` VerticalBarEdge

`'leading' | 'trailing' | null`

読む方向に対する論理的な端です。`null` は縦の操作領域がない状態を表します。

#### `interface` VerticalBarPlacement

| Prop | Type | 説明 |
| --- | --- | --- |
| **`edge`** | `VerticalBarEdge` | 操作領域の論理的な端。 |
| **`inset`** | `number` | CSSピクセルで指定する幅。省略時はCSSのsafe area規則を使います。 |
| **`nativeEdge`** | `VerticalBarEdge` | アプリが通知するネイティブの論理方向。nullまたは未登録ならverticalBarsOnlyではWebの操作領域、それ以外では通常のNative UI Shell配置を使います。省略は前回値を維持します。 |

#### `module` IonicNativeUIShell

同梱のCapacitorプラグインは描画用のWebView寸法を提供します。Web実装はないため、`Capacitor.getPlatform() === 'ios'` で呼び出しを制限してください。端末の開閉状態と操作領域の配置には、アプリ側で `@erkamyaman/capacitor-foldable` を使います。[iPhone Duo対応](/docs/iphone-duo)を参照してください。

| Member | Type | 説明 |
| --- | --- | --- |
| **`getWebViewMetrics`** | `() => Promise<WebViewMetrics>` | WebViewの有効な角丸半径を取得します。 |
| **`addListener`** | `(name: 'webViewMetricsChange', listener: (event: WebViewMetrics) => void) => Promise<PluginListenerHandle>` | WebView寸法の変更を購読します。終了時にlistenerを削除します。 |

スナップショットや操作のbridgeメソッドは内部実装です。従来の `DeviceLayout`、`HingeStatus`、`getDeviceLayout()` と端末レイアウトの監視APIは削除されています。
