---
title: "require-ion-item-group"
sourceRevision: "b84fbd7d5c9b713e13571d425572bcaad0f30c76a0421a5f6f27d94a2f32984e"
---
# @rdlabo/rules/require-ion-item-group

> Exiger que les éléments ion-item dans ion-list soient enveloppés par un groupe d’éléments Ionic pris en charge.
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).
> - ✒️ L’option `--fix` de la [ligne de commande](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) peut corriger automatiquement certains problèmes signalés par cette règle.

Les styles de listes Ionic pour iOS 26 et Material Design 3 attendent que les éléments soient organisés par le composant de groupe correspondant à leur comportement. Cette règle empêche l’affichage d’un `ion-item` nu directement sous `ion-list`.

## Détails de la règle

Un `ion-item` dans `ion-list` doit utiliser exactement l’une de ces structures :

- `ion-list > ion-item-group > ion-item`
- `ion-list > ion-reorder-group > ion-item`
- `ion-list > ion-accordion-group > ion-accordion > ion-item`
- `ion-list > ion-radio-group > ion-item`

Les blocs de contrôle Angular comme `@if`, `@for`, `@empty`, `@switch` et `@defer` sont transparents pour cette vérification structurelle, car ils n’affichent pas d’élément. `ng-container` et `ng-template` sont également transparents. Les éléments HTML ou Angular affichés ne le sont pas : insérer un `div` entre la liste, le groupe ou l’élément est signalé.

La règle vérifie uniquement les éléments `ion-item` contenus dans `ion-list`. Un `ion-item` hors d’une liste n’est pas signalé et les fichiers `.spec.html` sont ignorés.

## Exemples

### Incorrect

```html
<ion-list>
  <ion-item>Direct item</ion-item>
</ion-list>
```

<!-- prettier-ignore -->
```html
<ion-list>
  @for (item of items; track item.id) {
    <ion-item>{{ item.name }}</ion-item>
  }
</ion-list>
```

### Correct

<!-- prettier-ignore -->
```html
<ion-list>
  <ion-item-group>
    @for (item of items; track item.id) {
      <ion-item>{{ item.name }}</ion-item>
    }
  </ion-item-group>
</ion-list>
```

```html
<ion-list>
  <ion-radio-group>
    <ion-item>First choice</ion-item>
    <ion-item>Second choice</ion-item>
  </ion-radio-group>
</ion-list>
```

## Options

Cette règle n’a pas d’options.

## Corrections automatiques

Lorsqu’une liste contient uniquement des `ion-item` non groupés, y compris à travers des blocs de contrôle Angular transparents ou `ng-container`, la règle peut envelopper tout le contenu dans un unique `ion-item-group`.

La correction automatique est disponible lorsque le même modèle utilise déjà `ion-item-group`, ce qui indique que le composant standalone `IonItemGroup` est disponible dans ce modèle. Sinon, la règle propose une suggestion dans l’éditeur qui rappelle aussi d’ajouter `IonItemGroup` aux imports du composant si nécessaire.

Aucune correction ni suggestion n’est proposée lorsque la liste mélange du contenu groupé et non groupé, contient d’autres contenus affichés, une définition réutilisable `ng-template`, une liste imbriquée, un élément affiché intermédiaire ou une structure d’accordéon invalide. Dans ces cas, les limites de groupe voulues ne peuvent pas être déterminées sans risque.

## Quand l’activer

Activez cette règle dans les applications Ionic Angular qui ciblent les designs de listes iOS 26 et Material Design 3. Elle figure dans le preset recommandé et n’a aucun effet lorsqu’un modèle ne contient pas de `ion-item` dans `ion-list`.

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/require-ion-item-group.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/require-ion-item-group.ts)
