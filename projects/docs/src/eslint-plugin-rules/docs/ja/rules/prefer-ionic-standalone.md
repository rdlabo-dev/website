---
title: prefer-ionic-standalone
---

# @rdlabo/rules/prefer-ionic-standalone

> Ionic 9のstandalone APIを優先し、IonicModuleおよび廃止済み・NgModuleベースのentry pointを禁止します。
>
> - ⭐️ このruleは `plugin:@rdlabo/rules/recommended` presetに含まれます。
> - ✒️ [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems)の `--fix` optionで、報告された問題の一部を自動修正できます。

Ionic 9はstandalone Angular componentを `@ionic/angular` からexportします。このruleは、廃止された `@ionic/angular/standalone` entry point、NgModuleベースの `@ionic/angular/lazy` entry point、`IonicModule` 自体を禁止し、アプリケーションをstandalone API surfaceに保ちます。

## Rule Details

import、named re-export、export-all declaration、namespace import経由の `IonicModule` accessを検査します。namespace accessはscopeから解決するため、同名のlocal variableでshadowされている場合は報告しません。

## Examples

### Incorrect

```ts
import { IonButton } from '@ionic/angular/standalone';
import { IonInput } from '@ionic/angular/lazy';
import { IonicModule } from '@ionic/angular';
```

### Correct

```ts
import { IonButton, IonInput, ModalController, provideIonicAngular } from '@ionic/angular';
```

`/standalone` と `/lazy` からのnamed import・named re-exportは、元のquote styleを維持して `@ionic/angular` へ自動修正されます。side-effect import、namespace import、`export *` declarationはentry pointの変更がruntime behaviorを変える可能性があるため、修正せず報告します。`IonicModule.forRoot()` とNgModule metadataの置き換えにはアプリケーション単位の変更が必要なため、`IonicModule` も修正せず報告します。

## Options

このruleにoptionはありません。severityはESLint設定で `warn` または `error` に指定します。

## When to enable

standalone bootstrapを採用したIonic 9 Angularアプリケーションで有効にしてください。`@ionic/angular/lazy` と `IonicModule` は常に禁止されるため、NgModuleアプリケーションは有効化前にstandalone migrationを完了してください。

## Implementation

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/prefer-ionic-standalone.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/prefer-ionic-standalone.ts)
