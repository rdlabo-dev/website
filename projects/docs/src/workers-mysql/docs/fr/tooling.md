---
title: "Migrations et tests"
sourceRevision: "6eecda01792307173d33dbe68c7086167a6a7bde07485e2b57107ff077872828"
---
# Migrations et tests

Ces utilitaires sont destinés aux outils Node.js, pas aux bundles de requêtes Worker. Importez-les depuis leurs points
d’entrée dédiés. L’application gère les migrations, les identifiants, les jeux de données de test et le provisionnement de la base.

## Configuration Drizzle

`workersDrizzleConfig` de `/drizzle` construit une configuration MySQL Drizzle Kit avec une casse
snake_case. Fournissez explicitement les chemins `database`, `schema` et `out`.
`workersDrizzleConfig` lit automatiquement `DB_SECRET` : lorsqu’il est défini, ses paramètres de connexion remplacent
même les options `database`, host, port, user et password explicitement fournies, ainsi que les variables d’environnement `DB_*`.
Avant d’exécuter les migrations, vérifiez la cible du secret ; préciser une option locale
`database` ne limite pas à elle seule la connexion à cette base.
`resolveDbSecret()` lit le JSON `DB_SECRET` : `host`, `username`, `password`, `dbname` et éventuellement
`port`. Il renvoie `undefined` si le secret est absent et déclenche une erreur en cas d’entrée invalide plutôt que de se replier
silencieusement. Ne commitez ni ne journalisez jamais les secrets de base de données.

## État de référence d’une base existante

`baselineMigrations({ db, migrationsFolder })` de `/migrations` enregistre la première migration comme
appliquée **sans exécuter son SQL de schéma**. Il ne vérifie pas que le schéma existant correspond
à ce SQL. Comparez-les, sauvegardez la cible et confirmez les identifiants avant de l’appeler.

Pour une nouvelle base, exécutez le migrateur Drizzle normal, pas baseline. Baseline refuse une base
vide ou un historique de migration inattendu et est sans effet si le marqueur de référence existe déjà.

La CLI installée est `workers-mysql-db-baseline --migrations ./drizzle`. Elle utilise `DB_SECRET` ou
`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` et `DB_NAME`. Cette commande écrit des métadonnées
de migration ; ce n’est pas une simulation. `/baseline-cli` exporte `runBaselineCli` pour l’intégration aux outils.

## Tests locaux

`createTestDb({ dbName, migrationsFolder, connection })` de `/testing` renvoie des utilitaires de jeux de données de test.
Utilisez une base isolée et jetable avec des paramètres de connexion locaux explicites :

- `resetSchema()` **supprime puis recrée la base**, et applique ensuite les migrations.
- `truncateAll(pool)` efface le contenu des tables, à l’exception du suivi des migrations.
- `seed(pool, table, row)` insère une donnée de test.
- `createTestPool()` crée un pool ; fermez-le avec `pool.end()` après les tests.
- `mysqlReachable()` vérifie la connectivité, pas la validité du schéma.

Ne pointez jamais ces utilitaires sur des données partagées ou de production. Chaque exécution de tests doit utiliser un nom
de base distinct. `createPoolDatabase({ pool, orm })` utilise un pool unique pour les lectures et écritures et le ferme
lors de `dispose()`. `createNoopDatabase()` renvoie des lectures vides et déclenche une erreur pour les écritures ou
transactions inattendues ; c’est un stub, pas un test d’acceptation avec MySQL.

Consultez les types disponibles dans l’[API](./api.md).
