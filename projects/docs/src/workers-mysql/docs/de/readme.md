---
title: "Erste Schritte"
sourceRevision: "5df84bf9a09391b9d0102756651e33804bba6160b18422967bdb897dd591709f"
---
# @rdlabo/workers-mysql

MySQL- und Hyperdrive-Infrastruktur für Cloudflare Workers. Kombinieren Sie aufrufgebundenen Primary-/Replikat-Zugriff, Deadlock-Wiederholungen, optionale Drizzle-Hilfsfunktionen und Node.js-Migrations-/Testwerkzeuge. Die Anwendung behält dabei ihre Schemas und Zugangsdaten.

Der Worker muss Node.js-Kompatibilität aktivieren, da `mysql2` Node.js-Netzwerk-APIs verwendet:

```toml
# wrangler.toml
compatibility_flags = ["nodejs_compat"]
```

## Installation

```bash
npm install @rdlabo/workers-mysql
```

`mysql2` ist als direkte Abhängigkeit enthalten. Ergänzen Sie `drizzle-orm`, wenn Sie `/drizzle` oder `/testing` verwenden:

```bash
npm install drizzle-orm
```

Drizzle als Peer-Abhängigkeit ermöglicht der Anwendung und ihren Schemas eine gemeinsame Typidentität.

Die öffentlichen Verbindungstypen verwenden Node.js-Deklarationen. `@types/node@>=20.19.43` ist eine erforderliche Peer-Abhängigkeit, auch bei Bereitstellung auf Workers. TypeScript-Anwendungen sollten sie direkt hinzufügen, damit ihre globalen Deklarationen bei strikten Paketlayouts einschließlich pnpm sichtbar sind:

```sh
npm install -D @types/node@20
# Für pnpm-Nutzer:
pnpm add -D @types/node@20
```

Verwenden Sie die passende unterstützte Hauptversion für Ihre Werkzeuge. Automatische Peer-Installation allein macht diese globalen Deklarationen unter pnpm möglicherweise nicht für den TypeScript-Compiler der Anwendung sichtbar.

## Mit einer echten Abfrage beginnen

[Ihre erste MySQL-Abfrage ausführen](/docs/quickstart): Starten Sie eine kurzlebige lokale Datenbank, führen Sie ein parametrisiertes `SELECT` aus und prüfen Sie das Ergebnis. Die Anleitung zeigt anschließend den vollständigen Worker-Handler für eine bestehende Hyperdrive-Bindung.

## Einen Einstiegspunkt wählen

| Import                             | Zuständigkeit                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| `@rdlabo/workers-mysql`            | Workers-MySQL- und Hyperdrive-Laufzeit, Wiederholungen, Schreibergebnisse und JST-Wire-Hilfsfunktionen |
| `@rdlabo/workers-mysql/drizzle`    | Drizzle-Konfiguration und JST-Spaltenhilfsfunktionen                                    |
| `@rdlabo/workers-mysql/migrations` | Node.js-Migrationen und Baseline-Hilfsfunktionen für bestehende Datenbanken                               |
| `@rdlabo/workers-mysql/testing`    | Lokale MySQL-/Drizzle-Testdatenbank und Fakes                                     |

## Schnellstart

Erstellen Sie die Datenbank innerhalb jedes Worker-Aufrufs. In diesem Ausschnitt enthält `env` die Hyperdrive-Bindungen der Anwendung und `schema` ihr eigenes Drizzle-Schema:

```ts
import { createHyperdriveDatabase } from '@rdlabo/workers-mysql';
import { DRIZZLE_ORM_OPTIONS } from '@rdlabo/workers-mysql/drizzle';
import { drizzle } from 'drizzle-orm/mysql2';

const db = createHyperdriveDatabase({
  primaryHyperdrive: env.PRIMARY,
  replicaHyperdrive: env.REPLICA,
  createOrm: (connection) => drizzle(connection, { schema, ...DRIZZLE_ORM_OPTIONS }),
});
```

Mit aktiviertem `nodejs_compat` ist der Paketwurzelpfad sicher für die Workers-Laufzeit und lädt weder Drizzle noch ausschließlich für Node gedachte Migrationslogik.

Speicherhilfsfunktionen mit festem `+09:00` bilden einen MySQL-Wire-Vertrag. Sie folgen nicht den IANA-Anzeigezeitzonen aus [`@rdlabo/workers-timezone`](https://docs.rdlabo.dev/projects/workers-timezone/docs/readme).

## Hono-Integration

Hono-Anfragecontainer verwenden den Adapter in `@rdlabo/workers-hono-kit/mysql`:

```ts
import { createContainerRuntime } from '@rdlabo/workers-hono-kit/mysql';
```

Dieser Adapter ist ab Hono Kit `0.12.0` verfügbar. Installieren Sie beide Pakete:

```sh
npm install @rdlabo/workers-mysql @rdlabo/workers-hono-kit
```

## Dokumentation

- [Laufzeit](https://docs.rdlabo.dev/projects/workers-mysql/docs/runtime) — Anfragelebensdauer, Primary-/Replikat-Lesezugriffe und sichere Wiederholungen.
- [Drizzle und Datumswerte](https://docs.rdlabo.dev/projects/workers-mysql/docs/drizzle) — Schema-Zuständigkeit, optionale Peer-Abhängigkeit und Speicherung mit festem JST.
- [Migrationen und Tests](https://docs.rdlabo.dev/projects/workers-mysql/docs/tooling) — Node.js-Werkzeuge und destruktive Testhilfsfunktionen.
- [API](https://docs.rdlabo.dev/projects/workers-mysql/docs/api) — öffentliche Exporte nach Einstiegspunkt.
- [Migration](https://docs.rdlabo.dev/projects/workers-mysql/docs/migration) — Kompatibilitätsimports aus dem Kit.

Diese Anleitungen beschreiben diese Quellcoderevision. Verwenden Sie für eine installierte Version das passende Release-Tag.

## Migration von workers-hono-kit

Kit `0.12.0` verändert die Importgrenzen. Seine alten `/db`-Exporte und datenbankbezogenen `/testing`-Exporte bleiben als gepflegte Kompatibilitätspfade mit `@deprecated`-Hinweisen verfügbar; eine Entfernung ist nicht geplant. Die Importzuordnung finden Sie unter [Migration](https://docs.rdlabo.dev/projects/workers-mysql/docs/migration).
