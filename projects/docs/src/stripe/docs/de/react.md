---
title: "React-Schnellstart"
code: []
scrollActiveLine: []
sourceRevision: "c3e2440972492b56bc0a067f3c718c6e0497993a20ee110a6cb259641f85fcdd"
---
Umschließen Sie die Anwendung mit `CapacitorStripeProvider`. Der Provider ruft `Stripe.initialize` auf, prüft die Verfügbarkeit von Apple Pay und Google Pay und registriert im Web `stripe-pwa-elements`.

```tsx:App.tsx
import { IonApp } from '@ionic/react';
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

Der Provider initialisiert ausschließlich Payment. Wenn Ihre Anwendung Identity, Terminal oder Billing verwendet, initialisieren Sie diese separat. Installieren Sie für Web-Builds die kompatiblen Peer-Abhängigkeiten.

```sh
npm install @stripe/stripe-js@^9.17.0 stripe-pwa-elements@^4.1.0
```

## Den Stripe-Client verwenden

Lesen Sie den initialisierten Client mit `useCapacitorStripe` aus. Das zurückgegebene Objekt `stripe` ist dieselbe Plugin-Instanz wie `Stripe` aus `@capacitor-community/stripe`.

```tsx
import { useCapacitorStripe } from '@capacitor-community/stripe/react';

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

Rufen Sie `paymentIntentClientSecret` über Ihr Backend mit Authentifizierung ab. Siehe [Serverintegration](/docs/server-integration). Behandeln Sie Abbrüche und Fehler in der Oberfläche. Liefern Sie Waren oder schalten Sie Leistungen erst auf Grundlage serverseitig verifizierter Webhooks frei.

Registrieren Sie Ergebnis-Listener einmal beim Anwendungsstart, nicht innerhalb eines Zahlungs-Schaltflächenhandlers. Siehe [Ereignis-Listener](/docs/learn/event-listeners).

Die offizielle React-Demo befindet sich unter [capacitor-community/stripe/demo/react](https://github.com/capacitor-community/stripe/tree/v8.4.0/demo/react).
