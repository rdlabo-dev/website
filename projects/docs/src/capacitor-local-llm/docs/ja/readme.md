---
title: はじめに
---

> このプロジェクトはIonicの [`@capacitor/local-llm`](https://github.com/ionic-team/capacitor-local-llm) バージョン1.0.0、コミット [`5bceb55`](https://github.com/ionic-team/capacitor-local-llm/commit/5bceb559ed19382efc71df2f918d290ca419d282) を元にした独立管理のフォークです。IonicやCapacitorの公式パッケージではなく、Ionicとの提携・サポート関係はありません。

iOSではApple Intelligence（Foundation Models）、AndroidではGemini Nanoを使い、デバイス上でLLMを実行します。推論にAPIキーは不要で、プロンプトや応答はデバイス外へ送信されません。Androidの `downloadModel()` によるモデル取得にはネットワークを使う場合があります。

オンデバイスLLMには対応ハードウェアが必要です。Androidエミュレーターは非対応です。iOSシミュレーターはホストMacがApple Intelligenceに対応し、有効にしている場合に利用できます。

## インストール

```bash
npm install @rdlabo/capacitor-local-llm
npx cap sync
```

Capacitor 8以降が必要です。Web実行は非対応で、iOSまたはAndroidのネイティブ実装を使います。

READMEとガイドは参照元のソースを説明しています。npm版を使う場合は対応するGitタグのドキュメントとAPIの `Since` を確認してください。`2.1.0` と記載されたAPIが `2.0.0` にも存在すると考えないでください。

## プラットフォーム概要

| プラットフォーム | 最低OS | 注意 |
| --- | --- | --- |
| iOS | 18.4 | 画像生成は18.4以降、テキストLLMは26以降。画像解析はXcode 27 / Swift 6.4でビルドした場合にiOS 27以降のFoundation Models `Attachment` を使います。 |
| Android | API 29（Android 10） | ML Kit経由のGemini Nanoには対応実機（Pixel 9以降など）が必要です。 |

SPMのdeployment target、`minSdkVersion`、モデルダウンロードは[セットアップ](/docs/setup)を参照してください。

## クイックスタート

インストールとセットアップ後、利用可否を確認し、チャットを作成して生成します。

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

ストリーミング・キャンセル・ウォームアップは[チャット](/docs/chat)、画像入力と生成は[画像](/docs/images)を参照してください。

## ドキュメント

- [セットアップ](/docs/setup)：プラットフォーム要件、SPM、Android SDK、モデル取得。
- [Androidフォールバックモデル](/docs/android-fallback)：Gemini Nano非対応時のLiteRT-LM。
- [利用可否](/docs/availability)：状態値とプラットフォームの動作。
- [チャット](/docs/chat)：寿命、ストリーミング、キャンセル、ウォームアップ。
- [画像](/docs/images)：iOS/Androidの画像解析とiOSの画像生成。
- [イベント](/docs/events)：利用可否、ダウンロード、生成チャンク、生成ライフサイクル。
- [移行](/docs/migration)：v1非推奨APIと本家からの移行。
- [エラー処理](/docs/errors)：安定した `LocalLLMErrorCode`。

メソッドのシグネチャは[API](/docs/api)にあります。

