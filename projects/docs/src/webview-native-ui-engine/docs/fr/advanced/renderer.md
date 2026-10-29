---
title: "Surfaces de pages et de modales"
sourceRevision: "b410017ab9773a01d2552e663b0f20ffb8d0a52667fe1eff2253dc11d2de8b8d"
---
# Avancé : coordonner pages et modales dans un moteur de rendu existant

Ici, un **moteur de rendu** désigne la partie du plugin qui crée les vues natives et actualise leur mise en page et leur apparence. Utilisez ce guide lorsqu’il gère plusieurs contrôles natifs, regroupe leurs mises à jour et sait à quelle page ou modale ils appartiennent. L’Engine prend en charge la préparation des images, la réutilisation des scopes et le nettoyage des transferts afin de ne pas devoir les réimplémenter pour chaque superposition.

Pour une vue native unique, commencez plutôt par l’enregistrement [Capacitor](../getting-started/capacitor.md) ou [Cordova](../getting-started/cordova.md). Pour le modèle commun et ses limites, consultez les [concepts](../concepts.md). Les API ci-dessous s’adressent à un moteur de rendu existant ; ce ne sont pas des étapes supplémentaires requises par ces guides de plugins. Consultez l’[initialisation native](../getting-started/initialization.md) pour l’API de base et ses paramètres facultatifs avant de choisir cette approche.

## Regrouper les contrôles selon leur cycle de vie commun

Une **surface** regroupe les contrôles qui doivent effectuer leur transfert ensemble, tels que les boutons d’une page ou d’une modale. Elle ne correspond pas nécessairement à une seule vue ou image native. `createWebProjectionSurface` gère leurs images préparées et leurs scopes de repli ; `createWebProjectionSurfaces` gère la durée de vie de plusieurs surfaces de ce type.

La séparation des groupes est importante : couvrir une page d’arrière-plan ne couvre pas nécessairement les contrôles de la modale de premier plan. Partager un cycle de vie unique ferait interférer ces décisions de présentation indépendantes.

Par exemple, un plugin affichant des boutons de barre d’outils et une barre d’onglets peut utiliser des surfaces distinctes pour une page d’arrière-plan et chaque modale :

| Surface | Contenu natif | Quand une image Web est utile |
| --- | --- | --- |
| Page d’arrière-plan | Boutons de barre d’outils et barre d’onglets | Une modale ou un popover Web doit couvrir les contrôles de la page. |
| Modale | Boutons de fermeture et de confirmation | La modale se déplace pendant un glissement ou une autre superposition Web couvre ses contrôles. |

À l’ouverture d’une modale, la surface d’arrière-plan peut passer à ses images préparées tandis que les contrôles de la modale restent natifs si cela convient. Fermer la modale demande la restauration des contrôles d’arrière-plan à leurs positions actuelles ; leurs images sont supprimées après l’acceptation de la mise à jour native. Des surfaces distinctes empêchent les images ou réponses tardives d’une modale retirée de prendre possession de la page nouvellement exposée.

## Raccorder le moteur de rendu existant

Reliez chaque phase à l’événement correspondant dans votre moteur de rendu. Ces extraits montrent des points distincts du cycle de vie, pas des appels à exécuter ensemble à l’initialisation. Le moteur de rendu fournit `transport`, les ID et cadres des sources, les révisions acceptées et son ordonnanceur de mises à jour existant. Dans cet exemple, `ownerOf(element)` est la recherche existante du moteur de rendu qui trouve la page ou la modale propriétaire d’un contrôle.

### Créer une surface lorsque son propriétaire devient disponible

Associez les sources des contrôles natifs aux conteneurs de repli existants. La collection réutilise la surface lors de mises à jour répétées du même propriétaire. Le propriétaire passé à `ensure` est une clé de cycle de vie, pas un filtre de sources : `surfaces.consider` diffuse le lot à chaque surface. Chaque surface utilise `eligible` pour sélectionner uniquement ses propres contrôles ; deux surfaces ne doivent pas gérer le même conteneur de repli :

```ts
import { createWebProjectionSurface, createWebProjectionSurfaces, type WebProjectionSurface } from '@webview-native-ui/engine';

const surfaces = createWebProjectionSurfaces<HTMLElement, WebProjectionSurface>();
const projection = await surfaces.ensure(page, () =>
  createWebProjectionSurface(transport, {
    namespace: 'my-renderer',
    target: (source) => source.element,
    eligible: (source) => ownerOf(source.element) === page,
    wake: scheduleUpdate,
    blocked: () => transitionIsActive,
  }),
);
```

### Préparer pendant les mises à jour normales, transférer aux transitions de présentation

Une mise à jour native acceptée fournit l’apparence à préparer. Commencer un transfert utilise cette image préparée ; y mettre fin demande une restauration au lieu de la supprimer immédiatement. Tant qu’une surface possède l’image, excluez ses `owners` du rendu natif ordinaire pour éviter que les contrôles actifs apparaissent au-dessus de la couche Web couvrante. Utilisez `visibleOwners` pour la propriété de l’image de retour pendant la restauration. Retirez l’image seulement après confirmation de la mise à jour native normale.

```ts
// Après acceptation d’une mise à jour native ordinaire :
surfaces.consider(acceptedRevision, sources);

// Lorsque le framework signale une couverture ou un mouvement pour ce propriétaire :
projection?.begin();

// Lorsque cette couverture ou ce mouvement se termine :
projection?.end();
// Envoyez la mise à jour native normale du moteur de rendu, puis à sa confirmation :
surfaces.updated(token, restoredIDs, acceptedRevision);
```

### Retirer une page ou le moteur de rendu

Supprimer un propriétaire empêche une création ou une restauration tardive de réactiver ses contrôles. Détruisez la collection lorsque le moteur de rendu lui-même est libéré.

```ts
await surfaces.delete(page); // Retrait de la page.
// Au démontage du moteur de rendu :
await surfaces.destroy();
```

## Placement et surveillance partagée

Le moteur de rendu fournit les ID et cadres natifs, la propriété des sources, la politique de placement et les confirmations de mises à jour acceptées. Les événements de cycle de vie du framework restent extérieurs à l’Engine ; il ne déduit pas la sémantique des modales à partir de mutations DOM arbitraires.

Pour les proxies de repli appartenant au moteur de rendu, `canRelocate(target)` autorise explicitement `begin(layer)` à placer ces hôtes dans une couche de superposition fournie. L’Engine restaure leur parent et leur ordre parmi les éléments frères après restauration, échec ou libération. Le DOM applicatif n’est pas déplacé par défaut, et un changement de parent du proxy par l’application a priorité sur la restauration de son ancienne position.

Une collection partage les écouteurs d’apparence, de redimensionnement, d’orientation et de visibilité du document entre ses surfaces, et ignore les événements d’images appartenant à l’Engine. Les moteurs de rendu peuvent exclure leurs propres événements de proxy avec `ignoreTarget`. `followMotion(moving, target)` utilise la table existante des éléments mobiles du moteur de rendu pour recaler les images uniquement pendant l’animation de leurs propres hôtes ; les transformations des ancêtres déplacent déjà les images sans interrogation périodique. Tous les écouteurs et toutes les frames planifiées sont supprimés à la libération.

Les appels répétés à `ensure` partagent la création en attente ou la projection existante. La suppression, la déconnexion du DOM ou la libération du moteur de rendu empêche un résultat tardif de devenir actif ; l’Engine le détruit à la place. Une création échouée peut être réessayée. Le moteur de rendu signale le retrait d’une page via son cycle de vie existant et peut consulter `keys()` et `values()` lors de sa passe normale de mise à jour. La collection n’installe pas de second observateur de mutations DOM ni de boucle d’interrogation continue.

## Vérifier le transfert dans le moteur de rendu consommateur

Testez l’ouverture d’une superposition, sa fermeture, une modale en mouvement et la suppression d’un propriétaire pendant la restauration. L’arrière-plan et le premier plan doivent conserver leurs propres contrôles ; une confirmation tardive ne doit pas restaurer un propriétaire retiré. Changez la position sans modifier l’apparence pour vérifier la réutilisation des images, puis changez le contenu ou les dimensions pour vérifier l’invalidation. Testez aussi l’absence d’images : le repli ordinaire doit rester disponible sans retarder le démarrage de la superposition.

L’Engine coordonne la propriété, mais seule l’application consommatrice peut valider ses choix de couches et son placement natif. Implémentez le côté natif selon le [contrat de transfert natif](native-handoff.md), avec `NativeUICoveredSnapshots.handle` sur iOS et `NativeUISnapshots.handle` sur Android. Fournissez les limites natives admissibles et les vues complètes autorisées à être masquées ; l’Engine valide les demandes et convertit les coordonnées de destination. Votre moteur de rendu continue d’appliquer la mise en page native normale et de signaler les confirmations de mises à jour acceptées.

Pour d’autres besoins de propriété, consultez la [projection Web de bas niveau](web-projection.md). L’ordonnancement des mises à jour est indépendant : utilisez la [file de mises à jour](update-queue.md) facultative uniquement si elle convient à la politique de réconciliation du moteur de rendu.
