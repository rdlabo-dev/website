---
title: "API"
sourceRevision: "cf8b5c2aca340a50a3101fb66911664d555ebe3ecc4db163c8d6943535bf86e8"
---
* [`present(...)`](#present)
* [`addListener('CodeScannerCatchEvent', ...)`](#addlistenercodescannercatchevent-)
* [Interfaces](#interfaces)
* [Alias de types](#type-aliases)

<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### present(...)

```typescript
present(scannerOption: ScannerOption) => Promise<void>
```

| Paramètre               | Type                                                    |
| ------------------- | ------------------------------------------------------- |
| **`scannerOption`** | <code><a href="#scanneroption">ScannerOption</a></code> |

--------------------

### addListener('CodeScannerCatchEvent', ...)

```typescript
addListener(eventName: 'CodeScannerCatchEvent', listenerFunc: (event: { code: string; }) => void) => Promise<PluginListenerHandle>
```

| Paramètre              | Type                                               |
| ------------------ | -------------------------------------------------- |
| **`eventName`**    | <code>'CodeScannerCatchEvent'</code>               |
| **`listenerFunc`** | <code>(event: { code: string; }) =&gt; void</code> |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------

### Interfaces

#### ScannerOption

| Propriété                    | Type                               | Description                                                                                                                     |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **`detectionWidth`**    | <code>number</code>                | Largeur de la zone de détection par rapport à la largeur disponible, de 0 à 1. Valeur par défaut : 0.4.                                              |
| **`detectionHeight`**   | <code>number</code>                | Hauteur de la zone de détection par rapport à sa largeur. Valeur par défaut : 1 sur iOS ; une valeur de 0.15 à 0.2 est courante sur Android.              |
| **`enableCloseButton`** | <code>boolean</code>               | Active le bouton de fermeture en haut à gauche de la zone de lecture (valeur par défaut : true)                                                        |
| **`sheetScreenRatio`**  | <code>number</code>                | Définit le rapport entre la zone de lecture, c’est-à-dire la taille de la fenêtre modale, et la taille de l’écran. Valeur par défaut : 0.9 sur Android et 1 (pageSheet) sur iOS. |
| **`CodeTypes`**         | <code>MetadataObjectTypes[]</code> | Définit les types de codes à reconnaître (valeur par défaut : ["qr", "code39", "ean13"])                                                    |
| **`isMulti`**           | <code>boolean</code>               | Active le mode de lecture multiple (valeur par défaut : false)                                                                                         |
| **`enableAutoLight`**   | <code>boolean</code>               | Active l’éclairage automatique dans un environnement sombre (valeur par défaut : true)                                                                      |

#### PluginListenerHandle

| Propriété         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

### Alias de types

#### MetadataObjectTypes

<code>'aztec' | 'code128' | 'code39' | 'code39Mod43' | 'code93' | 'dataMatrix' | 'ean13' | 'ean8' | 'face' | 'interleaved2of5' | 'itf14' | 'pdf417' | 'qr' | 'upce' | 'catBody' | 'dogBody' | 'humanBody' | 'salientObject'</code>
