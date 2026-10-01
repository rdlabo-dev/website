---
title: "Konfiguration"
sourceRevision: "3575aa7b31f199be541926b0e72c37308ea436b648ac41e67c7b78c90f5020aa"
---
# Konfiguration

Verwenden Sie den Paketwurzelpfad für Angular und Ionic oder `/typescript` für frameworkunabhängigen Code. Beginnen Sie mit der Einrichtung für Ihr Projekt und aktivieren Sie anschließend nur die benötigten Richtlinien. Preset-Abdeckung beschreibt der [Regelkatalog](./rules.md); prüfen Sie bei Aktualisierungen die [Migrationsanleitung](./migration.md).

## Angular und Ionic

Plugin 22 unterstützt Angular und Angular ESLint 21–22 mit Ionic Framework 9. Prüfen Sie beim Wechsel von Plugin 21 die [Migrationsanleitung](./migration.md), bevor Sie das aktualisierte empfohlene Preset aktivieren.

Registrieren Sie das Plugin, verteilen Sie seine empfohlenen Konfigurationen auf der obersten Ebene und ergänzen Sie anschließend die normalen Angular- und TypeScript-Konfigurationen für Ihr Projekt.

```js
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const rdlabo = require('@rdlabo/eslint-plugin-rules');

module.exports = tseslint.config(
  {
    plugins: { '@rdlabo/rules': rdlabo },
  },
  ...rdlabo.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
);
```

Platzieren Sie `rdlabo.configs.recommended` nicht in einem eingeschränkten `extends`. Die Konfigurationshilfe von `typescript-eslint` würde die internen `files`-Selektoren des Presets ersetzen und könnte ausschließlich für TypeScript gedachte Regeln auf Templates ausführen.

### Abdeckung des empfohlenen Angular-/Ionic-Presets

Das Preset aktiviert die üblichen TypeScript-Regeln für Signals, Komponentengrenzen, Lebenszyklus, Overlays, readonly und try-Blöcke. Seine HTML-Konfiguration aktiviert die Prüfung von Ionic-Attributen, verbotenen Overlay-Elementen, doppelten Aktionen, Fehlertexten an Validierungsbedienelementen und Elementgruppen innerhalb von Listen.

Das TypeScript-Preset enthält `prefer-ionic-standalone`, das Ionic-9-Root-Imports verlangt und `IonicModule` sowie NgModule-basierte Lazy-Imports zurückweist.

`deny-constructor-di` ist veraltet und nicht im Preset enthalten. Bevorzugen Sie die `inject()`-Migration von Angular.

## Frameworkunabhängiges TypeScript

Verwenden Sie zur Auswahl einzelner Regeln ohne Angular oder Ionic `eslint.config.mjs` mit typgestütztem Linting. Installieren Sie dieselben Konfigurationsabhängigkeiten wie im folgenden Workers-Abschnitt und stellen Sie sicher, dass die geprüften TypeScript-Dateien zur `tsconfig.json` Ihres Projekts gehören.

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

export default tseslint.config({
  files: ['**/*.ts'],
  extends: [...tseslint.configs.recommendedTypeChecked],
  languageOptions: {
    parserOptions: { projectService: true, tsconfigRootDir: dirname(fileURLToPath(import.meta.url)) },
  },
  plugins: { '@rdlabo/rules': rdlabo },
  rules: {
    '@rdlabo/rules/deny-soft-private-modifier': 'error',
    '@rdlabo/rules/restrict-try-block': [
      'error',
      {
        allowPromise: false,
        allowPromiseResolve: true,
        allowRxjs: false,
        allowInSignal: false,
        maxLines: 3,
      },
    ],
  },
});
```

Für die vollständigen Promise- und RxJS-Prüfungen von `restrict-try-block` ist typgestütztes Linting erforderlich.

## Cloudflare Workers

Der frameworkunabhängige Einstiegspunkt `/typescript` stellt zwei unabhängig aktivierbare Presets bereit. Keines ist in Angular-`recommended` enthalten, und keines enthält das andere.

| Voreinstellung                         | Regeln und Optionen                                                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `workers/recommended`          | `restrict-try-block` mit `{ allowPromise: false, allowPromiseResolve: true, allowRxjs: false, allowInSignal: false, maxLines: 3 }` |
| `workers-timezone/recommended` | `no-implicit-timezone` und `initialize-timezone-at-module-scope` (beide `error`)                                                     |

Aktivieren Sie eines der Presets unabhängig oder kombinieren Sie beide. Beschränken Sie typgestützte `typescript-eslint`-Konfigurationen auf `**/*.ts`, damit Werkzeuge, die `eslint.config.mjs` prüfen, nicht `projectService` nach einem TypeScript-Projekt fragen, das diese Datei nicht enthält:

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir },
    },
    plugins: { '@rdlabo/rules': rdlabo },
  },
  ...rdlabo.configs['workers/recommended'],
  ...rdlabo.configs['workers-timezone/recommended'],
);
```

Installieren Sie die oben verwendeten Konfigurationsabhängigkeiten:

```sh
npm install --save-dev eslint @eslint/js typescript typescript-eslint @rdlabo/eslint-plugin-rules
```

`no-implicit-timezone` benötigt typgestütztes Linting. `initialize-timezone-at-module-scope` ist syntaktisch: Eine Datei darf die Initialisierung weglassen. Ist sie vorhanden, darf sie in dieser Datei höchstens eine zulässige Stelle haben — keine einzige Stelle für die gesamte Anwendung und kein Pflichtaufruf in jedem Modul.

Das Zeitzonen-Preset ergänzt [`@rdlabo/workers-timezone`](https://docs.rdlabo.dev/projects/workers-timezone/docs/readme); keines der Pakete hängt zur Laufzeit vom anderen ab. Es meldet statisch erkennbare Operationen, nicht jeden dynamischen Zeitzonenwert. Exakte Abdeckung und Grenzen beschreiben [no-implicit-timezone](./rules/no-implicit-timezone.md) und [initialize-timezone-at-module-scope](./rules/initialize-timezone-at-module-scope.md).

Das Workers-Preset enthält bewusst kein Zeitzonen-Preset, damit allgemeine Aktualisierungen der Workers-Richtlinien keine Datumsrichtlinien implizit aktivieren.
