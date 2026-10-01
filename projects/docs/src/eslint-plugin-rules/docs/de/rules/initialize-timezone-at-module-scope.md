---
title: "initialize-timezone-at-module-scope"
sourceRevision: "d71b391c0b8fea50f59f576db985e89eb9138316ad441cab20de8ddb8a80474a"
---
# @rdlabo/rules/initialize-timezone-at-module-scope

> Hält die Initialisierung von @rdlabo/workers-timezone an einer eindeutigen Stelle auf Modulebene.

`initializeTimezone()` konfiguriert eine Modulinstanz und darf nicht in eine Anfrage, einen Mandanten, Callback oder Klassenlebenszyklus verschoben werden. Die Regel folgt benannten Imports, Aliasen und Namespace-Imports aus `@rdlabo/workers-timezone`.

## Einzelheiten der Regel

Folgende Stellen sind zulässig:

- Eine direkte Ausdrucksanweisung auf Modulebene
- Ein direkter Variableninitialisierer auf Modulebene
- Ein exportierter Variableninitialisierer auf Modulebene

Funktionen, Anfragehandler, IIFEs, Kontrollflussblöcke, statische Klassenblöcke, verschachtelte Ausdrücke und Default-Exporte werden gemeldet. Eine Datei darf die Initialisierung vollständig weglassen. Die Regel verlangt lediglich, dass eine vorhandene Initialisierung höchstens eine zulässige Stelle hat. Enthält eine Datei mehrere ansonsten gültige Initialisierungsstellen, wird jede davon gemeldet.

ESLint analysiert jeweils eine Datei. Die Regel garantiert höchstens eine eindeutige Stelle pro Datei, nicht eine Stelle für die gesamte Anwendung.

### Inkorrekt

```ts
import { initializeTimezone } from '@rdlabo/workers-timezone';

export default {
  fetch() {
    initializeTimezone({ timeZone: 'Asia/Tokyo' });
  },
};
```

### Korrekt

```ts
import { initializeTimezone } from '@rdlabo/workers-timezone';

export const timezone = initializeTimezone({ timeZone: 'Asia/Tokyo' });
```

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/initialize-timezone-at-module-scope.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/initialize-timezone-at-module-scope.ts)
