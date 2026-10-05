---
title: "Cycle de vie du lecteur"
code: ["reader-lifecycle/reader-lifecycle.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{"reader-lifecycle.ts":[1,1]}},{"id":"écouter-les-mises-à-jour-du-logiciel","activeLine":{"reader-lifecycle.ts":[2,35]}},{"id":"écouter-l’état-et-les-demandes-de-saisie","activeLine":{"reader-lifecycle.ts":[35,63]}},{"id":"définir-l’affichage-du-lecteur","activeLine":{"reader-lifecycle.ts":[63,78]}},{"id":"annuler-la-recherche","activeLine":{"reader-lifecycle.ts":[78,80]}},{"id":"déconnexion-et-reconnexion","activeLine":{"reader-lifecycle.ts":[80,112]}},{"id":"gestion-des-erreurs","activeLine":{"reader-lifecycle.ts":[112,119]}}]
sourceRevision: "67def22ef4b54e45a30ebe4508ca2565211ebff654bf739a74a93dade4599b3b"
---
Gérez les mises à jour du logiciel, l’état du lecteur et les messages d’affichage afin que les opérations Terminal n’interrompent pas l’encaissement.

## Écouter les mises à jour du logiciel

Le lecteur peut commencer à se mettre à jour si nécessaire. Écoutez les mises à jour disponibles, installez-les ou annulez-les et affichez la progression pendant l’installation.

Contraintes :

- Appelez `setSimulatorConfiguration` **avant** `discoverReaders` pour simuler une mise à jour (`SimulateReaderUpdate.UpdateAvailable` ou `Required`). Sur le Web, `setSimulatorConfiguration` est sans effet.
- `StartInstallingUpdate`, `ReaderSoftwareUpdateProgress` et `FinishInstallingUpdate` s’appliquent aux lecteurs Bluetooth et USB. Une mise à jour **obligatoire** à la première connexion s’installe automatiquement, **avant** `ConnectedReader` et avant que `connectReader()` se termine. Ordre : `StartInstallingUpdate` → `ReaderSoftwareUpdateProgress` (répété) → `FinishInstallingUpdate` → `ConnectedReader` → résolution de `connectReader()`. Affichez une indication dans l’interface pour qu’une connexion longue ne soit pas prise pour un blocage.
- `ReportAvailableUpdate` indique qu’une mise à jour facultative est prête ; appelez `installAvailableUpdate` lorsque le commerçant peut attendre. Ne lancez pas d’installation facultative pendant l’encaissement.
- `progress` est un nombre à virgule flottante compris entre `0` et `1`.
- `cancelInstallUpdate` annule une installation en cours lorsque le SDK le permet. Les méthodes Web d’installation et d’annulation sont sans effet.
- Tap to Pay sur iOS signale aussi le début, la progression et la fin de l’installation via le délégué du lecteur Tap to Pay. L’interface Tap to Pay sur Android est distincte ; consultez [Tap to Pay](/docs/tap-to-pay).

!::installAvailableUpdate::

!::cancelInstallUpdate::

!::setSimulatorConfiguration::

## Écouter l’état et les demandes de saisie

Pour les lecteurs sans écran, récupérez le niveau de batterie, les événements du lecteur, les messages d’affichage et les demandes de saisie via les écouteurs, puis affichez-les sur l’appareil mobile.

`BatteryLevel`, `ReaderEvent`, `RequestDisplayMessage` et `RequestReaderInput` s’appliquent aux lecteurs Bluetooth et USB. Les mises à jour de batterie sont émises à la connexion et environ toutes les 10 minutes.

## Définir l’affichage du lecteur

Sur les appareils avec écran, affichez le contenu du panier avant `collectPaymentMethod`. Effacez l’affichage une fois terminé. Les lecteurs Internet sur le Web prennent en charge ces appels.

!::setReaderDisplay::

!::clearReaderDisplay::

!::Cart::

!::CartLineItem::

## Annuler la recherche

Appelez `cancelDiscoverReaders` lorsque l’utilisateur quitte l’écran de recherche ou après un délai d’expiration. En cas de réussite, les plateformes natives émettent `CancelDiscoveredReaders`. Si aucune recherche n’est en cours, la promesse est tout de même résolue.

La recherche Bluetooth sur iOS peut durer longtemps et continuer à émettre `DiscoveredReaders`. Associez l’annulation à `bluetoothScanWaitTime` ou à votre propre délai d’expiration. Sur le Web, `cancelDiscoverReaders` est sans effet.

!::cancelDiscoverReaders::

## Déconnexion et reconnexion

`disconnectReader` déconnecte le lecteur actuel. Si aucun lecteur n’est connecté, la promesse est résolue.

Comportement de `DisconnectedReader` :

- Tous les types de lecteurs l’émettent en réponse à `disconnectReader()`, **sans** `reason`.
- Bluetooth et USB l’émettent aussi **avec** un `reason` lorsque la déconnexion du lecteur est terminée. Une déconnexion demandée par l’utilisateur produit donc **deux** événements : l’accusé de réception, puis la déconnexion accompagnée de sa raison.

Ne considérez **pas** `ConnectionStatusChange` comme une déconnexion inattendue. Utilisez `UnexpectedReaderDisconnect` pour avertir l’utilisateur. Vous pouvez rappeler `discoverReaders` pour vous reconnecter ; prévoyez toujours un délai d’expiration ou `cancelDiscoverReaders`.

Définissez `autoReconnectOnUnexpectedDisconnect: true` dans `connectReader` pour Tap to Pay et Bluetooth si vous souhaitez que le SDK réessaie. Écoutez ensuite :

- `ReaderReconnectStarted` — contient `reader` et `reason`
- `ReaderReconnectSucceeded`
- `ReaderReconnectFailed`

`cancelReaderReconnection` annule une reconnexion en cours. Sur le Web, `rebootReader` et `cancelReaderReconnection` sont sans effet.

!::getConnectedReader::

!::rebootReader::

!::cancelReaderReconnection::

## Gestion des erreurs

`Failed` est émis si la collecte ou la confirmation échoue ; la promesse correspondante est rejetée avec les mêmes `message` / `code` / `declineCode` lorsque le SDK natif les fournit.

`UnexpectedReaderDisconnect` signifie que Terminal a perdu la connexion au lecteur en dehors de `disconnectReader()`. Pour Bluetooth et USB, inspectez `DisconnectedReader` pour obtenir le `DisconnectReason` (`POWERED_OFF`, `BLUETOOTH_DISABLED`, `CRITICALLY_LOW_BATTERY`, etc.).
