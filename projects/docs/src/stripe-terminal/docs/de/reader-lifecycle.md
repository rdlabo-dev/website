---
title: "Lebenszyklus des Lesegeräts"
code: ["reader-lifecycle/reader-lifecycle.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{"reader-lifecycle.ts":[1,1]}},{"id":"auf-softwareupdates-hören","activeLine":{"reader-lifecycle.ts":[2,35]}},{"id":"auf-status-und-eingabeaufforderungen-hören","activeLine":{"reader-lifecycle.ts":[35,63]}},{"id":"die-anzeige-des-lesegeräts-festlegen","activeLine":{"reader-lifecycle.ts":[63,78]}},{"id":"die-suche-abbrechen","activeLine":{"reader-lifecycle.ts":[78,80]}},{"id":"trennen-und-wiederverbinden","activeLine":{"reader-lifecycle.ts":[80,112]}},{"id":"fehlerbehandlung","activeLine":{"reader-lifecycle.ts":[112,119]}}]
sourceRevision: "0a25cc95b2345dff873657b31f51ea4f9afa4b4f8fb979406f402cd645103c42"
---
Behalten Sie Softwareupdates, Status und Anzeigemeldungen des Lesegeräts unter Kontrolle, damit Terminal-Operationen den Bezahlvorgang nicht unterbrechen.

## Auf Softwareupdates hören

Das Lesegerät kann bei Bedarf selbstständig ein Update starten. Hören Sie auf verfügbare Updates, installieren Sie sie oder brechen Sie sie ab und zeigen Sie während einer Installation den Fortschritt an.

Einschränkungen:

- Rufen Sie `setSimulatorConfiguration` **vor** `discoverReaders` auf, wenn Sie ein simuliertes Update benötigen (`SimulateReaderUpdate.UpdateAvailable` oder `Required`). Im Web hat `setSimulatorConfiguration` keine Wirkung.
- `StartInstallingUpdate`, `ReaderSoftwareUpdateProgress` und `FinishInstallingUpdate` gelten für Bluetooth- und USB-Lesegeräte. Ein **verpflichtendes** Update beim ersten Verbinden wird automatisch installiert, **vor** `ConnectedReader` und vor der Auflösung von `connectReader()`. Reihenfolge: `StartInstallingUpdate` → `ReaderSoftwareUpdateProgress` (wiederholt) → `FinishInstallingUpdate` → `ConnectedReader` → Auflösung von `connectReader()`. Zeigen Sie den Vorgang in der Oberfläche an, damit eine lange Verbindung nicht für einen Stillstand gehalten wird.
- `ReportAvailableUpdate` bedeutet, dass ein optionales Update bereitsteht; rufen Sie `installAvailableUpdate` auf, wenn der Händler warten kann. Starten Sie während des Bezahlvorgangs keine optionale Installation.
- `progress` ist eine Fließkommazahl zwischen `0` und `1`.
- `cancelInstallUpdate` bricht eine laufende Installation ab, sofern das SDK dies zulässt. Die Webmethoden zum Installieren und Abbrechen haben keine Wirkung.
- iOS Tap to Pay meldet Start, Fortschritt und Ende der Installation ebenfalls über den Delegaten des Tap-to-Pay-Lesegeräts. Die Android-Tap-to-Pay-Oberfläche ist davon getrennt; siehe [Tap to Pay](/docs/tap-to-pay).

!::installAvailableUpdate::

!::cancelInstallUpdate::

!::setSimulatorConfiguration::

## Auf Status und Eingabeaufforderungen hören

Rufen Sie bei Lesegeräten ohne eigenes Display den Akkustand, Ereignisse des Lesegeräts, Anzeigemeldungen und Eingabeaufforderungen über Listener ab und zeigen Sie sie auf dem Mobilgerät an.

`BatteryLevel`, `ReaderEvent`, `RequestDisplayMessage` und `RequestReaderInput` gelten für Bluetooth- und USB-Lesegeräte. Akkuaktualisierungen werden beim Verbinden und etwa alle 10 Minuten ausgelöst.

## Die Anzeige des Lesegeräts festlegen

Zeigen Sie auf Geräten mit eigenem Display den Warenkorbinhalt vor `collectPaymentMethod` an. Leeren Sie die Anzeige anschließend. Internet-Lesegeräte im Web unterstützen diese Aufrufe.

!::setReaderDisplay::

!::clearReaderDisplay::

!::Cart::

!::CartLineItem::

## Die Suche abbrechen

Rufen Sie `cancelDiscoverReaders` auf, wenn der Nutzer den Suchbildschirm verlässt oder ein Timeout eintritt. Bei Erfolg lösen native Plattformen `CancelDiscoveredReaders` aus. Auch wenn kein Vorgang läuft, wird das Promise aufgelöst.

Die iOS-Bluetooth-Suche kann lange laufen und fortlaufend `DiscoveredReaders` auslösen. Kombinieren Sie den Abbruch mit `bluetoothScanWaitTime` oder einem eigenen Timeout. Im Web hat `cancelDiscoverReaders` keine Wirkung.

!::cancelDiscoverReaders::

## Trennen und Wiederverbinden

`disconnectReader` trennt das aktuelle Lesegerät. Ist keines verbunden, wird das Promise aufgelöst.

Verhalten von `DisconnectedReader`:

- Jeder Lesegerätetyp löst es als Antwort auf `disconnectReader()` **ohne** `reason` aus.
- Bluetooth und USB lösen es außerdem **mit** einem `reason` aus, wenn das Lesegerät vollständig getrennt ist. Eine vom Nutzer veranlasste Trennung führt somit zu **zwei** Ereignissen: der Bestätigung des Aufrufs und anschließend dem Verbindungsende mit Begründung.

Behandeln Sie `ConnectionStatusChange` **nicht** als unerwarteten Verbindungsabbruch. Informieren Sie den Nutzer mit `UnexpectedReaderDisconnect`. Sie können `discoverReaders` erneut aufrufen, um die Verbindung wiederherzustellen; bieten Sie immer einen Timeout oder `cancelDiscoverReaders` an.

Setzen Sie in `connectReader` für Tap to Pay und Bluetooth `autoReconnectOnUnexpectedDisconnect: true`, wenn das SDK einen erneuten Versuch unternehmen soll. Hören Sie anschließend auf:

- `ReaderReconnectStarted` — enthält `reader` und `reason`
- `ReaderReconnectSucceeded`
- `ReaderReconnectFailed`

`cancelReaderReconnection` bricht eine laufende Wiederverbindung ab. Im Web haben `rebootReader` und `cancelReaderReconnection` keine Wirkung.

!::getConnectedReader::

!::rebootReader::

!::cancelReaderReconnection::

## Fehlerbehandlung

`Failed` wird ausgelöst, wenn Erfassung oder Bestätigung fehlschlägt; das zugehörige Promise wird mit denselben Werten für `message` / `code` / `declineCode` abgewiesen, sofern das native SDK sie bereitstellt.

`UnexpectedReaderDisconnect` bedeutet, dass Terminal die Verbindung zum Lesegerät außerhalb von `disconnectReader()` verloren hat. Prüfen Sie bei Bluetooth und USB `DisconnectedReader` auf den `DisconnectReason` (`POWERED_OFF`, `BLUETOOTH_DISABLED`, `CRITICALLY_LOW_BATTERY` und weitere).
