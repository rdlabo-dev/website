---
title: "Cordova のセットアップ"
sourceRevision: "632cc17d693c442a94e91c595e10edb6c77e6f53158df62f69dca027ee1a7e0f"
---

# Cordova のセットアップ

Ionic と Native UI を使う Cordova アプリには、`@webview-native-ui/cordova-plugin` を使用します。このプラグインは、ネイティブ連携へ接続済みのテーマ JavaScript、型、CSS を含みます。バンドラーのエイリアスや、`@rdlabo/ionic-theme-ios27`、`@rdlabo/capacitor-native-ui` の別途インストールは不要です。

このドキュメントの既定のネイティブホストは Capacitor です。この任意のガイドでは、Cordova を使うバンドル済み Ionic アプリのパッケージと起動処理の違いを説明します。共通のマークアップ、スタイル、ヘルパーの使用方法は既存の機能ガイドを参照してください。

## 1. Cordova プラグインをインストールする

Cordova アプリのルートで実行します。

```sh
cordova plugin add @webview-native-ui/cordova-plugin@0.1.1
```

準備済みのネイティブと JavaScript のアセットをインストールし、npm の依存関係を保存します。Web バンドラーが別の npm プロジェクトにある場合は、そちらにも同じバージョンをインストールします。

```sh
npm install @webview-native-ui/cordova-plugin@0.1.1
```

Cordova とバンドラーが `package.json` を共有している場合、2回目のインストールは不要です。既存の Ionic の依存関係は維持します。Cordova、SwiftPM、Xcode、Android の設定は、プラグインの[要件](https://github.com/webview-native-ui/cordova-plugin#requirements)を参照してください。ネイティブ描画には対応する iOS バージョンが必要です。標準の Android コントロールは Web 表示を維持します。

`@erkamyaman/capacitor-foldable` は Capacitor プラグインであり、この Cordova セットアップには不要です。他のテーマガイドにある Capacitor 固有のデバイスレイアウトの配線は、それらの API の Cordova 対応を保証しません。

## 2. 同梱テーマのスタイルを読み込む

Ionic の基本スタイルを維持し、その後にグローバルスタイルシートへ次を追加します。既存のダークパレットは置き換え、複数のパレットを読み込まないでください。

```css
@import '@ionic/core/css/palettes/dark.system.css';
@import '@webview-native-ui/cordova-plugin/theme/css/default-variables.css';
@import '@webview-native-ui/cordova-plugin/theme/css/ionic-theme-ios27.css';
@import '@webview-native-ui/cordova-plugin/theme/css/md-remove-ios-class-effect.css';
@import '@webview-native-ui/cordova-plugin/theme/css/ionic-theme-ios27-dark-system.css';
```

手動のダークモードでは、代わりに `dark.class.css` と `ionic-theme-ios27-dark-class.css` を使い、`html` の `ion-palette-dark` を切り替えます。Ionic とテーマのバリアントを揃えてください。

## 3. Ionic のアニメーションを設定する

Cordova パッケージからアニメーションをインポートし、アプリを描画する前に既存の Ionic 初期化へ渡します。

```ts
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@webview-native-ui/cordova-plugin/theme';

const ionicConfig = {
  mode: 'ios' as const,
  navAnimation: iosTransitionAnimation,
  popoverEnter: popoverEnterAnimation,
  popoverLeave: popoverLeaveAnimation,
};
```

[Ionic のアニメーションを設定する](setup.md#3-configure-ionic-animations)に従い、フレームワークの既存の初期化処理を使います。Ionic を2回初期化しないでください。Android で Material Design モードを維持する場合は、これらの設定を iOS の設定にだけ適用します。`attachTabBarSearchable` などの他のヘルパーも `/theme` から利用できますが、インポートだけでは動作を自動で適用しません。

## 4. Cordova とアプリの準備後に Native UI を起動する

Cordova のエントリー HTML に `<script src="cordova.js"></script>` を残します。起動中にデバイス準備完了のリスナーを登録し、フレームワークが `ion-app` をマウントしてから Native UI を有効にします。

```ts
import { enableNativeUI } from '@webview-native-ui/cordova-plugin';

const deviceReady = new Promise<void>((resolve) => {
  document.addEventListener('deviceready', () => resolve(), { once: true });
});

export async function startNativeUI(appMounted: Promise<void>) {
  await Promise.all([deviceReady, appMounted]);
  return enableNativeUI();
}
```

アプリのマウントライフサイクルから `appMounted` を渡し、`startNativeUI()` を1回呼んで返されたハンドルを保持します。アプリが Native UI の使用を恒久的に終了するときに `await handle.destroy()` を呼びます。ページごとに新しいランタイムを作ったり、この npm ベースの起動と並行して `window.NativeUI.enableNativeUI()` も呼んだりしないでください。ブラウザーのプレビューは Cordova の `deviceready` を発火しません。この起動経路は Cordova ビルド専用にし、Web テーマは通常のブラウザー用エントリーからプレビューしてください。

Web アセットを Cordova アプリの `www` ディレクトリへビルドし、ネイティブアプリの準備と再ビルドを行います。例:

```sh
cordova prepare ios
cordova build ios
```

Android の要件を満たしてビルドする場合は `android` を使います。Cordova に `npx cap sync` は使わないでください。iOS のアダプターはスクロールビューの自動 inset を無効にします。[プラグインガイド](https://github.com/webview-native-ui/cordova-plugin#start-native-ui)に従って、ページの CSS でセーフエリアの余白を適用してください。

## 共通のテーマガイドを使う

[マークアップとクラス](special-markup.md)、[インセットリスト](using-ion-item-group.md)、[CSS 変数とコンポーネントのスタイル](features.md)、[アニメーションヘルパー](animation.md)へ進みます。これらの例は既定で独立したテーマパッケージを使います。Cordova プラグインに同梱されたテーマのバージョンでは、次の置き換えを行ってください。

| 標準ドキュメント | Cordova での対応 |
| --- | --- |
| `@rdlabo/ionic-theme-ios27` からの JavaScript インポート | `@webview-native-ui/cordova-plugin/theme` |
| `@rdlabo/ionic-theme-ios27/dist/css/*` からの CSS インポート | `@webview-native-ui/cordova-plugin/theme/css/*`（`.css` 拡張子を含める） |
| `@rdlabo/capacitor-native-ui` からの Native UI 起動 | Cordova パッケージのルート。上記の起動ライフサイクルを使用 |
| `@rdlabo/ionic-theme-ios27/src/styles/*` からの Sass インポート | Cordova パッケージには含まれません。コンパイル済み CSS と CSS 変数を使用 |

[環境に応じたテーマ](adaptive-themes.md)のガイドは、独立したテーマの Sass ソースを使うため、そのまま Cordova に適用できません。[Vertical Bars のレイアウト](vertical-bars-layout.md)の CSS レイアウトの概念は共通ですが、Capacitor Foldable の配線にはホスト固有の連携が必要です。Capacitor のネイティブセットアップコマンドをコピーせず、Cordova プラグインの対応範囲に従ってください。

## 既存のテーマアプリをこの連携へ移行する

すべてのテーマ JavaScript インポートを `@rdlabo/ionic-theme-ios27` から `@webview-native-ui/cordova-plugin/theme` へ、CSS インポートを `@rdlabo/ionic-theme-ios27/dist/css/*` から `@webview-native-ui/cordova-plugin/theme/css/*` へ置き換えます。Native UI の起動は Cordova パッケージのルートからインポートします。アプリで不要になったら、古い連携用エイリアスと元のテーマ／Capacitor の依存関係を削除します。コンポーネントのマークアップ、バインディング、ハンドラーは維持します。

ヘルパーと CSS は同じ同梱テーマバージョンのものを使います。Cordova 0.1.1 はテーマ 2.1.0 を含みます。新しい独立テーマをインストールしても、このコピーは更新されません。インストール済み Cordova パッケージの `shared/ORIGIN.json` でテーマのバージョンと Core のリビジョンを確認し、新しい同梱ソースを取得するには Cordova パッケージを更新してください。

## 対応する動作と検証

主な対応ホストは引き続き Capacitor です。Cordova の比較検証は iOS 27.2 と Android API 35 の Ionic 8.8.19 で行い、コントロール、タブ、オーバーレイ、テーマ連携、ダークモード、停止／再起動を対象にしました。検索は両ホストでテーマの Web フォールバックを使いました。これらの検証は、ネイティブ検索の同等性、フレームワークルーターの遷移全般、対話的な戻るジェスチャーを保証しません。このリポジトリの Ionic 9 Capacitor デモは Cordova の受け入れテストではありません。

テーマのヘルパーがネイティブコントロールと連携しない場合は、すべてのテーマインポートが `/theme` を使うこと、Native UI ランタイムを1つだけ起動していること、Web バンドルとネイティブプラグインが同じバージョンであることを確認します。ブリッジ、インストール、同梱連携の問題は [cordova-plugin](https://github.com/webview-native-ui/cordova-plugin/issues) へ報告してください。共通テーマのスタイルやアニメーションの修正は、このリポジトリで扱います。
