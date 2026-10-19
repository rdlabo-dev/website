---
title: "Défilement virtuel"
sourceRevision: "860d9dd28cef8762485731fcadbf34d84ab58f4dd303ae551b873ad428481f88"
---
Ajoutez des en-têtes sensibles au défilement à un viewport de défilement virtuel CDK existant. Partez de [IonContent](/docs/ion-content) pour le modèle d’en-tête et de zone de sécurité, puis remplacez l’hôte du défilement par un viewport. Faites-le après l’[installation](/docs/readme#installation).

- Démonstration : https://rdlabo-ionic-angular-library.netlify.app/main/virtual-scroll-header
- Code source : https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.6/projects/demo/src/app/virtual-scroll-header/virtual-scroll-header.page.html

```ts
import { Component } from '@angular/core';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { VirtualScrollHeaderDirective } from '@rdlabo/ionic-angular-scroll-header';

@Component({
  selector: 'app-virtual-scroll-header',
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
    VirtualScrollHeaderDirective,
  ],
  template: `
    <ion-header class="hidden">
      <ion-toolbar></ion-toolbar>
    </ion-header>
    <ion-content rdlaboVirtualScrollHeader>
      <ion-header>
        <ion-toolbar>
          <ion-title>Virtual scroll header</ion-title>
        </ion-toolbar>
      </ion-header>
      <cdk-virtual-scroll-viewport
        minBufferPx="900"
        maxBufferPx="1350"
        [itemSize]="44"
        class="ion-content-scroll-host"
      >
        <div *cdkVirtualFor="let item of items; trackBy: trackByFn" style="height: 44px">
          {{ item }}
        </div>
      </cdk-virtual-scroll-viewport>
    </ion-content>
  `,
})
export class VirtualScrollHeaderPage {
  readonly items = Array.from({ length: 80 }, (_, index) => `Row ${index + 1}`);
  trackByFn = (_: number, item: string) => item;
}
```

Donnez au viewport une hauteur définie grâce au CSS global de l’[installation](/docs/readme#installation).

### Éviter les sauts et le scintillement en haut du défilement

Corrige le problème [angular/components#27104](https://github.com/angular/components/issues/27104), où un viewport CDK existant revient en arrière pendant le défilement.

Ajoutez la directive aux `imports` du composant ci-dessus, puis ajoutez son attribut au viewport existant. Conservez les importations CDK et les données de cet exemple.

```ts
import { FixVirtualScrollElementDirective } from '@rdlabo/ionic-angular-scroll-header';

```

```html
<ion-content>
  <cdk-virtual-scroll-viewport
    rdlaboFixVirtualScrollElement
    minBufferPx="900"
    maxBufferPx="1350"
    [itemSize]="44"
    class="ion-content-scroll-host"
  >
    <div *cdkVirtualFor="let item of items; trackBy: trackByFn" style="height: 44px">
      {{ item }}
    </div>
  </cdk-virtual-scroll-viewport>
</ion-content>
```
