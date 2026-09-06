---
title: deny-element
---

# @rdlabo/rules/deny-element

> このプラグインは特定のHTMLタグの使用を禁止します。
>
> - ⭐️ このルールは `plugin:@rdlabo/rules/recommended` プリセットに含まれます。

このルールは、Angular templateで特定のelementが使われることを防ぎます。一般的には、templateで宣言する代わりにlauncher methodや専用serviceを通じて表示すべき `<ion-modal>`、`<ion-popover>`、`<ion-toast>`、`<ion-alert>`、`<ion-loading>`、`<ion-picker>`、`<ion-action-sheet>` などのinline overlay componentを禁止するために使います。

## ルール詳細

このルールは `.html` template fileで実行され、tag nameが設定済みの `elements` listに含まれるelementを報告します。template ASTを走査し、`@if`、`@for`、`@else` と、ネストした `then` / `else` branchなどのAngular control flow構文にも対応します。

- testに影響しないよう `.spec.html` fileは無視します。
- 明示的なオプションがなければ、デフォルトのIonic overlay element listを使います。option objectを指定する場合、そのschemaでは `elements` arrayが必須です。

## オプション

```json
{
  "rules": {
    "@rdlabo/rules/deny-element": [
      "error",
      {
        "elements": ["ion-modal", "ion-popover", "ion-toast", "ion-alert", "ion-loading", "ion-picker", "ion-action-sheet"]
      }
    ]
  }
}
```

### `elements`

- 型: `string[]`
- デフォルト: `ion-modal`, `ion-popover`, `ion-toast`, `ion-alert`, `ion-loading`, `ion-picker`, `ion-action-sheet`

禁止するelement tag nameの配列です。このルールはこれらの名前をAngular template ASTの `Element` node typeと比較するため、element自体とcontrol flow branch内の存在の両方を検査します。

## 例

### 誤り

```html
<ion-modal></ion-modal>

<div>
  <ion-toast></ion-toast>
  <ion-alert></ion-alert>
</div>
```

```html
@if (showModal) {
<ion-modal>Modal content</ion-modal>
}
```

### 正しい

```html
<ion-button (click)="presentModal()">Open</ion-button>
```

```html
@for (item of items; track item.id) {
<ion-card>
  <ion-card-header>{{ item.name }}</ion-card-header>
</ion-card>
}
```

## 有効にする場面

overlayにlauncher patternを使うプロジェクトで、このルールを有効にします。[`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md)および[`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md)と組み合わせることで、modalとoverlayのlogicをtemplateから分離できます。

## 関連項目

- [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md)
- [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md)

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/deny-element.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/deny-element.ts)
