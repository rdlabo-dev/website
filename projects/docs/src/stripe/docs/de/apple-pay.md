---
title: "ApplePay"
code: ["/docs/stripe/apple-pay/apple-pay.ts.md"]
scrollActiveLine: []
sourceRevision: "1b0ee46d57e9bf435e89c42694270cf4c4380742fb49bae088d179170c57b943"
---
Apple Pay bestätigt einen PaymentIntent in einer einzigen Darstellung.

https://stripe.com/docs/apple-pay

[![Bild von Gyazo](https://i.gyazo.com/d632147e6d3b33dcc8e28f3ecc898a99.gif)](https://gyazo.com/d632147e6d3b33dcc8e28f3ecc898a99)

## Plattformunterstützung

| Plattform | Apple Pay |
| --- | --- |
| iOS | Nativer `STPApplePayContext` |
| Android | Nicht implementiert |
| Web | Payment Request Button (`stripe-pwa-elements`) |

`updateApplePaySheet` und Aktualisierungen des Versandkontakts funktionieren nur unter iOS. Im Web löst `updateApplePaySheet` einen Fehler wegen fehlender Implementierung aus. Android weist `isApplePayAvailable`, `createApplePay` und `presentApplePay` zurück.

## Einstellungen vorbereiten

- Eine Apple Merchant ID registrieren
- Ein Apple-Pay-Zertifikat erstellen
- Apple Pay in Xcode aktivieren

https://stripe.com/docs/apple-pay#merchantid

`merchantIdentifier` von `createApplePay` muss dieselbe Merchant ID sein, die im [Apple-Developer](https://developer.apple.com/account/resources/identifiers/add/merchant)-Konto und in Xcode registriert ist. Übergeben Sie hier nicht `merchantDisplayName`; diese Option gehört zu PaymentSheet und PaymentFlow.

## 1. isApplePayAvailable

Prüfen Sie das Gerät, bevor Sie eine Anfrage erstellen. Das Promise wird aufgelöst, wenn Apple Pay verfügbar ist, andernfalls zurückgewiesen.

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

Rufen Sie ein PaymentIntent-Client-Secret von Ihrem Backend ab. Ersetzen Sie `/your-intent-endpoint` im Beispiel durch die Backend-URL aus [Serverintegration](/docs/server-integration). Übergeben Sie anschließend `paymentIntentClientSecret`, `paymentSummaryItems`, `merchantIdentifier`, `countryCode` und `currency`.

```ts
// `/your-intent-endpoint` durch Ihr Backend aus der Anleitung zur Serverintegration ersetzen.
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

`requiredShippingContactFields` fordert Apple Pay zur Abfrage von Postanschrift, Telefonnummer, E-Mail-Adresse oder Namen auf. `allowedCountries` weist Versandländer zurück, die nicht in der Liste stehen.

## 3. presentApplePay

```ts
const result = await Stripe.presentApplePay();
if (result.paymentResult === ApplePayEventsEnum.Completed) {
  // Nur die UI aktualisieren. Den Intent vor der Leistungserbringung per Webhook bestätigen.
}
```

!::presentApplePay::

!::ApplePayResultInterface::

Behandeln Sie `Canceled` als Abbruch und `Failed` als Fehler.

## 4. addListener

Registrieren Sie Listener beim Anwendungsstart. Siehe [Ereignis-Listener](/docs/learn/event-listeners).

```ts
Stripe.addListener(ApplePayEventsEnum.Completed, () => {
  console.log('ApplePayEventsEnum.Completed');
});
```

!::ApplePayEventsEnum::

## 5. updateApplePaySheet

Unter iOS enthält `DidSelectShippingContact` `contact` und `updateId`. Berechnen Sie Gesamtbeträge neu und rufen Sie `updateApplePaySheet` mit dieser `updateId` auf. Antwortet JavaScript nicht, greift das native Sheet nach 25 Sekunden auf die ursprünglichen Zusammenfassungspositionen zurück.

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

`DidCreatePaymentMethod` enthält den Versandkontakt, nachdem Apple die Zahlungsmethode erstellt hat. Apple gibt die vollständige Adresse erst nach einer erfolgreichen Zahlung zurück.

!::DidCreatePaymentMethod::

!::ShippingContact::

## Referenz

- [Apple Pay (iOS)](https://stripe.com/docs/apple-pay)
- [Händlername auf dem Apple-Pay-Sheet](https://github.com/capacitor-community/stripe/issues/115)
