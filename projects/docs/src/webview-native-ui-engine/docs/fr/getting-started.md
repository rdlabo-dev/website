---
title: "Premiers pas"
sourceRevision: "e0cb1e5d66f43833d78bf2f23945d89821bba9fbfe7e62a451fb632edbe114b2"
---
# Au-delà de la WebView.

**Intégrez Native UI de façon fluide aux applications Web.**

Créez vos écrans avec la souplesse du Web et les contrôles et capacités des plateformes natives. WebView Native UI Engine les aide à fonctionner comme une seule expérience, tout en conservant vos mises en page et votre navigation Web.

## Web UI. Native UI. Une seule expérience.

Un composant natif devrait sembler faire partie de l’écran qui l’entoure. Par exemple :

- **Défiler ensemble.** Une annonce native se déplace avec le contenu Web environnant lorsque le lecteur fait défiler un flux.
- **Se superposer ensemble.** Une alerte Web apparaît au-dessus des contrôles de navigation natifs. Fermez-la : ces contrôles redeviennent disponibles pour les interactions natives.

Le défilement et les superpositions illustrent un objectif plus large : faire coexister Web UI et Native UI pendant tout le cycle de vie de l’écran.

![Vue conceptuelle d’une superposition Web au-dessus d’une surface native et du contenu WebView](docs/assets/hero.png)

_Vue conceptuelle de la présentation d’une superposition. L’Engine projette l’apparence native dans la couche Web ; il ne réordonne pas la vue native réelle dans le DOM._

https://github.com/user-attachments/assets/2768f014-7325-49c7-b848-25052756c36d

Des contrôles natifs sous une alerte Web, puis une annonce native défilant avec le contenu Web. Enregistré sur iOS Simulator.

## Conçu pour les développeurs de plugins

WebView Native UI Engine est une bibliothèque destinée aux **développeurs de plugins Capacitor et Cordova**. Intégrez-la à un plugin pour introduire des composants natifs dans des écrans pilotés par le Web, sans obliger chaque application à construire sa propre coordination entre couches de rendu.

Une vue native au-dessus d’une WebView ne participe pas automatiquement au défilement, au découpage ou à l’ordre d’empilement du DOM. Une modale Web ne peut pas simplement la couvrir avec un `z-index` supérieur. L’Engine coordonne la présentation à travers cette frontière, pour vous permettre de vous concentrer sur les contrôles et capacités natives de votre plugin.

Utilisez-le pour les barres d’outils, barres d’onglets, contrôles et vues SDK capturables. Conservez votre API de plugin et votre logique métier existantes ; les applications obtiennent ces capacités par les plugins qu’elles utilisent.

## Fonctionnement

Le plugin fournit une vue native et un conteneur DOM qui définit sa place dans la mise en page Web. L’Engine coordonne les mesures DOM, le suivi natif du défilement pris en charge et le transfert entre présentation native et Web.

Lorsque la couche Web doit prendre en charge la présentation, l’Engine affiche une image préparée du composant natif dans ce conteneur. Lorsque la présentation native peut reprendre, il coordonne le placement et la restauration de la vue interactive.

L’image est une projection visuelle temporaire, pas un second contrôle interactif. Elle ne transmet pas les clics et ne lit pas de vidéo en direct. Les conditions d’éligibilité de capture et les limites de rendu des plateformes restent applicables, notamment les différences de reflets de Liquid Glass. Lorsqu’aucune image adaptée n’est disponible, l’intégration utilise son repli Web configuré. Consultez les [concepts et limites](docs/concepts.md) et la [prise en charge des plateformes](docs/reference/platforms.md) avant de choisir un composant.

## Commencer à développer

L’Engine prend en charge **iOS et Android**. Ionic et Angular sont facultatifs. Commencez avec une vue native et son conteneur DOM, puis connectez les notifications de cycle de vie nécessaires à votre interface. Les guides d’intégration couvrent le démarrage du runtime et la prise en charge facultative des frameworks.

| Point de départ | Objectif |
| --- | --- |
| [Initialisation de base](docs/getting-started/initialization.md) | Enregistrer une vue native et son conteneur DOM avec la configuration minimale requise. |
| [Guide de plugin Capacitor](docs/getting-started/capacitor.md) | Connecter l’Engine à un plugin Capacitor existant. |
| [Guide de plugin Cordova](docs/getting-started/cordova.md) | Utiliser le même cycle de vie via les points d’entrée natifs de Cordova. |
| [Documentation](docs/README.md) | Trouver paramètres facultatifs, API de moteur de rendu et référence selon le problème à résoudre. |

Utilisez des versions correspondantes de l’Engine dans npm et les dépendances natives, et conservez les fichiers de verrouillage des dépendances pour des builds reproductibles. Le placement Android nécessite l’API 23+, et les instantanés composites sont disponibles à partir de l’API 26.

## Intégration Ionic facultative

Pour les applications Ionic utilisant un plugin compatible avec l’Engine, le point d’entrée `@webview-native-ui/engine/ionic` connecte les événements de cycle de vie des superpositions Ionic à la projection native :

```ts
import { enableSupportIonicOverlays } from '@webview-native-ui/engine/ionic';

enableSupportIonicOverlays();
```

Appelez-le une fois au démarrage de l’application, sauf si votre plugin l’active déjà. Les applications qui l’importent directement ont besoin de `@webview-native-ui/engine` comme dépendance directe. Cette intégration partagée du framework coordonne la couverture entre plugins ; chaque plugin garde le contrôle de sa propre API de présentation. Consultez la [prise en charge des superpositions Ionic](docs/configuration/ionic-overlays.md) pour la configuration, les superpositions prises en charge et les fonctions utilitaires des moteurs de rendu.

## Contribution

Pour le développement, la vérification et la publication du dépôt, consultez [développement et publications](docs/maintenance.md).

## Licence

[MIT](LICENSE). L’utilisation commerciale, la modification et la redistribution sont autorisées sous réserve de respecter les exigences de mention et d’attribution de la licence. La licence de l’Engine ne modifie pas celles des applications ou plugins qui en dépendent.

Pour le runtime facultatif des contrôles partagés et les frontières des adaptateurs, consultez les [contrôles partagés](docs/controls.md).
