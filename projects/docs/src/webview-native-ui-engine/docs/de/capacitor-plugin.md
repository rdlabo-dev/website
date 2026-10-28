---
title: "Integration in ein Capacitor-Plugin"
sourceRevision: "29a853bd743ebc097648db337c854079bf03fecfa6669d14dfc2cf0eda593f64"
---
# Integration in ein Capacitor-Plugin

Ergänzen Sie Web-Projektion und Wiederherstellung in einem bestehenden Capacitor-Plugin, ohne dessen öffentlichen `registerPlugin()`-Export zu ändern. Das Plugin behält seinen nativen Renderer und seine Anwendungs-API; die Engine koordiniert seine native Ansicht mit einem DOM-Fallback.

Diese Anleitung behandelt Abhängigkeiten, Registrierung, Benachrichtigungen und Bereinigung. Gemeinsame DOM-Anforderungen, Aufnahmerichtlinien und erweiterte Integration beschreibt das [Projektionsverhalten](projection.md).

## Voraussetzungen

Dieses Paket deklariert Unterstützung für Capacitor 8 (`>=8.0.0 <9`). Die Engine-Bibliothek benötigt iOS 15+ und Android API 23+; die verwendete Capacitor-Version oder das SDK kann eine höhere Mindestversion verlangen. Zusammengesetzte Android-Aufnahmen benötigen API 26+ und die in der [Projektionsreferenz](projection.md#dom-and-native-surface-requirements) beschriebenen WebView-Funktionen.

## In einem Plugin installieren

```sh
npm install --save-exact @webview-native-ui/engine@0.0.1
```

Das npm-Archiv enthält TypeScript-Deklarationen, ESM, Swift-Quellen und eine Podspec. Das konsumierende Plugin muss auch native Abhängigkeiten deklarieren; eine npm-Abhängigkeit allein bindet weder die Swift-Bibliothek noch das Android-AAR ein.

Der primäre native Vertriebsweg ist Swift Package Manager. Verweisen Sie von Ihrem Plugin auf die Bibliothek im Repository-Stamm:

```swift
.package(url: "https://github.com/webview-native-ui/engine.git", exact: "0.0.1")
// In den Abhängigkeiten des Plugin-Ziels:
.product(name: "WebViewNativeUIEngine", package: "engine")
```

Die neuen Koordinaten beginnen bei `0.0.1`. Solange die API vor Version 1.0 liegt, schreiben Sie dasselbe Engine-Release für npm, SwiftPM, Gradle und CocoaPods fest und aktualisieren Sie bewusst. Anwendungen sollten ihre Abhängigkeits-Lockfiles für reproduzierbare Builds behalten.

SwiftPM löst Versionstags dieses Repositorys wie `v0.0.1` auf. Verwenden Sie für unveröffentlichte Integrationstests einen lokalen Checkout oder einen expliziten getesteten Commit.

`import WebViewNativeUIEngine` benötigt keine Capacitor-Registrierung. Das npm-Begleitpaket liefert DOM-Messung und Web-Bildübergabe; SwiftPM löst die native Abhängigkeit unabhängig von npm-Hoisting auf.

### Android: Maven-Abhängigkeit ergänzen

Fügen Sie in `android/build.gradle` des konsumierenden Plugins die zur npm-Abhängigkeit passende Engine-Version hinzu:

```groovy
dependencies {
    implementation 'io.github.webview-native-ui:engine:0.0.1'
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
s.dependency 'WebViewNativeUIEngine', '0.0.1'
```

Der Maintainer muss außerdem diese einmalige Anwendungseinrichtung dokumentieren. Installieren Sie die passende Engine-Version als direkte npm-Abhängigkeit und ergänzen Sie den lokalen Pod **innerhalb des Anwendungsziels, außerhalb von `def capacitor_pods`**, das Capacitor neu generiert:

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

Führen Sie `npx cap sync ios` aus und bauen Sie neu. Halten Sie bei Aktualisierungen die direkte Engine-Version mit der Abhängigkeit des konsumierenden Plugins synchron. Bei einer nicht standardmäßigen node_modules-Struktur muss `:path` auf das installierte Engine-Paketverzeichnis zeigen. Eine npm-Abhängigkeit allein registriert keinen Pod, und eine Podspec-Abhängigkeit kann diesen lokalen Pfad nicht angeben. Die Engine enthält absichtlich weder eine Capacitor-Plugin-Registrierung noch einen Hook zum Umschreiben des Podfile. SwiftPM-Verbraucher benötigen diese CocoaPods-Einrichtung nicht.

## Aus dem nativen Plugin registrieren

Lassen Sie den normalen `registerPlugin()`-Export und die öffentlichen Methoden des Plugins unverändert. Erstellen und behalten Sie eine Registrierung nach Erstellung des nativen Renderers. Die Engine liefert ihre Web-Laufzeit mit der Swift-/Android-Bibliothek, startet sie im aktuellen und in zukünftigen Dokumenten, findet das vorhandene Fallback-DOM und abonniert Plugin-Benachrichtigungen. Anwendungen rufen keinen separaten JS-Initialisierer auf.

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

Rufen Sie unter Android `NativeUIProjection.install(bridge.webView)` in `load()` des Plugins vor der ersten Navigation auf, auch wenn SDK-Ansichten erst später verfügbar werden. Beziehen Sie die Installation in dieselbe Fehlerbehandlung wie die Registrierung ein; behalten Sie bei einem Fehler den bestehenden Web-Fallback und wiederholen Sie die Installation nicht nach einer Navigation. Registrierungen teilen anschließend diesen auf Hauptframe und erlaubte Origins begrenzten Kanal; sie installieren keine neuen Nachrichtenlistener in eine geladene WebView. Dies vermeidet einen nativen WebView-Absturz, der bei der Registrierung einer asynchron geladenen AdMob-Ansicht reproduziert wurde. Der Registrierungskonstruktor kann den Kanal nur auf einer WebView installieren, die noch nicht navigiert hat; eine verspätete Installation scheitert mit einer handlungsleitenden Fehlermeldung statt unsicherer Injektion. Alle Registrierungen derselben WebView müssen dieselben erlaubten Origins verwenden. Das Schließen einer Registrierung entfernt nur ihren Besitzer aus dem Kanal, sodass andere Slots weiterarbeiten. Der gemeinsame Kanal bleibt über die Lebensdauer der WebView installiert; das konsumierende Plugin muss Registrierungen dennoch behalten und schließen.

Beide Diffs ergänzen eine private Eigenschaft, native Registrierung, eine überschriebene Benachrichtigungsmethode, eine Aktualisierungsbenachrichtigung und Bereinigung. Sie ergänzen keine Engine-Methoden in `pluginMethods`, keinen öffentlichen JS-Wrapper und keinen anwendungsseitigen Engine-Initialisierer.

Behalten Sie den vorhandenen `registerPlugin()`-Export Ihres Plugins. Verwenden Sie dieselben Ereignisnamen in Registrierung und `notifyListeners`; sendet das Plugin bereits ein geeignetes Ereignis (etwa `tabSelected`), tragen Sie dieses ein, statt es doppelt zu senden.

### Benachrichtigungen während des Starts

Die oben überschriebene Benachrichtigungsmethode erlaubt der Engine, das letzte passende Projektionsziel zu behalten, bevor sich die Web-Laufzeit abonniert. Weder eine separate Zustandsvariable noch ein Callback für den Anfangszustand ist nötig. Leiten Sie jede Benachrichtigung wie gewohnt an `super` weiter: Die Engine erfasst Zustand, ohne Benachrichtigungen, Aktualisierungen oder Benutzeraktionen erneut auszuführen. Ohne Zielbenachrichtigung leitet sie das Anfangsziel aus der Sichtbarkeit der nativen Ansicht ab. Die Registrierung muss vor den zu beobachtenden Benachrichtigungen existieren.

Besitzt Ihr Plugin mehrere Registrierungen, übergeben Sie die Benachrichtigung an jede; `receiveListeners.match` wählt die zuständige Fläche. Erscheinungsbildaktualisierungen ändern das Ziel nicht. Vor der Verbindung bleibt der Renderer für native Platzierung und Sichtbarkeit verantwortlich.

Mit dem standardmäßigen Web-Fallback bleibt beim Scrollen ohne vorbereitetes Bild oder native Scrollbindung der Web-Fallback sichtbar, bis der Renderer die aktuelle native Platzierung mit seiner Benachrichtigung für das native Ziel bestätigt. Eine reine Erscheinungsbildaktualisierung ist keine solche Bestätigung. Verbraucher, die native Fehlerwiederherstellung wählen, müssen ihre eigene native Geometrie aktuell halten.

### Welche Ereignisse gesendet werden

Alle Deklarationen eingehender Ereignisse gehören zu `receiveListeners`. Die Liste `update` aktualisiert das Bild, die Listen `projection` wählen das Ziel und das optionale `match` filtert Benachrichtigungen für die zuständige Fläche.

| Benachrichtigung | Auslösepunkt im vorhandenen Plugin |
| --- | --- |
| `appearanceChanged` (ein `update`-Ereignis) | Nach erfolgreicher Aktualisierung des nativen Erscheinungsbilds, etwa `setColors` |
| `transitionStarted` (`web`) | Bevor sich das Fallback-DOM bewegt oder eine Web-Ebene die native Ansicht überdeckt |
| `shown` (`native`) | Nach der vorhandenen Anzeigeoperation des Plugins oder bei der Rückkehr aus der Web-Projektion |
| `hidden` (`none`) | Nach der vorhandenen Ausblendeoperation des Plugins |

Die Beispielnamen sind von Ihnen gewählte Konventionen, keine reservierten Engine-Methoden. Ein `update`-Ereignis aktualisiert das vorbereitete Bild, ohne das angeforderte Ziel zu ändern. Es ruft `setColors` nicht erneut auf.

Senden Sie `transitionStarted`, bevor sich das DOM bewegt, `shown`, wenn erneut native Projektion angefordert wird, und `hidden` nach der plugin-eigenen Ausblendeoperation. Native Aufnahme, URL-Konvertierung, Bildvorbereitung, Zeichenbestätigung, Bildentfernung und Listenerbereinigung bleiben innerhalb der Engine. Die Engine ruft niemals die Plugin-Methoden `show`, `hide`, Auswahl oder Anzeigenladen auf. Beenden Sie die Registrierung bei Zerstörung des Renderers mit `projection.destroy()` unter iOS beziehungsweise `projection.close()` unter Android. Behalten Sie die Registrierung über ihre gesamte Lebensdauer und rufen Sie native APIs auf dem UI-Thread auf.

## DOM, Scrollen und Overlays

Stellen Sie pro Registrierung einen im Layout positionierten DOM-Container in der Ebene bereit, in die seine Web-Projektion gehört. Er darf nach der Registrierung eingefügt werden. Das Plugin bleibt für Platzierung und Größe der nativen Ansicht verantwortlich; die Engine erstellt oder dimensioniert keine der beiden Ansichten für Sie.

Lesen Sie die [DOM- und nativen Flächenanforderungen](projection.md#dom-and-native-surface-requirements), bevor Sie eigene Elemente, SDK-Inhalte oder mehrere Flächen integrieren. Scrolltracking und Bildübergabe erfolgen intern in der Registrierung. Aktivieren Sie bei Ionic-Anwendungen optional einmal beim Anwendungsstart die [Ionic-Overlay-Unterstützung](projection.md#ionic-overlay-support-optional). Andere Frameworks senden die konfigurierten Projektionsbenachrichtigungen aus ihrem eigenen Übergangs- und Overlay-Lebenszyklus.

## Animierte native Steuerelemente

Nach Aktualisierungen des nativen Erscheinungsbilds werden Ersatzbilder standardmäßig nach einer Debounce-Verzögerung von 50 ms vorbereitet.
Wenn die Animation Ihres Steuerelements nach der Aktualisierungsbenachrichtigung weiterläuft, setzen Sie `captureDelayMs` bei der nativen Registrierung (Swift: `captureDelayMs: 600`; Kotlin: `captureDelayMs = 600`).
Diese Einstellung ändert die Bildvorbereitung im Hintergrund, nicht den Zeitpunkt der Overlay-Anzeige.
Weitere Informationen zum Cache-Verhalten und zu den auf Messungen beruhenden Empfehlungen finden Sie unter [Aufnahmezeitpunkt](projection.md#capture-timing).

### Projektions-DOM

Die Engine hält ein wiederverwendbares Bild im Fallback-Container vor und nutzt dessen offenen ShadowRoot, sofern vorhanden. Eine Platzierungsoption ist nicht erforderlich. Wenn der Renderer Kindelemente untersucht, schließen Sie mit `data-native-ui-projection-node` markierte Knoten aus. Siehe [DOM-Anforderungen](projection.md#dom-and-native-surface-requirements).
