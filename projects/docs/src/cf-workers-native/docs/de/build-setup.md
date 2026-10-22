---
title: "Build-Einrichtung"
sourceRevision: "c8207e44e81bc309f7ec6f13387ef9b4f048d9a56d3bcaa0e35b952a2cf149a0"
---

# Build-Einrichtung

Wählen Sie zuerst das Framework Ihrer Anwendung und konfigurieren Sie anschließend das Buildwerkzeug für die iOS-, Android- oder Capacitor-Integration. Die Framework-Anleitung bestimmt Worker-Einstiegspunkt und Ausführungsgrenze; das Werkzeug-Plugin verbindet diesen Einstiegspunkt mit der mobilen App. Halten Sie den bestehenden Cloudflare-Build getrennt.

Verwenden Sie für den mobilen Build eine separate Konfiguration und ein separates Ausgabeverzeichnis. Das Plugin liest Server-Einstiegspunkt und Deployment-Konfiguration und erzeugt eine mobile Kopie, ohne diese Eingaben umzuschreiben. Vite weist SSR-/Serverumgebungen und Konfigurationen mit dem Cloudflare-Vite-Plugin zurück. Beide Builder weisen Ausgabeverzeichnisse mit bekannten Servereingaben zurück; bestehende Links darin werden abgewiesen, um Schreibzugriffe durch sie zu verhindern. Verwenden Sie kein beliebiges Cloudflare-Deployment-Verzeichnis als mobile Ausgabe: Das Plugin kann nicht jedes eigene Buildverzeichnis erkennen. Die OpenNext-Routenkompilierung verwendet ein temporäres Verzeichnis in `node_modules/.cache/workers-capacitor/opennext`, außerhalb von `.next` und `.open-next`.

Diese Buildgrenzen erhalten das bestehende Cloudflare-Deployment. Explizite Cliententscheidungen wie lokale Ausführung, Remote-Origin und `getToken` steuern weiterhin, welche Anfragen es erreichen und wie sich der Client authentifiziert; sie ändern weder Serverrouten noch Autorisierungslogik oder Bindings.

## Laufzeiteinstiegspunkt wählen

Das Bundler-Plugin heißt bei jedem Host weiterhin `workersCapacitorPlugin`. Nur der Laufzeitimport der Anwendung ändert sich; Worker-Quellcode und Ausführungsoptionen werden gemeinsam verwendet.

| Host | Laufzeitimport | Native Einrichtung |
| --- | --- | --- |
| iOS | `workersIOS` aus `cf-workers-native/ios` | [UIKit / SwiftUI](native-embedding.md#ios) |
| Android | `workersAndroid` aus `cf-workers-native/android` | [Bestehende Android-App](native-embedding.md#android) |
| Capacitor | `workersCapacitor` aus `cf-workers-native/capacitor` | [Capacitor-App](integration.md) |

Verwenden Sie `cf-workers-native@0.1.2` mit passenden nativen Abhängigkeiten; siehe [Abhängigkeiten einrichten](native-embedding.md#dependency-setup). Erstellen Sie für jedes Ziel den entsprechenden Einstiegspunkt und verpacken Sie anschließend das gesamte Ausgabeverzeichnis. Die folgenden bestehenden Capacitor-Beispiele verwenden `workersCapacitor`; dieselben Optionen gelten für `workersIOS` und `workersAndroid` in ihren SDK-Hosts.

## Frameworks

Für die folgenden Integrationen liegen Beispiele und Verifizierungsnachweise vor. Die Unterstützung beschränkt sich auf die hier beschriebenen Ausführungspfade; API- und Anwendungseinschränkungen finden Sie unter [Kompatibilitätsgrenzen](compatibility.md).

| Framework | Ausführung und verifizierter Umfang | Einrichtung |
| --- | --- | --- |
| Hono | Lokale Fetch-Handler und HTML-Seiten; Routing, Formulare und Anfrage-/Antwortverhalten werden in den Hono-Fixtures geprüft. Cloudabhängige Anfragen verwenden Remote-Dispatch. | [Hono-Einstiegspunkt](#hono), [Beispiel für natives Rendering](../demo/rendering) |
| Workers Express | Lokale Ausführung über `cloudflare:node`; Fixtures für API und HTML-Rendering. Cloudabhängige Anfragen verwenden Remote-Dispatch. | [Workers-Express-Einstiegspunkt](#workers-express), [Beispiel für natives Rendering](../demo/rendering) |
| Void React Pages | SSR, Loader und Aktionen auf dem Remote-Worker; Client-Hydration und Formulare in der WebView. Verwenden Sie Void / @void/react 1.1.12 oder neuer; veröffentlichte 1.1.12-Pakete bestehen die Abnahme auf iOS-Simulator und Android-Emulator. | [Void-Einrichtung und Verifikation](void.md) |
| Next.js / OpenNext | Netzwerkausführung ist Standard. Unterstützte generierte Builds können statische GET-Routen lokal auswählen und D1, Middleware sowie Next-Protokollanfragen remote belassen; beachten Sie Versions- und Konfigurationsgrenzen. | [OpenNext-Einrichtung und Grenzen](opennext.md) |

### Hono

Binden Sie den vorhandenen Fetch Handler der Anwendung ein. Zum Beispiel:

```ts
import { Hono } from "hono";

const app = new Hono();
app.get("/", (c) => c.html("<h1>Hello from Hono</h1>"));
app.get("/api/hello", (c) => c.json({ hello: "world" }));
export default app;
```

Richten Sie die Option `worker` des [Vite](#vite)- oder [esbuild](#esbuild)-Plugins auf diesen Einstiegspunkt. Verwenden Sie `render: "/"` für Seiten des Workers oder lassen Sie `render` weg, wenn Sie ein vorhandenes Frontend mit der API verbinden. Folgen Sie der [Anleitung zur Anwendungsintegration](integration.md) für Capacitor-Einrichtung, Cloud-Bindings und Authentifizierung.

Beginnen Sie mit dem Standard `execution: "network"` und setzen Sie `baseURL` auf die HTTPS-URL des bereitgestellten Workers. Remote-Anfragen verwenden deren Origin, sofern Sie nicht ausdrücklich einen anderen bereitgestellten Origin unter `remote.origin` angeben. Um ausgewählte Implementierungen auf dem Gerät ausliefern zu dürfen, setzen Sie `execution` auf ein Routenarray. Hono-Pfade wie `/app/*` werden unterstützt. Die Erlaubnis umfasst beibehaltene Abhängigkeitsdaten und hebt erkannte Servergrenzen nicht auf. Siehe [lokale Routenauswahl](cloudflare-bindings.md#selecting-local-routes).

### Workers Express

Das Beispiel verwendet das echte Paket `express` und den Workers-Einstiegsstil:

```ts
import express from "express";
import { httpServerHandler } from "cloudflare:node";

const app = express();
app.use(express.json());
app.get("/api/hello", (_req, res) => res.json({ hello: "world" }));
app.listen(3000);
export default httpServerHandler({ port: 3000 });
```

Verwenden Sie das [Vite](#vite)- oder [esbuild](#esbuild)-Plugin ausschließlich im mobilen/Browser-Build, niemals im Cloudflare-Build. Es liefert Workers-kompatible Adapter für `node:http` und `node:net` neben Browser-Polyfills; das [Kompatibilitätsverzeichnis](compatibility.md) dokumentiert verifizierte Basis und Module. `listen(3000)` registriert einen Handler im Speicher, keinen lauschenden TCP-Port. Das Plugin unterstützt Hono und Workers Express; Framework-Code bleibt unverändert.

Der Standard `execution: "network"` belässt den Worker vollständig remote. Setzen Sie `baseURL` in `workersCapacitor()` auf die HTTPS-URL des bereitgestellten Workers; setzen Sie `remote.origin` nur, wenn der Remote-Origin vom Origin von `baseURL` abweichen muss. Ergänzen Sie für eine bewusst eigenständige Express-App `execution: "local"` in den folgenden Vite- oder esbuild-Plugin-Optionen. Dies erlaubt die Auslieferung der gesamten Worker-Implementierung und beibehaltener fester Daten auf das Gerät; verwenden Sie es nicht mit Servergeheimnissen. Konfigurierte Server-Bindings lassen `local` beim Build fehlschlagen. Siehe [Ausführungsrichtlinien](cloudflare-bindings.md#choosing-execution).

#### TypeScript-Typen

Das Paket stellt den Typ für `cloudflare:node` für seinen unterstützten Adapter `httpServerHandler` bereit. Fügen Sie ihn für einen Browser-Build ohne vorhandene Workers-Typdeklarationen zu `compilerOptions.types` in `tsconfig.json` hinzu:

```json
{ "compilerOptions": { "types": ["cf-workers-native/cloudflare/apis/types"] } }
```

Behalten Sie alle anderen bereits verwendeten Typen bei. Dieser Einstiegspunkt dient nur der Typisierung; importieren Sie ihn nicht zur Laufzeit. Projekte mit generierten Workers-Typen sollten stattdessen diese Deklarationen behalten. Eine anwendungseigene `cloudflare.d.ts` oder `client.d.ts` ist nicht erforderlich.

### Angular auf Workers

Diese Integration ist noch nicht verifiziert. Das Ziel ist eine **bestehende Angular-SSR-Anwendung, die auf Cloudflare Workers bereitgestellt ist** und deren Rendering, Routing und Hydration bei der Übernahme in Capacitor erhalten bleiben. Eine dedizierte Konfiguration des Worker-Einstiegspunkts und ein Abnahmebeispiel sind noch erforderlich, bevor sie als unterstützt aufgeführt werden kann.

Die Unterstützung von Vite oder esbuild allein weist keine Angular-SSR-Unterstützung nach. Die reine Fetch-Integration eines separaten Frontends ist ein anderer Anwendungsfall.

## Werkzeuge

Diese Versionen beschreiben den separaten mobilen Build. Der bestehende Cloud-Build eines Frameworks kann ein anderes Werkzeug oder eine andere Version verwenden; lassen Sie ihn unverändert und verbinden Sie seinen generierten Worker gemäß der Framework-Anleitung.

| Build | Einrichtung | Eingabe |
| --- | --- | --- |
| Vite 7 | Plugin `cf-workers-native/tooling/vite` | TypeScript-/JavaScript-Worker-Einstiegspunkte, einschließlich der oben beschriebenen Framework-Ausgabe |
| esbuild 0.28 | Plugin `cf-workers-native/tooling/esbuild` | TypeScript-/JavaScript-Worker-Einstiegspunkte, einschließlich der oben beschriebenen Framework-Ausgabe |
| Browser ES Modules | Expliziter Worker-Quellcode unten | Nur browserkompatibles JavaScript |

Andere Bundler werden derzeit nicht unterstützt. Fügen Sie diese Plugins ausschließlich dem mobilen/Browser-Build hinzu, niemals dem Cloudflare-Build.

### Vite

Fügen Sie das Plugin zur mobilen/Browser-Vite-Konfiguration hinzu:

```ts
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "cf-workers-native/tooling/vite";

export default defineConfig({
  plugins: [workersCapacitorPlugin({ worker: "./src/worker.ts" })],
});
```

`src/worker.ts` ist der vorhandene Anwendungseinstiegspunkt, der einen Fetch Handler exportiert (zum Beispiel Honos `export default app`), kein Transportmodul der Bibliothek. Der Pfad `worker` des Plugins ist relativ zum Vite-Stammverzeichnis (absolute Pfade funktionieren ebenfalls). Das Plugin verbindet diesen Einstiegspunkt mit dem normalen Paketimport; im Anwendungscode ist weder ein spezieller Import noch eine generierte Quelldatei nötig.

### esbuild

Verwenden Sie für esbuild denselben Anwendungscode mit dieser Build-Konfiguration:

```js
import { build } from "esbuild";
import { workersCapacitorPlugin } from "cf-workers-native/tooling/esbuild";

await build({
  entryPoints: ["src/main.ts"],
  outdir: "www",
  bundle: true,
  format: "esm",
  platform: "browser",
  plugins: [workersCapacitorPlugin({ worker: "./src/worker.ts" })],
});
```

Der Einstiegspfad ist relativ zu `absWorkingDir` (oder zum aktuellen Verzeichnis). Stellen Sie das gesamte Ausgabeverzeichnis bereit, einschließlich erzeugter Worker-Assets und verzögert geladener direkter Module. Die Worker-Kompilierung verwendet die Kompatibilitätstransformationen des Plugins; zusätzliche Anwendungsplugins werden nicht auf das Worker-Bundle angewendet. Browser-ESM-Ausgabe mit `outdir` oder `outfile` ist erforderlich. Worker-Einstiegspunkte müssen in eine einzelne JavaScript-Datei gebündelt werden; separate CSS-/Datei-Assets werden nicht unterstützt.

### Browser ES Modules (ohne Bundler)

Dieser Weg dient der reinen Fetch-Integration und bereitet native Dokument-Assets nicht automatisch vor. Kopieren Sie ohne Bundler das Verzeichnis `dist` des Pakets in Ihr öffentliches Verzeichnis `lib` und verwenden Sie gewöhnliche relative ES-Module-Importe:

```js
// main.js (geladen mit <script type="module">)
import { workersCapacitor } from "./lib/index.js";

const runtime = workersCapacitor({
  baseURL: "https://api.example.com/api/",
  worker: {
    createWorker: () =>
      new Worker(new URL("./worker-entry.js", import.meta.url), {
        type: "module",
      }),
    loadDirect: async () => (await import("./worker.js")).default,
  },
});
await runtime.ready;
```

```js
// worker-entry.js
import { serve } from "./lib/browser/isolated/transport.js";
import worker from "./worker.js";
serve(worker);
```

`worker.js` exportiert den vorhandenen Fetch Handler. Alle seine Abhängigkeiten müssen ebenfalls browserkompatible ES Modules mit auflösbaren URLs sein. Dieser Weg transformiert weder TypeScript, bloße npm-Importe, Node-APIs noch `cloudflare:*`-Importe. Das öffentliche gebündelte Gegenstück zu `lib/browser/isolated/transport.js` ist `cf-workers-native/browser/isolated`.
