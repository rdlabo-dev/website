---
title: "ScreenshotEvent"
sourceRevision: "306fa94bb99c5c34ab5ae0d12ef5c1404f1b60a32c8a4840080e34d2aa463c5e"
---
# ScreenshotEvent

`ScreenshotEvent` überwacht Screenshot-Aktivität. Rufen Sie die Funktion nach der [Installation](/docs/readme#installation) auf. Registrieren Sie `addListener` vor `startWatchEvent`, damit der erste Screenshot nicht verloren geht. Lassen Sie die Überwachung aktiv, solange Sie Benachrichtigungen benötigen, und prüfen Sie einen tatsächlichen Screenshot auf einem Gerät. Beenden Sie anschließend beim Verlassen oder Zerstören der Ansicht die Überwachung und entfernen Sie den Handle.

## Lebenszyklus der Überwachung

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
  // Nehmen Sie einen tatsächlichen Screenshot auf dem Gerät auf und prüfen Sie, ob der Listener ausgeführt wird.
};

const stop = async () => {
  await ScreenshotEvent.removeWatchEvent();
  await handle?.remove();
  handle = undefined;
};
```

Rufen Sie `start` auf, wenn die Ansicht aktiv wird, und warten Sie beim Verlassen oder Zerstören der Ansicht auf `stop`. Registrieren Sie keinen Listener, um ihn unmittelbar danach wieder zu entfernen.

Die Signaturen für Überwachung und Listener finden Sie unter [API](/docs/api).
