---
title: "API"
sourceRevision: "6f206b9502858de3bbc997d222bfc2d31dc6e22697856c143aa54c1a06cd3b20"
---
# API

Les exports publics sont regroupés par chemin d’importation. Les déclarations TypeScript installées fournissent les signatures
génériques complètes. Commencez par [Environnement d’exécution](./runtime.md) pour le cycle de vie et les nouvelles tentatives.

## `@rdlabo/workers-mysql`

#### `function` createHyperdriveDatabase

Accepte `{ primaryHyperdrive, replicaHyperdrive, createOrm, connectionOptions? }` et renvoie
`HyperdriveDatabase<TDrizzle>`. `read<Row>` utilise la réplique ; `query<Rows>` et `readTransaction`
utilisent le primaire ; `write` et `transaction` attendent les callbacks ORM de l’application. `dispose` est sans effet.

#### `function` createMysqlDatabase

Accepte `{ orm, replica }` et renvoie `Database<TDrizzle>`. L’appelant gère les handles existants.
`databaseFrom(orm, replica)` est l’équivalent avec arguments positionnels.

#### `function` hyperdriveConnectionOptions

`hyperdriveConnectionOptions(hyperdrive, extra?)` crée les options mysql2 depuis une liaison structurelle
`HyperdriveLike`. Consultez [Drizzle et dates](./drizzle.md) pour les valeurs par défaut.

#### `function` withMysqlConnections

`withMysqlConnections({ primary, replica }, ctx, fn, connectionOptions?)` ouvre les deux connexions
et attend `fn({ primary, replica })`. `ctx` est conservé pour compatibilité, pas pour un nettoyage explicite.

#### `function` retryWhenDeadlock

`retryWhenDeadlock(fn, retries = 3, delay = 100)` retente `ER_LOCK_DEADLOCK`, y compris dans les causes
encapsulées. `retries` est le nombre maximal de tentatives ; les attentes augmentent linéairement de `delay` millisecondes.
Les autres erreurs sont redéclenchées. Le callback complet peut s’exécuter à nouveau.

#### Résultats d’écriture et dates

`insertIdOf`, `affectedRowsOf` et `insertedIdsOf` extraient les résultats d’écriture mysql2/Drizzle.
`MYSQL_TIMEZONE`, `toJstDate`, `jstTimestampParams`, `jstDatetimeParams`, et `jstDateParams`
implémentent le contrat indépendant de transmission JST fixe.

Types exportés : `Database`, `DisposableDatabase`, `HyperdriveDatabase`, `ReadTransaction`,
`QueryRunner`, `TxOf`, `CreateMysqlDatabaseOptions`, `CreateHyperdriveDatabaseOptions`,
`Connection`, `Pool`, `HyperdriveLike`, `ExecutionContextLike`, et `DzWriteResult`.

## `@rdlabo/workers-mysql/drizzle`

Nécessite la dépendance homologue Drizzle facultative. Exporte `jstTimestamp`, `jstDatetime`, `jstDate`,
`jstOnUpdateNow`, `DRIZZLE_ORM_OPTIONS`, `workersDrizzleConfig`, et `resolveDbSecret`.
Types : `WorkersDrizzleConfigOptions` et `ResolvedDbSecret`.
`honoDrizzleConfig` et `HonoDrizzleConfigOptions` restent des alias obsolètes.
La configuration et la résolution des secrets sont destinées aux outils Node.js ; les utilitaires de colonnes s’utilisent dans les schémas Worker.

## `@rdlabo/workers-mysql/migrations`

Node.js uniquement : `baselineMigrations`, `readBaselineEntry` et `resolveDbSecret`.
Types : `BaselineMigrationsOptions`, `BaselineResult`, `BaselineEntry` et `ResolvedDbSecret`.
Consultez les exigences de sûreté dans [Migrations et tests](./tooling.md).

## `@rdlabo/workers-mysql/testing`

Utilitaires de tests Node.js : `createTestDb`, `createPoolDatabase` et `createNoopDatabase`.
Types : `TestDb`, `CreateTestDbOptions`, `TestDbConnection`, `CreatePoolDatabaseOptions`,
`Database`, `DisposableDatabase`, `QueryRunner`, et `TxOf`.

## `@rdlabo/workers-mysql/baseline-cli`

`runBaselineCli(): Promise<void>` exécute la commande d’état de référence à partir des arguments du processus et de l’environnement.
Préférez l’exécutable installé `workers-mysql-db-baseline` pour un usage dans le shell.
