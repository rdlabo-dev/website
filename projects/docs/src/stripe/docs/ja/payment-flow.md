---
title: "PaymentFlow"
code: ["/docs/stripe/payment-flow/payment-flow.ts.md"]
scrollActiveLine: []
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

Web は `paymentIntentClientSecret` または `setupIntentClientSecret` と、任意の `withZipCode` に対応します。請求先情報、ウォレット、`style`、`returnURL` などのネイティブ専用オプションは Web では無視されます。

## 1. createPaymentFlow

バックエンドからクライアントへ安全に渡せるシークレットを取得し、`paymentIntentClientSecret` と `setupIntentClientSecret` の**どちらか一方**を渡します。例の `/your-intent-endpoint` は [サーバー連携](/docs/server-integration) で用意したバックエンドの URL に置き換えてください。`customerId` を設定する場合は `customerEphemeralKeySecret` も必要です。

```ts
import { PaymentFlowEventsEnum, Stripe } from '@capacitor-community/stripe';

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

await Stripe.createPaymentFlow({
  paymentIntentClientSecret: paymentIntent,
  customerEphemeralKeySecret: ephemeralKey,
  customerId: customer,
  merchantDisplayName: 'rdlabo',
});
```

!::createPaymentFlow::
!::CreatePaymentFlowOption::

## 2. presentPaymentFlow

`createPaymentFlow` が成功した後だけ呼び出します。返される `cardNumber` はマスク済みで、この時点では Intent は未確定です。

```ts
const presentResult = await Stripe.presentPaymentFlow();
console.log(presentResult); // { cardNumber: "●●●● ●●●● ●●●● ****" }
```

!::presentPaymentFlow::

利用者がキャンセルすると Promise が拒否されるか `Canceled` が発生します。`Created` または成功結果を受け取るまで `confirmPaymentFlow` を呼ばないでください。

## 3. confirmPaymentFlow

```ts
const confirmResult = await Stripe.confirmPaymentFlow();
if (confirmResult.paymentResult === PaymentFlowEventsEnum.Completed) {
  // Update UI only. Confirm the Intent with a webhook before fulfilling.
}
```

!::confirmPaymentFlow::
!::PaymentFlowResultInterface::

`Canceled` はキャンセル、`Failed` はエラーです。クライアント結果だけでは注文を確定できません。

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

!::PaymentFlowEventsEnum::

## 参考資料

- [独自UIで支払いを完了する（iOS）](https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#ios-flowcontroller)
- [独自UIで支払いを完了する（Android）](https://stripe.com/docs/payments/accept-a-payment?platform=android&ui=payment-sheet#android-flowcontroller)
