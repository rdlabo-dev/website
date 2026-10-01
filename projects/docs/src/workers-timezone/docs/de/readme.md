---
title: "Erste Schritte"
sourceRevision: "60d2c684422539fad0b404ef0516a5f272e37792e4c5abc13f274e8d43105fc6"
---
# @rdlabo/workers-timezone

Zeitzonenbewusste Hilfsfunktionen für Kalenderdaten und lokale Uhrzeiten in Cloudflare Workers. Workers arbeiten mit UTC-Zeitpunkten. Dieses Paket ermöglicht einer Anwendung, einmal pro Isolate eine IANA-Zeitzone zu wählen, und berücksichtigt Sommerzeit beim Konvertieren zwischen Zeitpunkten und lokalen Datumswerten.

Probieren Sie die [Konvertierungsdemo](/docs/quickstart) aus. Wir empfehlen, die Bibliothek mit [ESLint-Prüfungen](/docs/eslint) zu kombinieren, um implizite Zeitzonenverwendung zu erkennen.

## Installation

```sh
npm install @rdlabo/workers-timezone
```

## Schnellstart

```ts
import { TIME_ZONES, initializeTimezone, localDateTimeToInstant, toLocalDateTime } from '@rdlabo/workers-timezone';

initializeTimezone({ timeZone: TIME_ZONES.NEW_YORK });

toLocalDateTime(new Date('2026-07-01T13:00:00Z'));
// '2026-07-01 09:00:00'

localDateTimeToInstant('2026-07-01', '09:00:00');
// 2026-07-01T13:00:00.000Z
```

Initialisieren Sie einmal während der Modulauswertung, niemals pro Anfrage oder Mandant. Ohne Initialisierung ist der Standard `Asia/Tokyo`. Übergeben Sie Konvertierungen für nutzerspezifisches Verhalten eine ausdrückliche Zeitzone.

## Dokumentation

- [Zeitzonen und Kalenderdaten](https://docs.rdlabo.dev/projects/workers-timezone/docs/timezones) — Konfiguration, Sommerzeit und Datenbankgrenzen.
- [API](https://docs.rdlabo.dev/projects/workers-timezone/docs/api) — Konvertierungen, Kalenderoperationen, Typen und Kompatibilitätsnamen.
- [Migration](https://docs.rdlabo.dev/projects/workers-timezone/docs/migration) — Wechsel vom Kit und Verhaltensänderungen.

Diese Anleitungen beschreiben diese Quellcoderevision. Verwenden Sie für eine installierte Version das passende Release-Tag.

<!-- rdlabo-docs-omit -->

## Entwicklung

```sh
npm install
npm run typecheck
npm test
npm run build
```

## Lizenz

MIT

<!-- /rdlabo-docs-omit -->
