---
title: ionic-attr-type-check
---

# @rdlabo/rules/ionic-attr-type-check

> 対応するstring以外のIonic属性にproperty bindingを要求し、string literal属性を検証する。
>
> - ⭐️ このルールは `plugin:@rdlabo/rules/recommended` プリセットに含まれます。
> - ✒️ [コマンドライン](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems)の `--fix` オプションで、このルールが報告する問題の一部を自動修正できます。

Ionic componentの属性はboolean、number、object、stringのいずれかです。boolean propertyに `button="true"` のようなstringを渡すのはよくある誤りで、予期しない動作を招く場合があります。このルールは `@ionic/core` の型定義を読み取り、不一致を報告します。

## ルール詳細

Angular templateで実行されます。各Ionic elementについて `@ionic/core` の型定義を参照し、属性を次のいずれかに分類します。

- `string` — string literalを許可
- `string literal` — 特定の値だけを許可
- `boolean` — `[attr]="true"` または `[attr]="false"` を使用
- `number` — `[attr]="50"` を使用
- `object` — `[attr]="..."` を使用
- `skip` / `unknown` — 検査しない

boolean属性では、string値 `true`、`false`、`1`、`0`、`yes`、`no`、`on`、`off` を認識します。それ以外のstringはboolean検査では報告しません。対応するboolean、number、objectの不一致はproperty bindingへ自動修正されます。

- `button="true"` -> `[button]="true"`
- `value="50"` -> `[value]="50"`
- Ionic 9の `autocorrect="off"` -> `[autocorrect]="false"`

string literal属性に無効なstring値が指定されている場合、許容される値を報告します。

## 例

### 誤り

```html
<ion-item button="true"></ion-item>
```

```html
<ion-progress-bar value="50"></ion-progress-bar>
```

```html
<ion-modal isOpen="true" backdropDismiss="false"></ion-modal>
```

### 正しい

```html
<ion-item [button]="true"></ion-item>
```

```html
<ion-progress-bar [value]="50"></ion-progress-bar>
```

```html
<ion-modal [isOpen]="true" [backdropDismiss]="false"></ion-modal>
```

```html
<!-- string-typed attributes are still allowed -->
<ion-item lines="full"></ion-item>
<ion-button color="primary">Click me</ion-button>
```

## オプション

このルールにオプションはありません。

## 有効にする場面

すべてのIonic Angularプロジェクトで、このルールを有効にします。古いIonic構文から移行するときや、通常のHTML属性に慣れたdeveloperが参加するときに特に役立ちます。

## 要件

`node_modules/@ionic/core/dist/types/components.d.ts` を読み取れるよう、同じプロジェクトに `@ionic/core` がインストールされている必要があります。packageが存在しない場合、ルールは空の結果を返し、何も報告しません。

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/ionic-attr-type-check.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/ionic-attr-type-check.ts)
