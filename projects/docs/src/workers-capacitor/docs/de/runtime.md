---
title: "Laufzeitverhalten"
sourceRevision: 999dcc5042e210b3c55afc4419f302d9469f43d1f69a6c5be3583f30147ba8c1
---

# Laufzeitverhalten

Es gibt zwei getrennte Entscheidungen: Cloud-Binding-Dispatch wählt lokale oder entfernte Anfrageausführung; `prefer` wählt eine lokale JavaScript-Umgebung. Ein lokaler Dedicated Web Worker läuft auf dem Gerät, nicht auf Cloudflare.

## Reine Fetch-Integration

Konfigurieren Sie für ein vorhandenes Frontend, das Worker-APIs aufruft, den Worker im [Capacitor-Build](build-setup.md) und lassen Sie `render` weg. Initialisieren Sie vor dem Einhängen der Oberfläche:

```ts
import { workersCapacitor } from "workers-capacitor";

const runtime = workersCapacitor({
  baseURL: "https://api.example.com/api/",
});
await runtime.ready;

const response = await fetch("/api/hello");
```

Die vorhandene Oberfläche behält ihre gewöhnlichen Fetch-Aufrufe. Passende Anfragen verwenden den konfigurierten lokalen oder entfernten Worker; Anfragen außerhalb der Grenze behalten ihr normales Fetch-Verhalten. Konfigurieren Sie für cloudabhängige Routen die Bindings und den entfernten Origin anhand der [Integrationsanleitung](integration.md).

## Ausführungspräferenz

Der Standard `prefer: "worker"` startet einen Dedicated Web Worker, wenn dieser verfügbar ist und das initiale `env` nur reine Daten enthält. Fehlt Worker, meldet sein Konstruktor SecurityError/NotSupportedError oder enthält `env` Methoden/eigene Prototypen/Accessors (etwa lokale KV-Bindings), wird vor der ersten Anfrage direkte Ausführung gewählt. `prefer: "direct"` lädt das direkte Modul, ohne einen Worker zu erzeugen. Direkte Ausführung ist stets die verfügbare Basis; ein Modul- oder Anwendungsfehler bedeutet nicht, dass sie unverfügbar wäre.

Warten Sie auf `runtime.ready` und prüfen Sie `runtime.execution` (`"worker"` oder `"direct"`), um die Auswahl zu sehen. Direkter Code wird erst bei entsprechender Auswahl dynamisch importiert. Die Auswahl erfolgt einmalig: Startskript- und Anfragefehler werden gemeldet und niemals in der anderen Umgebung erneut ausgeführt. Dies ist keine automatische Erkennung aller nicht unterstützten Workers-APIs. Änderungen an `env` nach der Auswahl lösen keine Neuauswahl aus. Die Worker-Auswahl akzeptiert konservativ primitive Werte, gewöhnliche Objekte und Arrays (einschließlich Zyklen), ohne nicht aufzählbare eigene Eigenschaften oder Null-Prototypen; auch andere Structured-Clone-fähige Typen führen derzeit zur direkten Ausführung.

## Initialisierung und Bereinigung

Die Installation fängt fetch synchron ab. Anfragen im Worker-Modus warten auf den Start; passende Anfragen während des Ladens des direkten Moduls werden ausdrücklich abgelehnt, um Deadlocks durch top-level await zu verhindern. Warten Sie vor UI-Anfragen auf `runtime.ready`. Die Laufzeit kann Aufrufe während der Modulinitialisierung nicht von gleichzeitigen UI-Aufrufen unterscheiden, daher werden beide während des direkten Ladens abgelehnt. `await runtime.ready` beobachtet Starterfolg oder -fehler vor dem Rendern der Oberfläche. `await workersCapacitor(...)` wartet **nicht** auf den Worker-Start.

Es wird nur eine Installation unterstützt; `await runtime.dispose()` stellt fetch wieder her, beendet den Dedicated Worker und wartet bei Bedarf auf asynchrone Bereinigung. Die Beendigung lehnt unfertige lokale Aufrufe/Body-Lesevorgänge ab und gibt die Hintergrundverfolgung frei.

## Explizite Worker-Quellen

Explizite direkte Handler-Importe und standardmäßige Factorys mit `new Worker(new URL(...), { type: "module" })` werden unterstützt. `prefer` benötigt die Plugin-Konfiguration oder eine explizite Quelle mit sowohl `createWorker` als auch `loadDirect`; es kann aus einem Handler oder einer Factory allein keinen zweiten Kandidaten erzeugen.

Direkte Importe bleiben unterstützt: `import worker from "./worker"` stellt ein Objekt mit `fetch` bereit und läuft im globalen UI-Bereich. Hono benötigt in diesem Modus kein Build-Plugin; Workers Express benötigt weiterhin das Kompatibilitätsplugin. Worker-Unteranfragen bleiben nur dann außerhalb der UI-Interzeption, wenn `runtime.execution` den Wert `"worker"` hat; der direkte Fallback teilt die globale UI-Umgebung.

Wenn der Worker oder eine Abhängigkeit Workers-Erweiterungen (zum Beispiel `Headers.getAll("set-cookie")` oder `Request.cf`) bei der Modulauswertung verwendet, konfigurieren Sie `worker` im Vite-/esbuild-Plugin wie in der [Build-Anleitung](build-setup.md). Die Laufzeit installiert ihre Web-APIs vor dem Laden dieses Einstiegspunkts und seiner Abhängigkeiten in beiden Ausführungsmodi. Bei einem direkten statischen Import erfolgt die Modulauswertung, bevor `workersCapacitor()` diese APIs initialisieren kann; nur Aufrufe nach der Initialisierung verwenden die installierten Implementierungen. Verwenden Sie für einfaches JavaScript die [Quelle `loadDirect`](build-setup.md#browser-es-modules-no-bundler), wenn die Initialisierung vor der Modulauswertung erfolgen muss.

## URL-Vertrag

### Auswahl lokaler Anfragen

Der Adapter löst die Anfrage-URL auf und prüft dann sowohl Adresse als auch Pfad:

1. Die URL muss entweder mit **Protokoll und Host** (einschließlich Port) der laufenden App oder mit dem in `baseURL` konfigurierten Origin übereinstimmen.
2. Ihr Pfad muss der Pfadgrenze von `baseURL` entsprechen oder darunter liegen. Für `/api/` passen `/api` und `/api/hello`; `/apiary` passt nicht.

Passende Anfragen laufen normalerweise im lokalen Worker. Mit Cloud-Binding-Build-Integration kann der erzeugte Selektor sie vor lokaler Ausführung an den vorhandenen bereitgestellten Worker senden. Der Adapter ersetzt den Origin durch den `baseURL`-Origin und bewahrt Pfad und Query. Das Protokoll allein wählt keine lokale Ausführung: `capacitor://other-host/api/hello` passt nicht zu einer App unter `capacitor://localhost`.

Mit den Capacitor-Standardeinstellungen folgt `fetch("/api/hello")` diesen Pfaden (ohne `<base>`-Überschreibung und mit `baseURL: "https://api.example.com/api/"`):

| Plattform | Aufgelöste App-Anfrage-URL | Vom lokalen Worker empfangene URL |
| --- | --- | --- |
| iOS | `capacitor://localhost/api/hello` | `https://api.example.com/api/hello` |
| Android | `https://localhost/api/hello` | `https://api.example.com/api/hello` |

Der Adapter verwendet die URL der laufenden App, sodass eigene Schema-/Hostname-Einstellungen durch denselben Vergleich behandelt werden. Ohne erzeugte entfernte Grenze sind dies lokale JavaScript-Aufrufe; keine Zeile sendet eine HTTP-Anfrage an `api.example.com`. Für entfernte Ausführung ausgewählte Anfragen verwenden stattdessen den konfigurierten `remote.origin`.

### Endpunktbeispiele

Für `baseURL: "https://api.example.com/api/"` und eine unter `https://localhost/` bereitgestellte App (ohne `<base>`-Überschreibung):

| An `fetch()` übergebene URL | Anfrageendpunkt | Verarbeitung durch |
| --- | --- | --- |
| `/api/hello?name=A` | `https://api.example.com/api/hello?name=A` | Lokalen Worker |
| `https://api.example.com/api/hello` | `https://api.example.com/api/hello` | Lokalen Worker |
| `/api` | `https://api.example.com/api` | Lokalen Worker |
| `/apiary` | `https://localhost/apiary` | Ursprüngliches fetch |
| `/outside.txt` | `https://localhost/outside.txt` | Ursprüngliches fetch |
| `https://other.example/api/hello` | `https://other.example/api/hello` | Ursprüngliches fetch |

Bei lokaler Ausführung ist der Endpunkt die URL, die der Fetch Handler des Workers empfängt; es wird keine HTTP-Anfrage an diesen Server gesendet.

Der Pfad in `baseURL` wählt eine Grenze; er wird **nicht an Anfragepfade angehängt**. Relative Pfade werden zuerst gegen `document.baseURI` (einschließlich `<base href>`) aufgelöst, mit Fallback auf location, wenn kein Dokument existiert. App-eigene URLs innerhalb der Grenze (einschließlich iOS-`capacitor://localhost`) werden auf den Basis-Origin umgeschrieben. Setzen Sie nur dann eine Root-Basis-URL, wenn Sie jedes app-eigene fetch abfangen möchten. Lokale 404/500 oder Ausnahmen werden niemals über das Netzwerk wiederholt. Im reinen Fetch-Modus fängt dieser Fetch-Adapter weder UI-Navigation, XHR, Bilder noch andere WebViews ab. Mit `render` verarbeitet eine separate [native Dokument-Bridge](native-rendering-api.md) unterstützte Dokumentnavigation, Formulare und Ressourcenanfragen.

## Kompatibilität und Einschränkungen

### Verifiziertes API-Verhalten

- Abgedeckt: Hono und Workers Express GET/POST/HEAD, Query- und Routenparameter, JSON-Bodys, Middleware, 404/500, gleichzeitige Anfragen, Request-Eingabe, logische URLs.
- Optionales `env` injiziert vom Aufrufer bereitgestellte Werte in das zweite Argument des Fetch-Handlers. Im isolierten Modus wird es pro Aufruf geklont: Funktionen/native Plugin-Objekte können nicht übergeben werden, und Objektidentität bleibt nicht erhalten. Es werden keine Wrangler-Geheimniswerte oder Cloud-Binding-Objekte importiert; die Build-Plugins lesen Binding-Konfiguration, um lokale oder entfernte Ausführung zu wählen. Der benannte Export `env` aus `cloudflare:workers` ist ein partieller Adapter: Der isolierte Transport aktualisiert vor dem Dispatch einen realmweiten Proxy, aber direkte Ausführung befüllt ihn nicht, und die Modulinitialisierung erfolgt vor dem ersten Dispatch. Verwenden Sie für portablen Zugriff das `env`-Argument des Handlers; der Proxy bietet keine anfragebezogene Isolation.
- `ctx.waitUntil()` verfolgt Promises, ohne die Antwort zu verzögern; `runtime.drain()` wartet auf sie. Fehler gehen an das optionale `onBackgroundError` (Standard: Konsole). Unterbrechung/Beendigung durch das Betriebssystem kann ausstehende Arbeit stoppen.
- Fetch-Abbruch weist den Aufrufer zurück und propagiert ein Signal. Beliebige Anwendungsarbeit kann er nicht zwangsweise stoppen. Cookies, Weiterleitungsverfolgung, Befüllen von `Response.url`, Credentials-/Cache-Richtlinien und CORS-Durchsetzung werden für lokale Aufrufe nicht emuliert.

Siehe [Kompatibilität und Einschränkungen](compatibility.md) für unvollständige Node-Module, Workers-APIs, Cloud-Dienste und native Transportbeschränkungen. Die [Grenzen der Anwendungsintegration](compatibility.md#application-integration-limits) behandeln auch Better Auth unter iOS, Passkeys, OAuth im externen Browser, Void-Routing, Live-Analytics und die Grenze zwischen Simulatorprüfungen und physischen Geräten.

### Framework- und Plattformgrenzen

- Workers-HTTP-Anfrage-/Antwort-Streaming und natives TCP werden durch gemeinsame Contracts abgedeckt. Dateiauslieferung, WebSockets, andere Node-Module und Weitergabe asynchroner Kontexte benötigen eigene Kompatibilitätsarbeit; das Inventar dokumentiert ihren Stand. Die Kompatibilitätsschicht ist keine allgemeine Node-Laufzeit.
- `passThroughOnException`, WorkerEntrypoint/RPC und das Service-Worker-Format werden nicht unterstützt. Workers-spezifische Request-Felder sind nur dort abgedeckt, wo es das Kompatibilitätsinventar angibt; `Request.cf` bleibt lokal erhalten und wird nicht mit Cloudflare-Netzwerkmetadaten befüllt. Die Worker-Auswertung darf vor der Installation keine eigenen lokalen Endpunkte abrufen.
- Der fetch-Patch von CapacitorHttp ist nicht getestet; lassen Sie ihn für diese Preview deaktiviert. Das Paket enthält nativen TCP-/TLS-Transport und Quellen für Dokumentintegration (iOS SPM / Android Gradle). Ein gewöhnlicher Browser verwendet Browser-Fetch; natives Dokumentrendering benötigt Capacitor.

### Sicherheits- und Netzwerkgrenzen

- Behandeln Sie alles in der App Gepackte als für Benutzer lesbar. Betten Sie keine Datenbankzugangsdaten, Service-Tokens oder anderen Servergeheimnisse ein.
- Für erkannte entfernte Ausführungsgrenzen entfernt der Build Serverimplementierungen einschließlich ihres SQL aus dem Client-Bundle. Dies ist kein allgemeiner Geheimnisscanner: Prüfen Sie vor Auslieferung den erzeugten Build-Bericht und die gebündelten Assets.
- Authentifizieren und autorisieren Sie Anfragen auf dem bereitgestellten Worker. `remote.getToken` kann vorhandene Bearer-Zugangsdaten liefern, und natives Rendering unterstützt serververwaltete Cookie-Sitzungen; die Bibliothek stellt kein Authentifizierungssystem bereit. Eine in `remote.origin` konfigurierte URL schützt den Endpunkt nicht.
- Vom Worker erzeugtes HTML läuft mit Zugriff auf die Capacitor-Plugins der App. Rendern Sie nur vertrauenswürdigen Anwendungsinhalt; verwenden Sie diese Integration nicht zur Anzeige beliebiger externer Seiten.

Siehe die [Sicherheitshinweise zur Integration](integration.md) für Client-/Server-Grenze und Migrationsprüfungen.

Bei einem direkten Worker-Import können passende Worker-Unteranfragen erneut in den UI-Handler eintreten. In Capacitor verwendet ausgehendes HTTP(S) den gepackten nativen Transport, auch bei Weiterleitung aus einem Dedicated Worker. Dieser Transport verarbeitet Header, Weiterleitungen und Antwortbytes außerhalb der Browser-CORS-Durchsetzung. In einem gewöhnlichen Browser verwenden ausgehende Anfragen Browser-Fetch und unterliegen weiterhin dessen CORS- und Header-Beschränkungen. Keiner der beiden Ausführungsmodi ist ein workerd-Isolat.

### Worker-Transport und Ressourcenlebensdauer

Der isolierte Transport streamt Uploads und Antworten als Pull-gesteuerte MessagePort-Blöcke (Uploads werden bei 64 KiB geteilt). Upload-Handler können vor EOF laufen; Abbruch gibt den Upload-Reader frei. Er bewahrt status/statusText/headers, Body-Abbruch, Abbruch nach Headern und Hintergrundabschluss. Ungültige/verwendete/gesperrte Antworten und undurchsichtige/Fehlerantworten mit Status 0 werden abgelehnt. Fehler behalten Name/Nachricht, nicht Identität/Stack; eigene Abbruchgründe werden nicht zum Worker übertragen. Nicht verbrauchte Antwortbodys halten Ressourcen bis zum Verbrauch, Abbruch oder zur Freigabe. `drain()` verfolgt Hintergrundarbeit, nicht den Body-Verbrauch.

## Ausführungsumgebung und asynchroner Kontext

Der ursprüngliche Worker-Handler bleibt der Cloudflare-Einstiegspunkt. Installieren Sie das Vite-/esbuild-Plugin nur im Capacitor-/Browser-Build: Seine Aliase wählen lokale API-Implementierungen; der Cloudflare-Build behält natives `node:*` und `cloudflare:*`. `getExecutionEnvironment()` (auch über `workers-capacitor/environment` verfügbar) unterscheidet Cloudflare Workers, native Capacitor-Hosts, Browser-Worker, Browser und unbekannte Realms. Ein Dedicated Worker im Browser ist kein Cloudflare Worker. Die Installation der Capacitor-Laufzeit in Cloudflare Workers schlägt fehl, bevor globale Werte verändert werden.

Capacitor-Builds transformieren asynchrone Funktionen und Generatoren unter Beibehaltung von `await` auf Modulebene, damit AsyncLocalStorage-Bereiche sofort wiederhergestellt werden und Promise-Fortsetzungen ihre eigenen Stores behalten. Anwendungshandler benötigen keine Änderungen. Native asynchrone Callbacks außerhalb dieser Build-Pipeline (zum Beispiel durch `eval`) werden als ALS-Bereichs-Callbacks abgelehnt. Cloudflare verwendet weiterhin seine native Implementierung asynchroner Kontexte.

Dokumentantworten werden unter iOS und Android schrittweise abgerufen. Native Dokumentuploads überschreiten weiterhin eine gepufferte Grenze und werden oberhalb von 8 MiB vor dem Zusammenfügen abgelehnt; verwenden Sie für Streaming-Uploads die reine Fetch-Laufzeit. LocalStorage-KV-Stream-Lesungen dekodieren begrenzte Blöcke verzögert, doch die Speicher-API selbst liefert notwendigerweise einen vollständigen kodierten Datensatz. Ihre synchronen Speicher-/Kontingentgrenzen gelten weiterhin.
