---
title: "API"
sourceRevision: "a02fb5de505073672651cead4a364845bc5bccaaecd53b108c95dda0b2e8da7a"
---
Öffentliche Einstiegspunkte von `@rdlabo/workers-hono-kit` v0.13.0 und den eigenständigen Paketen für MySQL und Zeitzonen.

#### `module` @rdlabo/workers-hono-kit

Workers-kompatible Hilfsfunktionen für Hono und Infrastruktur ohne MySQL-Laufzeitabhängigkeit.

Zu den Root-Exports für soziale Authentifizierung gehören `verifyGoogleIdentityToken`, `verifyAppleIdentityToken`, `hasFirebaseProviderIdentity` und `createAppleClientSecret` sowie `AppleClientSecretConfig`, `APPLE_IDENTITY_ISSUER` und `GOOGLE_IDENTITY_ISSUERS`. Die Identitätstoken-Verifizierung gibt das Provider-Subject zurück, nachdem Signatur, Aussteller, Zielgruppe und Ablauf geprüft wurden. `hasFirebaseProviderIdentity` untersucht lediglich eine bereits verifizierte Firebase-Payload; die Funktion verifiziert das Firebase-JWT nicht. Die von der Anwendung festgelegte Anmelde-/Verknüpfungsrichtlinie wird unter [Soziale Authentifizierung](/docs/getting-started) erläutert.

`FirebaseVerifier` bietet die Kontoabfragen `getUser`, `getUsers` und `getUserByEmail`; `IdentityToolkit` stellt die entsprechenden Methoden `lookup`, `lookupMany` und `lookupByEmail` bereit. `FirebaseUserRecord` enthält `uid` und optional `email` / `disabled`; auch deaktivierte Konten werden zurückgegeben, damit die Anwendung sie beurteilen kann. Nicht vorhandene Benutzer ergeben `null` oder werden aus Stapelergebnissen ausgelassen, während Fehler des Providers eine Ausnahme auslösen. Siehe [HTTP und Authentifizierung](/docs/http-auth).

#### `module` @rdlabo/workers-mysql

Die maßgebliche Datenschicht für MySQL und Hyperdrive auf Workers.

#### `module` @rdlabo/workers-mysql/drizzle

Optionale Drizzle-Konfiguration und JST-Spalten.

#### `module` @rdlabo/workers-mysql/migrations

Node.js-Hilfsfunktionen für Migrationen und die Erstellung eines Ausgangsstands für bestehende Datenbanken.

#### `module` @rdlabo/workers-mysql/testing

Lokale MySQL/Drizzle-Testdatenbank und Test-Doubles.

#### `module` @rdlabo/workers-timezone

Die maßgeblichen IANA-Kalender- und Datums-/Uhrzeitkonvertierungen.

#### `module` @rdlabo/workers-hono-kit/mysql

Hono-Containeradapter für das MySQL-Paket.

#### `module` @rdlabo/workers-hono-kit/db

Veralteter Kompatibilitäts-Reexport des MySQL-Pakets.

#### `module` @rdlabo/workers-hono-kit/business-time

Veralteter Kompatibilitäts-Reexport; setzt `@rdlabo/workers-timezone` voraus.

#### `module` @rdlabo/workers-hono-kit/offline

Tabellenunabhängige REST/DB-Methodenkonverter und Hilfsfunktionen für das Austauschformat von Replikaten.

#### `module` @rdlabo/workers-hono-kit/realtime

WebSocket-Hilfsfunktionen und Wiederholungslogik für Durable Objects.

#### `module` @rdlabo/workers-hono-kit/testing

Drizzle-Testdatenbank, Test-Doubles, Testdaten und Binding-Doubles.

Anwendungsbeispiele finden Sie unter [Datenschicht](/docs/data-layer), [Echtzeit und Offline](/docs/realtime-offline) und [Tests und Betrieb](/docs/testing-operations).
