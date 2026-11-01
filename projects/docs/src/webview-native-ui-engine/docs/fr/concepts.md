---
title: "Concepts et limites"
sourceRevision: "d9212c9dd7d554bf845bbec3b2217bd32eb6850359e071c8051d35f39f3ef594"
---
# Des interfaces natives dans des écrans pilotés par le Web

L’objectif est de combiner, dans un même écran, la souplesse des mises en page et de la navigation Web avec les contrôles et capacités natives. Les applications conservent leur interface pilotée par le Web ; les plugins fournissent les composants natifs. L’Engine coordonne leur présentation pour que chaque composant coexiste avec l’écran environnant au fil des changements de mise en page, des interactions et de la navigation.

## Pourquoi un appel au pont ne suffit pas

Créer une vue native ne lui donne pas de place dans le DOM. Une vue au-dessus de la WebView ne suit pas automatiquement un conteneur défilant et ne participe pas à son découpage ni à son ordre d’empilement. Un `z-index` Web plus élevé ne peut pas la couvrir. La masquer puis la réafficher peut révéler une apparence différente ou la restaurer à une position périmée.

Le modèle d’intégration partagé associe une vue native à un conteneur DOM. Ce conteneur identifie la place du composant dans l’écran Web. Le plugin fournit le contenu natif et signale les changements ; l’Engine coordonne les mesures, l’apparence préparée et le transfert entre couches de présentation.

## Exemples de coexistence

Ces situations partagent le même modèle de présentation. Chaque intégration connecte les notifications de cycle de vie et de valeurs dont elle a besoin :

| Situation | Expérience souhaitée | Apport du modèle partagé |
| --- | --- | --- |
| Une annonce native admissible est placée dans un flux Web | Elle reste alignée sur le contenu pendant le défilement. | Le conteneur DOM fournit la géométrie ; le suivi natif pris en charge ou une projection Web temporaire accompagne le mouvement. |
| Une alerte Web s’ouvre au-dessus des contrôles de navigation natifs | L’alerte couvre leur apparence, puis les interactions natives reprennent à sa fermeture. | Les notifications de cycle de vie ou l’adaptateur Ionic demandent la couverture ; l’Engine coordonne le transfert d’image et la restauration. |
| Une page ou une modale change de mise en page | Ses contrôles natifs reviennent à leur position actuelle plutôt qu’à un ancien rectangle. | La géométrie et la restauration sont coordonnées avec la durée de vie du conteneur propriétaire. |
| Un interrupteur natif change alors que son repli Web est masqué | Le retour au HTML ne révèle pas l’ancienne valeur. | Les liaisons de valeurs facultatives reflètent les données du composant indépendamment de la présentation. |

Défiler ne signifie pas toujours déplacer une vue native active. Les mises en page iOS à débordement prises en charge peuvent utiliser des liaisons de défilement natives ; Android utilise une présentation temporaire d’image et les mises en page non prises en charge suivent la politique de repli configurée. Les images ne fournissent pas d’interaction SDK en direct. Consultez les [limites des plateformes](reference/platforms.md) et les [contraintes de liaison de défilement](advanced/native-handoff.md#native-scroll-tracking).

L’Engine prépare les images pendant que le contenu natif est disponible et les conserve durant le transfert jusqu’à la confirmation de la restauration native. La préparation est distincte de la présentation afin que l’ouverture d’une superposition n’attende pas la capture. Les décisions de cycle de vie propres à l’application nécessitent toujours des notifications ; enregistrer une vue ne détecte pas automatiquement les superpositions de tous les frameworks.

## Trois présentations aux objectifs différents

| Présentation | Ce que voit l’utilisateur | Raison de son utilisation |
| --- | --- | --- |
| Vue native active | Le véritable contrôle interactif ou une vue SDK admissible | Interaction et rendu natifs habituels. |
| Projection Web | Une image préparée et non interactive dans un conteneur DOM | L’apparence native peut suivre le contenu Web ou se placer sous une superposition Web. |
| Repli Web | Le HTML de l’application ou l’état vide qu’elle a choisi | L’intégration reste utilisable lorsqu’aucune image adaptée ne peut être préparée. |

Une projection n’est pas un second contrôle actif. Elle ne transmet pas les clics, n’anime pas les vidéos et ne réordonne pas la véritable vue native sous chaque élément du DOM. Les destinations configurées `native`, `web` et `none` expriment où le contenu doit se trouver ; l’Engine choisit le mécanisme de transfert. Consultez le [contrat de projection](reference/projection.md#projection-contract) pour connaître les règles exactes de priorité et de restauration.

## Pourquoi l’intégration fournit un conteneur DOM

Le conteneur donne à l’image sa place dans la mise en page et les couches de l’application. Un rectangle natif seul ne peut pas indiquer à l’Engine quelle modale, quel ancêtre de découpage ou quelle zone de défilement doit contenir l’image. Le conteneur peut déjà héberger un repli Web ; son contenu et ses écouteurs sont préservés pendant la projection.

Pour une publicité, il peut s’agir d’un élément `native-ad` dans un flux défilant. Pour une barre d’onglets, il peut s’agir d’un conteneur de navigation de repli sous la couche de superposition de la page. Choisissez un [conteneur pris en charge](reference/containers.md) dont la boîte de mise en page correspond à vos besoins. L’Engine ne crée pas la mise en page de l’application et ne fournit pas d’implémentation de publicité ou de barre d’onglets.

## Choisir l’intégration minimale adaptée

| Ce que vous développez | Point de départ | Pourquoi cette approche |
| --- | --- | --- |
| Un plugin Capacitor exposant une vue native, telle qu’une barre d’onglets ou une vue publicitaire capturable | [Guide des plugins Capacitor](getting-started/capacitor.md) | L’enregistrement natif gère le démarrage du runtime, les mesures et les confirmations de transfert ; conservez l’API existante du plugin. |
| Un plugin Cordova ayant le même besoin | [Guide des plugins Cordova](getting-started/cordova.md) | Le même cycle de vie utilise les points d’entrée natifs et le gestionnaire de ressources de Cordova. |
| Un moteur de rendu regroupant déjà de nombreux contrôles sur plusieurs pages et modales | [Guide des moteurs de rendu](advanced/renderer.md) | Regroupez les contrôles par cycle de vie tout en conservant le protocole existant de placement et de mise à jour du moteur de rendu. |
| Une application Ionic utilisant un plugin intégrant l’Engine | [Guide des superpositions Ionic](configuration/ionic-overlays.md) | Un moniteur partagé relie le cycle de vie des superpositions Ionic à la couverture des projections. |

Consultez l’[initialisation native](getting-started/initialization.md) pour l’enregistrement minimal et la distinction entre paramètres facultatifs et API avancées.

Une modale Web seule ne nécessite pas les API de moteur de rendu. Commencez par l’enregistrement natif `NativeUIProjection`, sauf si vous gérez déjà la réconciliation de plusieurs contrôles. Les applications bénéficient normalement de l’Engine par l’intermédiaire d’un plugin qui l’intègre, plutôt qu’en créant elles-mêmes des enregistrements. Les autres frameworks Web peuvent utiliser leurs propres notifications de transition ; Ionic est facultatif.

## Répartition des responsabilités

| Engine | Plugin consommateur |
| --- | --- |
| Mesure du DOM, géométrie des images et liaison de défilement native prise en charge | Création, attachement, positionnement et dimensionnement des vues natives |
| Démarrage, abonnements aux événements et confirmations de dessin natif | Fourniture du DOM de repli dans la bonne couche |
| Cache d’images préparées, décodage, affichage et retrait | Signalement des changements d’apparence et de la destination de projection souhaitée |
| Capture native et images temporaires de retour | Fourniture des vues natives et de l’admissibilité de la capture SDK |
| Invalidation des images, nettoyage des jetons et suppression des observateurs | Gestion des actions métier et du repli Web interactif |

Un conteneur DOM ne contient pas nécessairement un remplacement Web interactif : un plugin de bouton peut fournir un bouton HTML de repli, tandis qu’un plugin publicitaire peut laisser le conteneur vide lorsque le contenu natif est indisponible. Le transfert vers l’image est explicite et non interactif. L’Engine ne transmet jamais les clics à travers une image et ne remplace pas la gestion des clics ou des impressions du SDK.

Les enregistrements natifs peuvent aussi [refléter les valeurs actuelles du composant](configuration/values.md) dans leur hôte de repli. Cela est indépendant de l’[intention de présentation](reference/state.md) : un onglet sélectionné est une donnée du composant, tandis que `native`, `web` et `none` décrivent où il doit se trouver. Les événements de l’application et l’intégration aux formulaires du framework restent à la charge de l’adaptateur du composant.

## Vérifier que les limites conviennent à votre interface

Les images figent à la fois le contrôle et tout arrière-plan capturé. Un contenu qui doit rester actif ou interactif lorsqu’il est couvert nécessite une autre politique de présentation. Les restrictions de capture des SDK restent applicables, et certains effets du compositeur de la plateforme, notamment les reflets Liquid Glass, peuvent différer de leur apparence capturée. L’Engine ne garantit pas une capture identique au pixel près de chaque vue native.

Validez vos arrière-plans réels, les transitions de superpositions et la restauration sur les appareils pris en charge. Si la capture est indisponible, décidez avant l’intégration ce que l’utilisateur doit voir dans le repli Web. Consultez la [référence de capture et des plateformes](reference/platforms.md) et le [contrat de projection](reference/projection.md) pour les conditions d’éligibilité et les politiques d’échec.

[Vue d’ensemble de la documentation](README.md)
