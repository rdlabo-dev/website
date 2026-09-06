---
title: ESLintでKitの使い方をチェック
---

Ionic Angularアプリの成長に合わせて、modalの起動、非同期アクションのhandler、フォームエラーを一貫させます。`@rdlabo/eslint-plugin-rules` は、`@rdlabo/ionic-angular-kit` と組み合わせて使う呼び出しパターンを検査します。

## 使う検査を有効にする

Angular / Angular ESLint 21–22が設定済みのIonic Angular 9アプリでは:

```sh
npm install --save-dev @rdlabo/eslint-plugin-rules@22
```

既存の検査を残したまま、`eslint.config.mjs` へ次のエントリを統合します。4つのルールを有効にします。アプリで使っているKit機能に合わせて選んでください。

```js
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules';

export default tseslint.config(
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    processor: angular.processInlineTemplates,
    plugins: { '@rdlabo/rules': rdlabo },
    rules: {
      '@rdlabo/rules/deny-overlay-create': 'error',
      '@rdlabo/rules/prefer-modal-launcher': 'error',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angular.templateParser },
    plugins: { '@rdlabo/rules': rdlabo },
    rules: {
      '@rdlabo/rules/prefer-disable-handler': 'error',
      '@rdlabo/rules/require-ion-error-text': 'error',
    },
  },
);
```

これらのruleは `rdlabo.configs.recommended` にも含まれます。

## modal作成をlauncherに置く

`deny-overlay-create` は、`ModalController`・`PopoverController` の `.create()` 呼び出しを報告します。`prefer-modal-launcher` は、`presentModal` 呼び出しが `launch*` 関数内にあることを検査します。

[Overlayの設定](/ionic-angular-kit/docs/storage-overlays) の `overlay` と `DetailPage` を使うと、次は報告されます。

```ts
export const openDetail = () => overlay.presentModal(DetailPage);
```

launcherを使います。

```ts
export const launchDetail = () => overlay.presentModal(DetailPage);
```

## 非同期アクションをwrapする

`prefer-disable-handler` は、wrapされていないアクションを報告します。

```html
<ion-button type="button" (click)="vm.refresh()">Refresh</ion-button>
```

Kitの `disableHandler` helperをcomponentまたはViewModelへ公開し、イベントと非同期処理を渡します。

```ts
import { disableHandler } from '@rdlabo/ionic-angular-kit';

// Inside the component or ViewModel:
readonly disableHandler = disableHandler;
```

```html
<ion-button type="button" (click)="vm.disableHandler($event, vm.refresh())">Refresh</ion-button>
```

このruleはwrapper呼び出しを検査し、非同期処理そのものの挙動は検査しません。submitはフォームの `(submit)` と `ion-button type="submit"` に置いてください。

## Signal Forms adapterに合わせる

既定では、`require-ion-error-text` は `[formField]` 付きのIonic controlにerror text sourceを要求します。

[Kit Signal Forms](/ionic-angular-kit/docs/forms) を使うAngular 22アプリでは、対象componentごとに `FormField` と `KitIonicFormField` をimportし、`provideKitIonicSignalForms()` をアプリのprovidersへ追加します。そのうえでHTML設定の `rules` 内を次のように上書きします。

```js
'@rdlabo/rules/require-ion-error-text': [
  'error',
  { formFieldProvidesErrorText: true },
],
```

このoptionはadapterがerror textを提供することを宣言するだけで、ESLintはadapterのimportやproviderを検証しません。

## ViewModel方針を使う場合は追加する

アプリが `ViewModelStore` 構成を使う場合は、[require-viewmodel](/eslint-plugin-rules/docs/rules/require-viewmodel) と [no-component-writable-signal](/eslint-plugin-rules/docs/rules/no-component-writable-signal) を追加してください。アプリ側のViewModel基底クラスに合わせて設定します。`ViewModelStore` はKitのexportではありません。

## CIで実行する

依存のインストール後、ローカルとCIで実行します。

```sh
npx eslint 'src/**/*.{ts,html}' --max-warnings 0
```

ソースパスはアプリに合わせて調整してください。recommended設定の全体は [ESLintの設定](/eslint-plugin-rules/docs/configuration)、その他の規約は [ルール一覧](/eslint-plugin-rules/docs/rules) を参照してください。
