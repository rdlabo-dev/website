---
title: セットアップ
---

iOS・Androidの要件とネイティブ設定を説明します。[Androidフォールバックモデル](/docs/android-fallback)、[利用可否](/docs/availability)、[画像](/docs/images)も参照してください。

## プラットフォーム要件

| プラットフォーム | 最低OS | 注意 |
| --- | --- | --- |
| iOS | 18.4 | 画像生成は18.4以降、テキストLLMは26以降。画像解析はXcode 27 / Swift 6.4でビルドした場合にiOS 27以降のFoundation Models `Attachment` を使います。 |
| Android | API 29（Android 10） | ML KitのGemini Nanoには対応実機（Pixel 9以降など）が必要です。 |

## iOSの設定

CocoaPodsでは追加設定は不要です。Foundation ModelsとImage Playgroundはシステムフレームワークで、対応デバイスでApple Intelligenceを有効にすると利用できます。

Swift Package Managerを使うCapacitorプロジェクトでは、現在のCLIが `CapApp-SPM/Package.swift` のiOS deployment targetを18.0として生成し、必要なマイナーバージョンを保持しません。`npx cap sync ios` のたびに `platforms: [.iOS("18.4")]` へ変更します。同梱サンプルの `npm run cap:sync` はこれを自動化しています。[sync-capacitor.mjs](https://github.com/rdlabo-dev/capacitor-local-llm/blob/v2.1.0/example-app/scripts/sync-capacitor.mjs)を参照してください。

チャット作成・生成前に `getAvailability()` でテキストモデルの準備を確認します。画像入力には別途 `getImageAnalysisAvailability()` を使います。テキストと画像の利用可否は異なる場合があります。[画像](/docs/images)も確認してください。

iOS 26未満では、テキストLLMの `getAvailability()` は `device-not-eligible` を返します。`createChat()`、`deleteChat()`、`generateText()`、`streamText()` などは `LOCAL_LLM_UNSUPPORTED` で拒否されます。`generateImage()` による画像生成はiOS 18.4以降で利用できます。

iOSではOSがモデルを管理するため `downloadModel()` は使えません。`getAvailability()` または `availabilityChange` で準備状況を監視します。

## Androidの設定

最低SDKは29で、Capacitorの現在の既定値24より高くなっています。アプリの `android/variables.gradle` を変更します。

```gradle
ext {
    minSdkVersion = 29
}
```

Gemini NanoはGoogle Play Services経由で配布され、使用前にデバイスへダウンロードする必要があります。アプリには同梱されません。

Gemini Nanoが使えない場合は[Androidフォールバックモデル](/docs/android-fallback)を明示設定できます。

### 利用可否とダウンロード

`getAvailability()` が `downloadable` を返したら `downloadModel()` を実行し、`available` になるまで `downloadProgress` や `availabilityChange` を監視します。

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const availabilityListener = await LocalLLM.addListener('availabilityChange', ({ status }) => {
  console.log('availability:', status);
});

const progressListener = await LocalLLM.addListener('downloadProgress', (event) => {
  if (event.progress != null) {
    console.log('download progress:', event.progress);
  } else if (event.downloadedBytes != null) {
    console.log('downloaded bytes:', event.downloadedBytes);
  }
});

const { status } = await LocalLLM.getAvailability();

if (status === 'downloadable') {
  await LocalLLM.downloadModel();
}

await availabilityListener.remove();
await progressListener.remove();
```

