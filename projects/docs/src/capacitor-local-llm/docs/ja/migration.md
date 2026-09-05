---
title: 移行
---

非推奨v1互換APIとIonic本家からの移行を説明します。[利用可否](/docs/availability)、[チャット](/docs/chat)、[エラー処理](/docs/errors)、[セットアップ](/docs/setup)も参照してください。

## 非推奨の互換API

v1 APIは残っていますが、明示的なチャット・利用可否メソッドへ移行してください。

| 非推奨 | 置き換え |
| --- | --- |
| `systemAvailability()` | `getAvailability()` |
| `download()` | `downloadModel()` |
| `prompt()` | `createChat()` + `generateText()` / `streamText()` |
| `endSession()` | `deleteChat()` |
| `addListener('systemAvailabilityChange', …)` | `addListener('availabilityChange', …)` |
| `warmup({ sessionId })` | `warmup({ chatId })` |

`systemAvailability()` と `systemAvailabilityChange` は詳細な状態を旧 `LLMAvailability` の4値（available、unavailable、notready、downloadable）へまとめます。[利用可否](/docs/availability)を参照してください。

互換性のため、sessionIdなしの `prompt()` は引き続き単発生成を行います。

## Ionic本家v1からの移行

完全なdrop-in置換ではありません。依存とimportを `@rdlabo/capacitor-local-llm` に変更し、`getAvailability()`、`createChat()` / `generateText()` / `deleteChat()` の明示的な寿命管理を採用します。詳細な状態と安定したエラーコードを処理してください。最低要件はiOS 18.4、Android API 29です。元の利用可否4値を含むv1 APIは移行用に残ります。

