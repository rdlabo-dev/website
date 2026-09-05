---
title: Androidフォールバックモデル
---

ML KitがGemini Nanoを利用不可とした場合、LiteRT-LMを明示設定できます。[セットアップ](/docs/setup)、[利用可否](/docs/availability)、[画像](/docs/images)も参照してください。

## Gemini Nanoが利用できない場合

必要なAICore機能がない端末などでは、ローカルの[LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM) `.litertlm` モデルを設定できます。通常のテキスト生成はGemini Nanoが使える限り優先されます。プラグインは重みを同梱・無断ダウンロードしません。モデルファイル、ダウンロードUI、保存、更新、ライセンス遵守はアプリが管理します。

LiteRT-LM 0.16.1には安定したmodality検査がないため、画像優先の設定で `supportsImages` は既定trueです。マルチモーダルモデルを使うか、テキスト専用ならfalseにします。画像対応の出発点として[公式LiteRT multimodality collection](https://huggingface.co/collections/litert-community/multi-modality-models)のGemma 4 E2Bなどが挙げられます。約2.6 GBあるため、対応端末すべてでサイズとメモリを評価してください。小型のLFM2.5-VL-450M変換版もありますが、モデルカードにvision位置処理の不具合が記載されているため既定の推奨ではありません。

```typescript
// Rename the downloaded model as desired and either package it in android/app/src/main/assets
// or provide a readable absolute app-managed file path.
await LocalLLM.configureFallbackModel({
  path: '/android_asset/gemma-4-E2B-it.litertlm',
  maxTokens: 4096,
  maxImages: 1,
  // supportsImages defaults to true
});

const { id: chatId } = await LocalLLM.createChat({
  instructions: 'Answer questions about the supplied image.',
});

const result = await LocalLLM.generateText({
  chatId,
  prompt: 'Describe this image concisely.',
  images: [{ uri: 'content://com.example.files/photo.jpg' }],
});
```

`images[]` の各要素は `uri` か `base64` のどちらか一方を受け付けます。Android URIは読み取り可能な絶対パス、authorityのないデコード済み `file://` URL、`content://` に対応します。Base64は本体または `data:image/...;base64,...` URLを使えます。

非推奨の `imagePaths` はv2.0互換として、ML Kitが利用可能でも設定済みLiteRT-LMにのみ渡します。両方のオプションを同時に指定しないでください。画像はデコード後32 MiBまでです。content URIとBase64はI/O dispatcherでサイズを制限した一時cacheファイルに変換し、生成後に削除します。画像は現在のターンだけに適用し、履歴には残しません。

画像入力前に `getImageAnalysisAvailability()` を呼びます。AndroidはML Kit Promptの共通available状態を画像入力APIの利用可否として扱い、そのバックエンドを優先します。それ以外では画像対応のLiteRT-LM fallbackを使います。

ML KitはAndroid APIでデコードし、前処理を長辺2048画素・1枚約400万画素に制限します。1リクエストは最大4枚・合計約800万画素です。`maxImages: 4` は枚数上限にすぎず、大きな4枚では合計画素上限を超えます。LiteRT-LMには解決後のファイルを直接渡します。テキスト専用fallbackは画像を無視せず `LOCAL_LLM_UNSUPPORTED` で拒否します。

ML Kitの複数画像経路は、対応Gemini Nano実機で受け入れ検証が完了するまでは実験的です。利用可否の結果だけで本番利用可能とは判断せず、対応する全端末群でgenerate/stream、キャンセル、複数画像、content URIの片付け、サイズ超過エラーを検証してください。

大きなモデルにはアプリ管理の絶対パスを推奨します。`/android_asset/...` も使えますが、ネイティブエンジンには実ファイルが必要なためprivate領域へコピーします。同じアプリバージョンではバージョン付きコピーを再利用し、再設定時に旧エンジンを閉じ、新しい初期化成功後に同じassetの古いコピーを削除します。アップグレード中は同梱asset、旧privateコピー、新しい一時コピーが同時に存在し得ます。エンジンはプラグインの寿命中ロードされたままなので、プラグイン破棄または別モデルの設定成功まではモデルファイルを置換・削除しないでください。

構造化メッセージ、ネイティブstreaming flow、キャンセルAPIを使います。互換性のためテキスト・visionを現在はCPUで処理し、生成、設定、warmup、download、teardownを同じmutexで直列化します。`downloadModel()` はML Kitのシステムモデルだけを管理します。LiteRT-LMは変化が速いためopt-inとし、リリース前に実機の長時間テストを行ってください。

Android依存は `kotlinx-coroutines` 1.11.0に固定しています。LiteRT-LM 0.16.1のバイナリは新しい `SendChannel` のdefault-method ABIを使いますが、公開POMは1.9.0を宣言しています。固定を外したり下げたりするとstreaming完了時に `NoSuchMethodError` になります。[本家issue #2812](https://github.com/google-ai-edge/LiteRT-LM/issues/2812)を参照してください。

モデルは任意ですが、LiteRT-LMランタイム依存はAndroid利用アプリすべてに含まれます。0.16.1では圧縮AAR約20 MB、arm64ビルドあたりネイティブライブラリ約22 MBが追加されます。universal debug APKはさらに大きく、AABは通常ABIごとに分割されます。最終APK/AABと対応64-bit ABIを確認してください。ランタイムはApache-2.0ですがモデル重みのライセンス・利用条件は別です。アプリのOSS通知に `LICENSE` と `THIRD_PARTY_NOTICE.txt` を保持し、モデルの条件も独立して確認してください。

