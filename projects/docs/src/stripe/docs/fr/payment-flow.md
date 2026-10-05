---
title: "PaymentFlow"
code: ["/docs/stripe/payment-flow/payment-flow.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{}},{"id":"1.-createpaymentflow","activeLine":{"payment-flow.ts":[9,23]}},{"id":"2.-presentpaymentflow","activeLine":{"payment-flow.ts":[23,27]}},{"id":"3.-confirmpaymentflow","activeLine":{"payment-flow.ts":[27,33]}},{"id":"4.-addlistener","activeLine":{"payment-flow.ts":[4,8]}}]
sourceRevision: "01952aa2aa51dc02de4b479714421c9d37805d9d52b0c6f5b9f2a1607df92e75"
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

Récupérez les secrets utilisables côté client depuis votre backend, puis appelez `createPaymentFlow`.  Fournissez **soit** `paymentIntentClientSecret`, **soit** `setupIntentClientSecret`. `customerId` et `customerEphemeralKeySecret` sont facultatifs ensemble. Si vous définissez `customerId`, vous devez également définir `customerEphemeralKeySecret`.

```ts
import { firstValueFrom } from 'rxjs';
import { PaymentFlowEventsEnum, Stripe } from '@capacitor-community/stripe';

const { paymentIntent, ephemeralKey, customer } = await firstValueFrom(
  this.http.post<{
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
  }>(environment.api + 'intent', {}),
);

await Stripe.createPaymentFlow({
  paymentIntentClientSecret: paymentIntent,
  customerEphemeralKeySecret: ephemeralKey,
  customerId: customer,
  merchantDisplayName: 'rdlabo',
});
```

<!-- !::createPaymentFlow:: -->

<!-- !::CreatePaymentFlowOption:: -->

Sur iOS, configurez `returnURL` et `handleURLCallback` pour PayPal, 3D Secure et les autres moyens de paiement avec redirection ; Stripe ne propose pas les moyens avec redirection autrement admissibles lorsqu’aucune URL de retour n’est disponible. Consultez [Moyens de paiement avec redirection sur iOS](/docs/initialize#redirect-based-payment-methods-on-ios).

Depuis la v8.3.0, définissez `allowsDelayedPaymentMethods: true` dans les options de création pour autoriser les moyens de paiement différés admissibles, comme ACH et SEPA Debit, sur iOS et Android. La valeur par défaut est `false` ; cette option n’a aucun effet sur le Web. Activez ces moyens de paiement dans Stripe et configurez l’Intent en conséquence. Un résultat `Completed` peut signifier que le paiement est encore en cours de traitement : attendez un webhook confirmant la réussite du paiement avant d’exécuter la commande. Consultez le [guide Stripe sur les moyens de paiement différés](https://docs.stripe.com/payments/mobile/accept-payment?platform=ios&type=payment#handle-post-payment-events).

## 2. presentPaymentFlow

Appelez `presentPaymentFlow` uniquement après la réussite de `createPaymentFlow`. Le `cardNumber` renvoyé est masqué. L’Intent n’est pas encore confirmé.

```ts
const presentResult = await Stripe.presentPaymentFlow();
console.log(presentResult); // { cardNumber: "●●●● ●●●● ●●●● ****" }
```

<!-- !::presentPaymentFlow:: -->

Si le client annule, la Promise est rejetée ou l’événement `Canceled` est émis. N’appelez pas `confirmPaymentFlow` avant `Created` ou un résultat réussi de `presentPaymentFlow`.

## 3. confirmPaymentFlow

```ts
const confirmResult = await Stripe.confirmPaymentFlow();
if (confirmResult.paymentResult === PaymentFlowEventsEnum.Completed) {
  // Mettez uniquement l’interface à jour. Vérifiez la réussite du paiement sur votre serveur par webhook avant d’exécuter la commande.
}
```

<!-- !::confirmPaymentFlow:: -->

<!-- !::PaymentFlowResultInterface:: -->

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

<!-- !::PaymentFlowEventsEnum:: -->

## Référence

- [Terminer le paiement dans votre propre interface (iOS)](https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#ios-flowcontroller)
- [Terminer le paiement dans votre propre interface (Android)](https://stripe.com/docs/payments/accept-a-payment?platform=android&ui=payment-sheet#android-flowcontroller)
