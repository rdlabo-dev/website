---
title: "Google Pay"
code: ["/docs/stripe/google-pay/strings.xml.md","/docs/stripe/google-pay/android-manifest.xml.md","/docs/stripe/google-pay/google-pay.ts.md"]
scrollActiveLine: []
sourceRevision: "e6b1266613980b4ed9868f8a782c3da54181265b444b17dfc385f20559e8ccfb"
---
Google Pay confirme un PaymentIntent en une seule présentation. L’implémentation Android accepte également un SetupIntent ; l’implémentation Web ne l’accepte pas.

https://stripe.com/docs/google-pay

Sur le Web, Google Pay utilise le Payment Request Button. Servez l’application en HTTPS en développement comme en production.

https://stripe.com/docs/stripe-js/elements/payment-request-button?platform=html-js-testing-google-pay#html-js-prerequisites

## Prise en charge des plateformes

| Plateforme | Google Pay |
| --- | --- |
| Android | `GooglePayLauncher` natif (nécessite les métadonnées de l’application) |
| iOS | Non implémenté |
| Web | Payment Request Button (`stripe-pwa-elements`) |

iOS rejette `isGooglePayAvailable`, `createGooglePay` et `presentGooglePay`. Android lit la configuration Google Pay dans les métadonnées lors du chargement du plugin ; `initialize` seul ne suffit donc pas sur Android.

## Préparer les paramètres

### strings.xml

Dans `android/app/src/main/res/values/strings.xml`, ajoutez :

- `publishable_key` (clé publique Stripe)
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

Stripe Connect facultatif pour Google Pay sur Android :

```xml
<string name="stripe_account">acct_xxxxxxxxxxxxx</string>
```

### AndroidManifest.xml

Dans `android/app/src/main/AndroidManifest.xml`, ajoutez les éléments suivants sous `manifest > application` :

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

Compte connecté facultatif :

```xml
<meta-data
  android:name="com.getcapacitor.community.stripe.stripe_account"
  android:value="@string/stripe_account"/>
```

#### Option 1 : pour obtenir les informations utilisateur, définissez ces paramètres :

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

#### Option 2 : si vous n’exigez pas de moyen de paiement existant dans Google Pay :

Si ce paramètre est false, Google Pay est considéré comme prêt même si le portefeuille Google Pay du client ne contient pas de moyen de paiement existant. La valeur par défaut est true.

```xml
<bool name="google_pay_existing_payment_method_required">false</bool>
```

```xml
<meta-data
  android:name="com.getcapacitor.community.stripe.google_pay_existing_payment_method_required"
  android:value="@bool/google_pay_existing_payment_method_required"/>
```

## 1. isGooglePayAvailable

La Promise est résolue lorsque Google Pay est prêt et rejetée sinon.

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

Récupérez un secret client de PaymentIntent depuis votre backend. Sur Android, vous pouvez passer à la place un secret client de SetupIntent. Remplacez `/your-intent-endpoint` dans l’exemple par l’URL du backend présentée dans [Intégration serveur](/docs/server-integration). L’option s’appelle `paymentIntentClientSecret` pour les deux types d’Intent. Le Web nécessite également `paymentSummaryItems`, `merchantIdentifier`, `countryCode` et `currency`.

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

await Stripe.createGooglePay({
  paymentIntentClientSecret: paymentIntent,

  // Web uniquement. Google Pay dans une application Android ne le nécessite pas.
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
`paymentSummaryItems`, `merchantIdentifier`, `countryCode` et `currency` sont obligatoires sur le Web. Android utilise à la place le pays et le nom du marchand des métadonnées.
:::

Un secret client de SetupIntent commence par `seti_`. Android détecte ce préfixe et utilise `presentForSetupIntent` avec la `currency` des options de création (`USD` par défaut). Ne passez pas de SetupIntent sur le Web : l’implémentation Web confirme avec `confirmCardPayment`.

## 3. presentGooglePay

```ts
const result = await Stripe.presentGooglePay();
if (result.paymentResult === GooglePayEventsEnum.Completed) {
  // Mettez uniquement l’interface à jour. Confirmez l’Intent par webhook avant d’exécuter la commande.
}
```

!::presentGooglePay::

!::GooglePayResultInterface::

Traitez `Canceled` comme une annulation et `Failed` comme une erreur. Préférez les écouteurs de résultat après une recréation de l’Activity Android. Consultez [Écouteurs d’événements](/docs/learn/event-listeners).

## 4. addListener

```ts
Stripe.addListener(GooglePayEventsEnum.Completed, () => {
  console.log('GooglePayEventsEnum.Completed');
});
```

!::GooglePayEventsEnum::

## Référence

- [Google Pay (Android)](https://stripe.com/docs/google-pay)
- [Google Pay (Web)](https://stripe.com/docs/stripe-js/elements/payment-request-button?platform=html-js-testing-google-pay#html-js-prerequisites)
