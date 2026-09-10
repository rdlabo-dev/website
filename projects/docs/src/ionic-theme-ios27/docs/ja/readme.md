---
title: 'はじめに'
code: []
scrollActiveLine: []
---

IonicアプリケーションにiOS27デザインシステムを適用するCSS/JSテーマライブラリです。

> [!IMPORTANT]
> 1.0.0まではRC版です。API、CSS変数、クラス、見た目、挙動はminor／patchリリースでも互換性のない変更が入る場合があります。安定した互換性の保証は1.0.0から開始します。iOS 26版は[別プロジェクト](/ionic-theme-ios26/)を参照してください。

<!-- rdlabo-docs-pick -->

<p>
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v0.1.0-1/screenshots/ios27-settings.png" width="32%" alt="iOS 27テーマ: Liquid Glass検索バーを備えたライトモードの設定画面" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v0.1.0-1/screenshots/ios27-settings-dark.png" width="32%" alt="iOS 27テーマ: ダークモードの設定画面" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v0.1.0-1/screenshots/ios27-library.png" width="32%" alt="iOS 27テーマ: Liquid Glassボタンとタブバーを備えたライブラリ画面" />
</p>

<!-- /rdlabo-docs-pick -->

DEMOはこちら: https://ionic-theme-ios27.rdlabo.dev/

## インストール

既存のIonicプロジェクトにインストールします。

```bash
npm install @rdlabo/ionic-theme-ios27
```

`@ionic/core` 8.8.1以降（Ionic 8／9）が必要です。

プロジェクトのメインCSSファイル（例: `src/styles.scss`）でテーマをインポートします。

```css
@import '@rdlabo/ionic-theme-ios27/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27.css';

/**
 * Keep Material Design mode unaffected by the iOS theme
 * when the same markup is used in both modes.
 * Note: This stylesheet is not included in `@rdlabo/ionic-theme-md3`.
 */
@import '@rdlabo/ionic-theme-ios27/dist/css/md-remove-ios-class-effect.css';

/**
 * If you will use the design of ion-item-group with ion-list on Android as well, import it.
 * More info: https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/using-ion-item-group
 * Note: This stylesheet is included in `@rdlabo/ionic-theme-md3`.
 * @import '@rdlabo/ionic-theme-ios27/dist/css/md-ion-list-inset.css';
 */

/*
 * Support Dark Mode
 * We support Ionic Dark Mode. More information is here: https://ionicframework.com/docs/theming/dark-mode
 * use Always:    @import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27-dark-always.css'
 * use System:    @import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27-dark-system.css'
 * use CSS Class: @import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27-dark-class.css'
 */
```

### アニメーションを設定する

iOS 27テーマだけをインストールした場合は、次のようにアニメーションを設定します。

```ts
import { isPlatform } from '@ionic/core'; // or @ionic/angular (Ionic 9), @ionic/angular/standalone (Ionic 8), @ionic/react, @ionic/vue
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';

// Angular
provideIonicAngular({
    ...
    navAnimation: isPlatform('ios') ? iosTransitionAnimation: undefined,
    popoverEnter: isPlatform('ios') ? popoverEnterAnimation: undefined,
    popoverLeave: isPlatform('ios') ? popoverLeaveAnimation: undefined,
});

// React
setupIonicReact({
    ...
    navAnimation: isPlatform('ios') ? iosTransitionAnimation: undefined,
    popoverEnter: isPlatform('ios') ? popoverEnterAnimation: undefined,
    popoverLeave: isPlatform('ios') ? popoverLeaveAnimation: undefined,
});

// Vue
createApp(App)
    .use(IonicVue, {
        ...
        navAnimation: isPlatform('ios') ? iosTransitionAnimation: undefined,
        popoverEnter: isPlatform('ios') ? popoverEnterAnimation: undefined,
        popoverLeave: isPlatform('ios') ? popoverLeaveAnimation: undefined,
})
```

### テーマの適用を確認する

iOSで確認してください。デスクトップでプレビューする場合は、既存のフレームワーク初期化設定で Ionic の mode を `ios` にしてください（例: `mode: 'ios'`）。

次のマークアップで inset のグループ化されたリストの見た目をプレビューできます。テーマが想定するリスト構造は [ion-item-groupの使用方法](/docs/using-ion-item-group) を参照してください。

```html
<ion-list mode="ios" inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

### オプション: iOS 27テーマとMD3テーマを併用する

同じアプリケーションでIonicの両モードをスタイルするには、MD3テーマをインストールします。

両テーマの現行リリースには、`@ionic/core` 8.8.1以降が必要です。

```bash
npm install @rdlabo/ionic-theme-md3
```

グローバルスタイルシートでSassを使っている場合は、次の順序でテーマを初期化します。

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/default-variables.scss' as ios27-vars;
@use '@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27.scss';
@use '@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class.scss';
@use '@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect.scss';
@use '@rdlabo/ionic-theme-md3/dist/css/default-variables.css' as md3-vars;
@use '@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css';
```

この例ではIonicのclassベースのダークモードを使います。グローバルスタイルシートでは、Angularの `@ionic/angular/css/palettes/dark.class.css` など、Ionic側の対応するダークパレットも読み込んでください。`dark-system` または `dark-always` を使う場合は、IonicのパレットとiOS 27テーマの両方で同じvariantを選びます。詳しくはIonicの[ダークモードのドキュメント](https://ionicframework.com/docs/theming/dark-mode)を参照してください。`ios27-vars` と `md3-vars` を明示することで、2つの変数モジュールが同じデフォルトnamespaceを使うことを防ぎます。

両テーマをインストールした場合は、両方のtransition実装を設定します。

```ts
import { isPlatform } from '@ionic/core'; // or @ionic/angular (Ionic 9), @ionic/angular/standalone (Ionic 8), @ionic/react, @ionic/vue
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';
import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';

// Angular
provideIonicAngular({
    ...
    navAnimation: isPlatform('ios') ? iosTransitionAnimation : mdTransitionAnimation,
    popoverEnter: isPlatform('ios') ? popoverEnterAnimation : undefined,
    popoverLeave: isPlatform('ios') ? popoverLeaveAnimation : undefined,
});

// React
setupIonicReact({
    ...
    navAnimation: isPlatform('ios') ? iosTransitionAnimation : mdTransitionAnimation,
    popoverEnter: isPlatform('ios') ? popoverEnterAnimation : undefined,
    popoverLeave: isPlatform('ios') ? popoverLeaveAnimation : undefined,
});

// Vue
createApp(App)
    .use(IonicVue, {
        ...
        navAnimation: isPlatform('ios') ? iosTransitionAnimation : mdTransitionAnimation,
        popoverEnter: isPlatform('ios') ? popoverEnterAnimation : undefined,
        popoverLeave: isPlatform('ios') ? popoverLeaveAnimation : undefined,
    });
```

## ドキュメント

- [ion-item-groupの使用方法](/docs/using-ion-item-group) — inset リストに必要なマークアップ。
- [特別なマークアップとクラス](/docs/special-markup) — テーマで使う任意のマークアップとutility class。
- [ESLint](/docs/eslint) — リスト構造を ESLint で整える。
- [機能](/docs/features) — CSS変数、Liquid Glass、選択的import、ダークモード。
- [実験的なアニメーション](/docs/experimental-animation) — タブバーと Searchable。
- [iOSテーマの切り替え](/docs/ios-adaptive) — iOS 26／27をブラウザ機能に応じて切り替える。
- [移行](/docs/migration) — major version更新時に必要な変更。
