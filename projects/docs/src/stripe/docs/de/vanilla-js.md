---
title: "Vanilla-JS-Schnellstart"
code: []
scrollActiveLine: []
sourceRevision: "5e2e959c9cdfa8f833f6c8ca68d7aac9083ae3adc0a77b653737e1c677cc0290"
---
Die Web-Version verwendet Custom Elements aus `stripe-pwa-elements`. Installieren Sie die Peer-Abhängigkeit und registrieren Sie die Elemente beim Bootstrap einmal, bevor Sie die Stripe-UI anzeigen.

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

`stripe-pwa-elements` ist eine Stencil-Bibliothek. Einzelheiten zum Loader finden Sie in der [Stencil-Dokumentation](https://stenciljs.com/docs/overview).

Web-PaymentSheet und -PaymentFlow rendern ein Karten-Modal, nicht das native Stripe-PaymentSheet. Apple Pay und Google Pay verwenden den Payment Request Button und benötigen HTTPS. Viele ausschließlich native Optionen wie `defaultBillingDetails`, `billingDetailsCollectionConfiguration`, `enableApplePay` und `enableGooglePay` werden im Web ignoriert.
