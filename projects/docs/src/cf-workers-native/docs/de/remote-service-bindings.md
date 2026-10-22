---
title: "Dispatch entfernter Service Bindings"
sourceRevision: "de0a93fe79897195ebe6ca890158ab77d1b318b2dde7d93619ff17cc28cd532d"
---

# Dispatch entfernter Service Bindings

## Einheit und Status

Die Einheit ist buildgenerierter HTTP-Dispatch des Fetch-Handlers eines bestehenden Workers, wenn er R2, remote konfiguriertes KV, Service Bindings oder Queue-Produzenten verwendet. Reine KV-Anfragen verwenden lokalen Storage nur, wenn ihre Route zur lokalen Ausführung ausgewählt und die Binding-Richtlinie lokal ist. Remote-Binding-Methoden werden unverändert im bereitgestellten Worker ausgeführt. Dies installiert weder lokales R2 noch KV-Synchronisierung, Client-RPC-Proxy oder Queue-Verbraucher in Capacitor.

Die workerd-Integrationsbasis ist Miniflare `5.20261012.0-beta` mit Kompatibilitätsdatum `2026-10-01`. Browserintegration liefert ergänzende Nachweise, keine Zertifizierung des nativen Transports.

Siehe [zusätzliche Cloudflare-Bindings und entferntes ASSETS](cloudflare-bindings.md) für Durable Objects, AI, Workflows, allgemeine entfernte Namen und Asset-Ausführungsrichtlinien.

## Konfiguration

Verwenden Sie den bestehenden Worker-Einstiegspunkt und seine Wrangler-Konfiguration mit dem Vite- oder esbuild-Plugin:

```ts
workersCapacitorPlugin({
  worker: "src/worker.ts",
  execution: [{ method: "*", path: "/settings/*" }],
  kvExecution: { SETTINGS: "local", SHARED: "remote" },
});
```

Das Beispiel setzt bestehende Registrierungen unter `/settings/` voraus, deren Implementierung und beibehaltene Abhängigkeiten auf das Gerät ausgeliefert werden dürfen. Passen Sie die Auswahl an die App an; siehe [Ausführungskonfiguration](cloudflare-bindings.md#choosing-execution).

Der Compiler erkennt `r2_buckets[].binding`, `kv_namespaces[].binding`, `services[].binding` und `queues.producers[].binding`, einschließlich benannter Wrangler-Umgebungen. JSON, JSONC und TOML werden unterstützt. Bestehende D1- und Hyperdrive-Bindings bleiben unterstützt. Nur Namen fließen in die Build-Analyse ein: Ressourcen-IDs, Zugangsdaten und Verbindungszeichenfolgen sind keine Client-Laufzeitkonfiguration.

Geben Sie bei nicht standardmäßigen Konfigurationsorten `workerConfig` an. Explizite Arrays `r2Bindings`, `kvBindings`, `serviceBindings` und `queueBindings` überschreiben die Erkennung nur für den jeweiligen Typ. Setzen Sie bei einem Routenauswahlarray oder lokaler Ausführung des gesamten Workers `kvExecution` für jeden erkannten oder ausdrücklich aufgelisteten KV-Namen auf `local` oder `remote`. Fehlende Richtlinien, unbekannte Namen und ungültige Werte lassen den Build scheitern. Die standardmäßige Netzwerkausführung hält alle Anfragen remote und setzt KV-Richtlinien standardmäßig auf remote. `kvBindings` listet Namen, `kvExecution` wählt deren Ort. R2, Service Bindings, Queue-Produzenten, D1 und Hyperdrive benötigen den Server. Ein zwischen KV und Server-Binding geteilter Name bleibt ausschließlich serverseitig.

Der Ausführungsort bestimmt die Binding-Instanz:

- Eine ausdrücklich ausgewählte, lokal ausführbare reine KV-Route mit auf `local` gesetzten Bindings verwendet Laufzeit-`env`. Nicht ausgewählte Routen bleiben remote.
- Eine reine KV-Route mit einem beliebigen `remote`-KV-Binding wird zum bestehenden Worker weitergeleitet. Alle Operationen dieser Anfrage verwenden die Remote-Umgebung.
- Eine Route mit R2 und KV wird als eine Anfrage weitergeleitet. Beide Bindings laufen auf dem ursprünglichen Worker mit Cloud-KV. Es läuft niemals ein Teil dieses Handlers lokal.
- Konservativer Fallback des gesamten Workers führt jede Route remote aus, einschließlich reiner KV-Routen. Prüfen Sie diese Entscheidung im Buildbericht.

Stellen Sie lokales KV über die bestehende Feature-API mit demselben Binding-Namen wie Wrangler bereit. Der Build erkennt Namen, keine Gerätespeicherinstanzen. Fehlende `env`-Konfiguration schaltet nicht stillschweigend auf Cloud-KV um. Es gibt keine Cloud-/Gerätesynchronisierung. `localBindings` bleibt für andere explizit bereitgestellte lokale Bindings verfügbar; KV verwendet stattdessen `kvExecution`. Einen entfernten KV-Namen in `localBindings` zu deklarieren ist ein Build-Fehler. Eine `local`-Richtlinie erlaubt lokale Ausführung, überschreibt aber keine andere Serverabhängigkeit und keinen Fallback auf den gesamten Worker.

```ts
import { openFeature } from "cf-workers-native/shared/contracts";
import { LocalStorageKV } from "cf-workers-native/cloudflare/bindings/kv";
const kv = await openFeature(new LocalStorageKV("my-app-settings"));
// env: { SETTINGS: kv.api } an workersCapacitor übergeben; SETTINGS muss dem Namen in Wrangler entsprechen.
// Beim Beenden: await runtime.dispose(); await kv.dispose();
```

Bindings mit Funktionen verwenden selbst mit `prefer: "worker"` direkte Ausführung. Dies ist der bestehende [Vertrag für lokale KV-Ausführung](kv.md), kein Binding-RPC in einen Dedicated Worker. Entfernte Anfragen werden weiterhin vor lokaler Ausführung ausgewählt und verwenden die eigenen Bindings des bereitgestellten Workers, niemals die lokale `env`-Instanz.

```ts
const runtime = workersCapacitor({
  baseURL: "https://local.invalid/",
  prefer: "worker", // ein lokales env mit Funktionen wählt die direkte Ausführung
  env: { SETTINGS: kv.api }, // den in Wrangler deklarierten Binding-Namen verwenden
  remote: {
    origin: "https://your-existing-worker.example",
    getToken: () => existingSession.accessToken,
    maxBufferedBodyBytes: 8 * 1024 * 1024,
  },
});
```

Ausgewählte Anfragen gehen vor lokaler Ausführung mit ursprünglichem Pfad, Query, Methode und Body an diesen Origin. Ausdrücklich erlaubte unabhängige Routen können lokal bleiben. Lässt sich sichere Partitionierung nicht nachweisen, wird der gesamte Worker remote aufgerufen. Prüfen Sie diese Entscheidung in `workers-capacitor-server.json`. Wrangler-Queue-Consumer-Konfiguration erzwingt Dispatch des gesamten Workers, auch für reine Consumer-Projekte; Queue-Handler müssen auf dem Server bleiben. Queue-Zustellung wird niemals innerhalb der App gestartet.

## Uploads und Speicher

Browseruploads und native Anfragen mit Weiterleitungsverfolgung puffern standardmäßig höchstens 8 MiB. `maxBufferedBodyBytes` akzeptiert eine nicht negative sichere Ganzzahl in Bytes; der Wert 0 erlaubt nur leere Bodys. Ein zu großer Stream wird abgebrochen und vor dem Transport-Dispatch abgelehnt. Gepufferte Bytes werden in begrenzt wachsenden Speicher kopiert, ohne möglicherweise größere zugrunde liegende Puffer eingehender Blöcke aufzubewahren. Native manuelle/Error-Weiterleitungsmodi streamen, statt für eine Wiederholung zu puffern.

Dieses Limit begrenzt diesen Transportpuffer, nicht den gesamten Anwendungsspeicher, gleichzeitige Anfragen, vom Aufrufer allokierte Blobs oder die Dedicated-Worker-Bridge. Wenden Sie Größen- und Parallelitätslimits der Anwendung vor der Allokation von Bodys an. Implementieren Sie für große R2-Objekte Multipart-Endpunkte im bestehenden Worker und halten Sie einzelne Anfragen innerhalb des Budgets. Der Adapter teilt Uploads nicht automatisch auf, wiederholt keine fehlgeschlagenen Schreibvorgänge, bricht keine aufgegebenen Multipart-Sitzungen ab und macht keine Auswirkungen abgebrochener Anfragen rückgängig.

## Sicherheit und Semantik

Belassen Sie Authentifizierung, Mandanten-/Objekteigentum, Validierung, Ratenlimits und erlaubte Operationen im bereitgestellten Worker. Der Client-Selektor dient der Optimierung und Codetrennung, nicht als Autorisierungsgrenze. Binding-Zugriff und RPC bleiben innerhalb dieses Workers; diese Funktion erzeugt keinen allgemeinen öffentlichen Binding-/RPC-Endpunkt. Service-RPC wird vom vorhandenen HTTP-Handler mit dessen bestehender Berechtigung aufgerufen.

Natives Cookie- und Weiterleitungsverhalten verwenden den gemeinsamen Transport. Behalten Sie CSRF-Prüfungen bei; umgeschriebene Origin-/Referer-Werte allein weisen keine vertrauenswürdige Absicht nach, und HttpOnly verhindert keine authentifizierten Anfragen durch kompromittierte App-Skripte. Siehe [D1-Sicherheitsvertrag](d1-transparent-migration.md#shared-transport-security-and-upload-limits).

Cloud-KV behält sein Cloud-Konsistenzmodell. Queues behalten mindestens einmalige Zustellung: Consumer müssen doppelte Nachrichten idempotent behandeln. Eine erfolgreiche HTTP-Antwort auf das Einreihen bedeutet nicht, dass die nachgelagerte Verarbeitung abgeschlossen ist. Netzwerkfehler oder Abbruch beweisen nicht, dass ein Schreib-/Einreihungsvorgang nicht stattgefunden hat. Der Client ergänzt weder automatische Wiederholungen noch eine Offline-Schreibwarteschlange.

## Verifizierung

Führen Sie `npm run build`, `npm test` und dann `npm run test:service-bindings` in `demo` aus. Letzteres führt einen echten workerd-R2-Bucket, KV-Namespaces, HTTP-/RPC-Dienst und Queue-Consumer unter Chromium und WebKit, Vite und esbuild sowie direkter und Dedicated-Worker-Ausführung aus, jeweils mit selektiven und vollständigen Worker-Builds (16 Kombinationen). Es prüft Serverzustand, R2-Range-/Bedingungs-/HEAD-/Multipart-/Löschoperationen, KV-Metadaten, Service-HTTP/RPC, Queue-Send-/Batch-Zustellung, Autorisierungsablehnung, Upload-Limits vor dem Senden, lokale Offline-Routen und Ausschluss aus Client-Artefakten. Ergebnisse werden in `demo/artifacts/service-bindings/report.json` geschrieben.

Diese Browserläufe fangen HTTPS-Anfragen ab und leiten sie in lokales workerd. Der Vite-Entwicklungsstart verifiziert zusätzlich lokale und HTTP-/RPC-Routen im direkten/Worker-Modus.

Reproduzieren Sie dies mit dem bestehenden nativen Harness:

```sh
node demo/tests/experiments/d1/native-server.mjs --services
# In einem anderen Terminal bei laufendem Server:
node demo/tests/experiments/d1/native-prepare.mjs --services
node demo/tests/experiments/d1/native-run.mjs ios <simulator-id> --services
node demo/tests/experiments/d1/native-run.mjs android <emulator-id> --services
```

Verwenden Sie `--refresh` bei einem bestehenden services-native-Consumer, um dessen native Build-Verzeichnisse bei Installation eines neuen Tarballs wiederzuverwenden. Der Harness verwendet die D1-Test-App-ID erneut; führen Sie native D1- und Service-Tests nicht gleichzeitig auf demselben Gerät aus.

## Plattformreferenzen

- [Wrangler-Konfiguration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)
- [Cloud-KV-Verhalten](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [Service HTTP](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/http/)
- [Service RPC](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/)
- [Queue-Zustellgarantien](https://developers.cloudflare.com/queues/reference/delivery-guarantees/)
