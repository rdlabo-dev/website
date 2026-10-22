---
title: ESLint でリストの一貫性を保つ
---

# ESLint でリストの一貫性を保つ

リストのグループ不足を画面に表示される前に検出します。Ionic Angular アプリでは、`@rdlabo/eslint-plugin-rules` が iOS 27 で使用するマークアップを確認します。

## リストのチェックを有効にする

この設定は Angular / Angular ESLint 21–22 を使用する Ionic Angular 9 向けです。Angular ESLint を設定済みのアプリにプラグイン 22 をインストールします。

```sh
npm install --save-dev @rdlabo/eslint-plugin-rules@22
```

`eslint.config.mjs`（または同等の CommonJS 設定）の既存の HTML 設定にプラグインを追加します。インラインテンプレートも検査するため、TypeScript 設定の `angular.processInlineTemplates` は維持してください。

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

既存のチェックを残すため、これらの項目を現在の設定へ統合してください。`rdlabo.configs.recommended` を使用している場合、このルールはすでに含まれます。

## 検出内容を確認する

次のテンプレートが報告対象になります。

```html
<ion-list [inset]="true">
  <ion-item>Notifications</ion-item>
</ion-list>
```

項目をグループ化し、スタンドアロンコンポーネントに `IonItemGroup` をインポートします。

```html
<ion-list [inset]="true">
  <ion-item-group>
    <ion-item>Notifications</ion-item>
  </ion-item-group>
</ion-list>
```

このルールはインセットでないリストを含め、すべての `ion-list` を確認します。ラジオ、並べ替え、アコーディオンのグループにも対応します。対象は Angular テンプレートで、React・Vue のテンプレートは検査しません。

レイアウト例は [ion-item-group の使い方](using-ion-item-group.md)、対応構造と自動修正は[ルールのリファレンス](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/require-ion-item-group)を参照してください。

## チェックを継続する

依存関係をインストールした後、ローカルと CI で実行します。

```sh
npx eslint 'src/**/*.{ts,html}' --max-warnings 0
```

Angular プロジェクトのソースディレクトリーが異なる場合はパスを調整します。余白、色、遷移は引き続き目視で確認してください。このルールはリスト構造を検査します。
