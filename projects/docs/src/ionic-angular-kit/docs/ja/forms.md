---
title: フォーム
---

このentry pointはAngular 22 Signal Formsを対象にしています。

Signal FormsをIonic controlへbindする各standalone componentで、Angularの `FormField` とKit adapterを一緒にimportします。

```ts
import { FormField } from '@angular/forms/signals';
import { KitIonicFormField } from '@rdlabo/ionic-angular-kit/forms';

@Component({
  imports: [FormField, KitIonicFormField],
})
export class ProfilePage {}
```

Adapterは、最初の空でない明示的なvalidation messageを、`ion-input`、`ion-textarea`、`ion-select`、`ion-checkbox`、`ion-radio-group`、`ion-toggle` のIonic `errorText` propertyへcopyします。Angular validatorがmessageを提供しない場合は、validation errorの `kind` とconstraint metadataから汎用の英語messageを生成します。そのため、built-in validatorではmessage設定が不要です。

```ts
readonly profileForm = form(this.profile, (path) => {
  required(path.name);
  email(path.email);
  maxLength(path.name, 200);
});
```

未知のcustom error kindは `Enter a valid value.` へfallbackします。Business ruleの失敗はfield validationの外で扱ってください。互換性のため、明示的なvalidation messageは引き続き優先されます。また、明示的な `errorText` または `[errorText]` bindingがあるとadapterはinstantiateされません。

アプリはvalidator定義を変えずに、localization用のfallback resolverを置き換えられます。

```ts
import type { ValidationError } from '@angular/forms/signals';
import { KIT_SIGNAL_FORM_ERROR_MESSAGE_RESOLVER } from '@rdlabo/ionic-angular-kit/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: KIT_SIGNAL_FORM_ERROR_MESSAGE_RESOLVER,
      useValue: (error: ValidationError) => localizedMessageFor(error),
    },
  ],
};
```

Application bootstrapでstate class設定を一度installします。

```ts
import { provideKitIonicSignalForms } from '@rdlabo/ionic-angular-kit/forms';

export const appConfig: ApplicationConfig = {
  providers: [provideKitIonicSignalForms()],
};
```

Angularは複数の `provideSignalFormsConfig` class設定をmergeしません。アプリが独自設定を提供する場合は、両方のproviderを登録して順序に依存せず、必要なclass mappingを1つのproviderへまとめてください。

`@rdlabo/eslint-plugin-rules` を使う場合は、関連するstandalone componentすべてがadapterをimportした後にだけadapter-aware modeを有効にします。

```js
{
  files: ['**/*.html'],
  rules: {
    '@rdlabo/rules/require-ion-error-text': ['error', { formFieldProvidesErrorText: true }],
  },
}
```
