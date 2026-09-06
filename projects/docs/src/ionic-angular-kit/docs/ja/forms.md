---
title: フォーム
---

このentry pointはAngular 22 Signal Formsを対象にしています。

Application bootstrapでadapterを一度登録し、Angularの `FormField` と `KitIonicFormField` でSignal FormsをIonic controlへbindします。

```ts
import { Component, signal } from '@angular/core';
import type { ApplicationConfig } from '@angular/core';
import { FormField, form, required, email, maxLength } from '@angular/forms/signals';
import { IonInput } from '@ionic/angular';
import { KitIonicFormField, provideKitIonicSignalForms } from '@rdlabo/ionic-angular-kit/forms';

export const appConfig: ApplicationConfig = {
  providers: [provideKitIonicSignalForms()],
};

@Component({
  selector: 'app-profile',
  imports: [FormField, KitIonicFormField, IonInput],
  template: `
    <ion-input label="Name" [formField]="profileForm.name"></ion-input>
    <ion-input label="Email" type="email" [formField]="profileForm.email"></ion-input>
  `,
})
export class ProfilePage {
  readonly profile = signal({ name: '', email: '' });
  readonly profileForm = form(this.profile, (path) => {
    required(path.name);
    email(path.email);
    maxLength(path.name, 200);
  });
}
```

必須fieldを空のままblurすると、Ionicが `errorText` を表示し、controlはinvalidかつtouchedになります。Adapterは、最初の空でない明示的なvalidation messageを、`ion-input`、`ion-textarea`、`ion-select`、`ion-checkbox`、`ion-radio-group`、`ion-toggle` のIonic `errorText` propertyへcopyします。Angular validatorがmessageを提供しない場合は、validation errorの `kind` とconstraint metadataから汎用の英語messageを生成します。そのため、built-in validatorではmessage設定が不要です。

未知のcustom error kindは `Enter a valid value.` へfallbackします。Business ruleの失敗はfield validationの外で扱ってください。互換性のため、明示的なvalidation messageは引き続き優先されます。また、明示的な `errorText` または `[errorText]` bindingがあるとadapterはinstantiateされません。

アプリはvalidator定義を変えずに、localization用のfallback resolverを置き換えられます。

```ts
import type { ValidationError } from '@angular/forms/signals';
import { KIT_SIGNAL_FORM_ERROR_MESSAGE_RESOLVER } from '@rdlabo/ionic-angular-kit/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    provideKitIonicSignalForms(),
    {
      provide: KIT_SIGNAL_FORM_ERROR_MESSAGE_RESOLVER,
      useValue: (error: ValidationError) => localizedMessageFor(error),
    },
  ],
};
```

Angularは複数の `provideSignalFormsConfig` class設定をmergeしません。アプリが独自設定を提供する場合は、両方のproviderを登録して順序に依存せず、必要なclass mappingを1つのproviderへまとめてください。

検査の設定は [ESLintでKitの使い方をチェック](/docs/eslint) を参照してください。
