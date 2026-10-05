---
title: "PaymentFlow"
code: ["/docs/stripe/payment-flow/payment-flow.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{}},{"id":"1.-createpaymentflow","activeLine":{"payment-flow.ts":[9,23]}},{"id":"2.-presentpaymentflow","activeLine":{"payment-flow.ts":[23,27]}},{"id":"3.-confirmpaymentflow","activeLine":{"payment-flow.ts":[27,33]}},{"id":"4.-addlistener","activeLine":{"payment-flow.ts":[4,8]}}]
---

PaymentFlow は支払い方法の収集と確定を分離します。`presentPaymentFlow` で支払い方法を収集してカードを保留状態にし、通常は確認画面を挟んでから `confirmPaymentFlow` で Intent を確定します。

[![動作イメージ](https://i.gyazo.com/736450bb2e267eab0bba578e366fcba5.gif)](https://gyazo.com/736450bb2e267eab0bba578e366fcba5)

[PaymentIntent](https://stripe.com/docs/payments/payment-intents) または [SetupIntent](https://stripe.com/docs/payments/save-and-reuse?platform=web) をサーバーで作成します。[サーバー連携](/docs/server-integration)を参照してください。

## プラットフォーム対応

| プラットフォーム | PaymentFlow |
| --- | --- |
| iOS | ネイティブ PaymentSheet.FlowController |
| Android | ネイティブ PaymentSheet.FlowController |
| Web | `stripe-pwa-elements` のカードモーダル |

Web は `paymentIntentClientSecret` または `setupIntentClientSecret` と、任意の `withZipCode` に対応します。`defaultBillingDetails`、`shippingDetails`、`billingDetailsCollectionConfiguration`、`enableApplePay`、`enableGooglePay`、`style`、`returnURL` などのネイティブ専用オプションは Web では無視されます。

## 1. createPaymentFlow

バックエンドからクライアントへ安全に渡せるシークレットを取得して `createPaymentFlow` を呼び出し、`paymentIntentClientSecret` と `setupIntentClientSecret` の**どちらか一方**を渡します。`customerId` と `customerEphemeralKeySecret` は任意ですが、`customerId` を設定する場合は `customerEphemeralKeySecret` も必要です。

```ts
import { firstValueFrom } from 'rxjs';
import { PaymentFlowEventsEnum, Stripe } from '@capacitor-community/stripe';

const { paymentIntent, ephemeralKey, customer } = await firstValueFrom(
  this.http.post<{
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
  }>(environment.api + 'intent', {}),
);

await Stripe.createPaymentFlow({
  paymentIntentClientSecret: paymentIntent,
  customerEphemeralKeySecret: ephemeralKey,
  customerId: customer,
  merchantDisplayName: 'rdlabo',
});
```

<!-- !::createPaymentFlow:: -->
<!-- !::CreatePaymentFlowOption:: -->

iOS で PayPal、3D Secure などのリダイレクト型の支払い方法を使うには、`returnURL` と `handleURLCallback` を設定してください。戻り先 URL がない場合、Stripe は本来利用条件を満たすリダイレクト型の支払い方法も表示しません。[iOS のリダイレクト型の支払い方法](/docs/initialize#redirect-based-payment-methods-on-ios)を参照してください。

v8.3.0 以降では、作成時のオプションに `allowsDelayedPaymentMethods: true` を設定すると、iOS と Android で ACH や SEPA Debit などの利用条件を満たす遅延型の支払い方法を有効にできます。既定値は `false` で、Web には影響しません。Stripe 側で支払い方法を有効にし、Intent も適切に設定してください。`Completed` が返っても支払いが処理中の場合があります。商品の発送やサービスの提供は、支払い成功の Webhook を受信してから行ってください。[Stripe の遅延型支払い方法のガイド](https://docs.stripe.com/payments/mobile/accept-payment?platform=ios&type=payment#handle-post-payment-events)を参照してください。

## 2. presentPaymentFlow

`createPaymentFlow` が成功した後だけ呼び出します。返される `cardNumber` はマスク済みで、この時点では Intent は未確定です。

```ts
const presentResult = await Stripe.presentPaymentFlow();
console.log(presentResult); // { cardNumber: "●●●● ●●●● ●●●● ****" }
```

<!-- !::presentPaymentFlow:: -->

利用者がキャンセルすると Promise が拒否されるか `Canceled` が発生します。`Created` または成功結果を受け取るまで `confirmPaymentFlow` を呼ばないでください。

## 3. confirmPaymentFlow

```ts
const confirmResult = await Stripe.confirmPaymentFlow();
if (confirmResult.paymentResult === PaymentFlowEventsEnum.Completed) {
  // UI だけを更新します。商品発送やサービス提供の前に、サーバーで Webhook を使って支払い成功を確認してください。
}
```

<!-- !::confirmPaymentFlow:: -->
<!-- !::PaymentFlowResultInterface:: -->

`Canceled` はキャンセル、`Failed` はエラーです。クライアントの結果だけで商品の発送やサービスの提供を判断してはいけません。

## 4. addListener

結果リスナーは起動時に一度だけ登録します。Android Activity の再生成後は `Created` を含め、Promise よりイベントを優先してください。[イベントリスナー](/docs/learn/event-listeners)を参照してください。

```ts
await Promise.all([
  Stripe.addListener(PaymentFlowEventsEnum.Created, (info) => {
    console.log(info.cardNumber);
  }),
  Stripe.addListener(PaymentFlowEventsEnum.Completed, () => {
    console.log('PaymentFlowEventsEnum.Completed');
  }),
  Stripe.addListener(PaymentFlowEventsEnum.Canceled, () => {
    console.log('PaymentFlowEventsEnum.Canceled');
  }),
  Stripe.addListener(PaymentFlowEventsEnum.Failed, (error) => {
    console.log('PaymentFlowEventsEnum.Failed', error);
  }),
]);
```

<!-- !::PaymentFlowEventsEnum:: -->

## 参考資料

- [独自UIで支払いを完了する（iOS）](https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#ios-flowcontroller)
- [独自UIで支払いを完了する（Android）](https://stripe.com/docs/payments/accept-a-payment?platform=android&ui=payment-sheet#android-flowcontroller)
