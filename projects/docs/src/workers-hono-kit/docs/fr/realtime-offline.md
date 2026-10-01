---
title: "Temps réel et mode hors ligne"
sourceRevision: "77a5be22679f789e3deb845fb348a34b8f9d85044685a2ea783ca3728ad8ab32"
---
# Temps réel et mode hors ligne

Utilitaires WebSocket pour Durable Objects et contrats de répliques hors ligne indépendants des tables. Les schémas du produit, les structures Zod et les règles métier restent dans l’application.

## Temps réel avec Durable Objects

Les points d’entrée racine et `/realtime` exposent les mêmes primitives de temps réel ciblées :

- `configureHibernationAutoResponse()` configure les échanges ping/pong à l’exécution sans réveiller JavaScript.
- `upgradeHibernationWebSocket()` attache l’état avant d’accepter la connexion WebSocket.
- `broadcastHibernationWebSockets()` diffuse les messages sur les sockets restaurés par `getWebSockets()`.
- `acknowledgeHibernationWebSocketClose()` et `closeHibernationWebSocket()` normalisent le traitement de la fermeture.
- `retryDurableObjectOperation()` retente uniquement les erreurs marquées `retryable` et non `overloaded`. Créez un nouveau stub dans l’opération à chaque tentative.
- `invokeDurableObjectFetch()` préserve le contrat structuré des réponses et des erreurs pour les appels aux DO.

Les parseurs du protocole WebSocket valident les sous-protocoles proposés avant l’upgrade.

## Contrats des répliques hors ligne

`@rdlabo/workers-hono-kit/offline` est indépendant des tables. Les schémas du produit, les objets Zod, les listes de colonnes publiques autorisées, les empreintes des schémas et les règles métier restent dans l’application.

`defineRestDbMethodConverter()` définit le typage d’un convertisseur pur entre méthodes REST et tables. Chaque table et colonne représentée est obligatoire, y compris les colonnes nullables ou dotées d’une valeur par défaut. Omettez un `id` auto-incrémenté du schéma de table géré par le produit lorsqu’une méthode de création ne le prend volontairement pas en charge.

Les utilitaires de format d’échange normalisent les valeurs :

- `toReplicaIsoDatetime()` → UTC ISO-8601
- `toReplicaDateOnly()` → `YYYY-MM-DD` ou `null`
- `toTinyIntFlag()` / `fromTinyIntFlag()` → conversion booléen/tinyint
- `replicaNowIso(clock?)` → heure actuelle injectable

Les utilitaires de journal imposent la couverture des curseurs, la rétention, les transactions de mutation et le comportement de réinitialisation de l’état de référence. Les utilitaires de compatibilité du format d’échange permettent à une application d’accepter des empreintes précédentes explicitement autorisées tout en conservant une empreinte actuelle de référence.

## Étape suivante

Poursuivez avec [Tests et exploitation](./testing-operations.md), ou consultez [API hors ligne](./api-offline.md) pour les détails des exports de convertisseurs et de format d’échange.
