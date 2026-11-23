---
title: "Démarrage rapide en JavaScript natif"
code: []
scrollActiveLine: []
sourceRevision: "6b30155da6fe717905352f80435598c640bbb547d7cacc517779cdb9d57a3448"
---
Sur le Web, le plugin utilise les éléments personnalisés de `stripe-pwa-elements`. Installez des versions compatibles des dépendances paires et enregistrez les éléments une seule fois au démarrage, avant d’afficher l’interface Stripe.

```bash
npm install @stripe/stripe-js@^9.17.0 stripe-pwa-elements@^4.1.0
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
