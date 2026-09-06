---
title: "Apple Pay"
code: ["/docs/stripe/apple-pay/apple-pay.ts.md"]
scrollActiveLine: []
---

Apple Pay は一度の表示で PaymentIntent を確定します。

[Stripe: Apple Pay](https://stripe.com/docs/apple-pay)

[![動作イメージ](https://i.gyazo.com/d632147e6d3b33dcc8e28f3ecc898a99.gif)](https://gyazo.com/d632147e6d3b33dcc8e28f3ecc898a99)

## プラットフォーム対応

| プラットフォーム | Apple Pay |
| --- | --- |
| iOS | ネイティブ `STPApplePayContext` |
| Android | 未実装 |
| Web | Payment Request Button（`stripe-pwa-elements`） |

`updateApplePaySheet` と配送先の更新は iOS 専用です。Web の `updateApplePaySheet` は未実装エラーとなり、Android の `isApplePayAvailable`、`createApplePay`、`presentApplePay` は拒否されます。

## 事前設定

- Apple Merchant ID を登録する
- Apple Pay 証明書を作成する
- Xcode で Apple Pay を有効にする

[Stripe の Merchant ID 設定](https://stripe.com/docs/apple-pay#merchantid)を参照してください。

`createApplePay` の `merchantIdentifier` には、[Apple Developer](https://developer.apple.com/account/resources/identifiers/add/merchant) アカウントと Xcode に登録したものと同じ Merchant ID を指定します。`merchantDisplayName` は PaymentSheet と PaymentFlow のオプションであり、ここでは渡しません。

## 1. isApplePayAvailable

リクエスト作成前に端末を確認します。Apple Pay が利用可能なら Promise が解決し、それ以外は拒否されます。

```ts
import { ApplePayEventsEnum, Stripe } from '@capacitor-community/stripe';

try {
  await Stripe.isApplePayAvailable();
} catch {
  return;
}
```

!::isApplePayAvailable::

## 2. createApplePay

バックエンドから PaymentIntent のクライアントシークレットを取得します。例の `/your-intent-endpoint` は [サーバー連携](/docs/server-integration) で用意したバックエンドの URL に置き換えてください。その後 `paymentIntentClientSecret`、`paymentSummaryItems`、`merchantIdentifier`、`countryCode`、`currency` を渡します。

```ts
// Replace `/your-intent-endpoint` with your backend from Server Integration.
const response = await fetch('/your-intent-endpoint', {
  method: 'POST',
});
if (!response.ok) {
  throw new Error(`Intent request failed: ${response.status}`);
}
const { paymentIntent } = (await response.json()) as {
  paymentIntent: string;
};

await Stripe.createApplePay({
  paymentIntentClientSecret: paymentIntent,
  paymentSummaryItems: [{
    label: 'Product Name',
    amount: 1099.00
  }],
  merchantIdentifier: 'merchant.com.getcapacitor.stripe',
  countryCode: 'US',
  currency: 'USD',
});
```

!::createApplePay::
!::CreateApplePayOption::

`requiredShippingContactFields` は住所、電話、メール、氏名を Apple Pay に要求します。`allowedCountries` に含まれない配送先の国は拒否されます。

## 3. presentApplePay

```ts
const result = await Stripe.presentApplePay();
if (result.paymentResult === ApplePayEventsEnum.Completed) {
  // Update UI only. Confirm the Intent with a webhook before fulfilling.
}
```

!::presentApplePay::
!::ApplePayResultInterface::

`Canceled` はキャンセル、`Failed` はエラーとして扱います。

## 4. addListener

リスナーはアプリケーション起動時に登録します。[イベントリスナー](/docs/learn/event-listeners)を参照してください。

```ts
Stripe.addListener(ApplePayEventsEnum.Completed, () => {
  console.log('ApplePayEventsEnum.Completed');
});
```

!::ApplePayEventsEnum::

## 5. updateApplePaySheet

iOS の `DidSelectShippingContact` には `contact` と `updateId` が含まれます。合計を再計算し、その `updateId` で `updateApplePaySheet` を呼びます。JavaScript が応答しない場合、ネイティブシートは25秒後に元の明細へ戻ります。

```ts
Stripe.addListener(ApplePayEventsEnum.DidSelectShippingContact, async (data) => {
  await Stripe.updateApplePaySheet({
    updateId: data.updateId,
    paymentSummaryItems: [
      { label: 'Product Name', amount: 1099.00 },
      { label: 'Shipping', amount: 500.00 },
      { label: 'Total', amount: 1599.00 },
    ],
  });
});
```

!::updateApplePaySheet::
!::DidSelectShippingContact::
!::PaymentSummaryItem::

`DidCreatePaymentMethod` には Apple が支払い方法を作成した後の配送先が含まれます。Apple は支払い成功まで住所全体を返しません。

!::DidCreatePaymentMethod::
!::ShippingContact::

## 参考資料

- [Apple Pay（iOS）](https://stripe.com/docs/apple-pay)
- [Apple Pay シートの加盟店名](https://github.com/capacitor-community/stripe/issues/115)
