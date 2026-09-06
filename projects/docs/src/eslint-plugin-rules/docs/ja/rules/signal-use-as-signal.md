---
title: signal-use-as-signal
---

# @rdlabo/rules/signal-use-as-signal

> SignalがSignalとして正しく使われているか検査する。
>
> - ⭐️ このルールは `plugin:@rdlabo/rules/recommended` プリセットに含まれます。
> - ✒️ [コマンドライン](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems)の `--fix` オプションで、このルールが報告する問題の一部を自動修正できます。

Angular Signalはgetter関数です。読み取りには `()` が必要で、書き込みには `.set()` または `.update()` を使う必要があります。このルールは、Signal変数を通常の値のように扱うコードを検出し、一般的な誤りの多くを自動修正できます。

## ルール詳細

Signal factory（`signal`、`model`、`input`、`linkedSignal`、`toSignal`、`asReadonly`）で初期化されたclass propertyを追跡し、次のような誤用を報告します。

- expression contextでの `this.count()` ではなく `this.count`
- `this.count.set(value)` ではなく `this.count() = value`
- `this.user.update(user => ({ ...user, name: 'Jane' }))` ではなく `this.user().name = 'Jane'`
- `this.items.update(items => { items.push(x); return items; })` ではなく `this.items().push(x)`
- `this.#user.set(value)` ではなく、Signal propertyへの直接代入 `this.#user = value`

Signal参照が期待されるcontextと、値が期待されるcontextを区別します。たとえば、Signal objectをpropsとして渡すことは許可されます。

```ts
const props = { food: this.food };
launchModal({ food: this.food });
```

## 例

### 誤り

```ts
export class SigninPage {
  readonly #id = signal<number | undefined>(undefined);

  constructor() {
    this.#id = 1;
  }

  useMethod() {
    if (this.#id) {
      this.#id().hoge = 1;
    }
  }
}
```

```ts
export class SigninPage {
  readonly #user = signal<{ name: string }>({ name: 'John' });

  updateUser() {
    this.#user().name = 'Jane';
  }
}
```

```ts
export class SigninPage {
  readonly #numbers = signal<number[]>([1, 2, 3]);

  updateNumbers() {
    this.#numbers().push(4);
  }
}
```

```ts
export class SigninPage {
  readonly #value = signal<number>(0);

  updateValue() {
    this.#value() = 42;
  }
}
```

### 正しい

```ts
export class SigninPage {
  readonly #user = signal<{ name: string }>({ name: 'John' });

  updateUser() {
    this.#user.update((user) => ({ ...user, name: 'Jane' }));
  }
}
```

```ts
export class SigninPage {
  readonly #numbers = signal<number[]>([1, 2, 3]);

  updateNumbers() {
    this.#numbers.update((numbers) => {
      numbers.push(4);
      return numbers;
    });
  }
}
```

```ts
export class SigninPage {
  readonly #value = signal<number>(0);

  updateValue() {
    this.#value.set(42);
  }
}
```

```ts
export class SigninPage {
  readonly food = signal<number>(0);

  openPreview() {
    const props = { food: this.food };
    launchModal({ food: this.food });
  }
}
```

## 自動修正

次のパターンを自動修正できます。

- `this.count = value` -> `this.count.set(value)`
- `this.count() = value` -> `this.count.set(value)`
- `this.count().x = value` -> `this.count.update(value => ({ ...value, x: value }))`
- `this.count().push(x)` -> `this.count.update(value => { value.push(x); return value; })`

## オプション

このルールにオプションはありません。

## 有効にする場合

Signalを使用するすべてのAngularプロジェクトで有効にしてください。テンプレート内のSignal使用を検査する [`@rdlabo/rules/signal-use-as-signal-template`](./signal-use-as-signal-template.md) と相互補完します。

## 関連項目

- [`@rdlabo/rules/signal-use-as-signal-template`](./signal-use-as-signal-template.md)
- [`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md)

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/signal-use-as-signal.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/signal-use-as-signal.ts)
