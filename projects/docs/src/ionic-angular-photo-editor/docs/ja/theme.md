---
title: 'テーマ'
code: []
scrollActiveLine: []
---

[インストール](/docs/readme#インストール) のあと、エディターの色を上書きします。

デフォルトの色は設定済みですが、上書きできます: https://github.com/rdlabo-dev/ionic-angular-library/blob/v21.7.0/projects/photo-editor/src/lib/pages/core.scss

## 上書き方法

```scss
:root {
  --ion-photo-editor-background: #2a2a2a;
  --ion-photo-editor-background-tint: #414141;

  --ion-photo-editor-color: #f0f0f0;
  --ion-photo-editor-color-tint: #dbdbdb;

  --ion-photo-editor-primary: #4d8dff;
  --ion-photo-editor-danger: #f24c58;
  --ion-photo-editor-success: #2dd55b;

  --ion-photo-editor-header-button-color-on-light: #222428;
  --ion-photo-editor-header-button-color-on-dark: #f4f5f8;
}
```

## ヘッダーボタンのカラースキーム

`PhotoEditorPage` と `PhotoViewerPage` では、モーダルの `componentProps` に `headerButtonColorScheme: 'light' | 'dark'` を指定する必要があります。`ion-toolbar` が暗色または黒色の場合は `dark`、明色または白色の場合は `light` を選択してください。最終的なツールバーの外観はCSS、半透明効果、実行時のテーマ上書きによって変わるため、ライブラリ側では確実に判定できません。利用側で明示的に選択する必要があります。

`@rdlabo/ionic-theme-ios26` v3では、iOS 26テーマとダークモードのスタイルよりあとに、オプションの連携スタイルシートを読み込みます。

```scss
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26.css';
@import '@ionic/angular/css/palettes/dark.class.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-class.css';
@import '@rdlabo/ionic-angular-photo-editor/css/ios26-header-button-color-scheme.css';
```

必要に応じて、対応するAlwaysまたはSystemダークモード用のimportへ置き換えてください。photo-editor連携スタイルシートは、局所的なヘッダーの配色がアプリ全体の配色を上書きできるよう、必ず最後に読み込む必要があります。iOS 26テーマを使用しないアプリでは、このオプションのスタイルシートを読み込まないでください。その場合は、通常のIonicボタンの前景色切り替えだけが適用されます。
