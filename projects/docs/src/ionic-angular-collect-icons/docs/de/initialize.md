---
title: "Initialisierung"
sourceRevision: "37ba1da1d28d1ac57abe2bf5a8227ee2f8f3b80eae8af0f65cd11f35881481fc"
---
Verdrahten Sie `addIcons` nach der [Installation](/docs/readme#installation). Siehe auch [Verwendung](./usage.md).

Build-Umgebungen müssen Entwicklungsabhängigkeiten installieren: Der erzeugte Code importiert die Laufzeit dieses Pakets, die in das Anwendungsbundle aufgenommen wird.

### Automatische Konfiguration

```bash
npx @rdlabo/ionic-angular-collect-icons --initialize true
```

Es werden `src/use-icons.ts` und eine `addIcons`-Registrierung in `main.ts` / `app.config.ts` erzeugt.

### Manuelle Konfiguration

#### 1. Die CLI ausführen

```bash
npx @rdlabo/ionic-angular-collect-icons
```

Dadurch wird `src/use-icons.ts` erzeugt.

#### 2. Importieren Sie die erzeugte Datei in Ihrer Datei `main.ts` oder `app.config.ts`:

```diff
+ import { initializeIonicons } from '@rdlabo/ionic-angular-collect-icons/runtime';
+ import * as useIcons from './use-icons';

  if (environment.production) {
    enableProdMode();
  }

+  void initializeIonicons(useIcons);
```

`initializeIonicons` registriert die gesammelten Symbole synchron. Angulars
`isDevMode()` aktiviert anschließend in der Entwicklung den vollständigen Katalog aus einem
isolierten, bei Bedarf geladenen Bundle. In der Produktion startet die Anwendung, ohne dieses Katalogbundle herunterzuladen.

Erkennt der Collector bei einer interaktiven Ausführung den von älteren Versionen erzeugten
ternären Initialisierer, fragt er, ob dieser migriert werden soll. Die Standardantwort ist **Yes** (Ja).
Bei **No** (Nein) bleibt der Initialisierer unverändert. Bestehende benutzerdefinierte
`addIcons(...)`-Aufrufe bleiben ebenfalls unverändert. Details zur Vorschau,
zur nicht interaktiven Ausführung und zur Erkennung finden Sie unter
[Migration](./migration.md#upgrade-the-icon-initializer).

#### 3. Andere `addIcons`-Aufrufe aus Klassenkonstruktoren entfernen

```diff
  @Component(/* ... */)
  export class ExampleComponent {
    constructor() {
-     addIcons(useIcons);
    }
  }
```
