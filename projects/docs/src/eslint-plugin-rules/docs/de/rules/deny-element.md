---
title: "deny-element"
sourceRevision: "24367f0cd736699c68ad9777826192af7bc455c174a2d0491f68eb40510b243e"
---
# @rdlabo/rules/deny-element

> Dieses Plugin verbietet die Verwendung bestimmter HTML-Tags.
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration) enthalten.

Diese Regel verhindert bestimmte Elemente in Angular-Templates. Häufig wird sie verwendet, um Inline-Overlay-Komponenten wie `<ion-modal>`, `<ion-popover>`, `<ion-toast>`, `<ion-alert>`, `<ion-loading>`, `<ion-picker>` und `<ion-action-sheet>` zu verbieten. Diese sollten über Launcher-Methoden oder dedizierte Dienste angezeigt werden, statt im Template deklariert zu werden.

## Einzelheiten der Regel

Die Regel wird auf `.html`-Templatedateien ausgeführt und meldet jedes Element, dessen Tagname in der konfigurierten Liste `elements` steht. Sie durchläuft den Template-AST einschließlich der Angular-Kontrollflusssyntax wie `@if`, `@for`, `@else` und verschachtelten `then`- / `else`-Zweigen.

- `.spec.html`-Dateien werden ignoriert, damit Tests nicht betroffen sind.
- Ohne ausdrückliche Option verwendet die Regel ihre standardmäßige Liste von Ionic-Overlay-Elementen. Wird ein Optionsobjekt übergeben, verlangt dessen Schema ein Array `elements`.

## Optionen

```json
{
  "rules": {
    "@rdlabo/rules/deny-element": [
      "error",
      {
        "elements": ["ion-modal", "ion-popover", "ion-toast", "ion-alert", "ion-loading", "ion-picker", "ion-action-sheet"]
      }
    ]
  }
}
```

### `elements`

- Typ: `string[]`
- Standard: `ion-modal`, `ion-popover`, `ion-toast`, `ion-alert`, `ion-loading`, `ion-picker`, `ion-action-sheet`

Array der zu verbietenden Element-Tagnamen. Die Regel vergleicht diese Namen mit dem Knotentyp `Element` im Angular-Template-AST und prüft daher sowohl das Element selbst als auch sein Auftreten in Kontrollflusszweigen.

## Beispiele

### Inkorrekt

```html
<ion-modal></ion-modal>

<div>
  <ion-toast></ion-toast>
  <ion-alert></ion-alert>
</div>
```

```html
@if (showModal) {
<ion-modal>Modal content</ion-modal>
}
```

### Korrekt

```html
<ion-button (click)="presentModal()">Open</ion-button>
```

```html
@for (item of items; track item.id) {
<ion-card>
  <ion-card-header>{{ item.name }}</ion-card-header>
</ion-card>
}
```

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel in Projekten mit Launcher-Muster für Overlays. Sie ergänzt [`@rdlabo/rules/prefer-modal-launcher`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/prefer-modal-launcher) und [`@rdlabo/rules/prefer-disable-handler`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/prefer-disable-handler), um Modal- und Overlay-Logik aus dem Template herauszuhalten.

## Siehe auch

- [`@rdlabo/rules/prefer-modal-launcher`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/prefer-modal-launcher)
- [`@rdlabo/rules/prefer-disable-handler`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/prefer-disable-handler)

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.1/src/rules/deny-element.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.1/tests/rules/deny-element.ts)
