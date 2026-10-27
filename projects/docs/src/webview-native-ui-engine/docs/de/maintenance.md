---
title: "Entwicklung und Veröffentlichungen"
sourceRevision: "f224b1d4469ecea5b16600e6297a2bf99637b89ceb2a7ee2c7ce5a3eb815d466"
---
# Entwicklung und Veröffentlichungen

## Entwicklung

Die öffentlichen Einstiegspunkte sind `src/index.ts` und `src/ionic.ts`; gemeinsame Verträge stehen in `src/types.ts`. Die Implementierung ist nach Verantwortungsbereichen gegliedert:

- `src/native/`: Bridge-Transport, native Sitzungen, Start und Ressourcen-URLs.
- `src/projection/`: Bildübergabe, Projektionszuständigkeit, Ereignisse und Stile.
- `src/dom/`: Geometrie, Scrollen, Sichtbarkeit und Overlay-Koordination.

`npm run build` bündelt `src/native/bootstrap.ts` zu `runtime/native-ui-engine.js`, der gemeinsamen WebView-Laufzeit. Android verpackt diese Datei direkt als Asset. Der Build kopiert sie außerdem nach `ios/Sources/WebViewNativeUIEngine/Resources`, da SwiftPM Ressourcen innerhalb des Zielverzeichnisses verlangt. Beide generierten Dateien werden versioniert, damit native Verbraucher kein Node.js benötigen. Bearbeiten Sie die TypeScript-Quelle, keine der generierten Dateien; CI prüft die Neugenerierung und die in npm- und Maven-Archiven enthaltene Laufzeit.

Browsertests spiegeln diese Gruppen unter `tests/`. `tests/cordova/` enthält das echte native Verbraucher-Fixture.

Verwenden Sie wie CI Node.js 24. Führen Sie im Repository Folgendes aus:

```sh
npm ci
npm run build
npm run lint
npx playwright install chromium
npm test
xcodebuild -scheme WebViewNativeUIEngine -destination 'platform=iOS Simulator,id=<booted simulator UUID>' test
```

Lint kombiniert strikte TypeScript-Prüfung, die empfohlenen Standardregeln von ESLint/TypeScript und typisierte Promise-Prüfungen für `src`. Skripte und Tests erhalten Syntax-Linting; Prettier übernimmt die Formatierung. `npm run format` formatiert ausschließlich. Bridge-Payloads und Test-Doubles dürfen explizites `any` verwenden; die Validierung an Produktionsgrenzen bleibt erforderlich. Ein explizites `void` kennzeichnet Hintergrundarbeit, behandelt aber keine abgewiesene Promise. Android verwendet in CI `lintRelease` mit Warnungen als Fehlern; Swift wird auf einem iOS-Simulator kompiliert und getestet.

Die Engine wird unabhängig von ihren Verbrauchern versioniert. Die Veröffentlichungsreihenfolge lautet natives Maven-Artefakt → npm-Engine; Verbraucher aktualisieren separat. Vor npm-Veröffentlichungen wird geprüft, ob das passende POM und AAR auf Maven Central existieren. Build- und Testbefehle veröffentlichen nichts. Tests decken reines DOM, Geometrie mit Nachkommastellen und RTL, veraltete ACKs, Bildzuständigkeit und natives WKWebView-Scrolltracking ab; Verbrauchertests bleiben für Ionic-/SDK-Integration verantwortlich.

CI-spezifische Einrichtung, Paketierungsbefehle und GitHub-Ausgaben sind in `.github/workflows/` definiert. Die Skripte enthalten weiterhin den Laufzeitbuild, wiederverwendbare Verbraucher-/Paketprüfungen und getestete Veröffentlichungslogik (Central-Zustandsbehandlung und npm-Artefaktvergleich).

## Maven-Veröffentlichung

Der Workflow `Native UI Engine Maven Release` wird auf `main` manuell mit der exakten Engine-Paketversion gestartet. Der Commit muss zuvor die CI `Native UI Engine` bestehen. Der Workflow signiert ein AAR, ein Quellarchiv, generierte Kotlin-API-Dokumentation und Maven-Metadaten, lädt einmal hoch und endet, sobald Central `PUBLISHING` oder `PUBLISHED` meldet. Deployment-ID und Zustandsänderungen stehen in der Ausführungszusammenfassung. `PUBLISHING` bedeutet erfolgreiche Validierung und Annahme der Veröffentlichung durch Central; es garantiert noch keine herunterladbaren Artefakte. Dieser Workflow wartet nicht auf die Verteilung. Das npm-Release setzt weiterhin voraus, dass das passende POM und AAR auf Maven Central verfügbar sind. Bestehende Koordinaten werden nie überschrieben; prüfen Sie nach einem Upload-Timeout das verzeichnete Deployment in Central vor weiteren Maßnahmen.

Konfigurieren Sie die Actions-Secrets des Repositorys mit `CENTRAL_USERNAME`, `CENTRAL_PASSWORD` (Central-Benutzertoken), `MAVEN_SIGNING_KEY` (ASCII-armierter privater Schlüssel) und `MAVEN_SIGNING_PASSWORD`. Der öffentliche Signaturschlüssel muss für Central verfügbar sein. GitHub-Secrets gelten nur für dieses Repository.

Führen Sie zur lokalen Paketierungsprüfung `python3 scripts/native-ui-engine-release/verify.py` mit JDK 21, Android SDK 36 und GnuPG aus. Das Skript erzeugt einen temporären Schlüssel, validiert Signaturen und Prüfsummen und löscht seine Test-ZIP ohne Upload. Veröffentlichungen bauen stets mit bereinigten Ausgaben und dem echten Signaturschlüssel neu. Veröffentlichen Sie das Maven-Artefakt vor dem entsprechenden npm-Release, auch bei Vorabversionen.

## Release-Einrichtung für Maintainer

Dieses Repository beginnt mit der zusammengeführten Engine-Implementierung aus [ionic-theme-ios27 `b218d8b`](https://github.com/rdlabo-dev/ionic-theme-ios27/commit/b218d8bfe0c87c02addc668fee9c7aa333489486). Die Auslagerung erhält diese Implementierung; die Unterstützung des Cordova-Hosts wird in diesem Repository entwickelt. Das umbenannte Paket beginnt bei Version `0.0.1`. Veröffentlichen Sie dieselbe Version für npm, SwiftPM und Maven; verwenden Sie die alten Paketkoordinaten nicht erneut.

Die npm-Organisation `webview-native-ui` und der Maven-Central-Namensraum `io.github.webview-native-ui` sind registriert. Pflegen Sie npm Trusted Publishing für `webview-native-ui/engine`, Workflow `release.yml`, und richten Sie die oben genannten Maven-Secrets in diesem Repository ein. Das Verschieben von Quelldateien kopiert keine Zugangsdaten.

1. Bereiten Sie die nächste Version und Release Notes auf `main` vor; erstellen Sie mit `npm run release` einen Standardtag `vX.Y.Z` und ein GitHub-Release. Belassen Sie das GitHub-Release als Entwurf, bis Maven herunterladbar ist.
2. Sobald dieser main-Commit CI besteht, starten Sie `native-ui-engine-release.yml` mit der exakten Paketversion.
3. Central `PUBLISHING` bedeutet angenommener Upload, keine Downloadbereitschaft. Veröffentlichen Sie das vorbereitete GitHub-Release, sobald POM und AAR verfügbar sind. `release.yml` prüft Tag, Paketversion, CI und Maven-Artefakte vor der npm-Veröffentlichung (`next` für Vorabversionen, sonst `latest`).

Kein Build- oder Testbefehl veröffentlicht ein Paket. Bestehende npm-/Maven-Versionen werden nie überschrieben.

Starten Sie `release.yml` mit einem vorhandenen Tag, um dessen Release-Prüfung erneut auszuführen. Geprüft wird der ursprüngliche getaggte Commit; die npm-Veröffentlichung wird nur übersprungen, wenn die vorhandenen Paketinhalte übereinstimmen. Lassen Sie den Tag unverändert. Die Release-Werkzeuge verwenden das mit Node.js 24 gelieferte npm, entsprechend CI.
