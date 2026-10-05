---
title: "PaymentFlow"
code: ["/docs/stripe/payment-flow/payment-flow.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{}},{"id":"1.-createpaymentflow","activeLine":{"payment-flow.ts":[9,23]}},{"id":"2.-presentpaymentflow","activeLine":{"payment-flow.ts":[23,27]}},{"id":"3.-confirmpaymentflow","activeLine":{"payment-flow.ts":[27,33]}},{"id":"4.-addlistener","activeLine":{"payment-flow.ts":[4,8]}}]
sourceRevision: "01952aa2aa51dc02de4b479714421c9d37805d9d52b0c6f5b9f2a1607df92e75"
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

Rufen Sie für den Client sichere Secrets von Ihrem Backend ab und rufen Sie anschließend `createPaymentFlow` auf.  Übergeben Sie **entweder** `paymentIntentClientSecret` **oder** `setupIntentClientSecret`. `customerId` und `customerEphemeralKeySecret` sind gemeinsam optional. Wenn Sie `customerId` setzen, müssen Sie auch `customerEphemeralKeySecret` setzen.

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

Konfigurieren Sie unter iOS `returnURL` und `handleURLCallback` für PayPal, 3D Secure und andere weiterleitungsbasierte Zahlungsmethoden. Ohne Rückkehr-URL bietet Stripe ansonsten geeignete weiterleitungsbasierte Methoden nicht an. Siehe [Weiterleitungsbasierte Zahlungsmethoden unter iOS](/docs/initialize#redirect-based-payment-methods-on-ios).

Seit v8.3.0 können Sie in den Erstellungsoptionen `allowsDelayedPaymentMethods: true` setzen, um geeignete verzögerte Zahlungsmethoden wie ACH und SEPA Debit unter iOS und Android zuzulassen. Der Standardwert ist `false`; diese Option hat keine Auswirkung auf das Web. Aktivieren Sie die Methoden in Stripe und konfigurieren Sie den Intent entsprechend. Ein Ergebnis `Completed` kann bedeuten, dass die Zahlung noch verarbeitet wird: Warten Sie vor der Erfüllung der Bestellung auf einen Webhook, der die erfolgreiche Zahlung bestätigt. Siehe die [Stripe-Anleitung zu verzögerten Zahlungsmethoden](https://docs.stripe.com/payments/mobile/accept-payment?platform=ios&type=payment#handle-post-payment-events).

## 2. presentPaymentFlow

Rufen Sie `presentPaymentFlow` erst nach einem erfolgreichen `createPaymentFlow` auf. Die zurückgegebene `cardNumber` ist ein maskierter Wert. Der Intent ist noch nicht bestätigt.

```ts
const presentResult = await Stripe.presentPaymentFlow();
console.log(presentResult); // { cardNumber: "●●●● ●●●● ●●●● ****" }
```

<!-- !::presentPaymentFlow:: -->

Wenn der Kunde abbricht, wird das Promise zurückgewiesen oder das Ereignis `Canceled` ausgelöst. Rufen Sie `confirmPaymentFlow` erst nach `Created` oder einem erfolgreichen Ergebnis von `presentPaymentFlow` auf.

## 3. confirmPaymentFlow

```ts
const confirmResult = await Stripe.confirmPaymentFlow();
if (confirmResult.paymentResult === PaymentFlowEventsEnum.Completed) {
  // Nur die UI aktualisieren. Vor der Leistungserbringung den Zahlungserfolg auf Ihrem Server per Webhook überprüfen.
}
```

<!-- !::confirmPaymentFlow:: -->

<!-- !::PaymentFlowResultInterface:: -->

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

<!-- !::PaymentFlowEventsEnum:: -->

## Referenz

- [Die Zahlung in Ihrer eigenen UI abschließen (iOS)](https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#ios-flowcontroller)
- [Die Zahlung in Ihrer eigenen UI abschließen (Android)](https://stripe.com/docs/payments/accept-a-payment?platform=android&ui=payment-sheet#android-flowcontroller)
