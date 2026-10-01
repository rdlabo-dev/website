---
title: "require-ion-error-text"
sourceRevision: "1e4afbe66d80dffe6a75d2cf582d0346908e790d924a1a654c3d2de1a7f42002"
---
# @rdlabo/rules/require-ion-error-text

> Verlangt eine errorText-Quelle für Ionic-Validierungsbedienelemente.
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](../configuration.md) enthalten.

Verlangt eine Quelle für `errorText` an Ionic-Bedienelementen, die an der Validierung von Angular Signal Forms teilnehmen.

## Einzelheiten der Regel

Die Regel prüft folgende Ionic-Bedienelemente in Angular-Templatedateien:

- `ion-input`
- `ion-textarea`
- `ion-select`
- `ion-checkbox`
- `ion-radio-group`
- `ion-toggle`

Standardmäßig wird ein unterstütztes Bedienelement nur geprüft, wenn es Angular Signal Forms mit `[formField]` bindet. Es muss eine der folgenden Fehlertextquellen verwenden:

- Einen nicht leeren statischen `errorText`
- Einen per Property gebundenen `[errorText]`
- `KitIonicFormField`, wenn `formFieldProvidesErrorText` aktiviert ist

`[attr.errorText]` wird nicht akzeptiert, da Ionic `errorText` als Komponentenproperty bereitstellt. Auch ein leerer oder ausschließlich aus Leerraum bestehender statischer Wert wird zurückgewiesen. `.spec.html`-Dateien werden ignoriert.

## Optionen

```json
{
  "rules": {
    "@rdlabo/rules/require-ion-error-text": [
      "error",
      {
        "formFieldProvidesErrorText": true,
        "checkAll": false,
        "ignoreReadonly": false
      }
    ]
  }
}
```

### `formFieldProvidesErrorText`

- Typ: `boolean`
- Standard: `false`

Bei `true` darf ein unterstütztes Bedienelement mit `[formField]` `errorText` weglassen, da `KitIonicFormField` es bereitstellt. Aktivieren Sie diese Option erst, nachdem jede betreffende Standalone-Komponente `KitIonicFormField` importiert und die Anwendung `provideKitIonicSignalForms()` eingerichtet hat.

Diese Option deklariert, dass der Adapter installiert ist. Die Regel untersucht keine Komponentenimports oder Anwendungsprovider. Ein ausdrücklich gesetzter, aber leerer `errorText` bleibt ein Fehler und fällt nicht auf den Adapter zurück.

### `checkAll`

- Typ: `boolean`
- Standard: `false`

Bei `true` prüft die Regel auch unterstützte Bedienelemente ohne `[formField]`. Dies muss ausdrücklich aktiviert werden, da Filter, Suchfelder und Einstellungsbedienelemente nicht zwingend an der Validierung teilnehmen.

### `ignoreReadonly`

- Typ: `boolean`
- Standard: `false`

Wenn `checkAll` und `ignoreReadonly` beide `true` sind, werden `ion-input` und `ion-textarea` mit einem literalen Attribut `readonly` ignoriert. Eine dynamische Bindung `[readonly]` wird weiterhin geprüft, da das Bedienelement zur Laufzeit bearbeitbar werden kann.

## Beispiele

### Inkorrekt

```html
<ion-input [formField]="fields.name"></ion-input>
```

```html
<ion-textarea [formField]="fields.description" errorText="   "></ion-textarea>
```

```html
<ion-select [formField]="fields.category" [attr.errorText]="categoryError"></ion-select>
```

Mit `checkAll: true` benötigt ein unterstütztes Bedienelement ohne `[formField]` ebenfalls eine Fehlertextquelle:

```html
<ion-toggle></ion-toggle>
```

### Korrekt

```html
<ion-input [formField]="fields.name" errorText="Name is required."></ion-input>
```

```html
<ion-textarea [formField]="fields.description" [errorText]="descriptionError()"></ion-textarea>
```

Mit `formFieldProvidesErrorText: true` und installiertem Kit-Adapter:

```html
<ion-select [formField]="fields.category"></ion-select>
```

Mit `checkAll: true` und `ignoreReadonly: true`:

```html
<ion-input readonly></ion-input>
```

Nicht unterstützte Bedienelemente wie `ion-searchbar` liegen außerhalb des Regelumfangs:

```html
<ion-searchbar [formField]="fields.query"></ion-searchbar>
```

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel in Ionic-Angular-Anwendungen, die die Ionic-API `errorText` für Validierungsrückmeldungen verwenden. Der Standardumfang eignet sich für Angular-Signal-Forms-Anwendungen, da er validierungsgebundene Bedienelemente prüft, ohne unbeteiligten UI-Bedienelementen Fehlermeldungen vorzuschreiben.

Verwenden Sie `formFieldProvidesErrorText`, wenn die Anwendung allgemeine Validierungsmeldungen an `@rdlabo/ionic-angular-kit` delegiert. Verwenden Sie `checkAll` nur, wenn jedes unterstützte Ionic-Bedienelement eine Fehlertextquelle deklarieren soll.

Die Regel meldet lediglich und korrigiert weder die Validierungsrichtlinie der Anwendung noch die Adaptereinrichtung automatisch.

## Siehe auch

- [Signal-Forms-Integration von `@rdlabo/ionic-angular-kit`](https://github.com/rdlabo-dev/ionic-angular-library/blob/main/projects/kit/docs/forms.md)

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/require-ion-error-text.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/require-ion-error-text.ts)
