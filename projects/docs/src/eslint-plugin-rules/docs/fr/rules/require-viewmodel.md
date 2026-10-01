---
title: "require-viewmodel"
sourceRevision: "399d8423f6d58b658e3a6d6a64b70d9cef20e38d4dc4dd519202150b4126609a"
---
# @rdlabo/rules/require-viewmodel

> Imposer `new ViewModel(this)` dans le Component, l’héritage `ViewModelStore<ComponentType, Keys>` et garder les API de vue hors du ViewModel.
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).

Cette règle impose le modèle d’architecture ViewModel. Un Component Angular doit posséder un ViewModel initialisé avec `new ViewModel(this)`. Elle exige au moins une propriété correspondante ; elle ne rejette pas les instances ViewModel supplémentaires. Le ViewModel doit étendre `ViewModelStore<ComponentType>` et ne doit pas redéclarer `host` ni contenir d’API propres à la vue comme `viewChild`, `effect`, `computed` ou `afterNextRender`.

## Détails de la règle

La règle effectue trois vérifications :

### 1. Le Component doit posséder un ViewModel

Une classe `@Component` doit contenir une propriété initialisée avec `new ViewModel(this)`. Le premier argument de cet appel de constructeur doit être `this`.

### 2. Le ViewModel doit étendre `ViewModelStore<ComponentType>`

La classe nommée `ViewModel` (ou le `viewModelClassName` configuré) doit étendre `ViewModelStore<...>` ou une base dont le nom se termine par `ViewModel` ou est `ModelSearch`. Le premier argument générique doit être le type du Component hôte. Les valeurs génériques par défaut intermédiaires sont résolues.

- Avec `ViewModelStore<ExamplePage, 'model' | 'form'>`, le deuxième argument de type et les suivants sont autorisés.
- Plus de deux arguments de type lors d’un héritage direct de `ViewModelStore` sont signalés.
- Le type hôte doit correspondre au Component qui possède le ViewModel.

### 3. Le ViewModel ne doit pas contenir d’API de vue

La classe ViewModel ne doit pas appeler les API suivantes :

`viewChild`, `viewChildren`, `contentChild`, `contentChildren`, `effect`, `computed`, `afterNextRender`, `afterEveryRender`, `afterRenderEffect`.

Cette liste peut être personnalisée avec l’option `bannedApis`. La règle reconnaît les appels directs comme `viewChild()` et la variante `.required()` comme `viewChild.required()`. Elle ne résout pas les appels préfixés par un namespace.

## Exemples

### Incorrect

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly title = 'x'; // aucun ViewModel
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(); // `this` manque
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends StoreModel {} // classe de base incorrecte
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends ViewModelStore<ExamplePage> {
  readonly el = viewChild('host'); // API de vue dans le ViewModel
}
```

### Correct

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

## Options

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

- Type : `string`
- Valeur par défaut : `"ViewModel"`

Nom de classe recherché par la règle dans le Component. Utilisez cette option si le projet suit une autre convention de nommage, comme `PageState`.

### `viewModelStoreClassName`

- Type : `string`
- Valeur par défaut : `"ViewModelStore"`

Nom de la classe de base que le ViewModel doit étendre, ou d’une base intermédiaire dont le nom se termine par `ViewModel`.

### `bannedApis`

- Type : `string[]`
- Valeur par défaut : la liste ci-dessus

API interdites dans le ViewModel. La règle détecte les appels directs et l’usage de `.required(...)` ; les appels préfixés par un namespace ne sont pas résolus.

## Quand l’activer

Activez cette règle lorsqu’un projet adopte le modèle ViewModel avec `@rdlabo/ionic-angular-kit` ou une architecture similaire. Elle s’associe à [`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md) pour garder l’état du Component en lecture seule et celui du ViewModel modifiable.

## Voir aussi

- [`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md)
- [`@rdlabo/rules/no-component-method-except-lifecycle`](./no-component-method-except-lifecycle.md)

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/require-viewmodel.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/require-viewmodel.ts)
