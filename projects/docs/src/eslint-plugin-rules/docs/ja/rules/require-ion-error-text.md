---
title: require-ion-error-text
---

# @rdlabo/rules/require-ion-error-text

Ionicの検証対象コントロールに `errorText` の供給元を要求します。Flat Configの `rdlabo.configs.recommended` に含まれます。

## 検査対象

Angularテンプレートの `ion-input`、`ion-textarea`、`ion-select`、`ion-checkbox`、`ion-radio-group`、`ion-toggle` を検査します。既定ではAngular Signal Formsの `[formField]` を指定したコントロールだけが対象です。

空でない静的な `errorText`、プロパティバインディングの `[errorText]`、または設定で許可した `KitIonicFormField` が必要です。`[attr.errorText]`、空文字、空白だけの値は認めません。`.spec.html` は対象外です。

## オプション

```json
{
  "rules": {
    "@rdlabo/rules/require-ion-error-text": [
      "error",
      {
        "formFieldProvidesErrorText": true,
        "checkAll": false,
        "ignoreReadonly": false
      }
    ]
  }
}
```

### `formFieldProvidesErrorText`

boolean、既定値は `false`。`true` にすると、`[formField]` のあるコントロールはkitアダプターからエラー文言を受け取れます。対象のstandalone componentすべてにAngularの `FormField` と `KitIonicFormField` をimportし、アプリへ `provideKitIonicSignalForms()` を登録してから有効にしてください。

このオプションはアダプター導入済みという宣言です。ルールはcomponentのimportsやアプリのprovidersを検証しません。明示した空の `errorText` はアダプターにフォールバックせずエラーになります。文言に加え、invalid/touchedの表示状態も連携します。

### `checkAll`

boolean、既定値は `false`。`true` では `[formField]` のない対応コントロールも検査します。フィルター、検索、設定のコントロールは必ずしも入力検証に参加しないため、明示的な有効化が必要です。

### `ignoreReadonly`

boolean、既定値は `false`。`checkAll` と両方が `true` の場合、静的な `readonly` 属性を持つ `ion-input` と `ion-textarea` を除外します。動的な `[readonly]` は実行時に編集可能になるため検査します。

## 例

### 不正な例

```html
<ion-input [formField]="fields.name"></ion-input>
```

```html
<ion-textarea [formField]="fields.description" errorText="   "></ion-textarea>
```

```html
<ion-select [formField]="fields.category" [attr.errorText]="categoryError"></ion-select>
```

`checkAll: true` では `[formField]` がなくても文言の供給元が必要です。

```html
<ion-toggle></ion-toggle>
```

### 正しい例

```html
<ion-input [formField]="fields.name" errorText="Name is required."></ion-input>
```

```html
<ion-textarea [formField]="fields.description" [errorText]="descriptionError()"></ion-textarea>
```

`formFieldProvidesErrorText: true` でkitアダプターを導入済みの場合:

```html
<ion-select [formField]="fields.category"></ion-select>
```

`checkAll: true` と `ignoreReadonly: true` の場合:

```html
<ion-input readonly></ion-input>
```

`ion-searchbar` など非対応のコントロールは検査対象外です。

```html
<ion-searchbar [formField]="fields.query"></ion-searchbar>
```

## 有効化の目安

Ionicの `errorText` APIで検証結果を表示するアプリに適用します。既定の範囲はSignal Formsの検証対象に限定され、無関係なUIへエラー文言を要求しません。kitへ共通文言を委譲する場合は `formFieldProvidesErrorText`、対応コントロールすべてに供給元を必須とする場合だけ `checkAll` を使います。検出のみを行い、検証方針やアダプター設定を自動修正しません。

## 関連情報

- [Signal Forms連携](https://github.com/rdlabo-dev/ionic-angular-library/blob/main/projects/kit/docs/forms.md)
- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/require-ion-error-text.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/require-ion-error-text.ts)
