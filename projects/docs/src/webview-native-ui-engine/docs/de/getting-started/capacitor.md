---
title: "Integration in ein Capacitor-Plugin"
sourceRevision: "2dede6099bb18549e5df650943c33a37b1519afe268c4896ab9e6a6caed254ce"
---
# Integration in ein Capacitor-Plugin

Ergänzen Sie Web-Projektion und Wiederherstellung in einem bestehenden Capacitor-Plugin, ohne dessen öffentlichen `registerPlugin()`-Export zu ändern. Das Plugin behält seinen nativen Renderer und seine Anwendungs-API; die Engine koordiniert seine native Ansicht mit einem DOM-Fallback.

Dieser Leitfaden behandelt Abhängigkeiten, Registrierung, Benachrichtigungen und Abbau. Beginnen Sie mit der [nativen Initialisierung](initialization.md) für den minimalen Aufruf, erforderliche Eingaben und Zuständigkeiten; die folgenden Plugin-Diffs ergänzen Ereignisverknüpfung und Lebenszyklusverwaltung. Die [Projektionsreferenz](../reference/projection.md) enthält genaue Verträge und Plattformgrenzen.

Bei einem Capacitor-Plugin für eine Tab-Leiste sollte die Anwendung weiterhin dieselben Methoden zum Einblenden und Auswählen aufrufen. Fügen Sie die Registrierung im nativen Plugin hinzu und leiten Sie anschließend dessen erfolgreiche Aktualisierungen weiter, damit ein Web-Modal die Leiste überdecken kann, ohne dass jede Anwendung selbst eine Bildübergabe implementieren muss.

## Voraussetzungen

Dieses Paket deklariert Unterstützung für Capacitor 8 (`>=8.0.0 <9`). Die Engine-Bibliothek erfordert iOS 15+ und Android API 23+; die verwendete Capacitor-Version oder das SDK kann einen höheren Mindeststand voraussetzen. Zusammengesetzte Android-Aufnahmen erfordern API 26+ sowie die in der [Projektionsreferenz](../reference/projection.md#dom-and-native-surface-requirements) beschriebenen WebView-Funktionen.

## Das Web-Ziel auswählen

Stellen Sie pro Registrierung einen im Layout positionierten DOM-Container in der Ebene bereit, in die seine Web-Projektion gehört. Er darf nach der Registrierung eingefügt werden. Das Plugin bleibt für Platzierung und Größe der nativen Ansicht verantwortlich; die Engine erstellt oder dimensioniert keine der beiden Ansichten für Sie.

Wählen Sie einen [unterstützten Container](../reference/containers.md), bevor Sie seinen Selektor verknüpfen. Lesen Sie vor der Integration benutzerdefinierter Elemente, SDK-Inhalte oder mehrerer Oberflächen die [DOM- und nativen Oberflächenanforderungen](../reference/projection.md#dom-and-native-surface-requirements). Scroll-Tracking und Bildübergabe sind intern Teil der Registrierung. In Ionic-Anwendungen können Sie beim Anwendungsstart einmalig die [Ionic-Overlay-Unterstützung](../configuration/ionic-overlays.md) aktivieren. Andere Frameworks senden die konfigurierten Projektionsbenachrichtigungen aus ihrem eigenen Übergangs- und Overlay-Lebenszyklus.

## In einem Plugin installieren

Ersetzen Sie `<engine-version>` in jeder folgenden Abhängigkeit durch dieselbe veröffentlichte Version. Lesen Sie die Dokumentation dieses Release-Tags, damit die Beispiele zu dessen APIs passen.

```sh
npm install --save-exact '@webview-native-ui/engine@<engine-version>'
```

Das npm-Archiv enthält TypeScript-Deklarationen, ESM, Swift-Quellen und eine Podspec. Das konsumierende Plugin muss auch native Abhängigkeiten deklarieren; eine npm-Abhängigkeit allein bindet weder die Swift-Bibliothek noch das Android-AAR ein.

Der primäre native Vertriebsweg ist Swift Package Manager. Verweisen Sie von Ihrem Plugin auf die Bibliothek im Repository-Stamm:

```swift
.package(url: "https://github.com/webview-native-ui/engine.git", exact: "<engine-version>")
// In den Abhängigkeiten des Plugin-Targets:
.product(name: "WebViewNativeUIEngine", package: "engine")
```

Solange die API vor Version 1.0 liegt, pinnen Sie dieselbe Engine-Version für npm, SwiftPM, Gradle und CocoaPods und aktualisieren Sie bewusst. Anwendungen sollten ihre Abhängigkeits-Lockfiles für reproduzierbare Builds beibehalten.

SwiftPM löst Versionstags dieses Repositorys wie `v0.0.1` auf. Verwenden Sie für unveröffentlichte Integrationstests einen lokalen Checkout oder einen expliziten getesteten Commit.

`import WebViewNativeUIEngine` benötigt keine Capacitor-Registrierung. Das npm-Begleitpaket liefert DOM-Messung und Web-Bildübergabe; SwiftPM löst die native Abhängigkeit unabhängig von npm-Hoisting auf.

### Android: Maven-Abhängigkeit ergänzen

Fügen Sie in `android/build.gradle` des konsumierenden Plugins die zur npm-Abhängigkeit passende Engine-Version hinzu:

```groovy
dependencies {
    implementation 'io.github.webview-native-ui:engine:<engine-version>'
}
```

Stellen Sie sicher, dass `google()` und `mavenCentral()` in den Abhängigkeitsrepositorys des konsumierenden Builds enthalten sind. Ergänzen Sie sie bei zentral verwalteten Repositorys in `android/settings.gradle`:

```groovy
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}
```

Verwendet der Build stattdessen Repositorys auf Projektebene, ergänzen Sie den vorhandenen `repositories`-Block. Die Installation des npm-Pakets fügt diese Gradle-Abhängigkeit nicht hinzu. Verwenden Sie eine Version, deren POM und AAR auf Central verfügbar sind; `PUBLISHING` bestätigt lediglich die Annahme, noch keine Downloads.

### CocoaPods-Kompatibilität über npm

CocoaPods verwendet die in npm gelieferten Swift-Quellen und die Podspec; eine Veröffentlichung auf CocoaPods Trunk ist nicht nötig. Der Plugin-Maintainer deklariert die passende Abhängigkeit in der Podspec des Plugins:

```ruby
s.dependency 'WebViewNativeUIEngine', '<engine-version>'
```

Der Maintainer muss außerdem diese einmalige Anwendungseinrichtung dokumentieren. Installieren Sie die passende Engine-Version als direkte npm-Abhängigkeit und ergänzen Sie den lokalen Pod **innerhalb des Anwendungsziels, außerhalb von `def capacitor_pods`**, das Capacitor neu generiert:

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

Führen Sie `npx cap sync ios` aus und bauen Sie neu. Halten Sie bei Aktualisierungen die direkte Engine-Version mit der Abhängigkeit des konsumierenden Plugins synchron. Bei einer nicht standardmäßigen node_modules-Struktur muss `:path` auf das installierte Engine-Paketverzeichnis zeigen. Eine npm-Abhängigkeit allein registriert keinen Pod, und eine Podspec-Abhängigkeit kann diesen lokalen Pfad nicht angeben. Die Engine enthält absichtlich weder eine Capacitor-Plugin-Registrierung noch einen Hook zum Umschreiben des Podfile. SwiftPM-Verbraucher benötigen diese CocoaPods-Einrichtung nicht.

## Aus dem nativen Plugin registrieren

Lassen Sie den normalen `registerPlugin()`-Export und die öffentlichen Methoden des Plugins unverändert. Erstellen und behalten Sie eine Registrierung nach Erstellung des nativen Renderers. Die Engine liefert ihre Web-Laufzeit mit der Swift-/Android-Bibliothek, startet sie im aktuellen und in zukünftigen Dokumenten, findet das vorhandene Fallback-DOM und abonniert Plugin-Benachrichtigungen. Anwendungen rufen keinen separaten JS-Initialisierer auf.

Der [Benachrichtigungsvertrag](../configuration/events.md) definiert, welche erfolgreichen Änderungen zu melden sind und wie die Zuordnung beim Start funktioniert.

Die Integration hat drei Verantwortlichkeiten:

1. Der Verbraucher stellt einen vorhandenen, im Layout positionierten Web-Fallback-Container in der richtigen Ebene bereit. Übergeben Sie dieses Projektionsziel als erforderliches `projectionSelector: string`; es gibt weder einen `null`-Modus noch automatische DOM-Erzeugung.
2. Das Plugin registriert seine nativen Ansichten und Benachrichtigungsnamen einmal pro Plattform.
3. Das Plugin sendet nach Aktualisierungen Benachrichtigungen und gibt die Registrierung bei der Bereinigung frei.

### iOS: Registrierung zur Klasse `CAPPlugin` hinzufügen

Behalten Sie in `ios/Sources/ExamplePlugin/ExamplePlugin.swift` die Registrierung als Eigenschaft und initialisieren Sie sie in `load()`, **nachdem Ihr vorhandener Renderer seine Ansicht erstellt und angehängt hat**.

In diesem Diff ist `nativeView` die `UIView`, die Ihr Plugin bereits besitzt; Kommentare vertreten dessen vorhandenen Rendering-Code.

Verwenden Sie das vorhandene **`jsName`**, nicht `identifier`: Capacitor verwendet `jsName` für JS-Plugin-Aufrufe und Ereignisabonnements. Wiederholen Sie den Plugin-Namen nicht in der Engine-Konfiguration.

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
         // Vorhandener Code erstellt und verbindet hier nativeView.
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
             // Vorhandener Code wendet die angeforderten Farben auf nativeView an.
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

Übergeben Sie `bridge?.webView` direkt. Ist die WebView nicht verfügbar, wirft die Engine einen Initialisierungsfehler, der im selben `catch` landet; eine separate Prüfung oder erzwungenes Entpacken ist unnötig.

Wird die Ansicht später in einer vorhandenen Methode `initialize` / `show` erzeugt, registrieren Sie sie dort nach ihrer Erstellung statt in `load()`. Behalten Sie eine Registrierung über die Lebensdauer dieses Renderers; erzeugen Sie nicht bei jeder Aktualisierung eine weitere. Zerstören Sie beim Ersetzen eines Renderers dessen alte Registrierung, bevor Sie den Ersatz registrieren.

### Android: Registrierung zur Klasse `Plugin` hinzufügen

Nehmen Sie die entsprechenden Änderungen in `android/src/main/java/<your-package>/ExamplePlugin.kt` vor. **`pluginHandle.id`** ist der aus `@CapacitorPlugin` abgeleitete registrierte Capacitor-Plugin-Name; eine zweite Namenszeichenfolge ist nicht erforderlich.

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
         // Vorhandener Code erstellt und verbindet hier nativeView.
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
             // Vorhandener Code wendet die angeforderten Farben auf nativeView an.
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

Rufen Sie unter Android `NativeUIProjection.install(bridge.webView)` in `load()` des Plugins vor der ersten Navigation auf, auch wenn SDK-Ansichten erst später eintreffen. Beziehen Sie die Installation in dieselbe Fehlerbehandlung wie die Registrierung ein; schlägt sie fehl, behalten Sie den bestehenden Web-Fallback bei und versuchen Sie nach der Navigation keine erneute Installation. Registrierungen teilen anschließend diesen auf den Hauptframe und erlaubte Origins beschränkten Kanal; sie installieren keine neuen Nachrichtenlistener in einer bereits geladenen WebView. Die Installation vor der Navigation vermeidet einen nativen WebView-Absturz beim Registrieren einer asynchron geladenen Ansicht. Der Registrierungskonstruktor kann den Kanal nur in einer WebView installieren, in der noch keine Navigation stattgefunden hat; eine späte Installation schlägt mit einer handlungsleitenden Fehlermeldung fehl, statt eine unsichere Injektion zu versuchen. Alle Registrierungen derselben WebView müssen dieselben erlaubten Origins verwenden. Das Schließen einer Registrierung entfernt nur ihren Besitzer aus dem Kanal, sodass andere registrierte Ansichten weiter funktionieren. Der gemeinsame Kanal bleibt während der Lebensdauer der WebView installiert; das konsumierende Plugin muss seine Registrierungen weiterhin behalten und schließen.

Beide Diffs ergänzen eine private Eigenschaft, native Registrierung, eine überschriebene Benachrichtigungsmethode, eine Aktualisierungsbenachrichtigung und Bereinigung. Sie ergänzen keine Engine-Methoden in `pluginMethods`, keinen öffentlichen JS-Wrapper und keinen anwendungsseitigen Engine-Initialisierer.

Behalten Sie den vorhandenen `registerPlugin()`-Export Ihres Plugins. Verwenden Sie dieselben Ereignisnamen in Registrierung und `notifyListeners`; sendet das Plugin bereits ein geeignetes Ereignis (etwa `tabSelected`), tragen Sie dieses ein, statt es doppelt zu senden.

## Die Integration prüfen

Blenden Sie das Steuerelement ein, ändern Sie sein Erscheinungsbild und öffnen und schließen Sie dann ein überdeckendes Web-Overlay. Prüfen Sie, dass das vorbereitete Erscheinungsbild zum aktuellen Steuerelement gehört und die native Interaktion an der aktuellen Position zurückkehrt. Prüfen Sie außerdem Ausblendung, Containerersetzung und Plugin-Abbau: Späte Antworten dürfen entfernte Inhalte nicht wieder einblenden. Testen Sie ein fehlendes Bild, um den gewählten Web-Fallback zu prüfen.

Verwenden Sie das tatsächliche Steuerelement und die tatsächlichen Hintergründe auf unterstützten Geräten; eine erfolgreiche Bridge-Kommunikation allein bestätigt keine visuelle Kontinuität. Für einen Renderer, der Steuerelemente bereits nach Seiten bündelt, fahren Sie mit dem [Renderer-Leitfaden](../advanced/renderer.md) fort, statt die Registrierungsmechanik für jede Übergabe zu duplizieren.

## Weiter: Optionales Verhalten auswählen

Verwenden Sie den [Konfigurationsleitfaden](../configuration/README.md) für Benachrichtigungszuordnung, Wertübertragung, Aufnahmezeitpunkt und Fallback-Strategie. Diese gemeinsamen Einstellungen sind keine zusätzliche Plattformeinrichtung. Für einen Renderer, der bereits Steuerelemente bündelt, siehe [erweiterte APIs](../advanced/README.md).
