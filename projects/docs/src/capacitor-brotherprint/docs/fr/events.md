---
title: "Événements"
sourceRevision: "fa001b63fb6330bcbc3bed1ac110e5ab6fd6ef9b27eeefb99c8cde4c17d325a3"
---
# Événements

Écoutez les imprimantes découvertes et les résultats d’impression. Enregistrez les écouteurs avant [Recherche](/docs/search) et [Impression](/docs/print) pour ne pas manquer les premiers événements.

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

| Événement                        | Déclenchement                        |
| ---------------------------- | ------------------------------------ |
| `onPrinterAvailable`         | Une imprimante pouvant se connecter a été trouvée |
| `onPrint`                    | L’impression a réussi                      |
| `onPrintFailedCommunication` | L’imprimante est injoignable     |
| `onPrintError`               | L’impression a échoué                         |

Lorsque `printImage` rejette une image invalide, un modèle ou un port non pris en charge, ou un échec de création des réglages d’impression, il émet aussi `onPrintError` avec `code: 0` et un `message` explicatif. Ce code indique une erreur de validation du plugin, pas une erreur du SDK. L’échec d’ouverture du canal de l’imprimante émet plutôt `onPrintFailedCommunication`.

Consultez la démo pour une page complète :

https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.3/demo/src/app/home/home.page.ts

<!-- !::addListener.BrotherPrintEventsEnum:: -->

<!-- !::BrotherPrintEventsEnum:: -->

<!-- !::PluginListenerHandle:: -->

<!-- !::ErrorInfo:: -->
