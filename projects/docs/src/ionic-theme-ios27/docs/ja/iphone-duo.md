---
title: iPhone Duo対応（実験的機能）
---

IonicアプリをiPhone Duoへ対応させます。縦のシステム操作領域へナビゲーションと操作部品を置き、端末の開閉に合わせてsplit paneを調整できます。ラベル、アイコン、ルーティング、click handlerは既存のIonicマークアップが管理します。

**初めて使う場合は** [既存テーマでiPhone Duoに対応する](/docs/iphone-duo-with-original-theme)から、Chromeで側面のレイアウトを試してください。このページは端末イベント、配置、split pane、APIを説明します。

[Native UI Shell](/docs/native-ui-shell)とともに `1.2.0-0` で利用できる **実験的機能** です。APIと対応する動作は変更される可能性があります。実際のシステム操作領域とヒンジ情報には、iOS 27.1以降とXcode 27.1以降でビルドしたアプリが必要です。

このパッケージは独立した2つの機能を提供します。それぞれ **iOS 27テーマのスタイルシートなし**、**完全なNative UI Shellなし** で利用できます。

- `dist/css/vertical-bars.css` — 操作領域のsafe areaを確保するopt-inクラスと、開閉状態に応じてsplit paneの幅を変える登録済みcustom propertyです。
- `enableVerticalControlArea()` — 対象のタブとtoolbarの操作部品を確保した領域へ移動します。Capacitor iOSではネイティブのSwiftUI `TabView` とtoolbar、それ以外では同じ部品のWebクローンで描画します。

端末状態の取得は [`@erkamyaman/capacitor-foldable`](https://github.com/erkamyaman/capacitor-foldable) が担います。**アプリ** がイベントを購読してレイアウトを選び、このパッケージの **スタイルシートとruntime** が領域の確保、操作部品の描画、split paneの変更を行います。テーマ自身はヒンジ状態や操作領域の配置を監視しません。

## 利用する機能を選ぶ

既存テーマを維持して独立した対応機能だけを追加する場合は、[既存テーマでiPhone Duoに対応する](/docs/iphone-duo-with-original-theme)を参照してください。このページは共通の端末情報、レイアウト規則、APIを説明します。

| 目的 | スタイルシート | Runtime |
| --- | --- | --- |
| ヒンジの状態だけを使う（レイアウト切り替え） | 不要 | 不要 — `Foldable` を直接購読します |
| 開閉状態に応じたsplit paneの幅 | `vertical-bars.css` | 不要 — `Foldable` を直接購読します |
| タブとtoolbarの操作部品を縦の操作領域へ置く | `vertical-bars.css` | `enableVerticalControlArea()` |
| Native UI Shellと縦の操作領域を併用する | `vertical-bars.css` | `enableNativeUIShell()` — 操作領域への描画を含みます |

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

スタイルシートだけで通常のIonic UIが変わることはありません。すべての規則にopt-inクラスが必要です。無条件に読み込んでください。これらの値はシミュレーションとレイアウトの入力であり、通常のIonic safe area変数から独立しています。

`/vertical-bars` のentry pointはmoduleの読み込み時に `@capacitor/core` をimportするため、Webだけで利用する場合もインストールしてください（任意のpeer dependencyです）。スタイルシートとopt-inクラスだけを使うアプリには追加依存は不要です。

## デバイスのレイアウトを取得する

アプリに端末状態を取得するプラグインをインストールし、ネイティブプロジェクトへ同期します。

```bash
npm install @erkamyaman/capacitor-foldable
npx cap sync
```

iPhone DuoのiOS 27.1 APIにはCapacitor 8.5以降とXcode 27.1以降を使います。この依存は端末状態に連動した配置のためのもので、テーマのCSS、ブラウザでのシミュレーション、ネイティブ操作部品の描画だけには不要です。同じタブを二重に移動してしまうため、プラグインの `ionic-tabs.css` はこのパッケージの操作領域への描画と併用しないでください。

開閉状態に応じたsplit paneには、描画runtimeを起動せず直接購読します。

```ts
import { Foldable, type FoldState } from '@erkamyaman/capacitor-foldable';

const applyFold = (fold: FoldState) => {
  const pane = document.querySelector('ion-split-pane');
  pane?.classList.toggle('ios-theme-split-pane-half-open', fold.state === 'half-opened');
  const expanded = fold.state === 'half-opened' || (fold.state === 'flat' && !!fold.hingeBounds);
  pane?.setAttribute('when', expanded ? '(min-width: 900px)' : '(min-width: 992px)');
};
let receivedEvent = false;
let disposed = false;
const listener = await Foldable.addListener('foldStateChange', (fold) => {
  receivedEvent = true;
  if (!disposed) applyFold(fold);
});
const initialFold = await Foldable.getFoldState();
if (!disposed && !receivedEvent) applyFold(initialFold);

// 利用元を破棄するとき:
// disposed = true;
// await listener.remove();
```

`getFoldState()` と `foldStateChange` は `state`（`'flat'`、`'half-opened'`、`'closed'`）、`posture`、任意のヒンジ形状を返します。開閉情報がない場合は `hingeBounds` のないflat状態になるため、通常のsplit paneのbreakpointへ戻します。Web実装もflat状態を返します。half-opened状態ではヒンジ形状がなくても900px、ヒンジ形状のあるflat状態も900pxを使います。closed状態では通常の992pxへ戻します。初期化中に受け取ったイベントは初期値の取得結果より優先します。

`getBarPlacement()` と `barPlacementChange` は `{ verticalBarEdge: 'leading' | 'trailing' | null, inset: number }` を返します。端は **論理方向** で、leadingはLTRでは物理的な左、RTLでは物理的な右です。`setPlacement()` には `{ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset }` を渡します。監視を開始・停止する別の呼び出しは不要です。利用元の破棄時に各listenerを削除してください。

テーマはUIKitの配置traitを読みません。アプリが固定の `edge` を選ぶ場合も、初期値の取得と各イベントで `nativeEdge` を渡します。省略すると最後に渡した値を維持し、プラグインが端を報告しない場合は `null` を渡します。明示的な `nativeEdge: null` または初期の未登録状態ではネイティブの縦配置を行いません。`enableVerticalControlArea()` は要求されたWebの操作領域を維持し、完全なNative UI Shellは通常の水平配置へ一時的に戻ります。要求した配置は保持され、一致するnull以外の端が後で通知されるとネイティブの縦配置を再開します。一度渡した後の省略は `null` を含め前回値を維持します。`{ edge: null, nativeEdge }` なら、操作領域を無効にしたまま通知された端を更新できます。

Foldableはネイティブ操作領域が確保する実測幅を `inset` で返し、変更を `barPlacementChange` で通知します。通知された端に配置する場合、固定幅を仮定せず、この値を `setPlacement()` へ渡してください。操作領域がない場合は `inset` が `0` となり、明示的な幅を解除します。アプリが引き続きWebの操作領域を要求する場合はCSSのsafe area規則を使います。別の端を選ぶアプリは独自の幅を渡すかCSSへフォールバックできます。WebViewの角丸半径は描画側が担い、`configureNativeTransition()` はFoldableとは独立したShellの `getWebViewMetrics()` を使います。

**移行:** テーマの従来の `DeviceLayout`、`HingeStatus`、`getDeviceLayout()`、`deviceLayoutChange` と端末監視の開始・停止APIは削除されました。端末状態の購読は上記のFoldable APIへ置き換え、角丸半径の一度だけの取得には `getWebViewMetrics()` を使います。FoldableはiOS 27.1 SDKを使わないビルドでもsafe areaのinsetからDuoの配置を推定できます。ヒンジ情報には新しいSDKが必要です。アプリは通知された端とは独立して固定の配置を要求することもできます。

## 縦の操作領域を確保する

`ion-app` に `.ios-theme-vertical-bars` を追加すると物理的な右側に領域を確保します。左側に置く場合は `.ios-theme-vertical-bars-left` も追加します。

```html
<ion-app class="ios-theme-vertical-bars">...</ion-app>
```

CSSとネイティブ描画は物理座標を使うため、クラスも物理方向です。`-left` は常に物理的な左端を意味します。通常は後述の `setPlacement` で適用します。`Foldable` の論理方向 `verticalBarEdge` をdocumentの文字方向で解決するため、RTLアプリも独自の変換を必要としません。

Chromeでの開発にはネイティブプラグインは不要です。クラスだけで `80px` を確保し、iPhone Duoをシミュレートできます。`setPlacement` に明示的な `{ edge, inset }` を渡すと、そのinsetでフォールバックの幅を置き換えます。`80px` 未満でも同様です。異なる配置をシミュレートするには `--ios-theme-vertical-bars-safe-area-left` または `--ios-theme-vertical-bars-safe-area-right` を上書きします。

routerとコンポーネントの背景はviewport全体を維持します。`ion-content` はスクロールする前景、`ion-toolbar` はcontainerの前景を移動し、`ion-fab` はシステムUIの隣に置く場合だけ調整します。前景コンポーネント内では対応するIonic safe area変数をリセットし、子孫でinsetが二重に加わるのを防ぎます。

`ion-modal` は、表示中のダイアログがviewportの全幅に広がる場合、同じ前景の補正を適用します。Vertical Control Areaのruntimeを有効にすると、最前面の全幅modalは対象のtoolbarボタンを専用の操作領域へ描画します。中央に表示するダイアログはtoolbarボタンを維持し、ページの操作領域用のinsetを適用しません。全幅のsheet modalも対象で、breakpointが変わると操作領域も表示中のsheetの範囲に追従します。対象になるかは、ヒンジの開閉状態やmodalの種類ではなく、表示中のダイアログの幅で決まります。`ion-menu` と `ion-popover` は独立した面として扱い、内部の前景にはメインページの変換を適用せず、Ionic標準のsafe area処理を維持します。システムUI側から開くメニューはviewport全体のanimation hostを保ち、可視containerだけをinset分ずらします。反対側のメニューは変わりません。RTLでもleftとrightは物理座標で、Ionicの `side="start"` と `side="end"` は論理方向です。

このモードはコンポーネントmodeから独立しています。iOSでIonicの `mode: 'md'` を維持したままVertical Barsを有効にでき、`mode="ios"` は不要です。

## 操作部品を縦の領域へ描画する

アプリの起動時に、一度だけ独立したruntimeを起動します。

```ts
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { enableVerticalControlArea } from '@rdlabo/ionic-theme-ios27/vertical-bars';
import { Foldable } from '@erkamyaman/capacitor-foldable';

// Chromeでも起動します。クラスが付くまでWeb描画は待機します。
const rail = await enableVerticalControlArea();
let layoutListener: PluginListenerHandle | undefined;

if (Capacitor.getPlatform() === 'ios') {
  layoutListener = await Foldable.addListener('barPlacementChange', ({ verticalBarEdge, inset }) =>
    rail.setPlacement({ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset }),
  );
  const { verticalBarEdge, inset } = await Foldable.getBarPlacement();
  rail.setPlacement({ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset });
}

// アプリを管理する所有者の破棄時に呼びます。
const stopVerticalArea = async () => {
  await layoutListener?.remove();
  await rail.destroy();
};
```

handleの `setPlacement` とexportされた `setVerticalControlAreaPlacement` は同じ関数です。アプリが選んだ配置をCSSレイアウトと両方の描画へ適用します。マウント済みの `ion-app` が必要なので、アプリのrootが存在してから呼んでください。

- `{ edge, nativeEdge }` を渡します。`edge` はアプリが選んだ論理方向、`nativeEdge` は `Foldable.getBarPlacement()` / `barPlacementChange` の `verticalBarEdge` です。最も近い `dir` 属性または明示的な `rtl` 引数で物理方向へ解決します。
- `null` を渡すと通常のレイアウトへ戻ります。
- listenerはiOSが選んだ配置を通知し、適用するかはアプリが決めます。テーマは選択された端と `nativeEdge` を比較し、不一致の場合は一致するまでWebの操作領域を使います。LTRで右へ固定するには、各Foldable更新で `{ edge: 'trailing', nativeEdge: verticalBarEdge }` を渡します。

`enableVerticalControlArea()` と完全な `enableNativeUIShell()` のいずれか一方を起動してください。同じ設定で繰り返すと共有runtimeを返し、稼働中に異なる設定で起動するとエラーになります。runtimeの破棄はアプリ内の1か所が管理します。既に `enableNativeUIShell()` を使う場合はそのruntimeを維持し、listenerから `setVerticalControlAreaPlacement({ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset })` を呼びます。

対応するiOSでは、対象のタブ、戻る操作、メニューボタン、固定toolbarの操作をネイティブのSwiftUI `TabView` とtoolbarへ渡します。Web、Android、ネイティブ描画が利用できない場合はWebクローンへフォールバックします。戻る操作は固定toolbarの外にも置けますが、メニューボタンとその他のtoolbar操作には固定toolbarが必要です。

### Toolbarの操作部品

`ion-button` 内の `ion-icon` またはSVGに `slot="icon-only"` があると、ボタンは縦の操作領域へ移動します。ボタンは `ion-header` または `ion-footer` 直下の固定 `ion-toolbar` 内に置き、スクロールする `ion-content` の外に配置してください。

| アイコンのマークアップ | 配置 |
| --- | --- |
| `slot="icon-only"` | 縦の操作領域 |
| `slot="start"`、`slot="end"`、slotなし | 元の水平toolbar |
| アイコンなし | 元の水平toolbar |

この規則は `fill="default"`、`clear`、`solid`、`outline` に共通で、Ionicの `color` を指定したボタンにも適用します。solidは強調されたネイティブボタンで背景色を維持し、outlineは枠線の色と幅を維持します。元のclickやフォーム送信の動作も維持します。`type="submit"` と `.button-submit` によって配置条件は変わりません。

```html
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="end">
      <ion-button type="button" fill="outline" color="primary" aria-label="Done">
        <ion-icon name="checkmark-outline" slot="icon-only"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
```

アイコンだけの操作には、`aria-label="Done"` などのアクセシブルな名前を付けます。元のIonicイベントハンドラやフォームとの関連付けは、元のボタンに維持してください。

個別のボタンにも `ion-buttons` 内のボタンにも同じ規則が適用され、通常のページと最前面の全幅modalで利用できます。中央に表示するmodal、メニュー、popoverは独自のtoolbar配置を維持します。水平に残すにはグループまたは個別のボタンに `.ios-theme-horizontal-only` を追加します。配置はrouteページへ入る時に選ばれます。既存ボタンの内容やアイコンのslotを変更しても、ページを離れて戻るまでtoolbarと縦の操作領域の間を移動しません。

### タブバー

`ion-tabs` がある場合、タブバーは確保した領域へ移動し、ネイティブのDuoと同じ端の余白を使います。Ionicの `slot` で位置を変えることはできません。ネイティブ描画なしでは、通常のWeb操作領域はネイティブの静止時の表示と同じくアイコンだけを表示します。押したままドラッグすると、アイコンとラベルを持つすべてのタブがラベルを表示し、移動先を確認できます。Webタブバーはシミュレートしたシステム領域でpointer入力を受けます。ネイティブのタブと復元されたWebタブバーは180msでフェードインし、非表示になる時は即座に消えます。動きを減らす設定ではフェードしません。sidebar型のナビゲーションには `ion-menu` を使ってください。このモードはタブをメニューへ変換しません。`ion-tabs` がなくてもWebクローンは動作します。モードの無効化やページ退出でネイティブの制御・Webクローンを削除し、元の部品を復元します。システム操作部品の縦配置を変えてシミュレートするには `--ios-theme-vertical-bars-toolbar-top` を上書きします。

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

登録済みの `--ios-theme-split-pane-width` は既定で `320px`、`.ios-theme-split-pane-half-open` を付けると `50vw` です。`foldStateChange` が `state === 'half-opened'` を通知したら `halfOpened` を設定し、初期値は `getFoldState()` で取得します。Ionicの `when` が常時表示のside paneにするか決めます。half-opened状態またはヒンジ形状のあるflat状態では900px、closed状態またはヒンジ形状のないflat状態では通常の992pxを使います。`hingeBounds` がないことだけではflat状態とは判断できません。幅の規則を適用する場所はアプリが選び、他の通常のsplit paneは変わりません。この配置はVertical Barsを有効化せず、overlayメニューも移動しません。

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
| **`inset`** | `number` | CSSピクセルで指定する操作領域の幅。省略時はスタイルシートのsafe area規則を使います。 |
| **`nativeEdge`** | `VerticalBarEdge` | アプリの端末プラグインが通知するネイティブの論理方向。nullまたは未登録ならverticalBarsOnlyではWebの操作領域、それ以外では通常のNative UI Shell配置を使います。省略すると前回値を維持します。 |

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
