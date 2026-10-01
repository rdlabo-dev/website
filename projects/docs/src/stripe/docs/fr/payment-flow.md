---
title: "PaymentFlow"
code: ["/docs/stripe/payment-flow/payment-flow.ts.md"]
scrollActiveLine: []
sourceRevision: "6270181187dde0ae5023a09719b9a86101fb7b5d0efddfe967b66fb185dd72cd"
---
PaymentFlow sépare la collecte et la confirmation. `presentPaymentFlow` recueille le moyen de paiement et renvoie une carte en attente. `confirmPaymentFlow` confirme l’Intent plus tard, généralement après un écran de vérification.

[![Image provenant de Gyazo](https://i.gyazo.com/736450bb2e267eab0bba578e366fcba5.gif)](https://gyazo.com/736450bb2e267eab0bba578e366fcba5)

Utilisez un [PaymentIntent](https://stripe.com/docs/payments/payment-intents) ou un [SetupIntent](https://stripe.com/docs/payments/save-and-reuse?platform=web). Créez ces objets sur votre serveur. Consultez [Intégration serveur](/docs/server-integration).

## Prise en charge des plateformes

| Plateforme | PaymentFlow |
| --- | --- |
| iOS | PaymentSheet.FlowController natif |
| Android | PaymentSheet.FlowController natif |
| Web | Modale de saisie de carte `stripe-pwa-elements` |

Sur le Web, le plugin prend en charge `paymentIntentClientSecret` ou `setupIntentClientSecret`, ainsi que l’option facultative `withZipCode`. Les options réservées au natif, comme `defaultBillingDetails`, `shippingDetails`, `billingDetailsCollectionConfiguration`, `enableApplePay`, `enableGooglePay`, `style` et `returnURL`, sont ignorées sur le Web.

## 1. createPaymentFlow

Récupérez les secrets utilisables côté client depuis votre backend, puis appelez `createPaymentFlow`. Remplacez `/your-intent-endpoint` dans l’exemple par l’URL du backend présentée dans [Intégration serveur](/docs/server-integration). Fournissez **soit** `paymentIntentClientSecret`, **soit** `setupIntentClientSecret`. `customerId` et `customerEphemeralKeySecret` sont facultatifs ensemble. Si vous définissez `customerId`, vous devez également définir `customerEphemeralKeySecret`.

```ts
import { PaymentFlowEventsEnum, Stripe } from '@capacitor-community/stripe';

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

await Stripe.createPaymentFlow({
  paymentIntentClientSecret: paymentIntent,
  customerEphemeralKeySecret: ephemeralKey,
  customerId: customer,
  merchantDisplayName: 'rdlabo',
});
```

!::createPaymentFlow::

!::CreatePaymentFlowOption::

## 2. presentPaymentFlow

Appelez `presentPaymentFlow` uniquement après la réussite de `createPaymentFlow`. Le `cardNumber` renvoyé est masqué. L’Intent n’est pas encore confirmé.

```ts
const presentResult = await Stripe.presentPaymentFlow();
console.log(presentResult); // { cardNumber: "●●●● ●●●● ●●●● ****" }
```

!::presentPaymentFlow::

Si le client annule, la Promise est rejetée ou l’événement `Canceled` est émis. N’appelez pas `confirmPaymentFlow` avant `Created` ou un résultat réussi de `presentPaymentFlow`.

## 3. confirmPaymentFlow

```ts
const confirmResult = await Stripe.confirmPaymentFlow();
if (confirmResult.paymentResult === PaymentFlowEventsEnum.Completed) {
  // Mettez uniquement l’interface à jour. Confirmez l’Intent par webhook avant d’exécuter la commande.
}
```

!::confirmPaymentFlow::

!::PaymentFlowResultInterface::

Traitez `Canceled` comme une annulation et `Failed` comme une erreur. Aucun de ces résultats n’autorise à lui seul l’exécution d’une commande.

## 4. addListener

Enregistrez les écouteurs de résultat une seule fois au démarrage de l’application. Préférez les événements à la Promise après une recréation de l’Activity Android, y compris l’événement `Created`. Consultez [Écouteurs d’événements](/docs/learn/event-listeners).

```ts
await Promise.all([
  Stripe.addListener(PaymentFlowEventsEnum.Created, (info) => {
    console.log(info.cardNumber);
  }),
  Stripe.addListener(PaymentFlowEventsEnum.Completed, () => {
    console.log('PaymentFlowEventsEnum.Completed');
  }),
  Stripe.addListener(PaymentFlowEventsEnum.Canceled, () => {
    console.log('PaymentFlowEventsEnum.Canceled');
  }),
  Stripe.addListener(PaymentFlowEventsEnum.Failed, (error) => {
    console.log('PaymentFlowEventsEnum.Failed', error);
  }),
]);
```

!::PaymentFlowEventsEnum::

## Référence

- [Terminer le paiement dans votre propre interface (iOS)](https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#ios-flowcontroller)
- [Terminer le paiement dans votre propre interface (Android)](https://stripe.com/docs/payments/accept-a-payment?platform=android&ui=payment-sheet#android-flowcontroller)
