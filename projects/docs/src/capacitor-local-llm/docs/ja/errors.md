---
title: エラー処理
---

ネイティブCapacitorエラーとWeb stubが公開する安定したエラーコードです。[チャット](/docs/chat)、[利用可否](/docs/availability)、[画像](/docs/images)、[移行](/docs/migration)も参照してください。

エラーの文字列 `code` は `LocalLLMErrorCode` に対応します。Webでは `Error` を継承し `code` を持つ `LocalLLMException` をthrowします。

```typescript
import { LocalLLM, LocalLLMException } from '@rdlabo/capacitor-local-llm';

try {
  await LocalLLM.generateText({ chatId: 'missing', prompt: 'Hello' });
} catch (err) {
  const code = err instanceof LocalLLMException ? err.code : (err as { code?: string }).code;
  console.log(code, (err as Error).message);
}
```

## LocalLLMErrorCode

| コード | 説明 |
| --- | --- |
| `LOCAL_LLM_NOT_AVAILABLE` | テキストモデルが利用できません。 |
| `LOCAL_LLM_DEVICE_NOT_ELIGIBLE` | デバイスまたはOSがテキスト生成非対応です。 |
| `LOCAL_LLM_NOT_ENABLED` | 対応していますが利用者が有効にしていません。 |
| `LOCAL_LLM_MODEL_NOT_READY` | モデルを取得・初期化中です。 |
| `LOCAL_LLM_MODEL_DOWNLOAD_REQUIRED` | 先にモデルを取得する必要があります。 |
| `LOCAL_LLM_CONTEXT_WINDOW_EXCEEDED` | 削除可能な履歴を除いてもpromptと要求出力がcontextに収まりません。 |
| `LOCAL_LLM_CHAT_NOT_FOUND` | 指定chatIdがありません。 |
| `LOCAL_LLM_CHAT_BUSY` | このチャットで生成中です。 |
| `LOCAL_LLM_GENERATION_NOT_FOUND` | 対象の生成がないかgenerationIdが一致しません。 |
| `LOCAL_LLM_GENERATION_CANCELLED` | cancelGenerationまたはdeleteChatでキャンセルされました。 |
| `LOCAL_LLM_INVALID_OPTIONS` | 必要な値がないか範囲外です。 |
| `LOCAL_LLM_UNSUPPORTED` | プラットフォームまたはOSが非対応です。 |
| `LOCAL_LLM_IMAGE_NOT_READABLE` | 画像URIを解決・開く・デコードできません。 |
| `LOCAL_LLM_IMAGE_TOO_LARGE` | 画像が入力サイズ制限を超えています。 |
| `LOCAL_LLM_GENERATION_FAILED` | プラットフォームに対応づけられた理由で生成に失敗しました。 |
| `LOCAL_LLM_IMAGE_GENERATION_FAILED` | 画像生成に失敗しました（利用可能なstyleがない場合など）。 |
| `LOCAL_LLM_UNKNOWN_ERROR` | 想定外のSDKエラーです。messageを確認してください。 |

