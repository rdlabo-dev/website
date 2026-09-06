---
title: Configuration
---

## Angular and Ionic

Register the plugin, spread its recommended configs at the top level, then add the standard Angular and TypeScript configs for your project.

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

Do not place `rdlabo.configs.recommended` inside a scoped `extends`. The `typescript-eslint` config helper would replace the preset's internal `files` selectors and could run TypeScript-only rules against templates.

## Framework-independent TypeScript

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

Typed linting is required for the full Promise and RxJS checks in `restrict-try-block`.

## Recommended preset

The Ionic/Angular preset enables the common Signal, component boundary, lifecycle, overlay, readonly, form, and try-block rules. `deny-constructor-di` is deprecated and is not included.

## Cloudflare Workers

The framework-independent entry point provides two independent presets:

- `workers/recommended` keeps `try/catch` boundaries small and explicit.
- `workers-timezone/recommended` prevents implicit host-timezone behavior and enforces one clear module-level `@rdlabo/workers-timezone` initialization site.

Enable either preset independently, or combine both:

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

The timezone preset is a companion to `@rdlabo/workers-timezone`; neither package depends on the other at runtime. The Workers preset deliberately does not include the timezone preset, so each policy remains explicit.

The recommended HTML config includes `require-ion-error-text`. See the [rule](/docs/rules/require-ion-error-text) and [22.1 migration](/docs/migration).
