---
title: "deny-element"
sourceRevision: "15b7371e233c9c398e7eb47c237103ff023955d473ebcb929aa6a95051241a62"
---
# @rdlabo/rules/deny-element

> Dieses Plugin verbietet die Verwendung bestimmter HTML-Tags.
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](../configuration.md) enthalten.

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

Aktivieren Sie diese Regel in Projekten mit Launcher-Muster für Overlays. Sie ergänzt [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md) und [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md), um Modal- und Overlay-Logik aus dem Template herauszuhalten.

## Siehe auch

- [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md)
- [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md)

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/deny-element.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/deny-element.ts)
