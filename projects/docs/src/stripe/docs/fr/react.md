---
title: "Démarrage rapide avec React"
code: []
scrollActiveLine: []
sourceRevision: "686dbe24dfa42de83cfd6a29f7ff305580284f2cee7a2ddfd6046653722e792a"
---
Enveloppez l’application dans `CapacitorStripeProvider`. Ce provider appelle `Stripe.initialize`, vérifie la disponibilité d’Apple Pay et de Google Pay et enregistre `stripe-pwa-elements` sur le Web.

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

`CapacitorStripeProvider` accepte également l’option facultative `stripeAccount` pour [Stripe Connect](https://stripe.com/docs/connect/authentication).

## Utiliser le client Stripe

Accédez au client initialisé avec `useCapacitorStripe`. L’objet `stripe` renvoyé est la même instance de plugin que `Stripe` importé depuis `@capacitor-community/stripe`.

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

Enregistrez les écouteurs de résultat une seule fois au démarrage de l’application, pas dans le gestionnaire d’un bouton de paiement. Consultez [Écouteurs d’événements](/docs/learn/event-listeners).

Ensuite : créez un Intent de test sur votre serveur ([Intégration serveur](/docs/server-integration)), puis présentez [PaymentSheet](/docs/payment-sheet).

La démonstration React officielle se trouve dans [capacitor-community/stripe/demo/react](https://github.com/capacitor-community/stripe/tree/main/demo/react).
