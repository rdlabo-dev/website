---
title: "Datenschicht"
sourceRevision: "1b9ddd010afdf64e0b3b859fcad8be611f51c3c3d1be332a19f4f6934e027018"
---
# Datenschicht

Eigenständiger MySQL-/Hyperdrive-Zugriff für Workers mit einem schlanken Hono-Containeradapter. Die Speicherhilfsfunktionen mit festem Offset `+09:00` sind unabhängig von den IANA-Zeitzonen für die Anzeige.

Importieren Sie Datenbankhilfsfunktionen aus `@rdlabo/workers-mysql`. Das Paket installiert `mysql2` direkt. Fügen Sie `drizzle-orm` nur hinzu, wenn Sie den Einstiegspunkt `/drizzle` oder `/testing` verwenden. Der alte Pfad `@rdlabo/workers-hono-kit/db` ist ein veralteter Kompatibilitäts-Reexport.

Workers, die `mysql2` verwenden, müssen die dafür erforderlichen Node.js-Netzwerk-APIs aktivieren:

```toml
# wrangler.toml
compatibility_flags = ["nodejs_compat"]
```

```sh
npm install @rdlabo/workers-mysql drizzle-orm
npm install -D @types/node@20
```

Informationen zur Installation eines Tarballs einer Vorabversion finden Sie unter [Entwicklung](./development.md).

## Hyperdrive-Datenbank

`createHyperdriveDatabase()` öffnet Verbindungen zur primären Datenbank und zum Replikat aus Hyperdrive-Bindings erst bei Bedarf. Informationen zu Lese-/Schreibpfaden, Grenzen der Wiederholungslogik und der Lebensdauer einer Invocation finden Sie unter [Workers MySQL zur Laufzeit](https://docs.rdlabo.dev/projects/workers-mysql/docs/runtime).

```ts
import { createHyperdriveDatabase } from '@rdlabo/workers-mysql';
import { DRIZZLE_ORM_OPTIONS } from '@rdlabo/workers-mysql/drizzle';
import { drizzle } from 'drizzle-orm/mysql2';

const db = createHyperdriveDatabase({
  primaryHyperdrive: env.DB_PRIMARY,
  replicaHyperdrive: env.DB_REPLICA,
  createOrm: (primary) => drizzle(primary, { schema, ...DRIZZLE_ORM_OPTIONS }),
});

const rows = await db.read<Item>('SELECT * FROM items WHERE id = ?', [id]);
const freshRows = await db.query<Item[]>('SELECT * FROM items WHERE id = ?', [id]);
await db.write((dz) => dz.insert(items).values(input));
await db.transaction((tx) => tx.insert(items).values(input));

const snapshot = await db.readTransaction(async ({ orm, query }) => ({
  items: await orm.select().from(items),
  count: await query<{ count: number }[]>('SELECT COUNT(*) count FROM items'),
}));
```

MySQL erzwingt bei jedem Transaktionsversuch `READ ONLY`. Drizzle stellt keinen eigenen Typ für schreibgeschützte Transaktionen bereit. Anwendungen können `orm` daher in eine auf SELECT beschränkte Fassade kapseln, wenn sie die Einschränkung auch zur Kompilierzeit durchsetzen möchten.

Rufen Sie `readTransaction()` nicht rekursiv innerhalb seines Callbacks auf. Die Aufrufe teilen sich einen serialisierten Snapshot-Verarbeitungspfad. Ein verschachtelter Aufruf würde deshalb auf den Abschluss seiner eigenen äußeren Transaktion warten. Anwendungen mit verschachtelten Snapshot-Hilfsfunktionen sollten den Reader der äußeren Transaktion wiederverwenden.

Verwenden Sie `hyperdriveConnectionOptions()`, wenn Sie mysql2-Verbindungen auf niedrigerer Ebene erstellen. Die standardmäßige Zeitzone für die JavaScript-Datumskonvertierung ist `+09:00`; die Zeitzone der MySQL-Sitzung wird dadurch nicht geändert.

Hono-Anwendungen, die den standardmäßigen Request-Container benötigen, verwenden den schlanken Adapter separat:

```ts
import { createContainerRuntime } from '@rdlabo/workers-hono-kit/mysql';
```

## Schreibvorgänge und Wiederholungen

- `retryWhenDeadlock()` wiederholt den Vorgang bei `ER_LOCK_DEADLOCK` und wartet zwischen den Versuchen jeweils `delay × attempt`.
- `insertIdOf()`, `affectedRowsOf()` und `insertedIdsOf()` vereinheitlichen die Ergebnisse von mysql2-Schreibvorgängen.
- `withMysqlConnections()` öffnet für eine Operation mit begrenztem Gültigkeitsbereich parallel Verbindungen zur primären Datenbank und zum Replikat.

## Drizzle- und JST-Hilfsfunktionen

Verwenden Sie `jstTimestamp`, `jstDatetime` und `jstDate` für einheitliches Datumsverhalten. Kombinieren Sie Aktualisierungszeitstempel mit `jstOnUpdateNow()`, da benutzerdefinierte Zeitstempeltypen Drizzles `.onUpdateNow()` nicht bereitstellen. Verwenden Sie für Dezimalspalten direkt Drizzles `decimal(name, { precision, scale, mode: 'number' })`.

Die allgemeine Konvertierung der Geschäftszeit ist vom festen Austauschformat der Datenbank mit `+09:00` getrennt. Installieren Sie `@rdlabo/workers-timezone` direkt und ersetzen Sie den veralteten Kompatibilitätspfad `/business-time` des Kits durch den maßgeblichen Einstiegspunkt dieses Pakets.

```sh
npm install @rdlabo/workers-timezone
```

```ts
import { addBusinessDays, toBusinessDateTime } from '@rdlabo/workers-timezone';

toBusinessDateTime(new Date('2026-07-05T21:00:00Z'));
// '2026-07-06 06:00:00'

addBusinessDays('2026-07-06', 3);
// '2026-07-09'
```

## Migration von workers-hono-kit

Die Trennung der Pakete in `0.12.0` ist eine inkompatible Änderung. Aktualisieren Sie vor dem Upgrade diese Imports:

| Bisheriger Import                                          | Ersatz                                           |
| ------------------------------------------------------- | ----------------------------------------------------- |
| `createContainerRuntime` aus dem Haupteinstiegspunkt des Kits              | `@rdlabo/workers-hono-kit/mysql`                      |
| `retryWhenDeadlock` aus dem Haupteinstiegspunkt des Kits                   | `@rdlabo/workers-mysql`                               |
| Datenbankhilfsfunktionen aus `@rdlabo/workers-hono-kit/db`           | `@rdlabo/workers-mysql`, `/drizzle` oder `/migrations` |
| Datenbank-Testhilfsfunktionen aus `@rdlabo/workers-hono-kit/testing` | `@rdlabo/workers-mysql/testing`                       |

Die alten `/db`-Exports und die datenbankbezogenen `/testing`-Exports bleiben aus Gründen der Abwärtskompatibilität verfügbar. Ihre einzelnen Funktionen und Typen tragen `@deprecated`-Hinweise auf das eigenständige Paket. Eine Version, in der sie entfernt werden, ist nicht geplant. Der kit-eigene `/mysql`-Adapter ist nicht veraltet. Da `/testing` Datenbankhilfsfunktionen statisch reexportiert, müssen alle Nutzer von `/testing` des Kits das MySQL-Paket und `drizzle-orm` installieren. Dies gilt auch, wenn sie ausschließlich Hilfsfunktionen ohne Datenbankbezug wie Firebase- oder KV-Test-Doubles nutzen.

## Nächster Schritt

Fahren Sie mit [Echtzeit und Offline](./realtime-offline.md) fort oder lesen Sie die Anleitungen für das eigenständige Paket [`@rdlabo/workers-mysql`](https://docs.rdlabo.dev/projects/workers-mysql/docs/readme).
