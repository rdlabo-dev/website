---
title: '応用的な使い方'
code: []
scrollActiveLine: []
---

[インストール](/docs/readme#インストール) のあとで使います。[シンプルな使い方](/docs/simple) のViewport、CDK import、`trackBy`、サイズモデルの規則を引き継ぎ、既知の `itemSize` を計測値へ置き換えます。

> 各Scroll Itemを別Componentにして高さを測り、その結果を `[itemDynamicSizes]` を駆動するサイズモデルへ書き戻します。

- Demo: https://rdlabo-ionic-angular-library.netlify.app/main/scroll-strategies/advanced
- Source: https://github.com/rdlabo-dev/ionic-angular-library/tree/v22.0.0/projects/demo/src/app/scroll-strategies/pages/scroll-advanced

`trackId` をキーにした計測cacheを保持します。Itemの描画後に高さを読み、cacheを更新します。親の `computed` がItemを `itemDynamicSize[]` へ写像し、cacheがあればそれを使い、初回計測までは一時的な見積りを置きます。

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

各 `itemSize` は 0 より大きい有限の数値のままにしてください。計測が来るまでは長さを揃えるために一時的な正の見積りを渡し、cache更新で置き換えます。この計測の流れの周辺にあるInfinite Scroll、Refresher、`DynamicSizeVirtualScrollService` の補助はdemo sourceを参照してください。
