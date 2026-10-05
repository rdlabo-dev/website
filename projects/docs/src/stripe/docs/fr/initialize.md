---
title: "Initialiser votre projet"
code: []
scrollActiveLine: []
sourceRevision: "3a05c3a93e2d5aac330defd4c5123fcba5e95b01d54d307bb7c28dfb072ff8ce"
---
Importez `Stripe` et appelez `initialize` avec une [clé publique](https://dashboard.stripe.com/apikeys). Faites-le une seule fois par environnement JavaScript, avant de créer ou de présenter une interface de paiement.

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

Créez une clé publique dans le [Dashboard Stripe](https://dashboard.stripe.com/register). Ne transmettez jamais la clé secrète au client.

## Stripe Connect

Définissez l’option facultative `stripeAccount` pour effectuer les appels API du plugin pour un [compte connecté](https://stripe.com/docs/connect/authentication).

```ts
await Stripe.initialize({
  publishableKey: 'Your Publishable Key',
  stripeAccount: 'acct_xxxxxxxxxxxxx',
});
```

Sur Android, Google Pay peut également lire `com.getcapacitor.community.stripe.stripe_account` dans les métadonnées de l’application. Consultez [Google Pay](/docs/google-pay).

## Moyens de paiement avec redirection sur iOS

Les moyens de paiement qui quittent votre application pour l’authentification, comme PayPal et certains moyens de paiement bancaires, nécessitent une URL de retour. Sur iOS, Stripe ne propose pas ces moyens de paiement dans PaymentSheet ou PaymentFlow, même s’ils seraient autrement admissibles, lorsque `returnURL` n’est pas configuré. Consultez le [guide Stripe sur l’URL de retour iOS](https://docs.stripe.com/payments/mobile/accept-payment?platform=ios#ios-set-up-return-url).

Enregistrez un schéma d’URL personnalisé pour votre application dans `ios/App/App/Info.plist`. Remplacez `your-app` par un schéma propre à votre application :

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

Passez une URL utilisant ce schéma à `createPaymentSheet` ou `createPaymentFlow`, puis transmettez à Stripe les événements d’ouverture d’application correspondants :

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

Utilisez la même configuration avec `createPaymentFlow`. Le schéma personnalisé dans `Info.plist`, celui de `returnURL` et l’URL vérifiée par l’écouteur doivent correspondre. La disponibilité des moyens de paiement dépend également de l’Intent, de la devise, du pays, du compte Stripe, des paramètres du Dashboard et de leur prise en charge par le SDK Stripe.

### handleURLCallback

`handleURLCallback` est réservé à iOS. Il transmet l’URL de retour reçue au SDK Stripe pour terminer l’authentification avec redirection et fermer le navigateur.

<!-- !::handleURLCallback:: -->

<!-- !::StripeURLHandlingOptions:: -->

Cette méthode n’est pas implémentée sur Android ni sur le Web. Ne lui passez que les URL de retour Stripe correspondantes. Si Stripe ne traite pas l’URL, la Promise est rejetée et vous devez poursuivre le traitement habituel des liens profonds.

## Exemple

### Angular

Initialisez depuis le composant racine. Consultez [Angular](/docs/angular).

```ts:src/app/app.component.ts
import { Component } from '@angular/core';
import { Stripe } from '@capacitor-community/stripe';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    void Stripe.initialize({
      publishableKey: 'Your Publishable Key',
    });
  }
}
```

### React

`CapacitorStripeProvider` initialise le plugin pour vous. Consultez [React](/docs/react).
