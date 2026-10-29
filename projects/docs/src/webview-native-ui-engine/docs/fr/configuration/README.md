---
title: "Paramètres d’enregistrement"
sourceRevision: "306aef1f74b9dd314d2883b647c9e28e4cd936a2c7290d9183eb97d8d1dcab21"
---
# Configurer un enregistrement natif

Commencez par l’[initialisation de base](../getting-started/initialization.md). Les paramètres ci-dessous appartiennent au même enregistrement ; ajoutez uniquement ceux dont votre composant a besoin.

## Comportements facultatifs

Facultatif signifie qu’une valeur par défaut existe, pas qu’une interface évolutive peut omettre ses notifications. Par exemple, une sélection d’onglet modifie l’apparence même si la barre reste à la même position : incluez la notification de sélection réussie dans `receiveListeners.update`.

| Paramètre | Lorsqu’il est omis | Cas et raison de le configurer |
| --- | --- | --- |
| `receiveListeners` | Aucun abonnement aux événements du plugin. L’intention initiale vient de la visibilité de la vue native ; la gestion interne du DOM et du défilement reste active. | Une sélection d’onglet change l’élément mis en évidence : reliez `update` pour actualiser les pixels et les valeurs liées, `projection` pour les changements de présentation et `match` pour le routage par surface. Consultez le [raccordement des événements](events.md#choose-successful-update-and-presentation-events) et la transmission via `receive` dans le guide Cordova. |
| `readValues` | Aucune lecture de valeurs du natif vers le DOM. | Un interrupteur natif change alors que son repli est masqué : lisez son état actuel pour que le repli ne revienne pas avec l’ancienne valeur. Consultez les [liaisons de valeurs](values.md). |
| `values` | Avec `readValues`, toutes les clés renvoyées deviennent des attributs `data-native-ui-value-*`. Sans `readValues`, aucune réflexion n’a lieu. | Un élément personnalisé utilise `checked` plutôt que des attributs pour son rendu : associez cette clé à la propriété de son hôte. Cela ne synthétise pas d’événements d’application. |
| `captureDelayMs` | Prépare les images après un délai de debounce de 50 ms. | La surbrillance d’un onglet est encore animée à l’arrivée de son événement de sélection : attendez des pixels stabilisés. Consultez le [timing de capture](capture.md) ; cela ne retarde pas l’ouverture d’une superposition. |
| `canCapture` | Renvoie true ; les vérifications de géométrie et de plateforme de l’Engine restent applicables. | Un SDK passe d’un contenu statique capturable à une vidéo soumise à des restrictions : empêchez une capture non admissible. Renvoyez l’admissibilité du contenu actuel. |
| `failedFallback` | Utilise le repli Web ordinaire lorsqu’aucune image adaptée n’est disponible. | Une vue SDK n’a pas de remplacement Web utilisable : conservez-la en natif pendant les mouvements automatiques uniquement si le moteur de rendu maintient son placement. La couverture Web explicite et `none` restent prioritaires. Consultez la [politique d’échec](../reference/projection.md#native-surface-requirements). |
| `allowedOrigins` | iOS : `capacitor://localhost`, `app://localhost`, `https://localhost`, `http://localhost`. Android : `https://localhost`, `http://localhost`. | Une application change de nom d’hôte local : indiquez exactement cette origine de confiance pour permettre la connexion du canal. Sur Android, utilisez les mêmes origines pour `install` et chaque enregistrement. |
| `runtime` | Capacitor. | **Obligatoire pour les intégrations Cordova** : sélectionnez Cordova afin que les notifications et les URL de ressources utilisent son transport. |
| `captureMode` (Android) | `COMPOSITED`, incluant l’arrière-plan visible. | Une carte opaque défile devant du contenu adjacent : `VIEW` capture uniquement la carte plutôt que les pixels de fenêtre environnants. Ne l’utilisez pas pour du contenu translucide, des vidéos ou SurfaceView. Consultez l’[admissibilité de la capture](../reference/platforms.md#android-capture-modes). |

L’Engine expose l’[intention de présentation](../reference/state.md) séparément des valeurs du composant. Ni l’une ni les autres ne nécessitent d’enveloppe Engine côté application. La détection des superpositions Ionic utilise un [initialiseur partagé](ionic-overlays.md) distinct et facultatif, pas un argument d’enregistrement ; les autres frameworks signalent explicitement leur cycle de vie.

[Vue d’ensemble de la documentation](../README.md)
