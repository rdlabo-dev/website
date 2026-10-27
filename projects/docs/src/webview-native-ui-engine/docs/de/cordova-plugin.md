---
title: "Integration in ein Cordova-Plugin"
sourceRevision: "b9c7dbc4c2b9f20415a214817f7c002e4cd9de3db914149ed6bd3ed59f7a00c9"
---
# Integration in ein Cordova-Plugin

Dasselbe npm-Paket, dieselbe Swift-Bibliothek und dasselbe Android-AAR unterstützen Capacitor und Cordova. Die Engine ist eine Bibliothek für Plugin-Maintainer, kein separat registriertes Cordova-Plugin. Eine Cordova-Anwendung benötigt weder `@capacitor/core` noch ein natives Capacitor-SDK.

Das konsumierende Plugin bleibt für seine native Ansicht und das zugehörige DOM einschließlich Platzierung, Größe und Stapelreihenfolge verantwortlich. Geben Sie einen vorhandenen Selektor wie `native-ad` oder `#player` an. Das DOM darf nach der Initialisierung ergänzt werden. Bildvorbereitung, Scrollbehandlung, Overlays und Wiederherstellung verwenden die gemeinsame Engine-Implementierung.

## Voraussetzungen

Die Integration ist mit cordova-ios 8.1.1 und cordova-android 15.1.0 sowie deren Standard-WebViews verifiziert. Die Engine selbst benötigt iOS 15+ und Android API 23+; Cordova-Host oder SDK können eine höhere Mindestversion verlangen. Zusammengesetzte Android-Aufnahmen benötigen API 26+.

## Abhängigkeiten

Verwenden Sie dasselbe Engine-Release für das Web-Paket und die nativen Bibliotheken. Die API liegt vor Version 1.0; schreiben Sie Versionen fest und behalten Sie Abhängigkeits-Lockfiles.

```sh
npm install --save-exact @webview-native-ui/engine@0.0.1
```

Deklarieren Sie auch die nativen Abhängigkeiten im konsumierenden Plugin. Eine npm-Installation allein bindet keine der nativen Bibliotheken ein.

Für Swift Package Manager:

```swift
.package(url: "https://github.com/webview-native-ui/engine.git", exact: "0.0.1")
// In den Abhängigkeiten des Plugin-Ziels:
.product(name: "WebViewNativeUIEngine", package: "engine")
```

Für die Android-Gradle-Konfiguration des Plugins:

```groovy
dependencies {
    implementation 'io.github.webview-native-ui:engine:0.0.1'
}
```

Behalten Sie `google()` und `mavenCentral()` in den Abhängigkeitsrepositorys des konsumierenden Builds.

## iOS

Deklarieren Sie in einem Cordova-SwiftPM-Plugin Cordova und Engine als Abhängigkeiten des Plugin-Ziels; keines der Frameworks wird dadurch zur Abhängigkeit des Engine-Ziels. Behalten Sie die vorhandenen SwiftPM-Produkt- und Quelldateideklarationen des Plugins.

Registrieren Sie das Plugin im iOS-Plattformabschnitt von `plugin.xml` für den Start, wenn sein Renderer vor dem ersten Anwendungsaufruf erscheinen soll:

```xml
<platform name="ios" package="swift">
    <config-file target="config.xml" parent="/*">
        <feature name="ExamplePlugin">
            <param name="ios-package" value="ExamplePlugin" />
            <param name="onload" value="true" />
        </feature>
    </config-file>
    <!-- Vorhandene Quelldateideklarationen des Plugins beibehalten. -->
</platform>
```

Integrieren Sie diese Einträge in die vorhandenen Plattformabschnitte, statt doppelte Abschnitte anzulegen. Das [Integrations-Fixture](https://github.com/webview-native-ui/engine/tree/v0.0.1/tests/cordova/plugin) enthält die vollständige plugin.xml-, SwiftPM- und Gradle-Verdrahtung.

Die Beispiele erweitern einen bestehenden Renderer: `nativeView` ist seine angehängte, positionierte Ansicht, keine von der Engine erzeugte Ansicht.

```swift
import Cordova
import WebKit
import WebViewNativeUIEngine

@objc(ExamplePlugin)
class ExamplePlugin: CDVPlugin {
    private var projection: NativeUIProjection?
    private var nativeView: UIView?

    override func pluginInitialize() {
        // Der vorhandene Renderer erstellt, verbindet und positioniert hier nativeView.
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
            // Vorhandenen Web-Fallback bei nicht verfügbarer Registrierung beibehalten.
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

Lädt der iOS-Renderer später, erstellen Sie die Registrierung nach dem Anhängen seiner Ansicht und zerstören Sie die alte Registrierung vor dem Ersetzen des Renderers.

Leiten Sie die vorhandenen Darstellungs-/Inhaltsbenachrichtigungen des Plugins mit `projection?.receive("shown")`, `receive("hidden")` oder `receive("contentChanged")` weiter. Platzieren Sie dies neben der vorhandenen Callback-/Ereigniszustellung oder in der gemeinsamen Benachrichtigungsmethode des Plugins. `receive` aktualisiert nur die Engine-Sitzung und liefert keinen zweiten Anwendungscallback. Ein vor dem JS-Start gesendetes passendes Ziel bleibt für die Erstverbindung gespeichert.

Cordova iOS stellt die vorbereiteten PNGs über das integrierte `WkWebView.convertFilePath` bereit. Die Engine löst dies intern auf. Weder Datei-Plugin noch zusätzliche Berechtigung oder ein vom Autor bereitgestellter URL-Konverter ist erforderlich. Die standardmäßig erlaubten Origins enthalten `app://localhost`; übergeben Sie den tatsächlichen vertrauenswürdigen Origin, wenn die App Schema oder Hostname ändert.

## Android

Deklarieren Sie die Maven-Abhängigkeit in der vorhandenen Gradle-Konfiguration des Cordova-Plugins. Deklarieren Sie außerdem `implementation 'androidx.webkit:webkit:1.14.0'`, wenn Sie die Signatur `CordovaPluginPathHandler` verwenden; Cordovas interne WebKit-Abhängigkeit ist nicht auf dem Compile-Classpath des Plugins verfügbar. Ergänzen Sie im Android-Plattformabschnitt von `plugin.xml` diese Registrierung, damit die Initialisierung vor der ersten WebView-Navigation erfolgt:

```xml
<platform name="android">
    <config-file target="res/xml/config.xml" parent="/*">
        <feature name="ExamplePlugin">
            <param name="android-package" value="com.example.ExamplePlugin" />
            <param name="onload" value="true" />
        </feature>
    </config-file>
    <!-- Vorhandene Quelldatei- und Gradle-Framework-Deklarationen beibehalten. -->
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

Verwenden Sie wie unter iOS `projection?.receive(eventName, data)` am vorhandenen Benachrichtigungspunkt. Native Ansichtserstellung und Platzierung bleiben auf dem UI-Thread. Lädt der Renderer asynchron, behalten Sie `install(web)` in `pluginInitialize()` und erstellen Sie die Registrierung, sobald die Ansicht bereit ist. Schließen Sie die alte Registrierung vor dem Ersetzen dieses Renderers.

Der `PathHandler` delegiert Bildanfragen desselben Origins an die Engine. Er liefert nur die PNG-Dateien der Registrierung im app-privaten Cache; andere Pfade ergeben `null`. Besitzt das Plugin bereits einen Handler, kombinieren Sie beide mit `projection?.handleResource(path) ?: existingHandler.handle(path)`. Delegieren Sie bei mehreren Registrierungen an den passenden Besitzer. Behalten Sie den Handler über die WebView-Lebensdauer. Weder Austausch des WebViewClient noch Speicherberechtigung ist nötig.

Die Standardwerte unterstützen Cordovas `https://localhost` und `http://localhost`. Ändert sich der Hostname, übergeben Sie dieselbe explizite Origin-Menge an `install` und jede Registrierung. Wildcard-Origins und `file://`-App-Origins werden von dieser Integration nicht unterstützt.

## Lebensdauer und Verifizierung

Behalten Sie die Registrierung über die WebView-Lebensdauer. Die Engine verbindet sich nach einem Neuladen des Dokuments erneut und löscht den Bildzustand des alten Dokuments. Zerstört das Plugin seine native Oberfläche in `onReset`, aktualisieren Sie dessen View-Provider und senden Sie das passende Ziel; lassen Sie keine Registrierung auf eine zerstörte Ansicht zeigen. Geben Sie Registrierungen bei Zerstörung des Plugins beziehungsweise der WebView frei.

Capacitor-Registrierungen behalten ihren vorhandenen Standard. Die Cordova-Integration benötigt Cordovas standardmäßigen WebView-Ressourcenhandler. Das Ausführen eines Cordova-Plugins in einer Capacitor-App ist nicht abgedeckt; der Host muss stattdessen die Capacitor-Integration verwenden. Selektor-, Layout- und Aufnahmeregeln stehen in den gemeinsamen [DOM- und nativen Flächenanforderungen](projection.md#dom-and-native-surface-requirements). Die [Ionic-Overlay-Unterstützung](projection.md#ionic-overlay-support-optional) bleibt optional; reine Cordova-Apps müssen sie nicht aktivieren.

Das Integrations-Fixture verwendet Cordova CLI 13, cordova-ios 8.1.1 und cordova-android 15.1.0 mit ihren Standard-WebViews. Es prüft echte PNG-Übergabe, native Wiederherstellung und Beibehaltung des ausgeblendeten Zustands beim Neuladen des Dokuments, nicht nur JS-Bridge-Mocks. Ältere Cordova-Releases und eigene WebView-Engines benötigen separate Verifizierung.

Führen Sie die echten Verbraucherprüfungen mit einem bereits gestarteten Simulator/Emulator aus:

```sh
npm run test:cordova -- ios SIMULATOR_UDID
npm run test:cordova -- android emulator-5554
```

Das Skript erstellt eine temporäre App, verwendet lokale SwiftPM-/Maven-Artefakte der Engine und speichert das Anwendungsergebnis im ausgegebenen temporären Verzeichnis. Es veröffentlicht niemals auf npm oder Maven. Android benötigt JDK 21+, SDK 36 und `ANDROID_HOME`; iOS benötigt Xcode.

## Animierte native Steuerelemente

Nach Aktualisierungen des nativen Erscheinungsbilds werden Ersatzbilder standardmäßig nach einer Debounce-Verzögerung von 50 ms vorbereitet.
Wenn die Animation Ihres Steuerelements nach der Aktualisierungsbenachrichtigung weiterläuft, setzen Sie `captureDelayMs` bei der nativen Registrierung (Swift: `captureDelayMs: 600`; Kotlin: `captureDelayMs = 600`).
Diese Einstellung ändert die Bildvorbereitung im Hintergrund, nicht den Zeitpunkt der Overlay-Anzeige.
Weitere Informationen zum Cache-Verhalten und zu den auf Messungen beruhenden Empfehlungen finden Sie unter [Aufnahmezeitpunkt](projection.md#capture-timing).
