---
title: "Comportement de projection et intégration avancée"
sourceRevision: "80571a205b8bba634b25377e2fbaffe4aaef596bd5d1cdae8738cb5deda23814"
---
# Comportement de projection et intégration avancée

Commencez par le guide [Capacitor](capacitor-plugin.md) ou [Cordova](cordova-plugin.md). Cette référence explique les exigences DOM communes, les règles de destination et les API de bas niveau destinées aux moteurs de rendu existants.

## Responsabilités

| Engine | Plugin consommateur |
| --- | --- |
| Mesure du DOM, géométrie des images et liaison de défilement native prise en charge | Création, attachement, positionnement et dimensionnement des vues natives |
| Démarrage, abonnements aux événements et confirmations de dessin natif | Fourniture du DOM de repli dans la bonne couche |
| Cache d’images préparées, décodage, affichage et retrait | Signalement des changements d’apparence et de la destination de projection souhaitée |
| Capture native et images temporaires de retour | Fourniture des vues natives et de l’admissibilité de capture du SDK |
| Invalidation des images, nettoyage des jetons et des observateurs | Gestion des actions métier et du repli Web interactif |

Un emplacement DOM ne contient pas nécessairement un remplacement Web : un plugin d’interface peut restaurer un bouton, tandis qu’un plugin publicitaire peut masquer son emplacement. Le transfert d’image est explicite et non interactif. L’Engine ne transmet jamais les clics à travers une image et ne remplace pas la gestion des clics/impressions du SDK.

## Contrat de projection

Une notification indique **où doit se trouver la surface**, pas comment la capturer. L’Engine choisit le transfert propre à la plateforme sans imposer au plugin une autre copie de l’état de projection.

| Destination souhaitée | Comportement requis |
| --- | --- |
| `native` | Afficher la vue native interactive à une géométrie confirmée. Pendant le mouvement, utiliser le suivi natif pris en charge ou une image préparée. |
| `web` | Maintenir le contenu natif sous la couche Web qui le recouvre en retirant sa projection native ; utiliser une image préparée ou le repli Web du plugin. |
| `none` | Retirer le contenu natif, les images projetées et le contenu de repli. Les callbacks ultérieurs de mise à jour/capture ne doivent pas les réafficher. |

La couverture par une superposition peut temporairement transformer `native` en `web` ; elle ne remplace jamais `none`. Un échec de capture ne change pas la destination souhaitée. `failedFallback: native` n’est valide que pour les consommateurs qui maintiennent eux-mêmes le placement natif et ne remplace jamais `web`, `none` explicites ni la couverture par une superposition.

L’Engine gère la disponibilité des images et la confirmation de restauration. Il ne doit pas masquer les pixels natifs avant que les pixels de remplacement soient prêts, ni retirer ces derniers avant la réussite de la restauration native. Un déplacement de position seul réutilise le contenu préparé ; les changements d’apparence, de taille ou d’identité du moteur de rendu l’invalident. En l’absence d’image, le repli déclaré est utilisé immédiatement, sans attendre une capture pendant la transition.

L’enregistrement et la transmission des notifications conservent la dernière intention pendant le démarrage et la reconnexion ; ils ne rejouent pas les événements métier. La destruction retire l’enregistrement et ses images en cache. Les notifications expriment une intention, pas une promesse d’achèvement : une API promettant un masquage terminé doit attendre la confirmation explicite de retrait décrite dans les exigences DOM et surfaces natives.

Un moteur de rendu existant qui contrôle la visibilité CSS peut appeler `getUnprojectedVisibility(element)` depuis le package npm. Cette fonction lit la visibilité actuelle définie ou héritée sans les règles de masquage de l’Engine, puis restaure la propriété de projection avant de retourner. N’inspectez ni ne modifiez les attributs marqueurs de l’Engine dans un plugin consommateur. Cette fonction lit les styles et peut déclencher des observateurs d’attributs ; elle n’élimine pas les coûts de mesure ou de transport.

## Exigences DOM et surfaces natives

`projectionSelector` est obligatoire et doit désigner **un conteneur existant lorsque la projection commence**, y compris un conteneur obtenu par le `querySelector` du plugin. L’Engine ne crée pas de DOM et ne choisit ni taille, ni placement, ni couche, ni z-index. Conservez la disposition normale du conteneur et ses éventuels contrôles Web interactifs ; un emplacement vide de taille nulle n’est pas un repli utilisable. Il s’agit d’une portée fixe, pas d’une racine de découverte.

Le conteneur n’a pas besoin d’exister lors de l’enregistrement. Un DOM absent provoque une attente sans afficher le contenu natif ; son remplacement crée une nouvelle liaison et retire les anciennes images. L’Engine préserve les enfants, écouteurs et valeurs du conteneur. Passez la vue native elle-même via `view` ; un groupe de contrôles peut utiliser son conteneur natif commun. L’Engine gère l’identifiant interne ; aucune liste d’ID ni dictionnaire de vues n’est requis. Les surfaces indépendantes utilisent des enregistrements séparés.

L’hôte d’un Web Component peut être la destination, par exemple `projectionSelector: 'native-ad[placement="home"]'`. Donnez-lui une boîte de mise en page (`display: block` avec les dimensions voulues) ; l’Engine observe son insertion, son retrait et les changements des attributs du sélecteur. Le sélecteur s’exécute dans le document et ne recherche pas dans les racines shadow. Le contenu de repli, y compris le contenu shadow, doit hériter de la `visibility` de l’hôte : ne la remplacez pas par `visibility: visible` et réservez le `::before` de l’hôte à l’image projetée. Ces exigences s’appliquent aux racines shadow ouvertes et fermées.

Pour des emplacements AdMob se déplaçant indépendamment, conservez un enregistrement par vue/surface native chargée, utilisez un sélecteur propre à l’emplacement et filtrez les notifications du plugin avec `receiveListeners.match` (`match: ["slotKey": slotKey, "loadId": loadId]` / `match = mapOf("slotKey" to slotKey, "loadId" to loadId)`). Libérez l’enregistrement lorsqu’une publicité chargée est remplacée, même si sa vue hôte est réutilisée. Laissez chargement SDK, impressions et clics dans le plugin publicitaire. Fournissez `canCapture` avec ses contrôles d’admissibilité existants (par exemple restrictions aux annonces de test, arrière-plans opaques et absence de vidéo) ; l’Engine n’autorise pas à lui seul la capture d’une vue SDK.

Pour les consommateurs SDK sans repli Web équivalent, définissez `failedFallback: .native` sur iOS ou `failedFallback = NativeUIProjection.FailedFallback.NATIVE` sur Android. La valeur par défaut est `.web` / `WEB`, préservant les consommateurs existants. Si un mouvement automatique ne peut utiliser une image préparée (non prête, capture non prise en charge ou transfert refusé), `native` préserve la vue native active et garde le DOM de repli masqué. Le consommateur doit continuer à positionner cette vue ; cette option ne crée pas de suivi natif du défilement sur Android. Les destinations explicites `web`, `none` et la couverture par une superposition ont priorité : cette option ne place jamais une vue native au-dessus d’une couche Web qui la recouvre intentionnellement.

Pour les vues SDK Android opaques pouvant être dessinées par logiciel, utilisez `captureMode = NativeUIProjection.CaptureMode.VIEW` avec une politique `failedFallback` explicite (`WEB`, sauf si le consommateur maintient le placement natif). Ce mode dessine uniquement les pixels de la View, sans marge autour ; la capture d’une publicité partiellement visible ne peut donc pas incorporer une barre d’outils ou du contenu voisin. Vidéo, SurfaceView, vues translucides et contenu nécessitant la composition Window doivent conserver le mode par défaut `COMPOSITED`. Le consommateur doit fournir un hôte DOM correspondant et découpé pour l’ensemble de la View opaque ; les masques de contour natifs arbitraires, transformations et découpages personnalisés ne sont pas reproduits.

Les pixels VIEW sont mis en cache selon l’identité de la View native, ses dimensions et la révision du contenu. Un défilement ordinaire conserve l’image Web décodée et actualise le placement sans capture, encodage PNG ni décodage d’image. L’image recouvre la boîte de bordure de l’hôte à l’origine locale (0, 0), indépendamment de la latence de confirmation du placement natif. Les images opaques restent dessinées sous la View native active entre les défilements. Avant de masquer cette View, l’Engine attend la disponibilité visuelle de la WebView et un dessin ; VIEW ne crée aucune copie d’image native d’entrée ou de retour. La confirmation de retour attend le dessin natif et la frame d’animation suivante. Un contrôle de génération empêche un callback de couverture retardé de masquer le contenu après restauration ou suspension.

Le Bitmap natif est recyclé après l’encodage PNG en mode VIEW ; le PNG et l’image Web décodée restent en cache. Les notifications de mise à jour du plugin font avancer la révision du contenu : signalez une mise à jour à chaque changement de contenu sans remplacement de View. Remplacer l’enregistrement, naviguer dans la WebView, réinitialiser ou fermer retire le cache. L’encodage reste hors du thread UI ; le dessin de View et la propriété du cache restent sur ce thread, avec la limite existante de 8 millions de pixels.

COMPOSITED conserve les copies natives de transfert pour le contenu translucide. Les copies d’entrée attendent la disponibilité visuelle de la WebView et un dessin avant leur retrait. Si le délai d’entrée de 500 ms expire, la View native est restaurée avant le retrait de la copie, et une confirmation de peinture tardive est refusée.

Les consommateurs Android VIEW peuvent lire `isProjecting` sur le thread UI après une couverture réussie pour différer le placement natif à taille inchangée. Ne conservez que le dernier placement accepté ; continuez à valider séquence/génération et traitez immédiatement masquage, redimensionnement et nettoyage. Fournissez `beforeNativeReveal` pour appliquer synchroniquement ce placement en attente avant qu’une restauration normale, une récupération après échec ou la libération de l’image active révèle les pixels natifs. L’Engine efface `isProjecting` avant le callback : l’application du placement ne doit donc pas être à nouveau différée. Le callback peut s’exécuter sans travail en attente et doit être idempotent. Effacez le travail en attente du consommateur au masquage/destruction et validez l’identité de la View chargée avant application. Ce callback ne remplace ni l’invalidation de contenu/taille ni le suivi géométrique JavaScript.

Sur Android, les consommateurs dont la méthode de masquage asynchrone promet la disparition de tous les pixels doivent appeler `projection.hide { completed -> ... }` et ne résoudre que lorsque `completed` vaut true. Les copies natives de transfert disparaissent immédiatement ; l’achèvement attend le retrait synchrone du proxy Web. Un timeout signale un échec, pas une réussite. Appelez `projection.show()` lors d’une nouvelle présentation, en plus des événements habituels du plugin ; cela préserve aussi l’intention de présentation si l’abonnement aux événements est encore en cours de démarrage.

L’observation du défilement suit les ancêtres de l’arbre composé, y compris les slots assignés. Les événements de défilement non composés dans un arbre shadow Ionic sont observés à leur source ; les applications n’ajoutent pas d’écouteur supplémentaire et n’émettent pas d’événements synthétiques sur le document. Les écouteurs suivent les changements de parent de l’hôte et les réaffectations de slots, puis sont supprimés au nettoyage.

Le défilement est interne : iOS utilise une liaison de défilement native correspondante unique lorsqu’elle est disponible ; sinon, notamment sur Android, le défilement utilise temporairement l’image préparée et restaure le contenu natif une fois le mouvement terminé. La gestion automatique du défilement ne remplace jamais `web` ou `none` explicites. Une capture ou géométrie non prise en charge conserve le repli DOM normal ; aucune nouvelle capture n’est attendue pendant la transition. La dernière destination explicite survit au rechargement de la WebView, et les réponses de l’ancien document ne peuvent terminer les requêtes du nouveau.

Par défaut, le canal interne est limité au cadre principal sur les origines localhost de Capacitor. Passez les `allowedOrigins` exacts de l’application pour une autre origine configurée. Android exige les fonctionnalités WebView `WEB_MESSAGE_LISTENER` et `DOCUMENT_START_SCRIPT` ; l’enregistrement échoue explicitement sur les implémentations WebView non compatibles. N’utilisez pas d’origines génériques pour les WebViews pouvant naviguer vers des sites distants.

## Prise en charge des superpositions Ionic (facultative)

Pour une application Ionic, appelez ceci une seule fois au démarrage. En cas d’appel direct depuis l’application, installez `@webview-native-ui/engine` comme dépendance applicative directe :

```ts
import { enableSupportIonicOverlays } from '@webview-native-ui/engine/ionic';

enableSupportIonicOverlays();
```

Les mainteneurs de plugins peuvent inclure cet extrait dans leurs instructions de configuration applicative ou l’appeler dans un initialiseur JS existant. `@rdlabo/capacitor-native-ui` appelle déjà le même initialiseur en interne ; ses utilisateurs n’ont pas besoin d’un appel supplémentaire. Les applications non Ionic l’omettent. L’enregistrement natif seul n’installe pas les écouteurs d’événements Ionic.

Un moniteur est partagé par document, y compris entre le module npm et le runtime injecté par Swift/Android. Répéter l’initialisation n’ajoute pas d’écouteurs et n’efface pas la configuration explicite. Détruire une projection ne retire que son abonnement ; cela n’arrête pas le moniteur utilisé par les autres plugins. Le moniteur vit avec le document.

Par défaut, les événements de cycle de vie Modal, Popover, Alert, Action Sheet, Loading, Picker, Toast et Menu sont couverts. Le moniteur compare le DOM de chaque projection à la pile active des superpositions : le contenu de la modale au premier plan reste natif, tandis que le contenu recouvert utilise temporairement son image préparée. Les toasts et les arrière-plans inactifs des sheets ne recouvrent pas une surface. Les superpositions imbriquées maintiennent la couverture jusqu’à ce que la pile restante permette la restauration. Sans image, le repli Web normal est conservé. Cette couverture temporaire ne remplace jamais une destination `web` ou `none` explicite du plugin. Les projections enregistrées plus tard lisent l’état courant.

La propriété du Popover natif est fournie par le moteur de rendu vertical-bars de Native UI. Le moniteur partagé ne considère pas son DOM source comme une superposition Web couvrante. Si la présentation native échoue, le moteur de rendu libère cette propriété et la couverture DOM normale reprend.

Les réglages facultatifs s’appliquent à tout le document :

```ts
enableSupportIonicOverlays({
  exclude: '[data-nonblocking-overlay]',
  additional: [
    {
      selector: 'app-dialog',
      events: {
        willPresent: 'appDialogWillPresent',
        didDismiss: 'appDialogDidDismiss',
      },
    },
  ],
});
```

Utilisez `covers(overlay, target)` uniquement lorsqu’une projection DOM enregistrée nécessite une règle de couverture personnalisée ; retournez `undefined` pour le comportement par défaut, ou un booléen pour le remplacer. Les exclusions et la propriété explicite d’une fenêtre native ont priorité. La relation standard repose sur l’ordre des superpositions, l’inclusion DOM et l’état de l’arrière-plan, sans tenter d’interpréter des contextes d’empilement CSS arbitraires. Configurez explicitement les dispositions inhabituelles.

## Projection Web de bas niveau

Une portée lie un élément Web de repli existant pendant toute sa durée de vie. Obtenez cet élément depuis le DOM de votre plugin ; l’Engine ne crée pas d’hôte de remplacement et ne choisit ni page, ni ordre d’empilement, ni z-index. Un autre élément de repli nécessite une nouvelle portée. Son Document est déduit de `element.ownerDocument`.

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

Le conteneur, le pont et les callbacks de mise à jour ci-dessus appartiennent au plugin consommateur. Aucun `document`, `target`, `layer`, sélecteur CSS ni résolveur de couche n’est transmis au gestionnaire de projection.

1. Après une mise à jour native acceptée, appelez `projection.consider(revision, sources)`. Les sources associent les ID natifs et les rectangles du viewport à leur DOM source ; elles n’ont pas à se trouver dans l’élément de repli. Les images sont capturées et décodées à l’avance.
2. Appelez `projection.changed()` pour les changements d’apparence, ou `projection.changed(scrollElement)` pour invalider la géométrie de défilement. Les mises à jour de disposition passent par `consider` ; utilisez `invalidate()` pour les autres changements géométriques.
3. Avant de recouvrir le natif par une superposition Web, appelez `projection.begin()`. Il affiche les pixels déjà préparés au point de repli fixe. Aucune nouvelle capture ni aucun décodage ne commence ici. Sans capture disponible, le plugin conserve son repli Web ordinaire.
4. Excluez `projection.owners` des mises à jour natives normales tant que l’image possède ces sources. `visibleOwners` conserve leurs pixels de retour pendant la restauration native ; `preparedOwners` identifie les sources possédant des images préparées. Ces tableaux sont des instantanés en lecture seule.
5. Appelez `projection.end()`, envoyez la mise à jour native normale, puis appelez `projection.updated(snapshotToken, acceptedIDs, revision)`. Une confirmation plus récente contenant tous les ID capturés retire l’image.
6. Appelez `projection.destroy()` lors de la libération de la surface. Il ne libère que ses propres images et écouteur ; le plugin reste responsable de la réinitialisation native finale et de son DOM.

L’Engine utilise un pseudo-élément CSS `::before` vide et non interactif pour l’image préparée. Fournissez un conteneur compatible, tel qu’un `div`, `button` ou élément personnalisé existant. Les éléments remplacés/vides comme `img`, `input` et `video` sont refusés à la création de la portée ; utilisez leur conteneur de repli existant. L’Engine ne clone, ne remplace ni ne supprime le repli existant ou ses enfants, et ne leur applique pas `inert`/`aria-hidden`. Retirer les styles temporaires d’image restaure le même DOM actif, y compris les changements applicatifs effectués pendant la projection. Écouteurs et valeurs de formulaire sont préservés. Le moteur de rendu peut déplacer ce même élément entre parents ; il ne doit pas remplacer l’élément de la portée ni laisser deux gestionnaires le contrôler simultanément.

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

Ce sont des **notifications**, pas des noms de méthodes interceptées. Le plugin émet les événements de mise à jour après la réussite des changements natifs. Un événement de projection Web doit arriver avant le mouvement ; il utilise l’image préparée auparavant. Un événement natif demande la restauration, mais l’image reste jusqu’à ce que la confirmation habituelle du moteur de rendu indique que le natif est prêt. Un événement de masquage suit l’opération de masquage native du plugin et retire l’image ; il n’appelle pas `hide()` et ne modifie pas le DOM de repli géré par l’application. Les mises à jour d’apparence préservent la destination demandée, y compris `none`.

Pour les plugins à plusieurs surfaces, fournissez `accepts(event)` pour sélectionner l’identité stable de surface de cette portée. Les événements partagés par `update` et une destination ne sont abonnés qu’une fois et traités ensemble. Des destinations contradictoires pour un même événement sont refusées avant l’abonnement. Détruire le gestionnaire supprime tous ses abonnements, y compris ceux résolus tardivement après un échec d’initialisation. Aucune méthode publique du plugin n’est enveloppée ou rejouée.

Le gestionnaire convertit en interne les URL des fichiers natifs privés avec Capacitor. Les auteurs de plugins ne fournissent pas de résolveur d’URL.

Cette section décrit le gestionnaire de bas niveau pour les moteurs de rendu gérant déjà la réconciliation par lots, tel l’adaptateur Ionic. Pour une nouvelle intégration, préférez l’enregistrement natif des guides de plugins ; il gère démarrage, mesures et confirmations de dessin.

### Plusieurs replis dans une transaction native

Utilisez `createWebProjectionBatch(transport, options)` si plusieurs éléments de repli doivent basculer ensemble. Il utilise le même moteur d’images, un écouteur et un jeton de capture/couverture/restauration. Passez `{ scope, element, control, ... }` pour chaque entrée de `batch.consider(revision, sources)`. Plusieurs ID natifs peuvent partager une portée, par exemple un groupe de boutons.

Le lot déduit son Document du premier `consider` non vide ; toutes les portées et sources suivantes doivent appartenir à ce Document. Avant cette première mise à jour, `begin()` ne fait rien et `destroy()` est sans danger. Un repli différent nécessite une nouvelle portée. L’identité de portée participe à l’invalidation du cache ; une présentation active conserve ses portées capturées jusqu’à la fin de la restauration.

`WebProjectionRequest` est une union discriminée par action. `prepare` exige `revision`, `viewportWidth` et `ids` ; `cover` exige `token` ; `restore` exige `token`, `viewportWidth` et les `parts` de destination ; `painted`, `restored` et `release` exigent `token` ; `reset` ne prend aucune donnée. Des résultats de préparation vides et `{ shown: false }` signifient que le plugin doit utiliser son repli Web normal. Utilisez le pont ordonné existant du plugin ; l’Engine ne réessaie pas les actions utilisateur.

### Transfert natif sur les deux plateformes

Appelez toutes les API de cycle de vie des vues et captures sur le thread principal/UI. Les rectangles natifs d’entrée utilisent des **points relatifs à la WebView sur iOS** et des **pixels physiques relatifs à la vue de référence sur Android**. `viewportWidth` est la largeur du viewport Web en pixels CSS. Les parties préparées envoyées à JavaScript sont converties en pixels CSS.

Sur les deux plateformes, `cover` installe l’image d’entrée préparée **avant de masquer les vues actives fournies**, pendant le même tour UI. Son résultat booléen indique si cela était possible ; en cas d’échec, la visibilité reste inchangée. Fournissez les vues réelles de chaque composant capturé. Ne masquez pas les vues séparément et ne créez pas une autre copie d’entrée.

```swift
let shown = snapshots.cover(token, in: webView, views: renderedViews, transient: movingSurface)
```

```kotlin
val shown = snapshots.cover(token, activity.window, webView, renderedViews, transient = movingSurface)
```

`transient: true` concerne une surface de premier plan en mouvement : il ne remplace pas le `coveringToken` de l’arrière-plan. Retirez la copie d’entrée avec `retireCopy(token)` une fois l’image Web prête. Avant une mise à jour native normale, annulez les changements de visibilité de l’Engine avec `restoreControls()` sur iOS / `restoreViews()` sur Android. Au retour, `restore` installe l’image de retour en cache, le plugin dessine en dessous et `retireCopy(token, entry: false)` la retire après la confirmation/disponibilité correspondante. Ces noms restent idiomatiques à chaque plateforme ; le cycle de vie est identique. `cover` est une opération d’entrée, pas une méthode à répéter à chaque mise à jour normale.

Le nettoyage des jetons utilise `release(token)` ; celui du propriétaire utilise `reset()` (et `close()` sur Android pour libérer son encodeur). Un gestionnaire de surface ne doit pas réinitialiser les captures d’une autre surface. Le repli Web reste sous la responsabilité du moteur de rendu si une capture ou un placement natif est indisponible.

Les callbacks facultatifs `eligible(source)` et `current(sources)` laissent la sélection de surfaces propre au framework hors de l’Engine. `transient: true` prend en charge une surface mobile dont l’image de retour doit être repositionnée. Le suivi natif du défilement ne prend pas en charge les transformations CSS arbitraires ; ces déplacements peuvent utiliser le parcours par image.

Le transport d’images accepte `WebProjectionRequest` et retourne un jeton/des parties préparés ou `{ shown: false }`. Les parties utilisent des URL `file:` locales et des coordonnées de viewport en pixels CSS. Les requêtes passent par le pont ordonné existant du plugin :

| Action | Responsabilité native |
| --- | --- |
| `prepare` | Valider la révision et les ID actuels, puis appeler `NativeUICoveredSnapshots.prepare` avec les rectangles réellement rendus. |
| `cover` | Valider le jeton et la propriété de toutes les surfaces natives ; créer la copie d’entrée et masquer les vues natives associées. Retourner `shown: false` en cas d’échec. |
| `painted` | Retirer uniquement la copie d’entrée de ce jeton. |
| `restore` | Repositionner la copie de retour préparée sur les rectangles fournis. Ne jamais capturer ici. |
| `restored` | Retirer uniquement la copie de retour de ce jeton après l’ACK de mise à jour native et la frontière de peinture Web. |
| `release` | Libérer le jeton nommé, les fichiers et les vues temporaires associées. |
| `reset` | Nettoyage du propriétaire uniquement ; libérer toutes les ressources de capture native. |

Utilisez `NativeUICoveredSnapshots.observe` pour avertir l’écouteur JS au début et à la fin des interactions. Sur iOS, les captures rastérisent la fenêtre visible avec `drawHierarchy(in:afterScreenUpdates:)`, en incluant l’arrière-plan sous le composant natif découpé. Les vues de snapshot de l’écran sont des répliques destinées à l’affichage et ne servent pas de sources bitmap. Pour les matériaux tels que Liquid Glass, la rastérisation UIKit peut différer du compositeur en temps réel ; vérifiez l’apparence sur des appareils physiques avec les arrière-plans pris en charge par votre plugin. La validité du cache dépend donc de la disposition et des notifications de changements visuels du plugin. L’Engine ne capture pas en continu et ne garantit pas que tous les moteurs de rendu possibles soient capturables.

### Stockage temporaire et permissions applicatives

Les images préparées restent dans le stockage temporaire privé de l’application. iOS utilise `FileManager.default.temporaryDirectory`. Sur Android, construisez `NativeUISnapshots` avec un répertoire dans `context.cacheDir` ; n’utilisez pas de stockage partagé ou externe. Aucune plateforme ne nécessite de demande de permission de photothèque ou de stockage pour ce parcours. Aucun plugin Capacitor Filesystem n’est requis. Consultez les [répertoires sandbox Apple](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/FileSystemOverview/FileSystemOverview.html) et le [stockage propre aux applications Android](https://developer.android.com/training/data-storage/app-specific).

`Capacitor.convertFileSrc` associe l’URL de fichier retournée au serveur local WebView existant. Il n’accorde aucune permission de système de fichiers et ne téléverse pas l’image. Si l’application définit une Content Security Policy, son `img-src` doit autoriser l’origine applicative locale utilisée par cette URL ; n’activez pas un accès `file:` général ni des paramètres d’accès aux fichiers WebView sans rapport.

`release(token)` et le nettoyage du propriétaire suppriment les fichiers de capture possédés. Un arrêt brutal du processus peut laisser des images temporaires jusqu’au nettoyage du cache par le système ou à la désinstallation de l’application ; leur suppression immédiate après un plantage n’est pas garantie. Gardez ce stockage privé et traitez-le comme jetable, pas comme des données applicatives persistantes.

## Suivi natif du défilement

`readScrollPlacement(element, owner, identify)` mesure un propriétaire de débordement sans transformation. `createScrollBindings()` valide la réutilisation et détecte les mouvements pendant que l’acquisition attend l’ACK. Excluez `reuse` des signatures de déduplication de disposition ; il décrit l’état de confirmation, pas la disposition.

Sur iOS, `NativeUIScrollBindings.replace` regroupe les sources par propriétaire et ne lie qu’une `UIScrollView` correspondante sans ambiguïté. `update()` applique positions et découpage sans reconstruire le contenu. `NativeUIClippedView` préserve les dimensions complètes du contenu tout en limitant les pixels visibles et les tests de ciblage tactile.

Une liaison établie refusée par le natif perd sa propriété et peut être acquise à nouveau par le **même** parcours mise à jour/ACK. Une nouvelle acquisition échouée reste sur le repli jusqu’à un événement pertinent de disposition/fin de défilement. N’ajoutez jamais de boucle de nouvelle tentative immédiate et ne rejouez pas les actions utilisateur. Un changement de rectangle/propriétés ne recalibre pas une origine de coordonnées établie.

Cela utilise la hiérarchie interne de débordement de WKWebView sans noms de classes privés. Les vues absentes/ambiguës, défilements imbriqués, défilement du document, transformations non prises en charge, découpages de forme ou propriétaires mobiles non confirmés ne peuvent être liés. Ne revendiquez pas une prise en charge au seul motif qu’une `UIScrollView` existe. Une vue native peut intercepter les gestes commençant à l’intérieur ; leur routage et l’accessibilité du SDK restent propres au moteur de rendu.

## Bibliothèque Android

Android utilise une bibliothèque Gradle Android distribuée en AAR via Maven, sans enregistrement de plugin Capacitor. Ses coordonnées de publication sont `io.github.webview-native-ui:engine:<version>`. Compilez et vérifiez la publication Maven locale avec :

```sh
android/gradlew -p android testDebugUnitTest assembleRelease connectedDebugAndroidTest publishReleasePublicationToVerificationRepository
```

`NativeUIClippedView` est un utilitaire de bas niveau appliquant la position et le découpage fournis par l’appelant sans réinitialiser les dimensions inchangées. `NativeUIProjection` gère transfert d’image et restauration ; il n’utilise pas cet utilitaire pour disposer le moteur de rendu. Le plugin consommateur gère le placement natif normal et les mises à jour de taille. Android ne revendique pas de liaison native du débordement de type WKWebView. Les enregistrements de haut niveau partagent un observateur tactile de fenêtre non consommant : l’appui annule l’adoption d’une capture en cours, le relâchement/annulation/perte de focus autorise à nouveau la préparation, et le nettoyage ne retire que cet enregistrement. La distribution des callbacks et leurs valeurs de retour existantes sont préservées.

`NativeUISnapshots` prépare des images PixelCopy composites et des PNG locaux, puis couvre/restaure à partir de ce cache. L’encodage se fait hors du thread UI ; une seule préparation s’exécute par propriétaire. Signalez-lui changements visuels et interactions, et libérez les jetons au nettoyage. Tous les appels de vue/cycle de vie s’exécutent sur le thread UI. Le plugin conserve la gestion de révision, d’admissibilité et de politique de repli.

Après affichage ou retrait des pixels Web préparés, `NativeUIWebReadiness.prepare` contrôle la disponibilité pour un dessin WebView ultérieur. Son prédicat `current` doit valider la session propriétaire, la génération de source et la révision d’image. La copie native temporaire couvre ce transfert asynchrone ; le démarrage de la superposition lui-même n’attend pas. Ni une confirmation du pont ni ce callback ne prouvent la présentation sur l’écran physique.

[AdMob PR #487](https://github.com/capacitor-community/admob/pull/487) démontre une sous-couche d’image persistante pour les annonces de test opaques. Cette politique n’est pas activée globalement : les interfaces translucides seraient composées deux fois, et la vidéo/les interactions SDK nécessitent des décisions propres au moteur de rendu. Ne synthétisez jamais de clics à travers une image. Le consommateur Native UI utilise l’Engine sur iOS et Android. Les tests d’acceptation Android exercent le véritable pont Capacitor et du contenu Compose translucide. Les autres consommateurs SDK doivent toujours effectuer leur propre intégration et leurs tests d’acceptation.

### Surfaces Android translucides

Capturez les pixels composites de la fenêtre, arrière-plan compris, au lieu de dessiner la vue translucide sur un bitmap vide. Gardez l’image Web préparée décodée mais masquée. Au transfert, `cover(token, window, reference, views)` installe une copie d’image opaque temporaire avant de masquer ces vues natives dans le même tour UI. Révélez l’image Web, confirmez la disponibilité de dessin Web, puis retirez la copie d’entrée. La superposition démarre immédiatement ; l’encodage d’image n’intervient jamais dans ce parcours.

Au retour, installez la copie de retour préparée avec `restore`, restaurez les vues natives en dessous, masquez l’image Web et retirez la copie de retour après disponibilité du dessin Web. Cela évite de composer des pixels natifs translucides actifs sur leur propre capture. Validez le jeton et la génération de surface courante à chaque callback asynchrone. La copie temporaire est non interactive et délimitée ; le nettoyage libère les deux copies et les ressources en cache.

Cela préserve l’arrière-plan capturé, pas une scène évoluant en continu derrière l’image. Les changements d’arrière-plan doivent invalider le cache par les mêmes notifications de changements visuels que les mises à jour de contenu. Vidéo et surfaces non capturables conservent la politique de repli du consommateur.

Les tests d’intégration des consommateurs appartiennent à leurs dépôts respectifs. La CI Engine teste ses contrats navigateur, Swift et Android sans exiger un checkout voisin du moteur de rendu.

### Placement final au retour d’une image opaque (Android)

Un plugin qui mesure et envoie normalement le placement natif à chaque défilement peut choisir un transfert de placement final. Passez `updatePlacement: (JSONObject) -> Unit` à son enregistrement Android `NativeUIProjection` et liez son hôte Web avec `bindProjectionPlacement(element, measure, invalidate)`.

- `binding.projected` devient true seulement après confirmation native du transfert d’image. Tant qu’il vaut true, le plugin peut réutiliser le dernier placement de cet hôte dans les lots complets de placement et éviter de le mesurer. Les autres hôtes poursuivent leurs mises à jour ordinaires.
- `measure()` retourne un objet JSON synchroniquement. L’Engine l’inclut dans la requête de restauration existante (ou de récupération d’image active). Le natif valide le jeton d’image actif et l’identité de la View, appelle `updatePlacement`, puis révèle le natif et confirme son dessin. Aucun aller-retour supplémentaire sur le pont n’est ajouté.
- Le plugin doit valider sa propre identité, sa génération et la séquence par hôte dans `updatePlacement`. Levez une exception pour refuser un placement obsolète ou invalide. Une mise à jour finale pour un hôte ne doit pas faire perdre celles d’un autre.
- `invalidate()` est appelé après une requête de transfert échouée. Videz les caches optimistes de placement/déduplication et planifiez une réconciliation ordinaire du placement.
- Libérez la liaison au détachement d’un hôte. La propriété de session empêche la confirmation retardée d’un ancien enregistrement d’effacer l’état de projection du nouveau. Pause, visibilité définie par l’auteur et changements de disposition doivent toujours utiliser les parcours habituels de visibilité/invalidation du plugin.

Cette option ne modifie pas les enregistrements sans `updatePlacement`. Android refuse `updatePlacement` sauf si `captureMode = CaptureMode.VIEW` ; vidéo en direct et autres captures non admissibles continuent le suivi du placement natif avec `failedFallback = NATIVE`.

## Délai de capture

`captureDelayMs` est un paramètre d’enregistrement facultatif commun à Capacitor et Cordova.
Sa valeur par défaut est de **50 millisecondes** sur iOS, Android et dans les options de bas niveau de `createWebProjection`.
Les valeurs doivent être finies et positives ou nulles. Ce paramètre utilise le debounce existant : une nouvelle mise à jour ou interaction relance la préparation une fois l’activité stabilisée.
Il n’ajoute pas de second minuteur et ne retarde pas la présentation de l’overlay.

Tant que les pixels de remplacement ne sont pas prêts, la dernière image terminée reste disponible.
Si aucune image n’est terminée, le repli Web habituel s’applique.
L’ouverture d’un overlay pendant le délai de debounce n’attend pas une nouvelle capture.
Par conséquent, augmenter ce délai allonge aussi la période pendant laquelle l’apparence précédente peut être utilisée après une mise à jour.

Pour les **animations de sélection Liquid Glass de UITabBar, une valeur de départ recommandée est de 600 ms**.
Lors de comparaisons sur les simulateurs iPhone sous iOS 27.0 et Duo sous iOS 27.1, 50 ms capturaient une sélection agrandie, 300 ms conservaient encore une légère variation résiduelle, et 600 ms correspondaient à l’apparence stabilisée observée à 1000 ms.
Cette recommandation concerne cette interaction ; il ne s’agit ni d’une garantie de durée d’Apple, ni d’une durée universelle pour Liquid Glass.
Mesurez la sélection, la resélection et les mises à jour successives de votre contrôle avant de choisir une valeur.
Un contenu qui change en continu ne garantit pas de snapshot stabilisé.
