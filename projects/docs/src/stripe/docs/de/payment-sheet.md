---
title: "PaymentSheet"
code: ["/docs/stripe/payment-sheet/payment-sheet.ts.md"]
scrollActiveLine: []
sourceRevision: "2ad63baa378ddc42d209135d2788e5e1aa5d5485298be8f515af52c582fc63b3"
---
PaymentSheet erfasst Zahlungsdetails und bestätigt den Intent in einer einzigen Darstellung. Wenn Sie eine zunächst vorgemerkte Karte und einen späteren Bestätigungsschritt benötigen, verwenden Sie [PaymentFlow](/docs/payment-flow).

[![Bild von Gyazo](https://i.gyazo.com/4356878ec43a90178ec3d831d6b47b10.gif)](https://gyazo.com/4356878ec43a90178ec3d831d6b47b10)

Verwenden Sie einen [PaymentIntent](https://stripe.com/docs/payments/payment-intents) für eine sofortige Zahlung oder einen [SetupIntent](https://stripe.com/docs/payments/save-and-reuse?platform=web), um eine Zahlungsmethode für später zu speichern. Erstellen Sie diese Objekte auf Ihrem Server. Siehe [Serverintegration](/docs/server-integration).

## Plattformunterstützung

| Plattform | PaymentSheet |
| --- | --- |
| iOS | Natives Stripe-PaymentSheet |
| Android | Natives Stripe-PaymentSheet |
| Web | Karten-Modal von `stripe-pwa-elements` |

Das Web rendert kein natives PaymentSheet. Im Web verwendet `createPaymentSheet` `paymentIntentClientSecret` und das optionale `withZipCode`. Die aktuelle Web-Implementierung unterstützt keine SetupIntents. Ausschließlich native Optionen wie `defaultBillingDetails`, `shippingDetails`, `billingDetailsCollectionConfiguration`, `enableApplePay`, `enableGooglePay`, `style` und `returnURL` werden ignoriert.

## 1. createPaymentSheet

Rufen Sie für den Client sichere Secrets von Ihrem Backend ab und rufen Sie anschließend `createPaymentSheet` auf. Das Plugin kommuniziert nicht mit der geheimen Stripe-API. Ersetzen Sie `/your-intent-endpoint` im Beispiel durch die Backend-URL aus [Serverintegration](/docs/server-integration).

Übergeben Sie unter iOS und Android **entweder** `paymentIntentClientSecret` **oder** `setupIntentClientSecret`. Übergeben Sie im Web `paymentIntentClientSecret`. `customerId` und `customerEphemeralKeySecret` sind gemeinsam optional. Wenn Sie `customerId` setzen, müssen Sie auch `customerEphemeralKeySecret` setzen. Ein PaymentIntent ohne Customer ist gültig. Siehe die Demo-Struktur `intent/without-customer` unter [Serverintegration](/docs/server-integration).

```ts
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';

// `/your-intent-endpoint` durch Ihr Backend aus der Anleitung zur Serverintegration ersetzen.
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

Optionale native Einstellungen umfassen `style` (`alwaysLight` oder `alwaysDark`, nur iOS), `enableApplePay` mit `applePayMerchantId`, `enableGooglePay`, `returnURL` für 3D Secure unter iOS und Optionen zur Erfassung von Rechnungsdaten. `withZipCode` ist ausschließlich für das Web bestimmt. `currencyCode` ist erforderlich, wenn `enableGooglePay` bei einem SetupIntent true ist.

## 2. presentPaymentSheet

Rufen Sie `presentPaymentSheet` erst nach einem erfolgreichen `createPaymentSheet` auf.

```ts
const result = await Stripe.presentPaymentSheet();
if (result.paymentResult === PaymentSheetEventsEnum.Completed) {
  // Nur die UI aktualisieren. Den Intent vor der Leistungserbringung per Webhook bestätigen.
}
```

Behandeln Sie `Canceled` als Schließen des Sheets durch den Kunden. Behandeln Sie `Failed` als Fehler. Keines der Ergebnisse autorisiert allein die Erfüllung einer Bestellung.

!::presentPaymentSheet::

!::PaymentSheetResultInterface::

## 3. addListener

Registrieren Sie Ergebnis-Listener einmal beim Anwendungsstart, bevor Sie das Sheet anzeigen. Bevorzugen Sie nach der Neuerstellung einer Android-Activity Ereignisse gegenüber dem Promise. Siehe [Ereignis-Listener](/docs/learn/event-listeners).

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

## Referenz

- [Eine Zahlung annehmen (iOS)](https://stripe.com/docs/payments/accept-a-payment?platform=ios)
- [Eine Zahlung annehmen (Android)](https://stripe.com/docs/payments/accept-a-payment?platform=android)
