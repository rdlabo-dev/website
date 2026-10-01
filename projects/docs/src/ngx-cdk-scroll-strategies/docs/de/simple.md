---
title: "Einfache Verwendung"
sourceRevision: "44a5927716257eeaa8abe1ce979a3e3d256ee95453e94f8f6104d42eda714b63"
---
Rufen Sie dies nach der [Installation](../README.md#installation) auf.

> Für Elemente, deren unterschiedliche Höhen bereits bekannt sind.

- Demo: https://rdlabo-ionic-angular-library.netlify.app/main/scroll-strategies/simple
- Quellcode: https://github.com/rdlabo-dev/ionic-angular-library/tree/v22.0.3/projects/demo/src/app/scroll-strategies/pages/scroll-simple

Geben Sie dem Viewport im globalen CSS eine feste Höhe:

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

Die Zeilen haben unterschiedliche Höhen. Beim Scrollen ändern sich daher die Größen der sichtbaren Elemente. Abgesehen von `[itemDynamicSizes]` funktioniert dies wie `@angular/cdk/scrolling`.
