---
title: "Erste Schritte"
sourceRevision: "01402388df976e0a8ad93e162a5b70b4567aab5178940bdb2447f3bbe8cdcd2c"
---
# @rdlabo/workers-hono-kit

Gemeinsame Hono-Bausteine für Cloudflare Workers-APIs: schwache ETags, Validierung und Fehlerantworten im NestJS-Format, Firebase-Authentifizierungsmiddleware, AWS-Hilfsfunktionen, AI Gateway-Anbindung, Stripe, KV, Queues sowie Echtzeit- und Offline-Verträge.

[Probieren Sie eine Hono-API lokal aus](./docs/quickstart.md): Senden Sie eine Health-Check-Anfrage, prüfen Sie ihren schwachen ETag und sehen Sie sich die JSON-Antwort für eine fehlende Route an. Für die erste Übung benötigen Sie weder ein Cloudflare-Konto noch einen offenen Port.

## Installation

```sh
npm install @rdlabo/workers-hono-kit
```

Das Paket verwendet ESM, enthält TypeScript-Deklarationen und benötigt für die Werkzeuge Node.js 20 oder neuer. Stripe ist direkt enthalten. npm installiert die erforderlichen Peer-Abhängigkeiten für Hono, Validierung, Authentifizierung, AWS und AI Gateway. Paketmanager, die Peer-Abhängigkeiten nicht automatisch installieren, müssen diese ausdrücklich hinzufügen:

```sh
npm install hono zod @hono/zod-validator jose aws4fetch ai-gateway-provider
```

Weitere optionale Peer-Abhängigkeiten und Pakete bleiben separat:

| Funktion              | Installation                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Modell-Wrapper für das AI SDK   | `ai`                                                                                                               |
| MySQL und Hyperdrive    | [`@rdlabo/workers-mysql`](https://docs.rdlabo.dev/projects/workers-mysql/docs/readme) und optional `drizzle-orm` |
| IANA-Zeitzonenhilfsfunktionen | [`@rdlabo/workers-timezone`](https://docs.rdlabo.dev/projects/workers-timezone/docs/readme)                        |

Ab `0.12.0` behält `/testing` statische Kompatibilitäts-Exports für Datenbanken bei. Alle Nutzer von `/testing` müssen `@rdlabo/workers-mysql` und `drizzle-orm` installieren. Dies gilt auch für Anwendungen, die nur Firebase- oder KV-Test-Doubles verwenden.

Version `0.12.0` verschiebt die MySQL-Exports des Haupteinstiegspunkts in das eigenständige Paket und den `/mysql`-Adapter. Bestehende Nutzer sollten vor dem Upgrade der [MySQL-Migrationsanleitung](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/data-layer) folgen.

## Schnellstart

Eine minimale Hono-Anwendung mit schwachen ETags, dem gemeinsamen Fehlerantwortformat und der JSON-Antwort für 404 `{ message: 'Cannot METHOD path', error: 'Not Found', statusCode: 404 }`:

```ts
import { Hono } from 'hono';
import { createAppErrorHandler, finalizeResponse, notFoundHandler } from '@rdlabo/workers-hono-kit';

const app = new Hono();

app.use('*', finalizeResponse());
app.onError(createAppErrorHandler());
app.notFound(notFoundHandler);

app.get('/health', (c) => c.json({ ok: true }));

export default app;
```

## Einstiegspunkt auswählen

| Import                                   | Aufgabe                                                       |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `@rdlabo/workers-hono-kit`               | Grundfunktionen für HTTP, Authentifizierung, Firebase, AWS, AI, Stripe, KV und Queues      |
| `@rdlabo/workers-hono-kit/mysql`         | Hono-Containeradapter für `@rdlabo/workers-mysql`                   |
| `@rdlabo/workers-hono-kit/offline`       | Verträge für das Austauschformat von Offline-Replikaten, Cursor, Journal und Kompatibilität   |
| `@rdlabo/workers-hono-kit/realtime`      | WebSocket-Hilfsfunktionen und Wiederholungslogik für Durable Objects                           |
| `@rdlabo/workers-hono-kit/testing`       | Authentifizierungshilfsfunktionen, Test-Doubles, Stripe-Testdaten und Kompatibilitäts-Testexports |
| `@rdlabo/workers-hono-kit/db`            | Veralteter Kompatibilitätspfad für `@rdlabo/workers-mysql`            |
| `@rdlabo/workers-hono-kit/business-time` | Veralteter Kompatibilitätspfad für `@rdlabo/workers-timezone`         |

Der Haupteinstiegspunkt lädt weder MySQL noch Drizzle oder die nur für Node vorgesehenen Migrationsmodule. MySQL-Nutzer installieren das eigenständige Paket, das `mysql2` einbindet; die Hono-spezifische Anbindung bleibt im `/mysql`-Adapter.

### Veraltete Kompatibilitäts-Imports

Die Kit-Pfade `/db` und `/business-time` sowie die datenbankbezogenen `/testing`-Exports (`createTestDb`, Pool-/Noop-Datenbank-Doubles und gemeinsame `Database`-Typen) tragen auf Symbolebene `@deprecated`-Tags, die auf `@rdlabo/workers-mysql` / `@rdlabo/workers-timezone` verweisen. Verwenden Sie diese Pakete bevorzugt für neuen Code. Die Kompatibilitätsaliasnamen behalten dieselbe Identität zur Laufzeit und dieselben Signaturen; ihre Entfernung ist nicht geplant. Kit-eigene Hilfsfunktionen wie `reopenGuardedPaymentFailedSet`, `createContainerRuntime` aus `/mysql` und Firebase-/Auth-/KV-/Stripe-Testhilfsfunktionen werden durch diese Migration nicht als veraltet markiert.

## Dokumentation

- [HTTP und Authentifizierung](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/http-auth)
- [Datenschicht und MySQL-Migration](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/data-layer)
- [Echtzeit und Offline](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/realtime-offline)
- [Tests und Betrieb](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/testing-operations)
- [Pakete und API-Referenz](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/api)

<!-- rdlabo-docs-omit -->

**Vollständige Dokumentation:** [https://docs.rdlabo.dev/projects/workers-hono-kit](https://docs.rdlabo.dev/projects/workers-hono-kit)

Artefakte von Vorabversionen und Veröffentlichungskontrollen werden unter [Entwicklung](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/development) beschrieben.

## Maintainer

- [rdlabo](https://rdlabo.dev/)

## Lizenz

[MIT](./LICENSE) © rdlabo-dev

<!-- /rdlabo-docs-omit -->
