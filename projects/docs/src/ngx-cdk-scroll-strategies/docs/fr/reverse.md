---
title: "Défilement inversé"
sourceRevision: "0c01bc96239e54ac53b22ae968506c527c850904061a5194b208705ef3239ab5"
---
Appelez cette fonction après l’[installation](/docs/readme#installation).

> Réutilisez le modèle de données, le computed `dynamicSize`, `trackBy` et les importations du viewport de [Utilisation simple](/docs/simple). Cette page ajoute le CSS de disposition inversée et `[isReverse]="true"` pour une liste de type chat.

- Démonstration : https://rdlabo-ionic-angular-library.netlify.app/main/scroll-strategies/reverse
- Code source : https://github.com/rdlabo-dev/ionic-angular-library/tree/v22.0.7/projects/demo/src/app/scroll-strategies/pages/scroll-reverse

Pour un défilement inversé, ajoutez la directive `isReverse` à la balise `cdk-virtual-scroll-viewport`.

```html
<cdk-virtual-scroll-viewport
  [itemDynamicSizes]="dynamicSize()"
  [isReverse]="true"
  minBufferPx="900"
  maxBufferPx="1350"
>
  <div class="reverse-items">
    <div
      *cdkVirtualFor="let item of items(); trackBy: trackByFn"
      class="dynamic-item"
      [style.height.px]="item.itemSize"
    >
      itemSize: {{ item.itemSize }}
    </div>
  </div>
</cdk-virtual-scroll-viewport>
```

Ajoutez le CSS de `cdk-virtual-scroll-viewport.reverse-scroll` dans un fichier CSS global comme `styles.css`.

```css
cdk-virtual-scroll-viewport {
  width: 100%;
  height: 320px;

  /* Cette directive ajoute la classe .reverse-scroll. */
  &.reverse-scroll {
    display: flex;
    flex-direction: column-reverse;

    .cdk-virtual-scroll-content-wrapper {
      top: auto;
      bottom: 0;
    }
  }
}
```

Ajoutez également un conteneur pour les éléments. La classe `div.reverse-items` est un exemple ; vous pouvez choisir une autre classe.

```css
div.reverse-items {
  height: 100%;
  display: flex;
  flex-direction: column-reverse;

  position: relative;
  bottom: 0;
}
```

**En défilement inversé, measureScrollOffset de CdkVirtualScrollViewport ne fonctionne pas. Utilisez le scrollOffset de cette directive.**
https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.7/projects/scroll-strategies/src/lib/dynamic-size-virtual-scroll-strategy.ts

La disposition inversée utilise des valeurs natives `scrollTop` négatives. `scrollToIndex()` accepte un index logique d’élément comme d’habitude et convertit son décalage cumulé en cette coordonnée native en interne.

### Facultatif

Ce package contient un service utilitaire qui simplifie le développement avec le défilement virtuel.

```ts
import { DynamicSizeVirtualScrollService } from '@rdlabo/ngx-cdk-scroll-strategies';
```

Détails : https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.7/projects/scroll-strategies/src/lib/dynamic-size-virtual-scroll.service.ts
