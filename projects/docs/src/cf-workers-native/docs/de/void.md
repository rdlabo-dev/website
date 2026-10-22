---
title: "Void React Pages"
sourceRevision: "95de7c234db503cdd1ba352d442e207d89418332047b8da48ad67fe26da4dcfb"
---

# Void React Pages

[Void](https://void.cloud/) erstellt aus Full-Stack-Anwendungen einen Cloudflare Worker und Client-Assets. Die folgende Integration zielt auf **Void / @void/react 1.1.12, React Pages und D1** mit gebündelten Client-Assets und bestehendem Remote-Worker. Explizite Routenerlaubnisse können außerdem geeignete öffentliche GET-Handler auf das Gerät verteilen.

## Ihre Void-App auf Mobilgeräte bringen

Entwickeln Sie Ihre Anwendung weiterhin mit Void und ergänzen Sie für Ihre Nutzer eine iOS- und Android-Version. Diese Anleitung verbindet den von Void bereits erzeugten Worker und dessen Client-Assets mit dem mobilen Build.

Beginnen Sie bei Ihrer ersten mobilen App mit der [Capacitor-Einrichtung](integration.md#2-install-capacitor-and-this-package) und verwenden Sie anschließend die folgende Void-Buildkonfiguration in deren separatem mobilen Build. Sie besitzen bereits eine native App? Folgen Sie der [iOS- oder Android-Einbettungsanleitung](native-embedding.md) und wählen Sie mit derselben Buildkonfiguration den Laufzeiteinstiegspunkt dieses Hosts.

Die folgenden Abnahmenachweise betreffen die Capacitor-Integration; das Einbetten von Void in eine bestehende native App erfordert weiterhin die Prüfung Ihrer Anwendungsabläufe.

## Erstellen und verbinden

Erstellen Sie zunächst die vorhandene Void-Anwendung wie gewohnt mit Node **24.21.0 oder neuer**. Lassen Sie deren Konfiguration für `voidPlugin()` und `voidReact()` unverändert. Void erzeugt `dist/ssr/index.js`, `dist/ssr/wrangler.json` und `dist/client/`.

Verwenden Sie diese erzeugten Dateien in der separaten Capacitor-Konfiguration für Vite 7. Lassen Sie Voids eigene Vite-Konfiguration und -Version unverändert:

```ts
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "cf-workers-native/tooling/vite";

export default defineConfig({
  publicDir: "../dist/client",
  plugins: [
    workersCapacitorPlugin({
      worker: "../dist/ssr/index.js",
      workerConfig: "../dist/ssr/wrangler.json",
      assetsExecution: "remote",
    }),
  ],
  build: { outDir: "../www", emptyOutDir: true },
});
```

Diese Pfade setzen voraus, dass das Build-Stammverzeichnis von Capacitor ein Unterverzeichnis der Anwendung wie `capacitor/` ist. Halten Sie dessen Ausgabe von Voids `dist/` getrennt. Die erzeugte Konfiguration stellt D1- und ASSETS-Bindings bereit; weder das Parsen von `void.config.ts` noch das manuelle Duplizieren von Binding-Namen ist erforderlich. Prüfen Sie im Bericht `workers-capacitor-server.json` des Capacitor-Builds, dass der Ausführungsmodus `worker` ist.

Der Capacitor-Einstiegspunkt verwendet die gewöhnliche öffentliche API:

```ts
import { workersCapacitor } from "cf-workers-native/capacitor";

const runtime = workersCapacitor({
  baseURL: "https://worker.invalid/",
  remote: { origin: "https://your-deployed-worker.example" },
  render: "/",
});
await runtime.ready;
```

Der bestehende Worker verarbeitet Seitenanfragen, Loader und Aktionen. D1-Zugriffe bleiben dort. `publicDir` kopiert die generierten Client-Assets in die native App; der Dokumenthost liefert diese exakten Pfade lokal, sodass Hydration und Clientinteraktionen gebündeltes JavaScript und CSS verwenden. `assetsExecution: "remote"` hält das ASSETS-Binding des Workers remote; es verhindert nicht die Auslieferung gebündelter Dateien. `mode: "worker"` im Bericht beschreibt Serverausführung, nicht Asset-Auslieferung. Der Dokumenthost der Bibliothek zeigt die Antwort als Dokument; siehe [Integrationsanleitung](integration.md) für Capacitor-Installation, Authentifizierung und Dokumentrendering. Der native Test verwendet dieselbe Konfiguration.

## Ausführung öffentlicher GET-Routen

Die Build-Plugins erkennen die generierte Ausgabe exakt von Void 1.1.12, wenn `execution` explizite GET-Routenerlaubnisse enthält. Sie können statische öffentliche HTTP-Handler und React Pages ohne Serverabhängigkeiten isolieren. D1-gestützte Routen, Mutationen, Anfragen mit Cookie- oder Authorization-Headern, dynamische Pfade und frameworkinterne Pfade bleiben remote. Eigene Middleware, Layouts und Head-Konfiguration verhindern diese Optimierung. Unbekannte Routenregistrierungen werden abgewiesen, statt ihre Middleware zu verwerfen.

Ergänzen Sie Erlaubnisse im Capacitor-Build-Plugin, etwa `execution: [{ method: "GET", path: "/about" }, { method: "GET", path: "/api/hello" }]`. Prüfen Sie `workers-capacitor-server.json`: `mode: "routes"` und das `remote`-Flag jeder Route erklären das Ergebnis. Eine Erlaubnis autorisiert die Verteilung des ausgewählten Handlers und seiner beibehaltenen festen Daten; sie belegt nicht, dass die Daten öffentlich sind. Verwenden Sie für alle anderen Anfragen die bereitgestellte HTTPS-Worker-URL als `baseURL`; ein explizites `remote.origin` kann dieses Ziel überschreiben.

Der Browser-Abnahmetest prüft Vite und esbuild in Chromium und WebKit, einschließlich öffentlicher SSR-/API-Ausführung, Remote-Auswahl und Ausschluss von Datenbankcode aus JavaScript und Source Maps. Reproduzieren Sie ihn nach dem Bibliotheksbuild mit `npm --prefix demo run test:void:routes`. Die native Abnahme verwendet Vite auf einem iOS-26.1-Simulator und Android-API-36.1-Emulator. Sie prüft lokales öffentliches SSR, eine hydrierte React-Zustandsaktualisierung, lokalen API-Zugriff, authentifizierte Remote-Auswahl, D1-Formulareinfügung mit Datenbankprüfung und Navigation zu einer rein clientseitigen Seite. Führen Sie die Plattformen nacheinander aus:

```sh
VOID_ROUTES=1 UPSTREAM_PLATFORM=ios UPSTREAM_DEVICE=<simulator-UUID> node --test demo/tests/void/native.test.mjs
VOID_ROUTES=1 UPSTREAM_PLATFORM=android UPSTREAM_DEVICE=<emulator-serial> node --test demo/tests/void/native.test.mjs
```

Dies ist ein Profil generierter Routen, keine allgemeine lokale Void-Laufzeitkompatibilität. Nicht erkannte Generatoren und nicht unterstützte Routingkonfigurationen behalten die Remote-Worker-Grenze.

## SSR und rein clientseitige Seiten

`export const ssr = false` unterdrückt das serverseitig gerenderte HTML der Seitenkomponente. Dadurch wird die Ausführung eines D1-gestützten Loaders auf dem Gerät **nicht** sicher. Lassen Sie diese Anfrage auf dem entfernten Worker ausführen: Void ermittelt dort die Loader-Daten, und der Browser rendert die Komponente. Gewöhnliche SSR-Seiten erhalten initiales HTML und werden mit Voids Client-Assets hydriert. In keinem der beiden Fälle müssen Sie die vorhandene Anwendung in eine SPA umwandeln oder ihre Formulare durch eigene API-Aufrufe ersetzen.

## Grenzen der Verifizierung

Das [eigenständige Beispiel](../demo/void/README.md) und seine Tests decken den generierten Worker in lokalem workerd mit D1, den Capacitor-Remote-Build und Fetch-Transport, anfängliches SSR-HTML, React-Hydration und eine Formularaktion mit Datenbankprüfung in Chromium und WebKit ab. Eine rein clientseitige Seite verwendet denselben D1-Loader und fehlt im anfänglichen HTML, erscheint aber nach Clientrendering. Tests prüfen außerdem, dass Serverschema und SQL im Gerätebuild fehlen. Clientkomponenten sind bewusst enthalten.

Der Browsertest ersetzt die Netzwerkzustellung durch lokales workerd. Der native Test (`demo/tests/void/native.test.mjs`) verwendet HTTPS und die öffentliche Dokument-API, um D1-gestütztes SSR, Hydration, Formulareinfügungen mit Datenbankprüfung und rein clientseitiges Rendering in einem iOS-26.1-Simulator und Android-API-36-Emulator zu testen.

Verwenden Sie für die Navigation mit Capacitor unter iOS **1.1.12 oder neuer**. [Void 1.1.12](https://github.com/voidzero-dev/void/releases/tag/v1.1.12) enthält unsere [Upstream-Korrektur für die Capacitor-Navigation](https://github.com/voidzero-dev/void/pull/485). Die Tests verwenden die veröffentlichten 1.1.12-Pakete, ohne den Router zu patchen oder den standardmäßigen Capacitor-Origin `capacitor://localhost` zu ändern. Versionen vor 1.1.12 lehnen dieses Schema ab; eine initiale HTML-Antwort allein weist keine funktionierende Navigation nach.

Void-spezifische Abnahme auf physischen Geräten, bereitgestellte Cloudflare-Integration, Produktionsauthentifizierung, native Plugin-Ereignisse, Vue, Svelte, Solid, weitere Void-Bindings und lokale Ausführung des gesamten Workers sind ungeprüft.

Erstellen Sie Worker und Capacitor-Assets aus demselben Anwendungsbuild. Unabhängige Bereitstellung unterschiedlicher Client-/Serverversionen kann Hydration oder Aktionen beschädigen; eine ältere installierte App muss mit Ihrem bereitgestellten Worker kompatibel bleiben. Im Bundle fehlende Pfade gehen weiterhin an den Worker.

Bündeln Sie nur öffentliche Dateien, die Worker-Authentifizierung, Middleware und Antwortheaderregeln umgehen dürfen. Capacitor wendet Cloudflare-`_headers` oder `_redirects` nicht auf gebündelte Assets an. Vite berücksichtigt auch die von Void generierte `.assetsignore` nicht: Einträge für `.dev.vars` oder `wrangler.json` schließen diese Dateien nicht aus dem nativen Bundle aus. Prüfen Sie `dist/client` vor dem Kopieren. Enthält es von Cloudflare-Auslieferung ausgeschlossene Dateien, stellen Sie nur die vorgesehenen öffentlichen Assets in einem separaten Verzeichnis zusammen und verwenden Sie dieses als `publicDir`. Nehmen Sie keine privaten Daten, Serverausgaben, `_headers` oder `_redirects` in die kopierten Dateien auf. Vorgerendertes HTML wird nicht automatisch für lokales Rendering ausgewählt. Diese Konfiguration benötigt weiterhin eine Verbindung für anfängliche Seiten und D1-Operationen; sie ist kein Offline-SSR.

Authentifizierung und Autorisierung bleiben Aufgabe der Anwendung. Das Beispiel verfügt über keine Authentifizierung und darf nicht als produktiver Datenendpunkt bereitgestellt werden. Das Entfernen von Servercode ist kein allgemeiner Geheimnisdetektor; betten Sie niemals Zugangsdaten in Client-Seiten, öffentliche Variablen oder die Capacitor-Konfiguration ein.
