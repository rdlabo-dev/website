---
title: "PaymentSheet"
code: ["/docs/stripe/payment-sheet/payment-sheet.ts.md"]
scrollActiveLine: []
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

Web はネイティブ PaymentSheet を表示しません。Web の `createPaymentSheet` は `paymentIntentClientSecret` と任意の `withZipCode` を使用し、現在 SetupIntent には対応していません。`defaultBillingDetails`、`shippingDetails`、`enableApplePay`、`enableGooglePay`、`style`、`returnURL` などのネイティブ専用オプションは無視されます。

## 1. createPaymentSheet

バックエンドからクライアントへ安全に渡せるシークレットを取得し、`createPaymentSheet` を呼びます。プラグインは Stripe のシークレット API を呼びません。例の `/your-intent-endpoint` は [サーバー連携](/docs/server-integration) で用意したバックエンドの URL に置き換えてください。

iOS と Android では `paymentIntentClientSecret` と `setupIntentClientSecret` の**どちらか一方**を、Web では `paymentIntentClientSecret` を渡します。`customerId` と `customerEphemeralKeySecret` は任意ですが、`customerId` を設定する場合は両方が必要です。Customer を持たない PaymentIntent も有効です。

```ts
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';

// Replace `/your-intent-endpoint` with your backend from Server Integration.
const response = await fetch('/your-intent-endpoint', {
  method: 'POST',
});
if (!response.ok) {
  throw new Error(`Intent request failed: ${response.status}`);
}
const { paymentIntent, ephemeralKey, customer } = (await response.json()) as {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
};

await Stripe.createPaymentSheet({
  paymentIntentClientSecret: paymentIntent,
  customerId: customer,
  customerEphemeralKeySecret: ephemeralKey,
  merchantDisplayName: 'rdlabo',
});
```

!::createPaymentSheet::
!::CreatePaymentSheetOption::

ネイティブでは `style`、`enableApplePay` と `applePayMerchantId`、`enableGooglePay`、iOS 3D Secure 用の `returnURL`、請求先収集設定などを任意で指定できます。`withZipCode` は Web 専用です。SetupIntent で `enableGooglePay` を有効にする場合は `currencyCode` が必要です。

## 2. presentPaymentSheet

`createPaymentSheet` が成功した後だけ呼び出します。

```ts
const result = await Stripe.presentPaymentSheet();
if (result.paymentResult === PaymentSheetEventsEnum.Completed) {
  // Update UI only. Confirm the Intent with a webhook before fulfilling.
}
```

`Canceled` は利用者がシートを閉じた状態、`Failed` はエラーです。どちらの結果だけでも注文を確定できません。

!::presentPaymentSheet::
!::PaymentSheetResultInterface::

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

!::PaymentSheetEventsEnum::

## 参考資料

- [支払いを受け付ける（iOS）](https://stripe.com/docs/payments/accept-a-payment?platform=ios)
- [支払いを受け付ける（Android）](https://stripe.com/docs/payments/accept-a-payment?platform=android)
