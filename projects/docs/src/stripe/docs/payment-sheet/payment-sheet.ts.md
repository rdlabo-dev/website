---
file: "payment-sheet.ts"
---

```ts
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';

(async () => {
  await Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
    console.log('PaymentSheetEventsEnum.Completed');
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

  // prepare PaymentSheet with CreatePaymentSheetOption.
  await Stripe.createPaymentSheet({
    paymentIntentClientSecret: paymentIntent,
    customerId: customer,
    customerEphemeralKeySecret: ephemeralKey,
  });

  // present PaymentSheet and get result.
  const result = await Stripe.presentPaymentSheet();
  if (result.paymentResult === PaymentSheetEventsEnum.Completed) {
    // Update UI only. Fulfill orders from a verified server webhook.
  }
})();
```
