---
title: "Configuration des plateformes"
code: []
scrollActiveLine: []
sourceRevision: "0a886c42b3baeaba6577ffc9f3040c7e9a39f6e91d6b4677730c2f8f780e3d4a"
---
Installez `@capacitor-community/stripe` et synchronisez les projets natifs. Capacitor 8 enregistre automatiquement le plugin : vous n’avez pas à modifier `MainActivity` ni à ajouter un appel manuel à `registerPlugin`.

```bash
npm install @capacitor-community/stripe
npx cap sync
```

Ce guide concerne la version 8 du plugin avec Capacitor 8. Sur le Web, installez aussi des versions compatibles des dépendances paires `@stripe/stripe-js` et `stripe-pwa-elements`. Conservez la clé secrète Stripe uniquement sur le serveur. Consultez le guide [Intégration serveur](/docs/server-integration).

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

Pour permettre à PaymentSheet de scanner les cartes, ajoutez les entrées suivantes au `dict` racine de `Info.plist`.

```xml plist:ios/App/App/Info.plist
<key>NSCameraUsageDescription</key>
<string>Camera access lets you scan your payment card.</string>
```

Le plugin se charge automatiquement sur iOS. Apple Pay nécessite également un Apple Merchant ID et un certificat. Suivez le guide [Apple Pay](/docs/apple-pay).

Pour PayPal, 3D Secure et les autres moyens de paiement avec redirection, enregistrez un schéma d’URL personnalisé, définissez `returnURL` lors de la création de PaymentSheet ou PaymentFlow et appelez `handleURLCallback` depuis le gestionnaire d’URL de votre application. Sans URL de retour, Stripe ne propose pas les moyens avec redirection autrement admissibles sur iOS. Consultez [Initialisation](/docs/initialize#redirect-based-payment-methods-on-ios).

## Configuration Web

Installez `@stripe/stripe-js@^9.17.0` et `stripe-pwa-elements@^4.1.0`, puis appelez `defineCustomElements()` une seule fois au démarrage. Servez l’application en HTTPS en développement et en production.

- [Démarrage rapide en JavaScript natif](/docs/vanilla-js)
- [Démarrage rapide avec Angular](/docs/angular)
- [Démarrage rapide avec React](/docs/react)
