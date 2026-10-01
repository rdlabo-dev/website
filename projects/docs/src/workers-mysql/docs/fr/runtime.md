---
title: "Environnement d’exécution"
sourceRevision: "fbb6a2b8030f005446b9d6369d1d140ac7d243f6eb938530b05138763c164e3c"
---
# Environnement d’exécution

Activez `nodejs_compat` dans votre Worker et installez les dépendances décrites dans le
[README](../README.md). `mysql2` est inclus. L’application fournit ses liaisons Hyperdrive,
son schéma et sa factory ORM.

## Durée de vie d’une invocation

Créez `createHyperdriveDatabase` dans chaque invocation, et non dans l’état global du module. Les connexions
s’ouvrent à la demande et sont réutilisées par cette instance de base de données. L’environnement nettoie les connexions de l’invocation ;
sa méthode de compatibilité `dispose()` est sans effet.

Cet exemple Worker complet utilise une liaison Hyperdrive unique pour les deux rôles. Les applications disposant d’une
réplique peuvent fournir une liaison distincte pour `replicaHyperdrive` :

```ts
import { createHyperdriveDatabase, type HyperdriveLike } from '@rdlabo/workers-mysql';
import { DRIZZLE_ORM_OPTIONS } from '@rdlabo/workers-mysql/drizzle';
import { drizzle } from 'drizzle-orm/mysql2';

interface Env {
  DB: HyperdriveLike;
}

export default {
  async fetch(_request: Request, env: Env): Promise<Response> {
    const db = createHyperdriveDatabase({
      primaryHyperdrive: env.DB,
      replicaHyperdrive: env.DB,
      createOrm: (connection) => drizzle(connection, DRIZZLE_ORM_OPTIONS),
    });
    const rows = await db.query<Array<{ value: number }>>('SELECT ? AS value', [1]);
    return Response.json(rows);
  },
};
```

## Chemins de lecture et d’écriture

| Opération                   | Destination                 | Paramètre de type du résultat             |
| --------------------------- | --------------------------- | --------------------------------- |
| `read<Row>(sql, params?)`   | Réplique                     | Une ligne ; renvoie `Row[]`          |
| `query<Rows>(sql, params?)` | SELECT sur le primaire              | Résultat complet, par exemple `Row[]` |
| `readTransaction(fn)`       | Instantané cohérent sur le primaire | Résultat du callback                   |
| `write(fn)`                 | ORM sur le primaire                 | Résultat du callback après résolution           |
| `transaction(fn)`           | Transaction sur le primaire         | Résultat du callback après résolution           |

Utilisez `query` pour les lectures qui ne tolèrent pas le retard de réplication. Le cache des requêtes, s’il est activé sur une liaison
Hyperdrive, relève d’une configuration distincte. Utilisez des placeholders de paramètres, pas du SQL interpolé.

`readTransaction` transmet `{ orm, query }` dans un instantané unique en lecture seule. Ses appels sont sérialisés sur une
connexion dédiée ; ne l’appelez pas récursivement dans son callback.

## Périmètre des nouvelles tentatives

Les opérations de base de données retentent les interblocages. Renvoyez ou attendez le constructeur d’écriture ou la promise depuis les callbacks.
Le callback de transaction entier peut s’exécuter à nouveau : gardez les e-mails, paiements et autres effets de bord externes
hors de celui-ci. N’ajoutez pas une autre encapsulation `retryWhenDeadlock` à une opération qui retente déjà ses échecs.

Les SELECT Hyperdrive et les transactions en lecture seule peuvent en outre être répétés une fois sur une nouvelle connexion
après une erreur de connexion fatale. Les écritures et transactions d’écriture ne sont pas rejouées après une perte de connexion :
leur résultat peut être inconnu. Gérez l’idempotence dans l’application avant de retenter une telle requête.

`createMysqlDatabase({ orm, replica })` et `databaseFrom(orm, replica)` encapsulent des handles existants ;
l’appelant gère le nettoyage des connexions. Ils exposent `Database`, sans les méthodes supplémentaires de lecture primaire
d’Hyperdrive. Pour les conteneurs Hono, utilisez `@rdlabo/workers-hono-kit/mysql`, à partir du kit `0.12.0`.

Consultez [Drizzle et dates](./drizzle.md) pour les valeurs de connexion par défaut et l’[API](./api.md) pour les exports.
