---
title: はじめに
code: []
scrollActiveLine: []
---

IonicアプリにiOS 27のLiquid Glassとアニメーションを適用するテーマです。Capacitor iOSアプリでは、対応する操作部品に実験的なNative UI Shellを選択できます。

**[Ionic 9デモ](https://ionic-theme-ios27.rdlabo.dev/) · [Ionic 8デモ](https://ionic8-theme-ios27.rdlabo.dev/) · [1.0.0リリースノート](https://github.com/rdlabo-dev/ionic-theme-ios27/releases/tag/ios27-v1.0.0)**

<!-- rdlabo-docs-pick -->

<p>
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.0.1/screenshots/ios27-settings.png" width="32%" alt="iOS 27テーマ: Liquid Glass検索バーを備えたライトモードの設定画面" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.0.1/screenshots/ios27-settings-dark.png" width="32%" alt="iOS 27テーマ: ダークモードの設定画面" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.0.1/screenshots/ios27-library.png" width="32%" alt="iOS 27テーマ: Liquid Glassボタンとタブバーを備えたライブラリ画面" />
</p>

<!-- /rdlabo-docs-pick -->

## 機能

### IonicにiOS 27の外観を適用する

Liquid Glass、ツールバー、タブ、リスト、ボタン、検索、オーバーレイ、画面遷移をiOS 27の外観に整えます。ライト・ダーク両モードに対応します。[Ionic 9デモ](https://ionic-theme-ios27.rdlabo.dev/)と[Ionic 8デモ](https://ionic8-theme-ios27.rdlabo.dev/)で確認できます。

### IonicのUIをネイティブ表示する

任意の実験的な[Native UI Shell](/docs/native-ui-shell)は、Capacitor iOS上で対応する固定コントロールを既存のIonicマークアップから読み取り、UIKitで描画します。テキスト、対応するアイコン、選択状態を反映し、ネイティブ側の操作は元のIonicコンポーネントへ戻します。ページ内容とルーティングはWebViewに残り、非対応のレイアウトはWebで表示します。

**iOS 27のタブドラッグ:** 同じLibrary画面をNative UI Shellオフ（Web）とオン（UIKit）で比較しました。下段はタブバー周辺を拡大しています。

[![Native UI Shellのオン・オフで同じタブをドラッグした比較](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.0.1/screenshots/native-ui-shell-drag/comparison.png)](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v1.0.1/screenshots/native-ui-shell-drag/comparison.png)

### 利用者の端末に合わせる

iOS 26とiOS 27の両テーマを導入すると、ブラウザの機能に応じて各世代のスタイルを選択できます。OSのバージョン番号は読み取りません。どちらの条件も満たさない古いブラウザはIonic標準のiOS外観を維持します。両テーマを使う場合も画面遷移にはiOS 27のアニメーションを使用します。Capacitor iOSのNative UI Shellは実行中のOSの材質に従います。

## 導入

既存のIonic 8または9アプリで、両テーマをインストールします（~@ionic/core~ 8.8.1以降が必要です）。

```bash
npm install @rdlabo/ionic-theme-ios26 @rdlabo/ionic-theme-ios27
```

グローバルSass（例: ~src/styles.scss~）で、ブラウザの機能に応じてスタイルを読み込みます。

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

~meta.load-css()~ で ~Can't find stylesheet to import.~ と表示された場合は、Sassから ~node_modules~ を参照できるようにします。Angularでは ~angular.json~ のアプリのビルド ~options~ に次を追加してください。

```json
"stylePreprocessorOptions": {
  "includePaths": ["node_modules"]
}
```

または、~meta.load-css()~ を書いたSassファイルからインストール済みパッケージへの相対パスを使います。例えば ~src/styles.scss~ なら ~../node_modules/@rdlabo/ionic-theme-ios27/src/styles/default-variables~ です。ファイルの位置に合わせて ~../~ の数を調整し、各テーマの読み込み先にも同じ変更を適用してください。

これはOS判定ではなくブラウザの機能判定です。どちらにも対応しないブラウザはIonic標準のiOS外観を維持します。例ではclassベースのダークモードを使うため、[Ionic側の対応するダークパレット](https://ionicframework.com/docs/theming/dark-mode)も読み込んでください。system／alwaysの場合は両方の ~-dark-class~ を対応するvariantに置き換えます。~md-remove-ios-class-effect~ は、同じマークアップをMaterial Designモードでも使う場合のiOS固有クラスの影響を防ぎます。

### アニメーションを設定する

どちらの世代のスタイルでも、iOS 27の画面遷移とpopoverアニメーションを使います。Ionicの初期化前に設定してください。Angularの例です。

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

Ionic 9のAngularでは ~isPlatform~ と ~provideIonicAngular~ を ~@ionic/angular~ からimportします。ReactとVueでは同じオプションを初期化時に ~setupIonicReact~ または ~IonicVue~ へ渡します。SSRではブラウザ初期化時に判定してください。

画面遷移の角丸半径の既定値は ~0~ です。ネイティブアプリではWebViewを計測した後に変更できます。

```ts
import { setConfig } from '@rdlabo/ionic-theme-ios27';

setConfig({ radius });
```

### テーマを確認する

iOS上で確認してください。デスクトップでプレビューする場合は、既存のIonic初期化設定で ~mode: 'ios'~ を指定します。inset listは[~ion-item-group~ を使う構造](/docs/using-ion-item-group)が必要です。

```html
<ion-list mode="ios" inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

## オプション構成

### iOS 27テーマだけを使う

~@rdlabo/ionic-theme-ios27~ だけをインストールし、グローバルスタイルシートで無条件に読み込みます。

```css
@import '@rdlabo/ionic-theme-ios27/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/md-remove-ios-class-effect.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27-dark-class.css';
```

最後のimportはclassベースのダークモード用です。別の方式では ~-dark-system~ または ~-dark-always~ と、対応するIonicパレットを選びます。アニメーションは上の例からブラウザ機能判定を外し、~isPlatform('ios')~ で設定します。

### その他のオプション

- **ネイティブの操作部品:** [Native UI Shellの導入ガイド](/docs/native-ui-shell)を参照してください。CSSのimportだけでは有効になりません。
- **Androidのinset list:** 必要に応じて、各 ~@supports~ 内で対応するパッケージの ~md-ion-list-inset~ を読み込みます。~@rdlabo/ionic-theme-md3~ には既に含まれています。

### MD3テーマと併用する

iOS 27対応SafariではiOS 27テーマ、その直前のSafari世代ではiOS 26テーマを使い、IonicがMaterial Designモードで動作するときはMD3テーマを使うには、3つのテーマをすべてインストールします。いずれも`@ionic/core` 8.8.1以降が必要です。

```bash
npm install @rdlabo/ionic-theme-ios26 @rdlabo/ionic-theme-ios27 @rdlabo/ionic-theme-md3
```

2つのiOSテーマにはデフォルト構成と同じブラウザ機能判定を適用し、MD3は無条件に読み込みます。すべて`meta.load-css()`で読み込むことで、生成されるCSSでも条件付きのiOSスタイルより後にMD3スタイルが配置されます。

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

iOSスタイルはIonicの`ios`モードだけに適用され、MD3は`md`モードに適用されます。各iOS分岐の`md-remove-ios-class-effect`は、iOS専用のユーティリティクラスがMDモードへ影響するのを防ぎます。MD3にはinset listのスタイルが含まれるため、この構成ではiOSパッケージの任意の`md-ion-list-inset`を読み込まないでください。

Ionicの対応するダークパレットも読み込んでください。この例はclassベースのダークモードです。systemまたはalways-darkを使う場合は、Ionicと両方のiOSテーマで同じ方式を選びます。

両方のiOSテーマ世代ではiOS 27の画面遷移を使い、Material DesignモードではMD3の画面遷移を選択します。上記のアニメーション設定を次のように拡張します。

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

Ionic 9のAngularでは、`isPlatform`と`provideIonicAngular`を`@ionic/angular`からimportします。ReactとVueでは、同じ戻り値を`setupIonicReact`または`IonicVue`へ渡せます。Sassが`meta.load-css()`内のパッケージを解決できない場合は、Get startedに記載した`stylePreprocessorOptions.includePaths`または相対パスの設定を使ってください。

## ドキュメント

- [ion-item-groupの使用方法](/docs/using-ion-item-group) — inset listに必要なマークアップ。
- [特別なマークアップとクラス](/docs/special-markup) — 任意のマークアップとクラス。
- [ESLint](/docs/eslint) — リスト構造を検査するルール。
- [機能](/docs/features) — CSS変数、Liquid Glass、選択的import、ダークモード。
- [Native UI Shell（実験的機能）](/docs/native-ui-shell) — 対応するIonicコントロールをUIKitで表示。
- [アニメーション](/docs/animation) — タブ、セグメント、検索の効果。
- [iOS 26からの移行](/docs/migration) — 既存アプリの更新手順と差分。
- [iOS 26の移行履歴](/ionic-theme-ios26/docs/migration) — 前のパッケージの移行案内。
