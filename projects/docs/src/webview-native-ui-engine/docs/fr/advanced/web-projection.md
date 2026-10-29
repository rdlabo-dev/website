---
title: "Projection Web et lots"
sourceRevision: "baa0ddcede13b0edcba2bd889f3f13d3f279f711197f63c5ef4d27b735842f0f"
---
# Projection Web de bas niveau

Utilisez les primitives ci-dessous uniquement si les helpers de surface ne correspondent pas au modèle de propriété existant de votre moteur de rendu. `createWebProjectionSurface` gère déjà les scopes et les transferts par lot ; créer manuellement un autre gestionnaire pour le même repli introduirait des propriétaires concurrents.

Par exemple, un moteur de rendu possède déjà un conteneur de repli par panneau natif et accepte les mises à jour natives via son propre protocole de révision. Un scope de projection lui permet de conserver ces décisions de propriété tout en déléguant la préparation des images et la coordination du retour. Préférez les helpers de surface si le regroupement par page ou modale convient déjà ; un second gestionnaire sur le même conteneur se disputerait le contrôle de ses pixels.

Un scope lie un élément de repli Web existant pendant sa durée de vie. Récupérez cet élément dans le DOM du plugin ; l’Engine ne crée pas d’hôte de remplacement et ne choisit ni page, ni ordre d’empilement, ni z-index. Un élément de repli différent nécessite un nouveau scope. Son Document est déduit de `element.ownerDocument`.

```ts
import { createWebProjectionScope, createWebProjection } from '@webview-native-ui/engine';

const fallback = container.querySelector<HTMLElement>('[data-web-fallback]');
if (!fallback) throw new Error('Web fallback is missing');
const scope = createWebProjectionScope(fallback, 'my-plugin');
const projection = await createWebProjection(
  scope,
  {
    send: (request) => plugin.snapshot(request),
    listen: (listener) => plugin.addListener('snapshotInteraction', listener),
  },
  {
    wake: () => schedulePluginUpdate(),
    blocked: () => overlayIsActive(),
    revision: () => lastSentRevision,
  },
);
```

Le conteneur, le pont et les callbacks de mise à jour ci-dessus appartiennent au plugin consommateur. Aucun `document`, `target`, `layer`, sélecteur CSS ou résolveur de couche n’est passé au gestionnaire de projection.

1. Après une mise à jour native acceptée, appelez `projection.consider(revision, sources)`. Les sources associent les ID natifs et les cadres du viewport à leur DOM source ; elles n’ont pas besoin d’être dans l’élément de repli. Les images sont capturées et décodées à l’avance.
2. Appelez `projection.changed()` pour les changements d’apparence, ou `projection.changed(scrollElement)` pour invalider la géométrie du défilement. Les mises à jour de mise en page passent par `consider` ; utilisez `invalidate()` pour les autres changements de géométrie.
3. Avant de couvrir le natif avec une superposition Web, appelez `projection.begin()`. Il affiche les pixels déjà préparés dans le repli fixe. Aucune nouvelle capture ni aucun décodage ne commence ici. Si la capture est indisponible, le plugin conserve son repli Web ordinaire.
4. Excluez `projection.owners` des mises à jour natives normales tant que l’image possède ces sources. `visibleOwners` conserve leurs pixels de retour pendant la restauration native ; `preparedOwners` identifie les sources disposant d’images préparées. Ces tableaux sont des instantanés en lecture seule.
5. Appelez `projection.end()`, envoyez la mise à jour native normale, puis appelez `projection.updated(snapshotToken, acceptedIDs, revision)`. Une confirmation plus récente contenant tous les ID capturés retire l’image.
6. Appelez `projection.destroy()` lors de la libération de la surface. Il libère uniquement ses propres images et son écouteur ; le plugin gère la réinitialisation native finale et son DOM.

L’Engine prépare un `img` non interactif dans le conteneur de repli (directement dans son ShadowRoot ouvert, s’il existe) pendant que le natif est visible. Il réutilise l’image décodée et le nœud DOM entre les transferts, et les libère lorsque le scope est retiré ou détruit. L’image est `inert`, masquée pour l’accessibilité et exclue des tests de pointage. Le repli existant et ses enfants ne sont jamais clonés, remplacés, supprimés ou marqués `inert`/`aria-hidden` ; leurs écouteurs, valeurs et modifications applicatives survivent à la projection. `::before` et `::after` restent disponibles pour l’application.

Fournissez un conteneur existant tel que `div`, `button` ou un élément personnalisé. Les éléments remplacés ou vides tels que `img`, `input` et `video` restent non pris en charge comme scopes ; utilisez leur conteneur de repli existant. Le moteur de rendu peut déplacer le même conteneur entre parents, mais ne doit ni remplacer l’élément d’un scope de bas niveau ni laisser deux gestionnaires le contrôler simultanément. Notifiez le gestionnaire via `moved()` lorsque vous changez son placement pendant une projection.

L’image est positionnée en absolu dans le repli, qui conserve sa boîte de mise en page. Les hôtes statiques deviennent positionnés tant que l’image est visible. Le découpage, les transformations et les filtres de l’hôte et des ancêtres restent applicables. L’insertion dans un ShadowRoot ouvert contourne les conteneurs internes de slots, pas le découpage propre à l’hôte. Les racines shadow fermées ne peuvent pas être inspectées ; fournissez un conteneur de repli capable d’afficher l’image.

Les nœuds appartenant à l’Engine portent `data-native-ui-projection-node` pendant toute leur durée de vie dans le pool. Les moteurs de rendu qui inspectent les enfants du repli doivent exclure ces nœuds de la découverte du contenu applicatif. Un moteur de rendu utilisant un MutationObserver pour invalider les captures doit aussi ignorer l’insertion, la suppression et les changements d’attributs de ces nœuds, les changements en leur sein et les attributs `data-native-ui-snapshot-*` appartenant à l’Engine. Continuez d’observer le contenu créé par l’application, les dimensions et les changements d’état désactivé ; ignorer toutes les mutations sur un hôte de projection masquerait de vraies mises à jour. Sinon, la préparation d’image peut s’invalider elle-même et provoquer des cycles répétés de capture et de libération. L’Engine ne supprime que ses propres nœuds à la libération. L’insertion d’enfants peut affecter les sélecteurs structurels au sein du repli, mais n’ajoute pas d’éléments à côté de lui dans les listes flex, grid ou virtuelles.

### Notifications du plugin existant

Le gestionnaire de bas niveau peut s’abonner aux événements du plugin existant via `options.events` :

```ts
events: {
  addListener: (name, listener) => plugin.addListener(name, listener),
  update: ['setColors', 'setTabs', 'tabSelected'],
  projection: {
    native: ['shown'],
    web: ['transitionStarted'],
    none: ['hidden'],
  },
}
```

Il s’agit de **notifications**, pas de noms de méthodes interceptées. Le plugin émet les événements de mise à jour après la réussite de ses changements natifs. Un événement de projection Web doit arriver avant le début du mouvement ; il utilise l’image préparée auparavant. Un événement natif demande la restauration, mais l’image reste jusqu’à ce que la confirmation normale du moteur de rendu indique que le natif est prêt. Un événement de masquage suit l’opération de masquage native du plugin et retire l’image ; il n’appelle pas `hide()` et ne modifie pas le DOM de repli appartenant à l’application. Les mises à jour d’apparence préservent la destination demandée, y compris `none`.

Pour les plugins ayant plusieurs surfaces, fournissez `accepts(event)` pour sélectionner l’identité stable de la surface de ce scope. Les événements partagés par `update` et une destination font l’objet d’un abonnement unique et sont traités ensemble. Des destinations contradictoires pour le même événement sont rejetées avant l’abonnement. Détruire le gestionnaire supprime tous ses abonnements, y compris ceux dont l’enregistrement se termine tardivement après un échec d’initialisation. Aucune méthode publique du plugin n’est enveloppée ou rejouée.

Le gestionnaire utilise en interne la conversion des URL de ressources du runtime hôte (Capacitor ou Cordova). Les auteurs de plugins ne fournissent pas de résolveur d’URL.

Cette section décrit le gestionnaire de bas niveau pour les moteurs de rendu qui gèrent déjà la réconciliation par lot, plutôt qu’un enregistrement de vue native unique. Préférez l’enregistrement natif des guides de plugins pour une nouvelle intégration ; il gère le démarrage, les mesures et les confirmations de dessin.

### Plusieurs replis dans une transaction native

Par exemple, une barre d’outils contient deux groupes de boutons avec des hôtes de repli distincts, mais le moteur de rendu les masque et les restaure dans une transaction native unique. Des gestionnaires indépendants pourraient exposer un groupe avant l’autre. Un lot utilise un jeton de transfert commun aux groupes afin qu’ils franchissent ensemble la frontière de rendu.

Utilisez `createWebProjectionBatch(transport, options)` lorsque plusieurs éléments de repli doivent basculer ensemble. Il utilise le même moteur d’images, un seul écouteur et un seul jeton de capture, couverture et restauration. Passez `{ scope, element, control, ... }` pour chaque entrée à `batch.consider(revision, sources)`. Plusieurs ID natifs peuvent partager un scope, par exemple un groupe de boutons.

Le lot déduit son Document du premier `consider` non vide ; tous les scopes et sources suivants doivent appartenir à ce Document. Avant cette première mise à jour, `begin()` ne fait rien et `destroy()` peut être appelé sans risque. Un repli modifié nécessite un nouveau scope. L’identité du scope participe à l’invalidation du cache ; une présentation active conserve ses scopes capturés jusqu’à la fin de la restauration.

`WebProjectionRequest` est une union discriminée par l’action. `prepare` exige `revision`, `viewportWidth` et `ids` ; `cover` exige `token` et inclut `viewportWidth` et les `parts` de destination pour les mouvements transitoires ; `restore` exige `token`, `viewportWidth` et les `parts` de destination ; `painted`, `restored` et `release` exigent `token` ; `reset` ne prend aucune charge utile. Des résultats de préparation vides et `{ shown: false }` signifient que le plugin doit utiliser son repli Web normal. Utilisez le pont ordonné existant du plugin ; l’Engine ne réessaie pas les actions utilisateur.
