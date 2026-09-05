---
title: 移行
---

kit `0.12.0` でDBユーティリティが独立しました。`@rdlabo/workers-mysql` を直接インストールし、Hono連携を使う場合のみkitも維持します。`mysql2` は同梱され、`drizzle-orm` は `/drizzle` と `/testing` の任意peerです。TypeScript利用時は[はじめに](/docs/readme)のNode型定義も必要です。

| 旧import | 新import |
| --- | --- |
| kitルートの `createContainerRuntime` | `@rdlabo/workers-hono-kit/mysql` |
| kitルートの `retryWhenDeadlock` | `@rdlabo/workers-mysql` |
| kit `/db` のランタイム・JST通信ヘルパー | `@rdlabo/workers-mysql` |
| kit `/db` のカラム・設定ヘルパー | `@rdlabo/workers-mysql/drizzle` |
| kit `/db` のbaselineヘルパー | `@rdlabo/workers-mysql/migrations` |
| kit `/testing` のDBヘルパー | `@rdlabo/workers-mysql/testing` |

旧 `/db` とDB関連 `/testing` は一時的な非推奨の再エクスポートです。新しいWorkerコードでは旧集約 `/db` を使わず専用のランタイムimportでNode専用migrationコードを除外してください。設定更新時には `honoDrizzleConfig` を `workersDrizzleConfig` に置き換えます。

Honoへの依存は不要です。固定JST保存と変更可能な業務タイムゾーンも独立しています。[Drizzleと日付](/docs/drizzle)を参照してください。

