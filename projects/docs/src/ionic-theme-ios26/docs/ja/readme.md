---
title: 'はじめに'
code: []
scrollActiveLine: []
---

IonicアプリケーションにiOS26デザインシステムを適用するCSS/JSテーマライブラリです。

![iOS 26テーマを適用したIonic画面。Liquid Glassのタブバー、リスト、コントロール](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios26/v9.0.0/screenshots/ios26.png)

DEMOはこちら: https://ionic-theme-ios26.rdlabo.dev/

## 概要

このライブラリは、IonicアプリケーションにiOS26デザインシステムをもたらすCSS/JSファイルを提供します。Ionicコンポーネントの見た目を、最新のiOS26デザインガイドラインに合わせて更新します。

Android Design（Material Design 3）テーマも作成中です。ぜひチェックしてください！

👉️[rdlabo-dev/ionic-theme-md3](https://github.com/rdlabo-dev/ionic-theme-md3)


## クイックスタート

[インストール](#インストール) のあと、テーマ CSS をインポートします。詳細は下のインストールです。

## インストール

これはIonicプロジェクトを拡張するためのCSSテーマです。単体では動作しないため、Ionic Frameworkと一緒に使ってください。

```bash
npm install @rdlabo/ionic-theme-ios26
```

Note: **@ionic/core@ < 8.8.1 を使う場合は**、@rdlabo/ionic-theme-ios26@2.2.1 を使ってください。

プロジェクトのメインCSSファイル（例: `src/styles.scss`）でテーマをインポートします。

```css
@import '@rdlabo/ionic-theme-ios26/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26.css';

/**
 * This file is to eliminate the impact of class name changes for iOS26.
 * For example, `ion-buttons ion-button[fill=default]` is not normally implemented, but may be required for iOS26.
 * This file is to eliminate such effects.
 * Note: This stylesheet is not included in `@rdlabo/ionic-theme-md3`.
 */
@import '@rdlabo/ionic-theme-ios26/dist/css/md-remove-ios-class-effect.css';

/**
 * If you will use the design of ion-item-group with ion-list on Android as well, import it.
 * More info: https://github.com/rdlabo-dev/ionic-theme-ios26/blob/v9.0.0/docs/using-ion-item-group.md
 * Note: This stylesheet is included in `@rdlabo/ionic-theme-md3`.
 * @import '@rdlabo/ionic-theme-ios26/dist/css/md-ion-list-inset.css';
 */

/*
 * Support Dark Mode
 * We support Ionic Dark Mode. More information is here: https://ionicframework.com/docs/theming/dark-mode
 * use Always:    @import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-always.css'
 * use System:    @import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-system.css'
 * use CSS Class: @import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-class.css'
 */
```

### オプション: iOS 26テーマとMD3テーマを併用する

同じアプリケーションでIonicの両モードをスタイルするには、MD3テーマをインストールします。

両テーマの現行リリースには、`@ionic/core` 8.8.1以降が必要です。

```bash
npm install @rdlabo/ionic-theme-md3
```

グローバルスタイルシートでSassを使っている場合は、次の順序でテーマを初期化します。

```scss
@use '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss' as ios26-vars;
@use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26.scss';
@use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class.scss';
@use '@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect.scss';
@use '@rdlabo/ionic-theme-md3/dist/css/default-variables.css' as md3-vars;
@use '@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css';
```

この例ではIonicのclassベースのダークモードを使います。グローバルスタイルシートでは、Angularの `@ionic/angular/css/palettes/dark.class.css` など、Ionic側の対応するダークパレットも読み込んでください。`dark-system` または `dark-always` を使う場合は、IonicのパレットとiOS 26テーマの両方で同じvariantを選びます。詳しくはIonicの[ダークモードのドキュメント](https://ionicframework.com/docs/theming/dark-mode)を参照してください。`ios26-vars` と `md3-vars` を明示することで、2つの変数モジュールが同じデフォルトnamespaceを使うことを防ぎます。

両テーマをインストールした場合は、両方のtransition実装を設定します。

```ts
import { isPlatform } from '@ionic/core'; // or @ionic/angular (Ionic 9), @ionic/angular/standalone (Ionic 8), @ionic/react, @ionic/vue
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios26';
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

iOS 26テーマだけをインストールした場合は、次のようにアニメーションを設定します。

```ts
import { isPlatform } from '@ionic/core'; // or @ionic/angular (Ionic 9), @ionic/angular/standalone (Ionic 8), @ionic/react, @ionic/vue
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios26';

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


## ドキュメント

上の [インストール](#インストール) から始め、inset リストでは [ion-item-groupの使用方法](/docs/using-ion-item-group) を見てください。

- [ion-item-groupの使用方法](/docs/using-ion-item-group) — inset リストに必要なマークアップ。
- [特別なマークアップとクラス](/docs/special-markup) — テーマで使う任意のマークアップとutility class。
- [機能](/docs/features) — CSS変数、Liquid Glass、選択的import、ダークモード。
- [実験的なアニメーション](/docs/experimental-animation) — タブバーと Searchable。
- [iOS 18](/docs/ios-18) — iOS 26 だけでテーマを読む。
- [移行](/docs/migration) — major version更新時に必要な変更。
