---
title: ScreenshotEvent
code: []
scrollActiveLine: []
---

`ScreenshotEvent` はスクリーンショットを監視します。[インストール](/docs/readme#インストール) のあとで呼び出します。最初のスクリーンショットを取りこぼさないよう、`startWatchEvent` より前に `addListener` を登録します。

## addListener

```ts
import { ScreenshotEvent } from '@rdlabo/capacitor-screenshot-event';

const handle = await ScreenshotEvent.addListener('userDidTakeScreenshot', () => {
  // Notice take screenshot
});

await handle.remove();
```

!::addListener.userDidTakeScreenshot::

!::PluginListenerHandle::

## startWatchEvent

```ts
import { ScreenshotEvent } from '@rdlabo/capacitor-screenshot-event';

ScreenshotEvent.addListener('userDidTakeScreenshot', () => {
  // Notice take screenshot
});

ScreenshotEvent.startWatchEvent();
```

!::startWatchEvent::

## removeWatchEvent

```ts
import { ScreenshotEvent } from '@rdlabo/capacitor-screenshot-event';

ScreenshotEvent.removeWatchEvent();
```

!::removeWatchEvent::
