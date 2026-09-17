---
title: 機能
---

CSS変数とSass mixinでテーマをカスタマイズしたり、コンポーネント単位で段階的に導入したりできます。マークアップ固有のopt-inは [特別なマークアップとクラス](/docs/special-markup) を参照してください。

## CSS変数

ライブラリのデフォルトスタイルをデザインに合わせてカスタマイズできるよう、複数のCSS変数を提供しています。詳細は次のファイルを参照してください。
https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v1.0.0/src/styles/default-variables.scss

メニューの背景RGBは `--ios-theme-menu-background-rgb`（ライト: `225, 230, 240`、ダーク: `26, 31, 34`）、不透明度は `--ios-theme-menu-background-opacity`（既定値: `0.96`）で指定します。どちらも `ion-menu` に設定できる公開CSS変数です。

ボタン押下時の拡縮は `:active` に従い、少しovershootします。継続時間は共通のactivated transition変数ではなく、`--ios-theme-button-press-duration`（既定値: `380ms`）で変更します。

## Liquid Glass mixin

Liquid Glass mixinを使うには、メインパッケージからSCSSファイルをimportします。

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/utils/api.scss';

ion-textarea label.textarea-wrapper {
  @include api.glass-background;
}
```

## Native UI Shell（実験的機能）

Capacitor iOSアプリでは、任意の実験的機能[Native UI Shell](/docs/native-ui-shell)で、対応する固定コントロールをUIKitとシステムのLiquid Glassで描画できます。内容とロジックはWebViewに残り、Ionicがルーティングと画面遷移を管理します。ガイドではBasecampとCapacitorに由来する考え方、導入、対応部品、Web描画へのフォールバックを説明します。

## コンポーネント単位のimport

段階的に導入する場合は、テーマ全体ではなく個別のコンポーネントをimportできます。

```css
@import '@rdlabo/ionic-theme-ios27/dist/css/utils/translucent';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-action-sheet';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-alert';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-button';
/* Import the remaining components your application uses. */
```

### コンポーネント単位でのDark Mode

Dark Mode対応のコンポーネントを個別にimportする場合は、Always、System、Class modeでselectorが異なるためSCSSを使います。

Always:

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/utils/theme-dark';

:root {
  @include theme-dark.default-variables;
}
@include theme-dark.ion-list;
@include theme-dark.ion-button;
@include theme-dark.ion-fab;
@include theme-dark.ion-tabs;
@include theme-dark.ion-segment;
```

System:

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/utils/theme-dark';

@media (prefers-color-scheme: dark) {
  :root {
    @include theme-dark.default-variables;
  }
  @include theme-dark.ion-list;
  @include theme-dark.ion-button;
  @include theme-dark.ion-fab;
  @include theme-dark.ion-tabs;
  @include theme-dark.ion-segment;
}
```

Class:

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/utils/theme-dark';

.ion-palette-dark {
  @include theme-dark.default-variables;
  @include theme-dark.ion-list;
  @include theme-dark.ion-button;
  @include theme-dark.ion-fab;
  @include theme-dark.ion-tabs;
  @include theme-dark.ion-segment;
}
```

## インタラクティブな例

[デモでrender済みの例を見る](https://ionic-theme-ios27.rdlabo.dev/main/docs)。
