---
title: 'はじめに'
code: []
scrollActiveLine: []
---

Ionic のコンポーネント API と色の意味を維持しながら、Android Settings の外観を参考にする Ionic アプリ向け CSS/JS テーマです。

<!-- rdlabo-docs-pick -->

![Android 17 で既定の Ionic パレットを使う Ionic MD3 テーマ](https://raw.githubusercontent.com/webview-native-ui/ionic-theme-md3/v9.2.0/screenshots/md3.png)

<!-- /rdlabo-docs-pick -->

DEMOはこちら: https://ionic-theme-md3.rdlabo.dev/

`@rdlabo/ionic-theme-ios27` との互換性を考慮して設計しているため、1つのマークアップツリーで Ionic の両モードをスタイル設定できます。

## インストール

既存のIonicプロジェクトにインストールします。

```bash
npm install @rdlabo/ionic-theme-md3
```

Note: **@ionic/core@ < 8.8.0 を使う場合は**、@rdlabo/ionic-theme-md3@1.0.2 を使ってください。

テーマをプロジェクトのメイン CSS ファイル（例: `src/styles.scss`）で、**Ionic のコアスタイルの後に**インポートします。この順序にすると、アプリの `--ion-font-family` のオーバーライドを維持しながら、MD の既定フォントを適用できます。

```css
@import '@rdlabo/ionic-theme-md3/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css';
```

### アニメーションを設定する

MD3テーマだけをインストールした場合は、次のようにアニメーションを設定します。

```ts
import { isPlatform } from '@ionic/core'; // または @ionic/angular (Ionic 9), @ionic/angular/standalone (Ionic 8), @ionic/react, @ionic/vue
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

### Android Settings の外観

テーマは Ionic の色の意味とアプリのフォント指定を維持します。標準トグルにアイコンはありません。MD の既定フォントは、端末にローカルの Google Sans Flex があれば使用し、なければ標準のフォールバックを使います。テーマの CSS に含まれるため、フォントの初期化コードや Capacitor プラグインは不要です。戻るアイコンは引き続き Ionic が管理します。

インストール、フォントのフォールバック、コンポーネントの上書きは [Android Settings の外観](/docs/android-settings)を参照してください。既存ユーザーは、ツールバー、リスト、トグルの寸法変更について [9.2.0 への移行](/docs/migration#migrating-to-9.2.0%3A-android-settings-alignment)を確認してください。

### 任意: MD3 と iOS 27 テーマを併用する

同じアプリで Ionic の両モードをスタイル設定するには、iOS 27 テーマをインストールします。

両テーマの現行リリースには、`@ionic/core` 8.8.1以降が必要です。アプリケーションが8.8.0以前の場合は、この設定を使う前にIonicをアップグレードしてください。

```bash
npm install @rdlabo/ionic-theme-ios27
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

この例は Ionic のクラスベースのダークモードを使います。グローバルスタイルシートでは、Angular の `@ionic/angular/css/palettes/dark.class.css` など、対応する Ionic のダークパレットも読み込んでください。`dark-system` や `dark-always` を使う場合は、Ionic のパレットと iOS 27 テーマで同じバリアントを選びます。Ionic の[ダークモードのドキュメント](https://ionicframework.com/docs/theming/dark-mode)を参照してください。明示的な `ios27-vars` と `md3-vars` の名前空間により、2つの変数モジュールが同じ既定の名前空間を使うことを防ぎます。

両テーマをインストールした場合は、両方のtransition実装を設定します。

```ts
import { isPlatform } from '@ionic/core'; // または @ionic/angular (Ionic 9), @ionic/angular/standalone (Ionic 8), @ionic/react, @ionic/vue
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

- [Android の動的な色](/docs/dynamic-colors) — 任意の Material You 設定、ライト・ダークの外観、ライフサイクル、ロールの対応付け。
- [カラーシステム](/docs/color-system) — Ionic パレットの既定値、任意の Material ロール、コンポーネントへの色の割り当て。
- [Android Settings の外観](/docs/android-settings) — 既定の寸法、CSS の既定フォント、Ionic のカスタマイズ。
- [ion-item-group の使用](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/using-ion-item-group) — iOS 27 と MD3 で共有するインセットリストのマークアップ。
- [特別なマークアップ](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/special-markup) — デモで使う任意のコンポーネントの組み合わせ。
- [ESLint](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/eslint) — ESLint ルールによるリスト構造の検査。
- [移行](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/migration) — テーマのマークアップ更新時に必要な変更。

## 関連プロジェクト

より包括的なMaterial Design 3実装が必要な場合は、次も参考になるかもしれません:

- **[md3-for-ionic](https://github.com/danielkleebinder/md3-for-ionic)** by danielkleebinder

> **注意:** このテーマは Ionic の設計方針と `@rdlabo/ionic-theme-ios27` との互換性を目的としており、MD3 の厳密で完全な再現を目指すものではありません。
