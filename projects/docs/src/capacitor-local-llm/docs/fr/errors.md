---
title: "Gestion des erreurs"
sourceRevision: "f88f0419566e96e348f93a41532a340386b5b62514ed02796fa19e074ed8d51b"
---
# Gestion des erreurs

Codes d’erreur stables exposés par les erreurs Capacitor natives et l’implémentation Web. Guides associés : [Conversations](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/chat), [Disponibilité](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability), [Images](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images), [Migration](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/migration).

Les erreurs Capacitor natives et l’implémentation Web exposent une chaîne `code` stable correspondant à `LocalLLMErrorCode`. Sur le Web, les échecs lèvent `LocalLLMException`, qui étend `Error` et définit `code`.

```typescript
import { LocalLLM, LocalLLMException } from '@rdlabo/capacitor-local-llm';

try {
  await LocalLLM.generateText({ chatId: 'missing', prompt: 'Hello' });
} catch (err) {
  const code = err instanceof LocalLLMException ? err.code : (err as { code?: string }).code;
  console.log(code, (err as Error).message);
}
```

## `LocalLLMErrorCode`

| Code                                | Description                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| `LOCAL_LLM_NOT_AVAILABLE`           | Le modèle textuel sur l’appareil est indisponible.                                            |
| `LOCAL_LLM_DEVICE_NOT_ELIGIBLE`     | L’appareil ou le système ne prend pas en charge la génération textuelle locale.                        |
| `LOCAL_LLM_NOT_ENABLED`             | L’IA sur l’appareil est prise en charge, mais l’utilisateur ne l’a pas activée.                              |
| `LOCAL_LLM_MODEL_NOT_READY`         | Le modèle est en cours de téléchargement ou d’initialisation (`downloading` / `not-ready`).             |
| `LOCAL_LLM_MODEL_DOWNLOAD_REQUIRED` | Le modèle doit d’abord être téléchargé (`downloadable`).                                |
| `LOCAL_LLM_CONTEXT_WINDOW_EXCEEDED` | Le prompt et la sortie demandée dépassent les limites, même après réduction de l’historique supprimable. |
| `LOCAL_LLM_CHAT_NOT_FOUND`          | Le `chatId` n’existe pas.                                                        |
| `LOCAL_LLM_CHAT_BUSY`               | Une génération est déjà en cours pour cette conversation.                                  |
| `LOCAL_LLM_GENERATION_NOT_FOUND`    | Aucune génération en cours ne correspond (ou `generationId` ne correspond pas).                      |
| `LOCAL_LLM_GENERATION_CANCELLED`    | La génération a été annulée via `cancelGeneration()` ou `deleteChat()`.            |
| `LOCAL_LLM_INVALID_OPTIONS`         | Une valeur d’option est absente ou hors limites.                                         |
| `LOCAL_LLM_UNSUPPORTED`             | La méthode ou la fonctionnalité n’est pas prise en charge sur cette plateforme ou cette version du système.              |
| `LOCAL_LLM_IMAGE_NOT_READABLE`      | Une URI d’image ne peut pas être résolue, ouverte ou décodée.                                |
| `LOCAL_LLM_IMAGE_TOO_LARGE`         | Une image dépasse la politique de taille d’entrée de la plateforme.                                    |
| `LOCAL_LLM_GENERATION_FAILED`       | La génération a échoué pour un motif stable correspondant à la plateforme.                             |
| `LOCAL_LLM_IMAGE_GENERATION_FAILED` | La génération d’image a échoué (par exemple aucun style disponible).                                  |
| `LOCAL_LLM_UNKNOWN_ERROR`           | Une erreur inattendue du SDK sous-jacent. Consultez `message` pour les détails.                    |
