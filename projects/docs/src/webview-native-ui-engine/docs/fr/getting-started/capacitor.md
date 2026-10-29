---
title: "Intégration dans un plugin Capacitor"
sourceRevision: "2dede6099bb18549e5df650943c33a37b1519afe268c4896ab9e6a6caed254ce"
---
# Intégration dans un plugin Capacitor

Ajoutez la projection Web et la restauration à un plugin Capacitor existant sans modifier son export public `registerPlugin()`. Le plugin conserve son moteur de rendu natif et son API applicative ; l’Engine coordonne sa vue native avec un repli DOM.

Ce guide couvre les dépendances, l’enregistrement, les notifications et le démontage. Commencez par l’[initialisation native](initialization.md) pour l’appel minimal, les paramètres obligatoires et la propriété des ressources ; les diffs de plugin ci-dessous ajoutent le raccordement des événements et la gestion de la durée de vie. Utilisez la [référence de projection](../reference/projection.md) pour les contrats exacts et les limites des plateformes.

Pour un plugin Capacitor de barre d’onglets, l’application doit continuer à appeler les mêmes méthodes d’affichage et de sélection. Ajoutez l’enregistrement dans le plugin natif, puis transmettez ses mises à jour réussies afin qu’une modale Web puisse couvrir la barre sans exiger que chaque application implémente le transfert d’images.

## Prérequis

Ce paquet déclare prendre en charge Capacitor 8 (`>=8.0.0 <9`). La bibliothèque Engine nécessite iOS 15+ et Android API 23+ ; la version de Capacitor ou le SDK consommateur peut exiger un minimum supérieur. La capture composite Android nécessite l’API 26+ et les fonctionnalités WebView décrites dans la [référence de projection](../reference/projection.md#dom-and-native-surface-requirements).

## Choisir la destination Web

Fournissez un conteneur DOM mis en page pour chaque enregistrement, dans la couche où sa projection Web doit se trouver. Il peut être inséré après l’enregistrement. Le plugin gère toujours le placement et la taille de la vue native ; l’Engine ne crée ni ne dimensionne l’une ou l’autre vue à votre place.

Choisissez un [conteneur pris en charge](../reference/containers.md) avant de raccorder son sélecteur. Lisez les [exigences du DOM et de la surface native](../reference/projection.md#dom-and-native-surface-requirements) avant d’intégrer des éléments personnalisés, du contenu SDK ou plusieurs surfaces. Le suivi du défilement et le transfert d’images sont internes à l’enregistrement. Pour les applications Ionic, activez éventuellement la [prise en charge des superpositions Ionic](../configuration/ionic-overlays.md) une fois au démarrage de l’application. Les autres frameworks émettent les notifications de projection configurées depuis leur propre cycle de vie de transitions et de superpositions.

## Installer dans un plugin

Remplacez `<engine-version>` dans chaque dépendance ci-dessous par la même version publiée. Lisez la documentation du tag de cette version pour que les exemples correspondent à ses API.

```sh
npm install --save-exact '@webview-native-ui/engine@<engine-version>'
```

L’archive npm contient les déclarations TypeScript, ESM, les sources Swift et un podspec. Les dépendances natives doivent aussi être déclarées par le plugin consommateur ; une dépendance npm seule ne lie ni la bibliothèque Swift ni l’AAR Android.

La distribution native principale utilise Swift Package Manager. Déclarez une dépendance à la bibliothèque à la racine du dépôt depuis votre plugin :

```swift
.package(url: "https://github.com/webview-native-ui/engine.git", exact: "<engine-version>")
// Dans les dépendances de la cible du plugin :
.product(name: "WebViewNativeUIEngine", package: "engine")
```

Tant que l’API est en version pré-1.0, épinglez la même version de l’Engine dans npm, SwiftPM, Gradle et CocoaPods, et effectuez les mises à jour délibérément. Les applications doivent conserver leurs fichiers de verrouillage des dépendances pour des compilations reproductibles.

SwiftPM résout les tags de version de ce dépôt, tels que `v0.0.1`. Pour des tests d’intégration non publiés, utilisez un checkout local ou un commit explicite testé.

`import WebViewNativeUIEngine` ne nécessite aucun enregistrement Capacitor. Le compagnon npm fournit la mesure du DOM et le transfert d’images Web ; SwiftPM résout la dépendance native indépendamment du hoisting npm.

### Android : ajouter la dépendance Maven

Dans `android/build.gradle` du plugin consommateur, ajoutez la version de l’Engine correspondant à sa dépendance npm :

```groovy
dependencies {
    implementation 'io.github.webview-native-ui:engine:<engine-version>'
}
```

Vérifiez que `google()` et `mavenCentral()` sont présents dans les dépôts de dépendances du build consommateur. Pour un build utilisant des dépôts centralisés, fusionnez-les dans `android/settings.gradle` :

```groovy
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}
```

Si le build utilise plutôt des dépôts au niveau des projets, ajoutez-les à son bloc `repositories` existant. Installer le paquet npm n’ajoute pas cette dépendance Gradle. Utilisez une version dont le POM et l’AAR sont disponibles depuis Central ; `PUBLISHING` confirme seulement l’acceptation et ne garantit pas encore les téléchargements.

### Compatibilité CocoaPods via npm

CocoaPods utilise les sources Swift et le podspec livrés dans npm ; aucune publication sur CocoaPods Trunk n’est nécessaire. Le mainteneur du plugin déclare la dépendance correspondante dans le podspec du plugin :

```ruby
s.dependency 'WebViewNativeUIEngine', '<engine-version>'
```

Le mainteneur doit aussi documenter cette configuration initiale unique de l’application. Installez la version correspondante de l’Engine comme dépendance npm directe, puis ajoutez le pod local **dans la cible de l’application, en dehors de `def capacitor_pods`**, que Capacitor régénère :

```sh
npm install --save-exact '@webview-native-ui/engine@<engine-version>'
```

```ruby
# ios/App/Podfile; adjust the path for a different native project layout.
target 'App' do
  capacitor_pods
  pod 'WebViewNativeUIEngine', :path => '../../node_modules/@webview-native-ui/engine'
end
```

Exécutez `npx cap sync ios` et recompilez. Lors d’une mise à jour, gardez la version directe de l’Engine alignée sur la dépendance du plugin consommateur. Avec une structure node_modules non standard, faites pointer `:path` vers le répertoire du paquet Engine installé. Une dépendance npm seule n’enregistre pas de Pod, et une dépendance podspec ne peut pas spécifier ce chemin local. L’Engine n’a volontairement ni enregistrement de plugin Capacitor ni hook de réécriture du Podfile. Les consommateurs SwiftPM n’ont pas besoin de cette configuration CocoaPods.

## Enregistrer depuis le plugin natif

Conservez l’export normal `registerPlugin()` et les méthodes publiques du plugin inchangés. Créez et conservez un enregistrement après la création du moteur de rendu natif. L’Engine livre son runtime Web avec la bibliothèque Swift/Android, le démarre dans le document actuel et les documents futurs, trouve le DOM de repli existant et s’abonne aux notifications du plugin. Les applications n’appellent pas d’initialiseur JS distinct.

Le [contrat des notifications](../configuration/events.md) définit les changements réussis à signaler et le fonctionnement du routage au démarrage.

L’intégration comporte trois responsabilités :

1. Le consommateur fournit un conteneur de repli Web existant et mis en page dans la bonne couche. Passez cette destination de projection comme `projectionSelector: string` obligatoire ; il n’existe pas de mode `null` ou de création automatique du DOM.
2. Le plugin enregistre ses vues natives et ses noms de notifications une fois sur chaque plateforme.
3. Le plugin émet des notifications après ses mises à jour et libère l’enregistrement au démontage.

### iOS : ajouter l’enregistrement à votre classe `CAPPlugin`

Dans `ios/Sources/ExamplePlugin/ExamplePlugin.swift`, conservez l’enregistrement comme propriété et initialisez-le dans `load()`, **après que le moteur de rendu existant a créé et attaché sa vue**.

Dans ce diff, `nativeView` est la `UIView` que votre plugin possède déjà ; son code de rendu existant est représenté par des commentaires.

Utilisez le **`jsName`** existant, pas `identifier` : Capacitor utilise `jsName` pour les appels de plugin JS et les abonnements aux événements. Ne répétez pas le nom du plugin dans la configuration de l’Engine.

```diff
 import Capacitor
 import UIKit
+import WebViewNativeUIEngine

 @objc(ExamplePlugin)
 public class ExamplePlugin: CAPPlugin, CAPBridgedPlugin {
     public let identifier = "ExamplePlugin"
     public let jsName = "Example"
     public let pluginMethods: [CAPPluginMethod] = [
         CAPPluginMethod(name: "setColors", returnType: CAPPluginReturnPromise)
     ]
     private var nativeView: UIView?
+    private var projection: NativeUIProjection?

     public override func load() {
         // Le code existant crée et attache nativeView ici.
+        do {
+            projection = try NativeUIProjection(
+                webView: bridge?.webView,
+                plugin: jsName,
+                projectionSelector: "#native-ui-fallback",
+                receiveListeners: .init(
+                    update: ["appearanceChanged"],
+                    projection: .init(
+                        native: ["shown"],
+                        web: ["transitionStarted"],
+                        none: ["hidden"]
+                    )
+                ),
+                view: { [weak self] in
+                    self?.nativeView
+                }
+            )
+        } catch {
+            CAPLog.print("Native UI projection unavailable: \(error)")
+        }
     }

     @objc func setColors(_ call: CAPPluginCall) {
         DispatchQueue.main.async {
             // Le code existant applique les couleurs demandées à nativeView.
+            self.notifyListeners("appearanceChanged", data: [:])
             call.resolve()
         }
     }
+
+    public override func notifyListeners(_ eventName: String, data: [String: Any]?, retainUntilConsumed: Bool) {
+        projection?.receive(eventName, data: data)
+        super.notifyListeners(eventName, data: data, retainUntilConsumed: retainUntilConsumed)
+    }
+
+    deinit {
+        projection?.destroy()
+    }
 }
```

Passez directement `bridge?.webView`. Si la WebView est indisponible, l’Engine lève une erreur d’initialisation interceptée par le même `catch` ; un guard distinct ou un déballage forcé est inutile.

Si la vue est créée plus tard dans une méthode `initialize` / `show` existante, placez l’enregistrement après la création de la vue plutôt que dans `load()`. Conservez un enregistrement pendant la durée de vie de ce moteur de rendu ; n’en créez pas un autre à chaque mise à jour. Lors du remplacement d’un moteur de rendu, détruisez son ancien enregistrement avant d’enregistrer son remplaçant.

### Android : ajouter l’enregistrement à votre classe `Plugin`

Effectuez les changements correspondants dans `android/src/main/java/<your-package>/ExamplePlugin.kt`. **`pluginHandle.id`** est le nom du plugin enregistré par Capacitor, dérivé de `@CapacitorPlugin` ; aucune seconde chaîne de nom n’est nécessaire.

```diff
 import android.view.View
 import com.getcapacitor.Plugin
 import com.getcapacitor.PluginCall
 import com.getcapacitor.PluginMethod
 import com.getcapacitor.annotation.CapacitorPlugin
+import android.util.Log
+import com.getcapacitor.JSObject
+import io.github.webview_native_ui.engine.NativeUIProjection
+import io.github.webview_native_ui.engine.NativeUIProjection.ReceiveListeners

 @CapacitorPlugin(name = "Example")
 class ExamplePlugin : Plugin() {
     private var nativeView: View? = null
+    private var projection: NativeUIProjection? = null

     override fun load() {
         // Le code existant crée et attache nativeView ici.
+        projection = runCatching {
+            NativeUIProjection.install(bridge.webView)
+            NativeUIProjection(
+                window = activity.window,
+                webView = bridge.webView,
+                plugin = pluginHandle.id,
+                projectionSelector = "#native-ui-fallback",
+                receiveListeners = ReceiveListeners(
+                    update = listOf("appearanceChanged"),
+                    projection = ReceiveListeners.Projection(
+                        native = listOf("shown"),
+                        web = listOf("transitionStarted"),
+                        none = listOf("hidden")
+                    )
+                ),
+                view = { nativeView }
+            )
+        }.onFailure {
+            Log.e(javaClass.simpleName, "Native UI projection unavailable", it)
+        }.getOrNull()
     }

     @PluginMethod
     fun setColors(call: PluginCall) {
         activity.runOnUiThread {
             // Le code existant applique les couleurs demandées à nativeView.
+            notifyListeners("appearanceChanged", JSObject())
             call.resolve()
         }
     }
+
+    override fun notifyListeners(eventName: String, data: JSObject, retainUntilConsumed: Boolean) {
+        projection?.receive(eventName, data)
+        super.notifyListeners(eventName, data, retainUntilConsumed)
+    }
+
+    override fun handleOnDestroy() {
+        projection?.close()
+        projection = null
+        super.handleOnDestroy()
+    }
 }
```

Sur Android, appelez `NativeUIProjection.install(bridge.webView)` dans le `load()` du plugin, avant la première navigation, même lorsque les vues SDK arrivent plus tard. Incluez l’installation dans le même périmètre de gestion des erreurs que l’enregistrement ; si elle échoue, conservez le repli Web existant et ne réessayez pas l’installation après la navigation. Les enregistrements partagent ensuite ce canal de frame principale limité aux origines autorisées ; ils n’installent pas de nouveaux écouteurs de messages dans une WebView chargée. Installer le canal avant la navigation évite un crash natif de WebView lors de l’enregistrement d’une vue chargée de façon asynchrone. Le constructeur d’enregistrement ne peut installer le canal que sur une WebView n’ayant pas encore navigué ; une installation tardive échoue avec une erreur exploitable plutôt que de tenter une injection dangereuse. Tous les enregistrements de la même WebView doivent utiliser les mêmes origines autorisées. Fermer un enregistrement supprime uniquement son propriétaire du canal, afin que les autres vues enregistrées continuent de fonctionner. Le canal partagé reste installé pendant la durée de vie de la WebView ; les enregistrements doivent toujours être conservés et fermés par leur plugin consommateur.

Les deux diffs ajoutent une propriété privée, un enregistrement natif, une redéfinition de notification, une notification de mise à jour et le démontage. Ils n’ajoutent aucune méthode Engine à `pluginMethods`, aucune enveloppe JS publique ni aucun initialiseur Engine côté application.

Conservez l’export `registerPlugin()` existant de votre plugin. Utilisez les mêmes noms d’événements dans l’enregistrement et dans `notifyListeners` ; si le plugin émet déjà un événement adapté (tel que `tabSelected`), déclarez cet événement au lieu de l’émettre deux fois.

## Vérifier l’intégration

Affichez le contrôle, modifiez son apparence, puis ouvrez et fermez une superposition Web couvrante. Vérifiez que l’apparence préparée appartient au contrôle actuel et que l’interaction native revient à la position actuelle. Vérifiez aussi le masquage, le remplacement du conteneur et le démontage du plugin : les réponses tardives ne doivent pas révéler du contenu retiré. Testez l’absence d’image pour valider le repli Web choisi.

Utilisez le contrôle réel et les arrière-plans sur les appareils pris en charge ; la réussite du pont seule ne peut pas valider la continuité visuelle. Pour un moteur de rendu qui regroupe déjà les contrôles par page, poursuivez avec le [guide des moteurs de rendu](../advanced/renderer.md) plutôt que de dupliquer les mécanismes d’enregistrement à chaque transfert.

## Ensuite : choisir les comportements facultatifs

Utilisez le [guide de configuration](../configuration/README.md) pour le routage des notifications, la réflexion des valeurs, le timing de capture et la politique de repli. Ces paramètres communs ne constituent pas une configuration de plateforme supplémentaire. Pour un moteur de rendu qui regroupe déjà les contrôles, consultez les [API avancées](../advanced/README.md).
