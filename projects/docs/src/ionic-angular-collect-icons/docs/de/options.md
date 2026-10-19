---
title: "CLI-Optionen"
sourceRevision: "0c0e667cecb8e0467b291af34c978f30c68aa4b4087ef9de80a100788cb54a13"
---
Flags für `npx @rdlabo/ionic-angular-collect-icons`. Die kompakte Tabelle finden Sie auf der Seite [CLI API](https://docs.rdlabo.dev/projects/ionic-angular-collect-icons/docs/api).

### --dry-run [boolean]

Wenn Sie die Änderungen sehen möchten, ohne sie tatsächlich in Dateien zu schreiben, setzen Sie `true`. Der Standard ist `false`.

```bash
npx @rdlabo/ionic-angular-collect-icons --dry-run true
```

### --interactive [boolean]

Wenn Sie alle CLI-Optionen über Eingabeaufforderungen festlegen möchten, setzen Sie `true`. Dies lässt sich auch verwenden, um bei einem Dry Run nur die Ergebnisse zu prüfen. Der Standard ist `false`.

```bash
npx @rdlabo/ionic-angular-collect-icons --interactive true
```

### --initialize [boolean]

Mit dem Flag `--initialize` können Sie die Symbolregistrierung automatisch initialisieren. Der Standard ist `false`. Die CLI ergänzt folgende Zeilen:

```diff
+ import { initializeIonicons } from '@rdlabo/ionic-angular-collect-icons/runtime';
+ import * as useIcons from './use-icons';

  if (environment.production) {
    enableProdMode();
  }

+  void initializeIonicons(useIcons);
```

Die CLI ergänzt die Zeilen in der Datei mit `enableProdMode()`. Die Einrichtung kann selbstverständlich auch manuell erfolgen.

`--initialize` ist nur erforderlich, wenn einem Projekt ohne Initialisierer einer hinzugefügt werden soll. Die Migration eines vorhandenen Initialisierers erfordert eine separate Bestätigung.

Außerdem entfernt sie andere `addIcons`-Aufrufe aus Klassenkonstruktoren.

```diff
  @Component(/* ... */)
  export class ExampleComponent {
    constructor() {
-     addIcons(useIcons);
    }
  }
```

```bash
npx @rdlabo/ionic-angular-collect-icons --initialize true
```

### --migrate [boolean]

In einem interaktiven Terminal fragt der Collector vor jeder erkannten Quellcodemigration
nach einer Bestätigung. **Yes** (Ja) ist vorausgewählt; **No** (Nein) lässt das Ziel dieser Migration unverändert.

Mit dieser Option können Sie ausdrücklich antworten, etwa in CI oder einer anderen
nicht interaktiven Umgebung:

```bash
npx @rdlabo/ionic-angular-collect-icons --migrate true
```

Zeigen Sie eine Vorschau des erzeugten Diffs an, ohne Dateien zu schreiben:

```bash
npx @rdlabo/ionic-angular-collect-icons --migrate true --dry-run true
```

Die Option ist standardmäßig nicht gesetzt, damit eine interaktive Ausführung um Bestätigung bitten kann.

### --project-path [string]

Mit dem Flag `--project-path` können Sie den Projektpfad festlegen. Der Standard ist das aktuelle Verzeichnis.

```bash
npx @rdlabo/ionic-angular-collect-icons --project-path /path/to/project
```

Die Zieldateien liegen im Verzeichnis `src` unterhalb des angegebenen Pfads.

- path/to/project + `src/**/*.ts`
- path/to/project + `src/**/*.html`

### --icon-path [string]

Standardmäßig wird die Datei (path/to/project +) `src/use-icons.ts` erstellt. Mit dem Flag `--icon-path` können Sie den Dateinamen festlegen.

```bash
npx @rdlabo/ionic-angular-collect-icons  --icon-path src/other-use-icons.ts
```
