---
title: API
---

`@rdlabo/ionic-theme-ios27` v1.0.0 が公開するJavaScript APIのリファレンスです。CSSとSassのentry pointはREADMEで説明します。

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

起動時に一度呼びます。繰り返し呼んでも稼働中のruntimeを共有します。非対応環境ではWeb状態のhandleを返します。`enabled: false` で稼働中のネイティブ描画を停止し、Web描画に戻します。

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
