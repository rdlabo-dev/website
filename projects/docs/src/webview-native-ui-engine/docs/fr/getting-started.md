---
title: "Premiers pas"
sourceRevision: "ea28b5c74bdb210658ad501762687d1202480f4895ec5d485047f4a696e3a670"
---
# WebView Native UI Engine

**Placez l’interface Web au-dessus de la couche native.**

_Visuellement, grâce à une projection fluide du natif vers le Web._

![Vue conceptuelle d’une superposition Web au-dessus d’une surface native et du contenu WebView](docs/assets/hero.png)

_Vue conceptuelle. L’apparence native est projetée dans la couche Web pendant la présentation d’une superposition._

Créez des applications WebView dans lesquelles contrôles natifs et contenu Web partagent les mêmes écrans défilants, transitions et superpositions.

## Au-delà de la frontière de la WebView

Les applications WebView combinent la souplesse des mises en page Web avec l’accès aux capacités natives des plateformes. Mais l’interface native et la page Web vivent dans des couches de rendu distinctes. Un contrôle natif placé au-dessus de la WebView ne participe pas automatiquement au défilement, au découpage ou à l’ordre d’empilement du DOM. Une modale Web ne peut pas simplement le couvrir avec un `z-index` supérieur.

Franchir cette frontière demande plus qu’un appel au pont. Il faut coordonner placement, apparence, saisie, rendu et restauration entre deux systèmes de rendu sur chaque plateforme. Reconstruire cette coordination pour chaque composant rend des conceptions pourtant utiles coûteuses à livrer et à maintenir.

WebView Native UI Engine rend ce travail réutilisable. Il permet aux applications de combiner une interface native avec des écrans et interactions pilotés par le Web, tout en partageant les mécanismes qui déplacent la présentation entre les deux couches. L’objectif est d’élargir ce qu’une application WebView peut réaliser et de rendre sa livraison concrètement possible.

## Ce que cela permet

- **Une interface native dans des écrans conçus pour le Web.** Combinez barres d’outils, barres d’onglets, commandes de lecteur et vues SDK admissibles avec la mise en page DOM et la navigation de l’application.
- **Des superpositions Web qui coexistent avec le contenu natif.** Présentez des modales et autres superpositions au-dessus des surfaces natives, puis revenez à l’interface native interactive à leur fermeture.
- **Un défilement et des transitions qui conservent l’apparence native.** Transportez l’apparence capturée de la surface native pendant les mouvements de la couche Web, sans recréer son style en CSS.
- **Une infrastructure partagée entre composants et plateformes.** Réutilisez le même cycle de projection et de restauration sur iOS et Android au lieu de l’implémenter indépendamment dans chaque intégration.

## L’approche

Utilisez la vue native active à sa place et une projection visuelle préparée dans le DOM lorsque la couche Web doit prendre en charge la présentation. Restaurez la vue native interactive lorsqu’elle peut reprendre le relais. Un conteneur DOM existant donne à la projection Web sa place dans la mise en page et les couches de l’application.

L’Engine coordonne ce transfert ; le moteur de rendu qui l’intègre crée et positionne toujours ses vues. Une image projetée préserve l’apparence, pas les interactions actives ni la vidéo. La disponibilité de la capture et la prise en charge de la mise en page déterminent quand une projection peut être utilisée, avec un repli explicite dans le cas contraire. Consultez les [concepts et limites](docs/concepts.md) pour le contrat détaillé et les limites.

## Choisir votre point de départ

Les applications obtiennent ces capacités grâce aux plugins qui intègrent l’Engine. Les auteurs de plugins conservent leurs contrôles natifs et API publiques existants ; l’Engine fournit la coordination entre présentation native et Web. Il prend en charge iOS et Android avec Capacitor ou Cordova. Ionic et Angular ne sont pas requis.

| Point de départ | Objectif |
| --- | --- |
| [Documentation](docs/README.md) | Ordre de lecture : initialisation de base, comportements facultatifs, API avancées et référence. |
| [Concepts et limites](docs/concepts.md) | Déterminer si la projection convient à votre composant. |
| [Initialisation de base](docs/getting-started/initialization.md) | Configuration minimale et paramètres obligatoires, avant l’intégration propre au framework. |

L’enregistrement natif démarre le runtime Web ; l’intégration de base ne nécessite pas d’initialiseur Engine distinct côté application. L’API est en version pré-1.0 : épinglez des versions correspondantes de l’Engine dans npm et les dépendances natives. Le placement Android nécessite l’API 23+, et les instantanés composites sont disponibles à partir de l’API 26.

## Référence et contribution

L’[index de la documentation](docs/README.md) renvoie à la configuration, aux API avancées, aux conteneurs pris en charge et aux contrats des plateformes. Pour le développement et la publication du dépôt, consultez [développement et publications](docs/maintenance.md).

## Licence

[MIT](LICENSE). L’utilisation commerciale, la modification et la redistribution sont autorisées sous réserve de respecter les exigences de mention et d’attribution de la licence. La licence de l’Engine ne modifie pas celles des applications ou plugins qui en dépendent.
