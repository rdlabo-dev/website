---
title: 移行
---

## 22.0から22.1へ

22.1では推奨presetに `require-ion-error-text` が追加されました。既定では `[formField]` を指定した、`errorText` 対応の6種類のIonicコントロールを検査します。空でない静的な `errorText` または `[errorText]` が必要です。

`KitIonicFormField` を利用する場合、対象のstandalone componentすべてにAngularの `FormField` とkitアダプターをimportしたうえで、次を有効にできます。アプリの `provideKitIonicSignalForms()` 登録も必要です。

```js
{
  files: ['**/*.html'],
  rules: {
    '@rdlabo/rules/require-ion-error-text': ['error', { formFieldProvidesErrorText: true }],
  },
}
```

`[formField]` のないコントロールにも文言を要求する場合だけ `checkAll: true` を指定します。既定ではフィルターや設定項目は対象外です。`ignoreReadonly: true` は `checkAll` 有効時の `ion-input`・`ion-textarea` の静的な `readonly` 属性だけに適用され、動的な `[readonly]` は検査されます。

## 21.xから22.xへ

version 22はAngular 21・22とIonic Framework 9を対象にします。Ionic 8のアプリケーションでは、このpluginのversion 21を使い続けてください。

### 依存関係

まずアプリケーションの変更をcommitし、アプリケーションrootでIonic公式の [`@ionic/migrate`](https://www.npmjs.com/package/@ionic/migrate) を実行します。

```sh
npx @ionic/migrate --dry-run
npx @ionic/migrate
```

migratorはインストール済みのIonic major versionを検出し、`@ionic/angular` と `@ionic/core` を同時に更新します。安全なv8からv9への変更を適用し、手動判断が必要な項目をchecklistとして表示します。続行前に差分を確認してtestしてください。このpluginのversion 22はAngularおよびAngular ESLint 21から22に対応します。

### Ionic Angular import

削除された `deny-import-from-ionic-module` ruleを `prefer-ionic-standalone` に置き換えます。

```diff
- '@rdlabo/rules/deny-import-from-ionic-module': 'error'
+ '@rdlabo/rules/prefer-ionic-standalone': 'error'
```

Angularアプリケーションでは、公式migratorが既存のNgModule importを `@ionic/angular` から `@ionic/angular/lazy` へ、standalone importを `@ionic/angular/standalone` からpackage rootへ移します。これによりframework更新中も現在のarchitectureが維持されます。

たとえば、migratorは次の安全なstandalone importの書き換えを自動で行います。

```diff
- import { IonButton } from '@ionic/angular/standalone';
+ import { IonButton } from '@ionic/angular';
```

このpluginはIonic 9のstandaloneアプリケーションだけをサポートします。NgModuleアプリケーションの変換にはarchitecture上の判断が必要なため、公式migratorは `IonicModule` を自動修正せず報告します。実行後にAngular standalone migrationを完了し、Ionic componentをpackage rootからimportしてください。`@ionic/angular/lazy` pathを機械的に置換してはいけません。まず各NgModule consumerをstandaloneへ変換し、その後 `IonicModule` を実際に使う個別のIonic componentへ置き換えます。

新しいruleはNgModule向けの `@ionic/angular/lazy` entry pointと `IonicModule` を禁止します。`provideIonicAngular()` を使ったstandalone bootstrapへ移行し、standalone Ionic componentを直接importします。

```diff
- platformBrowserDynamic().bootstrapModule(AppModule);
+ bootstrapApplication(AppComponent, {
+   providers: [provideIonicAngular(config)],
+ });
```

`provideIonicAngular` は `@ionic/angular` からimportします。`IonicModule` を削除する前にAngular NgModuleからstandaloneへの移行を完了してください。NgModule内で安全に1行置換することはできません。

### recommended presetのlist構造

version 22ではrecommended presetに `require-ion-item-group` も追加されます。そのため、`ion-list` 内の `ion-item` が `ion-item-group`、`ion-reorder-group`、`ion-radio-group`、または `ion-accordion-group` 内の `ion-accordion` で囲まれていない既存のIonic templateでは、新しいerrorが報告される場合があります。

意図したgroup境界を判断できる場合だけ安全な自動修正を適用します。再利用可能または曖昧なtemplateは変更せずに報告します。wrapper componentはそれ自身のtemplateを通して検査されるため、正しいgroup化済みlistをrenderするcustom elementが、caller側でgroup化されていない `ion-item` として扱われることはありません。対応構造と修正条件は [`require-ion-item-group`](/eslint-plugin-rules/docs/rules/require-ion-item-group) を参照してください。

### booleanのautocorrect

Ionic 9では `ion-input` と `ion-searchbar` の `autocorrect` が `'on' | 'off'` からbooleanへ変わります。`ionic-attr-type-check` ruleは古いstring形式を修正します。

```diff
- <ion-input autocorrect="off"></ion-input>
+ <ion-input [autocorrect]="false"></ion-input>
```

Ionic公式migratorもこのv8からv9への変更を自動処理します。このruleは移行後に残った値や新たに追加された古いstring値の検出にも利用でき、Ionic 9のcomponent type定義から、ほかのproperty typeや許容値の変更も追従します。ESLintを `--fix` 付きで実行し、templateの変更を確認してからAngular buildとtestを実行してください。
