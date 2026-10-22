---
title: iOS 27 テーマをセットアップする
---

# iOS 27 テーマをセットアップする

4 ステップで既存の Ionic アプリに iOS 27 の外観を適用します。このガイドは iOS 27 テーマ単体とシステム連動のダークモードを使用します。ブラウザーに応じた iOS 26/27 の切り替えや MD3 には[環境に応じたテーマ](adaptive-themes.md)を使用してください。

## 始める前に

Ionic `>=8.8.1 <10` の既存の Ionic Angular、React、Vue アプリを使用します。Ionic の基本 CSS のインポートは維持してください。ブラウザー専用アプリにネイティブの Capacitor プロジェクトは不要です。

## 1. テーマと Foldable をインストールする

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

デバイス状態の標準連携には [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) を使用します。配置と折りたたみ状態の API でアプリがレイアウトの適応を制御できます。インストール後、初期値と変更イベントを接続してください。デバイスレイアウトの設定は[レイアウトガイド](vertical-bars-layout.md)に従ってください。

## 2. スタイルを読み込む

グローバルスタイルシートで Ionic の基本スタイルの後に追加します。Ionic のダークパレットをすでに読み込んでいる場合は、複数を併用せず置き換えてください。

```css
@import '@ionic/core/css/palettes/dark.system.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/md-remove-ios-class-effect.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27-dark-system.css';
```

### ダークモードの組み合わせを 1 つ選ぶ

対応する Ionic パレットとテーマのバリアントを 1 組使用します。以下のパスはそれぞれ `@ionic/core/css/palettes/` と `@rdlabo/ionic-theme-ios27/dist/css/` からの相対パスです。

| モード | Ionic パレット | テーマのスタイルシート | 有効化 |
| ---------------------- | ----------------- | ----------------------------------- | ----------------------------------------------- |
| システム連動（上の例） | `dark.system.css` | `ionic-theme-ios27-dark-system.css` | システムの外観。 |
| 手動 | `dark.class.css` | `ionic-theme-ios27-dark-class.css` | ドキュメントルートの `ion-palette-dark` を切り替えます。 |
| 常時ダーク | `dark.always.css` | `ionic-theme-ios27-dark-always.css` | 常に有効。 |

Native UI も有効にする場合、これらのスタイルがライト・ダークの外観マーカーを提供します。Web とネイティブの外観を揃えるため、Ionic パレットとテーマのバリアントの組み合わせを維持してください。解決順序とレールの共有動作は[ネイティブ外観の継承](../../capacitor-native-ui/docs/appearance.md)を参照してください。

## 3. Ionic のアニメーションを設定する

アプリを描画する前に、既存の Ionic 初期化で次のオプションを設定します。

```ts
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';

const ionicConfig = {
  mode: 'ios' as const,
  navAnimation: iosTransitionAnimation,
  popoverEnter: popoverEnterAnimation,
  popoverLeave: popoverLeaveAnimation,
};
```

この例はデスクトップブラウザーでもテーマを表示するため、明示的に `ios` モードを使用しています。アプリで使用中の初期化処理へ `ionicConfig` を渡します。

| フレームワーク | オプションの適用 |
| ----------------- | ---------------------------------------------------------------------------- |
| Angular / Ionic 8 | `@ionic/angular/standalone` からインポートした `provideIonicAngular(ionicConfig)` |
| Angular / Ionic 9 | `@ionic/angular` からインポートした `provideIonicAngular(ionicConfig)` |
| React | `@ionic/react` からインポートした `setupIonicReact(ionicConfig)` |
| Vue | `@ionic/vue` の `IonicVue` を用いる `app.use(IonicVue, ionicConfig)` |

既存のオプションに統合し、Ionic を二度初期化しないでください。Android で Material Design モードを維持するには、プラットフォームによるモード選択を残し、iOS 設定にだけアニメーションのオプションを適用します。完全な例は[環境に応じたテーマ](adaptive-themes.md)を参照してください。

## 4. 最初の画面をプレビューする

アプリの通常の開発サーバーを起動して既存のページを開きます。その `ion-content` 内に、フレームワークの構文に合わせて次のマークアップを追加します。

```html
<ion-list inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

角が丸いインセットグループが表示されます。システムの外観をライト・ダークで切り替え、ページ間を移動してテーマの遷移を確認してください。リスト構造は [ion-item-group の使い方](using-ion-item-group.md)を参照してください。

| 症状 | 確認事項 |
| ----------------------------------- | ------------------------------------------------------------- |
| デスクトップで Material Design のコントロールになる | 既存の Ionic 初期化に `mode: 'ios'` を設定します。 |
| コントロールにスタイルが適用されない | Ionic の基本スタイルの後にテーマのスタイルシートをグローバルに読み込みます。 |
| ライトとダークの背景が混在する | 対応する Ionic パレットとテーマのダークモードを 1 組使用します。 |
| 画面遷移が標準のまま | Ionic の初期化前にアニメーションのオプションを渡します。 |

## 次のステップ

- [スタイルとコンポーネントをカスタマイズする](features.md)。
- Capacitor iOS アプリの対応コントロールに [Native UI を追加する](add-native-ui.md)。テーマのインストールだけではネイティブコントロールは有効になりません。
- [既存のテーマに Vertical Bars を追加する](../../capacitor-native-ui/docs/ionic-vertical-bars.md)。
- [既存のアプリを移行する](migration.md)。
