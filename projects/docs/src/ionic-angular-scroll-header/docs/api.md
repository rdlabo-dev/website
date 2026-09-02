---
title: API
---

Reference for the public standalone directives exported by `@rdlabo/ionic-angular-scroll-header` v22.0.0.

## Directives

#### `directive` ScrollHeaderDirective

Connects an `ion-content` scroll stream to a projected header element.

| Selector                              | Content child  | Description                                                 |
| ------------------------------------- | -------------- | ----------------------------------------------------------- |
| **`ion-content[rdlaboScrollHeader]`** | `scrollHeader` | Header element that follows the IonContent scroll position. |

#### `directive` VirtualScrollHeaderDirective

Connects a CDK virtual-scroll viewport to a projected header element and removes its subscription when destroyed.

| Selector                                     | Content child   | Description                                            |
| -------------------------------------------- | --------------- | ------------------------------------------------------ |
| **`ion-content[rdlaboVirtualScrollHeader]`** | `virtualScroll` | `CdkVirtualScrollViewport` to observe.                 |
| **`ion-content[rdlaboVirtualScrollHeader]`** | `scrollHeader`  | Header element that follows the virtual-scroll offset. |

#### `directive` FixVirtualScrollElementDirective

Applies the viewport element correction used by the package's CDK virtual-scroll integration.

| Selector                                                         | Description                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| **`cdk-virtual-scroll-viewport[rdlaboFixVirtualScrollElement]`** | Corrects the virtual-scroll viewport element during initialization. |
