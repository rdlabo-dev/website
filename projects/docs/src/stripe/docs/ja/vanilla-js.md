---
title: "Vanilla JS クイックスタート"
code: []
scrollActiveLine: []
---

Web では `stripe-pwa-elements` のカスタム要素を使用します。互換性のある peer dependency をインストールし、起動時に要素を一度だけ登録してから Stripe の UI を表示します。

```bash
npm install @stripe/stripe-js@^9.17.0 stripe-pwa-elements@^4.1.0
```

```ts
import { defineCustomElements } from 'stripe-pwa-elements/loader';
import { Stripe } from '@capacitor-community/stripe';

defineCustomElements();

await Stripe.initialize({
  publishableKey: 'Your Publishable Key',
});
```

`stripe-pwa-elements` は Stencil ライブラリです。ローダーの詳細は [Stencil のドキュメント](https://stenciljs.com/docs/overview)を参照してください。

Web の PaymentSheet と PaymentFlow は、ネイティブの Stripe PaymentSheet ではなくカード入力モーダルを表示します。Apple Pay と Google Pay は Payment Request Button を使用し、HTTPS が必要です。`defaultBillingDetails`、`billingDetailsCollectionConfiguration`、`enableApplePay`、`enableGooglePay` など、ネイティブ専用の多くのオプションは Web では無視されます。
