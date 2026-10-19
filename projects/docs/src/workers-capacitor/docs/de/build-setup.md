---
title: "Build-Einrichtung"
sourceRevision: 316c7e29f6060cdd927aa021bad5b1b210ae8525f1c76add44fd7f862758c532
---

# Build-Einrichtung

Wählen Sie zunächst das Framework Ihrer Anwendung und konfigurieren Sie dann das Build-Werkzeug für dessen Capacitor-Integration. Die Framework-Anleitung beschreibt den Worker-Einstiegspunkt und die Ausführungsgrenze; das Werkzeug-Plugin verbindet diesen Einstiegspunkt mit der mobilen App. Halten Sie den bestehenden Cloudflare-Build getrennt.

## Frameworks

Für die folgenden Integrationen liegen Beispiele und Verifizierungsnachweise vor. Die Unterstützung beschränkt sich auf die hier beschriebenen Ausführungspfade; API- und Anwendungseinschränkungen finden Sie unter [Kompatibilitätsgrenzen](compatibility.md).

| Framework | Ausführung und verifizierter Umfang | Einrichtung |
| --- | --- | --- |
| Hono | Lokale Fetch-Handler und HTML-Seiten; Routing, Formulare und Anfrage-/Antwortverhalten werden in den Hono-Fixtures geprüft. Cloudabhängige Anfragen verwenden Remote-Dispatch. | [Hono-Einstiegspunkt](#hono), [Beispiel für natives Rendering](../demo/rendering) |
| Workers Express | Lokale Ausführung über `cloudflare:node`; API- und HTML-Rendering-Fixtures. Cloudabhängige Anfragen verwenden Remote-Dispatch. | [Workers-Express-Einstiegspunkt](#workers-express), [Beispiel für natives Rendering](../demo/rendering) |
| Void React Pages | SSR, Loader und Actions auf dem entfernten Worker; Client-Hydration und Formulare in der WebView. Verwenden Sie Void / @void/react 1.1.12 oder neuer; veröffentlichte 1.1.12-Pakete bestehen die Abnahme im iOS-Simulator und Android-Emulator. | [Void-Einrichtung und Verifizierung](void.md) |
| Next.js / OpenNext | Das D1-gestützte Beispiel verwendet den gesamten entfernten Worker. Ein separates lokales Profil verifiziert öffentliche SSR-Seiten, Hydration, Links und Assets; es weist keine lokale Unterstützung für D1 oder ASSETS nach. | [OpenNext-Einrichtung und Grenzen](opennext.md) |

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

Verwenden Sie das [Vite](#vite)- oder [esbuild](#esbuild)-Plugin ausschließlich im Capacitor-/Browser-Build, niemals im Cloudflare-Build. Es stellt neben Browser-Polyfills Workers-kompatible Adapter für `node:http` und `node:net` bereit; das [Kompatibilitätsinventar](compatibility.md) dokumentiert die verifizierte Basis und die Module. `listen(3000)` registriert einen In-Memory-Handler, keinen lauschenden TCP-Port. Das Plugin unterstützt Hono und Workers Express; der Framework-Code bleibt unverändert.

#### TypeScript-Typen

Das Paket stellt den Typ für `cloudflare:node` für seinen unterstützten Adapter `httpServerHandler` bereit. Fügen Sie ihn für einen Browser-Build ohne vorhandene Workers-Typdeklarationen zu `compilerOptions.types` in `tsconfig.json` hinzu:

```json
{ "compilerOptions": { "types": ["workers-capacitor/cloudflare/apis/types"] } }
```

Behalten Sie alle anderen bereits verwendeten Typen bei. Dieser Einstiegspunkt dient nur der Typisierung; importieren Sie ihn nicht zur Laufzeit. Projekte mit generierten Workers-Typen sollten stattdessen diese Deklarationen behalten. Eine anwendungseigene `cloudflare.d.ts` oder `client.d.ts` ist nicht erforderlich.

### Angular auf Workers

Diese Integration ist noch nicht verifiziert. Das Ziel ist eine **bestehende Angular-SSR-Anwendung, die auf Cloudflare Workers bereitgestellt ist** und deren Rendering, Routing und Hydration bei der Übernahme in Capacitor erhalten bleiben. Eine dedizierte Konfiguration des Worker-Einstiegspunkts und ein Abnahmebeispiel sind noch erforderlich, bevor sie als unterstützt aufgeführt werden kann.

Die Unterstützung von Vite oder esbuild allein weist keine Angular-SSR-Unterstützung nach. Die reine Fetch-Integration eines separaten Frontends ist ein anderer Anwendungsfall.

## Werkzeuge

Diese Versionen beschreiben den separaten Capacitor-Build. Der bestehende Cloud-Build eines Frameworks kann ein anderes Werkzeug oder eine andere Version verwenden; lassen Sie ihn unverändert und verbinden Sie seinen erzeugten Worker wie in der Framework-Anleitung beschrieben.

| Build | Einrichtung | Eingabe |
| --- | --- | --- |
| Vite 7 | Plugin `workers-capacitor/tooling/vite` | TypeScript-/JavaScript-Worker-Einstiegspunkte, einschließlich der oben beschriebenen Framework-Ausgabe |
| esbuild 0.28 | Plugin `workers-capacitor/tooling/esbuild` | TypeScript-/JavaScript-Worker-Einstiegspunkte, einschließlich der oben beschriebenen Framework-Ausgabe |
| Browser ES Modules | Expliziter Worker-Quellcode unten | Nur browserkompatibles JavaScript |

Andere Bundler werden derzeit nicht unterstützt. Fügen Sie diese Plugins ausschließlich dem Capacitor-/Browser-Build hinzu, niemals dem Cloudflare-Build.

### Vite

Fügen Sie das Plugin zur Capacitor-/Browser-Vite-Konfiguration hinzu:

```ts
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "workers-capacitor/tooling/vite";

export default defineConfig({
  plugins: [workersCapacitorPlugin({ worker: "./src/worker.ts" })],
});
```

`src/worker.ts` ist der vorhandene Anwendungseinstiegspunkt, der einen Fetch Handler exportiert (zum Beispiel Honos `export default app`), kein Transportmodul der Bibliothek. Der Pfad `worker` des Plugins ist relativ zum Vite-Stammverzeichnis (absolute Pfade funktionieren ebenfalls). Das Plugin verbindet diesen Einstiegspunkt mit dem normalen Paketimport; im Anwendungscode ist weder ein spezieller Import noch eine generierte Quelldatei nötig.

### esbuild

Verwenden Sie für esbuild denselben Anwendungscode mit dieser Build-Konfiguration:

```js
import { build } from "esbuild";
import { workersCapacitorPlugin } from "workers-capacitor/tooling/esbuild";

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
// main.js (mit <script type="module"> geladen)
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

`worker.js` exportiert den vorhandenen Fetch Handler. Alle seine Abhängigkeiten müssen ebenfalls browserkompatible ES Modules mit auflösbaren URLs sein. Dieser Weg transformiert weder TypeScript, bloße npm-Importe, Node-APIs noch `cloudflare:*`-Importe. Das öffentliche gebündelte Gegenstück zu `lib/browser/isolated/transport.js` ist `workers-capacitor/browser/isolated`.
