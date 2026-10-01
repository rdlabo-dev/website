---
title: "Vanilla-JS-Schnellstart"
code: []
scrollActiveLine: []
sourceRevision: "6c2fbecf05bf9340bdf53bef1b7ca9707660d7c158490b584a4ee40e24435117"
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

Als Nächstes erstellen Sie auf Ihrem Server einen Test-Intent ([Serverintegration](/docs/server-integration)) und zeigen anschließend [PaymentSheet](/docs/payment-sheet) an.
