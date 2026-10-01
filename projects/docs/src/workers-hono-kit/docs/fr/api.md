---
title: "API"
sourceRevision: "9a5b4e8dddd6e80b2a6036c60d3372696f40384e1db6187bcaf92c0d984f9f80"
---
Points d’entrée publics de `@rdlabo/workers-hono-kit` v0.12.2 et des packages autonomes MySQL et de gestion des fuseaux horaires.

#### `module` @rdlabo/workers-hono-kit

Utilitaires Hono et d’infrastructure compatibles avec Workers, sans dépendance MySQL à l’exécution.

#### `module` @rdlabo/workers-mysql

Couche de données de référence pour MySQL et Hyperdrive sur Workers.

#### `module` @rdlabo/workers-mysql/drizzle

Configuration Drizzle et colonnes JST facultatives.

#### `module` @rdlabo/workers-mysql/migrations

Utilitaires Node.js de migration et de création d’un état de référence pour les bases existantes.

#### `module` @rdlabo/workers-mysql/testing

Base de test MySQL/Drizzle locale et doublures de test.

#### `module` @rdlabo/workers-timezone

Conversions de calendrier, de date et d’heure IANA de référence.

#### `module` @rdlabo/workers-hono-kit/mysql

Adaptateur de conteneur Hono pour le package MySQL.

#### `module` @rdlabo/workers-hono-kit/db

Réexport de compatibilité déprécié du package MySQL.

#### `module` @rdlabo/workers-hono-kit/business-time

Réexport de compatibilité déprécié ; nécessite `@rdlabo/workers-timezone`.

#### `module` @rdlabo/workers-hono-kit/offline

Convertisseurs de méthodes REST/DB indépendants des tables et utilitaires de format d’échange des répliques.

#### `module` @rdlabo/workers-hono-kit/realtime

Utilitaires WebSocket et de nouvelle tentative pour Durable Objects.

#### `module` @rdlabo/workers-hono-kit/testing

Base de test avec Drizzle, doublures, jeux de données de test et doublures de bindings.

Pour les exemples d’utilisation, consultez [Couche de données](/docs/data-layer), [Temps réel et mode hors ligne](/docs/realtime-offline) et [Tests et exploitation](/docs/testing-operations).
