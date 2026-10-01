---
title: "signal-use-as-signal"
sourceRevision: "fbc6184adff8efe7c46d0a82fd071c8154894886518b7fcf4f0fbe3e7a208acf"
---
# @rdlabo/rules/signal-use-as-signal

> Ce plugin vérifie que les Signals sont utilisés comme des Signals.
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).
> - ✒️ L’option `--fix` de la [ligne de commande](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) peut corriger automatiquement certains problèmes signalés par cette règle.

Les Signals Angular sont des fonctions de lecture. Leur lecture exige `()` et leur écriture doit passer par `.set()` ou `.update()`. Cette règle détecte le code qui traite une variable Signal comme une valeur ordinaire et peut corriger automatiquement de nombreuses erreurs courantes.

## Détails de la règle

La règle suit les propriétés de classe initialisées avec des fabriques de Signal (`signal`, `model`, `input`, `linkedSignal`, `toSignal`, `asReadonly`) et signale les mauvais usages comme :

- `this.count` au lieu de `this.count()` dans un contexte d’expression
- `this.count() = value` au lieu de `this.count.set(value)`
- `this.user().name = 'Jane'` au lieu de `this.user.update(user => ({ ...user, name: 'Jane' }))`
- `this.items().push(x)` au lieu de `this.items.update(items => { items.push(x); return items; })`
- `this.#user = value` (affectation directe à une propriété Signal) au lieu de `this.#user.set(value)`

La règle distingue les contextes qui attendent une référence de Signal de ceux qui attendent sa valeur. Par exemple, passer un objet Signal comme prop est autorisé :

```ts
const props = { food: this.food };
launchModal({ food: this.food });
```

## Exemples

### Incorrect

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

### Correct

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

## Correction automatique

La règle propose une correction automatique pour les motifs ci-dessus :

- `this.count = value` -> `this.count.set(value)`
- `this.count() = value` -> `this.count.set(value)`
- `this.count().x = value` -> `this.count.update(value => ({ ...value, x: value }))`
- `this.count().push(x)` -> `this.count.update(value => { value.push(x); return value; })`

## Options

Cette règle n’a pas d’options.

## Quand l’activer

Activez cette règle dans tout projet Angular utilisant des Signals. Elle complète [`@rdlabo/rules/signal-use-as-signal-template`](./signal-use-as-signal-template.md), qui vérifie l’usage des Signals dans les modèles.

## Voir aussi

- [`@rdlabo/rules/signal-use-as-signal-template`](./signal-use-as-signal-template.md)
- [`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md)

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/signal-use-as-signal.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/signal-use-as-signal.ts)
