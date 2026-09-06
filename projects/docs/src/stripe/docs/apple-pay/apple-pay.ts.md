---
file: "apple-pay.ts"
---

```ts
import { ApplePayEventsEnum, Stripe } from '@capacitor-community/stripe';

(async () => {
  try {
    await Stripe.isApplePayAvailable();
  } catch {
    return;
  }

  await Stripe.addListener(ApplePayEventsEnum.Completed, () => {
    console.log('ApplePayEventsEnum.Completed');
  });

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

  // Prepare Apple Pay
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

  // Present Apple Pay
  const result = await Stripe.presentApplePay();
  if (result.paymentResult === ApplePayEventsEnum.Completed) {
    // Update UI only. Fulfill orders from a verified server webhook.
  }
})();
```
