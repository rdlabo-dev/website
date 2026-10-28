---
title: "開発とテスト"
sourceRevision: "0d229ff9f33eaa4ab26c10cea182679b9e167470679371f6562c75cbbf2c8fce"
---

# 開発とテスト

Node 22.18+（22.x）または 24.11+、npm、ネイティブテスト用のネイティブ SDK が必要です。これらのコマンドにパッケージ公開、PR 作成、クラウドへのデプロイは含まれません。

## ライブラリとパッケージのテスト

```sh
npm install
npm run build
npm run typecheck
npm test
npx playwright install chromium
npm run test:package
```

## デモと統合テスト

設定するファイルとアプリの実行方法は、[デモ設定ガイド](../demo/README.md)に従ってください。

デモは `demo/` 配下の独立した npm プロジェクトで、独自の package manifest を持ちます。依存関係の lockfile はローカルで生成し、コミットしません。Capacitor、Hono、Express、ネイティブプロジェクト、統合テストはこのプロジェクトに属します。ビルド済みライブラリを `file:..` で利用し、npm workspace ではありません。

デモの構成はアプリケーションのソースとツールを分離しています。

```text
demo/
  src/
    main.ts         Runtime initialization and Worker HTML display
    workers/        Hono and Express application code
  tests/
    validation/     Validation page, runners, contracts and Worker entries
    fixtures/
      apps/         Runtime and build-tool test apps
      workers/      Test-only Worker handlers
    scripts/        Node.js helpers that build test apps
    ...             Automated tests and Playwright/Vitest configurations
  ios/, android/    Native projects
```

`demo/src/main.ts` はランタイムを初期化し、Worker の `/` ルートが返す HTML を表示します。デフォルトは Hono です。切り替え方法は `demo/vite.config.ts` 内のコメント化された Express エントリーにあります。ブラウザテストは同じデモをそれぞれの Worker でビルド・描画します。別の `demo/tests/validation/` ページが互換性チェックを実行します。このページは独自にビルドし、ブラウザテストから別途配信します。アプリケーションのソースは検証コードをインポートしません。共通の HTTP チェックは `demo/tests/validation/contracts/http.ts` にあり、ビルドツールとランタイムのテストでも再利用します。

アプリケーション Worker は `demo/src/workers/<framework>/<scenario>.ts` に配置します。Hono と Express の例はそれぞれ `/` に HTML、`/api/hello` に JSON を返します。この Fetch のみの例は、返された HTML を既存のページに挿入するもので、ネイティブのドキュメントレンダリング経路ではありません。ナビゲーション、返された script の実行、フォーム処理は提供しません。iOS / Android で Worker が所有するドキュメントには、`demo/rendering` がパッケージのネイティブ統合とともに `workersCapacitor({ baseURL, render: "/" })` を使います。より広いルーティングやエラー処理のケースは `demo/tests/fixtures/workers/{hono,express}/standard.ts` にあり、ランタイムとバインディングのフィクスチャも `demo/tests/fixtures/workers/` にあります。

```sh
cd demo
npm install
npm run typecheck
npm run build
npx playwright install chromium webkit
npm run test:browser
npm run test:workers
npm run test:runtime
npm run test:runtime:dev
npm run test:build-tools
```

`demo` の `npm run test:build-tools` は、Hono と Express の Vite / esbuild に加え、バンドルしないブラウザ ESM を、Chromium と WebKit の両実行モードで検証します。

`test:workers` は Wrangler の `createTestHarness` を使い、**ローカル workerd** に対して `demo/tests/workers/` の Vitest テストを実行します。Hono と Express はそれぞれ、デモ Worker の 2 件のチェックと、WebView で確認する API 動作を対象にした契約フィクスチャの 10 件のチェックを持ちます。実際の Cloudflare デプロイではありません。テストの絞り込みには、例えば `npm run test:workers -- -t hono` を使います。`test:package` は実際の npm tarball を新しい一時的な利用側プロジェクトにインストールし、手書きの alias / polyfill なしでパッケージの型と direct / isolated 両方のフレームワーク実行を確認します。

## ローカルでの Cloudflare 開発

Cloudflare CLI の設定は `demo/cloudflare.config.ts` にあります。`demo/` から `npx cf build --mode hono` または `npx cf build --mode express` を実行して対応する Worker をビルドします。ローカル開発には `npx cf dev --mode hono`（または `express`）を使います。インストールされる `cf` は現在 beta です。CLI のバンドラーとテスト harness のため、Wrangler は引き続き開発依存に含まれます。テストは同じ互換性設定を使い、サンプル Worker と別の契約フィクスチャを検証します。

## Void React Pages + D1

iOS と Android の Capacitor ナビゲーションには Void / @void/react 1.1.12 以降を使ってください。サンプルは Void / @void/react 1.1.12 に固定しています。iOS と Android のテストは patch を当てない公開済みパッケージを使い、ハイドレーション、フォーム送信、D1 永続化、クライアント専用ナビゲーションの成功を要求します。設定と検証範囲は [Void 統合](void.md)を参照してください。

## OpenNext + D1

[`demo/opennext`](../demo/opennext/README.md) は、D1 を使ったセッション、通常のフォーム、静的アセットを持つ独立した Next.js アプリケーションです。通常の Capacitor ビルドは既存の Worker にリクエストを送ります。別のテストで公開ページをローカル実行するため、リモートでの成功をローカル OpenNext サポートとして数えません。[OpenNext の設定と制限](opennext.md)を参照してください。

## ネイティブ埋め込みの利用側アプリ

これらの独立アプリは、Capacitor のアプリ設定なしで SDK を利用できることを確認します。ライブラリーを先にビルドしてから進んでください。

1. [iOS: UIKit・SwiftUI の利用側](../demo/tests/native-embedding/ios/README.md)。
2. [Android: Maven のみの ComponentActivity 利用側](../demo/tests/native-embedding/android/README.md)。

ナビゲーション、POST、閉じる・再開、起動失敗を検証します。ready の期限、Android Activity 再生成、ホスト Cookie・Service Worker 動作の維持も確認します。生成アセットとローカル公開物はフィクスチャ出力で、リリース成果物ではありません。`Native embedding` ワークフローは既存互換性ワークフローと別に両プラットフォームを実行します。

## Capacitor のネイティブデモ

ネイティブビルドには Xcode 26 / Swift 6.2 以降と Java 21 が必要です。HTTP/1.1 のリクエストフレーミングとレスポンス解析は JavaScript / WebAssembly で実行します。ネイティブプラグインは TCP / TLS のバイト I/O と WebView 統合を提供します。iOS は AsyncHTTPClient や Swift NIO を使わず Network.framework を使います。Android は TCP / TLS に Netty を使い、その HTTP codec は使用しません。HTTPS のレスポンス本文には Content-Length または chunked framing が必要です。ネイティブのバイトブリッジは認証済みの接続終了と切断による欠落を区別できないため、EOF 区切りの HTTPS 本文は明示的に失敗します。[ネイティブの境界](compatibility.md)を参照してください。Android ではアプリケーションの `android/app/build.gradle` の `android {}` 内に次のリソースルールを追加します（デモには追加済みです）。

```groovy
packaging.resources {
    excludes += 'META-INF/INDEX.LIST'
    merges += 'META-INF/io.netty.versions.properties'
}
```

これらは Netty の依存メタデータを結合します。ライブラリがアプリケーションの Gradle 設定を変更することはありません。

Web アセットをビルドした後、`demo/` から次を実行します。

```sh
npm run sync
npm run ios
npm run android
```

Android には Java 21+ が必要です。デモは最小限の Hono サンプルを開きます。別の 26 項目の検証アプリを使うには、`npm run test:native:prepare -- validation` を実行した後、同じ sync / ios / android コマンドを実行します。これは生成済み `dist/` アセットを置き換えるため、サンプルアプリへ戻すには `npm run build` と `npm run sync` を実行してください。Capacitor に `server.url` や開発サーバーは設定していません。結果は UI と、ネイティブコンソールの `POC_RESULT` に表示します。ブラウザテストはさらに、ネットワークを無効にして 18 の API チェックを再実行します。

## 継続的インテグレーション

CI 時間の基準、セットアップ集約、測定限界は[テスト実行コスト](test-execution-time.md)を参照してください。

CI はライブラリー・型検査、ローカル workerd 契約、Chromium/WebKit 連携、新しい npm tarball の利用側、9 つの Android シナリオを並列ジョブで実行します。iOS シミュレーターは別に検証します。リリースの `CI` ゲート、main での検証済み PR 結果の再利用、検証境界は [CI とマージ保護](../CONTRIBUTING.md#ci-and-regression-protection)を参照してください。CI はマージをブロックしません。

## Android Maven の公開

[独立した公開ビルド](../scripts/android-release/README.md)で Capacitor アプリと独立して Android SDK を準備・検証します。埋め込み CI は使い捨て鍵で署名したバンドルを確認し、その Maven リポジトリーから独立アプリをビルドします。実際の Central 公開には検証済み名前空間、リリース署名鍵、明示的な公開が必要です。

## 公開済みnpmパッケージを検証する

正確なレジストリバージョンを指定して、独立した利用側のテストスイートを実行します。

```sh
CONSUMER_PACKAGE=cf-workers-native@0.1.5 npm run test:package
```

チェックアウトをパッケージ化する代わりに、公開済みtarballをダウンロードします。同じ検証で、パッケージ内のファイル、TypeScriptインポート、Vite/esbuild、ブラウザー実行、共有ランタイム契約を扱います。`artifacts/package-results.json`には一時的な利用側ディレクトリーを記録します。その`node_modules/cf-workers-native`ディレクトリーは、ネイティブ埋め込みランナーへ`WORKERS_NPM_PACKAGE_DIR`として渡すこともできます。`CONSUMER_PACKAGE`がない場合は、従来どおりローカルのチェックアウトをビルドしてパッケージ化します。

レジストリから新規インストールした状態でのネイティブ受け入れ検証には、一度準備を実行した後、起動済みの各シミュレーター・エミュレーターで通常のWorker導入フローを実行します。

```sh
CONSUMER_VERSION=0.1.5 npm run test:events:native:prepare --prefix demo
node demo/tests/experiments/published-package/native.mjs ios <simulator-uuid>
node demo/tests/experiments/published-package/native.mjs android <emulator-serial>
```

利用側は生成Webディレクトリーを共有するため、これらのコマンドは順番に実行してください。準備ではnpmのSHA-512 integrityを検証し、アーカイブのSHA-256を記録します。ネイティブビルドはインストール済みのViteプラグインとランタイムをインポートし、チェックアウトからのSDKモジュールを拒否します。検証用の構成は、ローカルHTTPS Workersバックエンドに対する初期描画、リンク遷移、ちょうど1回のフォーム送信、POST/303/GETフローを確認します。本番サービスには接続しません。

検証結果は`artifacts/validation/published-<version>/onboarding/`へ書き込みます。`elapsedFlowMs`はネイティブ起動からフロー全体の完了までを測定するもので、起動性能のベンチマークではありません。`documentReadyMs`はドキュメントのperformance clockであり、`bundleBytes`はネイティブアプリのバイナリではなく生成Webアセットを対象とします。[公開済みパッケージの検証用構成](../demo/tests/experiments/published-package/README.md)に、手順と検証の限界を記載しています。
