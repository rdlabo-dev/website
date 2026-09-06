---
title: 設定
---

## Angular・Ionic

プラグイン22はAngular・Angular ESLint 21〜22とIonic Framework 9に対応します。21から更新する場合は、推奨presetを有効にする前に[移行ガイド](/docs/migration)を確認してください。

プラグインを登録し、推奨設定をトップレベルで展開してから、プロジェクトで使うAngular・TypeScript設定を追加します。

```js
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const rdlabo = require('@rdlabo/eslint-plugin-rules');

module.exports = tseslint.config(
  {
    plugins: { '@rdlabo/rules': rdlabo },
  },
  ...rdlabo.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
);
```

`rdlabo.configs.recommended` をスコープ付き `extends` の内側へ置かないでください。`typescript-eslint` のconfig helperがプリセット内部の `files` を置き換え、TypeScript専用ルールがテンプレートへ適用される可能性があります。

## 汎用TypeScript

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

export default tseslint.config({
  files: ['**/*.ts'],
  extends: [...tseslint.configs.recommendedTypeChecked],
  languageOptions: {
    parserOptions: { projectService: true, tsconfigRootDir: dirname(fileURLToPath(import.meta.url)) },
  },
  plugins: { '@rdlabo/rules': rdlabo },
  rules: {
    '@rdlabo/rules/deny-soft-private-modifier': 'error',
    '@rdlabo/rules/restrict-try-block': [
      'error',
      {
        allowPromise: false,
        allowPromiseResolve: true,
        allowRxjs: false,
        allowInSignal: false,
        maxLines: 3,
      },
    ],
  },
});
```

`restrict-try-block` のPromise・RxJS検査をすべて有効にするにはtyped lintingが必要です。

## 推奨プリセット

TypeScriptではSignal、Component境界、ライフサイクル、Overlay、Ionic 9 standalone import、readonly、tryブロックの共通ルールを有効にします。HTMLではIonic属性型、禁止Overlay要素、非同期操作の二重実行防止、iOS 26・MD3向けのgroup化されたlist構造を有効にします。

非推奨の `deny-constructor-di` はプリセットに含まれません。Angularの `inject()` migrationを利用してください。

## Cloudflare Workers

汎用TypeScriptエントリポイントは、独立した2つのpresetを提供します。

- `workers/recommended` は `try/catch` の境界を小さく明示的に保ちます。
- `workers-timezone/recommended` はhost timezoneへの暗黙依存を防ぎ、`@rdlabo/workers-timezone` の初期化を明確なモジュール直下の1箇所に限定します。

各presetは個別にも、組み合わせても利用できます。

```js
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
  ...rdlabo.configs['workers/recommended'],
  ...rdlabo.configs['workers-timezone/recommended'],
);
```

```sh
npm install --save-dev eslint @eslint/js typescript typescript-eslint @rdlabo/eslint-plugin-rules
```

timezone presetは `@rdlabo/workers-timezone` のコンパニオンです。実行時にはどちらのパッケージも相互依存しません。Workers presetからtimezone presetを暗黙に読み込まないため、各ポリシーを明示的に選択できます。

推奨HTML設定には `require-ion-error-text` が含まれます。[新ルール](/docs/rules/require-ion-error-text)と[22.1への移行](/docs/migration)を確認してください。

Workersの2つのpresetはAngularの `recommended` に含まれず、互いにも独立しています。`no-implicit-timezone` はtyped lintingが必須です。`initialize-timezone-at-module-scope` は構文だけを検査し、初期化のないファイルを許可します。初期化がある場合に1ファイル内で最大1箇所を要求し、アプリ全体の一意性を検証するものではありません。検出範囲と制限は[no-implicit-timezone](/docs/rules/no-implicit-timezone)と[initialize-timezone-at-module-scope](/docs/rules/initialize-timezone-at-module-scope)を参照してください。
