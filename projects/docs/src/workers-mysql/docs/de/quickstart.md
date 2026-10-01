---
title: "Ihre erste MySQL-Abfrage ausführen"
sourceRevision: "e9b1d81a62b128ea9e61238684c7022d38872a8ce2d7367abb93eaadf22720ff"
---
Lesen Sie ein tatsächliches MySQL-Ergebnis über das Paket, ohne Tabellen oder ein Anwendungsschema anzulegen. Sehen Sie anschließend genau, was sich beim Wechsel von einer lokalen Node.js-Verbindung zu einer Workers-Hyperdrive-Bindung ändert.

## 1. Die lokale Übung vorbereiten

Sie benötigen Node.js 24, npm, Docker und einen freien lokalen Port 3307. Diese Befehle erstellen eine kurzlebige lokale Datenbank. Das folgende Passwort ist ausschließlich für diese localhost-Demonstration vorgesehen.

```sh
mkdir workers-mysql-demo
cd workers-mysql-demo
npm init -y
npm pkg set type=module
npm install @rdlabo/workers-mysql@0.12.2 mysql2@3 drizzle-orm@0.45
npm install --save-dev tsx@4 @types/node@24
```

Das Paket enthält mysql2 intern. Dieses Beispiel importiert mysql2 und Drizzle zusätzlich direkt, um einen von der Anwendung verwalteten Pool zu erstellen. Deshalb deklariert es beide als direkte Abhängigkeiten.

```sh
docker run --name workers-mysql-docs-demo --rm -d \
  -p 127.0.0.1:3307:3306 \
  -e MYSQL_ROOT_PASSWORD=local-demo \
  -e MYSQL_DATABASE=demo \
  mysql:8.4
```

Warten Sie auf den Start. Wiederholen Sie dies, bis `mysqld is alive` gemeldet wird:

```sh
docker exec workers-mysql-docs-demo mysqladmin ping -h 127.0.0.1 -uroot -plocal-demo
```

## 2. Abfragen und die Verbindung schließen

Speichern Sie dies als `demo.ts`. Beide Rollen verwenden in dieser Übung denselben lokalen Pool; Replikat-Routing wird damit nicht demonstriert.

```ts
import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { createMysqlDatabase } from '@rdlabo/workers-mysql';

const pool = createPool({
  host: '127.0.0.1',
  port: 3307,
  user: 'root',
  password: 'local-demo',
  database: 'demo',
});
const db = createMysqlDatabase({ orm: drizzle(pool), replica: pool });

try {
  const rows = await db.read<{ value: number }>('SELECT ? AS value', [42]);
  console.log(rows[0]?.value);
} finally {
  await pool.end();
}
```

```sh
npx tsx demo.ts
```

Erwartete Ausgabe:

```text
42
```

Der Wert stammt aus einem parametrisierten `SELECT` über `db.read()`. Es wurden keine Tabellen erstellt oder verändert. Prüfen Sie bei einem Verbindungsfehler, dass der Container bereit und Port 3307 verfügbar ist.

Stoppen Sie die kurzlebige Datenbank zum Abschluss. Da sie mit `--rm` gestartet wurde, entfernt das Stoppen den Container und dessen Demonstrationsdaten:

```sh
docker stop workers-mysql-docs-demo
```

## 3. Zu Workers und Hyperdrive wechseln

In Node.js verwaltet die Anwendung den Pool und schließt ihn. Aktivieren Sie in Workers `nodejs_compat`, konfigurieren Sie eine Hyperdrive-Bindung namens `DB` zu Ihrer Datenbank und erstellen Sie die Datenbank innerhalb jedes Aufrufs.

Sobald die Bindung besteht, gibt der folgende vollständige Worker `[{"value":42}]` zurück. Er verwendet eine Bindung für beide Rollen und benötigt kein Schema, da das Beispiel direktes SQL verwendet:

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
    const rows = await db.query<Array<{ value: number }>>('SELECT ? AS value', [42]);
    return Response.json(rows);
  },
};
```

Verwenden Sie `query()` für SELECTs auf dem Primary und `read()` für Replikat-Lesezugriffe. Ergänzen Sie ein ORM-Schema erst, wenn Sie typisierte Tabellenabfragen benötigen. [Laufzeit](./runtime.md) erklärt Aufruflebensdauer, Snapshot-Lesezugriffe und Wiederholungen. [Drizzle und Datumswerte](./drizzle.md) behandelt Spalten- und Speicherverhalten.

Ergänzen Sie für Hono-Anfragecontainer den [Kit-Adapter `/mysql`](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/data-layer). Umschließen Sie Datenbankmethoden mit bereits integrierter Wiederholung nicht mit einer weiteren Wiederholungsschleife. Ein Transaktionscallback kann erneut ausgeführt werden; halten Sie deshalb E-Mails, Zahlungen und andere externe Nebenwirkungen außerhalb davon.
