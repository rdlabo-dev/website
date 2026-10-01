---
title: "deny-soft-private-modifier"
sourceRevision: "e5ed155a59e482bdaa36b67842116a4feb28be6df68b4e3dc80c7fd25e02e794"
---
# @rdlabo/rules/deny-soft-private-modifier

> Ce plugin interdit le modificateur privé de TypeScript.
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).
> - ✒️ L’option `--fix` de la [ligne de commande](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) peut corriger automatiquement certains problèmes signalés par cette règle.

Le modificateur `private` de TypeScript est appliqué uniquement à la compilation. On peut encore accéder au membre à l’exécution par la notation entre crochets ou une conversion en `any`. Les champs privés stricts JavaScript (`#`) sont protégés à l’exécution et inaccessibles depuis l’extérieur de la classe. Cette règle remplace les propriétés et méthodes `private` par des champs `#` et transforme les références `this.x` en `this.#x`.

## Détails de la règle

Cette règle vérifie les motifs suivants dans les classes :

- Une définition de propriété `private` (`private field = ...`)
- Une définition de méthode `private` (`private method() { ... }`)
- Une référence `this.field` où `field` a été déclaré `private`

Elle ne signale **pas** les constructeurs, car `private constructor()` a un autre sens : empêcher l’instanciation externe. Une propriété `private readonly` est signalée ; la correction supprime `private`, ajoute `#` et conserve `readonly`.

La correction automatique procède ainsi :

1. Supprime le mot-clé `private`.
2. Insère `#` avant le nom de propriété ou de méthode.
3. Transforme toutes les références `this.field` ou `this.method()` de la classe en `this.#field` ou `this.#method()`.

## Exemples

### Incorrect

```ts
class TokenStore {
  private token = '';

  private refresh() {
    this.token = 'new-token';
  }
}
```

### Correct

```ts
class TokenStore {
  #token = '';

  #refresh() {
    this.#token = 'new-token';
  }
}
```

## Options

Cette règle n’a pas d’options.

## Quand l’activer

Activez cette règle lorsqu’un projet souhaite une encapsulation des membres internes de classes imposée à l’exécution. Vous pouvez l’exécuter avec `--fix` sur le code existant, mais elle modifie l’interface publique : tout code qui accédait à l’exécution à des membres déclarés `private` uniquement à la compilation cessera de fonctionner.

## Voir aussi

- [`@rdlabo/rules/restrict-try-block`](./restrict-try-block.md)

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/deny-soft-private-modifier.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/deny-soft-private-modifier.ts)
