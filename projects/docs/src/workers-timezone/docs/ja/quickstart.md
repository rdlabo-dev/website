---
title: 日時変換とESLintをセットで試す
---

同じ時刻でも、タイムゾーンによってカレンダー上の日付は変わります。まず変換結果を確かめ、次にhost timezoneへ戻ってしまうコードをESLintが検出するところまで試します。新人やAIによる実装も、この2つを推奨の出発点にしてください。

ライブラリは実行時の日時変換、コンパニオンpresetは開発時のコード検査を担当します。別々にインストールするパッケージで、実行時の相互依存はありません。HonoやDBも不要です。

## 1. 2つをインストールする

新しいディレクトリでNode.js 24とnpmを使います。下記のパッケージ版はこのガイドに対応します。既存framework設定を前提にせず再現できるよう、演習ではESLint 10のツール構成を使います。

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

## 4. セットの検査を継続する

実アプリでは既存のESLint設定に統合します。新人向け手順書・AIへの実装指示には、preset、typed linting、プロジェクトのlintコマンドを含めてください。CIでもlintを実行し、後から入る変更にも同じ検査を適用します。

静的解析はテストを置き換えません。動的な値や一部の間接呼び出しは解析対象外です。初期化ルールは初期化のないファイルを許可し、1ファイル内の対応する呼び出し位置を最大1箇所に制限します。アプリ全体の一意性は検査しません。[正確な検出範囲](/eslint-plugin-rules/docs/rules/no-implicit-timezone)と[夏時間の動作](/docs/timezones)を確認してください。

MySQLの固定 `+09:00` 保存は[Workers MySQL](/workers-mysql/docs/quickstart)が所有する別の契約です。IANA表示タイムゾーンを変えてもDB通信のタイムゾーンは変わりません。
