---
title: Search
code: []
scrollActiveLine: []
---

Search は近くの Brother プリンターを探します。結果は `onPrinterAvailable` で届きます。[インストール](/docs/readme#インストール) のあとで呼び出します。`search` より前にリスナーを登録し、見つかった `BRLMChannelResult`（特に `channelInfo` と `port`）を保持してから [Print](/docs/print) へ進みます。イベント一覧は [Events](/docs/events) です。

## search

`onPrinterAvailable` を登録してチャネルを保持し、Wi-Fi 探索を開始します。`search` 自体の戻り値は `void` です。

```typescript
import type { PluginListenerHandle } from '@capacitor/core';
import {
  BrotherPrint,
  BrotherPrintEventsEnum,
  BRLMPrinterPort,
} from '@rdlabo/capacitor-brotherprint';
import type { BRLMChannelResult } from '@rdlabo/capacitor-brotherprint';

let discovered: BRLMChannelResult | undefined;
let availableHandle: PluginListenerHandle | undefined;

const searchWifiPrinters = async () => {
  if (!availableHandle) {
    availableHandle = await BrotherPrint.addListener(
    BrotherPrintEventsEnum.onPrinterAvailable,
    (printer) => {
      discovered = printer;
      console.log('channelInfo', printer.channelInfo);
    },
    );
  }

  await BrotherPrint.search({
    port: BRLMPrinterPort.wifi,
    searchDuration: 15, // seconds
  });
};

const stopSearching = async () => {
  try {
    await BrotherPrint.cancelSearchWiFiPrinter();
  } finally {
    await availableHandle?.remove();
    availableHandle = undefined;
  }
};
```

探索ボタンから `searchWifiPrinters` を呼び、画面を離れるときに `stopSearching` を待って監視を解放します。


`searchDuration` は `wifi` と `bluetoothLowEnergy` で使います。`usb` は Android のみです。見つからない場合はエラーにはならず、プリンターも届きません。

!::search::

!::BRLMSearchOption::

## isChannelAvailable

最後の `BRLMChannelResult` を保存している場合、[Print](/docs/print) の前にそのチャネルがまだ使えるかを確認できます。

```typescript
import { BrotherPrint } from '@rdlabo/capacitor-brotherprint';
import type { BRLMChannelResult } from '@rdlabo/capacitor-brotherprint';

const checkChannel = async (lastPrinter: BRLMChannelResult) => {
  const { result } = await BrotherPrint.isChannelAvailable(lastPrinter);
  if (!result) {
    await BrotherPrint.search({
      port: lastPrinter.port,
      searchDuration: 15,
    });
  }
};
```

!::isChannelAvailable::

!::isChannelAvailableResult::

!::BRLMChannelResult::

## cancelSearchWiFiPrinter / cancelSearchBluetoothPrinter

画面を離れるときなど、タイムアウト前に実行中の探索を停止するときに使います。

```typescript
import { BrotherPrint } from '@rdlabo/capacitor-brotherprint';

await BrotherPrint.cancelSearchWiFiPrinter();
await BrotherPrint.cancelSearchBluetoothPrinter();
```

!::cancelSearchWiFiPrinter::

!::cancelSearchBluetoothPrinter::
