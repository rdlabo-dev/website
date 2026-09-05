---
title: イベント
---

利用可否、ダウンロード進捗、ストリーミング、生成ライフサイクルのイベントです。[利用可否](/docs/availability)、[チャット](/docs/chat)、[セットアップ](/docs/setup)、[エラー処理](/docs/errors)も参照してください。

| イベント | 説明 |
| --- | --- |
| `availabilityChange` | リスナー登録中、テキストモデルの利用可否が変化すると通知します。 |
| `downloadProgress` | Androidの `downloadModel()` 中に通知します。ML Kitが総バイト数を公開しないため、中間イベントには `downloadedBytes` のみの場合があります。判明している場合、`progress` は開始時0、終了時1です。 |
| `textChunk` | `streamText()` 中、対応する `chatId` / `generationId` の増分テキストを通知します。 |
| `generationStateChange` | 受理した生成について `started`、その後 `completed` / `cancelled` / `failed` を通知します。終端エラーイベントは安定した `errorCode` を含みます。 |

返された `PluginListenerHandle.remove()` または `removeAllListeners()` でリスナーを解除します。

