---
title: "ApplePay"
code: ["/docs/stripe/apple-pay/apple-pay.ts.md"]
scrollActiveLine: []
sourceRevision: "1b0ee46d57e9bf435e89c42694270cf4c4380742fb49bae088d179170c57b943"
---
Apple Pay confirme un PaymentIntent en une seule présentation.

https://stripe.com/docs/apple-pay

[![Image provenant de Gyazo](https://i.gyazo.com/d632147e6d3b33dcc8e28f3ecc898a99.gif)](https://gyazo.com/d632147e6d3b33dcc8e28f3ecc898a99)

## Prise en charge des plateformes

| Plateforme | Apple Pay |
| --- | --- |
| iOS | `STPApplePayContext` natif |
| Android | Non implémenté |
| Web | Payment Request Button (`stripe-pwa-elements`) |

`updateApplePaySheet` et les mises à jour du contact de livraison fonctionnent uniquement sur iOS. Sur le Web, `updateApplePaySheet` lève une erreur indiquant que la méthode n’est pas implémentée. Android rejette `isApplePayAvailable`, `createApplePay` et `presentApplePay`.

## Préparer les paramètres

- Enregistrer un Apple Merchant ID
- Créer un certificat Apple Pay
- Activer Apple Pay dans Xcode

https://stripe.com/docs/apple-pay#merchantid

Le `merchantIdentifier` de `createApplePay` doit être l’identifiant marchand enregistré dans le compte [Apple Developer](https://developer.apple.com/account/resources/identifiers/add/merchant) et dans Xcode. Ne passez pas `merchantDisplayName` ici ; cette option appartient à PaymentSheet et PaymentFlow.

## 1. isApplePayAvailable

Vérifiez l’appareil avant de créer une demande. La Promise est résolue si Apple Pay est disponible et rejetée sinon.

```ts
import { ApplePayEventsEnum, Stripe } from '@capacitor-community/stripe';

try {
  await Stripe.isApplePayAvailable();
} catch {
  return;
}
```

!::isApplePayAvailable::

## 2. createApplePay

Récupérez un secret client de PaymentIntent depuis votre backend. Remplacez `/your-intent-endpoint` dans l’exemple par l’URL du backend présentée dans [Intégration serveur](/docs/server-integration). Passez ensuite `paymentIntentClientSecret`, `paymentSummaryItems`, `merchantIdentifier`, `countryCode` et `currency`.

```ts
// Remplacez `/your-intent-endpoint` par votre backend décrit dans Intégration serveur.
const response = await fetch('/your-intent-endpoint', {
  method: 'POST',
});
if (!response.ok) {
  throw new Error(`Intent request failed: ${response.status}`);
}
const { paymentIntent } = (await response.json()) as {
  paymentIntent: string;
};

await Stripe.createApplePay({
  paymentIntentClientSecret: paymentIntent,
  paymentSummaryItems: [{
    label: 'Product Name',
    amount: 1099.00
  }],
  merchantIdentifier: 'merchant.com.getcapacitor.stripe',
  countryCode: 'US',
  currency: 'USD',
});
```

!::createApplePay::

!::CreateApplePayOption::

`requiredShippingContactFields` demande à Apple Pay l’adresse postale, le téléphone, l’e-mail ou le nom. `allowedCountries` refuse les pays de livraison qui ne figurent pas dans la liste.

## 3. presentApplePay

```ts
const result = await Stripe.presentApplePay();
if (result.paymentResult === ApplePayEventsEnum.Completed) {
  // Mettez uniquement l’interface à jour. Confirmez l’Intent par webhook avant d’exécuter la commande.
}
```

!::presentApplePay::

!::ApplePayResultInterface::

Traitez `Canceled` comme une annulation et `Failed` comme une erreur.

## 4. addListener

Enregistrez les écouteurs au démarrage de l’application. Consultez [Écouteurs d’événements](/docs/learn/event-listeners).

```ts
Stripe.addListener(ApplePayEventsEnum.Completed, () => {
  console.log('ApplePayEventsEnum.Completed');
});
```

!::ApplePayEventsEnum::

## 5. updateApplePaySheet

Sur iOS, `DidSelectShippingContact` contient `contact` et `updateId`. Recalculez les totaux et appelez `updateApplePaySheet` avec cet `updateId`. Si JavaScript ne répond pas, la feuille native revient aux éléments de récapitulatif initiaux au bout de 25 secondes.

```ts
Stripe.addListener(ApplePayEventsEnum.DidSelectShippingContact, async (data) => {
  await Stripe.updateApplePaySheet({
    updateId: data.updateId,
    paymentSummaryItems: [
      { label: 'Product Name', amount: 1099.00 },
      { label: 'Shipping', amount: 500.00 },
      { label: 'Total', amount: 1599.00 },
    ],
  });
});
```

!::updateApplePaySheet::

!::DidSelectShippingContact::

!::PaymentSummaryItem::

`DidCreatePaymentMethod` contient le contact de livraison après la création du moyen de paiement par Apple. Apple ne renvoie l’adresse complète qu’après un paiement réussi.

!::DidCreatePaymentMethod::

!::ShippingContact::

## Référence

- [Apple Pay (iOS)](https://stripe.com/docs/apple-pay)
- [Nom du marchand sur la feuille Apple Pay](https://github.com/capacitor-community/stripe/issues/115)
