---
title: "API"
sourceRevision: "9a5b4e8dddd6e80b2a6036c60d3372696f40384e1db6187bcaf92c0d984f9f80"
---
Öffentliche Einstiegspunkte von `@rdlabo/workers-hono-kit` v0.12.2 und den eigenständigen Paketen für MySQL und Zeitzonen.

#### `module` @rdlabo/workers-hono-kit

Workers-kompatible Hilfsfunktionen für Hono und Infrastruktur ohne MySQL-Laufzeitabhängigkeit.

#### `module` @rdlabo/workers-mysql

Die maßgebliche Datenschicht für MySQL und Hyperdrive auf Workers.

#### `module` @rdlabo/workers-mysql/drizzle

Optionale Drizzle-Konfiguration und JST-Spalten.

#### `module` @rdlabo/workers-mysql/migrations

Node.js-Hilfsfunktionen für Migrationen und die Erstellung eines Ausgangsstands für bestehende Datenbanken.

#### `module` @rdlabo/workers-mysql/testing

Lokale MySQL/Drizzle-Testdatenbank und Test-Doubles.

#### `module` @rdlabo/workers-timezone

Die maßgeblichen IANA-Kalender- und Datums-/Uhrzeitkonvertierungen.

#### `module` @rdlabo/workers-hono-kit/mysql

Hono-Containeradapter für das MySQL-Paket.

#### `module` @rdlabo/workers-hono-kit/db

Veralteter Kompatibilitäts-Reexport des MySQL-Pakets.

#### `module` @rdlabo/workers-hono-kit/business-time

Veralteter Kompatibilitäts-Reexport; setzt `@rdlabo/workers-timezone` voraus.

#### `module` @rdlabo/workers-hono-kit/offline

Tabellenunabhängige REST/DB-Methodenkonverter und Hilfsfunktionen für das Austauschformat von Replikaten.

#### `module` @rdlabo/workers-hono-kit/realtime

WebSocket-Hilfsfunktionen und Wiederholungslogik für Durable Objects.

#### `module` @rdlabo/workers-hono-kit/testing

Drizzle-Testdatenbank, Test-Doubles, Testdaten und Binding-Doubles.

Anwendungsbeispiele finden Sie unter [Datenschicht](/docs/data-layer), [Echtzeit und Offline](/docs/realtime-offline) und [Tests und Betrieb](/docs/testing-operations).
