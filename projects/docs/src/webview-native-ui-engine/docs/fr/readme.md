---
title: "Premiers pas"
sourceRevision: "1beee7f21abd1ba323db4e8094e646125b7e1ace27bc1e88330be0781e25c72b"
---
# WebView Native UI Engine

**Placez l’interface Web au-dessus de la couche native.**

_Visuellement, grâce à une projection transparente du natif vers le Web._

![Vue conceptuelle d’une superposition Web au-dessus d’une surface native et du contenu WebView](docs/assets/hero.png)

_Vue conceptuelle. L’apparence native est projetée dans la couche Web pendant l’affichage d’une superposition._

Créez des applications WebView dont les contrôles natifs et le contenu Web partagent les mêmes écrans défilants, transitions et superpositions.

## Au-delà de la frontière de la WebView

Les applications WebView associent la souplesse des mises en page Web à l’accès aux capacités natives des plateformes. Mais l’interface native et la page Web occupent des couches de rendu distinctes. Un contrôle natif placé au-dessus de la WebView ne participe pas automatiquement au défilement, au découpage ni à l’ordre d’empilement du DOM. Une modale Web ne peut pas simplement le recouvrir avec un `z-index` supérieur.

Franchir cette frontière demande plus qu’un appel au pont. Il faut coordonner le placement, l’apparence, les interactions, le rendu et la restauration entre deux systèmes de rendu sur chaque plateforme. Recréer cette coordination pour chaque composant rend des conceptions pourtant utiles coûteuses à livrer et à maintenir.

WebView Native UI Engine rend ce travail réutilisable. Il permet aux applications d’associer une interface native à des écrans et interactions pilotés par le Web, tout en partageant les mécanismes qui transfèrent la présentation entre les deux couches. L’objectif est d’élargir les possibilités des applications WebView et de les rendre concrètement livrables.

## Ce que cela permet

- **Une interface native dans des écrans conçus pour le Web.** Associez barres d’outils, barres d’onglets, commandes de lecture et vues SDK admissibles à la disposition DOM et à la navigation de l’application.
- **Des superpositions Web qui coexistent avec le contenu natif.** Affichez modales et autres superpositions au-dessus des surfaces natives, puis retrouvez l’interface native interactive à leur fermeture.
- **Défilement et transitions préservant l’apparence native.** Déplacez l’apparence capturée de la surface native dans la couche Web, sans recréer son style en CSS.
- **Une infrastructure partagée entre composants et plateformes.** Réutilisez le même cycle de projection et de restauration sur iOS et Android au lieu de le réimplémenter pour chaque intégration.

## Le principe

Utilisez la vue native active là où elle convient, et une projection visuelle préparée dans le DOM lorsque la couche Web doit prendre en charge la présentation. Restaurez la vue native interactive lorsqu’elle peut reprendre la main. Un conteneur DOM existant donne à la projection Web sa place dans la disposition et la structure des couches de l’application.

L’Engine coordonne ce transfert ; le moteur de rendu qui l’intègre crée et positionne toujours ses vues. Une image projetée préserve l’apparence, pas les interactions en direct ni la vidéo. La disponibilité de la capture et la prise en charge de la disposition déterminent quand utiliser une projection, avec un repli explicite lorsqu’elle est impossible. Consultez le [comportement de projection](/docs/projection) pour le contrat détaillé et ses limites.

## Intégration

Les applications obtiennent ces capacités via des plugins intégrant l’Engine. Les auteurs de plugins Capacitor et Cordova l’ajoutent comme dépendance de bibliothèque tout en conservant leurs contrôles natifs et API publiques. Le même Engine prend en charge iOS et Android. Ionic et Angular ne sont pas requis ; la coordination des superpositions Ionic est facultative.

- [Guide des plugins Capacitor](/docs/capacitor-plugin) — installez les dépendances et ajoutez l’enregistrement, les événements et le nettoyage à votre plugin existant.
- [Guide des plugins Cordova](/docs/cordova-plugin) — intégrez le même Engine au cycle de vie et au gestionnaire de ressources de Cordova, sans dépendance à Capacitor.

L’enregistrement natif démarre le runtime Web ; les applications n’ont pas besoin d’un initialiseur Engine distinct pour l’intégration de base. Conservez l’API et les notifications habituelles de votre plugin.

L’API actuelle est antérieure à la version 1.0. Utilisez des versions Engine correspondantes et épinglées pour npm et les dépendances natives. Le placement Android nécessite l’API 23 ou ultérieure ; les captures composites sont disponibles à partir de l’API 26.

## Pour aller plus loin

- [Comportement de projection et intégration avancée](/docs/projection) — exigences DOM, cycle de vie, politiques de repli, prise en charge Ionic facultative et API de bas niveau.
- [Développement et publications](/docs/maintenance) — structure du dépôt, validation et publication.

## Licence

[MIT](LICENSE). L’utilisation commerciale, la modification et la redistribution sont autorisées sous réserve des obligations de mention et d’attribution de la licence. La licence de l’Engine ne modifie pas celles des applications ou plugins qui en dépendent.
