---
title: 'シンプルな使い方'
code: []
scrollActiveLine: []
---

[インストール](/docs/readme#インストール) のあとで使います。

> 各Itemの可変Heightがすでに分かっている場合に使います。

- Demo: https://rdlabo-ionic-angular-library.netlify.app/main/scroll-strategies/simple
- Source: https://github.com/rdlabo-dev/ionic-angular-library/tree/v22.0.3/projects/demo/src/app/scroll-strategies/pages/scroll-simple

ViewportにはグローバルCSSで確定した高さを与えます。

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

行ごとに高さが違うため、スクロールすると表示中のサイズが変わります。`[itemDynamicSizes]` 以外は `@angular/cdk/scrolling` と同じように動作します。
