---
title: "HTTP et authentification"
sourceRevision: "59f1e73332c95e13facccee4efdfaf9553e453e7480f32a18766cf68f9ace72f"
---
# HTTP et authentification

Validation, authentification Firebase, corps d’erreur partagés au format NestJS et finalisation des réponses pour les API Hono sur Workers.

## Validation

`validate(target, schema, options?)` adapte un schéma Zod à Hono et renvoie une réponse `400` au format de `ValidationPipe` de NestJS. Utilisez `createValidate({ sentry })` pour configurer une seule fois le signalement facultatif.

```ts
import { createValidate, zNumOptional } from '@rdlabo/workers-hono-kit';
import { z } from 'zod';

const validate = createValidate({ sentry });
const querySchema = z.object({ page: zNumOptional() });

app.get('/items', validate('query', querySchema), async (c) => {
  const query = c.req.valid('query');
  return c.json(await listItems(query.page));
});
```

## Authentification

`createAuthMiddleware()` lit un en-tête contenant un jeton, vérifie un jeton d’identification Firebase, résout éventuellement l’identifiant de l’utilisateur dans l’application et stocke le résultat dans le contexte Hono. Utilisez `createRemoteFirebaseVerifier(projectId)` pour une vérification JWKS distante avec cache, ou `createServiceAccountVerifier()` si les opérations `getUser` et `deleteUser` d’Identity Toolkit sont nécessaires.

Distinguez les échecs d’identité, de réauthentification et d’identifiants propres à une fonctionnalité grâce aux utilitaires qui produisent un corps d’erreur d’authentification stable.

## Contrats d’erreur et de routage

- `createAppErrorHandler()` combine la classification des échecs de requêtes, la classification générique des erreurs mysql2 et le signalement facultatif.
- `createHttpErrorHandler()` convertit `HTTPException` en corps d’erreur JSON partagé.
- `notFoundHandler()` renvoie `Cannot METHOD path` avec un statut 404.
- `normalizeTrailingSlash()` supprime les barres obliques finales sans redirection et préserve le corps des requêtes.
- `finalizeResponse()` ajoute des ETags faibles et traite les requêtes `If-None-Match` correspondantes.

Installez `createMaintenanceMiddleware()` après CORS et avant le middleware de conteneur ou de base de données, afin que les réponses de maintenance n’initialisent pas une infrastructure coûteuse.

## Traitements différés et observabilité

`createWaitUntilDefer(ctx)` enregistre les tâches en arrière-plan via `waitUntil` et journalise les tâches qui échouent. `perfLog()` envoie à Workers Logs, et éventuellement à Analytics Engine, la latence applicative de chaque requête, le colo, l’état cold/warm, la route et le statut.

## Étape suivante

Poursuivez avec [Couche de données](./data-layer.md) pour MySQL et Hyperdrive, ou consultez [API](./api.md) pour la liste complète des exports.
