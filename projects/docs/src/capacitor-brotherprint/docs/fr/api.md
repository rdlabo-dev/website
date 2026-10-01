---
title: "API"
sourceRevision: "c35774f0e6362afaa778d676b06476131fe6756382de9f6ae9de263a678f82c2"
---
* [`printImage(...)`](#printimage)
* [`search(...)`](#search)
* [`isChannelAvailable(...)`](#ischannelavailable)
* [`cancelSearchWiFiPrinter()`](#cancelsearchwifiprinter)
* [`cancelSearchBluetoothPrinter()`](#cancelsearchbluetoothprinter)
* [`addListener(BrotherPrintEventsEnum.onPrinterAvailable, ...)`](#addlistenerbrotherprinteventsenumonprinteravailable-)
* [`addListener(BrotherPrintEventsEnum.onPrint, ...)`](#addlistenerbrotherprinteventsenumonprint-)
* [`addListener(BrotherPrintEventsEnum.onPrintFailedCommunication, ...)`](#addlistenerbrotherprinteventsenumonprintfailedcommunication-)
* [`addListener(BrotherPrintEventsEnum.onPrintError, ...)`](#addlistenerbrotherprinteventsenumonprinterror-)
* [Interfaces](#interfaces)
* [Alias de types](#type-aliases)
* [Énumérations](#enums)

<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### printImage(...)

```typescript
printImage(options: BRLMPrintOptions) => Promise<void>
```

| Paramètre         | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code><a href="#brlmprintoptions">BRLMPrintOptions</a></code> |

--------------------

### search(...)

```typescript
search(option: BRLMSearchOption) => Promise<void>
```

Recherche des imprimantes. Si aucune n’est trouvée, renvoie un tableau vide, sans erreur.

| Paramètre        | Type                                                          |
| ------------ | ------------------------------------------------------------- |
| **`option`** | <code><a href="#brlmsearchoption">BRLMSearchOption</a></code> |

--------------------

### isChannelAvailable(...)

```typescript
isChannelAvailable(option: BRLMChannelResult) => Promise<isChannelAvailableResult>
```

Si vous avez conservé le dernier <a href="#brlmchannelresult">BRLMChannelResult</a> connecté, vous pouvez l’utiliser pour vérifier s’il est encore utilisable.

| Paramètre        | Type                                                            |
| ------------ | --------------------------------------------------------------- |
| **`option`** | <code><a href="#brlmchannelresult">BRLMChannelResult</a></code> |

**Retour :** <code>Promise&lt;<a href="#ischannelavailableresult">isChannelAvailableResult</a>&gt;</code>

--------------------

### cancelSearchWiFiPrinter()

```typescript
cancelSearchWiFiPrinter() => Promise<void>
```

Arrête une recherche en cours avant son délai d’expiration, notamment lorsque l’utilisateur quitte l’écran.

--------------------

### cancelSearchBluetoothPrinter()

```typescript
cancelSearchBluetoothPrinter() => Promise<void>
```

Arrête une recherche en cours avant son délai d’expiration, notamment lorsque l’utilisateur quitte l’écran.

--------------------

### addListener(BrotherPrintEventsEnum.onPrinterAvailable, ...)

```typescript
addListener(eventName: BrotherPrintEventsEnum.onPrinterAvailable, listenerFunc: (printers: BRLMChannelResult) => void) => Promise<PluginListenerHandle>
```

Signale une imprimante pouvant se connecter à l’appareil.

| Paramètre              | Type                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#brotherprinteventsenum">BrotherPrintEventsEnum.onPrinterAvailable</a></code> |
| **`listenerFunc`** | <code>(printers: <a href="#brlmchannelresult">BRLMChannelResult</a>) =&gt; void</code>       |

**Retour :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------

### addListener(BrotherPrintEventsEnum.onPrint, ...)

```typescript
addListener(eventName: BrotherPrintEventsEnum.onPrint, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Événement indiquant la réussite de l’impression

| Paramètre              | Type                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#brotherprinteventsenum">BrotherPrintEventsEnum.onPrint</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                        |

**Retour :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------

### addListener(BrotherPrintEventsEnum.onPrintFailedCommunication, ...)

```typescript
addListener(eventName: BrotherPrintEventsEnum.onPrintFailedCommunication, listenerFunc: (info: ErrorInfo) => void) => Promise<PluginListenerHandle>
```

La connexion à l’imprimante a échoué. Exemples : Bluetooth désactivé, imprimante éteinte, etc.

| Paramètre              | Type                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#brotherprinteventsenum">BrotherPrintEventsEnum.onPrintFailedCommunication</a></code> |
| **`listenerFunc`** | <code>(info: <a href="#errorinfo">ErrorInfo</a>) =&gt; void</code>                                   |

**Retour :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------

### addListener(BrotherPrintEventsEnum.onPrintError, ...)

```typescript
addListener(eventName: BrotherPrintEventsEnum.onPrintError, listenerFunc: (info: ErrorInfo) => void) => Promise<PluginListenerHandle>
```

L’impression a échoué.

| Paramètre              | Type                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#brotherprinteventsenum">BrotherPrintEventsEnum.onPrintError</a></code> |
| **`listenerFunc`** | <code>(info: <a href="#errorinfo">ErrorInfo</a>) =&gt; void</code>                     |

**Retour :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------

### Interfaces

#### PluginListenerHandle

| Propriété         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

### Alias de types

#### BRLMPrintOptions

<code>{ encodedImage: string; /** * Should use enum <a href="#brlmprintermodelname">BRLMPrinterModelName</a> */ modelName: <a href="#brlmprintermodelname">BRLMPrinterModelName</a>; } & <a href="#partial">Partial</a>&lt;<a href="#brlmchannelresult">BRLMChannelResult</a>&gt; & (<a href="#brlmprinterqlmodelsettings">BRLMPrinterQLModelSettings</a> | <a href="#brlmprintertdmodelsettings">BRLMPrinterTDModelSettings</a>)</code>

#### Partial

Rend facultatives toutes les propriétés de T

<code>{
 [P in keyof T]?: T[P];
 }</code>

#### BRLMChannelResult

<code>{ port: <a href="#brlmprinterport">BRLMPrinterPort</a>; modelName: string; serialNumber: string; macAddress: string; nodeName: string; location: string; /** * This need to connect to the printer. * wifi: IP Address * bluetooth: macAddress * bluetoothLowEnergy: modelName for bluetoothLowEnergy */ channelInfo: string; }</code>

#### BRLMPrinterQLModelSettings

<code>{ /** * Should use enum <a href="#brlmprinterlabelname">BRLMPrinterLabelName</a> */ labelName: <a href="#brlmprinterlabelname">BRLMPrinterLabelName</a>; } & <a href="#brlmprintersettings">BRLMPrinterSettings</a></code>

#### BRLMPrinterSettings

Ces paramètres sont facultatifs. S’ils ne sont pas définis, l’imprimante leur attribue des valeurs par défaut.

<code>{ /** * The number of copies you print. */ numberOfCopies?: <a href="#brlmprinternumberofcopies">BRLMPrinterNumberOfCopies</a>; /** * Whether the auto-cut is enabled or not. If true, your printer cut the paper each page. */ autoCut?: <a href="#brlmprinterautocuttype">BRLMPrinterAutoCutType</a>; /** * A scale mode that specifies how your data is scaled in a print area of your printer. */ scaleMode?: <a href="#brlmprinterscalemode">BRLMPrinterScaleMode</a>; /** * A scale value. This is effective when ScaleMode is ScaleValue. */ scaleValue?: <a href="#brlmprinterscalevaluetype">BRLMPrinterScaleValueType</a>; /** * A way to rasterize your data. */ halftone?: <a href="#brlmprinterhalftone">BRLMPrinterHalftone</a>; /** * A threshold value. This is effective when the Halftone is Threshold. */ halftoneThreshold?: <a href="#brlmprinterhalftonethresholdtype">BRLMPrinterHalftoneThresholdType</a>; /** * An image rotation that specifies the angle in which your data is placed in the print area. Rotation direction is clockwise. */ imageRotation?: <a href="#brlmprinterimagerotation">BRLMPrinterImageRotation</a>; /** * A vertical alignment that specifies how your data is placed in the printable area. */ verticalAlignment?: <a href="#brlmprinterverticalalignment">BRLMPrinterVerticalAlignment</a>; /** * A horizontal alignment that specifies how your data is placed in the printable area. */ horizontalAlignment?: <a href="#brlmprinterhorizontalalignment">BRLMPrinterHorizontalAlignment</a>; /** * A compress mode that specifies how to compress your data. * note: This is ios only. */ compressMode?: <a href="#brlmprintercompressmode">BRLMPrinterCompressMode</a>; /** * A priority that is print speed or print quality. Whether or not this has an effect is depend on your printer. */ printQuality?: <a href="#brlmprinterprintquality">BRLMPrinterPrintQuality</a>; }</code>

#### BRLMPrinterNumberOfCopies

<code>number</code>

#### BRLMPrinterAutoCutType

<code>boolean</code>

#### BRLMPrinterScaleValueType

<code>number</code>

#### BRLMPrinterHalftoneThresholdType

<code>number</code>

#### BRLMPrinterTDModelSettings

<code>{ /** * Should use enum BRKMPrinterCustomPaperType */ paperType: <a href="#brlmprintercustompapertype">BRLMPrinterCustomPaperType</a>; /** * The width of the label. For example, the RD-U04J1 is 60.0 wide. */ tapeWidth: number; /** * The length of the label. For example, the RD-U04J1 is 60.0 wide. */ tapeLength: number; /** * It is the difference between a sticker and a mount. * For example, the RD-U04J1 is `1.0, 2.0, 1.0, 2.0` */ marginTop: number; marginRight: number; marginBottom: number; marginLeft: number; /** * The spacing between seals. For example, the RD-U04J1 is 0.2. */ gapLength: number; paperMarkPosition: number; paperMarkLength: number; /** * Should use enum BRKMPrinterCustomPaperUnit. * For example, the RD-U04J1 is mm. */ paperUnit: <a href="#brlmprintercustompaperunit">BRLMPrinterCustomPaperUnit</a>; }</code>

#### BRLMSearchOption

<code>{ /** * 'usb' is android only, and now developing. */ port: <a href="#brlmprinterport">BRLMPrinterPort</a>; /** * searchDuration is the time to end search for devices. * default is 15 seconds. * use only port is 'wifi' or 'bluetoothLowEnergy'. */ searchDuration: number; /** * Android Bluetooth Classic only. Include only devices whose Bluetooth class * reports a printer. Defaults to false; ignored for other ports and on iOS. * This does not identify Brother devices. Devices with an unknown class are excluded when true. */ bluetoothPrintersOnly?: boolean; }</code>

#### isChannelAvailableResult

<code>{ result: boolean; }</code>

#### ErrorInfo

<code>{ message: string; code: number; }</code>

### Énumérations

#### BRLMPrinterModelName

| Membres            | Valeur                       |
| ------------------ | --------------------------- |
| **`QL_800`**       | <code>'QL_800'</code>       |
| **`QL_810W`**      | <code>'QL_810W'</code>      |
| **`QL_820NWB`**    | <code>'QL_820NWB'</code>    |
| **`TD_2320D_203`** | <code>'TD_2320D_203'</code> |
| **`TD_2030AD`**    | <code>'TD_2030AD'</code>    |
| **`TD_2350D_300`** | <code>'TD_2350D_300'</code> |

#### BRLMPrinterPort

| Membres                  | Valeur                             |
| ------------------------ | --------------------------------- |
| **`usb`**                | <code>'usb'</code>                |
| **`wifi`**               | <code>'wifi'</code>               |
| **`bluetooth`**          | <code>'bluetooth'</code>          |
| **`bluetoothLowEnergy`** | <code>'bluetoothLowEnergy'</code> |

#### BRLMPrinterLabelName

| Membres               | Valeur                          | Description   |
| --------------------- | ------------------------------ | ------------- |
| **`DieCutW17H54`**    | <code>'DieCutW17H54'</code>    |               |
| **`DieCutW17H87`**    | <code>'DieCutW17H87'</code>    |               |
| **`DieCutW23H23`**    | <code>'DieCutW23H23'</code>    |               |
| **`DieCutW29H42`**    | <code>'DieCutW29H42'</code>    |               |
| **`DieCutW29H90`**    | <code>'DieCutW29H90'</code>    |               |
| **`DieCutW38H90`**    | <code>'DieCutW38H90'</code>    |               |
| **`DieCutW39H48`**    | <code>'DieCutW39H48'</code>    |               |
| **`DieCutW52H29`**    | <code>'DieCutW52H29'</code>    |               |
| **`DieCutW62H29`**    | <code>'DieCutW62H29'</code>    |               |
| **`DieCutW62H60`**    | <code>'DieCutW62H60'</code>    |               |
| **`DieCutW62H75`**    | <code>'DieCutW62H75'</code>    |               |
| **`DieCutW62H100`**   | <code>'DieCutW62H100'</code>   |               |
| **`DieCutW60H86`**    | <code>'DieCutW60H86'</code>    |               |
| **`DieCutW54H29`**    | <code>'DieCutW54H29'</code>    |               |
| **`DieCutW102H51`**   | <code>'DieCutW102H51'</code>   |               |
| **`DieCutW102H152`**  | <code>'DieCutW102H152'</code>  |               |
| **`DieCutW103H164`**  | <code>'DieCutW103H164'</code>  |               |
| **`RollW12`**         | <code>'RollW12'</code>         |               |
| **`RollW29`**         | <code>'RollW29'</code>         |               |
| **`RollW38`**         | <code>'RollW38'</code>         |               |
| **`RollW50`**         | <code>'RollW50'</code>         |               |
| **`RollW54`**         | <code>'RollW54'</code>         |               |
| **`RollW62`**         | <code>'RollW62'</code>         |               |
| **`RollW62RB`**       | <code>'RollW62RB'</code>       |               |
| **`RollW102`**        | <code>'RollW102'</code>        |               |
| **`RollW103`**        | <code>'RollW103'</code>        |               |
| **`DTRollW90`**       | <code>'DTRollW90'</code>       |               |
| **`DTRollW102`**      | <code>'DTRollW102'</code>      |               |
| **`DTRollW102H51`**   | <code>'DTRollW102H51'</code>   |               |
| **`DTRollW102H152`**  | <code>'DTRollW102H152'</code>  |               |
| **`RoundW12DIA`**     | <code>'RoundW12DIA'</code>     |               |
| **`RoundW24DIA`**     | <code>'RoundW24DIA'</code>     |               |
| **`RoundW58DIA`**     | <code>'RoundW58DIA'</code>     |               |
| **`RDDieCutW60H60`**  | <code>'RDDieCutW60H60'</code>  | Pour la série TD |
| **`RDDieCutW50H30`**  | <code>'RDDieCutW50H30'</code>  |               |
| **`RDDieCutW40H60`**  | <code>'RDDieCutW40H60'</code>  |               |
| **`RDDieCutW40H50`**  | <code>'RDDieCutW40H50'</code>  |               |
| **`RDDieCutW40H40`**  | <code>'RDDieCutW40H40'</code>  |               |
| **`RDDieCutW30H30`**  | <code>'RDDieCutW30H30'</code>  |               |
| **`RDDieCutW50H35`**  | <code>'RDDieCutW50H35'</code>  |               |
| **`RDDieCutW60H80`**  | <code>'RDDieCutW60H80'</code>  |               |
| **`RDDieCutW60H100`** | <code>'RDDieCutW60H100'</code> |               |

#### BRLMPrinterScaleMode

| Membres              | Valeur                         |
| -------------------- | ----------------------------- |
| **`ActualSize`**     | <code>'ActualSize'</code>     |
| **`FitPageAspect`**  | <code>'FitPageAspect'</code>  |
| **`FitPaperAspect`** | <code>'FitPaperAspect'</code> |
| **`ScaleValue`**     | <code>'ScaleValue'</code>     |

#### BRLMPrinterHalftone

| Membres              | Valeur                         |
| -------------------- | ----------------------------- |
| **`Threshold`**      | <code>'Threshold'</code>      |
| **`ErrorDiffusion`** | <code>'ErrorDiffusion'</code> |
| **`PatternDither`**  | <code>'PatternDither'</code>  |

#### BRLMPrinterImageRotation

| Membres         | Valeur                    |
| --------------- | ------------------------ |
| **`Rotate0`**   | <code>'Rotate0'</code>   |
| **`Rotate90`**  | <code>'Rotate90'</code>  |
| **`Rotate180`** | <code>'Rotate180'</code> |
| **`Rotate270`** | <code>'Rotate270'</code> |

#### BRLMPrinterVerticalAlignment

| Membres      | Valeur                 |
| ------------ | --------------------- |
| **`Top`**    | <code>'Top'</code>    |
| **`Center`** | <code>'Center'</code> |
| **`Bottom`** | <code>'Bottom'</code> |

#### BRLMPrinterHorizontalAlignment

| Membres      | Valeur                 |
| ------------ | --------------------- |
| **`Left`**   | <code>'Left'</code>   |
| **`Center`** | <code>'Center'</code> |
| **`Right`**  | <code>'Right'</code>  |

#### BRLMPrinterCompressMode

| Membres     | Valeur                |
| ----------- | -------------------- |
| **`None`**  | <code>'None'</code>  |
| **`Tiff`**  | <code>'Tiff'</code>  |
| **`Mode9`** | <code>'Mode9'</code> |

#### BRLMPrinterPrintQuality

| Membres    | Valeur               |
| ---------- | ------------------- |
| **`Best`** | <code>'Best'</code> |
| **`Fast`** | <code>'Fast'</code> |

#### BRLMPrinterCustomPaperType

| Membres             | Valeur                        |
| ------------------- | ---------------------------- |
| **`rollPaper`**     | <code>'rollPaper'</code>     |
| **`dieCutPaper`**   | <code>'dieCutPaper'</code>   |
| **`markRollPaper`** | <code>'markRollPaper'</code> |

#### BRLMPrinterCustomPaperUnit

| Membres    | Valeur               |
| ---------- | ------------------- |
| **`mm`**   | <code>'mm'</code>   |
| **`inch`** | <code>'inch'</code> |

#### BrotherPrintEventsEnum

| Membres                          | Valeur                                     |
| -------------------------------- | ----------------------------------------- |
| **`onPrinterAvailable`**         | <code>'onPrinterAvailable'</code>         |
| **`onPrint`**                    | <code>'onPrint'</code>                    |
| **`onPrintFailedCommunication`** | <code>'onPrintFailedCommunication'</code> |
| **`onPrintError`**               | <code>'onPrintError'</code>               |
