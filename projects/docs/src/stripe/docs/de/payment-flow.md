---
title: "PaymentFlow"
code: ["/docs/stripe/payment-flow/payment-flow.ts.md"]
scrollActiveLine: []
sourceRevision: "6270181187dde0ae5023a09719b9a86101fb7b5d0efddfe967b66fb185dd72cd"
---
PaymentFlow trennt Erfassung und Bestätigung. `presentPaymentFlow` erfasst die Zahlungsmethode und gibt eine vorgemerkte Karte zurück. `confirmPaymentFlow` bestätigt den Intent später, üblicherweise nach einer Übersichtsseite.

[![Bild von Gyazo](https://i.gyazo.com/736450bb2e267eab0bba578e366fcba5.gif)](https://gyazo.com/736450bb2e267eab0bba578e366fcba5)

Verwenden Sie einen [PaymentIntent](https://stripe.com/docs/payments/payment-intents) oder einen [SetupIntent](https://stripe.com/docs/payments/save-and-reuse?platform=web). Erstellen Sie diese Objekte auf Ihrem Server. Siehe [Serverintegration](/docs/server-integration).

## Plattformunterstützung

| Plattform | PaymentFlow |
| --- | --- |
| iOS | Nativer PaymentSheet.FlowController |
| Android | Nativer PaymentSheet.FlowController |
| Web | Karten-Modal von `stripe-pwa-elements` |

Das Web unterstützt `paymentIntentClientSecret` oder `setupIntentClientSecret` sowie das optionale `withZipCode`. Ausschließlich native Optionen wie `defaultBillingDetails`, `shippingDetails`, `billingDetailsCollectionConfiguration`, `enableApplePay`, `enableGooglePay`, `style` und `returnURL` werden im Web ignoriert.

## 1. createPaymentFlow

Rufen Sie für den Client sichere Secrets von Ihrem Backend ab und rufen Sie anschließend `createPaymentFlow` auf. Ersetzen Sie `/your-intent-endpoint` im Beispiel durch die Backend-URL aus [Serverintegration](/docs/server-integration). Übergeben Sie **entweder** `paymentIntentClientSecret` **oder** `setupIntentClientSecret`. `customerId` und `customerEphemeralKeySecret` sind gemeinsam optional. Wenn Sie `customerId` setzen, müssen Sie auch `customerEphemeralKeySecret` setzen.

```ts
import { PaymentFlowEventsEnum, Stripe } from '@capacitor-community/stripe';

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

Rufen Sie `presentPaymentFlow` erst nach einem erfolgreichen `createPaymentFlow` auf. Die zurückgegebene `cardNumber` ist ein maskierter Wert. Der Intent ist noch nicht bestätigt.

```ts
const presentResult = await Stripe.presentPaymentFlow();
console.log(presentResult); // { cardNumber: "●●●● ●●●● ●●●● ****" }
```

!::presentPaymentFlow::

Wenn der Kunde abbricht, wird das Promise zurückgewiesen oder das Ereignis `Canceled` ausgelöst. Rufen Sie `confirmPaymentFlow` erst nach `Created` oder einem erfolgreichen Ergebnis von `presentPaymentFlow` auf.

## 3. confirmPaymentFlow

```ts
const confirmResult = await Stripe.confirmPaymentFlow();
if (confirmResult.paymentResult === PaymentFlowEventsEnum.Completed) {
  // Nur die UI aktualisieren. Den Intent vor der Leistungserbringung per Webhook bestätigen.
}
```

!::confirmPaymentFlow::

!::PaymentFlowResultInterface::

Behandeln Sie `Canceled` als Abbruch und `Failed` als Fehler. Keines der Ergebnisse autorisiert allein die Erfüllung einer Bestellung.

## 4. addListener

Registrieren Sie Ergebnis-Listener einmal beim Anwendungsstart. Bevorzugen Sie nach der Neuerstellung einer Android-Activity Ereignisse gegenüber dem Promise, einschließlich des Ereignisses `Created`. Siehe [Ereignis-Listener](/docs/learn/event-listeners).

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

## Referenz

- [Die Zahlung in Ihrer eigenen UI abschließen (iOS)](https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#ios-flowcontroller)
- [Die Zahlung in Ihrer eigenen UI abschließen (Android)](https://stripe.com/docs/payments/accept-a-payment?platform=android&ui=payment-sheet#android-flowcontroller)
