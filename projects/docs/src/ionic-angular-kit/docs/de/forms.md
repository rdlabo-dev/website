---
title: "Formulare"
sourceRevision: "1bedd2967dc882ce35bcef004341a18eb66c51fe9865ba2ffdca1d27249d975b"
---
# Ionic Signal Forms

Dieser Einstiegspunkt richtet sich an Angular 22 Signal Forms.

Registrieren Sie den Adapter einmal beim Bootstrap und binden Sie Signal Forms anschließend mit Angular-`FormField` und `KitIonicFormField` an Ionic-Eingabeelemente:

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

Lassen Sie ein Pflichtfeld leer und verlassen Sie es: Ionic zeigt `errorText` an, und das Eingabeelement wird ungültig und als berührt markiert. Der Adapter übernimmt die erste nicht leere explizite Validierungsmeldung in `errorText` für `ion-input`, `ion-textarea`, `ion-select`, `ion-checkbox`, `ion-radio-group` und `ion-toggle`. Liefert der Angular-Validator keine Meldung, leitet der Adapter anhand des Validierungsfehlers `kind` und seiner Einschränkungsmetadaten eine allgemeine englische Meldung ab. Für integrierte Validatoren ist daher keine Meldungskonfiguration erforderlich.

Unbekannte benutzerdefinierte Fehlerarten fallen auf `Enter a valid value.` zurück. Halten Sie Fehler aus Fachregeln außerhalb der Feldvalidierung. Eine explizite Validierungsmeldung hat aus Kompatibilitätsgründen weiterhin Vorrang; eine explizite Bindung von `errorText` oder `[errorText]` verhindert, dass der Adapter instanziiert wird.

Anwendungen können den Fallback-Resolver zur Lokalisierung ersetzen, ohne die Validator-Definitionen zu ändern:

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

Angular führt mehrere Klassenkonfigurationen von `provideSignalFormsConfig` nicht zusammen. Stellt die Anwendung eine eigene Konfiguration bereit, kombinieren Sie alle erforderlichen Klassenzuordnungen in einem Provider, statt beide Provider zu registrieren und sich auf deren Reihenfolge zu verlassen.

Die passende Lint-Konfiguration finden Sie unter [Die Kit-Integration mit ESLint prüfen](./eslint.md).
