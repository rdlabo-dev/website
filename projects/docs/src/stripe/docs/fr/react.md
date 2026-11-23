---
title: "Démarrage rapide avec React"
code: []
scrollActiveLine: []
sourceRevision: "c3e2440972492b56bc0a067f3c718c6e0497993a20ee110a6cb259641f85fcdd"
---
Enveloppez l’application dans `CapacitorStripeProvider`. Ce provider appelle `Stripe.initialize`, vérifie la disponibilité d’Apple Pay et de Google Pay et enregistre `stripe-pwa-elements` sur le Web.

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

`CapacitorStripeProvider` accepte également l’option facultative `stripeAccount` pour [Stripe Connect](https://stripe.com/docs/connect/authentication).

Le fournisseur initialise uniquement Payment. Si votre application utilise Identity, Terminal ou Billing, initialisez-les séparément. Pour une compilation Web, installez les versions compatibles des dépendances paires.

```sh
npm install @stripe/stripe-js@^9.17.0 stripe-pwa-elements@^4.1.0
```

## Utiliser le client Stripe

Accédez au client initialisé avec `useCapacitorStripe`. L’objet `stripe` renvoyé est la même instance de plugin que `Stripe` importé depuis `@capacitor-community/stripe`.

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

Récupérez `paymentIntentClientSecret` auprès de votre backend après authentification. Consultez le guide [Intégration serveur](/docs/server-integration). Gérez les annulations et les échecs dans l’interface. Déclenchez la livraison du produit ou la fourniture du service à partir de webhooks vérifiés côté serveur.

Enregistrez les écouteurs de résultat une seule fois au démarrage de l’application, pas dans le gestionnaire d’un bouton de paiement. Consultez [Écouteurs d’événements](/docs/learn/event-listeners).

La démonstration React officielle se trouve dans [capacitor-community/stripe/demo/react](https://github.com/capacitor-community/stripe/tree/v8.4.0/demo/react).
