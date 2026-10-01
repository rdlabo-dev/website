---
title: "Couche de données"
sourceRevision: "1b9ddd010afdf64e0b3b859fcad8be611f51c3c3d1be332a19f4f6934e027018"
---
# Couche de données

Accès autonome à MySQL / Hyperdrive pour Workers, avec un adaptateur de conteneur Hono léger. Les utilitaires de stockage à décalage fixe `+09:00` sont indépendants des fuseaux horaires IANA utilisés pour l’affichage.

Importez les utilitaires de base de données depuis `@rdlabo/workers-mysql`. Ce package installe directement `mysql2`. Ajoutez `drizzle-orm` uniquement si vous utilisez le point d’entrée `/drizzle` ou `/testing`. L’ancien chemin `@rdlabo/workers-hono-kit/db` est un réexport de compatibilité déprécié.

Les Workers qui utilisent `mysql2` doivent activer les API réseau Node.js dont il a besoin :

```toml
# wrangler.toml
compatibility_flags = ["nodejs_compat"]
```

```sh
npm install @rdlabo/workers-mysql drizzle-orm
npm install -D @types/node@20
```

Pour installer une archive tarball candidate, consultez [Développement](./development.md).

## Base de données Hyperdrive

`createHyperdriveDatabase()` ouvre à la demande les connexions à la base principale et à la réplique à partir des bindings Hyperdrive. Pour les chemins de lecture/écriture, les limites des nouvelles tentatives et la durée de vie d’une invocation, consultez [Exécution de Workers MySQL](https://docs.rdlabo.dev/projects/workers-mysql/docs/runtime).

```ts
import { createHyperdriveDatabase } from '@rdlabo/workers-mysql';
import { DRIZZLE_ORM_OPTIONS } from '@rdlabo/workers-mysql/drizzle';
import { drizzle } from 'drizzle-orm/mysql2';

const db = createHyperdriveDatabase({
  primaryHyperdrive: env.DB_PRIMARY,
  replicaHyperdrive: env.DB_REPLICA,
  createOrm: (primary) => drizzle(primary, { schema, ...DRIZZLE_ORM_OPTIONS }),
});

const rows = await db.read<Item>('SELECT * FROM items WHERE id = ?', [id]);
const freshRows = await db.query<Item[]>('SELECT * FROM items WHERE id = ?', [id]);
await db.write((dz) => dz.insert(items).values(input));
await db.transaction((tx) => tx.insert(items).values(input));

const snapshot = await db.readTransaction(async ({ orm, query }) => ({
  items: await orm.select().from(items),
  count: await query<{ count: number }[]>('SELECT COUNT(*) count FROM items'),
}));
```

MySQL impose `READ ONLY` à chaque tentative de transaction. Drizzle ne propose pas de type distinct pour les transactions en lecture seule. Les applications peuvent donc encapsuler `orm` dans une façade limitée aux SELECT si elles souhaitent aussi faire respecter cette contrainte à la compilation.

N’appelez pas `readTransaction()` de manière récursive depuis son callback. Les appels partagent un même canal sérialisé de snapshots : un appel imbriqué attendrait donc la fin de sa propre transaction englobante. Les applications qui proposent des utilitaires de snapshots imbriqués doivent réutiliser le lecteur de la transaction englobante.

Utilisez `hyperdriveConnectionOptions()` pour construire des connexions mysql2 de plus bas niveau. Le fuseau horaire par défaut pour la conversion des dates JavaScript est `+09:00` ; il ne modifie pas le fuseau horaire de la session MySQL.

Les applications Hono qui souhaitent utiliser le conteneur de requête standard importent séparément l’adaptateur léger :

```ts
import { createContainerRuntime } from '@rdlabo/workers-hono-kit/mysql';
```

## Écritures et nouvelles tentatives

- `retryWhenDeadlock()` retente l’opération en cas de `ER_LOCK_DEADLOCK`, avec une attente de `delay × attempt` entre les tentatives.
- `insertIdOf()`, `affectedRowsOf()` et `insertedIdsOf()` normalisent les résultats d’écriture de mysql2.
- `withMysqlConnections()` ouvre en parallèle les connexions à la base principale et à la réplique pour une opération à portée limitée.

## Utilitaires Drizzle et JST

Utilisez `jstTimestamp`, `jstDatetime` et `jstDate` pour un traitement cohérent des dates. Associez les horodatages de mise à jour à `jstOnUpdateNow()`, car les types d’horodatage personnalisés n’exposent pas la méthode `.onUpdateNow()` de Drizzle. Pour les colonnes décimales, utilisez directement `decimal(name, { precision, scale, mode: 'number' })` de Drizzle.

La conversion générale de l’heure métier est distincte du contrat de format d’échange de la base de données, fixé à `+09:00`. Installez directement `@rdlabo/workers-timezone` et remplacez le chemin de compatibilité déprécié `/business-time` du kit par le point d’entrée de référence de ce package.

```sh
npm install @rdlabo/workers-timezone
```

```ts
import { addBusinessDays, toBusinessDateTime } from '@rdlabo/workers-timezone';

toBusinessDateTime(new Date('2026-07-05T21:00:00Z'));
// '2026-07-06 06:00:00'

addBusinessDays('2026-07-06', 3);
// '2026-07-09'
```

## Migration depuis workers-hono-kit

La séparation des packages introduite dans `0.12.0` rompt la compatibilité. Mettez à jour ces imports avant la mise à niveau :

| Import actuel                                          | Remplacement                                           |
| ------------------------------------------------------- | ----------------------------------------------------- |
| `createContainerRuntime` depuis la racine du kit              | `@rdlabo/workers-hono-kit/mysql`                      |
| `retryWhenDeadlock` depuis la racine du kit                   | `@rdlabo/workers-mysql`                               |
| Utilitaires de base de données depuis `@rdlabo/workers-hono-kit/db`           | `@rdlabo/workers-mysql`, `/drizzle` ou `/migrations` |
| Utilitaires de test de base de données depuis `@rdlabo/workers-hono-kit/testing` | `@rdlabo/workers-mysql/testing`                       |

Les anciens exports `/db` et ceux de `/testing` liés aux bases de données restent disponibles pour assurer la rétrocompatibilité. Leurs fonctions et types portent individuellement des mentions `@deprecated` qui renvoient au package autonome. Aucune version de suppression n’est prévue. L’adaptateur `/mysql` appartenant au kit n’est pas déprécié. Comme `/testing` réexporte statiquement les utilitaires de base de données, tous les utilisateurs de `/testing` du kit doivent installer le package MySQL et `drizzle-orm`, y compris ceux qui n’utilisent que des utilitaires sans base de données, comme les doublures Firebase ou KV.

## Étape suivante

Poursuivez avec [Temps réel et mode hors ligne](./realtime-offline.md), ou consultez [`@rdlabo/workers-mysql`](https://docs.rdlabo.dev/projects/workers-mysql/docs/readme) pour les guides du package autonome.
