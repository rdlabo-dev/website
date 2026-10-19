---
title: "D1-gestützte Worker in Capacitor"
sourceRevision: 6c07daba080bb3b8d7adacd08e5e6ca4032e0c8b382f96a11aad49e2a91bd2ce
---

# D1-gestützte Worker in Capacitor

Verwenden Sie den bestehenden Worker-Einstiegspunkt und seine vorhandenen HTTP-Routen. Die Build-Integration belässt Serveroperationen auf dem bereitgestellten Worker und erzeugt den Client-Dispatch; Anwendungsentwickler schreiben keine weitere REST-API, ersetzen keine D1-Aufrufe durch fetch und pflegen keinen zweiten Router.

## Einrichtung

```ts
// vite.config.ts — nur für den Capacitor-Build
import { workersCapacitorPlugin } from "workers-capacitor/tooling/vite";

export default {
  plugins: [workersCapacitorPlugin({ worker: "worker/src/index.ts" })],
};
```

Das Plugin liest `d1_databases` aus der nächstgelegenen Wrangler-JSON-/JSONC-/TOML-Konfiguration nahe dem Worker-Einstiegspunkt oder aus dem Build-Stammverzeichnis. Binding-Namen benannter Umgebungen werden einbezogen. Konfigurationsgeheimnisse und Datenbank-IDs werden nicht in den erzeugten Client kopiert. Ein expliziter Pfad `workerConfig` ist relativ zum Build-Stammverzeichnis. Geben Sie für andere Konfigurationswerkzeuge `d1Bindings: ["DB"]` an. Das esbuild-Plugin akzeptiert dieselben Optionen.

```ts
// App-Start — der Worker mit der Geschäftslogik bleibt unverändert
import { workersCapacitor } from "workers-capacitor";

const runtime = workersCapacitor({
  baseURL: "https://local.invalid/",
  remote: {
    origin: "https://existing-worker.example.com",
    // Optional: Eine bestehende Sitzung verbinden, wenn Anfragen noch nicht
    // ihren Authorization-Header enthalten. Dies ist kein neues Anmeldesystem.
    getToken: () => existingSession.getToken(),
  },
});
await runtime.ready;

// Die bestehende URL und der HTTP-Vertrag bleiben unverändert.
const response = await fetch("/api/counters/alice");
```

Der bereitgestellte Worker behält seine bestehende Authentifizierung, Autorisierung, Eingabevalidierung, Geschäftsoperationen und D1-Bindings. Es gibt weder einen allgemeinen SQL-Endpunkt, Query-ID-Endpunkt, eine Client-D1-Implementierung, Schema-Migrations-API noch ein Cloudflare-Verwaltungstoken im Client. Die Bereitstellung des Servers bleibt eine separate Aktion.

## Auswahl der Ausführung

Bei statisch analysierbaren Hono-Anwendungen verfolgt der Compiler lokale Modulimporte und Re-Exporte, Hilfsfunktionen, eingebundene Router, verkettete Registrierungen und Middleware. Er erzeugt einen Selektor mit denselben Hono-Matching-Regeln. Benötigt eine passende Operation Serverausführung, geht die gesamte Anfrage an den bestehenden Worker, **bevor irgendeine lokale Anwendungsmiddleware oder ein Handler läuft**. Dies deckt auch Fallthrough und überlappende Routen ab. Reine Routen bleiben lokal.

D1-Bindings, Serverwerte in `env`, unbekanntes Abhängigkeitsverhalten, dynamischer Eigenschaftszugriff und mit Serveroperationen geteilter veränderlicher Zustand erweitern die Servergrenze. Ein `env`-Binding darf mit der Build-Option `localBindings: ["LABEL"]` explizit lokal gehalten werden, wenn es über `workersCapacitor({ env })` bereitgestellt wird. Ein D1-Binding kann nicht als lokal deklariert werden. Unbekannte Initialisierung auf oberster Ebene, interner Router-Dispatch, impliziter globaler Zustand und Cookie-/Header-Zustand halten ebenfalls den gesamten Worker auf dem Server. Die Analyse ist bewusst konservativ; sie kann mehr Arbeit an den Server senden, als ein Mensch sicher abtrennen könnte.

Wenn eine Aufteilung die Dispatch-Semantik nicht bewahren kann, delegiert der erzeugte Client **alle Anfragen an den bestehenden Worker** und enthält nichts von dessen Anwendungsimplementierung. Dies umfasst allgemeine Fetch-Handler und Workers Express. Der Build meldet den Grund, statt Benutzer zum Umschreiben ihres Workers zu zwingen. Dieser Modus benötigt für jede abgefangene Anfrage eine Verbindung; er macht die bestehende Anwendung nicht offline verfügbar. Er wird niemals dadurch gewählt, dass nach teilweiser Ausführung einer Operation ein D1-Fehler abgefangen wird.

Bei reinen D1-Builds erzeugen beide Integrationen `workers-capacitor-d1.json` mit dem gewählten Modus und den Routen-/Middleware-Registrierungen. Dieser Bericht ist diagnostische Metadaten, kein von Anwendungsautoren gepflegter zweiter Router.

## Codeentfernung und Ausführungsgrenzen

Der Compiler erzeugt den lokalen Graphen, bevor der Bundler Client-Source-Maps erstellt. Entfernte Handler und ihre nicht mehr verwendeten Hilfsfunktionen fehlen im erzeugten Quellcode, einschließlich `sourcesContent`. Derselbe Graph versorgt direkte und Dedicated-Worker-Ausführung. Ein separater Import ursprünglicher Worker-Module in den Client wird abgelehnt, weil er die Entfernung umgehen würde. Kopieren Sie Serverquellen, SQL-/Migrationsdateien oder Server-Maps nicht manuell in öffentliche Assets; diese Dateien gehören nicht zum erzeugten Modulgraphen. Verwenden Sie beim Packen ein sauberes Ausgabeverzeichnis.

Selektor und Verbindung laufen in beiden Ausführungsmodi im Host. Sitzungs-Callbacks bleiben im Host und werden nicht per Structured Clone in einen Dedicated Worker übertragen. Die Anfrage läuft direkt über den bestehenden ausgehenden Transport, selbst wenn der entfernte Origin die lokale Interzeptions-URL überlappt. Es wird keine lokale fetch-Rekursion verwendet. Native Anfragen verwenden den bestehenden TCP-/TLS-Transport und eigene Socket-Bereiche. Browseranfragen behalten CORS bei und puffern Upload-Bodys für WebKit-/HTTP/1-Unterstützung. Native manuelle Dokumentanfragen behalten Streaming bei; Fetch-Follow-Modus puffert einen Upload, damit eine gleichursprüngliche 307/308-Weiterleitung seinen Body erneut senden kann.

Pfad, Query, Methode, Body und Antwortstatus bleiben erhalten. Ein vorhandener Authorization-Header wird wiederverwendet, sofern `getToken` nicht angegeben ist. Ist getToken angegeben, ersetzt ihn das aktuelle Token bei jeder Anfrage; fehlt ein Token, werden veraltete Bearer-Zugangsdaten entfernt.

Unter nativem Capacitor verwenden bestehende serververwaltete Cookie-Sitzungen den Cookie-Speicher des Betriebssystems für den entfernten Host. Set-Cookie wird vor einer Weiterleitung im Host verarbeitet; HttpOnly-Cookies werden dem gerenderten Dokument nicht offengelegt. Pfad, Ablauf und Logout-Semantik persistenter Cookies bleiben erhalten. Lokale Dokument-Cookies werden niemals blind weitergeleitet. Cookie-abhängige Worker laufen vollständig auf dem bereitgestellten Worker, sodass Login, Profil und Logout eine Sitzungsgrenze teilen. Benutzer melden sich über die bestehende Login-Seite an; Cookies eines separaten Desktop-Browsers werden nicht importiert. Verwenden Sie `render: "/"` zusammen mit `remote: { origin }`, um die bestehende Worker-Oberfläche zu rendern.

Native Weiterleitungen innerhalb des konfigurierten entfernten Origins bewahren die HTTP-Semantik: 303 ändert POST zu GET, 307/308 bewahren Methode/Body, und manuelle Dokumentweiterleitungen werden auf den logischen Origin der Anwendung zurückgeführt. Weiterleitungsketten sind begrenzt. Weiterleitungen zu einem anderen Origin werden abgelehnt, bevor Zugangsdaten dorthin gesendet werden. Externe OAuth-/SSO-Abläufe benötigen eine explizite Integration eines externen Browsers und werden hier nicht bereitgestellt. Auch Client-Skripte, die entfernte Nicht-HttpOnly-Cookies über lokales `document.cookie` lesen müssen, werden nicht überbrückt.

In gewöhnlichen Browsern verwenden entfernte Anfragen `credentials: "include"`; der bereitgestellte Worker muss den tatsächlichen App-Origin und Zugangsdaten in CORS-Antworten erlauben. Ein Wildcard-Access-Control-Allow-Origin genügt nicht. Browser-Cookie-Datenschutz und SameSite-Regeln gelten weiterhin. Browser verbergen manuelle Weiterleitungsziele, daher melden entfernte Weiterleitungen dort einen ausdrücklichen Fehler wegen fehlender Unterstützung. Die Abnahme nativer Dokumente muss deshalb auf iOS/Android erfolgen und darf nicht aus Browser-API-Tests abgeleitet werden.

401 und Netzwerkfehler werden ohne automatische Wiederholungen oder lokalen Fallback zurückgegeben. Abbruch und Laufzeitfreigabe beenden ausstehende Zugangsdatenabfragen/Transporte; ein verspätetes Token kann nach der Freigabe nichts mehr senden. SQL-Entfernung reduziert die Offenlegung der Serverimplementierung; sie ersetzt keine serverseitige Autorisierung und erkennt keine beliebigen fest kodierten Geheimnisse in ansonsten lokalem Anwendungscode.

## Sicherheit des gemeinsamen Transports und Upload-Limits

App-lokale `Origin`- und `Referer`-Header werden für bestehende Worker-Navigation auf den entfernten Origin umgeschrieben. Behandeln Sie den umgeschriebenen Origin allein nicht als Nachweis vertrauenswürdiger Benutzerabsicht. Behalten Sie bestehende CSRF-Token-Prüfungen bei und beschränken Sie WebView-Inhalt/-Navigation sowie Zugriff auf die native Bridge. HttpOnly verbirgt Cookies vor Skripten, verhindert aber nicht authentifizierte Anfragen durch kompromittierte Skripte. Nativer Cookie-Transport verspricht keinen browsergleichen SameSite- oder CSRF-Schutz.

Browseruploads und native Fetch-Uploads mit Weiterleitungsverfolgung werden standardmäßig bis 8 MiB gepuffert. Konfigurieren Sie `remote.maxBufferedBodyBytes` mit einer nicht negativen sicheren Ganzzahl (Bytes). Eine Überschreitung bricht den Body-Produzenten ab und lehnt vor dem Netzwerk-Dispatch ab; der Wert 0 erlaubt nur leere Bodys. Native manuelle/Error-Weiterleitungsmodi behalten Streaming bei. Dies begrenzt Transportpufferung, nicht den gesamten Anwendungsspeicher oder bereits vom Aufrufer allokierte Bodys. Wenden Sie Anwendungslimits vor der Allokation großer Uploads an; verwenden Sie für größere Objekte R2-Multipart-Uploads.

Hyperdrive verwendet denselben Transport; siehe die [Hyperdrive-Anleitung](hyperdrive-transparent-migration.md) für Binding-Einrichtung und zusätzliche Datenbankgrenzen.

## Verifizierung

`npm test` im Stammverzeichnis enthält Compiler-/Konfigurations- und Remote-Laufzeittests. Führen Sie nach dem Root-Build und der Installation der Demo-Abhängigkeiten Folgendes aus:

```sh
cd demo
npm run test:d1-migration
```

Die Integration verwendet einen unveränderten gewöhnlichen Hono-Worker und lokales workerd-D1. Sie prüft den öffentlichen Start über Vite/esbuild, Chromium/WebKit und direkte/isolierte Ausführung, jeweils selektiv und für den gesamten Worker. Prüfungen umfassen bestehendes Lese-/Schreibverhalten, Datenbankzustand, Autorisierung, 401 ohne Wiederholungen, HEAD, lokale Routen ohne Netzwerk sowie Entfernung von SQL-/Hilfsmarkern aus JS und Maps. Die Suite prüft außerdem Vite-Entwicklungsstart, Ablehnung ursprünglicher Quellen und erneute Kompilierung nach Dateiänderung. Sie ist im Kompatibilitäts-CI-Job enthalten.

Reproduzierbare native Verifizierung verwendet einen neuen npm-Tarball-Consumer, eine unabhängige App-ID, einen lokalen HTTPS-Testserver und ein Testzertifikat, dem nur der Simulator-/Debug-Consumer vertraut:

```sh
node demo/tests/experiments/d1/native-server.mjs
# In einer anderen Shell nach npm run build:
node demo/tests/experiments/d1/native-prepare.mjs
node demo/tests/experiments/d1/native-run.mjs ios <simulator-uuid>
node demo/tests/experiments/d1/native-run.mjs android <emulator-serial>
```

Führen Sie die Plattformen nacheinander aus, da die Testdatenbank geteilt wird. Android verwendet standardmäßig Java 21 aus Android Studio; `D1_JAVA_HOME` kann dies überschreiben. `native-prepare.mjs --refresh` packt den Kandidaten erneut und aktualisiert denselben isolierten Consumer. Berichte, Logs, Paketintegrität und serverseitige DB-Snapshots liegen in `demo/artifacts/d1-native/`. Browserberichte und geprüfte Bundles liegen in `demo/artifacts/d1-integration/`.

Verwenden Sie für die Abnahme gerenderter Cookie-Sitzungen dieselben Skripte mit `--ui`:

```sh
node demo/tests/experiments/d1/native-server.mjs --ui
node demo/tests/experiments/d1/native-prepare.mjs --ui
node demo/tests/experiments/d1/native-run.mjs ios <simulator-uuid> --ui
node demo/tests/experiments/d1/native-run.mjs android <emulator-serial> --ui
```

Der unabhängige UI-Consumer verwendet `render: "/ui/account"` und einen gewöhnlichen Worker ohne Capacitor-Importe. Ein reiner Test-DOM-Treiber füllt Eingaben und aktiviert echte Formulare/Links in der gerenderten WebView; er ersetzt Navigation nicht durch API-Aufrufe. Derselbe Worker läuft in workerd. Tests prüfen CSS-/JS-Assets, Login, einen einzelnen D1-Schreibzugriff über POST/303/GET, Detailnavigation, persistente Sitzung nach Prozessneustart, Logout und einen weiteren Neustart ohne Authentifizierung. Serverseitige D1-Snapshots, Screenshots und Berichte werden in `demo/artifacts/d1-native-ui/` gespeichert. Führen Sie Plattformen nacheinander aus. `native-prepare.mjs --ui --refresh` aktualisiert diesen Consumer aus einem neuen Paket-Tarball.
