---
title: Print
code: []
scrollActiveLine: []
---

`printImage` は base64 画像（MIME タイプを除いたもの）を Brother プリンターへ送ります。[インストール](/docs/readme#インストール) のあとで呼び出します。プリンターの探索は [Search](/docs/search)、印刷結果は印刷前に [Events](/docs/events) を登録します。

実画像を自分で用意します（例: アプリ内の PNG/JPEG を encode し、`data:...;base64,` 接頭辞があれば除去）。`port` と `channelInfo` は `onPrinterAvailable` で保持した `BRLMChannelResult` から取ります。`modelName` / `labelName` は端末と [対応モデル](/docs/readme#対応モデル) 表に合わせて選びます。固定 IP やダミー base64 を書かないでください。

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

完全なページはデモを見てください:

https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.1.1/demo/src/app/home/home.page.ts

!::printImage::

!::BRLMPrintOptions::
