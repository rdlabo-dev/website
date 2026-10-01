---
title: "Essayer une API Hono en local"
sourceRevision: "d966cba21be3dfabc95d4ac5ca73d510d15904a4e63c2c6363bdecf525db5e6a"
---
Donnez à une API Hono un comportement HTTP cohérent : une réponse de vérification de l’état avec un ETag faible et une réponse JSON prévisible pour les routes inexistantes. Vous observerez ces deux réponses sans ouvrir de port ni créer de compte Cloudflare.

## 1. Créer un petit projet

Utilisez Node.js 24 et npm pour cet exercice. Les commandes fixent la version du kit documentée ici. npm installe ses dépendances pair requises ; les gestionnaires de packages configurés pour les omettre doivent suivre les [prérequis d’installation](../README.md).

```sh
mkdir hono-kit-demo
cd hono-kit-demo
npm init -y
npm pkg set type=module
npm install @rdlabo/workers-hono-kit@0.12.2 hono@4
npm install --save-dev tsx@4
```

## 2. Envoyer deux requêtes

Enregistrez ce code dans `demo.ts`. `app.request()` exécute les requêtes sur l’application Hono dans le processus courant.

```ts
import { Hono } from 'hono';
import { createAppErrorHandler, finalizeResponse, notFoundHandler } from '@rdlabo/workers-hono-kit';

const app = new Hono();
app.use('*', finalizeResponse());
app.onError(createAppErrorHandler());
app.notFound(notFoundHandler);
app.get('/health', (c) => c.json({ ok: true }));

const healthy = await app.request('/health');
console.log(healthy.status, await healthy.text());
console.log('weak etag:', healthy.headers.get('etag')?.startsWith('W/'));

const missing = await app.request('/missing');
console.log(missing.status, await missing.text());
```

```sh
npx tsx demo.ts
```

Résultat attendu (l’ordre des propriétés JSON n’a pas d’importance) :

```text
200 {"ok":true}
weak etag: true
404 {"message":"Cannot GET /missing","error":"Not Found","statusCode":404}
```

Vous avez vérifié le comportement HTTP ajouté par le kit. Cet exercice ne configure pas les bindings Workers, n’authentifie pas les utilisateurs et ne teste pas un service déployé.

## 3. Intégrer le code dans votre application

Conservez l’enregistrement des middlewares et des routes, supprimez les requêtes de démonstration et exportez `app` comme gestionnaire de votre Worker. Poursuivez avec [HTTP et authentification](./http-auth.md). Ajoutez l’[adaptateur MySQL](./data-layer.md) uniquement si l’application a besoin d’une base de données.

Les utilisateurs existants du kit doivent vérifier [la migration des imports en 0.12](./data-layer.md) avant la mise à niveau. Les anciens chemins `/db` et `/business-time` sont des exports de compatibilité ; les nouvelles intégrations utilisent les packages autonomes.

## Étapes suivantes

| Votre besoin                                    | Commencez par                                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Comportement HTTP, d’authentification ou de files de messages Hono partagé   | `@rdlabo/workers-hono-kit`                                                                     |
| Accès MySQL, avec ou sans Hono          | [Workers MySQL](https://docs.rdlabo.dev/projects/workers-mysql/docs/quickstart)                |
| Conversions de fuseaux horaires et vérifications du nouveau code | [Workers Timezone + ESLint](https://docs.rdlabo.dev/projects/workers-timezone/docs/quickstart) |
| Conventions de code pendant le développement         | [ESLint Plugin Rules](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/quickstart)    |

Le kit fournit une infrastructure réutilisable. Vos routes, règles métier, identifiants et schéma de base de données restent dans votre application. Commencez par un utilitaire ; vous n’avez pas besoin d’adopter tous les points d’entrée.
