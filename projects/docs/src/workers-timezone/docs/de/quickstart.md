---
title: "Zeitzonen-Konvertierungen und ESLint gemeinsam ausprobieren"
sourceRevision: "9ed437287a41f0f96e3a8f3fbb0779e4ffcc3044c42031334e6626391c130e28"
---
Ein einzelner Zeitpunkt kann zu unterschiedlichen Kalenderdaten gehören. Beobachten Sie zunächst diesen Unterschied und lassen Sie ESLint anschließend Code melden, der versehentlich auf die Zeitzone des Hosts zurückfällt.

## 1. Beide Pakete installieren

Benötigt Node.js 24 und npm.

```sh
mkdir timezone-demo
cd timezone-demo
npm init -y
npm pkg set type=module
npm install @rdlabo/workers-timezone@0.12.2
npm install --save-dev @rdlabo/eslint-plugin-rules@22.1.0 eslint@10 @eslint/js@10 typescript@6 typescript-eslint@8 tsx@4
```

## 2. Den Wechsel des Kalenderdatums beobachten

Speichern Sie dies als `demo.ts`. Initialisieren Sie die Anwendungszeitzone einmal auf Modulebene. Übergeben Sie für eine nutzerspezifische Konvertierung eine Zeitzone pro Aufruf.

```ts
import { initializeTimezone, toLocalDate, toLocalDateTime } from '@rdlabo/workers-timezone';

initializeTimezone({ timeZone: 'Asia/Tokyo' });
const instant = new Date('2026-01-01T15:00:00Z');
console.log(toLocalDateTime(instant));
console.log(toLocalDate(instant, 'America/New_York'));
```

```sh
npx tsx demo.ts
```

```text
2026-01-02 00:00:00
2026-01-01
```

Derselbe Zeitpunkt liegt in Tokio am 2. Januar und in New York am 1. Januar. Ergänzen Sie ein ausdrückliches Zeitzonenargument für eine andere Stadt, um den Unterschied zu untersuchen.

## 3. Eine versehentliche Regression sichtbar machen

Speichern Sie dies als `tsconfig.json`, damit typgestütztes Linting `demo.ts` finden kann:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true
  },
  "include": ["demo.ts"]
}
```

Speichern Sie dies als `eslint.config.mjs`. Beschränken Sie typgestützte Konfiguration auf TypeScript-Dateien:

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

Prüfen Sie das korrekte Beispiel:

```sh
npx eslint demo.ts
```

Es sollte ohne Diagnosemeldungen erfolgreich beendet werden. Ergänzen Sie jetzt die folgende absichtlich falsche Zeile in `demo.ts`:

```ts
console.log(instant.getDate());
```

```sh
npx eslint demo.ts
```

Zu erwarten sind ein Exit-Status ungleich null und `@rdlabo/rules/no-implicit-timezone`. `getDate()` liest den lokalen Kalendertag des Hosts und umgeht damit die Anwendungszeitzone. Ersetzen Sie ausschließlich die hinzugefügte Zeile durch:

```ts
console.log(toLocalDate(instant));
```

```sh
npx eslint demo.ts
npx tsx demo.ts
```

Lint sollte wieder erfolgreich sein. Die zuletzt hinzugefügte Zeile gibt `2026-01-02` aus.

## 4. In Ihrer Anwendung verwenden

Folgen Sie der [Anwendungseinrichtung](../README.md), um die Standardzeitzone zu wählen, und [aktivieren Sie anschließend ESLint in CI](./eslint.md). Nutzerspezifische Einstellungen, Sommerzeit und Datenbankgrenzen beschreibt [Zeitzonen und Kalenderdaten](./timezones.md).
