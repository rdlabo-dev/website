---
title: 特別なマークアップとクラス
---

ほとんどのIonicマークアップは変更せずに使えます。以下はテーマが提供する明示的なopt-inです。

## Primaryのsubmit button

solidのPrimary submit buttonは、foregroundとborderの表現に `--ion-color-primary-brightness` を使います。Primary colorに対して十分なcontrastを確保できる値を定義してください。

```css
:root {
  --ion-color-primary-brightness: #96feff;
}
```

```html preview
<ion-button type="submit" color="primary">Submit</ion-button>
<ion-button class="button-submit" fill="solid" color="primary">Continue</ion-button>
```

buttonに `type="submit"` を指定できない場合に同じstyleを適用するには、`.button-submit` を使います。

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

## search barを含むtoolbar

search barとstartまたはend buttonを組み合わせる `ion-toolbar` には、`.toolbar-searchbar` を追加します。このclassはslot付きcontrolを中央揃えにし、search field周辺のspacingを調整します。

```html preview
<ion-toolbar class="toolbar-searchbar">
  <ion-buttons slot="start">
    <ion-button>Cancel</ion-button>
  </ion-buttons>
  <ion-searchbar></ion-searchbar>
</ion-toolbar>
```

## Themeを無効にする

個別のIonic componentで標準のiOS styleを維持する場合は `.ios-theme-disabled` を追加します。

```html preview
<ion-button>iOS 27 theme</ion-button> <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

Inset listの背景modelについては [ion-item-groupの使用方法](/docs/using-ion-item-group) を参照してください。

`ios26-disabled` はdeprecatedですが、`ios-theme-disabled` と同じ動作の互換名として引き続き利用できます。新規コードでは `ios-theme-disabled` を使ってください。
