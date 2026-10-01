---
title: "Utilisation simple"
sourceRevision: "44a5927716257eeaa8abe1ce979a3e3d256ee95453e94f8f6104d42eda714b63"
---
Appelez cette fonction après l’[installation](../README.md#installation).

> Pour les éléments dont les hauteurs variables sont déjà connues.

- Démonstration : https://rdlabo-ionic-angular-library.netlify.app/main/scroll-strategies/simple
- Code source : https://github.com/rdlabo-dev/ionic-angular-library/tree/v22.0.3/projects/demo/src/app/scroll-strategies/pages/scroll-simple

Donnez au viewport une hauteur définie dans le CSS global :

```css
cdk-virtual-scroll-viewport {
  width: 100%;
  height: 320px;
}
```

```ts
import { Component, computed, signal } from '@angular/core';
import { CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { CdkDynamicSizeVirtualScroll, itemDynamicSize } from '@rdlabo/ngx-cdk-scroll-strategies';

type Item = itemDynamicSize & { trackId: number };

@Component({
  selector: 'app-scroll-simple',
  imports: [CdkVirtualScrollViewport, CdkVirtualForOf, CdkDynamicSizeVirtualScroll],
  template: `
    <cdk-virtual-scroll-viewport
      [itemDynamicSizes]="dynamicSize()"
      minBufferPx="900"
      maxBufferPx="1350"
    >
      <div
        *cdkVirtualFor="let item of items(); trackBy: trackByFn"
        class="dynamic-item"
        [style.height.px]="item.itemSize"
      >
        itemSize: {{ item.itemSize }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
})
export class ScrollSimplePage {
  readonly items = signal<Item[]>(
    Array.from({ length: 20 }, (_, index) => ({
      trackId: index,
      itemSize: 40 + (index % 5) * 16,
    })),
  );
  readonly dynamicSize = computed<itemDynamicSize[]>(() =>
    this.items().map((item) => ({ trackId: item.trackId, itemSize: item.itemSize })),
  );
  trackByFn = (_: number, item: Item) => item.trackId;
}
```

Les lignes utilisent des hauteurs différentes ; le défilement modifie donc les tailles qui restent visibles. Hormis `[itemDynamicSizes]`, le fonctionnement est identique à celui de `@angular/cdk/scrolling`.
