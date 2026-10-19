---
title: "Kompatibilität und Einschränkungen"
sourceRevision: 12d713df68d891cc7da6cca41b2c0644441d8017087e7642241f9053124875f6
---

# Kompatibilität und Einschränkungen

Das Ziel ist Cloudflare Workers, kein eigenständiger Node.js-Prozess. Das Node-Profil verwendet workerd `1.20261012.1` mit dem Kompatibilitätsdatum `2026-10-17` ohne zusätzliche Flags. Andere Daten und Flags werden von diesem Profil nicht abgedeckt. Die WebView enthält weder workerd noch V8; iOS verwendet seine eigene JavaScript-Engine.

0.1.0 Preview enthält bestehende Kompatibilitätsimplementierungen mit den nachstehenden Grenzen unter einer [versionsspezifischen Release-Ausnahme](../CONTRIBUTING.md#010-preview-exception). Die Aufnahme ist keine Behauptung vollständiger Workers- oder Node.js-Kompatibilität.

## Node.js

Die Kompatibilität mit Node.js insgesamt ist noch unvollständig. Ein erfolgreicher Modulimport weist keine gleichwertigen Methoden, Validierung, Zustände, Zeitplanung oder Engine-Verhalten nach.

| Bereich | Verhalten und Einschränkungen |
| --- | --- |
| path, querystring, string_decoder, buffer, timers | Implementieren das gepinnte Workers-Profil. Workers-Stubs bleiben Stubs; beispielsweise reproduziert matchesGlob die Ablehnung des gepinnten Profils. |
| HTTP und net | In-Memory-Server-Dispatch; kein lauschender Betriebssystemserver. Ausgehendes TCP/TLS erfordert den nativen Transport. |
| fs / fs/promises | Schreibgeschützte eingebettete virtuelle Dateien. Schreiben, FileHandle, watch und vollständige Dateisystemsemantik werden nicht unterstützt. |
| module | Begrenzte Builtin-Registry; createRequire lädt ausschließlich VFS-JSON. Ausführbare Module müssen gebündelt sein; beliebige dynamische Auflösung wird nicht unterstützt. |
| process, events, console, util / util/types / sys | Unvollständige Exporte oder Verhaltensweisen. Engine-Introspektion, Aufrufstellen und Host-Objekt-Erkennung sind nicht gleichwertig mit Workers. |
| crypto und zlib | Implementierungen aus Abhängigkeiten decken nicht alle Workers-Exporte, Algorithmen, Schlüssel oder Codecs ab. Gehen Sie nicht von Kryptografie- oder Kompressionsparität aus. |
| TLS- und HTTP-Interna | node:tls ist unvollständig. \_http_common, \_http_outgoing, \_http_server, \_tls_wrap und \_stream_wrap bestehen die Importprüfung nicht. Nativer TLS-Transport impliziert keine Node-TLS-API-Kompatibilität. |
| Streams | Ein gepackter Fallback liefert Byte-Streams, wenn der Host sie nicht hat. Workers-tee-Abbruchgründe und das Timing von pipeTo-Abbrüchen werden nicht vollständig reproduziert. |
| async_hooks | Durch den Build transformierte asynchrone Funktionen behalten bereichsgebundene Stores. Nicht transformierte native asynchrone Callbacks werden abgelehnt; beliebiger dynamischer Code und Isolation des Anfrageursprungs werden nicht vollständig unterstützt. |
| diagnostics_channel | Synchrone Channel-/Store-Verträge sind implementiert; asynchrone Weitergabe hängt von den async-hooks-Einschränkungen ab. |
| worker_threads | Workers-Stubs und lokales MessagePort-Verhalten, keine Node-Threads. Kennzeichnung vertrauenswürdiger Ereignisse, Host-Objekt-Serialisierung und globale Identität weichen ab. |
| DNS | DNS-over-HTTPS-Implementierung; synthetische Service-Binding-/Hyperdrive-Adressüberschreibungen sind nicht implementiert. |
| Andere Module | Implementierungen und gemeinsame Contracts existieren, aber die Abnahme vollständiger Module steht aus. Namespace-Gleichheit allein reicht nicht aus. |

Die genaue Basis fehlender/zusätzlicher Exporte wird in [surface-gaps.json](../demo/tests/experiments/node-compat/surface-gaps.json) gegenüber [den gepinnten Exporten](../demo/tests/experiments/node-compat/exports.json) gepflegt. Diese Dateien sind die maßgebliche Quelle; diese Anleitung dupliziert die Exportliste nicht. Führen Sie zur Prüfung `npm run build` und anschließend `npm run test:node-inventory --prefix demo` aus. Verhaltensverträge liegen neben jeder Implementierung in `src/compat`.

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

Entferntes HTML wird am app-lokalen Origin gerendert (`capacitor://localhost` unter iOS, normalerweise `https://localhost` unter Android). Entfernte Ausführung belässt Servercode und Cloud-Dienste auf dem Worker; sie verwandelt die WebView weder in den Origin dieser Website noch stellt sie jede Browser-Authentifizierungsfunktion bereit. Prüfen Sie Hydration und interaktive Bedienelemente, nicht nur eine erfolgreiche HTML-Antwort.

### Grenzen der Anwendungsintegration

| Funktion | Aktuelle Grenze | Integrationshinweise |
| --- | --- | --- |
| Better Auth mit abgeleiteter Client-Basis-URL | Die gepinnte Anwendung flare-stack-blog scheitert unter iOS bei der Client-Initialisierung, da Better Auth `capacitor://localhost` ablehnt. Androids HTTP(S)-Origin trifft diese Ablehnung nicht. | Ein expliziter HTTPS-Authentifizierungsendpunkt initialisiert den Client, aber sein vollständiger Anmelde-/Cookie-Ablauf wurde hier nicht validiert. Gehen Sie nicht davon aus, dass diese Einstellung allein die Migration abschließt. Siehe [Reproduktion](../demo/tests/upstream/flare-stack-blog/README.md). |
| Passkeys / WebAuthn und PRF | Native Passkey-Registrierung in pknotes schlägt auf beiden getesteten Plattformen fehl. Abnahme mit Chromiums virtuellem Authenticator weist keine native Unterstützung nach. | Native Zugangsdatenintegration, App-/Domain-Zuordnung und PRF-Verfügbarkeit benötigen separate Validierung. Entferntes Rendering kann Origin-Prüfungen der Relying Party nicht umgehen. Native Unterstützung ist zurückgestellt, nicht als technisch unmöglich erwiesen. Siehe [Authentifizierungsgrenze](../demo/tests/upstream/pknotes/README.md). |
| Void React Pages | React Pages + entfernte D1-Ausführung sind mit veröffentlichtem Void / @void/react 1.1.12 im iOS-Simulator und Android-Emulator abgedeckt. Andere Void-Frameworks und lokale Ausführung sind nicht verifiziert. | Verwenden Sie 1.1.12 oder neuer für iOS-Navigation mit eigenem Schema. Siehe [Void-Integration und Verifizierungsumfang](void.md). |
| OAuth im externen Browser | Das Beispiel verifiziert synthetische lokale und öffentliche HTTPS-Test-Issuer, PKCE, Callback-Behandlung und Sitzungsaustausch, auch auf einem physischen iPhone. Reale Provider-Richtlinien, Refresh-Token-Speicherung und Wiederaufnahme nach Kaltstart sind nicht abgedeckt. | Verwenden Sie das native SDK des Providers, falls verfügbar. Systembrowser-Cookies werden nicht automatisch mit der WebView geteilt. Siehe [Authentifizierungsbeispiel](../demo/authentication/README.md). |
| Analytics Engine und andere reine Cloud-Dienste | Analytics Engine läuft in Cloudflare; es gibt keine lokale Dataset-Implementierung. Counterscales Live-Szenario benötigt ein eingerichtetes Konto, Ereignisse und ein Analytics-Lesetoken. | Belassen Sie privilegierte Tokens im Backend und authentifizieren Sie Geräteanfragen. Das standardmäßige CI-Authentifizierungsszenario prüft keine Live-Analytics. Siehe [Counterscale-Einrichtung](../demo/tests/upstream/counterscale/README.md). |
| Bildoptimierung und Geräteleistung | Die OpenNext-Fixture deckt lokales workerd und bereitgestelltes Cloudflare IMAGES ab, einschließlich Rendering auf einem physischen iPhone. Leistungsmessungen sind einzelne Debug-Läufe; Speicher auf physischem iOS ist ungemessen. | Verifizieren Sie die produktive Bildkonfiguration und messen Sie Start und Speicher von Release-Builds auf physischen Geräten, bevor Sie Leistungsaussagen machen. Siehe [OpenNext-Lücken](opennext.md#current-gaps). |

Gepinnte Drittanbieter-Fixtures prüfen konkrete Benutzerabläufe ohne Änderung ihres Anwendungsquellcodes; sie zertifizieren nicht jede Funktion oder zukünftige Version. Die meisten verwenden lokales workerd hinter HTTPS als entferntes Backend. Live Analytics Engine und das öffentliche HTTPS-D1-/Images-Szenario von OpenNext sind ausdrücklich konfigurierte Ausnahmen. Prüfen Sie die [Szenarioumfangsbeschreibungen](../demo/tests/README.md#application-acceptance), bevor Sie sich bei einer Produktionsintegration auf ein Ergebnis verlassen.

Siehe [natives Dokumentrendering](native-rendering-api.md#scope-and-limits) für Einschränkungen bei Navigation, Formularuploads, Weiterleitungen, Vertrauen und Lebenszyklus. Browser-Service-Worker-Vergleiche enthalten sechs erwartete WebKit-Fehler für POST-Wiederholung und Weiterleitungsmetadaten; iOS verwendet eine andere native Scheme-Bridge. Browserergebnisse ersetzen keine iOS-/Android-Validierung.
