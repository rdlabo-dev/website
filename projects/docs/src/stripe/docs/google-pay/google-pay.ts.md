---
file: "google-pay.ts"
---

```ts
import { GooglePayEventsEnum, Stripe } from '@capacitor-community/stripe';

(async () => {
  try {
    await Stripe.isGooglePayAvailable();
  } catch {
    return;
  }

  await Stripe.addListener(GooglePayEventsEnum.Completed, () => {
    console.log('GooglePayEventsEnum.Completed');
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

  // Prepare Google Pay
  await Stripe.createGooglePay({
    paymentIntentClientSecret: paymentIntent,

    // Web only. Google Pay on Android App doesn't need
    paymentSummaryItems: [{
      label: 'Product Name',
      amount: 1099.00
    }],
    merchantIdentifier: 'merchant.com.getcapacitor.stripe',
    countryCode: 'US',
    currency: 'USD',
  });

  // Present Google Pay
  const result = await Stripe.presentGooglePay();
  if (result.paymentResult === GooglePayEventsEnum.Completed) {
    // Update UI only. Fulfill orders from a verified server webhook.
  }
})();
```
