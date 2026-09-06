---
title: require-ion-item-group
---

# @rdlabo/rules/require-ion-item-group

> `ion-list` 内の `ion-item` を、対応するIonic item groupで囲むことを要求します。
>
> - ⭐️ このruleは `plugin:@rdlabo/rules/recommended` presetに含まれます。
> - ✒️ [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems)の `--fix` optionで、報告された問題の一部を自動修正できます。

IonicのiOS 26とMaterial Design 3のlist styleでは、itemをその挙動に対応するgroup componentで構成する必要があります。このruleは、groupで囲まれていない `ion-item` が `ion-list` 直下にrenderされることを防ぎます。

## Rule Details

`ion-list` 内の `ion-item` は、次のいずれかの構造を正確に使う必要があります。

- `ion-list > ion-item-group > ion-item`
- `ion-list > ion-reorder-group > ion-item`
- `ion-list > ion-accordion-group > ion-accordion > ion-item`
- `ion-list > ion-radio-group > ion-item`

`@if`、`@for`、`@empty`、`@switch`、`@defer` などのAngular control-flow blockはelementをrenderしないため、この構造検査ではtransparentとして扱います。`ng-container` と `ng-template` もtransparentです。renderされるHTMLまたはAngular elementはtransparentではありません。list、group、itemの間に `div` を挿入すると報告されます。

このruleは `ion-list` に含まれる `ion-item` だけを検査します。list外の `ion-item` は報告せず、`.spec.html` fileは無視します。

## Examples

### Incorrect

```html
<ion-list>
  <ion-item>Direct item</ion-item>
</ion-list>
```

<!-- prettier-ignore -->
```html
<ion-list>
  @for (item of items; track item.id) {
    <ion-item>{{ item.name }}</ion-item>
  }
</ion-list>
```

### Correct

<!-- prettier-ignore -->
```html
<ion-list>
  <ion-item-group>
    @for (item of items; track item.id) {
      <ion-item>{{ item.name }}</ion-item>
    }
  </ion-item-group>
</ion-list>
```

```html
<ion-list>
  <ion-radio-group>
    <ion-item>First choice</ion-item>
    <ion-item>Second choice</ion-item>
  </ion-radio-group>
</ion-list>
```

## Options

このruleにoptionはありません。

## Automatic fixes

listにgroup化されていない `ion-item` だけが含まれる場合、transparentなAngular control-flow blockや `ng-container` を経由していても、listの内容全体を1つの `ion-item-group` で囲めます。

同じtemplateですでに `ion-item-group` が使われており、standalone `IonItemGroup` componentを利用できると判断できる場合は、自動修正を利用できます。それ以外では、必要に応じてcomponent importsへ `IonItemGroup` を追加するよう促すeditor suggestionを提供します。

group化済み・未group化の内容が混在する場合、ほかのrendered content、再利用可能な `ng-template` 定義、nested list、間に入るrendered element、不正なaccordion構造がある場合は、修正もsuggestionも提供しません。これらのケースでは意図したgroup境界を安全に判断できません。

## When to enable

iOS 26とMaterial Design 3のlist designを対象とするIonic Angularアプリケーションで有効にしてください。recommended presetに含まれ、template内の `ion-list` に `ion-item` がなければ影響しません。

## Implementation

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/require-ion-item-group.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/require-ion-item-group.ts)
