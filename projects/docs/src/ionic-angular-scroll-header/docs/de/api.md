---
title: "API"
sourceRevision: "ae70dc5d9b9d37c6e523ec4615189e715c6afaf619fad30e075347f87e16d78b"
---
Referenz für die von `@rdlabo/ionic-angular-scroll-header` v22.0.3 exportierten öffentlichen Standalone-Direktiven.

## Direktiven

#### `directive` ScrollHeaderDirective

Verbindet den Scroll-Ereignisstrom von `ion-content` mit einem projizierten Header-Element.

| Selektor                              | Inhaltskind  | Beschreibung                                                 |
| ------------------------------------- | -------------- | ----------------------------------------------------------- |
| **`ion-content[rdlaboScrollHeader]`** | `scrollHeader` | Header-Element, das der Scrollposition von IonContent folgt. |

#### `directive` VirtualScrollHeaderDirective

Verbindet einen virtuellen CDK-Scroll-Viewport mit einem projizierten Header-Element und entfernt das Abonnement bei der Zerstörung.

| Selektor                                     | Inhaltskind   | Beschreibung                                            |
| -------------------------------------------- | --------------- | ------------------------------------------------------ |
| **`ion-content[rdlaboVirtualScrollHeader]`** | `virtualScroll` | Zu beobachtender `CdkVirtualScrollViewport`.                 |
| **`ion-content[rdlaboVirtualScrollHeader]`** | `scrollHeader`  | Header-Element, das dem virtuellen Scrollversatz folgt. |

#### `directive` FixVirtualScrollElementDirective

Wendet die in der virtuellen CDK-Scroll-Integration des Pakets verwendete Korrektur des Viewport-Elements an.

| Selektor                                                         | Beschreibung                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| **`cdk-virtual-scroll-viewport[rdlaboFixVirtualScrollElement]`** | Korrigiert das virtuelle Scroll-Viewport-Element während der Initialisierung. |
