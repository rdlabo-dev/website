---
title: "Notifications"
sourceRevision: "96734d252ef2d23df15b3d25f52bda7afdd9e042842e0b4c4cafc017c530adf0"
---
# Raccorder les notifications du plugin

Utilisez `receiveListeners` lorsque le contenu natif ou la présentation change après l’initialisation. Il s’agit de notifications de changements réussis, pas d’interception de méthodes. Les guides [Capacitor](../getting-started/capacitor.md) et [Cordova](../getting-started/cordova.md) montrent où les transmettre ; cette page définit le contrat d’événements commun.

Par exemple, sélectionner un autre onglet natif change l’élément mis en évidence, mais pas la position de la barre. Sans notification de mise à jour, l’ouverture d’un panneau Web peut réutiliser une image de l’ancienne sélection. Émettez l’événement de sélection réussie du plugin et incluez-le dans `update`. Une opération de masquage est différente : dirigez son événement vers `none` pour qu’une mise à jour ultérieure de l’apparence ne fasse pas réapparaître la barre masquée.

## Démarrage et routage

Transmettre les notifications depuis le plugin permet à l’Engine de conserver la dernière destination de projection correspondante avant l’abonnement du runtime Web. Aucune variable d’état distincte ni aucun callback d’état initial n’est nécessaire. Ne modifiez pas la livraison des événements applicatifs du plugin : l’Engine enregistre l’état sans rejouer les notifications, les mises à jour ni les actions utilisateur. Sans notification de destination, il déduit la destination initiale de la visibilité de la vue native. L’enregistrement doit exister avant les notifications qu’il doit observer.

Si votre plugin possède plusieurs enregistrements, transmettez la notification à chacun ; `receiveListeners.match` sélectionne la surface propriétaire. Les mises à jour d’apparence ne changent pas la destination. Le moteur de rendu gère toujours le placement et la visibilité natifs avant la connexion.

Avec le repli Web par défaut, un défilement sans image préparée ni liaison de défilement native conserve le repli Web visible jusqu’à ce que le moteur de rendu confirme le placement natif actuel avec sa notification de destination native. Une simple mise à jour d’apparence ne constitue pas cette confirmation. Les consommateurs choisissant la récupération native en cas d’échec doivent maintenir leur propre géométrie native à jour.

## Choisir les événements de mise à jour réussie et de présentation

Toutes les déclarations d’événements entrants appartiennent à `receiveListeners`. Sa liste `update` actualise l’image et les liaisons de valeurs configurées, ses listes `projection` sélectionnent la destination et son filtre facultatif `match` sélectionne les notifications de la surface propriétaire.

| Notification | Où l’émettre dans le plugin existant |
| --- | --- |
| `appearanceChanged` (événement `update`) | Après une mise à jour réussie de l’apparence native, telle que `setColors` |
| `transitionStarted` (`web`) | Avant que le DOM de repli commence à bouger ou qu’une couche Web couvre la vue native |
| `shown` (`native`) | Après l’opération d’affichage existante du plugin ou lors du retour depuis la projection Web |
| `hidden` (`none`) | Après l’opération de masquage existante du plugin |

Les noms des exemples sont des conventions que vous choisissez, pas des méthodes réservées de l’Engine. Un événement `update` actualise l’image préparée et les valeurs configurées sans modifier la destination demandée. Il ne rappelle pas `setColors`.

Émettez `transitionStarted` avant que le DOM commence à bouger, `shown` lorsque la projection native est de nouveau demandée, et `hidden` après l’opération de masquage du plugin. La capture native, la conversion des URL, la préparation des images, la confirmation de dessin, le retrait des images et le nettoyage des écouteurs restent internes à l’Engine. L’Engine n’appelle jamais les méthodes `show`, `hide`, de sélection ou de chargement publicitaire du plugin. Terminez l’enregistrement avec `projection.destroy()` sur iOS ou `projection.close()` sur Android lorsque le moteur de rendu est détruit. Conservez l’enregistrement pendant toute sa durée de vie et appelez les API natives sur le thread UI.
