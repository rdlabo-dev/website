---
title: "JavaScript-Druckhilfen"
sourceRevision: "067159fea3da3298614f4cf7f3115015fb281490f317635e7ba4120dafc1ab8f"
---
# JavaScript-Druckhilfen

Diese Funktionen kapseln die vorhandene Plugin-API, ohne das native Verhalten zu verändern. Sie haben keine Abhängigkeit von Angular oder Ionic. Sitzungen können Verbindungen optional über von der Anwendung bereitgestellte Speicher-Callbacks speichern. Alle Hilfsfunktionen teilen sich eine Warteschlange, um überlappende Suchvorgänge und Verbindungsprüfungen zu verhindern.

## Einen Einstiegspunkt wählen

Schließen Sie zunächst die [Installation](/docs/installation) einschließlich SDK- und Berechtigungseinrichtung ab. Importieren Sie die Hilfsfunktionen aus demselben Plugin-Paket.

| Aufgabe | Einstiegspunkt |
| --- | --- |
| Suchergebnisse, Benachrichtigungen und Bereinigung einer Druckansicht verwalten | `BrotherPrinterSession` |
| Eine einzelne Suche ohne Bindung an die Lebensdauer einer Ansicht ausführen | `searchBrotherPrinters` |
| Ein vorheriges Ziel wiederverwenden und bei Nichtverfügbarkeit eine Suche ausführen | `prepareBrotherPrinters` |
| Nur ein manuell eingegebenes Ziel prüfen | `checkBrotherPrinterChannel` |

Direkte Plugin-Aufrufe finden Sie unter [Suche](/docs/search), [Drucken](/docs/print) und [Ereignisse](/docs/events).

## Ohne Sitzung suchen

- `searchBrotherPrinters(options, model?)` sammelt Suchereignisse in einem
  Array. Der Listener wird vor der Suche registriert und bei Erfolg oder Fehler entfernt. Wenn keine Ergebnisse vorliegen, wird ein leeres Array zurückgegeben; native Fehler werden weitergereicht.
- `prepareBrotherPrinters(options, model, previous?)` prüft zunächst einen gespeicherten Kanal,
  sofern dessen Modell und Port übereinstimmen. Ist er verfügbar, wird `[previous]` zurückgegeben; andernfalls wird erneut gesucht. Bei USB wird immer über den nativen Berechtigungsablauf gesucht. Schlägt die Verfügbarkeitsprüfung fehl, wird ihr Fehler weitergereicht, statt stillschweigend eine Suche zu starten.

- `checkBrotherPrinterChannel({ port, channelInfo })` prüft eine ausdrücklich ausgewählte
  oder manuell eingegebene Adresse, ohne Suchmetadaten zu benötigen. Die Funktion liefert einen booleschen Wert und sucht niemals nach einem anderen Drucker oder wechselt zu ihm. Native Fehler werden weitergereicht. Eine erfolgreiche Prüfung bestätigt die Verbindung, nicht das Druckermodell oder das eingelegte Papier.

```ts
import {
  searchBrotherPrinters,
  BRLMPrinterPort, BRLMPrinterModelName,
} from '@rdlabo/capacitor-brotherprint';

const printers = await searchBrotherPrinters(
  { port: BRLMPrinterPort.wifi, searchDuration: 10 },
  BRLMPrinterModelName.QL_820NWB,
);
```


## Eine Sitzung in einer Druckansicht verwenden

1. Erstellen Sie beim Öffnen der Ansicht eine Sitzung und registrieren Sie Druckbenachrichtigungen.
2. Rufen Sie `prepare` auf, um Kandidaten zu erhalten. Zeigen Sie bei fehlenden Treffern ein leeres Ergebnis an; lassen Sie bei mehreren Treffern den Benutzer auswählen.
3. Übergeben Sie `port` und `channelInfo` des ausgewählten Kanals sowie Modell, Papier und Bild an `session.printImage`. Native Druckoptionen finden Sie unter [Drucken](/docs/print).
4. Rufen Sie im Handler zum Verlassen der Ansicht `dispose()` auf. Sie müssen nicht warten, bis der Druck abgeschlossen ist, um die Ansicht freizugeben.

Das folgende Beispiel zeigt die Einrichtung und Bereinigung einer Sitzung. Ein Beispiel, das Auswahl und Drucken verbindet, finden Sie im [TypeScript-Beispiel](https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.1/examples/plain-typescript.ts).


Verwenden Sie pro Druckansicht eine `BrotherPrinterSession`. Verbindungshilfen verwenden direkt die Capacitor-Plattform; die Sitzung verwaltet Suchergebnisse, Druckbenachrichtigungen und Freigabe. Verwenden Sie eine freigegebene Sitzung nicht erneut. Für Vorgänge, die nicht an die Lebensdauer einer Ansicht gebunden sind, bleiben die zustandslosen Hilfsfunktionen verfügbar.

```ts
import { BrotherPrinterSession, BRLMPrinterModelName, BRLMPrinterPort } from '@rdlabo/capacitor-brotherprint';

const session = new BrotherPrinterSession();
await session.listen({ onPrint: () => console.log('Printed') });
const printers = await session.prepare(
  { port: BRLMPrinterPort.wifi, searchDuration: 10 },
  BRLMPrinterModelName.QL_820NWB,
);
// Einen Drucker auswählen und dann session.printImage mit den vorhandenen nativen Optionen aufrufen.
// Im Handler zum Verlassen der Ansicht:
await session.dispose();
```

### Vorgänge, die länger als die Ansicht bestehen

Bei der Freigabe wird `closed` sofort auf true gesetzt und `printers` geleert. Eingereihte Suchvorgänge werden übersprungen und verspätete Ergebnisse ignoriert. Druck-Callbacks werden sofort eingestellt; die Freigabe wartet auf das Entfernen der Druck-Listener-Handles dieser Sitzung, einschließlich noch ausstehender Registrierungen. Eine aktive native Suche wird dennoch abgeschlossen, bevor ein weiterer Verbindungsvorgang beginnt. Ein bereits gestarteter nativer Druckvorgang wird nicht abgebrochen. Prüfen Sie nach asynchronen App-Vorgängen wie Bilderzeugung, Speicherung oder einem Dialog `closed`, bevor Sie Benutzeroberflächen anzeigen. Aufrufe von `search`, `prepare` und `printImage` auf einer geschlossenen Sitzung starten keine nativen Vorgänge. Es werden keine automatischen Druckwiederholungen hinzugefügt.


## Eine Verbindung speichern

Übergeben Sie drei Callbacks, um localStorage, sessionStorage, Ionic Storage oder einen anderen String-Speicher zu verwenden. Das Plugin erkennt keine Speicherimplementierung und ist auch nicht von einer abhängig.

```ts
const session = new BrotherPrinterSession({
  storage: {
    get: (key) => localStorage.getItem(key),
    set: (key, value) => localStorage.setItem(key, value),
    remove: (key) => localStorage.removeItem(key),
  },
  storagePrefix: 'labels:',
});
```

Bei einem asynchronen Speicher übergeben Sie dieselben Callbacks, die dessen Promises zurückgeben:

```ts
const session = new BrotherPrinterSession({
  storage: {
    get: (key) => storage.get(key),
    set: (key, value) => storage.set(key, value),
    remove: (key) => storage.remove(key),
  },
});
```

### Gespeicherte Daten und Wiederverwendung

`get` liefert einen String oder null/undefined; Callbacks können synchron oder asynchron abschließen. Die Sitzung serialisiert Verbindungsmetadaten als JSON unter `${storagePrefix}last-printer` (Standard: `brotherprint:last-printer`). Sie speichert niemals Bilder oder Schrift- beziehungsweise Papiereinstellungen. Verwenden Sie in mehreren Ansichten dasselbe Präfix, um eine Verbindung wiederzuverwenden.

`printImage` speichert vor dem Drucken den ausgewählten Port, die Adresse und das konfigurierte Modell. Damit wird die versuchte Verbindung gespeichert, kein Nachweis eines erfolgreichen Drucks. `prepare` lädt sie, wenn das dritte Argument fehlt, prüft die Übereinstimmung von Modell und Port sowie die Verfügbarkeit und sucht andernfalls nach Druckern. Bei USB wird immer erneut gesucht. Ein ausdrücklich übergebener Kanal hat Vorrang vor gespeicherten Daten; `null` überspringt die gespeicherte Verbindung. Lese- und Schreibfehler des Speichers sowie ungültiges gespeichertes JSON werden ignoriert; native Fehler werden weiterhin weitergereicht. Eine Freigabe während eines Speichervorgangs verhindert nachfolgende native Vorgänge.

### Eine gespeicherte Verbindung entfernen

`await session.clearSavedPrinter()` entfernt die gespeicherte Verbindung. Fehler beim Entfernen werden weitergereicht, damit die App den Fehlschlag melden kann. Ohne Speicher-Callbacks behalten Sitzungen nur ansichtslokalen Zustand. Zustandslose Hilfsfunktionen akzeptieren weiterhin vorherige Kanäle, die von der App verwaltet werden.

## Ein manuell eingegebenes Ziel prüfen

Speichern Sie bei einem manuell eingegebenen Gerät neben der Adresse auch den ausgewählten Port. Leiten Sie Bluetooth nicht aus Satzzeichen ab: iOS-Bluetooth verwendet eine Seriennummer, BLE einen lokalen SDK-Namen. Rufen Sie `checkBrotherPrinterChannel` auf und drucken Sie nur dann über denselben Kanal, wenn er verfügbar ist. Verwenden Sie `prepareBrotherPrinters` für USB-Suche und -Berechtigungen. Die Anwendung stellt Modell- und Etiketteneinstellungen unabhängig davon bereit.


## Hilfsfunktionen für Verbindungen und Modelle

- `brotherPrinterPorts(model, isAndroid?)` liefert Verbindungsmöglichkeiten für einen vorhandenen
  Modell-Enum-Wert. Ohne explizite Plattformvorgabe wird `Capacitor.getPlatform()` verwendet. USB ist nur unter Android verfügbar. `wifi` umfasst auch kabelgebundenes Ethernet. Unbekannte Modelle liefern ein leeres Array.
- `resolveBrotherPrinterPort(model, saved?)` behält eine unterstützte gespeicherte Verbindung bei.
  Andernfalls wird bei QL-800/QL-810W unter Android USB bevorzugt, danach die erste unterstützte Verbindung. Wenn keine Verbindung unterstützt wird, liefert die Funktion `undefined`.
- `brotherPrinterPortLabel(port)` liefert einen üblichen Anzeigenamen: Wi-Fi, Bluetooth,
  Bluetooth LE oder USB. Ein undefinierter oder unbekannter Port liefert einen leeren String.
- `brotherPrinterModel(name)` ordnet einen bei der Suche gefundenen Namen dem vorhandenen Modell-Enum zu,
  einschließlich Produktaliasen wie QL-820NWBc. Unbekannte Namen liefern `undefined`.

## Reihenfolge von Suchvorgängen und Fehler

Suche, Vorbereitung und explizite Verbindungsprüfungen teilen sich eine Warteschlange. Der nächste Aufruf beginnt erst, wenn der vorherige native Vorgang und die Listener-Bereinigung abgeschlossen sind, auch wenn der vorherige Aufruf fehlgeschlagen ist. Kein JavaScript-Suchtimeout gibt die Warteschlange vorzeitig frei. Kombinieren Sie diese Hilfsfunktionen nicht mit gleichzeitigen direkten Aufrufen von `BrotherPrint.search()` oder Verbindungsprüfungen: Direkte Aufrufe umgehen die Warteschlange, und native Ereignisse haben keine Anfrage-ID. Auch das Drucken bleibt außerhalb dieser Warteschlange; warten Sie auf die Verbindungsvorbereitung, bevor Sie `printImage` aufrufen. Das optionale Modell filtert Nicht-USB-Ergebnisse. USB-Ergebnisse bleiben erhalten, selbst wenn das SDK ein leeres Modell oder eine leere Adresse zurückgibt. Die Verbindungsauswahl erweitert nicht die native Unterstützung; beachten Sie die vorhandene README und die SDK-Installationsanleitung.

Bei zustandslosen Funktionen verantwortet die App Ladeanzeigen, Auswahloberfläche und Caching. Übergeben Sie ihren gespeicherten Kanal an `prepareBrotherPrinters`, wählen Sie einen zurückgegebenen Kanal und rufen Sie das vorhandene `BrotherPrint.printImage()` mit dem ausgewählten Port und der Adresse auf. Die Hilfsfunktion wiederholt den Druck nicht. Speichern Sie den gewählten Kanal in der App für die nächste Vorbereitung.

Verwenden Sie `searchDuration: 3` für eine kurze Vorabsuche oder `10` für eine normale Suche. Dies sind Entscheidungen des Aufrufers, keine automatischen Wiederholungen. Ein Abbruch über die vorhandenen nativen Methoden betrifft die aktive Suche; eingereihte Hilfsfunktionsaufrufe werden dadurch nicht entfernt. Es werden weder eine Controller-Instanz noch ein separater Aufruf zur Listener-Bereinigung benötigt.

Siehe das [Druckbeispiel in reinem TypeScript](https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.1/examples/plain-typescript.ts). In einem Quellcode-Checkout testet `npm test` die Hilfsfunktionen und prüft die Typen dieses Beispiels.
