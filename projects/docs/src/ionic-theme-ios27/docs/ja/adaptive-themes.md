---
title: iOS 26、iOS 27、MD3 のテーマを使う
---

# iOS 26、iOS 27、MD3 のテーマを使う

ブラウザーの機能に応じて iOS スタイルを選択したい場合や、Material Design モードで MD3 を使いたい場合の任意の設定です。iOS 27 の外観だけを使う場合は[テーマのセットアップ](setup.md)を参照してください。この手順は、そのガイドのスタイルシートとアニメーションの設定を置き換えます。

## 1. テーマをインストールする

既存の Ionic 8 または 9 アプリ（`@ionic/core` 8.8.1 以降）に両方のテーマをインストールします。

```bash
npm install @rdlabo/ionic-theme-ios26 @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

## 2. スタイルを読み込む

グローバル Sass スタイルシート（例: `src/styles.scss`）で、ブラウザーの機能に応じてスタイルを読み込みます。

```scss
@use 'sass:meta';

@supports (overflow-anchor: auto) {
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect');
}

@supports (text-wrap: pretty) and (not (overflow-anchor: auto)) {
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect');
}
```

`meta.load-css()` の呼び出しでコンパイル時に `Can't find stylesheet to import.` と表示される場合は、Sass が `node_modules` を参照できるようにします。Angular では、`angular.json` のアプリのビルド `options` に次を追加してください。

```json
"stylePreprocessorOptions": {
  "includePaths": ["node_modules"]
}
```

または、`meta.load-css()` を記述した Sass ファイルからインストール済みパッケージへの相対パスを指定します。たとえば `src/styles.scss` からは `../node_modules/@rdlabo/ionic-theme-ios27/src/styles/default-variables` です。ファイルの位置に合わせて `../` を調整し、各テーマのインポートにも同じ変更を適用してください。

### どのスタイルが選ばれるか

判定対象は iOS のバージョンではなく、ブラウザーの機能です。

| Ionic の `ios` モードで利用できるブラウザー機能 | 結果 |
| ---------------------------------------------------- | ------------------------------- |
| `overflow-anchor: auto` | iOS 27 テーマ。 |
| `text-wrap: pretty` に対応し、`overflow-anchor: auto` に非対応 | iOS 26 テーマ。 |
| いずれの機能にも非対応 | Ionic 標準の iOS 外観。 |

この例はクラスによるダークモードを使用します。[対応する Ionic のダークパレット](https://ionicframework.com/docs/theming/dark-mode)も読み込んでください。システム連動または常時ダークモードでは、両方の `-dark-class` インポートを対応するバリアントに変更します。[ダークモードの組み合わせ](setup.md#choose-one-dark-mode-pair)を参照してください。`md-remove-ios-class-effect` は iOS 専用クラスが Material Design モードに影響するのを防ぎます。

## 3. アニメーションを設定する

iOS 26/27 の両方のテーマで、iOS 27 の画面遷移とポップオーバーのアニメーションを使用します。Ionic の初期化前にオプションを決定してください。Angular の例です。

```ts
import { isPlatform, provideIonicAngular } from '@ionic/angular/standalone'; // Ionic 8
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';

function loadIOSAnimations() {
  if (typeof CSS === 'undefined') return {};
  if (!CSS.supports('overflow-anchor: auto') && !CSS.supports('text-wrap: pretty')) return {};

  return {
    navAnimation: iosTransitionAnimation,
    popoverEnter: popoverEnterAnimation,
    popoverLeave: popoverLeaveAnimation,
  };
}

provideIonicAngular(isPlatform('ios') ? loadIOSAnimations() : {});
```

Ionic 9 Angular では、`isPlatform` と `provideIonicAngular` を `@ionic/angular` からインポートします。React と Vue では、初期化時に同じオプションを `setupIonicReact` または `IonicVue` に渡します。サーバーレンダリングを行うアプリでは、ブラウザー側の初期化時に選択してください。

画面遷移の角丸半径の既定値は `0` です。ネイティブアプリでは WebView の計測後に更新できます。

```ts
import { setConfig } from '@rdlabo/ionic-theme-ios27';

setConfig({ radius });
```

## 4. テーマを確認する

iOS でテストしてください。デスクトップでプレビューする場合は、既存のフレームワーク初期化設定で Ionic のモードを `ios` に設定します（例: `mode: 'ios'`）。

次のマークアップで、グループ化したインセットリストを確認できます。テーマが想定するリスト構造は [ion-item-group の使い方](using-ion-item-group.md)を参照してください。

```html
<ion-list mode="ios" inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

## MD3 テーマと併用する

対応する Safari では iOS 27、ひとつ前の世代の Safari では iOS 26 を使用し、Ionic の Material Design モードでは MD3 を使用するには、3 つのテーマをインストールします。すべて `@ionic/core` 8.8.1 以降が必要です。

```bash
npm install @rdlabo/ionic-theme-ios26 @rdlabo/ionic-theme-ios27 @rdlabo/ionic-theme-md3 @erkamyaman/capacitor-foldable
```

2 つの iOS テーマには手順 2 と同じブラウザー機能の条件を付け、MD3 は無条件で読み込みます。すべてに `meta.load-css()` を使用すると、生成される CSS でも MD3 のスタイルが条件付きの iOS スタイルより後に配置されます。

```scss
@use 'sass:meta';

@supports (overflow-anchor: auto) {
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect');
}

@supports (text-wrap: pretty) and (not (overflow-anchor: auto)) {
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect');
}

@include meta.load-css('@rdlabo/ionic-theme-md3/dist/css/default-variables.css');
@include meta.load-css('@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css');
```

iOS のスタイルは Ionic の `ios` モードに、MD3 は `md` モードに適用されます。各 iOS 分岐の `md-remove-ios-class-effect` が iOS 専用ユーティリティークラスの MD モードへの影響を防ぎます。MD3 はインセットリストのスタイルを含むため、この構成では iOS パッケージの任意の `md-ion-list-inset` スタイルシートを読み込まないでください。

対応する Ionic のダークパレットも読み込みます。この例はクラス方式です。システム連動または常時ダークモードでは、Ionic と両方の iOS テーマに対応するバリアントを選んでください。

両世代の iOS テーマでは iOS 27 の遷移を維持し、Material Design モードでは MD3 の遷移を選びます。上のアニメーション設定を次のように拡張します。

```ts
import { isPlatform, provideIonicAngular } from '@ionic/angular/standalone'; // Ionic 8
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';
import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';

function loadAnimations() {
  if (!isPlatform('ios')) return { navAnimation: mdTransitionAnimation };
  if (typeof CSS === 'undefined') return {};
  if (!CSS.supports('overflow-anchor: auto') && !CSS.supports('text-wrap: pretty')) return {};

  return {
    navAnimation: iosTransitionAnimation,
    popoverEnter: popoverEnterAnimation,
    popoverLeave: popoverLeaveAnimation,
  };
}

provideIonicAngular(loadAnimations());
```

Ionic 9 Angular では、`isPlatform` と `provideIonicAngular` を `@ionic/angular` からインポートします。React と Vue では同じ戻り値のオプションを `setupIonicReact` または `IonicVue` に渡します。Sass が `meta.load-css()` 内のパッケージを解決できない場合は、前述の `stylePreprocessorOptions.includePaths` または相対パスを設定してください。
