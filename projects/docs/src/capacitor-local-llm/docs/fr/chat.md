---
title: "Chat"
sourceRevision: "edc52fe73ef8ff667d2945e729dd0bc9e524431356fe59cdf3414a5eb0a45977"
---
# Chat

Cycle de vie des conversations, streaming, annulation et préchauffage. Guides associés : [Disponibilité](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability), [Images](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images), [Événements](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/events), [Gestion des erreurs](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/errors).

## Cycle de vie du chat

Créez une conversation dont vous gérez le cycle de vie, générez du texte avec celle-ci, puis supprimez-la une fois terminé. Chaque conversation autorise une seule génération en cours à la fois.

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const { status } = await LocalLLM.getAvailability();
if (status !== 'available') {
  throw new Error(`Model not ready: ${status}`);
}

const { id: chatId } = await LocalLLM.createChat({
  instructions: 'You are a helpful assistant.',
  history: { maxMessages: 20, maxCharacters: 12000 }, // toutes les plateformes ; iOS réduit la transcription Foundation Models
});

const { text } = await LocalLLM.generateText({
  chatId,
  prompt: 'What is the capital of France?',
  // Natif uniquement : options: { temperature: 0.2, maxOutputTokens: 256 },
});

const followUp = await LocalLLM.generateText({
  chatId,
  prompt: 'What is the population of that city?',
});

console.log(text, followUp.text);

await LocalLLM.deleteChat({ id: chatId });
```

## Streaming avec `textChunk`

`streamText()` émet des fragments incrémentaux via l’événement `textChunk` et se résout avec le texte complet une fois terminé.

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const { id: chatId } = await LocalLLM.createChat();

let streamedText = '';
const chunkListener = await LocalLLM.addListener('textChunk', (event) => {
  if (event.chatId !== chatId) return;
  streamedText += event.text;
  console.log(streamedText); // remplacez par une mise à jour de l’interface de votre application
});

try {
  const { text, generationId } = await LocalLLM.streamText({
    chatId,
    prompt: 'Summarize the theory of relativity in one paragraph.',
  });
  console.log('\ncomplete:', text, generationId);
} finally {
  await chunkListener.remove();
  await LocalLLM.deleteChat({ id: chatId });
}
```

## Annuler une génération en cours

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const stateListener = await LocalLLM.addListener('generationStateChange', (event) => {
  if (event.chatId === chatId && event.state === 'started') {
    void LocalLLM.cancelGeneration({ chatId, generationId: event.generationId });
  }
});

const streamPromise = LocalLLM.streamText({ chatId, prompt: 'Write a long essay.' });

try {
  await streamPromise;
} catch (err) {
  // LOCAL_LLM_GENERATION_CANCELLED sur toutes les plateformes lorsque l’annulation est observée
} finally {
  await stateListener.remove();
}
```

`generationStateChange` est émis pour `generateText()` comme pour `streamText()`. Il signale `started` dès que le plugin accepte une génération, avant le premier fragment de texte, puis un unique état terminal : `completed`, `cancelled` ou `failed`. Utilisez son `generationId` pour cibler l’annulation de façon déterministe. `deleteChat()` annule également toute génération active de cette conversation.

## Réduire la latence de la première réponse avec le préchauffage

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const { id: chatId } = await LocalLLM.createChat({
  instructions: 'You are a customer support agent for Acme Corp.',
});

// iOS : préchauffer cette conversation. Android : préchauffage global du modèle (chatId ignoré).
// Web : créer puis libérer une session temporaire avec cette conversation (promptPrefix ignoré).
await LocalLLM.warmup({ chatId, promptPrefix: 'You are a customer support agent for Acme Corp.' });
```
