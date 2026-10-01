---
title: "ScreenshotEvent"
sourceRevision: "306fa94bb99c5c34ab5ae0d12ef5c1404f1b60a32c8a4840080e34d2aa463c5e"
---
# ScreenshotEvent

`ScreenshotEvent` surveille l’activité de capture d’écran. Appelez-le après l’[installation](/docs/readme#installation). Enregistrez `addListener` avant `startWatchEvent` pour ne pas manquer la première capture. Maintenez la surveillance tant que les notifications sont nécessaires, vérifiez une véritable capture sur un appareil, puis arrêtez la surveillance et supprimez le handle lorsque l’écran est quitté ou détruit.

## Cycle de vie de la surveillance

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
  // Faites une véritable capture sur l’appareil et vérifiez l’exécution de l’écouteur.
};

const stop = async () => {
  await ScreenshotEvent.removeWatchEvent();
  await handle?.remove();
  handle = undefined;
};
```

Appelez `start` lorsque l’écran devient actif et attendez `stop` lorsque vous le quittez ou le détruisez. N’enregistrez pas un écouteur pour le supprimer immédiatement.

Consultez les signatures de surveillance et d’écouteurs dans l’[API](/docs/api).
