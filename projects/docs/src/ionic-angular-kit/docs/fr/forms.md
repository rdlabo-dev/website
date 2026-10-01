---
title: "Formulaires"
sourceRevision: "1bedd2967dc882ce35bcef004341a18eb66c51fe9865ba2ffdca1d27249d975b"
---
# Ionic Signal Forms

Ce point d’entrée cible Angular 22 Signal Forms.

Enregistrez l’adaptateur une fois au démarrage, puis liez Signal Forms aux contrôles Ionic avec `FormField` d’Angular et `KitIonicFormField` :

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

Laissez un champ obligatoire vide, puis faites-lui perdre le focus : Ionic affiche `errorText`, et le contrôle devient invalide et marqué comme touché. L’adaptateur copie le premier message de validation explicite non vide vers `errorText` pour `ion-input`, `ion-textarea`, `ion-select`, `ion-checkbox`, `ion-radio-group` et `ion-toggle`. Si le validateur Angular ne fournit aucun message, l’adaptateur construit un message anglais générique à partir du `kind` de l’erreur de validation et des métadonnées de sa contrainte. Les validateurs intégrés ne nécessitent donc aucune configuration des messages.

Les types d’erreurs personnalisées inconnus utilisent le message de repli `Enter a valid value.`. Gardez les échecs de règles métier hors de la validation des champs. Un message de validation explicite reste prioritaire pour assurer la compatibilité, et une liaison explicite `errorText` ou `[errorText]` empêche l’instanciation de l’adaptateur.

Les applications peuvent remplacer le résolveur de repli pour localiser les messages sans modifier les définitions des validateurs :

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

Angular ne fusionne pas plusieurs configurations de classes `provideSignalFormsConfig`. Si l’application fournit sa propre configuration, regroupez toutes les correspondances de classes requises dans un seul fournisseur plutôt que d’enregistrer deux fournisseurs et de dépendre de leur ordre.

Pour la configuration de lint correspondante, consultez [Vérifier l’intégration du kit avec ESLint](./eslint.md).
