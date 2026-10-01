---
title: "Exécuter votre première requête MySQL"
sourceRevision: "e9b1d81a62b128ea9e61238684c7022d38872a8ce2d7367abb93eaadf22720ff"
---
Lisez un véritable résultat MySQL via le package sans créer de tables ni de schéma applicatif. Voyez ensuite précisément ce qui change en passant d’une connexion Node.js locale à une liaison Hyperdrive dans Workers.

## 1. Préparer l’exercice local

Vous avez besoin de Node.js 24, de npm, de Docker et d’un port local 3307 disponible. Ces commandes créent une base locale jetable. Le mot de passe ci-dessous sert uniquement à cette démonstration sur localhost.

```sh
mkdir workers-mysql-demo
cd workers-mysql-demo
npm init -y
npm pkg set type=module
npm install @rdlabo/workers-mysql@0.12.2 mysql2@3 drizzle-orm@0.45
npm install --save-dev tsx@4 @types/node@24
```

Le package inclut mysql2 en interne. Cet exemple importe également mysql2 et Drizzle directement pour créer un pool géré par l’application ; il les déclare donc comme dépendances directes.

```sh
docker run --name workers-mysql-docs-demo --rm -d \
  -p 127.0.0.1:3307:3306 \
  -e MYSQL_ROOT_PASSWORD=local-demo \
  -e MYSQL_DATABASE=demo \
  mysql:8.4
```

Attendez le démarrage. Exécutez cette commande jusqu’à obtenir `mysqld is alive` :

```sh
docker exec workers-mysql-docs-demo mysqladmin ping -h 127.0.0.1 -uroot -plocal-demo
```

## 2. Exécuter la requête et fermer la connexion

Enregistrez ceci dans `demo.ts`. Les deux rôles utilisent le même pool local dans cet exercice ; il ne démontre pas le routage vers une réplique.

```ts
import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { createMysqlDatabase } from '@rdlabo/workers-mysql';

const pool = createPool({
  host: '127.0.0.1',
  port: 3307,
  user: 'root',
  password: 'local-demo',
  database: 'demo',
});
const db = createMysqlDatabase({ orm: drizzle(pool), replica: pool });

try {
  const rows = await db.read<{ value: number }>('SELECT ? AS value', [42]);
  console.log(rows[0]?.value);
} finally {
  await pool.end();
}
```

```sh
npx tsx demo.ts
```

Sortie attendue :

```text
42
```

La valeur provient d’un `SELECT` paramétré via `db.read()`. Aucune table n’a été créée ni modifiée. En cas d’erreur de connexion, vérifiez que le conteneur est prêt et que le port 3307 est disponible.

Arrêtez la base jetable lorsque vous avez terminé. Comme elle a été démarrée avec `--rm`, l’arrêt supprime le conteneur et ses données de démonstration :

```sh
docker stop workers-mysql-docs-demo
```

## 3. Passer à Workers et Hyperdrive

Dans Node.js, l’application gère et ferme le pool. Dans Workers, activez `nodejs_compat`, configurez une liaison Hyperdrive nommée `DB` reliée à votre base et créez l’objet de base de données dans chaque invocation.

Une fois la liaison créée, le Worker complet ci-dessous renvoie `[{"value":42}]`. Il utilise une seule liaison pour les deux rôles ; aucun schéma n’est nécessaire, car l’exemple utilise du SQL brut :

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
    const rows = await db.query<Array<{ value: number }>>('SELECT ? AS value', [42]);
    return Response.json(rows);
  },
};
```

Utilisez `query()` pour les SELECT sur le primaire et `read()` pour les lectures sur la réplique. Ajoutez un schéma ORM uniquement si vous avez besoin de requêtes de tables typées. [Environnement d’exécution](./runtime.md) explique la durée de vie d’une invocation, les lectures par instantané et les nouvelles tentatives ; [Drizzle et dates](./drizzle.md) couvre le comportement des colonnes et du stockage.

Pour les conteneurs de requête Hono, ajoutez l’[adaptateur `/mysql` du kit](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/data-layer). N’encapsulez pas dans une autre boucle de nouvelle tentative les méthodes de base de données qui retentent déjà leurs opérations. Un callback de transaction peut s’exécuter à nouveau : gardez donc les e-mails, paiements et autres effets de bord externes hors de celui-ci.
