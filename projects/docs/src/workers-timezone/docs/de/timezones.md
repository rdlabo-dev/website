---
title: "Zeitzonen und Kalendertage"
sourceRevision: "ae712728312a984ab84b088a37db99564eb16864e55834d0f7c25ad44c893109"
---
# Zeitzonen und Kalendertage

Ein JavaScript-`Date` stellt einen Zeitpunkt dar. Ein `BusinessDate` ist eine Kalenderzeichenfolge wie `2026-07-01`; ein `BusinessDateTime` ist eine lokale Uhrzeit wie `2026-07-01 09:00:00`. Keine der Zeichenfolgen enthält eine Zeitzone. Verwenden Sie beim Zurückkonvertieren in einen Zeitpunkt eine ausdrückliche IANA-Zeitzone.

## Konfiguration

`initializeTimezone({ timeZone })` setzt den Standard für eine Modulinstanz. Das wiederholte Setzen derselben kanonischen Zeitzone ist sicher; der Wechsel zu einer anderen löst einen Fehler aus. Konfigurieren Sie sie während der Modulauswertung mit statischen Einstellungen, die für die gesamte Bereitstellung gelten. Ohne Initialisierung ist der Standard `Asia/Tokyo`.

Übergeben Sie für anfrage-, mandanten- oder nutzerspezifische Einstellungen eine Zeitzone, ohne den Standard zu verändern:

```ts
import { toLocalDateTime, localDateTimeToInstant } from '@rdlabo/workers-timezone';

const wallClock = toLocalDateTime(new Date('2026-07-01T13:00:00Z'), 'America/New_York');
// '2026-07-01 09:00:00'
const instant = localDateTimeToInstant('2026-07-01', '09:00:00', 'America/New_York');
// 2026-07-01T13:00:00.000Z
```

`TIME_ZONES` stellt gebräuchliche Werte für die Autovervollständigung bereit, keine vollständige Positivliste. Andere IANA-IDs, die die Workers-`Intl`-Laufzeit unterstützt, werden akzeptiert und zur Laufzeit validiert.

## Sommerzeitwechsel

- Bei einer doppelt vorkommenden lokalen Uhrzeit wird der frühere Zeitpunkt gewählt.
- Eine übersprungene lokale Uhrzeit löst `RangeError` aus.
- `startOfDay` und `endOfDay` geben die erste und letzte darstellbare ganze Sekunde zurück, einschließlich
  Tagen mit übersprungener Mitternacht oder wiederholter letzter lokaler Uhrzeit. Ein vollständig übersprungenes Datum löst einen Fehler aus.
- `addDays` ändert das Kalenderdatum, statt einen Zeitpunkt um eine feste Millisekundenzahl zu verschieben. Ein lokaler
  Tag dauert nicht zwingend 24 Stunden. `endOfDay` ist keine inklusive Obergrenze mit Millisekundengenauigkeit.

Die Konstruktion ungültiger Kalenderwerte löst einen Fehler aus, statt den JavaScript-Datumsüberlauf zu akzeptieren. `normalizeBusinessDate` gibt für ungültige reine Datumseingaben `null` zurück.

## Grenze zur Datenbank

Dieses Paket konfiguriert MySQL nicht. `@rdlabo/workers-mysql` besitzt unabhängige Wire-Hilfsfunktionen mit festem `+09:00`. Das Ändern der Geschäftszeitzone hier ändert weder diese Hilfsfunktionen noch mysql2-Optionen oder die MySQL-Sitzungszeitzone. Trennen Sie die Speicherung von Zeitpunkten von der Kalenderkonvertierung für Nutzer.

Siehe [API](./api.md) und [Migration](./migration.md).
