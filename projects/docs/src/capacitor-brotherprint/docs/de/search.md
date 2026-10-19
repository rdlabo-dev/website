---
title: "Suche"
sourceRevision: "66e07f7b0a82ececde7b70dd8a6384bb8afd47d69828de846b4b41dc5b785f74"
---
# Suche

Die Suche findet Brother-Drucker in der Nähe. Ergebnisse werden über `onPrinterAvailable` geliefert. Rufen Sie die Suche nach der [Installation](/docs/installation) auf. Registrieren Sie den Listener vor `search`, speichern Sie das gefundene `BRLMChannelResult`, insbesondere `channelInfo` und `port`, und fahren Sie anschließend mit [Drucken](/docs/print) fort. Vollständige Ereignisliste: [Ereignisse](/docs/events).

## search

Registrieren Sie `onPrinterAvailable`, behalten Sie den Kanal und starten Sie danach eine WLAN-Suche. Der Aufruf von `search` selbst liefert `void`.

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
    searchDuration: 15, // Sekunden
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

Rufen Sie über den Suchbutton `searchWifiPrinters` auf und warten Sie beim Verlassen der Ansicht auf `stopSearching`.

Unter iOS listet `bluetooth` zuerst verbundene MFi-Drucker auf. Wenn keine verbunden sind, zeigt die App die Bluetooth-Zubehörauswahl des Systems an, damit Sie einen Drucker auswählen und koppeln können. Das Such-Promise wird nach dem Callback der Auswahl abgeschlossen; Fehler der Auswahl weisen das Promise zurück. Das Warten auf die Auswahl wird nach `searchDuration` Sekunden (Standard 15, Minimum 1) oder beim Aufruf von `cancelSearchBluetoothPrinter()` zurückgewiesen. Verspätete Ergebnisse werden ignoriert. Apple bietet keine API zum Schließen dieser Auswahl: Schließen Sie sie vor einem erneuten Versuch. Solange die alte Auswahl geöffnet bleibt, wird eine neue Auswahlanfrage sofort zurückgewiesen. Wenn das System sie weder anzeigt noch schließt, starten Sie die App vor einem erneuten Versuch neu.

Weisen Sie bei der Migration zu `SceneDelegate`, auch beim Update auf Capacitor 8.5, das Szenenfenster zusätzlich `AppDelegate.window` zu, das von der Zubehörauswahl des Systems verwendet wird. Setzen Sie nach dem Erstellen des Szenenfensters `(UIApplication.shared.delegate as? AppDelegate)?.window = window`. Ohne diese Referenz erscheint die Auswahl möglicherweise nicht, obwohl die Suche bereits gestartet wurde.

Verwenden Sie für BLE-fähige Drucker `port: BRLMPrinterPort.bluetoothLowEnergy`. Unter iOS wird dafür `startBLESearch` verwendet, ohne Bluetooth-Zubehörauswahl. Übergeben Sie `channelInfo` des gefundenen Druckers, den lokalen BLE-Namen, unverändert an `isChannelAvailable` oder `printImage`. BLE-Suchfehler weisen das Such-Promise zurück. QL-820NWB/QL-820NWBc unterstützen keinen BLE-Druck; verwenden Sie bei diesen Modellen `bluetooth` oder `wifi`.

Koppeln Sie unter Android einen Bluetooth-Drucker in den Systemeinstellungen, bevor Sie `search` mit `bluetooth` aufrufen. Das SDK listet gekoppelte Drucker auf und bietet nicht die iOS-Zubehörauswahl. Bluetooth- und BLE-Suchen werden nach Abschluss aufgelöst oder bei SDK-Fehlern zurückgewiesen. Android 12 und neuer fordern die Berechtigung für Geräte in der Nähe an; Android 11 und älter fordern für BLE die Standortberechtigung an. `isChannelAvailable` liefert `false`, wenn die Bluetooth-Berechtigung fehlt.

`searchDuration` gilt für `wifi`, `bluetoothLowEnergy` und die Wartezeit der `bluetooth`-Zubehörauswahl unter iOS. `usb` ist nur unter Android verfügbar. Abgeschlossene WLAN-/BLE-Suchen ohne Ergebnisse werden ohne Drucker aufgelöst; Fehler der iOS-Zubehörauswahl, Abbrüche und Zeitüberschreitungen beim Warten weisen die Suche zurück. Ein Abbruch weist auch einen laufenden ersten iOS-Bluetooth-Scan zurück und verhindert, dass dessen verspätetes Ergebnis die Auswahl öffnet. Die Signaturen finden Sie auf der [API](/docs/api#brlmsearchoption)-Seite.

Unter Android liefern Bluetooth-Classic-Suchen gekoppelte Geräte. Um nur Geräte einzubeziehen, die die Bluetooth-Klasse Imaging/Printer melden:

```typescript
await BrotherPrint.search({
  port: BRLMPrinterPort.bluetooth,
  searchDuration: 15,
  bluetoothPrintersOnly: true,
});
```

`bluetoothPrintersOnly` ist standardmäßig `false`, wodurch die ungefilterten Ergebnisse erhalten bleiben. Unter iOS und bei anderen Ports, einschließlich BLE, wird die Option ignoriert. Der Filter hängt nicht von Gerätenamen ab und identifiziert keine Brother-Produkte: Drucker anderer Hersteller können weiterhin erscheinen. Ist er aktiviert, werden Drucker mit fehlender Bluetooth-Klasse oder einer Klasse außerhalb der Druckerkategorie ausgeschlossen.

## isChannelAvailable

Wenn Sie das letzte `BRLMChannelResult` gespeichert haben, prüfen Sie vor dem [Drucken](/docs/print), ob dieser Kanal noch verwendbar ist.

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

Verwenden Sie diese Methoden, um eine aktive Suche vor ihrem Timeout zu stoppen, auch beim Verlassen der Ansicht.

```typescript
import { BrotherPrint } from '@rdlabo/capacitor-brotherprint';

await BrotherPrint.cancelSearchWiFiPrinter();
await BrotherPrint.cancelSearchBluetoothPrinter();
```

Die Abbruchsignaturen finden Sie unter [API](/docs/api#cancelsearchwifiprinter).
