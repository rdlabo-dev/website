---
title: "Cloudflare-Bindings in Capacitor"
sourceRevision: 2614065a1973822464f7a50d38788917803364e1b1784ffca10d870697dd2523
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
  workerConfig: "wrangler.jsonc", // optional bei automatischer Erkennung
  remoteBindings: ["PAYMENT_SECRET", "FUTURE_SERVICE"],
  kvExecution: { SETTINGS: "local" },
});
```

`remoteBindings` ergänzt serverseitige Namen, darunter gewöhnliche Geheimnisse, die nicht in Wrangler aufgeführt sind, und Bindings anderer Werkzeuge. Es ersetzt nicht die Erkennung bekannter Dienste. Ein Name darf nicht zugleich in `localBindings` vorkommen. Übergeben Sie `remote.origin` an `workersCapacitor` wie bei bestehenden entfernten Diensten. Injizieren Sie Servergeheimnisse nicht über `env` der Client-Laufzeit oder Bundler-Defines.

Unbekannte Konfigurationsobjekte mit `binding` oder verschachtelten `bindings`-Einträgen mit `name` (zum Beispiel `unsafe.bindings`) lassen den Build fehlschlagen, sofern ihre Namen nicht ausdrücklich in `remoteBindings` aufgeführt sind. Dies ist eine strukturelle Erkennung und kein vollständiger Wrangler-Schema-Validator: Beliebige zukünftige Deklarationsformate und ausschließlich im Dashboard konfigurierte Geheimnisse erfordern weiterhin explizite Namen. Werte unter `vars` und `define` werden nicht als Binding-Deklarationen interpretiert oder in env kopiert.

Eine Anfrage, die ein entferntes Binding verwendet, wird vollständig aus der Ferne ausgeführt, selbst wenn derselbe Handler auch lokal konfiguriertes KV liest. Für die gesamte Anfrage werden Cloud-Instanzen verwendet. Der konservative Fallback auf den gesamten Worker bewahrt gemeinsamen Zustand, zusätzliche Exporte, Middleware und Fehlerbehandlung. Prüfen Sie den erzeugten Bericht `workers-capacitor-server.json`.

Durable-Object-HTTP- und RPC-Aufrufe innerhalb des ursprünglichen HTTP-Handlers werden über diesen Dispatch-Pfad unterstützt. **WebSocket-/HTTP-Upgrades werden von diesem Transport nicht unterstützt** und ausdrücklich abgelehnt. Verwenden Sie für WebSockets eine separate Verbindung zum bereitgestellten Worker; diese Version bietet kein automatisches WebSocket-Routing.

Konfigurierte Cron-Handler, Queue-Consumer und `exports`-Deklarationen von Durable Objects oder Workflows halten den gesamten Worker entfernt, einschließlich seines HTTP-Handlers. Der Client simuliert weder geplante Ereignisse, Alarme, Workflow-Schritte noch Queue-Verarbeitung. Ein Email-Handler oder anderes Serverereignis ohne erkennbare Konfigurationsdeklaration wird nicht allein anhand seines Zwecks automatisch erkannt.

## Entferntes ASSETS-Binding

`assetsExecution: "remote"` ist erforderlich, wenn Wrangler einen Abschnitt `assets` deklariert. Die gesamte Asset-Verarbeitung bleibt auf dem bereitgestellten Worker, einschließlich HTML-Behandlung, SPA-/404-Routing, Steuerdateien, Range-/bedingten Anfragen und Cache-Semantik. Der Client implementiert diese APIs nicht.

```ts
workersCapacitorPlugin({ worker: "src/worker.ts", assetsExecution: "remote" });
```

Asset-first- oder musterbasiertes Routing (und Deklarationen ohne Binding-Namen) hält jede Anfrage entfernt, damit Client-Code die bereitgestellte Routing-Reihenfolge nicht umgehen kann. Mit `run_worker_first: true` und einem Binding-Namen kann die normale konservative Analyse unabhängige Routen lokal belassen; jeder Handler mit `env.ASSETS` läuft entfernt. Nichts aus dem Asset-Verzeichnis wird automatisch in Capacitor kopiert.

**Lokales ASSETS wird durch diese Änderung weder implementiert noch exportiert.** Eine zukünftige lokale Implementierung muss den vollständigen ASSETS-Vertrag erfüllen, einschließlich HTML-Behandlung, Steuerdateien, bedingtem/Range-Verhalten und Parität zwischen workerd und nativer Ausführung. `assetsExecution: "local"` schlägt ausdrücklich fehl, statt eine Teilimplementierung zu aktivieren. Bestehendes Hosting von Dokument-Assets ist eine andere Funktion und bleibt unverändert.

## Verifizierung und Grenzen

Die Basis für den Anwendungs-Worker ist Miniflare `5.20261012.0-beta` mit dem Kompatibilitätsdatum `2026-10-01` und ohne zusätzliche Anwendungskompatibilitätsflags. Die benannte Einheit ist buildgenerierter HTTP-Dispatch, keine lokale Emulation von Cloud-Binding-APIs.

- `npm test`: Binding-Erkennung, Richtlinienfehler, Diagnosen unbekannter Bindings, Ausschluss von Servercode, Vorrang entfernter Routen und Ablehnung von Upgrades.
- `npm run test:cloudflare-bindings` in `demo`: echte workerd-Durable-Object-HTTP-, RPC- und Speicherzugriffe, Ablehnung nicht autorisierter Zugriffe ohne Zustandsänderung, entferntes ASSETS, Prüfung von Vite-/esbuild-Artefakten, direkte/Worker-Modi in Chromium und WebKit, Worker-first- und Asset-first-Routing sowie Start der Vite-Entwicklungsumgebung. Anfragen verwenden einen echten lokalen HTTPS-Server, keine Browser-Routeninterzeption. Bedingte 304-Antworten werden beobachtet, während der Testserver das HTTP-Caching des Browsers deaktiviert; Range-Antworten werden mit derselben direkt an workerd gesendeten Anfrage verglichen. Dies verifiziert die Weiterleitung, keine clientseitige Nachbildung des Cloudflare-Cache-Verhaltens.
- Cloud AI, Indizes und Workflows werden als Namen für HTTP-Dispatch verifiziert, nicht als emulierte APIs oder kostenpflichtige Live-Dienst-Tests. Native Transportverträge werden mit bestehenden entfernten Diensten geteilt.

Cache API, HTMLRewriter und lokales ASSETS sind separate, unvollständige Kompatibilitätseinheiten; das Paket aktiviert sie nicht in Produktionsaliasen oder -exporten.

## Referenzen

- [Wrangler-Konfiguration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Assets-Binding und Routing](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [AI Search-Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/ai-search/)
- [Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
