---
title: "Die Kit-Integration mit ESLint prüfen"
sourceRevision: "621cfef57d9f6b603d1075c99817d1188aa4668c85888ef1d43096f94e106dfb"
---
Halten Sie modale Starter, asynchrone Aktionshandler und Formularfehler einheitlich, während Ihre Ionic-Angular-App wächst. `@rdlabo/eslint-plugin-rules` prüft die Aufrufmuster, die zu `@rdlabo/ionic-angular-kit` passen.

## Benötigte Prüfungen aktivieren

In einer Ionic-Angular-9-App mit konfiguriertem Angular / Angular ESLint 21–22:

```sh
npm install --save-dev @rdlabo/eslint-plugin-rules@22
```

Ergänzen Sie diese Einträge in `eslint.config.mjs` und behalten Sie Ihre vorhandenen Prüfungen bei. Sie aktivieren vier gezielte Regeln; wählen Sie diejenigen aus, die zu den Kit-Funktionen Ihrer App passen.

```js
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules';

export default tseslint.config(
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    processor: angular.processInlineTemplates,
    plugins: { '@rdlabo/rules': rdlabo },
    rules: {
      '@rdlabo/rules/deny-overlay-create': 'error',
      '@rdlabo/rules/prefer-modal-launcher': 'error',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angular.templateParser },
    plugins: { '@rdlabo/rules': rdlabo },
    rules: {
      '@rdlabo/rules/prefer-disable-handler': 'error',
      '@rdlabo/rules/require-ion-error-text': 'error',
    },
  },
);
```

Diese Regeln sind auch in `rdlabo.configs.recommended` enthalten.

## Modale Dialoge über einen Starter erstellen

`deny-overlay-create` meldet `.create()`-Aufrufe an `ModalController` und `PopoverController`. `prefer-modal-launcher` prüft, ob sich `presentModal`-Aufrufe in `launch*`-Funktionen befinden.

Mit `overlay` und `DetailPage` aus Ihrer [Overlay-Konfiguration](./storage-overlays.md) wird Folgendes gemeldet:

```ts
export const openDetail = () => overlay.presentModal(DetailPage);
```

Verwenden Sie einen Starter:

```ts
export const launchDetail = () => overlay.presentModal(DetailPage);
```

## Asynchrone Aktionen umhüllen

`prefer-disable-handler` meldet eine nicht umhüllte Aktion:

```html
<ion-button type="button" (click)="vm.refresh()">Refresh</ion-button>
```

Stellen Sie die Kit-Hilfsfunktion `disableHandler` in Ihrer Komponente oder Ihrem ViewModel bereit und übergeben Sie das Ereignis sowie den asynchronen Vorgang:

```ts
import { disableHandler } from '@rdlabo/ionic-angular-kit';

// Innerhalb der Komponente oder des ViewModel:
readonly disableHandler = disableHandler;
```

```html
<ion-button type="button" (click)="vm.disableHandler($event, vm.refresh())">Refresh</ion-button>
```

Die Regel prüft den Aufruf der Hüllfunktion, nicht das Verhalten des asynchronen Vorgangs. Lassen Sie Sendeaktionen beim `(submit)` des Formulars mit `ion-button type="submit"`.

## Den Signal-Forms-Adapter berücksichtigen

Standardmäßig verlangt `require-ion-error-text` an Ionic-Eingabeelementen mit `[formField]` eine Quelle für Fehlertexte.

Für Angular-22-Apps mit [Kit Signal Forms](./forms.md) importieren Sie `FormField` und `KitIonicFormField` in jeder betroffenen Komponente und installieren Sie `provideKitIonicSignalForms()`. Überschreiben Sie anschließend diesen Eintrag in den `rules` der HTML-Konfiguration:

```js
'@rdlabo/rules/require-ion-error-text': [
  'error',
  { formFieldProvidesErrorText: true },
],
```

Diese Option erklärt, dass der Adapter die Fehlertexte bereitstellt. ESLint prüft dabei weder die Importe noch die Provider des Adapters.

## Bei Bedarf ViewModel-Regeln ergänzen

Wenn Ihre App eine `ViewModelStore`-Architektur verwendet, ergänzen Sie [require-viewmodel](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/require-viewmodel) und [no-component-writable-signal](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-component-writable-signal). Konfigurieren Sie sie passend zur ViewModel-Basis Ihrer App; `ViewModelStore` wird nicht vom Kit exportiert.

## In CI ausführen

Nach der Installation der Abhängigkeiten lokal und in CI ausführen:

```sh
npx eslint 'src/**/*.{ts,html}' --max-warnings 0
```

Passen Sie den Quellpfad für Ihre App an. Die vollständigen empfohlenen Regeln finden Sie unter [ESLint-Konfiguration](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration), weitere Konventionen unter [Regeloptionen](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules).
