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
    searchDuration: 15, // 秒
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


### BluetoothとBLE

iOSの`bluetooth`は、最初に接続済みのMFiプリンターを一覧にします。接続済みの機器がない場合はシステムのBluetoothアクセサリ選択画面を表示し、プリンターを選択・ペアリングできます。探索のPromiseは選択画面のコールバック後に完了し、選択画面のエラーではrejectします。選択画面の待機は `searchDuration` 秒後（既定値15、最小1）、または `cancelSearchBluetoothPrinter()` の呼び出し時にrejectします。遅れて届いた結果は無視します。Appleはこの選択画面を閉じるAPIを提供していないため、再試行前に閉じてください。以前の選択画面が開いている間、新しい選択画面の要求は即座にrejectします。システムが選択画面を表示も終了もしない場合は、アプリを再起動してから再試行してください。

Capacitor 8.5への更新時などに `SceneDelegate` へ移行する場合は、システムのアクセサリ選択画面が使う `AppDelegate.window` にもシーンのウィンドウを設定してください。シーンのウィンドウを作成した後に `(UIApplication.shared.delegate as? AppDelegate)?.window = window` を設定します。この参照がないと、探索が始まっていても選択画面が表示されない場合があります。

BLE対応プリンターには`port: BRLMPrinterPort.bluetoothLowEnergy`を使います。iOSではBluetoothアクセサリ選択画面を使わず、`startBLESearch`で探索します。探索結果の`channelInfo`（BLEローカル名）を変更せず、`isChannelAvailable`や`printImage`へ渡してください。BLE探索エラーではPromiseがrejectします。QL-820NWB/QL-820NWBcはBLE印刷に対応していないため、`bluetooth`または`wifi`を使います。

Androidでは、`bluetooth`で探索する前にシステム設定でペアリングしてください。SDKはペアリング済みプリンターを一覧にし、iOSのようなアクセサリ選択画面は提供しません。Bluetooth・BLEの探索は完了時にresolveし、SDKエラーではrejectします。Android 12以降は「付近のデバイス」、Android 11以前のBLEでは位置情報の権限を要求します。Bluetoothの権限がない場合、`isChannelAvailable`は`false`を返します。

`searchDuration` は `wifi`、`bluetoothLowEnergy`、iOSの `bluetooth` アクセサリ選択画面の待機に使います。`usb` は Android のみです。Wi-Fi・BLE探索が結果なしで完了した場合は、プリンターなしでresolveします。iOSのアクセサリ選択画面のエラー、キャンセル、待機タイムアウトでは探索がrejectします。キャンセルは実行中のiOS Bluetooth初回スキャンもrejectし、遅れて届いた結果による選択画面の表示を防ぎます。

!::search::

!::BRLMSearchOption::

### Androidでプリンターのクラスに絞る

AndroidのBluetooth Classic探索はペアリング済み端末を返します。Bluetooth Imaging/Printerクラスを報告する端末だけに絞るには、次のように指定します。

```typescript
await BrotherPrint.search({
  port: BRLMPrinterPort.bluetooth,
  searchDuration: 15,
  bluetoothPrintersOnly: true,
});
```

`bluetoothPrintersOnly`の既定値は`false`で、従来どおり絞り込まずに返します。iOSやBLEを含む他のポートでは無視します。このフィルターは端末名を使わず、Brother製品を特定するものでもないため、他社のプリンターが含まれる場合があります。有効にすると、Bluetoothクラスが不明またはプリンター以外の端末は除外します。

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

停止メソッドのシグネチャは [API](/docs/api#cancelsearchwifiprinter) を参照してください。
