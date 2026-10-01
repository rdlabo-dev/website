---
title: "HTTP und Authentifizierung"
sourceRevision: "59f1e73332c95e13facccee4efdfaf9553e453e7480f32a18766cf68f9ace72f"
---
# HTTP und Authentifizierung

Validierung, Firebase-Authentifizierung, gemeinsame Fehlerantworten im NestJS-Format und abschließende Antwortverarbeitung für Hono-APIs auf Workers.

## Validierung

`validate(target, schema, options?)` passt ein Zod-Schema an Hono an und gibt eine `400`-Antwort im Format der NestJS-`ValidationPipe` zurück. Verwenden Sie `createValidate({ sentry })`, um die optionale Fehlerberichterstattung einmalig anzubinden.

```ts
import { createValidate, zNumOptional } from '@rdlabo/workers-hono-kit';
import { z } from 'zod';

const validate = createValidate({ sentry });
const querySchema = z.object({ page: zNumOptional() });

app.get('/items', validate('query', querySchema), async (c) => {
  const query = c.req.valid('query');
  return c.json(await listItems(query.page));
});
```

## Authentifizierung

`createAuthMiddleware()` liest einen Token-Header, überprüft ein Firebase-ID-Token, ermittelt optional die Benutzer-ID der Anwendung und speichert das Ergebnis im Hono-Kontext. Verwenden Sie `createRemoteFirebaseVerifier(projectId)` für eine entfernte JWKS-Verifizierung mit Cache oder `createServiceAccountVerifier()`, wenn die Identity Toolkit-Operationen `getUser` und `deleteUser` benötigt werden.

Unterscheiden Sie Fehler bei der Identitätsprüfung, erneuten Authentifizierung und funktionsbezogenen Zugangsdaten mithilfe der Hilfsfunktionen für ein stabiles Authentifizierungsfehlerformat.

## Fehler- und Routing-Verträge

- `createAppErrorHandler()` kombiniert die Klassifizierung fehlgeschlagener Datenbankabfragen, die allgemeine mysql2-Fehlerklassifizierung und optionale Fehlerberichterstattung.
- `createHttpErrorHandler()` bildet `HTTPException` auf das gemeinsame JSON-Fehlerantwortformat ab.
- `notFoundHandler()` gibt `Cannot METHOD path` mit Status 404 zurück.
- `normalizeTrailingSlash()` entfernt abschließende Schrägstriche ohne Weiterleitung und erhält dabei die Request-Bodies.
- `finalizeResponse()` fügt schwache ETags hinzu und verarbeitet passende `If-None-Match`-Anfragen.

Registrieren Sie `createMaintenanceMiddleware()` nach CORS und vor der Container- oder Datenbankmiddleware, damit Wartungsantworten keine aufwendige Infrastruktur initialisieren.

## Aufgeschobene Verarbeitung und Observability

`createWaitUntilDefer(ctx)` registriert Hintergrundarbeit über `waitUntil` und protokolliert fehlgeschlagene Aufgaben. `perfLog()` schreibt Anwendungslatenz, Colo, Cold-/Warm-Status, Route und Statuscode pro Anfrage in Workers Logs und optional in Analytics Engine.

## Nächster Schritt

Fahren Sie für MySQL und Hyperdrive mit [Datenschicht](./data-layer.md) fort oder lesen Sie unter [API](./api.md) die vollständige Exportliste.
