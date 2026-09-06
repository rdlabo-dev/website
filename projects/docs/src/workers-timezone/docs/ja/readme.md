---
title: はじめに
---

[日時変換とESLintをセットで試す](/docs/quickstart)。

Cloudflare Workers向けのタイムゾーン対応カレンダー・ローカル時刻ユーティリティです。UTCの時刻を扱うWorkersで、IANAタイムゾーンを指定してローカル日付との相互変換や夏時間の処理を行えます。

## 日時処理とESLintをセットで導入する

`@rdlabo/eslint-plugin-rules` の `workers-timezone/recommended` と組み合わせ、暗黙のタイムゾーン依存を検出します。typed lintingを有効にし、CIでlintを実行してください。

## インストール

```sh
npm install @rdlabo/workers-timezone
```

## 使い方

```ts
import { TIME_ZONES, initializeTimezone, localDateTimeToInstant, toLocalDateTime } from '@rdlabo/workers-timezone';

initializeTimezone({ timeZone: TIME_ZONES.NEW_YORK });

toLocalDateTime(new Date('2026-07-01T13:00:00Z'));
// '2026-07-01 09:00:00'

localDateTimeToInstant('2026-07-01', '09:00:00');
// 2026-07-01T13:00:00.000Z
```

初期化はモジュール評価時に一度だけ行い、リクエストやテナントごとには行わないでください。未初期化時の既定値は `Asia/Tokyo` です。ユーザー別の変換にはタイムゾーンを明示指定します。

typed lintingとタイムゾーンpresetの有効化は [ESLintで日時のバグを防ぐ](/workers-timezone/docs/eslint) を参照してください。タイムゾーンのテストとあわせて、CIでもlintを実行します。

## ドキュメント

- [タイムゾーンと日付](/docs/timezones)：設定、夏時間、データベースとの境界。
- [API](/docs/api)：変換、カレンダー操作、型、互換名。
- [移行](/docs/migration)：kitからの移行と動作変更。

ガイドは参照元のソースリビジョンに対応します。インストール済みバージョンについては、そのリリースタグのドキュメントも確認してください。

型情報を使う設定は `**/*.ts` に限定します。初期化ルールはファイルごとに最大1箇所を検査し、全モジュールでの初期化やアプリ全体での一意性を要求するものではありません。
