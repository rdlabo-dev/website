---
title: "Encaisser un paiement"
code: ["collect-a-payment/collect-payment.ts.md","collect-a-payment/connection-token.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{"collect-payment.ts":[1,1]}},{"id":"enregistrer-les-écouteurs-au-niveau-de-l’application","activeLine":{"collect-payment.ts":[6,19]}},{"id":"initialiser","activeLine":{"connection-token.ts":[0,34]}},{"id":"fournir-un-jeton-de-connexion-de-manière-sécurisée","activeLine":{"connection-token.ts":[0,34]}},{"id":"créer-un-paymentintent-sur-votre-backend","activeLine":{"collect-payment.ts":[34,42]}},{"id":"rechercher-des-lecteurs","activeLine":{"collect-payment.ts":[22,30]}},{"id":"connecter-un-lecteur","activeLine":{"collect-payment.ts":[27,34]}},{"id":"recueillir-un-moyen-de-paiement","activeLine":{"collect-payment.ts":[42,44]}},{"id":"confirmer-le-paymentintent","activeLine":{"collect-payment.ts":[43,45]}},{"id":"gérer-l’annulation-et-les-erreurs","activeLine":{"collect-payment.ts":[14,19]}},{"id":"déconnecter-le-lecteur","activeLine":{"collect-payment.ts":[44,48]}}]
sourceRevision: "3624bcccaacb3fdb719b87646a7c3a1b6680b4b5c88fff0ef52df36340b8e5fc"
---
Encaissez un paiement en personne avec Stripe Terminal : enregistrez les écouteurs dès le démarrage, initialisez le plugin, connectez un lecteur et confirmez un PaymentIntent.

## Prérequis pour le premier test

Avant la première tentative d’encaissement, préparez :

- Les réglages de plateforme décrits dans [Configuration](/docs/configuration), y compris les autorisations Android nécessaires
- Un point de terminaison authentifié fournissant des jetons de connexion, que votre application peut appeler
- Un PaymentIntent de test avec `card_present`, créé sur votre serveur
- Un `locationId` Stripe Terminal adapté au type de connexion à rechercher

Le premier résultat à obtenir est : connecter un lecteur → recueillir un moyen de paiement → confirmer le PaymentIntent et recevoir `ConfirmedPaymentIntent`. L’exécution de la commande doit toujours attendre votre webhook Stripe. Pour les lecteurs simulés, utilisez un type de connexion **pris en charge** avec `isTest: true`, comme indiqué dans [Configuration](/docs/configuration) : `TerminalConnectTypes.Simulated` n’est pas universel.

## Enregistrer les écouteurs au niveau de l’application

Enregistrez les écouteurs d’événements Terminal une seule fois par démarrage de l’application JavaScript, le plus tôt possible pendant l’amorçage — par exemple dans `main.ts`, un initialiseur d’application ou un service singleton initialisé au démarrage — et avant toute initialisation ou opération. Conservez-les pendant toute la durée de vie du composant qui en est responsable au niveau de l’application.

!::TerminalEventsEnum::

Les surcharges typées de `addListener` couvrent la plupart de ces membres. `DiscoveringReaders` et `CancelDiscoveredReaders` sont émis au démarrage et à l’annulation de la recherche native, mais n’ont pas de surcharge dédiée ; consultez la page [API](/docs/api).

## Initialiser

Privilégiez une requête authentifiée côté application via `RequestedConnectionToken` et `setConnectionToken`. Votre application peut ainsi joindre ses identifiants d’autorisation habituels et contrôler les erreurs. Enregistrez l’écouteur avant `initialize` ; le SDK Terminal demande un nouveau jeton de connexion à usage unique chaque fois qu’il en a besoin. Activez `isTest` pendant le développement.

!::initialize::

Sur le Web, `initialize` nécessite une nouvelle instance du plugin : un nouvel appel après une initialisation réussie lève `Stripe Terminal has already been initialized`.

## Fournir un jeton de connexion de manière sécurisée

Omettez `tokenProviderEndpoint` et enregistrez `RequestedConnectionToken` **avant** `initialize`. Lorsque le SDK a besoin d’un jeton, le plugin émet cet événement et attend `setConnectionToken({ token })`.

Effectuez la requête avec votre mécanisme d’autorisation habituel, exigez une réponse réussie, validez `secret`, puis transmettez-le comme `token`. Appelez `setConnectionToken` uniquement pendant qu’une demande de jeton est en attente ; Android et iOS rejettent les appels supplémentaires avec `Stripe Terminal do not pending fetchConnectionToken`. Ne journalisez jamais la réponse ni le jeton.

!::setConnectionToken::

### Mode de compatibilité `tokenProviderEndpoint`

`tokenProviderEndpoint` convient aux déploiements simples, mais les clients natifs v8.2.1 envoient un **POST** HTTP minimal : l’appelant ne peut ajouter ni en-tête d’autorisation ni corps de requête. Utilisez-le uniquement si votre serveur peut authentifier et protéger cette requête par d’autres moyens. N’exposez jamais un point de terminaison public de création de jetons sans restriction.

Lorsque `tokenProviderEndpoint` est défini, le plugin envoie un **POST** HTTP avec un corps vide. La réponse **doit** être un objet JSON contenant une chaîne `secret` :

```json
{ "secret": "pst_..." }
```

Cette valeur est un [jeton de connexion](https://docs.stripe.com/terminal/fleet/connect-reader?terminal-sdk-platform=js#connection-token) Stripe Terminal. Créez-le sur le serveur avec votre clé API **secrète** (`stripe.terminal.connectionTokens.create()`). Ne placez jamais la clé secrète, des clés restreintes permettant de créer des jetons ou des jetons de connexion bruts dans le binaire de l’application, les journaux ou une configuration cliente publique.

La démo officielle expose `POST /connection/token` et renvoie `{ secret }` ; adaptez son authentification et son autorisation à votre application.

:::message
Dans la version v8.2.1, Android journalise le `secret` renvoyé via `tokenProviderEndpoint`, et le Web journalise les options transmises à `setConnectionToken`. Évitez le mode par point de terminaison sur Android tant que cette journalisation n’est pas supprimée en amont, évitez la conservation des journaux de console Web en production et passez à une version corrigée du plugin dès qu’elle est disponible.
:::

## Créer un PaymentIntent sur votre backend

Créez le PaymentIntent sur votre serveur. La démo officielle utilise `POST /connection/intent` et renvoie `{ paymentIntent }` en tant que **secret client**.

Exigences correspondant au plugin et à la démo :

- `payment_method_types` doit inclure `card_present`
- Conservez la clé secrète Stripe sur le serveur
- Transmettez uniquement le secret client à `collectPaymentMethod({ paymentIntent })`
- Ne créez ni ne confirmez de PaymentIntents pour paiements en présence de la carte avec une clé publique dans l’application

Exemple côté serveur tiré de la démo :

```ts
await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
  payment_method_types: ['card_present'],
  capture_method: 'automatic',
});
```

## Rechercher des lecteurs

Recherchez des lecteurs à proximité ou simulés. Fournissez une valeur `TerminalConnectTypes` et un `locationId` Stripe Terminal lorsque le type de connexion l’exige.

`locationId` est utilisé lors de la recherche Internet et requis pour connecter les lecteurs Tap to Pay, Bluetooth et USB Android. La recherche Internet peut filtrer par emplacement ; Tap to Pay et Bluetooth transmettent l’emplacement à la configuration de connexion.

Points particuliers :

- **Web** prend uniquement en charge `Internet`. Tout autre `type` est indisponible.
- **Bluetooth sur iOS** signale les lecteurs via `DiscoveredReaders` **à plusieurs reprises** à mesure que la recherche évolue. Consultez [Stripe : connecter un lecteur Bluetooth (iOS)](https://docs.stripe.com/terminal/payments/connect-reader?terminal-sdk-platform=ios&reader-type=bluetooth). Définissez `bluetoothScanWaitTime` (en millisecondes) pour que `discoverReaders` attende avant de se terminer avec la liste actuelle. La valeur `0`, ou l’absence de valeur, renvoie le premier résultat de recherche.
- **iOS** émet aussi `DiscoveringReaders` au démarrage de la recherche. USB, HandOff et `Simulated` comme `type` ne sont pas implémentés.
- **Android** exige `ACCESS_FINE_LOCATION` à l’exécution, sinon `discoverReaders` est rejeté. `Simulated` est traité comme une recherche Bluetooth. `HandOff` correspond à Apps on Devices.
- Appelez `cancelDiscoverReaders` si l’utilisateur quitte l’interface de recherche. Sur le Web, l’annulation est sans effet. Donnez toujours à l’utilisateur un moyen d’arrêter une longue recherche Bluetooth.

Écoutez `DiscoveredReaders` en plus d’attendre la promesse. Sur iOS avec Bluetooth, l’écouteur fournit la liste actualisée ; la promesse peut se terminer avant le dernier événement.

!::discoverReaders::

!::DiscoverReadersOptions::

!::TerminalConnectTypes::

## Connecter un lecteur

Connectez un des lecteurs découverts avant de recueillir les données de paiement. L’objet `reader` doit provenir du résultat de recherche actuel (`serialNumber` est l’identifiant principal du plugin).

`autoReconnectOnUnexpectedDisconnect` vaut `false` par défaut et s’applique à Tap to Pay et Bluetooth. Pour USB sur Android, la configuration de connexion native active actuellement la reconnexion automatique. Les connexions Internet n’utilisent pas ce paramètre.

`merchantDisplayName` et `onBehalfOf` s’appliquent à Tap to Pay sur iOS (`LocalMobileReader`). Sur Android, définissez plutôt les valeurs de compte connecté et d’affichage sur le PaymentIntent.

!::connectReader::

## Recueillir un moyen de paiement

Transmettez le **secret client** du PaymentIntent fourni par votre backend à `collectPaymentMethod`. Le plugin récupère ce PaymentIntent, puis recueille le moyen de paiement sur le lecteur connecté.

!::collectPaymentMethod::

## Confirmer le PaymentIntent

Traitez et confirmez le PaymentIntent dont le moyen de paiement a été recueilli. `confirmPaymentIntent` est rejeté si cette collecte n’a pas préalablement réussi (`PaymentIntent not found for confirmPaymentIntent`).

!::confirmPaymentIntent::

`ConfirmedPaymentIntent` est un signal pour l’interface cliente, pas une autorisation d’exécuter la commande. N’exécutez celle-ci qu’après vérification, par votre backend, d’un webhook Stripe tel que `payment_intent.succeeded`.

## Gérer l’annulation et les erreurs

- `cancelCollectPaymentMethod` annule une collecte en cours. En cas de réussite, la promesse est résolue et `Canceled` est émis.
- `Failed` est émis si `collectPaymentMethod` ou `confirmPaymentIntent` échoue. La promesse de cet appel est également rejetée. La charge utile peut contenir `message`, `code` et `declineCode`.
- N’utilisez pas `ConnectionStatusChange` pour détecter une déconnexion inattendue. Utilisez `UnexpectedReaderDisconnect`, ainsi que `DisconnectedReader` pour Bluetooth/USB. Consultez [Cycle de vie du lecteur](/docs/reader-lifecycle).

!::cancelCollectPaymentMethod::

## Déconnecter le lecteur

Déconnectez le lecteur lorsque le parcours de paiement est terminé ou que le lecteur n’est plus nécessaire.

!::disconnectReader::

## Après le premier succès

Consultez [Cycle de vie du lecteur](/docs/reader-lifecycle) pour la déconnexion, la reconnexion et les mises à jour. Pour accepter les paiements avec un téléphone comme lecteur, consultez [Tap to Pay](/docs/tap-to-pay). Les signatures formelles restent sur la page [API](/docs/api).
