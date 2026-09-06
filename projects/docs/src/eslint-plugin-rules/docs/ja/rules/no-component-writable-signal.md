---
title: no-component-writable-signal
---

# @rdlabo/rules/no-component-writable-signal

> 書き込み可能なComponent状態はViewModelに置く。ただしAngular Signal Formsの `form()` に渡すmodelは例外とする。

このルールは、Angular ComponentとViewModelの間に明確な境界を強制します。Componentはtemplateに読み取り専用の派生状態を公開し、書き込み可能な状態はViewModelに置くことで、変更を一元化しtest可能にします。Componentで許可される唯一の書き込み可能なSignalは、Signal Formsの `form()` にmodelとして直接渡されるものです。

## ルール詳細

`@Component` で装飾されたクラスを検査し、`@angular/forms/signals` の `form()` の第1引数に同じpropertyが渡されている場合を除き、`@angular/core` の `signal()` または `linkedSignal()` で初期化されたclass propertyを報告します。

- `computed()` と `effect()` は引き続きComponentの責務であり、報告しません。
- Component以外のクラスは無視します。
- `@angular/core` と `@angular/forms/signals` のalias importとnamespace importを認識します。
- import元を検証するため、同名のlocal helperは無視します。

Signal Formsの例外は、`readonly pageForm = form(this.model)` のようなComponent property initializerだけを認識します。method内でSignalを `form()` に渡しても例外にはならないため、書き込み可能なSignal propertyは引き続き報告されます。

## 例

### 誤り

```ts
import { Component, signal } from '@angular/core';

@Component({ template: '' })
class Page {
  readonly isLoading = signal(false); // reported: move to ViewModel
}
```

```ts
import { Component, signal } from '@angular/core';
import { form } from '@angular/forms/signals';

@Component({ template: '' })
class Page {
  readonly model = signal({ name: '' });
  readonly loading = signal(false); // reported
  readonly pageForm = form(this.model);
}
```

### 正しい

```ts
import { Component, computed } from '@angular/core';
import { form } from '@angular/forms/signals';
import { PageViewModel } from './page.viewmodel';

@Component({ template: '' })
class Page {
  private readonly vm = new PageViewModel(this);
  readonly isLoading = this.vm.isLoading; // read-only view of ViewModel state
  readonly model = this.vm.model;
  readonly pageForm = form(this.model);
  readonly title = computed(() => this.model().name);
}
```

```ts
import { Component, signal as writable } from '@angular/core';
import { form as signalForm } from '@angular/forms/signals';

@Component({ template: '' })
class Page {
  readonly data = writable({ name: '' });
  readonly pageForm = signalForm(this.data); // data is the Signal Forms model
}
```

## オプション

このルールにオプションはありません。

## 有効にする場面

`@rdlabo/rules/require-viewmodel` とともにViewModel patternを使うプロジェクトで、このルールを有効にします。Component propertyを共有状態への読み取り専用viewにすることで、Componentによる状態の直接変更を防ぎます。

## 関連項目

- [`@rdlabo/rules/require-viewmodel`](./require-viewmodel.md)
- [`@rdlabo/rules/no-reactive-forms`](./no-reactive-forms.md)

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/no-component-writable-signal.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/no-component-writable-signal.ts)
