---
title: "PaymentSheet"
code: ["/docs/stripe/payment-sheet/payment-sheet.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{}},{"id":"1.-createpaymentsheet","activeLine":{"payment-sheet.ts":[9,22]}},{"id":"2.-presentpaymentsheet","activeLine":{"payment-sheet.ts":[22,28]}},{"id":"3.-addlistener","activeLine":{"payment-sheet.ts":[4,8]}}]
---

PaymentSheet は支払い情報の入力と Intent の確定を一度の表示で行います。カードを保留状態にして後から確定する必要がある場合は [PaymentFlow](/docs/payment-flow)を使用してください。

[![動作イメージ](https://i.gyazo.com/4356878ec43a90178ec3d831d6b47b10.gif)](https://gyazo.com/4356878ec43a90178ec3d831d6b47b10)

すぐに課金するには [PaymentIntent](https://stripe.com/docs/payments/payment-intents)、支払い方法を後で使うため保存するには [SetupIntent](https://stripe.com/docs/payments/save-and-reuse?platform=web) を使用します。これらはサーバーで作成します。[サーバー連携](/docs/server-integration)を参照してください。

## プラットフォーム対応

| プラットフォーム | PaymentSheet |
| --- | --- |
| iOS | ネイティブ Stripe PaymentSheet |
| Android | ネイティブ Stripe PaymentSheet |
| Web | `stripe-pwa-elements` のカードモーダル |

Web はネイティブ PaymentSheet を表示しません。Web の `createPaymentSheet` は `paymentIntentClientSecret` と任意の `withZipCode` を使用し、現在 SetupIntent には対応していません。`defaultBillingDetails`、`shippingDetails`、`billingDetailsCollectionConfiguration`、`enableApplePay`、`enableGooglePay`、`style`、`returnURL` などのネイティブ専用オプションは無視されます。

## 1. createPaymentSheet

バックエンドからクライアントへ安全に渡せるシークレットを取得し、`createPaymentSheet` を呼びます。プラグインは Stripe のシークレット API を呼びません。 `HttpClient`、`fetch`、または任意の HTTP クライアントを使用できます。

iOS と Android では `paymentIntentClientSecret` と `setupIntentClientSecret` の**どちらか一方**を、Web では `paymentIntentClientSecret` を渡します。`customerId` と `customerEphemeralKeySecret` は任意ですが、`customerId` を設定する場合は両方が必要です。Customer を持たない PaymentIntent も有効です。[サーバー連携](/docs/server-integration)のデモの `intent/without-customer` 形式を参照してください。

```ts
import { firstValueFrom } from 'rxjs';
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';

const { paymentIntent, ephemeralKey, customer } = await firstValueFrom(
  this.http.post<{
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
  }>(environment.api + 'intent', {}),
);

await Stripe.createPaymentSheet({
  paymentIntentClientSecret: paymentIntent,
  customerId: customer,
  customerEphemeralKeySecret: ephemeralKey,
  merchantDisplayName: 'rdlabo',
});
```

<!-- !::createPaymentSheet:: -->
<!-- !::CreatePaymentSheetOption:: -->

ネイティブでは `style`（`alwaysLight` または `alwaysDark`、iOS 専用）、`enableApplePay` と `applePayMerchantId`、`enableGooglePay`、請求先情報の収集設定などを任意で指定できます。 iOS で PayPal、3D Secure などのリダイレクト型の支払い方法を使うには、`returnURL` と `handleURLCallback` を設定してください。戻り先 URL がない場合、Stripe は本来利用条件を満たすリダイレクト型の支払い方法も表示しません。[iOS のリダイレクト型の支払い方法](/docs/initialize#redirect-based-payment-methods-on-ios)を参照してください。 `withZipCode` は Web 専用です。SetupIntent で `enableGooglePay` を有効にする場合は `currencyCode` が必要です。

v8.3.0 以降では、作成時のオプションに `allowsDelayedPaymentMethods: true` を設定すると、iOS と Android で ACH や SEPA Debit などの利用条件を満たす遅延型の支払い方法を有効にできます。既定値は `false` で、Web には影響しません。Stripe 側で支払い方法を有効にし、Intent も適切に設定してください。`Completed` が返っても支払いが処理中の場合があります。商品の発送やサービスの提供は、支払い成功の Webhook を受信してから行ってください。[Stripe の遅延型支払い方法のガイド](https://docs.stripe.com/payments/mobile/accept-payment?platform=ios&type=payment#handle-post-payment-events)を参照してください。

## 2. presentPaymentSheet

`createPaymentSheet` が成功した後だけ呼び出します。

```ts
const result = await Stripe.presentPaymentSheet();
if (result.paymentResult === PaymentSheetEventsEnum.Completed) {
  // UI だけを更新します。商品発送やサービス提供の前に、サーバーで Webhook を使って支払い成功を確認してください。
}
```

Web でのキャンセルは `paymentResult: PaymentSheetEventsEnum.Canceled` として Promise が解決します。`catch` だけに頼らず、この結果を処理してください。 `Canceled` は利用者がシートを閉じた状態、`Failed` はエラーです。どちらの結果だけでも商品の発送やサービスの提供を判断してはいけません。

<!-- !::presentPaymentSheet:: -->
<!-- !::PaymentSheetResultInterface:: -->

## 3. addListener

結果リスナーはシートを表示する前に、アプリケーション起動時に一度だけ登録します。Android Activity の再生成後は Promise よりイベントを優先してください。[イベントリスナー](/docs/learn/event-listeners)を参照してください。

```ts
await Promise.all([
  Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
    console.log('PaymentSheetEventsEnum.Completed');
  }),
  Stripe.addListener(PaymentSheetEventsEnum.Canceled, () => {
    console.log('PaymentSheetEventsEnum.Canceled');
  }),
  Stripe.addListener(PaymentSheetEventsEnum.Failed, (error) => {
    console.log('PaymentSheetEventsEnum.Failed', error);
  }),
]);
```

<!-- !::PaymentSheetEventsEnum:: -->

## 参考資料

- [支払いを受け付ける（iOS）](https://stripe.com/docs/payments/accept-a-payment?platform=ios)
- [支払いを受け付ける（Android）](https://stripe.com/docs/payments/accept-a-payment?platform=android)
