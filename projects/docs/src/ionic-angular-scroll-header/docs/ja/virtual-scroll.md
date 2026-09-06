---
title: 'Virtual Scroll'
code: []
scrollActiveLine: []
---

既存のCDK Virtual Scroll Viewportへ、Scroll連動Headerを拡張します。Header／Safe Areaの形は [IonContent](/docs/ion-content) を起点にし、Scroll HostをViewportへ置き換えます。[インストール](/docs/readme#インストール) のあとで呼び出します。

- Demo: https://rdlabo-ionic-angular-library.netlify.app/main/virtual-scroll-header
- Source: https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.0/projects/demo/src/app/virtual-scroll-header/virtual-scroll-header.page.html

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

Viewportには [インストール](/docs/readme#インストール) のグローバルCSSで確定した高さを与えてください。

### スクロールの跳ね返りを防ぐ

既存のCDK Viewportがスクロール中に先頭へ跳ね返る場合の対策です。[angular/components#27104](https://github.com/angular/components/issues/27104) を参照してください。

上のコンポーネントの `imports` にこのdirectiveを追加し、既存のviewportへ属性を付けます。CDKのimportsとデータはそのまま使います。

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
