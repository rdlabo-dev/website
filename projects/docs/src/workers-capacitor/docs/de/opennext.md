---
title: "Unterstützung für OpenNext und vinext"
sourceRevision: f815343802c28850c0a4ea7420f4812a61fcc436813858b454f575229db30bc7
---

# Unterstützung für OpenNext und vinext

OpenNext und vinext verwenden das Workers-Kompatibilitätsprofil. Die Unterstützung hängt davon ab, wo die Anfrage ausgeführt wird; entferntes Rendering weist keine lokale Framework-Kompatibilität nach. Das [eigenständige OpenNext-Beispiel](../demo/opennext/README.md) trennt diese Pfade und hält seine Testtreiber außerhalb der Anwendung.

## Ausführung und Konfiguration

- Mit D1 und Asset-first-Routing wird der erzeugte OpenNext-Worker als Ganzes entfernt ausgeführt. Konfigurieren Sie `worker: ".open-next/worker.js"`, `assetsExecution: "remote"` und den bereitgestellten HTTPS-`remote.origin`. Weder Serveranwendung noch virtuelle Dateisystemdateien werden auf das Gerät ausgeliefert; `workerFiles` ist für diese Konfiguration unnötig.
- Lokale Ausführung verwendet den erzeugten Worker in einem Dedicated Worker. Das ausschließlich für Tests vorgesehene Profil des Beispiels deckt öffentliche SSR-Seiten, Client-Hydration, statische Bilder/CSS, Next.js-Links und Middleware ab. Es stellt weder D1 noch lokales ASSETS bereit.
- Das Vite-Plugin transformiert eingebaute `require()`-Aufrufe in erzeugten ESM-`.mjs`-Dateien. Dies ist eine Capacitor-Build-Einstellung; der Cloudflare-Build bleibt unabhängig.

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

## Nachverfolgte Dateien einbetten (`workerFiles`)

Bei einem lokalen erzeugten OpenNext-Einstiegspunkt `worker.js` sammeln beide Bundler-Plugins `.next`-JSON-Manifeste und nachverfolgte `package.json`-Dateien automatisch. Erzeugtes JavaScript, Source Maps, NFT-Traces und Build-Analyseausgaben werden nicht als Dateisystemdaten eingebettet. Ersetzungen durch entfernte Worker sammeln keine Serverdateien.

Zusätzliche Anwendungsdaten, die über `node:fs` gelesen werden, müssen in `workerFiles` als einzelne Pfade (nicht als Verzeichnisse) aufgeführt werden:

```ts
workersCapacitorPlugin({
  worker: ".open-next/worker.js",
  // Nur nötig, wenn die Anwendung zusätzliche Datendateien liest:
  workerFiles: ["./templates/email.txt"],
});
```

Der native lokale Test umschließt den erzeugten Einstiegspunkt, um einen Testtreiber anzuhängen; daher stellt seine [Konfiguration](../demo/tests/opennext/local/vite.config.ts) dieselben Metadaten explizit bereit. Die automatische Erkennung gilt für erzeugte OpenNext-Einstiegspunkte, nicht für beliebige Wrapper-Module oder beliebige Laufzeitdaten Dritter.

VFS-Abfragen normalisieren Trennzeichen und gleichen Suffixe ab, sodass absolute nachverfolgte Pfade unabhängig vom Build-Verzeichnis des Bundles aufgelöst werden.

## Asynchroner Kontext (die tatsächliche Grenze)

- Die Capacitor-Vite-/esbuild-Plugins transformieren asynchrone Funktionen und Generatoren in Promise-Fortsetzungen und bewahren dabei `await` auf oberster Ebene. Die Kompatibilitätsimplementierung erfasst den Kontext bei der Callback-Registrierung und stellt ihn nach jedem synchronen Bereich wieder her. Gleichzeitige und verschachtelte asynchrone Bereiche verwenden separate Stores; eine Serialisierung des Dispatch ist für den gemeinsamen ALS-Contract nicht mehr nötig.
- Nicht transformierte native asynchrone Callbacks, die an `run`/`exit` übergeben werden, werden vor der Ausführung abgelehnt, statt stillschweigend den Store einer anderen Anfrage offenzulegen. Dynamischer Code und extern erstellte Module müssen dieselbe Transformation durchlaufen.
- Die Transformationen und Aliase gehören ausschließlich in den Capacitor-Build. Cloudflare behält sein natives `node:async_hooks`; der Quellcode der Worker-Anwendung bleibt unverändert.
- Patches im direkten Modus wirken auch auf den UI-Realm. Bevorzugen Sie für ALS-abhängige Anwendungen einen isolierten Worker. Die vollständige native Abnahme von OpenNext bleibt vom gemeinsamen ALS-Contract getrennt.

## Abnahme der Upstream-Anwendung

Die [offizielle App-Router-Abnahme-Fixture](../demo/tests/upstream/opennext/README.md) pinnt eine Upstream-OpenNext-Anwendung und bewahrt deren Anwendungsquellcode und Konfiguration. Sie deckt hydrierte Server Actions, Formularaktionen mit Weiterleitungen/Query-Parametern und verzögertes SSR mit Suspense-Lade-Fallback ab. Native Tests prüfen entfernte Worker-Ausführung und WebView-Hydration über die öffentliche API; sie weisen keine lokale Unterstützung von Server Actions nach. Die Browser-Basis läuft separat in CI. Befehle zur Reproduktion sowie Grenzen der Proxy-/Streaming-Tests finden Sie in der Fixture.

## Aktuelle Lücken

- Die nativen Szenarien des Beispiels decken öffentliche Seiten und entfernte D1-/Sitzungsabläufe ab, nicht beliebige Next.js-Anwendungen oder die Leistung von Release-Builds.
- **Bindings:** Verwenden Sie für Cloud-Dienste die [Konfiguration entfernter Bindings](cloudflare-bindings.md) oder explizites lokales KV im direkten Modus. ASSETS bleibt ausschließlich entfernt. Diese allgemeinen Integrationen weisen keine OpenNext-Cache-/Binding-Kompatibilität nach; die Smoke-Konfiguration verwendet Dummy-Caches.
- `createRequire` lädt ausschließlich `.json`; ausführbare nachverfolgte Dateien müssen bereits durch OpenNext gebündelt sein (das sind sie).
- `/_next/image` verwendet das IMAGES-Binding des entfernten Workers. Die Fixture `/images` prüft tatsächliche PNG-zu-WebP-Transformation und Ausgabedimensionen durch natives Rendering. Das öffentliche HTTPS-Szenario verifiziert außerdem das bereitgestellte Cloudflare-IMAGES-Binding auf einem iPhone 15 Pro Max mit iOS 27.0.1 ohne Installation einer Test-CA. Eigene `cdn-cgi`-Loader sind weiterhin nicht verifiziert.
- Der Dokumenthost bewahrt beobachtete Origin-/Fetch-Metadaten. iOS stellt einen fehlenden Formular-Origin nur für einen verifizierten lokalen Main-Frame-Initiator wieder her; undurchsichtige oder unbekannte Initiatoren bleiben nicht vertrauenswürdig. Behalten Sie die CSRF-Validierung bei. Das Beispiel verwendet ein zufälliges Token und ein Secure-, HttpOnly-`__Host-`-Cookie.
- Der native OpenNext-Harness erfasst Bundle-Größe, Zeit vom Start bis zur Hydration (einschließlich Transport und Startwerkzeugen) und, soweit verfügbar, RSS des Host-Prozesses nach der Hydration in `demo/artifacts/opennext-native/*-performance.json`. Dies sind einzelne Debug-Messungen; das Artefakt benennt die Ausführungsumgebung. RSS auf physischem iOS wird nicht erfasst und als `null` gemeldet. RSS umfasst keine separaten WebView-Renderer-/GPU-Prozesse und ist weder Gesamt- noch Spitzenspeicher der Anwendung. Pixel-8a-Messungen mit Android 17 decken lokale und entfernte Ausführung ab; die iPhone-15-Pro-Max-Messung verwendet einen bereitgestellten Worker und D1 über öffentliches HTTPS. Startzeitverteilungen von Release-Builds und Spitzenspeicher sind weiterhin nicht verifiziert.
