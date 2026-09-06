---
title: no-reactive-forms
---

# @rdlabo/rules/no-reactive-forms

> Angular Reactive Formsを禁止し、Signal Formsを推奨する。

このルールは、Angular Reactive Formsから `@angular/forms/signals` への移行を支援します。Reactive Formsでは、Componentとservice間で共有されることの多い書き込み可能な `FormControl` / `FormGroup` 状態が必要なため、状態変更の発生元を追いにくくなります。Signal Formsではform状態をSignalsに保持するため、依存graphが明示的になり、デフォルトでreactiveになります。

プロジェクトがSignal Formsを採用する間に、新しいReactive Forms codeが追加されるのを防ぎたい場合に使います。

## ルール詳細

このルールは3つのpatternを報告します。

1. **`@angular/forms` からのReactive Forms APIのnamed import**
   次の名前のimportをすべて報告します。

   `AbstractControl`, `FormArray`, `FormArrayName`, `FormBuilder`, `FormControl`, `FormControlDirective`, `FormControlName`, `FormGroup`, `FormGroupDirective`, `FormGroupName`, `FormRecord`, `NonNullableFormBuilder`, `ReactiveFormsModule`, `UntypedFormArray`, `UntypedFormBuilder`, `UntypedFormControl`, `UntypedFormGroup`, `Validators`.

2. **`@angular/forms` からのnamespace importまたはdefault import**
   named APIの検査を迂回できるため、`import * as forms from '@angular/forms'` と `import forms from '@angular/forms'` を報告します。

3. **Reactive Formsのtemplate binding**
   Angular templateで次のbindingを報告します。
   `formControl`, `formControlName`, `formGroup`, `formGroupName`, `formArrayName`.

`FormsModule` と `ngModel` は意図的にこのルールの対象外です。これらを制限するには[`@rdlabo/rules/no-template-driven-forms`](./no-template-driven-forms.md)を使います。

## 例

### 誤り

```ts
// TypeScript: importing Reactive Forms APIs
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import * as forms from '@angular/forms';
const control = new forms.FormControl('');
```

```html
<!-- Template: Reactive Forms bindings -->
<form [formGroup]="userForm">
  <input formControlName="name" />
</form>
```

### 正しい

```ts
import { signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';

const userModel = signal({ name: '' });
const userForm = form(userModel, (path) => {
  required(path.name);
});
```

```html
<!-- Template: Signal Forms field binding -->
<input [formField]="userForm.name" />
```

## オプション

このルールにオプションはありません。

## 有効にする場面

Signal Formsを採用済み、またはReactive Formsから移行中のAngularプロジェクトで、このルールを有効にします。両方のform styleを対象にするため、`@rdlabo/rules/no-template-driven-forms` と同時に安全に有効化できます。

## 関連項目

- [`@rdlabo/rules/no-template-driven-forms`](./no-template-driven-forms.md)
- [`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md)

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/no-reactive-forms.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/no-reactive-forms.ts)
