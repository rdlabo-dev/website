---
title: "Entwicklung und Tests"
sourceRevision: "bc6ebc0f71acf6b1daf4adccc489ac4f98835fcd3916b8a2c630bd220922c275"
---

# Entwicklung und Tests

Erforderlich sind Node 22.18+ (22.x) oder 24.11+, npm sowie die nativen SDKs für native Tests. Paketveröffentlichung, PR-Erstellung und Cloud-Deployment gehören nicht zu diesen Befehlen.

## Bibliotheks- und Pakettests

```sh
npm install
npm run build
npm run typecheck
npm test
npx playwright install chromium
npm run test:package
```

## Demo- und Integrationstests

In der [Demo-Einrichtungsanleitung](../demo/README.md) erfahren Sie, welche Dateien zu konfigurieren sind und wie die App ausgeführt wird.

Das Demo ist ein unabhängiges npm-Projekt unter `demo/` mit eigenem Paketmanifest. Abhängigkeits-Lockfiles werden lokal erzeugt und nicht eingecheckt. Capacitor, Hono, Express, native Projekte und Integrationstests gehören zu diesem Projekt. Es bezieht die erstellte Bibliothek über `file:..`; es ist kein npm-Workspace.

Das Demo-Layout trennt Anwendungsquellen von Werkzeugen:

```text
demo/
  src/
    main.ts         Runtime initialization and Worker HTML display
    workers/        Hono and Express application code
  tests/
    validation/     Validation page, runners, contracts and Worker entries
    fixtures/
      apps/         Runtime and build-tool test apps
      workers/      Test-only Worker handlers
    scripts/        Node.js helpers that build test apps
    ...             Automated tests and Playwright/Vitest configurations
  ios/, android/    Native projects
```

`demo/src/main.ts` initialisiert die Laufzeit und zeigt das HTML an, das die Worker-Route `/` zurückgibt. Standardmäßig ist Hono ausgewählt; der auskommentierte Express-Eintrag in `demo/vite.config.ts` zeigt den Wechsel. Browsertests erstellen und rendern dasselbe Demo mit jedem Worker. Die separate Seite `demo/tests/validation/` führt Kompatibilitätsprüfungen durch; sie hat einen eigenen Build und wird von den Browsertests separat ausgeliefert. Anwendungsquellen importieren niemals Validierungscode. Ihre gemeinsamen HTTP-Prüfungen liegen in `demo/tests/validation/contracts/http.ts` und werden von Build-Werkzeug- und Laufzeittests wiederverwendet.

Anwendungs-Worker sind als `demo/src/workers/<framework>/<scenario>.ts` organisiert. Die Hono- und Express-Beispiele rendern jeweils HTML unter `/` und stellen `/api/hello` als JSON bereit. Dieses reine Fetch-Beispiel fügt zurückgegebenes HTML in die vorhandene Seite ein; es ist nicht der native Dokumentrendering-Pfad und bietet weder Navigation, Ausführung zurückgegebener Skripte noch Formularbehandlung. Für Worker-eigene Dokumente auf iOS/Android verwendet `demo/rendering` die Funktion `workersCapacitor({ baseURL, render: "/" })` mit der gepackten nativen Integration. Umfassendere Routing- und Fehlerbehandlungsfälle liegen in `demo/tests/fixtures/workers/{hono,express}/standard.ts`; Laufzeit- und Binding-Fixtures liegen ebenfalls unter `demo/tests/fixtures/workers/`.

```sh
cd demo
npm install
npm run typecheck
npm run build
npx playwright install chromium webkit
npm run test:browser
npm run test:workers
npm run test:runtime
npm run test:runtime:dev
npm run test:build-tools
```

`npm run test:build-tools` in `demo` prüft Vite und esbuild mit Hono und Express sowie ungebündeltes Browser-ESM in beiden Ausführungsmodi unter Chromium und WebKit.

`test:workers` führt Vitest-Tests in `demo/tests/workers/` gegen **lokales workerd** aus und verwendet Wranglers `createTestHarness`. Hono und Express haben jeweils zwei Prüfungen für den Demo-Worker und zehn Contract-Fixture-Prüfungen für das in der WebView geprüfte API-Verhalten. Dies ist kein Live-Cloudflare-Deployment. Filtern Sie Tests beispielsweise mit `npm run test:workers -- -t hono`. `test:package` installiert einen echten npm-Tarball in einen neuen temporären Consumer und prüft Pakettypen sowie direkte und isolierte Framework-Ausführung ohne handgeschriebene Aliase/Polyfills.

## Lokale Cloudflare-Entwicklung

Die Cloudflare-CLI-Konfiguration liegt in `demo/cloudflare.config.ts`. Führen Sie aus `demo/` den Befehl `npx cf build --mode hono` oder `npx cf build --mode express` aus, um den entsprechenden Worker zu erstellen; verwenden Sie `npx cf dev --mode hono` (oder `express`) für lokale Entwicklung. Die installierte `cf`-Version ist derzeit Beta. Wrangler bleibt Entwicklungsabhängigkeit für den CLI-Bundler und den Test-Harness; Tests verwenden dieselben Kompatibilitätseinstellungen und prüfen sowohl Beispiel-Worker als auch separate Contract-Fixtures.

## Void React Pages + D1

Verwenden Sie Void / @void/react 1.1.12 oder neuer für die Capacitor-Navigation unter iOS und Android. Das Beispiel pinnt Void / @void/react 1.1.12. Seine iOS- und Android-Tests verlangen erfolgreiche Hydration, Formularübermittlung, D1-Persistenz und rein clientseitige Navigation mit den veröffentlichten Paketen ohne Patches. Einrichtung und Verifizierungsumfang finden Sie unter [Void-Integration](void.md).

## OpenNext + D1

[`demo/opennext`](../demo/opennext/README.md) ist eine eigenständige Next.js-Anwendung mit D1-gestützten Sitzungen, gewöhnlichen Formularen und statischen Assets. Ihr normaler Capacitor-Build sendet Anfragen an den vorhandenen Worker. Separate Tests prüfen öffentliche Seiten lokal, sodass entfernter Erfolg nicht als lokale OpenNext-Unterstützung gezählt wird. Siehe [OpenNext-Konfiguration und Grenzen](opennext.md).

## Verbraucher der nativen Einbettung

Diese unabhängigen Verbraucher prüfen, dass eine bestehende native App das SDK ohne Capacitor-Anwendungseinrichtung verwenden kann. Erstellen Sie zuerst die Bibliothek und folgen Sie dann:

1. [iOS: UIKit- und SwiftUI-Verbraucher](../demo/tests/native-embedding/ios/README.md).
2. [Android: reiner Maven-ComponentActivity-Verbraucher](../demo/tests/native-embedding/android/README.md).

Sie prüfen Navigation, POST, Schließen/Wiederöffnen und Startfehler. Außerdem sichern sie das Bereitschaftszeitlimit, Android-Activity-Neuerstellung und den Erhalt von Android-Host-Cookies sowie Service-Worker-Verhalten ab. Generierte Assets und lokale Veröffentlichungen sind Fixture-Ausgaben, keine Releaseartefakte. Der Workflow `Native embedding` führt beide Plattformen getrennt vom bestehenden Kompatibilitätsworkflow aus.

## Native Capacitor-Demo

Der native Build benötigt Xcode 26 / Swift 6.2 oder neuer und Java 21. HTTP/1.1-Anfrage-Framing und Antwortparsing laufen in JavaScript/WebAssembly. Das native Plugin stellt TCP-/TLS-Byte-I/O und WebView-Integration bereit; iOS verwendet Network.framework ohne AsyncHTTPClient oder Swift NIO. Android verwendet Netty für TCP/TLS ohne dessen HTTP-Codec. HTTPS-Antwortbodys benötigen Content-Length oder Chunked-Framing; EOF-begrenzte HTTPS-Bodys schlagen ausdrücklich fehl, da die native Byte-Bridge authentifiziertes Schließen nicht von Abschneiden unterscheiden kann. Siehe [native Grenze](compatibility.md). Fügen Sie für Android die folgenden Ressourcenregeln innerhalb von `android {}` in `android/app/build.gradle` der Anwendung ein (im Demo bereits vorhanden):

```groovy
packaging.resources {
    excludes += 'META-INF/INDEX.LIST'
    merges += 'META-INF/io.netty.versions.properties'
}
```

Diese Regeln kombinieren Nettys Abhängigkeitsmetadaten; die Bibliothek ändert die Gradle-Konfiguration der Anwendung nicht.

Führen Sie nach dem Erstellen der Web-Assets Folgendes aus `demo/` aus:

```sh
npm run sync
npm run ios
npm run android
```

Android benötigt Java 21+. Das Demo öffnet das minimale Hono-Beispiel. Führen Sie für die separate Validierungs-App mit 26 Prüfungen `npm run test:native:prepare -- validation` und anschließend dieselben sync-/ios-/android-Befehle aus. Dies ersetzt erzeugte `dist/`-Assets; führen Sie `npm run build` und `npm run sync` aus, um die Beispiel-App wiederherzustellen. Weder `server.url` noch ein Entwicklungsserver sind in Capacitor konfiguriert. Ergebnisse erscheinen in der Oberfläche und als `POC_RESULT` in der nativen Konsole. Browsertests wiederholen zusätzlich 18 API-Prüfungen bei deaktiviertem Netzwerk.

## Continuous Integration

Die CI-Zeitbasis, zusammengefasste Einrichtung und Messgrenzen beschreibt [Testausführungsaufwand](test-execution-time.md).

CI führt Bibliotheks-/Typprüfungen, lokale workerd-Verträge, Chromium-/WebKit-Integration, einen frischen npm-Tarball-Verbraucher und neun Android-Anwendungsszenarien in parallelen Jobs aus. iOS-Simulatorprüfungen laufen separat. Das Release-Gate `CI`, die Wiederverwendung verifizierter PR-Ergebnisse auf main und Verifikationsgrenzen beschreibt [CI und Merge-Schutz](../CONTRIBUTING.md#ci-and-regression-protection). CI blockiert Merges nicht.

## Android-Maven-Veröffentlichung

Verwenden Sie den [eigenständigen Veröffentlichungsbuild](../scripts/android-release/README.md), um das Android-SDK unabhängig von einer Capacitor-Anwendung vorzubereiten und zu prüfen. Die CI der nativen Einbettung prüft ein mit temporärem Schlüssel signiertes Bundle und erstellt einen unabhängigen Verbraucher aus diesem Maven-Repository. Eine tatsächliche Central-Veröffentlichung benötigt einen verifizierten Namespace, Release-Signierschlüssel und ausdrückliche Veröffentlichung.
