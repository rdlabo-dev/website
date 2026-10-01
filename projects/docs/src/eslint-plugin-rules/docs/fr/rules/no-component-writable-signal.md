---
title: "no-component-writable-signal"
sourceRevision: "33dc0d0718b1f568596cd52600d5b2340c60ec7a0c9d64f9e5ea7a74155195df"
---
# @rdlabo/rules/no-component-writable-signal

> Garder l’état modifiable des composants dans un ViewModel, sauf les modèles passés à `form()` d’Angular Signal Forms.

Cette règle impose une séparation claire entre les Components Angular et les ViewModels. Les Components doivent exposer aux modèles un état dérivé en lecture seule ; l’état modifiable doit résider dans un ViewModel pour centraliser les changements et les rendre testables. Le seul Signal modifiable autorisé sur un Component est celui passé directement à `form()` de Signal Forms comme modèle.

## Détails de la règle

Cette règle inspecte les classes décorées avec `@Component` et signale les propriétés de classe initialisées avec `signal()` ou `linkedSignal()` de `@angular/core`, sauf si cette même propriété est passée en premier argument à `form()` de `@angular/forms/signals`.

- `computed()` et `effect()` restent des responsabilités du Component et ne sont pas signalés.
- Les classes qui ne sont pas des Components sont ignorées.
- Les imports avec alias et les imports de namespace de `@angular/core` et `@angular/forms/signals` sont reconnus.
- Les utilitaires locaux portant le même nom sont ignorés, car la règle vérifie l’origine des imports.

L’exception Signal Forms reconnaît uniquement un initialiseur de propriété du Component comme `readonly pageForm = form(this.model)`. Passer le Signal à `form()` dans une méthode ne crée pas d’exception ; la propriété Signal modifiable reste donc signalée.

## Exemples

### Incorrect

```ts
import { Component, signal } from '@angular/core';

@Component({ template: '' })
class Page {
  readonly isLoading = signal(false); // signalé : déplacer dans le ViewModel
}
```

```ts
import { Component, signal } from '@angular/core';
import { form } from '@angular/forms/signals';

@Component({ template: '' })
class Page {
  readonly model = signal({ name: '' });
  readonly loading = signal(false); // signalé
  readonly pageForm = form(this.model);
}
```

### Correct

```ts
import { Component, computed } from '@angular/core';
import { form } from '@angular/forms/signals';
import { PageViewModel } from './page.viewmodel';

@Component({ template: '' })
class Page {
  private readonly vm = new PageViewModel(this);
  readonly isLoading = this.vm.isLoading; // vue en lecture seule de l’état du ViewModel
  readonly model = this.vm.model;
  readonly pageForm = form(this.model);
  readonly title = computed(() => this.model().name);
}
```

```ts
import { Component, signal as writable } from '@angular/core';
import { form as signalForm } from '@angular/forms/signals';

@Component({ template: '' })
class Page {
  readonly data = writable({ name: '' });
  readonly pageForm = signalForm(this.data); // data est le modèle Signal Forms
}
```

## Options

Cette règle n’a pas d’options.

## Quand l’activer

Activez cette règle lorsqu’un projet utilise le modèle ViewModel avec `@rdlabo/rules/require-viewmodel`. Elle garantit que les propriétés du Component sont des vues en lecture seule sur un état partagé, ce qui empêche les Components de modifier directement l’état.

## Voir aussi

- [`@rdlabo/rules/require-viewmodel`](./require-viewmodel.md)
- [`@rdlabo/rules/no-reactive-forms`](./no-reactive-forms.md)

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/no-component-writable-signal.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/no-component-writable-signal.ts)
