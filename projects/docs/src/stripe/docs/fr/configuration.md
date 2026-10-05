---
title: "Configuration des plateformes"
code: []
scrollActiveLine: []
sourceRevision: "16c407461762d3f385d87599d7fc4f12baa27b55ff5da98922b14095635ac9fe"
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

Pour PayPal, 3D Secure et les autres moyens de paiement avec redirection, enregistrez un schéma d’URL personnalisé, définissez `returnURL` lors de la création de PaymentSheet ou PaymentFlow et appelez `handleURLCallback` depuis le gestionnaire d’URL de votre application. Sans URL de retour, Stripe ne propose pas les moyens avec redirection autrement admissibles sur iOS. Consultez [Initialisation](/docs/initialize#redirect-based-payment-methods-on-ios).

## Configuration Web

Installez `stripe-pwa-elements` et appelez `defineCustomElements()` une seule fois au démarrage. Servez l’application en HTTPS en développement comme en production.

- [Démarrage rapide en JavaScript natif](/docs/vanilla-js)
- [Démarrage rapide avec Angular](/docs/angular)
- [Démarrage rapide avec React](/docs/react)
