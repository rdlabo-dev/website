---
title: "Echtzeit und Offline"
sourceRevision: "77a5be22679f789e3deb845fb348a34b8f9d85044685a2ea783ca3728ad8ab32"
---
# Echtzeit und Offline

WebSocket-Hilfsfunktionen für Durable Objects und tabellenunabhängige Verträge für Offline-Replikate. Produktschemas, Zod-Strukturen und Fachregeln bleiben in der Anwendung.

## Echtzeit mit Durable Objects

Der Haupteinstiegspunkt und `/realtime` stellen dieselben gezielten Echtzeit-Grundfunktionen bereit:

- `configureHibernationAutoResponse()` konfiguriert Ping/Pong zur Laufzeit, ohne JavaScript aufzuwecken.
- `upgradeHibernationWebSocket()` ordnet den Zustand zu, bevor die WebSocket-Verbindung angenommen wird.
- `broadcastHibernationWebSockets()` sendet Nachrichten über die von `getWebSockets()` wiederhergestellten Sockets.
- `acknowledgeHibernationWebSocketClose()` und `closeHibernationWebSocket()` vereinheitlichen die Behandlung geschlossener Verbindungen.
- `retryDurableObjectOperation()` wiederholt nur Vorgänge bei Fehlern, die als `retryable` und nicht als `overloaded` markiert sind. Erstellen Sie bei jedem Versuch innerhalb der Operation einen neuen Stub.
- `invokeDurableObjectFetch()` erhält den strukturierten Antwort-/Fehlervertrag für DO-Aufrufe.

Die WebSocket-Protokollparser prüfen die angebotenen Unterprotokolle vor dem Upgrade.

## Verträge für Offline-Replikate

`@rdlabo/workers-hono-kit/offline` ist tabellenunabhängig. Produktschemas, Zod-Objekte, Positivlisten für öffentliche Spalten, Schema-Hashes und Fachregeln bleiben in der Anwendung.

`defineRestDbMethodConverter()` typisiert einen reinen Konverter zwischen REST-Methoden und Tabellen. Jede abgebildete Tabelle und Spalte ist erforderlich, auch Spalten mit zulässigen Nullwerten oder Standardwerten. Lassen Sie eine automatisch inkrementierte `id` im produktseitigen Tabellenschema weg, wenn eine Create-Methode sie bewusst nicht verwaltet.

Die Hilfsfunktionen für das Austauschformat überführen Werte in die kanonische Form:

- `toReplicaIsoDatetime()` → UTC ISO-8601
- `toReplicaDateOnly()` → `YYYY-MM-DD` oder `null`
- `toTinyIntFlag()` / `fromTinyIntFlag()` → Konvertierung zwischen booleschen Werten und tinyint
- `replicaNowIso(clock?)` → injizierbare aktuelle Uhrzeit

Die Journal-Hilfsfunktionen setzen Cursor-Abdeckung, Aufbewahrung, Mutationstransaktionen und das Verhalten beim Erstellen eines neuen Ausgangsstands durch. Die Kompatibilitätshilfsfunktionen für das Austauschformat ermöglichen es einer Anwendung, ausdrücklich freigegebene frühere Fingerprints zu akzeptieren und zugleich einen aktuellen kanonischen Fingerprint beizubehalten.

## Nächster Schritt

Fahren Sie mit [Tests und Betrieb](./testing-operations.md) fort oder lesen Sie unter [Offline-API](./api-offline.md) die Details zu den Exporten für Konverter und Austauschformate.
