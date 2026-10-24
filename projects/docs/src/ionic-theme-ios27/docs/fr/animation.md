---
title: "Animation"
sourceRevision: 165b184fd4cd2f23315982e52bcd68ea1061be29e4fbe39be0f4029a50c2715d
---
# Animation

Ces utilitaires de gestes et d’animations sont prêts pour la production et facultatifs. Le thème fonctionne sans eux.

## Sheet of Glass avec `ion-tab-button` / `ion-segment-button`

Enregistrez un élément `ion-tab-bar` ou `ion-segment` pour ajouter un effet de sélection animé à ses boutons.

`registerTabBarEffect` respecte `prefers-reduced-motion`, y compris ses changements pendant que la page est ouverte. Réduire les animations supprime la lentille mobile et la mise à l’échelle des onglets, tout en conservant la sélection standard d’Ionic. Désactiver cette préférence restaure l’effet facultatif jusqu’à la destruction de l’enregistrement.

`registerSegmentEffect` ajoute uniquement une couche visuelle ; Ionic gère toujours la sélection, le glissement, le clavier et les événements. Un segment non sélectionné commence le mouvement de sa lentille au relâchement, tandis qu’un segment sélectionné se développe sur place, même lors d’un appui court. Le mouvement suit les mesures de la couche de présentation d’iOS 27. Réduire les animations ignore cet effet facultatif ; la réfraction du verre natif est approximée en CSS.

[![Animation Sheet of Glass sur ion-tab-button et ion-segment-button](https://i.gyazo.com/fafd726b520827f042c76b6c73abd81c.gif)](https://gyazo.com/fafd726b520827f042c76b6c73abd81c)

```ts
import { registerTabBarEffect, registerSegmentEffect } from '@rdlabo/ionic-theme-ios27';

/**
 * Enregistrer les éléments DOM Ionic initialisés.
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

## Icône d’annulation de la barre de recherche

Ionic 8 et 9 n’affichent `cancelButtonIcon` qu’en mode Material Design. Enregistrez une barre de recherche pour utiliser cette même propriété en mode iOS. Sans cet utilitaire facultatif, le thème conserve le bouton d’annulation textuel d’Ionic.

Il s’agit d’une adaptation de rendu temporaire, dont la suppression est prévue lorsque les versions Ionic prises en charge afficheront `cancelButtonIcon` dans le DOM iOS. Elle n’insère rien si une icône est déjà présente. Elle ne change ni la gestion du clavier, ni le focus, ni les attributs d’accessibilité du bouton, ni l’annulation ou l’effacement ; ces éléments restent gérés par Ionic. Le design CSS et les animations sont indépendants de l’utilitaire et s’appliquent aussi à une icône rendue par Ionic lui-même.

```ts
import { supportSeachbarCancelButtonIcon } from '@rdlabo/ionic-theme-ios27';
import { closeOutline } from 'ionicons/icons';

const searchbar = document.querySelector<HTMLIonSearchbarElement>('ion-searchbar')!;
searchbar.animated = true;
searchbar.showCancelButton = 'focus'; // 'always' et 'never' fonctionnent aussi
searchbar.cancelButtonIcon = closeOutline;
searchbar.clearIcon = closeOutline;
searchbar.cancelButtonText = 'Close search'; // nom accessible du bouton à icône
const effect = supportSeachbarCancelButtonIcon(searchbar);

// Après avoir changé la propriété JavaScript cancelButtonIcon, appelez effect.refresh().
// Lors de la destruction du composant ou de la page :
// effect.destroy();
```

### Enregistrement et exclusions

Enregistrez après l’initialisation de l’élément Ionic (par exemple dans `ngAfterViewInit` avec Angular).

| Condition | Comportement |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Barre de recherche compatible en mode iOS | Préserve le bouton et les gestionnaires d’événements Ionic ; `destroy()` restaure le texte. |
| Mode MD, `searchbar-classic`, `ios-theme-disabled` ou `ios26-disabled` | L’utilitaire ne s’applique pas. |
| `animated` / `prefers-reduced-motion` | Respectés par l’animation CSS. |
| Personnalisation CSS | `--background`, `--box-shadow`, `--border-radius` et `--cancel-button-color` restent disponibles. |

### Boutons d’effacement et d’annulation

| Bouton | Réglages d’apparence Ionic | Action |
| ------ | ------------------------------------------------------ | ----------------------------------- |
| Effacer | `clearIcon`, `showClearButton`, `--clear-button-color` | Efface en conservant le focus de saisie. |
| Annuler | `cancelButtonIcon`, `--cancel-button-color` | Termine la recherche. |

Les deux peuvent apparaître ensemble à côté du champ. Définissez `clearIcon` et `cancelButtonIcon` avec la même icône pour harmoniser leur apparence.

Les deux boutons de verre externes mesurent 44px au repos et s’agrandissent à l’appui. La réduction des animations désactive cette mise à l’échelle. Le bouton d’effacement apparaît hors du champ ; Ionic fournit les icônes.

Pendant l’appui, le fond en verre devient opaque et l’opacité de l’icône est 0.55, tout en conservant sa couleur configurée. Utilisez `--background-activated` pour personnaliser le fond appuyé indépendamment de `--background`.

## TabBarSearchable : recherche avec `ion-tab-bar` et `ion-fab-button`

Utilisez la structure suivante dans `ion-tabs` pour animer la transformation d’un bouton de recherche en barre d’outils de recherche.

[![Animation TabBarSearchable transformant la recherche depuis ion-fab-button en barre d’onglets](https://i.gyazo.com/06bc63f4a474f9f19f5b1d865f5c2a85.gif)](https://gyazo.com/06bc63f4a474f9f19f5b1d865f5c2a85)

```html
<ion-content>...</ion-content>
<ion-fab vertical="bottom" horizontal="end" slot="fixed">
  <ion-fab-button aria-label="Search" (click)="present($event)">
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
    <ion-searchbar aria-label="Search" (ionChange)="example($event)"></ion-searchbar>
  </ion-toolbar>
</ion-footer>
```

```ts
import { attachTabBarSearchable, TabBarSearchableType } from '@rdlabo/ionic-theme-ios27';
import type { TabBarSearchableFunction } from '@rdlabo/ionic-theme-ios27';

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
