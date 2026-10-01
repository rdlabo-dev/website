---
title: "Migration"
sourceRevision: "25a69249ec3152849206ec29483db9c886594cf647e04695afb62e29e054ec34"
---
# Migration

Die Datenbankhilfsfunktionen sind ab Kit `0.12.0` eigenständig. Installieren Sie `@rdlabo/workers-mysql` direkt. Behalten Sie `@rdlabo/workers-hono-kit` nur bei Verwendung seiner Hono-Integration. `mysql2` ist enthalten; `drizzle-orm` bleibt eine optionale Peer-Abhängigkeit für `/drizzle` und `/testing`. TypeScript-Verbraucher benötigen die im [README](../README.md) beschriebenen Node-Deklarationen.

| Bisheriger Import                        | Neuer Import                         |
| -------------------------------------- | ---------------------------------- |
| Kit-Wurzelpfad `createContainerRuntime`      | `@rdlabo/workers-hono-kit/mysql`   |
| Kit-Wurzelpfad `retryWhenDeadlock`           | `@rdlabo/workers-mysql`            |
| Kit-`/db`-Laufzeit und JST-Wire-Hilfsfunktionen | `@rdlabo/workers-mysql`            |
| Kit-`/db`-Spalten-/Konfigurationshilfsfunktionen | `@rdlabo/workers-mysql/drizzle`    |
| Kit-`/db`-Baseline-Hilfsfunktionen             | `@rdlabo/workers-mysql/migrations` |
| Kit-`/testing`-Datenbankhilfsfunktionen        | `@rdlabo/workers-mysql/testing`    |

Die alten Pfade `/db` und datenbankbezogenes `/testing` bleiben als gepflegte Kompatibilitäts-Re-Exporte mit `@deprecated`-Hinweisen verfügbar; eine Entfernung ist nicht geplant. Importieren Sie das ältere Sammelmodul `/db` nicht in neuem Worker-Code. Verwenden Sie dedizierte Laufzeiteinstiegspunkte, damit ausschließlich für Node gedachte Migrationslogik außerhalb des Worker-Bundles bleibt. Benennen Sie bei der Aktualisierung der Konfiguration `honoDrizzleConfig` in `workersDrizzleConfig` um.

Dieses Datenbankpaket benötigt keine Hono-Abhängigkeit. Auch der Speichervertrag mit festem JST bleibt unabhängig von konfigurierbaren Geschäftszeitzonen. Siehe [Drizzle und Datumswerte](./drizzle.md).
