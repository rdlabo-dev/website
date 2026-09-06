---
title: ESLintで日時のバグを防ぐ
---

新しいCloudflare Workersのコードでも、同じタイムゾーン方針を保ちます。`@rdlabo/workers-timezone` と `@rdlabo/eslint-plugin-rules` を組み合わせ、host localの `Date` / `Intl` 操作と、リクエスト内での初期化を検出します。

両方のpackageを動かしながら試す場合は、まず [日時変換とESLintをセットで試す](/workers-timezone/docs/quickstart) から始めてください。

## コンパニオンpresetを有効にする

この例ではNode.js 24を使います。`@rdlabo/workers-timezone` を使うアプリに、lintの依存をインストールします。

```sh
npm install --save-dev eslint@10 @eslint/js@10 typescript@6 typescript-eslint@8 @rdlabo/eslint-plugin-rules@22
```

`eslint.config.mjs` にタイムゾーンpresetとtyped lintingを追加します。lint対象のTypeScriptファイルは、アプリの `tsconfig.json` に含めてください。

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

export default tseslint.config(
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
      },
    },
    plugins: { '@rdlabo/rules': rdlabo },
  },
  ...rdlabo.configs['workers-timezone/recommended'],
);
```

既存の設定エントリは残したまま統合してください。別の `workers/recommended` presetではタイムゾーン検査は有効になりません。

## host localの日付を検出する

次のコードは、アプリではなくhostのカレンダー日付を読みます。

```ts
const instant = new Date('2026-01-01T15:00:00Z');
console.log(instant.getDate());
```

ライブラリでカレンダーのタイムゾーンを指定します。

```ts
import { toLocalDate } from '@rdlabo/workers-timezone';

const instant = new Date('2026-01-01T15:00:00Z');
console.log(toLocalDate(instant, 'Asia/Tokyo'));
// 2026-01-02
```

`no-implicit-timezone` は、明示的な `timeZone` なしの対応 `Intl` フォーマット呼び出しも報告します。UTCメソッドと `toISOString()` は、instantベースの操作として引き続き使えます。

## 初期化をリクエスト外に置く

`initialize-timezone-at-module-scope` は次を報告します。

```ts
import { initializeTimezone } from '@rdlabo/workers-timezone';

export function handleRequest() {
  initializeTimezone({ timeZone: 'Asia/Tokyo' });
}
```

モジュール評価時に初期化します。

```ts
import { initializeTimezone } from '@rdlabo/workers-timezone';

initializeTimezone({ timeZone: 'Asia/Tokyo' });
```

ユーザーのタイムゾーンは、変換時に明示引数で渡してください。初期化ルールはファイル単位で検査し、アプリ全体での単一初期化は強制しません。

## CIで実行する

依存のインストール後、次を実行します。

```sh
npx eslint 'src/**/*.ts' --max-warnings 0
```

ソースパスはアプリに合わせて調整してください。DSTやカレンダー境界のタイムゾーンテストは残してください。静的検査は認識できる操作を対象とし、動的に決まる値をすべて追跡できるわけではありません。

[Date / Intlルール](/eslint-plugin-rules/docs/rules/no-implicit-timezone)、[初期化ルール](/eslint-plugin-rules/docs/rules/initialize-timezone-at-module-scope)、[タイムゾーンの動作](/workers-timezone/docs/timezones)も参照してください。
