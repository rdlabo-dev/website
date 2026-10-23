---
title: Vertical Bars
---

# Vertical Bars

Vertical Bars は対象 Ionic コントロールや明示的に指定した HTML ボタンをサイドレールへ移し、ラベル、アイコン、動作の正として元の要素を維持します。iOS テーマや既存 Ionic テーマと使え、ヒンジの状態や Native UI 全体から独立しています。

このリファレンスを使う前に設定方法を選びます。

- **独自または標準テーマの Ionic:** [Ionic レール設定](ionic-vertical-bars.md#try-it-in-your-existing-ionic-app)。
- **Ionic なし:** [HTML 設定](framework-independent.md)と[デバイスレール設定](framework-independent.md#device-placement-for-vertical-bars)。`/core` と独自レイアウトを使います。以下の Ionic 設定は適用しません。
- **既存の iOS 27 テーマと Native UI:** 既存ランタイムで[デバイス配置を接続](#use-with-capacitor-foldable)します。

このページはデバイスプラグイン連携、対象条件、ネイティブ外観、ランタイム設定を説明します。折りたたみ状態に応じた Ionic 分割ペインは[デバイスレイアウトと分割ペイン](../../theme-ios27/docs/vertical-bars-layout.md)を参照してください。

Vertical Bars と iPhone Duo 対応は 2.0.0 から安定版です。

既定値と実行中の `rail.enableVerticalControlArea()` / `rail.disableVerticalControlArea()` は[共通設定](configuration.md)を参照してください。[通常の HTML コントロール](framework-independent.md)も同じネイティブレール描画を使用します。

## Vertical Bars を有効にする

Native UI と必須のデバイス状態プラグイン Foldable をアプリの直接依存に追加します。

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Ionic は[標準設定](ionic-vertical-bars.md)に従います。レール CSS、ナビゲーションを設定し、Foldable の初期配置と `barPlacementChange` を接続してから単一ランタイムを起動します。[後述の連携](#use-with-capacitor-foldable)は既存ランタイムとアプリ所有 CSS も扱います。Web アセットをビルドし、`npx cap sync ios` 後にネイティブアプリを再ビルドします。

ランタイムだけでは Web の領域を確保しません。標準設定ではデバイス購読を維持し、手動配置は[任意のブラウザープレビュー](ionic-vertical-bars.md#optional-browser-preview)で使います。Native UI が有効なら別のランタイムを起動せず再利用してください。

`/vertical-bars` はブラウザービルドでも `@capacitor/core` が必要です。テーマのレール CSS のみならネイティブランタイムは不要です。ネイティブ設定と画面遷移は[既存テーマのガイド](ionic-vertical-bars.md)に従ってください。

対応する Capacitor iOS では対象のコントロールを SwiftUI で描画します。Web、Android、ネイティブ投影が利用できない場合は Web の複製を使います。ブラウザープレビューで配置と操作を確認できますが、ネイティブボタンの外観は比較できません。

## 配置と Web レイアウト

Web の余白、レール配置、フォールバックのスタイルはアプリかテーマが管理します。プラグインは提供された Ionic レイアウトと配置を読み、自身では Web コンテンツの領域を確保しません。iOS27 テーマでは `setVerticalBarsLayout({ edge, inset })` を使います。ネイティブのみのアプリは独自 CSS を使い、テーマヘルパーは不要です。ネイティブの利用可否は Web レイアウトとは独立してデバイスメトリクスから取得します。

[任意のテーマのレールスタイルシート](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.2/packages/theme-ios27/docs/vertical-bars-layout.md)は完成済みのレイアウトを提供します。クラスや CSS 変数の利用にテーマパッケージの導入は必須ではなく、アプリが同等のレイアウトを実装できます。現在のランタイムはスタイルの提供元に関係なく、`ion-app` の `ios-theme-vertical-bars` でレールレイアウトを識別します。

## Capacitor Foldable と併用する

標準の Vertical Bars 設定には [`@erkamyaman/capacitor-foldable`](https://github.com/erkamyaman/capacitor-foldable) が必要です。上記のように Native UI と一緒に導入し、デバイス配置を Web レイアウトへ接続してください。Native UI は自動で Foldable を購読しません。

配置の例には `BarPlacement.inset` を含む Foldable **バージョン 8 の 8.3.3 以降**が必要です。古い版なら `npm install @erkamyaman/capacitor-foldable@^8.3.3` で更新し、同期・再ビルドしてください。

| 所有者 | 責務 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| Foldable | 初期のデバイス状態と以降の配置・折りたたみ状態の変更を通知。 |
| アプリまたはテーマ | 通知された論理方向と計測インセットで Web の領域を確保し、レイアウトを選択。 |
| Native UI | ネイティブレールの利用可否を独立して確認し、対象ソースを投影。 |

### テーマの Ionic レールレイアウトと併用する

[レールスタイルシート](../../theme-ios27/docs/vertical-bars-layout.md)を読み込み、`ion-app` をマウントした後、デバイス配置を接続してランタイムを一度起動します。

```ts
import { Foldable, type BarPlacement } from '@erkamyaman/capacitor-foldable';
import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const applyPlacement = ({ verticalBarEdge, inset }: BarPlacement) => setVerticalBarsLayout({ edge: verticalBarEdge, inset });
const listener = await Foldable.addListener('barPlacementChange', applyPlacement);
applyPlacement(await Foldable.getBarPlacement());
const rail = await enableNativeUI({ controls: 'verticalOnly' });
```

既存ランタイムがあれば維持し、配置の購読だけを追加します。`setVerticalBarsLayout` は RTL の論理方向を解決し、null の edge で通常の Web レイアウトへ戻します。固定幅ではなく計測インセットを使ってください。テーマのレールスタイルシートを維持し、Foldable の `ionic-tabs.css` は不要です。

アプリの所有コンポーネントを破棄するときは、購読を削除して自身のランタイムを破棄します。

```ts
await listener.remove();
await rail.destroy();
```

### アプリ所有の CSS、または Ionic なしで使う

同じ `getBarPlacement()` / `barPlacementChange` を購読し、`setVerticalBarsLayout` の代わりに独自 CSS へ edge と inset を適用します。null の edge では通常の余白へ戻します。Ionic は前述のレールクラスを維持します。HTML は `/core` と[デバイスレール設定](framework-independent.md#device-placement-for-vertical-bars)を使います。Foldable と Native UI はアプリの CSS を提供しません。明示的な HTML レールマーカーは CSS と独立して有効なため、null の edge でソースを元の配置に戻すには `disableVerticalControlArea()`、レール edge が戻れば `enableVerticalControlArea()` を呼びます。これらの変更とレイアウト更新は直列化してください。

Web レイアウト更新とネイティブの利用可否を分離してください。Foldable の edge を非推奨の `nativeEdge` へ渡さないでください。Native UI 自身が能力を取得します。この購読を模擬配置に置き換えるのは任意のブラウザープレビューだけです。

ヒンジに応じた内容レイアウトは別途 `getFoldState()` と `foldStateChange` を使います。ヒンジ状態はコントロール選択やレール有効化をしません。テーマの[状態購読と分割ペインの例](../../theme-ios27/docs/vertical-bars-layout.md#read-the-device-layout)を参照してください。

## ネイティブ描画

対応 iOS では `.ios-theme-vertical-bars` が変えるのはシステムが物理的なサイドレールへ移すコントロールだけです。クラス適用後、対象のタブ、戻る操作、メニューボタン、ツールバー操作を SwiftUI の `TabView` とツールバーで表示します。OS がレール edge を報告する場合（iOS 27.1 以降にリンクした iPhone Duo）、適用済みの配置と一致する必要があります。不一致やデバイスからの edge がなければ Web フォールバックを維持します。配置の希望値で非対応のネイティブレールを有効にはできません。SwiftUI が適応配置と Liquid Glass の外観を管理し、ラベル、アイコン、選択・無効状態、ルーティング、フォーム送信、クリックハンドラーは Ionic を正とします。

SwiftUI の面はシステムレール内でクリップ・ヒットテストされます。その物理領域の外の Web 内容は表示・操作を維持します。ランタイムは元の `ion-tab-button` へ転送する前にタブ選択を先行更新し、他のネイティブコントロールと同じイベント・古いリビジョン対策を使います。オーバーレイは使用時に[任意のテーマレールレイアウト](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.2/packages/theme-ios27/docs/vertical-bars-layout.md#reserve-the-vertical-rail)に従い、独自レイアウトはアプリが管理します。

### ネイティブポップオーバー（Vertical Bars のみ）

ネイティブポップオーバーは、受理されたネイティブ Vertical Bars の `ion-button` をアンカーにする場合だけです。単独ランタイムでも使え、Native UI 全体は不要です。起動時に明示的に有効にします（`popover` の既定値は `false`）。

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const rail = await enableNativeUI({
  controls: 'verticalOnly',
  ionic: { verticalBars: { popover: true } },
});
```

投影ボタンを `trigger` で指定した `ion-popover`、またはそのクリックイベントを渡す `PopoverController.create({ event, ... })` を使います。通常のツールバー・本文のポップオーバーは Web に残ります。レールのポップオーバーが Web に戻る場合、閉じるまでレールも Web 投影になります。[ネイティブポップオーバーの動作と制限](native-ui.md#popovers-anchored-to-vertical-bars)を参照してください。

## ツールバーの操作

標準の `ion-back-button` は固定ツールバー外でも、ルーティングされた内容や常設アプリ Shell から投影できます。`ion-menu-button` と他のツールバー操作には固定ツールバーが必要です。

既定で `ion-button` は `slot="icon-only"` の `ion-icon` または SVG を含むとレールへ移ります。スクロールする `ion-content` の外で、`ion-header` または `ion-footer` 直下の固定 `ion-toolbar` 内に置く必要があります。

| アイコンのマークアップ | 配置 |
| ---------------------------------------- | --------------------------- |
| `slot="icon-only"` | 縦向きレール |
| `slot="start"`、`slot="end"`、slot なし | 元の水平ツールバー |
| アイコンなし | 元の水平ツールバー |

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

すべての fill（`default`、`clear`、`solid`、`outline`）と Ionic カラーに同じ配置規則を適用します。アクセシブルな名前と元のクリック・フォーム送信ハンドラーはソースボタンに維持します。`type="submit"` と `.button-submit` は別の配置を選択しません。

通常ページと最前面の全幅モーダルで、個別ボタンと `ion-buttons` 内のボタンに適用します。中央モーダル、メニュー、ポップオーバーは固有のツールバー配置を維持します。グループか個別ボタンに `.ios-theme-horizontal-only` を追加すると水平のままにできます。配置はルーティングされたページに入る時に決めるため、内容やアイコン slot を変更してもページを離れて入り直すまで移動しません。

内容がすべてレールへ移ったツールバーは投影中に折りたたまれます。タイトル、直接のテキスト、他の内容、horizontal-only コントロールを含むツールバーは表示を維持します。投影を解除すると元のツールバーを復元します。

### 操作の選択とグループ化を独立させる

`controls` でツールバーの選択とグループ化を設定します。各項目は `true`、`false`、`'horizontalOnly'`、`'verticalOnly'` を受け、省略は `true` です。既定の選択すべてをレールに限定するには `controls: 'verticalOnly'` を使います。ローカル属性で選択を上書きできます。明示的ソースと拡張は独立しています。[全選択既定値](configuration.md#selection-defaults)を参照してください。

| オプション | 責務 | 行わないこと |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `button` | `ion-buttons` 内外の対象 `ion-button` と `ion-menu-button` を自動選択。 | 戻るボタンの選択。 |
| `buttonGroup` | 既存の条件を満たす場合、`ion-buttons` 内の選択済み操作のグループ投影を許可。 | 子操作の選択・有効化・無効化。 |
| `backButton` | 親グループから独立して対象の `ion-back-button` を自動選択。 | 戻るボタンと他の操作のグループ化。 |

ローカル属性がない、グループ内の通常のアイコンのみのボタンの場合:

| `buttonGroup` | `button` | 結果 |
| ------------- | -------- | ------------------------------------------------------------ |
| `true` | `true` | グループが条件を満たす場合、対象ボタンをまとめて投影。 |
| `false` | `true` | 対象ボタンを個別に投影。 |
| `true` | `false` | 通常のボタンは投影しない。グループ化だけでは選択しない。 |
| `false` | `false` | 通常のボタンは投影しない。 |

これらの結果は通常の操作だけに適用します。戻るナビゲーション、タブ、ネイティブ
検索は独立しています。たとえばツールバー操作のうち戻る操作だけを
選択するには:

```ts
const rail = await enableNativeUI({
  controls: { buttonGroup: false, button: false, backButton: 'verticalOnly', tabs: 'verticalOnly', segment: false, fab: false },
});
```

これはタブの投影やタブレール CSS を無効にしません。

### 明示的な操作の選択とローカルなグループ化

動作を上書きする要素に `data-vertical-bars="true|false"` を
指定します。この属性は**継承されません**。

| 要素 | `data-vertical-bars="true"` | `data-vertical-bars="false"` | 未指定・不正な場合の既定値 |
| -------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------- | -------------------------------------------------- |
| `ion-button` / `ion-menu-button` | icon-only slot のない対応テキスト操作も含め選択。 | レールから除外。 | `controls.button` と自動形状規則。 |
| `ion-buttons` | 選択済み操作のグループ化を許可。 | 選択済み操作を個別投影。 | `controls.buttonGroup` とグループ対象条件。 |
| `ion-back-button` | グループから独立して戻る操作を選択。 | この戻るボタンをレールから除外。 | `controls.backButton` と戻るボタンの対象条件。 |
| `ion-tab-bar` | 対象レールタブとネイティブ検索を選択。 | ネイティブレールタブ選択を無効化。既存 Web レイアウトは維持。 | `controls.tabs` とタブバーの対象条件。 |

グループ属性は子を選択・除外しません。明示的な有効化でも構造的除外とレールの利用可否は適用されます。

空・未知の属性値は無視します。自動操作選択を無効にし、
テキストボタンを明示的に選択するには:

```ts
const rail = await enableNativeUI({
  controls: { buttonGroup: 'verticalOnly', button: false, backButton: false, tabs: 'verticalOnly', segment: false, fab: false },
});
```

```html
<ion-buttons>
  <ion-button data-vertical-bars="true">Save</ion-button>
  <ion-button>Cancel</ion-button>
</ion-buttons>
```

Save だけが移り、Cancel は水平ツールバーに残ります。グループに
`data-vertical-bars="true"` を追加しても Cancel は選択されません。

`buttonGroup: false` でも明示的に選択した 2 操作をグループ化するには:

```html
<ion-buttons data-vertical-bars="true">
  <ion-button data-vertical-bars="true">Save</ion-button>
  <ion-button data-vertical-bars="true">Done</ion-button>
</ion-buttons>
```

グループ属性を `false` にすると同じ操作を個別に投影します。
グループ化は既存の対象条件を維持し、グループ全体が条件を満たす必要があります。
通常のボタンが 1 つなら単独で投影します。水平の内容を含む
グループは選択された操作を個別に投影します。ソースグループと
未選択の子は元のツールバーに残ります。

明示的な選択でも固定のヘッダー・フッターツールバーが必要です。
Shell の除外、horizontal-only クラス、オーバーレイ制約は維持します。
配置とグループ化はページへの訪問時に取得するため、属性変更は
ページを離れて入り直すと反映されます。起動オプションの変更は
ランタイムを再起動してください。

### グループ内の戻るボタン

`ion-back-button` は `ion-buttons` 内でもナビゲーション操作です。
`buttonGroup`、`button`、グループの `data-vertical-bars` は無視します。
自身の属性が `backButton` を上書きします。専用の戻る位置を使い、
通常の操作グループには入らず、ツールバー操作として重複しません。

```html
<ion-buttons data-vertical-bars="false">
  <!-- backButton が true なら引き続き投影されます。 -->
  <ion-back-button></ion-back-button>
</ion-buttons>
```

Ionic の DOM コンテナーはナビゲーションの役割を変更しません。テーマは
投影された戻る操作を Ionic に転送し、Ionic のルーティングを
ネイティブのナビゲーションスタックへ置き換えません。配置はシステム管理です。

標準アイコン・色、ページ位置を含む既存の対象条件は維持します。
祖先の `data-native-ui="disabled"`、
`ion-buttons` の `.ios-theme-horizontal-only`、その他の構造的除外は
引き続き除外条件です。グループ化設定とは異なります。

### 配置と外観の違い

| 設定 | 値 | 責務 | 適用先 |
| -------------------------- | ----------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `data-native-ui` | `button`、`back-button`、`disabled` | 明示的ソースの宣言、部分木の除外。 | [明示的ソース要素](framework-independent.md#2-mark-source-controls)。`disabled` は祖先にも適用。 |
| `data-native-ui-placement` | `element`、`rail` | 元の要素位置、またはレール要求を選択。 | 明示的ソース。`element` は自動 Ionic コントロールも元の位置に維持。 |
| `data-vertical-bars` | `true`、`false` | レール選択・グループ化の既定値を上書き。 | 前述の Ionic 操作とグループ。 |
| `data-horizontal-bars` | `true`、`false` | 通常配置の選択・グループ化の既定値を上書き。 | [通常の Ionic コントロール](native-ui.md#toolbar-selection-and-grouping)。 |
| `data-projection` | `system`、`source` | 操作を選択せずネイティブ外観を選択。 | ネイティブ縦向き `ion-button` と `ion-menu-button`。最寄りの `ion-buttons` から継承。 |

選択属性は継承しません。外観は後述のボタン優先・次にグループの順です。属性で非対応マークアップや存在しないネイティブレールを利用可能にはできません。

レールは投影コントロール間でライト・ダーク外観を共有します。Web テーマ設定時は [Vertical Bars の共有外観](appearance.md#shared-vertical-bars-appearance)を参照してください。

### ボタンの外観を選ぶ

`ionic.verticalBars.buttonProjection` でネイティブボタンの外観を選びます。

ネイティブの縦向き `ion-button` と `ion-menu-button` で、外観の管理元を選びます。

| `buttonProjection` | 外観 |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `'system'`（既定値） | SwiftUI がボタンを装飾しアイコンを着色。Ionic の fill、色、枠線は適用しない。 |
| `'source'` | [source の fill 規則](#source-fill-rules)に従い、対応する Ionic の fill と計算済み色を投影。 |

```ts
const rail = await enableNativeUI({ controls: 'verticalOnly', ionic: { verticalBars: { buttonProjection: 'source' } } });
```

`enableNativeUI()` と単独の `enableVerticalControlArea()` は `ionic.verticalBars` 内でこれらの設定を受けます。ランタイムは 1 つにし、別設定で再起動する前に破棄してください。どちらも操作、無効状態、グループ化を維持します。無効アイコンはネイティブの無効外観になります。水平コントロール、ソース要素、Web フォールバックの複製には影響しないため、対応 iOS でネイティブ外観を比較してください。

### 個別ボタン・グループを上書きする

ローカルの例外は `data-projection` を使います。既存のクラスも使えます。

| 属性 | 同等のクラス |
| -------------------------- | ----------------------------- |
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

最初に一致した設定を優先します。

1. ボタン自身のローカル設定。
2. 最寄りの `ion-buttons` のローカル設定。
3. 起動時の `buttonProjection`。省略なら `system`。

同じ要素では有効な `data-projection` がクラスより優先します。空・未知の値は無視します。有効な属性がなく両クラスがあれば `system` が優先です。属性を削除すると自身のクラス、次に上位の設定へ戻ります。属性・クラス変更は再起動なしで適用し、グループ化と配置は維持します。

解釈するのはネイティブ縦向きの `ion-button` と `ion-menu-button` だけです。他の祖先、戻るボタン、タブ、FAB は解釈せず、Web スタイルも変えません。コントロール・部分木を完全に Web に残すには [`data-native-ui="disabled"`](native-ui.md#supported-markup) を使います。

### source の fill 規則

`source` と解決された `ion-button` では、投影モードと別に fill を選びます。

| ボタン | 実効 fill |
| ------------------------------------------------------ | ------------------- |
| 明示的な `fill="clear"`、`"solid"`、`"outline"` | 明示した値 |
| `ion-buttons` 内で fill 未指定または `fill="default"` | `clear` |
| `ion-buttons` 外で fill 未指定または `fill="default"` | `buttonDefaultFill` |

`verticalBars.buttonDefaultFill` は `'solid'` または `'glass'` を受け、省略は `'glass'` です。Ionic 標準のボタンなら `'solid'`、ガラスなら `'glass'` を使います。全体が `system` のときのローカル例外も含め、`source` と解決されるすべてのボタンに適用します。

```ts
// 全体では system のスタイルを維持し、ローカルの source ボタンは Ionic の既定の fill を使います。
const rail = await enableNativeUI({ controls: 'verticalOnly', ionic: { verticalBars: { buttonDefaultFill: 'solid' } } });
```

```html
<!-- 固定ツールバーの ion-buttons 外では、fill の省略は solid になります。 -->
<ion-button data-projection="source" aria-label="Add">
  <ion-icon name="add-outline" slot="icon-only"></ion-icon>
</ion-button>
```

| 実効 fill | `source` モードのネイティブ外観 |
| -------------- | ------------------------------------------------------------------- |
| `clear` | アイコン色のみでガラス背景なし。CSS 背景は無視 |
| `solid` | 計算済み背景色で目立つガラスボタンを着色 |
| `outline` | 計算済み枠線色・幅とネイティブガラス |
| `null` | ソースのアイコン色とネイティブガラス |

`ion-buttons` 内で背景を投影するには明示的に `fill="solid"` を設定します。`buttonDefaultFill: 'solid'` はグループの clear 既定値を上書きしません。Native Liquid Glass の色は特に半透明背景で CSS 色と異なる場合があります。iOS テーマでは通常の `ion-buttons` はグループ投影を維持し、`ion-buttons.ios-theme-disabled` は対象ボタンを個別投影します。ローカル投影設定はこの規則を変更しません。

## タブバー

`ion-tabs` があればタブバーは確保した領域へ移り、ネイティブ Duo の端の余白を使います。Ionic の `slot` は別の位置を選びません。ネイティブ投影がない場合、安定した Web レールはネイティブ通常時と同じアイコンのみの表示です。レールを押してドラッグすると、アイコンとラベルを持つすべてのタブがラベルを表示し、移動先を識別できます。Web タブバーは模擬システム領域でポインター入力を受けます。ネイティブタブと復元した Web タブバーは 180ms でフェードインし、消えるときは即時です。視差効果を減らす設定ではフェードを無効にします。サイドバー型ナビゲーションには `ion-menu` を使います。このモードはタブをメニューに変換しません。`ion-tabs` がなくても Web の複製は動作します。無効化やページ離脱ではネイティブ所有権・Web 複製を除去しソースを復元します。模擬システムコントロールの縦配置が違う場合は `--ios-theme-vertical-bars-toolbar-top` を上書きしてください。

## Vertical Control Area API

以下の生成リファレンスは `enableVerticalControlArea()` が返すハンドルを説明します。

<docgen-index>

- [`setPlacement(...)`](#setplacement)
- [`enableVerticalControlArea()`](#enableverticalcontrolarea)
- [`disableVerticalControlArea()`](#disableverticalcontrolarea)
- [インターフェース](#interfaces)
- [型エイリアス](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### setPlacement(...)

```typescript
setPlacement(placement: VerticalBarEdge | VerticalBarPlacement, rtl?: boolean | undefined) => void
```

旧 Web CSS アダプター。代わりにテーマの setVerticalBarsLayout ヘルパーを使ってください。

| 引数 | 型 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **`placement`** | <code><a href="#verticalbaredge">VerticalBarEdge</a> \| <a href="#verticalbarplacement">VerticalBarPlacement</a></code> |
| **`rtl`**       | <code>boolean</code>                                                                                                    |

---

### enableVerticalControlArea()

```typescript
enableVerticalControlArea() => Promise<void>
```

利用可能な場合にレール投影を有効にし、他の設定を維持します。破棄後は拒否します。

---

### disableVerticalControlArea()

```typescript
disableVerticalControlArea() => Promise<void>
```

通常のネイティブコントロールを停止せず、レールソースを Web に戻します。破棄後は拒否します。

---

### インターフェース

#### VerticalBarPlacement

| プロパティ | 型 | 説明 |
| ---------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **`edge`**       | <code><a href="#verticalbaredge">VerticalBarEdge</a></code> |                                                                                     |
| **`inset`** | <code>number</code> | CSS ピクセルで指定するレール幅。省略時はスタイルシートのセーフエリア規則を使用。 |
| **`nativeEdge`** | <code><a href="#verticalbaredge">VerticalBarEdge</a></code> | 無視します。ネイティブの利用可否はプラグイン自身のデバイスメトリクスから取得します。 |

### 型エイリアス

#### VerticalBarEdge

UIVerticalBarEdge と capacitor-foldable に対応する、読字方向の論理的な端。

<code>'leading' | 'trailing' | null</code>

</docgen-api>
