---
title: 開発とリリース
sourceRevision: "f224b1d4469ecea5b16600e6297a2bf99637b89ceb2a7ee2c7ce5a3eb815d466"
---
# 開発とリリース

## 開発

公開エントリーポイントは`src/index.ts`と`src/ionic.ts`で、共通の契約は`src/types.ts`に定義します。実装は責務別に分かれています。

- `src/native/`: ブリッジ通信、ネイティブセッション、起動、リソースURL。
- `src/projection/`: 画像の受け渡し、投影の所有権、イベント、スタイル。
- `src/dom/`: ジオメトリ、スクロール、表示状態、オーバーレイ連携。

`npm run build`は`src/native/bootstrap.ts`を共通のWebViewランタイム`runtime/native-ui-engine.js`へバンドルします。Androidはこのファイルをアセットとして直接パッケージ化します。SwiftPMはターゲットディレクトリ内にリソースを必要とするため、ビルド時に`ios/Sources/WebViewNativeUIEngine/Resources`へもコピーします。ネイティブ側の利用者がNode.jsを必要としないよう、両方の生成ファイルをコミットします。編集するのはTypeScriptソースであり、生成ファイルではありません。CIは再生成を確認し、npmとMavenのアーカイブに含まれるランタイムを検証します。

ブラウザーテストも`tests/`配下でこの分類に対応しています。`tests/cordova/`には実際のネイティブ利用側の検証用構成があります。

CIと同じNode.js 24を使います。このリポジトリで実行します。

```sh
npm ci
npm run build
npm run lint
npx playwright install chromium
npm test
xcodebuild -scheme WebViewNativeUIEngine -destination 'platform=iOS Simulator,id=<booted simulator UUID>' test
```

lintは厳密なTypeScriptチェック、標準のESLint・TypeScript推奨ルール、`src`向けの型情報を使うPromiseチェックを組み合わせます。スクリプトとテストは構文レベルのlintを適用し、フォーマットはPrettierが担当します。`npm run format`はフォーマットのみを適用します。ブリッジのペイロードとテストダブルには明示的な`any`を使用できますが、本番の境界での検証は引き続き必要です。明示的な`void`はバックグラウンド処理を示しますが、Promiseの拒否を処理するものではありません。AndroidはCIで警告をエラーとして扱う`lintRelease`を使い、SwiftはiOSシミュレーターでコンパイル・テストします。

Engineは利用側とは独立してバージョン管理します。公開順はネイティブのMavenアーティファクト → npmのEngineで、利用側は別途更新します。npmのリリースでは、公開前に対応するPOMとAARがMaven Centralに存在することを確認します。ビルドやテストのコマンドは公開を行いません。テストは通常のDOM、小数値・RTLのジオメトリ、古いACK、画像の所有権、ネイティブWKWebViewのスクロール追従を扱います。Ionic・SDKの組み込みは利用側のテストが担当します。

CI専用のセットアップ、パッケージ化コマンド、GitHubの出力は`.github/workflows/`に定義します。スクリプトにはランタイムビルド、再利用可能な利用側・パッケージの検証、テスト済みの公開ロジック（Centralの状態処理とnpmアーティファクト比較）を置きます。

## Mavenへの公開

`Native UI Engine Maven Release`ワークフローは、正確なEngineパッケージのバージョンを指定して`main`上で手動実行します。そのコミットは、先に`Native UI Engine`のCIを通過している必要があります。AAR、ソースアーカイブ、生成されたKotlin APIドキュメント、Mavenメタデータへ署名し、1回アップロードして、Centralが`PUBLISHING`または`PUBLISHED`を返したら完了します。デプロイIDと状態の変化は実行サマリーに記録します。`PUBLISHING`は検証を通過してCentralが公開を受け付けたことを意味し、アーティファクトがすでにダウンロード可能であることは保証しません。このワークフローは配信完了を待ちません。npmリリースには引き続き、対応するPOMとAARがMaven Centralで利用可能であることが必要です。既存の座標は上書きしません。アップロードがタイムアウトした場合は、追加操作の前にCentralに記録されたデプロイを確認してください。

リポジトリのActionsシークレットに`CENTRAL_USERNAME`、`CENTRAL_PASSWORD`（Centralのユーザートークン）、`MAVEN_SIGNING_KEY`（ASCII-armored形式の秘密鍵）、`MAVEN_SIGNING_PASSWORD`を設定します。署名の公開鍵はCentralから参照できる必要があります。GitHubシークレットのスコープはこのリポジトリです。

ローカルでのパッケージ化検証には、JDK 21、Android SDK 36、GnuPGを使って`python3 scripts/native-ui-engine-release/verify.py`を実行します。使い捨ての鍵を作成し、署名とチェックサムを検証して、アップロードせずにテスト用ZIPを削除します。公開時には必ずクリーンな出力から実際の署名鍵を使って再ビルドします。プレリリースを含め、対応するnpmリリースより先にMavenアーティファクトを公開してください。

## メンテナー向けリリース設定

このリポジトリは、[ionic-theme-ios27 `b218d8b`](https://github.com/rdlabo-dev/ionic-theme-ios27/commit/b218d8bfe0c87c02addc668fee9c7aa333489486)でマージされたEngine実装を出発点としています。抽出時にはマージ済み実装を維持し、Cordovaホスト対応はこのリポジトリで開発しています。名称変更後のパッケージはバージョン`0.0.1`から始まります。npm、SwiftPM、Mavenで同じバージョンを公開し、旧パッケージの座標を再利用しないでください。

npm組織`webview-native-ui`とMaven Central名前空間`io.github.webview-native-ui`は登録済みです。`webview-native-ui/engine`のワークフロー`release.yml`に対するnpm trusted publishingを維持し、このリポジトリに上記Mavenシークレットを設定します。ソースファイルを移動しても認証情報はコピーされません。

1. `main`で次のバージョンとリリースノートを準備し、`npm run release`で標準の`vX.Y.Z`タグとGitHubリリースを作成します。Mavenがダウンロード可能になるまで、GitHubリリースはドラフトのままにします。
2. そのmainコミットがCIを通過したら、正確なパッケージバージョンを指定して`native-ui-engine-release.yml`を実行します。
3. Centralの`PUBLISHING`はアップロードが受け付けられた状態であり、ダウンロード準備完了ではありません。POMとAARが利用可能になったら、準備したGitHubリリースを公開します。`release.yml`はタグ、パッケージバージョン、CI、Mavenアーティファクトを検証してからnpmへ公開します（プレリリースは`next`、それ以外は`latest`）。

ビルドやテストのコマンドはパッケージを公開しません。既存のnpm・Mavenバージョンを上書きすることはありません。

既存タグのリリース検証を再実行するには、そのタグを指定して`release.yml`を実行します。元のタグ付きコミットをチェックし、既存パッケージの内容が一致する場合に限ってnpm公開をスキップします。タグは変更しないでください。リリースツールはCIと同じ、Node.js 24に同梱されたnpmを使います。
