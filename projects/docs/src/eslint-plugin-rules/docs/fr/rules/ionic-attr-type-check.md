---
title: "ionic-attr-type-check"
sourceRevision: "9e4baaf74ad97c89e90c628cf80b323b9f40c5c6e3e3282ebf29e08611202f25"
---
# @rdlabo/rules/ionic-attr-type-check

> Exiger des liaisons de propriété pour les attributs Ionic non textuels pris en charge et valider les attributs littéraux textuels.
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).
> - ✒️ L’option `--fix` de la [ligne de commande](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) peut corriger automatiquement certains problèmes signalés par cette règle.

Les attributs des composants Ionic peuvent être booléens, numériques, objets ou textuels. Passer une chaîne comme `button="true"` à une propriété booléenne est une erreur fréquente qui peut produire un comportement inattendu. Cette règle lit les définitions de types Ionic de `@ionic/core` et signale les incohérences.

## Détails de la règle

La règle s’exécute sur les modèles Angular. Pour chaque élément Ionic, elle examine les définitions de types de `@ionic/core` et classe chaque attribut dans l’une de ces catégories :

- `string` — les chaînes littérales sont autorisées
- `string literal` — seul un ensemble précis de valeurs est autorisé
- `boolean` — utilisez `[attr]="true"` ou `[attr]="false"`
- `number` — utilisez `[attr]="50"`
- `object` — utilisez `[attr]="..."`
- `skip` / `unknown` — non vérifié

Pour les attributs booléens, la règle reconnaît les valeurs textuelles `true`, `false`, `1`, `0`, `yes`, `no`, `on` et `off` ; les autres chaînes ne sont pas signalées par la vérification booléenne. Les incohérences prises en charge pour les booléens, nombres et objets sont corrigées automatiquement en liaisons de propriété :

- `button="true"` -> `[button]="true"`
- `value="50"` -> `[value]="50"`
- `autocorrect="off"` -> `[autocorrect]="false"` sur Ionic 9

Lorsqu’une valeur textuelle est invalide pour un attribut à valeurs littérales, la règle indique les valeurs acceptées.

## Exemples

### Incorrect

```html
<ion-item button="true"></ion-item>
```

```html
<ion-progress-bar value="50"></ion-progress-bar>
```

```html
<ion-modal isOpen="true" backdropDismiss="false"></ion-modal>
```

### Correct

```html
<ion-item [button]="true"></ion-item>
```

```html
<ion-progress-bar [value]="50"></ion-progress-bar>
```

```html
<ion-modal [isOpen]="true" [backdropDismiss]="false"></ion-modal>
```

```html
<!-- Les attributs de type chaîne restent autorisés -->
<ion-item lines="full"></ion-item>
<ion-button color="primary">Click me</ion-button>
```

## Options

Cette règle n’a pas d’options.

## Quand l’activer

Activez cette règle dans tout projet Ionic Angular. Elle est particulièrement utile lors d’une migration depuis une ancienne syntaxe Ionic ou pour l’intégration de développeurs habitués aux attributs HTML ordinaires.

## Prérequis

La règle exige que `@ionic/core` soit installé dans le même projet pour lire `node_modules/@ionic/core/dist/types/components.d.ts`. Si le package est absent, elle renvoie un résultat vide et ne signale rien.

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/ionic-attr-type-check.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/ionic-attr-type-check.ts)
