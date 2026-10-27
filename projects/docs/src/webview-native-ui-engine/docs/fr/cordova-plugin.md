---
title: "Intégration dans un plugin Cordova"
sourceRevision: "b9c7dbc4c2b9f20415a214817f7c002e4cd9de3db914149ed6bd3ed59f7a00c9"
---
# Intégration dans un plugin Cordova

Le même package npm, la même bibliothèque Swift et le même AAR Android prennent en charge Capacitor et Cordova. L’Engine est une bibliothèque destinée aux mainteneurs de plugins, pas un plugin Cordova enregistré séparément. Une application Cordova n’a besoin ni de `@capacitor/core` ni d’un SDK natif Capacitor.

Le plugin consommateur reste responsable de sa vue native et du DOM correspondant, y compris du placement, de la taille et de l’ordre d’empilement. Fournissez un sélecteur existant tel que `native-ad` ou `#player`. Le DOM peut être ajouté après l’initialisation. Préparation d’image, défilement, superpositions et restauration utilisent l’implémentation Engine commune.

## Prérequis

L’intégration est vérifiée avec cordova-ios 8.1.1 et cordova-android 15.1.0 utilisant leurs WebViews standard. L’Engine lui-même nécessite iOS 15+ et Android API 23+ ; l’hôte Cordova ou le SDK peut imposer un minimum supérieur. La capture composite Android nécessite l’API 26+.

## Dépendances

Utilisez la même version Engine pour le package Web et les bibliothèques natives. L’API est antérieure à 1.0 ; épinglez les versions et conservez les fichiers de verrouillage des dépendances.

```sh
npm install --save-exact @webview-native-ui/engine@0.0.1
```

Déclarez aussi les dépendances natives dans le plugin consommateur. L’installation npm seule ne lie aucune des deux bibliothèques natives.

Pour Swift Package Manager :

```swift
.package(url: "https://github.com/webview-native-ui/engine.git", exact: "0.0.1")
// Dans les dépendances de la cible du plugin :
.product(name: "WebViewNativeUIEngine", package: "engine")
```

Pour la configuration Gradle Android du plugin :

```groovy
dependencies {
    implementation 'io.github.webview-native-ui:engine:0.0.1'
}
```

Conservez `google()` et `mavenCentral()` dans les dépôts de dépendances de la compilation consommatrice.

## iOS

Dans un plugin Cordova SwiftPM, déclarez Cordova et l’Engine comme dépendances de la cible du plugin ; aucun de ces frameworks ne devient une dépendance de la cible Engine. Conservez les déclarations existantes du produit SwiftPM et des fichiers source du plugin.

Dans la section iOS de `plugin.xml`, enregistrez le plugin au démarrage si son moteur de rendu doit apparaître avant le premier appel applicatif :

```xml
<platform name="ios" package="swift">
    <config-file target="config.xml" parent="/*">
        <feature name="ExamplePlugin">
            <param name="ios-package" value="ExamplePlugin" />
            <param name="onload" value="true" />
        </feature>
    </config-file>
    <!-- Conservez les déclarations de fichiers source existantes du plugin. -->
</platform>
```

Fusionnez ces entrées dans les sections de plateforme existantes au lieu de créer des doublons. La [fixture d’intégration](https://github.com/webview-native-ui/engine/tree/v0.0.1/tests/cordova/plugin) contient la configuration complète de plugin.xml, SwiftPM et Gradle.

Les exemples étendent un moteur de rendu existant : `nativeView` est sa vue attachée et positionnée, pas une vue créée par l’Engine.

```swift
import Cordova
import WebKit
import WebViewNativeUIEngine

@objc(ExamplePlugin)
class ExamplePlugin: CDVPlugin {
    private var projection: NativeUIProjection?
    private var nativeView: UIView?

    override func pluginInitialize() {
        // Le moteur de rendu existant crée, attache et positionne nativeView ici.
        do {
            projection = try NativeUIProjection(
                webView: webView as? WKWebView,
                plugin: "ExamplePlugin",
                projectionSelector: "#player",
                receiveListeners: .init(
                    update: ["contentChanged"],
                    projection: .init(native: ["shown"], web: ["covered"], none: ["hidden"])
                ),
                runtime: .cordova,
                view: { [weak self] in self?.nativeView }
            )
        } catch {
            // Conservez le repli Web existant si l’enregistrement est indisponible.
            NSLog("Native UI projection unavailable: %@", String(describing: error))
        }
    }

    override func dispose() {
        projection?.destroy()
        projection = nil
        super.dispose()
    }
}
```

Si le moteur de rendu iOS se charge plus tard, créez l’enregistrement après l’attachement de sa vue et détruisez l’ancien enregistrement avant de remplacer le moteur de rendu.

Transmettez les notifications existantes de présentation/contenu du plugin avec `projection?.receive("shown")`, `receive("hidden")` ou `receive("contentChanged")`. Placez ces appels à côté de la transmission existante des callbacks/événements, ou dans la méthode de notification partagée du plugin. `receive` ne met à jour que la session Engine : il ne transmet pas un second callback à l’application. Une destination correspondante émise avant le démarrage JS est conservée pour la connexion initiale.

Le `WkWebView.convertFilePath` intégré à Cordova iOS sert les PNG préparés. L’Engine le résout en interne. Aucun plugin de fichiers, aucune permission supplémentaire ni convertisseur d’URL fourni par l’auteur n’est requis. Les origines autorisées par défaut incluent `app://localhost` ; passez l’origine de confiance réelle si l’application change de schéma ou de nom d’hôte.

## Android

Déclarez la dépendance Maven dans la configuration Gradle existante du plugin Cordova. Déclarez également `implementation 'androidx.webkit:webkit:1.14.0'` si vous utilisez la signature `CordovaPluginPathHandler` ; la dépendance WebKit interne de Cordova n’est pas exposée sur le classpath de compilation du plugin. Dans la section Android de `plugin.xml`, ajoutez cet enregistrement pour initialiser avant la première navigation WebView :

```xml
<platform name="android">
    <config-file target="res/xml/config.xml" parent="/*">
        <feature name="ExamplePlugin">
            <param name="android-package" value="com.example.ExamplePlugin" />
            <param name="onload" value="true" />
        </feature>
    </config-file>
    <!-- Conservez les déclarations existantes de fichiers source et de frameworks Gradle. -->
</platform>
```

```kotlin
import android.view.View
import android.webkit.WebView
import io.github.webview_native_ui.engine.NativeUIProjection
import org.apache.cordova.CordovaPlugin
import org.apache.cordova.CordovaPluginPathHandler

class ExamplePlugin : CordovaPlugin() {
    private var projection: NativeUIProjection? = null
    private var nativeView: View? = null

    override fun pluginInitialize() {
        val web = webView.view as WebView
        projection = runCatching {
            // One origin-restricted channel per WebView, shared with later registrations.
            NativeUIProjection.install(web)
            // Existing renderer creates, attaches and positions nativeView here.
            NativeUIProjection(
                window = cordova.activity.window,
                webView = web,
                plugin = serviceName,
                projectionSelector = "#player",
                receiveListeners = NativeUIProjection.ReceiveListeners(
                    update = listOf("contentChanged"),
                    projection = NativeUIProjection.ReceiveListeners.Projection(
                        native = listOf("shown"), web = listOf("covered"), none = listOf("hidden")
                    )
                ),
                runtime = NativeUIProjection.Runtime.CORDOVA,
                view = { nativeView }
            )
        }.onFailure {
            android.util.Log.e(javaClass.simpleName, "Native UI projection unavailable", it)
        }.getOrNull()
    }

    override fun getPathHandler() = CordovaPluginPathHandler { path ->
        projection?.handleResource(path)
    }

    override fun onDestroy() {
        projection?.close()
        projection = null
        super.onDestroy()
    }
}
```

Utilisez `projection?.receive(eventName, data)` au point de notification existant, comme sur iOS. La création et le placement des vues natives restent sur le thread UI. Si le moteur de rendu se charge de façon asynchrone, conservez `install(web)` dans `pluginInitialize()` et créez l’enregistrement quand la vue est prête. Fermez l’ancien enregistrement avant de remplacer ce moteur de rendu.

Le `PathHandler` délègue les requêtes d’images de même origine à l’Engine. Il ne sert que les fichiers PNG de l’enregistrement dans le cache privé de l’application ; les chemins sans rapport retournent `null`. Si le plugin possède déjà un gestionnaire, combinez-les avec `projection?.handleResource(path) ?: existingHandler.handle(path)`. Pour plusieurs enregistrements, déléguez au propriétaire correspondant. Conservez le gestionnaire pendant toute la vie de la WebView. Aucun remplacement de WebViewClient ni permission de stockage n’est nécessaire.

Les valeurs par défaut prennent en charge `https://localhost` et `http://localhost` de Cordova. Si le nom d’hôte change, passez le même ensemble explicite d’origines à `install` et à chaque enregistrement. Cette intégration ne prend pas en charge les origines génériques ni les origines applicatives `file://`.

## Durée de vie et vérification

Conservez l’enregistrement pendant toute la vie de la WebView. L’Engine se reconnecte après un rechargement du document et efface l’état des images de l’ancien document. Si le plugin détruit son interface native dans `onReset`, mettez à jour son fournisseur de vue et émettez la destination appropriée ; ne laissez pas un enregistrement pointer vers une vue détruite. Libérez les enregistrements à la destruction du plugin ou de la WebView.

Les enregistrements Capacitor conservent leur valeur par défaut existante. L’intégration Cordova nécessite le gestionnaire de ressources WebView standard de Cordova. Exécuter un plugin Cordova dans une application Capacitor n’est pas couvert ; l’hôte doit utiliser l’intégration Capacitor. Consultez les [exigences DOM et surfaces natives](projection.md#dom-and-native-surface-requirements) communes pour les règles de sélecteur, de disposition et de capture. La [prise en charge des superpositions Ionic](projection.md#ionic-overlay-support-optional) reste facultative ; une application Cordova simple n’a pas besoin de l’activer.

La fixture d’intégration utilise Cordova CLI 13, cordova-ios 8.1.1 et cordova-android 15.1.0 avec leurs WebViews standard. Elle vérifie le véritable transfert des PNG, la restauration native et la conservation de l’état masqué lors du rechargement du document, et non de simples mocks du pont JS. Les anciennes versions Cordova et les moteurs WebView personnalisés nécessitent une vérification distincte.

Exécutez les contrôles du véritable consommateur avec un simulateur/émulateur déjà démarré :

```sh
npm run test:cordova -- ios SIMULATOR_UDID
npm run test:cordova -- android emulator-5554
```

Le script crée une application temporaire, utilise les artefacts Engine SwiftPM/Maven locaux et consigne le résultat applicatif dans le répertoire temporaire affiché. Il ne publie jamais sur npm ou Maven. Android nécessite JDK 21+, SDK 36 et `ANDROID_HOME` ; iOS nécessite Xcode.

## Contrôles natifs animés

Lors d’une mise à jour de l’apparence native, les images de remplacement sont préparées par défaut après un délai de debounce de 50 ms.
Si votre contrôle continue de s’animer après sa notification de mise à jour, définissez `captureDelayMs` lors de l’enregistrement natif (Swift : `captureDelayMs: 600` ; Kotlin : `captureDelayMs = 600`).
Ce réglage modifie la préparation des images en arrière-plan, et non le moment où l’overlay est présenté.
Consultez le [délai de capture](projection.md#capture-timing) pour comprendre le comportement du cache et les recommandations issues des mesures.
