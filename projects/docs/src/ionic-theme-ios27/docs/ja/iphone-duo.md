---
title: iPhone Duo対応（プレビュー）
---

IonicアプリをiPhone Duoへ対応させます。縦のシステム操作領域へナビゲーションと操作部品を置き、端末の開閉に合わせてsplit paneを調整できます。ラベル、アイコン、ルーティング、click handlerは既存のIonicマークアップが管理します。

**初めて使う場合は** [既存テーマでiPhone Duoに対応する](/docs/iphone-duo-with-original-theme)から、Chromeで側面のレイアウトを試してください。このページは端末イベント、配置、split paneを説明します。操作部品の描画とruntime APIは[Vertical Bars](/docs/vertical-bars)を参照してください。

[Native UI Shell](/docs/native-ui-shell)とともに `1.2.0` で利用できる **プレビュー機能** です。安定版になるまでAPIと対応する動作は変更される可能性があります。安定版への移行はXcode 27.1の正式リリース後を予定しています。実際のシステム操作領域とヒンジ情報には、iOS 27.1以降とXcode 27.1以降でビルドしたアプリが必要です。

このパッケージは独立した2つの機能を提供します。それぞれ **iOS 27テーマのスタイルシートなし**、**完全なNative UI Shellなし** で利用できます。

- `dist/css/vertical-bars.css` — 操作領域のsafe areaを確保するopt-inクラスと、開閉状態に応じてsplit paneの幅を変える登録済みcustom propertyです。
- `enableVerticalControlArea()` — 対象のタブとtoolbarの操作部品を確保した領域へ移動します。Capacitor iOSではネイティブのSwiftUI `TabView` とtoolbar、それ以外では同じ部品のWebクローンで描画します。

端末状態の取得は [`@erkamyaman/capacitor-foldable`](https://github.com/erkamyaman/capacitor-foldable) が担います。**アプリ** がイベントを購読してレイアウトを選び、このパッケージの **スタイルシートとruntime** が領域の確保、操作部品の描画、split paneの変更を行います。テーマ自身はヒンジ状態や操作領域の配置を監視しません。

## 利用する機能を選ぶ

既存テーマを維持して独立した対応機能だけを追加する場合は、[既存テーマでiPhone Duoに対応する](/docs/iphone-duo-with-original-theme)を参照してください。このページは共通の端末レイアウト規則を説明します。

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

`ion-app` のマウント後、端末状態を `applyFoldStateClasses` に渡します。購読と後処理はアプリが管理します。開閉状態に応じたレイアウトに描画runtimeは不要です。

```ts
import { Foldable } from '@erkamyaman/capacitor-foldable';
import { applyFoldStateClasses } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const root = document.querySelector('ion-app')!;
const listener = await Foldable.addListener('foldStateChange', (fold) => applyFoldStateClasses(root, fold));
applyFoldStateClasses(root, await Foldable.getFoldState());
```

アプリ内の利用元を破棄するとき:

```ts
await listener.remove();
```

変更を購読してから現在の状態を取得します。初期値にもイベントにも同じhelperを使います。

`applyFoldStateClasses` は指定したrootに `ios-theme-fold-flat`、`ios-theme-fold-half-opened`、`ios-theme-fold-closed` のいずれか1つを設定し、無関係なクラスを維持します。half-opened状態、またはヒンジ形状を持つflat状態では `ios-theme-fold-expanded` も設定します。形状のないflat状態（Webのフォールバックを含む）とclosed状態ではそのクラスを解除します。helper自身はプラグインを購読せず、Ionicのsplit paneの `when` も変更しません。

操作領域の配置には、後述の `setVerticalControlAreaPlacement` を使います。通知された論理方向を `edge` と `nativeEdge` の両方へ、実測幅を `inset` へ渡します。leadingはLTRでは物理的な左、RTLでは物理的な右です。端がnullなら通常の配置へ戻り、insetが0なら明示的な幅を解除します。監視を開始・停止する別の呼び出しは不要です。

WebViewの角丸半径は描画側が担い、`configureNativeTransition()` はFoldableとは独立したShellの `getWebViewMetrics()` を使います。

**移行:** テーマの従来の `DeviceLayout`、`HingeStatus`、`getDeviceLayout()`、`deviceLayoutChange` と端末監視の開始・停止APIは削除されました。端末状態の購読は上記のFoldable APIへ置き換え、角丸半径の一度だけの取得には `getWebViewMetrics()` を使います。FoldableはiOS 27.1 SDKを使わないビルドでもsafe areaのinsetからDuoの配置を推定できます。ヒンジ情報には新しいSDKが必要です。アプリは通知された端とは独立して固定の配置を要求することもできます。

## 縦の操作領域を確保する

上記のとおり `vertical-bars.css` を読み込みます。クラスによるブラウザでのシミュレーション、safe area、RTL、overlayの配置は[縦の操作領域を確保する](/docs/vertical-bars#縦の操作領域を確保する)を参照してください。実機では以下の配置helperがレイアウトクラスと実測insetを適用します。

## 操作部品を縦の領域へ描画する

`ion-app` のマウント後に独立したruntimeを一度起動し、プラグインの配置を `setVerticalControlAreaPlacement` で適用します。

```ts
import { Foldable } from '@erkamyaman/capacitor-foldable';
import { setVerticalControlAreaPlacement, enableVerticalControlArea } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const rail = await enableVerticalControlArea();
const listener = await Foldable.addListener('barPlacementChange', ({ verticalBarEdge, inset }) =>
  setVerticalControlAreaPlacement({ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset }),
);
const { verticalBarEdge, inset } = await Foldable.getBarPlacement();
setVerticalControlAreaPlacement({ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset });
```

アプリ内の利用元を破棄するとき:

```ts
await listener.remove();
await rail.destroy();
```

初期値の取得時と各イベントで `nativeEdge` を渡し、システムが実際に提供する端を描画側に伝えます。幅は固定値を仮定せず、実測 `inset` を渡します。WebやAndroidを含め、操作領域を通知しない端末は端がnullとなり、通常のレイアウトを維持します。ブラウザでのシミュレーションには、端末配置と接続せず[クラスによるプレビュー](/docs/vertical-bars#縦の操作領域を確保する)を使います。

`enableVerticalControlArea()` と完全な `enableNativeUIShell()` のいずれか一方を起動してください。既にNative UI Shellを使う場合はそのruntimeを維持し、同じ `setVerticalControlAreaPlacement` のcallbackを使います。アプリ内の利用元が終了時にlistenerを削除してruntimeを破棄します。

対応するiOSでは、対象のタブ、戻る操作、メニューボタン、固定toolbarの操作をネイティブのSwiftUI `TabView` とtoolbarへ渡します。Web、Android、ネイティブ描画が利用できない場合はWebクローンへフォールバックします。対象となる部品は[Toolbarの操作部品](/docs/vertical-bars#toolbarの操作部品)を参照してください。

### Toolbarの操作部品

対応するマークアップ、配置、ボタンの外観、個別の上書きは[Vertical Bars: Toolbarの操作部品](/docs/vertical-bars#toolbarの操作部品)を参照してください。

### タブバー

ナビゲーション、ラベル、Webへのフォールバックは[Vertical Bars: タブバー](/docs/vertical-bars#タブバー)を参照してください。

## Split paneを開閉状態に合わせる

iPhone Duoの横並びメニューには、Settings画面から別途計測したsplit pane配置を適用できます。sidebarは完全に開くと320pt、半開きでは画面中央まで（50vw）広がります。開閉状態はアプリが指定します。両状態のviewport幅は同じため、幅のmedia queryだけでは区別できません。

```html
<ion-split-pane
  class="split-pane-fold-layout"
  contentId="main-content"
  when="(min-width: 900px)"
>
  <ion-menu contentId="main-content">...</ion-menu>
  <div id="main-content">...</div>
</ion-split-pane>
```

通常のsplit pane幅をアプリのスタイルシートで320ptに設定し、半開きクラスで幅の値だけを変えます。

```css
ion-split-pane.split-pane-fold-layout {
  --ios-theme-menu-width: var(--ios-theme-split-pane-width);
  --side-width: var(--ios-theme-menu-width);
  --side-max-width: var(--ios-theme-menu-width);
  transition: --ios-theme-split-pane-width 300ms ease;
}
```

登録済みの `--ios-theme-split-pane-width` は既定で `320px` です。`applyFoldStateClasses` が `ion-app` に `ios-theme-fold-half-opened` を設定すると、スタイルシートは子孫の `split-pane-fold-layout` を持つsplit paneだけを `50vw` にします。このopt-inクラスは一度追加すればよく、状態に応じたクラスのbindingは不要です。他のsplit paneは既存の幅を維持します。

メニューを常時表示するかどうかは引き続きIonicの `when` が制御します。この例は固定の900pxをbreakpointにしています。折りたたみ画面と通常画面で異なるbreakpointが必要なら、helperが設定する `ios-theme-fold-expanded` をアプリのレイアウトコードで使って方針を切り替えてください。helperは状態クラスだけを更新し、`when` は変更しません。このレイアウトはVertical Barsを有効にせず、overlayのメニューも移動しません。

## Vertical Control Area API

runtimeのhandleのリファレンスは[Vertical Bars](/docs/vertical-bars#vertical-control-area-api)を参照してください。
