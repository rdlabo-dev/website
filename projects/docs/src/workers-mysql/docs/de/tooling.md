---
title: "Migrationen und Tests"
sourceRevision: "6eecda01792307173d33dbe68c7086167a6a7bde07485e2b57107ff077872828"
---
# Migrationen und Tests

Diese Hilfsfunktionen sind für Node.js-Werkzeuge gedacht, nicht für Worker-Anfragebundles. Importieren Sie sie aus ihren dedizierten Einstiegspunkten. Der Verbraucher verwaltet Migrationen, Zugangsdaten, Testfixtures und Datenbankbereitstellung.

## Drizzle-Konfiguration

`workersDrizzleConfig` aus `/drizzle` erstellt eine MySQL-Drizzle-Kit-Konfiguration mit snake_case-Benennung. Geben Sie die Pfade `database`, `schema` und `out` ausdrücklich an. `workersDrizzleConfig` liest automatisch `DB_SECRET`. Ist es gesetzt, überschreiben dessen Verbindungsdetails selbst ausdrücklich angegebene Optionen für `database`, Host, Port, Nutzer und Passwort sowie Umgebungsvariablen `DB_*`. Prüfen Sie vor Migrationen das Ziel des Secrets. Eine lokale Option `database` allein beschränkt die Verbindung nicht auf diese Datenbank. `resolveDbSecret()` liest `DB_SECRET` als JSON (`host`, `username`, `password`, `dbname`, optional `port`). Ist es nicht gesetzt, gibt die Funktion `undefined` zurück. Ungültige Eingaben lösen einen Fehler aus, statt still auf andere Werte zurückzufallen. Committen oder protokollieren Sie niemals Datenbank-Secrets.

## Baseline für eine bestehende Datenbank

`baselineMigrations({ db, migrationsFolder })` aus `/migrations` vermerkt die erste Migration als angewendet, **ohne deren Schema-SQL auszuführen**. Es prüft nicht, ob das bestehende Schema diesem SQL entspricht. Vergleichen Sie beides, sichern Sie die Zieldatenbank und bestätigen Sie die Zugangsdaten vor dem Aufruf.

Führen Sie für eine neue Datenbank den normalen Drizzle-Migrator aus, nicht Baseline. Baseline lehnt eine leere Datenbank oder unerwartete Migrationshistorie ab und hat keine Wirkung, wenn die Baseline-Markierung bereits vorhanden ist.

Die installierte CLI lautet `workers-mysql-db-baseline --migrations ./drizzle`. Sie verwendet `DB_SECRET` oder `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` und `DB_NAME`. Dieser Befehl schreibt Migrationsmetadaten; er ist kein Dry Run. `/baseline-cli` exportiert `runBaselineCli` für Werkzeugintegrationen.

## Lokale Tests

`createTestDb({ dbName, migrationsFolder, connection })` aus `/testing` gibt Fixture-Hilfsfunktionen zurück. Verwenden Sie eine isolierte kurzlebige Datenbank und ausdrückliche lokale Verbindungseinstellungen:

- `resetSchema()` **löscht die Datenbank und erstellt sie neu** und wendet danach Migrationen an.
- `truncateAll(pool)` löscht Tabelleninhalte mit Ausnahme der Migrationsbuchhaltung.
- `seed(pool, table, row)` fügt eine Fixture ein.
- `createTestPool()` erstellt einen Pool. Schließen Sie ihn nach dem Testen mit `pool.end()`.
- `mysqlReachable()` prüft die Erreichbarkeit, nicht die Korrektheit des Schemas.

Richten Sie diese Hilfsfunktionen niemals auf gemeinsam genutzte oder Produktionsdaten. Getrennte Testläufe sollten unterschiedliche Datenbanknamen verwenden. `createPoolDatabase({ pool, orm })` verwendet einen Pool für Lese-/Schreibzugriffe und schließt ihn bei `dispose()`. `createNoopDatabase()` liefert leere Leseergebnisse und löst bei unerwarteten Schreiboperationen oder Transaktionen Fehler aus. Es ist ein Stub, kein Akzeptanztest gegen MySQL.

Die verfügbaren Typen finden Sie unter [API](./api.md).
