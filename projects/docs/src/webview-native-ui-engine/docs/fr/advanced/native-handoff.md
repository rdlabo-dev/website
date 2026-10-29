---
title: "Transfert natif"
sourceRevision: "b775b82f00f554e349da3ad288738a3342139d5db18a22ee0677ebd193fbb2e3"
---
# Transfert natif pour les moteurs de rendu personnalisés

Un moteur de rendu existant doit transmettre ses messages ordonnés `WebProjectionRequest` à la méthode `handle` du gestionnaire natif d’instantanés. La validation des demandes, la conversion des coordonnées CSS vers le natif, le transfert d’images mises en cache et le retrait des copies restent ainsi dans l’Engine. Le pont reste la propre méthode Capacitor ou Cordova du plugin ; l’Engine ne dépend de l’objet d’appel d’aucun de ces frameworks.

Par exemple, un moteur de rendu envoie déjà les boutons d’une barre d’outils dans une mise à jour native unique et sait quelles vues appartiennent à chaque groupe de boutons. Transmettez les messages de transfert d’image à `handle` plutôt que de réimplémenter la conversion des coordonnées et le retrait des copies pour chaque groupe. Conservez l’admissibilité de la capture du groupe et sa mise en page ordinaire dans ce moteur de rendu : l’Engine ne peut pas déduire quelles vues sœurs peuvent être masquées ensemble sans risque.

Appelez les API de cycle de vie des vues et des instantanés sur le thread principal/UI. Fournissez deux callbacks du moteur de rendu : `frames(ids, revision)` renvoie les limites actuelles admissibles et `views(ids)` renvoie l’ensemble complet des vues natives pouvant être masquées ensemble sans risque. Renvoyez des limites vides ou `nil` / `null` lorsque l’opération n’est pas disponible. Les limites utilisent des **points relatifs à la WebView sur iOS** et des **pixels physiques relatifs à la WebView sur Android**. L’Engine vérifie que les ID mesurés correspondent exactement à la demande.

```swift
snapshots.handle(request, in: webView,
    frames: { ids, revision in renderer.measure(ids, at: revision) },
    views: { ids in renderer.viewsAllowedToHide(ids) },
    complete: reply)
```

```kotlin
snapshots.handle(request, activity.window, webView,
    frames = { ids, revision -> renderer.measure(ids, revision) },
    views = { ids -> renderer.viewsAllowedToHide(ids) },
    complete = { result ->
        result.fold(onSuccess = reply, onFailure = reject)
    })
```

`renderer` et `reply` ci-dessus représentent le code de mise en page existant du plugin et le callback de fin du pont. Sur Android, transmettez un `Result` en échec au callback de rejet du pont (`reject` ci-dessus) ; le Web utilise cet échec pour abandonner l’image et réconcilier la présentation. Ne confirmez pas comme réussie une étape de dessin échouée. `frames` peut s’exécuter plusieurs fois pendant la stabilisation de la géométrie ; il doit revérifier la révision demandée et l’admissibilité de la capture. Il ne doit pas modifier la mise en page. Si plusieurs contrôles partagent un conteneur natif, `views` doit rejeter un ensemble partiel qui masquerait des contrôles non capturés. L’Engine ne peut pas déduire cette relation. Le moteur de rendu conserve aussi ses notifications existantes d’interaction native.

`cover` installe les pixels préparés avant de masquer ces vues. Les parties de destination sont validées par rapport au jeton mis en cache et utilisées à la fois pour la couverture et la restauration ; déplacer une surface préparée ne réutilise donc pas une ancienne position. Les transferts invalides ou indisponibles renvoient `shown: false`. `painted` et `restored` retirent uniquement la copie correspondante ; Android attend que le dessin Web soit prêt. `release` et `reset` retirent les ressources possédées. Aucune capture ne démarre dans le chemin de couverture ou de restauration.

Le moteur de rendu effectue toujours sa mise à jour native ordinaire entre `restore` et la confirmation d’acceptation de la mise à jour. Avant cette mise à jour, appelez `restoreControls()` sur iOS ou `restoreViews()` sur Android pour annuler uniquement les changements de masquage de l’Engine. Il ne s’agit pas d’une commande pour mettre en page ou révéler arbitrairement du contenu du plugin. Conservez la politique normale de visibilité et de placement dans le moteur de rendu.

### Primitives directes d’instantané

Utilisez-les uniquement lorsque votre intégration gère le placement natif pendant le transfert. `NativeUIProjection` utilise les mêmes opérations avec des politiques de placement et de vues opaques propres à l’enregistrement. Ne dupliquez pas la conversion ou le retrait des copies lorsque vous transmettez des demandes à `handle`.

- Convertissez les `parts` de destination depuis les pixels CSS avec `webView.bounds.width / viewportWidth` sur iOS ou `webView.width / viewportWidth` sur Android. Passez les cadres à `cover` et `restore` ; en l’absence de parties de couverture, le placement capturé est conservé. Aucune de ces opérations ne capture de nouveaux pixels.
- `transient: true` sépare une surface mobile de premier plan du `coveringToken` de l’arrière-plan. Réutilisez les pixels tant que les tailles des sources et leurs positions relatives à leur scope restent inchangées ; un mouvement à l’intérieur d’un scope fixe invalide la mise en page.
- Retirez la copie d’entrée une fois le dessin Web prêt : `retireCopy(token)` sur iOS, `retireCopyAfterWebDraw` sur Android.
- Pour le retour, appelez `restore`, annulez le masquage de l’Engine avec `restoreControls()` / `restoreViews()`, puis appliquez la mise en page native normale. Retirez la copie de retour après l’acceptation de la mise à jour native et la disponibilité du dessin Web, en utilisant `retireCopy` avec `entry: false` / `entry = false`. Android peut transmettre `painted` et `restored` à `handle` pour réutiliser la gestion de disponibilité et de rejet.
- Libérez les jetons avec `release(token)`. Utilisez `reset()` uniquement pour le démontage du propriétaire, et `close()` sur Android pour libérer l’encodeur. Ne réinitialisez jamais les captures d’une autre surface.

L’absence de capture ou de placement utilise le repli ordinaire du moteur de rendu. Consultez le [contrat des demandes Web](web-projection.md#multiple-fallbacks-in-one-native-transaction) pour les charges utiles.

Utilisez `NativeUICoveredSnapshots.observe` pour notifier l’écouteur JS au début et à la fin d’une interaction. Sur iOS, les captures rastérisent la fenêtre visible avec `drawHierarchy(in:afterScreenUpdates:)`, y compris l’arrière-plan sous le composant natif découpé. Les vues d’instantané d’écran sont des répliques d’affichage et ne servent pas de sources bitmap. La rastérisation UIKit peut différer du compositeur actif pour des matériaux comme Liquid Glass ; validez l’apparence sur des appareils physiques avec les arrière-plans pris en charge par votre plugin. La validité du cache inclut donc la mise en page et les notifications de changement visuel du plugin. L’Engine ne capture pas en continu et ne garantit pas que tout moteur de rendu puisse être capturé.

## Suivi du défilement natif

Un contrôle natif dans une liste Web défilante nécessiterait autrement de nouveaux messages de placement à mesure que la liste bouge. Utilisez ces liaisons uniquement lorsque le moteur de rendu gère déjà la réconciliation du défilement : une vue de défilement overflow iOS identifiée sans ambiguïté peut entraîner le contenu natif avec elle. Un défilement imbriqué ou ambigu doit utiliser le repli ordinaire plutôt que rattacher le contenu au mauvais propriétaire de défilement.

`readScrollPlacement(element, owner, identify)` mesure un propriétaire overflow non transformé. `createScrollBindings()` valide la réutilisation et détecte les mouvements pendant que l’acquisition attend son ACK. N’incluez pas `reuse` dans les signatures de déduplication de mise en page ; il décrit l’état de confirmation, pas la mise en page.

Sur iOS, `NativeUIScrollBindings.replace` regroupe les sources par propriétaire et se lie uniquement à une `UIScrollView` correspondante non ambiguë. `update()` applique les positions et le découpage sans reconstruire le contenu. `NativeUIClippedView` conserve les dimensions complètes du contenu tout en limitant les pixels visibles et les tests de pointage.

Une liaison établie rejetée par le natif perd la propriété et peut être acquise à nouveau via le **même** chemin de mise à jour/ACK. Une nouvelle acquisition échouée reste sur le repli jusqu’à un événement pertinent de mise en page ou de fin de défilement. N’ajoutez jamais de boucle de réessai immédiate et ne rejouez pas d’actions utilisateur. Un changement de cadre ou de propriétés ne recalibre pas une origine de coordonnées établie.

Cette approche utilise la hiérarchie overflow interne de WKWebView sans noms de classes privées. Les vues absentes ou ambiguës, le défilement imbriqué, le défilement du document, les transformations non prises en charge, le découpage selon une forme ou un propriétaire mobile non confirmé ne peuvent pas être liés. Ne déclarez pas la prise en charge au seul motif qu’une `UIScrollView` existe. Une vue native peut intercepter les gestes qui commencent en son sein ; le routage de ces gestes et le comportement d’accessibilité du SDK restent propres au moteur de rendu.
