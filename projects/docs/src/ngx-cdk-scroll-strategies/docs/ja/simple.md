---
title: 'シンプルな使い方'
code: []
scrollActiveLine: []
---

[インストール](/docs/readme#インストール) のあとで使います。

> 各Itemの可変Heightがすでに分かっている場合に使う、Angular CDK Virtual Scrollの基本例です。

- Demo: https://rdlabo-ionic-angular-library.netlify.app/main/scroll-strategies/simple
- Source: https://github.com/rdlabo-dev/ionic-angular-library/tree/v21.7.0/projects/demo/src/app/scroll-strategies/pages/scroll-simple

```ts
import { CdkDynamicSizeVirtualScroll, itemDynamicSize } from '@rdlabo/ngx-cdk-scroll-strategies';

@Component({
  ...
  imports: [
    CdkDynamicSizeVirtualScroll
  ],
})
export class ScrollStrategiesPage implements OnInit {
  readonly items = signal<itemDynamicSize[]>([]);
  readonly dynamicSize = computed<itemDynamicSize[]>(() => {
    return this.items().map((item) => ({ trackId: item.trackId, itemSize: item.itemSize }));
  });
}
```

```html
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
```

それ以外は `@angular/cdk/scrolling` と同じように動作します。
