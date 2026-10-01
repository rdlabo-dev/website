---
title: "signal-use-as-signal-template"
sourceRevision: "92a017c7467f1010d40fcd07876f8707b0e6a1d9dededdcca0b341b327713db5"
---
# @rdlabo/rules/signal-use-as-signal-template

> Verlangt () beim Zugriff auf Angular-Signals in Templates
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](../configuration.md) enthalten.

Angular-Signals sind Funktionen. In einem Template muss ein Signal mit `()` aufgerufen werden, um seinen aktuellen Wert zu lesen. Das Vergessen der Klammern ist ein häufiger Fehler bei der Migration von RxJS-`BehaviorSubject` oder von `model()`-Inputs. Diese Regel erkennt Signal-Bezeichner in Angular-Templates und meldet direkte Lesezugriffe wie `{{ count }}` oder `[hidden]="count"`.

## Einzelheiten der Regel

Die Regel parst das Angular-Template jeder `@Component`. Sie sammelt Signal-Bezeichner aus:

- Klassenproperties, die durch einen Aufruf mit dem Funktionsnamen `signal`, `model`, `computed`, `linkedSignal`, `input` oder `toSignal` initialisiert werden.
- Verschachtelten Signal-Properties in Objektliteralen, beispielsweise `count = { first: signal(0) }`.

Die Erkennung ist namensbasiert und löst die Herkunft von Imports nicht auf. Alias-Imports von Factory-Funktionen werden nicht erkannt; eine unbeteiligte lokale Funktion mit einem dieser Namen kann dagegen als Signal-Factory behandelt werden. `toSignal` wird üblicherweise aus `@angular/core/rxjs-interop` importiert. Die Regel erkennt es anhand des Namens, nicht des Moduls.

Anschließend meldet sie jede Stelle im Template, an der das Signal ohne `()` gelesen wird. Dazu gehören:

- Interpolation `{{ count }}`
- Property-Bindings `[hidden]="count"`
- Ereignisbindungen `(click)="count > 0 ? ..."`
- Kontrollflussausdrücke `@if (count)`, `@switch (count)`, `@for (...; track count)`
- Optional Chaining `count?.signal`
- Pipe-Verwendung `count | async`

Die Regel unterstützt Komponenten mit `template` und `templateUrl`.

## Beispiele

### Inkorrekt

```html
<div>{{ count }}</div>
```

```html
<child [hidden]="count > 0"></child>
```

```html
@if (count) {
<div>Positive</div>
}
```

```html
<ion-input [formField]="count.first"></ion-input>
```

### Korrekt

```html
<div>{{ count() }}</div>
```

```html
<child [hidden]="count() > 0"></child>
```

```html
@if (count()) {
<div>Positive</div>
}
```

```html
<ion-input [formField]="count.first()"></ion-input>
```

### Eine Signal-Referenz an ein Kind übergeben

Wenn eine Kindkomponente ein Signal-Objekt statt seines Werts erwartet, können Sie die Referenz ohne `()` übergeben:

```html
<child [inventorySignal]="inventorySignal"></child>
```

Die Regel erkennt diesen Fall und meldet ein als gebundenes Attribut übergebenes Signal ohne Aufruf nicht.

## Optionen

Diese Regel besitzt keine Optionen.

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel in jedem Angular-Projekt mit Signals. Sie ist besonders nützlich bei der Migration von `Observable`-basiertem Code oder bei der Einführung von `model()` und `input()`, da diese APIs Signal-artige Objekte zurückgeben, die im Template aufgerufen werden müssen.

## Siehe auch

- [`@rdlabo/rules/signal-use-as-signal`](./signal-use-as-signal.md)

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/signal-use-as-signal-template.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/signal-use-as-signal-template.ts)
