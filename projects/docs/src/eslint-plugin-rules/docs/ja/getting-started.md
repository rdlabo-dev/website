---
title: はじめに
---

このpluginは、Angular・IonicのComponentやtemplate、Workersのエラー境界、日時コードの規約を開発時に検査します。[検出と自動修正を試す](/docs/quickstart)では、Angular・IonicなしでTypeScriptの1ルールを体験できます。日時処理は[Timezoneとのセット演習](/workers-timezone/docs/quickstart)から始めてください。

開発依存関係としてプラグインをインストールします。

```sh
npm install --save-dev @rdlabo/eslint-plugin-rules
```

パッケージルートはAngular・Ionic向けルールを公開します。これらを使う場合は `@angular-eslint/template-parser`、`@ionic/angular`、`@ionic/core` もインストールしてください。Angular・Ionicに依存しないTypeScriptプロジェクトでは、これらを読み込まない `/typescript` エントリポイントを利用できます。

## 要件

| パッケージ                        | 対応バージョン                 |
| --------------------------------- | ------------------------------ |
| Node.js                           | 20以降                         |
| ESLint                            | 9以降                          |
| `@typescript-eslint/utils`        | 8.33以上9未満                  |
| `@angular-eslint/template-parser` | 21.xまたは22.x                  |
| `@ionic/angular`                  | Ionicルール利用時は9.x          |
| `@ionic/core`                     | Ionicルール利用時は9.x          |

## エントリポイントを選ぶ

- Angular・Ionicアプリでは `@rdlabo/eslint-plugin-rules` を使います。
- バックエンドなどの汎用TypeScriptでは `@rdlabo/eslint-plugin-rules/typescript` を使います。

推奨プリセットはESLint Flat Config向けです。TypeScriptとHTMLの対象指定を維持するため、設定のトップレベルへ追加します。

Ionic templateでは、推奨プリセットが `ion-list` 内の `ion-item` に対し、`ion-item-group`、`ion-reorder-group`、`ion-radio-group`、または `ion-accordion-group` 内の `ion-accordion` を使うことも要求します。これはiOS 26とMaterial Design 3のlist構造に対応するためです。

次は[設定](/eslint-plugin-rules/docs/configuration)で推奨プリセットまたは個別ルールを有効にします。
