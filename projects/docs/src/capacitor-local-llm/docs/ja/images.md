---
title: 画像
---

画像解析と画像生成を説明します。[セットアップ](/docs/setup)、[Androidフォールバックモデル](/docs/android-fallback)、[利用可否](/docs/availability)、[チャット](/docs/chat)も参照してください。

テキストと画像の利用可否は異なる場合があるため、画像を渡す前に `getAvailability()` とは別に `getImageAnalysisAvailability()` を確認してください。

## 画像解析

`images` 入力と `getImageAnalysisAvailability()` は2.1.0のAPIです。インストール済みバージョンと[API](/docs/api)を照合してください。ソースのガイドが存在しても古いnpm版での提供は保証されません。

### iOS

Xcode 27 / Swift 6.4でビルドした場合、iOS 27以降のFoundation Models `Attachment` を使います。`images[]` には読み取り可能なローカル `uri`（`content://` はAndroid専用）、またはBase64本体／data URLを指定できます。最大4枚、各画像はデコード後32 MiBまでです。Base64はサイズを制限した一時ネイティブファイルへ変換し、生成後に削除します。

iOS 27対応ビルドの `getImageAnalysisAvailability()` はテキストモデルの `status` に加えて `backend: 'foundation-models'`、`maxImages: 4` を返します。古いXcodeでのビルドは `unavailable` となりiOS 27のvision対応を含められません。添付前に独立して確認してください。生成成功後、画像添付は保持履歴から除去し、テキストpromptと応答は残します。

### Android

画像解析はネイティブバックエンドを明示選択します。ML Kit Promptの共通feature statusが `available` の場合は `ml-kit-prompt` になります。SDKはvision専用の可否を公開しません。設定済みvision fallbackが準備できていれば `litert-lm` を返します。

入力形式、ML Kitの画素制限、実験的な複数画像経路、`imagePaths` 互換、LiteRT-LM設定は[Androidフォールバックモデル](/docs/android-fallback)を参照してください。

## 画像生成（iOSのみ）

`generateImage()` による画像生成はiOS 18.4以降で利用できます。

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const { pngBase64Images } = await LocalLLM.generateImage({
  prompt: 'A serene mountain lake at sunrise, photorealistic',
  count: 2,
});

const src = `data:image/png;base64,${pngBase64Images[0]}`;
```

