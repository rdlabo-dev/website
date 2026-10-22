---
title: "はじめに"
---

# cf-workers-native

**Workers や Void で作ったアプリを iOS と Android に。**

ブラウザーを好む人にも、ストアでアプリを探す人にも届けられます。Web アプリとモバイルアプリを提供し、ユーザーが使いやすい環境を選べるようにします。

## モバイルアプリへの導入方法を選ぶ

- **既存の iOS アプリに埋め込む**
  UIKit・SwiftUI アプリに Workers を使った画面を追加します。[iOS ガイド](/docs/native-embedding#ios)。
- **既存の Android アプリに埋め込む**
  既存 Android アプリに Workers を使った画面を追加します。[Android ガイド](/docs/native-embedding#android)。
- **新しいモバイルアプリを作る**
  Capacitor で App Store・Google Play 配布用の iOS・Android アプリを作ります。[Capacitor ガイド](/docs/integration)。

[ドキュメント](/docs/README) · [使用例](/docs/demo/README)

## 慣れたアプリの開発を続ける

- **ページとフローを再利用。** Worker が描画する HTML、リンク、フォームをモバイル WebView に移します。既存の描画モデルを維持し、SPA への書き換えは前提ではありません。
- **モバイルでも利用可能に。** Capacitor で iOS・Android アプリを作るか、すでにあるネイティブアプリへ Workers ページを追加します。
- **バックエンドは Workers に。** D1、サーバー秘密情報、クラウド依存ロジックはデプロイ済み Worker に残します。独立したモバイルビルドは Cloudflare デプロイ入力を変更しません。
- **端末で動かすものを選択。** 既定の network 実行から始めます。対応する場合は公開ルートを明示的にローカル実行へ選び、クライアントアセットを同梱します。

ローカル実行には[互換性の制限](/docs/compatibility)があります。クラウド利用ページには接続が必要で、クライアントアセットを同梱してもオフラインアプリにはなりません。

## フレームワークから始める

| Workers アプリ | 移行できるもの | ガイド |
| --- | --- | --- |
| **Hono** | リンク・フォームを含む Fetch ハンドラーと HTML ページ | [Hono 設定](/docs/build-setup#hono) |
| **Workers Express** | Workers エントリーによる API ハンドラーと HTML レスポンス | [Express 設定](/docs/build-setup#workers-express) |
| **Void React Pages** | Worker 描画ページ、ハイドレーション、D1 フォーム | [Void 設定](/docs/void) |
| **Next.js / OpenNext** | デプロイ済み Worker に基づくページ。対応ビルドはローカルルート選択も可能 | [OpenNext 設定](/docs/opennext) |

各ガイドに検証バージョンと境界を記載しています。Worker API を呼ぶ独立フロントエンドがある場合は維持し、[Fetch-only 連携](/docs/runtime#fetch-only-integration)を使います。

## アプリをスマートフォンで動かす

Web プロジェクトに共通 JavaScript パッケージを導入します。

改名後のパッケージは公開準備中です。npm で利用可能になるまでは[ソース tarball の手順](/docs/native-embedding#dependency-setup)を使ってください。公開後:

```sh
npm install cf-workers-native@0.1.2
```

モバイルエントリーでホストを選びます。たとえば iOS の Web エントリーは次のように始めます。

```ts
import { workersIOS } from "cf-workers-native/ios";

const app = workersIOS({
  baseURL: "https://your-worker.example.com/",
  render: "/",
});
await app.ready;
```

他のホストでは `cf-workers-native/android` の `workersAndroid`、または `cf-workers-native/capacitor` の `workersCapacitor` を使います。3 つともランタイムオプションと [Vite/esbuild ツール](/docs/build-setup)は共通です。

これは設定の一部です。既存 Worker を**独立したモバイルビルド**に接続し、出力を選んだネイティブホストに同梱します。[埋め込みガイド](/docs/native-embedding)と [Capacitor ガイド](/docs/integration)に全手順があります。既存ネイティブアプリでは Web プロジェクト・CI でアセットをビルドし、ネイティブ側に Capacitor CLI・設定は不要です。

**0.1.2 は Preview です。** API は変更される場合があります。Android 埋め込みは現在 WebView の `MULTI_PROFILE` とローカルビルド SDK が必要で、公開 Maven リリースはまだありません。導入前に[ネイティブ要件](/docs/native-embedding#dependency-setup)を確認してください。`workers-capacitor` からの更新は[移行手順](/docs/integration#migrating-from-the-old-npm-package)に従います。

## AI アシスタントと構築する

アプリのリポジトリーを開き、対象を **iOS**、**Android**、**Capacitor** のいずれかに置き換えて次のプロンプトを渡します。

```text
Read https://github.com/rdlabo-dev/cf-workers-native/blob/v0.1.2/README.md
and the integration guide for our target: <iOS, Android or Capacitor>.
Bring this Workers application to that target using cf-workers-native@0.1.2.
Preserve its pages, routes, authentication and Cloudflare deployment configuration.
For an existing native app, preserve its entry point and navigation.
Verify the actual user flows on the target platform and report remaining limits.
```

## ユーザーに届ける準備

起動からサインアウトまでの実フローを確認します。ページ読み込み、遷移、フォーム送信、アプリ再開、ネットワーク切断時の挙動を検証してください。秘密情報は Worker に置き、認証・認可もそこで行います。[連携チェックリスト](/docs/integration#6-verify-the-existing-application-in-capacitor)と[埋め込み検証](/docs/native-embedding#verification)を参照してください。

既存ネイティブアプリはそのリリース手順を使います。Capacitor は[セーフエリアとネイティブプラグイン](/docs/native-rendering-api)へ進んでください。ストア申請と審査は引き続きアプリのリリース工程です。

## 詳しく知る・貢献する

[ドキュメント](/docs/README) · [使用例](/docs/demo/README) · [互換性](/docs/compatibility) · [開発](/docs/development) · [コントリビュート](/docs/CONTRIBUTING)

## ライセンス

[MIT](LICENSE)。
