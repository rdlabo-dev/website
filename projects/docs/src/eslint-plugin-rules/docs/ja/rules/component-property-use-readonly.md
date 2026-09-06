---
title: component-property-use-readonly
---

# @rdlabo/rules/component-property-use-readonly

> プロパティをreadonlyにすべきときに警告する
>
> - ⭐️ このルールは `plugin:@rdlabo/rules/recommended` プリセットに含まれます。
> - ✒️ [コマンドライン](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems)の `--fix` オプションで、このルールが報告する問題の一部を自動修正できます。

このルールは、Angular Componentで宣言された関数以外のプロパティに `readonly` 修飾子を要求します。初期化済み・未初期化・static・computed・decorator付き・soft private・hard privateの各プロパティを報告し、`readonly` を自動的に追加できます。

## ルール詳細

`@Component()` で装飾されたクラスだけを検査します。method、getter、setter、arrow functionプロパティ、function expressionプロパティ、すでに `readonly` のプロパティ、および他のクラスのプロパティは無視します。

## オプション

```json
{
  "rules": {
    "@rdlabo/rules/component-property-use-readonly": [
      "error",
      {
        "ignorePrivateProperties": true
      }
    ]
  }
}
```

### `ignorePrivateProperties`

- 型: `boolean`
- デフォルト: `false`

`true` の場合、TypeScriptの `private` 修飾子を指定したプロパティとECMAScriptの `#` privateプロパティを無視します。public、protected、staticプロパティは引き続き検査します。

## 例

### 誤り

```ts
@Component({
  selector: 'app-example',
  template: '<div>example</div>',
})
export class ExampleComponent {
  x = 1;
  public y = 2;
  private z = 3;
  protected w = 4;
  #secret = 42;
  static a = 1;
  ['foo'] = 1;
  @Input() i = 8;
  h: number;
}
```

### 正しい

```ts
@Component({
  selector: 'app-example',
  template: '<div>example</div>',
})
export class ExampleComponent {
  readonly x = 1;
  public readonly y = 2;
  private readonly z = 3;
  protected readonly w = 4;
  readonly #secret = 42;
  static readonly a = 1;
  readonly ['foo'] = 1;
  @Input() readonly i = 8;
  readonly h: number;
}
```

`ignorePrivateProperties: true` の場合、privateプロパティは書き込み可能なままでも構いません。

```ts
@Component({
  selector: 'app-example',
  template: '<div>example</div>',
})
export class ExampleComponent {
  private privateProp = 1; // no error
  #secretProp = 2; // no error
  public readonly publicProp = 3;
}
```

## 有効にする場面

Componentプロパティに安定した参照を公開させ、書き込み可能な状態をSignalsまたはViewModelで管理する場合に、このルールを有効にします。

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/component-property-use-readonly.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/component-property-use-readonly.ts)
