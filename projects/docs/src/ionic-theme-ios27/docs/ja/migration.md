---
title: テーマの移行
---

# テーマの移行

## Native UI パッケージの分離

テーマのスタイルと通常のテーマ API のインポートは引き続き利用できます。このパッケージ経由でネイティブコントロールを使用していた場合、`/native` と `/vertical-bars` エントリーは削除されています。

| 以前のインポート | 置き換え先 |
| ----------------------------------------- | ------------------------------------------- |
| `@rdlabo/ionic-theme-ios27/native`        | `@rdlabo/capacitor-native-ui`               |
| `@rdlabo/ionic-theme-ios27/vertical-bars` | `@rdlabo/capacitor-native-ui/vertical-bars` |

ネイティブパッケージをアプリの直接依存に追加し、インポートを更新して Web アセットを再ビルドし、`npx cap sync ios` を実行します。1.2.1 の起動設定とネイティブプロジェクトの変更は [Native UI 移行ガイド](/capacitor-native-ui/docs/migration)に従ってください。テーマだけを使用するアプリにはネイティブの起動やプラグインの設定は不要です。

## 2.0 のデバイスレイアウト

標準セットアップの一部として、テーマと一緒に Foldable をインストールします。

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

従来のデバイスレイアウト API を Foldable の購読に置き換えます。

| 以前の API | 置き換え先 |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| `DeviceLayout`、`HingeStatus` | `@erkamyaman/capacitor-foldable` の `BarPlacement`、`FoldState`、`HingeStatus` |
| `getDeviceLayout()` | `Foldable.getBarPlacement()` と `Foldable.getFoldState()` |
| `deviceLayoutChange` | `barPlacementChange` と `foldStateChange` のリスナー |
| デバイスレイアウト監視の開始・停止 | `addListener()` で購読し、終了時に各リスナーを削除 |
| WebView の角丸半径の単発取得 | Native UI の `getWebViewMetrics()` |

テーマからインポートした `setVerticalBarsLayout` で配置を、`applyFoldStateClasses` で折りたたみ状態を適用します。変更の購読に加えて初期状態も取得してください。現在の設定は[デバイスレイアウトと分割ペイン](vertical-bars-layout.md#read-the-device-layout)および[レールへの投影](../../capacitor-native-ui/docs/vertical-bars.md#use-with-capacitor-foldable)を参照してください。パッケージをインストールするだけでは、デバイスイベントの購読や投影は有効になりません。

## iOS 26 テーマからの移行

`@rdlabo/ionic-theme-ios26` を使用するアプリでは、そのパッケージを維持して `@rdlabo/ionic-theme-ios27` を追加する移行を推奨します。[環境に応じたテーマ設定](adaptive-themes.md)は、ブラウザーの機能で iOS 27/26 のスタイルを選択し、古いブラウザーでは Ionic 標準の iOS 外観を維持します。

### 1. 新しいパッケージを追加する

iOS 26 パッケージを残して iOS 27 を追加します。新しいテーマには `@ionic/core` 8.8.1 以降（Ionic 8 または 9）が必要です。

```bash
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

### 2. スタイルを環境に応じて切り替える

グローバル Sass スタイルシートの無条件の iOS 26 インポートを、互いに排他的な 2 つの分岐へ置き換えます。この例はクラス方式のダークモードです。

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

対応する Ionic のダークパレットは維持します。システム連動または常時ダークモードでは、両方の `-dark-class` を対応するバリアントに置き換えます。`md-ion-list-inset` を使用する場合は各分岐内で対応パッケージのスタイルシートを読み込んでください。どちらの機能にも非対応のブラウザーでは Ionic 標準のスタイルを維持します。

### 3. アニメーションを切り替える

iOS 26 のアニメーションインポートを置き換え、同じブラウザー機能を条件に iOS 27 のアニメーションを有効にします。Ionic の初期化前にオプションを決定してください。

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

iOS 27 の画面遷移とポップオーバーのアニメーションを両世代のテーマで使用します。古いブラウザーは Ionic の既定値を維持します。この例は Angular ですが、React の `setupIonicReact` や Vue の `IonicVue` にも同じオプションを渡します。

### 4. カスタマイズを更新する

アプリのテーマ変数と適用除外クラスを改名します。例:

```diff
  ion-content {
-  --ios26-content-box-shadow-rgb: 0, 0, 0;
+  --ios-theme-content-box-shadow-rgb: 0, 0, 0;
  }

- <ion-button class="ios26-disabled">Standard Ionic button</ion-button>
+ <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

以前の名前は非推奨のフォールバックとして残ります。対応ブラウザーのライト・ダーク両モードで画面を確認してください。

### iOS 27 のみを使う

iOS 27 へ完全に切り替えるには、iOS 26 パッケージを削除してスタイルシートとアニメーションのインポートを置き換えます。スタイルシートの変更は次のとおりです。

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

アニメーションのインポートを `@rdlabo/ionic-theme-ios26` から `@rdlabo/ionic-theme-ios27` に変更します。既存の `isPlatform('ios')` 設定は維持できます。[iOS 27 のセットアップ](setup.md)を参照してください。無条件のインポートは Ionic の iOS モードを使うすべてのブラウザーに新しいスタイルを適用します。

## iOS 27 の命名

iOS 27 分岐または iOS 27 専用アプリでは `@rdlabo/ionic-theme-ios27` を使います。スタイルシートは `ionic-theme-ios27.scss` または `ionic-theme-ios27.css` と、`-dark-always`、`-dark-system`、`-dark-class` の各バリアントです。環境に応じた設定の iOS 26 分岐では iOS 26 のファイル名を維持してください。

| カスタマイズ | 現在の名前 | 以前の名前の動作 |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| CSS 変数 | `--ios-theme-*`（例: `--ios-theme-content-box-shadow-rgb`） | 対応する `--ios26-*` は非推奨のフォールバックとして残ります。両方を指定した場合は現在の名前が優先されます。 |
| テーマ適用除外クラス | `ios-theme-disabled` | `ios26-disabled` は非推奨の別名として残ります。適宜既存のマークアップを移行してください。 |

新しいカスタマイズにはバージョンに依存しない名前を使用してください。

現在の名前は[特別なマークアップとクラス](special-markup.md)と[既定の変数](../src/styles/default-variables.scss)を参照してください。

以前の移行メモは [iOS 26 移行ガイド](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/migration)に残しています。

## 送信ボタンの外観

送信ボタンは各 Ionic カラーの標準のコントラスト値と、iOS 27 の方向性のある縁の表現を使用するようになりました。テーマ固有の明るさの変数は削除してください。

```diff
  :root {
-  --ion-color-primary-brightness-rgb: 130, 255, 255;
-  --ion-color-primary-brightness: #96feff;
  }
```
