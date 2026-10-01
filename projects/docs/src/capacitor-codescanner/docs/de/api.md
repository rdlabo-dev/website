---
title: "API"
sourceRevision: "cf8b5c2aca340a50a3101fb66911664d555ebe3ecc4db163c8d6943535bf86e8"
---
* [`present(...)`](#present)
* [`addListener('CodeScannerCatchEvent', ...)`](#addlistenercodescannercatchevent-)
* [Schnittstellen](#interfaces)
* [Typaliase](#type-aliases)

<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### present(...)

```typescript
present(scannerOption: ScannerOption) => Promise<void>
```

| Parameter               | Typ                                                    |
| ------------------- | ------------------------------------------------------- |
| **`scannerOption`** | <code><a href="#scanneroption">ScannerOption</a></code> |

--------------------

### addListener('CodeScannerCatchEvent', ...)

```typescript
addListener(eventName: 'CodeScannerCatchEvent', listenerFunc: (event: { code: string; }) => void) => Promise<PluginListenerHandle>
```

| Parameter              | Typ                                               |
| ------------------ | -------------------------------------------------- |
| **`eventName`**    | <code>'CodeScannerCatchEvent'</code>               |
| **`listenerFunc`** | <code>(event: { code: string; }) =&gt; void</code> |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------

### Schnittstellen

#### ScannerOption

| Eigenschaft                    | Typ                               | Beschreibung                                                                                                                     |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **`detectionWidth`**    | <code>number</code>                | Breite des Erkennungsbereichs im Verhältnis zur verfügbaren Breite (0–1). Der Standardwert ist 0,4.                                              |
| **`detectionHeight`**   | <code>number</code>                | Höhe des Erkennungsbereichs im Verhältnis zur Erkennungsbreite. Der Standardwert unter iOS ist 1; unter Android sind 0,15–0,2 üblich.              |
| **`enableCloseButton`** | <code>boolean</code>               | Schließen-Schaltfläche oben links im Scanbereich aktivieren (Standard: true)                                                        |
| **`sheetScreenRatio`**  | <code>number</code>                | Verhältnis des Scanbereichs (Größe des Sheet-Modals) zur Bildschirmgröße festlegen. Der Standardwert ist 0,9 unter Android und 1 (pageSheet) unter iOS. |
| **`CodeTypes`**         | <code>MetadataObjectTypes[]</code> | Zu erkennende Codetypen festlegen (Standard: ["qr", "code39", "ean13"])                                                    |
| **`isMulti`**           | <code>boolean</code>               | Mehrfachscan-Modus aktivieren (Standard: false)                                                                                         |
| **`enableAutoLight`**   | <code>boolean</code>               | Automatische Beleuchtung bei Dunkelheit aktivieren (Standard: true)                                                                      |

#### PluginListenerHandle

| Eigenschaft         | Typ                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

### Typaliase

#### MetadataObjectTypes

<code>'aztec' | 'code128' | 'code39' | 'code39Mod43' | 'code93' | 'dataMatrix' | 'ean13' | 'ean8' | 'face' | 'interleaved2of5' | 'itf14' | 'pdf417' | 'qr' | 'upce' | 'catBody' | 'dogBody' | 'humanBody' | 'salientObject'</code>
