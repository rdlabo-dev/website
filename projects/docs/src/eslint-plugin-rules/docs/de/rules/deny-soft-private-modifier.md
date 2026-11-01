---
title: "deny-soft-private-modifier"
sourceRevision: "acc824d209e39ff3569da18e38e6726e2a778f9ce8aee9d66dc73f53138d18a0"
---
# @rdlabo/rules/deny-soft-private-modifier

> Dieses Plugin verbietet den nur zur Kompilierzeit wirksamen private-Modifikator.
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration) enthalten.
> - ✒️ Die Option `--fix` auf der [Befehlszeile](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) kann einige der von dieser Regel gemeldeten Probleme automatisch korrigieren.

Der TypeScript-Modifikator `private` wird nur zur Kompilierzeit durchgesetzt. Zur Laufzeit kann weiterhin per Klammernotation oder durch einen Cast zu `any` darauf zugegriffen werden. Tatsächlich private JavaScript-Felder (`#`) werden zur Laufzeit durchgesetzt und lassen sich von außerhalb der Klasse nicht umgehen. Diese Regel ersetzt `private`-Properties und -Methoden durch `#`-Felder und passt Referenzen von `this.x` auf `this.#x` an.

## Einzelheiten der Regel

Diese Regel prüft Klassen auf folgende Muster:

- Eine `private`-Property-Definition (`private field = ...`)
- Eine `private`-Methodendefinition (`private method() { ... }`)
- Eine Referenz `this.field`, bei der `field` als `private` deklariert wurde

Sie meldet Konstruktoren **nicht**, da `private constructor()` eine andere Bedeutung hat: Es verhindert externe Instanziierung. Eine Property mit `private readonly` wird gemeldet. Die Korrektur entfernt `private`, ergänzt `#` und erhält `readonly`.

Die automatische Korrektur der Regel führt Folgendes aus:

1. Sie entfernt das Schlüsselwort `private`.
2. Sie fügt `#` vor dem Property- oder Methodennamen ein.
3. Sie ändert alle Referenzen `this.field` oder `this.method()` innerhalb der Klasse in `this.#field` oder `this.#method()`.

## Beispiele

### Inkorrekt

```ts
class TokenStore {
  private token = '';

  private refresh() {
    this.token = 'new-token';
  }
}
```

### Korrekt

```ts
class TokenStore {
  #token = '';

  #refresh() {
    this.#token = 'new-token';
  }
}
```

## Optionen

Diese Regel besitzt keine Optionen.

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel, wenn ein Projekt zur Laufzeit durchgesetzte Kapselung für Klasseninterna verlangt. Sie lässt sich mit `--fix` auf bestehendem Code ausführen, verändert jedoch die öffentliche API-Oberfläche: Code, der zur Laufzeit auf lediglich zur Kompilierzeit geschützte `private`-Member zugegriffen hat, funktioniert danach nicht mehr.

## Siehe auch

- [`@rdlabo/rules/restrict-try-block`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/restrict-try-block)

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.1/src/rules/deny-soft-private-modifier.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.1/tests/rules/deny-soft-private-modifier.ts)
