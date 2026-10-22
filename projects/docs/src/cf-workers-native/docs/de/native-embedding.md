---
title: "Workers-Oberflächen in eine bestehende native Anwendung einbetten"
sourceRevision: "5de075fc501063dc8794c6a018a8e82a6c69ac9909e588b4929d167f0bf34391"
---

# Workers-Oberflächen in eine bestehende native Anwendung einbetten

Ergänzen Sie Ihre Workers-Seiten als Bildschirm einer bestehenden UIKit-, SwiftUI- oder Android-App. Behalten Sie Einstiegspunkt, Navigation und Startbildschirm der nativen App und verwenden Sie Workers-Routen und Rendering innerhalb der SDK-WebView wieder.

Wählen Sie für die native Einrichtung [iOS](#ios) oder [Android](#android). Beide verwenden den folgenden [gemeinsamen Web-Build](#shared-web-build) und dieselben Laufzeitoptionen. Für eine neue mobile App oder allgemeine native Plugins verwenden Sie die [Capacitor-Integration](integration.md).

Sie erstellen die Web-Assets in Ihrem Webprojekt, ergänzen das native SDK in Ihrer App und öffnen beziehungsweise schließen einen Workers-Bildschirm über dessen native API. Das SDK löst Capacitor intern auf; Ihre native App benötigt weder Capacitor-Konfiguration noch CLI-Befehle.

**0.1.2 Preview:** Installieren Sie `cf-workers-native@0.1.2` mit passenden [nativen Abhängigkeiten](#dependency-setup). Android benötigt WebView-`MULTI_PROFILE`-Unterstützung und ein lokal erstelltes SDK-Artefakt; ein öffentliches Maven-Release gibt es noch nicht.

## Gemeinsamer Web-Build

Die Workers-Anwendung verwendet denselben Worker-Quellcode, dieselben Optionen und dieselbe [Vite-/esbuild-Buildkonfiguration](build-setup.md) wie cf-workers-native. Wählen Sie den Einstiegspunkt für die Zielplattform:

```ts
import { workersIOS } from "cf-workers-native/ios";

const app = workersIOS({
  baseURL: "https://worker.invalid",
  render: "/",
});
await app.ready;
```

Importieren Sie für Android `workersAndroid` aus `cf-workers-native/android` mit denselben Optionen. Beide Einstiegspunkte liefern `ready`, `execution`, `drain()` und `dispose()`. Sie verbinden außerdem das Schließen des nativen Bildschirms mit der Bereinigung in der Worker-Laufzeit. Halten Sie das generierte Asset-Verzeichnis vollständig, einschließlich Manifesten und Laufzeit-Chunks. Erstellen Sie Web-Assets im Webprojekt oder in CI; das native Projekt benötigt weder npm noch `node_modules`, Capacitor-CLI-Befehle oder `capacitor.config.*`.

Erstellen Sie für jedes Ziel einen kleinen Web-Einstiegspunkt. Verwenden Sie beispielsweise die obige `workersIOS`-Initialisierung in `src/main.ts` und diese `index.html` im Stamm:

```html
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Verwenden Sie eine separate mobile Vite-Konfiguration:

```ts
// vite.mobile.config.ts
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "cf-workers-native/tooling/vite";

export default defineConfig({
  plugins: [workersCapacitorPlugin({ worker: "./src/worker.ts" })],
  build: { outDir: "dist-mobile" },
});
```

Führen Sie im Webprojekt `npx vite build --config vite.mobile.config.ts` aus. Der Pluginname bleibt für alle drei Hosts `workersCapacitorPlugin`. Die standardmäßige Ausführungsrichtlinie hält den Worker remote; ersetzen Sie `https://worker.invalid` durch den Origin Ihres bereitgestellten Workers. Für generierte Worker-Einstiegspunkte und öffentliche Assets folgen Sie der [Framework-Anleitung](build-setup.md#frameworks). Verwenden Sie im Einstiegspunkt des Android-Builds `workersAndroid`; halten Sie die Ausgaben der Ziele getrennt.

Verpacken Sie das **gesamte** Ausgabeverzeichnis einschließlich `index.html` in die native App. Richten Sie diesen Build nicht auf die Cloud-Deployment-Ausgabe und ergänzen Sie dieses Plugin nicht im Cloudflare-Build. Lokale Routenerlaubnisse und Remote-Authentifizierungsoptionen entsprechen denen von [Capacitor](integration.md). Das SDK startet den gebündelten Einstiegspunkt; `render: "/"` wählt die anfängliche Worker-Seite. `ready` meldet Laufzeitinitialisierung, nicht den Abschluss von Seitenskripten oder Bildern.

## Abhängigkeiten einrichten

Es gibt ein npm-Paket: `cf-workers-native`. Seine Einstiegspunkte `/ios`, `/android` und `/capacitor` sind Unterpfadimporte, keine separaten npm-Pakete. Es gibt keinen bloßen Paketstamm-Laufzeiteinstiegspunkt. `WorkersIOS` ist ein SwiftPM-Produkt; `io.github.rdlabo:cf-workers-native-android` ist ein Android-Maven-Artefakt.

Das umbenannte npm-Paket wartet auf Veröffentlichung. Installieren Sie danach 0.1.2 Preview im Webprojekt:

```sh
npm install cf-workers-native@0.1.2
```

Erzeugen Sie bis dahin einen JavaScript-Paket-Tarball aus dem passenden Checkout:

```sh
# Im SDK-Checkout:
npm install
npm pack

# Im Webprojekt:
npm install /path/to/cf-workers-native/cf-workers-native-0.1.2.tgz
```

`npm pack` führt den Build über `prepack` aus; der obige Dateiname verwendet die aktuelle Quellversion. Installieren Sie den Tarball statt des Checkout-Verzeichnisses, um einen Symlink zurück in den SDK-Baum zu vermeiden, der für Apps innerhalb dieses Checkouts rekursive Pfade erzeugen kann. Verwenden Sie dieselbe Git-Revision für das iOS-Swift-Paket und die Android-Veröffentlichung. Die Installation des veröffentlichten `workers-capacitor@0.1.1` stellt diese Einstiegspunkte nicht bereit.

Entfernen Sie bei der Migration vom alten npm-Paket die Abhängigkeit `workers-capacitor`, bevor Sie `cf-workers-native` installieren; siehe [Migrationsschritte](integration.md#migrating-from-the-old-npm-package). Behalten Sie im Webprojekt nur das umbenannte Paket.

Das native Projekt konsumiert nur generierte Assets und native Abhängigkeiten. npm und Buildwerkzeuge des Quellcheckouts gehören in den Web-Build oder die CI.

## iOS

Fügen Sie `https://github.com/rdlabo-dev/cf-workers-native` als Swift-Paket hinzu, für das npm-Paket 0.1.2 Preview festgeschrieben auf Tag `v0.1.2` beziehungsweise bei Quellbuilds auf die passende Revision, und wählen Sie das Produkt `WorkersIOS`. Verwenden Sie Xcode 26 / Swift 6.2 oder neuer gemäß den Anforderungen der nativen Abhängigkeitswerkzeugkette. Ergänzen Sie die generierten Assets als Ordnerressource, etwa `WorkerWeb`, und erzeugen Sie den Controller aus diesem Verzeichnis auf dem Main Actor:

```swift
import WorkersIOS

let assets = Bundle.main.resourceURL!.appendingPathComponent("WorkerWeb")
let workers = try WorkersViewController(assets: assets)
workers.onStartupError = { message in
    // Einen Fehler im bestehenden nativen Bildschirm anzeigen.
    print(message)
}
```

Verwenden Sie gewöhnliche UIKit-Kindcontroller-Einbettung oder präsentieren Sie den Controller von Ihrem bestehenden Bildschirm aus. Warten Sie vor dem Entfernen oder Schließen auf den Abschluss des Schließens:

```swift
try await workers.close()
```

Das Schließen gibt Ressourcen auch bei fehlgeschlagener JavaScript-Bereinigung frei; melden Sie diesen Fehler in Ihrer Anwendung angemessen. Ein geschlossener Controller ist endgültig beendet. Erzeugen Sie beim erneuten Öffnen des Workers-Bildschirms einen neuen Controller.

Behalten Sie für SwiftUI den Controller während der gesamten View-Lebensdauer und betten Sie `WorkersView(controller: workers)` ein. Das Representable schließt seinen Controller beim Abbau. Das SDK liefert eine eigene Capacitor-Konfiguration und registriert das Workers-Plugin; Ihre Anwendung registriert keine Plugins und ersetzt ihren Application Delegate nicht.

Ein fehlgeschlagener Worker-Start gibt die eingebettete Laufzeit frei und meldet `startupError` sowie `onStartupError`. Das SDK entfernt oder ersetzt Ihre native Navigation nicht. Wenn der Controller erstmals erscheint, muss der Start innerhalb von 30 Sekunden abgeschlossen sein. Dies erkennt auch fehlende oder beschädigte Einstiegsskripte, die keinen JavaScript-Fehler melden können. Explizites Schließen storniert die ausstehende Startbenachrichtigung.

## Android

Fügen Sie die Android-Maven-Veröffentlichung des SDKs zu Ihren App-Abhängigkeiten hinzu und legen Sie das generierte Webverzeichnis unter `src/main/assets/` ab, etwa als `worker-web`. Die Veröffentlichung löst Capacitor und weitere native Abhängigkeiten auf. Die neue Maven-Koordinate lautet `io.github.rdlabo:cf-workers-native-android:0.1.2`. Ihre Veröffentlichung steht noch aus. Erstellen Sie bis dahin eine lokale Maven-Veröffentlichung anhand des [unabhängigen Android-Verbrauchers](../demo/tests/native-embedding/android/README.md). Nach Veröffentlichung wird sie über Maven Central aufgelöst. Verwenden Sie Java 21 und Android SDK 36; `ANDROID_HOME` muss auf das installierte SDK zeigen. Ergänzen Sie `google()` und `mavenCentral()` in den Abhängigkeitsrepositorys Ihrer App. In deren Groovy-`build.gradle`:

```groovy
dependencies {
    implementation 'io.github.rdlabo:cf-workers-native-android:0.1.2'
}
android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_21
        targetCompatibility JavaVersion.VERSION_21
    }
    packaging.resources {
        excludes += 'META-INF/INDEX.LIST'
        merges += 'META-INF/io.netty.versions.properties'
    }
}
```

Die Ressourcenregeln führen die Metadaten der nativen Netzwerkabhängigkeiten zusammen. Für lokale SDK-Entwicklung oder Releaseprüfung siehe [unabhängiger Android-Verbraucher](../demo/tests/native-embedding/android/README.md). Behalten Sie das generierte Verzeichnis unter `src/main/assets/worker-web/`, mit `index.html` direkt darin.

Öffnen Sie den vom SDK verwalteten Bildschirm aus Ihrer bestehenden Activity:

```java
import jp.rdlabo.workerscapacitor.WorkersNative;

if (WorkersNative.isSupported()) {
    WorkersNative.open(this, "worker-web");
} else {
    // Show an unsupported-WebView message in your existing native UI.
}
```

Die bestehende Activity kann eine ComponentActivity bleiben. Das SDK verwaltet seine AppCompatActivity und WebView; die Anwendung ändert weder ihre Oberklasse noch initialisiert sie eine Capacitor-Bridge oder registriert das Workers-Plugin.

Die installierte Android-WebView muss AndroidX-WebKit-`MULTI_PROFILE` unterstützen. Prüfen Sie `WorkersNative.isSupported()`, bevor Sie den Bildschirm auf Geräten mit unklarer WebView-Verfügbarkeit anbieten. `open()` wirft bei fehlender Funktion `UnsupportedOperationException`; eine Aktualisierung der Geräte-WebView kann sie verfügbar machen.

Das SDK verwendet ein dediziertes dauerhaftes WebView-Profil für Cookies, Storage und Service-Worker-Routing. Bestehende Host-Sitzungscookies, Javas `CookieHandler` und der Service-Worker-Client des Hosts bleiben unverändert. SDK-Cookies sind von Host-Cookies getrennt und bleiben über wiederholtes Öffnen von SDK-Bildschirmen erhalten. Capacitors anwendungsweite Core-Plugins werden in diesem Host nicht registriert.

Es kann jeweils nur ein SDK-Bildschirm aktiv sein. Bei einer Activity-Neuerstellung wird gewartet, bis die vorherige Laufzeit ihre Zuständigkeit freigibt, bevor der Ersatz startet. Der Start muss innerhalb von 30 Sekunden abgeschlossen sein; fehlgeschlagener oder unvollständiger Start schließt den SDK-Bildschirm und kehrt zur bestehenden Activity zurück.

## Kompatibilität

Verwenden Sie übereinstimmende JS- und native SDK-Revisionen. Die neuen Hosts teilen die vorhandene cf-workers-native-Laufzeit und Buildwerkzeuge; sie ändern keine Cloudflare-Deployment-Eingaben und ergänzen kein Remote-Worker-Deployment.

Für allgemeine native Plugins verwenden Sie die bestehende [Capacitor-Integration](native-rendering-api.md). Diese Einbettungs-Hosts stellen die Workers-Oberfläche und ihre Laufzeitverbindung bereit.

## Verifizierung

Prüfen Sie einen tatsächlichen Benutzerablauf in Ihrer Host-App: Öffnen, Navigation, Formularübermittlung, Authentifizierung, Schließen und erneutes Öffnen. Testen Sie unter iOS UIKit-Entfernung oder SwiftUI-Abbau, unter Android auch Rotation und Activity-Neuerstellung. Bestätigen Sie, dass bestehende Host-Sitzungen und WebView-Abläufe weiter funktionieren. Android-SDK-Cookies liegen in einem separaten Profil; nehmen Sie daher keine Übertragung eines Host-WebView-Logins auf das SDK an. Behalten Sie die bestehende Authentifizierung und Autorisierung des Workers; siehe gemeinsame [Sicherheitshinweise](integration.md#5-security-the-device-is-not-a-trusted-server).

Die unabhängigen [iOS](../demo/tests/native-embedding/ios/README.md)- und [Android-Verbraucher](../demo/tests/native-embedding/android/README.md) liefern reproduzierbare SDK-Abnahmeprüfungen einschließlich Startfehlern, fehlender Einstiegsskripte und gesundem Betrieb über das Startzeitlimit hinaus. Diese Prüfungen decken Simulatoren/Emulatoren ab, nicht physische Geräte oder gemessene WebView-Freigabe. Allgemeine Framework-Abnahmen der Capacitor-Demos behaupten nicht, dass jeder Framework-Ablauf auch in diesen Einbettungs-Hosts geprüft wurde.
