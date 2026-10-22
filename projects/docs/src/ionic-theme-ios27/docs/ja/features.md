---
title: 機能
---

# 機能

CSS 変数と Sass ミックスインでテーマをカスタマイズしたり、コンポーネントごとに導入したりできます。マークアップで有効にする機能は[特別なマークアップとクラス](special-markup.md)を参照してください。

## CSS 変数

ライブラリーの標準スタイルをデザインに合わせて調整する CSS 変数を用意しています。詳細は次のファイルを参照してください。
[既定の変数](../src/styles/default-variables.scss)

| 変数 | 既定値 | 用途 |
| ------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| `--ios-theme-menu-background-rgb` | ライト: `225, 230, 240`、ダーク: `26, 31, 34` | メニュー背景の RGB 値。`ion-menu` に設定します。 |
| `--ios-theme-menu-background-opacity` | `0.96` | メニュー背景の不透明度。`ion-menu` に設定します。 |
| `--ios-theme-button-press-duration` | `380ms` | 少しオーバーシュートするボタンの `:active` 拡大縮小の所要時間。 |

ボタン押下時の拡大縮小には、共通の activated-transition 時間変数ではなく `--ios-theme-button-press-duration` を使用してください。

## Liquid Glass ミックスイン

Liquid Glass ミックスインを使うには、メインパッケージの SCSS ファイルをインポートします。

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/utils/api.scss';

ion-textarea label.textarea-wrapper {
  @include api.glass-background;
}
```

## Native UI

テーマの動作を確認したら、[Native UI を追加](add-native-ui.md)して、対応する固定コントロールを iOS の UIKit と SwiftUI で描画できます。Web コンテンツとフォールバック用コントロールのテーマスタイルは維持してください。Native UI は 2.0.0 から正式サポートされており、引き続き明示的な有効化が必要です。スタイルを追加するだけでは有効になりません。

## コンポーネント単位のインポート

段階的に導入するには、テーマ全体の代わりに個々のコンポーネントをインポートできます。

```css
@import '@rdlabo/ionic-theme-ios27/dist/css/utils/translucent';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-action-sheet';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-alert';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-button';
/* アプリで使う残りのコンポーネントをインポートします。 */
```

### 個別コンポーネントのダークモード

ダークモード対応のコンポーネントを個別にインポートする場合、Always・System・Class でセレクターが異なるため SCSS を使用します。

常時ダーク:

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

システム連動:

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

クラス方式:

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

## 操作できる使用例

[デモで描画結果を確認する](https://ionic-theme-ios27.rdlabo.dev/main/docs)。
