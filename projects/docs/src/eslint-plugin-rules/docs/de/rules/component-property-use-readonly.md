---
title: "component-property-use-readonly"
sourceRevision: "aa55325bb731d532f0305106d69bdffa7e50fa62c1ef8d4b4b829e84531c9abe"
---
# @rdlabo/rules/component-property-use-readonly

> Warnt, wenn eine Property readonly sein sollte
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](../configuration.md) enthalten.
> - ✒️ Die Option `--fix` auf der [Befehlszeile](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) kann einige der von dieser Regel gemeldeten Probleme automatisch korrigieren.

Diese Regel verlangt den Modifikator `readonly` für von Angular-Komponenten deklarierte Properties, die keine Funktionen sind. Sie meldet initialisierte, nicht initialisierte, statische, berechnete, dekorierte, TypeScript-private und tatsächlich private Properties und kann `readonly` automatisch ergänzen.

## Einzelheiten der Regel

Geprüft werden ausschließlich Klassen mit `@Component()`. Methoden, Getter, Setter, Arrow-Function-Properties, Function-Expression-Properties, bereits mit `readonly` versehene Properties und Properties anderer Klassen werden ignoriert.

## Optionen

```json
{
  "rules": {
    "@rdlabo/rules/component-property-use-readonly": [
      "error",
      {
        "ignorePrivateProperties": true
      }
    ]
  }
}
```

### `ignorePrivateProperties`

- Typ: `boolean`
- Standard: `false`

Bei `true` werden mit dem TypeScript-Modifikator `private` deklarierte Properties und private ECMAScript-Properties mit `#` ignoriert. Öffentliche, geschützte und statische Properties werden weiterhin geprüft.

## Beispiele

### Inkorrekt

```ts
@Component({
  selector: 'app-example',
  template: '<div>example</div>',
})
export class ExampleComponent {
  x = 1;
  public y = 2;
  private z = 3;
  protected w = 4;
  #secret = 42;
  static a = 1;
  ['foo'] = 1;
  @Input() i = 8;
  h: number;
}
```

### Korrekt

```ts
@Component({
  selector: 'app-example',
  template: '<div>example</div>',
})
export class ExampleComponent {
  readonly x = 1;
  public readonly y = 2;
  private readonly z = 3;
  protected readonly w = 4;
  readonly #secret = 42;
  static readonly a = 1;
  readonly ['foo'] = 1;
  @Input() readonly i = 8;
  readonly h: number;
}
```

Mit `ignorePrivateProperties: true` dürfen private Properties veränderlich bleiben:

```ts
@Component({
  selector: 'app-example',
  template: '<div>example</div>',
})
export class ExampleComponent {
  private privateProp = 1; // Kein Fehler
  #secretProp = 2; // Kein Fehler
  public readonly publicProp = 3;
}
```

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel, wenn Komponentenproperties stabile Referenzen bereitstellen sollen und veränderlicher Zustand über Signals oder ein ViewModel verwaltet wird.

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/component-property-use-readonly.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/component-property-use-readonly.ts)
