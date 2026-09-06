---
title: "プラットフォーム設定"
code: []
scrollActiveLine: []
---

`@capacitor-community/stripe` をインストールし、ネイティブプロジェクトを同期します。Capacitor 8 ではプラグインが自動登録されるため、`MainActivity` の編集や `registerPlugin` の手動呼び出しは不要です。

```bash
npm install @capacitor-community/stripe
npx cap sync
```

このプラグインには Capacitor 8 以降が必要です。Web では peer dependency の `stripe-pwa-elements` も必要です。Stripe のシークレットキーは必ずサーバーだけで管理してください。詳しくは[サーバー連携](/docs/server-integration)を参照してください。

| 要件 | 最小バージョン |
| --- | --- |
| Capacitor | 8 |
| iOS | 15.0 |
| Android `minSdkVersion` | 24 |

## 最初の支払い経路

最初の PaymentSheet 成功までは次の順で進めます。

1. このページのプラットフォーム設定を完了する。
2. フレームワークガイドを**1つ**選び、そこで Stripe を初期化する（[Vanilla JS](/docs/vanilla-js)、[Angular](/docs/angular)、[React](/docs/react)）。
3. サーバーでテスト用 PaymentIntentを作成し、クライアントシークレットを返す。[サーバー連携](/docs/server-integration)を参照。
4. [PaymentSheet](/docs/payment-sheet) を表示し、リスナー結果（`Completed` / `Canceled` / `Failed`）を確認する。最終的な支払い状態は Stripe Webhook で確認する。

PaymentFlow、Apple Pay、Google Pay は PaymentSheet が動いたあとの選択肢です。

## Android の設定

プラグイン自体に追加の Gradle 設定や `MainActivity` への登録は必要ありません。

Android の Google Pay は、プラグインが読み込まれる前にアプリケーションメタデータで設定する必要があります。[Google Pay](/docs/google-pay)を参照してください。

Stripe Connect を利用する場合は任意で、Android Google Pay を連結アカウントに対して実行するための `com.getcapacitor.community.stripe.stripe_account` メタデータを追加できます。ネイティブと Web の PaymentSheet、PaymentFlow、Apple Pay、Google Pay では、`initialize` の `stripeAccount` も利用できます。

## iOS の設定

PaymentSheet でカードをスキャンできるよう、`NSCameraUsageDescription` を追加します。

```diff plist:ios/App/App/Info.plist
  	<key>UIViewControllerBasedStatusBarAppearance</key>
	  <true/>

+   <key>NSCameraUsageDescription</key>
+   <string>Need camera access for read credit card.</string>
  </dict>
```

iOS ではプラグインが自動的に読み込まれます。Apple Pay には Apple Merchant ID と証明書も必要です。[Apple Pay](/docs/apple-pay)を参照してください。

3D Secure のリダイレクトには、PaymentSheet または PaymentFlow の作成時に `returnURL` を設定し、アプリの URL ハンドラーから `handleURLCallback` を呼び出します。[初期化](/docs/initialize)も参照してください。

## Web の設定

`stripe-pwa-elements` をインストールし、起動時に一度だけ `defineCustomElements()` を呼び出します。開発環境と本番環境の両方を HTTPS で配信してください。

フレームワークのクイックスタートは**並列の選択肢**です。すべてを読む必要はありません。

- [Vanilla JS クイックスタート](/docs/vanilla-js)
- [Angular クイックスタート](/docs/angular)
- [React クイックスタート](/docs/react)

初期化のあと、[サーバー連携](/docs/server-integration)へ進み、続けて [PaymentSheet](/docs/payment-sheet) を表示します。
