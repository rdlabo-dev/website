---
title: "Premiers pas"
sourceRevision: "5df84bf9a09391b9d0102756651e33804bba6160b18422967bdb897dd591709f"
---
# @rdlabo/workers-mysql

Infrastructure MySQL et Hyperdrive pour Cloudflare Workers. Combinez
l’accès primaire/réplique limité à l’invocation, les nouvelles tentatives après interblocage, les utilitaires Drizzle facultatifs et les outils Node.js
de migration et de test, tandis que l’application conserve la gestion de ses schémas et identifiants.

Le Worker doit activer la compatibilité Node.js, car `mysql2` utilise les API réseau Node.js :

```toml
# wrangler.toml
compatibility_flags = ["nodejs_compat"]
```

## Installer

```bash
npm install @rdlabo/workers-mysql
```

`mysql2` est inclus comme dépendance directe. Ajoutez `drizzle-orm` si vous utilisez `/drizzle` ou `/testing` :

```bash
npm install drizzle-orm
```

Conserver Drizzle comme dépendance homologue assure une identité de type unique pour l’application et ses schémas.

Les types publics de connexion utilisent les déclarations Node.js. `@types/node@>=20.19.43` est une dépendance homologue obligatoire,
y compris pour les déploiements dans Workers. Les applications TypeScript doivent l’ajouter directement afin que ses déclarations globales
soient visibles dans les agencements de packages stricts, notamment avec pnpm :

```sh
npm install -D @types/node@20
# pour les utilisateurs de pnpm :
pnpm add -D @types/node@20
```

Utilisez la version majeure compatible avec vos outils. Sous pnpm, l’installation automatique des dépendances homologues ne suffit pas toujours
à rendre ces déclarations globales accessibles au compilateur TypeScript de l’application.

## Commencer par une véritable requête

[Exécuter votre première requête MySQL](/docs/quickstart) : démarrez une base locale jetable, exécutez un `SELECT` paramétré et vérifiez le résultat. Le guide présente ensuite le gestionnaire Worker complet pour une liaison Hyperdrive existante.

## Choisir un point d’entrée

| Importation                             | Responsabilité                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| `@rdlabo/workers-mysql`            | Exécution MySQL et Hyperdrive dans Workers, nouvelles tentatives, résultats d’écriture et utilitaires de transmission JST |
| `@rdlabo/workers-mysql/drizzle`    | Configuration Drizzle et utilitaires de colonnes JST                                    |
| `@rdlabo/workers-mysql/migrations` | Utilitaires Node.js de migration et d’établissement d’un état de référence pour les bases existantes                               |
| `@rdlabo/workers-mysql/testing`    | Base locale de test MySQL/Drizzle et implémentations factices                                     |

## Démarrage rapide

Créez l’objet de base de données dans chaque invocation Worker. Dans cet extrait, `env` contient les liaisons
Hyperdrive de l’application et `schema` est son propre schéma Drizzle :

```ts
import { createHyperdriveDatabase } from '@rdlabo/workers-mysql';
import { DRIZZLE_ORM_OPTIONS } from '@rdlabo/workers-mysql/drizzle';
import { drizzle } from 'drizzle-orm/mysql2';

const db = createHyperdriveDatabase({
  primaryHyperdrive: env.PRIMARY,
  replicaHyperdrive: env.REPLICA,
  createOrm: (connection) => drizzle(connection, { schema, ...DRIZZLE_ORM_OPTIONS }),
});
```

Avec `nodejs_compat` activé, la racine du package est compatible avec l’environnement Workers et ne charge ni Drizzle ni
le code de migration réservé à Node.js.

Les utilitaires de stockage au décalage fixe `+09:00` constituent un contrat de transmission MySQL. Ils ne suivent pas les fuseaux IANA d’affichage
de [`@rdlabo/workers-timezone`](https://docs.rdlabo.dev/projects/workers-timezone/docs/readme).

## Intégration Hono

Les conteneurs de requête Hono utilisent l’adaptateur de `@rdlabo/workers-hono-kit/mysql` :

```ts
import { createContainerRuntime } from '@rdlabo/workers-hono-kit/mysql';
```

Cet adaptateur est disponible à partir du kit Hono `0.12.0`. Installez les deux packages :

```sh
npm install @rdlabo/workers-mysql @rdlabo/workers-hono-kit
```

## Documentation

- [Environnement d’exécution](https://docs.rdlabo.dev/projects/workers-mysql/docs/runtime) — durée de vie des requêtes, lectures primaire/réplique et sûreté des nouvelles tentatives.
- [Drizzle et dates](https://docs.rdlabo.dev/projects/workers-mysql/docs/drizzle) — gestion du schéma, dépendance homologue facultative et stockage JST fixe.
- [Migrations et tests](https://docs.rdlabo.dev/projects/workers-mysql/docs/tooling) — outils Node.js et utilitaires de test destructifs.
- [API](https://docs.rdlabo.dev/projects/workers-mysql/docs/api) — exports publics par point d’entrée.
- [Migration](https://docs.rdlabo.dev/projects/workers-mysql/docs/migration) — importations de compatibilité avec le kit.

Ces guides décrivent cette révision du code source. Utilisez le tag de version correspondant à la version installée.

## Migrer depuis workers-hono-kit

Le kit `0.12.0` modifie les périmètres d’importation. Ses anciens exports `/db` et ceux de `/testing` liés à la base restent
disponibles comme chemins de compatibilité maintenus, avec des mentions `@deprecated` ; aucune suppression n’est prévue.
Consultez [Migration](https://docs.rdlabo.dev/projects/workers-mysql/docs/migration) pour la correspondance des importations.
