---
title: "Impression"
sourceRevision: "3a23717d09f43712422a8a924c20cb22c300b35a199e9172a396a1d0ed0803c2"
---
# Impression

`printImage` envoie une image base64, sans son type MIME, à une imprimante Brother. Appelez-le après [Installation](/docs/installation). Découvrez une imprimante avec [Recherche](/docs/search) et enregistrez les [Événements](/docs/events) pour les résultats d’impression avant d’imprimer.

Préparez vous-même une image réelle, par exemple en encodant un PNG/JPEG depuis votre application et en retirant tout préfixe `data:...;base64,`. Utilisez le `port` et le `channelInfo` du `BRLMChannelResult` conservé depuis `onPrinterAvailable`. Choisissez un `modelName` / `labelName` correspondant à votre appareil et au tableau des [modèles pris en charge](/docs/readme#supported-models).

```typescript
import {
  BrotherPrint,
  BRLMPrinterLabelName,
  BRLMPrinterModelName,
} from '@rdlabo/capacitor-brotherprint';
import type { BRLMChannelResult, BRLMPrintOptions } from '@rdlabo/capacitor-brotherprint';

const printImage = async (printer: BRLMChannelResult, encodedImage: string) => {
  const options: BRLMPrintOptions = {
    modelName: BRLMPrinterModelName.QL_820NWB,
    labelName: BRLMPrinterLabelName.RollW62,
    encodedImage,
    numberOfCopies: 1,
    autoCut: true,
    port: printer.port,
    channelInfo: printer.channelInfo,
  };

  await BrotherPrint.printImage(options);
};
```

Consultez la démo pour une page complète :

https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.3/demo/src/app/home/home.page.ts

<!-- !::printImage:: -->

<!-- !::BRLMPrintOptions:: -->
