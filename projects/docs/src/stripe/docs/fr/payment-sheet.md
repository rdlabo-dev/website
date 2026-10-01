---
title: "PaymentSheet"
code: ["/docs/stripe/payment-sheet/payment-sheet.ts.md"]
scrollActiveLine: []
sourceRevision: "2ad63baa378ddc42d209135d2788e5e1aa5d5485298be8f515af52c582fc63b3"
---
PaymentSheet recueille les informations de paiement et confirme l’Intent en une seule présentation. Pour obtenir une carte en attente avec une confirmation ultérieure, utilisez [PaymentFlow](/docs/payment-flow).

[![Image provenant de Gyazo](https://i.gyazo.com/4356878ec43a90178ec3d831d6b47b10.gif)](https://gyazo.com/4356878ec43a90178ec3d831d6b47b10)

Utilisez un [PaymentIntent](https://stripe.com/docs/payments/payment-intents) pour débiter immédiatement, ou un [SetupIntent](https://stripe.com/docs/payments/save-and-reuse?platform=web) pour enregistrer un moyen de paiement pour plus tard. Créez ces objets sur votre serveur. Consultez [Intégration serveur](/docs/server-integration).

## Prise en charge des plateformes

| Plateforme | PaymentSheet |
| --- | --- |
| iOS | PaymentSheet natif de Stripe |
| Android | PaymentSheet natif de Stripe |
| Web | Modale de saisie de carte `stripe-pwa-elements` |

Le Web n’affiche pas le PaymentSheet natif. Sur le Web, `createPaymentSheet` utilise `paymentIntentClientSecret` et l’option facultative `withZipCode` ; l’implémentation Web actuelle ne prend pas en charge les SetupIntents. Les options réservées au natif, comme `defaultBillingDetails`, `shippingDetails`, `billingDetailsCollectionConfiguration`, `enableApplePay`, `enableGooglePay`, `style` et `returnURL`, sont ignorées.

## 1. createPaymentSheet

Récupérez les secrets utilisables côté client depuis votre backend, puis appelez `createPaymentSheet`. Le plugin ne communique pas avec l’API secrète de Stripe. Remplacez `/your-intent-endpoint` dans l’exemple par l’URL du backend présentée dans [Intégration serveur](/docs/server-integration).

Sur iOS et Android, fournissez **soit** `paymentIntentClientSecret`, **soit** `setupIntentClientSecret`. Sur le Web, fournissez `paymentIntentClientSecret`. `customerId` et `customerEphemeralKeySecret` sont facultatifs ensemble. Si vous définissez `customerId`, vous devez également définir `customerEphemeralKeySecret`. Un PaymentIntent sans Customer est valide ; consultez la structure de démonstration `intent/without-customer` dans [Intégration serveur](/docs/server-integration).

```ts
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';

// Remplacez `/your-intent-endpoint` par votre backend décrit dans Intégration serveur.
const response = await fetch('/your-intent-endpoint', {
  method: 'POST',
});
if (!response.ok) {
  throw new Error(`Intent request failed: ${response.status}`);
}
const { paymentIntent, ephemeralKey, customer } = (await response.json()) as {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
};

await Stripe.createPaymentSheet({
  paymentIntentClientSecret: paymentIntent,
  customerId: customer,
  customerEphemeralKeySecret: ephemeralKey,
  merchantDisplayName: 'rdlabo',
});
```

!::createPaymentSheet::

!::CreatePaymentSheetOption::

Les paramètres natifs facultatifs comprennent `style` (`alwaysLight` ou `alwaysDark`, sur iOS seulement), `enableApplePay` avec `applePayMerchantId`, `enableGooglePay`, `returnURL` pour 3D Secure sur iOS et les options de collecte des informations de facturation. `withZipCode` est réservé au Web. `currencyCode` est obligatoire lorsque `enableGooglePay` est activé pour un SetupIntent.

## 2. presentPaymentSheet

Appelez `presentPaymentSheet` uniquement après la réussite de `createPaymentSheet`.

```ts
const result = await Stripe.presentPaymentSheet();
if (result.paymentResult === PaymentSheetEventsEnum.Completed) {
  // Mettez uniquement l’interface à jour. Confirmez l’Intent par webhook avant d’exécuter la commande.
}
```

Traitez `Canceled` comme la fermeture de la feuille par le client et `Failed` comme une erreur. Aucun de ces résultats n’autorise à lui seul l’exécution d’une commande.

!::presentPaymentSheet::

!::PaymentSheetResultInterface::

## 3. addListener

Enregistrez les écouteurs de résultat une seule fois au démarrage de l’application, avant de présenter la feuille. Préférez les événements à la Promise après une recréation de l’Activity Android. Consultez [Écouteurs d’événements](/docs/learn/event-listeners).

```ts
await Promise.all([
  Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
    console.log('PaymentSheetEventsEnum.Completed');
  }),
  Stripe.addListener(PaymentSheetEventsEnum.Canceled, () => {
    console.log('PaymentSheetEventsEnum.Canceled');
  }),
  Stripe.addListener(PaymentSheetEventsEnum.Failed, (error) => {
    console.log('PaymentSheetEventsEnum.Failed', error);
  }),
]);
```

!::PaymentSheetEventsEnum::

## Référence

- [Accepter un paiement (iOS)](https://stripe.com/docs/payments/accept-a-payment?platform=ios)
- [Accepter un paiement (Android)](https://stripe.com/docs/payments/accept-a-payment?platform=android)
