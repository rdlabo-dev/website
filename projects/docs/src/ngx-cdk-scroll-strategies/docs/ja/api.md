---
title: API
---

`@rdlabo/ngx-cdk-scroll-strategies` v21.7.0 が公開するAPIのリファレンスです。

## Directive

#### `directive` CdkDynamicSizeVirtualScroll

CDK Virtual Scroll viewportにDynamic Size Strategyを設定します。

| Input                  | Type                | Description                                          | Default |
| ---------------------- | ------------------- | ---------------------------------------------------- | ------- |
| **`itemDynamicSizes`** | `itemDynamicSize[]` | List itemの正確なsize modelです。                    | `[]`    |
| **`minBufferPx`**      | `number`            | Itemを追加描画するまでの最小bufferです。             | `100`   |
| **`maxBufferPx`**      | `number`            | 追加描画時に確保するbufferです。                     | `200`   |
| **`isReverse`**        | `boolean`           | Reverse Virtual Scrollを有効にします。               | `false` |
| **`scrollOffset`**     | `number`            | Reverse Scroll向けに正規化したread-only offsetです。 |         |

## Class

#### `class` DynamicSizeVirtualScrollStrategy

事前にsizeが分かっているitem向けのAngular CDK `VirtualScrollStrategy` 実装です。

| Member                        | Type                                                   | Description                                  |
| ----------------------------- | ------------------------------------------------------ | -------------------------------------------- |
| **`constructor`**             | `(itemSize, minBufferPx, maxBufferPx, isReverse)`      | Size modelとbuffer設定を指定して生成します。 |
| **`updateItemAndBufferSize`** | `(itemDynamicSize[], number, number, boolean) => void` | Size modelとbuffer設定を置き換えます。       |
| **`scrollToIndex`**           | `(index: number, behavior: ScrollBehavior) => void`    | 指定したitem indexへscrollします。           |
| **`scrolledIndexChange`**     | `Observable<number>`                                   | 現在のscroll indexを通知します。             |
| **`measureScrollOffset`**     | `number`                                               | 最後に正規化したscroll offsetです。          |

#### `class` DynamicSizeVirtualScrollService

Viewport lifecycle、item height binding、refresh、smooth scrollのhelperを提供します。

| Member                         | Type                                                     | Description                         |
| ------------------------------ | -------------------------------------------------------- | ----------------------------------- |
| **`onInit`**                   | `(viewport, latestScrollOffset) => void`                 | Viewportの状態を復元します。        |
| **`onDestroy`**                | `(viewport) => number`                                   | 後で復元するoffsetを取得します。    |
| **`getBindDynamicItemHeight`** | `(sizes: Signal<itemDynamicSize[]>) => Signal<string[]>` | Item sizeをCSS heightへ変換します。 |
| **`refreshViewport`**          | `(viewport) => void`                                     | Viewportの寸法を強制更新します。    |
| **`scrollToTopSmooth`**        | `(viewport) => Promise<void>`                            | 先頭へsmooth scrollします。         |
| **`scrollToPoint`**            | `(viewport, x, y, duration?) => Promise<void>`           | 指定位置へsmooth scrollします。     |

## Function

#### `function` sumItemSize

`(dynamicSize: itemDynamicSize[], endIndex: number) => number`

`endIndex` より前にある全itemの累積sizeを返します。

#### `function` calculateItemCountForPixelDistance

`(dynamicSize: itemDynamicSize[], itemSizeRange: number, startIndex?: number, isReverse?: boolean) => number`

Pixel距離を正確な小数item数へ変換します。

#### `function` calcIndex

`(dynamicSize: itemDynamicSize[], itemSizeRange: number, startIndex?: number, isReverse?: boolean) => number`

互換性維持用の旧計算です。連続値には `calculateItemCountForPixelDistance` を使います。

## Type

#### `interface` itemDynamicSize

| Prop                  | Type                   | Description                      |
| --------------------- | ---------------------- | -------------------------------- |
| **`itemSize`**        | `number`               | Pixel単位の正確なitem sizeです。 |
| **consumer metadata** | `Record<string, string | number>`                         | Consumerが指定できる任意のtracking fieldです。 |
