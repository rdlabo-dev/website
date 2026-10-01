---
title: "Chat"
sourceRevision: "edc52fe73ef8ff667d2945e729dd0bc9e524431356fe59cdf3414a5eb0a45977"
---
# Chat

Chat-Lebenszyklus, Streaming, Abbruch und Warmup. Zugehörige Anleitungen: [Verfügbarkeit](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability), [Bilder](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images), [Ereignisse](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/events), [Fehlerbehandlung](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/errors).

## Chat-Lebenszyklus

Erstellen Sie einen vom Plugin verwalteten Chat, generieren Sie darin Text und löschen Sie ihn nach Abschluss. Pro Chat kann jeweils nur eine Generierung gleichzeitig laufen.

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const { status } = await LocalLLM.getAvailability();
if (status !== 'available') {
  throw new Error(`Model not ready: ${status}`);
}

const { id: chatId } = await LocalLLM.createChat({
  instructions: 'You are a helpful assistant.',
  history: { maxMessages: 20, maxCharacters: 12000 }, // Alle Plattformen; iOS kürzt das Foundation-Models-Transkript
});

const { text } = await LocalLLM.generateText({
  chatId,
  prompt: 'What is the capital of France?',
  // Nur nativ: options: { temperature: 0.2, maxOutputTokens: 256 },
});

const followUp = await LocalLLM.generateText({
  chatId,
  prompt: 'What is the population of that city?',
});

console.log(text, followUp.text);

await LocalLLM.deleteChat({ id: chatId });
```

## Streaming mit `textChunk`

`streamText()` sendet fortlaufend Textabschnitte über das Ereignis `textChunk` und wird nach Abschluss mit dem vollständigen Text aufgelöst.

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const { id: chatId } = await LocalLLM.createChat();

let streamedText = '';
const chunkListener = await LocalLLM.addListener('textChunk', (event) => {
  if (event.chatId !== chatId) return;
  streamedText += event.text;
  console.log(streamedText); // Durch eine Aktualisierung der App-UI ersetzen
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

## Eine laufende Generierung abbrechen

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
  // LOCAL_LLM_GENERATION_CANCELLED auf allen Plattformen, sobald der Abbruch erkannt wird
} finally {
  await stateListener.remove();
}
```

`generationStateChange` wird sowohl für `generateText()` als auch für `streamText()` ausgelöst. Sobald das Plugin eine Generierung annimmt, meldet es noch vor dem ersten Textabschnitt `started`. Danach folgt genau ein Endzustand: `completed`, `cancelled` oder `failed`. Verwenden Sie die zugehörige `generationId`, um gezielt diese Generierung abzubrechen. `deleteChat()` bricht ebenfalls jede aktive Generierung dieses Chats ab.

## Die Wartezeit bis zur ersten Antwort durch Warmup verkürzen

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const { id: chatId } = await LocalLLM.createChat({
  instructions: 'You are a customer support agent for Acme Corp.',
});

// iOS: Diesen Chat vorwärmen. Android: Globales Modell-Warmup (chatId wird ignoriert).
// Web: Eine temporäre Sitzung mit diesem Chat erstellen und freigeben (promptPrefix wird ignoriert).
await LocalLLM.warmup({ chatId, promptPrefix: 'You are a customer support agent for Acme Corp.' });
```
