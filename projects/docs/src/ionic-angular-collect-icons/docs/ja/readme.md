---
title: 'はじめに'
code: []
scrollActiveLine: []
---

テンプレートから `ion-icon` 名を収集し、本番用の `addIcons` 登録を生成します。開発時は全アイコンを登録でき、本番ビルドではテンプレートで見つかったアイコンだけを集めます。

このプロジェクトは [ionic-team/ionic-angular-standalone-codemods](https://github.com/ionic-team/ionic-angular-standalone-codemods) を基にしています。

## サポートするバージョン

- Node.js >= 22
- Ionic Angular >= 9.0.0
- Angular >= 18.0.0
- TypeScript >= 5.4.0
- ionicons >= 8.0.0
- @angular-eslint/template-parser 21 または 22

## インストール

```bash
npm install --save-dev \
  @rdlabo/ionic-angular-collect-icons \
  @angular-eslint/template-parser@^21
```

Angular ESLint 22を使うprojectでは、代わりに `@angular-eslint/template-parser@^22` を指定してください。parserはpeer dependencyのため、collectorはアプリケーションと同じ世代のAngular template parserを使います。

## 初期化

`addIcons` を配線し、`src/use-icons.ts` を生成します。

```bash
npx @rdlabo/ionic-angular-collect-icons --initialize true
```

`src/use-icons.ts` が存在し、`main.ts`（または `app.config.ts`）が本番ではそのファイル、開発では `ionicons/icons` から `addIcons` していることを確認してください。手動配線は [初期化](/docs/initialize) です。

## ビルド確認

1. テンプレートに静的アイコンを1つ追加します。例: `<ion-icon name="home"></ion-icon>`。
2. `npx @rdlabo/ionic-angular-collect-icons` を実行し、対応するexportが `src/use-icons.ts` に出ることを確認します。
3. `npm run build` を実行します。

コレクターの自動化は [使い方](/docs/usage) の `prebuild` を参照してください。動的な `[name]` は収集されません。手動登録するか [FAQ](/docs/faq) を見てください。

## ドキュメント

- [初期化](/docs/initialize) — `addIcons` の自動または手動配線。
- [使い方](/docs/usage) — 本番ビルド前のコレクター実行。
- [CLI オプション](/docs/options) — `--dry-run`、`--initialize`、パス。
- [FAQ](/docs/faq) — テスト、バインディング、`main.ts`。
- [移行](/docs/migration) — 既存アプリの Ionic Angular 8 → 9 確認。
