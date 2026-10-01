---
title: prefer-ionic-standalone
headingAliases:
  rule-details: ルール詳細
  examples: 例
  incorrect: 誤り
  correct: 正しい
  options: オプション
  when-to-enable: 有効にする場面
  implementation: 実装
---

# @rdlabo/rules/prefer-ionic-standalone

> Ionic 9のスタンドアロンAPIを優先し、IonicModuleおよび廃止済み・NgModuleベースのエントリポイントを禁止します。
>
> - ⭐️ このルールはFlat Configの [`rdlabo.configs.recommended`](../configuration.md) に含まれます。
> - ✒️ [コマンドライン](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems)の `--fix` オプションで、報告された問題の一部を自動修正できます。

Ionic 9はスタンドアロンのAngularコンポーネントを `@ionic/angular` からエクスポートします。このルールは、廃止された `@ionic/angular/standalone` エントリポイント、NgModuleベースの `@ionic/angular/lazy` エントリポイント、`IonicModule` 自体を禁止し、アプリケーションでスタンドアロンAPIを使うようにします。

## ルール詳細

インポート、名前付き再エクスポート、すべての名前を再エクスポートする宣言、名前空間インポート経由の `IonicModule` へのアクセスを検査します。名前空間へのアクセスはスコープから解決するため、同名のローカル変数に隠されている場合は報告しません。

## 例

### 誤り

```ts
import { IonButton } from '@ionic/angular/standalone';
import { IonInput } from '@ionic/angular/lazy';
import { IonicModule } from '@ionic/angular';
```

### 正しい

```ts
import { IonButton, IonInput, ModalController, provideIonicAngular } from '@ionic/angular';
```

`/standalone` と `/lazy` からの名前付きインポート・名前付き再エクスポートは、元の引用符の形式を維持して `@ionic/angular` へ自動修正されます。副作用のみを目的とするインポート、名前空間インポート、`export *` 宣言は、エントリポイントの変更が実行時の動作を変える可能性があるため、修正せず報告します。`IonicModule.forRoot()` とNgModuleのメタデータの置き換えにはアプリケーション全体の変更が必要なため、`IonicModule` も修正せず報告します。

## オプション

このルールにオプションはありません。重大度はESLint設定で `warn` または `error` に指定します。

## 有効にする場面

スタンドアロン形式での起動を採用したIonic 9 Angularアプリケーションで有効にしてください。`@ionic/angular/lazy` と `IonicModule` は常に禁止されるため、NgModuleアプリケーションは有効化前にスタンドアロンへの移行を完了してください。

## 実装

- [ルールの実装](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/prefer-ionic-standalone.ts)
- [テストの実装](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/prefer-ionic-standalone.ts)
