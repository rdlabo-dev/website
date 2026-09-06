---
title: "プロジェクトで初期化する"
code: []
scrollActiveLine: []
---

`Stripe` をインポートし、[公開可能キー](https://dashboard.stripe.com/apikeys)を指定して `initialize` を呼び出します。JavaScript ランタイムごとに一度、支払い UI を作成・表示する前に実行してください。

```ts
import { Stripe } from '@capacitor-community/stripe';

export async function initialize(): Promise<void> {
  await Stripe.initialize({
    publishableKey: 'Your Publishable Key',
  });
}
```

<!-- !::initialize:: -->
<!-- !::StripeInitializationOptions:: -->

[Stripe Dashboard](https://dashboard.stripe.com/register) で公開可能キーを作成します。シークレットキーをクライアントへ配布してはいけません。

## Stripe Connect

[連結アカウント](https://stripe.com/docs/connect/authentication)に対してプラグイン API を呼び出すには、任意の `stripeAccount` を設定します。

```ts
await Stripe.initialize({
  publishableKey: 'Your Publishable Key',
  stripeAccount: 'acct_xxxxxxxxxxxxx',
});
```

Android の Google Pay は、アプリケーションメタデータの `com.getcapacitor.community.stripe.stripe_account` も読み取れます。[Google Pay](/docs/google-pay)を参照してください。

## リダイレクトベースの支払い方法（iOS）

認証のためにアプリから離脱する支払い方法（PayPal や一部の銀行決済方法など）では、returnURL が必要です。iOS では、`returnURL` が設定されていない場合、PaymentSheet または PaymentFlow でリダイレクトベースの決済方法として適切なものを Stripe は提供しません。[iOS return URL guide](https://docs.stripe.com/payments/mobile/accept-payment?platform=ios#ios-set-up-return-url) を参照してください。

アプリの `ios/App/App/Info.plist` にカスタム URL スキームを登録します。`your-app` をアプリ固有のスキームに置き換えてください:

```xml plist:ios/App/App/Info.plist
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>your-app</string>
    </array>
  </dict>
</array>
```

そのスキームを使って `createPaymentSheet` または `createPaymentFlow` に URL を渡し、条件に一致する app-open イベントを Stripe に転送します:

```ts
import { App } from '@capacitor/app';
import { Stripe } from '@capacitor-community/stripe';

const STRIPE_RETURN_URL = 'your-app://stripe-redirect';

await App.addListener('appUrlOpen', async ({ url }) => {
  if (url.startsWith(STRIPE_RETURN_URL)) {
    await Stripe.handleURLCallback({ url });
  }
});

await Stripe.createPaymentSheet({
  paymentIntentClientSecret,
  returnURL: STRIPE_RETURN_URL,
});
```

`createPaymentFlow` でも同じ設定を行います。Info.plist のカスタムスキーム、returnURL のスキーム、そしてリスナーがチェックする URL は一致している必要があります。支払い方法の利用可否は、Intent、通貨、国、Stripe アカウント、ダッシュボード設定、そして Stripe SDK のサポート状況にも依存します。

### handleURLCallback

`handleURLCallback` は iOS 専用です。受け取った return URL を Stripe SDK に渡すことで、リダイレクトベースの認証を完了し、ブラウザを閉じられるようにします。

<!-- !::handleURLCallback:: -->

<!-- !::StripeURLHandlingOptions:: -->

このメソッドは Android または Web では未実装です。一致する Stripe の returnURL のみを渡してください。Stripe が URL を処理できない場合、Promise は拒否されるため、通常のディープリンク処理を続けてください。

## フレームワークでの配線

選んだフレームワークの起動処理から `initialize` を呼び出します。各ガイドの標準パスを使ってください。

- [Vanilla JS](/docs/vanilla-js) — `defineCustomElements()` のあとで `initialize`
- [Angular](/docs/angular) — アプリケーション起動時の `provideAppInitializer`
- [React](/docs/react) — `CapacitorStripeProvider` がプラグインを初期化
