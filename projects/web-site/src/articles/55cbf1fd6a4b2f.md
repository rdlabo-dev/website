---
title: "@angular-eslint Can Leave package.json — Migrate to ESLint v9-Ready angular-eslint"
description: "ESLint v8 reached EOL in October 2024. This guide walks through Flat Config migration with @eslint/migrate-config and switching from @angular-eslint to angular-eslint via ng add."
zennSlug: 55cbf1fd6a4b2f
emoji: "💭"
---

I considered several titles, but within the character limit they are a bit misleading. With a little more detail, the story is:

- ESLint v8 reached EOL in October this year
- ESLint v9 introduced Flat Config, which requires migration
- The Angular ESLint team released `angular-eslint` with ESLint v9 support
- From ESLint v9 onward, `@angular-eslint` is used internally by `angular-eslint`, so you can remove it from your `package.json` (except for plugin development and similar use cases)

## Migration

If you are already on ESLint v9 and Flat Config, moving from `@angular-eslint` to `angular-eslint` is easy with the `ng add` command. However, the Angular CLI does not provide a migration path to ESLint v9 and Flat Config, so you need to do that separately. Follow the steps below.

:::message
In https://github.com/angular-eslint/angular-eslint/issues/2117#issuecomment-2508662458, the team says they would like to add a migration to ESLint v9 and Flat Config when time allows, so an `ng` command migration may become available in the future.
:::

### 0. Update to Angular 19

If you have not done this yet, take care of it first. Here is one example.
```bash
% ng update @angular-eslint/schematics @angular/cli  @angular/core
```
The usual update flow.

### 1. Migrate to ESLint v9 and Flat Config

ESLint provides a migration tool, so use that. Run the following command.
```bash
% npx @eslint/migrate-config .eslintrc.json
```
That generates `eslint.config.mjs` automatically. Then install the required packages as instructed.
```bash
% npm install @eslint/js @eslint/eslintrc -D
```
Next, delete the old ESLint config file. If you were using `.eslintrc.json`, run:
```bash
% rm .eslintrc.json
```
Simple enough.

### 2. Move from `@angular-eslint` to `angular-eslint`

Migrate from `@angular-eslint` to `angular-eslint`. Run:
```bash
% ng add angular-eslint
````
When it finishes, `@angular-eslint/*` is removed automatically and `angular-eslint` is added. ESLint is updated as well. Done!!


**But is mjs really what I want?**

The migrated file is not very clean, though. It is a bit long, but here is the newly generated `eslint.config.mjs` from my environment (with some line breaks adjusted).
```js:eslint.config.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["projects/**/*", "**/deep-model.ts"],
}, ...compat.extends(
    "plugin:@angular-eslint/recommended",
    "plugin:@angular-eslint/template/process-inline-templates",
).map(config => ({
    ...config,
    files: ["**/*.ts"],
})), {
    files: ["**/*.ts"],
    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",
        parserOptions: {
            project: ["tsconfig.json"],
            createDefaultProgram: true,
        },
    },
    rules: {
      "@angular-eslint/directive-selector": ["error", {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
      }],
      "@angular-eslint/component-selector": ["error", {
          type: "element",
          prefix: "app",
          style: "kebab-case",
      },],
    },
}, ...compat.extends("plugin:@angular-eslint/template/recommended").map(config => ({
    ...config,
    files: ["**/*.html"],
})), {
    files: ["**/*.html"],
    rules: {},
}];
```
Hmm... There is `compat` for backward compatibility, and it becomes `mjs` because of `import`. I wondered what a fresh Angular project would produce, so I checked.
```js:eslint.config.js
// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  }
);
```
Yes, this is the kind of simple config I prefer. The extension is `js` too. If you prefer this approach, rename `eslint.config.mjs` to `eslint.config.js` and update the contents.

## Summary

Moving from `@angular-eslint` to `angular-eslint` is easy with `ng add`. Migrating to ESLint v9 and Flat Config still has to be done manually. Also, the generated `mjs` file is not very clean, so you may want to switch to `eslint.config.js` and adjust the contents.

ESLint v8 reached EOL in October this year, so migrating sooner is a good idea.

See you next time.
