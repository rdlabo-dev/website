---
title: 'FAQ'
code: []
scrollActiveLine: []
---

### Angular CDK Virtual Scrollは可変・動的なItem Heightに対応していますか？

標準の`[itemSize]`は、すべてのItemが同じ固定Sizeであることを前提にしています。`@rdlabo/ngx-cdk-scroll-strategies`の`[itemDynamicSizes]`を使うと、Itemごとに異なる既知または計測済みの高さを指定できます。

### `autosize`との違いは何ですか？

Angular CDK Experimentalの`autosize`は、描画済みのItemを計測し、その平均Sizeから未計測のItemを推定します。`[itemDynamicSizes]`は、アプリケーションが渡すItemごとのSizeを使ってScroll RangeとOffsetを計算します。

https://github.com/angular/components/blob/main/src/cdk-experimental/scrolling/auto-size-virtual-scroll.ts#L49C3-L59

各Itemの高さが既知、または描画後に計測できる場合は、平均値による推定を避けて正確なScroll Geometryを維持できます。

### Dynamic HeightのViewport自体にも使えますか？

いいえ。このライブラリが扱うのはViewport Containerの高さではなく、Viewport内にある各Itemの可変Heightです。`cdk-virtual-scroll-viewport`自体の高さや`max-height`をContent量に合わせる問題とは別です。
