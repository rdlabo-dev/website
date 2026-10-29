---
title: "Integration in ein Cordova-Plugin"
sourceRevision: "c19dcb524732763438ff82a606cb2fe937763878fbcdf135f27d3818980e22eb"
---
# Integration in ein Cordova-Plugin

Dasselbe npm-Paket, dieselbe Swift-Bibliothek und dasselbe Android-AAR unterstützen Capacitor und Cordova. Die Engine ist eine Bibliothek für Plugin-Maintainer, kein separat registriertes Cordova-Plugin. Eine Cordova-Anwendung benötigt weder `@capacitor/core` noch ein natives Capacitor-SDK.

Das konsumierende Plugin bleibt für seine native Ansicht und das zugehörige DOM einschließlich Platzierung, Größe und Stapelreihenfolge verantwortlich. Geben Sie einen vorhandenen Selektor wie `native-ad` oder `#player` an. Das DOM darf nach der Initialisierung ergänzt werden. Bildvorbereitung, Scrollbehandlung, Overlays und Wiederherstellung verwenden die gemeinsame Engine-Implementierung.

Informationen zu erforderlichen Eingaben und Zuständigkeiten finden Sie unter [native Initialisierung](initialization.md). Die folgenden Plattformbeispiele ergänzen Cordova-spezifischen Start, Benachrichtigungsweiterleitung und Abbau. Setzen Sie `runtime` auf Cordova, auch wenn es im Konstruktor optional ist.

Bei einem Cordova-Plugin, das eine native Anzeige in einem Feed darstellt, besitzt die Anwendung bereits einen DOM-Platz und das Plugin die SDK-Interaktion. Dieser Weg verbindet den Platz mit der Projektion, ohne eine Capacitor-Abhängigkeit hinzuzufügen oder die Klickbehandlung des SDKs zu ersetzen; die Aufnahme muss für den geladenen Inhalt weiterhin erlaubt sein.

## Voraussetzungen

Die Integration ist mit cordova-ios 8.1.1 und cordova-android 15.1.0 sowie deren Standard-WebViews verifiziert. Die Engine selbst benötigt iOS 15+ und Android API 23+; Cordova-Host oder SDK können eine höhere Mindestversion verlangen. Zusammengesetzte Android-Aufnahmen benötigen API 26+.

## Das Web-Ziel auswählen

Stellen Sie einen Container mit Layout wie `native-ad` oder `#player` in der Ebene bereit, in der das projizierte Erscheinungsbild liegen soll. Er kann nach der Registrierung eingefügt werden, muss aber beim Start der Projektion existieren. Das Rechteck der nativen Ansicht kann ihren vorgesehenen Platz im DOM-Stapelbaum nicht bestimmen. Prüfen Sie die [Tabelle unterstützter Container](../reference/containers.md), bevor Sie den Selektor wählen. Ergänzen Sie bei Ionic-Anwendungen einmalig die [Overlay-Unterstützung](../configuration/ionic-overlays.md); andere Frameworks melden ihren eigenen Übergangslebenszyklus durch Benachrichtigungen.

## Abhängigkeiten

Ersetzen Sie `<engine-version>` in jeder folgenden Abhängigkeit durch dieselbe veröffentlichte Version. Lesen Sie die Dokumentation dieses Release-Tags, damit die Beispiele zu dessen APIs passen.

Verwenden Sie dasselbe Engine-Release für das Web-Paket und die nativen Bibliotheken. Die API liegt vor Version 1.0; schreiben Sie Versionen fest und behalten Sie Abhängigkeits-Lockfiles.

```sh
npm install --save-exact '@webview-native-ui/engine@<engine-version>'
```

Deklarieren Sie auch die nativen Abhängigkeiten im konsumierenden Plugin. Eine npm-Installation allein bindet keine der nativen Bibliotheken ein.

Für Swift Package Manager:

```swift
.package(url: "https://github.com/webview-native-ui/engine.git", exact: "<engine-version>")
// In den Abhängigkeiten des Plugin-Targets:
.product(name: "WebViewNativeUIEngine", package: "engine")
```

Für die Android-Gradle-Konfiguration des Plugins:

```groovy
dependencies {
    implementation 'io.github.webview-native-ui:engine:<engine-version>'
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

Fügen Sie diese Einträge in die bestehenden Plattformabschnitte ein, statt doppelte Abschnitte anzulegen. Die [Integrations-Fixture](https://github.com/webview-native-ui/engine/tree/v0.0.8/tests/cordova/plugin) enthält die vollständige Verknüpfung von plugin.xml, SwiftPM und Gradle.

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

Verwenden Sie `projection?.receive(eventName, data)` wie unter iOS an der bestehenden Benachrichtigungsstelle. Der gemeinsame [Benachrichtigungsvertrag](../configuration/events.md) beschreibt die Semantik von Aktualisierungen und Zielen. Erstellung und Positionierung nativer Ansichten bleiben im UI-Thread. Lädt der Renderer asynchron, belassen Sie `install(web)` in `pluginInitialize()` und erzeugen Sie die Registrierung, sobald die Ansicht bereitsteht. Schließen Sie die alte Registrierung, bevor Sie diesen Renderer ersetzen.

Der `PathHandler` delegiert Bildanfragen desselben Origins an die Engine. Er liefert nur die PNG-Dateien der Registrierung im app-privaten Cache; andere Pfade ergeben `null`. Besitzt das Plugin bereits einen Handler, kombinieren Sie beide mit `projection?.handleResource(path) ?: existingHandler.handle(path)`. Delegieren Sie bei mehreren Registrierungen an den passenden Besitzer. Behalten Sie den Handler über die WebView-Lebensdauer. Weder Austausch des WebViewClient noch Speicherberechtigung ist nötig.

Die Standardwerte unterstützen Cordovas `https://localhost` und `http://localhost`. Ändert sich der Hostname, übergeben Sie dieselbe explizite Origin-Menge an `install` und jede Registrierung. Wildcard-Origins und `file://`-App-Origins werden von dieser Integration nicht unterstützt.

## Lebensdauer und Verifizierung

Behalten Sie die Registrierung über die WebView-Lebensdauer. Die Engine verbindet sich nach einem Neuladen des Dokuments erneut und löscht den Bildzustand des alten Dokuments. Zerstört das Plugin seine native Oberfläche in `onReset`, aktualisieren Sie dessen View-Provider und senden Sie das passende Ziel; lassen Sie keine Registrierung auf eine zerstörte Ansicht zeigen. Geben Sie Registrierungen bei Zerstörung des Plugins beziehungsweise der WebView frei.

Die Cordova-Integration benötigt den standardmäßigen Cordova-WebView-Ressourcenhandler. Die Ausführung eines Cordova-Plugins in einer Capacitor-App wird von dieser Integration nicht abgedeckt; der Host muss stattdessen die Capacitor-Integration verwenden. Die gemeinsamen [DOM- und nativen Oberflächenanforderungen](../reference/projection.md#dom-and-native-surface-requirements) beschreiben Selektor-, Layout- und Aufnahmeregeln. Die [Ionic-Overlay-Unterstützung](../configuration/ionic-overlays.md) bleibt optional; reine Cordova-Apps müssen sie nicht aktivieren.

Das Integrations-Fixture verwendet Cordova CLI 13, cordova-ios 8.1.1 und cordova-android 15.1.0 mit ihren Standard-WebViews. Es prüft echte PNG-Übergabe, native Wiederherstellung und Beibehaltung des ausgeblendeten Zustands beim Neuladen des Dokuments, nicht nur JS-Bridge-Mocks. Ältere Cordova-Releases und eigene WebView-Engines benötigen separate Verifizierung.

Führen Sie die echten Verbraucherprüfungen mit einem bereits gestarteten Simulator/Emulator aus:

```sh
npm run test:cordova -- ios SIMULATOR_UDID
npm run test:cordova -- android emulator-5554
```

Das Skript erstellt eine temporäre App, verwendet lokale SwiftPM-/Maven-Artefakte der Engine und speichert das Anwendungsergebnis im ausgegebenen temporären Verzeichnis. Es veröffentlicht niemals auf npm oder Maven. Android benötigt JDK 21+, SDK 36 und `ANDROID_HOME`; iOS benötigt Xcode.

## Weiter: Optionales Verhalten auswählen

Verwenden Sie den [Konfigurationsleitfaden](../configuration/README.md) für Benachrichtigungszuordnung, Wertübertragung, Aufnahmezeitpunkt und Fallback-Strategie. Diese gemeinsamen Einstellungen sind keine zusätzliche Plattformeinrichtung. Für einen Renderer, der bereits Steuerelemente bündelt, siehe [erweiterte APIs](../advanced/README.md).
