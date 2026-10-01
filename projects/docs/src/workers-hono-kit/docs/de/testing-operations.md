---
title: "Tests und Betrieb"
sourceRevision: "28e908a57608242217553841a36d42490fd0a06d6403693db26060bf197da40c"
---
# Tests und Betrieb

Testhilfsfunktionen, Queue-Stapelverarbeitung, Betriebs-CLIs und Vertrauensgrenzen für Hono-Anwendungen auf Workers.

## Einstiegspunkt für Tests

`@rdlabo/workers-hono-kit/testing` wird nie vom Produktionscode geladen. Seine Datenbankhilfsfunktionen sind veraltete Kompatibilitäts-Exports aus `@rdlabo/workers-mysql/testing`. Die Test-Doubles für Firebase, HTTP, Stripe, KV und Queue verbleiben im Hono-Kit.

| Hilfsfunktion                                                          | Verwendung                                                                   |
| --------------------------------------------------------------- | --------------------------------------------------------------------- |
| `createTestDb()`                                                | Eine Testdatenbank auf Grundlage von Drizzle-Migrationen erstellen.                       |
| `FakeFirebaseVerifier`                                          | Registrierte Firebase-Tokens im Arbeitsspeicher prüfen.                          |
| `createPoolDatabase()` / `createNoopDatabase()`                 | Datenbankimplementierungen für Tests bereitstellen.                           |
| `authHeaders()` / `registerFirebaseToken()` / `provisionUser()` | Tests für authentifizierte Routen vorbereiten.                                    |
| `configurableFake()`                                            | Ein partielles Test-Double erstellen, das bei nicht konfigurierten Membern ausdrücklich fehlschlägt. |
| `fakeKv()` / `fakeQueue()`                                      | Test-Doubles für Workers-Bindings im Arbeitsspeicher verwenden.                                  |
| Fabriken für Stripe-Testdaten                                        | Typisierte Events, Sessions, Abonnements, Preise und Intents erstellen.    |

Da `/testing` Datenbankhilfsfunktionen statisch reexportiert, müssen alle Nutzer von `/testing` des Kits `@rdlabo/workers-mysql` und `drizzle-orm` installieren. Dies gilt auch bei ausschließlicher Nutzung von Hilfsfunktionen ohne Datenbankbezug.

## Queues

`sendInChunks()` begrenzt Queue-Sendevorgänge so, dass die Workers-Limits für Unteranfragen eingehalten werden. `processBatch()` verarbeitet einen Nachrichtenstapel sequenziell und begrenzt die gleichzeitigen Unteranfragen auf eine. Fehler, die ausdrücklich mit `queueDisposition: 'discard'` markiert sind, werden bestätigt; andere Fehler führen zu einer Wiederholung. `createQueueErrorHandler()` ergänzt Protokollierung und optional eine Meldung beim letzten Versuch.

## CLI für den Betrieb

Das Hono-Kit stellt Befehle bereit, um AWS-Zugangsdaten für die Entwicklung zu synchronisieren, die Anzahl ausgelöster Unteranfragen zu prüfen, Echtzeit-Bundles zu kontrollieren und Durable Object-Metriken abzufragen. Das Erstellen eines Datenbank-Ausgangsstands übernimmt `workers-mysql-db-baseline`; der alte Befehl `workers-hono-kit-db-baseline` delegiert während der Kompatibilitätsphase an diesen Befehl. Führen Sie vor Infrastrukturänderungen die CLI aus, die mit der installierten Version ausgeliefert wird.

## Vertrauensgrenzen

Die nutzende Anwendung konfiguriert die Clients für AWS, Firebase, AI Gateway, Stripe und Datenbanken. Legen Sie keine fachbezogenen Zugangsdaten, Schemas oder Autorisierungsregeln im gemeinsamen Kit ab. Verwenden Sie `createRolePolicy()` ausschließlich für die speicherunabhängige Zuordnung von Rollen und Beziehungen; die Anwendung verwaltet weiterhin ihre eigenen Rollen und Berechtigungen.

## Nächster Schritt

Die Exporttabellen finden Sie unter [Test-APIs](./api-testing.md), Befehlsdetails unter [CLI](./cli.md) und die vollständige Übersicht der Pakete und Einstiegspunkte unter [API](./api.md).
