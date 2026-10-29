---
title: "Intégration dans un plugin Cordova"
sourceRevision: "c19dcb524732763438ff82a606cb2fe937763878fbcdf135f27d3818980e22eb"
---
# Intégration dans un plugin Cordova

Le même paquet npm, la même bibliothèque Swift et le même AAR Android prennent en charge Capacitor et Cordova. L’Engine est une bibliothèque utilisée par les mainteneurs de plugins, pas un plugin Cordova enregistré séparément. Une application Cordova n’a besoin ni de `@capacitor/core` ni d’un SDK natif Capacitor.

Le plugin consommateur possède toujours sa vue native et le DOM correspondant, y compris leur placement, leur taille et leur ordre d’empilement. Fournissez un sélecteur existant tel que `native-ad` ou `#player`. Le DOM peut être ajouté après l’initialisation. La préparation des images, la gestion du défilement, les superpositions et la restauration utilisent l’implémentation commune de l’Engine.

Consultez l’[initialisation native](initialization.md) pour les paramètres obligatoires et la propriété des ressources. Les exemples de plateforme ci-dessous ajoutent le démarrage, la transmission des notifications et le démontage propres à Cordova. Définissez `runtime` sur Cordova même si ce paramètre est facultatif dans le constructeur.

Pour un plugin Cordova affichant une publicité native dans un flux, l’application possède déjà un emplacement DOM et le plugin gère les interactions SDK. Cette approche relie cet emplacement à la projection sans ajouter de dépendance Capacitor ni remplacer la gestion des clics du SDK ; la capture doit toujours être autorisée pour le contenu chargé.

## Prérequis

L’intégration est vérifiée avec cordova-ios 8.1.1 et cordova-android 15.1.0 et leurs WebViews standard. L’Engine lui-même nécessite iOS 15+ et Android API 23+ ; l’hôte Cordova ou le SDK peut exiger un minimum supérieur. La capture composite Android nécessite l’API 26+.

## Choisir la destination Web

Fournissez un conteneur mis en page tel que `native-ad` ou `#player` dans la couche où l’apparence projetée doit se trouver. Il peut être inséré après l’enregistrement, mais doit exister lorsque la projection commence. Le rectangle de la vue native ne peut pas identifier sa place souhaitée dans l’arbre d’empilement du DOM. Consultez le [tableau des conteneurs pris en charge](../reference/containers.md) avant de choisir le sélecteur. Pour les applications Ionic, ajoutez une fois la [prise en charge des superpositions](../configuration/ionic-overlays.md) ; les autres frameworks signalent leur propre cycle de vie de transition via des notifications.

## Dépendances

Remplacez `<engine-version>` dans chaque dépendance ci-dessous par la même version publiée. Lisez la documentation du tag de cette version pour que les exemples correspondent à ses API.

Utilisez la même version de l’Engine pour le paquet Web et les bibliothèques natives. L’API est en version pré-1.0 ; épinglez les versions et conservez les fichiers de verrouillage des dépendances.

```sh
npm install --save-exact '@webview-native-ui/engine@<engine-version>'
```

Déclarez aussi les dépendances natives dans le plugin consommateur. L’installation npm seule ne lie aucune des bibliothèques natives.

Pour Swift Package Manager :

```swift
.package(url: "https://github.com/webview-native-ui/engine.git", exact: "<engine-version>")
// Dans les dépendances de la cible du plugin :
.product(name: "WebViewNativeUIEngine", package: "engine")
```

Pour la configuration Gradle Android du plugin :

```groovy
dependencies {
    implementation 'io.github.webview-native-ui:engine:<engine-version>'
}
```

Conservez `google()` et `mavenCentral()` dans les dépôts de dépendances du build consommateur.

## iOS

Dans un plugin Cordova SwiftPM, déclarez Cordova et l’Engine comme dépendances de la cible du plugin ; aucun de ces frameworks ne devient une dépendance de la cible Engine. Conservez les déclarations existantes de produit SwiftPM et de fichiers source du plugin.

Dans la section de plateforme iOS de `plugin.xml`, enregistrez le plugin pour le démarrage si son moteur de rendu doit apparaître avant le premier appel applicatif :

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

Fusionnez ces entrées dans les sections de plateforme existantes au lieu d’ajouter des sections en double. La [fixture d’intégration](https://github.com/webview-native-ui/engine/tree/v0.0.8/tests/cordova/plugin) inclut le raccordement complet de plugin.xml, SwiftPM et Gradle.

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
            // Conservez le repli Web existant lorsque l’enregistrement est indisponible.
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

Transmettez les notifications de présentation et de contenu existantes du plugin avec `projection?.receive("shown")`, `receive("hidden")` ou `receive("contentChanged")`. Placez cet appel à côté de la livraison existante du callback ou de l’événement, ou dans la méthode de notification partagée du plugin. `receive` met uniquement à jour la session Engine : il ne livre pas de second callback applicatif. Une destination correspondante émise avant le démarrage JS est conservée pour la connexion initiale.

Le `WkWebView.convertFilePath` intégré à Cordova iOS sert les PNG préparés. L’Engine le résout en interne. Aucun plugin de fichiers, autorisation supplémentaire ou convertisseur d’URL fourni par l’auteur n’est requis. Les origines autorisées par défaut incluent `app://localhost` ; passez l’origine de confiance réelle si l’application change de schéma ou de nom d’hôte.

## Android

Déclarez la dépendance Maven dans la configuration Gradle existante du plugin Cordova. Déclarez aussi `implementation 'androidx.webkit:webkit:1.14.0'` si vous utilisez la signature `CordovaPluginPathHandler` ; la dépendance WebKit interne de Cordova n’est pas exposée dans le classpath de compilation du plugin. Dans la section de plateforme Android du `plugin.xml` du plugin, fusionnez cet enregistrement pour que l’initialisation s’exécute avant la première navigation de la WebView :

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

Utilisez `projection?.receive(eventName, data)` au point de notification existant, comme sur iOS. Consultez le [contrat commun des notifications](../configuration/events.md) pour la sémantique des mises à jour et des destinations. La création et le placement des vues natives restent sur le thread UI. Si le moteur de rendu se charge de façon asynchrone, conservez `install(web)` dans `pluginInitialize()` et créez l’enregistrement une fois la vue prête. Fermez l’ancien enregistrement avant de remplacer ce moteur de rendu.

Le `PathHandler` délègue les demandes d’images de même origine à l’Engine. Il sert uniquement les fichiers PNG de l’enregistrement dans le cache privé de l’application ; les chemins sans rapport renvoient `null`. Si le plugin possède déjà un gestionnaire, combinez-les avec `projection?.handleResource(path) ?: existingHandler.handle(path)`. Pour plusieurs enregistrements, déléguez au propriétaire correspondant. Gardez le gestionnaire installé pendant la durée de vie de la WebView. Aucun remplacement de WebViewClient ni aucune autorisation de stockage n’est nécessaire.

Les valeurs par défaut prennent en charge `https://localhost` et `http://localhost` de Cordova. Si le nom d’hôte change, passez le même ensemble explicite d’origines à `install` et à chaque enregistrement. Les origines avec caractères génériques et les origines applicatives `file://` ne sont pas prises en charge par cette intégration.

## Durée de vie et vérification

Conservez l’enregistrement pendant la durée de vie de la WebView. L’Engine se reconnecte après un rechargement de document et efface l’état des images de l’ancien document. Si le plugin détruit son interface native dans `onReset`, actualisez son fournisseur de vue et émettez la destination appropriée ; ne laissez pas un enregistrement pointant vers une vue détruite. Libérez les enregistrements lors de la destruction du plugin ou de la WebView.

L’intégration Cordova nécessite le gestionnaire standard de ressources WebView de Cordova. Exécuter un plugin Cordova dans une application Capacitor n’est pas couvert par cette intégration ; l’hôte doit utiliser l’intégration Capacitor à la place. Consultez les [exigences communes du DOM et de la surface native](../reference/projection.md#dom-and-native-surface-requirements) pour les règles de sélecteur, de mise en page et de capture. La [prise en charge des superpositions Ionic](../configuration/ionic-overlays.md) reste facultative ; les applications Cordova ordinaires n’ont pas à l’activer.

La fixture d’intégration utilise Cordova CLI 13, cordova-ios 8.1.1 et cordova-android 15.1.0 avec leurs WebViews standard. Elle vérifie un véritable transfert PNG, la restauration native et la conservation de l’état masqué après rechargement du document, pas seulement des mocks du pont JS. Les anciennes versions de Cordova et les moteurs WebView personnalisés nécessitent une vérification distincte.

Exécutez les vérifications réelles du consommateur avec un simulateur ou émulateur déjà démarré :

```sh
npm run test:cordova -- ios SIMULATOR_UDID
npm run test:cordova -- android emulator-5554
```

Le script crée une application jetable, utilise des artefacts Engine SwiftPM/Maven locaux et enregistre le résultat de l’application dans le répertoire temporaire affiché. Il ne publie jamais sur npm ou Maven. Android nécessite JDK 21+, SDK 36 et `ANDROID_HOME` ; iOS nécessite Xcode.

## Ensuite : choisir les comportements facultatifs

Utilisez le [guide de configuration](../configuration/README.md) pour le routage des notifications, la réflexion des valeurs, le timing de capture et la politique de repli. Ces paramètres communs ne constituent pas une configuration de plateforme supplémentaire. Pour un moteur de rendu qui regroupe déjà les contrôles, consultez les [API avancées](../advanced/README.md).
