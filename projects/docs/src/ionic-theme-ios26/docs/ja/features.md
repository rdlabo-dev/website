---
title: 機能
---

CSS変数とSass mixinでテーマをカスタマイズしたり、コンポーネント単位で段階的に導入したりできます。マークアップ固有のopt-inは [特別なマークアップとクラス](/docs/special-markup) を参照してください。

## CSS変数

ライブラリのデフォルトスタイルをデザインに合わせてカスタマイズできるよう、複数のCSS変数を提供しています。詳細は次のファイルを参照してください。
https://github.com/rdlabo-dev/ionic-theme-ios26/blob/v9.0.0/src/styles/default-variables.scss

## Liquid Glass mixin

Liquid Glass mixinを使うには、メインパッケージからSCSSファイルをimportします。

```scss
@use '@rdlabo/ionic-theme-ios26/src/styles/utils/api.scss';

ion-textarea label.textarea-wrapper {
  @include api.glass-background;
}
```

## コンポーネント単位のimport

段階的に導入する場合は、テーマ全体ではなく個別のコンポーネントをimportできます。

```css
@import '@rdlabo/ionic-theme-ios26/dist/css/utils/translucent';
@import '@rdlabo/ionic-theme-ios26/dist/css/components/ion-action-sheet';
@import '@rdlabo/ionic-theme-ios26/dist/css/components/ion-alert';
@import '@rdlabo/ionic-theme-ios26/dist/css/components/ion-button';
/* Import the remaining components your application uses. */
```

### コンポーネント単位でのDark Mode

Dark Mode対応のコンポーネントを個別にimportする場合は、Always、System、Class modeでselectorが異なるためSCSSを使います。

Always:

```scss
@use '@rdlabo/ionic-theme-ios26/src/styles/utils/theme-dark';

:root {
  @include theme-dark.default-variables;
}
@include theme-dark.ion-button;
@include theme-dark.ion-fab;
@include theme-dark.ion-tabs;
@include theme-dark.ion-segment;
```

System:

```scss
@use '@rdlabo/ionic-theme-ios26/src/styles/utils/theme-dark';

@media (prefers-color-scheme: dark) {
  :root {
    @include theme-dark.default-variables;
  }
  @include theme-dark.ion-button;
  @include theme-dark.ion-fab;
  @include theme-dark.ion-tabs;
  @include theme-dark.ion-segment;
}
```

Class:

```scss
@use '@rdlabo/ionic-theme-ios26/src/styles/utils/theme-dark';

.ion-palette-dark {
  @include theme-dark.default-variables;
  @include theme-dark.ion-button;
  @include theme-dark.ion-fab;
  @include theme-dark.ion-tabs;
  @include theme-dark.ion-segment;
}
```

## インタラクティブな例

[デモでrender済みの例を見る](https://ionic-theme-ios26.rdlabo.dev/main/docs)。
