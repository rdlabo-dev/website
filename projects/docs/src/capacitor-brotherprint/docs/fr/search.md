---
title: "Recherche"
sourceRevision: "66e07f7b0a82ececde7b70dd8a6384bb8afd47d69828de846b4b41dc5b785f74"
---
# Recherche

La recherche trouve les imprimantes Brother à proximité. Les résultats arrivent via `onPrinterAvailable`. Appelez-la après [Installation](/docs/installation). Enregistrez l’écouteur avant `search`, conservez le `BRLMChannelResult` découvert, en particulier `channelInfo` et `port`, puis passez à [Impression](/docs/print). Liste complète des événements : [Événements](/docs/events).

## search

Enregistrez `onPrinterAvailable`, conservez le canal, puis lancez une recherche Wi-Fi. L’appel `search` lui-même renvoie `void`.

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
    searchDuration: 15, // secondes
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

Appelez `searchWifiPrinters` depuis le bouton de recherche et attendez `stopSearching` lorsque l’utilisateur quitte l’écran.

Sur iOS, `bluetooth` liste d’abord les imprimantes MFi connectées. Si aucune n’est connectée, l’application affiche le sélecteur système d’accessoires Bluetooth pour choisir et appairer une imprimante. La promesse de recherche se termine après le callback du sélecteur ; les erreurs du sélecteur rejettent la promesse. L’attente du sélecteur est rejetée après `searchDuration` secondes (15 par défaut, minimum 1), ou lors d’un appel à `cancelSearchBluetoothPrinter()`. Les résultats tardifs sont ignorés. Apple ne fournit aucune API pour fermer ce sélecteur : fermez-le avant de réessayer. Tant que l’ancien sélecteur reste ouvert, une nouvelle demande de sélecteur est rejetée immédiatement. Si le système ne l’affiche ni ne le ferme, redémarrez l’application avant de réessayer.

Lors de la migration vers `SceneDelegate`, notamment pendant la mise à jour vers Capacitor 8.5, affectez également la fenêtre de la scène à `AppDelegate.window`, utilisé par le sélecteur système d’accessoires. Après avoir créé la fenêtre de la scène, définissez `(UIApplication.shared.delegate as? AppDelegate)?.window = window`. Sans cette référence, le sélecteur peut ne pas apparaître même si la recherche a commencé.

Pour les imprimantes compatibles BLE, utilisez `port: BRLMPrinterPort.bluetoothLowEnergy`. Sur iOS, cela utilise `startBLESearch` sans le sélecteur d’accessoires Bluetooth. Transmettez sans modification le `channelInfo` de l’imprimante découverte, son nom local BLE, à `isChannelAvailable` ou `printImage`. Les erreurs de recherche BLE rejettent la promesse de recherche. QL-820NWB/QL-820NWBc ne prennent pas en charge l’impression BLE ; utilisez `bluetooth` ou `wifi` pour ces modèles.

Sur Android, appairez une imprimante Bluetooth dans les réglages système avant d’appeler `search` avec `bluetooth` ; le SDK liste les imprimantes appairées et ne fournit pas le sélecteur d’accessoires iOS. Les recherches Bluetooth et BLE se terminent à la fin de la recherche, ou sont rejetées en cas d’erreur du SDK. Android 12 et les versions ultérieures demandent les autorisations Appareils à proximité ; Android 11 et les versions antérieures demandent l’autorisation de localisation pour BLE. `isChannelAvailable` renvoie `false` si l’autorisation Bluetooth manque.

`searchDuration` s’applique à `wifi`, à `bluetoothLowEnergy` et à l’attente du sélecteur d’accessoires `bluetooth` sur iOS. `usb` est réservé à Android. Les recherches Wi-Fi/BLE terminées sans résultat se résolvent sans imprimante ; les erreurs du sélecteur iOS, l’annulation et l’expiration du délai d’attente rejettent la recherche. L’annulation rejette aussi la recherche initiale Bluetooth iOS en cours et empêche son résultat tardif d’ouvrir le sélecteur. Les signatures figurent sur la page [API](/docs/api#brlmsearchoption).

Sur Android, les recherches Bluetooth Classic renvoient les appareils appairés. Pour ne conserver que ceux déclarant la classe Bluetooth Imaging/Printer :

```typescript
await BrotherPrint.search({
  port: BRLMPrinterPort.bluetooth,
  searchDuration: 15,
  bluetoothPrintersOnly: true,
});
```

`bluetoothPrintersOnly` vaut `false` par défaut, ce qui conserve les résultats non filtrés. Il est ignoré sur iOS et pour les autres ports, y compris BLE. Le filtre ne dépend pas du nom des appareils et n’identifie pas les produits Brother : les imprimantes d’autres fabricants peuvent toujours apparaître. Lorsqu’il est activé, les imprimantes dont la classe Bluetooth est absente ou n’est pas celle d’une imprimante sont exclues.

## isChannelAvailable

Si vous avez enregistré le dernier `BRLMChannelResult`, vérifiez si ce canal reste utilisable avant [Impression](/docs/print).

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

<!-- !::isChannelAvailable:: -->

<!-- !::isChannelAvailableResult:: -->

<!-- !::BRLMChannelResult:: -->

## cancelSearchWiFiPrinter / cancelSearchBluetoothPrinter

Utilisez ces méthodes pour arrêter une recherche active avant son délai d’expiration, notamment lorsque l’utilisateur quitte l’écran.

```typescript
import { BrotherPrint } from '@rdlabo/capacitor-brotherprint';

await BrotherPrint.cancelSearchWiFiPrinter();
await BrotherPrint.cancelSearchBluetoothPrinter();
```

Consultez [API](/docs/api#cancelsearchwifiprinter) pour les signatures d’annulation.
