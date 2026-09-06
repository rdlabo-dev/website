---
title: ion-item-groupの使用方法
---

MD3テーマは `@rdlabo/ionic-theme-ios26` と同じinset list構造を使うため、Ionic modeをまたいで1つのtemplateを利用できます。`ion-list` で `inset="true"` を使う場合は、itemを `ion-item-group` で囲み、`ion-list-header` はgroupの外に置きます。

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

設定とCIについては [ESLintでリストの構造を整える](/ionic-theme-md3/docs/eslint) を参照してください。

## wrapperが必要な理由

共有構造では、`ion-list-header` をitemのsurfaceから分離します。これにより、platform固有のtemplateを用意せずに、iOS 26のlayoutとMD3のstyleを同じマークアップへ適用できます。

そのため、このテーマは次のようにstyleを適用します。

- inset `ion-list` の背景を透明にする
- itemのsurfaceを `ion-item-group` に適用する
- `ion-list-header` をsurfaceの外に置く

2行itemとsection header groupについては [特別なマークアップ](/docs/special-markup) を参照してください。
