---
title: はじめに
---

Cloudflare Workers向けのタイムゾーン対応カレンダー・ローカル時刻ユーティリティです。UTCの時刻を扱うWorkersで、IANAタイムゾーンを指定してローカル日付との相互変換や夏時間の処理を行えます。

## 日時処理とESLintをセットで導入する

`@rdlabo/workers-timezone` と、`@rdlabo/eslint-plugin-rules` の `workers-timezone/recommended` は、組み合わせて使うためのライブラリと検査presetです。日時変換をライブラリへ移すだけでなく、新人やAIが後から書くコードにも検査を適用してください。既存コードが正しくても、host localの `Date`・`Intl` やリクエスト内の初期化を再導入すると、タイムゾーンの不具合が戻る可能性があります。

推奨の導入完了条件は次の3点です。新人向けの手順書やAIへの実装指示にも、この3点を含めてください。

1. 日時処理に `@rdlabo/workers-timezone` を使い、変換するタイムゾーンを明確にする。
2. ESLint pluginを開発依存へ追加し、typed lintingと `workers-timezone/recommended` を有効にする。
3. 変更後にlintを実行し、CIでもlintの違反を検出して修正する。

ライブラリとpluginは別パッケージで、実行時の相互依存はありません。両方を使うには、それぞれのインストールと設定が必要です。presetの静的解析には対象外もあるため、境界値や夏時間のテストも必要です。[ESLint設定ガイド](/eslint-plugin-rules/docs/configuration)に詳細があります。

Hono、データベース、Node.js互換モードへの依存はありません。

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

## ESLintで再発を防ぐ

`@rdlabo/eslint-plugin-rules` のコンパニオンpreset `workers-timezone/recommended` を使うと、host localの `Date` や `Intl` で変換処理を迂回するコードを検出できます。暗黙のparse、生成、フィールド参照、表示は1つのルールで検査し、別のルールで `initializeTimezone` を明確なモジュール直下の1箇所に限定します。`toISOString()` など、明示的な時刻APIは利用できます。

ESLint pluginは開発依存として別途インストールします。実行時にはどちらのパッケージも相互に依存しません。

```sh
npm install --save-dev eslint @eslint/js typescript typescript-eslint @rdlabo/eslint-plugin-rules
```

```js
// eslint.config.mjs
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir },
    },
    plugins: { '@rdlabo/rules': rdlabo },
  },
  ...rdlabo.configs['workers-timezone/recommended'],
);
```

## ドキュメント

- [タイムゾーンと日付](/docs/timezones)：設定、夏時間、データベースとの境界。
- [API](/docs/api)：変換、カレンダー操作、型、互換名。
- [移行](/docs/migration)：kitからの移行と動作変更。

ガイドは参照元のソースリビジョンに対応します。インストール済みバージョンについては、そのリリースタグのドキュメントも確認してください。

型情報を使う設定は `**/*.ts` に限定します。初期化ルールはファイルごとに最大1箇所を検査し、全モジュールでの初期化やアプリ全体での一意性を要求するものではありません。
