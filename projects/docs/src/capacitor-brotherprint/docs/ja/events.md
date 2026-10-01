---
title: Events
code: []
scrollActiveLine: []
---

見つかったプリンターと印刷結果を受け取ります。最初のイベントを取りこぼさないよう、[Search](/docs/search) と [Print](/docs/print) より前にリスナーを登録します。

```typescript
import type { PluginListenerHandle } from '@capacitor/core';
import { BrotherPrint, BrotherPrintEventsEnum } from '@rdlabo/capacitor-brotherprint';

const handles: PluginListenerHandle[] = [];

const registerPrintListeners = async () => {
  handles.push(
    await BrotherPrint.addListener(BrotherPrintEventsEnum.onPrinterAvailable, (printer) => {
      console.log('printer', printer.channelInfo);
    }),
  );
  handles.push(
    await BrotherPrint.addListener(BrotherPrintEventsEnum.onPrint, () => {
      console.log('onPrint');
    }),
  );
  handles.push(
    await BrotherPrint.addListener(BrotherPrintEventsEnum.onPrintFailedCommunication, (info) => {
      console.log('onPrintFailedCommunication', info);
    }),
  );
  handles.push(
    await BrotherPrint.addListener(BrotherPrintEventsEnum.onPrintError, (info) => {
      console.log('onPrintError', info);
    }),
  );
};

const removePrintListeners = async () => {
  await Promise.all(handles.map((handle) => handle.remove()));
};
```

| イベント                     | 発行されるとき                   |
| ---------------------------- | -------------------------------- |
| `onPrinterAvailable`         | 接続できるプリンターが見つかった |
| `onPrint`                    | 印刷が成功した                   |
| `onPrintFailedCommunication` | プリンターに到達できなかった     |
| `onPrintError`               | 印刷が失敗した                   |

`printImage` が不正な画像、非対応のモデルやポート、印刷設定の作成失敗を理由に拒否される場合は、`code: 0` と説明用の `message` を含む `onPrintError` も通知されます。このコードは SDK エラーではなく、プラグインによる検証エラーを表します。プリンターとのチャンネルを開けない場合は、代わりに `onPrintFailedCommunication` が通知されます。

完全なページはデモを見てください:

https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.1/demo/src/app/home/home.page.ts

!::addListener.BrotherPrintEventsEnum::

!::BrotherPrintEventsEnum::

!::PluginListenerHandle::

!::ErrorInfo::
