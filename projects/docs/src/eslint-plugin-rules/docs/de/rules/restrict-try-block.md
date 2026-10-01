---
title: "restrict-try-block"
sourceRevision: "85b249d8d46a2a9fdce6ec03dad33be3234b989024ddcf1eb3aab26ddb3cc216"
---
# @rdlabo/rules/restrict-try-block

> Beschränkt Promise-, RxJS- und Angular-Signal-Kontexte, Umgehungen über `Promise.resolve()` und physische Codezeilen innerhalb von try-Blöcken.
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](../configuration.md) enthalten.

`try/catch` sollte eine kleine synchrone Operation schützen, die tatsächlich einen Fehler auslösen kann. Asynchrone Arbeit, lange Blöcke oder reaktive Callbacks innerhalb von `try` verschleiern Fehlergrenzen und können Fehler verschlucken oder fehlleiten. Diese Regel erzwingt die entsprechenden Einschränkungen.

## Einzelheiten der Regel

Die Regel prüft jeden `try`-Block und meldet standardmäßig Folgendes:

- `await` oder andere Promise-/Thenable-Verwendung innerhalb von `try`
- `Promise.resolve()` als Umgehung an beliebiger Stelle, auch außerhalb von `try`
- RxJS-Typen oder -Operationen innerhalb von `try`
- Ein `try`-Block innerhalb eines Callbacks von `computed()` oder `effect()`
- Ein `try`-Block mit mehr als 3 physischen Codezeilen

Bei auf `try` beschränkten Prüfungen wird ausschließlich der `try`-Rumpf untersucht. `catch`- und `finally`-Klauseln sind ausgeschlossen. Verschachtelte Funktionen, Klassen und `try`-Anweisungen sind eigene Ausführungsgrenzen und werden nicht dem äußeren Block zugerechnet. Die Prüfung von `Promise.resolve()` gilt für die gesamte Datei.

Die Erkennung Promise-artiger Werte und von RxJS verwendet verfügbare TypeScript-Typinformationen. Ohne typgestütztes Linting werden diese Prüfungen übersprungen, statt ESLint zu stoppen. Syntaxbasierte Prüfungen für `await`, `Promise.resolve()`, Angular-Signal-Kontexte und Zeilenzahl laufen weiterhin. Konfigurieren Sie `parserOptions.projectService` für vollständige Durchsetzung.

## Optionen

```json
{
  "rules": {
    "@rdlabo/rules/restrict-try-block": [
      "error",
      {
        "allowPromise": false,
        "allowPromiseResolve": false,
        "allowRxjs": false,
        "allowInSignal": false,
        "maxLines": 3
      }
    ]
  }
}
```

### `allowPromise`

- Typ: `boolean`
- Standard: `false`

Erlaubt Promise-/Thenable-Verwendung innerhalb von `try`.

### `allowPromiseResolve`

- Typ: `boolean`
- Standard: `false`

Deaktiviert die dateiweite Prüfung von `Promise.resolve()`. Innerhalb eines `try`-Rumpfs ist zusätzlich `allowPromise: true` erforderlich, da der Aufruf unabhängig davon eine Promise-artige Verarbeitung ist.

### `allowRxjs`

- Typ: `boolean`
- Standard: `false`

Erlaubt RxJS-Verwendung innerhalb von `try`.

### `allowInSignal`

- Typ: `boolean`
- Standard: `false`

Erlaubt `try`-Blöcke innerhalb von Callbacks von `computed()` oder `effect()`.

### `maxLines`

- Typ: `number | false`
- Standard: `3`

Maximale Anzahl physischer Codezeilen innerhalb eines `try`-Blocks. Setzen Sie `false`, um die Größenprüfung zu deaktivieren. Äußere Klammern, Kommentare und Leerzeilen werden ausgeschlossen. Jede eindeutige Zeile mit einem anderen Token zählt einmal.

## Beispiele

### Inkorrekt

```ts
async function run() {
  try {
    await work();
  } catch {}
}
```

```ts
try {
  Promise.resolve(1).catch(() => 0);
} catch {}
```

```ts
import { of } from 'rxjs';

try {
  of(1).pipe().subscribe();
} catch {}
```

```ts
import { computed } from '@angular/core';

const value = computed(() => {
  try {
    return JSON.parse('1');
  } catch {
    return 0;
  }
});
```

```ts
try {
  first();
  second();
  third();
  fourth();
} catch {}
```

### Korrekt

```ts
function parse(source: string) {
  try {
    return JSON.parse(source);
  } catch {
    return null;
  }
}
```

```ts
async function run() {
  try {
    doWork();
  } catch {
    await recover();
  } finally {
    cleanup();
  }
}
```

```ts
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

of(1)
  .pipe(catchError(() => of(0)))
  .subscribe();
```

### Eine Prüfung lockern

```json
{
  "rules": {
    "@rdlabo/rules/restrict-try-block": [
      "error",
      {
        "allowPromise": true,
        "allowPromiseResolve": true,
        "allowRxjs": true,
        "allowInSignal": true,
        "maxLines": false
      }
    ]
  }
}
```

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel in Projekten, in denen `try/catch` eine kleine ausdrückliche Fehlergrenze bilden soll. Sie ist besonders nützlich in Angular-Signal-Code und bei der Abkehr von Promise-/RxJS-lastiger Fehlerbehandlung.

Die Prüfung von `Promise.resolve()` erkennt das nicht überschattene globale `Promise` und ausdrückliches `globalThis.Promise`, einschließlich statischer Klammernotation. Sie folgt bewusst keinen Aliasen. Ein lokal deklariertes oder importiertes `Promise` oder ein überschattetes `globalThis` wird nicht als eingebaute API behandelt.

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/restrict-try-block.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/restrict-try-block.ts)
