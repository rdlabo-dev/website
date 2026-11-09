---
title: "Vue d’ensemble de la documentation"
sourceRevision: "89d93b28716c579e0f214dd6295f82a48c0db142e66d1fbcb768d8accb6ac73f"
---
# Documentation

Créez des écrans pilotés par le Web avec des contrôles et des capacités natives. Ces guides expliquent comment intégrer l’Engine dans un plugin pour faire coexister Web UI et Native UI. Commencez par [le modèle partagé](concepts.md) : comment un composant natif trouve sa place dans une mise en page Web, quelle couche le présente et comment les interactions reviennent à la vue active. Le défilement et les superpositions sont des exemples de cette coordination, pas des modèles d’intégration distincts.

Choisissez ensuite l’intégration minimale adaptée à vos responsabilités. Enregistrez une vue native et son conteneur DOM, connectez les notifications de cycle de vie nécessaires à votre interface et n’ajoutez les API avancées que si vous gérez déjà les lots ou le placement d’un moteur de rendu.

## Choisir selon le problème à résoudre

| Cas | Point de départ | Pourquoi |
| --- | --- | --- |
| Une vue SDK native admissible appartient à un flux Web défilant | [Enregistrement de base](getting-started/initialization.md) et [limites des plateformes](reference/platforms.md) | Associez-la à son conteneur DOM ; le suivi natif ou la présentation temporaire d’une image dépend de la plateforme et de la mise en page. |
| Une modale Web doit couvrir la barre d’onglets native d’un plugin | [Enregistrement de base](getting-started/initialization.md), puis le guide d’intégration du framework | Enregistrez la vue et son hôte DOM, puis connectez le cycle de vie des superpositions ; l’Engine coordonne le transfert et la restauration. |
| Un repli masqué revient avec l’ancienne sélection d’un interrupteur | [Liaisons de valeurs](configuration/values.md) | Reflétez les données natives actuelles sur l’hôte de repli, indépendamment de son lieu d’affichage. |
| Les boutons de barre d’outils d’arrière-plan et ceux de la modale de premier plan nécessitent des durées de transfert différentes | [Surfaces du moteur de rendu](advanced/renderer.md) | Séparez les propriétaires pour que fermer une surface ne puisse pas restaurer les contrôles d’une autre. |
| Un moteur de rendu existant fait se chevaucher les mises à jour ou perd une confirmation native | [File de mises à jour](advanced/update-queue.md) | Sérialisez les passes de lecture de l’état actuel et réconciliez la connexion sans rejouer les actions utilisateur. |

L’ordre de lecture complet suit. Ignorez les API avancées sauf si votre moteur de rendu gère le travail décrit dans leurs cas d’usage.

## 1. Comprendre l’approche

Les [concepts et limites](concepts.md) expliquent ce que permet la projection, ses différences avec l’interface native active et le repli Web, et les responsabilités qui restent au plugin.

## 2. Initialiser et intégrer

Lisez l’[initialisation de base](getting-started/initialization.md) pour l’appel minimal et les paramètres obligatoires. Choisissez ensuite un guide de plateforme-framework :

- [Plugin Capacitor](getting-started/capacitor.md) : dépendances, points d’entrée du plugin natif, transmission des événements et démontage.
- [Plugin Cordova](getting-started/cordova.md) : le même enregistrement avec le démarrage et la gestion des ressources Cordova.

Aucune de ces approches ne nécessite une seconde enveloppe Engine côté application ni les API avancées de moteur de rendu.

## 3. Ajouter des comportements facultatifs

Les [paramètres d’enregistrement](configuration/README.md) présentent les valeurs par défaut et les situations nécessitant chaque option. Ne lisez que les détails pertinents :

- [Notifications](configuration/events.md) : informer l’Engine des changements d’apparence ou de présentation.
- [Liaisons de valeurs](configuration/values.md) : maintenir les données du composant de l’hôte de repli en accord avec l’état natif.
- [Timing de capture](configuration/capture.md) : préparer les pixels après stabilisation de l’apparence native.
- [Superpositions Ionic](configuration/ionic-overlays.md) : raccorder la couverture Ionic avec un initialiseur applicatif partagé.
- [Superpositions Web personnalisées](configuration/pause-resume.md) : réexporter pause/resume depuis un plugin pour que les applications encadrent leurs propres superpositions.

## 4. Utiliser les API avancées lorsque vous possédez un moteur de rendu

[Choisissez une API avancée](advanced/README.md) avant d’en ajouter une. Ces guides répondent à des besoins distincts de moteurs de rendu existants ; ils ne forment pas une suite d’étapes de configuration obligatoires.

- [Surfaces de pages et de modales](advanced/renderer.md)
- [Projection Web de bas niveau et lots](advanced/web-projection.md)
- [Transfert natif et liaisons de défilement](advanced/native-handoff.md)
- [Placement différé sur Android](advanced/android-placement.md)
- [Sérialisation des mises à jour et récupération](advanced/update-queue.md)

## Référence

Utilisez ces pages pour vérifier les contrats et comportements pris en charge pendant l’implémentation de l’une ou l’autre approche :

- [Contrat de projection et durée de vie](reference/projection.md)
- [Conteneurs HTML et Ionic pris en charge](reference/containers.md)
- [Intention de présentation observable](reference/state.md)
- [Limites de capture et des plateformes](reference/platforms.md)

## Contribution

[Développement et publications](maintenance.md) présente la structure du dépôt, les vérifications locales, la CI et la publication. Sa lecture n’est pas nécessaire pour consommer l’Engine.
