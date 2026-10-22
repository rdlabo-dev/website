---
title: テーマに Native UI を追加する
---

# テーマに Native UI を追加する

`@rdlabo/ionic-theme-ios27` を利用しているアプリに、テーマのスタイル、Web コンテンツ、ルーティングを維持したまま iOS のネイティブコントロールを追加できます。非対応のコントロール、ブラウザー、Android では Web の外観を維持します。

テーマをまだ設定していない場合は[テーマのセットアップ](setup.md)から始めてください。別の Web 外観を使用する場合は [Native UI のセットアップ](../../capacitor-native-ui/docs/setup.md)に進んでください。

ネイティブコントロールと Web DOM・ハンドラーの接続については、[投影の仕組み](../../capacitor-native-ui/README.md#how-projection-works)を参照してください。

## 1. ネイティブプラグインをインストールする

このガイドは iOS プロジェクトを持つ Capacitor 8 アプリを想定します。Web のみのテーマ利用には Capacitor は不要ですが、iOS のネイティブコントロールを追加するには先にネイティブプロジェクトが必要です。対応する Ionic、iOS、Xcode のバージョンは [Native UI の要件](../../capacitor-native-ui/README.md#requirements)を参照してください。

テーマと Native UI は同時に更新してバージョンを揃え、Foldable はアプリの独立した依存関係としてインストールします。

```sh
npm install @rdlabo/ionic-theme-ios27 @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

既存のテーマのスタイルシートは維持してください。Capacitor の標準のプラグイン検出には直接依存が必要です。テーマ経由でインストールされるだけではネイティブプラグインは登録されません。

## 2. ネイティブコントロールを有効にする

アプリの起動時に、`ion-app` のマウント後、一度だけ Shell を有効にします。

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const shell = await enableNativeUI();
```

アプリの所有コンポーネントを破棄するときに `await shell.destroy()` を呼び出します。ページごとに Shell を作成しないでください。[Angular・React・Vue のアプリルートの例](../../capacitor-native-ui/docs/setup.md#place-startup-in-your-frameworks-app-root)に沿って起動とクリーンアップを接続してください。

テーマパッケージの `navAnimation: iosTransitionAnimation` は維持します。画面遷移や戻るジェスチャーでのネイティブコントロールの調整を含むため、再度ラップしないでください。独自のアニメーションでは[遷移アダプターの手順](../../capacitor-native-ui/docs/migration.md#native-ui-transition-adapter)を参照してください。

プラグインのインストールやテーマのアニメーション設定だけでは、ネイティブコントロールは有効になりません。アプリが上記の起動呼び出しで有効にします。

## 3. iOS を同期して実行する

Web アセットをビルドしてから実行します。

```sh
npx cap sync ios
```

対応する iOS デバイスまたはシミュレーターでアプリを実行します。対象の固定コントロールがネイティブ表示になり、既存のハンドラーが呼び出されることを確認してください。前後の画面に遷移し、ブラウザーでも Web フォールバックを確認します。対応する iOS ですべて Web 表示のままなら、直接依存、起動呼び出し、同期、ネイティブの再ビルドを確認してください。対象のマークアップとフォールバック動作は[対応コントロール](../../capacitor-native-ui/docs/native-ui.md#supported-markup)を参照してください。Web コンテンツと投影されないコントロールのためにテーマのスタイルは維持します。

## 任意: Vertical Bars

サイドレールには [Vertical Bars の標準セットアップ](../../capacitor-native-ui/docs/ionic-vertical-bars.md)を使用します。レイアウトのスタイルシートを読み込み、インストール済みの Foldable プラグインの初期配置とイベントを接続します。Shell はレールのランタイムを含むため、追加の起動呼び出しは不要です。標準の起動設定は水平・レール双方のコントロールを選択するため、既存の Native UI にレールを加える場合も維持してください。自動投影をレールだけに限定したい場合のみ `enableNativeUI({ controls: 'verticalOnly' })` を使用します。[設定オプション](../../capacitor-native-ui/docs/configuration.md)を参照してください。

## 既存のネイティブ連携を更新する

テーマパッケージからネイティブ API をインポートしていた場合は、[ネイティブインポートの移行](../../capacitor-native-ui/docs/migration.md#2-replace-native-imports)と[ネイティブプロジェクトの移行](../../capacitor-native-ui/docs/migration.md#3-sync-the-native-project)に従ってください。通常のテーマのインポートとスタイルシートは維持します。
