---
title: "prefer-modal-launcher"
sourceRevision: "8077ab47ad12a9ed2e0ab7c03d8062b5c1565a9e6da439cce7214b8058d68a93"
---
# @rdlabo/rules/prefer-modal-launcher

> Verlangt `presentModal`-Aufrufe innerhalb einer Launcher-Funktion `launch*`.
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](../configuration.md) enthalten.

Modals und Sheets sollten über eine dedizierte Launcher-Funktion angezeigt werden, die aus der Zielseite exportiert wird. Dadurch bleiben Aufrufstellen von Details der Modal-Erstellung entkoppelt und die Modal-API in der gesamten Anwendung einheitlich. Diese Regel stellt sicher, dass `presentModal` oder andere konfigurierte Präsentationsmethoden nur innerhalb von Funktionen aufgerufen werden, deren Name einem Launcher-Muster entspricht.

## Einzelheiten der Regel

Die Regel prüft `CallExpression`-Knoten auf Aufrufe wie `presentModal`, `helper.presentModal(...)` oder `overlay.presentSheet(...)`. Liegt der Aufruf nicht innerhalb einer Launcher-Funktion, wird er gemeldet.

Eine Launcher-Funktion ist eine Funktion, deren Name dem konfigurierten regulären Ausdruck entspricht, standardmäßig `^launch`. Die Regel betrachtet:

- `function launchXxx(...)`
- `const launchXxx = (...)`
- `class Foo { launchXxx = (...) }`
- `class Foo { launchXxx() {} }`
  Auch verschachtelte Funktionen werden berücksichtigt. Beispielsweise ist eine Arrow-Funktion `run` innerhalb von `launchExamplePage` erlaubt.

## Optionen

```json
{
  "rules": {
    "@rdlabo/rules/prefer-modal-launcher": [
      "error",
      {
        "presentMethodNames": ["presentModal"],
        "launcherNamePattern": "^launch"
      }
    ]
  }
}
```

### `presentMethodNames`

- Typ: `string[]`
- Standard: `["presentModal"]`

Die Namen der einzuschränkenden Präsentationsmethoden.

### `launcherNamePattern`

- Typ: `string`
- Standard: `"^launch"`

Ein regulärer Ausdruck als Zeichenfolge. Aufrufe von Präsentationsmethoden müssen innerhalb einer Funktion liegen, deren Name diesem Muster entspricht.

## Beispiele

### Inkorrekt

```ts
export class ExamplePage {
  readonly helper = inject(HelperService);

  async open() {
    await this.helper.presentModal(OtherPage, {}); // Nicht in einer Launcher-Funktion
  }
}
```

```ts
export class ExamplePage {
  readonly launchOtherPage = this.helper.presentModal(OtherPage, {}); // Keine Funktion
}
```

```ts
export async function openModal(overlay: Helper) {
  await overlay.presentModal(ExamplePage, {}); // Der Name entspricht nicht ^launch
}
```

### Korrekt

```ts
export const launchExamplePage = (overlay: Helper, props: Props) => {
  return overlay.presentModal(ExamplePage, props);
};
```

```ts
export function launchExamplePage(overlay: Helper, props: Props) {
  return overlay.presentModal(ExamplePage, props);
}
```

```ts
export const launchExamplePage = (overlay: Helper, props: Props) => {
  const run = () => overlay.presentModal(ExamplePage, props);
  return run();
};
```

### Benutzerdefinierte Konfiguration

```ts
export const openSheet = (overlay: Helper) => {
  return overlay.presentSheet(SheetPage, {});
};
```

```json
{
  "rules": {
    "@rdlabo/rules/prefer-modal-launcher": [
      "error",
      {
        "presentMethodNames": ["presentSheet"],
        "launcherNamePattern": "^(launch|open)"
      }
    ]
  }
}
```

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel in Ionic-/Angular-Projekten mit Launcher-Muster für Modals, Sheets und andere Overlays. Sie ergänzt [`@rdlabo/rules/deny-element`](./deny-element.md) und [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md).

## Siehe auch

- [`@rdlabo/rules/deny-element`](./deny-element.md)
- [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md)

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/prefer-modal-launcher.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/prefer-modal-launcher.ts)
