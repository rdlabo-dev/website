---
title: "Disponibilité et comportement des plateformes"
sourceRevision: "3f2099b8e00f4bb36f67c2fd694e6dbaa4eb862d346bd9b8a01a677f1373f54e"
---
# Disponibilité et comportement des plateformes

Comment interpréter les états de [`getAvailability()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#getavailability) et le comportement à l’exécution propre à chaque plateforme. Guides associés : [Configuration](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/setup), [Modèle de repli Android](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/android-fallback), [Conversations](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/chat), [Images](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images), [Événements](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/events).

## Disponibilité

[`getAvailability()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#getavailability) renvoie une valeur sémantique de `status` :

| État                | Signification                                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `available`           | Le modèle textuel est prêt pour la génération.                                                                                                                                                   |
| `device-not-eligible` | L’appareil ou la version du système ne prend pas en charge le modèle textuel sur l’appareil. iOS indique cette situation précisément ; `FeatureStatus.UNAVAILABLE` d’Android n’expose pas de motif et correspond à `unavailable`. |
| `not-enabled`         | L’appareil prend en charge l’IA locale, mais l’utilisateur ne l’a pas activée (par exemple Apple Intelligence est désactivé). Cet état est principalement signalé sur iOS.                                                             |
| `downloadable`        | Le modèle peut être téléchargé (Android).                                                                                                                                                    |
| `downloading`         | Un téléchargement du modèle est en cours (Android).                                                                                                                                                |
| `not-ready`           | Le modèle existe, mais son initialisation n’est pas terminée.                                                                                                                                               |
| `unavailable`         | Le modèle est indisponible pour une autre raison.                                                                                                                                              |

Abonnez-vous à `availabilityChange` (ou à l’ancien alias `systemAvailabilityChange`) pour recevoir les mises à jour tant que les écouteurs sont enregistrés. Sur Android, le plugin effectue un sondage tant que les écouteurs sont actifs.

Les anciens `systemAvailability()` et `systemAvailabilityChange` ramènent les états détaillés au contrat d’origine à quatre valeurs : `available`, `unavailable`, `notready` et `downloadable`. `downloading` et `not-ready` correspondent à `notready` ; `device-not-eligible`, `not-enabled` et `unavailable` correspondent à `unavailable`.

## Comportement des plateformes

### iOS

- **Le LLM textuel nécessite iOS 26 et Apple Intelligence.** Avant iOS 26, la disponibilité est signalée par `device-not-eligible`. Seuls certains iPhone (iPhone 15 Pro ou ultérieur) et iPad prennent en charge Apple Intelligence. [En savoir plus](https://www.apple.com/apple-intelligence/).
- **Les conversations utilisent la transcription native de Foundation Models.** L’état de la conversation réside dans `LanguageModelSession`. Avant la génération, le plugin applique aussi un budget de caractères prudent par rapport au `contextSize` natif du modèle, en incluant les instructions, le prompt actuel et une réserve pour la sortie. Lorsqu’une limite est dépassée, il supprime les échanges prompt/réponse complets les plus anciens, conserve les instructions et recrée la session.
- **`warmup({ chatId, promptPrefix })` préchauffe une conversation précise** créée avec `createChat()`.
- **`cancelGeneration()` annule la `Task` en cours** pour la conversation. La Promise de `streamText()` / `generateText()` est rejetée avec `LOCAL_LLM_GENERATION_CANCELLED` ; le texte déjà reçu via `textChunk` reste dans votre interface.
- Les détails de **l’analyse et de la génération d’images** figurent dans [Images](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images).

### Android

- **L’historique des conversations est structuré en mémoire** par le plugin. Chaque conversation stocke les échanges utilisateur/assistant et les réduit selon `history.maxMessages` (**20** par défaut) et `history.maxCharacters` (**12000** par défaut). Gemini Nano utilise ensuite `countTokens()` de ML Kit pour respecter le contexte. LiteRT-LM utilise une estimation prudente d’un caractère par token, plus des réserves pour le prompt et les images, car la version 0.16.1 n’offre pas d’API stable de comptage des tokens. Les deux parcours suppriment les échanges complets les plus anciens ; les instructions système sont stockées séparément et jamais réduites. L’historique ne persiste pas entre les redémarrages de l’application.
- **`warmup()` préchauffe le modèle globalement** et ignore `chatId` / `promptPrefix`.
- **`cancelGeneration()` fonctionne au mieux des possibilités.** Il annule la coroutine du plugin ; ML Kit peut avoir déjà émis une sortie partielle avant la fin de l’annulation. La Promise est rejetée avec `LOCAL_LLM_GENERATION_CANCELLED` lorsque l’annulation est observée.
- **Les valeurs de `GenerationOptions` non prises en charge sont rejetées** avec `LOCAL_LLM_INVALID_OPTIONS`, plutôt que ramenées silencieusement aux bornes. `maxOutputTokens` doit être compris dans `1..min(device token limit, 4096)` ; lorsqu’il est omis, la valeur par défaut du plugin est **256**.
- **Les opérations natives sur les modèles s’exécutent en série.** Le mutex du plugin protège la génération Gemini Nano et LiteRT-LM, la configuration du repli, le préchauffage, le téléchargement et la destruction ; les générations simultanées de différentes conversations sont donc mises en file d’attente.
- **Tous les appareils API 29+ ne prennent pas en charge Gemini Nano.** L’appareil doit posséder une infrastructure d’IA locale compatible. [En savoir plus](https://developers.google.com/ml-kit/genai#device-support).
- **Les applications peuvent configurer explicitement un repli LiteRT-LM** lorsque Gemini Nano est indisponible. Une fois l’initialisation terminée, `getAvailability()` signale `available`. Consultez [Modèle de repli Android](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/android-fallback).
- Le choix du backend d’**analyse d’images** est documenté dans [Images](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images).
- **Les modèles sur l’appareil ne peuvent pas être utilisés lorsque l’application est en arrière-plan.** Les demandes d’inférence effectuées en arrière-plan échouent.
- **AICore impose des quotas d’inférence par application.** Des demandes excessives peuvent entraîner des erreurs d’occupation ou de quota du SDK sous-jacent — envisagez un délai de réessai exponentiel.

### Web (Chrome)

La disponibilité textuelle correspond directement aux états `available`, `downloadable`, `downloading` et `unavailable` de Chrome. Les API absentes signalent `unavailable`. Les événements de disponibilité reflètent les changements observés par les vérifications du plugin et la création ou le téléchargement de sessions, plutôt qu’un sondage en arrière-plan. L’analyse d’images signale actuellement `unavailable`. Consultez [Web](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/web) pour la configuration, les méthodes prises en charge et les réglages de génération.
