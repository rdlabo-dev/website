---
title: "App-lokale Native UI-Erweiterungen (experimentell)"
sourceRevision: ea91d75a9eb39e1ae390243ae1850313b911364cdb7f8eb638f6c3f99664ffdd
---

# App-lokale Native UI-Erweiterungen (experimentell)

> **Experimentell:** Erweiterungs-API, native Registrierungsschnittstellen und Verhalten können sich in zukünftigen Releases ändern. Dies gilt für SwiftUI- und Kotlin-/Compose-Erweiterungen einschließlich der Positionen `element` und `tab-accessory`.

Eine Erweiterung projiziert Ihre bestehende Web-Oberfläche in eine SwiftUI-View unter iOS oder Jetpack-Compose-Inhalte unter Android. Beide Definitionen bleiben in Ihrer Anwendung: Ein npm-Paket, eine separate Bibliothek oder ein Capacitor-Plugin sind nicht erforderlich. Das Web-Element bleibt maßgebliche Quelle und Fallback-Oberfläche.

Erweiterungen verwenden dasselbe [Projektionsmodell](../README.md#how-projection-works) wie integrierte Bedienelemente. Definieren Sie die bereitzustellenden DOM-Daten und Aktionen und anschließend deren native Darstellung.

## Vorbereitungen

Beginnen Sie mit einer bestehenden Capacitor-8-App und installieren Sie das Plugin, falls noch nicht geschehen:

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Wählen Sie die zu unterstützende native Plattform:

- **Android:** Verwenden Sie Ihr Capacitor-Android-Projekt und ein Gerät oder einen Emulator mit API 24+. Folgen Sie Schritt 1, der [Kotlin-/Compose-Registrierung](#2b-register-compose-content-on-android) und den Schritten 3–4. iOS-Projekt, Xcode, Ionic und Theme-Paket sind nicht erforderlich.
- **iOS:** Verwenden Sie Ihr Capacitor-iOS-Projekt, Xcode 26+ und ein iOS-26+-Gerät oder einen Simulator. Folgen Sie Schritt 1, der [SwiftUI-Registrierung](#2a-register-a-swiftui-view-on-ios) und den Schritten 3–4. Für zusätzliche Standardbedienelemente folgen Sie [Ionic-Einrichtung](setup.md) oder [HTML-Einrichtung](framework-independent.md).
- **Beide:** Verwenden Sie den DOM-Reader aus Schritt 1 gemeinsam und registrieren Sie auf jeder Plattform native Inhalte unter demselben Namen.

Die folgenden TypeScript-Beispiele verwenden den Ionic-Einstiegspunkt. Importieren Sie ohne Ionic sowohl `defineNativeUI` als auch `enableNativeUI` aus `@rdlabo/capacitor-native-ui/core`.

## 1. Einen DOM-Reader definieren

```ts
// src/native-ui/counter.ts
import { defineNativeUI } from '@rdlabo/capacitor-native-ui';

export const counter = defineNativeUI({
  name: 'app.counter',
  selector: '[data-counter]',
  read(element) {
    return {
      props: { count: Number(element.getAttribute('data-count') ?? 0) },
      actions: { increment: element.querySelector<HTMLButtonElement>('button') },
    };
  },
});
```

Verwenden Sie beispielsweise diese Web-Quelle. Ihr reservierter Platz nimmt auch native Inhalte und einen Aktionsfehler auf:

```html
<div data-counter data-count="0" style="width: 280px; min-height: 128px">
  <p data-count-label>Count: 0</p>
  <button type="button">Increment</button>
</div>
```

Lassen Sie den Klickhandler Ihres Frameworks den Zähler und `data-count` aktualisieren. Bei reinem HTML reicht Folgendes:

```ts
const source = document.querySelector<HTMLElement>('[data-counter]')!;
source.querySelector('button')!.addEventListener('click', () => {
  const count = Number(source.dataset.count ?? 0) + 1;
  source.dataset.count = String(count);
  source.querySelector('[data-count-label]')!.textContent = `Count: ${count}`;
});
```

Die Shell beobachtet DOM-Änderungen und sendet neue Props an den nativen Inhalt. In DOM-Attribute oder Text gerenderter Zustand wird automatisch beobachtet. Bei vom Reader gelesenen Eigenschaften oder externem Zustand ohne DOM-Mutation rufen Sie nach Änderungen `shell.markForCheck()` auf.

### Reader-Vertrag

| Bestandteil | Anforderung |
| --- | --- |
| Ausführung | Synchron und ausschließlich lesend. |
| Web-Fallback | `null` zurückgeben, wenn die Quelle im Web bleiben soll. |
| `props` | JSON-Objekt mit endlichen Zahlen, Zeichenfolgen, booleschen Werten, null, Arrays und Objekten; begrenzt auf 64K Zeichen. |
| Aktionsziele | Die Quelle selbst oder ihre Nachfahren. Fehlende, versteckte und deaktivierte Ziele lassen sich nicht aktivieren. |
| Aktionsanzahl | Bis zu 30 pro Quelle. |

## 2a. Eine SwiftUI-View unter iOS registrieren

Führen Sie nach der Plugin-Installation `npx cap sync ios` aus und fügen Sie eine Swift-Datei zum Xcode-Target der Anwendung hinzu. Importieren Sie `NativeUIPlugin`, das von `@rdlabo/capacitor-native-ui` bereitgestellte Modul. Behalten Sie Ihre bestehende SPM- oder CocoaPods-Integration.

```swift
import SwiftUI
import NativeUIPlugin

struct CounterProps: Decodable {
    let count: Int
}

struct CounterView: View {
    let props: CounterProps
    let actions: NativeUIActions
    @State private var error: String?

    var body: some View {
        HStack {
            Text("Count: \(props.count)")
            Button("Increment") {
                Task { @MainActor in
                    do {
                        try await actions.activate("increment")
                        error = nil
                    } catch {
                        self.error = "Action unavailable"
                    }
                }
            }
            .disabled(!actions.isAvailable("increment"))
            if let error { Text(error) }
        }
    }
}

@MainActor func registerAppNativeUI() throws {
    try NativeUI.register("app.counter") {
        (props: CounterProps, actions: NativeUIActions) in
        CounterView(props: props, actions: actions)
    }
}
```

Rufen Sie `registerAppNativeUI()` einmal aus `application(_:didFinishLaunchingWithOptions:)` auf, bevor JavaScript die Shell aktiviert. Behandeln Sie dort Registrierungsfehler; doppelte oder leere Namen werden abgewiesen. Swift-Quellcode wird in die App kompiliert, daher erfordert das Hinzufügen oder Ändern einer View einen erneuten iOS-Build. Die Registrierung ist eine synchrone Einrichtung, kein nativer Bridge-Befehl.

## 2b. Compose-Inhalte unter Android registrieren

Android unterstützt **nur Elementerweiterungen**. Standard-Ionic- und HTML-Bedienelemente bleiben im Web, einschließlich explizit markierter Schaltflächen. Native Vertical Bars und `tab-accessory` sind iOS-Funktionen; Android kann eine Web-Seitenleiste mit Elementerweiterungen kombinieren. Derselbe DOM-Reader, Props, Aktionsziele und `markForCheck()` funktionieren auf beiden Plattformen.

Führen Sie nach der Plugin-Installation `npx cap sync android` aus. Verwenden Sie Kotlin in Ihrer Android-App. Ergänzen Sie im Stamm-`build.gradle` die Kotlin- und Compose-Compiler-Plugins unter `buildscript.dependencies`, mit derselben Kotlin-Version wie die App (Plugin-Standard: `2.2.20`). Definieren Sie im Stamm-`buildscript` `ext.kotlin_version = '2.2.20'`, falls noch nicht vorhanden:

```groovy
classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
classpath "org.jetbrains.kotlin:compose-compiler-gradle-plugin:$kotlin_version"
```

Wenden Sie in `app/build.gradle` `kotlin-android` und `org.jetbrains.kotlin.plugin.compose` an und aktivieren Sie `android { buildFeatures { compose true } }`. Die Native UI-Abhängigkeit stellt Compose UI und Foundation bereit; ergänzen Sie Material-Abhängigkeiten selbst, wenn Ihre Erweiterung sie verwendet.

Registrieren Sie einmal in `Application.onCreate()` auf dem Hauptthread, bevor JavaScript die Shell aktiviert. Verwenden Sie eine `Application`-Unterklasse, die mit `android:name=".App"` auf `<application>` in `AndroidManifest.xml` konfiguriert ist; registrieren Sie nicht bei jeder Neuerstellung der Activity.

```kotlin
import android.app.Application
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import dev.rdlabo.capacitor.nativeui.NativeUI
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        NativeUI.register(
            name = "app.counter",
            decode = { json -> json.getInt("count") },
        ) { count, actions, context ->
            val scope = rememberCoroutineScope()
            var error by remember { mutableStateOf<String?>(null) }
            val enabled = actions.isAvailable("increment")
            val foreground = if (context.dark) Color.White else Color.Black
            val background = if (context.dark) Color(0xFF202020) else Color.White
            val textStyle = TextStyle(color = foreground)
            Column(Modifier.fillMaxSize().background(background).padding(8.dp)) {
                BasicText("Count: $count", style = textStyle)
                Box(
                    Modifier.fillMaxWidth().heightIn(min = 48.dp)
                        .alpha(if (enabled) 1f else 0.5f)
                        .clickable(enabled = enabled, role = Role.Button, onClickLabel = "Increment count") {
                            scope.launch {
                                try {
                                    actions.activate("increment")
                                    error = null
                                } catch (cancelled: CancellationException) {
                                    throw cancelled
                                } catch (unavailable: IllegalStateException) {
                                    error = "Action unavailable. Try again."
                                }
                            }
                        },
                    contentAlignment = Alignment.Center,
                ) { BasicText("Increment", style = textStyle) }
                BasicText(
                    error ?: "",
                    modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
                    style = textStyle,
                )
            }
        }
    }
}
```

Die Shell positioniert und dimensioniert den Compose-Host anhand des Quell-DOM-Rechtecks. `context.sourceFrame` enthält CSS-Pixel; `sourceFrameInDp` enthält Compose-dp, mit `dpPerCSSPixel` als Umrechnungsfaktor. `sourceID` und `viewportWidth` beschreiben aktuelle Quelle und Viewport. `rtl` wird auch über `LocalLayoutDirection` angewendet; verwenden Sie `dark`, um das Compose-Theme Ihrer App auszuwählen. Wenden Sie `x` und `y` der Quelle nicht erneut innerhalb Ihres Inhalts an.

Der Callback `decode` läuft vor dem Akzeptieren der Projektion. Wirft er einen Fehler, bleibt diese Quelle im Web. Leere oder doppelte Registrierungsnamen werden abgewiesen. Compose-Inhalte verantworten eigene Stile und Barrierefreiheit. Erstellen Sie die Android-App nach Kotlin-Änderungen neu.

## 3. Mit lokalen Definitionen aktivieren

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';
import { counter } from './native-ui/counter';

const shell = await enableNativeUI({ ionic: { auto: false }, extensions: [counter] });
```

Dieses Beispiel aktiviert Ihre Erweiterungen ohne automatische Projektion von Ionic-Bedienelementen. Explizite `data-native-ui`-Quellen bleiben aktiviert. Lassen Sie `ionic: { auto: false }` weg, um zusätzlich Standard-Ionic-Bedienelemente unter unterstütztem iOS zu projizieren. Android-Standardbedienelemente bleiben in beiden Fällen im Web.

Ersetzen Sie Ihren bestehenden Startaufruf durch den obigen; starten Sie keine zweite Shell. Verbinden Sie ihn anhand der [App-Root-Lebenszyklusbeispiele](setup.md#place-startup-in-your-frameworks-app-root) mit Ihrem Framework und ergänzen Sie diese Optionen im gemeinsamen Startaufruf.

Halten Sie Erweiterungsobjekte über wiederholte Aktivierungsaufrufe stabil. Änderungen an laufenden Erweiterungen erfordern zunächst `await shell.destroy()`. Erweiterungsnamen müssen innerhalb einer Aktivierung eindeutig sein. Registrieren Sie keine überlappenden Selektoren für dieselbe Quelle. Eine Erweiterung verwaltet ihren Quellteilbaum, daher werden integrierte Bedienelemente darin nicht separat projiziert.

## 4. Erweiterung erstellen und ausprobieren

Erstellen Sie die Web-Assets, synchronisieren Sie und erstellen Sie die konfigurierte Plattform erneut:

- **Android:** `npx cap sync android` ausführen, dann die App in Android Studio erstellen und starten. Der Zähler sollte mit Compose dargestellt werden.
- **iOS:** `npx cap sync ios` ausführen, dann die App in Xcode erstellen und starten. Unter iOS 26+ sollte der Zähler mit SwiftUI dargestellt werden.

Tippen Sie auf Increment: Der ursprüngliche Web-Handler sollte `data-count` aktualisieren und der native Zähler folgen. Im Browser sollte der ursprüngliche Web-Zähler weiterhin funktionieren.

Aktivieren Sie für quellenspezifische Fallback-Gründe vorübergehend [`debug: true`](configuration.md#understand-why-a-source-stays-on-the-web). Bleibt die Quelle im Web, prüfen Sie, ob die Registrierung vor der Shell-Aktivierung durch JavaScript läuft und Namen sowie Props auf beiden Seiten übereinstimmen. Prüfen Sie unter Android, ob Ihre `Application`-Unterklasse im Manifest deklariert ist; unter iOS, ob die Swift-Datei zum App-Target gehört.

## Inhalt und Position sind unabhängig

| `placement` | Verhalten |
| --- | --- |
| Ausgelassen oder `'element'` | Hostet native Inhalte im Web-Rahmen des Quellelements unter iOS 26+ oder Android API 24+. |
| `'tab-accessory'` | Fügt die View dem SwiftUI-System-Tab-Zubehör einer projizierten Tab-Leiste unter iOS 26.1+ hinzu. |

Erweiterungen sind von `controls` und `ionic.auto` unabhängig, auch mit `enableVerticalControlArea()`. Die Anwendung steuert ihre Darstellung: Geben Sie im Reader `null` zurück, wenn eine Quelle im Web bleiben soll, und rufen Sie bei Änderung dieser Bedingung `markForCheck()` auf. Zubehör benötigt weiterhin seinen unterstützten nativen Tab-Host.

### Anforderungen an Tab-Zubehör

| Anforderung | Unterstützte Konfiguration |
| --- | --- |
| Quellposition | Innerhalb des zuständigen `ion-tabs`; die Shell löst dessen `ion-tab-bar` auf. |
| Nativer Host | Vertical Bars-SwiftUI-Tab-Host unter iOS 26.1+. |
| Zubehöranzahl | Ein einzelnes Zubehör für den Host. |
| Web-Fallback-Layout | Ein gleichwertiges Web-Layout, etwa eine fixierte Fußzeile, beibehalten; die Quelle behält beim Ausblenden ihren Platz. |

Gewöhnliche UIKit-Tab-Leisten, fehlende native Tabs, iOS 26.0 oder konkurrierendes Zubehör belassen die Quelle im Web. Anwendungen übergeben keine nativen Controllerreferenzen und die Shell bildet Systemzubehör nicht durch ein schwebendes Overlay nach.

## Quellgeometrie und Darstellungszustand lesen

Die Shell vermisst das Quell-DOM-Element automatisch. Bei der Standardposition `element` positioniert und dimensioniert sie den SwiftUI-Host passend zu diesem Rechteck. Sie müssen weder Koordinaten in `props` senden noch die native View selbst positionieren.

Verwenden Sie die Registrierungs-Closure mit drei Argumenten, um diese Informationen zu erhalten:

```swift
try NativeUI.register("app.counter") {
    (props: CounterProps, actions: NativeUIActions, context: NativeUIContext) in
    CounterView(props: props, actions: actions)
        .padding(.horizontal, context.sourceFrame.width < 240 ? 4 : 12)
}
```

Die bestehende Closure `(props, actions)` bleibt unterstützt. Beide Formen verwenden dieselben Registrierungsnamen und Prüfungen auf doppelte Namen.

| Kontexteigenschaft | Bedeutung |
| --- | --- |
| `sourceID` | Opake Quellidentität für die aktuelle Lebensdauer; nicht die HTML-`id`. |
| `sourceFrame` | DOM-`getBoundingClientRect()` in CSS-Pixeln relativ zum Web-Viewport, einschließlich `x`, `y`, `width` und `height`. |
| `sourceFrameInWebView` | Quellrechteck in UIKit-Punkte im lokalen WebView-Koordinatensystem umgerechnet; keine Bildschirmkoordinaten. |
| `viewportWidth` | CSS-Viewportbreite für die Koordinatenumrechnung dieses Snapshots. |
| `pointsPerCSSPixel` | UIKit-Punkte pro CSS-Pixel; keine Gerätepixeldichte. |
| `placement` | `.element` oder `.tabAccessory`. |
| `colorScheme` | `.light` oder `.dark`, auch auf die SwiftUI-Umgebung angewendet. |
| `layoutDirection` | `.leftToRight` oder `.rightToLeft`, auch auf die SwiftUI-Umgebung angewendet. |

Die Closure erhält bei jedem aktualisierten Snapshot der Shell einen neuen Kontext, einschließlich Quellbewegung, Größen- und Darstellungsänderungen. Verwenden Sie den aktuellen Kontext, statt seine Geometrie in `@State` zwischenzuspeichern. Aktualisierungen passieren die Web-/Native-Bridge; sie sind keine synchrone DOM-Messung aus Swift.

Bei `tabAccessory` beschreibt `sourceFrame` weiterhin das ursprüngliche DOM-Element. Das System bestimmt tatsächliche Position und Größe des Zubehörs. Verwenden Sie innerhalb Ihrer View SwiftUIs `GeometryReader` für den tatsächlichen lokalen Platz bei beiden Positionen:

```swift
GeometryReader { geometry in
    CounterView(props: props, actions: actions)
        .frame(width: geometry.size.width, height: geometry.size.height)
}
```

Wenden Sie `sourceFrame.x` oder `y` nicht als weiteren SwiftUI-Versatz an: Die Shell positioniert den Host bei `element` bereits. Ihre View ordnet ihre Inhalte innerhalb dieses Hosts an.

## Gemeinsame Projektionsfähigkeiten verwenden

| Fähigkeit | Nutzung durch eine Erweiterung |
| --- | --- |
| Position und Größe | Automatische Host-Positionierung plus `NativeUIContext`; tatsächliche lokale Grenzen über `GeometryReader`. |
| Dunkelmodus und RTL | `context` oder SwiftUI-`@Environment(\.colorScheme)` und `@Environment(\.layoutDirection)`. |
| Reduce Motion und Barrierefreiheit | SwiftUI-Umgebungswerte wie `@Environment(\.accessibilityReduceMotion)` und native Barrierefreiheitsmodifikatoren. Geben Sie eigenen Bedienelementen zugängliche Namen. |
| DOM-basierter Anwendungszustand | JSON-`props` aus `read(element)` zurückgeben; DOM-Änderungen lösen Synchronisierung aus. Ohne DOM-Mutation `shell.markForCheck()` aufrufen. |
| Aktivierte/sichtbare Aktionsziele | `actions.availableNames` oder `actions.isAvailable("increment")`; nicht verfügbare DOM-Ziele werden ausgelassen. |
| Ursprüngliche Web-Aktion auslösen | `try await actions.activate("increment")`; Abschluss und Fehler folgen dem nachstehenden Vertrag. |
| Temporärer Web-Fallback und Bereinigung | Automatisch verwaltet für nicht unterstützte Inhalte, Overlays, Navigationsaussetzung und Quellentfernung. |
| Anwendungsgesteuerte Aussetzung | Aus JavaScript `suspend()` am Shell-Handle, `resume()` am zurückgegebenen Token und `destroy()` verwenden. |

Deaktivieren Sie beispielsweise eine native Schaltfläche, wenn ihre ursprüngliche Aktion nicht verfügbar ist:

```swift
Button("Increment") {
    Task { @MainActor in
        do { try await actions.activate("increment") }
        catch { /* Present an application-appropriate error. */ }
    }
}
.disabled(!actions.isAvailable("increment"))
```

Verfügbarkeit ist eine Momentaufnahme, keine Reservierung: Ein Ziel kann vor der Aktivierung verschwinden; behandeln Sie daher auch Fehler. Eigene Texte, Auswahlzustände, Schriften, Farben und Badges gehören in die `props` und SwiftUI-View Ihrer Erweiterung; die Shell leitet die visuelle Struktur eigener Komponenten nicht aus CSS ab. Lesen Sie berechnete Stile und Attribute des gewünschten Elements in Ihrem Reader. Verwenden Sie die folgenden gemeinsamen Bild- und Farbkonvertierungs-APIs, statt diese Umwandlungen selbst zu implementieren.

## Eine Quellprüfung planen

DOM-Attribute, Text, Kindelemente, beobachtete Elementgrößen, Scrollen und unterstützte Lebenszyklusereignisse lösen automatische Prüfungen aus. Die Shell fragt weder JavaScript-Variablen noch beliebige DOM-Eigenschaften regelmäßig ab. Fordern Sie nach einer Zustandsänderung, die Ihr Reader ohne DOM-Mutation verwendet, eine Prüfung an:

```ts
source.playbackPosition = newPosition; // Eine von der Anwendung definierte Eigenschaft, die Ihre Erweiterung liest.
shell.markForCheck();
```

`markForCheck(): void` plant erneutes Lesen und Geometriemessung; es aktualisiert weder das Anwendungs-DOM noch erzwingt es natives Neuzeichnen. Wiederholte Aufrufe werden gebündelt und unveränderte Snapshots nicht gesendet. Ein Aufruf während eines Bridge-Updates plant eine weitere Prüfung danach. Ausgesetzte Projektion bleibt bis zur Wiederaufnahme ausgesetzt. Aufrufe nach `destroy()` oder ohne Projektionslaufzeit bewirken nichts.

Rufen Sie die Methode auf, nachdem Ihr Framework relevante DOM-Änderungen übernommen hat. Diese API löst weder Angular-Änderungserkennung noch React- oder Vue-Rendering aus und ist kein Promise, das auf nativen Abschluss wartet. Sie funktioniert auch für Standardbedienelemente, deren Eigenschaften sich ohne beobachtbare Mutation ändern.

## Native Grafiken und Farbkonvertierung wiederverwenden

Das zweite Reader-Argument stellt den standardmäßigen SVG-Erfassungs- und Rasterisierungspfad bereit. Es akzeptiert ein lokales `svg` oder ein aufgelöstes `ion-icon` der Quelle und liefert eine **opake Bildreferenz** oder bei nicht unterstützter Grafik `null`. Geben Sie die Referenz in `props` zurück; versuchen Sie nicht, Bildbytes synchron zu lesen:

```ts
const badge = defineNativeUI({
  name: 'app.badge',
  selector: '[data-badge]',
  read(element, context) {
    return {
      props: {
        icon: context.image(element.querySelector<HTMLElement>('ion-icon')),
        color: getComputedStyle(element).color,
      },
    };
  },
});
```

Vor dem Senden des Snapshots löst die Shell Referenzen zu `{ data, width, height, template }` auf: Base64-PNG-Daten, CSS-Abmessungen und Renderingmodus. Verschachtelte Referenzen und Kopien werden unterstützt; `$nativeUIImage` ist für Referenzen aus dem aktuellen Lesekontext reserviert. Verwenden Sie `{ template: true }` als zweites Argument von `image()`, wenn SwiftUI das Symbol tönen soll; standardmäßig bleiben die Quellfarben erhalten. Es gelten dieselben lokalen SVG-Einschränkungen, RTL-Erfassung, Rasterisierung mit Displayskalierung und Bildcache wie bei Standardbedienelementen. Externe Ressourcen und nicht unterstützte SVG-Inhalte liefern `null`; nicht aufgelöste `ion-icon`-Inhalte sollten bis zum Laden den Web-Fallback behalten. Rasterisierungsfehler oder Props über der Größenbegrenzung belassen die Erweiterung im Web.

Dekodieren Sie unter iOS den resultierenden Wert mit `NativeUIImage` und verwenden Sie die gemeinsamen Konverter:

```swift
struct BadgeProps: Decodable {
    let icon: NativeUIImage?
    let color: String
}

struct BadgeView: View {
    let props: BadgeProps
    var body: some View {
        if let icon = props.icon, let image = NativeUIRendering.image(icon) {
            Image(uiImage: image)
                .foregroundStyle(Color(uiColor: NativeUIRendering.color(props.color)))
        }
    }
}
```

`NativeUIRendering.image` liefert bei ungültigen Bilddaten `nil`. `NativeUIRendering.color` akzeptiert berechnete `rgb()`-/`rgba()`-Werte; nicht unterstützte Formate verwenden `.label` oder die angegebene `fallback:`-Farbe. Beide werden mit den nativen Standardrenderern geteilt. Sie werten keine CSS-Selektoren, Variablen, benannten Farben oder beliebigen Stylesheets aus.

## Lebenszyklus und Aktionsabschluss

Die Shell verwaltet Erkennung, Geometrie, Zustandssynchronisierung, native Controller-Einbettung, Projektionsauflösung bei Overlays, Aussetzung und Bereinigung. Erweiterungen implementieren keine Attach-/Detach-Hooks. Web-Quellen werden erst ausgeblendet, nachdem die native Seite die Projektion akzeptiert. Ein nicht registrierter Renderer, fehlerhafter Props-Decoder, nicht unterstützte Position oder fehlgeschlagener Reader belässt die Instanz im Web. Die bestehende Overlay-Regel der Shell gilt: Erweiterungen kehren ins Web zurück, solange Web-Overlays die Seite bedecken.

Elementpositionierung erfordert, dass die Quelle vollständig in den Viewport und die abschneidenden Overflow-Grenzen ihrer Vorfahren passt, einschließlich Ionics Shadow-Scrollcontainern. Teilweise abgeschnittene Quellen bleiben im Web und werden wieder geeignet, sobald sie vollständig sichtbar gescrollt sind. Tab-Zubehör verwendet stattdessen die Positionierung des Systemhosts.

### Aktionsabschluss

| Ereignis | Ergebnis von `try await actions.activate(name)` |
| --- | --- |
| Das ursprüngliche Web-Element erhält seinen Klick | Wird abgeschlossen. |
| Handler startet Netzwerkanfrage, Navigation oder Modal | Wartet nicht auf diese Anwendungsarbeit. |
| Aktion ist deaktiviert, entfernt oder veraltet | Wird abgewiesen. |
| Bereinigung, Abbruch nativer Aufgabe oder Bridge-Timeout | Schließt ausstehende Aufrufe ab. |

Die Bridge-Bestätigung ist eine Capacitor-Promise-Methode.

Der [Demo-Reader](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.3/demo/src/native-ui/counter.ts) und die [Demo-SwiftUI-View](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.3/demo/ios/App/App/NativeUICounter.swift) zeigen beide Positionen mit app-lokalen Dateien. Öffnen Sie die Native UI-Demoseite, um native Projektion mit ihrem Web-Fallback zu vergleichen.

## Beispiel: Mini-Player

Der Demo-Mini-Player zeigt dasselbe Muster mit Titelmetadaten und Wiedergabeaktionen: Ein [DOM-Reader mit Web-Fallback](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.3/demo/src/native-ui/mini-player.ts) wird mit einer [app-lokalen SwiftUI-View](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.3/demo/ios/App/App/NativeMiniPlayer.swift) kombiniert. Die Web-App verwaltet Wiedergabezustand und Modal-Darstellung; native `open`- und `toggle`-Aktionen aktivieren ihre ursprünglichen Schaltflächen. Dies ist ein UI-Beispiel, keine Audio-Engine. Passen Sie die Dateien nach Abschluss der obigen Erweiterungseinrichtung an.