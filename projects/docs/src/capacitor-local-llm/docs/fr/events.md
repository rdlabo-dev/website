---
title: "Événements"
sourceRevision: "67a8c132bc7208d7aaf6fe34239fd3d14fd67bd58f3b9baaaeaed5c0ab71c931"
---
# Événements

Événements du plugin pour la disponibilité, la progression du téléchargement, les fragments de streaming et le cycle de vie de la génération. Guides associés : [Disponibilité](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability), [Conversations](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/chat), [Configuration](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/setup), [Gestion des erreurs](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/errors).

| Événement                   | Description                                                                                                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `availabilityChange`    | Déclenché lorsque la disponibilité du modèle textuel change tant que les écouteurs sont enregistrés.                                                                                                                                     |
| `downloadProgress`      | Déclenché pendant `downloadModel()` sur Android. Les événements intermédiaires peuvent ne contenir que `downloadedBytes`, car ML Kit n’expose pas le nombre total d’octets ; `progress` vaut `0` au départ et `1` à la fin lorsque la progression est connue. |
| `textChunk`             | Déclenché pendant `streamText()` avec du texte incrémental pour le `chatId` / `generationId` correspondant.                                                                                                                  |
| `generationStateChange` | Déclenché pour les générations textuelles acceptées avec `started`, puis `completed`, `cancelled` ou `failed`. Les événements d’erreur terminaux incluent un `errorCode` stable.                                                            |

Supprimez les écouteurs avec le `PluginListenerHandle.remove()` renvoyé ou `removeAllListeners()`.

Sur le Web, `downloadProgress.progress` provient de la progression normalisée des téléchargements de Chrome (0–1) ; le nombre d’octets est omis. Les événements de disponibilité reflètent les changements observés pendant les vérifications du plugin et la création ou le téléchargement de sessions. Les événements de streaming et de cycle de vie de génération suivent le même contrat que le natif.
