---
title: "ApplePay"
code: ["/docs/stripe/apple-pay/apple-pay.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{}},{"id":"1.-isapplepayavailable","activeLine":{"apple-pay.ts":[4,10]}},{"id":"2.-createapplepay","activeLine":{"apple-pay.ts":[15,31]}},{"id":"3.-presentapplepay","activeLine":{"apple-pay.ts":[31,37]}},{"id":"4.-addlistener","activeLine":{"apple-pay.ts":[11,14]}}]
sourceRevision: "c92b0ff8010840d7cc2ec6d6000bdb2d51aaa25b6fca4bef53ca857f27c1fa75"
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

<!-- !::isApplePayAvailable:: -->

## 2. createApplePay

`paymentSummaryItems.amount` wird in der Hauptwährungseinheit angegeben. Für 10,99 US-Dollar geben Sie `10.99` an. Serverseitig erwartet Stripe den PaymentIntent-Betrag in der kleinsten Währungseinheit, also `1099` Cent für denselben Kauf. Der angezeigte Gesamtbetrag muss mit dem Intent-Betrag im Backend übereinstimmen.

Rufen Sie ein PaymentIntent-Client-Secret von Ihrem Backend ab. Siehe [Serverintegration](/docs/server-integration). Übergeben Sie anschließend `paymentIntentClientSecret`, `paymentSummaryItems`, `merchantIdentifier`, `countryCode` und `currency`.

```ts
import { firstValueFrom } from 'rxjs';

const { paymentIntent } = await firstValueFrom(
  this.http.post<{
    paymentIntent: string;
  }>(environment.api + 'intent', {}),
);

await Stripe.createApplePay({
  paymentIntentClientSecret: paymentIntent,
  paymentSummaryItems: [
    {
      label: 'Product Name',
      amount: 10.99,
    },
  ],
  merchantIdentifier: 'merchant.com.getcapacitor.stripe',
  countryCode: 'US',
  currency: 'USD',
});
```

<!-- !::createApplePay:: -->

<!-- !::CreateApplePayOption:: -->

`requiredShippingContactFields` fordert Apple Pay zur Abfrage von Postanschrift, Telefonnummer, E-Mail-Adresse oder Namen auf. `allowedCountries` weist Versandländer zurück, die nicht in der Liste stehen.

## 3. presentApplePay

```ts
const result = await Stripe.presentApplePay();
if (result.paymentResult === ApplePayEventsEnum.Completed) {
  // Nur die UI aktualisieren. Vor der Leistungserbringung den Zahlungserfolg auf Ihrem Server per Webhook überprüfen.
}
```

<!-- !::presentApplePay:: -->

<!-- !::ApplePayResultInterface:: -->

Behandeln Sie `Canceled` als Abbruch und `Failed` als Fehler.

## 4. addListener

Registrieren Sie Listener beim Anwendungsstart. Siehe [Ereignis-Listener](/docs/learn/event-listeners).

```ts
Stripe.addListener(ApplePayEventsEnum.Completed, () => {
  console.log('ApplePayEventsEnum.Completed');
});
```

<!-- !::ApplePayEventsEnum:: -->

## 5. updateApplePaySheet

Unter iOS enthält `DidSelectShippingContact` `contact` und `updateId`. Berechnen Sie Gesamtbeträge neu und rufen Sie `updateApplePaySheet` mit dieser `updateId` auf. Antwortet JavaScript nicht, greift das native Sheet nach 25 Sekunden auf die zuletzt akzeptierten Zusammenfassungspositionen zurück. Aktualisierungen behalten die aktuellen Versandmethoden bei.

Im Versandbeispiel muss das Backend auch den Gesamtbetrag des Intents auf 15,99 US-Dollar aktualisieren. `updateApplePaySheet` ändert nur die angezeigte Übersicht. Den PaymentIntent aktualisieren Sie im Backend.

`paymentSummaryItems` muss ein Array sein. Ein leeres Array (`[]`) bestätigt die aktuelle Auswahl, ohne die vorhandenen Zusammenfassungspositionen zu ändern. Bei einem nicht leeren Array muss jede Position eine nicht leere Zeichenfolge als Bezeichnung und einen endlichen numerischen Betrag haben. Negative Rabatte sind erlaubt, die abschließende Summe muss jedoch mindestens null betragen. Ungültige Eingaben werden zurückgewiesen, ohne die ausstehende Aktualisierung zu verbrauchen. Sie können deshalb vor dem Zeitlimit korrigiert und erneut gesendet werden. Nur die `updateId` der letzten Kontaktauswahl wird akzeptiert; doppelte oder veraltete Aktualisierungen werden zurückgewiesen.

```ts
Stripe.addListener(ApplePayEventsEnum.DidSelectShippingContact, async (data) => {
  await Stripe.updateApplePaySheet({
    updateId: data.updateId,
    paymentSummaryItems: [
      { label: 'Product Name', amount: 10.99 },
      { label: 'Shipping', amount: 5.0 },
      { label: 'Total', amount: 15.99 },
    ],
  });
});
```

<!-- !::updateApplePaySheet:: -->

<!-- !::DidSelectShippingContact:: -->

<!-- !::PaymentSummaryItem:: -->

`DidCreatePaymentMethod` enthält den Versandkontakt, nachdem Apple die Zahlungsmethode erstellt hat. Apple gibt die vollständige Adresse erst nach einer erfolgreichen Zahlung zurück.

<!-- !::DidCreatePaymentMethod:: -->

<!-- !::ShippingContact:: -->

## Referenz

- [Apple Pay (iOS)](https://stripe.com/docs/apple-pay)
- [Händlername auf dem Apple-Pay-Sheet](https://github.com/capacitor-community/stripe/issues/115)
