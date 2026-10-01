---
title: "Animation expérimentale"
sourceRevision: "3a151b6af2683112d5aa2056c9bf094410a9c2ae7ee0da1a038704481d2917b4"
---
# Animation expérimentale

Ces utilitaires de gestes et d’animation sont expérimentaux et facultatifs. Le thème fonctionne sans eux.

## Sheet of Glass avec `ion-tab-button` / `ion-segment-button`

Enregistrez un élément `ion-tab-bar` ou `ion-segment` pour ajouter un effet de sélection animé à ses boutons.

[![Animation Sheet of Glass sur ion-tab-button et ion-segment-button](https://i.gyazo.com/fafd726b520827f042c76b6c73abd81c.gif)](https://gyazo.com/fafd726b520827f042c76b6c73abd81c)

```ts
import { registerTabBarEffect, registerSegmentEffect } from '@rdlabo/ionic-theme-ios26';

/**
 * Enregistrez les éléments DOM. Les effets utilisent Ionic Gesture et Ionic Animation.
 */
const tabBar = document.querySelector<HTMLElement>('ion-tab-bar');
const segment = document.querySelector<HTMLElement>('ion-segment');
const registeredTabBarEffect = tabBar ? registerTabBarEffect(tabBar) : undefined;
const registeredSegmentEffect = segment ? registerSegmentEffect(segment) : undefined;

const destroy = () => {
  /**
   * Si l’élément DOM enregistré est supprimé (par exemple lors d’une navigation),
   * détruisez le geste et l’animation. Cela supprime aussi les écouteurs d’événements.
   * Vous pouvez les enregistrer à nouveau si nécessaire.
   */
  registeredTabBarEffect?.destroy();
  registeredSegmentEffect?.destroy();
};
```

## TabBarSearchable : recherche avec `ion-tab-bar` et `ion-fab-button`

Utilisez la structure suivante dans `ion-tabs` pour animer la transformation d’un bouton de recherche en barre d’outils de recherche.

[![Animation TabBarSearchable transformant la recherche depuis ion-fab-button en barre d’onglets](https://i.gyazo.com/06bc63f4a474f9f19f5b1d865f5c2a85.gif)](https://gyazo.com/06bc63f4a474f9f19f5b1d865f5c2a85)

```html
<ion-content>...</ion-content>
<ion-fab vertical="bottom" horizontal="end" slot="fixed">
  <ion-fab-button (click)="present($event)">
    <ion-icon name="search"></ion-icon>
  </ion-fab-button>
</ion-fab>
<ion-footer [translucent]="true">
  <ion-toolbar>
    <ion-buttons slot="start">
      <!-- Le nom de ion-icon est défini dynamiquement par l’animation -->
      <ion-button fill="default"><ion-icon slot="icon-only"></ion-icon> </ion-button>
    </ion-buttons>
    <!-- Configurez `ionChange` ou d’autres événements. -->
    <ion-searchbar (ionChange)="example($event)"></ion-searchbar>
  </ion-toolbar>
</ion-footer>
```

```ts
import { attachTabBarSearchable, TabBarSearchableType } from '@rdlabo/ionic-theme-ios26';
import type { TabBarSearchableFunction } from '@rdlabo/ionic-theme-ios26';

let searchableFun: TabBarSearchableFunction | undefined;
const initialize = () => {
  // attachTabBarSearchable conserve un état. Initialisez-le pour chaque page.
  const tabBar = document.querySelector<HTMLElement>('ion-tab-bar');
  const fabButton = document.querySelector<HTMLElement>('ion-fab-button');
  const footer = document.querySelector<HTMLElement>('ion-footer');
  if (!tabBar || !fabButton || !footer) {
    return;
  }
  searchableFun = attachTabBarSearchable(tabBar, fabButton, footer);
};

const present = (event: Event) => {
  searchableFun!(event, TabBarSearchableType.Enter);
};

const dismiss = (event: Event) => {
  searchableFun!(event, TabBarSearchableType.Leave);
};
```
