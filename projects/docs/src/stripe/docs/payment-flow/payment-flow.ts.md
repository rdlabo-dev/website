---
file: "payment-flow.ts"
---

```ts
import { PaymentFlowEventsEnum, Stripe } from '@capacitor-community/stripe';

(async () => {
  await Stripe.addListener(PaymentFlowEventsEnum.Completed, () => {
    console.log('PaymentFlowEventsEnum.Completed');
  });

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

  // Prepare PaymentFlow with CreatePaymentFlowOption.
  await Stripe.createPaymentFlow({
    paymentIntentClientSecret: paymentIntent,
    // setupIntentClientSecret: setupIntent,
    customerEphemeralKeySecret: ephemeralKey,
    customerId: customer,
  });

  // Collect payment details. The Intent is not confirmed yet.
  const presentResult = await Stripe.presentPaymentFlow();
  console.log(presentResult); // { cardNumber: "●●●● ●●●● ●●●● ****" }

  // Confirm PaymentFlow. Completed.
  const confirmResult = await Stripe.confirmPaymentFlow();
  if (confirmResult.paymentResult === PaymentFlowEventsEnum.Completed) {
    // Update UI only. Fulfill orders from a verified server webhook.
  }
})();
```
