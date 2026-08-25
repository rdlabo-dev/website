---
title: API
---

`@rdlabo/ionic-angular-scroll-header` v21.7.0 が公開するstandalone directiveのリファレンスです。

## Directive

#### `directive` ScrollHeaderDirective

`ion-content` のscroll streamと投影されたHeader elementを接続します。

| Selector                              | Content child  | Description                                          |
| ------------------------------------- | -------------- | ---------------------------------------------------- |
| **`ion-content[rdlaboScrollHeader]`** | `scrollHeader` | IonContentのscroll位置に追従するHeader elementです。 |

#### `directive` VirtualScrollHeaderDirective

CDK Virtual Scroll viewportと投影されたHeader elementを接続し、破棄時にsubscriptionを解除します。

| Selector                                     | Content child   | Description                                          |
| -------------------------------------------- | --------------- | ---------------------------------------------------- |
| **`ion-content[rdlaboVirtualScrollHeader]`** | `virtualScroll` | 監視対象の `CdkVirtualScrollViewport` です。         |
| **`ion-content[rdlaboVirtualScrollHeader]`** | `scrollHeader`  | Virtual Scrollのoffsetに追従するHeader elementです。 |

#### `directive` FixVirtualScrollElementDirective

PackageのCDK Virtual Scroll連携で使用するviewport element補正を適用します。

| Selector                                                         | Description                                             |
| ---------------------------------------------------------------- | ------------------------------------------------------- |
| **`cdk-virtual-scroll-viewport[rdlaboFixVirtualScrollElement]`** | 初期化時にVirtual Scroll viewport elementを補正します。 |
