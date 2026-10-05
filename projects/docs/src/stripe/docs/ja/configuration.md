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

PayPal、3D Secure などのリダイレクト型の支払い方法には、カスタム URL スキームを登録し、PaymentSheet または PaymentFlow の作成時に `returnURL` を設定し、アプリの URL ハンドラーから `handleURLCallback` を呼び出します。戻り先 URL がないと、iOS では本来利用条件を満たすリダイレクト型の支払い方法も表示されません。[初期化](/docs/initialize#redirect-based-payment-methods-on-ios)を参照してください。

## Web の設定

`stripe-pwa-elements` をインストールし、起動時に一度だけ `defineCustomElements()` を呼び出します。開発環境と本番環境の両方を HTTPS で配信してください。

- [Vanilla JS クイックスタート](/docs/vanilla-js)
- [Angular クイックスタート](/docs/angular)
- [React クイックスタート](/docs/react)
