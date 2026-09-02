---
title: Theme
---

[Installation](/docs/readme#installation)の後に、Editorの色を上書きします。

Default colorはlibrary stylesheetで定義されています。CSS variableで上書きします。

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

Source reference: [`core.scss`](https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.0/projects/photo-editor/src/lib/pages/core.scss)

## Toolbar color scheme

`PhotoEditorPage` と `PhotoViewerPage` では、Modalの `componentProps` に `toolbarColorScheme: 'light' | 'dark'` を指定する必要があります。暗色・黒色の `ion-toolbar` には `dark`、明色・白色のToolbarには `light` を選択してください。最終的なToolbarの外観はCSS、translucency、runtime theme overrideによって変わるため、Library側では確実に判定できません。利用側で明示的に選択する必要があります。

`@rdlabo/ionic-theme-ios26` v3では、iOS 26 ThemeとDark Mode styleより後に、任意のintegration stylesheetをimportします。

```scss
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26.css';
@import '@ionic/angular/css/palettes/dark.class.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-class.css';
@import '@rdlabo/ionic-angular-photo-editor/css/ios26-header-button-color-scheme.css';
```

必要に応じて、対応するAlwaysまたはSystem Dark Mode用のimportへ置き換えてください。Photo Editor integration stylesheetは、local header schemeがアプリ全体のschemeを上書きできるよう、必ず最後に読み込みます。iOS 26 Themeを使わないアプリでは、この任意stylesheetをimportしないでください。その場合は通常のIonic Button foreground color switchだけが適用されます。
