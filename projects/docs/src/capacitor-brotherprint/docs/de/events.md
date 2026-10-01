---
title: "Ereignisse"
sourceRevision: "8b7ee1e8f897b23d409811a80ed4ff8fc0e8fef2ea8f6e177bf8e64733013cd8"
---
# Ereignisse

Lauschen Sie auf gefundene Drucker und Druckergebnisse. Registrieren Sie Listener vor der [Suche](/docs/search) und dem [Drucken](/docs/print), damit die ersten Ereignisse nicht verpasst werden.

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

| Ereignis                        | Auslösezeitpunkt                        |
| ---------------------------- | ------------------------------------ |
| `onPrinterAvailable`         | Ein verbindungsfähiger Drucker wurde gefunden |
| `onPrint`                    | Druck erfolgreich                      |
| `onPrintFailedCommunication` | Der Drucker konnte nicht erreicht werden     |
| `onPrintError`               | Druck fehlgeschlagen                         |

Wenn `printImage` wegen eines ungültigen Bildes, eines nicht unterstützten Modells oder Ports oder eines Fehlers beim Erstellen der Druckeinstellungen zurückgewiesen wird, löst es zusätzlich `onPrintError` mit `code: 0` und einer erläuternden `message` aus. Dieser Code bezeichnet einen Validierungsfehler des Plugins, keinen SDK-Fehler. Kann der Druckerkanal nicht geöffnet werden, wird stattdessen `onPrintFailedCommunication` ausgelöst.

Eine vollständige Seite finden Sie in der Demo:

https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.1/demo/src/app/home/home.page.ts

<!-- !::addListener.BrotherPrintEventsEnum:: -->

<!-- !::BrotherPrintEventsEnum:: -->

<!-- !::PluginListenerHandle:: -->

<!-- !::ErrorInfo:: -->
