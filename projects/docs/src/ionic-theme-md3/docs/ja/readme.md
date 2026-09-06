---
title: 'はじめに'
code: []
scrollActiveLine: []
---

IonicアプリケーションにMaterial Design 3デザインシステムを適用するCSS/JSテーマライブラリです。

<!-- rdlabo-docs-pick -->
![Material Design 3テーマを適用したIonic画面。更新されたコンポーネントとナビゲーション](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-md3/v9.1.0/screenshots/md3.png)
<!-- /rdlabo-docs-pick -->

DEMOはこちら: https://ionic-theme-md3.rdlabo.dev/

`@rdlabo/ionic-theme-ios26` との互換性を重視し、単一のマークアップで Ionic の両モードをスタイルできるようにしています。

## インストール

既存のIonicプロジェクトにインストールします。

```bash
npm install @rdlabo/ionic-theme-md3
```

Note: **@ionic/core@ < 8.8.0 を使う場合は**、@rdlabo/ionic-theme-md3@1.0.2 を使ってください。

プロジェクトのメインCSSファイル（例: `src/styles.scss`）でテーマをインポートします。

```css
@import '@rdlabo/ionic-theme-md3/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css';
```

### アニメーションを設定する

MD3テーマだけをインストールした場合は、次のようにアニメーションを設定します。

```ts
import { isPlatform } from '@ionic/core'; // or @ionic/angular (Ionic 9), @ionic/angular/standalone (Ionic 8), @ionic/react, @ionic/vue
import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';

// Angular
provideIonicAngular({
    ...
    navAnimation: isPlatform('ios') ? undefined: mdTransitionAnimation,
});

// React
setupIonicReact({
    ...
    navAnimation: isPlatform('ios') ? undefined: mdTransitionAnimation,
});

// Vue
createApp(App)
    .use(IonicVue, {
        ...
        navAnimation: isPlatform('ios') ? undefined: mdTransitionAnimation,
})
```

### テーマの適用を確認する

Androidで確認してください。デスクトップでプレビューする場合は、既存のフレームワーク初期化設定で Ionic の mode を `md` にしてください（例: `mode: 'md'`）。

次のマークアップで inset のグループ化されたリストの見た目をプレビューできます。テーマが想定するリスト構造は [ion-item-groupの使用方法](/docs/using-ion-item-group) を参照してください。

```html
<ion-list mode="md" inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

### オプション: MD3テーマとiOS 26テーマを併用する

同じアプリケーションでIonicの両モードをスタイルするには、iOS 26テーマをインストールします。

両テーマの現行リリースには、`@ionic/core` 8.8.1以降が必要です。アプリケーションが8.8.0以前の場合は、この設定を使う前にIonicをアップグレードしてください。

```bash
npm install @rdlabo/ionic-theme-ios26
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


## ドキュメント

- [ion-item-groupの使用方法](/docs/using-ion-item-group) — iOS 26とMD3で共有するinset listのマークアップ。
- [特別なマークアップ](/docs/special-markup) — demoで使う任意のコンポーネント構造。
- [ESLint](/docs/eslint) — リスト構造を ESLint で整える。
- [移行](/docs/migration) — テーマのマークアップ更新時に必要な変更。

## 関連プロジェクト

より包括的なMaterial Design 3実装が必要な場合は、次も参考になるかもしれません:

- **[md3-for-ionic](https://github.com/danielkleebinder/md3-for-ionic)** by danielkleebinder

> **Note:** このテーマは Ionic の設計方針と `@rdlabo/ionic-theme-ios26` との互換性を目的に作られており、厳密で完全な MD3 再現を意図したものではありません。
