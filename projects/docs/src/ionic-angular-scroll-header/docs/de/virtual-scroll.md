---
title: "Virtuelles Scrollen"
sourceRevision: "b9b083ed0ebd4a7676d82d743f942a2d109aa57182aeb831fed7a2cea7de1d9f"
---
Erweitern Sie einen vorhandenen virtuellen CDK-Scroll-Viewport um scrollabhängige Header. Beginnen Sie mit [IonContent](./ion-content.md) für das Header-/Safe-Area-Muster und ersetzen Sie anschließend den Scroll-Host durch einen Viewport. Verwenden Sie dies nach der [Installation](../README.md#installation).

- Demo: https://rdlabo-ionic-angular-library.netlify.app/main/virtual-scroll-header
- Quellcode: https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.3/projects/demo/src/app/virtual-scroll-header/virtual-scroll-header.page.html

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

Geben Sie dem Viewport mit dem globalen CSS aus der [Installation](../README.md#installation) eine feste Höhe.

### Scrollsprünge und Flackern am oberen Rand verhindern

Behebt das in [angular/components#27104](https://github.com/angular/components/issues/27104) beschriebene Zurückspringen eines vorhandenen CDK-Viewports beim Scrollen.

Ergänzen Sie die Direktive in den `imports` der oben gezeigten Komponente und fügen Sie ihr Attribut dem vorhandenen Viewport hinzu. Behalten Sie die CDK-Importe und Daten dieses Beispiels bei.

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
