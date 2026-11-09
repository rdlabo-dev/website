---
title: はじめに
---
# Capacitor Native UI

アプリの状態、ルーティング、ハンドラーをWebViewに維持しながら、対応するWebコントロールをiOS上のUIKitとSwiftUIで描画します。既存のIonicマークアップや明示的に指定したHTMLボタンを使えます。独自のSwiftUIやAndroid Composeのコンテンツは、実験的なアプリ内拡張で追加できます。

Native UIは明示的に有効化する機能で、2.0.0から正式にサポートされています。Android、ブラウザ、古いiOS、および未対応のコントロールでは、標準コントロールはWeb表示を維持します。Androidでは実験的なアプリ内Compose拡張を利用できます。アプリのスタイルとレイアウトはそのまま使え、iOSテーマは任意です。

## 投影の仕組み

**投影**とは、Webコントロールを別の形で表示することです。アプリは元のDOM要素、状態、イベントハンドラーを維持します。プラグインは対応するラベル、アイコン、選択・無効状態、位置と寸法を読み取り、描画したコントロールを投影元の要素に関連付けます。ページ全体をネイティブ画面に変換したり、アプリの別コピーを実行したりするわけではありません。

| Web側の投影元 | 投影後の表示 |
| --- | --- |
| Android の Material You の色を取得する | [Android の動的な配色](/docs/dynamic-colors) |
| 対応するIonicボタン、タブ、セグメント | 対応するiOS上のネイティブUIKit／SwiftUIコントロール |
| 明示的に指定したHTMLボタンと戻るボタン | 対応するiOS上のネイティブボタン |
| Vertical Barsに配置された、条件を満たすコントロール | 利用可能なシステムレール内のSwiftUIコントロール。それ以外はWebレール表示 |
| アプリ内拡張のDOM要素 | 要素から読み取ったpropsを使って、アプリが登録したSwiftUIまたはComposeコンテンツを表示 |

投影中も元の要素は**DOM内に残ります**。バインディングとハンドラーも接続されたままです。ネイティブ表示が受け付けられると、ランタイムは投影元を視覚的に隠し、直接のポインター操作を防ぎ、Webアクセシビリティからも隠すことで、操作可能なコピーが2つ存在しないようにします。要素への投影では投影元のレイアウト領域が維持されます。レール用の余白はアプリまたはテーマが確保します。WebレールもアダプターのWeb表示を使い、Ionicのレイアウト・クローン、または `webHost` 内のHTMLプロキシボタンで表示します。

たとえば、投影された保存ボタンをタップすると、元のWebボタンが作動します。既存のハンドラーが保存とアプリ状態の更新を行い、対応するDOMの変更が投影先に反映されます。タブなどの操作も投影元のアダプターを経由します。ネイティブ側の状態を別管理せず、引き続き投影元を更新してください。DOM変更を伴わずにreaderの値が変わる場合は `markForCheck()` を使います。

投影が変更するのは表示です。任意のHTMLやCSSをネイティブビューに変換するものではありません。ネイティブコントロールは対応するデータとスタイルを使用するため、独自のWeb表示がそのまま再現されるとは限りません。投影元を削除または無効化すると、それ以降の有効な操作を防ぎます。投影が利用できない場合や停止した場合、ランタイムは非表示状態を解除し、投影元はWeb表示または利用可能なWebレールへ戻ります。アプリ自身の非表示・無効状態は引き続き適用されます。

Native の所有権は、アニメーションや画像の有無とは独立して、ソースとその投影コンテキストに従います。投影が引き続き適格である限り、Modal の表示、ドラッグ、サイズ変更、画像の復元によって、受け付け済みのソースが Web に戻ることはありません。明示的な Web への引き渡し、未対応または拒否された投影、ランタイム障害、ソースまたはコンテキストの終了によって所有権を解放します。無効なボタンも Native が所有する同じコントロールのままで、入力が無効になります。

操作を遮断する Web オーバーレイでは、ネイティブのボタン、セグメント、FAB、タブバーの準備済み画像をバックドロップの下に残せます。画像はキャプチャしたネイティブの外観を保持し、ネイティブ更新とまとめられた視覚的変更の後に準備されます。Liquid Glass の縁のハイライトなど、プラットフォームのキャプチャ結果はライブの合成表示と異なる場合があり、マテリアルをピクセル単位で同一に再現する保証はありません。タッチ中は準備を停止し、表示時はキャプチャやブリッジの応答を待たず、最後に完成した画像を使います。画像がなくても、受け付け済みの Native ソースを Web へ戻すことはありません。コントロールを保持するネイティブポップオーバーは、ネイティブ表示を維持します。移動、復元、適用除外については[ハンドオフの規則](https://docs.rdlabo.dev/projects/capacitor-native-ui/docs/appearance#temporary-images-beneath-web-overlays)を参照してください。この機能を有効にするにはネイティブアプリを再ビルドしてください。古いネイティブバイナリは従来の表示経路を維持します。

## 作りたいものから選ぶ

| 目的 | はじめに読むガイド |
| --- | --- |
| 既存のIonicコントロールをネイティブ表示する | [Ionicの設定](/docs/setup) |
| Ionicを使わずネイティブボタンを利用する | [HTMLの設定](/docs/framework-independent) |
| 既存テーマを維持してIonicにサイドレールを追加する | [Vertical Barsの導入手順](/docs/ionic-vertical-bars) |
| Ionicを使わずサイドレールを追加する | [HTMLレールの設定](/docs/framework-independent) |
| iOS 27テーマを使用中のアプリにネイティブコントロールを追加する | [テーマへのNative UIの追加](/ionic-theme-ios27/docs/add-native-ui) |
| 独自のSwiftUIまたはAndroid Composeコンテンツを表示する | [アプリ内拡張（実験的）](/docs/native-ui-extensions) |

## npmからインストールする

標準のデバイスレイアウト連携には、Erkam Yaman氏による優れたコミュニティプラグイン[Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable)を採用しています。折りたたみ状態、ヒンジの形状、バーの配置、変更イベントをアプリに提供し、レイアウトの応答をアプリ側で制御できます。Foldableはデバイス情報の取得、テーマはWebレイアウトヘルパー、Native UIはコントロールの投影を担当します。使用するパッケージと一緒にインストールし、アプリ内でイベントを接続してください。

CapacitorアプリにNative UIとFoldableを一緒にインストールします。

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

iOS 27テーマも使う場合は、両パッケージを一緒にインストールまたは更新してください。

```sh
npm install @rdlabo/capacitor-native-ui @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

Native UI、テーマ、Engine、Foldable はそれぞれ独立してバージョン管理されます。テーマを使う場合は、テーマが宣言する peer dependency と互換性のある Native UI バージョンを選んでください。Native UI は Engine の npm 依存関係を含み、SwiftPM と Maven を通じてネイティブライブラリをリンクします。CocoaPods を使う場合は[ローカルの Engine pod の設定](https://github.com/webview-native-ui/engine/blob/v1.0.0/docs/getting-started/capacitor.md#cocoapods-compatibility-through-npm)も必要です。Capacitor がプラグインを検出できるよう、Native UI を直接の依存関係として宣言してください。セットアップコマンドでは、Foldable もアプリの独立した依存関係としてインストールします。パッケージのインストールだけではネイティブコントロールは有効になりません。アプリの起動処理で投影を選択し、デバイスレイアウトを接続します。

続いて[Ionicの設定](/docs/setup)、[HTMLの設定](/docs/framework-independent)、または[拡張](/docs/native-ui-extensions)を参照してください。起動処理の設定後、Webアセットをビルドし、`npx cap sync` を実行してネイティブアプリを再ビルドします。リポジトリのチェックアウトやアーカイブのダウンロードは不要です。

テーマ1.2.0または1.2.1に含まれていたネイティブAPIから更新する場合は、[移行ガイド](/docs/migration)でimport、設定、ネイティブプロジェクトの変更を確認してください。

## 要件

ネイティブ起動には Capacitor 8 と iOS または Android プロジェクトが必要です。Android 拡張には API 24 以上と Kotlin／Compose が必要です。通常のネイティブ描画には iOS 26 以上と Xcode 26 以上が必要です。Ionic アダプターが宣言する対応範囲は Ionic `>=8.8.1 <10` で、自動 E2E 検証は Ionic 9 を対象としています。HTML 向けの `/core` アダプターでは Ionic もテーマパッケージも不要です。[Vertical Bars](/docs/vertical-bars)と[拡張の配置](/docs/native-ui-extensions#content-and-placement-are-independent)には追加のデバイス要件があります。

標準コントロールでは、使用するマークアップ向けのセットアップガイドに従ってください。IonicとHTMLのアダプターはimportが異なります。独自のネイティブコンテンツでは、[拡張ガイド](/docs/native-ui-extensions)から始めてください。

## リファレンス

- [対応するIonicコントロール](/docs/native-ui#supported-markup)とフォールバックの動作。
- [設定](/docs/configuration)：既定値、対象コントロール、レール専用モード、実行中の変更。
- [ライト／ダーク表示](/docs/appearance)：Webテーマの継承、独自HTMLの設定、レールで共有される表示。
- [Vertical Bars](/docs/vertical-bars)：対象条件、表示、ランタイムAPI。
- [移行](/docs/migration)：パッケージ名、import、ネイティブプロジェクトの更新。

## 開発

```sh
npm ci
npm run build
npm test
npm run test:packages
```

DOM とレンダラーの共通実装は、ローカルの `packages/native-ui-core` ワークスペースで管理します。このリポジトリは Capacitor の登録とホストアダプターを担当します。`android/src/main/java/shared-core` は `npm run sync:core` によってローカルの Core ソースから生成されます。このコピーではなく Core を編集してください。SwiftPM と CocoaPods は `packages/native-ui-core/ios/Sources` の共有 Swift ソースを直接コンパイルします。Git ベースの SwiftPM 利用者には Node.js は不要です。アプリ内拡張向けの既存のネイティブモジュール名と Kotlin シンボル名は維持されます。

リポジトリルートは引き続き npm プラグインであり、`src`、`ios`、`android`、`package.json` が同じ場所にあります。TypeScript のユニットテストは `tests` にあり、Swift と Android のテストはプラグインとともに配置します。`examples/native-ui-html` は Ionic テーマを使わない利用例です。

ビルドは Capacitor プラグインの構成に従います。TypeScript が `src/index.ts` を `dist/esm` へコンパイルし、Rollup がブラウザーバンドル（`dist/plugin.js`）と CommonJS バンドル（`dist/plugin.cjs`）を生成します。このパッケージは `type: module` を使うため、`.cjs` 拡張子が必要です。公開 ESM サブパスは `dist/esm` の同じモジュールを共有します。TypeScript の変更を再ビルドするには `npm run watch`、Web の検証には `npm run verify:web` を実行します。

## Ionic テーマでテストする

Ionic の完全なデモ、スクリーンショットテスト、テーマの遷移テスト、シミュレーター連携フィクスチャは [ionic-theme-ios27](https://github.com/webview-native-ui/ionic-theme-ios27) に残っています。これらは、このプラグインを npm 依存関係としてインストールします。デモをここへ複製しないでください。

未公開の変更をテストするには、このリポジトリをビルドしてパッケージ化します：

```sh
npm run build
npm pack --ignore-scripts --pack-destination /tmp
```

移行済みのテーマのチェックアウトから、`npm run test:native-candidate -- /tmp/rdlabo-capacitor-native-ui-VERSION.tgz --e2e` を実行します。このコマンドは隔離したコピーを作成し、テーマとデモの両方にアーカイブをインストールして、パッケージ検証、連携ユニットテスト、本番ビルド、ブラウザーテストを実行します。既存のシミュレータースイートを実行するには `--simulator=UDID` を追加します。元のチェックアウトとロックファイルは維持され、一時コピーは診断用に残ります。

## リリース

プラグインのバージョンはテーマから独立しています。公開が承認されている場合、最新の main から `npm run release` を実行します。`vVERSION` タグのワークフローは、このプラグインだけを公開します（プレリリースは `next`、安定版は `latest`）。

両方の npm マニフェスト、`Package.swift`、podspec、Android Gradle の依存関係で Engine を同一の厳密なバージョンに固定し、ロックファイルも一緒に更新します。npm の可変範囲は、ネイティブ依存関係より新しい Engine を解決し、インストールを壊すおそれがあります。

初回リリースの前に、`webview-native-ui/capacitor-plugin`、ワークフロー `release.yml`、環境 `npm` に対する npm trusted publisher を設定します。必要に応じて、その GitHub 環境のレビュアーポリシーを設定してください。公開済みのバージョンは再公開できないため、このリポジトリからの初回リリースには新しいバージョンを選びます。

このリポジトリは `webview-native-ui/ionic-theme-ios27` のコミット `1831bde5` から分離されました。それ以前の履歴は元のリポジトリに残っています。

## 共有 Core の開発

Core は、このリポジトリの `packages/native-ui-core` にあります。リポジトリルートから `npm ci`、`npm run build`、`npm test` を実行します。Core を別途公開したり、チェックアウトしたりする必要はありません。ビルド時に Core の JavaScript と型宣言をプラグインのアーカイブへ組み込みます。Core は非公開ワークスペースであり、別途リリースされる npm 依存関係ではありません。

共有する TypeScript、Swift、Kotlin は `packages/native-ui-core` で編集します。`npm run sync:core` は Android のコピーを再生成し、`npm run check:core` は差分を検出します。共有レンダラーと DOM のテストは、ルートのテストコマンドで Capacitor アダプターのテストと一緒に実行します。ネイティブ Core のテストは、その `ios` と `android` ディレクトリ内に残ります。

Capacitor の移行は、このリポジトリルートから実行します。`package.json`、`Package.swift`、podspec、`android/` は標準の場所を維持します。SDK の移行後はネイティブビルドを検証してください。構成を維持しても、将来の移行ツールとの互換性が保証されるわけではありません。

### Swift Package の利用者

Xcode に `https://github.com/webview-native-ui/capacitor-plugin.git` を追加し、`NativeUICore` プロダクトを選ぶと、Capacitor アダプターをリンクせずに `import NativeUICore` を使えます。この変更がリリースされる前は、`refactor/extract-shared-core` ブランチを選択します。両プロダクトはリポジトリのリリースタグを共有します。SwiftPM はパッケージ依存関係の解決時に Capacitor を取得する場合があります。

Capacitor アプリは引き続き `RdlaboCapacitorNativeUi` プロダクトと `import NativeUIPlugin` を使います。このモジュールは Core を再エクスポートするため、既存の `NativeUI.register` 呼び出しもアダプターと同じ登録状態を使います。ルートマニフェストが両ターゲットを管理し、別の入れ子の Swift パッケージはありません。

CocoaPods は引き続きアダプターと共有ソースを既存のプラグイン pod へコンパイルします。この変更は、独立した Core pod の公開や Cordova アダプターの実装を行うものではありません。

## Android の動的な配色

`getDynamicColorScheme()` で Android 12 以降の Material You の色を取得し、`addDynamicColorListener()` で再開・構成変更の通知を監視します。どちらも `@rdlabo/capacitor-native-ui` からインポートします。動的な配色は、Native UI の投影や実験的なアプリ内拡張から独立した、正式対応のオプトイン API です。

プラグインは Activity のテーマを変更せず、壁紙への権限も要求せずに、ライトとダークの配色を返します。他のプラットフォームでは `available: false` を返します。プラグインは CSS を適用しません。Ionic アプリでは `@rdlabo/ionic-theme-md3/dynamic-colors` の `enableDynamicColors` を使えます。

インストール、API の契約、変更通知、クリーンアップ、Ionic 連携は [Android の動的な配色](/docs/dynamic-colors)を参照してください。
