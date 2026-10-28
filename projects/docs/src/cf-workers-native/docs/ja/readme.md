---
title: "はじめに"
sourceRevision: "ae63d20966a0317f4311f27fb1a17d946b93c2b341d0d31831fa8fb881ae0df8"
---
# cf-workers-native

**WorkersやVoidで作ったアプリをiOSとAndroidへ。**

ブラウザーを好む人にも、ストアでアプリを探す人にも届けましょう。Webアプリと併せてモバイルアプリを提供すれば、ユーザーは自分に合うプラットフォームを選べます。

## Webアプリにモバイル版を追加する

Cloudflare Workers上で動くWebアプリがあれば、既存のページとバックエンドを活用したiOS・Androidアプリを追加できます。例えば、D1を使うフォームを持つVoidアプリでは、loader、action、データベースをWorkersに残し、モバイルアプリでページを表示して公開JavaScriptとCSSを同梱できます。

cf-workers-nativeはWorkersアプリケーションをCapacitorで作るモバイルアプリへ接続します。CapacitorはiOS・Androidのプロジェクトとネイティブプラグインへのアクセスを提供します。モバイル専用ビルドを追加してアプリのフローをテストしながら、Webアプリは引き続きCloudflare向けに開発・デプロイできます。

**まずは[既存アプリへのモバイル版の追加](/docs/integration)から始めてください。**
既存のネイティブアプリは不要です。Workerエントリーの選択から、シミュレーターやエミュレーターでページを動かすまでをガイドします。

## 自分のアプリに近いサンプルを見る

| 現在の構成 | 試すサンプル | 確認できる内容 |
| --- | --- | --- |
| Workerが配信するHTMLページ | [Hono / Expressのページ](/docs/demo/rendering/README) | モバイルアプリ内のページ遷移、フォーム、リダイレクト。 |
| D1を使うVoid React Pagesアプリ | [Void + D1サンプル](/docs/demo/void/README) | サーバーレンダリングしたページ、Reactの操作、D1へ書き込むフォーム。 |
| OpenNextでデプロイするNext.jsアプリ | [OpenNextサンプル](/docs/demo/opennext/README) | 生成ページとアセットをモバイルビルドへ接続する方法。バージョンと機能の制限も参照してください。 |

これらはサンプルと検証用の構成であり、顧客の導入事例ではありません。各ガイドには検証済みの範囲を記載しています。自分に近いフローから始めて、実際のアプリでも試してください。

## 維持するものと追加するもの

- **ページとバックエンドを維持する。** 対応するHTML、リンク、フォーム、クライアント操作を再利用します。D1、サーバーの秘密情報、クラウドに依存するロジックはWorkersに残します。
- **モバイルビルドを追加する。** Workerと公開アセットを、独自の名前とアプリケーションIDを持つCapacitorアプリへ接続します。
- **モバイルでの体験を確認する。** ログイン、画面遷移、データ変更、再度開く操作、接続回復をアプリで検証します。
- **配信に備える。** ネイティブアプリケーションのワークフローで署名とストア情報を設定します。ストアへの申請と審査は別の手順です。

まずは既存のデプロイ済みWorkerでリクエストを実行します。クラウドを利用するページには接続が必要です。クライアントアセットを同梱しても、オフラインアプリになるわけではありません。任意のローカル実行については、[実行ガイド](/docs/cloudflare-bindings#choosing-execution)と[互換性の制限](/docs/compatibility)を参照してください。

## フレームワークから始める

| Workersアプリケーション | 利用できるもの | ガイド |
| --- | --- | --- |
| **Hono** | Fetchハンドラーと、リンク・フォームを含むHTMLページ | [Honoの設定](/docs/build-setup#hono) |
| **Workers Express** | Workersエントリーを使うAPIハンドラーとHTMLレスポンス | [Expressの設定](/docs/build-setup#workers-express) |
| **Void React Pages** | Workerが描画するページ、hydration、D1を使うフォーム | [Voidの設定](/docs/void) |
| **Next.js / OpenNext** | デプロイ済みWorkerを利用するページと、対応ビルドでのローカルルート選択 | [OpenNextの設定](/docs/opennext) |

各ガイドに、検証したバージョンと対応範囲を記載しています。Worker APIを呼ぶ独立したフロントエンドがすでにある場合は、そのフロントエンドを維持して[Fetchのみの連携](/docs/runtime#fetch-only-integration)を使ってください。

## 自分のアプリで試す

アプリケーションのソース、Workerビルド、クラウドを使うフロー向けのテスト用Worker URLが必要です。iOSの実行にはmacOSとXcode、AndroidにはAndroid開発ツールが必要です。[セットアップガイド](/docs/integration#before-you-start)に各プラットフォームの前提条件へのリンクがあります。

Webプロジェクトにパッケージをインストールして、[モバイル設定の全手順](/docs/integration#workflow)へ進んでください。

```sh
npm install --save-exact cf-workers-native@0.1.7
```

インストールだけではモバイルプロジェクトは生成されません。ガイドではCapacitorの追加、モバイルビルドの設定、iOS・Androidでの実行を扱います。最初の到達点は、シミュレーターかエミュレーター上で既存の1ページ、別ページへのリンク、動作するフォームまたはデータ操作を確認することです。

**0.xのリリースはすべてPreviewです**。npmの`latest`タグのリリースも含みます。APIは変わる可能性があります。配信前に、実際のアプリのフローで適合性を評価してください。`workers-capacitor`から更新する場合は、[移行手順](/docs/integration#migrating-from-the-old-npm-package)に従ってください。

## AIアシスタントと構築する

アプリケーションのリポジトリを開き、次のプロンプトをアシスタントへ渡してください。

```text
Read https://github.com/rdlabo-dev/cf-workers-native/blob/v0.1.8/docs/integration.md.
Add an iOS and Android version of this Workers web app using cf-workers-native@0.1.7
and Capacitor. Preserve the existing pages, backend and Cloudflare deployment configuration.
Use an existing test Worker for cloud-backed requests; ask before any cloud deployment.
Start by verifying one page, navigation and a form or data action on a simulator/emulator.
Then verify the app's authentication and main user flow, and report remaining limits.
```

アプリ名、アプリケーションID、テスト用Worker URLが決まっていれば、一緒に伝えてください。

## 既存のネイティブアプリがある場合

Workersを利用する画面を既存の[UIKit / SwiftUIアプリ](/docs/native-embedding#ios)や[Androidアプリ](/docs/native-embedding#android)へ組み込めます。この連携ではネイティブSDKと共通のWebビルドを使います。npm、SwiftPM、Mavenのバージョンの組み合わせとAndroid WebViewの要件は、[依存関係の設定](/docs/native-embedding#dependency-setup)に従ってください。

## ユーザーへ届ける準備

起動からサインアウトまでの実際のフローをたどってください。ページを読み込み、遷移し、フォームを送信し、アプリを再度開き、ネットワークが使えない場合の動作を確認します。秘密情報はWorkerに保持し、認証と認可もWorkerで強制してください。[組み込みチェックリスト](/docs/integration#6-verify-the-existing-application-in-capacitor)と[ネイティブ埋め込みの確認項目](/docs/native-embedding#verification)に検証内容を記載しています。

既存のネイティブアプリでは、そのリリースワークフローを使います。Capacitorでは[セーフエリアとネイティブプラグイン](/docs/native-rendering-api)へ進みます。ストアへの申請と審査はアプリケーションのリリース手順に含まれます。

## 詳しく調べる・貢献する

[ドキュメント](/docs/README) · [サンプル](/docs/demo/README) · [互換性](/docs/compatibility) · [開発](/docs/development) · [貢献](/docs/CONTRIBUTING)

## ライセンス

[MIT](LICENSE)。
