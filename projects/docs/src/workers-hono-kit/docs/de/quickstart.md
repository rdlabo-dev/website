---
title: "Eine Hono-API lokal ausprobieren"
sourceRevision: "32d3ddaf71df1261aaef128a951517a788cfd94192f3b872e50348e01b742182"
---
Sorgen Sie für ein einheitliches HTTP-Verhalten einer Hono-API: eine Health-Check-Antwort mit einem schwachen ETag und eine vorhersehbare JSON-Antwort für fehlende Routen. Sie sehen beide Antworten, ohne einen Port zu öffnen oder ein Cloudflare-Konto anzulegen.

## 1. Ein kleines Projekt erstellen

Verwenden Sie für diese Übung Node.js 24 und npm. Die Befehle legen die hier dokumentierte Kit-Version fest. npm installiert ihre erforderlichen Peer-Abhängigkeiten. Bei Paketmanagern, die diese auslassen, müssen Sie die [Installationsvoraussetzungen](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/getting-started) beachten.

```sh
mkdir hono-kit-demo
cd hono-kit-demo
npm init -y
npm pkg set type=module
npm install @rdlabo/workers-hono-kit@0.12.2 hono@4
npm install --save-dev tsx@4
```

## 2. Zwei Anfragen senden

Speichern Sie diesen Code als `demo.ts`. `app.request()` führt die Anfragen an die Hono-Anwendung im aktuellen Prozess aus.

```ts
import { Hono } from 'hono';
import { createAppErrorHandler, finalizeResponse, notFoundHandler } from '@rdlabo/workers-hono-kit';

const app = new Hono();
app.use('*', finalizeResponse());
app.onError(createAppErrorHandler());
app.notFound(notFoundHandler);
app.get('/health', (c) => c.json({ ok: true }));

const healthy = await app.request('/health');
console.log(healthy.status, await healthy.text());
console.log('weak etag:', healthy.headers.get('etag')?.startsWith('W/'));

const missing = await app.request('/missing');
console.log(missing.status, await missing.text());
```

```sh
npx tsx demo.ts
```

Erwartete Ausgabe (die Reihenfolge der JSON-Eigenschaften spielt keine Rolle):

```text
200 {"ok":true}
weak etag: true
404 {"message":"Cannot GET /missing","error":"Not Found","statusCode":404}
```

Sie haben das vom Kit ergänzte HTTP-Verhalten geprüft. Diese Übung richtet keine Workers-Bindings ein, authentifiziert keine Benutzer und testet keinen bereitgestellten Dienst.

## 3. In Ihre Anwendung übernehmen

Behalten Sie die Registrierung von Middleware und Routen bei, entfernen Sie die Demo-Anfragen und exportieren Sie `app` als Worker-Handler. Fahren Sie mit [HTTP und Authentifizierung](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/http-auth) fort. Fügen Sie den [MySQL-Adapter](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/data-layer) nur hinzu, wenn die Anwendung eine Datenbank benötigt.

Bestehende Kit-Nutzer sollten vor dem Upgrade die [Import-Migration für 0.12](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/data-layer) prüfen. Die alten Pfade `/db` und `/business-time` sind Kompatibilitäts-Exports; neue Integrationen verwenden die eigenständigen Pakete.

## Nächste Schritte

| Ihr Bedarf                                    | Beginnen Sie mit                                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Gemeinsames Hono-Verhalten für HTTP, Authentifizierung oder Queues   | `@rdlabo/workers-hono-kit`                                                                     |
| MySQL-Zugriff mit oder ohne Hono          | [Workers MySQL](https://docs.rdlabo.dev/projects/workers-mysql/docs/quickstart)                |
| Zeitzonenkonvertierungen und Prüfungen für neuen Code | [Workers Timezone + ESLint](https://docs.rdlabo.dev/projects/workers-timezone/docs/quickstart) |
| Codekonventionen während der Entwicklung         | [ESLint Plugin Rules](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/quickstart)    |

Das Kit stellt wiederverwendbare Infrastruktur bereit. Ihre Routen, Fachregeln, Zugangsdaten und das Datenbankschema bleiben in Ihrer Anwendung. Beginnen Sie mit einer Hilfsfunktion; Sie müssen nicht alle Einstiegspunkte übernehmen.
