---
title: "Cloudflare-Bindings in Capacitor"
sourceRevision: "d2281b85316376b091f522dc4555cec2c9a9be37939842b2f06daac4bb56a696"
---

# Cloudflare-Bindings in Capacitor

Dies ist HTTP-Anfrage-Dispatch, keine Client-Implementierung von Cloudflare-Diensten. Der Build erkennt Cloud-Abhängigkeiten und sendet die ursprüngliche Anfrage an den vorhandenen bereitgestellten Worker, **bevor lokale Anwendungshandler ausgeführt werden**. Der Worker verwendet seine eigenen Bindings, Zugangsdaten, RPC, Speicher und seinen Lebenszyklus. Es gibt weder einen allgemeinen öffentlichen Binding-Proxy noch ein Client-Zugangsdatenbundle, automatische Wiederholungen oder eine Offline-Warteschlange.

## Entfernte Dienste

Neben D1, Hyperdrive, R2, Service Bindings und Queue-Produzenten erkennen die Vite- und esbuild-Plugins diese Wrangler-Deklarationen:

| Dienst | Konfiguration mit dem Binding-Namen |
| --- | --- |
| Durable Objects (einschließlich Container-Namespaces) | `durable_objects.bindings[].name` |
| Workers AI | `ai.binding` |
| Vectorize | `vectorize[].binding` |
| AI Search | `ai_search[].binding`, `ai_search_namespaces[].binding` |
| Workflows | `workflows[].binding` |
| Analytics SQL | `analytics.binding` |
| Analytics Engine | `analytics_engine_datasets[].binding` |
| Browser Run | `browser.binding` |
| Images | `images.binding` |
| Stream / Media Transformations | `stream.binding`, `media.binding` |
| Rate Limiting | `ratelimits[].name` |
| mTLS | `mtls_certificates[].binding` |
| Secrets Store | `secrets_store_secrets[].binding` |
| E-Mail-Versand | `send_email[].name` |
| Workers for Platforms | `dispatch_namespaces[].binding` |

JSON, JSONC, TOML und benannte Umgebungen werden unterstützt. Wie bei bestehenden Service Bindings werden Namen aus allen Umgebungen konservativ berücksichtigt; die tatsächliche Umgebung des bereitgestellten Workers bestimmt, welche Ressourcen ausgeführt werden. Wranglers Entwicklungsoption `remote: false` macht einen Cloud-Dienst in Capacitor nicht lokal. Ressourcen-IDs, Modell-/Indexnamen, Zertifikate und Geheimniswerte werden nicht aus Wrangler in den Client kopiert.

```ts
workersCapacitorPlugin({
  worker: "src/worker.ts",
  workerConfig: "wrangler.jsonc", // bei automatischer Erkennung optional
  remoteBindings: ["PAYMENT_SECRET", "FUTURE_SERVICE"],
});
```

`remoteBindings` ergänzt ausschließlich serverseitige Namen, einschließlich gewöhnlicher, nicht in Wrangler aufgeführter Geheimnisse und von anderen Werkzeugen konfigurierter Bindings. Es ersetzt nicht die Erkennung bekannter Dienste. Ein Name darf nicht zugleich in `localBindings` stehen. Setzen Sie `baseURL` auf die bereitgestellte HTTPS-Worker-URL; `remote.origin` ist nur zum Überschreiben ihres Origins nötig. Injizieren Sie keine Servergeheimnisse über `env` der Clientlaufzeit oder Bundler-Defines.

Unbekannte Konfigurationsobjekte mit `binding` oder verschachtelten `bindings`-Einträgen mit `name` (zum Beispiel `unsafe.bindings`) lassen den Build fehlschlagen, sofern ihre Namen nicht ausdrücklich in `remoteBindings` aufgeführt sind. Dies ist eine strukturelle Erkennung und kein vollständiger Wrangler-Schema-Validator: Beliebige zukünftige Deklarationsformate und ausschließlich im Dashboard konfigurierte Geheimnisse erfordern weiterhin explizite Namen. Werte unter `vars` und `define` werden nicht als Binding-Deklarationen interpretiert oder in env kopiert.

Eine Anfrage, die ein entferntes Binding verwendet, wird vollständig aus der Ferne ausgeführt, selbst wenn derselbe Handler auch lokal konfiguriertes KV liest. Für die gesamte Anfrage werden Cloud-Instanzen verwendet. Der konservative Fallback auf den gesamten Worker bewahrt gemeinsamen Zustand, zusätzliche Exporte, Middleware und Fehlerbehandlung. Prüfen Sie den erzeugten Bericht `workers-capacitor-server.json`.

### Ausführung wählen

Die Vite- und esbuild-Plugins akzeptieren zwei Formen von `execution`: einen Modus für den gesamten Worker (`"network"` oder `"local"`) oder ein Array von Routenerlaubnissen. Setzen Sie diese Option am Build-Plugin, nicht am Laufzeitaufruf `workersCapacitor()`.

| Form | Verhalten |
| --- | --- |
| `execution: "network"` (Standard) | Führt den gesamten Worker auf dem bereitgestellten Server aus. Seine Implementierung wird aus dem Client-Worker-Graphen ausgeschlossen. |
| `execution: [{ method: "GET", path: "/" }]` | Erlaubt die Auslieferung ausgewählter Routenimplementierungen und beibehaltener Abhängigkeiten auf das Gerät. Serverabhängigkeiten und unsichere Grenzen halten Anfragen weiterhin remote. |
| `execution: "local"` | Erlaubt die Verteilung des gesamten Workers und seiner Abhängigkeiten. Für eigenständige Anwendungen; keine Analyse zur Routenaufteilung und kein automatischer Remote-Fallback. |

Beginnen Sie mit dem bestehenden Worker-Einstiegspunkt und dessen bereitgestellter HTTPS-URL als `baseURL`. Um die App nach Capacitor zu bringen, ist keine Routenklassifizierung erforderlich. Öffentliche Client-Assets können auch bei Remote-Ausführung des Workers lokal gebündelt werden. Sobald die App funktioniert, wählen Sie bei Bedarf an lokaler Ausführung ausdrücklich verteilbare Routen aus. Ein REST-API-Präfix wie `/api/` belegt nicht, dass andere Routen keine privaten Daten enthalten.

Für einen eigenständigen Worker, dessen gesamter Quellcode auf das Gerät ausgeliefert werden darf:

```ts
workersCapacitorPlugin({
  worker: "src/worker.ts",
  execution: "local",
});
```

Diese Form funktioniert ohne Hono-Routenanalyse. Sie weist konfigurierte ausschließlich serverseitige Bindings und Lebenszyklusanforderungen zurück. Sie emuliert weder D1 noch Firebase Admin, prüft nicht alle nicht deklarierten Zugangsdaten und garantiert keine Laufzeitkompatibilität.

### Lokale Routen auswählen

Verwenden Sie bei einer bestehenden Hono-App ein Array, um nur ausgewählte Routen zu erlauben:

```ts
workersCapacitorPlugin({
  worker: "src/worker.ts",
  execution: [
    { method: "GET", path: "/" },
    { method: "*", path: "/app/*" },
  ],
});
```

Die Auswahl erfolgt zur Buildzeit anhand der Hono-Registrierungen, nicht anhand eingehender URLs. Das Beispiel erlaubt diese Implementierungen und ihre beibehaltenen Abhängigkeiten:

| Bestehende Registrierung | Ausgewählt? |
| --- | --- |
| `app.get("/", handler)` | Ja |
| `app.get("/app", handler)` | Ja, wie in Hono |
| `app.get("/app/home", handler)` | Ja |
| `app.post("/app/notes", handler)` | Ja |
| `app.get("/app/news/:id", handler)` | Ja; Hono gleicht den tatsächlichen Parameterwert ab |
| `app.get("/application", handler)` | Nein |
| `app.get("/api/news", handler)` | Nein |

Eine Erlaubnis garantiert keine lokale Ausführung. Erkannte Serverabhängigkeiten, gemeinsamer Zustand und überlappende Serverhandler oder Middleware können eine ausgewählte Route remote halten. Unbekannte oder nicht ausgewählte Anfragen bleiben ebenfalls remote; daher erfordert Array-Ausführung immer ein Remote-Ziel — explizites `remote.origin` oder den Origin von `baseURL` —, selbst wenn alle aktuellen Registrierungen ausgewählt sind. Ein leeres Array erlaubt keine Routen.

Prüfen Sie `remote` und `reason` in der generierten `workers-capacitor-server.json` beziehungsweise `workers-capacitor-d1.json` bei reinen D1-Builds. Builds mit nicht leerer Auswahl, aber ohne lokale Anfragehandler erzeugen eine Warnung. Passt eine Auswahl zu keiner unterstützten Registrierung in einem analysierbaren Hono-Graphen, schlägt der Build fehl; ein nicht unterstützter Worker-Graph fällt auf den gesamten Remote-Worker zurück und meldet den Grund.

Die Einstellung erzeugt keine Routen. `/app/missing` bleibt remote, sofern keine bestehende erlaubte Hono-Registrierung passt. Eine ausgewählte Wildcard-Registrierung wie `app.get("/app/*", handler)` verwendet weiterhin Honos eigene Anfragesemantik.

#### Pfad- und Methodensyntax

- Ein exakt registrierter Pfad wie `"/about"`, `"/posts/:id"` oder `"/posts/:id{[0-9]+}"` erlaubt diese Registrierung. Hono übernimmt den URL-Abgleich.
- Ein abschließender Platzhalter an einem literalen Präfix wie `"/app/*"` erlaubt `/app` selbst und Registrierungen unter `/app/`. Er wählt weder `/application` noch `/app-private`. Statische Präfixe wie `/v1.0/*` und `/@me/*` werden unterstützt.
- `"*"` und `"/*"` wählen alle unterstützten Registrierungspfade.
- Ein JavaScript-`RegExp`, etwa `{ method: "GET", path: /^\/pages\// }`, prüft den Registrierungstext. Verankern Sie Treffer bei Bedarf mit `^` und `$`. Jeder Abgleich beginnt bei Index null, auch bei Ausdrücken mit `g` oder `y`; der übergebene Ausdruck wird nicht verändert.
- Eine großgeschriebene HTTP-Methode wählt die Registrierungen dieser Methode. `method: "*"` umfasst alle unterstützten direkten HTTP-Methodenregistrierungen und `app.all()`, erlaubt jedoch nicht unabhängig Middleware. Hono behält seine Anfragesemantik, gegebenenfalls einschließlich HEAD-Verarbeitung durch GET.

Muster erlauben auch passende Registrierungen zukünftiger Builds. Die Methode `"*"` umfasst zukünftige POST- und DELETE-Operationen an diesen Pfaden. Verwenden Sie enge Muster, wenn keine weitergehende Verteilungserlaubnis beabsichtigt ist.

Hono-Auswahl unterstützt direkte Registrierungen auf dem exportierten Router. OpenNext verwendet ein separates [Profil für generierte Builds](opennext.md#route-execution) mit statischen GET- und Versionsbeschränkungen. Eingebundene Routen (`app.route()`), `basePath` und `on()` werden für Erlaubnisse nicht aufgelöst. Der Build leitet keine Mengenbeziehungen zwischen beliebigen Hono-Mustern ab: `"/posts/:id"` erlaubt keine separate Registrierung `"/posts/:slug"` oder `"/posts/123"`. Kopieren Sie das registrierte Muster oder verwenden Sie einen Platzhalter mit literalem Präfix.

#### Gesamter Worker gegenüber Auswahl aller Routen

`execution: [{ method: "*", path: "*" }]` analysiert und trennt weiterhin Routen, benötigt eine Remote-Verbindung und erhält erkannte Servergrenzen. `execution: "local"` verteilt den gesamten Worker ohne diese Analyse und kann eigenständig laufen. Wechseln Sie nicht nur zur Umgehung eines Routenauswahlfehlers zu `"local"`; dies erteilt die Erlaubnis, die gesamte Anwendungsimplementierung zu verteilen.

#### TypeScript-Konfiguration

Beide Tooling-Einstiegspunkte exportieren dieselben Typen:

```ts
import type { WorkerExecution } from "cf-workers-native/tooling/vite";

const execution = [
  { method: "GET", path: "/" },
  { method: "*", path: "/app/*" },
] as const satisfies WorkerExecution;
```

### Was auf das Gerät verschoben werden darf

Der Gerätebesitzer kann gebündelten Code, Source Maps und feste Daten lesen und verändern. Array-Ausführung ist eine ausdrückliche Erlaubnis zur Verteilung ausgewählter Implementierungen und ihrer beibehaltenen Abhängigkeiten, keine Authentifizierungserkennung oder Geheimnissuche. Ein Handler, der `settings.title` liest, kann private benachbarte Werte in `settings` beibehalten. Eine fest codierte Tokenprüfung kann sowohl das Token als auch die geschützten Daten verteilen. Belassen Sie solche Implementierungen auf dem Server, statt ihnen eine Erlaubnis zu geben. HTTP-Methoden, Reinheit, HTML-Ausgabe, `ssr: false` und Prerendering belegen keine Eignung zur Verteilung.

Server-Bindings, unaufgelöste Ausführungsabhängigkeiten, gemeinsamer veränderlicher Zustand und unsicheres Routing erweitern die Remote-Grenze. Middleware darf eine ausgewählte Route nur begleiten, wenn sie bedingungslos mit `await next()` durchreicht; andere Middleware bleibt gemeinsam mit überlappenden Handlern remote. Eigene Fehler-/Nicht-gefunden-Handler halten Anfrageausführung remote. Der Build entfernt Remote-Implementierungen und exklusive Abhängigkeiten vor der Erzeugung von Client-Source-Maps.

Platzieren Sie keine Geheimnisse in Client-`env`, Bundler-Defines, `workerFiles` oder öffentlichen Assets. Diese Eingaben liegen außerhalb des Worker-Quellcodeausschlusses. Separat gebündelte Client-Assets umgehen ebenfalls Worker-Routing und müssen öffentlich sein. Remote-Operationen benötigen weiterhin serverseitige Authentifizierung und Autorisierung; keine Ausführungsform ersetzt sie. KV und ASSETS sind im Netzwerkmodus standardmäßig remote. Andere Ausführungsformen benötigen gegebenenfalls explizite Binding-Richtlinien. Nicht unterstützte Worker-Strukturen fallen bei Routenauswahl auf Netzwerk zurück. OpenNext hat eine [begrenzte Integration generierter Builds](opennext.md#route-execution); Void und andere nicht unterstützte Framework-Graphen bleiben remote.

Durable-Object-HTTP- und RPC-Aufrufe innerhalb des ursprünglichen HTTP-Handlers werden über diesen Dispatch-Pfad unterstützt. **WebSocket-/HTTP-Upgrades werden von diesem Transport nicht unterstützt** und ausdrücklich abgelehnt. Verwenden Sie für WebSockets eine separate Verbindung zum bereitgestellten Worker; diese Version bietet kein automatisches WebSocket-Routing.

Konfigurierte Cron-Handler, Queue-Consumer und `exports`-Deklarationen von Durable Objects oder Workflows halten den gesamten Worker entfernt, einschließlich seines HTTP-Handlers. Der Client simuliert weder geplante Ereignisse, Alarme, Workflow-Schritte noch Queue-Verarbeitung. Ein Email-Handler oder anderes Serverereignis ohne erkennbare Konfigurationsdeklaration wird nicht allein anhand seines Zwecks automatisch erkannt.

## Entferntes ASSETS-Binding

`assetsExecution: "remote"` ist bei Routenauswahl-Builds erforderlich, wenn Wrangler einen Abschnitt `assets` deklariert; Netzwerkmodus wählt es standardmäßig. Die Verarbeitung über das ASSETS-Binding bleibt auf dem bereitgestellten Worker, einschließlich HTML-Verarbeitung, SPA-/404-Routing, Steuerdateien, Range-/bedingter Anfragen und Cache-Semantik. Der Client implementiert diese APIs nicht.

```ts
workersCapacitorPlugin({ worker: "src/worker.ts", assetsExecution: "remote" });
```

Asset-first- oder musterabhängiges Routing sowie Deklarationen ohne Binding-Namen halten Worker-Dispatch remote, um die bereitgestellte Routingreihenfolge zu erhalten. Mit `run_worker_first: true` und Binding-Namen kann die gewöhnliche konservative Analyse ausdrücklich ausgewählte unabhängige Routen lokal halten; jeder Handler mit `env.ASSETS` läuft remote. Aus dem Asset-Verzeichnis wird nichts automatisch nach Capacitor kopiert.

**Lokales ASSETS wird durch diese Änderung weder implementiert noch exportiert.** Eine zukünftige lokale Implementierung muss den vollständigen ASSETS-Vertrag erfüllen, einschließlich HTML-Verarbeitung, Steuerdateien, bedingtem/Range-Verhalten und workerd-/Native-Gleichwertigkeit. `assetsExecution: "local"` schlägt ausdrücklich fehl, statt eine Teilimplementierung zu aktivieren. Gebündelte Dokument-Assets sind separat: Vite-`publicDir` oder vor einem esbuild-Build kopierte Dateien registrieren exakte lokale Pfade, die Worker-Dispatch umgehen. Verwenden Sie dies nur für öffentliche Dateien ohne erforderliche Server-Middleware, Autorisierung oder Cloudflare-Antwortheader-/Steuerdateiverarbeitung. Die Beispiele für [OpenNext](opennext.md#bundle-client-assets-alongside-remote-pages) und [Void](void.md) bündeln Clientskripte und behalten Serverhandler remote.

## Verifizierung und Grenzen

Die Basis für den Anwendungs-Worker ist Miniflare `5.20261012.0-beta` mit dem Kompatibilitätsdatum `2026-10-01` und ohne zusätzliche Anwendungskompatibilitätsflags. Die benannte Einheit ist buildgenerierter HTTP-Dispatch, keine lokale Emulation von Cloud-Binding-APIs.

- `npm test`: Binding-Erkennung, Richtlinienfehler, Diagnosen unbekannter Bindings, Servercodeausschluss, Remote-Routingpriorität und Upgrade-Ablehnung. Verteilungsfälle prüfen minimiertes JavaScript und Source Maps, einschließlich geschütztem HTML/JSON, gemischter öffentlicher/privater Konfiguration, Helferzweigen, ignorierten Werten sowie eingebundenen/überlappenden Routen.
- `npm run test:d1-migration` in `demo`: workerd-/Browser-Dispatch-Prüfungen und Vite-/esbuild-Builds, die unabhängiges öffentliches Rendering erhalten und geschützte Daten aus jedem erzeugten Asset ausschließen. Das geschützte Fixture prüft auch ursprüngliches Hono-Verhalten: Nicht authentifizierte Anfragen erhalten 401, authentifizierte die private Antwort.
- `npm run test:cloudflare-bindings` in `demo`: echtes workerd Durable Object HTTP, RPC und Storage, Autorisierungsablehnung ohne Zustandsänderung, Remote-ASSETS, Vite-/esbuild-Artefaktprüfung, Chromium-/WebKit-Direkt-/Worker-Modi, Worker-first- und Asset-first-Routing sowie Vite-Entwicklungsstart. Anfragen verwenden einen echten lokalen HTTPS-Server, keine Browser-Routeninterzeption. Bedingte 304-Antworten werden bei durch den Testserver deaktiviertem Browser-HTTP-Cache beobachtet; Range-Antworten werden mit derselben direkt an workerd gesendeten Anfrage verglichen. Dies prüft Weiterleitung, keine clientseitige Nachbildung von Cloudflare-Caching.
- Cloud AI, Indizes und Workflows werden als Namen für HTTP-Dispatch geprüft, nicht als emulierte APIs oder kostenpflichtige Live-Diensttests. Native Transportverträge werden mit bestehenden Remote-Diensten geteilt.

Cache API, HTMLRewriter und lokales ASSETS sind separate, unvollständige Kompatibilitätseinheiten; das Paket aktiviert sie nicht in Produktionsaliasen oder -exporten.

## Referenzen

- [Wrangler-Konfiguration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Assets-Binding und Routing](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [AI Search-Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/ai-search/)
- [Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
