---
title: 'はじめに'
code: []
scrollActiveLine: []
---

> 可変・動的なItem Heightに対応するAngular CDK Virtual Scroll。

## 概要

`@rdlabo/ngx-cdk-scroll-strategies` は、可変・動的なItem Heightを扱うAngular CDK Virtual Scroll Strategyです。Virtual Scrollで使う配列の各Item Sizeを個別に指定し、高さが異なるListを正確なScroll Geometryで描画できます。

固定の`[itemSize]`や、`[autosize]`による平均Item Sizeの推定の代わりに、`[itemDynamicSizes]`へ既知または計測した高さを渡します。`@angular/cdk/scrolling`で動作し、Ionicには依存しません。

## このStrategyが適するケース

- List ItemやRowごとに高さが異なる
- Text、Image、展開状態などから動的なItem Heightを計算または計測できる
- Variable Heightでも`scrollToIndex`やScroll Positionを正確に扱いたい
- Chat UIのようなReverse Virtual Scrollを実装したい

Item Heightが事前に分からない場合は、[応用的な使い方](/docs/advanced)のように計測した値を渡します。未知のDOM Heightをすべて自動検出するDrop-in Strategyではありません。

Angular CDKで可変HeightのVirtual Scrollを構成する基本形は次のとおりです。

```html
<cdk-virtual-scroll-viewport
  [itemDynamicSizes]="[{ itemSize: 100 } , { itemSize: 80} , { itemSize: 90 } , { itemSize: 100}]"
>
  <div *cdkVirtualFor="let item of [100, 80, 90, 100]; trackBy: trackByFn" [style.height.px]="item">
    itemSize: {{ item }}
  </div>
</cdk-virtual-scroll-viewport>
```

`[itemSize]` や `[autosize]` の代わりに `[itemDynamicSizes]` directiveを使います。値の型は `itemDynamicSize[]` です。

すべてのデータアイテムに対し、同じ順序で対応する `itemDynamicSizes` のエントリが 1 つ必要です。各 `itemSize` は 0 より大きい有限の数値でなければなりません。Angular がデータとサイズのシグナルを別ターンで更新した場合、ストラテジーは長さが一致するまで最後の完全なジオメトリを保持し、未知の高さは推定しません。

このLibraryは主に[Virtual scrolling of content with variable height with Angular](https://dev.to/georgii/virtual-scrolling-of-content-with-variable-height-with-angular-3a52)を基にしています。

## 機能

### 目的から選ぶ

| 目的 | ガイド |
| --- | --- |
| 各アイテムの高さを指定する | [シンプルな使い方](/docs/simple) |
| アイテムコンポーネントの高さを測る | [応用的な使い方](/docs/advanced) |
| チャット型のリバーススクロール | [リバーススクロール](/docs/reverse) |

## クイックスタート

[インストール](#インストール) のあと、`[itemSize]` の代わりに `[itemDynamicSizes]` をバインドします。[シンプルな使い方](/docs/simple) を見てください。

## インストール

```bash
npm install @rdlabo/ngx-cdk-scroll-strategies
```


## ドキュメント

上の [インストール](#インストール) から始め、ガイドを選んでください。

- [シンプルな使い方](/docs/simple) — アイテムごとの高さ。
- [応用的な使い方](/docs/advanced) — 計測したアイテムコンポーネント。
- [リバーススクロール](/docs/reverse) — チャット型リスト。
- [FAQ](/docs/faq) — `autosize` を使わない理由。
