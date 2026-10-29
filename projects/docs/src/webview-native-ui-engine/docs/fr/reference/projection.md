---
title: "Contrat de projection et durée de vie"
sourceRevision: "815c5dbcef229aa13eaf2e47d8bd643ca955bf96eddd26cf9dcbff7d1d8776be"
---
# Référence de projection

Utilisez cette référence pour vérifier les contrats d’intégration et les limites des plateformes. Commencez par les [concepts et choix d’intégration](../concepts.md) pour décider si l’Engine convient à votre interface. Utilisez l’[initialisation native](../getting-started/initialization.md) pour distinguer paramètres obligatoires, paramètres facultatifs et API avancées, puis suivez le guide [Capacitor](../getting-started/capacitor.md), [Cordova](../getting-started/cordova.md) ou [moteur de rendu](../advanced/renderer.md).

Cette page couvre la durée de vie du DOM, la priorité des destinations, les exigences des hôtes et l’admissibilité native. Consultez les [limites des plateformes](platforms.md) pour les détails de capture, l’[état de projection](state.md) pour l’attribut d’intention et les [conteneurs pris en charge](containers.md) pour les hôtes HTML/Ionic.

Utilisez ce contrat pour décider de ce qui doit survivre à une transition. Par exemple, une modale se ferme alors qu’une réponse de restauration native est encore en transit, et le framework remplace le DOM de la page. L’ancienne réponse ne doit pas révéler les contrôles de la page retirée ; les règles de durée de vie et de destination ci-dessous définissent cette frontière.

## Durée de vie du DOM et de la page

L’enregistrement natif est indépendant du framework JavaScript. Son sélecteur identifie un conteneur de repli dans le document actuel ; il peut apparaître après l’enregistrement. Lorsqu’un framework supprime ou remplace ce conteneur, l’Engine retire l’ancienne projection et lie l’élément correspondant actuel. Un glissement ou une confirmation de dessin natif en attente provenant du conteneur retiré ne doit pas bloquer son remplacement. Déplacer le même élément entre parents actualise ses liaisons de défilement sans exiger un nouvel enregistrement par le plugin.

Une navigation HTML complète crée un nouveau document et une nouvelle session de runtime. L’enregistrement natif installe le runtime dans le nouveau document et conserve la destination de projection explicite du plugin ; images et réponses appartiennent à leur document d’origine. Conservez les enregistrements pendant toute la durée de vie du moteur de rendu natif plutôt que de les recréer à chaque événement de page du framework.

Ces règles s’appliquent à l’enregistrement natif par sélecteur. Un `createWebProjectionScope(element)` de bas niveau lie intentionnellement cet élément précis ; son moteur de rendu reste responsable du remplacement du scope lorsqu’il change d’élément.

L’Engine ne peut pas déduire toute la sémantique de transition ou de modale de chaque framework à partir des mutations DOM. Utilisez les notifications de projection existantes pour ces transitions et une intégration explicite des superpositions si nécessaire. La prise en charge d’Ionic est facultative ; elle n’est pas nécessaire à la gestion ordinaire de la durée de vie du DOM. Les événements propres au framework ne sont pas installés automatiquement. La création des vues natives, les contraintes de mise en page et le cycle de vie des SDK restent gérés par le plugin.

## Contrat de projection

Une notification spécifie **où la surface doit se trouver**, pas comment la capturer. L’Engine choisit le transfert propre à la plateforme sans exiger que le plugin conserve une autre copie de l’état de projection.

| Destination souhaitée | Comportement requis |
| --- | --- |
| `native` | Afficher la vue native interactive à la géométrie confirmée. Pendant un mouvement, utiliser le suivi natif pris en charge ou une image préparée. |
| `web` | Garder le contenu natif sous la couche Web couvrante en retirant sa projection native ; utiliser une image préparée ou le repli Web du plugin. |
| `none` | Retirer le contenu natif, les images projetées et le contenu de repli. Les callbacks ultérieurs de mise à jour ou de capture ne doivent pas les réafficher. |

La couverture par une superposition peut temporairement transformer `native` en `web` ; elle ne remplace jamais `none`. Un échec de capture ne change pas la destination souhaitée. `failedFallback: native` n’est valide que pour les consommateurs qui maintiennent eux-mêmes le placement natif, et ne remplace jamais `web` ou `none` explicites, ni la couverture d’une superposition.

L’Engine gère la disponibilité de l’image et la confirmation de restauration. Il ne doit pas masquer les pixels natifs avant que les pixels de remplacement soient prêts, ni retirer les pixels de remplacement avant la réussite de la restauration native. Un mouvement de position seul réutilise le contenu préparé ; les changements d’apparence, de taille et d’identité du moteur de rendu l’invalident. Une image absente utilise immédiatement le repli déclaré au lieu d’attendre une capture pendant une transition.

L’enregistrement et la transmission des notifications conservent la dernière intention au démarrage et à la reconnexion ; ils ne rejouent pas d’événements métier. La destruction retire l’enregistrement et ses images en cache. Les notifications expriment une intention, pas une promesse de fin : une API promettant un masquage terminé doit attendre la confirmation explicite de retrait décrite dans les exigences du DOM et de la surface native.

Un moteur de rendu existant qui vérifie la visibilité CSS peut appeler `getUnprojectedVisibility(element)` depuis le paquet npm. Il lit la visibilité actuelle définie ou héritée sans les règles de masquage de l’Engine, puis restaure la propriété de projection avant de retourner. N’utilisez pas les attributs marqueurs de l’Engine pour déduire la propriété de projection et ne les modifiez pas dans un plugin consommateur. Consultez l’[intégration DOM du moteur de rendu](../advanced/web-projection.md) pour exclure les mutations appartenant à l’Engine de l’invalidation du moteur de rendu. Ce helper lit le style et peut déclencher des observateurs d’attributs ; il ne supprime pas les coûts de mesure ou de transport.

## Exigences du DOM et de la surface native

`projectionSelector` est obligatoire et doit résoudre **un conteneur existant au démarrage de la projection**, à l’aide d’un sélecteur CSS valide. Les sélecteurs d’ID, de classe, d’attribut et de descendant sont pris en charge ; zéro ou plusieurs correspondances maintiennent le natif masqué. L’Engine ne crée pas le conteneur de repli et ne choisit ni sa taille, ni son placement, ni sa couche, ni son z-index. Conservez la mise en page normale du conteneur et les éventuels contrôles Web interactifs ; un emplacement réservé vide de taille nulle n’est pas un repli utilisable. C’est un scope fixe, pas une racine de découverte.

Le conteneur n’a pas besoin d’exister au moment de l’enregistrement. En l’absence de DOM, l’Engine attend sans afficher le contenu natif ; son remplacement crée une nouvelle liaison et retire les anciennes images. L’Engine préserve les enfants, écouteurs et valeurs du conteneur. Passez la vue native elle-même via `view` ; un groupe de contrôles peut utiliser leur conteneur natif commun. L’Engine gère l’identifiant interne : aucune liste d’ID ni aucun dictionnaire de vues n’est requis. Des surfaces indépendantes utilisent des enregistrements distincts.

Un hôte de Web Component peut être la destination, par exemple `projectionSelector: 'native-ad[placement="home"]'`. Donnez à l’hôte une boîte de mise en page (`display: block` avec les dimensions prévues) ; l’Engine observe l’insertion, la suppression et les changements des attributs du sélecteur. Le sélecteur s’exécute dans le document et ne recherche pas dans les racines shadow. L’Engine masque le contenu de repli et les pseudo-éléments du light DOM et des racines shadow ouvertes pendant la projection. Le contenu shadow fermé ne peut pas être inspecté et doit hériter de la `visibility` de l’hôte ; fournissez un conteneur dont la structure shadow/slot peut afficher l’image insérée.

Consultez les [conteneurs de projection pris en charge](containers.md) pour les tableaux HTML et l’inventaire complet des éléments Ionic, les conditions de dimensionnement et un exemple de conteneur enveloppant.

### Exigences des surfaces natives

Lorsqu’un plugin affiche plusieurs vues natives se déplaçant indépendamment, par exemple plusieurs publicités dans un flux défilant, créez un enregistrement distinct pour chaque vue avec un sélecteur correspondant à son propre conteneur DOM. Une vue peut ainsi se déplacer, se masquer ou être remplacée sans modifier la projection d’une autre.

Si ces enregistrements partagent les notifications du plugin, utilisez `receiveListeners.match` pour diriger chaque notification vers l’enregistrement voulu. Les champs de correspondance sont choisis par le plugin, pas des identifiants réservés de l’Engine. Par exemple, incluez `viewKey` pour identifier l’élément affiché et `instanceId` pour distinguer les instances successivement chargées de cet élément :

```swift
match: ["viewKey": viewKey, "instanceId": instanceId]
```

```kotlin
match = mapOf("viewKey" to viewKey, "instanceId" to instanceId)
```

Incluez les mêmes champs dans la charge utile de la notification. Libérez l’ancien enregistrement lorsque vous remplacez son contenu chargé, même si le conteneur natif est réutilisé, afin que les notifications de l’instance précédente ne puissent pas affecter son remplacement.

Pour les vues SDK tierces, conservez le chargement et la gestion des interactions dans votre plugin. Utilisez `canCapture` pour signaler si le contenu actuel peut être capturé selon les règles du SDK et les conditions de capture prises en charge par l’intégration. Par exemple, un SDK publicitaire peut exiger des traitements différents pour les vidéos et le contenu statique. L’Engine n’accorde pas d’autorisation de capture de contenu SDK et ne remplace pas sa gestion des clics et des impressions.

Pour les consommateurs SDK sans repli Web équivalent, définissez `failedFallback: .native` sur iOS ou `failedFallback = NativeUIProjection.FailedFallback.NATIVE` sur Android. La valeur par défaut est `.web` / `WEB`, ce qui préserve les consommateurs existants. Si un mouvement automatique ne peut pas utiliser une image préparée (non prête, capture non prise en charge ou transfert rejeté), `native` préserve la vue native active et maintient le DOM de repli masqué. Le consommateur doit continuer à positionner cette vue ; cette option ne crée pas de suivi natif du défilement sur Android. `web` et `none` explicites ainsi que la couverture par une superposition sont prioritaires : cette option ne place jamais une vue native au-dessus d’une couche Web qui la couvre intentionnellement.

Sur Android, les consommateurs dont la méthode de masquage asynchrone promet la disparition de tous les pixels doivent appeler `projection.hide { completed -> ... }` et ne résoudre que lorsque `completed` vaut true. Les copies de transfert natives disparaissent immédiatement ; la fin attend le retrait synchrone du proxy Web. Une expiration signale un échec, pas une réussite. Appelez `projection.show()` lors d’une nouvelle présentation, en plus des événements normaux du plugin ; cela préserve aussi l’intention de présentation si l’abonnement aux événements démarre encore.

L’observation du défilement suit les ancêtres de l’arbre composé, y compris les slots assignés. Les événements de défilement non composés dans un arbre shadow Ionic sont observés à leur source ; les applications n’ajoutent pas d’écouteur supplémentaire et n’émettent pas d’événements synthétiques sur le document. Les écouteurs suivent les changements de parent de l’hôte et les réaffectations de slots, puis sont supprimés au démontage.

Le défilement est interne : iOS utilise une liaison de défilement native correspondant sans ambiguïté lorsqu’elle est disponible ; sinon, y compris sur Android, le défilement utilise temporairement l’image préparée et restaure le contenu natif après stabilisation du mouvement. La gestion automatique du défilement ne remplace jamais `web` ou `none` explicites. Une capture ou une géométrie non prise en charge conserve le repli DOM normal ; elle n’attend pas de nouvelle capture sur le chemin de transition. La dernière destination explicite survit au rechargement de la WebView, et les réponses d’un ancien document ne peuvent pas terminer les demandes d’un nouveau document.

Par défaut, le canal interne est limité à la frame principale sur les origines localhost de Capacitor. Passez les `allowedOrigins` exactes de l’application pour une origine configurée différente. Android exige les fonctionnalités WebView `WEB_MESSAGE_LISTENER` et `DOCUMENT_START_SCRIPT` ; l’enregistrement échoue explicitement sur les implémentations WebView non prises en charge. N’utilisez pas d’origines avec caractères génériques pour les WebViews pouvant naviguer vers des sites distants.

Pour les modes de capture, les surfaces translucides, les couleurs d’image et le stockage privé, consultez les [limites de capture et des plateformes](platforms.md). Le pont personnalisé du moteur de rendu et les liaisons de défilement sont documentés dans le [transfert natif](../advanced/native-handoff.md).

[Vue d’ensemble de la documentation](../README.md)
