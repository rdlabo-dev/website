---
title: "Google Pay"
code: ["/docs/stripe/google-pay/strings.xml.md", "/docs/stripe/google-pay/android-manifest.xml.md", "/docs/stripe/google-pay/google-pay.ts.md"]
scrollActiveLine: []
sourceRevision: "e6b1266613980b4ed9868f8a782c3da54181265b444b17dfc385f20559e8ccfb"
---
Google Pay bestätigt einen PaymentIntent in einer einzigen Darstellung. Die Android-Implementierung akzeptiert zusätzlich einen SetupIntent, die Web-Implementierung nicht.

https://stripe.com/docs/google-pay

Im Web verwendet Google Pay den Payment Request Button. Stellen Sie die Anwendung in Entwicklung und Produktion über HTTPS bereit.

https://stripe.com/docs/stripe-js/elements/payment-request-button?platform=html-js-testing-google-pay#html-js-prerequisites

## Plattformunterstützung

| Plattform | Google Pay |
| --- | --- |
| Android | Nativer `GooglePayLauncher` (benötigt Anwendungsmetadaten) |
| iOS | Nicht implementiert |
| Web | Payment Request Button (`stripe-pwa-elements`) |

iOS weist `isGooglePayAvailable`, `createGooglePay` und `presentGooglePay` zurück. Android liest die Google-Pay-Konfiguration beim Laden des Plugins aus Metadaten. `initialize` allein reicht unter Android deshalb nicht aus.

## Einstellungen vorbereiten

### strings.xml

Ergänzen Sie in `android/app/src/main/res/values/strings.xml`:

- `publishable_key` (veröffentlichbarer Stripe-Schlüssel)
- `enable_google_pay`
- `country_code`
- `merchant_display_name`
- `google_pay_is_testing`

```xml
<string name="publishable_key">Your Publishable Key</string>
<bool name="enable_google_pay">true</bool>
<string name="country_code">US</string>
<string name="merchant_display_name">Widget Store</string>
<bool name="google_pay_is_testing">true</bool>
```

Optionales Stripe Connect für Android-Google-Pay:

```xml
<string name="stripe_account">acct_xxxxxxxxxxxxx</string>
```

### AndroidManifest.xml

Ergänzen Sie in `android/app/src/main/AndroidManifest.xml` unter `manifest > application` Folgendes:

```xml
<meta-data
  android:name="com.google.android.gms.wallet.api.enabled"
  android:value="true" />

<meta-data
  android:name="com.getcapacitor.community.stripe.enable_google_pay"
  android:value="@bool/enable_google_pay"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.publishable_key"
  android:value="@string/publishable_key"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.country_code"
  android:value="@string/country_code"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.merchant_display_name"
  android:value="@string/merchant_display_name"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.google_pay_is_testing"
  android:value="@bool/google_pay_is_testing"/>
```

Optionales verbundenes Konto:

```xml
<meta-data
  android:name="com.getcapacitor.community.stripe.stripe_account"
  android:value="@string/stripe_account"/>
```

#### Optional 1: Setzen Sie zum Abrufen von Nutzerinformationen Folgendes:

```xml
<bool name="email_address_required">true</bool>
<bool name="phone_number_required">true</bool>
<bool name="billing_address_required">true</bool>
<string name="billing_address_format">Full</string>
```

```xml
<meta-data
  android:name="com.getcapacitor.community.stripe.email_address_required"
  android:value="@bool/email_address_required"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.phone_number_required"
  android:value="@bool/phone_number_required"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.billing_address_required"
  android:value="@bool/billing_address_required"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.billing_address_format"
  android:value="@string/billing_address_format"/>
```

#### Optional 2: Wenn Sie keine vorhandene Zahlungsmethode in Google Pay verlangen:

Bei false gilt Google Pay auch dann als bereit, wenn die Google-Pay-Wallet des Kunden keine vorhandenen Zahlungsmethoden enthält. Der Standard ist true.

```xml
<bool name="google_pay_existing_payment_method_required">false</bool>
```

```xml
<meta-data
  android:name="com.getcapacitor.community.stripe.google_pay_existing_payment_method_required"
  android:value="@bool/google_pay_existing_payment_method_required"/>
```

## 1. isGooglePayAvailable

Das Promise wird aufgelöst, wenn Google Pay bereit ist, andernfalls zurückgewiesen.

```ts
import { GooglePayEventsEnum, Stripe } from '@capacitor-community/stripe';

try {
  await Stripe.isGooglePayAvailable();
} catch {
  return;
}
```

!::isGooglePayAvailable::

## 2. createGooglePay

Rufen Sie ein PaymentIntent-Client-Secret von Ihrem Backend ab. Unter Android können Sie stattdessen ein SetupIntent-Client-Secret übergeben. Ersetzen Sie `/your-intent-endpoint` im Beispiel durch die Backend-URL aus [Serverintegration](/docs/server-integration). Die Option heißt für beide Intent-Typen `paymentIntentClientSecret`. Im Web sind außerdem `paymentSummaryItems`, `merchantIdentifier`, `countryCode` und `currency` erforderlich.

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

await Stripe.createGooglePay({
  paymentIntentClientSecret: paymentIntent,

  // Nur im Web. Google Pay in einer Android-App benötigt dies nicht
  paymentSummaryItems: [{
    label: 'Product Name',
    amount: 1099.00
  }],
  merchantIdentifier: 'merchant.com.getcapacitor.stripe',
  countryCode: 'US',
  currency: 'USD',
});
```

!::createGooglePay::

!::CreateGooglePayOption::

:::message
`paymentSummaryItems`, `merchantIdentifier`, `countryCode` und `currency` sind im Web erforderlich. Android verwendet stattdessen Land und Händlername aus den Metadaten.
:::

Ein SetupIntent-Client-Secret beginnt mit `seti_`. Android erkennt dieses Präfix und verwendet `presentForSetupIntent` mit `currency` aus den Erstellungsoptionen, standardmäßig `USD`. Übergeben Sie im Web keinen SetupIntent: Die Web-Implementierung bestätigt mit `confirmCardPayment`.

## 3. presentGooglePay

```ts
const result = await Stripe.presentGooglePay();
if (result.paymentResult === GooglePayEventsEnum.Completed) {
  // Nur die UI aktualisieren. Den Intent vor der Leistungserbringung per Webhook bestätigen.
}
```

!::presentGooglePay::

!::GooglePayResultInterface::

Behandeln Sie `Canceled` als Abbruch und `Failed` als Fehler. Bevorzugen Sie nach der Neuerstellung einer Android-Activity Ergebnis-Listener. Siehe [Ereignis-Listener](/docs/learn/event-listeners).

## 4. addListener

```ts
Stripe.addListener(GooglePayEventsEnum.Completed, () => {
  console.log('GooglePayEventsEnum.Completed');
});
```

!::GooglePayEventsEnum::

## Referenz

- [Google Pay (Android)](https://stripe.com/docs/google-pay)
- [Google Pay (Web)](https://stripe.com/docs/stripe-js/elements/payment-request-button?platform=html-js-testing-google-pay#html-js-prerequisites)
