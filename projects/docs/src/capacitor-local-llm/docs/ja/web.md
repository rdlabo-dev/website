---
title: Web（Chrome）
---

プラグインはChrome組み込みの `LanguageModel` Prompt APIを使い、サーバーやAPIキーなしでオンデバイスのテキスト推論を行います。モデルのダウンロードはChromeが管理し、初回はネットワーク接続が必要です。プラグイン側にモデル配信の依存はありません。

Prompt APIを公開しているデスクトップChromeを、セキュアコンテキスト（HTTPSまたはlocalhost）で使います。Googleの現行ドキュメントではWeb対応はChrome 148以降とされていますが、APIの公開とモデル利用可否はブラウザ版・ハードウェア・ストレージ・ポリシー・モデル準備状況に依存します。Android/iOS版ChromeはこのWebバックエンドでは非対応です。要件は[Chrome Prompt APIのドキュメント](https://developer.chrome.com/docs/ai/prompt-api)を確認してください。実験的な古いビルドではChromeフラグやorigin trialが必要な場合があります。プラグインはブラウザ設定を変更しません。

実行時に `getAvailability()` を確認します。APIが無い場合は `unavailable` を返し、そのブラウザでチャット作成を試みると `LOCAL_LLM_UNSUPPORTED` で拒否されます。APIはあるが `unavailable` の場合、チャット作成は `LOCAL_LLM_NOT_AVAILABLE` で拒否されます。

モデルダウンロード時にChromeはユーザー操作を要求するため、`downloadModel()` や初回の `createChat()` はボタンクリックなどのユーザーアクションから呼び出します。進捗表示には `downloadProgress` を購読します。クロスオリジンiframeでは埋め込み側が `allow="language-model"` を委任する必要があります。Web Workersは非対応です。

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

// Register this handler on a button so Chrome can start a model download if needed.
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

対応メソッドはテキストの利用可否、モデルダウンロード、warmup、チャット作成/削除、テキスト生成、ストリーミング、キャンセル、および非推奨のtext/sessionエイリアスです。`textChunk` は増分テキストを含み、生成状態イベントは `started` から終端状態までのIDを提供します。キャンセルは `LOCAL_LLM_GENERATION_CANCELLED` で拒否され、生成中のチャット削除時も同様です。

プラグインは成功したテキストターンをメモリに保持し、`maxMessages`（既定20、最小2）と `maxCharacters`（既定12000）を満たすよう古い完全なターンを削除します。instructionsは別に保持します。各生成は保持履歴からブラウザセッションを作成し、終了後に破棄するため、キャンセル・失敗したターンは後続のpromptに含まれません。Chromeもcontext windowを強制し、過大な入力は `LOCAL_LLM_CONTEXT_WINDOW_EXCEEDED` で拒否します。履歴はページ再読み込みで失われます。`warmup()` は一時セッションを作成して解放し、任意でチャット文脈を使います。iOS専用の `promptPrefix` は無視します。

## 制限事項

- Webでは `GenerationOptions` を省略します。通常のWeb Prompt APIはプラグインの数値 `temperature`、`topK`、`maxOutputTokens` を公開しません。指定すると `LOCAL_LLM_INVALID_OPTIONS` で拒否されます。Chrome拡張専用の制御は使いません。
- このアダプターは現時点でテキスト入力のみ対応です。`getImageAnalysisAvailability()` は `unavailable` を返し、`images` や `imagePaths` を渡すと `LOCAL_LLM_UNSUPPORTED` で拒否されます。Chromeには別のマルチモーダル機能がありますが、このアダプターではまだ公開していません。
- `generateImage()` とAndroid専用の `configureFallbackModel()` は `LOCAL_LLM_UNSUPPORTED` で拒否します。
- 利用可否イベントはプラグイン呼び出しが変化を観測したとき、およびモデルダウンロード中に通知されます。Webはバックグラウンドでポーリングしません。

## 検証

パッケージのビルド、公開型チェック、ブラウザアダプターの回帰テストは `npm run verify:web` で実行します。これらのテストはPrompt APIをモックするため、実モデル推論は対応Chromeでサンプルアプリ（`cd example-app` のあと `npm run dev`）でも確認してください。

### テキスト生成を手動で確認する

対応Chromeではサンプルアプリの **Prompt** タブを使います。別の **Physical-device acceptance** スイートはvision入力が必要で、ネイティブ端末向けです。

1. **Check Availability** を選択します。downloadableなら **Download Model** を選び、`available` になるまで待ちます。
2. `Remember the code word ORCHID. Reply briefly.` を入力し **Stream Response** を選択します。テキストが段階的に表示され、操作が再び使えることを確認します。
3. `What code word did I ask you to remember?` を入力して再度ストリームします。直前のターンを使った回答であることを確認します。日本語のフォローアップで多言語出力も確認できます。
4. 長い物語を要求します。チャット識別子が表示され生成が始まったら **Cancel Generation** を選択します。キャンセルエラーと、その後の短いpromptが成功することを確認します。
5. **Delete Chat** を選び、別のpromptを送ります。新しいチャット識別子が作られ、旧会話が保持されないことを確認します。
6. Prompt APIのないブラウザで、利用可否が `unavailable` となり、生成がページをクラッシュさせずに `LOCAL_LLM_UNSUPPORTED` を報告することを確認します。

モデルの文言は非決定的です。推論成功とライフサイクル動作は、生成テキストの一字一句とは分けて判定してください。
