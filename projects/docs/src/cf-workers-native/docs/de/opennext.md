---
title: "Unterstützung für OpenNext und vinext"
sourceRevision: "480fa53a9a952f620a11d1e5dc698108c9148bc7ed06f06c14c3ea8ae9568c83"
---

# Unterstützung für OpenNext und vinext

OpenNext und vinext verwenden das Workers-Kompatibilitätsprofil. Die Unterstützung hängt davon ab, wo die Anfrage ausgeführt wird; entferntes Rendering weist keine lokale Framework-Kompatibilität nach. Das [eigenständige OpenNext-Beispiel](../demo/opennext/README.md) trennt diese Pfade und hält seine Testtreiber außerhalb der Anwendung.

Das Standardbeispiel verwendet Next.js 16.4.2. Routenaufteilung behält außerdem das exakte Kompatibilitätsprofil Next.js 15.5.28 mit OpenNext 1.20.12. Dies verlängert nicht den Upstream-Wartungszeitraum von Next.js 15. Erstellen Sie diese ältere Version mit `next build` und `opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion`; Routenisolierung wendet dieselbe Ausnahme vom Unterstützungszeitraum nur auf 15.5.28 an. Verwenden Sie für 16.4.2 `next build --webpack`; dessen Unterstützungsprüfung bleibt aktiviert. Node-Middleware/-Proxy und unbekannte Buildformate bleiben vollständig remote.

## Ausführung und Konfiguration

### Routenausführung

Für OpenNext 1.20.12 mit Next.js-16.4.2-App-Router-Ausgabe aus `next build --webpack` können Vite- und esbuild-Plugins ausdrücklich ausgewählte statische GET-Routen trennen. Richten Sie `worker` auf den gewöhnlichen generierten Worker; ein zusätzliches Vorbereitungsskript oder Worker-Wrapper ist nicht erforderlich:

```ts
workersCapacitorPlugin({
  worker: "../.open-next/worker.js",
  assetsExecution: "remote",
  execution: [
    { method: "GET", path: "/" },
    { method: "GET", path: "/api/message" },
  ],
});
```

Das Plugin verwendet die vorhandene `.next`- und `.open-next`-Ausgabe, um einen separaten lokalen Einstiegspunkt zu erzeugen. Es führt weder `next build` aus noch überschreibt es den bereitgestellten Worker. Erlaubnisse gelten für Routenregistrierungspfade; Wildcard- und RegExp-Auswahl folgen denselben Regeln wie Hono-Erlaubnisse. Der tatsächliche Anfrageabgleich bleibt für unterstützte statische Routen exakt.

Von Middleware erfasste Routen, dynamische/gruppierte Routen, nicht ausgewählte Pfade, Nicht-GET-Methoden, Anfragen mit Zugangsdaten und Next-Protokollanfragen bleiben remote. RSC-Navigation, Server Actions und lokale Middleware-Ausführung werden durch diesen Routenaufteilungspfad nicht unterstützt. Der Buildbericht erklärt, welche Registrierungen remote bleiben. Benötigt die ausgewählte Ausgabe weiterhin eine Cloudflare-Umgebung, bleibt die gesamte Auswahl remote.

Diese Integration akzeptiert die standardmäßige `defineCloudflareConfig`-Konfiguration mit `incrementalCache`, `tagCache` und `queue` auf `"dummy"`. Andere Versionen, eigene OpenNext-Konfiguration, Next-Rewrites/-Header/eigene Weiterleitungen/Basispfade und nicht öffentliche generierte Umgebungsdaten bleiben remote. Behalten Sie den ursprünglichen Worker bereitgestellt und konfigurieren Sie `remote.origin` der Laufzeit wie gewohnt. Generierte Laufzeitdateien müssen neben dem Worker-Einstiegspunkt bleiben.

Routenerlaubnis umfasst die ausgewählte Implementierung und beibehaltene Abhängigkeiten. Sie ist keine Geheimniserkennung: Prüfen Sie gemeinsamen Code und feste Daten vor der Verteilungserlaubnis. Das Plugin isoliert bekannte von Next erzeugte Vorschau-/Aktionsschlüssel in der lokalen Ausgabe; dies bereinigt keine beliebigen Anwendungszugangsdaten. Explizite `workerFiles` und kopierte öffentliche Assets bleiben Aufgabe der Anwendung.

Das [Routenausführungs-Fixture](../demo/tests/opennext/split/README.md) deckt Vite/esbuild und Chromium/WebKit ab. Native Abnahme der Routenaufteilung umfasst iOS 26.1 und Android API 36.1, einschließlich Hydration, RSC-Navigation zum Remote-Worker, nativen Plugin-Ereignissen, HttpOnly-Sitzungen, D1-Formularaktualisierungen, abgelehntem CSRF, abgelaufenen Sitzungen, Persistenz nach Neustart und Abmeldung. Das öffentliche HTTPS-Routenszenario besteht auch auf einem iPhone 15 Pro Max mit iOS 27.0.1 und dediziertem Worker sowie D1; Ablauf wird in lokalen workerd-Szenarien geprüft. Verwenden Sie `OPENNEXT_SPLIT=1` mit dem nativen Runner. Das [Release-Versatz-Fixture](../demo/tests/opennext/releases/README.md) erzeugt separate Client-/Worker-Builds zur Prüfung eines kompatiblen HTTP-/Formular-Rollouts; dies belegt keine Kompatibilität beibehaltener Server-Action-Closures oder inkompatibler API-/Schemaänderungen.

### Ausführung des gesamten Workers

- Mit D1 und Asset-first-Routing läuft der generierte OpenNext-Worker für nicht von gebündelten Assets bediente Anfragen vollständig remote. Konfigurieren Sie `worker: ".open-next/worker.js"`, `assetsExecution: "remote"` und den bereitgestellten HTTPS-`remote.origin`. Die Serveranwendung wird aus dem Gerätebundle ausgeschlossen. Lassen Sie `workerFiles` ungesetzt: Explizit ausgewählte Dateien werden weiterhin verteilt und sind hier unnötig.
- Lokale Ausführung verwendet den generierten Worker in einem Dedicated Worker. Das reine Testprofil des Beispiels deckt öffentliche SSR-Seiten, Client-Hydration, statische Bilder/CSS, Next.js-Links und Middleware ab. Es liefert weder D1 noch lokales ASSETS. Dies demonstriert Ausführung, keine verteilbare AppShell: Generiertes Server-JavaScript kann weiterhin ausschließlich serverseitigen Code und Next-generierte Schlüssel enthalten. Das Entfernen von Dateisystemmetadaten macht dieses JavaScript nicht sicher verteilbar.
- Das Vite-Plugin transformiert integrierte `require()`-Aufrufe in generierten ESM-`.mjs`-Dateien. Dies ist eine Capacitor-Buildeinstellung; der Cloudflare-Build bleibt unabhängig.

### Client-Assets zusammen mit Remote-Seiten bündeln

Setzen Sie in der Capacitor-Vite-Konfiguration `publicDir` auf die bestehende OpenNext-Asset-Ausgabe. Das Beispiel verwendet einen absoluten, relativ zur Konfigurationsdatei aufgelösten Pfad:

```ts
export default defineConfig({
  root: here("."),
  publicDir: here("../.open-next/assets"),
  plugins: [
    workersCapacitorPlugin({
      worker: here("../.open-next/worker.js"),
      assetsExecution: "remote",
    }),
  ],
  build: { outDir: here("../www"), emptyOutDir: true },
});
```

Importe und `here` finden Sie in der [vollständigen Konfiguration](../demo/opennext/capacitor/vite.config.ts). Gebündeltes `/_next/static/`-JavaScript, CSS und öffentliche Bilder liefert Capacitor aus. HTML, RSC-Navigation, Middleware, Sitzungsverarbeitung, D1-Operationen und `/_next/image` bleiben auf dem Worker. Hydration und Clientereignisse laufen in der WebView mit den gebündelten Skripten. `mode: "worker"` im Buildbericht beschreibt den Serverhandler; es bedeutet nicht, dass jedes Asset remote ist.

Verwenden Sie denselben Anwendungsbuild für bereitgestellten Worker und gebündelte Assets und erhalten Sie bei Updates die Kompatibilität älterer installierter Apps. Fehlende Asset-Pfade fallen auf den Worker zurück. Kopieren Sie nur öffentliche Assets, die Serverauthentifizierung und Antwortheaderregeln umgehen dürfen; Capacitor implementiert Cloudflare-`_headers` oder `_redirects` für gebündelte Dateien nicht. Weder Vite-`publicDir` noch eine einfache esbuild-Kopie berücksichtigt `.assetsignore`. Prüfen Sie, dass die kopierte Ausgabe ausschließlich öffentliche Dateien enthält; enthält sie von Cloudflare-Auslieferung ausgeschlossene Dateien, stellen Sie nur die vorgesehenen öffentlichen Assets in einem separaten Verzeichnis zusammen. Kopieren Sie keine Serverfunktionen oder Prerender-Cache-Ausgabe nach `publicDir`. Eine vorgerenderte Seite kann weiterhin Middleware, Weiterleitungen oder Revalidierung benötigen; Prerendering allein wählt daher keine Seite zur lokalen Ausführung. Anfängliche Seitenanfragen benötigen weiterhin eine Verbindung.

Kopieren Sie mit esbuild die öffentliche Asset-Ausgabe **vor** dem Aufruf von `build()` mit `workersCapacitorPlugin` in das Capacitor-Ausgabeverzeichnis. Das Plugin nimmt vorhandene Dateien ins Dokument-Asset-Manifest auf. Halten Sie die Bootstrap-`index.html` getrennt von Framework-Seiten und vermeiden Sie Pfadkollisionen. Eine zusätzliche Asset-API ist nicht erforderlich.

Verbleibende Laufzeitbeschränkungen finden Sie im [Node-Inventar](compatibility.md).

## Was die Laufzeit bereitstellt

| Oberfläche | Implementierung |
| --- | --- |
| `cloudflare:workers` `env` | Der isolierte Transport setzt vor `worker.fetch` einen realmweiten Proxy; direkter Dispatch setzt ihn nicht. Er ist nicht an eine Anfrage gebunden und während der initialen Modulauswertung nicht verfügbar. Verwenden Sie nach Möglichkeit das Handler-Argument. |
| `cloudflare:workers` `DurableObject` | Basisklasse, damit OpenNexts exportierte DO-Unterklassen (Queue, Tag-Cache, Cache-Purge) aufgelöst und konstruiert werden. Kein DO-Speicher; konfigurieren Sie `open-next.config` mit `incrementalCache: "dummy"`, `tagCache: "dummy"`, `queue: "dummy"`, um sie zu entfernen. |
| `node:async_hooks` | Bereichsgebundene ALS-Näherung (siehe asynchroner Kontext unten). |
| `node:fs` / `node:fs/promises` | Schreibgeschütztes virtuelles In-Memory-Dateisystem. `readFile(Sync)`, `readdir(Sync)`, `existsSync`, `stat(Sync)`, `lstat(Sync)`, `realpathSync`, `promises.{readFile,readdir,stat,lstat,realpath,access}`. Schreibzugriffe werfen Fehler. |
| `node:module` | `builtinModules`, `isBuiltin`, `createRequire` (nur VFS-gestützte `.json`; ausführbare Module werfen Fehler). |
| `node:stream/web` | Eigener Stream-Adapter mit gebündeltem Byte-Stream-Fallback, wenn dieser beim Host fehlt; vollständige Parität mit Workers-Streams ist weiterhin nicht verifiziert. |
| `node:util` | Moduleigene util-Implementierung und gemeinsame Contracts; verbleibende Export-/Engine-Lücken stehen im Inventar. |
| Andere `node:*` | Moduleigene Implementierungen plus Abhängigkeits-Fallbacks; die aktuelle Aliastabelle ist `src/tooling/shared.ts`. Importierbarkeit ist keine Abnahme des gesamten Moduls; siehe Node-Inventar. |

## Explizite Laufzeitdateien (`workerFiles`)

Server-Buildverzeichnisse werden nicht in das Gerätedateisystem kopiert. Die Endung `.json` belegt nicht, dass eine Datei öffentlich ist: Next.js-Manifeste können servergenerierte Schlüssel und Konfiguration enthalten. Der getestete lokale Renderer benötigt diese Dateien nicht als Kopien neben seinem gebündelten Code.

Öffentliche Anwendungsdaten, die über `node:fs` gelesen werden, lassen sich mit `workerFiles` als einzelne Pfade auswählen, nicht als Verzeichnisse. Diese Dateien werden unverändert verteilt; wählen Sie nur für alle App-Nutzer bestimmte Daten aus:

```ts
workersCapacitorPlugin({
  worker: "./src/worker.ts",
  execution: "local", // Nur für Code und Abhängigkeiten, die auf jedem Gerät erlaubt sind.
  // Öffentliche Daten, die dieser lokale Worker liest:
  workerFiles: ["./templates/email.txt"],
});
```

VFS-Abfragen normalisieren Trennzeichen und gleichen Suffixe ab, sodass absolute nachverfolgte Pfade unabhängig vom Build-Verzeichnis des Bundles aufgelöst werden.

## Asynchroner Kontext (die tatsächliche Grenze)

- Die Capacitor-Vite-/esbuild-Plugins transformieren asynchrone Funktionen und Generatoren in Promise-Fortsetzungen und bewahren dabei `await` auf oberster Ebene. Die Kompatibilitätsimplementierung erfasst den Kontext bei der Callback-Registrierung und stellt ihn nach jedem synchronen Bereich wieder her. Gleichzeitige und verschachtelte asynchrone Bereiche verwenden separate Stores; eine Serialisierung des Dispatch ist für den gemeinsamen ALS-Contract nicht mehr nötig.
- Nicht transformierte native asynchrone Callbacks, die an `run`/`exit` übergeben werden, werden vor der Ausführung abgelehnt, statt stillschweigend den Store einer anderen Anfrage offenzulegen. Dynamischer Code und extern erstellte Module müssen dieselbe Transformation durchlaufen.
- Die Transformationen und Aliase gehören ausschließlich in den Capacitor-Build. Cloudflare behält sein natives `node:async_hooks`; der Quellcode der Worker-Anwendung bleibt unverändert.
- Patches im direkten Modus wirken auch auf den UI-Realm. Bevorzugen Sie für ALS-abhängige Anwendungen einen isolierten Worker. Die vollständige native Abnahme von OpenNext bleibt vom gemeinsamen ALS-Contract getrennt.

## Abnahme der Upstream-Anwendung

Die [offizielle App-Router-Abnahme-Fixture](../demo/tests/upstream/opennext/README.md) pinnt eine Upstream-OpenNext-Anwendung und bewahrt deren Anwendungsquellcode und Konfiguration. Sie deckt hydrierte Server Actions, Formularaktionen mit Weiterleitungen/Query-Parametern und verzögertes SSR mit Suspense-Lade-Fallback ab. Native Tests prüfen entfernte Worker-Ausführung und WebView-Hydration über die öffentliche API; sie weisen keine lokale Unterstützung von Server Actions nach. Die Browser-Basis läuft separat in CI. Befehle zur Reproduktion sowie Grenzen der Proxy-/Streaming-Tests finden Sie in der Fixture.

## Aktuelle Lücken

- Die nativen Szenarien des Beispiels decken öffentliche Seiten und Remote-D1-/Sitzungsabläufe ab, keine beliebigen Next.js-Anwendungen oder Release-Build-Leistung.
- **Bindings:** Verwenden Sie die [Remote-Binding-Konfiguration](cloudflare-bindings.md) für Cloud-Dienste oder explizites lokales KV im Direktmodus. ASSETS bleibt ausschließlich remote. Diese allgemeinen Integrationen belegen keine OpenNext-Cache-/Binding-Kompatibilität; die Smoke-Konfiguration verwendet Dummy-Caches.
- `createRequire` lädt nur `.json`; ausführbare nachverfolgte Dateien müssen bereits durch OpenNext gebündelt sein, was der Fall ist.
- `/_next/image` verwendet das IMAGES-Binding des Remote-Workers. Das Fixture `/images` prüft echte PNG-zu-WebP-Transformation und Ausgabeabmessungen durch natives Rendering. Das öffentliche HTTPS-Szenario verifiziert auch das bereitgestellte Cloudflare-IMAGES-Binding auf einem iPhone 15 Pro Max mit iOS 27.0.1 ohne Installation einer Test-CA. Eigene `cdn-cgi`-Loader bleiben ungeprüft.
- Der Dokumenthost erhält beobachtete Origin-/Fetch-Metadaten. iOS rekonstruiert einen fehlenden Formular-Origin nur für einen verifizierten lokalen Main-Frame-Initiator; opake oder unbekannte Initiatoren bleiben nicht vertrauenswürdig. Behalten Sie CSRF-Validierung. Das Beispiel verwendet ein Zufallstoken und ein Secure-/HttpOnly-`__Host-`-Cookie.
- Native Abnahme prüft funktionales Verhalten. Frühere einzelne Debug-Zeit-, Bundlegrößen- und Hostprozess-RSS-Artefakte waren explorative Messungen, keine Regressionsbudgets; der funktionale Testrahmen erhebt sie nicht mehr. Release-Build-Startverteilungen und Spitzenspeicher bleiben ungeprüft.
