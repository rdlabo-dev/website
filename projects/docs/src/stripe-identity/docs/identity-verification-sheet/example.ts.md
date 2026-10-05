```ts:example.ts
import {
  IdentityVerificationSheetEventsEnum,
  StripeIdentity,
} from '@capacitor-community/stripe-identity';

const verificationResultListener = await StripeIdentity.addListener(
  IdentityVerificationSheetEventsEnum.VerificationResult,
  (verification) => {
    if (verification.result === IdentityVerificationSheetEventsEnum.Completed) {
      // Documents were submitted. Confirm the outcome with webhooks.
    } else if (verification.result === IdentityVerificationSheetEventsEnum.Canceled) {
      // The user dismissed the sheet. Allow them to try again.
    } else if (verification.result === IdentityVerificationSheetEventsEnum.Failed) {
      console.error(verification.error?.message);
    }
  },
);

const failedToLoadListener = await StripeIdentity.addListener(
  IdentityVerificationSheetEventsEnum.FailedToLoad,
  (error) => {
    // iOS follows StripeIdentityError; Android v8.3.0 currently emits `error`.
    const message = error.message ?? (error as unknown as { error?: string }).error;
    console.error(message);
  },
);

await StripeIdentity.initialize({
  publishableKey,
});

const response = await fetch('https://example.com/identify', { method: 'POST' });
const { verificationId, ephemeralKeySecret, clientSecret } = await response.json();

await StripeIdentity.create({
  verificationId,
  ephemeralKeySecret,
  clientSecret,
});

await StripeIdentity.present();

// Keep verificationResultListener and failedToLoadListener until their owner is destroyed.
```
