---
title: 日時変換とESLintをセットで試す
---

同じ時刻でも、タイムゾーンによってカレンダー上の日付は変わります。まず変換結果を確かめ、次にhost timezoneへ戻ってしまうコードをESLintが検出するところまで試します。

## 1. 2つをインストールする

Node.js 24とnpmを使用します。

```sh
mkdir timezone-demo
cd timezone-demo
npm init -y
npm pkg set type=module
npm install @rdlabo/workers-timezone@0.12.2
npm install --save-dev @rdlabo/eslint-plugin-rules@22.1.0 eslint@10 @eslint/js@10 typescript@6 typescript-eslint@8 tsx@4
```

## 2. 日付が変わることを確かめる

`demo.ts` として保存します。アプリのタイムゾーンはモジュール直下で一度だけ初期化し、ユーザー別の変換では呼び出しごとに指定します。

```ts
import { initializeTimezone, toLocalDate, toLocalDateTime } from '@rdlabo/workers-timezone';

initializeTimezone({ timeZone: 'Asia/Tokyo' });
const instant = new Date('2026-01-01T15:00:00Z');
console.log(toLocalDateTime(instant));
console.log(toLocalDate(instant, 'America/New_York'));
```

```sh
npx tsx demo.ts
```

```text
2026-01-02 00:00:00
2026-01-01
```

同じ時刻が東京では1月2日、ニューヨークでは1月1日になります。別の都市のタイムゾーンを引数に渡して違いを確認できます。

## 3. 不具合の再導入を検出する

typed lintingが `demo.ts` を見つけられるよう、`tsconfig.json` を作ります。

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true
  },
  "include": ["demo.ts"]
}
```

`eslint.config.mjs` を作ります。型情報を使う設定はTypeScriptファイルだけに適用します。

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

まず正しい例を検査します。

```sh
npx eslint demo.ts
```

診断なしで正常終了します。続いて、意図的に誤った次の1行を `demo.ts` の末尾へ追加します。

```ts
console.log(instant.getDate());
```

```sh
npx eslint demo.ts
```

終了ステータスが0以外になり、`@rdlabo/rules/no-implicit-timezone` が表示されます。`getDate()` はアプリ設定を使わずhost localの日を読むためです。追加した1行だけを次へ置き換えます。

```ts
console.log(toLocalDate(instant));
```

```sh
npx eslint demo.ts
npx tsx demo.ts
```

lintが再び成功し、末尾に追加した行は `2026-01-02` を出力します。

## 4. アプリに導入する

[アプリの設定](/docs/readme)で既定のタイムゾーンを選び、[CIでESLintを有効にします](/docs/eslint)。ユーザー別の設定、夏時間、データベースとの境界は[タイムゾーンと日付](/docs/timezones)を参照してください。
