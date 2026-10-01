---
title: "Web (Chrome)"
sourceRevision: "3b4b847955673ba439a6c4a0b83b02524468e1e6b8136843f085e3418c45eaca"
---
# Web (Chrome)

Le plugin utilise la Prompt API `LanguageModel` intégrée à Chrome pour l’inférence textuelle sur l’appareil, sans serveur ni clé API. Les téléchargements de modèle sont gérés par Chrome et nécessitent initialement une connexion réseau ; le plugin n’ajoute aucune dépendance pour servir les modèles.

Utilisez Chrome sur ordinateur avec la Prompt API exposée dans un contexte sécurisé (HTTPS ou localhost). La documentation actuelle de Google indique une prise en charge Web à partir de Chrome 148 ; l’exposition de l’API et la disponibilité du modèle dépendent encore de la version du navigateur, du matériel, du stockage, des politiques et de l’état du modèle. Chrome sur Android et iOS n’est pas pris en charge par ce backend Web. Consultez la [documentation de la Prompt API Chrome](https://developer.chrome.com/docs/ai/prompt-api) pour les prérequis actuels. Les anciennes versions expérimentales peuvent nécessiter des flags Chrome ou un origin trial ; le plugin ne modifie pas les paramètres du navigateur.

Vérifiez `getAvailability()` à l’exécution. Si l’API est absente, elle renvoie `unavailable` ; toute tentative de création d’une conversation dans ce navigateur est rejetée avec `LOCAL_LLM_UNSUPPORTED`. Une API exposée qui signale `unavailable` rejette la création de conversation avec `LOCAL_LLM_NOT_AVAILABLE`.

Appelez `downloadModel()` ou le premier `createChat()` depuis une action utilisateur, comme un clic sur un bouton, car Chrome exige une activation utilisateur pour télécharger un modèle. Écoutez `downloadProgress` pour afficher la progression. Pour les iframes inter-origines, la page qui les intègre doit déléguer `allow="language-model"`. Les Web Workers ne sont pas pris en charge.

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

// Associez ce gestionnaire à un bouton pour que Chrome puisse télécharger le modèle si nécessaire.
async function onChatClick() {
  const { id } = await LocalLLM.createChat({ instructions: 'Answer briefly.' });
  try {
    const { text } = await LocalLLM.generateText({ chatId: id, prompt: 'What is an LLM?' });
    console.log(text);
  } finally {
    await LocalLLM.deleteChat({ id });
  }
}
```

Les méthodes prises en charge comprennent la disponibilité textuelle, le téléchargement du modèle, le préchauffage, la création et la suppression de conversations, la génération de texte, le streaming, l’annulation et les anciens alias textuels et de session. `textChunk` contient du texte incrémental ; les événements d’état de génération fournissent un identifiant de `started` jusqu’à un unique état terminal. L’annulation rejette la demande avec `LOCAL_LLM_GENERATION_CANCELLED`, y compris lorsqu’une conversation est supprimée pendant la génération.

Le plugin conserve en mémoire les échanges textuels réussis et supprime les échanges complets les plus anciens pour respecter `maxMessages` (20 par défaut, minimum 2) et `maxCharacters` (12000 par défaut). Les instructions sont conservées séparément. Chaque génération crée une session navigateur à partir de l’historique conservé, puis la détruit ; les échanges annulés ou en échec ne contaminent donc pas les prompts suivants. Chrome impose également sa fenêtre de contexte ; les entrées trop volumineuses sont rejetées avec `LOCAL_LLM_CONTEXT_WINDOW_EXCEEDED`. L’historique est perdu au rechargement de la page. `warmup()` crée puis libère une session temporaire, éventuellement avec le contexte de la conversation ; il ignore `promptPrefix`, réservé à iOS.

## Limites

- Omettez `GenerationOptions` sur le Web. La Prompt API Web normale n’expose pas les réglages numériques `temperature`, `topK` ou `maxOutputTokens` du plugin. Les définir entraîne un rejet avec `LOCAL_LLM_INVALID_OPTIONS` ; les réglages réservés aux extensions Chrome ne sont pas utilisés.
- Cet adaptateur prend actuellement en charge uniquement les entrées textuelles. `getImageAnalysisAvailability()` renvoie `unavailable` ; fournir `images` ou `imagePaths` entraîne un rejet avec `LOCAL_LLM_UNSUPPORTED`. Chrome possède des capacités multimodales distinctes, mais cet adaptateur ne les expose pas encore.
- `generateImage()` et `configureFallbackModel()`, réservé à Android, sont rejetés avec `LOCAL_LLM_UNSUPPORTED`.
- Les événements de disponibilité sont émis lorsque les appels du plugin observent un changement et pendant le téléchargement du modèle. Le Web n’effectue pas de sondage en arrière-plan.

## Vérification

Exécutez `npm run verify:web` pour compiler le package, vérifier les types publics et exécuter les tests de régression de l’adaptateur navigateur. Ces tests simulent la Prompt API ; l’inférence réelle du modèle doit également être vérifiée dans un navigateur Chrome compatible avec l’application d’exemple (`cd example-app` puis `npm run dev`).

### Validation manuelle du texte

Utilisez l’onglet **Prompt** de l’application d’exemple dans Chrome compatible. La suite distincte **Physical-device acceptance** nécessite une entrée visuelle et est destinée aux vérifications sur appareils natifs.

1. Sélectionnez **Check Availability**. Si le modèle est téléchargeable, sélectionnez **Download Model** et attendez `available`.
2. Saisissez `Remember the code word ORCHID. Reply briefly.` et sélectionnez **Stream Response**. Vérifiez que le texte apparaît progressivement et que les commandes redeviennent disponibles.
3. Saisissez `What code word did I ask you to remember?` et relancez le streaming. Vérifiez que la réponse utilise l’échange précédent. Une question de suivi en japonais peut aussi vérifier la sortie multilingue.
4. Demandez une longue histoire. Après l’apparition de l’identifiant de conversation et le début de la génération, sélectionnez **Cancel Generation**. Vérifiez l’erreur d’annulation et la réussite d’un autre prompt court ensuite.
5. Sélectionnez **Delete Chat**, puis envoyez un autre prompt. Vérifiez qu’un nouvel identifiant de conversation est créé et que l’ancienne conversation n’est pas conservée.
6. Dans un navigateur sans Prompt API, vérifiez que la disponibilité est `unavailable` et que la génération signale `LOCAL_LLM_UNSUPPORTED` sans faire planter la page.

La formulation du modèle n’est pas déterministe. Évaluez la réussite de l’inférence et le comportement du cycle de vie indépendamment du texte généré exact.

Le streaming et l’annulation sont détaillés dans [Conversations](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/chat). Le traitement des états figure dans [Disponibilité](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability) ; les codes d’erreur stables dans [Gestion des erreurs](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/errors).
