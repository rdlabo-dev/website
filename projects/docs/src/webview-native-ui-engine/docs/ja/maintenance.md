---
title: "開発とリリース"
sourceRevision: "3983e9f101bfcf320cf38df0698f868bcd57c7fdcc34b39c790b2beeed1e4ccb"
---
# 開発とリリース

Engine自体を変更・公開するときに使うガイドです。ネイティブの利用側はNode.jsなしでビルドする場合があるため、ソースを変更したら同梱ランタイムを再生成する必要があります。Maven成果物がダウンロード可能になる前にnpmへリリースが届く場合があるため、以下では公開の受理と利用側のダウンロード準備完了を別々に確認します。

## 開発

公開エントリーポイントは`src/index.ts`と`src/ionic.ts`で、共通の契約は`src/types.ts`にあります。実装は責務ごとに分かれています。

- `src/native/`：ブリッジ転送、ネイティブセッション、起動、リソースURL。
- `src/projection/`：画像のハンドオフ、投影の所有権、イベント、スタイル。
- `src/dom/`：ジオメトリ、スクロール、可視性、オーバーレイの調整。

`npm run build`は、`src/native/bootstrap.ts`を共通WebViewランタイムの`runtime/native-ui-engine.js`へバンドルします。Androidはこのファイルを直接アセットとして含めます。SwiftPMはターゲットディレクトリ内のリソースを必要とするため、ビルドでは`ios/Sources/WebViewNativeUIEngine/Resources`にもコピーします。両方の生成物は開発中は追跡対象から除外し、SwiftPM利用側にNode.jsを要求しないようリリースタグに含めます。ソースのチェックアウトをXcodeでビルドする前に、`npm run build`を実行してください。生成ファイルではなくTypeScriptソースを編集してください。CIは再生成を確認し、npmとMavenのアーカイブに含まれるランタイムを検証します。

ブラウザテストも`tests/`内で同じグループに分かれています。`tests/cordova/`には実際のネイティブ利用側のフィクスチャがあります。

CIと同じNode.js 24を使います。このリポジトリで次を実行します。

```sh
npm ci
npm run build
npm run lint
npx playwright install chromium
npm test
xcodebuild -scheme WebViewNativeUIEngine -destination 'platform=iOS Simulator,id=<booted simulator UUID>' test
```

lintは、厳密なTypeScriptチェック、標準のESLint/TypeScript推奨ルール、`src`に対する型情報を使ったPromiseチェックを組み合わせます。スクリプトとテストには構文レベルのlintを適用し、整形はPrettierが担当します。`npm run format`は整形のみを行います。ブリッジのペイロードとテストダブルには明示的な`any`を使えますが、本番の境界検証は必要です。明示的な`void`はバックグラウンド処理を示しますが、Promiseの拒否を処理するものではありません。

ネイティブのチェックは各プラットフォームのCIジョブで実行します。`npm run lint:swift`はmacOS上で、Capacitor設定のnode-swiftlintを使います（`brew install swiftlint`）。`npm run lint:android`はKotlinの整形チェックと、警告をエラー扱いするAndroid Lintを実行します（JDK 21とAndroid SDK 36）。ネイティブの整形には`npm run format:swift`と`npm run format:kotlin`を使います。既存のネイティブテストフィクスチャをPrettier Kotlinプラグインが解析できないため、Kotlinにはktfmtを使います。

これらのチェックには、ネイティブテストとCordovaフィクスチャを含みます。SwiftのAPI文書には`///`、実装上の注記には`//`を使います。Swiftのサイズ・複雑度に関するヒューリスティックは、状態機械の分割や公開APIの変更を強制しません。フィクスチャ内だけのforce unwrap/castは許可し、本番コードではチェックを維持します。SwiftはiOSシミュレーターでもコンパイル・テストします。

Engineのバージョンは利用側と独立しています。公開の順序は、Maven公開の受理→npm Engineです。利用側は個別に更新します。npmリリースには、タグが指す正確なコミットでMaven公開ワークフローが成功している必要があります。Maven Centralの配信はまだ保留中の場合があります。Android利用側は対応するPOMとAARをダウンロードできるまで待つ必要がありますが、iOSとWeb利用側はすぐ更新できます。ビルドやテストのコマンドで公開は行われません。テストは通常のDOM、小数・RTLジオメトリ、古いACK、画像の所有権、ネイティブWKWebViewのスクロール追従を扱います。IonicやSDKとの結合テストは利用側の責務です。

CI専用のセットアップ、パッケージングコマンド、GitHubの出力は`.github/workflows/`で定義します。スクリプトには、ランタイムのビルド、再利用可能な利用側・パッケージ検証、テスト済みの公開処理（Centralの状態処理とnpm成果物の比較）を残します。

## Mavenへの公開

`Native UI Engine Maven Release`ワークフローは、正確なEngineパッケージバージョンを指定してリリースタグで手動実行します。タグが指すコミットは、先に`Native UI Engine`のCIを通過しなければなりません。AAR、ソースアーカイブ、生成したKotlin API文書、Mavenメタデータに署名して一度だけアップロードし、Centralが`PUBLISHING`または`PUBLISHED`を返すと完了します。デプロイIDと状態の変化は実行サマリーに記録します。`PUBLISHING`は検証を通過してCentralが公開を受理したことを表し、成果物をすでにダウンロードできるとは保証しません。このワークフローは配信を待ちません。npmリリースは正確なリリースコミットに対してこのワークフローの成功を確認しますが、Maven Centralの配信は待ちません。既存の座標は上書きしません。アップロードがタイムアウトしたら、次の操作の前にCentralに記録されたデプロイを確認してください。

リポジトリのActions secretsに、`CENTRAL_USERNAME`、`CENTRAL_PASSWORD`（Centralのユーザートークン）、`MAVEN_SIGNING_KEY`（ASCII-armored形式の秘密鍵）、`MAVEN_SIGNING_PASSWORD`を設定します。署名の公開鍵はCentralが取得できる必要があります。GitHubのsecretsはこのリポジトリにスコープされます。

ローカルでパッケージングを検証するには、JDK 21、Android SDK 36、GnuPGを用意し、`python3 scripts/native-ui-engine-release/verify.py`を実行します。使い捨ての鍵を作成し、署名とチェックサムを検証して、アップロードせずにテストZIPを削除します。公開時は常に、本物の署名鍵を使い、クリーンな出力から再ビルドします。プレリリースも含め、対応するnpmリリースより先にMaven成果物を公開してください。

## メンテナーのリリース設定

npm、SwiftPM、Mavenには同じバージョンを公開します。利用側は各配布方式で対応するバージョンを固定します。

npm組織の`webview-native-ui`とMaven Central名前空間の`io.github.webview-native-ui`は登録済みです。`webview-native-ui/engine`、ワークフロー`release.yml`向けのnpm trusted publishingを維持し、このリポジトリへ上記のMaven secretsを設定します。ソースファイルを移動しても、認証情報はコピーされません。

1. `main`で**Prepare release**（`prepare-release.yml`）を実行し、`major`、`minor`、`patch`、`revision`のいずれかを選びます。ローカルでのビルド、コミット、タグ作成は不要です。
2. ワークフローはnpmでバージョンを上げ、パッケージをビルド・検証して、バージョンだけを更新したmainのコミットと、生成リソースを含む別のリリースコミット・タグをpushします。そのタグに対して`Native UI Engine`の検証を明示的に開始し、自動生成したリリースノートを含むGitHub Releaseのドラフトを作成します。
3. リリースノートを確認・編集します。タグの検証が通過したら、正確なパッケージバージョンを指定して、そのタグで`native-ui-engine-release.yml`を実行します。
4. Maven公開の成功後に、GitHub Releaseのドラフトを公開します。Centralの`PUBLISHING`はアップロードの受理であり、ダウンロード準備完了ではありません。Android向けの配信が保留中なら、ノートに記載してください。`release.yml`はnpm公開前に、タグ、パッケージバージョン、タグのCI、Mavenの受理を検証します（revisionは`next`、安定版は`latest`）。

バージョンの増分はnpmのSemVerルールに従います。`revision`は`prerelease`に対応します。

| 現在 | 選択 | 次のバージョン |
| --- | --- | --- |
| `1.2.3` | major | `2.0.0` |
| `1.2.3` | minor | `1.3.0` |
| `1.2.3` | patch | `1.2.4` |
| `1.2.3` | revision | `1.2.4-0` |
| `1.2.4-0` | revision | `1.2.4-1` |
| `1.2.4-2` | patch | `1.2.4` |
| `1.3.0-2` | minor | `1.3.0` |
| `2.0.0-2` | major | `2.0.0` |

生成ランタイムのコミットがmainの履歴に入ることはありません。CIの準備処理は、forceを使わずに、mainとリリースタグをアトミックにpushします。公開で受け入れるのは、mainの子コミットにタグが付いており、2つの生成リソースだけを追加して他のファイルを変更していない場合のみです。npmは公開前にランタイムを再ビルドして確認し、Mavenは同じ検証済みタグのランタイムをパッケージに含めます。

push前に準備が失敗した場合は再実行します。mainとタグがすでにpushされている場合、準備を再実行したり（別のバージョンを要求することになります）、タグを移動したりしないでください。検証が開始されていなければ、既存のタグで`Native UI Engine`を手動実行し、リリースドラフトがなければ、そのタグのドラフトを作成します。これにより、push、検証の開始、ドラフト作成の間で発生した失敗からも復旧できます。既存のタグと公開済み成果物は上書きしません。

ビルドやテストのコマンドがパッケージを公開することはありません。既存のnpm/Mavenバージョンは上書きしません。

既存タグのリリース検証を再実行するには、ワークフローのrefと`tag`入力の両方に、そのタグを指定します：`gh workflow run release.yml --ref vX.Y.Z -f tag=vX.Y.Z`。これにより、リリース専用コミット構成の導入前に作られた古いタグも含め、そのリリースに保存されたワークフローを使います。元のタグ付きコミットを確認し、既存パッケージの内容が一致する場合だけnpm公開を省略します。タグは変更しないでください。リリースツールはCIと同じ、Node.js 24同梱のnpmを使います。

[ドキュメント概要](README.md)
