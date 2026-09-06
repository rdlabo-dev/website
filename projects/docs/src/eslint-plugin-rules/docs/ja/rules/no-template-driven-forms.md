---
title: no-template-driven-forms
---

# @rdlabo/rules/no-template-driven-forms

> 明示的に許可された要素の `ngModel` バインディングを除き、template-driven formsを禁止する。

このルールはAngularテンプレート内のtemplate-driven formsを制限します。`ngForm` と `ngModelGroup` はテンプレート内に可変フォーム状態を保持するため、常に拒否されます。`ngModel` も、Signal Formsに適さないIonic Viewバインディング向けに明示的に許可された要素でない限り拒否されます。

許可要素は相互運用のための例外であり、template-driven formsの利用を推奨するものではありません。送信フォームでは、許可要素を含む場合でもSignal Formsを使用してください。

## ルール詳細

このルールはAngularテンプレートに対して次の3パターンを検査します。

1. **`allowedElements` に含まれない要素上の `ngModel`**
   許可リストにないタグの `ngModel`、`[(ngModel)]`、`[ngModel]` を報告します。単独の `(ngModelChange)` outputは検査しません。

2. **`ngModelGroup` 属性**
   すべての要素上の `ngModelGroup` 属性を報告します。

3. **`ngForm` referenceまたはdirective**
   `<form #form="ngForm">` と `<div ngForm>` を報告します。

型情報は使用せず、parse済みのtemplate ASTだけを検査します。

## 例

### 誤り

```html
<!-- ngModel on an ordinary input -->
<input [(ngModel)]="name" />

<!-- ngForm reference -->
<form #form="ngForm"></form>

<!-- ngModelGroup directive -->
<div ngModelGroup="address"></div>
```

### 正しい

```html
<!-- Signal Forms field binding -->
<input [formField]="userForm.name" />

<!-- ngModel allowed on ion-searchbar for a View binding -->
<ion-searchbar [(ngModel)]="query"></ion-searchbar>
```

## オプション

```json
{
  "rules": {
    "@rdlabo/rules/no-template-driven-forms": [
      "error",
      {
        "allowedElements": ["ion-searchbar", "ion-segment", "ion-radio-group", "ion-select", "ion-range", "ion-toggle", "ion-checkbox", "ion-input-otp"]
      }
    ]
  }
}
```

### `allowedElements`

- 型: `string[]`
- デフォルト: `[]`

`ngModel` の使用を許可する要素のタグ名です。`ion-searchbar` や `ion-toggle` のように、View上の便宜として `ngModel` で値を公開するIonicコンポーネントを想定しています。要素が許可されていても、`ngModelGroup` と `ngForm` は報告されます。

## 有効にする場合

Angular Signal Formsへ移行しながら、特定のIonic Viewコンポーネントに限定して `ngModel` バインディングが必要なプロジェクトで有効にしてください。Reactive Formsを全面的に採用し、Signal Formsを導入する予定がない場合にのみ無効にします。

## 関連項目

- [`@rdlabo/rules/no-reactive-forms`](./no-reactive-forms.md)

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/no-template-driven-forms.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/no-template-driven-forms.ts)
