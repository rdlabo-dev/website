---
title: 利用可否とプラットフォームの動作
---

`getAvailability()` の状態値とプラットフォーム固有の動作を説明します。[セットアップ](/docs/setup)、[Androidフォールバックモデル](/docs/android-fallback)、[チャット](/docs/chat)、[画像](/docs/images)、[イベント](/docs/events)も参照してください。

## 利用可否

`getAvailability()` は意味を持つ `status` を返します。

| 状態 | 意味 |
| --- | --- |
| `available` | テキストモデルが生成可能です。 |
| `device-not-eligible` | デバイスまたはOSがテキストモデル非対応です。iOSはこの理由を返しますが、Androidの `FeatureStatus.UNAVAILABLE` は理由を公開しないため `unavailable` に対応します。 |
| `not-enabled` | 対応デバイスですが利用者がオンデバイスAIを有効にしていません。主にiOSで報告されます。 |
| `downloadable` | モデルをダウンロードできます（Android）。 |
| `downloading` | モデルのダウンロード中です（Android）。 |
| `not-ready` | モデルは存在しますが初期化中です。 |
| `unavailable` | その他の理由で利用できません。 |

`availabilityChange`（または非推奨の `systemAvailabilityChange`）を購読すると、登録中に更新を受け取れます。Androidではリスナー有効中にポーリングします。

非推奨の `systemAvailability()` と `systemAvailabilityChange` は旧4値の契約を保ちます。`downloading` と `not-ready` は `notready`、`device-not-eligible`・`not-enabled`・`unavailable` は `unavailable` にまとめられます。`available` と `downloadable` はそのままです。

## プラットフォームの動作

### iOS

- テキストLLMにはiOS 26とApple Intelligenceが必要です。26未満では `device-not-eligible` を返します。Apple Intelligenceに対応するiPhone（iPhone 15 Pro以降など）・iPadは限られます。[Appleの案内](https://www.apple.com/apple-intelligence/)を確認してください。
- チャットはFoundation Modelsのネイティブtranscriptを使い、状態は `LanguageModelSession` に保持します。生成前にネイティブの `contextSize` に対してinstructions、現在のprompt、出力余裕を含む保守的な文字数予算を適用します。制限を超えると古い完全なprompt/responseの組を除去し、instructionsを保持してsessionを再作成します。
- `warmup({ chatId, promptPrefix })` は `createChat()` で作成した特定チャットを予熱します。
- `cancelGeneration()` はチャットの実行中Taskをキャンセルします。生成Promiseは `LOCAL_LLM_GENERATION_CANCELLED` で拒否され、すでに `textChunk` で表示した文字列はUIに残ります。
- 画像解析・生成は[画像](/docs/images)を参照してください。

### Android

- 履歴はプラグインのメモリ内でuser/assistantの組として管理し、`history.maxMessages`（既定20）と `history.maxCharacters`（既定12000）で削減します。Gemini NanoはML Kitの `countTokens()` でcontextに収めます。LiteRT-LM 0.16.1には安定したtoken計数APIがないため、1文字1tokenの保守的推定とprompt・画像の予約分を使います。両方とも古い完全なターンを削除し、別管理のsystem instructionsは削除しません。履歴はアプリ再起動をまたいで保持されません。
- `warmup()` はモデル全体を予熱し、`chatId` と `promptPrefix` を無視します。
- キャンセルはbest-effortです。コルーチンを止めますが、その前にML Kitが部分出力を送る場合があります。キャンセル検知時に `LOCAL_LLM_GENERATION_CANCELLED` で拒否します。
- 非対応の `GenerationOptions` は黙って補正せず `LOCAL_LLM_INVALID_OPTIONS` になります。`maxOutputTokens` は `1..min(device token limit, 4096)`、省略時は256です。
- ネイティブのモデル操作は直列です。mutexがGemini Nano/LiteRT-LMの生成、設定、warmup、download、teardownを保護し、異なるチャットの同時生成はキューに入ります。
- API 29以降のすべての端末がGemini Nanoに対応するわけではありません。[ML Kitの対応機器](https://developers.google.com/ml-kit/genai#device-support)を確認してください。
- Gemini Nano非対応時はLiteRT-LMを明示設定できます。初期化後は `getAvailability()` が `available` を返します。[Androidフォールバックモデル](/docs/android-fallback)を参照してください。
- 画像解析のバックエンド選択は[画像](/docs/images)で説明します。
- バックグラウンドではオンデバイスモデルを使えず、推論リクエストは失敗します。
- AICoreにはアプリ単位の推論quotaがあります。過剰なリクエストではbusy/quotaエラーになるため、指数バックオフを検討してください。

