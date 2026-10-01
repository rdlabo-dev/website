---
title: "API"
sourceRevision: "2bf220047960f996876e915ac1be4d8efc7add61286b7abfda6fc71bc918b396"
---
Referenz der öffentlichen API, die `@rdlabo/ngx-cdk-scroll-strategies` v22.0.3 exportiert.

## Direktive

#### `directive` CdkDynamicSizeVirtualScroll

Installiert die Strategie für dynamische Größen auf einem CDK-Viewport für virtuelles Scrollen.

| Eingabe                  | Typ                | Beschreibung                                           | Standard |
| ---------------------- | ------------------- | ----------------------------------------------------- | ------- |
| **`itemDynamicSizes`** | `itemDynamicSize[]` | Exaktes Größenmodell für die Listenelemente.                  | `[]`    |
| **`minBufferPx`**      | `number`            | Minimaler verbleibender Puffer, bevor weitere Elemente gerendert werden. | `100`   |
| **`maxBufferPx`**      | `number`            | Zielpuffer, der beim Auffüllen gerendert wird.             | `200`   |
| **`isReverse`**        | `boolean`           | Aktiviert umgekehrtes virtuelles Scrollen.                    | `false` |
| **`scrollOffset`**     | `number`            | Schreibgeschützter normalisierter Versatz für umgekehrtes Scrollen.    |         |

## Klassen

#### `class` DynamicSizeVirtualScrollStrategy

Implementiert `VirtualScrollStrategy` des Angular CDK für im Voraus bekannte Elementgrößen.

| Mitglied                        | Typ                                                   | Beschreibung                                                 |
| ----------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| **`constructor`**             | `(itemSize, minBufferPx, maxBufferPx, isReverse)`      | Erstellt die Strategie mit ihrem Größenmodell und den Puffergrenzen. |
| **`updateItemAndBufferSize`** | `(itemDynamicSize[], number, number, boolean) => void` | Ersetzt das Größenmodell und die Pufferkonfiguration.           |
| **`scrollToIndex`**           | `(index: number, behavior: ScrollBehavior) => void`    | Scrollt zu einem Elementindex.                                   |
| **`scrolledIndexChange`**     | `Observable<number>`                                   | Gibt den Index des aktuell gescrollten Elements aus.                         |
| **`measureScrollOffset`**     | `number`                                               | Letzter normalisierter Scrollversatz.                              |

#### `class` DynamicSizeVirtualScrollService

Bietet Hilfsfunktionen für den Viewport-Lebenszyklus, die Bindung von Elementhöhen, Aktualisierungen und sanftes Scrollen.

| Mitglied                         | Typ                                                     | Beschreibung                                |
| ------------------------------ | -------------------------------------------------------- | ------------------------------------------ |
| **`onInit`**                   | `(viewport, latestScrollOffset) => void`                 | Stellt den Viewport-Zustand wieder her.                   |
| **`onDestroy`**                | `(viewport) => number`                                   | Speichert den Versatz für eine spätere Wiederherstellung. |
| **`getBindDynamicItemHeight`** | `(sizes: Signal<itemDynamicSize[]>) => Signal<string[]>` | Wandelt Elementgrößen in CSS-Höhen um.      |
| **`refreshViewport`**          | `(viewport) => void`                                     | Erzwingt die Aktualisierung der Viewport-Abmessungen.     |
| **`scrollToTopSmooth`**        | `(viewport) => Promise<void>`                            | Scrollt sanft zum Anfang.               |
| **`scrollToPoint`**            | `(viewport, x, y, duration?) => Promise<void>`           | Scrollt sanft zu einer Position.               |

## Funktionen

#### `function` sumItemSize

`(dynamicSize: itemDynamicSize[], endIndex: number) => number`

Gibt die kumulierte Größe aller Elemente vor `endIndex` zurück.

#### `function` calculateItemCountForPixelDistance

`(dynamicSize: itemDynamicSize[], itemSizeRange: number, startIndex?: number, isReverse?: boolean) => number`

Wandelt eine Pixeldistanz in eine exakte, gegebenenfalls gebrochene Elementanzahl um.

#### `function` calcIndex

`(dynamicSize: itemDynamicSize[], itemSizeRange: number, startIndex?: number, isReverse?: boolean) => number`

Berechnung für die Kompatibilität mit älteren Versionen. Verwenden Sie `calculateItemCountForPixelDistance` für kontinuierliche Ergebnisse.

## Typen

#### `interface` itemDynamicSize

| Eigenschaft                  | Typ                   | Beschreibung                |
| --------------------- | ---------------------- | -------------------------- |
| **`itemSize`**        | `number`               | Exakte Elementgröße in Pixeln. |
| **Metadaten der nutzenden Anwendung** | `Record<string, string | number>`                   | Optionale Tracking-Felder, die von der nutzenden Anwendung bereitgestellt werden. |
