---
title: signal-use-as-signal-template
---

# @rdlabo/rules/signal-use-as-signal-template

> テンプレートでAngular Signalにアクセスするとき `()` を要求する
>
> - ⭐️ このルールは `plugin:@rdlabo/rules/recommended` プリセットに含まれます。

Angular Signalは関数です。テンプレートで現在値を読み取るには、Signalを `()` 付きで呼び出す必要があります。RxJSの `BehaviorSubject` や `model()` inputから移行するとき、括弧の付け忘れはよくあるミスです。このルールはAngularテンプレート内のSignal識別子を検出し、`{{ count }}` や `[hidden]="count"` のような裸の読み取りを報告します。

## ルール詳細

各 `@Component` のAngularテンプレートを解析し、次からSignal識別子を収集します。

- callee名が `signal`、`model`、`computed`、`linkedSignal`、`input`、`toSignal` のいずれかである呼び出しによって初期化されたclass property。
- object literal内にネストしたSignal property（例: `count = { first: signal(0) }`）。

検出は名前に基づき、import元は解決しません。alias付きfactory importは認識されず、逆に同名の無関係なローカル関数がSignal factoryとして扱われる場合があります。`toSignal` は通常 `@angular/core/rxjs-interop` からimportされますが、このルールはmoduleではなく名前で認識します。

続いて、テンプレート内でSignalが `()` なしで読み取られる箇所を報告します。対象には次が含まれます。

- interpolation `{{ count }}`
- property binding `[hidden]="count"`
- event binding `(click)="count > 0 ? ..."`
- control flow expression `@if (count)`、`@switch (count)`、`@for (...; track count)`
- optional chaining `count?.signal`
- pipe使用 `count | async`

`template` と `templateUrl` の両方のcomponentに対応します。

## 例

### 誤り

```html
<div>{{ count }}</div>
```

```html
<child [hidden]="count > 0"></child>
```

```html
@if (count) {
<div>Positive</div>
}
```

```html
<ion-input [formField]="count.first"></ion-input>
```

### 正しい

```html
<div>{{ count() }}</div>
```

```html
<child [hidden]="count() > 0"></child>
```

```html
@if (count()) {
<div>Positive</div>
}
```

```html
<ion-input [formField]="count.first()"></ion-input>
```

### Signal参照を子componentへ渡す

子componentが値ではなくSignal objectを期待する場合は、`()` なしで参照を渡せます。

```html
<child [inventorySignal]="inventorySignal"></child>
```

この場合を認識し、bound attributeとして渡された裸のSignalは報告しません。

## オプション

このルールにオプションはありません。

## 有効にする場合

Signalを使用するすべてのAngularプロジェクトで有効にしてください。`Observable` ベースのコードから移行するときや、テンプレート内で呼び出す必要のあるSignal風objectを返す `model()` と `input()` を導入するときに特に有効です。

## 関連項目

- [`@rdlabo/rules/signal-use-as-signal`](./signal-use-as-signal.md)

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/signal-use-as-signal-template.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/signal-use-as-signal-template.ts)
