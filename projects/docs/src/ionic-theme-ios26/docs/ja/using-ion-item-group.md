---
title: ion-item-groupの使用方法
---

ほとんどのIonicマークアップは変更せずに使えます。`ion-list` で `inset="true"` を使う場合は、itemを `ion-item-group` で囲み、`ion-list-header` はgroupの外に置きます。

以下はframeworkに依存しないWeb Component形式のマークアップです。ReactまたはVueでは、各frameworkに対応するcomponentとpropertyの構文に置き換えてください。

```html
<ion-list inset="true">
  <ion-list-header><ion-label>Connections</ion-label></ion-list-header>
  <ion-item-group>
    <ion-item>...</ion-item>
    <ion-item>...</ion-item>
  </ion-item-group>
</ion-list>
```

`inset="true"` を使わないlistでは、このwrapperは不要です。

## Angular templateでの検査

Ionic Angularアプリケーションでは、`@rdlabo/rules` の [`require-ion-item-group`](/eslint-plugin-rules/docs/rules/require-ion-item-group) ruleを使うと、`ion-list` 内の `ion-item` が対応するgroup componentで囲まれていることをESLintで検査できます。このruleはrecommended presetに含まれ、一部の問題は自動修正できます。

## wrapperが必要な理由

Ionicは通常、`ion-list` 自体に背景を設定するため、`ion-list-header` もitemと同じsurface内に表示されます。iOS 26のlayoutではheaderとitemのsurfaceを分離します。

![ion-item-groupが必要な理由を示すinset listの背景比較](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios26/v9.0.0/screenshots/why-ion-list-inset.png)

そのため、このテーマは次のようにstyleを適用します。

- inset `ion-list` の背景を透明にする
- itemのsurfaceを `ion-item-group` に適用する
- `ion-list-header` をsurfaceの外に置く

## Material Designとのマークアップ共有

`@rdlabo/ionic-theme-md3` も同じgroup構造に対応しているため、両方のIonic modeで1つのtemplateを共有できます。

このpackageを `@rdlabo/ionic-theme-md3` なしで使うapplicationでは、Material modeにも同じgroup layoutを適用するため、任意のstylesheetをimportします。

```css
@import '@rdlabo/ionic-theme-ios26/dist/css/md-ion-list-inset.css';
```

2行itemとsection header groupについては [特別なマークアップとクラス](/docs/special-markup) を参照してください。
