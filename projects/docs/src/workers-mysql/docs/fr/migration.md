---
title: "Migration"
sourceRevision: "b0800c499ebb62ac033c7ee304692ea9d1a0984559726c5b0c1c68423f14c3c3"
---
# Migration

Les utilitaires de base de données sont autonomes depuis le kit `0.12.0`. Installez directement `@rdlabo/workers-mysql` ;
conservez `@rdlabo/workers-hono-kit` uniquement si vous utilisez son intégration Hono. `mysql2` est inclus, tandis que
`drizzle-orm` reste une dépendance homologue facultative pour `/drizzle` et `/testing`. Les consommateurs TypeScript nécessitent
les déclarations Node décrites dans le [README](https://docs.rdlabo.dev/projects/workers-mysql/docs/readme).

| Ancienne importation                        | Nouvelle importation                         |
| -------------------------------------- | ---------------------------------- |
| `createContainerRuntime` à la racine du kit      | `@rdlabo/workers-hono-kit/mysql`   |
| `retryWhenDeadlock` à la racine du kit           | `@rdlabo/workers-mysql`            |
| Exécution et utilitaires de transmission JST du kit `/db` | `@rdlabo/workers-mysql`            |
| Utilitaires de colonnes et de configuration du kit `/db` | `@rdlabo/workers-mysql/drizzle`    |
| Utilitaires d’état de référence du kit `/db`             | `@rdlabo/workers-mysql/migrations` |
| Utilitaires de base de données du kit `/testing`        | `@rdlabo/workers-mysql/testing`    |

Les anciens chemins `/db` et ceux de `/testing` liés à la base restent disponibles comme réexportations de compatibilité
maintenues avec des mentions `@deprecated` ; aucune suppression n’est prévue. N’importez pas l’ancien point d’entrée
global `/db` dans le nouveau code Worker : utilisez les points d’entrée dédiés à l’exécution pour garder le code de migration
réservé à Node.js hors du bundle Worker. Renommez `honoDrizzleConfig` en `workersDrizzleConfig` lors de la
mise à jour de la configuration.

Ce package de base de données ne nécessite aucune dépendance Hono. Le contrat de stockage JST fixe reste également
distinct des fuseaux métier configurables ; consultez [Drizzle et dates](https://docs.rdlabo.dev/projects/workers-mysql/docs/drizzle).
