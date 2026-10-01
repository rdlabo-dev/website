---
title: ScreenshotEvent
code: []
scrollActiveLine: []
---

`ScreenshotEvent` はスクリーンショットを監視します。[インストール](/docs/readme#インストール) のあとで呼び出します。最初のスクリーンショットを取りこぼさないよう、`startWatchEvent` より前に `addListener` を登録します。通知が必要なあいだ監視を続け、実機で物理スクリーンショットを確認し、画面破棄時に監視停止とハンドル削除を行います。

## 監視のライフサイクル

```ts
import { ScreenshotEvent } from '@rdlabo/capacitor-screenshot-event';
import type { PluginListenerHandle } from '@capacitor/core';

let handle: PluginListenerHandle | undefined;

const start = async () => {
  if (handle) return;
  handle = await ScreenshotEvent.addListener('userDidTakeScreenshot', () => {
    console.log('Screenshot was taken');
  });

  await ScreenshotEvent.startWatchEvent();
  // 端末でスクリーンショットを撮影し、リスナーが呼ばれることを確認します。
};

const stop = async () => {
  await ScreenshotEvent.removeWatchEvent();
  await handle?.remove();
  handle = undefined;
};
```

画面がアクティブになったら `start` を呼び、画面を離れるときや破棄するときは `stop` の完了を await してください。リスナーを登録してすぐ `remove` するだけの例にはしないでください。

監視とリスナーの型は[API](/docs/api)を参照してください。
