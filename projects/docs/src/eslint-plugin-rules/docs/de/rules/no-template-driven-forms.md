---
title: "no-template-driven-forms"
sourceRevision: "7fdd7720e8618bbf936ef12da94f6fbdae76c15fba7ed49559ff0fd277eabf87"
---
# @rdlabo/rules/no-template-driven-forms

> Verbietet templategesteuerte Formulare außer `ngModel`-Bindungen an ausdrücklich erlaubten Elementen.

Diese Regel beschränkt templategesteuerte Formulare in Angular-Templates. `ngForm` und `ngModelGroup` werden immer zurückgewiesen, da sie veränderlichen Formularzustand im Template halten. Auch `ngModel` wird zurückgewiesen, sofern es nicht an einem ausdrücklich zugelassenen Element für eine Ionic-View-Bindung verwendet wird, die sich nicht für Signal Forms eignet.

Ein zugelassenes Element ist eine Interoperabilitätsausnahme, keine Empfehlung für templategesteuerte Formulare. Formulare mit Absenden sollten Signal Forms verwenden, auch wenn sie ein zugelassenes Element enthalten.

## Einzelheiten der Regel

Die Regel läuft auf Angular-Templates und prüft drei Muster:

1. **`ngModel` an einem Element außerhalb von `allowedElements`**
   Meldet `ngModel`, `[(ngModel)]` und `[ngModel]` an Elementen, deren Tagname nicht in der Positivliste steht. Ein eigenständiger Output `(ngModelChange)` wird nicht untersucht.

2. **Attribut `ngModelGroup`**
   Meldet jedes Attribut `ngModelGroup` an jedem Element.

3. **Referenz oder Direktive `ngForm`**
   Meldet `<form #form="ngForm">` und `<div ngForm>`.

Die Regel verwendet keine Typinformationen; sie arbeitet ausschließlich mit dem geparsten Template-AST.

## Beispiele

### Inkorrekt

```html
<!-- ngModel an einem gewöhnlichen Eingabefeld -->
<input [(ngModel)]="name" />

<!-- ngForm-Referenz -->
<form #form="ngForm"></form>

<!-- ngModelGroup-Direktive -->
<div ngModelGroup="address"></div>
```

### Korrekt

```html
<!-- Signal-Forms-Feldbindung -->
<input [formField]="userForm.name" />

<!-- ngModel ist an ion-searchbar für eine View-Bindung erlaubt -->
<ion-searchbar [(ngModel)]="query"></ion-searchbar>
```

## Optionen

```json
{
  "rules": {
    "@rdlabo/rules/no-template-driven-forms": [
      "error",
      {
        "allowedElements": ["ion-searchbar", "ion-segment", "ion-radio-group", "ion-select", "ion-range", "ion-toggle", "ion-checkbox", "ion-input-otp"]
      }
    ]
  }
}
```

### `allowedElements`

- Typ: `string[]`
- Standard: `[]`

Element-Tagnamen, die `ngModel` verwenden dürfen. Dies ist für Ionic-Komponenten gedacht, die aus Komfortgründen einen View-Wert über `ngModel` bereitstellen, beispielsweise `ion-searchbar` oder `ion-toggle`. Auch bei einem zugelassenen Element werden `ngModelGroup` und `ngForm` weiterhin gemeldet.

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel, wenn Ihr Projekt auf Angular Signal Forms migriert, aber für bestimmte Ionic-View-Komponenten noch begrenzte `ngModel`-Bindungen benötigt. Deaktivieren Sie sie nur, wenn das Projekt vollständig auf Reactive Forms setzt und keine Einführung von Signal Forms plant.

## Siehe auch

- [`@rdlabo/rules/no-reactive-forms`](./no-reactive-forms.md)

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/no-template-driven-forms.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/no-template-driven-forms.ts)
