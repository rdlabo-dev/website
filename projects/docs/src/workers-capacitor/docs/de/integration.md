---
title: "Eine bestehende Workers-Anwendung mit Capacitor integrieren"
sourceRevision: 7a6366b906960848bc8dab302e7541d0c0b0826af7561572c9b64b41ece31dec
---

# Eine bestehende Workers-Anwendung mit Capacitor integrieren

Geben Sie diese Anleitung einem KI-Coding-Assistenten mit Zugriff auf Ihr Anwendungsrepository. Ziel ist, die vorhandene Workers-Anwendung mit möglichst wenigen Änderungen am Anwendungscode in Capacitor auszuführen. Beginnen Sie mit dem Hinzufügen von Capacitor und dem Verbinden des bestehenden Worker-Einstiegspunkts; bewahren Sie Cloud-Build, Rendering, Routen, Geschäftslogik und Authentifizierung.

Das wichtigste Erfolgskriterium ist eine funktionierende native Anwendung mit minimalem Integrationsaufwand, keine neue Anwendungsarchitektur. Behalten Sie gewöhnliche HTML-Dokumente, Links und Formulare bei, wo die Anwendung sie nutzt. SPA-Umwandlung, ein neuer Client-Router, App-Shell-Neugestaltung, SSR-/API-Trennung und das Hinzufügen von Hydration sind keine Voraussetzungen.

## Wie bestehende Worker-Seiten auf den Bildschirm gelangen

Mit `render` liefert die Bibliothek die Worker-Antwort als Antwort auf eine WebView-Dokumentanfrage. Die WebView rendert dieses HTML als Seite, führt ihre Skripte aus und lädt ihre Ressourcen. Die Anwendung muss weder HTML in ein bestehendes DOM einfügen noch es in einem iframe anzeigen.

```text
WebView opens /notes at the app's local origin
  → the library receives the document request
  → generated dispatch selects local or remote execution
      local:  the existing Fetch handler runs on the device
      remote: the request goes to the existing deployed Worker
  → response status, headers and HTML body return through the document bridge
  → WebView renders the page
```

Beide Ausführungspfade verwenden denselben Dokumentantwortmechanismus. Eine D1-gestützte Seite kann Authentifizierung, Abfrage und SSR auf dem entfernten Worker behalten; eine kompatible unabhängige Seite kann lokal rendern. Der Build kann den gesamten Worker für entfernte Ausführung auswählen, wenn sichere Trennung nicht möglich ist. Dies ist Anfrage-Dispatch, kein einzelnes Verschieben von D1-Operationen zwischen Laufzeiten.

Das Folgen eines gewöhnlichen Links erzeugt die nächste Dokumentanfrage über denselben Mechanismus. Unterstützte Formularübermittlungen und gleichursprüngliche Weiterleitungen behalten ebenfalls die Dokumentnavigation bei. Vorhandene Client-Skripte können Interaktion oder Hydration bereitstellen, wo das Framework sie verwendet. Gebündelte Assets umgehen den Worker-Router; andere Anfragen folgen ihrem konfigurierten Routing. Bewahren Sie das vorhandene Seitenmodell der Anwendung, bevor Sie eine Neugestaltung erwägen.

Unter iOS verwendet die Bridge `WKURLSchemeHandler`, unter Android einen Service Worker. Die sichtbare Seite behält die app-lokale URL (normalerweise `capacitor://localhost` unter iOS und `https://localhost` unter Android), während der Worker seine logische HTTP(S)-URL erhält. Dies ist natives Dokumentrendering, kein entfernter Browsertab und kein lokaler HTTP-Server. Siehe die [Anleitung für natives Rendering](native-rendering-api.md) für Formular-, Weiterleitungs-, Asset- und Lebenszyklusgrenzen; dies garantiert nicht jede Browser- oder Framework-Funktion.

## Prompt für Ihren KI-Assistenten

```text
Follow https://github.com/rdlabo-dev/workers-capacitor/blob/v0.1.0/docs/integration.md
to bring this app to iOS and Android with workers-capacitor.
Preserve its pages, routes and authentication; verify it on the target platforms.
```

Geben Sie Zielplattformen, App-ID/-Namen und, falls verfügbar, einen vorhandenen Test-Worker-Origin an. Der Assistent sollte Einstiegspunkte, Framework und Skripte aus dem Repository ableiten und nur nach fehlenden Produktentscheidungen oder nicht ableitbarem Zugriff fragen.

## Ablauf

Folgen Sie den nachstehenden Sicherheits- und Verifizierungsschritten. Cloud-Deployments und App-Veröffentlichung erfordern ausdrückliche Benutzerautorisierung.

1. Untersuchen Sie die Anwendung und wählen Sie natives HTML-Rendering oder reine Fetch-Integration.
2. Installieren Sie Capacitor und dieses Paket in der Anwendung.
3. Konfigurieren Sie den nativen Build und verbinden Sie den vorhandenen Worker.
4. Verifizieren Sie unverändertes Verhalten; beheben Sie nur nachgewiesene Inkompatibilitäten.
5. Prüfen Sie die Sicherheit und verifizieren Sie den tatsächlichen Anwendungsablauf.

## 1. Anwendung untersuchen und Integration wählen

Beginnen Sie mit dem [Framework-Integrationsinventar](build-setup.md#frameworks). Angular SSR auf Workers ist noch nicht verifiziert; Build-Werkzeug-Unterstützung allein weist keine Framework-Unterstützung nach. Folgen Sie bei Void der Anleitung für erzeugte Einstiegspunkte und den Versionsanforderungen.

Lesen Sie Worker-Einstiegspunkt, Build-Skripte, Wrangler-Konfiguration, Seitenrouten, Middleware und Authentifizierungscode. Halten Sie diese Entscheidungen im Implementierungsplan fest, statt ein dauerhaftes Fortschrittsdokument anzulegen:

- Welche Routen erzeugen HTML, JSON und statische Assets?
- Welche Seiten benötigen D1, andere Bindings, Geheimnisse oder eine Sitzung vor dem Rendern?
- Welche Abhängigkeiten können lokal ausgeführt werden, und welche benötigen den vorhandenen bereitgestellten Worker?
- Was authentifiziert API-Aufrufe, und wo werden Eigentum und Autorisierung durchgesetzt?
- Fordert Navigation weitere servergerenderte Inhalte an? Berücksichtigen Sie verschachtelte Layouts, Weiterleitungen, Framework-Datenanfragen und Mutationen, nicht nur die erste Seite.
- Welche Assets und Laufzeit-APIs müssen lokal verfügbar sein?

Bewahren Sie den bestehenden Cloud-Build. Ergänzen Sie Vite- oder esbuild-Integration nur im Capacitor-Build. Fügen Sie keinen Node-HTTP-Server hinzu, ersetzen Sie nicht den nativen Controller, betten Sie kein iframe ein und importieren Sie keine bibliotheksinternen Transportdateien in Anwendungscode.

Wählen Sie die kleinste Integration, die die Anwendung bewahrt:

- **Bestehendes Frontend, das Worker-APIs aufruft:** Behalten Sie dieses Frontend und initialisieren Sie die reine Fetch-Laufzeit vor dem Einhängen. Keine Rendering-Migration ist erforderlich.
- **Worker, der HTML zurückgibt (Hono/TSX, Workers Express, OpenNext):** Verwenden Sie natives Dokumentrendering mit `render`. Bewahren Sie Router und Rendering, soweit unterstützt.
- **Cloudabhängige Anfragen:** Konfigurieren Sie entfernte Ausführung und prüfen Sie den Build-Bericht. Lassen Sie den vorhandenen Handler unverändert; ein vollständig entfernter Worker ist akzeptabel, wenn dies zum Erhalt des Verhaltens nötig ist.

## 2. Capacitor und dieses Paket installieren

Verwenden Sie Capacitor 8 und kompatible Plattformpakete. Bereiten Sie die Plattform-SDKs anhand der [Capacitor-Installationsanleitung](https://capacitorjs.com/docs/getting-started) vor. Im Anwendungspaket (vorhandene Capacitor-Konfiguration wiederverwenden):

```sh
npm install @capacitor/core@8 @capacitor/ios@8 @capacitor/android@8
npm install -D @capacitor/cli@8 typescript
npx cap init
```

Installieren Sie für das folgende Vite-Beispiel `vite@7` als Entwicklungsabhängigkeit, falls es noch nicht vorhanden ist. Behalten Sie eine bestehende unterstützte esbuild-Einrichtung bei, statt Vite hinzuzufügen.

Setzen Sie die eigene ID/den Namen der Anwendung und `webDir: "www"`. Verwenden Sie Swift Package Manager für iOS; diese Bibliothek enthält keine CocoaPods-Integration. Installieren Sie die Preview-Version 0.1.0 von npm:

```sh
npm install workers-capacitor
```

Prüfen Sie vor dem Build eines nativen Ziels die [nativen SDK-Anforderungen und Android-Gradle-Ressourcenregeln](development.md#native-demo). Die Android-Ressourcenregeln gehören in `android/app/build.gradle` der Anwendung.

Halten Sie Capacitor-/native Projekte im Anwendungspaket, nicht im Quellbaum der Bibliothek. Verwenden Sie vorhandene Abhängigkeiten und Skripte wieder, statt unnötig eine zweite Anwendung anzulegen.

## 3. Native Anwendung konfigurieren und erstellen

Ergänzen Sie bei einer vom Worker gerenderten Anwendung diese Dateien neben dem vorhandenen Worker:

```text
src/worker.ts             Existing Worker entry
capacitor/index.html     Runtime bootstrap only
capacitor/main.ts        Runtime initialization
capacitor/vite.config.ts Separate native build
capacitor.config.ts      webDir: "www"
```

```html
<!-- capacitor/index.html -->
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Application</title>
  </head>
  <body>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
```

```ts
// capacitor/vite.config.ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "workers-capacitor/tooling/vite";
const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  root: here("."),
  base: "/",
  plugins: [
    workersCapacitorPlugin({
      worker: here("../src/worker.ts"),
      workerConfig: here("../wrangler.jsonc"),
    }),
  ],
  build: { outDir: here("../www"), emptyOutDir: true, target: "es2022" },
});
```

Dieses Beispiel verwendet Vite. Verwenden Sie bei einem vorhandenen esbuild-Build stattdessen die [esbuild-Einrichtung](build-setup.md#esbuild). Führen Sie Vite nicht allein ein, um einen unterstützten Build zu ersetzen. Einfaches Browser-ESM ist für browserkompatibles JavaScript verfügbar, richtet native Dokument-Assets aber nicht automatisch ein.

Passen Sie Pfade an die tatsächliche Anwendung an. Bei OpenNext ist der Einstiegspunkt die erzeugte `.open-next/worker.js`; erstellen Sie diese zuerst und konfigurieren Sie entferntes ASSETS ausdrücklich, falls verwendet. Zusätzliche Konfiguration beschreibt die [Binding-Anleitung](cloudflare-bindings.md).

```ts
// capacitor/main.ts — lokale Dokumenteinrichtung
import { workersCapacitor } from "workers-capacitor";
const runtime = workersCapacitor({
  baseURL: "https://worker.invalid/",
  render: "/",
});
await runtime.ready;
```

Wenn der Build-Bericht entfernte Routen oder vollständig entfernte Worker-Ausführung auswählt, ergänzen Sie `remote: { origin: "https://your-worker.example.com" }` in diesen Optionen und verbinden Sie Ihre bestehende Authentifizierung. Die entfernte Konfiguration ist für diese erzeugte Grenze erforderlich. Lassen Sie bei rein lokalem Build `remote` weg; die Angabe ohne erzeugte entfernte Grenze wird abgelehnt. Siehe die [Binding-Konfigurationsanleitung](cloudflare-bindings.md).

`baseURL` ist der logische Worker-Origin, für sich allein keine Cloud-Verbindung. `remote.origin` bezeichnet den bereitgestellten HTTPS-Worker. Mit erzeugtem Dispatch behalten relative API-Anfragen ihren Pfad, und ausgewählte Anfragen erreichen diesen Server. Der lokale App-Origin ist normalerweise `capacitor://localhost` unter iOS und `https://localhost` unter Android. Siehe [URL-Vertrag](runtime.md#url-contract).

`render` wählt natives Dokumentrendering einschließlich Links und Formularen; es ist keine speziell für Formulare vorgesehene Option. Lassen Sie bei einem vorhandenen separat erstellten Frontend `render` weg, initialisieren Sie die reine Fetch-Laufzeit vor dem Einhängen der Oberfläche und verwenden Sie eine reine API-`baseURL`-Grenze wie `https://your-worker.example.com/api/`. Halten Sie dieses Frontend außerhalb der API-Grenze. Der Plugin-Einstiegspunkt muss der entsprechende API-Worker sein; prüfen Sie auch seinen Remote-Dispatch-Bericht.

Erstellen und installieren Sie die App (jede native Plattform nur einmal hinzufügen):

```sh
npx vite build --config capacitor/vite.config.ts
npx cap add ios
npx cap add android
npx cap sync
npx cap run ios
# Oder: npx cap run android
```

Erstellen Sie vor jedem sync einen Build. Dokumentrendering verwendet gebündelte Assets, nicht den Vite-Entwicklungsserver. Siehe [natives Rendering](native-rendering-api.md) für Lebenszyklus und Assets.

## 4. Verhalten bewahren und nur tatsächliche Inkompatibilitäten beheben

Erstellen und starten Sie den vorhandenen Einstiegspunkt, bevor Sie eine Anwendungsumstrukturierung vorschlagen. Konfigurieren Sie Bindings und Verbindung zum vorhandenen Worker anhand der [Anleitung zu entfernten Bindings](cloudflare-bindings.md). `remote.origin` liefert das Ziel; es klassifiziert nicht selbst Routen. Das Build-Plugin erzeugt den Dispatch aus Anwendung und Konfiguration.

Prüfen Sie Client-Initialisierung ebenso wie SSR-Ausgabe. Eine Client-Bibliothek, die einen HTTP(S)-Endpunkt aus `window.location.origin` ableitet, kann das iOS-Schema `capacitor://` ablehnen, bevor Hydration abgeschlossen ist. Die gepinnte [flare-stack-blog-Fixture](../demo/tests/upstream/flare-stack-blog/README.md) reproduziert dies mit Better Auth. Unterstützt die Bibliothek einen expliziten HTTPS-Endpunkt, validieren Sie diese Konfiguration gemeinsam mit Authentifizierung, Cookies und Routing; entfernte Worker-Ausführung allein ändert den Origin der sichtbaren Seite nicht. Täuschen Sie keinen Origin vor und deaktivieren Sie keine Authentifizierungsprüfungen, um die Initialisierung erfolgreich zu machen.

| Bestehende Anwendung | Erster Integrationsansatz | Zu verifizierende Grenze |
| --- | --- | --- |
| Hono / TSX mit HTML-Ausgabe | `export default app`, Templates, Routen und Formulare beibehalten; `render` verwenden | Kompatible Handler rendern lokal ohne lauschenden HTTP-Server |
| Workers Express | Workers-Fetch-Handler-Einstiegspunkt und bestehende Routen beibehalten | Unterstütztes Workers Express unterscheidet sich von beliebigen Node.js-Serveranwendungen |
| D1-Abfrage mit anschließendem SSR | Abfrage und HTML-Antwort zusammenhalten; Anfrage an bestehenden Worker weiterleiten | D1 bleibt entfernt; weder SQL-zu-fetch-Umschreibung noch neuer JSON-Endpunkt nötig |
| Sitzungsmiddleware zum Seitenschutz | Middleware und serververwaltete Sitzungen beibehalten | Cookie-/Shared-State-Abhängigkeiten können vollständig entfernte Worker-Ausführung auswählen |
| Next.js / OpenNext | Bestehende Cloud-Ausgabe erstellen und `.open-next/worker.js` auswählen | Cloud-Abhängigkeiten können den gesamten erzeugten Worker entfernt halten |
| Cloud ASSETS | `assetsExecution: "remote"` konfigurieren | Lokales ASSETS ist nicht implementiert; bestehendes Cloud-Asset-Verhalten bewahren |

Bei statisch analysierbaren Hono-Anwendungen kann der Build unabhängige Routen lokal halten. Kann er Anfragen nicht sicher trennen, wählt er vollständig entfernte Worker-Ausführung, auch für allgemeine Fetch-Handler und Workers Express. Prüfen Sie `workers-capacitor-d1.json` oder `workers-capacitor-server.json` in der Ausgabe. Entfernen Sie keine Bindings, umgehen Sie keine Authentifizierung und erstellen Sie keinen weiteren Router, um lokale Ausführung zu erzwingen.

Zum Beispiel kann eine Seite, die den Benutzer authentifiziert, D1 abfragt und SSR-HTML zurückgibt, diesen gesamten Ablauf auf dem bereitgestellten Worker bewahren. Das Gerät rendert die Antwort und verwendet das vorhandene Interaktionsmodell der Anwendung. Dies erfordert eine Verbindung und macht D1 nicht lokal verfügbar. Siehe [D1-Dispatch](d1-transparent-migration.md) und das [OpenNext-Beispiel](../demo/opennext/README.md). Entfernte Ausführung ist ein unterstützter Weg zum Erhalt der Anwendung, keine unvollständige Migration, die anschließend eine Neugestaltung verlangt.

### Next.js: Rendering von Datenausführung unterscheiden

`dynamic(..., { ssr: false })` deaktiviert serverseitiges Prerendering für diese Client Component. Ihr JavaScript rendert sie in der WebView. Es deaktiviert weder die gesamte serverseitige Seitenverarbeitung, verschiebt Datenbankabfragen auf das Gerät noch erzeugt es automatisch eine entfernte API. Siehe [Next.js Lazy Loading](https://nextjs.org/docs/app/guides/lazy-loading).

Prüfen Sie vor Änderungsvorschlägen, wo jede Abfrage tatsächlich läuft:

| Bestehender Abfrageort | Zu bewahrendes Verhalten |
| --- | --- |
| `useQuery`, SWR oder Client-Code mit HTTP-API-Aufrufen | Die WebView führt den Client-Code aus; die API verarbeitet dessen Serveroperationen. Vorhandenen Endpunkt und Authentifizierung bewahren. |
| Übergeordnete Server Component oder `getServerSideProps` mit D1-Abfrage | Die Abfrage bleibt serverabhängig, selbst wenn eine untergeordnete Komponente `ssr: false` hat. Unterstützten entfernten Anfrage-Dispatch verwenden. |
| Direkter D1-Zugriff, der in Client-Code importiert ist | Dies kann nicht in der WebView laufen. `ssr: false` verwandelt es nicht in einen HTTP-Aufruf; identifizieren Sie die ungültige Grenze vor einer gezielten Korrektur. |

Ist eine Anwendung bereits als Client-Rendering → API-Anfrage → D1 strukturiert, behalten Sie diese Struktur bei. Fügen Sie keine weitere API-Schicht hinzu, erzwingen Sie kein SSR und ersetzen Sie nicht die Abfragebibliothek, um Capacitor zu integrieren. Verwendet die Abfrage Server Actions oder einen anderen Framework-Transport statt einer gewöhnlichen HTTP-API, verifizieren Sie diesen gegen die dokumentierten Framework-Grenzen, statt identische Unterstützung anzunehmen.

Leiten Sie tatsächliches SSR weder aus einem Flag, einer HTTP-200-Antwort noch einem String im Antwortbody ab. Prüfen Sie, dass der erwartete Inhalt vor Ausführung der Seitenskripte als Dokumentelemente existiert; Text in Skripten oder serialisierten RSC-Daten ist kein gerendertes HTML. Initiales HTML allein unterscheidet Build-Prerendering nicht von SSR zur Anfragezeit. Prüfen Sie Framework-Build-Metadaten für vorgerenderte Routen und verifizieren Sie Rendering zur Anfragezeit mit frischen anfrageabhängigen Werten in Dokumentelementen. Melden Sie ohne diesen Nachweis initiales HTML mit unbekanntem Rendering-Zeitpunkt. Vergleichen Sie anschließend mit aktiviertem JavaScript und beobachten Sie API-/Framework-Anfragen. Eine Seite kann gleichzeitig ein servergerendertes Layout und rein clientseitige Datenbereiche enthalten. Halten Sie das Ergebnis je Bereich und getesteter Route fest, nicht als universelles SSR-Label für die ganze Anwendung.

Komponentenrendering und Worker-Dispatch sind getrennte Entscheidungen. Die Build-Integration interpretiert `ssr: false` nicht als Anweisung für eine lokale Route. Ein erzeugter OpenNext-Worker mit Cloud-Abhängigkeiten kann weiterhin vollständig entfernte Ausführung für initiale Dokumente und API-Anfragen wählen. Prüfen Sie den Build-Bericht und testen Sie tatsächliche Anfragen; ein clientgerenderter Bildschirm allein weist weder lokalen Start noch Offline-Verfügbarkeit nach.

### Wenn Konfiguration nicht ausreicht

Reproduzieren Sie den Fehler und ermitteln Sie, ob er aus Konfiguration, dokumentierten Bibliotheksgrenzen oder Anwendungsannahmen stammt. Korrigieren Sie zuerst die Konfiguration. Ist eine Anwendungsänderung nötig, begrenzen Sie sie auf das fehlschlagende Verhalten und verifizieren Sie, dass das Cloud-Verhalten erhalten bleibt.

- **Nur auf Origin basierende CSRF-Prüfungen:** Beobachtete Header bleiben erhalten; iOS stellt einen fehlenden Formular-Origin nur anhand eines verifizierten lokalen Main-Frame-Initiators wieder her. Andere Anfragen können ihn weglassen. Behalten Sie CSRF-Schutz wie Token-Validierung bei; deaktivieren Sie ihn niemals.
- **Externe Authentifizierungsweiterleitungen:** Der entfernte Transport lehnt Weiterleitungen zu einem anderen Origin ab. Verwenden Sie eine explizite [Authentifizierungsintegration im externen Browser](../demo/authentication/README.md), falls die Anwendung sie benötigt; ersetzen Sie nicht den Identitätsprovider, nur um diese Grenze zu umgehen.
- **Passkeys/WebAuthn:** Rendering entfernten HTMLs behält den lokalen Dokument-Origin. Erfolgreiche Browserauthentifizierung weist weder native Registrierung noch PRF-Unterstützung nach. Validieren Sie Relying-Party-Domain, Plattform-Zugangsdatenintegration und App-/Domain-Zuordnung; umgehen Sie keine Origin-Prüfungen. Die [pknotes-Fixture](../demo/tests/upstream/pknotes/README.md) dokumentiert die aktuelle native Grenze.
- **Nicht unterstütztes Laufzeit- oder Framework-Verhalten:** Konsultieren Sie das [Kompatibilitätsinventar](compatibility.md) und die [OpenNext-Grenzen](opennext.md). Weisen Sie die fehlschlagende Funktion nach, bevor Sie Abhängigkeiten ersetzen oder Rendering ändern. Ein erfolgreicher Import oder eine SSR-Antwort weist keine vollständige Framework-Unterstützung nach.

Melden Sie ungelöste Grenzen ausdrücklich. Verstecken Sie sie nicht durch leere Daten, vorgetäuschten Erfolg oder automatische Wiederholungen, die Schreibzugriffe wiederholen könnten.

### Optionale spätere Optimierung: lokales initiales Rendering

Verfolgen Sie dies nur, wenn die Anwendung lokalen Start oder eine gemessene Verbesserung benötigt, nachdem die grundlegende Integration funktioniert. Kompatibles vorhandenes SSR kann im lokalen Worker laufen und HTML vor Client-Interaktion oder Hydration liefern. SSR ist erhaltenswert; lokale Ausführung impliziert kein rein clientseitiges Rendering.

Wartet dieser Renderer auf entfernte Daten, ist die Trennung einer lokal gerenderten App Shell von authentifizierten Datenanfragen eine mögliche Anwendungsumstrukturierung. Sie geschieht nicht automatisch und liegt außerhalb der standardmäßigen Integrationsarbeit. Bewahren Sie Templates, Navigation und Autorisierung und messen Sie nützlichen Inhalt sowie bedienbare Steuerelemente, bevor Sie eine Geschwindigkeitsverbesserung behaupten. Bei Next.js entfernt Hydration allein keine Serverabhängigkeiten; siehe [OpenNext-Einschränkungen](opennext.md). Stellen Sie die Cloud-Anwendung nicht auf statischen Export um und fügen Sie keine neuen APIs allein zum Abschließen dieser Anleitung hinzu.

## 5. Sicherheit: Das Gerät ist kein vertrauenswürdiger Server

### Was der Build entfernt

Mit der buildgenerierten entfernten Grenze werden Serverhandler und ihre ungenutzten Hilfsfunktionen einschließlich SQL aus dem Client-Modulgraphen entfernt, bevor Source Maps entstehen. Der vollständig entfernte Worker-Modus lässt die Anwendungsimplementierung weg. Dies ist **Ausschluss zur Build-Zeit**, keine Löschung ursprünglicher Quellen und kein SQL-Sanitizer zur Laufzeit. Siehe [Codeentfernung](d1-transparent-migration.md#code-removal-and-execution-boundaries).

Dies findet nicht jedes fest kodierte Geheimnis. Manuell in öffentliche Assets kopierte Dateien, `workerFiles`, Bundler-Defines, Client-`env`, Logs und unabhängige Client-Importe können weiterhin sensible Daten offenlegen. Prüfen Sie gepacktes JS, Maps und Assets. Umgehen Sie die Entfernung niemals durch separaten Import des ursprünglichen Servermoduls.

### Entfernte Operationen authentifizieren und autorisieren

Für private Daten und Schreibzugriffe muss der Worker eine Sitzung oder ein Bearer-Token validieren und jede Operation autorisieren. Ermitteln Sie die Benutzer-ID aus der verifizierten Identität, nicht aus einem nicht vertrauenswürdigen Anfragefeld. Begrenzen Sie Datenbankabfragen auf den autorisierten Eigentümer oder Mandanten. Testen Sie, dass Benutzer A die Datensätze von Benutzer B weder lesen noch ändern kann.

CORS, ein versteckter Endpunkt, SQL-Entfernung, eine vom Gerät gelieferte ID und ein eingebetteter gemeinsamer API-Schlüssel sind keine Authentifizierung. Behalten Sie bestehende Authentifizierung bei; diese Bibliothek transportiert Zugangsdaten, stellt aber keine Identitäten aus und erzwingt keine Richtlinien. Öffentliche Leseendpunkte dürfen mit geeigneten Limits bewusst öffentlich bleiben.

### Anonyme Benutzer ohne erforderliche Anmeldeoberfläche

Für eine Anwendung ohne bestehende Authentifizierung ist Firebase Anonymous Authentication eine Option für Gastidentitäten. Es erzeugt eine UID ohne Registrierungsbildschirm; bewahren Sie die vorhandene Sitzung, statt bei jedem Start ein neues Konto anzulegen. Siehe [Firebase-Anleitung zur anonymen Anmeldung](https://firebase.google.com/docs/auth/web/anonymous-auth).

Verbinden Sie die initialisierte hostseitige Auth-Instanz über `remote.getToken`:

```ts
remote: {
  origin: "https://your-worker.example.com",
  getToken: async () => {
    const user = auth.currentUser; // Firebase auth vor dem Start initialisiert
    if (!user) throw new Error("Authentication required");
    return user.getIdToken(); // Erneuert abgelaufene Tokens über das SDK
  },
}
```

Dies ist Verbindungspseudocode, kein gebündelter Firebase-Adapter. Verwenden Sie ihn nur, wenn die Anwendung keine bestehende Authentifizierung hat und Gastidentität zu ihrer Zugriffsrichtlinie passt. Stellen Sie die vorhandene Sitzung wieder her, bevor Sie entscheiden, ob anonyme Anmeldung nötig ist; lassen Sie geschützte Anfragen erst nach Bereitschaft der Authentifizierung zu und behandeln Sie Fehler explizit. Hat die Anwendung bereits einen öffentlichen lokalen Ladebildschirm, muss Authentifizierung ihn nicht blockieren. Dies verlangt keine neue App Shell.

Belassen Sie Token-Abruf im Host, nicht im isolierten Worker. Native Dokumentseiten und Laufzeithost haben getrennte JavaScript-Kontexte; eine seitenseitige Firebase-Instanz ist nicht automatisch die Host-Instanz. Android initialisiert den Host separat. Ein Token, das nur in der initialen UI-Closure liegt, ist dort nicht verfügbar. Stellen Sie Zugangsdaten im Host ohne doppelte interaktive Anmeldung wieder her oder tauschen Sie das Provider-Token gegen die HttpOnly-Sitzung des bestehenden Workers; das [Beispiel für externe Browser](../demo/authentication/README.md) demonstriert Letzteres.

Der Server muss Signatur, Ablauf, Issuer und Projekt-Audience anhand von Firebases [Anforderungen an die ID-Token-Verifizierung](https://firebase.google.com/docs/auth/admin/verify-id-tokens) mit einem Workers-kompatiblen Verifier prüfen; bloßes Dekodieren von JWT-Claims genügt nicht. Firebase Security Rules schützen D1 nicht: Implementieren Sie Autorisierung im Worker.

Anonyme Identität beweist weder eine echte Person, ein vertrauenswürdiges Gerät noch eine offizielle App-Installation. Jeder kann ein Gastkonto erstellen. Begrenzen Sie Gastrechte, Anfrageraten und kostspielige Operationen; bieten Sie Kontoverknüpfung an, wenn Daten den Verlust lokaler Zugangsdaten überstehen müssen. Erwägen Sie [App Check](https://firebase.google.com/docs/app-check) zum Missbrauchsschutz getrennt von Benutzerauthentifizierung. Diese Bibliothek liefert weder native Attestierung noch App-Check-Validierung.

[Cloudflare Access](https://developers.cloudflare.com/workers/configuration/cloudflare-access/) ist eine Alternative für zugriffsbeschränkte Zielgruppen wie interne Anwendungen, kein direkt austauschbarer Gastidentitätsdienst. Betten Sie niemals ein gemeinsames Access-Service-Token-Geheimnis in eine verteilte App ein.

### Gepackten Code und Daten als extrahierbar behandeln

Capacitor-Bundles können untersucht werden. Betten Sie weder Cloudflare-Verwaltungstokens, private Service-Account-Schlüssel, Datenbankzugangsdaten noch privilegierte Service-Tokens in JS, native Quellen, in die App kompilierte `.env`-Werte oder gebündelte Dateien ein. Verschleierung macht ein Geheimnis nicht sicher. Öffentliche Client-Kennungen/-Konfiguration unterscheiden sich von Serverzugangsdaten und dürfen nicht als Vertrauensnachweis dienen.

Benutzerzugangsdaten brauchen Ablauf, Widerrufs-/Logout-Behandlung und plattformgerechte Speicherung. Betriebssystemgeschützter Speicher reduziert die Offenlegung, macht ein kompromittiertes Gerät aber nicht vertrauenswürdig. Protokollieren Sie keine Tokens oder privaten Antworten; löschen Sie benutzerbezogene Cache-Daten bei Kontowechseln. Der entfernte Worker darf nur Daten zurückgeben, die der Aufrufer erhalten darf.

Entferntes HTML führt seine Client-Skripte in der Dokument-WebView der Anwendung aus; Plugin-Aufrufe stammen von dort, nicht aus dem entfernten Worker. Verifizieren Sie eigene Plugin-Aufrufe, Ergebnisse und native Ereigniszustellung von der gerenderten Seite nach Navigation. iOS erstellt einen separaten Capacitor-Dokumentcontroller; daher wird nicht vorausgesetzt, dass manuell registrierte Plugin-Instanzen und Listener des ursprünglichen Hosts übernommen werden. Android behält die sichtbare Anwendungs-WebView. Das [native Abnahmeszenario](../demo/tests/README.md#native-plugin-calls-from-remote-pages) prüft ein automatisch registriertes Paketplugin einschließlich Aufrufergebnissen, nativen Ereignissen und Fehlern nach Navigation und Neustart. Neue Dokumente registrieren neue Listener; alte Seiten-Listener überleben Dokumentersetzung nicht. Beliebige eigene Plugin-Lebenszyklen und manuelle Host-Registrierung bleiben außerhalb dieser Abdeckung.

Native Dokumente haben Zugriff auf Capacitor-Plugins: Maskieren Sie nicht vertrauenswürdigen Inhalt und rendern Sie kein beliebiges HTML als Anwendungscode. Behalten Sie bei Cookie-Authentifizierung CSRF-Schutz bei. Beobachtete Origin- und Fetch-Metadaten-Header bleiben erhalten. Bei einem iOS-Main-Frame-Formular ohne Origin stellt die native Bridge ihn nur anhand eines verifizierten lokalen WebKit-Sicherheits-Origins wieder her. Sandboxed oder unbekannten Initiatoren wird dieser Origin nicht gewährt. Andere native Anfragen können Origin weiterhin weglassen; behalten Sie CSRF-Schutz bei und behandeln Sie Origin niemals als Authentifizierung. Weiterleitungen zu externen Origins werden abgelehnt; OAuth/SSO benötigt explizite Integration eines externen Browsers. Siehe [Grenzen des entfernten Transports](d1-transparent-migration.md).

## 6. Bestehende Anwendung in Capacitor verifizieren

Abnahme bedeutet, dass die vorhandene Anwendung über den neuen Einstiegspunkt und die Konfiguration funktioniert und jede Änderung am Anwendungscode durch eine nachgewiesene Inkompatibilität begründet ist. Vergleichen Sie den nativen Ablauf mit der bestehenden Cloud-Anwendung; machen Sie weder eine Rendering-Neugestaltung noch eine Leistungsverbesserung zur Integrationsbedingung.

Testen Sie die Zielplattformen iOS und Android mit einem tatsächlichen Benutzerablauf:

- Starten Sie die App und prüfen Sie bestehende Startseite, Skripte, Stile, Bilder und Interaktion. Prüfen Sie Hydration nur, wenn die Anwendung sie verwendet.
- Folgen Sie Links, navigieren Sie zurück, übermitteln Sie Formulare und folgen Sie gleichursprünglichen Weiterleitungen. Testen Sie gegebenenfalls das vorhandene Deep-Link-Verhalten.
- Authentifizieren Sie sich, lesen Sie private Daten, aktualisieren Sie einmal, starten Sie neu und melden Sie sich ab. Verifizieren Sie Datenbankzustand und Sitzungsverhalten einschließlich Isolation von einem vorherigen Konto.
- Lehnen Sie fehlende/abgelaufene/gefälschte Zugangsdaten und benutzerübergreifenden Zugriff ab. Verifizieren Sie CSRF-Schutz für Cookie-authentifizierte Mutationen.
- Trennen oder verzögern Sie das Backend. Melden Sie die Verbindungsabhängigkeit des gewählten Ausführungsmodus und verifizieren Sie explizite Fehler ohne falschen Erfolg oder wiederholte Schreibzugriffe. Lokaler Start ist für eine vollständig entfernte Worker-Anwendung nicht erforderlich.
- Prüfen Sie Build-Berichte und gepackte Assets: Lokaler/entfernter Dispatch entspricht der gewählten Konfiguration, ausgeschlossene Server-SQL-/Hilfsfunktionen fehlen und keine privilegierten Zugangsdaten wurden eingebettet.
- Führen Sie bestehende Cloud-Tests der Anwendung aus, um unverändertes Serververhalten durch die Integration zu prüfen. Browsertests ersetzen keine nativen Navigations-/Sitzungstests.

Melden Sie hinzugefügte Integrationsdateien, jede nötige Anwendungsänderung mit Begründung, ausgeführte Befehle, getestete Plattformen, Ausführungsgrenzen und verbleibende Einschränkungen. Unterscheiden Sie Simulator-/Emulatorprüfungen von Prüfungen auf physischen Geräten und entfernte Ausführung von lokaler Kompatibilität. Fehlt ein bereitgestelltes Test-Backend oder natives SDK, geben Sie an, was verifiziert werden konnte und was nicht, statt Abschluss zu behaupten.
