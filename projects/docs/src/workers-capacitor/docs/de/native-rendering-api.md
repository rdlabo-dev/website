---
title: "Natives Dokumentrendering mit workersCapacitor"
sourceRevision: 42174a2c590917a75ae4961d2b75e2b1f2bef3710168432b5e2d1ca99de8da6f
---

# Natives Dokumentrendering mit workersCapacitor

Das Paket enthält die native Anbindung für Capacitor 8 (verifiziert mit 8.5.3). iOS verwendet Swift Package Manager, Android verwendet Gradle. CocoaPods ist in dieser Preview nicht enthalten.

## Installation

Installieren Sie das Paket in Ihrer Capacitor-Anwendung anhand der [Preview-Installationsschritte](integration.md#2-install-capacitor-and-this-package).

Konfigurieren Sie den Worker im Vite-/esbuild-Plugin und rufen Sie `workersCapacitor({ baseURL, render: "/" })` auf. Erstellen Sie die Web-Assets vor der Synchronisierung:

```sh
npm run build
npx cap sync
npx cap run ios # or android
```

Die Capacitor-CLI erkennt und registriert das native Plugin. Die Anwendung behält ihre gewöhnliche Activity bzw. ihren ViewController; weder manuelle Registrierung noch kopierte native Quellen sind nötig. Die reine Browser-Fetch-API bleibt ohne Capacitor-Installation verfügbar.

## Anwendungseinstiegspunkt

```ts
import { workersCapacitor } from "workers-capacitor";

const app = workersCapacitor({
  baseURL: "https://worker.invalid",
  render: "/",
});
await app.ready;
```

`render` ist der initiale lokale Dokumentpfad. Lassen Sie es weg, um das bestehende reine Fetch-Verhalten beizubehalten. Der Dokumentmodus benötigt als `baseURL` einen HTTP(S)-**Origin** ohne API-Pfadpräfix. Der Worker erhält URLs unter diesem logischen Origin; die sichtbare Seite behält ihre lokale Capacitor-URL (`capacitor://` unter standardmäßigem iOS, `https://` unter standardmäßigem Android). Der erzeugte Dispatch kann vor einem Handler-Aufruf lokale Ausführung oder den konfigurierten entfernten Worker auswählen; beide Pfade liefern ein Dokument über dieselbe native Bridge zurück. Lokale Fehler werden nicht entfernt wiederholt, und es wird kein lokaler HTTP-Server gestartet. Siehe [Einrichtung der entfernten Ausführung](integration.md#3-configure-and-build-the-native-application).

Hono und Workers Express verwenden dieselbe Grenze `worker.fetch(request, env, ctx)`. Ihre Anwendungsrouter liefern vollständiges HTML für Seiten und JSON für APIs. Der Adapter fügt keinen Anwendungsrouter hinzu. Vorhandene Einstellungen und Funktionen `worker`, `env`, `prefer`, `drain()` sowie die Behandlung von Hintergrundfehlern gelten weiterhin für den Laufzeithost.

`ready` bedeutet, dass Worker und native Verbindung initialisiert sind. Es bedeutet nicht, dass alle Bilder oder Seitenskripte fertig geladen sind. `await app.dispose()` gibt Dokumentverbindung und Laufzeit frei. Auch die reine Fetch-Freigabe kann asynchron sein, während Netzwerkressourcen, ein verzögert geladenes Modul oder eine frühere Android-Dokumentregistrierung freigegeben werden. Verwenden Sie immer `await app.dispose()`, wenn die Bereinigung vor einer erneuten Initialisierung abgeschlossen sein muss. Startfehler im Dokumentmodus stellen die ursprüngliche fetch-Implementierung wieder her; Worker-Startfehler im reinen Fetch-Modus lehnen lokale Anfragen bis zur expliziten Freigabe weiterhin ab.

## iOS Safe Area

Worker-Dokument-WebViews verwenden standardmäßig Content Insets mit `automatic`, wenn `ios.contentInset` fehlt. Ein expliziter Wert in `capacitor.config.ts` oder `capacitor.config.json` hat Vorrang; verwendet werden Capacitors bestehende Optionen `automatic`, `scrollableAxes`, `never` oder `always`.

Für eine Anwendung, die Safe Area in CSS behandelt und randfüllenden Inhalt benötigt:

```ts
const config: CapacitorConfig = {
  // Weitere Capacitor-Einstellungen...
  ios: { contentInset: "never" },
};
```

Führen Sie nach einer Änderung dieser Einstellung `npx cap sync ios` aus. Dieser Standard gilt für die native Worker-Dokumentansicht; die gewöhnliche reine Fetch-WebView behält Capacitors normales Verhalten. Keine neue Option für `workersCapacitor` ist erforderlich.

## Native Plugins

Wählen Sie eine hilfreiche Funktion, etwa Fotos aufnehmen, das Teilen-Menü öffnen oder Feedback nach einer Aktion spüren. Durchsuchen Sie die [offiziellen Capacitor-Plugins](https://capacitorjs.com/docs/apis) und folgen Sie der Installations- und Berechtigungseinrichtung des ausgewählten Plugins.

1. Installieren Sie eine mit Capacitor 8 kompatible Plugin-Version, konfigurieren Sie deren erforderliche iOS-/Android-Berechtigungen, erstellen Sie die Web-Assets erneut und führen Sie `npx cap sync` aus.
2. Rufen Sie das Plugin als Reaktion auf eine Benutzeraktion aus dem clientseitigen JavaScript der Seite auf. Halten Sie diese Aufrufe aus SSR und Worker-Handlern heraus: Die native Funktion gehört zum Gerät. Bei einer entfernt gerenderten Seite gehört das Plugin-JavaScript in deren Client-Build und das native Paket in die Capacitor-Anwendung.
3. Prüfen Sie die Funktion auf jeder Zielplattform, einschließlich verweigerter Berechtigungen, Weg- und Zurücknavigation sowie Fortsetzen der App. Registrieren Sie Seiten-Listener beim Einhängen und entfernen Sie sie beim Aushängen; ein neues Dokument benötigt neue Listener. Läuft dieselbe Seite im Web, bieten Sie das unterstützte Web-Verhalten des Plugins oder eine alternative Oberfläche an.

Siehe [Plugins verwenden](https://capacitorjs.com/docs/basics/using-plugins) für den Capacitor-Ablauf und [Grenzen des Plugin-Lebenszyklus](integration.md#treat-packaged-code-and-data-as-extractable) für den Dokumenthost dieser Bibliothek.

## Build-Konfiguration

Das vorhandene Vite- oder esbuild-Plugin bereitet Dokument-Assets automatisch vor:

```ts
workersCapacitorPlugin({
  worker: "./workers/hono.tsx", // Oder der Workers-Express-Einstiegspunkt.
});
```

Nur `render` wählt zur Laufzeit Dokumentrendering aus; dies ist unabhängig davon, ob die Anwendung `form[action]` verwendet. Builds enthalten die kleinen internen Assets auch für reine Fetch-Anwendungen, registrieren jedoch keinen Service Worker und starten kein natives Dokumentrendering, sofern `render` nicht gesetzt ist.

Verwenden Sie für natives Rendering Vite mit `base: '/'` und erstellen Sie den Build vor Capacitor copy/sync. Der Vite-Entwicklungsserver bleibt für reine Fetch-Entwicklung verfügbar; natives Dokumentrendering erfordert gebündelte Assets. esbuild schreibt die Assets neben seine `outfile` oder nach `outdir` (In-Memory-Builds mit `write: false` bereiten keine nativen Dokument-Assets vor). Legen Sie separat kopierte statische Dateien vor dem Build im Ausgabeverzeichnis ab, damit sie im Asset-Manifest erscheinen.

Die erzeugte Datei `workers-capacitor-assets.json` identifiziert gebündelte Assets, die den Worker-Router umgehen. Alle anderen lokalen Pfade erreichen den Worker. Android verwendet `workers-capacitor-sw.js` für browsernative Request-/Response- und Weiterleitungsverarbeitung. Diese Dateinamen sind Implementierungsassets, keine Anwendungsimporte. Eine reine ESM-Einrichtung muss die entsprechende SW-Datei und das Asset-Manifest selbst bereitstellen; die automatische Asset-Integration umfasst derzeit Vite und esbuild.

## Native Implementierung

- iOS behält den gewöhnlichen Anwendungscontroller. Das Plugin behält dessen bestehende WebView als Laufzeithost und ergänzt einen internen Dokumentcontroller. Dessen Scheme-Handler wird registriert, bevor die Dokument-WebView entsteht. Der Host ruft denselben Fetch Handler über den bestehenden Worker-Transport der Bibliothek auf.
- Android behält die gewöhnliche Activity und sichtbare WebView. Das Plugin erstellt einen persistenten Host mit dem internen Hostmodus des gebündelten Bootstraps. Ein Service Worker leitet Anfragen an diesen Host weiter und liefert Antworten über normale Browsernavigation aus. Der Bootstrap wird im Host erneut ausgeführt; daher sollten Nebeneffekte beim Anwendungsstart nicht nach oder neben dem Laufzeitstart platziert werden.
- Die nativen Quellen des Pakets liegen unter `native/`. `Package.swift` und das Android-Bibliotheksprojekt sind im npm-Tarball enthalten. Mess-/Berichtshooks liegen unter `demo/tests/`; sie gehören nicht zur nativen Implementierung.

Weder ein Austausch der Anwendungs-Activity bzw. des ViewControllers noch iframe, Turbo oder ein Ersetzen des HTML-DOM sind erforderlich. Der Lebenszyklus mit zwei WebViews ist intern im Adapter gekapselt.

## Umfang und Grenzen

Dies ist eine Preview-Version. Dokumentrendering ist ausschließlich nativ; ein gewöhnlicher Dokumentstart in Browser/Electron/Tauri ist nicht implementiert. Bestehendes reines Browser-Fetch-Verhalten bleibt unverändert. Antwortbodys werden in begrenzten Blöcken abgerufen; Dokumentuploads bleiben mit einem Limit von 8 MiB gepuffert. HTTP-Caching ist für Worker-Antworten deaktiviert. Externe Weiterleitungen werden abgelehnt. Unter iOS modelliert die seitenseitige Fetch-Bridge Weiterleitungsmetadaten mit JavaScript-Eigenschaften statt browserinternen Response-Slots. Die iOS-Ergänzung für Multipart-Formulare umfasst lokale POST-Übermittlungen im selben Fenster; benannte Fenster und iframe-Ziele werden nicht unterstützt. Beobachtete Origin- und Fetch-Metadaten-Header bleiben erhalten. Wenn iOS den Formular-Origin weglässt, stellt die Bridge ihn nur anhand eines verifizierten lokalen WebKit-Sicherheits-Origins des Main Frames wieder her. Undurchsichtige oder unbekannte Initiatoren bleiben nicht vertrauenswürdig. Andere native Anfragen können Origin weiterhin weglassen; behalten Sie CSRF-Schutz bei, etwa ein validiertes Token. Origin ist keine Authentifizierung.

Nativer Host-/Child-Lebenszyklus, Zeitlimits für ausstehende Anfragen und explizite Freigabe sind implementiert. Beendigung/Neustart des App-Prozesses, Hintergrund/Vordergrund, Neuinstallationen von Asset-Updates ohne Datenlöschung sowie Herunterfahren mit anschließender Neuinitialisierung werden von der gepackten nativen Fixture abgedeckt, einschließlich ausgewählter Szenarien auf physischen Geräten. Validieren Sie Ihre Anwendung auf ihren Zielgeräten; Wiederherstellung nach WebView-Abstürzen, Speicherdruck und beliebiges Lebenszyklusverhalten von Drittanbieter-Plugins bleiben außerhalb dieser Abdeckung.

## Demo und Validierung

[demo/rendering](../demo/rendering) enthält lesbare Beispiele für Hono/TSX und Workers Express: Root-HTML, Links, POST mit anschließender 303-Weiterleitung und einen JSON-Endpunkt. Das normale reine Fetch-Demo bleibt separat.

`tests/unit/documents.test.ts` prüft den öffentlichen Einstiegspunkt, Startfehler, Wiederherstellung, Freigabe und Routing. Service-Worker-Tests decken POST-Bytes, Weiterleitungszuordnung und Änderungen am Asset-Manifest nach einem Update ab. Vite und esbuild erstellen den öffentlichen Einstiegspunkt in `demo/tests/build/documents.test.ts`.

Die gepackte native Abnahme-Fixture unter `demo/tests/fixtures/apps/packaged-native` ruft dieselbe öffentliche API auf. Ein ausschließlich für Tests verwendeter Worker-Wrapper ergänzt den Browsertesttreiber im zurückgegebenen HTML. Sie wird aus einem echten Tarball in einen unabhängigen Consumer installiert und verwendet anschließend gewöhnliches `cap add`/`cap sync`. Nativer Code und Registrierung werden nicht gepatcht. Reproduktionsbefehle stehen in `demo/tests/README.md`.

### Herunterfahren und Vertrauensgrenze

Android-Shutdown und fehlgeschlagener Start deaktivieren und deregistrieren ausschließlich den Service Worker dieser Bibliothek. Reiner Fetch-Start entfernt ebenfalls eine frühere Dokumentregistrierung; warten Sie vor Verwendung der Anwendung auf `ready`. Bereits kontrollierte Seiten wechseln ohne Warten auf eine Navigation zur nativen Anfragebehandlung. Der deaktivierte Zustand bleibt über die Leerlaufbeendigung des Service Workers hinweg erhalten. Ältere Transporte ohne Shutdown-Protokoll benötigen nach der Deregistrierung ein Neuladen. Android-Fetch-only-`dispose()` kann während dieser Migration ein Promise zurückgeben.

Ein vorhandener Anwendungs-Service-Worker im Root-Scope wird nicht überschrieben. Dokumentrendering meldet stattdessen einen Konflikt. Andere Anwendungsregistrierungen werden bei der Bereinigung nicht entfernt.

Der gebündelte Worker und das von ihm erzeugte HTML sind vertrauenswürdiger Anwendungscode. Seiten laufen am lokalen Capacitor-Origin und können wie gebündeltes HTML auf native Plugins der Anwendung zugreifen. Rendering ist keine Sandbox für nicht vertrauenswürdiges HTML; Anwendungen müssen nicht vertrauenswürdige Werte maskieren und dürfen beliebiges entferntes HTML nicht als vertrauenswürdige Anwendungsseiten rendern. Dieses Vertrauensmodell gilt für iOS und Android.

### Absolute Artikellinks

Gewöhnliche Main-Frame-Links zum konfigurierten `baseURL`-Origin navigieren zum entsprechenden lokalen Dokumentpfad und bewahren Query und Fragment. Stimmen Sie `baseURL` auf den Worker-Origin der Anwendung ab, wenn diese absolute Links erzeugt. Relative Links behalten ihr normales Verhalten.

Der Handler berücksichtigt vom Framework behandelte Klicks, Modifikatortasten, Downloads und andere Ziele als self. Er schreibt weder externe Origins, iframe-Links, absolute Formularaktionen noch beliebige programmatische Navigation um. Android benötigt für dieses Verhalten Unterstützung für WebView-Document-Start-Skripte; iOS verwendet das vorhandene Document-Start-Skript.
