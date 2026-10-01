---
title: "Drucken"
sourceRevision: "df3ec2ae1952ac70cd33e94e9c496f844ccec438d5e24a144368f7d49c1bdb52"
---
# Drucken

`printImage` sendet ein Base64-Bild ohne MIME-Typ an einen Brother-Drucker. Rufen Sie dies nach der [Installation](/docs/installation) auf. Finden Sie einen Drucker über die [Suche](/docs/search) und registrieren Sie vor dem Drucken [Ereignisse](/docs/events) für Druckergebnisse.

Bereiten Sie selbst ein tatsächlich vorhandenes Bild vor, beispielsweise indem Sie ein PNG/JPEG aus Ihrer App kodieren und einen möglichen Präfix `data:...;base64,` entfernen. Verwenden Sie `port` und `channelInfo` aus dem `BRLMChannelResult`, das Sie von `onPrinterAvailable` gespeichert haben. Wählen Sie `modelName` / `labelName` passend zu Ihrem Gerät und zur Tabelle [Unterstützte Modelle](/docs/readme#supported-models).

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

Eine vollständige Seite finden Sie in der Demo:

https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.1/demo/src/app/home/home.page.ts

<!-- !::printImage:: -->

<!-- !::BRLMPrintOptions:: -->
