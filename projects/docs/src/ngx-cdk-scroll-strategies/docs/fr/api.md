---
title: "API"
sourceRevision: "2bf220047960f996876e915ac1be4d8efc7add61286b7abfda6fc71bc918b396"
---
Référence de l’API publique exportée par `@rdlabo/ngx-cdk-scroll-strategies` v22.0.3.

## Directive

#### `directive` CdkDynamicSizeVirtualScroll

Installe la stratégie de tailles dynamiques sur un viewport de défilement virtuel CDK.

| Entrée                  | Type                | Description                                           | Valeur par défaut |
| ---------------------- | ------------------- | ----------------------------------------------------- | ------- |
| **`itemDynamicSizes`** | `itemDynamicSize[]` | Modèle exact de tailles des éléments de la liste.                  | `[]`    |
| **`minBufferPx`**      | `number`            | Tampon restant minimal avant le rendu de nouveaux éléments. | `100`   |
| **`maxBufferPx`**      | `number`            | Tampon cible rendu lors du réapprovisionnement.             | `200`   |
| **`isReverse`**        | `boolean`           | Active le défilement virtuel inversé.                    | `false` |
| **`scrollOffset`**     | `number`            | Décalage normalisé en lecture seule pour le défilement inversé.    |         |

## Classes

#### `class` DynamicSizeVirtualScrollStrategy

Implémente `VirtualScrollStrategy` d’Angular CDK pour les tailles d’éléments connues à l’avance.

| Membre                        | Type                                                   | Description                                                 |
| ----------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| **`constructor`**             | `(itemSize, minBufferPx, maxBufferPx, isReverse)`      | Crée la stratégie avec son modèle de tailles et ses limites de tampon. |
| **`updateItemAndBufferSize`** | `(itemDynamicSize[], number, number, boolean) => void` | Remplace le modèle de tailles et la configuration du tampon.           |
| **`scrollToIndex`**           | `(index: number, behavior: ScrollBehavior) => void`    | Fait défiler jusqu’à un index d’élément.                                   |
| **`scrolledIndexChange`**     | `Observable<number>`                                   | Émet l’index courant du défilement.                         |
| **`measureScrollOffset`**     | `number`                                               | Dernier décalage de défilement normalisé.                              |

#### `class` DynamicSizeVirtualScrollService

Fournit des utilitaires de cycle de vie du viewport, de liaison des hauteurs, d’actualisation et de défilement fluide.

| Membre                         | Type                                                     | Description                                |
| ------------------------------ | -------------------------------------------------------- | ------------------------------------------ |
| **`onInit`**                   | `(viewport, latestScrollOffset) => void`                 | Restaure l’état du viewport.                   |
| **`onDestroy`**                | `(viewport) => number`                                   | Capture le décalage pour une restauration ultérieure. |
| **`getBindDynamicItemHeight`** | `(sizes: Signal<itemDynamicSize[]>) => Signal<string[]>` | Convertit les tailles des éléments en hauteurs CSS.      |
| **`refreshViewport`**          | `(viewport) => void`                                     | Force l’actualisation des dimensions du viewport.     |
| **`scrollToTopSmooth`**        | `(viewport) => Promise<void>`                            | Fait défiler fluidement jusqu’en haut.               |
| **`scrollToPoint`**            | `(viewport, x, y, duration?) => Promise<void>`           | Fait défiler fluidement jusqu’à un point.               |

## Fonctions

#### `function` sumItemSize

`(dynamicSize: itemDynamicSize[], endIndex: number) => number`

Renvoie la taille cumulée de tous les éléments précédant `endIndex`.

#### `function` calculateItemCountForPixelDistance

`(dynamicSize: itemDynamicSize[], itemSizeRange: number, startIndex?: number, isReverse?: boolean) => number`

Convertit une distance en pixels en un nombre fractionnaire exact d’éléments.

#### `function` calcIndex

`(dynamicSize: itemDynamicSize[], itemSizeRange: number, startIndex?: number, isReverse?: boolean) => number`

Calcul de compatibilité avec l’ancienne API. Utilisez `calculateItemCountForPixelDistance` pour des résultats continus.

## Types

#### `interface` itemDynamicSize

| Propriété                  | Type                   | Description                |
| --------------------- | ---------------------- | -------------------------- |
| **`itemSize`**        | `number`               | Taille exacte de l’élément en pixels. |
| **métadonnées de l’application** | `Record<string, string | number>`                   | Champs de suivi facultatifs fournis par l’application. |
