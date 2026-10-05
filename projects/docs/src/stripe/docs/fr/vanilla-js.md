---
title: "Démarrage rapide en JavaScript natif"
code: []
scrollActiveLine: []
sourceRevision: "5e2e959c9cdfa8f833f6c8ca68d7aac9083ae3adc0a77b653737e1c677cc0290"
---
Sur le Web, le plugin utilise les éléments personnalisés de `stripe-pwa-elements`. Installez la dépendance pair et enregistrez les éléments une seule fois au démarrage, avant de présenter l’interface Stripe.

```bash
npm install stripe-pwa-elements
```

```ts
import { defineCustomElements } from 'stripe-pwa-elements/loader';
import { Stripe } from '@capacitor-community/stripe';

defineCustomElements();

await Stripe.initialize({
  publishableKey: 'Your Publishable Key',
});
```

`stripe-pwa-elements` est une bibliothèque Stencil. Pour en savoir plus sur le chargeur, consultez la [documentation Stencil](https://stenciljs.com/docs/overview).

Sur le Web, PaymentSheet et PaymentFlow affichent une modale de saisie de carte, pas le PaymentSheet natif de Stripe. Apple Pay et Google Pay utilisent le Payment Request Button et nécessitent HTTPS. De nombreuses options réservées au natif, comme `defaultBillingDetails`, `billingDetailsCollectionConfiguration`, `enableApplePay` et `enableGooglePay`, sont ignorées sur le Web.
