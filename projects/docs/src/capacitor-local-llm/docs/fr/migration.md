---
title: "Migration"
sourceRevision: "797546168d7d52f3c5629004481f1eac86e55be46699566a1bc8b25142dc66dc"
---
# Migration

API de compatibilité v1 obsolètes et indications de migration depuis le projet amont Ionic. Guides associés : [Disponibilité](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability), [Conversations](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/chat), [Gestion des erreurs](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/errors), [Configuration](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/setup).

## API de compatibilité obsolètes

Les API v1 restent disponibles, mais sont obsolètes au profit des méthodes explicites de conversation et de disponibilité :

| Obsolète                                   | Remplacement                                        |
| -------------------------------------------- | -------------------------------------------------- |
| `systemAvailability()`                       | `getAvailability()`                                |
| `download()`                                 | `downloadModel()`                                  |
| `prompt()`                                   | `createChat()` + `generateText()` / `streamText()` |
| `endSession()`                               | `deleteChat()`                                     |
| `addListener('systemAvailabilityChange', …)` | `addListener('availabilityChange', …)`             |
| `warmup({ sessionId })`                      | `warmup({ chatId })`                               |

`systemAvailability()` et `systemAvailabilityChange` renvoient l’ancien contrat `LLMAvailability` à quatre valeurs (`available`, `unavailable`, `notready`, `downloadable`) en regroupant les états détaillés de `Availability` décrits dans [Disponibilité](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability).

`prompt()` sans `sessionId` effectue toujours une génération unique pour assurer la compatibilité.

## Migration depuis le projet amont Ionic v1

Ce fork ne remplace pas intégralement le package d’origine sans adaptation. Remplacez la dépendance et les imports par `@rdlabo/capacitor-local-llm`, adoptez `getAvailability()` et le cycle de vie explicite `createChat()` / `generateText()` / `deleteChat()`, et traitez les états détaillés et les codes d’erreur stables. Les versions minimales sont iOS 18.4 et Android API 29. Les points d’entrée v1 obsolètes restent disponibles comme couche de transition, y compris les quatre valeurs de disponibilité d’origine.
