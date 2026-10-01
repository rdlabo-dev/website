---
title: require-ion-item-group
headingAliases:
  rule-details: ルール詳細
  examples: 例
  incorrect: 誤り
  correct: 正しい
  options: オプション
  automatic-fixes: 自動修正
  when-to-enable: 有効にする場面
  implementation: 実装
---

# @rdlabo/rules/require-ion-item-group

> `ion-list` 内の `ion-item` を、対応するIonicの項目グループで囲むことを要求します。
>
> - ⭐️ このルールはFlat Configの [`rdlabo.configs.recommended`](../configuration.md) に含まれます。
> - ✒️ [コマンドライン](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems)の `--fix` オプションで、報告された問題の一部を自動修正できます。

IonicのiOS 26とMaterial Design 3のリストスタイルでは、項目をその挙動に対応するグループコンポーネントで構成する必要があります。このルールは、グループで囲まれていない `ion-item` が `ion-list` 直下に描画されることを防ぎます。

## ルール詳細

`ion-list` 内の `ion-item` は、次のいずれかの構造を正確に使う必要があります。

- `ion-list > ion-item-group > ion-item`
- `ion-list > ion-reorder-group > ion-item`
- `ion-list > ion-accordion-group > ion-accordion > ion-item`
- `ion-list > ion-radio-group > ion-item`

`@if`、`@for`、`@empty`、`@switch`、`@defer` などのAngular制御フローブロックは要素を描画しないため、この構造検査では無視して内側の要素を調べます。`ng-container` と `ng-template` も同様に扱います。描画されるHTML要素やAngular要素は省略して扱いません。リスト、グループ、項目の間に `div` を挿入すると報告されます。

このルールは `ion-list` に含まれる `ion-item` だけを検査します。リスト外の `ion-item` は報告せず、`.spec.html` ファイルは無視します。

## 例

### 誤り

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

### 正しい

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

## オプション

このルールにオプションはありません。

## 自動修正

リストにグループ化されていない `ion-item` だけが含まれる場合、Angular制御フローブロックや `ng-container` を経由していても、リストの内容全体を1つの `ion-item-group` で囲めます。

同じテンプレートですでに `ion-item-group` が使われており、スタンドアロンの `IonItemGroup` コンポーネントを利用できると判断できる場合は、自動修正を利用できます。それ以外では、必要に応じてコンポーネントのimportsへ `IonItemGroup` を追加するよう促すエディターの修正候補を提供します。

グループ化済み・未グループ化の内容が混在する場合、ほかの描画内容、再利用可能な `ng-template` 定義、ネストしたリスト、間に挿入された描画要素、不正なアコーディオン構造がある場合は、修正も修正候補も提供しません。これらのケースでは意図したグループの境界を安全に判断できません。

## 有効にする場面

iOS 26とMaterial Design 3のリストデザインを対象とするIonic Angularアプリケーションで有効にしてください。推奨プリセットに含まれ、テンプレート内の `ion-list` に `ion-item` がなければ影響しません。

## 実装

- [ルールの実装](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/require-ion-item-group.ts)
- [テストの実装](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/require-ion-item-group.ts)
