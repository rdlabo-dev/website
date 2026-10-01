---
title: "Balisage et classes particuliers"
sourceRevision: "1cf00d7a1d33ef40392eeef516073a5372ddb011225b1cb8bf71da061f8cbded"
---
# Balisage et classes particuliers

La plupart du balisage Ionic fonctionne sans modification. Les combinaisons ci-dessous sont des options du thème à activer explicitement.

## Boutons d’envoi principaux

Les boutons d’envoi pleins de couleur primaire utilisent `--ion-color-primary-brightness` pour leur premier plan et leur bordure. Définissez une valeur offrant un contraste suffisant avec votre couleur primaire.

```css
:root {
  --ion-color-primary-brightness: #96feff;
}
```

```html preview
<ion-button type="submit" color="primary">Submit</ion-button>
<ion-button class="button-submit" fill="solid" color="primary">Continue</ion-button>
```

Utilisez `.button-submit` lorsque le bouton doit recevoir le même traitement mais ne peut pas utiliser `type="submit"`.

## Actions recommandées des superpositions

Pour les alertes et les action sheets iOS, attribuez `role: 'preferred'` à un bouton pour lui donner un fond plein `--ion-color-primary` et du texte et des icônes en `--ion-color-primary-contrast`. Pendant l’appui, le fond utilise `--ion-color-primary-shade`. Cette convention du thème s’appuie sur les rôles de bouton personnalisés d’Ionic ; elle ne sélectionne ni n’exécute automatiquement l’action. La fermeture renvoie le rôle `preferred`.

```ts
const buttons = [
  { text: 'Cancel', role: 'cancel' },
  { text: 'Continue', role: 'preferred' },
];
```

Les boutons sans rôle ou avec `default` conservent la couleur de texte normale. `cancel` conserve le comportement d’annulation d’Ionic, `selected` reste un état de sélection et `destructive` utilise `--ios-theme-destructive-color`. Un rôle `confirm` existant n’est pas considéré comme recommandé. Utilisez `preferred` pour l’action recommandée, et pas simplement pour toute action qui confirme un choix.

Le thème suit la présentation centrée et sans ancrage d’`UIAlertController` mesurée sur iOS 26.1/26.5. Utilisez `ion-popover` pour un menu ancré. `ios-theme-disabled` / `ios26-disabled` conservent la présentation Ionic d’origine. Les contenus longs restent défilables. Les constructeurs d’animation mesurée facultatifs sont décrits dans [Animation expérimentale](./experimental-animation.md) ; le CSS seul ne remplace pas les animations d’entrée et de sortie Ionic.

## Position de la barre d’onglets

Ajoutez `tab-bar-position-start`, `tab-bar-position-center` ou `tab-bar-position-end` à un `ion-tab-bar` iOS pour positionner la barre entière dans sa zone de sécurité. Ces classes fonctionnent avec `slot="top"` et `slot="bottom"` et préservent sa largeur et son animation d’appui. Start et end suivent la direction du texte, inversée en RTL. Sans classe, le thème utilise son placement par défaut.

```html
<ion-tab-bar slot="bottom" class="tab-bar-position-center">
  <ion-tab-button tab="home">Home</ion-tab-button>
  <ion-tab-button tab="settings">Settings</ion-tab-button>
</ion-tab-bar>
```

Ces classes ne repositionnent pas un `ion-fab` distinct ; réservez-lui de la place lorsque vous choisissez la position de la barre.

## Éléments de liste en retrait sur deux lignes

Placez un `ion-label` sans slot immédiatement à côté d’un `ion-note` sans slot pour afficher un élément sur deux lignes. Lorsque vous utilisez le fond de liste en retrait de style iOS, regroupez les éléments dans `ion-item-group` et laissez `ion-list-header` en dehors du groupe.

```html preview
<ion-list inset="true">
  <ion-list-header>
    <ion-label>Connections</ion-label>
  </ion-list-header>
  <ion-item-group>
    <ion-item>
      <ion-label>Network &amp; internet</ion-label>
      <ion-note>Mobile, Wi-Fi, hotspot</ion-note>
    </ion-item>
  </ion-item-group>
</ion-list>
```

Utilisez `slot="end"` sur `ion-note` pour obtenir la disposition standard avec une note en fin de ligne.

## En-têtes de section des listes en retrait

Ajoutez `.item-group-header` à un `ion-item-group` pour créer l’icône centrée, le titre et la description affichés en haut des pages de démonstration des composants.

Il s’agit d’un groupe d’introduction. Placez les éléments de liste ordinaires dans un autre `ion-item-group` qui le suit.

```html preview
<ion-list inset="true">
  <ion-item-group class="item-group-header">
    <ion-item>
      <ion-label>
        <ion-icon name="list" style="background: var(--ion-color-primary)"></ion-icon>
        <h2>Lists</h2>
        <ion-text>Inset-list examples</ion-text>
      </ion-label>
    </ion-item>
  </ion-item-group>
  <ion-item-group>
    <ion-item><ion-label>First item</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

## Segments sur toute la largeur

Ajoutez `.segment-style-glass` pour donner à un segment la même surface en verre et le même traitement de l’indicateur sélectionné que la barre d’onglets. La classe préserve les dimensions et les couleurs de texte existantes du segment, prend en charge les segments défilants et respecte la propriété publique `--background` d’Ionic.

```html
<ion-segment class="segment-style-glass" value="available">
  <ion-segment-button value="available">Available</ion-segment-button>
  <ion-segment-button value="away">Away</ion-segment-button>
</ion-segment>
```

Ajoutez `.segment-expand` lorsque les boutons du segment doivent se partager également la largeur disponible. La classe modifie aussi la taille de l’effet Liquid Glass lorsque `registerSegmentEffect` est utilisé.

```html preview
<ion-segment class="segment-expand" value="new">
  <ion-segment-button value="new"><ion-label>New</ion-label></ion-segment-button>
  <ion-segment-button value="replied"><ion-label>Replied</ion-label></ion-segment-button>
</ion-segment>
```

## Barre de recherche classique dans un en-tête rétractable

Le thème donne par défaut aux barres de recherche iOS l’apparence iOS 26. Ajoutez `.searchbar-classic` au champ de recherche affiché sous un grand titre dans un `ion-header` avec `collapse="condense"`. Il utilise l’apparence iOS traditionnelle avec fond rempli et se replie avec le grand titre plutôt que de rester dans l’en-tête fixe.

Placez-la dans une barre d’outils dotée d’une couleur, par exemple `color="light"` ; son fond classique est dérivé de la valeur de contraste de cette couleur.

L’exemple utilise la structure standard d’Ionic avec un grand titre rétractable. Faites défiler l’aperçu pour réduire le grand titre et révéler l’en-tête fixe.

```html preview
<div class="ion-page">
  <ion-header translucent="true">
    <ion-toolbar color="light">
      <ion-title>Search</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light" fullscreen="true">
    <ion-header collapse="condense">
      <ion-toolbar color="light">
        <ion-title size="large">Search</ion-title>
      </ion-toolbar>
      <ion-toolbar color="light">
        <ion-searchbar class="searchbar-classic" placeholder="Filter results"></ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-list inset="true">
      <ion-item-group>
        <ion-item><ion-label>Recent item 1</ion-label></ion-item>
        <ion-item><ion-label>Recent item 2</ion-label></ion-item>
        <ion-item><ion-label>Recent item 3</ion-label></ion-item>
        <ion-item><ion-label>Recent item 4</ion-label></ion-item>
        <ion-item><ion-label>Recent item 5</ion-label></ion-item>
        <ion-item><ion-label>Recent item 6</ion-label></ion-item>
        <ion-item><ion-label>Recent item 7</ion-label></ion-item>
        <ion-item><ion-label>Recent item 8</ion-label></ion-item>
        <ion-item><ion-label>Recent item 9</ion-label></ion-item>
        <ion-item><ion-label>Recent item 10</ion-label></ion-item>
      </ion-item-group>
    </ion-list>
  </ion-content>
</div>
```

Le conteneur `.ion-page` permet à cet aperçu intégré de se comporter comme une page routée complète. Une application utilisant `ion-router-outlet` reçoit normalement ce conteneur de page automatiquement. La liste en retrait et ses éléments fournissent seulement assez de contenu pour démontrer le défilement ; `.searchbar-classic` ne les exige pas.

## Barres d’outils de recherche

Ajoutez `.toolbar-searchbar` lorsqu’un `ion-toolbar` associe une barre de recherche à des boutons de début ou de fin. La classe centre les contrôles placés dans les slots et ajuste l’espacement autour du champ de recherche.

```html preview
<ion-toolbar class="toolbar-searchbar">
  <ion-buttons slot="start">
    <ion-button>Cancel</ion-button>
  </ion-buttons>
  <ion-searchbar></ion-searchbar>
</ion-toolbar>
```

## Désactiver le thème

Ajoutez `.ios-theme-disabled` à un composant Ionic individuel lorsqu’il doit conserver le style iOS standard d’Ionic.

```html preview
<ion-button>iOS 26 theme</ion-button> <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

Pour le modèle d’arrière-plan des listes en retrait, consultez [Utiliser `ion-item-group`](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/using-ion-item-group).

`ios26-disabled` reste pris en charge comme alias obsolète de `ios-theme-disabled`.
