---
title: "はじめに"
sourceRevision: "5a65f057d592de2bdf4585abd0f47b718ed69db00f4a7d448c4394703898ee86"
headingAliases: {"get-your-app-onto-your-phone":"%E3%82%A2%E3%83%97%E3%83%AA%E3%82%92%E3%82%B9%E3%83%9E%E3%83%BC%E3%83%88%E3%83%95%E3%82%A9%E3%83%B3%E3%81%A7%E5%8B%95%E3%81%8B%E3%81%99","keep-building-the-app-you-know":"%E6%85%A3%E3%82%8C%E3%81%9F%E3%82%A2%E3%83%97%E3%83%AA%E3%81%AE%E9%96%8B%E7%99%BA%E3%82%92%E7%B6%9A%E3%81%91%E3%82%8B","next-steps":"%E6%AC%A1%E3%81%AE%E3%82%B9%E3%83%86%E3%83%83%E3%83%97","before-publishing":"%E5%85%AC%E9%96%8B%E5%89%8D%E3%81%AB","explore-and-contribute":"%E8%A9%B3%E3%81%97%E3%81%8F%E7%9F%A5%E3%82%8B%E3%83%BB%E8%B2%A2%E7%8C%AE%E3%81%99%E3%82%8B","license":"%E3%83%A9%E3%82%A4%E3%82%BB%E3%83%B3%E3%82%B9"}
---
# workers-capacitor

Cloudflare Workers アプリを iOS と Android へ。

workers-capacitor は既存の Cloudflare Workers アプリケーションを Capacitor に接続し、ページ、ルート、アプリケーションロジックを最小限の変更で iOS / Android アプリに再利用できるようにします。Web アプリケーションは Workers 上に残したまま、App Store や Google Play で配布するモバイル版を準備できます。

[Void 1.1.12](https://github.com/voidzero-dev/void/releases/tag/v1.1.12) で Capacitor の iOS ナビゲーションがサポートされました。この更新により、workers-capacitor を使って Void アプリを iOS と Android に展開できます。[Void を使い始める](/docs/void)。

## アプリをスマートフォンで動かす

今あるアプリから始めましょう。[統合ガイド](/docs/integration) では、既存の Workers プロジェクトを iOS / Android で開くまでの手順を説明しています。初めてモバイルアプリを作る場合に必要な Capacitor の設定も含まれます。

0.1.0 は Preview リリースです。ガイドのインストール手順に従ってください。安定版のリリースまでに API が変更される可能性があります。

AI コーディングアシスタントを使っている場合は、アプリケーションのリポジトリを開き、次のプロンプトを渡してください。

```text
Follow https://github.com/rdlabo-dev/workers-capacitor/blob/v0.1.0/docs/integration.md
to bring this app to iOS and Android with workers-capacitor.
Preserve its pages, routes and authentication; verify it on the target platforms.
```

アプリに合った手順を選んでください。

- [Void React Pages + D1](/docs/void)
- [Hono と Workers Express](/docs/build-setup#frameworks)
- [Next.js / OpenNext](/docs/opennext)

## 慣れたアプリの開発を続ける

既存のページ、フォーム、ルートをそのまま使って開発を続けられます。[Capacitor](https://capacitorjs.com/) は Web インターフェースをインストール可能なモバイルアプリにし、workers-capacitor はそこに既存の Worker を接続します。

データベースは今の場所に置いたままで構いません。D1 やその他のクラウドサービスが必要なリクエストは、既存のデプロイ済み Worker で実行し、対応しているコードは端末上で実行できます。詳細は[ビルド設定](/docs/build-setup)と[実行ポリシー](/docs/cloudflare-bindings)を参照してください。

すでに独立したフロントエンドがある場合は、[Fetch のみの統合](/docs/runtime#fetch-only-integration)により既存の API 呼び出しを維持できます。

## 次のステップ

アプリが画面に表示できたら、一つずつ自分のアプリらしく整えていきましょう。

1. ホーム画面や起動時にアプリを識別しやすくしましょう。[Capacitor のアセットガイド](https://capacitorjs.com/docs/guides/splash-screens-and-icons)に従って独自のアイコンとスプラッシュ画面を追加し、再ビルドしてアプリを実行し、変更を確認します。
2. 画面を使いやすくしましょう。ボタンがノッチやホームインジケーターに重ならないことを確認し、必要に応じて [iOS Safe Area](/docs/native-rendering-api#ios-safe-area) を調整します。
3. 写真の撮影、コンテンツの共有、操作後の触覚フィードバックを追加しましょう。アプリに合う機能を一つ選び、[Capacitor プラグイン](/docs/native-rendering-api#native-plugins)で追加します。
4. ビルドやストアへのアップロードの繰り返しに時間がかかるようになったら、[Capawesome Cloud](https://capawesome.io/docs/cloud/getting-started/) で自動化できます。設定手順はガイドに記載されています。

## 公開前に

シークレットはサーバーに置き、アプリからのリクエストを認証してください。[セキュリティガイド](/docs/integration#5-security-the-device-is-not-a-trusted-server)に従い、[既知の制限](/docs/compatibility)を確認して、対象プラットフォームでアプリをテストしてください。

## 詳しく知る・貢献する

- [他のアプリの接続例](/docs/demo/README)
- [ランタイムの動作](/docs/runtime) · [ネイティブレンダリング API](/docs/native-rendering-api)
- [開発とテスト](/docs/development) · [検証範囲](/docs/demo/tests/README)
- [貢献する](/docs/CONTRIBUTING)

## ライセンス

[MIT](LICENSE)。
