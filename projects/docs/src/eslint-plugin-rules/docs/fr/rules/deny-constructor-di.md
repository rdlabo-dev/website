---
title: "deny-constructor-di"
sourceRevision: "9ca98a52c5bc8e79bb0e8e336c53c1c6159a31f42b18a72bb65e98744adc687b"
---
# @rdlabo/rules/deny-constructor-di

> Ce plugin interdit l’injection de dépendances dans le constructeur.

Cette règle signale les propriétés de paramètres de constructeur utilisées pour l’injection de dépendances, comme `constructor(private readonly auth: AuthService)`. La fonction `inject()` d’Angular est la manière moderne de demander des dépendances dans les composants et services standalone. Elle évite le code répétitif des constructeurs et rend l’injection explicite.

## Détails de la règle

La règle vérifie le constructeur des classes et signale tout paramètre de type `TSParameterProperty` (un paramètre avec un modificateur comme `public`, `private` ou `readonly`). Ces paramètres deviennent des champs de classe et servent à l’injection de dépendances.

- Les paramètres de constructeur ordinaires sans modificateur sont autorisés.
- La règle ne propose pas de correction automatique ; vous devez remplacer manuellement l’injection par constructeur par `inject()`.

## Exemples

### Incorrect

```ts
@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
})
export class SigninPage {
  constructor(
    private store: Store<IApp>,
    public readonly navCtrl: NavController,
  ) {}
}
```

### Correct

```ts
import { inject } from '@angular/core';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
})
export class SigninPage {
  private readonly store = inject(Store<IApp>);
  private readonly navCtrl = inject(NavController);
}
```

```ts
// Les paramètres de constructeur sans injection de dépendances sont autorisés
export class LogManager {
  constructor(logDomain: string) {
    this.logDomain = logDomain;
  }
}
```

## Options

Cette règle n’a pas d’options.

## Quand l’activer

Activez cette règle facultative lorsqu’un projet exige d’obtenir les dépendances Angular avec `inject()` plutôt qu’avec des propriétés de paramètres de constructeur. Les paramètres de constructeur ordinaires restent autorisés, car la règle signale uniquement les nœuds `TSParameterProperty`.

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/deny-constructor-di.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/deny-constructor-di.ts)
