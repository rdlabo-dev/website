---
title: "Initialisierung"
sourceRevision: "dd7527b567ce8a676662743a9f557b4d4a9b2116134e2cb107e4a21c4d684b4c"
---
Verdrahten Sie `addIcons` nach der [Installation](../README.md#installation). Siehe auch [Verwendung](./usage.md).

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
+ import { addIcons } from 'ionicons';
+ import * as allIcons from 'ionicons/icons';
+ import * as useIcons from './use-icons';

  if (environment.production) {
    enableProdMode();
  }

+  addIcons(environment.production ? useIcons : allIcons);
```

#### 3. Andere `addIcons`-Aufrufe aus Klassenkonstruktoren entfernen

```diff
  @Component(/* ... */)
  export class ExampleComponent {
    constructor() {
-     addIcons(useIcons);
    }
  }
```
