---
title: "Laufzeit"
sourceRevision: "fbb6a2b8030f005446b9d6369d1d140ac7d243f6eb938530b05138763c164e3c"
---
# Laufzeit

Aktivieren Sie `nodejs_compat` in Ihrem Worker und installieren Sie die im [README](../README.md) beschriebenen Abhängigkeiten. `mysql2` ist enthalten. Die Anwendung liefert ihre Hyperdrive-Bindungen, ihr Schema und ihre ORM-Factory.

## Lebensdauer eines Aufrufs

Erstellen Sie `createHyperdriveDatabase` innerhalb jedes Aufrufs, nicht in modulglobalem Zustand. Verbindungen werden bei Bedarf geöffnet und von dieser Datenbankinstanz wiederverwendet. Die Laufzeit bereinigt die Verbindungen des Aufrufs. Die Kompatibilitätsmethode `dispose()` hat keine Wirkung.

Dieses vollständige Worker-Beispiel verwendet eine Hyperdrive-Bindung für beide Rollen. Anwendungen mit einem Replikat können eine separate Bindung für `replicaHyperdrive` bereitstellen:

```ts
import { createHyperdriveDatabase, type HyperdriveLike } from '@rdlabo/workers-mysql';
import { DRIZZLE_ORM_OPTIONS } from '@rdlabo/workers-mysql/drizzle';
import { drizzle } from 'drizzle-orm/mysql2';

interface Env {
  DB: HyperdriveLike;
}

export default {
  async fetch(_request: Request, env: Env): Promise<Response> {
    const db = createHyperdriveDatabase({
      primaryHyperdrive: env.DB,
      replicaHyperdrive: env.DB,
      createOrm: (connection) => drizzle(connection, DRIZZLE_ORM_OPTIONS),
    });
    const rows = await db.query<Array<{ value: number }>>('SELECT ? AS value', [1]);
    return Response.json(rows);
  },
};
```

## Lese- und Schreibpfade

| Vorgang                   | Ziel                 | Typparameter für das Ergebnis             |
| --------------------------- | --------------------------- | --------------------------------- |
| `read<Row>(sql, params?)`   | Replikat                     | Eine Zeile; gibt `Row[]` zurück          |
| `query<Rows>(sql, params?)` | SELECT auf dem Primary              | Gesamtes Ergebnis, zum Beispiel `Row[]` |
| `readTransaction(fn)`       | Konsistenter Snapshot auf dem Primary | Callback-Ergebnis                   |
| `write(fn)`                 | ORM auf dem Primary                 | Abgewartetes Callback-Ergebnis           |
| `transaction(fn)`           | Transaktion auf dem Primary         | Abgewartetes Callback-Ergebnis           |

Verwenden Sie `query` für Lesezugriffe, die keine Replikatverzögerung tolerieren. Abfrage-Caching auf einer Hyperdrive-Bindung ist, sofern aktiviert, eine separate Konfigurationsfrage. Verwenden Sie Parameterplatzhalter statt interpoliertem SQL.

`readTransaction` übergibt `{ orm, query }` auf einem einzelnen schreibgeschützten Snapshot. Seine Aufrufe werden auf einer dedizierten Verbindung serialisiert. Rufen Sie es innerhalb seines Callbacks nicht rekursiv auf.

## Grenzen der Wiederholung

Datenbankoperationen werden bei Deadlocks wiederholt. Geben Sie den Schreib-Builder oder das Promise aus Callbacks zurück beziehungsweise warten Sie darauf. Der gesamte Transaktionscallback kann erneut ausgeführt werden. Halten Sie E-Mails, Zahlungen und andere externe Nebenwirkungen außerhalb davon. Ergänzen Sie keinen weiteren `retryWhenDeadlock`-Wrapper um eine Operation, die bereits selbst wiederholt.

Hyperdrive-SELECTs und schreibgeschützte Transaktionen können nach einem fatalen Verbindungsfehler zusätzlich einmal auf einer neuen Verbindung wiederholt werden. Schreiboperationen und Schreibtransaktionen werden bei Verbindungsverlust nicht erneut ausgeführt, da ihr Ergebnis unbekannt sein kann. Sorgen Sie für Idempotenz auf Anwendungsebene, bevor Sie eine solche Anfrage wiederholen.

`createMysqlDatabase({ orm, replica })` und `databaseFrom(orm, replica)` umschließen vorhandene Handles. Der Aufrufer verwaltet deren Verbindungsbereinigung. Sie stellen `Database` bereit, nicht die zusätzlichen Primary-Lesemethoden von Hyperdrive. Verwenden Sie für Hono-Container `@rdlabo/workers-hono-kit/mysql` ab Kit `0.12.0`.

Verbindungsstandards beschreibt [Drizzle und Datumswerte](./drizzle.md); Exporte finden Sie unter [API](./api.md).
