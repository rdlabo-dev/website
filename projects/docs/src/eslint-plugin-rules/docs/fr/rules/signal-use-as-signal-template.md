---
title: "signal-use-as-signal-template"
sourceRevision: "92a017c7467f1010d40fcd07876f8707b0e6a1d9dededdcca0b341b327713db5"
---
# @rdlabo/rules/signal-use-as-signal-template

> Exiger () lors de l’accès aux Signals Angular dans les modèles
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).

Les Signals Angular sont des fonctions. Dans un modèle, un Signal doit être appelé avec `()` pour lire sa valeur actuelle. Oublier les parenthèses est une erreur fréquente lors d’une migration depuis `BehaviorSubject` de RxJS ou depuis des entrées `model()`. Cette règle détecte les identifiants Signal dans les modèles Angular et signale les lectures directes comme `{{ count }}` ou `[hidden]="count"`.

## Détails de la règle

La règle analyse le modèle Angular de chaque `@Component`. Elle collecte les identifiants Signal à partir de :

- Propriétés de classe initialisées par un appel dont le nom de fonction est `signal`, `model`, `computed`, `linkedSignal`, `input` ou `toSignal`.
- Propriétés Signal imbriquées dans des littéraux d’objet (par exemple `count = { first: signal(0) }`).

La détection repose sur les noms et ne résout pas l’origine des imports. Les imports de fabriques avec alias ne sont pas reconnus, tandis qu’une fonction locale sans rapport portant l’un de ces noms peut être considérée comme une fabrique de Signal. `toSignal` est couramment importé depuis `@angular/core/rxjs-interop` ; la règle le reconnaît par son nom plutôt que par son module.

Elle signale ensuite tout endroit du modèle où le Signal est lu sans `()`. Cela comprend :

- Interpolation `{{ count }}`
- Liaisons de propriété `[hidden]="count"`
- Liaisons d’événement `(click)="count > 0 ? ..."
- Expressions de contrôle `@if (count)`, `@switch (count)`, `@for (...; track count)`
- Chaînage optionnel `count?.signal`
- Usage de pipe `count | async`

La règle prend en charge les composants `template` comme `templateUrl`.

## Exemples

### Incorrect

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

### Correct

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

### Passer une référence de Signal à un enfant

Si un composant enfant attend un objet Signal (pas sa valeur), vous pouvez passer la référence sans `()` :

```html
<child [inventorySignal]="inventorySignal"></child>
```

La règle reconnaît ce cas et ne signale pas un Signal direct passé comme attribut lié.

## Options

Cette règle n’a pas d’options.

## Quand l’activer

Activez cette règle dans tout projet Angular utilisant des Signals. Elle est particulièrement utile pendant la migration depuis du code fondé sur `Observable` ou l’introduction de `model()` et `input()`, car ces API renvoient des objets de type Signal qui doivent être appelés dans le modèle.

## Voir aussi

- [`@rdlabo/rules/signal-use-as-signal`](./signal-use-as-signal.md)

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/signal-use-as-signal-template.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/signal-use-as-signal-template.ts)
