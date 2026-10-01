---
title: "Premiers pas"
sourceRevision: "4e5601cda9b9b97335c69b800209fec7e13761418b798086cf135e1ea12c78bb"
---
# @rdlabo/capacitor-brotherprint

Capacitor Brother Print relie le SDK natif Brother Print pour iOS et Android afin de rechercher des imprimantes d’étiquettes Brother compatibles et d’imprimer des images depuis une application Capacitor.

**Ce plugin est encore en phase RC (release candidate).** iOS nécessite **Swift Package Manager** et au minimum **iOS 15**. Le SDK Brother Print n’est pas compatible avec CocoaPods pour ce plugin.

<!-- rdlabo-docs-omit -->
**Documentation :** [Lire la documentation complète](https://docs.rdlabo.dev/projects/capacitor-brotherprint)
<!-- /rdlabo-docs-omit -->

## Installer

```
npm install @rdlabo/capacitor-brotherprint
```

Pour l’emplacement du SDK, l’organisation SPM et les autorisations, consultez [Installation](https://docs.rdlabo.dev/projects/capacitor-brotherprint/docs/installation).

## Imprimer votre première étiquette

1. [Installation](https://docs.rdlabo.dev/projects/capacitor-brotherprint/docs/installation) — installation npm, mise en place du SDK Brother, autorisations, puis `npx cap sync`.
2. [Recherche](https://docs.rdlabo.dev/projects/capacitor-brotherprint/docs/search) — enregistrer `onPrinterAvailable`, conserver le canal découvert et lancer une recherche Wi-Fi ou via une autre connexion.
3. [Impression](https://docs.rdlabo.dev/projects/capacitor-brotherprint/docs/print) — imprimer avec ce canal, un modèle et une étiquette pris en charge, et une image base64 réelle que vous préparez.
4. [Événements](https://docs.rdlabo.dev/projects/capacitor-brotherprint/docs/events) — détails des écouteurs de réussite et d’erreur d’impression.

## Modèles pris en charge

Chaque lien produit est un lien affilié Amazon. Les achats effectués via ces liens contribuent aux coûts de développement.

| Produit                               | Modèle        | iOS/WiFi | iOS/BT | iOS/BLE | Android/USB | Android/WiFi | Android/BT | Android/BLE |
| ------------------------------------- | ------------ | -------- | ------ | ------- | ----------- | ------------ | ---------- | ----------- |
| QL-810W                               | QL_810W      | ❌       | ❌     | ❌      | ✅          | ❌           | ❌         | ❌          |
| [QL-820NWB](https://amzn.to/3BXQ1aj)  | QL_820NWB    | ✅       | ※1     | ❌      | △           | ✅           | △          | ❌          |
| [QL-820NWBc](https://amzn.to/4fjhUIe) | QL_820NWB    | ✅       | ✅     | ❌      | ❌          | ✅           | ✅         | ❌          |
| [TD-2320D](https://amzn.to/48EFCN3)   | TD_2320D_203 | ❌       | ❌     | ❌      | △           | ❌           | ❌         | ❌          |
| [TD-2350D](https://amzn.to/48ma6TK)   | TD_2350D_300 | ✅       | △      | △       | ✅          | ✅           | ✅         | △           |

Liens affiliés Amazon : **https://amzn.to/3AiiOFT**

**Complément**

|     | Description                |
| --- | -------------------------- |
| ✅  | Pris en charge et testé       |
| △   | Implémenté mais non testé |
| -   | Non pris en charge par le plugin    |
| ❌  | Non pris en charge par l’appareil    |
| BT  | Bluetooth                  |
| BLE | Bluetooth Low Energy       |

※1 La version de Bluetooth est trop ancienne pour permettre la connexion avec iOS. Référence : https://okbizcs.okwave.jp/brother/qa/q9932082.html

## Utilitaires JavaScript

`BrotherPrinterSession` gère les résultats de recherche, les écouteurs d’impression et la fermeture d’un écran d’impression. Des fonctions pures proposent les choix de modèle et de connexion, et des utilitaires de connexion sans état restent disponibles. Aucun ne nécessite Angular ni Ionic. Consultez la [gestion des connexions](/docs/connection-management) pour leur utilisation.

## API

<docgen-index>

* [`printImage(...)`](/docs/readme#printimage)
* [`search(...)`](/docs/readme#search)
* [`isChannelAvailable(...)`](/docs/readme#ischannelavailable)
* [`cancelSearchWiFiPrinter()`](/docs/readme#cancelsearchwifiprinter)
* [`cancelSearchBluetoothPrinter()`](/docs/readme#cancelsearchbluetoothprinter)
* [`addListener(BrotherPrintEventsEnum.onPrinterAvailable, ...)`](/docs/readme#addlistenerbrotherprinteventsenumonprinteravailable-)
* [`addListener(BrotherPrintEventsEnum.onPrint, ...)`](/docs/readme#addlistenerbrotherprinteventsenumonprint-)
* [`addListener(BrotherPrintEventsEnum.onPrintFailedCommunication, ...)`](/docs/readme#addlistenerbrotherprinteventsenumonprintfailedcommunication-)
* [`addListener(BrotherPrintEventsEnum.onPrintError, ...)`](/docs/readme#addlistenerbrotherprinteventsenumonprinterror-)
* [Interfaces](/docs/readme#interfaces)
* [Alias de types](/docs/readme#type-aliases)
* [Énumérations](/docs/readme#enums)

</docgen-index>

<docgen-api>
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

</docgen-api>

<!-- rdlabo-docs-omit -->
## Canaux de préversion

Une pull request ouverte, non marquée comme brouillon, peut être publiée sous le dist-tag npm `beta` après la réussite de ses workflows `Validation` et `Package Candidate`. Un propriétaire ou mainteneur du dépôt doit ajouter un commentaire dont le contenu intégral est :

```text
/beta
```

La demande n’autorise que le SHA de tête de la pull request présent au moment de l’ajout du commentaire. Le workflow revérifie les droits du propriétaire ou du mainteneur et le SHA de tête juste avant la publication. Tout nouveau commit nécessite une nouvelle réussite de CI et un nouveau commentaire `/beta` d’un propriétaire ou mainteneur. Les pull requests provenant de forks sont prises en charge. Les pull requests modifiant un workflow qui conditionne les releases ne peuvent pas être publiées en bêta avant que ces modifications n’arrivent sur `main`.

Les versions bêta utilisent `<base>-beta.pr<PR number>.sha<12-character SHA>`. Le candidat est construit dans un workflow en lecture seule, sans identifiants de publication npm. Le workflow privilégié de release ne publie que l’artefact de package immuable validé, avec les scripts de cycle de vie désactivés. Un échec de notification ne peut pas invalider une publication npm réussie.

Lorsqu’une pull request est fusionnée dans `main`, elle est publiée automatiquement sous `beta` uniquement après la réussite de la CI requise et de `Package Candidate` pour ce commit de fusion exact. Les push directs sur `main` ne publient pas de candidat.

Seul `npm run release` crée un tag de release. Les tags stables `vX.Y.Z` publient sous npm `latest` ; les tags de révision ou de préversion publient sous `next`. Ni la publication `beta` ni la publication `next` ne modifie le dist-tag npm `latest`.

## Mainteneurs

- [rdlabo](https://rdlabo.dev/)
<!-- /rdlabo-docs-omit -->

<!-- rdlabo-docs-omit -->
## Licence

MIT
<!-- /rdlabo-docs-omit -->
