---
title: "PaymentSheet"
code: ["/docs/stripe/payment-sheet/payment-sheet.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{}},{"id":"1.-createpaymentsheet","activeLine":{"payment-sheet.ts":[9,22]}},{"id":"2.-presentpaymentsheet","activeLine":{"payment-sheet.ts":[22,28]}},{"id":"3.-addlistener","activeLine":{"payment-sheet.ts":[4,8]}}]
sourceRevision: "2ef0f896a6b2286f80cef952b32ae1c8a7ce6140ef3014406df1847915897203"
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

Récupérez les secrets utilisables côté client depuis votre backend, puis appelez `createPaymentSheet`. Le plugin ne communique pas avec l’API secrète de Stripe. Utilisez `HttpClient`, `fetch` ou tout autre client HTTP.

Sur iOS et Android, fournissez **soit** `paymentIntentClientSecret`, **soit** `setupIntentClientSecret`. Sur le Web, fournissez `paymentIntentClientSecret`. `customerId` et `customerEphemeralKeySecret` sont facultatifs ensemble. Si vous définissez `customerId`, vous devez également définir `customerEphemeralKeySecret`. Un PaymentIntent sans Customer est valide ; consultez la structure de démonstration `intent/without-customer` dans [Intégration serveur](/docs/server-integration).

```ts
import { firstValueFrom } from 'rxjs';
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';

const { paymentIntent, ephemeralKey, customer } = await firstValueFrom(
  this.http.post<{
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
  }>(environment.api + 'intent', {}),
);

await Stripe.createPaymentSheet({
  paymentIntentClientSecret: paymentIntent,
  customerId: customer,
  customerEphemeralKeySecret: ephemeralKey,
  merchantDisplayName: 'rdlabo',
});
```

<!-- !::createPaymentSheet:: -->

<!-- !::CreatePaymentSheetOption:: -->

Les paramètres natifs facultatifs comprennent `style` (`alwaysLight` ou `alwaysDark`, sur iOS seulement), `enableApplePay` avec `applePayMerchantId`, `enableGooglePay` et les options de collecte des informations de facturation. Sur iOS, configurez `returnURL` et `handleURLCallback` pour PayPal, 3D Secure et les autres moyens de paiement avec redirection ; Stripe ne propose pas les moyens avec redirection autrement admissibles lorsqu’aucune URL de retour n’est disponible. Consultez [Moyens de paiement avec redirection sur iOS](/docs/initialize#redirect-based-payment-methods-on-ios). `withZipCode` est réservé au Web. `currencyCode` est obligatoire lorsque `enableGooglePay` est activé pour un SetupIntent.

Depuis la v8.3.0, définissez `allowsDelayedPaymentMethods: true` dans les options de création pour autoriser les moyens de paiement différés admissibles, comme ACH et SEPA Debit, sur iOS et Android. La valeur par défaut est `false` ; cette option n’a aucun effet sur le Web. Activez ces moyens de paiement dans Stripe et configurez l’Intent en conséquence. Un résultat `Completed` peut signifier que le paiement est encore en cours de traitement : attendez un webhook confirmant la réussite du paiement avant d’exécuter la commande. Consultez le [guide Stripe sur les moyens de paiement différés](https://docs.stripe.com/payments/mobile/accept-payment?platform=ios&type=payment#handle-post-payment-events).

## 2. presentPaymentSheet

Appelez `presentPaymentSheet` uniquement après la réussite de `createPaymentSheet`.

```ts
const result = await Stripe.presentPaymentSheet();
if (result.paymentResult === PaymentSheetEventsEnum.Completed) {
  // Mettez uniquement l’interface à jour. Vérifiez la réussite du paiement sur votre serveur par webhook avant d’exécuter la commande.
}
```

Sur le Web, une annulation résout la Promise avec `paymentResult: PaymentSheetEventsEnum.Canceled` ; traitez ce résultat sans vous appuyer uniquement sur `catch`. Traitez `Canceled` comme la fermeture de la feuille par le client et `Failed` comme une erreur. Aucun de ces résultats n’autorise à lui seul l’exécution d’une commande.

<!-- !::presentPaymentSheet:: -->

<!-- !::PaymentSheetResultInterface:: -->

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

<!-- !::PaymentSheetEventsEnum:: -->

## Référence

- [Accepter un paiement (iOS)](https://stripe.com/docs/payments/accept-a-payment?platform=ios)
- [Accepter un paiement (Android)](https://stripe.com/docs/payments/accept-a-payment?platform=android)
