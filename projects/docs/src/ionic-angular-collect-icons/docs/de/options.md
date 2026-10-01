---
title: "CLI-Optionen"
sourceRevision: "906beb87d88e6f08bb73b97c8c674114348e12cb8d2ba64fec4eb200a176cc35"
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

Mit dem Flag `--initialize` können Sie `addIcons` automatisch initialisieren. Der Standard ist `false`. Die CLI ergänzt folgende Zeilen:

```diff
+ import { addIcons } from 'ionicons';
+ import * as allIcons from 'ionicons/icons';
+ import * as useIcons from './use-icons';

  if (environment.production) {
    enableProdMode();
  }

+  addIcons(environment.production ? useIcons : allIcons);
```

Die CLI ergänzt die Zeilen in der Datei mit `enableProdMode()`. Die Einrichtung kann selbstverständlich auch manuell erfolgen.

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
