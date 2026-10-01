---
title: "Drizzle und Datumswerte"
sourceRevision: "cb2864278489e406bf537d9e3209860bdf658959ef22aa45d90844ab560a8d42"
---
# Drizzle und Datumswerte

Installieren Sie beim Import von `/drizzle` oder `/testing` `drizzle-orm`. Es ist eine optionale Peer-Abhängigkeit, damit Anwendung und Schemas dieselbe Drizzle-Typidentität verwenden. Stellen Sie sicher, dass es nur einmal aufgelöst wird, insbesondere bei lokalen Paketverknüpfungen. Der Root-Import lädt Drizzle nicht.

Die Anwendung verwaltet Schemadefinitionen und erstellt das ORM. `DRIZZLE_ORM_OPTIONS` liefert `casing: 'snake_case'`; `workersDrizzleConfig` wendet die entsprechende Einstellung auf die Drizzle-Kit-Konfiguration an. Ändern Sie die Benennung eines bestehenden Schemas nicht, ohne das erzeugte SQL zu prüfen.

## Verbindungsstandards

`hyperdriveConnectionOptions` setzt `disableEval: true`, `decimalNumbers: true` und `timezone: '+09:00'`. `createHyperdriveDatabase` akzeptiert Überschreibungen über `connectionOptions`. Lassen Sie eval für Workers deaktiviert. Die numerische DECIMAL-Konvertierung kann Genauigkeit verlieren. Verwenden Sie `decimalNumbers: false` und verarbeiten Sie Zeichenfolgen, wenn exakte Dezimalwerte erforderlich sind.

## Festes JST ist ein Speichervertrag

`MYSQL_TIMEZONE` ist fest auf `+09:00` gesetzt, unabhängig von der Konfiguration von `@rdlabo/workers-timezone` und historischen IANA-Versätzen. Es steuert die mysql2-Konvertierung von JavaScript-`Date`-Werten, nicht die MySQL-Sitzungsvariable `time_zone`. Vom Server erzeugte Werte `CURRENT_TIMESTAMP` folgen der Sitzungszeitzone. Prüfen Sie diese deshalb separat gegen Ihre Speicherkonvention.

`jstTimestamp` und `jstDatetime` stellen Spaltentypen mit unveränderter Date-Durchgabe bereit. `jstDate` normalisiert DATE-Eingaben über `toJstDate`. Diese Funktionen konfigurieren den Server nicht und automatisieren nicht die Speicherung in beliebigen Zeitzonen. Bereitstellungen außerhalb von JST sollten passendes Spalten- und Verbindungsverhalten wählen, statt anzunehmen, dass diese Hilfsfunktionen der Geschäftszeitzone folgen.

`toJstDate` reicht eine bereits passend geformte Zeichenfolge `YYYY-MM-DD` durch, ohne das Kalenderdatum zu validieren. Validieren Sie Nutzereingaben separat. Dies entspricht nicht dem strengeren `normalizeBusinessDate` aus dem Zeitzonenpaket.

Für Aktualisierungszeitstempel liefert `jstOnUpdateNow(fsp?)` den SQL-Ausdruck zur Verwendung mit `.$onUpdateFn(() => jstOnUpdateNow(6))`. Prüfen Sie sowohl erzeugte Migrationen als auch die Serverzeitzone.

Siehe [Laufzeit](./runtime.md), [Werkzeuge](./tooling.md) und [API](./api.md).
