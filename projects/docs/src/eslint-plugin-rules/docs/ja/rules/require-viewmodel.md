---
title: require-viewmodel
---

# @rdlabo/rules/require-viewmodel

> Componentの `new ViewModel(this)`、`ViewModelStore<ComponentType, Keys>` 継承を強制し、View APIをViewModelから排除する。
>
> - ⭐️ このルールは `plugin:@rdlabo/rules/recommended` プリセットに含まれます。

ViewModel architecture patternを強制します。Angular Componentは `new ViewModel(this)` で初期化したViewModelを所有しなければなりません。少なくとも1つの一致するpropertyを要求しますが、追加のViewModel instanceは拒否しません。ViewModelは `ViewModelStore<ComponentType>` を継承し、`host` を再宣言したり、`viewChild`、`effect`、`computed`、`afterNextRender` などのView固有APIを含めたりしないでください。

## ルール詳細

次の3つを検査します。

### 1. ComponentはViewModelを所有する

`@Component` classには `new ViewModel(this)` で初期化したpropertyが必要です。constructor呼び出しの第1引数は `this` でなければなりません。

### 2. ViewModelは `ViewModelStore<ComponentType>` を継承する

`ViewModel`（または設定した `viewModelClassName`）というclassは、`ViewModelStore<...>`、名前が `ViewModel` で終わるbase、または `ModelSearch` を継承しなければなりません。最初のgeneric引数はhost Component型でなければなりません。中間classのgeneric defaultも解決します。

- `ViewModelStore<ExamplePage, 'model' | 'form'>` を使う場合、第2引数以降の型引数が許可されます。
- `ViewModelStore` を直接継承するときに型引数が2つを超えると報告されます。
- host型はViewModelを所有するComponentと一致する必要があります。

### 3. ViewModelにView APIを含めない

ViewModel classでは次のAPIを呼び出せません。

`viewChild`, `viewChildren`, `contentChild`, `contentChildren`, `effect`, `computed`, `afterNextRender`, `afterEveryRender`, `afterRenderEffect`.

この一覧は `bannedApis` optionで変更できます。`viewChild()` のような直接呼び出しと、`viewChild.required()` のような `.required()` variantを認識します。namespace prefix付き呼び出しは解決しません。

## 例

### 誤り

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly title = 'x'; // no ViewModel
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(); // missing `this`
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends StoreModel {} // wrong base class
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends ViewModelStore<ExamplePage> {
  readonly el = viewChild('host'); // View API in ViewModel
}
```

### 正しい

```ts
import { Component, computed, effect, viewChild } from '@angular/core';

@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
  readonly title = computed(() => this.vm.label());
  readonly el = viewChild('host');

  constructor() {
    effect(() => this.vm.label());
  }
}

class ViewModel extends ViewModelStore<ExamplePage> {
  readonly label = signal('hello');
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends ViewModelStore<ExamplePage, 'inventoryModel'> {
  readonly inventoryModel = signal<Inventory | null>(null);
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class FoodsPage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends MainViewModel<FoodsPage> {}
```

## オプション

```json
{
  "rules": {
    "@rdlabo/rules/require-viewmodel": [
      "error",
      {
        "viewModelClassName": "ViewModel",
        "viewModelStoreClassName": "ViewModelStore",
        "bannedApis": [
          "viewChild",
          "viewChildren",
          "contentChild",
          "contentChildren",
          "effect",
          "computed",
          "afterNextRender",
          "afterEveryRender",
          "afterRenderEffect"
        ]
      }
    ]
  }
}
```

### `viewModelClassName`

- 型: `string`
- デフォルト: `"ViewModel"`

Component内で検索するclass名です。`PageState` など別の命名規則を使うプロジェクトで指定します。

### `viewModelStoreClassName`

- 型: `string`
- デフォルト: `"ViewModelStore"`

ViewModelが継承すべきbase class名、または名前が `ViewModel` で終わる中間base class名です。

### `bannedApis`

- 型: `string[]`
- デフォルト: 上記の一覧

ViewModel内で許可しないAPIです。直接呼び出しと `.required(...)` の使用を検出します。namespace prefix付き呼び出しは解決しません。

## 有効にする場合

`@rdlabo/ionic-angular-kit` または同様のarchitectureでViewModel patternを採用するプロジェクトで有効にしてください。[`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md) と組み合わせると、Component stateをread-only、ViewModel stateをwritableに保てます。

## 関連項目

- [`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md)
- [`@rdlabo/rules/no-component-method-except-lifecycle`](./no-component-method-except-lifecycle.md)

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/require-viewmodel.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/require-viewmodel.ts)
