---
title: 縦型バー（プレビュー）
---

Vertical Barsは対象のIonicナビゲーションと操作部品を側面の操作領域へ移動します。ラベル、アイコン、動作は元のコンポーネントが引き続き管理します。このテーマでも既存のIonicテーマでも利用でき、ヒンジの開閉状態や完全なNative UI Shellから独立しています。

このページではレイアウト、操作部品の対応条件、ネイティブボタンの外観、runtime APIを説明します。端末イベントとsplit paneは[iPhone Duo対応](/docs/iphone-duo)、ブラウザでのプレビューとネイティブ設定の手順は[既存テーマでiPhone Duoに対応する](/docs/iphone-duo-with-original-theme)を参照してください。

`1.2.0` で利用できる **プレビュー機能** です。APIと対応する動作は変更される可能性があります。

## 縦型バーを有効にする

opt-inスタイルシートを読み込みます。

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

`ion-app` のマウント後、runtimeを1つ起動します。

```ts
import { enableVerticalControlArea } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const rail = await enableVerticalControlArea();
```

ブラウザでのシミュレーションには下記のクラスを追加し、iPhone Duoでは[端末の配置を適用](/docs/iphone-duo#操作部品を縦の領域へ描画する)します。配置と後処理はアプリが管理し、利用元の破棄時に `await rail.destroy()` を呼びます。既に `enableNativeUIShell()` を使う場合はそのruntimeを維持してください。Vertical Barsを含むため、両方を起動しないでください。

`/vertical-bars` のentry pointはブラウザビルドでも `@capacitor/core` を必要とします。CSSだけの利用にruntimeは不要です。ネイティブの設定と画面遷移は[既存テーマ向けガイド](/docs/iphone-duo-with-original-theme)に従ってください。

対応するCapacitor iOSでは対象の部品をSwiftUIで描画します。Web、Android、ネイティブ描画が使えない環境ではWebクローンを使います。ブラウザのプレビューは配置と操作を確認できますが、ネイティブボタンの外観は比較できません。

## 縦の操作領域を確保する

`ion-app` に `.ios-theme-vertical-bars` を追加すると物理的な右側に領域を確保します。左側に置く場合は `.ios-theme-vertical-bars-left` も追加します。

```html
<ion-app class="ios-theme-vertical-bars">...</ion-app>
```

CSSとネイティブ描画は物理座標を使うため、クラスも物理方向です。`-left` は常に物理的な左端を意味します。通常は後述の `setVerticalControlAreaPlacement` で適用します。`Foldable` の論理方向 `verticalBarEdge` をdocumentの文字方向で解決するため、RTLアプリも独自の変換を必要としません。

Chromeでの開発にはネイティブプラグインは不要です。クラスだけで `80px` を確保し、iPhone Duoをシミュレートできます。`setVerticalControlAreaPlacement` に明示的な `{ edge, nativeEdge, inset }` を渡すと、そのinsetでフォールバックの幅を置き換えます。`80px` 未満でも同様です。異なる配置をシミュレートするには `--ios-theme-vertical-bars-safe-area-left` または `--ios-theme-vertical-bars-safe-area-right` を上書きします。

routerとコンポーネントの背景はviewport全体を維持します。`ion-content` はスクロールする前景、`ion-toolbar` はcontainerの前景を移動し、`ion-fab` はシステムUIの隣に置く場合だけ調整します。前景コンポーネント内では対応するIonic safe area変数をリセットし、子孫でinsetが二重に加わるのを防ぎます。

`ion-modal` は、表示中のダイアログがviewportの全幅に広がる場合、同じ前景の補正を適用します。Vertical Control Areaのruntimeを有効にすると、最前面の全幅modalは対象のtoolbarボタンを専用の操作領域へ描画します。中央に表示するダイアログはtoolbarボタンを維持し、ページの操作領域用のinsetを適用しません。全幅のsheet modalも対象で、breakpointが変わると操作領域も表示中のsheetの範囲に追従します。対象になるかは、ヒンジの開閉状態やmodalの種類ではなく、表示中のダイアログの幅で決まります。`ion-menu` と `ion-popover` は独立した面として扱い、内部の前景にはメインページの変換を適用せず、Ionic標準のsafe area処理を維持します。システムUI側から開くメニューはviewport全体のanimation hostを保ち、可視containerだけをinset分ずらします。反対側のメニューは変わりません。RTLでもleftとrightは物理座標で、Ionicの `side="start"` と `side="end"` は論理方向です。

このモードはコンポーネントmodeから独立しています。iOSでIonicの `mode: 'md'` を維持したままVertical Barsを有効にでき、`mode="ios"` は不要です。

## ネイティブ描画

対応するiOSでは `.ios-theme-vertical-bars` により、システムが物理的な側面の操作領域へ移す部品だけが変わります。クラスの適用後、Native UI Shellは対象のタブ、戻る操作、メニューボタン、toolbarの操作をSwiftUIの `TabView` とtoolbarで表示します。iOS 27.1以降へリンクしたiPhone DuoでOSが端を報告する場合、適用する配置と一致する必要があり、不一致ならWebの操作領域を維持します。端を報告できない古いtoolchainではDOMの配置を直接使います。適応的な配置とLiquid Glassの外観はSwiftUIが管理し、ラベル、アイコン、選択・無効状態、ルーティング、フォーム送信、click handlerはIonicが管理します。

SwiftUIの描画面はシステム操作領域に合わせてclipとhit testを行います。その外側のWebコンテンツは引き続き表示・操作できます。runtimeは元の `ion-tab-button` へ操作を渡す前にタブ選択を楽観的に更新し、他のネイティブ部品と同じイベント・古いrevisionの保護を使います。overlayの配置は[操作領域の確保規則](#縦の操作領域を確保する)に従います。

## Toolbarの操作部品

標準の `ion-back-button` は固定toolbarの外、routeのコンテンツや常駐するapp shellからも描画できます。`ion-menu-button` と他のtoolbar操作には固定toolbarが必要です。

`ion-button` 内の `ion-icon` またはSVGに `slot="icon-only"` があると、ボタンは縦の操作領域へ移動します。ボタンは `ion-header` または `ion-footer` 直下の固定 `ion-toolbar` 内に置き、スクロールする `ion-content` の外に配置してください。

| アイコンのマークアップ | 配置 |
| --- | --- |
| `slot="icon-only"` | 縦の操作領域 |
| `slot="start"`、`slot="end"`、slotなし | 元の水平toolbar |
| アイコンなし | 元の水平toolbar |

```html
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="end">
      <ion-button aria-label="Done">
        <ion-icon name="checkmark-outline" slot="icon-only"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
```

すべてのfill（`default`、`clear`、`solid`、`outline`）とIonicのcolorに同じ配置規則が適用されます。アクセシブルな名前と元のclick・フォーム送信handlerを元のボタンに維持してください。`type="submit"` と `.button-submit` によって配置は変わりません。

個別のボタンにも `ion-buttons` 内のボタンにも同じ規則が適用され、通常のページと最前面の全幅modalで利用できます。中央に表示するmodal、メニュー、popoverは独自のtoolbar配置を維持します。水平に残すにはグループまたは個別のボタンに `.ios-theme-horizontal-only` を追加します。配置はrouteページへ入る時に選ばれます。既存ボタンの内容やアイコンのslotを変更しても、ページを離れて戻るまでtoolbarと縦の操作領域の間を移動しません。

### ボタンの外観を選ぶ

`buttonProjection` と以下の要素単位の描画設定は `1.2.0` で利用できます。

ネイティブの縦型 `ion-button` と `ion-menu-button` の外観を誰が制御するかを選びます。

| `buttonProjection` | 外観 |
| --- | --- |
| `'system'`（既定） | SwiftUIがボタンのスタイルとアイコンの色を設定します。Ionicのfill、色、枠線は適用しません。 |
| `'source'` | [Sourceのfill規則](#sourceのfill規則)で説明するIonicのfillと計算済みの色を反映します。 |

```ts
const rail = await enableVerticalControlArea({ buttonProjection: 'source' });
```

このオプションは `enableVerticalControlArea()` と `enableNativeUIShell()` の両方で使えます。runtimeは1つにし、設定を変えて再起動する前に破棄してください。どちらのmodeも操作、無効状態、グループ構成を維持します。外観設定は水平の部品、元の要素、Webのフォールバック用クローンに影響しません。対応するiOSでネイティブの外観を比較してください。

**実験的リリースからの移行:** 既定値が元のスタイルから `system` へ変わります。従来の描画を維持するには `buttonProjection: 'source'` を設定します。

### 個別のボタンやグループを上書きする

要素単位の例外には `data-projection` を使います。既存のクラスも引き続き使えます。

| 属性 | 同等のクラス |
| --- | --- |
| `data-projection="source"` | `ios-theme-projection-source` |
| `data-projection="system"` | `ios-theme-projection-system` |

```html
<ion-buttons data-projection="source">
  <ion-button fill="solid" aria-label="Add">
    <ion-icon name="add-outline" slot="icon-only"></ion-icon>
  </ion-button>
  <ion-button data-projection="system" aria-label="Search">
    <ion-icon name="search-outline" slot="icon-only"></ion-icon>
  </ion-button>
</ion-buttons>
```

最初に見つかった設定を優先します。

1. ボタン自身の設定。
2. 最も近い `ion-buttons` の設定。
3. 起動時の `buttonProjection`。省略時は `system`。

同じ要素では、有効な `data-projection` 値がクラスより優先します。空や未知の値は無視します。有効な属性がなく両方のクラスがある場合は `system` が優先します。属性を削除すると要素のクラス、次に上位の設定へ戻ります。属性とクラスの変更はruntimeの再起動なしで反映され、グループ構成と配置は変わりません。

この設定を解釈するのはネイティブの縦型 `ion-button` と `ion-menu-button` だけです。他の祖先、戻るボタン、タブ、FABには適用しません。Webスタイルも変えません。部品やその子孫を完全にWebに残すには [`data-shell="disabled"`](/docs/native-ui-shell#対応マークアップ) を使います。

### Sourceのfill規則

`source` と判断された `ion-button` のfillは、描画modeとは別に決まります。

| ボタン | 有効なfill |
| --- | --- |
| 明示的な `fill="clear"`、`"solid"`、`"outline"` | 指定した値 |
| `ion-buttons` 内でfillを省略、または `fill="default"` | `clear` |
| `ion-buttons` 外でfillを省略、または `fill="default"` | `buttonDefaultFill` |

`buttonDefaultFill` は `'solid'` または `null` だけを受け付け、省略は `null` と同じです。Ionic標準のボタンデザインには `'solid'`、このテーマ標準のglassデザインには `null` を使います。全体が `system` のときの個別例外も含め、`source` と判断されたすべてのボタンに適用します。

```ts
// 全体はsystemを維持し、個別のsourceボタンにはIonic標準のfillを使います。
const rail = await enableVerticalControlArea({ buttonDefaultFill: 'solid' });
```

```html
<!-- 固定toolbar内のion-buttons外では、省略したfillはsolidになります。 -->
<ion-button data-projection="source" aria-label="Add">
  <ion-icon name="add-outline" slot="icon-only"></ion-icon>
</ion-button>
```

| 有効なfill | `source` modeのネイティブ外観 |
| --- | --- |
| `clear` | アイコンの色を維持し、glass背景は付けません。CSSの背景は無視します |
| `solid` | 計算済み背景色で強調されたglassボタンを着色します |
| `outline` | 計算済みの枠線の色・幅とネイティブglassを使います |
| `null` | 元のアイコンの色とネイティブglassを使います |

`ion-buttons` 内で背景を描画するには `fill="solid"` を明示します。`buttonDefaultFill: 'solid'` はグループの既定のclearを上書きしません。ネイティブLiquid Glassの色付けは、特に半透明の背景ではCSSの色と異なることがあります。iOSテーマでは通常の `ion-buttons` はグループで描画し、`ion-buttons.ios-theme-disabled` は対象ボタンを個別に描画します。要素単位の描画設定はこのグループ規則を変えません。

## タブバー

`ion-tabs` がある場合、タブバーは確保した領域へ移動し、ネイティブのDuoと同じ端の余白を使います。Ionicの `slot` で位置を変えることはできません。ネイティブ描画なしでは、通常のWeb操作領域はネイティブの静止時の表示と同じくアイコンだけを表示します。押したままドラッグすると、アイコンとラベルを持つすべてのタブがラベルを表示し、移動先を確認できます。Webタブバーはシミュレートしたシステム領域でpointer入力を受けます。ネイティブのタブと復元されたWebタブバーは180msでフェードインし、非表示になる時は即座に消えます。動きを減らす設定ではフェードしません。sidebar型のナビゲーションには `ion-menu` を使ってください。このモードはタブをメニューへ変換しません。`ion-tabs` がなくてもWebクローンは動作します。モードの無効化やページ退出でネイティブの制御・Webクローンを削除し、元の部品を復元します。システム操作部品の縦配置を変えてシミュレートするには `--ios-theme-vertical-bars-toolbar-top` を上書きします。

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
