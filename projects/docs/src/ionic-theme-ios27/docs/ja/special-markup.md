---
title: 特別なマークアップとクラス
---

ほとんどのIonicマークアップは変更せずに使えます。以下はテーマが提供する明示的なopt-inです。

## Primaryのsubmit button

solidの送信ボタンは前景にIonicの色のcontrast値を使います。iOS 27の強調ボタンに合わせた方向性のある縁取りを適用するため、追加のbrightness色は不要です。

```html preview
<ion-button type="submit" color="primary">Submit</ion-button>
<ion-button class="button-submit" fill="solid" color="primary">Continue</ion-button>
```

buttonに `type="submit"` を指定できない場合に同じstyleを適用するには、`.button-submit` を使います。

## 推奨するオーバーレイ操作

iOSのalertとaction sheetでは、ボタンに `role: 'preferred'` を設定すると、背景が `--ion-color-primary`、文字とアイコンが `--ion-color-primary-contrast` になります。押下中の背景は `--ion-color-primary-shade` です。Ionicのカスタムroleを使うテーマの規約であり、操作の自動選択・実行はしません。閉じた際のroleは `preferred` です。

```ts
buttons: [
  { text: 'Cancel', role: 'cancel' },
  { text: 'Continue', role: 'preferred' },
];
```

roleなしと `default` は通常の文字色を使います。`cancel` はIonicのキャンセル処理、`selected` は選択状態を維持し、`destructive` は `--ios-theme-destructive-color` を使います。既存の `confirm` は推奨操作として扱いません。単に確定する操作ではなく、推奨する操作に `preferred` を使います。

## iPadのフローティングシート

sheet modalに `expandToScroll: false` を設定すると、iPadで下側の角を丸め、下端に20pxの隙間を設けます。Ionicが各breakpointの表示領域を決めるため、テーマはCSSだけで装飾できます。現在のbreakpoint内で内容がスクロールし、ハンドルのドラッグでサイズを変えられます。既定の `expandToScroll: true` では、下端に接した配置とスクロールによる展開を維持します。

## タブバーの配置

iOSの `ion-tab-bar` に `tab-bar-position-start`、`tab-bar-position-center`、`tab-bar-position-end` のいずれかを追加すると、safe area内でバー全体の配置を指定できます。`slot="top"` と `slot="bottom"` の両方で幅と押下アニメーションを維持します。startとendは文字方向に従い、RTLでは反転します。classなしの配置は変わりません。

```html
<ion-tab-bar slot="bottom" class="tab-bar-position-center">
  <ion-tab-button tab="home">Home</ion-tab-button>
  <ion-tab-button tab="settings">Settings</ion-tab-button>
</ion-tab-bar>
```

別の `ion-fab` の位置は変わらないため、そのスペースも確保してください。

## iPhone Duo対応（実験的機能）

iPhone Duo対応は実験的機能です。Native UI Shellとともに `1.2.0-0` のプレリリースで利用でき、APIと対応する動作は変更される可能性があります。

縦のシステム操作領域、ヒンジの状態、開閉状態に応じたsplit paneの配置は、iOS 27テーマと完全なNative UI Shellから独立しています。描画runtimeを使わないレイアウト監視を含め、詳細は[iPhone Duo対応](/docs/iphone-duo)を参照してください。

既存テーマを維持する独立した導入手順は、[既存テーマでiPhone Duoに対応する](/docs/iphone-duo-with-original-theme)を参照してください。

## 2行のinset list item

slotを指定しない `ion-label` と `ion-note` を隣接させると、2行のitemとして表示します。iOS styleのinset list背景を使う場合はitemを `ion-item-group` で囲み、`ion-list-header` はgroupの外に置きます。

```html preview
<ion-list inset="true">
  <ion-list-header>
    <ion-label>Connections</ion-label>
  </ion-list-header>
  <ion-item-group>
    <ion-item>
      <ion-label>Network &amp; internet</ion-label>
      <ion-note>Mobile, Wi-Fi, hotspot</ion-note>
    </ion-item>
  </ion-item-group>
</ion-list>
```

通常の末尾noteとして表示したい場合は、`ion-note` に `slot="end"` を指定します。

## inset listのsection header

`.item-group-header` を `ion-item-group` に追加すると、component demo pageの先頭で使われている中央揃えのicon、title、descriptionを表示できます。

これは導入用のgroupです。通常のlist itemは、その後に置く別の `ion-item-group` に入れてください。

```html preview
<ion-list inset="true">
  <ion-item-group class="item-group-header">
    <ion-item>
      <ion-label>
        <ion-icon name="list" style="background: var(--ion-color-primary)"></ion-icon>
        <h2>Lists</h2>
        <ion-text>Inset-list examples</ion-text>
      </ion-label>
    </ion-item>
  </ion-item-group>
  <ion-item-group>
    <ion-item><ion-label>First item</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

## 幅いっぱいのsegment

`.segment-style-glass` を追加すると、タブバーと同じglass面と選択indicatorの処理を適用します。既存の寸法と文字色を維持し、スクロール可能なsegmentとIonicの公開 `--background` プロパティにも対応します。

```html
<ion-segment class="segment-style-glass" value="available">
  <ion-segment-button value="available">Available</ion-segment-button>
  <ion-segment-button value="away">Away</ion-segment-button>
</ion-segment>
```

色付きsegmentにはIonicの `color`（例: `color="primary"`、`color="secondary"`）を使います。Ionicはパレットのbase色でtrackを淡く着色し、選択面とラベルはニュートラルに保ちます。周囲の色付きtoolbarはsegment自身に色指定がない場合だけ色を供給します。任意の移動するglassは選択面の色を引き継ぎ、独自のIonicパレットも追加登録なしで使えます。

segment buttonを利用可能な幅に均等配置する場合は `.segment-expand` を追加します。`registerSegmentEffect` を使う場合、このclassはLiquid Glass effectのsizeも変更します。

```html preview
<ion-segment class="segment-expand" value="new">
  <ion-segment-button value="new"><ion-label>New</ion-label></ion-segment-button>
  <ion-segment-button value="replied"><ion-label>Replied</ion-label></ion-segment-button>
</ion-segment>
```

## condense header内のclassic search bar

Themeはdefaultでsearch barにiOS 27の外観を適用します。`collapse="condense"` を指定した `ion-header` のlarge titleの下に表示するsearch fieldには、`.searchbar-classic` を追加します。従来の塗りつぶされたiOSの外観になり、固定headerに残らずlarge titleと一緒にcollapseします。

`color="light"` など、colorを指定したtoolbar内に配置してください。classic背景は、そのcolorのcontrast値から生成されます。

次の例はIonic標準のcollapse可能なlarge title構造です。previewをscrollするとlarge titleがcollapseし、固定headerが表示されます。

```html preview
<div class="ion-page">
  <ion-header translucent="true">
    <ion-toolbar color="light">
      <ion-title>Search</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light" fullscreen="true">
    <ion-header collapse="condense">
      <ion-toolbar color="light">
        <ion-title size="large">Search</ion-title>
      </ion-toolbar>
      <ion-toolbar color="light">
        <ion-searchbar class="searchbar-classic" placeholder="Filter results"></ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-list inset="true">
      <ion-item-group>
        <ion-item><ion-label>Recent item 1</ion-label></ion-item>
        <ion-item><ion-label>Recent item 2</ion-label></ion-item>
        <ion-item><ion-label>Recent item 3</ion-label></ion-item>
        <ion-item><ion-label>Recent item 4</ion-label></ion-item>
        <ion-item><ion-label>Recent item 5</ion-label></ion-item>
        <ion-item><ion-label>Recent item 6</ion-label></ion-item>
        <ion-item><ion-label>Recent item 7</ion-label></ion-item>
        <ion-item><ion-label>Recent item 8</ion-label></ion-item>
        <ion-item><ion-label>Recent item 9</ion-label></ion-item>
        <ion-item><ion-label>Recent item 10</ion-label></ion-item>
      </ion-item-group>
    </ion-list>
  </ion-content>
</div>
```

`.ion-page` wrapperによって、埋め込みpreviewが完全なrouted pageとして動作します。`ion-router-outlet` を使うapplicationでは通常、このpage containerは自動的に追加されます。Inset listとitemはscrollを実演するための十分なcontentを用意しているだけで、`.searchbar-classic` の必須要素ではありません。

## Themeを無効にする

個別のIonic componentで標準のiOS styleを維持する場合は `.ios-theme-disabled` を追加します。

```html preview
<ion-button>iOS 27 theme</ion-button> <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

Inset listの背景modelについては [ion-item-groupの使用方法](/docs/using-ion-item-group) を参照してください。

`ios26-disabled` はdeprecatedですが、`ios-theme-disabled` と同じ動作の互換名として引き続き利用できます。新規コードでは `ios-theme-disabled` を使ってください。
