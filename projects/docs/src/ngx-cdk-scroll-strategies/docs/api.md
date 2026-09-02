---
title: API
---

Reference for the public API exported by `@rdlabo/ngx-cdk-scroll-strategies` v22.0.0.

## Directive

#### `directive` CdkDynamicSizeVirtualScroll

Installs the dynamic-size strategy on a CDK virtual-scroll viewport.

| Input                  | Type                | Description                                           | Default |
| ---------------------- | ------------------- | ----------------------------------------------------- | ------- |
| **`itemDynamicSizes`** | `itemDynamicSize[]` | Exact size model for the list items.                  | `[]`    |
| **`minBufferPx`**      | `number`            | Minimum remaining buffer before rendering more items. | `100`   |
| **`maxBufferPx`**      | `number`            | Target buffer rendered when replenishing.             | `200`   |
| **`isReverse`**        | `boolean`           | Enables reverse virtual scrolling.                    | `false` |
| **`scrollOffset`**     | `number`            | Read-only normalized offset for reverse scrolling.    |         |

## Classes

#### `class` DynamicSizeVirtualScrollStrategy

Implements Angular CDK `VirtualScrollStrategy` for item sizes known in advance.

| Member                        | Type                                                   | Description                                                 |
| ----------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| **`constructor`**             | `(itemSize, minBufferPx, maxBufferPx, isReverse)`      | Creates the strategy with its size model and buffer limits. |
| **`updateItemAndBufferSize`** | `(itemDynamicSize[], number, number, boolean) => void` | Replaces the size model and buffer configuration.           |
| **`scrollToIndex`**           | `(index: number, behavior: ScrollBehavior) => void`    | Scrolls to an item index.                                   |
| **`scrolledIndexChange`**     | `Observable<number>`                                   | Emits the currently scrolled index.                         |
| **`measureScrollOffset`**     | `number`                                               | Last normalized scroll offset.                              |

#### `class` DynamicSizeVirtualScrollService

Provides viewport lifecycle, item-height binding, refresh, and smooth-scroll helpers.

| Member                         | Type                                                     | Description                                |
| ------------------------------ | -------------------------------------------------------- | ------------------------------------------ |
| **`onInit`**                   | `(viewport, latestScrollOffset) => void`                 | Restores viewport state.                   |
| **`onDestroy`**                | `(viewport) => number`                                   | Captures the offset for later restoration. |
| **`getBindDynamicItemHeight`** | `(sizes: Signal<itemDynamicSize[]>) => Signal<string[]>` | Converts item sizes into CSS heights.      |
| **`refreshViewport`**          | `(viewport) => void`                                     | Forces viewport dimensions to refresh.     |
| **`scrollToTopSmooth`**        | `(viewport) => Promise<void>`                            | Smoothly scrolls to the top.               |
| **`scrollToPoint`**            | `(viewport, x, y, duration?) => Promise<void>`           | Smoothly scrolls to a point.               |

## Functions

#### `function` sumItemSize

`(dynamicSize: itemDynamicSize[], endIndex: number) => number`

Returns the cumulative size of all items before `endIndex`.

#### `function` calculateItemCountForPixelDistance

`(dynamicSize: itemDynamicSize[], itemSizeRange: number, startIndex?: number, isReverse?: boolean) => number`

Converts a pixel distance into an exact fractional item count.

#### `function` calcIndex

`(dynamicSize: itemDynamicSize[], itemSizeRange: number, startIndex?: number, isReverse?: boolean) => number`

Legacy compatibility calculation. Use `calculateItemCountForPixelDistance` for continuous results.

## Types

#### `interface` itemDynamicSize

| Prop                  | Type                   | Description                |
| --------------------- | ---------------------- | -------------------------- |
| **`itemSize`**        | `number`               | Exact item size in pixels. |
| **consumer metadata** | `Record<string, string | number>`                   | Optional tracking fields supplied by the consumer. |
