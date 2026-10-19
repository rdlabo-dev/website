---
title: "API"
sourceRevision: "a02fb5de505073672651cead4a364845bc5bccaaecd53b108c95dda0b2e8da7a"
---
Points d’entrée publics de `@rdlabo/workers-hono-kit` v0.13.0 et des packages autonomes MySQL et de gestion des fuseaux horaires.

#### `module` @rdlabo/workers-hono-kit

Utilitaires Hono et d’infrastructure compatibles avec Workers, sans dépendance MySQL à l’exécution.

Les exports racine d’authentification sociale comprennent `verifyGoogleIdentityToken`, `verifyAppleIdentityToken`, `hasFirebaseProviderIdentity` et `createAppleClientSecret`, ainsi que `AppleClientSecretConfig`, `APPLE_IDENTITY_ISSUER` et `GOOGLE_IDENTITY_ISSUERS`. La vérification du jeton d’identité renvoie le sujet du fournisseur après contrôle de la signature, de l’émetteur, de l’audience et de l’expiration. `hasFirebaseProviderIdentity` inspecte uniquement une charge utile Firebase déjà vérifiée ; cette fonction ne vérifie pas le JWT Firebase. Consultez [Authentification sociale](/docs/getting-started) pour la politique de connexion/liaison définie par l’application.

`FirebaseVerifier` expose les recherches de comptes `getUser`, `getUsers` et `getUserByEmail` ; `IdentityToolkit` fournit les méthodes correspondantes `lookup`, `lookupMany` et `lookupByEmail`. `FirebaseUserRecord` contient `uid` et les champs facultatifs `email` / `disabled` ; les comptes désactivés sont renvoyés pour que l’application décide de leur traitement. Les utilisateurs inexistants donnent `null` ou sont omis des résultats par lots, tandis que les échecs du fournisseur déclenchent une exception. Consultez [HTTP et authentification](/docs/http-auth).

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
