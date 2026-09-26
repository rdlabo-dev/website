---
title: iPhone Duo対応（実験的機能）
---

IonicアプリをiPhone Duoへ対応させます。縦のシステム操作領域へナビゲーションと操作部品を置き、端末の開閉に合わせてsplit paneを調整できます。ラベル、アイコン、ルーティング、click handlerは既存のIonicマークアップが管理します。

**初めて使う場合は** [既存テーマでiPhone Duoに対応する](/docs/iphone-duo-with-original-theme)から、Chromeで側面のレイアウトを試してください。このページは端末イベント、配置、split pane、APIを説明します。

[Native UI Shell](/docs/native-ui-shell)とともに `1.2.0-0` で利用できる **実験的機能** です。APIと対応する動作は変更される可能性があります。実際のシステム操作領域とヒンジ情報には、iOS 27.1以降とXcode 27.1以降でビルドしたアプリが必要です。

このパッケージは独立した3つの機能を提供します。それぞれ **iOS 27テーマのスタイルシートなし**、**完全なNative UI Shellなし** で利用できます。

- `dist/css/vertical-bars.css` — 操作領域のsafe areaを確保するopt-inクラスと、開閉状態に応じてsplit paneの幅を変える登録済みcustom propertyです。
- `enableVerticalControlArea()` — 対象のタブとtoolbarの操作部品を確保した領域へ移動します。Capacitor iOSではネイティブのSwiftUI `TabView` とtoolbar、それ以外では同じ部品のWebクローンで描画します。
- デバイスのレイアウト情報 — 同梱のCapacitorプラグインが `getDeviceLayout()` と `deviceLayoutChange` イベントで、操作領域の配置、ヒンジの状態、WebViewの角丸半径を通知します。

プラグインは **端末の情報** を通知し、DOMには触れません。**アプリ** がその値をレイアウトへどう適用するか決め、**スタイルシートとruntime** が領域の確保、操作部品の描画、split paneの変更を行います。この責務分担により、テストでネイティブの値をmockでき、テーマが担う範囲も小さく保てます。

## 利用する機能を選ぶ

既存テーマを維持して独立した対応機能だけを追加する場合は、[既存テーマでiPhone Duoに対応する](/docs/iphone-duo-with-original-theme)を参照してください。このページは共通の端末情報、レイアウト規則、APIを説明します。

| 目的 | スタイルシート | Runtime |
| --- | --- | --- |
| ヒンジの状態だけを使う（レイアウト切り替え） | 不要 | 不要 — プラグインを直接購読します |
| 開閉状態に応じたsplit paneの幅 | `vertical-bars.css` | 不要 — プラグインを直接購読します |
| タブとtoolbarの操作部品を縦の操作領域へ置く | `vertical-bars.css` | `enableVerticalControlArea()` |
| Native UI Shellと縦の操作領域を併用する | `vertical-bars.css` | `enableNativeUIShell()` — 操作領域と開閉状態への対応を含みます |

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

スタイルシートだけで通常のIonic UIが変わることはありません。すべての規則にopt-inクラスが必要です。無条件に読み込んでください。これらの値はシミュレーションとレイアウトの入力であり、通常のIonic safe area変数から独立しています。

`/vertical-bars` のentry pointはmoduleの読み込み時に `@capacitor/core` をimportするため、Webだけで利用する場合もインストールしてください（任意のpeer dependencyです）。スタイルシートとopt-inクラスだけを使うアプリには追加依存は不要です。

## デバイスのレイアウトを取得する

`npx cap sync ios` でプラグインが自動登録されます。レイアウト情報の取得に `configure` は不要です。split paneの制御など、ヒンジの状態だけが必要なアプリは、描画runtimeを起動せずこのAPIだけを使います。

```ts
import { Capacitor } from '@capacitor/core';
import { HingeStatus, IonicNativeUIShell } from '@rdlabo/ionic-theme-ios27/vertical-bars';

// プラグインにはWeb実装がないため、購読前にplatformを確認します。
if (Capacitor.getPlatform() === 'ios') {
  await IonicNativeUIShell.startDeviceLayoutMonitoring();
  const listener = await IonicNativeUIShell.addListener('deviceLayoutChange', ({ hingeStatus }) => {
    // 開閉状態を適用します
  });
  const { hingeStatus } = await IonicNativeUIShell.getDeviceLayout(); // 初期値

  // 利用元を破棄するとき:
  // await listener.remove();
  // await IonicNativeUIShell.stopDeviceLayoutMonitoring();
}
```

`DeviceLayout` は次の情報を持ちます。

| フィールド | 意味 |
| --- | --- |
| `placement` | `{ edge: 'leading' \| 'trailing' \| null, inset }` — 読む方向に対する操作領域の論理的な端と、UIKitのsafe area inset（ポイント）。操作領域がない端末では `edge` は `null` です |
| `hingeStatus` | `HingeStatus.Closed`、`PartiallyOpen`、`FullyOpen`。ヒンジ情報がない端末では `null` です |
| `webViewMetrics.radius` | WebViewの左上の有効な角丸半径（ポイント） |

`edge` は **論理方向** です。`'leading'` は行を読み始める側で、LTRでは物理的な左、RTLでは物理的な右になります。UIKitの `verticalBarEdge` traitと `@erkamyaman/capacitor-foldable` の `getBarPlacement()` と同じ表現のため、そのプラグインの値も変換せず適用できます。

監視は参照数で管理します。利用元ごとに `startDeviceLayoutMonitoring()` と `stopDeviceLayoutMonitoring()` を対応させ、最後の利用元が解放するとイベントが止まります。`getDeviceLayout()` は監視せず一度だけ取得する場合にも使えます。`enableVerticalControlArea()` または `enableNativeUIShell()` がネイティブ描画を行っている間は、runtimeが監視の参照を保持します。その場合はlistenerの追加と初期値の取得だけでよく、追加のstart/stopは不要です。

**ビルド要件:** iOSはiOS 27.1以降のSDKとリンクしたアプリにだけ縦の操作領域を有効にします。Xcode 27.1以降でビルドしてください。古いSDKでビルドしたアプリはiPhone Duoで後方互換モードとなり、システムは操作領域を確保せず、`placement.edge` は `null`、`inset` は `0`、`hingeStatus` は `null` のままです。それ以外の機能は動作します。opt-inクラスでDOMの領域を確保し、アプリが適用した配置に操作領域が従うため、互換ビルドでも利用・テストできます。実際のシステム操作領域、実測inset、ヒンジ情報には新しいtoolchainが必要です。

## 縦の操作領域を確保する

`ion-app` に `.ios-theme-vertical-bars` を追加すると物理的な右側に領域を確保します。左側に置く場合は `.ios-theme-vertical-bars-left` も追加します。

```html
<ion-app class="ios-theme-vertical-bars">...</ion-app>
```

CSSとネイティブ描画は物理座標を使うため、クラスも物理方向です。`-left` は常に物理的な左端を意味します。通常は後述の `setPlacement` で適用します。プラグインの論理方向 `placement.edge` をdocumentの文字方向で解決するため、RTLアプリも独自の変換を必要としません。

Chromeでの開発にはネイティブプラグインは不要です。クラスだけで `80px` を確保し、iPhone Duoをシミュレートできます。`setPlacement` がネイティブ配置を受け取ると、実測したUIKitのinsetで置き換えます。実測値が `80px` 未満でも同様です。異なる配置をシミュレートするには `--ios-theme-vertical-bars-safe-area-left` または `--ios-theme-vertical-bars-safe-area-right` を上書きします。

routerとコンポーネントの背景はviewport全体を維持します。`ion-content` はスクロールする前景、`ion-toolbar` はcontainerの前景を移動し、`ion-fab` はシステムUIの隣に置く場合だけ調整します。前景コンポーネント内では対応するIonic safe area変数をリセットし、子孫でinsetが二重に加わるのを防ぎます。

`ion-menu`、`ion-modal`、`ion-popover` は独立した面として扱います。内部の前景にはメインページの変換を適用せず、Ionic標準のsafe area処理を維持します。システムUI側から開くメニューはviewport全体のanimation hostを保ち、可視containerだけをinset分ずらします。反対側のメニューは変わりません。RTLでもleftとrightは物理座標で、Ionicの `side="start"` と `side="end"` は論理方向です。

このモードはコンポーネントmodeから独立しています。iOSでIonicの `mode: 'md'` を維持したままVertical Barsを有効にでき、`mode="ios"` は不要です。

## 操作部品を縦の領域へ描画する

アプリの起動時に、一度だけ独立したruntimeを起動します。

```ts
import { Capacitor } from '@capacitor/core';
import { enableVerticalControlArea, IonicNativeUIShell } from '@rdlabo/ionic-theme-ios27/vertical-bars';

// Chromeでも起動します。クラスが付くまでWeb描画は待機します。
const rail = await enableVerticalControlArea();

if (Capacitor.getPlatform() === 'ios') {
  // Runtimeが既にレイアウトを監視しているため、購読だけを行います。
  await IonicNativeUIShell.addListener('deviceLayoutChange', ({ placement }) => rail.setPlacement(placement));
  rail.setPlacement((await IonicNativeUIShell.getDeviceLayout()).placement);
}
```

handleの `setPlacement` とexportされた `setVerticalControlAreaPlacement` は同じ関数です。アプリが選んだ配置をCSSレイアウトと両方の描画へ適用します。マウント済みの `ion-app` が必要なので、アプリのrootが存在してから呼んでください。

- `getDeviceLayout()` / `deviceLayoutChange` の `placement`、または論理方向 `'leading'` / `'trailing'` を渡します。最も近い `dir` 属性で物理方向に解決します。アプリが文字方向を把握している場合は第2引数の `rtl` でも指定できます。
- `null` を渡すと通常のレイアウトへ戻ります。
- listenerはiOSが選んだ配置を通知し、適用するかはアプリが決めます。通知によらず固定する場合は、アプリ独自の `'leading'` または `'trailing'` を渡せます。

`enableVerticalControlArea()` と完全な `enableNativeUIShell()` のいずれか一方を起動してください。同じ設定で繰り返すと共有runtimeを返し、稼働中に異なる設定で起動するとエラーになります。runtimeの破棄はアプリ内の1か所が管理します。既に `enableNativeUIShell()` を使う場合はそのruntimeを維持し、listenerから `setVerticalControlAreaPlacement(placement)` を呼びます。

対応するiOSでは、対象のタブ、戻る操作、メニューボタン、固定toolbarの操作をネイティブのSwiftUI `TabView` とtoolbarへ渡します。Web、Android、ネイティブ描画が利用できない場合はWebクローンへフォールバックします。戻る操作は固定toolbarの外にも置けますが、他の操作には固定toolbarが必要です。固定toolbarの操作部品にはアイコンかSVGが必要で、直接のテキストnodeがなく、標準の `fill="default"` または `fill="clear"` を使う必要があります。文字だけの操作は元のWeb toolbarに残ります。水平toolbarに残すには `ion-buttons` グループまたは個別の `ion-button` に `.ios-theme-horizontal-only` を追加します。配置はrouteページへ入る時に選ばれます。既存ボタンの内容を変更しても、ページを離れて戻るまでtoolbarと縦の領域の間を移動しません。メニュー、modal、popoverは独自のtoolbar配置を維持します。

`ion-tabs` がある場合、タブバーは確保した領域へ移動し、下端のsafe areaの上へ揃えます。Ionicの `slot` で位置を変えることはできません。ネイティブ描画なしでは、通常のWeb操作領域は4タブのSwiftUI `TabView` と同じくアイコンだけを表示します。押したままドラッグすると、アイコンとラベルを持つすべてのタブがラベルを表示し、移動先を確認できます。Webタブバーはシミュレートしたシステム領域でpointer入力を受けます。sidebar型のナビゲーションには `ion-menu` を使ってください。このモードはタブをメニューへ変換しません。`ion-tabs` がなくてもWebクローンは動作します。モードの無効化やページ退出でネイティブの制御・Webクローンを削除し、元の部品を復元します。システム操作部品の縦配置を変えてシミュレートするには `--ios-theme-vertical-bars-toolbar-top` を上書きします。

## Split paneを開閉状態に合わせる

iPhone Duoの横並びメニューには、Settings画面から別途計測したsplit pane配置を適用できます。sidebarは完全に開くと320pt、半開きでは画面中央まで（50vw）広がります。開閉状態はアプリが指定します。両状態のviewport幅は同じため、幅のmedia queryだけでは区別できません。

```html
<ion-split-pane
  [class.ios-theme-split-pane-half-open]="halfOpened"
  contentId="main-content"
  when="(min-width: 900px)"
>
  <ion-menu contentId="main-content">...</ion-menu>
  <div id="main-content">...</div>
</ion-split-pane>
```

通常のsplit pane幅をアプリのスタイルシートで320ptに設定し、半開きクラスで幅の値だけを変えます。

```css
ion-split-pane {
  --ios-theme-menu-width: var(--ios-theme-split-pane-width);
  --side-width: var(--ios-theme-menu-width);
  --side-max-width: var(--ios-theme-menu-width);
  transition: --ios-theme-split-pane-width 300ms ease;
}
```

登録済みの `--ios-theme-split-pane-width` は既定で `320px`、`.ios-theme-split-pane-half-open` を付けると `50vw` です。`deviceLayoutChange` が `HingeStatus.PartiallyOpen` を通知したら `halfOpened` を設定し、初期値も `getDeviceLayout` で取得します。Ionicの `when` が常時表示のside paneにするか決めるため、閉じた時はpaneを隠すbreakpointを選んでください。`null` はヒンジがない端末を意味し、通常のbreakpointへ戻します。幅の規則を適用する場所はアプリが選び、他の通常のsplit paneは変わりません。この配置はVertical Barsを有効化せず、overlayメニューも移動しません。

## Vertical Control Area API

`enableVerticalControlArea()` が返すhandleの操作です。

### setPlacement(...)

```typescript
setPlacement(placement: VerticalBarEdge | VerticalBarPlacement, rtl?: boolean | undefined) => void
```

アプリが選んだ配置をWebとネイティブの両方へ適用します。`placement` は論理方向またはinset付きの配置、`rtl` は任意の文字方向です。

### getStatus()

```typescript
getStatus() => NativeUIShellStatus
```

現在のWeb・ネイティブ描画状態を返します。

### suspend()

```typescript
suspend() => Promise<NativeUIShellSuspension>
```

返されたleaseを再開するまで操作部品をWebへ戻します。

### destroy()

```typescript
destroy() => Promise<void>
```

同期を止め、Webの操作部品を復元し、ネイティブリソースを解放します。

### Interfaces

#### VerticalBarPlacement

| Prop | Type | 説明 |
| --- | --- | --- |
| **`edge`** | `VerticalBarEdge` | 読む方向に対する論理的な端。 |
| **`inset`** | `number` | 縦の操作領域側のUIKit safe area inset（ポイント）。 |

#### NativeUIShellStatus

| Prop | Type |
| --- | --- |
| **`state`** | `'native' \| 'stopped' \| 'web'` |
| **`projected`** | `number` |
| **`updates`** | `number` |
| **`reason`** | `string` |

#### NativeUIShellSuspension

| Method | Signature | 説明 |
| --- | --- | --- |
| **resume** | `() => Promise<void>` | 一時停止を解除します。すべての一時停止が解除されるとネイティブ描画を再開します。 |

### Type Aliases

#### VerticalBarEdge

UIVerticalBarEdgeとcapacitor-foldableと同じ、読む方向に対する論理的な端です。

`'leading' | 'trailing' | null`
