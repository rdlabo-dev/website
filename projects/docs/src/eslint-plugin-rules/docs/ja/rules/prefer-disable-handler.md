---
title: prefer-disable-handler
---

# @rdlabo/rules/prefer-disable-handler

> 非同期処理中の二重タップを防ぐため、設定した要素とイベントのバインディングにwrapper method（デフォルト: disableHandler($event, work)）を要求する
>
> - ⭐️ このルールは `plugin:@rdlabo/rules/recommended` プリセットに含まれます。

非同期処理を開始するbuttonをユーザーがtapしたら、処理がsettleするまでcontrolを無効にする必要があります。そうしなければ、2回目のtapで同じactionが再実行される可能性があります。このルールは、設定した `(event)` bindingにwrapper呼び出し構文を強制します。UIの無効化とwork値の適切な処理はwrapper実装の責務です。

## ルール詳細

Angularテンプレートを検査します。設定対象に一致する各 `BoundEvent` のhandler expressionは、2つ以上の引数を持つwrapper method呼び出しでなければなりません。

1. event parameter（デフォルトは `$event`）。
2. wrapperへ渡すwork expression。

たとえば `(click)="vm.disableHandler($event, vm.save())"` は有効です。`(click)="vm.save()"` は報告されます。第2引数の型やPromiseを返すかどうかは検査しません。

`$event.stopPropagation()` や `$event.preventDefault()` のようなevent methodの単独呼び出しも許可します（`allowEventMethods` で設定可能）。

デフォルトの対象は次のとおりです。

- `<ion-button>` と `<button>` の `click`
- すべての要素の `submit`

`.spec.html` ファイルは無視します。

## オプション

```json
{
  "rules": {
    "@rdlabo/rules/prefer-disable-handler": [
      "error",
      {
        "method": "disableHandler",
        "eventParam": "$event",
        "targets": [{ "events": ["click"], "elements": ["ion-button", "button"] }, { "events": ["submit"] }],
        "allowEventMethods": ["stopPropagation", "preventDefault"]
      }
    ]
  }
}
```

### `method`

- 型: `string`
- デフォルト: `"disableHandler"`

handler expressionに要求するwrapper method名です。

### `eventParam`

- 型: `string`
- デフォルト: `"$event"`

wrapper methodの第1引数として渡す必要がある値です。

### `targets`

- 型: `Target[]`
- デフォルト: `[{ events: ['click'], elements: ['ion-button', 'button'] }, { events: ['submit'] }]`

各targetはwrapperを要求するeventと要素を指定します。`elements` は任意で、省略するとそのeventを持つすべての要素に適用されます。

### `allowEventMethods`

- 型: `string[]`
- デフォルト: `["stopPropagation", "preventDefault"]`

wrapperなしで許可するevent methodです。たとえば `(click)="$event.stopPropagation()"` は有効です。

## 例

### 誤り

```html
<ion-button (click)="vm.save()">Save</ion-button>
```

```html
<form (submit)="vm.save()"></form>
```

```html
<ion-button (click)="vm.disableHandler(vm.save())">missing $event</ion-button>
```

### 正しい

```html
<ion-button (click)="vm.disableHandler($event, vm.save())">Save</ion-button>
```

```html
<form (submit)="vm.disableHandler($event, vm.save())">
  <ion-button type="submit">Save</ion-button>
</form>
```

```html
<ion-button (click)="$event.stopPropagation()"></ion-button>
```

### カスタム設定

```html
<ion-input (ionComplete)="vm.disableHandler($event, vm.join())"></ion-input>
```

```json
{
  "rules": {
    "@rdlabo/rules/prefer-disable-handler": [
      "error",
      {
        "targets": [{ "events": ["ionComplete"], "elements": ["ion-input"] }]
      }
    ]
  }
}
```

## 有効にする場合

API呼び出し、navigation、modal表示などの非同期処理をユーザー操作から開始するIonic/Angularプロジェクトで有効にしてください。[`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md) および [`@rdlabo/rules/deny-element`](./deny-element.md) と組み合わせることで、overlay logicを一元化できます。

## 関連項目

- [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md)
- [`@rdlabo/rules/deny-element`](./deny-element.md)

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/prefer-disable-handler.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/prefer-disable-handler.ts)
