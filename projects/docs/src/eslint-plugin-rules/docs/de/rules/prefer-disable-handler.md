---
title: "prefer-disable-handler"
sourceRevision: "43d51116211dd913b8385aafc04fe7deb330a753afb578d4f9a83f90cae4edeb"
---
# @rdlabo/rules/prefer-disable-handler

> Verlangt eine Wrapper-Methode (Standard: disableHandler($event, work)) an konfigurierten Element-/Ereignisbindungen, um doppeltes Antippen während asynchroner Arbeit zu verhindern
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](../configuration.md) enthalten.

Wenn ein Nutzer eine Schaltfläche antippt, die asynchrone Arbeit auslöst, sollte das Bedienelement bis zum Abschluss deaktiviert bleiben. Andernfalls kann ein zweites Antippen die Aktion erneut auslösen. Diese Regel erzwingt die Wrapper-Aufrufsyntax für konfigurierte `(event)`-Bindungen. Die Wrapper-Implementierung ist für das Deaktivieren der UI und die korrekte Verarbeitung des Arbeitswerts verantwortlich.

## Einzelheiten der Regel

Die Regel läuft auf Angular-Templates. Für jedes `BoundEvent`, das einem konfigurierten Ziel entspricht, muss der Handler-Ausdruck ein Aufruf einer Wrapper-Methode mit mindestens zwei Argumenten sein:

1. Der Ereignisparameter, standardmäßig `$event`.
2. Ein Arbeitsausdruck, der an den Wrapper übergeben wird.

Beispielsweise ist `(click)="vm.disableHandler($event, vm.save())"` gültig. `(click)="vm.save()"` wird gemeldet. Die Regel untersucht den Typ des zweiten Arguments nicht und prüft nicht, ob es ein Promise zurückgibt.

Die Regel erlaubt außerdem direkte Ereignismethodenaufrufe wie `$event.stopPropagation()` und `$event.preventDefault()`; dies lässt sich über `allowEventMethods` konfigurieren.

Standardmäßig prüft die Regel:

- `click` an `<ion-button>` und `<button>`
- `submit` an jedem Element

Sie ignoriert `.spec.html`-Dateien.

## Optionen

```json
{
  "rules": {
    "@rdlabo/rules/prefer-disable-handler": [
      "error",
      {
        "method": "disableHandler",
        "eventParam": "$event",
        "targets": [{ "events": ["click"], "elements": ["ion-button", "button"] }, { "events": ["submit"] }],
        "allowEventMethods": ["stopPropagation", "preventDefault"]
      }
    ]
  }
}
```

### `method`

- Typ: `string`
- Standard: `"disableHandler"`

Der im Handler-Ausdruck erwartete Name der Wrapper-Methode.

### `eventParam`

- Typ: `string`
- Standard: `"$event"`

Das erste Argument, das an die Wrapper-Methode übergeben werden muss.

### `targets`

- Typ: `Target[]`
- Standard: `[{ events: ['click'], elements: ['ion-button', 'button'] }, { events: ['submit'] }]`

Jedes Ziel legt fest, welche Ereignisse und Elemente den Wrapper benötigen. `elements` ist optional. Fehlt es, gilt die Regel für diese Ereignisse an jedem Element.

### `allowEventMethods`

- Typ: `string[]`
- Standard: `["stopPropagation", "preventDefault"]`

Ereignismethoden, die ohne Wrapper erlaubt sind. Beispielsweise ist `(click)="$event.stopPropagation()"` gültig.

## Beispiele

### Inkorrekt

```html
<ion-button (click)="vm.save()">Save</ion-button>
```

```html
<form (submit)="vm.save()"></form>
```

```html
<ion-button (click)="vm.disableHandler(vm.save())">missing $event</ion-button>
```

### Korrekt

```html
<ion-button (click)="vm.disableHandler($event, vm.save())">Save</ion-button>
```

```html
<form (submit)="vm.disableHandler($event, vm.save())">
  <ion-button type="submit">Save</ion-button>
</form>
```

```html
<ion-button (click)="$event.stopPropagation()"></ion-button>
```

### Benutzerdefinierte Konfiguration

```html
<ion-input (ionComplete)="vm.disableHandler($event, vm.join())"></ion-input>
```

```json
{
  "rules": {
    "@rdlabo/rules/prefer-disable-handler": [
      "error",
      {
        "targets": [{ "events": ["ionComplete"], "elements": ["ion-input"] }]
      }
    ]
  }
}
```

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel in Ionic-/Angular-Projekten, in denen Nutzeraktionen asynchrone Operationen wie API-Aufrufe, Navigation oder Modal-Anzeige auslösen. Sie ergänzt [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md) und [`@rdlabo/rules/deny-element`](./deny-element.md), um Overlay-Logik zentral zu halten.

## Siehe auch

- [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md)
- [`@rdlabo/rules/deny-element`](./deny-element.md)

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/prefer-disable-handler.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/prefer-disable-handler.ts)
