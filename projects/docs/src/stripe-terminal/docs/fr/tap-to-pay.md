---
title: "Tap to Pay"
code: ["tap-to-pay/tap-to-pay.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{"tap-to-pay.ts":[1,1]}},{"id":"prérequis-des-plateformes","activeLine":{"tap-to-pay.ts":[1,1]}},{"id":"ordre-de-configuration","activeLine":{"tap-to-pay.ts":[8,11]}},{"id":"vérifier-l’association-du-compte","activeLine":{"tap-to-pay.ts":[11,16]}},{"id":"configuration-de-l’interface","activeLine":{"tap-to-pay.ts":[16,23]}},{"id":"rechercher-et-connecter","activeLine":{"tap-to-pay.ts":[23,36]}},{"id":"limitations","activeLine":{"tap-to-pay.ts":[1,1]}}]
sourceRevision: "ea74022b5448a326cc27d3b8799c29dd9f05e1309b01515a4a1d26f9af088da9"
---
Tap to Pay permet d’encaisser des paiements sans contact sur un téléphone ou une tablette compatible, sans lecteur de carte séparé. Utilisez `TerminalConnectTypes.TapToPay` après la [configuration](/docs/configuration) et la mise en place d’un [jeton de connexion](/docs/collect-a-payment) fonctionnel.

La démo officielle présente Tap to Pay, Internet et Bluetooth dans [demo/angular](https://github.com/capacitor-community/stripe/tree/main/demo/angular).

## Prérequis des plateformes

| Plateforme | Pris en charge | Remarques                                                                                                      |
| -------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| Android  | Oui       | Appareil compatible NFC, autorisation de localisation et admissibilité à Stripe Tap to Pay sur Android. `minSdkVersion` 26.     |
| iOS      | Oui       | Tap to Pay sur iPhone ; iOS 16.4+ pour la vérification de l’association du compte. `setTapToPayUxConfiguration` n’est pas implémenté. |
| Web      | Non        | `discoverReaders({ type: TapToPay })` est indisponible.                                                      |

Terminez la configuration Terminal dans le Dashboard Stripe et créez un [emplacement](https://docs.stripe.com/terminal/fleet/locations). Transmettez ce `locationId` à `discoverReaders` ; le plugin l’utilise pour connecter le lecteur Tap to Pay.

Sur Android, `initialize` demande l’autorisation de localisation indiquée dans [Configuration](/docs/configuration). Les autorisations Bluetooth ne sont demandées que lors de la recherche de lecteurs `Bluetooth` ou `Simulated` ; la recherche Tap to Pay elle-même ne les demande pas.

## Ordre de configuration

1. Enregistrez les écouteurs au niveau de l’application.
2. Enregistrez un fournisseur authentifié de jetons de connexion avec `RequestedConnectionToken` + `setConnectionToken`, puis appelez `initialize`.
3. Sur iOS, appelez `isTapToPayAccountLinked` sans mettre le résultat en cache.
4. Sur Android, appelez éventuellement `setTapToPayUxConfiguration`.
5. Appelez `discoverReaders` avec `type: TerminalConnectTypes.TapToPay` et `locationId`.
6. Appelez `connectReader` avec le lecteur découvert.
7. Recueillez le moyen de paiement et confirmez un PaymentIntent `card_present` comme indiqué dans [Encaisser un paiement](/docs/collect-a-payment).

!::initialize::

## Vérifier l’association du compte

`isTapToPayAccountLinked` est réservé à **iOS** et nécessite iOS 16.4 ou une version ultérieure. `initialize()` doit avoir été exécuté pour que le SDK dispose d’un fournisseur de jetons de connexion. Aucune connexion à un lecteur n’est nécessaire et l’appel n’active pas le NFC.

La réponse est obtenue auprès d’Apple à chaque appel. Ne mettez pas `isLinked` en cache. Pour Stripe Connect, transmettez l’identifiant du compte connecté dans `onBehalfOf` ; omettez-le pour vérifier le compte propriétaire de la clé API.

Android et le Web rejettent l’appel (`unimplemented` / `unavailable`). Protégez-le par une vérification de plateforme ou un `.catch()`, comme le fait la démo officielle pour la configuration d’interface propre à Android.

!::isTapToPayAccountLinked::

!::IsTapToPayAccountLinkedOptions::

## Configuration de l’interface

`setTapToPayUxConfiguration` est réservé à **Android**. Appelez-le après `initialize()` et avant `connectReader()`. iOS renvoie une erreur de non-implémentation ; le Web journalise l’appel puis se termine.

L’implémentation Android installée applique `colors` (`primary`, `success`, `error`, avec `'default'` ou une chaîne hexadécimale comme `'#FF5733'`) et `darkMode` (`SYSTEM`, `DARK`, `LIGHT`). Le champ TypeScript `tapZone` est déclaré, mais n’est pas appliqué par le SDK Terminal Android actuel utilisé dans v8.2.1.

!::setTapToPayUxConfiguration::

!::TapToPayUxConfiguration::

!::TapToPayColorScheme::

!::TapToPayColor::

!::TapToPayTapZone::

!::TapToPayDarkMode::

## Rechercher et connecter

Recherchez avec `TerminalConnectTypes.TapToPay` et un `locationId`. La simulation Tap to Pay utilise `isTest: true` dans `initialize`, et non `TerminalConnectTypes.Simulated`.

Connectez le lecteur issu du résultat de recherche. `autoReconnectOnUnexpectedDisconnect` vaut `false` par défaut et est pris en charge pour Tap to Pay. Sur iOS, `merchantDisplayName` et `onBehalfOf` sont transmis à la configuration de connexion Tap to Pay. Sur Android, définissez plutôt ces valeurs sur le PaymentIntent.

!::discoverReaders::

!::connectReader::

Après la connexion, utilisez `collectPaymentMethod` et `confirmPaymentIntent` avec un PaymentIntent `card_present` créé sur le serveur.

## Limitations

- Le Web ne permet ni de rechercher ni de connecter Tap to Pay.
- Les couleurs de l’interface et le mode sombre sont réservés à Android ; iOS utilise l’interface système Tap to Pay sur iPhone.
- L’état d’association du compte est réservé à iOS et doit être redemandé à Apple à chaque fois.
- `tapZone` fait partie de l’API TypeScript, mais n’est pas transmis au SDK Android installé.
- Les mises à jour facultatives du logiciel des lecteurs suivent toujours les règles de [Cycle de vie du lecteur](/docs/reader-lifecycle) : ne les installez pas pendant l’encaissement.
- Conservez les clés secrètes Stripe et la création des jetons de connexion sur le backend.
