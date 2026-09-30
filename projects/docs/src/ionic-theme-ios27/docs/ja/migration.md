---
title: 移行
---

## Native UI Shellの画面遷移アダプター

`withNativeUIShellTransition()` を使うと、既存のIonic画面遷移アニメーションを維持しながらNative UI Shellの部品を連携できます。

- `@rdlabo/ionic-theme-ios27` から `iosTransitionAnimation` をimportしている場合は、[本パッケージのアニメーション設定](/docs/iphone-duo-with-original-theme#本パッケージのiosアニメーションを使う)を維持します。設定変更は不要です。内部で共通アダプターを使うため、追加のラップは不要です。
- `navAnimation` を設定せずIonic標準のアニメーションを使っている場合は、[Ionicの標準アニメーションを維持する](/docs/iphone-duo-with-original-theme#ionicの標準アニメーションを維持する)を参照してください。遷移modeに応じてIonic標準のiOSまたはMD builderを選ぶ例を掲載しています。
- Native UI Shellまたは独立したVertical Control Areaで独自の画面遷移を使う場合、Ionic設定時に既存のbuilderをラップします。

```diff
+ import { withNativeUIShellTransition } from '@rdlabo/ionic-theme-ios27/vertical-bars';

  const ionicConfig = {
-   navAnimation: existingTransition,
+   navAnimation: withNativeUIShellTransition(existingTransition),
  };
```

Ionicの初期化前に、既存設定へこのオプションを統合します。アダプターはアニメーションの効果、duration、easingを維持しながら、ネイティブ部品の退避、スワイプの進捗、キャンセルを連携します。既存テーマのスタイルシートのimportと、Native UI ShellまたはVertical Control Areaの起動処理は維持します。

アダプターは画面遷移だけに使い、modalやpopoverのアニメーションは維持します。Ionicが遷移後に破棄するため、builderは遷移ごとに新しい `Animation` を作成してください。部品登録とアニメーションなしの遷移には、引き続きlifecycle eventを使います。独自builderが水平の戻るボタンを別途アニメーションする場合、`.ios-theme-vertical-bars` が有効な間はその効果を対象から外してください。

導入手順と対応範囲は[画面遷移アニメーションを接続する](/docs/iphone-duo-with-original-theme#3.-画面遷移アニメーションを接続する)を参照してください。

## iOS 26テーマからの移行

既存アプリが `@rdlabo/ionic-theme-ios26` を使っている場合は、iOS 26を残して `@rdlabo/ionic-theme-ios27` を追加する方法を推奨します。[READMEの導入手順](/docs/readme#導入)では、ブラウザの機能に応じてiOS 26／27のスタイルを切り替え、どちらにも対応しないブラウザではIonic標準のiOS外観を維持します。

### 1. 新しいパッケージを追加する

iOS 26パッケージを残したままiOS 27を追加します。新テーマには `@ionic/core` 8.8.1以降（Ionic 8／9）が必要です。

```bash
npm install @rdlabo/ionic-theme-ios27
```

### 2. スタイルを切り替える

グローバルSassで無条件に読み込んでいたiOS 26のスタイルを、排他的な2つの条件に置き換えます。classベースのダークモードの例です。

```diff
+ @use 'sass:meta';
+
- @use '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect.scss';
+ @supports (overflow-anchor: auto) {
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/default-variables');
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27');
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class');
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect');
+ }
+
+ @supports (text-wrap: pretty) and (not (overflow-anchor: auto)) {
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/default-variables');
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26');
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class');
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect');
+ }
```

Ionic側の対応するダークパレットも維持してください。system／alwaysの場合は両方の `-dark-class` を対応するvariantに変えます。`md-ion-list-inset` を使う場合は各条件内で対応するパッケージから読み込みます。どちらの条件も満たさないブラウザはIonic標準のスタイルを維持します。

### 3. アニメーションを切り替える

iOS 26からのimportをiOS 27に変更し、スタイルと同じブラウザ機能で有効化します。Ionicの初期化前に設定してください。

```diff
- import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios26';
+ import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';
+
+ function loadIOSAnimations() {
+  if (typeof CSS === 'undefined') return {};
+  if (!CSS.supports('overflow-anchor: auto') && !CSS.supports('text-wrap: pretty')) return {};
+
+  return {
+    navAnimation: iosTransitionAnimation,
+    popoverEnter: popoverEnterAnimation,
+    popoverLeave: popoverLeaveAnimation,
+  };
+ }

  provideIonicAngular({
-  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
-  popoverEnter: isPlatform('ios') ? popoverEnterAnimation : undefined,
-  popoverLeave: isPlatform('ios') ? popoverLeaveAnimation : undefined,
+  ...(isPlatform('ios') ? loadIOSAnimations() : {}),
  });
```

両方の世代でiOS 27の画面遷移とpopoverアニメーションを使います。古いブラウザはIonic標準のアニメーションを維持します。例はAngularです。Reactでは `setupIonicReact`、Vueでは `IonicVue` に同じオプションを渡します。

### 4. カスタマイズ名を更新する

アプリで使っているテーマ変数と除外クラスを更新します。

```diff
  ion-content {
-  --ios26-content-box-shadow-rgb: 0, 0, 0;
+  --ios-theme-content-box-shadow-rgb: 0, 0, 0;
  }

- <ion-button class="ios26-disabled">Standard Ionic button</ion-button>
+ <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

旧名はdeprecatedのフォールバックとして残ります。対応ブラウザでライト・ダーク両モードの画面を確認してください。

### iOS 27だけに切り替える場合

iOS 26パッケージを削除し、スタイルシートとアニメーションのimportをiOS 27に変更します。スタイルの差分は次のとおりです。

```diff
- @use '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/default-variables.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect.scss';
```

アニメーションのimport元も `@rdlabo/ionic-theme-ios26` から `@rdlabo/ionic-theme-ios27` に変更します。既存の `isPlatform('ios')` 設定はそのまま使えます。[iOS 27単体の導入手順](/docs/readme#ios-27テーマだけを使う)も参照してください。無条件のimportではIonic iOSモードを使う全ブラウザに新しいスタイルが適用されます。

## iOS 27の命名

iOS 27の条件内、またはiOS 27だけを使うアプリでは `@rdlabo/ionic-theme-ios27` を読み込みます。スタイルシート名は `ionic-theme-ios27.scss` または `ionic-theme-ios27.css` です。`dark-always`、`dark-system`、`dark-class` のvariantも同様です。併用構成のiOS 26側では旧パッケージのスタイルシート名を維持します。

CSS変数にはバージョンに依存しない `--ios-theme-*` を使います。`--ios26-*` はdeprecatedのフォールバックとして使え、両方ある場合は新名が優先されます。例えば `--ios26-content-box-shadow-rgb` を `--ios-theme-content-box-shadow-rgb` に変更します。

テーマを除外するときは `ios-theme-disabled` を使います。`ios26-disabled` はdeprecatedの互換名として残ります。

現在の名称は[特別なマークアップとクラス](/docs/special-markup)と[デフォルト変数](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v1.2.0/src/styles/default-variables.scss)を参照してください。以前の移行案内は[iOS 26の移行ガイド](/ionic-theme-ios26/docs/migration)にあります。

## 送信ボタンの外観

送信ボタンはIonicの各色の標準コントラスト値と、iOS 27の方向性を持つ縁取りを使います。テーマ専用のbrightness変数を削除してください。

```diff
  :root {
-  --ion-color-primary-brightness-rgb: 130, 255, 255;
-  --ion-color-primary-brightness: #96feff;
  }
```
