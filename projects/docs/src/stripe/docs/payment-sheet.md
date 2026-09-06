---
title: "PaymentSheet"
code: ["/docs/stripe/payment-sheet/payment-sheet.ts.md"]
scrollActiveLine: []
---

PaymentSheet collects payment details and confirms the Intent in one presentation. If you need a pending card plus a later confirmation step, use [PaymentFlow](/docs/payment-flow).

[![Image from Gyazo](https://i.gyazo.com/4356878ec43a90178ec3d831d6b47b10.gif)](https://gyazo.com/4356878ec43a90178ec3d831d6b47b10)

Use a [PaymentIntent](https://stripe.com/docs/payments/payment-intents) to charge now, or a [SetupIntent](https://stripe.com/docs/payments/save-and-reuse?platform=web) to save a method for later. Create those objects on your server. See [Server Integration](/docs/server-integration).

## Platform support

| Platform | PaymentSheet |
| --- | --- |
| iOS | Native Stripe PaymentSheet |
| Android | Native Stripe PaymentSheet |
| Web | `stripe-pwa-elements` card modal |

Web does not render the native PaymentSheet. On web, `createPaymentSheet` uses `paymentIntentClientSecret` and optional `withZipCode`; the current web implementation does not support SetupIntents. Native-only options such as `defaultBillingDetails`, `shippingDetails`, `billingDetailsCollectionConfiguration`, `enableApplePay`, `enableGooglePay`, `style`, and `returnURL` are ignored.

## 1. createPaymentSheet

Fetch client-safe secrets from your backend, then call `createPaymentSheet`. The plugin does not talk to Stripe's secret API. Replace `/your-intent-endpoint` in the example with the backend URL from [Server Integration](/docs/server-integration).

On iOS and Android, provide **either** `paymentIntentClientSecret` **or** `setupIntentClientSecret`. On web, provide `paymentIntentClientSecret`. `customerId` and `customerEphemeralKeySecret` are optional together. If you set `customerId`, you must also set `customerEphemeralKeySecret`. A PaymentIntent without a Customer is valid; see the demo `intent/without-customer` shape in [Server Integration](/docs/server-integration).

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

Optional native settings include `style` (`alwaysLight` or `alwaysDark`, iOS only), `enableApplePay` with `applePayMerchantId`, `enableGooglePay`, `returnURL` for 3D Secure on iOS, and billing collection options. `withZipCode` is web only. `currencyCode` is required when `enableGooglePay` is true for a SetupIntent.

## 2. presentPaymentSheet

Call `presentPaymentSheet` only after `createPaymentSheet` succeeds.

```ts
const result = await Stripe.presentPaymentSheet();
if (result.paymentResult === PaymentSheetEventsEnum.Completed) {
  // Update UI only. Confirm the Intent with a webhook before fulfilling.
}
```

Treat `Canceled` as the customer dismissing the sheet. Treat `Failed` as an error. Neither result authorizes fulfillment by itself.

!::presentPaymentSheet::

!::PaymentSheetResultInterface::

## 3. addListener

Register result listeners once at application startup, before you present the sheet. Prefer events over the Promise after Android Activity recreation. See [Event Listeners](/docs/learn/event-listeners).

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

## Reference

- [Accept a payment (iOS)](https://stripe.com/docs/payments/accept-a-payment?platform=ios)
- [Accept a payment (Android)](https://stripe.com/docs/payments/accept-a-payment?platform=android)
