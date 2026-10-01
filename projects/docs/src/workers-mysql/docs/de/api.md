---
title: "API"
sourceRevision: "6f206b9502858de3bbc997d222bfc2d31dc6e22697856c143aa54c1a06cd3b20"
---
# API

Öffentliche Exporte sind nach Importpfad gruppiert. Die installierten TypeScript-Deklarationen liefern die vollständigen generischen Signaturen. Beginnen Sie mit [Laufzeit](./runtime.md) für Lebenszyklus- und Wiederholungsverhalten.

## `@rdlabo/workers-mysql`

#### `function` createHyperdriveDatabase

Nimmt `{ primaryHyperdrive, replicaHyperdrive, createOrm, connectionOptions? }` entgegen und gibt `HyperdriveDatabase<TDrizzle>` zurück. `read<Row>` verwendet das Replikat; `query<Rows>` und `readTransaction` verwenden den Primary. `write` und `transaction` warten auf die ORM-Callbacks des Verbrauchers. `dispose` hat keine Wirkung.

#### `function` createMysqlDatabase

Nimmt `{ orm, replica }` entgegen und gibt `Database<TDrizzle>` zurück. Der Aufrufer verwaltet die bestehenden Handles. `databaseFrom(orm, replica)` ist die gleichwertige Variante mit Positionsargumenten.

#### `function` hyperdriveConnectionOptions

`hyperdriveConnectionOptions(hyperdrive, extra?)` erstellt mysql2-Optionen aus einer strukturellen `HyperdriveLike`-Bindung. Standardwerte beschreibt [Drizzle und Datumswerte](./drizzle.md).

#### `function` withMysqlConnections

`withMysqlConnections({ primary, replica }, ctx, fn, connectionOptions?)` öffnet beide Verbindungen und wartet auf `fn({ primary, replica })`. `ctx` bleibt für die Kompatibilität erhalten, nicht für explizite Bereinigung.

#### `function` retryWhenDeadlock

`retryWhenDeadlock(fn, retries = 3, delay = 100)` wiederholt bei `ER_LOCK_DEADLOCK`, einschließlich umschlossener Ursachen. `retries` ist die maximale Zahl von Versuchen. Wartezeiten wachsen linear um `delay` Millisekunden. Andere Fehler werden erneut ausgelöst. Der gesamte Callback kann erneut ausgeführt werden.

#### Schreibergebnisse und Datumswerte

`insertIdOf`, `affectedRowsOf` und `insertedIdsOf` extrahieren mysql2-/Drizzle-Schreibergebnisse. `MYSQL_TIMEZONE`, `toJstDate`, `jstTimestampParams`, `jstDatetimeParams` und `jstDateParams` implementieren den unabhängigen Wire-Vertrag mit festem JST.

Exportierte Typen: `Database`, `DisposableDatabase`, `HyperdriveDatabase`, `ReadTransaction`, `QueryRunner`, `TxOf`, `CreateMysqlDatabaseOptions`, `CreateHyperdriveDatabaseOptions`, `Connection`, `Pool`, `HyperdriveLike`, `ExecutionContextLike` und `DzWriteResult`.

## `@rdlabo/workers-mysql/drizzle`

Benötigt die optionale Drizzle-Peer-Abhängigkeit. Exportiert `jstTimestamp`, `jstDatetime`, `jstDate`, `jstOnUpdateNow`, `DRIZZLE_ORM_OPTIONS`, `workersDrizzleConfig` und `resolveDbSecret`. Typen: `WorkersDrizzleConfigOptions` und `ResolvedDbSecret`. `honoDrizzleConfig` und `HonoDrizzleConfigOptions` bleiben veraltete Aliase. Konfigurations-/Secret-Auflösung ist für Node.js-Werkzeuge bestimmt; Spaltenhilfsfunktionen werden in Worker-Schemas verwendet.

## `@rdlabo/workers-mysql/migrations`

Nur Node.js: `baselineMigrations`, `readBaselineEntry` und `resolveDbSecret`. Typen: `BaselineMigrationsOptions`, `BaselineResult`, `BaselineEntry` und `ResolvedDbSecret`. Sicherheitsanforderungen finden Sie unter [Migrationen und Tests](./tooling.md).

## `@rdlabo/workers-mysql/testing`

Node.js-Testhilfsfunktionen: `createTestDb`, `createPoolDatabase` und `createNoopDatabase`. Typen: `TestDb`, `CreateTestDbOptions`, `TestDbConnection`, `CreatePoolDatabaseOptions`, `Database`, `DisposableDatabase`, `QueryRunner` und `TxOf`.

## `@rdlabo/workers-mysql/baseline-cli`

`runBaselineCli(): Promise<void>` führt den Baseline-Befehl mit Prozessargumenten und Umgebung aus. Bevorzugen Sie für Shell-Nutzung die installierte ausführbare Datei `workers-mysql-db-baseline`.
