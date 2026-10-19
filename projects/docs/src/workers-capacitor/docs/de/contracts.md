---
title: "Feature-Contract-API"
sourceRevision: cbea8de265c5baabcabce9f94073365ad156bd2c8cdb1d74539c7303440cfcf2
---

# Feature-Contract-API

Die Einheit der Kompatibilität ist ein **benanntes, typisiertes Profil**, keine Basisklasse je API-Kategorie. Ein Profil verbindet seinen API-Typ, deklarierte Verhaltensfälle, Implementierungen und Tests. Eine Implementierung kann lokal, delegiert oder von workerd bereitgestellt sein, ohne den Contract-Runner zu ändern.

Die Grundlage besteht aus drei Teilen:

| Teil | Verantwortung |
| --- | --- |
| `Feature<ID, API, Case>` | Unveränderliche Identität und Fallnamen; bewahrt die native API-Struktur |
| `FeatureImplementation<Feature>` | Erforderliche Implementierungs-API und explizite Abdeckung jedes Falls |
| `openFeature` / `runContract` | Setup-Rollback, bereichsgebundene Bereinigung, neuer Bereich je Fall und strukturierte Ergebnisse |

`FeatureImplementation` ist eine abstrakte Klasse, aber der Lebenszykluszustand gehört zum Host und nicht zur Unterklasse. Implementierungen implementieren `create(scope)`; sie können die Initialisierungs- oder Bereinigungsfunktionen des Hosts nicht überschreiben. Klassen und Methoden innerhalb der zurückgegebenen API sind uneingeschränkt. Es gibt weder ein allgemeines Protokoll `execute(name, args)` noch eine globale Registry oder separate Runner für Bindings und Engine-Fähigkeiten.

## Ein Feature hinzufügen

```ts
import {
  defineFeature,
  FeatureImplementation,
  openFeature,
  type FeatureScope,
} from "workers-capacitor/shared/contracts";
import {
  runContract,
  assertContract,
  type ContractSuite,
} from "workers-capacitor/shared/contracts/testing";

interface TextAPI {
  read(key: string): Promise<string | null>;
}
const text = defineFeature<TextAPI>()("example.text", ["missing"]);

class MemoryText extends FeatureImplementation<typeof text> {
  constructor() {
    super(text, { missing: { status: "supported" } });
  }
  create(scope: FeatureScope): TextAPI {
    const values = new Map<string, string>();
    scope.defer(() => values.clear());
    return { read: async (key) => values.get(key) ?? null };
  }
}

const contract: ContractSuite<typeof text> = {
  feature: text,
  cases: {
    async missing(api) {
      if ((await api.read("absent")) !== null) throw new Error("Expected null");
    },
  },
};
assertContract(await runContract(new MemoryText(), contract));

// Derselbe Host kann unabhängig von Tests verwendet werden.
const session = await openFeature(new MemoryText());
try {
  await session.api.read("key");
} finally {
  await session.dispose();
}
```

Die Implementierung bestimmt den API-Typ; Aufrufer können für `openFeature` keinen davon unabhängigen Ergebnistyp wählen. Die Suite muss dieselbe Feature-Definition tragen. Negative Tests zur Kompilierzeit in `tests/types/features.ts` decken fehlende Operationen, falsche Argumente/Ergebnisse, fehlende/erfundene Fälle und eine andere Feature-Identität ab. Der Typecheck-Befehl prüft diese mit `@ts-expect-error`; wird ein notwendiger Fehler entfernt, schlägt der Build fehl. Laufzeitprüfungen lehnen ebenfalls unpassende Feature-Objekte und unvollständige Abdeckung ab. Wie bei anderen TypeScript-APIs können `any` oder explizite unsichere Typumwandlungen statische Garantien umgehen.

Verwenden Sie pro Profil eine exportierte Definition und importieren Sie diese überall. IDs müssen einen stabilen Umfang beschreiben; ändern Sie die ID, wenn Sie ihren Vertrag inkompatibel ändern. Profil-Fallnamen stehen für Verhaltensgarantien und nicht zwangsläufig für Methodennamen. Das Profil muss dokumentieren, was es **nicht** nachweist. Das Bestehen einer kleinen Teilmenge weist niemals Kompatibilität mit dem gesamten Workers-Dienst nach.

## Lebensdauer und Voraussetzungen

`create` kann synchron oder asynchron sein. Registrieren Sie jede eigene Ressource sofort mit `scope.defer`, auch bevor Sie auf einen möglicherweise fehlschlagenden Einrichtungsschritt warten. Der Host macht eine teilweise Einrichtung rückgängig und gibt erfolgreiche Sitzungen in umgekehrter Registrierungsreihenfolge frei. Er versucht jede Bereinigung, selbst wenn eine davon fehlschlägt; wiederholte Freigaben teilen dasselbe Promise. Das Herunterfahren eines Features bricht `scope.signal` vor der Bereinigung ab. Treten Initialisierungs- und Bereinigungsfehler gemeinsam auf, bleiben beide in einem AggregateError erhalten.

Ein Feature-Bereich ist weder ein Anfragebereich noch eine Datenlebensdauer. Registrieren Sie keine extern verwalteten Datenbankverbindungen zur Bereinigung, solange die Verantwortung nicht ausdrücklich übertragen wurde. Persistente Test-Provider müssen einen eigenen isolierten Namespace verwenden und dessen Bereinigung registrieren; ein neuer Bereich allein kann einen externen Dienst nicht zurücksetzen. Implementierungen müssen für jeden `create`-Aufruf eine unabhängig vorbereitete API zurückgeben.

Voraussetzungen sind ausführbare Prüfungen in `create`, keine Zeichenfolgen in einer ungeprüften Capability-Registry. Werfen Sie `FeatureUnavailable`, wenn eine erforderliche Funktion der Umgebung fehlt. Das Engine-Beispiel prüft `WebAssembly.validate`. Dies erkennt die Verfügbarkeit und validiert ein eng umrissenes Verhaltensprofil; es stellt V8 weder bereit noch emuliert es V8.

`openFeature` wartet auf die Initialisierung, bevor es eine Sitzung bereitstellt. Es ergänzt weder Abbruch vor der Initialisierung noch Fristen oder beliebigen Operationsabbruch. Implementierungen sind für den Abschluss ihres Starts und ihrer Operationen verantwortlich; Zeitlimits des Test-Frameworks bleiben relevant. Die Freigabe eines Features widerruft aufbewahrte API-Objekte nicht generell. Anfrageabbruch und Streaming bleiben beim Fetch-Transport.

## Ergebnis- und CI-Regeln

`runContract` bereitet für jeden unterstützten Fall einen neuen Bereich vor, führt dessen Prüfung aus und bereinigt immer. Ergebnisse enthalten die Feature-ID, stabile Fall-IDs, Status und Grund sowie Bereinigungsfehler.

- `passed`: Die deklarierte Erwartung wurde erfüllt.
- `failed`: Einrichtung oder Prüfung fehlgeschlagen; auch Bereinigungsfehler lassen den Bericht fehlschlagen.
- `unsupported`: Ausdrücklich außerhalb der deklarierten Abdeckung dieser Implementierung, mit verpflichtender Begründung. Der Fall wird nicht ausgeführt und niemals als bestanden gezählt.
- `unavailable`: Eine erforderliche Fähigkeit der Umgebung fehlte. Ein als unterstützt deklarierter Fall in diesem Zustand lässt die Verifizierung fehlschlagen.

`assertContract` lehnt fehlgeschlagene/nicht verfügbare Fälle, Bereinigungsfehler und Berichte ohne bestandene Fälle ab. Ein Teilprofil kann explizit nicht unterstützte Einträge enthalten; CI mit vollständiger Abdeckung muss zusätzlich prüfen, dass alle Status `passed` sind, wie es das Demo tut. Eine Änderung der Abdeckung ist eine überprüfbare Umfangsänderung und kein Mittel, um einen fehlschlagenden Fall zu verstecken. Vitest und Playwright bleiben die Test-Runner; die gemeinsame Schicht hängt von keinem Test-Framework ab.

## FetchRuntime

`FetchRuntime` wird für eigene Ausführungsadapter aus dem Paketstamm exportiert. Unterklassen implementieren `dispatch(request, env, ctx)` und dürfen `ready` sowie `close(): void | Promise<void>` für den Start und die Bereinigung eigener Ressourcen überschreiben. Die Konstruktion verändert globales fetch nicht; rufen Sie die gebundene Methode `fetch` direkt auf. Behalten Sie die geerbten Methoden `fetch`, `drain` und `dispose` bei, damit URL-Grenzen, Abbrüche, Antwortvalidierung, HEAD-Normalisierung und Bereinigung dasselbe Verhalten teilen. `drain` verfolgt Hintergrundarbeit, nicht den Verbrauch des Antwortbodys. Direkte Freigabe kann beliebigen Handler-Code nicht zwangsweise stoppen.

Verwenden Sie `workersCapacitor` für die Anwendungseinrichtung. Wiederverwendbare Fetch- und KV-Contracts werden unter dem Paketnamen aus `cloudflare/workers/testing` und `cloudflare/bindings/kv/testing` exportiert. KV-Test-Provider müssen ihren eigenen Namespace isolieren und bereinigen; ein neuer Bereich löscht persistenten Speicher nicht.
