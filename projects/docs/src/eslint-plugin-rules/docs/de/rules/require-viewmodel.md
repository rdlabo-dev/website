---
title: "require-viewmodel"
sourceRevision: "399d8423f6d58b658e3a6d6a64b70d9cef20e38d4dc4dd519202150b4126609a"
---
# @rdlabo/rules/require-viewmodel

> Erzwingt `new ViewModel(this)` in der Komponente und die Vererbung von `ViewModelStore<ComponentType, Keys>` und hält View-APIs aus dem ViewModel heraus.
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](../configuration.md) enthalten.

Diese Regel erzwingt das ViewModel-Architekturmuster. Eine Angular-Komponente muss ein mit `new ViewModel(this)` initialisiertes ViewModel besitzen. Die Regel verlangt mindestens eine passende Property; zusätzliche ViewModel-Instanzen weist sie nicht zurück. Das ViewModel muss `ViewModelStore<ComponentType>` erweitern und sollte weder `host` erneut deklarieren noch View-spezifische APIs wie `viewChild`, `effect`, `computed` oder `afterNextRender` enthalten.

## Einzelheiten der Regel

Die Regel führt drei Prüfungen aus:

### 1. Die Komponente muss ein ViewModel besitzen

Eine Klasse mit `@Component` muss eine mit `new ViewModel(this)` initialisierte Property enthalten. Das erste Argument des Konstruktoraufrufs muss `this` sein.

### 2. Das ViewModel muss `ViewModelStore<ComponentType>` erweitern

Die Klasse namens `ViewModel` beziehungsweise der konfigurierte `viewModelClassName` muss `ViewModelStore<...>` oder eine Basisklasse erweitern, deren Name mit `ViewModel` endet oder `ModelSearch` ist. Das erste generische Argument muss der Typ der Host-Komponente sein. Generische Standardwerte zwischengeschalteter Klassen werden aufgelöst.

- Bei Verwendung von `ViewModelStore<ExamplePage, 'model' | 'form'>` sind das zweite und weitere Typargumente erlaubt.
- Mehr als zwei Typargumente bei direkter Erweiterung von `ViewModelStore` werden gemeldet.
- Der Host-Typ muss zu der Komponente passen, die das ViewModel besitzt.

### 3. Das ViewModel darf keine View-APIs enthalten

Die ViewModel-Klasse darf folgende APIs nicht aufrufen:

`viewChild`, `viewChildren`, `contentChild`, `contentChildren`, `effect`, `computed`, `afterNextRender`, `afterEveryRender`, `afterRenderEffect`.

Diese Liste lässt sich mit der Option `bannedApis` anpassen. Die Regel erkennt direkte Aufrufe wie `viewChild()` und die Variante `.required()` wie `viewChild.required()`. Sie löst keine Aufrufe mit Namespace-Präfix auf.

## Beispiele

### Inkorrekt

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly title = 'x'; // Kein ViewModel
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(); // `this` fehlt
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends StoreModel {} // Falsche Basisklasse
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends ViewModelStore<ExamplePage> {
  readonly el = viewChild('host'); // View-API im ViewModel
}
```

### Korrekt

```ts
import { Component, computed, effect, viewChild } from '@angular/core';

@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
  readonly title = computed(() => this.vm.label());
  readonly el = viewChild('host');

  constructor() {
    effect(() => this.vm.label());
  }
}

class ViewModel extends ViewModelStore<ExamplePage> {
  readonly label = signal('hello');
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends ViewModelStore<ExamplePage, 'inventoryModel'> {
  readonly inventoryModel = signal<Inventory | null>(null);
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class FoodsPage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends MainViewModel<FoodsPage> {}
```

## Optionen

```json
{
  "rules": {
    "@rdlabo/rules/require-viewmodel": [
      "error",
      {
        "viewModelClassName": "ViewModel",
        "viewModelStoreClassName": "ViewModelStore",
        "bannedApis": [
          "viewChild",
          "viewChildren",
          "contentChild",
          "contentChildren",
          "effect",
          "computed",
          "afterNextRender",
          "afterEveryRender",
          "afterRenderEffect"
        ]
      }
    ]
  }
}
```

### `viewModelClassName`

- Typ: `string`
- Standard: `"ViewModel"`

Der Klassenname, nach dem die Regel in der Komponente sucht. Verwenden Sie dies bei einer anderen Namenskonvention des Projekts, beispielsweise `PageState`.

### `viewModelStoreClassName`

- Typ: `string`
- Standard: `"ViewModelStore"`

Der Name der vom ViewModel zu erweiternden Basisklasse oder einer Zwischenbasisklasse, deren Name mit `ViewModel` endet.

### `bannedApis`

- Typ: `string[]`
- Standard: die obige Liste

APIs, die innerhalb des ViewModels nicht erlaubt sind. Die Regel erkennt direkte Aufrufe und die Verwendung von `.required(...)`; Aufrufe mit Namespace-Präfix werden nicht aufgelöst.

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel, wenn Ihr Projekt das ViewModel-Muster mit `@rdlabo/ionic-angular-kit` oder einer ähnlichen Architektur verwendet. Sie ergänzt [`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md), um Komponentenzustand schreibgeschützt und ViewModel-Zustand veränderlich zu halten.

## Siehe auch

- [`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md)
- [`@rdlabo/rules/no-component-method-except-lifecycle`](./no-component-method-except-lifecycle.md)

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/require-viewmodel.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/require-viewmodel.ts)
