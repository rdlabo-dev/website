---
title: "In Ihrem Projekt initialisieren"
code: []
scrollActiveLine: []
sourceRevision: "214749a32f755633922df645babb5a3f5c930de5563379fc9e9c19c19cf6213e"
---
Importieren Sie `Stripe` und rufen Sie `initialize` mit einem [veröffentlichbaren Schlüssel](https://dashboard.stripe.com/apikeys) auf. Führen Sie dies einmal pro JavaScript-Laufzeit aus, bevor Sie eine Zahlungs-UI erstellen oder anzeigen.

```ts
import { Stripe } from '@capacitor-community/stripe';

export async function initialize(): Promise<void> {
  await Stripe.initialize({
    publishableKey: 'Your Publishable Key',
  });
}
```

<!-- !::initialize:: -->

<!-- !::StripeInitializationOptions:: -->

Erstellen Sie im [Stripe Dashboard](https://dashboard.stripe.com/register) einen veröffentlichbaren Schlüssel. Liefern Sie den geheimen Schlüssel niemals an den Client aus.

## Stripe Connect

Setzen Sie das optionale `stripeAccount`, um Plugin-API-Aufrufe für ein [verbundenes Konto](https://stripe.com/docs/connect/authentication) auszuführen.

```ts
await Stripe.initialize({
  publishableKey: 'Your Publishable Key',
  stripeAccount: 'acct_xxxxxxxxxxxxx',
});
```

Unter Android kann Google Pay außerdem `com.getcapacitor.community.stripe.stripe_account` aus Anwendungsmetadaten lesen. Siehe [Google Pay](./google-pay.md).

## Weiterleitungsbasierte Zahlungsmethoden unter iOS

Zahlungsmethoden, die Ihre Anwendung zur Authentifizierung verlassen, beispielsweise PayPal und einige Bankzahlungsmethoden, benötigen eine Rückkehr-URL. Unter iOS bietet Stripe ansonsten geeignete weiterleitungsbasierte Zahlungsmethoden in PaymentSheet oder PaymentFlow nicht an, wenn `returnURL` nicht konfiguriert ist. Siehe die Stripe-[Anleitung für iOS-Rückkehr-URLs](https://docs.stripe.com/payments/mobile/accept-payment?platform=ios#ios-set-up-return-url).

Registrieren Sie in `ios/App/App/Info.plist` ein eigenes URL-Schema für Ihre Anwendung. Ersetzen Sie `your-app` durch ein Schema, das für Ihre Anwendung eindeutig ist:

```xml plist:ios/App/App/Info.plist
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>your-app</string>
    </array>
  </dict>
</array>
```

Übergeben Sie eine URL mit diesem Schema an `createPaymentSheet` oder `createPaymentFlow` und leiten Sie anschließend passende App-Open-Ereignisse an Stripe weiter:

```ts
import { App } from '@capacitor/app';
import { Stripe } from '@capacitor-community/stripe';

const STRIPE_RETURN_URL = 'your-app://stripe-redirect';

await App.addListener('appUrlOpen', async ({ url }) => {
  if (url.startsWith(STRIPE_RETURN_URL)) {
    await Stripe.handleURLCallback({ url });
  }
});

await Stripe.createPaymentSheet({
  paymentIntentClientSecret,
  returnURL: STRIPE_RETURN_URL,
});
```

Verwenden Sie dieselbe Einrichtung mit `createPaymentFlow`. Das eigene Schema in `Info.plist`, das Schema in `returnURL` und die vom Listener geprüfte URL müssen übereinstimmen. Die Verfügbarkeit von Zahlungsmethoden hängt außerdem vom Intent, der Währung, dem Land, dem Stripe-Konto, den Dashboard-Einstellungen und der Unterstützung durch das Stripe SDK ab.

### handleURLCallback

`handleURLCallback` ist ausschließlich für iOS verfügbar. Es übergibt die eingehende Rückkehr-URL an das Stripe SDK, damit weiterleitungsbasierte Authentifizierung abgeschlossen und der Browser geschlossen werden kann.

<!-- !::handleURLCallback:: -->

<!-- !::StripeURLHandlingOptions:: -->

Die Methode ist unter Android und im Web nicht implementiert. Übergeben Sie ausschließlich passende Stripe-Rückkehr-URLs. Verarbeitet Stripe die URL nicht, wird das Promise zurückgewiesen und Sie sollten Ihre normale Deep-Link-Verarbeitung fortsetzen.

## Framework-Einbindung

Rufen Sie `initialize` aus dem Bootstrap Ihres gewählten Frameworks auf. Bevorzugen Sie den maßgeblichen Startablauf der jeweiligen Anleitung:

- [Vanilla JS](/docs/vanilla-js) — `initialize` nach `defineCustomElements()` aufrufen
- [Angular](/docs/angular) — `provideAppInitializer` beim Anwendungsstart
- [React](/docs/react) — `CapacitorStripeProvider` initialisiert das Plugin für Sie
