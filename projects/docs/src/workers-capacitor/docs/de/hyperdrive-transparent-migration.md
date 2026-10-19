---
title: "Hyperdrive-gestützte Worker in Capacitor"
sourceRevision: c72828b69fcb330db8390fc94ec9f8decade14a36c533e2e7fcfe7b7ced0da8e
---

# Hyperdrive-gestützte Worker in Capacitor

Verwenden Sie den vorhandenen Worker-Einstiegspunkt, Routen, Datenbanktreiber und SQL wieder. Der Capacitor-Build erzeugt HTTP-Dispatch zum bereitgestellten Worker für Serveroperationen:

```text
Capacitor: POST /api/orders
  → HTTPS https://existing-worker.example/api/orders
  → existing Worker authentication, authorization and validation
  → existing database driver → Hyperdrive → PostgreSQL or MySQL
  → existing HTTP response → Capacitor
```

Der Client sendet die bestehende HTTP-Anfrage, nicht SQL oder ein Datenbankprotokoll. Hyperdrives Binding, Zugangsdaten, Pooling und Caching bleiben auf Cloudflare. Dieses Paket emuliert Hyperdrive nicht, verbindet das mobile Gerät nicht mit der Ursprungsdatenbank, erstellt keinen allgemeinen SQL-Endpunkt und stellt den Server nicht bereit.

## Einrichtung

Behalten Sie die bestehende Wrangler-Konfiguration mit `hyperdrive`-Einträgen (einschließlich benannter Umgebungen) bei. Das Vite-/esbuild-Plugin liest ausschließlich Binding-Namen; IDs und `localConnectionString`-Werte werden nicht in den Client kopiert.

```ts
// vite.config.ts für Capacitor
import { workersCapacitorPlugin } from "workers-capacitor/tooling/vite";
export default {
  plugins: [workersCapacitorPlugin({ worker: "worker/src/index.ts" })],
};
```

Verwendet wird die nächstgelegene Wrangler-JSON-, JSONC- oder TOML-Konfiguration nahe dem Worker-Einstiegspunkt, mit Fallback auf das Build-Stammverzeichnis. Wählen Sie mit `workerConfig` eine andere Datei (relativ zum Build-Stammverzeichnis). Geben Sie bei anderen Konfigurationswerkzeugen `hyperdriveBindings: ["HYPERDRIVE"]` an. Explizite `d1Bindings` und `hyperdriveBindings` überschreiben die Erkennung nur für ihre jeweilige Binding-Art. D1 und Hyperdrive können nebeneinander bestehen. Eine explizite leere Liste deaktiviert die Erkennung für diese Art; deaktivieren Sie sie nicht für Server-Bindings, die der Worker tatsächlich verwendet.

```ts
import { workersCapacitor } from "workers-capacitor";
const runtime = workersCapacitor({
  baseURL: "https://local.invalid/",
  remote: {
    origin: "https://existing-worker.example",
    // Optional: Die bestehende Benutzersitzung der Anwendung verwenden.
    getToken: () => existingSession.getToken(),
  },
});
await runtime.ready;
const response = await fetch("/api/orders", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ productId: "example", quantity: 1 }),
});
```

Der bereitgestellte Worker benötigt weiterhin seine normale Hyperdrive-Konfiguration, einen unterstützten Treiber und Kompatibilitätsflags. Siehe Cloudflares Anleitungen für [MySQL](https://developers.cloudflare.com/hyperdrive/examples/connect-to-mysql/) und [PostgreSQL](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/). Bestehender ORM-Code folgt derselben Grenze; dies zertifiziert nicht jede ORM- oder Treiberversion.

## Ausführung und Codeentfernung

Statisch analysierbare Hono-Routen ohne Abhängigkeit von Serveroperationen bleiben lokal. Benötigt eine passende Operation Hyperdrive, geht die gesamte Anfrage an den vorhandenen Worker, bevor lokale Anwendungsmiddleware ausgeführt wird. Importierte Hilfsfunktionen und Servertreiberimporte werden zusammen mit ihren Handlern entfernt, bevor Client-JavaScript und Source Maps entstehen. Direkter und Dedicated-Worker-Modus verwenden dieselbe erzeugte Grenze.

Ein Verbindungspool auf oberster Ebene, geteilter veränderlicher Zustand, Cookie-Abhängigkeiten, unbekannte Initialisierung oder unsicheres Routing können verlangen, dass der gesamte Worker entfernt bleibt. Allgemeine Fetch-Handler delegieren den gesamten Worker. Der Build warnt über seine Entscheidung und erzeugt `workers-capacitor-server.json` mit Modus, Grund und Routenregistrierungen. Reine D1-Builds behalten aus Kompatibilitätsgründen `workers-capacitor-d1.json`. Hyperdrive-Bindings dürfen nicht in `localBindings` deklariert werden.

Transaktionen und Verbindungsbereinigung bleiben im vorhandenen Serverhandler. 401 und Netzwerkfehler lösen keine automatischen Wiederholungen oder lokalen Fallback aus. Eine fehlgeschlagene Antwort kann dennoch nach einem bestätigten Schreibvorgang auftreten; Anwendungen mit sicheren Benutzerwiederholungen müssen ihre bestehende serverseitige Idempotenzrichtlinie implementieren. Delegierung des gesamten Workers benötigt für jede abgefangene Anfrage eine Verbindung.

## Sicherheitsgrenzen

- `remote.origin` muss ein HTTPS-Origin ohne Zugangsdaten, Pfad, Query oder Fragment sein. Weiterleitungen müssen innerhalb dieses Origins bleiben; externes OAuth/SSO benötigt separate Integration.
- Der Server muss Benutzer authentifizieren und den Zugriff auf jede Ressource autorisieren. Client-Routing und SQL-Entfernung sind keine Autorisierungskontrollen. Belassen Sie Parameterbindung, Eingabevalidierung und geeignete Datenbankberechtigungen im Worker.
- Verwenden Sie benutzergebundene Zugangsdaten. Platzieren Sie Datenbankzugangsdaten oder Cloudflare-Verwaltungstokens niemals in Client-`env`, Token-Callbacks, Logs oder öffentlichen Assets. Generierte Codeentfernung untersucht weder manuell kopierte öffentliche Dateien noch erkennt sie beliebige fest kodierte Geheimnisse in ansonsten lokalem Code.
- Native Cookie-Sitzungen verwenden den Cookie-Speicher des entfernten Hosts. `Set-Cookie` wird vom Host verarbeitet und aus der Seitenantwort entfernt. HttpOnly verhindert Skriptzugriff auf das Cookie, nicht authentifizierte Anfragen durch kompromittierte Skripte.
- Der Adapter schreibt app-lokales `Origin`/`Referer` für bestehende Worker-Navigation auf den entfernten Origin um. Deshalb kann der Server den umgeschriebenen Origin allein nicht als Nachweis vertrauenswürdiger Benutzerabsicht behandeln. Behalten Sie vorhandene CSRF-Token-Prüfungen bei, beschränken Sie WebView-Inhalt/-Navigation und Zugriff auf die native Bridge und beurteilen Sie XSS und CSRF in der tatsächlichen Anwendung. Dies garantiert keinen browsergleichen SameSite-/CSRF-Schutz im nativen Transport.
- Gewöhnliche Browser benötigen weiterhin CORS mit Zugangsdaten und befolgen Browser-Cookie-Richtlinien. Manuelle entfernte Weiterleitungen im Browser werden nicht unterstützt.
- Browseruploads und native Fetch-Uploads mit Weiterleitungsverfolgung werden gepuffert. Der gemeinsame Transport begrenzt standardmäßig auf 8 MiB, konfigurierbar über `remote.maxBufferedBodyBytes`. Zu große Bodys werden vor dem Dispatch abgelehnt. Native manuelle/Error-Weiterleitungsmodi streamen. Das Limit begrenzt nicht den gesamten App-Speicher; setzen Sie Anwendungslimits vor der Allokation großer Bodys durch.

Gemeinsamer Transport und Cookie-Verhalten werden in der [D1-Anleitung](d1-transparent-migration.md) beschrieben. Hyperdrive ergänzt Binding-Erkennung zur Build-Zeit, keinen separaten Zugangsdaten- oder Netzwerktransport.

## Verifizierung

`npm test` deckt JSON-/JSONC-/TOML- und benannte Umgebungserkennung, gemischte D1-/Hyperdrive-Overrides, Ablehnung lokaler Bindings, verschachtelte Konfigurationserkennung, Entfernung von Treiber-/Hilfs-/SQL-Code und Fallback bei Pools auf oberster Ebene ab.

Erstellen Sie für die Browserintegration das Paket, installieren Sie Demo-Abhängigkeiten und stellen Sie eine **dedizierte wegwerfbare MySQL-Testdatenbank** bereit. Die Suite erstellt `private_counters` und setzt ihre Zeilen `alice`/`bob` zurück; richten Sie sie niemals auf Anwendungsdaten. Führen Sie anschließend Folgendes aus:

```sh
npm run build
cd demo
HYPERDRIVE_TEST_MYSQL_URL='mysql://root:hyperdrive-test-only@127.0.0.1:3306/hyperdrive_test' npm run test:hyperdrive-migration
```

Derselbe unveränderte Fixture-Worker läuft in workerd mit lokalem Hyperdrive-Binding und mysql2 gegen echtes MySQL. Browser-HTTPS-Anfragen werden vom Test-Harness abgefangen und an diesen lokalen Worker weitergeleitet. Tests decken Vite/esbuild, Chromium/WebKit, direkte/Dedicated-Worker-Ausführung, selektive/gesamte Worker-Delegierung, Vite-Entwicklungs-Neubuilds, Autorisierung, ein Datenbankupdate pro Anfrage, HEAD, lokale Routen ohne Netzwerk sowie das Fehlen von SQL-/Treiber-/Konfigurationsmarkern in Client-JS und Source Maps ab. Berichte werden nach `demo/artifacts/hyperdrive-integration/` geschrieben. CI stellt einen eigenen MySQL-Dienst bereit.

Dies prüft lokales Hyperdrive-Binding und Datenbankverhalten, nicht produktives Hyperdrive-Pooling/-Caching oder HTTPS auf physischen Geräten. PostgreSQL-/ORM-Importe sind hinsichtlich Compilerentfernung abgedeckt, nicht hinsichtlich echter PostgreSQL-Abfragen. Die vorherige native D1-Abnahme deckt den gemeinsamen Transport ab; sie ist kein natives Hyperdrive-Abnahmeergebnis. Serverbereitstellung, Produktionszugangsdaten und physische Geräte sind nicht Teil dieser Verifizierung.
