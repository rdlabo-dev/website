---
title: "signal-use-as-signal"
sourceRevision: "fbc6184adff8efe7c46d0a82fd071c8154894886518b7fcf4f0fbe3e7a208acf"
---
# @rdlabo/rules/signal-use-as-signal

> Dieses Plugin prüft die korrekte Verwendung von Signals als Signals.
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](../configuration.md) enthalten.
> - ✒️ Die Option `--fix` auf der [Befehlszeile](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) kann einige der von dieser Regel gemeldeten Probleme automatisch korrigieren.

Angular-Signals sind Getter-Funktionen. Das Lesen verlangt `()`, das Schreiben muss über `.set()` oder `.update()` erfolgen. Diese Regel erkennt Code, der eine Signal-Variable wie einen gewöhnlichen Wert verwendet, und kann viele häufige Fehler automatisch korrigieren.

## Einzelheiten der Regel

Die Regel verfolgt Klassenproperties, die mit Signal-Factories (`signal`, `model`, `input`, `linkedSignal`, `toSignal`, `asReadonly`) initialisiert werden, und meldet Fehlverwendungen wie:

- `this.count` statt `this.count()` in einem Ausdruckskontext
- `this.count() = value` statt `this.count.set(value)`
- `this.user().name = 'Jane'` statt `this.user.update(user => ({ ...user, name: 'Jane' }))`
- `this.items().push(x)` statt `this.items.update(items => { items.push(x); return items; })`
- `this.#user = value` (direkte Zuweisung an eine Signal-Property) statt `this.#user.set(value)`

Die Regel unterscheidet Kontexte, die eine Signal-Referenz erwarten, von Kontexten, die dessen Wert erwarten. Beispielsweise ist die Übergabe eines Signal-Objekts als Prop erlaubt:

```ts
const props = { food: this.food };
launchModal({ food: this.food });
```

## Beispiele

### Inkorrekt

```ts
export class SigninPage {
  readonly #id = signal<number | undefined>(undefined);

  constructor() {
    this.#id = 1;
  }

  useMethod() {
    if (this.#id) {
      this.#id().hoge = 1;
    }
  }
}
```

```ts
export class SigninPage {
  readonly #user = signal<{ name: string }>({ name: 'John' });

  updateUser() {
    this.#user().name = 'Jane';
  }
}
```

```ts
export class SigninPage {
  readonly #numbers = signal<number[]>([1, 2, 3]);

  updateNumbers() {
    this.#numbers().push(4);
  }
}
```

```ts
export class SigninPage {
  readonly #value = signal<number>(0);

  updateValue() {
    this.#value() = 42;
  }
}
```

### Korrekt

```ts
export class SigninPage {
  readonly #user = signal<{ name: string }>({ name: 'John' });

  updateUser() {
    this.#user.update((user) => ({ ...user, name: 'Jane' }));
  }
}
```

```ts
export class SigninPage {
  readonly #numbers = signal<number[]>([1, 2, 3]);

  updateNumbers() {
    this.#numbers.update((numbers) => {
      numbers.push(4);
      return numbers;
    });
  }
}
```

```ts
export class SigninPage {
  readonly #value = signal<number>(0);

  updateValue() {
    this.#value.set(42);
  }
}
```

```ts
export class SigninPage {
  readonly food = signal<number>(0);

  openPreview() {
    const props = { food: this.food };
    launchModal({ food: this.food });
  }
}
```

## Automatische Korrektur

Die Regel bietet automatische Korrekturen für die oben genannten Muster:

- `this.count = value` -> `this.count.set(value)`
- `this.count() = value` -> `this.count.set(value)`
- `this.count().x = value` -> `this.count.update(value => ({ ...value, x: value }))`
- `this.count().push(x)` -> `this.count.update(value => { value.push(x); return value; })`

## Optionen

Diese Regel besitzt keine Optionen.

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel in jedem Angular-Projekt mit Signals. Sie ergänzt [`@rdlabo/rules/signal-use-as-signal-template`](./signal-use-as-signal-template.md), das die Signal-Verwendung in Templates prüft.

## Siehe auch

- [`@rdlabo/rules/signal-use-as-signal-template`](./signal-use-as-signal-template.md)
- [`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md)

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/signal-use-as-signal.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/signal-use-as-signal.ts)
