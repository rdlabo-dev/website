---
title: API
---

Public entry-point map for `@rdlabo/workers-hono-kit` v0.13.0 and the standalone MySQL and timezone packages.

#### `module` @rdlabo/workers-hono-kit

Workers-compatible Hono and infrastructure helpers; no MySQL runtime dependency.

Root social-auth exports include `verifyGoogleIdentityToken`, `verifyAppleIdentityToken`, `hasFirebaseProviderIdentity`, and `createAppleClientSecret`, plus `AppleClientSecretConfig`, `APPLE_IDENTITY_ISSUER`, and `GOOGLE_IDENTITY_ISSUERS`. Identity-token verification returns the provider subject after checking signature, issuer, audience, and expiry. `hasFirebaseProviderIdentity` only inspects an already verified Firebase payload; it does not verify the Firebase JWT. See [Social auth](/docs/getting-started) for the application-owned login/link policy.

`FirebaseVerifier` exposes `getUser`, `getUsers`, and `getUserByEmail` account lookups; `IdentityToolkit` provides the corresponding `lookup`, `lookupMany`, and `lookupByEmail` methods. `FirebaseUserRecord` contains `uid` and optional `email` / `disabled`; disabled accounts are returned for the application to assess. Missing users return `null` or are omitted from batches, while provider failures throw. See [HTTP and authentication](/docs/http-auth).

#### `module` @rdlabo/workers-mysql

Canonical Workers MySQL and Hyperdrive data layer.

#### `module` @rdlabo/workers-mysql/drizzle

Optional Drizzle configuration and JST columns.

#### `module` @rdlabo/workers-mysql/migrations

Node.js migration and brownfield baseline helpers.

#### `module` @rdlabo/workers-mysql/testing

Local MySQL/Drizzle test database and fakes.

#### `module` @rdlabo/workers-timezone

Canonical IANA calendar and date-time conversions.

#### `module` @rdlabo/workers-hono-kit/mysql

Hono container adapter for the MySQL package.

#### `module` @rdlabo/workers-hono-kit/db

Deprecated compatibility re-export of the MySQL package.

#### `module` @rdlabo/workers-hono-kit/business-time

Deprecated compatibility re-export; requires `@rdlabo/workers-timezone`.

#### `module` @rdlabo/workers-hono-kit/offline

Table-agnostic REST/DB method converters and replica wire helpers.

#### `module` @rdlabo/workers-hono-kit/realtime

Durable Object WebSocket and retry helpers.

#### `module` @rdlabo/workers-hono-kit/testing

Drizzle-backed test DB, fakes, fixtures, and binding doubles.

See [Data Layer](/docs/data-layer), [Realtime and Offline](/docs/realtime-offline), and [Testing and Operations](/docs/testing-operations) for usage.
