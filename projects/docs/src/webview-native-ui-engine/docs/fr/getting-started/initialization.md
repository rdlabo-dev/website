---
title: "Initialisation de base"
sourceRevision: "55b35c15a1050e71982b5937734839562c86c9252cc3ac4451fad5da632c0f9c"
---
# Initialiser l’enregistrement d’une vue native

Commencez par `NativeUIProjection` lorsqu’un plugin possède une vue native et un conteneur Web correspondant. L’enregistrement démarre le runtime, lie ce conteneur et coordonne le transfert vers l’image et la restauration. Cette approche ne nécessite pas les API de moteur de rendu.

Utilisez le guide [Capacitor](capacitor.md) ou [Cordova](cordova.md) pour l’installation des dépendances, les points d’entrée du cycle de vie du plugin et la transmission des notifications. Les exemples ci-dessous montrent l’enregistrement minimal dans ces points d’entrée, puis les paramètres obligatoires. Après l’initialisation, le guide de configuration présente les comportements facultatifs ; les API avancées ont leur propre point d’entrée.

Par exemple, un plugin dessine déjà une barre d’onglets native, mais l’application ouvre un panneau de réglages Web au-dessus. Enregistrez la barre et son hôte de navigation de repli afin que l’Engine puisse placer la barre capturée sous ce panneau et rétablir les interactions natives à sa fermeture. Le plugin conserve son API existante de sélection d’onglet.

## Initialisation minimale

Créez et conservez un enregistrement après que le moteur de rendu a attaché sa vue native. Le sélecteur peut correspondre à un conteneur DOM ajouté ultérieurement, mais la présentation native attend que ce conteneur existe. Donnez-lui une [boîte de mise en page prise en charge](../reference/containers.md).

Dans un plugin Capacitor Swift, à l’intérieur de `load()` ou de l’initialiseur existant du moteur de rendu :

```swift
projection = try NativeUIProjection(
    webView: bridge?.webView,
    plugin: jsName,
    projectionSelector: "#native-ui-fallback",
    view: { [weak self] in self?.nativeView }
)
```

Dans un plugin Capacitor Kotlin, installez le canal partagé dans `load()` **avant la première navigation de la WebView**. L’enregistrement peut être créé plus tard, lorsque sa vue est prête :

```kotlin
NativeUIProjection.install(bridge.webView)
projection = NativeUIProjection(
    window = activity.window,
    webView = bridge.webView,
    plugin = pluginHandle.id,
    projectionSelector = "#native-ui-fallback",
    view = { nativeView }
)
```

Ces deux extraits doivent se trouver dans le périmètre de gestion des erreurs du guide d’intégration ; conservez le repli Web existant si l’initialisation échoue. `projection` et `nativeView` sont des propriétés de votre plugin. Libérez l’enregistrement avec `destroy()` sur iOS ou `close()` sur Android lorsque ce moteur de rendu est retiré. Tous les appels natifs de cycle de vie s’exécutent sur le thread UI.

Cordova utilise le même enregistrement avec `runtime: .cordova` / `runtime = Runtime.CORDOVA`, ainsi que sa propre WebView et son identité de plugin. Suivez le [guide Cordova](cordova.md) pour ces points d’entrée et le gestionnaire de ressources Android.

## Paramètres obligatoires

| Paramètre | Plateformes | Ce qu’il identifie et pourquoi |
| --- | --- | --- |
| `webView` | iOS / Android | La WebView de l’application, qui possède le document de destination et le pont. Swift accepte une référence facultative afin qu’une WebView absente déclenche une erreur interceptée par la gestion des erreurs d’initialisation. |
| `plugin` | iOS / Android | L’identité existante du plugin dirige les notifications vers ce plugin plutôt que vers un autre consommateur de l’Engine. Capacitor : `jsName` sur iOS, `pluginHandle.id` sur Android. Cordova : le nom du service configuré. |
| `projectionSelector` | iOS / Android | Un sélecteur CSS correspondant exactement à un conteneur Web existant au début de la présentation. Il place l’image dans la bonne mise en page et la bonne couche de superposition ; un rectangle natif ne peut pas identifier cette couche DOM. |
| `view` | iOS / Android | Un callback renvoyant la vue native actuelle du moteur de rendu, ou nil/null en son absence. Renvoyez la vue actuelle pendant la durée de vie de ce moteur de rendu. Lors de son remplacement, libérez son enregistrement et créez-en un nouveau ; le plugin gère la mise en page et la visibilité normale. |
| `window` | Android | La fenêtre contenant la WebView et la surface native, nécessaire à la capture composite et au suivi des interactions. |

Ces paramètres établissent la propriété des ressources. Ils n’indiquent pas à l’Engine quand le contenu change ni quand une transition de l’application doit modifier la présentation.

## Ensuite : configurer une interface évolutive

L’enregistrement minimal établit la propriété des ressources. Poursuivez avec les [paramètres facultatifs](../configuration/README.md) pour le raccordement des événements, la réflexion des valeurs, la capture et la politique d’échec. Chaque paramètre précise sa valeur par défaut et les cas où il est nécessaire. Consultez les [API avancées](../advanced/README.md) uniquement si votre moteur de rendu gère déjà des lots, le placement ou la réconciliation des mises à jour.

[Vue d’ensemble de la documentation](../README.md)
