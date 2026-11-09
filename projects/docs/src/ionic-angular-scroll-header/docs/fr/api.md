---
title: "API"
sourceRevision: "5bc03048c89680c40ff2c25b53869576084e64c9abbfc164182e9b97f4393de9"
---
Référence des directives standalone publiques exportées par `@rdlabo/ionic-angular-scroll-header` v22.0.7.

## Directives

#### `directive` ScrollHeaderDirective

Relie le flux de défilement d’un `ion-content` à un élément d’en-tête projeté.

| Sélecteur                              | Enfant du contenu  | Description                                                 |
| ------------------------------------- | -------------- | ----------------------------------------------------------- |
| **`ion-content[rdlaboScrollHeader]`** | `scrollHeader` | Élément d’en-tête qui suit la position de défilement d’IonContent. |

#### `directive` VirtualScrollHeaderDirective

Relie un viewport de défilement virtuel CDK à un élément d’en-tête projeté et supprime son abonnement à sa destruction.

| Sélecteur                                     | Enfant du contenu   | Description                                            |
| -------------------------------------------- | --------------- | ------------------------------------------------------ |
| **`ion-content[rdlaboVirtualScrollHeader]`** | `virtualScroll` | `CdkVirtualScrollViewport` à observer.                 |
| **`ion-content[rdlaboVirtualScrollHeader]`** | `scrollHeader`  | Élément d’en-tête qui suit le décalage de défilement virtuel. |

#### `directive` FixVirtualScrollElementDirective

Applique la correction de l’élément viewport utilisée par l’intégration du défilement virtuel CDK du package.

| Sélecteur                                                         | Description                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| **`cdk-virtual-scroll-viewport[rdlaboFixVirtualScrollElement]`** | Corrige l’élément viewport de défilement virtuel lors de l’initialisation. |
