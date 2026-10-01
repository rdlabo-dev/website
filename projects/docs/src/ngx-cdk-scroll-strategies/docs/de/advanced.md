---
title: "Erweiterte Verwendung"
sourceRevision: "9a27ed2eae6a0a600c54b7d54c45fdb8d35ee526b85184245393a008acb20b82"
---
Rufen Sie dies nach der [Installation](../README.md#installation) auf. Übernehmen Sie den Viewport, die CDK-Imports, `trackBy` und die Regeln für das Größenmodell aus der [einfachen Verwendung](./simple.md). Ersetzen Sie die bekannten `itemSize`-Werte durch gemessene Höhen.

> Messen Sie jedes Scrollelement als eigene Komponente und schreiben Sie das Ergebnis in das Größenmodell für `[itemDynamicSizes]`.

- Demo: https://rdlabo-ionic-angular-library.netlify.app/main/scroll-strategies/advanced
- Quellcode: https://github.com/rdlabo-dev/ionic-angular-library/tree/v22.0.3/projects/demo/src/app/scroll-strategies/pages/scroll-advanced

Verwenden Sie einen Messwert-Cache mit `trackId` als Schlüssel. Lesen Sie nach dem Rendern eines Elements seine Höhe aus und aktualisieren Sie den Cache. Ein übergeordnetes `computed` bildet die Elemente auf `itemDynamicSize[]` ab. Es verwendet vorhandene Cache-Werte und bis zur ersten Messung einen vorläufigen Schätzwert:

```ts
import { afterRenderEffect, Component, computed, ElementRef, inject, Injectable, input, signal, untracked } from '@angular/core';
import { CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { CdkDynamicSizeVirtualScroll, itemDynamicSize } from '@rdlabo/ngx-cdk-scroll-strategies';

type Row = { trackId: string; body: string };
type SizeCache = { trackId: string; itemSize: number };

@Injectable()
export class RowSizeCache {
  readonly entries = signal<SizeCache[]>([]);
}

@Component({
  selector: 'app-measured-row',
  template: `<div class="row">{{ item().body }}</div>`,
  styles: `:host { display: block; } .row { white-space: pre-wrap; padding: 12px; }`,
})
export class MeasuredRow {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly sizes = inject(RowSizeCache);
  readonly item = input.required<Row>();

  constructor() {
    afterRenderEffect((onCleanup) => {
      const trackId = this.item().trackId;
      const element = this.el.nativeElement;
      const measure = () => {
        const itemSize = Math.ceil(element.getBoundingClientRect().height);
        if (itemSize <= 0) return;
        untracked(() => this.sizes.entries.update((cache) => {
          const previous = cache.find((entry) => entry.trackId === trackId);
          if (previous?.itemSize === itemSize) return cache;
          return [...cache.filter((entry) => entry.trackId !== trackId), { trackId, itemSize }];
        }));
      };
      const observer = new ResizeObserver(measure);
      observer.observe(element);
      measure();
      onCleanup(() => observer.disconnect());
    });
  }
}

@Component({
  selector: 'app-scroll-advanced',
  providers: [RowSizeCache],
  styles: `cdk-virtual-scroll-viewport { height: 320px; width: 100%; }`,
  imports: [CdkVirtualScrollViewport, CdkVirtualForOf, CdkDynamicSizeVirtualScroll, MeasuredRow],
  template: `
    <cdk-virtual-scroll-viewport
      [itemDynamicSizes]="dynamicSize()"
      minBufferPx="900"
      maxBufferPx="1350"
    >
      <app-measured-row
        *cdkVirtualFor="let item of items(); trackBy: trackByFn"
        [item]="item"
      />
    </cdk-virtual-scroll-viewport>
  `,
})
export class ScrollAdvancedPage {
  private readonly sizes = inject(RowSizeCache);
  readonly items = signal<Row[]>(
    Array.from({ length: 20 }, (_, index) => ({
      trackId: String(index),
      body: `Row ${index + 1}\n`.repeat(1 + (index % 4)),
    })),
  );
  readonly dynamicSize = computed<itemDynamicSize[]>(() =>
    this.items().map((item) => {
      const cached = this.sizes.entries().find((entry) => entry.trackId === item.trackId)?.itemSize;
      return {
        trackId: item.trackId,
        itemSize: cached ?? 80,
        source: cached === undefined ? 'temporary' : 'cache',
      };
    }),
  );
  trackByFn = (_: number, item: Row) => item.trackId;
}
```

Jeder `itemSize`-Wert muss eine endliche Zahl größer als null bleiben. Verwenden Sie bis zur Messung einen vorläufigen positiven Schätzwert, damit die Längen übereinstimmen, und ersetzen Sie ihn beim Aktualisieren des Caches. Im Demo-Quellcode finden Sie Infinite Scroll, Refresher und Hilfsfunktionen des `DynamicSizeVirtualScrollService`, die denselben Messablauf ergänzen.
