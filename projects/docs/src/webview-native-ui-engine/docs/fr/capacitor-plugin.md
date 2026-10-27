---
title: "Intégration dans un plugin Capacitor"
sourceRevision: "fd18aee2bee4eca18fa3da8078debd30fe61c1887934fbe3d6b0c69b64f9130a"
---
# Intégration dans un plugin Capacitor

Ajoutez projection Web et restauration à un plugin Capacitor existant sans modifier son export public `registerPlugin()`. Le plugin conserve son moteur de rendu natif et son API applicative ; l’Engine coordonne sa vue native avec un repli DOM.

Ce guide couvre les dépendances, l’enregistrement, les notifications et le nettoyage. Consultez le [comportement de projection](projection.md) pour les exigences DOM communes, les politiques de capture et l’intégration avancée.

## Prérequis

Ce package déclare prendre en charge Capacitor 8 (`>=8.0.0 <9`). La bibliothèque Engine nécessite iOS 15+ et Android API 23+ ; la version de Capacitor ou le SDK qui la consomme peut imposer un minimum supérieur. La capture composite Android nécessite l’API 26+ et les fonctionnalités WebView décrites dans la [référence de projection](projection.md#dom-and-native-surface-requirements).

## Installer dans un plugin

```sh
npm install --save-exact @webview-native-ui/engine@0.0.1
```

L’archive npm contient les déclarations TypeScript, les modules ESM, les sources Swift et un podspec. Le plugin consommateur doit aussi déclarer les dépendances natives ; une dépendance npm seule ne lie ni la bibliothèque Swift ni l’AAR Android.

Swift Package Manager est le mode principal de distribution native. Depuis votre plugin, déclarez une dépendance à la bibliothèque située à la racine du dépôt :

```swift
.package(url: "https://github.com/webview-native-ui/engine.git", exact: "0.0.1")
// Dans les dépendances de la cible du plugin :
.product(name: "WebViewNativeUIEngine", package: "engine")
```

Les nouvelles coordonnées commencent à `0.0.1`. Tant que l’API est antérieure à 1.0, épinglez la même version Engine dans npm, SwiftPM, Gradle et CocoaPods, et mettez-la à jour délibérément. Les applications doivent conserver leurs fichiers de verrouillage des dépendances pour des compilations reproductibles.

SwiftPM résout les tags de version du dépôt, tels que `v0.0.1`. Pour des tests d’intégration non publiés, utilisez un checkout local ou un commit explicitement testé.

`import WebViewNativeUIEngine` ne nécessite aucun enregistrement Capacitor. Le complément npm fournit la mesure du DOM et le transfert des images Web ; SwiftPM résout la dépendance native indépendamment du hoisting npm.

### Android : ajouter la dépendance Maven

Dans le fichier `android/build.gradle` du plugin consommateur, ajoutez la version Engine correspondant à sa dépendance npm :

```groovy
dependencies {
    implementation 'io.github.webview-native-ui:engine:0.0.1'
}
```

Assurez-vous que `google()` et `mavenCentral()` figurent dans les dépôts de dépendances de la compilation consommatrice. Si les dépôts sont centralisés, ajoutez-les à `android/settings.gradle` :

```groovy
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}
```

Si la compilation utilise plutôt des dépôts au niveau du projet, ajoutez-les au bloc `repositories` existant. Installer le package npm n’ajoute pas cette dépendance Gradle. Utilisez une version dont le POM et l’AAR sont disponibles sur Central ; `PUBLISHING` confirme seulement l’acceptation et ne garantit pas encore le téléchargement.

### Compatibilité CocoaPods via npm

CocoaPods utilise les sources Swift et le podspec fournis dans npm ; aucune publication CocoaPods Trunk n’est requise. Le mainteneur du plugin déclare la dépendance correspondante dans le podspec du plugin :

```ruby
s.dependency 'WebViewNativeUIEngine', '0.0.1'
```

Le mainteneur doit également documenter cette configuration applicative à effectuer une seule fois. Installez la version Engine correspondante comme dépendance npm directe, puis ajoutez le pod local **dans la cible de l’application, en dehors de `def capacitor_pods`**, que Capacitor régénère :

```sh
npm install --save-exact @webview-native-ui/engine@0.0.1
```

```ruby
# ios/App/Podfile; adjust the path for a different native project layout.
target 'App' do
  capacitor_pods
  pod 'WebViewNativeUIEngine', :path => '../../node_modules/@webview-native-ui/engine'
end
```

Exécutez `npx cap sync ios`, puis recompilez. Lors des mises à jour, alignez la version directe de l’Engine sur la dépendance du plugin consommateur. Avec une disposition node_modules non standard, faites pointer `:path` vers le répertoire installé du package Engine. Une dépendance npm seule n’enregistre pas un Pod, et une dépendance podspec ne peut pas spécifier ce chemin local. L’Engine ne possède volontairement ni enregistrement de plugin Capacitor ni hook de réécriture du Podfile. Les consommateurs SwiftPM n’ont pas besoin de cette configuration CocoaPods.

## Enregistrer depuis le plugin natif

Conservez l’export habituel `registerPlugin()` et les méthodes publiques du plugin. Créez et conservez un enregistrement après la création du moteur de rendu natif. L’Engine fournit son runtime Web avec la bibliothèque Swift/Android, le démarre dans le document courant et les suivants, trouve le DOM de repli existant et s’abonne aux notifications du plugin. Les applications n’appellent pas d’initialiseur JS distinct.

L’intégration a trois responsabilités :

1. Le consommateur fournit un conteneur Web de repli existant, mis en page dans la bonne couche. Passez cette destination de projection dans le paramètre obligatoire `projectionSelector: string` ; il n’existe aucun mode `null` ni de création automatique du DOM.
2. Le plugin enregistre une fois ses vues natives et les noms de notifications sur chaque plateforme.
3. Le plugin émet des notifications après ses mises à jour et libère l’enregistrement lors du nettoyage.

### iOS : ajouter l’enregistrement à votre classe `CAPPlugin`

Dans `ios/Sources/ExamplePlugin/ExamplePlugin.swift`, conservez l’enregistrement dans une propriété et initialisez-le dans `load()`, **après que votre moteur de rendu existant a créé et attaché sa vue**.

Dans ce diff, `nativeView` est la `UIView` déjà détenue par votre plugin ; son code de rendu existant est représenté par des commentaires.

Utilisez le **`jsName`** existant, et non `identifier` : Capacitor utilise `jsName` pour les appels JS au plugin et les abonnements aux événements. Ne répétez pas le nom du plugin dans la configuration Engine.

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

Passez directement `bridge?.webView`. Si la WebView est indisponible, l’Engine lève une erreur d’initialisation capturée par le même `catch` ; aucun contrôle séparé ni déballage forcé n’est nécessaire.

Si la vue est créée plus tard dans une méthode existante `initialize` / `show`, placez-y l’enregistrement après la création de la vue plutôt que dans `load()`. Conservez un seul enregistrement pendant la durée de vie de ce moteur de rendu ; n’en créez pas un nouveau à chaque mise à jour. Lors du remplacement d’un moteur de rendu, détruisez son ancien enregistrement avant d’enregistrer le nouveau.

### Android : ajouter l’enregistrement à votre classe `Plugin`

Effectuez les modifications correspondantes dans `android/src/main/java/<your-package>/ExamplePlugin.kt`. **`pluginHandle.id`** est le nom du plugin enregistré dans Capacitor, issu de `@CapacitorPlugin` ; aucune seconde chaîne de nom n’est nécessaire.

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

Sur Android, appelez `NativeUIProjection.install(bridge.webView)` dans `load()` du plugin, avant la première navigation, même si les vues SDK arrivent plus tard. Placez installation et enregistrement dans le même périmètre de gestion des erreurs ; en cas d’échec, conservez le repli Web existant et ne réessayez pas l’installation après navigation. Les enregistrements partagent ensuite ce canal limité au cadre principal et aux origines autorisées ; ils n’installent pas de nouveaux écouteurs de messages dans une WebView déjà chargée. Cela évite un plantage natif WebView reproduit lors de l’enregistrement d’une vue AdMob chargée de façon asynchrone. Le constructeur d’enregistrement ne peut installer le canal que sur une WebView n’ayant pas encore navigué ; une installation tardive échoue avec une erreur exploitable au lieu de tenter une injection dangereuse. Tous les enregistrements d’une même WebView doivent utiliser les mêmes origines autorisées. Fermer un enregistrement ne retire que son propriétaire du canal, laissant les autres emplacements fonctionner. Le canal partagé reste installé pendant toute la vie de la WebView ; les enregistrements doivent néanmoins être conservés et fermés par leur plugin consommateur.

Les deux diffs ajoutent une propriété privée, un enregistrement natif, une surcharge de notification, une notification de mise à jour et un nettoyage. Ils n’ajoutent aucune méthode Engine à `pluginMethods`, aucun wrapper JS public ni initialiseur Engine côté application.

Conservez l’export `registerPlugin()` existant du plugin. Utilisez les mêmes noms d’événements dans l’enregistrement et `notifyListeners` ; si le plugin émet déjà un événement adapté (tel que `tabSelected`), déclarez cet événement au lieu de l’émettre deux fois.

### Notifications pendant le démarrage

La surcharge de notification ci-dessus permet à l’Engine de conserver la dernière destination de projection correspondante avant l’abonnement du runtime Web. Aucune variable d’état ni callback d’état initial distinct n’est nécessaire. Transmettez chaque notification à `super` comme d’habitude : l’Engine enregistre l’état sans rejouer notifications, mises à jour ou actions utilisateur. Sans notification de destination, il déduit la destination initiale de la visibilité de la vue native. L’enregistrement doit exister avant les notifications qu’il doit observer.

Si votre plugin possède plusieurs enregistrements, transmettez la notification à chacun ; `receiveListeners.match` sélectionne la surface concernée. Les mises à jour d’apparence ne changent pas la destination. Avant connexion, le moteur de rendu reste responsable du placement et de la visibilité natifs.

Avec le repli Web par défaut, défiler sans image préparée ni liaison de défilement native laisse le repli Web visible jusqu’à ce que le moteur de rendu confirme le placement natif courant par sa notification de destination native. Une mise à jour d’apparence seule ne constitue pas cette confirmation. Les consommateurs choisissant une récupération native après échec doivent maintenir à jour leur propre géométrie native.

### Quels événements émettre

Toutes les déclarations d’événements entrants appartiennent à `receiveListeners`. Sa liste `update` actualise l’image, ses listes `projection` sélectionnent la destination et son filtre facultatif `match` sélectionne les notifications de la surface concernée.

| Notification | Où l’émettre dans le plugin existant |
| --- | --- |
| `appearanceChanged` (événement `update`) | Après une mise à jour réussie de l’apparence native, par exemple `setColors` |
| `transitionStarted` (`web`) | Avant le déplacement du DOM de repli ou avant qu’une couche Web recouvre la vue native |
| `shown` (`native`) | Après l’opération d’affichage existante du plugin, ou au retour de la projection Web |
| `hidden` (`none`) | Après l’opération de masquage existante du plugin |

Les noms des exemples sont des conventions de votre choix, pas des méthodes réservées de l’Engine. Un événement `update` actualise l’image préparée sans changer la destination demandée. Il ne rappelle pas `setColors`.

Émettez `transitionStarted` avant le déplacement du DOM, `shown` lorsqu’une projection native est à nouveau demandée et `hidden` après l’opération de masquage du plugin. Capture native, conversion d’URL, préparation d’image, confirmation de dessin, retrait d’image et nettoyage des écouteurs restent internes à l’Engine. Celui-ci n’appelle jamais les méthodes `show`, `hide`, de sélection ou de chargement publicitaire du plugin. Terminez l’enregistrement avec `projection.destroy()` sur iOS ou `projection.close()` sur Android à la destruction du moteur de rendu. Conservez l’enregistrement pendant toute sa durée de vie et appelez les API natives sur le thread UI.

## DOM, défilement et superpositions

Fournissez pour chaque enregistrement un conteneur DOM mis en page dans la couche destinée à sa projection Web. Il peut être inséré après l’enregistrement. Le plugin reste responsable du placement et du dimensionnement de la vue native ; l’Engine ne crée ni ne dimensionne aucune des deux vues à votre place.

Lisez les [exigences DOM et surfaces natives](projection.md#dom-and-native-surface-requirements) avant d’intégrer des éléments personnalisés, du contenu SDK ou plusieurs surfaces. Le suivi du défilement et le transfert d’image sont internes à l’enregistrement. Pour les applications Ionic, activez éventuellement la [prise en charge des superpositions Ionic](projection.md#ionic-overlay-support-optional) une seule fois au démarrage. Les autres frameworks émettent les notifications de projection configurées depuis leur propre cycle de vie de transitions et de superpositions.

## Contrôles natifs animés

Lors d’une mise à jour de l’apparence native, les images de remplacement sont préparées par défaut après un délai de debounce de 50 ms.
Si votre contrôle continue de s’animer après sa notification de mise à jour, définissez `captureDelayMs` lors de l’enregistrement natif (Swift : `captureDelayMs: 600` ; Kotlin : `captureDelayMs = 600`).
Ce réglage modifie la préparation des images en arrière-plan, et non le moment où l’overlay est présenté.
Consultez le [délai de capture](projection.md#capture-timing) pour comprendre le comportement du cache et les recommandations issues des mesures.
