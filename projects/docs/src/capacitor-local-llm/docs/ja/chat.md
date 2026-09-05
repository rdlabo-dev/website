---
title: チャット
---

チャットの寿命、ストリーミング、キャンセル、ウォームアップを説明します。[利用可否](/docs/availability)、[画像](/docs/images)、[イベント](/docs/events)、[エラー処理](/docs/errors)も参照してください。

## チャットのライフサイクル

所有するチャットを作成して生成し、終了時に削除します。チャットごとに同時に実行できる生成は1件です。

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const { status } = await LocalLLM.getAvailability();
if (status !== 'available') {
  throw new Error(`Model not ready: ${status}`);
}

const { id: chatId } = await LocalLLM.createChat({
  instructions: 'You are a helpful assistant.',
  history: { maxMessages: 20, maxCharacters: 12000 }, // both platforms; iOS trims the Foundation Models transcript
});

const { text } = await LocalLLM.generateText({
  chatId,
  prompt: 'What is the capital of France?',
  options: { temperature: 0.2, maxOutputTokens: 256 },
});

const followUp = await LocalLLM.generateText({
  chatId,
  prompt: 'What is the population of that city?',
});

console.log(text, followUp.text);

await LocalLLM.deleteChat({ id: chatId });
```

## textChunkによるストリーミング

`streamText()` は `textChunk` で増分チャンクを通知し、終了時には全文でresolveします。

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const { id: chatId } = await LocalLLM.createChat();

let streamedText = '';
const chunkListener = await LocalLLM.addListener('textChunk', (event) => {
  if (event.chatId !== chatId) return;
  streamedText += event.text;
  console.log(streamedText); // replace with an update to your app's UI
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

## 実行中の生成をキャンセル

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
  // LOCAL_LLM_GENERATION_CANCELLED on both platforms when cancellation is observed
} finally {
  await stateListener.remove();
}
```

`generationStateChange` は `generateText()` と `streamText()` の両方で通知されます。ネイティブ層が生成を受け付けると、最初のチャンクより前に `started` を送り、最後に `completed`、`cancelled`、`failed` のいずれか1つを送ります。対象を確実に指定するには、その `generationId` を使います。`deleteChat()` も当該チャットの実行中生成をキャンセルします。

## ウォームアップで初回応答を短縮

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const { id: chatId } = await LocalLLM.createChat({
  instructions: 'You are a customer support agent for Acme Corp.',
});

// iOS: prewarm this chat. Android: global model warmup (chatId ignored).
await LocalLLM.warmup({ chatId, promptPrefix: 'You are a customer support agent for Acme Corp.' });
```

