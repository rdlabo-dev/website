---
title: "Lokales KV-Binding"
sourceRevision: ded9e19c79e98df72d7de606d1e85219f41e9af8d5fc66a48f9b42f0623e6d68
---

# Lokales KV-Binding

`LocalStorageKV` implementiert das Profil `kv.local.v1` über den gemeinsamen Feature-Host. Die API verwendet die Methodennamen und Überladungen von Workers KV. Das `localStorage` der WebView speichert jeden Wert zusammen mit seinen Metadaten und seinem Ablaufzeitpunkt dauerhaft. Die Anwendung wählt einen stabilen Namespace; das Freigeben eines Features löscht niemals Anwendungsdaten.

```ts
import { workersCapacitor } from "workers-capacitor";
import { openFeature } from "workers-capacitor/shared/contracts";
import { LocalStorageKV } from "workers-capacitor/cloudflare/bindings/kv";
import worker from "./worker";

const kv = await openFeature(new LocalStorageKV("my-app-settings"));
const runtime = workersCapacitor({
  worker,
  baseURL: "https://example.com/api",
  env: { KV: kv.api },
});
// Beim Herunterfahren der Anwendung: runtime.dispose(); await kv.dispose();
```

Der Worker kann dieses Binding mit dem exportierten Typ `KVNamespace` typisieren. Derselbe Worker kann ein echtes Workers-KV-Binding verwenden. Diese Einrichtung nutzt die direkte Ausführung: Bindings mit Funktionen können die Structured-Clone-Grenze eines isolierten Workers derzeit nicht überschreiten. Binding-RPC bleibt eine separate Transportaufgabe; diese Implementierung ändert weder den gemeinsamen Host noch den Runner.

Konfigurieren Sie bei buildgeneriertem Remote-Dispatch jeden Wrangler-KV-Namen im Build-Plugin über `kvExecution: { KV: "local" }` oder `kvExecution: { KV: "remote" }`. Fehlende oder ungültige Richtlinien lassen den Build fehlschlagen. Stellen Sie bei `local` die Instanz wie oben über `env` bereit; `remote` leitet reine KV-Routen an den Worker weiter. Wenn R2 oder eine andere Serverabhängigkeit einen Handler für die entfernte Ausführung auswählt, verwendet diese gesamte Anfrage den bereitgestellten Worker und dessen Cloud-KV. Lokale und Cloud-Daten bleiben unabhängig; siehe die [Dispatch-Anleitung](remote-service-bindings.md).

## Unterstützte API

| Operation | Verhalten |
| --- | --- |
| `get(key, typeOrOptions?)` | Standardmäßige/explizite Text-, JSON-, ArrayBuffer- und Byte-Stream-Ergebnisse; fehlende Schlüssel ergeben null |
| `get(keys, typeOrOptions?)` | Bis zu 100 Schlüssel; Text- oder JSON-Map-Ergebnisse, einschließlich null für fehlende Schlüssel |
| `getWithMetadata` | Dieselben Einzel-/Sammellesemodi mit Metadaten; eine fehlende Einzellesung ergibt `{value: null, metadata: null}`, ein fehlender Sammeleintrag ist null |
| `put(key, value, options?)` | String, ArrayBuffer, typisierte Byte-Views oder Byte-Streams; optionale JSON-Metadaten und absolute/relative Ablaufzeit |
| `delete(key)` | Wert, Metadaten und Ablaufzeit zusammen löschen; fehlende Schlüssel sind unproblematisch |
| `list(options?)` | UTF-8-Schlüsselsortierung, Präfix, Limit (1–1000), Fortsetzungscursor, Metadaten und Ablaufzeit |

`expirationTtl` und ein zukünftiger absoluter `expiration`-Zeitpunkt haben ein Minimum von 60 Sekunden. Sind beide angegeben, bestimmt TTL die resultierende Ablaufzeit. TTL beginnt nach dem Erfassen und Kodieren der Eingabe unmittelbar vor der Veröffentlichung. Eine absolute Ablaufzeit wird beim Aufruf validiert; ist sie vor der Veröffentlichung bereits verstrichen, wird der Schreibvorgang abgelehnt und ein vorhandener Wert bleibt erhalten. Der Ablauf wird beim Lesen und Auflisten geprüft, auch nach einer neuen Feature-Sitzung; abgelaufene Datensätze werden verzögert entfernt. Überschreiben ohne Optionen entfernt vorherige Metadaten und Ablaufzeiten. Cursor sind undurchsichtige lokale Tokens, die an Namespace und Präfix gebunden und nicht auf Cloudflare übertragbar sind. Sie setzen nach dem zuletzt zurückgegebenen Schlüssel statt an einem Array-Offset fort; das Löschen vorheriger Einträge überspringt daher nicht den nächsten Schlüssel. Bei gleichzeitigen Schreibvorgängen ist die Auflistung kein transaktionaler Snapshot.

## Schutzmaßnahmen der Implementierung

Die Validierung liegt in der Binding-Implementierung und ist von Tests unabhängig. Ungültige Schlüssel, Lesemodi, Optionen, Limits, Ablaufzeiten, Metadaten und Sammelmodi werden abgelehnt. Schlüssel müssen 1–512 UTF-8-Bytes umfassen; `.` und `..` sind ausgeschlossen. Werte sind auf 25 MiB und serialisierte Metadaten auf 1024 Bytes begrenzt. Das Speicherkontingent des Browsers kann deutlich kleiner sein. Ein gültiges `cacheTtl` (mindestens 30 Sekunden) wird akzeptiert, führt aber keinen lokalen Lese-Cache ein. Unbekannte Optionsfelder werden abgelehnt, statt stillschweigend ignoriert zu werden.

Byte-Streams werden vor der Veröffentlichung eines Datensatzes schrittweise base64-kodiert, wobei die Größe fortlaufend geprüft wird. Dekodierte Teile werden weder aufbewahrt noch zu einem zweiten vollständigen Byte-Puffer zusammengefügt. Fehlerhafte oder zu große Eingaben lassen den alten Datensatz unverändert. Wert, Ablaufzeit und Metadaten werden in einem einzigen Schreibzugriff serialisiert; Kontingent- und Sicherheitsfehler werden ohne In-Memory-Fallback weitergegeben. Zurückgegebene Bytes und Metadaten sind unabhängige Kopien. Fehlendes `localStorage` löst `FeatureUnavailable` aus; Fehler beim Eigenschaftszugriff werden weitergegeben.

Das optionale zweite Konstruktorargument stellt für deterministische Tests ein vorhandenes `Storage`-Backend bereit. Es wird weder eine allgemeine Speicherregistry noch eine Abstraktion für den Persistenzlebenszyklus eingeführt. Laufzeitprüfungen und Tests für Backend-Fehler verbleiben in `tests/unit/kv.test.ts`.

## Grenzen von Kompatibilität und Persistenz

Der aus `workers-capacitor/cloudflare/bindings/kv/testing` exportierte `kvContract` prüft 18 gemeinsame Verhaltensfälle gegen das echte lokale workerd-Binding und den lokalen Adapter. `kvTextContract` bleibt für sein kleineres Profil `kv.text.v1` verfügbar. Contract-Provider sind für einen leeren Test-Namespace und dessen Bereinigung verantwortlich; führen Sie sie niemals gegen Anwendungsdaten aus. Tests für Ablaufgrenzen und Fehlerpfade sind separat; die workerd-Suite wartet außerdem den tatsächlichen Ablauf einer minimalen TTL ab.

Dieses Profil emuliert weder globale Replikation, Eventual Consistency, regionales Cache-Verhalten, produktive Ratenlimits noch Cloud-Synchronisierung. Es beansprucht keine identischen Fehlertexte, verteilte Reihenfolge oder Leistung. Größenprüfungen für Sammelantworten begrenzen lokal das serialisierte Ergebnis; sie reproduzieren nicht Cloudflares interne Größenberechnung für die übertragenen Daten. Die KV-API ist in TypeScript implementiert und bettet V8 nicht ein.

Der Speicher gehört zum Origin der WebView. Das Löschen von App-/Browserdaten, Deinstallation, Speicherverdrängung oder ein Origin-Wechsel können den Zugriff auf Daten verlieren lassen. Es gibt keine Garantie für verschlüsselte Geheimnisse oder dauerhafte Speicherung auf Betriebssystemebene. Web-Storage-Aufrufe sind hinter einer Promise-API synchron; Binärwerte werden base64-kodiert, wodurch große Werte zusätzlichen Speicher und Kontingent beanspruchen. Stream-Lesevorgänge dekodieren höchstens 48 KiB pro Pull und geben ihren kodierten String bei EOF oder Abbruch frei; Web Storage liefert dennoch den gesamten kodierten Datensatz. Stream-Schreibvorgänge behalten kodierte Teile bis zum atomaren Speicherzugriff. Das Datensatzformat verwendet ein versioniertes Speicherpräfix; eine Migration vom früheren unveröffentlichten reinen Textprototyp wird nicht angeboten.

Native Tests verwenden gebündelte Assets in WebViews des iOS-Simulators und Android-Emulators. Die Persistenz beim Neuladen des Dokuments wird zusätzlich in Chromium und WebKit verifiziert. Daraus ergeben sich keine Garantien für die Beständigkeit auf physischen Geräten oder bei Anwendungsupgrades.

Referenzen: Cloudflare [KV lesen](https://developers.cloudflare.com/kv/api/read-key-value-pairs/), [KV schreiben](https://developers.cloudflare.com/kv/api/write-key-value-pairs/) und [Schlüssel auflisten](https://developers.cloudflare.com/kv/api/list-keys/). Die Form fehlender Einträge bei Sammel-Metadatenabfragen und die Beibehaltung eines führenden U+FEFF in Schlüsseln sind gegen echtes workerd verifiziert. Textlesungen einzelner Schlüssel behalten ein führendes BOM bei; JSON-Lesungen einzelner Schlüssel lehnen JSON mit BOM-Präfix ab. Sammellesungen entfernen das BOM, auch vor dem JSON-Parsen. Dieser Unterschied zwischen Einzel- und Sammellesungen wird für get und getWithMetadata reproduziert und getestet.
