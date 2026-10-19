---
title: "開発とテスト"
sourceRevision: "c3c23a6159b1fecbdb456359f1f933917dff0465db77b4ddc58d73c0ccf6226c"
headingAliases: {"library-and-package-tests":"%E3%83%A9%E3%82%A4%E3%83%96%E3%83%A9%E3%83%AA%E3%81%A8%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E3%81%AE%E3%83%86%E3%82%B9%E3%83%88","demo-and-integration-tests":"%E3%83%87%E3%83%A2%E3%81%A8%E7%B5%B1%E5%90%88%E3%83%86%E3%82%B9%E3%83%88","local-cloudflare-development":"%E3%83%AD%E3%83%BC%E3%82%AB%E3%83%AB%E3%81%A7%E3%81%AE-cloudflare-%E9%96%8B%E7%99%BA","native-demo":"%E3%83%8D%E3%82%A4%E3%83%86%E3%82%A3%E3%83%96%E3%83%87%E3%83%A2","continuous-integration":"%E7%B6%99%E7%B6%9A%E7%9A%84%E3%82%A4%E3%83%B3%E3%83%86%E3%82%B0%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3"}
---
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

## ネイティブデモ

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

CI はライブラリ / 型のチェック、ローカル workerd 契約、Chromium / WebKit 統合、新しい npm tarball 利用側プロジェクト、9 つの Android アプリケーションシナリオを並列ジョブで実行します。iOS シミュレーターのチェックは別途実行します。必須の `CI` チェックと検証境界は [CI とマージ保護](../CONTRIBUTING.md#ci-and-regression-protection)を参照してください。
