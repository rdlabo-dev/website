---
title: "Utilisation avancée"
sourceRevision: "9a27ed2eae6a0a600c54b7d54c45fdb8d35ee526b85184245393a008acb20b82"
---
Faites-le après l’[installation](../README.md#installation). Réutilisez le viewport, les importations CDK, `trackBy` et les règles du modèle de tailles de [Utilisation simple](./simple.md). Remplacez les valeurs `itemSize` connues par les hauteurs mesurées.

> Mesurez chaque élément de défilement dans un composant distinct, puis écrivez le résultat dans le modèle de tailles qui alimente `[itemDynamicSizes]`.

- Démonstration : https://rdlabo-ionic-angular-library.netlify.app/main/scroll-strategies/advanced
- Code source : https://github.com/rdlabo-dev/ionic-angular-library/tree/v22.0.3/projects/demo/src/app/scroll-strategies/pages/scroll-advanced

Conservez un cache de mesures indexé par `trackId`. Après le rendu de l’élément, lisez sa hauteur et mettez le cache à jour. Un `computed` parent transforme les éléments en `itemDynamicSize[]`, en utilisant le cache lorsqu’il est disponible et une estimation temporaire jusqu’à la première mesure :

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

Chaque `itemSize` doit rester un nombre fini strictement positif. Avant la mesure, transmettez une estimation temporaire positive afin que les longueurs restent alignées ; remplacez-la à la mise à jour du cache. Consultez le code source de la démonstration pour les utilitaires Infinite Scroll, refresher et `DynamicSizeVirtualScrollService` autour de ce même processus de mesure.
