---
title: "Premiers pas"
sourceRevision: "01402388df976e0a8ad93e162a5b70b4567aab5178940bdb2447f3bbe8cdcd2c"
---
# @rdlabo/workers-hono-kit

Briques Hono partagées pour les API Cloudflare Workers : ETags faibles, validation et corps d’erreur au format NestJS, middleware d’authentification Firebase, utilitaires AWS, intégration AI Gateway, Stripe, KV, files de messages, temps réel et contrats hors ligne.

[Essayez une API Hono en local](./docs/quickstart.md) : envoyez une requête de vérification de l’état, examinez son ETag faible et observez la réponse JSON à une route inexistante. Ce premier exercice ne nécessite ni compte Cloudflare ni ouverture de port.

## Installation

```sh
npm install @rdlabo/workers-hono-kit
```

Le package utilise ESM, fournit des déclarations TypeScript et nécessite Node.js 20 ou version ultérieure pour ses outils. Stripe est inclus directement. npm installe les dépendances pair requises pour Hono, la validation, l’authentification, AWS et AI Gateway ; avec un gestionnaire de packages configuré pour ne pas installer automatiquement ces dépendances, vous devez les ajouter explicitement :

```sh
npm install hono zod @hono/zod-validator jose aws4fetch ai-gateway-provider
```

Les autres dépendances pair et packages facultatifs restent séparés :

| Fonctionnalité              | Installation                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Wrappers de modèles AI SDK   | `ai`                                                                                                               |
| MySQL et Hyperdrive    | [`@rdlabo/workers-mysql`](https://docs.rdlabo.dev/projects/workers-mysql/docs/readme) et, si nécessaire, `drizzle-orm` |
| Utilitaires de fuseaux horaires IANA | [`@rdlabo/workers-timezone`](https://docs.rdlabo.dev/projects/workers-timezone/docs/readme)                        |

À partir de `0.12.0`, `/testing` conserve des exports statiques de compatibilité pour les bases de données. Tous les utilisateurs de `/testing`, y compris les applications qui n’utilisent que les doublures Firebase ou KV, doivent installer `@rdlabo/workers-mysql` et `drizzle-orm`.

La version `0.12.0` déplace les exports MySQL de la racine vers le package autonome et l’adaptateur `/mysql`. Les utilisateurs existants doivent suivre le [guide de migration MySQL](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/data-layer) avant la mise à niveau.

## Démarrage rapide

Une application Hono minimale avec des ETags faibles, le corps d’erreur partagé et une réponse JSON 404 `{ message: 'Cannot METHOD path', error: 'Not Found', statusCode: 404 }` :

```ts
import { Hono } from 'hono';
import { createAppErrorHandler, finalizeResponse, notFoundHandler } from '@rdlabo/workers-hono-kit';

const app = new Hono();

app.use('*', finalizeResponse());
app.onError(createAppErrorHandler());
app.notFound(notFoundHandler);

app.get('/health', (c) => c.json({ ok: true }));

export default app;
```

## Choisir un point d’entrée

| Import                                   | Rôle                                                       |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `@rdlabo/workers-hono-kit`               | Primitives HTTP, d’authentification, Firebase, AWS, AI, Stripe, KV et de files de messages      |
| `@rdlabo/workers-hono-kit/mysql`         | Adaptateur de conteneur Hono pour `@rdlabo/workers-mysql`                   |
| `@rdlabo/workers-hono-kit/offline`       | Contrats de format d’échange des répliques hors ligne, de curseurs, de journal et de compatibilité   |
| `@rdlabo/workers-hono-kit/realtime`      | Utilitaires WebSocket et de nouvelle tentative pour Durable Objects                           |
| `@rdlabo/workers-hono-kit/testing`       | Utilitaires d’authentification, doublures, jeux de données de test Stripe et exports de tests de compatibilité |
| `@rdlabo/workers-hono-kit/db`            | Chemin de compatibilité déprécié pour `@rdlabo/workers-mysql`            |
| `@rdlabo/workers-hono-kit/business-time` | Chemin de compatibilité déprécié pour `@rdlabo/workers-timezone`         |

Le point d’entrée racine ne charge ni MySQL, ni Drizzle, ni les modules de migration réservés à Node. Les utilisateurs de MySQL installent le package autonome, qui prend en charge `mysql2` ; l’intégration propre à Hono reste dans l’adaptateur `/mysql`.

### Dépréciation des imports de compatibilité

Les chemins `/db`, `/business-time` du kit et les exports de `/testing` liés aux bases de données (`createTestDb`, doublures de base de données pool/noop et types `Database` partagés) portent des balises `@deprecated` sur chaque symbole, renvoyant à `@rdlabo/workers-mysql` / `@rdlabo/workers-timezone`. Privilégiez ces packages pour le nouveau code. Les alias de compatibilité conservent la même identité à l’exécution et les mêmes signatures ; leur suppression n’est pas prévue. Cette migration ne déprécie pas les utilitaires appartenant au kit, tels que `reopenGuardedPaymentFailedSet`, `createContainerRuntime` de `/mysql` et les utilitaires de test Firebase/auth/KV/Stripe.

## Documentation

- [HTTP et authentification](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/http-auth)
- [Couche de données et migration MySQL](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/data-layer)
- [Temps réel et mode hors ligne](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/realtime-offline)
- [Tests et exploitation](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/testing-operations)
- [Packages et référence API](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/api)

<!-- rdlabo-docs-omit -->

**Documentation complète :** [https://docs.rdlabo.dev/projects/workers-hono-kit](https://docs.rdlabo.dev/projects/workers-hono-kit)

Les artefacts candidats et les contrôles de publication sont décrits dans [Développement](https://docs.rdlabo.dev/projects/workers-hono-kit/docs/development).

## Mainteneurs

- [rdlabo](https://rdlabo.dev/)

## Licence

[MIT](./LICENSE) © rdlabo-dev

<!-- /rdlabo-docs-omit -->
