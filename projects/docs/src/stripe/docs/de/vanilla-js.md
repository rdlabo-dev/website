---
title: "Vanilla-JS-Schnellstart"
code: []
scrollActiveLine: []
sourceRevision: "6b30155da6fe717905352f80435598c640bbb547d7cacc517779cdb9d57a3448"
---
Im Web verwendet das Plugin die Custom Elements von `stripe-pwa-elements`. Installieren Sie die kompatiblen Peer-Abhängigkeiten und registrieren Sie die Elemente einmal beim Start, bevor Sie die Stripe-Oberfläche anzeigen.

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

`stripe-pwa-elements` ist eine Stencil-Bibliothek. Einzelheiten zum Loader finden Sie in der [Stencil-Dokumentation](https://stenciljs.com/docs/overview).

Web-PaymentSheet und -PaymentFlow rendern ein Karten-Modal, nicht das native Stripe-PaymentSheet. Apple Pay und Google Pay verwenden den Payment Request Button und benötigen HTTPS. Viele ausschließlich native Optionen wie `defaultBillingDetails`, `billingDetailsCollectionConfiguration`, `enableApplePay` und `enableGooglePay` werden im Web ignoriert.
