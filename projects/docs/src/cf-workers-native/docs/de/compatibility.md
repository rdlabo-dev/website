---
title: "Kompatibilität und Einschränkungen"
sourceRevision: "eabce73d3a2453218f8df88a57e0edc701428356d16b61eb18fd6b8065336747"
---

# Kompatibilität und Einschränkungen

Das Ziel ist Cloudflare Workers, kein eigenständiger Node.js-Prozess. Das Node-Profil verwendet workerd `1.20261012.1` mit dem Kompatibilitätsdatum `2026-10-17` ohne zusätzliche Flags. Andere Daten und Flags werden von diesem Profil nicht abgedeckt. Die WebView enthält weder workerd noch V8; iOS verwendet seine eigene JavaScript-Engine.

Releases verwenden das [Release-Gate für Anwendungen mit vorrangiger Remote-Ausführung](../CONTRIBUTING.md#remote-first-application-release-gate). Die standardmäßige Netzwerkrichtlinie hält die Serverimplementierung auf dem bereitgestellten Worker. Eine verifizierte mobile Anwendung belegt keine vollständige Workers- oder Node.js-Kompatibilität. Die Vervollständigung lokaler APIs läuft unabhängig mit den folgenden Grenzen weiter.

## Native Hosts

| Host | Umfang |
| --- | --- |
| iOS-Einbettung | SwiftPM-Produkt `WorkersIOS` 0.1.7 für UIKit/SwiftUI. Vor dem Entfernen eines UIKit-Controllers schließen; SwiftUI schließt beim Abbau automatisch. |
| Android-Einbettung | Maven-Central-SDK `io.github.rdlabo:cf-workers-native-android:0.1.7`. Benötigt WebView-`MULTI_PROFILE`; jeweils ein SDK-Bildschirm mit persistenten SDK-Cookies, die von Host-Cookies isoliert sind. |
| Capacitor | Bestehende Capacitor-8-Integration, mit 8.5.3 verifiziert; verwenden Sie diesen Weg für allgemeine native Plugins. |

Die npm-Preview heißt `cf-workers-native`; verwenden Sie die exakte Version und passende native Abhängigkeiten aus der [Abhängigkeitsmatrix](native-embedding.md#dependency-setup). Verwenden Sie die dokumentierte kompatible Kombination von JS- und nativen Abhängigkeiten; diese Hosts sind im früheren Release `workers-capacitor@0.1.1` nicht enthalten. Beide erkennen nach 30 Sekunden einen unvollständigen Start. Sie verwenden Laufzeit und Buildwerkzeuge wieder und behalten daher die folgenden API-/Framework-Grenzen. Das Plattformverhalten beschreiben [Einrichtung und Lebenszyklus der Einbettung](native-embedding.md), hostspezifische Nachweise der [Verifikationsumfang](native-embedding.md#verification).

## Node.js

Vollständige Node-Kompatibilität ist nicht erreicht. Ein erfolgreicher Modulimport belegt keine gleichwertigen Methoden, Validierung, Zustände, Ablaufplanung oder Engine-Eigenschaften.

Der Status ganzer Module bleibt **In Arbeit**, auch bei Modulen, deren bestehende Verträge bestehen. Die Releasevalidierung deckt implementierte Szenarien ab; sie zertifiziert keine ungetesteten Operationen. Fehlende APIs, bekannte Unterschiede und nicht verifizierte Operationen bleiben auch nach dem Release offen.

| Bereich | Verhalten und Grenzen |
| --- | --- |
| path, querystring, string_decoder, buffer, timers | Implementieren das festgeschriebene Workers-Profil. Workers-Stubs bleiben Stubs; beispielsweise reproduziert matchesGlob die festgeschriebene Ablehnung. |
| HTTP und net | Server-Dispatch im Speicher; kein lauschender Betriebssystemserver. Ausgehendes TCP/TLS benötigt den nativen Transport. |
| fs / fs/promises | Schreibgeschützte eingebettete Dateien und anfragegebundenes `/tmp` im Speicher, mit Schreibzugriffen, Deskriptoren und FileHandle-Operationen. Watch wird wie in Workers nicht unterstützt. Die vollständige Dateisystemsemantik wird weiterhin geprüft. |
| module | Begrenztes Builtin-Verzeichnis; createRequire lädt nur VFS-JSON. Ausführbare Module müssen gebündelt werden; beliebige dynamische Auflösung wird nicht unterstützt. |
| process, console, util / util/types / sys | Process umfasst Konfiguration, Laden von Umgebungsdateien und Standardstreams; abort/reallyExit/getBuiltinModule fehlen weiterhin. Engine-Introspektion, Aufrufstellen und Hostobjekterkennung sind nicht gleichwertig mit Workers. |
| crypto und zlib | Ausgewählte Profile decken random/Hash/HMAC/PBKDF2/HKDF/scrypt, geheime/asymmetrische Schlüssel, Signaturen, Primzahlen und Brotli-/Zstd-Streaming ab. X509Certificate-Parsing, -Felder und -Prüfungen sind mit den festgeschriebenen Workers-Grenzen implementiert; weitere Algorithmen und vollständige Crypto-/Codec-Parität bleiben offen. |
| TLS und HTTP-Interna | Direktes TLS und STARTTLS verwenden authentifizierte native Transporte und unterscheiden close_notify von abgeschnittenen Verbindungen. STARTTLS stellt Workers’ frühe secureConnect-Benachrichtigung bereit, während Anwendungs-E/A weiterhin auf Zertifikatsauthentifizierung wartet. Die vollständige Klassen-/Zustandsabnahme bleibt offen. |
| WebSocket | Eigene Implementierungen von WebSocket und WebSocketPair unterstützen natives WS/WSS, accept, close, Kompression und Anhänge. Die Größenberechnung von Anhängen hat eine explizit eingegrenzte Grenze der Engine-Repräsentation; die Abnahme der gesamten API bleibt offen. |
| Streams | Eine eigene Implementierung stellt auf jedem Host Bytestreams und das getestete Workers-Verhalten für tee-Abbruch und pipeTo-Abbruch bereit. Die Abnahme des gesamten Moduls bleibt offen. |
| async_hooks | Beim Build transformierte async-Funktionen behalten bereichsgebundene Stores. Nicht transformierte native async-Callbacks werden abgelehnt; beliebiger dynamischer Code und Isolation nach Anfrageursprung werden nicht vollständig unterstützt. |
| diagnostics_channel | Synchrone Kanal-/Store-Verträge sind implementiert; asynchrone Weitergabe hängt von den async-hooks-Grenzen ab. |
| worker_threads | Workers-Stubs und lokales MessagePort-Verhalten, keine Node-Threads. Kennzeichnung vertrauenswürdiger Ereignisse, Hostobjektserialisierung und globale Identität unterscheiden sich. |
| DNS | DNS-over-HTTPS-Implementierung; synthetische Service-Binding-/Hyperdrive-Adressüberschreibungen sind nicht implementiert. |
| events | [WebView events profile](../src/compat/events/README.md): EventEmitter, Abbruch-/Iterationshelfer, transformierte AsyncResource-Weitergabe und Zustellung von process-Warnungen. Natives async und V8-Inspektion bleiben begrenzt. |
| Weitere Module | Implementierungen und gemeinsame Verträge existieren, aber die Abnahme ganzer Module steht noch aus. Gleiche Namensräume allein reichen nicht. |

Die [Grenze für WebSocket-Anhänge](../src/browser/websocket/README.md) gilt nur für serialisierte Größen, die von der privaten Engine-Repräsentation abhängen. Sie hebt die Anforderungen an unterstützte Werte, Snapshot-Isolation, normale Größenlimits, TLS-Authentifizierung oder Netzwerkverhalten nicht auf.

Die genaue Baseline fehlender/zusätzlicher Exports wird in [surface-gaps.json](../demo/tests/experiments/node-compat/surface-gaps.json) gegenüber den [festgeschriebenen Exports](../demo/tests/experiments/node-compat/exports.json) gepflegt. Diese Dateien sind maßgeblich; diese Anleitung dupliziert die Exportliste nicht. Führen Sie `npm run build` und anschließend `npm run test:node-inventory --prefix demo` zur Prüfung aus. Verhaltensverträge liegen neben der jeweiligen Implementierung in `src/compat`.

### Fertigstellungsbewertung

Das Importaudit prüft Exportnamen und ihre JavaScript-Typen gegen das festgeschriebene Workers-Profil. Ein bestandenes Audit bedeutet keine neue Regression der API-Oberfläche; es belegt keine Kompatibilität des gesamten Moduls. Insbesondere ist eine durch ein Objekt ersetzte Funktion jetzt eine Regression, selbst wenn der Exportname gleich bleibt.

Führen Sie nach `npm run build` den Befehl `npm run test:node-completion --prefix demo` aus, um `demo/artifacts/node-inventory/completion.json` neu zu erzeugen. Der Bericht deckt jedes festgeschriebene Modul in Chromium und WebKit ab, unterscheidet Lücken der API-Oberfläche von übereinstimmenden, aber nicht zertifizierten Modulen und hält die nächste Untersuchung mit Nachweisreferenzen fest. Fehlende Engines, Module oder Typauditdaten sowie ein abweichendes Profil lassen die Generierung fehlschlagen. Das optionale Berichtsflag `--require-complete` weist Nachweise zurück, die nur die API-Oberfläche betreffen; es darf die Berichtsgenerierung nicht in ein Kompatibilitätszertifikat verwandeln.

Die verbleibende Arbeit hat unterschiedliche Ursachen:

- **Implementierungslücken:** `crypto`, `zlib` und verbleibende Semantik des virtuellen Dateisystems benötigen weiterhin Implementierung und Verifikation auf Operationsebene. Ihr Fehlen belegt keine technische Unmöglichkeit.
- **Verhaltenslücken:** Verbleibendes Stream-Lebenszyklusverhalten und synthetisches DNS benötigen spezifische Adapter und Verträge über den Export der richtigen Namen hinaus.
- **Engine-Grenzen:** Proxy-/Promise-Introspektion, Hooks für native async-Fortsetzungen und die Vertrauenskennzeichnung von MessagePort zeigen beobachtbare Unterschiede. Buildtransformationen oder native Bridges benötigen einen expliziten Umfang und separate Verifikation.
- **Workers-Stubs:** Bewahren Sie das tatsächliche No-op-/Ablehnungsverhalten der festgeschriebenen Laufzeit. Implementieren Sie keine Desktop-Node-Fähigkeiten allein deshalb, weil Node sie bereitstellt.
- **Verifikationslücken:** Auch eine übereinstimmende Exportoberfläche benötigt Operations-/Prototypabdeckung des gesamten Moduls und native Abnahme, bevor sie als vollständig gilt.

Ein Getter einer Codecoption kann Eingabe oder Wörterbuch vor der nativen Verarbeitung verändern; diese gewöhnlichen Änderungen bleiben erhalten. Größenveränderbare ArrayBuffers und erweiterbare SharedArrayBuffer-Views werden wie in Workers bei der Konvertierung als Snapshot erfasst. Ein durch einen Optionsgetter übertragener fester ArrayBuffer bildet eine engere Engine-Grenze: Workers kann seinen nativen Hintergrundspeicher nach dem Abtrennen behalten, während JavaScript unmittelbar vor der Übertragung vorgenommene Änderungen nicht wiederherstellen kann. Lokale schnelle Codecs lehnen diesen Fall mit `TypeError` ab, statt stillschweigend leere Daten zu komprimieren. Vermeiden Sie die Übertragung von Eingabe- oder Wörterbuchpuffern aus Optionsgettern. Diese Grenze hebt Anforderungen an andere Codecoptionen oder das Lebenszyklusverhalten nicht auf.

Führen Sie `npm run test:node-boundaries --prefix demo` für die Gegenbeispiele und `npm run test:events --prefix demo` für die Workers-events-Baseline und -Implementierung aus. `node:events` wird über das [WebView events profile](../src/compat/events/README.md) geleitet; process-Warnungszustellung und Microtaskplanung werden mit diesem Adapter geteilt. Tests vergleichen gewöhnliche Vite-/esbuild-Importe innerhalb der Seite und in Dedicated Workers. Die Grenzen von Engine-Inspektion und nicht transformiertem nativem async bleiben explizit; Übereinstimmung mit diesem Profil zertifiziert nicht sämtliche Workers-/Node-Module.

Die [zusätzlichen Kompatibilitätsprofile](../src/compat/expansion/README.md) decken console-Stubs, sys-/util-Aliasse, ausgewählte Cryptooperationen, anfragegebundenes `/tmp`, geheime KeyObjects, Brotli/Zstd/CRC32, Dateisystemmetadaten, Streamabbruch, Modulmetadaten und HTTP-Helfer ab. Führen Sie `npm run test:node-expansion --prefix demo` für Live-Differenztests gegen die festgeschriebene Workers-Version aus. CI führt diese Prüfungen neben der vorhandenen events-Suite aus. Bereiten Sie zur nativen Verifikation mit `npm run test:events:native:prepare --prefix demo` einen installierten Consumer vor und führen Sie anschließend `npm run test:node-expansion:native --prefix demo -- ios <simulator-uuid>` oder `npm run test:node-expansion:native --prefix demo -- android <emulator-serial>` aus. Native Berichte enthalten den Kandidatenhash und die Identität des installierten Tarballs unter `demo/artifacts/node-inventory/native-expansion/`.

Nicht funktionale Workers-Module erhalten keine Gerätefähigkeiten: VM-Isolate, Prozessstart, V8-Heap-Zugriff, UDP-Sockets und ein Betriebssystemterminal werden nicht bereitgestellt. `node:test` stellt die Workers-Mock-API bereit, nicht Nodes vollständigen Test-Runner.

## Workers-APIs und Bindings

- `passThroughOnException`, lokales WorkerEntrypoint/RPC, Cache API und HTMLRewriter werden nicht unterstützt. Scheduled-/Queue-/Workflow-Lebenszyklen werden nicht lokal simuliert.
- `cloudflare:workers` ist partiell. Der isolierte Dispatcher aktualisiert einen realmweiten `env`-Proxy; direkte Ausführung befüllt ihn nicht. Er ist nicht anfragegebunden und wird vor dem ersten Dispatch nicht befüllt. Bevorzugen Sie das Fetch-Handler-Argument. DurableObject ist eine Konstruktorhülle, keine lokale Durable-Objects-Laufzeit.
- `Request.cf` bewahrt übergebene Werte; es erzeugt keine Cloudflare-Metadaten.
- [Lokales KV](kv.md) verwendet Gerätespeicher ohne Cloud-Replikation oder Binding-RPC.
- D1, Hyperdrive, R2, Service Bindings, Queue-Produzenten und [andere Cloud-Dienste](cloudflare-bindings.md) werden entfernt über den HTTP-Handler des bereitgestellten Workers ausgeführt. Sie sind keine lokalen Dienstimplementierungen. Lokales ASSETS wird nicht unterstützt; verwenden Sie die explizite entfernte Asset-Richtlinie.

## Native Netzwerkkommunikation

HTTP/1.1-Framing, Weiterleitungen und Antwortparsing laufen in JavaScript/Wasm. Nativer Code stellt TCP/TLS und WebView-Lebenszyklushooks bereit. Jede HTTP-Anfrage verwendet eine Verbindung mit `Connection: close`; nach dem Senden gibt es keine implizite Wiederholung.

- HTTPS benötigt Content-Length oder Chunked-Framing. EOF-begrenztes HTTPS wird abgelehnt, da die Byte-Bridge authentifiziertes Schließen nicht von Abschneiden unterscheiden kann. Einfaches HTTP unterstützt EOF-Framing.
- Trailer werden geparst, aber nicht als Fetch-Antwortheader bereitgestellt. HTTP/2, Protokollupgrades und CONNECT werden von diesem HTTP/1.1-Transport nicht unterstützt.
- Socket-Lese-/Schreibzugriffe sind auf 64 KiB begrenzt; Headertext ist über Informations-/finale Header und Trailer hinweg auf 64 KiB begrenzt. Lesezugriffe folgen dem Bedarf des Consumers.
- Browserausführung behält CORS-/Header-/Cookie-Beschränkungen des Browsers bei. Nativer Transport verspricht keinen browsergleichen SameSite- oder CSRF-Schutz.
- Beendigung durch das Betriebssystem kann Hintergrundarbeit stoppen. Ausgewählte Szenarien decken physische Geräte ab; das Geräteverhalten Ihrer Anwendung, Wiederherstellung nach WebView-Abstürzen und Speicherdruck erfordern separate Validierung.

## Dokumentrendering

Remote-HTML wird am app-lokalen Origin dargestellt (`capacitor://localhost` unter iOS, `https://workers-sdk.local` im Android-Einbettungs-Host und normalerweise `https://localhost` in einer Capacitor-Android-App). Remote-Ausführung hält Servercode und Cloud-Dienste auf dem Worker; sie macht die WebView nicht zum Origin dieser Website und liefert nicht jede Browser-Authentifizierungsfunktion. Prüfen Sie Hydration und interaktive Bedienelemente, nicht nur eine erfolgreiche HTML-Antwort.

### Grenzen der Anwendungsintegration

| Funktion | Aktuelle Grenze | Integrationshinweis |
| --- | --- | --- |
| Better Auth mit abgeleiteter Client-Basis-URL | Die festgeschriebene flare-stack-blog-Anwendung scheitert unter iOS bei der Clientinitialisierung, weil Better Auth `capacitor://localhost` ablehnt. Androids HTTP(S)-Origin trifft diese Ablehnung nicht. | Ein expliziter HTTPS-Authentifizierungsendpunkt initialisiert den Client, aber dessen vollständiger Login-/Cookie-Ablauf wurde hier nicht validiert. Diese Einstellung allein schließt die Migration nicht nachweislich ab. Siehe [Reproduktion](../demo/tests/upstream/flare-stack-blog/README.md). |
| Passkeys / WebAuthn und PRF | Native Passkey-Registrierung in pknotes schlägt auf beiden getesteten Plattformen fehl. Chromiums virtueller Authenticator belegt keine native Unterstützung. | Native Zugangsdatenintegration, App-/Domainzuordnung und PRF-Verfügbarkeit benötigen separate Validierung. Remote-Rendering kann Relying-Party-Origin-Prüfungen nicht umgehen. Native Unterstützung ist aufgeschoben, nicht als technisch unmöglich bewiesen. Siehe [Authentifizierungsgrenze](../demo/tests/upstream/pknotes/README.md). |
| Void React Pages | Void / @void/react 1.1.12 deckt Remote-D1-Abläufe und ausdrücklich erlaubte öffentliche GET-Routenausführung einschließlich SSR und Hydration auf iOS-Simulator und Android-Emulator ab. Andere Void-Frameworks und lokale Ausführung des gesamten Workers sind ungeprüft. | Verwenden Sie für iOS-Navigation mit eigenem Schema 1.1.12 oder neuer. Siehe [Void-Integration und Verifikationsumfang](void.md). |
| OAuth über externen Browser | Das Beispiel prüft synthetische lokale und öffentliche HTTPS-Testaussteller, PKCE, Callback-Verarbeitung und Sitzungsaustausch, auch auf einem physischen iPhone. Echte Anbieterrichtlinien, Refresh-Token-Speicherung und Wiederaufnahme nach Kaltstart sind nicht abgedeckt. | Verwenden Sie nach Möglichkeit das native SDK des Anbieters. Systembrowser-Cookies werden nicht automatisch mit der WebView geteilt. Siehe [Authentifizierungsbeispiel](../demo/authentication/README.md). |
| Analytics Engine und andere reine Cloud-Dienste | Analytics Engine läuft in Cloudflare; es gibt keine lokale Dataset-Implementierung. Counterscales Live-Szenario benötigt ein eingerichtetes Konto, Ereignisse und ein Analytics-Lesetoken. | Behalten Sie privilegierte Tokens im Backend und authentifizieren Sie Geräteanfragen. Das standardmäßige CI-Authentifizierungsszenario führt keine Live-Analytics aus. Siehe [Counterscale-Einrichtung](../demo/tests/upstream/counterscale/README.md). |
| Bildoptimierung und Geräteleistung | Das OpenNext-Fixture deckt lokales workerd und bereitgestelltes Cloudflare IMAGES ab, einschließlich Rendering auf einem physischen iPhone. Leistungsmessungen sind einzelne Debug-Läufe; physischer iOS-Speicher wurde nicht gemessen. | Prüfen Sie die produktive Bildkonfiguration und messen Sie Release-Build-Start und Speicher auf physischen Geräten vor Leistungsaussagen. Siehe [OpenNext-Lücken](opennext.md#current-gaps). |

Gepinnte Drittanbieter-Fixtures prüfen konkrete Benutzerabläufe ohne Änderung ihres Anwendungsquellcodes; sie zertifizieren nicht jede Funktion oder zukünftige Version. Die meisten verwenden lokales workerd hinter HTTPS als entferntes Backend. Live Analytics Engine und das öffentliche HTTPS-D1-/Images-Szenario von OpenNext sind ausdrücklich konfigurierte Ausnahmen. Prüfen Sie die [Szenarioumfangsbeschreibungen](../demo/tests/README.md#application-acceptance), bevor Sie sich bei einer Produktionsintegration auf ein Ergebnis verlassen.

Navigations-, Formularupload-, Weiterleitungs-, Vertrauens- und Lebenszyklusgrenzen beschreibt [natives Dokumentrendering](native-rendering-api.md#scope-and-limits). Browser-Service-Worker-Vergleiche erwarten ausdrücklich, dass WebKit wiederholte POST-Bodies verliert und bei synthetischen Weiterleitungen `redirected: false` meldet. Alle anderen Zusicherungen bleiben erforderlich; diese Erwartungen dokumentieren Browsergrenzen, kein unterstütztes Verhalten. iOS verwendet eine andere native Schema-Bridge. Browserergebnisse ersetzen keine iOS-/Android-Validierung.
