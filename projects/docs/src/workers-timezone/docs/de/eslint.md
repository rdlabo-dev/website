---
title: "Zeitzonenfehler mit ESLint erkennen"
sourceRevision: "66b3cbb9eb67eda2713293b99c52480b8051271990b81416d16e37235befe02f"
---
Halten Sie neuen Cloudflare-Workers-Code an derselben Zeitzonenstrategie fest. Kombinieren Sie `@rdlabo/workers-timezone` mit `@rdlabo/eslint-plugin-rules`, um hostlokale `Date`- / `Intl`-Operationen und Initialisierungen innerhalb von Anfragen zu erkennen.

Beginnen Sie für eine ausführbare Demo beider Pakete mit [Konvertierungen und Lint ausprobieren](./quickstart.md).

## Das ergänzende Preset aktivieren

Dieses Beispiel verwendet Node.js 24. Installieren Sie in einer Anwendung mit `@rdlabo/workers-timezone` die Lint-Abhängigkeiten:

```sh
npm install --save-dev eslint@10 @eslint/js@10 typescript@6 typescript-eslint@8 @rdlabo/eslint-plugin-rules@22
```

Ergänzen Sie das Zeitzonen-Preset und typgestütztes Linting in `eslint.config.mjs`. Die zu prüfenden TypeScript-Dateien müssen in der `tsconfig.json` der Anwendung enthalten sein.

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

export default tseslint.config(
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
      },
    },
    plugins: { '@rdlabo/rules': rdlabo },
  },
  ...rdlabo.configs['workers-timezone/recommended'],
);
```

Behalten Sie beim Einfügen dieser Konfiguration Ihre bestehenden Einträge bei. Das separate Preset `workers/recommended` aktiviert keine Zeitzonenprüfungen.

## Ein hostlokales Datum erkennen

Dies liest das Kalenderdatum des Hosts statt das Ihrer Anwendung:

```ts
const instant = new Date('2026-01-01T15:00:00Z');
console.log(instant.getDate());
```

Wählen Sie die Kalenderzeitzone mit der Bibliothek:

```ts
import { toLocalDate } from '@rdlabo/workers-timezone';

const instant = new Date('2026-01-01T15:00:00Z');
console.log(toLocalDate(instant, 'Asia/Tokyo'));
// 2026-01-02
```

`no-implicit-timezone` meldet auch unterstützte `Intl`-Formatierungsaufrufe ohne ausdrückliches `timeZone`. UTC-Methoden und `toISOString()` bleiben für zeitpunktbezogene Operationen verfügbar.

## Die Initialisierung außerhalb von Anfragen halten

`initialize-timezone-at-module-scope` beanstandet Folgendes:

```ts
import { initializeTimezone } from '@rdlabo/workers-timezone';

export function handleRequest() {
  initializeTimezone({ timeZone: 'Asia/Tokyo' });
}
```

Initialisieren Sie stattdessen während der Modulauswertung:

```ts
import { initializeTimezone } from '@rdlabo/workers-timezone';

initializeTimezone({ timeZone: 'Asia/Tokyo' });
```

Übergeben Sie für die Zeitzone eines Nutzers ein ausdrückliches Argument an die Konvertierung. Die Initialisierungsregel prüft jede Datei einzeln; sie erzwingt keine einzige Initialisierung für die gesamte Anwendung.

## In CI ausführen

Führen Sie nach der Installation der Abhängigkeiten Folgendes aus:

```sh
npx eslint 'src/**/*.ts' --max-warnings 0
```

Passen Sie den Quellpfad an Ihre Anwendung an. Behalten Sie Zeitzonentests für Sommerzeit und Kalendergrenzen bei. Statische Prüfungen decken erkennbare Operationen ab, nicht jeden dynamischen Wert.

Siehe die [Date-/Intl-Regel](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-implicit-timezone), die [Initialisierungsregel](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/initialize-timezone-at-module-scope) und das [Zeitzonenverhalten](./timezones.md).
