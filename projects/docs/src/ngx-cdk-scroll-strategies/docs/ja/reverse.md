---
title: 'リバーススクロール'
code: []
scrollActiveLine: []
---

[インストール](/docs/readme#インストール) のあとで使います。

> 可変Item HeightとReverse Virtual Scrollを組み合わせ、WeChatのようなChat UIを実装するデモです。

- Demo: https://rdlabo-ionic-angular-library.netlify.app/main/scroll-strategies/reverse
- Source: https://github.com/rdlabo-dev/ionic-angular-library/tree/v22.0.0/projects/demo/src/app/scroll-strategies/pages/scroll-reverse

リバーススクロールの場合は、`cdk-virtual-scroll-viewport` タグに `isReverse` ディレクティブを追加します。

```html
<cdk-virtual-scroll-viewport
  [itemDynamicSizes]="dynamicSize()"
  [isReverse]="true"
  minBufferPx="900"
  maxBufferPx="1350"
>
  <div class="reverse-items">
    <div
      *cdkVirtualFor="let item of items(); trackBy: trackByFn"
      class="dynamic-item"
      [style.height.px]="item.itemSize"
    >
      itemSize: {{ item.itemSize }}
    </div>
  </div>
</cdk-virtual-scroll-viewport>
```

`styles.css` のようなグローバル CSS ファイルで、`cdk-virtual-scroll-viewport.reverse-scroll` に CSS を追加します。

```css
cdk-virtual-scroll-viewport {
  width: 100%;
  height: 100%;

  /* .reverse-scroll class is added from this directive. */
  &.reverse-scroll {
    display: flex;
    flex-direction: column-reverse;

    .cdk-virtual-scroll-content-wrapper {
      top: auto;
      bottom: 0;
    }
  }
}
```

さらにアイテムのラッパーを追加します。`div.reverse-items` クラスは一例です。自由に決めて構いません。

```css
div.reverse-items {
  height: 100%;
  display: flex;
  flex-direction: column-reverse;

  position: relative;
  bottom: 0;
}
```

**リバーススクロールでは、CdkVirtualScrollViewport の measureScrollOffset は動作しません。このディレクティブの scrollOffset を使ってください。**
https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.0/projects/scroll-strategies/src/lib/dynamic-size-virtual-scroll-strategy.ts

リバースレイアウトはネイティブの負の `scrollTop` 値を使います。`scrollToIndex()` は通常どおり論理的なアイテムインデックスを受け取り、その累積オフセットを内部でネイティブ座標に変換します。

### オプション

このパッケージには、Virtual Scroll での開発を簡単にする Helper Service が含まれています。

```ts
import { DynamicSizeVirtualScrollService } from '@rdlabo/ngx-cdk-scroll-strategies';
```

詳細はこちら: https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.0/projects/scroll-strategies/src/lib/dynamic-size-virtual-scroll.service.ts
