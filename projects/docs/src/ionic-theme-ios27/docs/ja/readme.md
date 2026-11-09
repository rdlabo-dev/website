---
title: はじめに
---

# Ionic Theme iOS27

`npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable` でインストールします。1.x を使用する場合は [v1.2.1 のガイド](https://github.com/webview-native-ui/ionic-theme-ios27/tree/ios27-v1.2.1)を参照してください。
Ionic アプリの Web UI に iOS 27 の Liquid Glass とアニメーションを適用するテーマです。Capacitor iOS アプリでは、対応するコントロールに Native UI を追加できます。2.0.0 から正式サポートされています。

**[Ionic 9 デモ](https://ionic-theme-ios27.rdlabo.dev/) · [セットアップガイド](docs/setup.md)**

<!-- rdlabo-docs-pick -->

<p>
  <img src="https://raw.githubusercontent.com/webview-native-ui/ionic-theme-ios27/c70beb9d1e5b39de696b2b2c47a3d9bc5ffcdfbe/screenshots/ios27-settings.png" width="32%" alt="iOS 27 テーマ: Liquid Glass 検索バーを備えたライトモードの設定画面" />
  <img src="https://raw.githubusercontent.com/webview-native-ui/ionic-theme-ios27/c70beb9d1e5b39de696b2b2c47a3d9bc5ffcdfbe/screenshots/ios27-settings-dark.png" width="32%" alt="iOS 27 テーマ: ダークモードの設定画面" />
  <img src="https://raw.githubusercontent.com/webview-native-ui/ionic-theme-ios27/c70beb9d1e5b39de696b2b2c47a3d9bc5ffcdfbe/screenshots/ios27-library.png" width="32%" alt="iOS 27 テーマ: Liquid Glass ボタンとタブバーを備えたライブラリ画面" />
</p>

<!-- /rdlabo-docs-pick -->

## 目的から選ぶ

| 目的 | ガイド |
| --- | --- |
| 既存の Ionic アプリの外観を整える | [はじめに](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/setup) |
| iOS 26/27 のスタイルを切り替え、必要に応じて MD3 を使う | [環境に応じたテーマ](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/adaptive-themes) |
| Capacitor アプリに iOS のネイティブコントロールを追加する | [Native UI の追加](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/add-native-ui) |
| 既存のテーマを維持して Ionic にサイドレールを追加する | [Vertical Bars の導入手順](https://docs.rdlabo.dev/projects/capacitor-native-ui/docs/ionic-vertical-bars) |
| 任意: Cordova でテーマと Native UI を使う | [Cordova のセットアップ](/docs/cordova) |
| 既存の環境を更新する | [移行](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/migration) |

## はじめに

標準ガイドでは、独立したテーマパッケージを使い、既定のネイティブホストに Capacitor を使用します。ブラウザーでテーマだけを使う構成も引き続き対応しています。Cordova アプリでは、同梱テーマとホスト固有の起動処理を説明する任意の [Cordova ガイド](/docs/cordova)を参照してください。

デバイスレイアウトの標準連携には、Erkam Yaman 氏による優れたコミュニティプラグイン [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) を使用します。折りたたみ状態、ヒンジの形状、バーの配置と変更イベントをアプリに公開し、レイアウトの応答をアプリ側で制御できます。Foldable はデバイス情報の取得、テーマは Web レイアウトのヘルパー、Native UI はコントロールの投影を担当します。利用するパッケージと一緒にインストールし、アプリでイベントを接続してください。

[4 ステップのセットアップガイド](docs/setup.md)に沿って、テーマのインストール、スタイルの読み込み、アニメーションの設定、最初の画面のプレビューを行います。宣言されている Ionic の互換性範囲は `>=8.8.1 <10` で、Angular、React、Vue を含みます。自動 E2E 検証は Ionic 9 を対象としています。ブラウザーで利用する場合、ネイティブの Capacitor プロジェクトは不要です。

テーマはツールバー、タブ、リスト、ボタン、検索、オーバーレイの外観をライト・ダーク両モードで整えます。ネイティブコントロールは有効化しません。Web テーマの動作を確認した後、必要に応じて [Native UI を追加](docs/add-native-ui.md)できます。

## アプリをカスタマイズする

- [機能](docs/features.md): CSS 変数、Liquid Glass、コンポーネント単位のインポート。
- [特別なマークアップとクラス](docs/special-markup.md): 明示的に有効化するコンポーネントの動作。
- [ion-item-group の使い方](docs/using-ion-item-group.md): インセットリストのマークアップ。
- [アニメーション](docs/animation.md): タブ、セグメント、検索のエフェクト。
- [ESLint](docs/eslint.md): 非対応のリスト構造を検出。
- [Vertical Bars のレイアウト](docs/vertical-bars-layout.md): 余白、RTL、デバイス上の配置、折りたたみ状態、分割ペイン。

## リポジトリの責任範囲

Capacitor プラグインは [webview-native-ui/capacitor-plugin](https://github.com/webview-native-ui/capacitor-plugin) で保守されています。このリポジトリは Ionic テーマ、統合デモ、ブラウザーのスクリーンショット、シミュレーターの統合テストを管理します。デモは npm から `@rdlabo/capacitor-native-ui` をインストールします。テーマのリリースでプラグインを公開したり、プラグインのバージョンを変更したりすることはありません。

[Cordova プラグイン](https://github.com/webview-native-ui/cordova-plugin)は別に保守されています。連携用インポートを Cordova に接続した、このテーマの固定版を配布します。共通のテーマ修正はこのリポジトリで行い、Cordova 側は後続のプラグインリリースで固定したテーマのバージョンを更新します。以下の Capacitor デモとリリース候補の検証では、Cordova は検証しません。

未公開のプラグインアーカイブを実際のデモで検証するには、次を実行します。

```sh
npm run test:native-candidate -- /absolute/path/rdlabo-capacitor-native-ui-VERSION.tgz --e2e
```

分離された一時チェックアウトを作成し、マニフェストとロックファイルは変更しません。Playwright のシャードを1つ実行するには、`--e2e` とともに `--shard=1/2` を指定します。スイート全体を検証するには、すべてのシャードを実行してください。各シャードでも、パッケージ検査、ユニットテスト、本番ビルドを実行します。ネイティブ UI、検索、エッジのシミュレータースイートには `--simulator=UDID` を追加します。診断情報と一時デモは、出力されたパスに保持されます。プラグイン単体のユニットテストとネイティブライブラリのテストは、プラグインのリポジトリにあります。その CI では、各候補アーカイブをこのリポジトリの main ブランチで検証します。

## 保守

変更がなく最新の `main` から `npm run release` を実行して、ルートのテーマパッケージをリリースします。`ios27-v…` タグのワークフローはテーマだけを公開し、プレリリースには `next`、安定版には `latest` を使います。

テーマとプラグインのバージョンは独立しています。独立した `@rdlabo/ionic-theme-ios27` パッケージでは、テーマとアプリが1つのプラグインインスタンスを共有するため、Capacitor Native UI が必須の peer dependency です。npm 7 以降はテーマだけを使うアプリにも自動でインストールします。他のパッケージマネージャーでは、必須の peer dependency をインストールしてください。ネイティブコントロールを使うアプリでは、Capacitor が検出できるようプラグインを直接依存としても宣言する必要があります。公開済みの npm バージョンは上書きできません。
