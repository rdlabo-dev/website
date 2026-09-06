---
title: ESLintでリストの構造を整える
---

画面に反映される前に、リストのグループ漏れを検出します。Ionic Angularアプリでは、`@rdlabo/eslint-plugin-rules` がiOS 26で使うマークアップを検査します。

## list検査を有効にする

この設定はIonic Angular 9とAngular / Angular ESLint 21–22向けです。Angular ESLintが既にあるアプリに、plugin 22をインストールします。

```sh
npm install --save-dev @rdlabo/eslint-plugin-rules@22
```

既存のHTML設定へpluginを追加します（`eslint.config.mjs`、または同等のCommonJS設定）。inline templateも検査するため、TypeScript設定の `angular.processInlineTemplates` はそのまま残してください。

```js
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules';

export default tseslint.config(
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    processor: angular.processInlineTemplates,
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angular.templateParser },
    plugins: { '@rdlabo/rules': rdlabo },
    rules: {
      '@rdlabo/rules/require-ion-item-group': 'error',
    },
  },
);
```

他の検査を残すため、既存設定へこれらのエントリを統合してください。すでに `rdlabo.configs.recommended` を使っている場合は、このruleが含まれています。

## 何を検出するか

次のtemplateは報告されます。

```html
<ion-list [inset]="true">
  <ion-item>Notifications</ion-item>
</ion-list>
```

itemをgroupで囲み、standalone componentで `IonItemGroup` をimportします。

```html
<ion-list [inset]="true">
  <ion-item-group>
    <ion-item>Notifications</ion-item>
  </ion-item-group>
</ion-list>
```

このruleはinsetでないlistを含む、すべての `ion-list` を検査します。radio、reorder、accordionのgroupにも対応します。Angular templateを対象とし、ReactやVueのtemplateは検査しません。

レイアウト例は [ion-item-groupの使用方法](/ionic-theme-ios26/docs/using-ion-item-group)、対応構造と自動修正は [ルールリファレンス](/eslint-plugin-rules/docs/rules/require-ion-item-group) を参照してください。

## 検査を継続する

依存のインストール後、ローカルとCIで次を実行します。

```sh
npx eslint 'src/**/*.{ts,html}' --max-warnings 0
```

Angularプロジェクトのソースディレクトリが異なる場合はパスを調整してください。余白、色、遷移の見た目確認は別途行い、このruleはlist構造だけを検査します。
