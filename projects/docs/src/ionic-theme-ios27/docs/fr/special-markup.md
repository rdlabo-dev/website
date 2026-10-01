---
title: "Balisage et classes particuliers"
sourceRevision: "57b550a4998353c1fb3973721350141c72b45fad2d3f00be6286d0413d3464c8"
---
# Balisage et classes particuliers

La plupart du balisage Ionic fonctionne sans modification. Les combinaisons ci-dessous sont des options du thème à activer explicitement.

## Boutons d’envoi principaux

Les boutons d’envoi à remplissage plein utilisent la valeur de contraste de la couleur Ionic pour leur premier plan. Leur traitement des bords directionnel suit l’apparence des boutons mis en avant d’iOS 27 et ne nécessite pas de couleur de luminosité supplémentaire.

```html preview
<ion-button type="submit" color="primary">Submit</ion-button>
<ion-button class="button-submit" fill="solid" color="primary">Continue</ion-button>
```

Utilisez `.button-submit` lorsque le bouton doit recevoir le même traitement mais ne peut pas utiliser `type="submit"`.

## Actions recommandées des superpositions

Pour les alertes et les action sheets iOS, attribuez `role: 'preferred'` à un bouton pour lui donner un fond plein `--ion-color-primary` et du texte et des icônes en `--ion-color-primary-contrast`. Pendant l’appui, le fond utilise `--ion-color-primary-shade`. Cette convention du thème s’appuie sur les rôles de bouton personnalisés d’Ionic ; elle ne sélectionne ni n’exécute automatiquement l’action. La fermeture renvoie le rôle `preferred`.

```ts
buttons: [
  { text: 'Cancel', role: 'cancel' },
  { text: 'Continue', role: 'preferred' },
];
```

Les boutons sans rôle ou avec `default` conservent la couleur de texte normale. `cancel` conserve le comportement d’annulation d’Ionic, `selected` reste un état de sélection et `destructive` utilise `--ios-theme-destructive-color`. Un rôle `confirm` existant n’est pas considéré comme recommandé. Utilisez `preferred` pour l’action recommandée, et pas simplement pour toute action qui confirme un choix.

## Feuilles flottantes sur iPad

Définissez `expandToScroll: false` sur une modale de type sheet pour obtenir des coins inférieurs flottants et un espace de 20px en bas sur iPad. Ionic dimensionne alors la page visible à chaque point d’arrêt ; le thème peut donc la styliser uniquement en CSS. Le contenu défile dans le point d’arrêt actuel ; faire glisser la poignée redimensionne toujours la feuille. Avec `expandToScroll: true`, valeur par défaut, la feuille conserve la disposition attachée au bas et l’expansion au défilement d’Ionic.

## Position de la barre d’onglets

Ajoutez `tab-bar-position-start`, `tab-bar-position-center` ou `tab-bar-position-end` à un `ion-tab-bar` iOS pour positionner toute la barre dans sa zone sûre. Ces classes fonctionnent avec `slot="top"` et `slot="bottom"`, et conservent la largeur de la barre et son animation d’appui. Start et end suivent le sens du texte et s’inversent en RTL. Sans classe, la position existante ne change pas.

```html
<ion-tab-bar slot="bottom" class="tab-bar-position-center">
  <ion-tab-button tab="home">Home</ion-tab-button>
  <ion-tab-button tab="settings">Settings</ion-tab-button>
</ion-tab-bar>
```

Ces classes ne repositionnent pas un `ion-fab` distinct ; réservez-lui de la place lorsque vous choisissez la position de la barre.

## Prendre en charge iPhone Duo (préversion)

La prise en charge d’iPhone Duo, y compris Vertical Bars en mode autonome, est disponible en **préversion** dans `1.2.0`, avec Native UI Shell. Ses API et comportements pris en charge peuvent évoluer.

La prise en charge d’iPhone Duo — rail système vertical, position de la charnière et panneaux divisés selon cette position — est indépendante du thème iOS 27 et du Native UI Shell complet. Consultez [Prise en charge d’iPhone Duo](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo) pour la configuration complète, y compris le suivi de la disposition de l’appareil sans moteur de projection.

Consultez [Vertical Bars](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars) pour les classes de disposition du rail, l’admissibilité des contrôles et l’apparence des boutons natifs.

Pour une configuration autonome conservant votre thème existant, consultez [iPhone Duo avec votre thème existant](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme).

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

Pour les segments colorés, utilisez la propriété `color` d’Ionic, par exemple `color="primary"` ou `color="secondary"`. Ionic utilise la couleur de base de la palette pour la piste légèrement teintée, tout en gardant la surface sélectionnée et les libellés neutres. Une barre d’outils colorée englobante ne fournit des couleurs que si le segment n’a pas sa propre couleur. Le verre mobile facultatif hérite de la couleur de la surface sélectionnée ; les palettes Ionic personnalisées fonctionnent sans enregistrement supplémentaire.

Ajoutez `.segment-expand` lorsque les boutons du segment doivent se partager également la largeur disponible. La classe modifie aussi la taille de l’effet Liquid Glass lorsque `registerSegmentEffect` est utilisé.

Les segments ont une hauteur minimale de 32px dans le contenu et de 48px dans `ion-toolbar`. `.segment-expand` conserve la disposition compacte de 32px dans une barre d’outils. Les segments compacts conservent l’arrière-plan plat et les couleurs d’indicateur d’Ionic ; seule la variante normale de barre d’outils a un conteneur en verre et redimensionne son conteneur extérieur pendant l’appui. Les segments de contenu et développés conservent leurs limites extérieures. La lentille de verre mobile facultative est indépendante de l’arrière-plan du conteneur.

```html preview
<ion-segment class="segment-expand" value="new">
  <ion-segment-button value="new"><ion-label>New</ion-label></ion-segment-button>
  <ion-segment-button value="replied"><ion-label>Replied</ion-label></ion-segment-button>
</ion-segment>
```

## Barre de recherche classique dans un en-tête rétractable

Le thème donne par défaut aux barres de recherche iOS l’apparence d’iOS 27. Ajoutez `.searchbar-classic` au champ de recherche sous un grand titre dans un `ion-header` avec `collapse="condense"`. Il utilise l’apparence iOS conventionnelle à remplissage plein et se replie avec le grand titre au lieu de rester dans l’en-tête fixe.

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

## Désactiver le thème

Ajoutez `.ios-theme-disabled` à un composant Ionic individuel lorsqu’il doit conserver le style iOS standard d’Ionic.

`.ios26-disabled` est obsolète, mais reste pris en charge comme alias au comportement identique. Utilisez `.ios-theme-disabled` dans le nouveau code.

```html preview
<ion-button>iOS 27 theme</ion-button> <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

Pour le modèle d’arrière-plan des listes avec retrait, consultez [Utiliser `ion-item-group`](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/using-ion-item-group).
