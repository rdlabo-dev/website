---
title: "Choisir une API avancée"
sourceRevision: "36b669fe0fe5d7f321ae97def344d07b379feb38f23ffd5579bce18341b4d4ed"
---
# API avancées

L’enregistrement de base gère déjà les mesures, la capture et la confirmation du transfert. N’ajoutez pas un second gestionnaire de projection pour le même hôte. Utilisez les API suivantes lorsque votre moteur de rendu gère déjà le travail correspondant et doit le coordonner :

| Besoin | API / guide |
| --- | --- |
| Appliquer un placement natif différé juste avant le retour d’une vue Android opaque | `beforeNativeReveal`, `updatePlacement`, `isProjecting` et `bindProjectionPlacement` ; consultez le [transfert du placement Android](android-placement.md#final-placement-when-returning-from-an-opaque-image-android). Par défaut, les deux callbacks n’effectuent aucun placement personnalisé. |
| Gérer des pages ou modales indépendantes contenant plusieurs contrôles natifs | `createWebProjectionSurface` / `createWebProjectionSurfaces` ; consultez le [guide des moteurs de rendu](renderer.md). |
| Coordonner plusieurs conteneurs de repli dans une transaction native | `createWebProjectionBatch` ; consultez le [transfert par lot](web-projection.md#multiple-fallbacks-in-one-native-transaction). |
| S’adapter à un modèle de propriété existant que les helpers de surface ne peuvent pas exprimer | `createWebProjectionScope` / `createWebProjection` ; consultez la [projection de bas niveau](web-projection.md). |
| Sérialiser des mises à jour d’état remplaçables et récupérer après une confirmation perdue | `createNativeUpdateQueue` ; consultez l’[ordonnancement des mises à jour et la récupération](update-queue.md). |
| Implémenter le pont natif d’un moteur de rendu personnalisé | Méthodes `handle` du gestionnaire d’instantanés ; consultez le [transfert natif](native-handoff.md). |

Ce sont des choix d’intégration, pas des étapes supplémentaires pour terminer une configuration `NativeUIProjection` normale. Conservez les actions métier, les interactions SDK et les notifications applicatives dans le plugin consommateur.

[Vue d’ensemble de la documentation](../README.md)
