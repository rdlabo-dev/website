---
title: "Configuration des plateformes"
code: []
scrollActiveLine: []
sourceRevision: "9893f84807239965b9f91cfc3d886f62574663d7eb3611721ddf9187edbcfa0a"
---
Installez `@capacitor-community/stripe` et synchronisez les projets natifs. Capacitor 8 enregistre automatiquement le plugin : vous n’avez pas à modifier `MainActivity` ni à ajouter un appel manuel à `registerPlugin`.

```bash
npm install @capacitor-community/stripe
npx cap sync
```

Le plugin nécessite Capacitor 8 ou une version ultérieure. Sur le Web, la dépendance pair `stripe-pwa-elements` est également nécessaire. Conservez la clé secrète Stripe uniquement sur votre serveur. Consultez [Intégration serveur](/docs/server-integration).

| Prérequis | Minimum |
| --- | --- |
| Capacitor | 8 |
| iOS | 15.0 |
| `minSdkVersion` Android | 24 |

## Parcours du premier paiement

Suivez cet ordre pour réussir votre premier paiement avec PaymentSheet :

1. Terminez les étapes propres à la plateforme sur cette page.
2. Choisissez **un seul** guide de framework et initialisez Stripe à cet endroit ([JavaScript natif](/docs/vanilla-js), [Angular](/docs/angular) ou [React](/docs/react)).
3. Créez un PaymentIntent de test sur votre serveur et renvoyez son secret client. Consultez [Intégration serveur](/docs/server-integration).
4. Présentez [PaymentSheet](/docs/payment-sheet), puis vérifiez le résultat de l’écouteur (`Completed`, `Canceled` ou `Failed`). L’état final du paiement reste déterminé par vos webhooks Stripe.

PaymentFlow, Apple Pay et Google Pay sont des options à explorer une fois PaymentSheet fonctionnel.

## Configuration Android

Le plugin lui-même ne nécessite aucun enregistrement supplémentaire dans Gradle ou `MainActivity`.

Sur Android, Google Pay doit être configuré dans les métadonnées de l’application avant le chargement du plugin. Suivez le guide [Google Pay](/docs/google-pay).

Stripe Connect facultatif : si Google Pay sur Android doit utiliser un compte connecté, ajoutez la métadonnée `com.getcapacitor.community.stripe.stripe_account`. Sur le Web et en natif, PaymentSheet, PaymentFlow, Apple Pay et Google Pay acceptent également `stripeAccount` dans `initialize`.

## Configuration iOS

Ajoutez `NSCameraUsageDescription` pour permettre à PaymentSheet de scanner les cartes :

```diff plist:ios/App/App/Info.plist
  	<key>UIViewControllerBasedStatusBarAppearance</key>
	  <true/>

+   <key>NSCameraUsageDescription</key>
+   <string>Need camera access for read credit card.</string>
  </dict>
```

Le plugin se charge automatiquement sur iOS. Apple Pay nécessite également un Apple Merchant ID et un certificat. Suivez le guide [Apple Pay](/docs/apple-pay).

Pour les redirections 3D Secure, définissez `returnURL` lors de la création de PaymentSheet ou PaymentFlow, puis appelez `handleURLCallback` depuis le gestionnaire d’URL de votre application. Consultez [Initialisation](/docs/initialize).

## Configuration Web

Installez `stripe-pwa-elements` et appelez `defineCustomElements()` une seule fois au démarrage. Servez l’application en HTTPS en développement comme en production.

Choisissez **un seul** démarrage rapide de framework (ce sont des alternatives, pas des étapes successives) :

- [Démarrage rapide en JavaScript natif](/docs/vanilla-js)
- [Démarrage rapide avec Angular](/docs/angular)
- [Démarrage rapide avec React](/docs/react)

Après l’initialisation, poursuivez avec [Intégration serveur](/docs/server-integration), puis [PaymentSheet](/docs/payment-sheet).
