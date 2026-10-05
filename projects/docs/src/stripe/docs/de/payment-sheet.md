---
title: "PaymentSheet"
code: ["/docs/stripe/payment-sheet/payment-sheet.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{}},{"id":"1.-createpaymentsheet","activeLine":{"payment-sheet.ts":[9,22]}},{"id":"2.-presentpaymentsheet","activeLine":{"payment-sheet.ts":[22,28]}},{"id":"3.-addlistener","activeLine":{"payment-sheet.ts":[4,8]}}]
sourceRevision: "2ef0f896a6b2286f80cef952b32ae1c8a7ce6140ef3014406df1847915897203"
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

Rufen Sie für den Client sichere Secrets von Ihrem Backend ab und rufen Sie anschließend `createPaymentSheet` auf. Das Plugin kommuniziert nicht mit der geheimen Stripe-API. Verwenden Sie `HttpClient`, `fetch` oder einen anderen HTTP-Client.

Übergeben Sie unter iOS und Android **entweder** `paymentIntentClientSecret` **oder** `setupIntentClientSecret`. Übergeben Sie im Web `paymentIntentClientSecret`. `customerId` und `customerEphemeralKeySecret` sind gemeinsam optional. Wenn Sie `customerId` setzen, müssen Sie auch `customerEphemeralKeySecret` setzen. Ein PaymentIntent ohne Customer ist gültig. Siehe die Demo-Struktur `intent/without-customer` unter [Serverintegration](/docs/server-integration).

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

Optionale native Einstellungen umfassen `style` (`alwaysLight` oder `alwaysDark`, nur iOS), `enableApplePay` mit `applePayMerchantId`, `enableGooglePay` und Optionen zur Erfassung von Rechnungsdaten. Konfigurieren Sie unter iOS `returnURL` und `handleURLCallback` für PayPal, 3D Secure und andere weiterleitungsbasierte Zahlungsmethoden. Ohne Rückkehr-URL bietet Stripe ansonsten geeignete weiterleitungsbasierte Methoden nicht an. Siehe [Weiterleitungsbasierte Zahlungsmethoden unter iOS](/docs/initialize#redirect-based-payment-methods-on-ios). `withZipCode` ist ausschließlich für das Web bestimmt. `currencyCode` ist erforderlich, wenn `enableGooglePay` bei einem SetupIntent aktiviert ist.

Seit v8.3.0 können Sie in den Erstellungsoptionen `allowsDelayedPaymentMethods: true` setzen, um geeignete verzögerte Zahlungsmethoden wie ACH und SEPA Debit unter iOS und Android zuzulassen. Der Standardwert ist `false`; diese Option hat keine Auswirkung auf das Web. Aktivieren Sie die Methoden in Stripe und konfigurieren Sie den Intent entsprechend. Ein Ergebnis `Completed` kann bedeuten, dass die Zahlung noch verarbeitet wird: Warten Sie vor der Erfüllung der Bestellung auf einen Webhook, der die erfolgreiche Zahlung bestätigt. Siehe die [Stripe-Anleitung zu verzögerten Zahlungsmethoden](https://docs.stripe.com/payments/mobile/accept-payment?platform=ios&type=payment#handle-post-payment-events).

## 2. presentPaymentSheet

Rufen Sie `presentPaymentSheet` erst nach einem erfolgreichen `createPaymentSheet` auf.

```ts
const result = await Stripe.presentPaymentSheet();
if (result.paymentResult === PaymentSheetEventsEnum.Completed) {
  // Nur die UI aktualisieren. Vor der Leistungserbringung den Zahlungserfolg auf Ihrem Server per Webhook überprüfen.
}
```

Im Web wird das Promise bei einem Abbruch mit `paymentResult: PaymentSheetEventsEnum.Canceled` aufgelöst. Verarbeiten Sie dieses Ergebnis, statt sich ausschließlich auf `catch` zu verlassen. Behandeln Sie `Canceled` als Schließen des Sheets durch den Kunden. Behandeln Sie `Failed` als Fehler. Keines der Ergebnisse autorisiert allein die Erfüllung einer Bestellung.

<!-- !::presentPaymentSheet:: -->

<!-- !::PaymentSheetResultInterface:: -->

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

<!-- !::PaymentSheetEventsEnum:: -->

## Referenz

- [Eine Zahlung annehmen (iOS)](https://stripe.com/docs/payments/accept-a-payment?platform=ios)
- [Eine Zahlung annehmen (Android)](https://stripe.com/docs/payments/accept-a-payment?platform=android)
