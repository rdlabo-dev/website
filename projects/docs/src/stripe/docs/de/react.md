---
title: "React-Schnellstart"
code: []
scrollActiveLine: []
sourceRevision: "b1249b8c28f1c10d721701653853a374c62de1eee0e54a6b5c3cf73a50123b74"
---
Umschließen Sie die Anwendung mit `CapacitorStripeProvider`. Der Provider ruft `Stripe.initialize` auf, prüft die Verfügbarkeit von Apple Pay und Google Pay und registriert im Web `stripe-pwa-elements`.

```tsx:App.tsx
import { CapacitorStripeProvider } from '@capacitor-community/stripe/react';

const App: React.FC = () => (
  <CapacitorStripeProvider
    publishableKey="Your Publishable Key"
    fallback={<p>Loading...</p>}
  >
    <IonApp>{/* ... */}</IonApp>
  </CapacitorStripeProvider>
);

export default App;
```

`CapacitorStripeProvider` akzeptiert außerdem das optionale `stripeAccount` für [Stripe Connect](https://stripe.com/docs/connect/authentication).

## Den Stripe-Client verwenden

Lesen Sie den initialisierten Client mit `useCapacitorStripe` aus. Das zurückgegebene Objekt `stripe` ist dieselbe Plugin-Instanz wie `Stripe` aus `@capacitor-community/stripe`.

```ts
import { useCapacitorStripe } from '@capacitor-community/stripe/react';

export const PaymentSheet: React.FC = () => {
  const { stripe, isApplePayAvailable, isGooglePayAvailable } = useCapacitorStripe();
  // ...
};
```

```tsx
export const PaymentSheet: React.FC = () => {
  const { stripe } = useCapacitorStripe();
  return (
    <button
      onClick={async () => {
        await stripe.createPaymentSheet({
          paymentIntentClientSecret,
          merchantDisplayName: 'App Name',
        });
        await stripe.presentPaymentSheet();
      }}
    >
      Pay
    </button>
  );
};
```

Registrieren Sie Ergebnis-Listener einmal beim Anwendungsstart, nicht innerhalb eines Zahlungs-Schaltflächenhandlers. Siehe [Ereignis-Listener](/docs/learn/event-listeners).

Die offizielle React-Demo befindet sich unter [capacitor-community/stripe/demo/react](https://github.com/capacitor-community/stripe/tree/v8.3.0/demo/react).
