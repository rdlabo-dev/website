---
title: はじめに
---

デバイス上で短い応答テキストを生成する Capacitor プラグインです。API キーは不要で、プロンプトと応答はデバイス外へ送信されません。iOS は Apple Intelligence（Foundation Models）、Android は Gemini Nano、対応デスクトップ Chrome は組み込み Prompt API を使います。Android の `downloadModel()` によるモデル取得にはネットワークを使う場合があります。

iOS/Android のオンデバイス LLM には対応ハードウェアが必要です。Android エミュレーターは非対応です。iOS シミュレーターはホスト Mac が Apple Intelligence に対応し、有効にしている場合に利用できます。

## インストール

```bash
npm install @rdlabo/capacitor-local-llm
npx cap sync
```

Capacitor 8 以降が必要です。対応デスクトップ Chrome では組み込み Prompt API によるテキスト生成も利用できます。要件と制限は [Web（Chrome）](/docs/web) を参照してください。

## プラットフォーム概要

| プラットフォーム | 最低OS | 注意 |
| --- | --- | --- |
| iOS | 18.4 | 画像生成は18.4以降、テキストLLMは26以降。画像解析はXcode 27 / Swift 6.4でビルドした場合にiOS 27以降のFoundation Models `Attachment` を使います。 |
| Android | API 29（Android 10） | ML Kit経由のGemini Nanoには対応実機（Pixel 9以降など）が必要です。 |
| Web | 対応デスクトップChrome | HTTPSまたはlocalhostのセキュアコンテキスト。Prompt APIによるテキスト生成。詳細は[Web（Chrome）](/docs/web)。 |

SPM の deployment target、`minSdkVersion`、モデルダウンロードは [セットアップ](/docs/setup) を参照してください。

## クイックスタート

インストールと [セットアップ](/docs/setup)（Chrome では [Web（Chrome）](/docs/web)）のあと、利用可否を確認し、チャットを作成して生成します。`available` 以外（例: `downloadable`）のときは、ここで throw して終わるのではなく [セットアップ](/docs/setup) または Chrome のダウンロード手順へ進んでから再試行してください。

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const { status } = await LocalLLM.getAvailability();
if (status !== 'available') {
  throw new Error(`Model not ready: ${status}`);
}

const { id: chatId } = await LocalLLM.createChat({
  instructions: 'You are a helpful assistant.',
});

try {
  const { text } = await LocalLLM.generateText({
    chatId,
    prompt: 'What is the capital of France?',
  });
  console.log(text);
} finally {
  await LocalLLM.deleteChat({ id: chatId });
}
```

成功の目安は、応答文字列が表示（ログ）され、`deleteChat` まで完了することです。文言はモデル依存です。ストリーミング・キャンセル・ウォームアップは [チャット](/docs/chat)、画像入力と生成は [画像](/docs/images) を参照してください。

## ドキュメント

- [セットアップ](/docs/setup)：プラットフォーム要件、SPM、Android SDK、モデル取得。
- [Web（Chrome）](/docs/web)：デスクトップChromeのPrompt API、要件、制限。
- [Androidフォールバックモデル](/docs/android-fallback)：Gemini Nano非対応時のLiteRT-LM。
- [利用可否](/docs/availability)：状態値とプラットフォームの動作。
- [チャット](/docs/chat)：寿命、ストリーミング、キャンセル、ウォームアップ。
- [画像](/docs/images)：iOS/Androidの画像解析とiOSの画像生成。
- [イベント](/docs/events)：利用可否、ダウンロード、生成チャンク、生成ライフサイクル。
- [移行](/docs/migration)：v1非推奨APIと本家からの移行。
- [エラー処理](/docs/errors)：安定した `LocalLLMErrorCode`。

メソッドのシグネチャは [API](/docs/api) にあります。リリース間の API `Since` は [移行](/docs/migration) と API を参照してください。

## 由来

このプロジェクトは Ionic の [`@capacitor/local-llm`](https://github.com/ionic-team/capacitor-local-llm) バージョン 1.0.0、コミット [`5bceb55`](https://github.com/ionic-team/capacitor-local-llm/commit/5bceb559ed19382efc71df2f918d290ca419d282) を元にした独立管理のフォークです。Ionic や Capacitor の公式パッケージではなく、Ionic との提携・サポート関係はありません。
