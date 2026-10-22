---
title: はじめに
---

# Ionic Theme iOS27

`npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable` でインストールします。1.x を使用する場合は [v1.2.1 のガイド](https://github.com/rdlabo-dev/ionic-theme-ios27/tree/ios27-v1.2.1)を参照してください。
Ionic アプリの Web UI に iOS 27 の Liquid Glass とアニメーションを適用するテーマです。Capacitor iOS アプリでは、対応するコントロールに Native UI を追加できます。2.0.0 から正式サポートされています。

**[Ionic 9 デモ](https://ionic-theme-ios27.rdlabo.dev/) · [Ionic 8 デモ](https://ionic8-theme-ios27.rdlabo.dev/) · [セットアップガイド](docs/setup.md)**

<!-- rdlabo-docs-pick -->

<p>
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v2.0.0/screenshots/ios27-settings.png" width="32%" alt="iOS 27 テーマ: Liquid Glass 検索バーを備えたライトモードの設定画面" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v2.0.0/screenshots/ios27-settings-dark.png" width="32%" alt="iOS 27 テーマ: ダークモードの設定画面" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v2.0.0/screenshots/ios27-library.png" width="32%" alt="iOS 27 テーマ: Liquid Glass ボタンとタブバーを備えたライブラリ画面" />
</p>

<!-- /rdlabo-docs-pick -->

## 目的から選ぶ

| 目的 | ガイド |
| ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| 既存の Ionic アプリの外観を整える | [はじめに](docs/setup.md) |
| iOS 26/27 のスタイルを切り替え、必要に応じて MD3 を使う | [環境に応じたテーマ](docs/adaptive-themes.md) |
| テーマ設定後に iOS のネイティブコントロールを追加する | [Native UI の追加](docs/add-native-ui.md) |
| 既存のテーマを維持して Ionic にサイドレールを追加する | [Vertical Bars の導入手順](../capacitor-native-ui/docs/ionic-vertical-bars.md) |
| 既存の環境を更新する | [移行](docs/migration.md) |

## はじめに

デバイスレイアウトの標準連携には、Erkam Yaman 氏による優れたコミュニティプラグイン [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) を使用します。折りたたみ状態、ヒンジの形状、バーの配置と変更イベントをアプリに公開し、レイアウトの応答をアプリ側で制御できます。Foldable はデバイス情報の取得、テーマは Web レイアウトのヘルパー、Native UI はコントロールの投影を担当します。利用するパッケージと一緒にインストールし、アプリでイベントを接続してください。

[4 ステップのセットアップガイド](docs/setup.md)に沿って、テーマのインストール、スタイルの読み込み、アニメーションの設定、最初の画面のプレビューを行います。Ionic 8 または 9 のうち 8.8.1 以降に対応し、Angular、React、Vue で利用できます。ブラウザーで利用する場合、ネイティブの Capacitor プロジェクトは不要です。

テーマはツールバー、タブ、リスト、ボタン、検索、オーバーレイの外観をライト・ダーク両モードで整えます。ネイティブコントロールは有効化しません。Web テーマの動作を確認した後、必要に応じて [Native UI を追加](docs/add-native-ui.md)できます。

## アプリをカスタマイズする

- [機能](docs/features.md): CSS 変数、Liquid Glass、コンポーネント単位のインポート。
- [特別なマークアップとクラス](docs/special-markup.md): 明示的に有効化するコンポーネントの動作。
- [ion-item-group の使い方](docs/using-ion-item-group.md): インセットリストのマークアップ。
- [アニメーション](docs/animation.md): タブ、セグメント、検索のエフェクト。
- [ESLint](docs/eslint.md): 非対応のリスト構造を検出。
- [Vertical Bars のレイアウト](docs/vertical-bars-layout.md): 余白、RTL、デバイス上の配置、折りたたみ状態、分割ペイン。
