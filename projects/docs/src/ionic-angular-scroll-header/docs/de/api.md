---
title: "API"
sourceRevision: "184d47ec4fadad7439d2d15f8bf2b864df1a0b2c5e04d244383ecae796699f31"
---
Referenz für die von `@rdlabo/ionic-angular-scroll-header` v22.0.6 exportierten öffentlichen Standalone-Direktiven.

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
