---
title: "Tests et exploitation"
sourceRevision: "28e908a57608242217553841a36d42490fd0a06d6403693db26060bf197da40c"
---
# Tests et exploitation

Utilitaires de test, traitement de files par lots, CLI d’exploitation et frontières de confiance pour les applications Hono sur Workers.

## Point d’entrée des tests

`@rdlabo/workers-hono-kit/testing` n’est jamais chargé par le code de production. Ses utilitaires de base de données sont des exports de compatibilité dépréciés provenant de `@rdlabo/workers-mysql/testing`, tandis que les doublures Firebase, HTTP, Stripe, KV et Queue restent dans le kit Hono.

| Utilitaire                                                          | Utilisation                                                                   |
| --------------------------------------------------------------- | --------------------------------------------------------------------- |
| `createTestDb()`                                                | Créer une base de test à partir des migrations Drizzle.                       |
| `FakeFirebaseVerifier`                                          | Vérifier les jetons Firebase enregistrés en mémoire.                          |
| `createPoolDatabase()` / `createNoopDatabase()`                 | Fournir des implémentations de base de données pour les tests.                           |
| `authHeaders()` / `registerFirebaseToken()` / `provisionUser()` | Préparer des tests de routes authentifiées.                                    |
| `configurableFake()`                                            | Créer une doublure partielle qui échoue explicitement lorsqu’un membre non configuré est utilisé. |
| `fakeKv()` / `fakeQueue()`                                      | Utiliser des doublures en mémoire pour les bindings Workers.                                  |
| Fabriques de jeux de données de test Stripe                                        | Créer des événements, sessions, abonnements, prix et intents typés.    |

Comme `/testing` réexporte statiquement les utilitaires de base de données, tous les utilisateurs de `/testing` du kit doivent installer `@rdlabo/workers-mysql` et `drizzle-orm`, y compris ceux qui n’utilisent que des utilitaires sans base de données.

## Files de messages

`sendInChunks()` limite les envois vers les files pour respecter les limites de sous-requêtes de Workers. `processBatch()` traite les messages d’un lot séquentiellement, en limitant les sous-requêtes simultanées à une seule ; les erreurs explicitement marquées `queueDisposition: 'discard'` sont acquittées, tandis que les autres échecs entraînent une nouvelle tentative. `createQueueErrorHandler()` ajoute la journalisation et, si souhaité, le signalement lors de la dernière tentative.

## CLI d’exploitation

Le kit Hono fournit des commandes pour synchroniser les identifiants AWS de développement, contrôler le nombre de sous-requêtes déclenchées, vérifier les bundles temps réel et interroger les métriques des Durable Objects. La création d’un état de référence de la base de données relève de `workers-mysql-db-baseline` ; l’ancienne commande `workers-hono-kit-db-baseline` lui délègue cette tâche pendant la période de compatibilité. Avant de modifier l’infrastructure, exécutez la CLI fournie avec la version installée.

## Frontières de confiance

Les clients AWS, Firebase, AI Gateway, Stripe et de base de données sont configurés par l’application qui utilise le kit. Ne placez pas les identifiants, schémas ou politiques d’autorisation propres au domaine métier dans le kit partagé. Utilisez `createRolePolicy()` uniquement pour une correspondance des rôles et relations indépendante du stockage ; l’application reste responsable de ses rôles et permissions.

## Étape suivante

Consultez [API de test](./api-testing.md) pour les tableaux d’exports, [CLI](./cli.md) pour les détails des commandes, ou [API](./api.md) pour la liste complète des packages et points d’entrée.
