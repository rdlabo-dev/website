---
title: '使い方'
code: []
scrollActiveLine: []
---

本番ビルドの前にコレクターを実行します。[初期化](/docs/initialize) のあとです。

```bash
npx @rdlabo/ionic-angular-collect-icons
```

### ビルド前に自動化する

コレクターを npm スクリプトに入れ、本番ビルドで `src/use-icons.ts` を更新します。

```diff
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
+   "prebuild": "npx @rdlabo/ionic-angular-collect-icons",
```

> [!WARNING]
> この方法は、npm スクリプトを使わない本番ビルドでは利用できません。

### 本番確認

1. テンプレートに静的アイコンを1つ追加します。例: `<ion-icon name="home"></ion-icon>`。
2. コレクターを実行し、対応するexportが `src/use-icons.ts` に出ることを確認します。
3. `npm run build` を実行します。

動的な `[name]` は収集されません。手動で登録するか、[FAQ](/docs/faq) のバインディング説明を見てください。
