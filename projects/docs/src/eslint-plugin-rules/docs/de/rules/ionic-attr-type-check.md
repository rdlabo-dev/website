---
title: "ionic-attr-type-check"
sourceRevision: "9e4baaf74ad97c89e90c628cf80b323b9f40c5c6e3e3282ebf29e08611202f25"
---
# @rdlabo/rules/ionic-attr-type-check

> Verlangt Property-Bindings für unterstützte nicht als Zeichenfolge vorliegende Ionic-Attribute und validiert Zeichenfolgenliteral-Attribute.
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](../configuration.md) enthalten.
> - ✒️ Die Option `--fix` auf der [Befehlszeile](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) kann einige der von dieser Regel gemeldeten Probleme automatisch korrigieren.

Ionic-Komponentenattribute können boolesch, numerisch, als Objekt oder als Zeichenfolge vorliegen. Eine Zeichenfolge wie `button="true"` an eine boolesche Property zu übergeben, ist ein häufiger Fehler und kann unerwartetes Verhalten verursachen. Diese Regel liest die Ionic-Typdefinitionen aus `@ionic/core` und meldet Abweichungen.

## Einzelheiten der Regel

Die Regel läuft auf Angular-Templates. Für jedes Ionic-Element liest sie die `@ionic/core`-Typdefinitionen und ordnet jedes Attribut einem der folgenden Typen zu:

- `string` — Zeichenfolgenliterale sind erlaubt
- `string literal` — nur eine bestimmte Menge von Werten ist erlaubt
- `boolean` — verwenden Sie `[attr]="true"` oder `[attr]="false"`
- `number` — verwenden Sie `[attr]="50"`
- `object` — verwenden Sie `[attr]="..."`
- `skip` / `unknown` — wird nicht geprüft

Für boolesche Attribute erkennt die Regel die Zeichenfolgenwerte `true`, `false`, `1`, `0`, `yes`, `no`, `on` und `off`. Andere Zeichenfolgen werden von der booleschen Prüfung nicht gemeldet. Unterstützte Abweichungen bei booleschen, numerischen und Objektwerten werden automatisch zu Property-Bindings korrigiert:

- `button="true"` -> `[button]="true"`
- `value="50"` -> `[value]="50"`
- `autocorrect="off"` -> `[autocorrect]="false"` unter Ionic 9

Wenn ein Zeichenfolgenwert für ein Zeichenfolgenliteral-Attribut ungültig ist, meldet die Regel die akzeptierten Werte.

## Beispiele

### Inkorrekt

```html
<ion-item button="true"></ion-item>
```

```html
<ion-progress-bar value="50"></ion-progress-bar>
```

```html
<ion-modal isOpen="true" backdropDismiss="false"></ion-modal>
```

### Korrekt

```html
<ion-item [button]="true"></ion-item>
```

```html
<ion-progress-bar [value]="50"></ion-progress-bar>
```

```html
<ion-modal [isOpen]="true" [backdropDismiss]="false"></ion-modal>
```

```html
<!-- Attribute mit String-Typ sind weiterhin erlaubt -->
<ion-item lines="full"></ion-item>
<ion-button color="primary">Click me</ion-button>
```

## Optionen

Diese Regel besitzt keine Optionen.

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel in jedem Ionic-Angular-Projekt. Sie ist besonders nützlich bei der Migration älterer Ionic-Syntax oder beim Einarbeiten von Entwicklern, die gewöhnliche HTML-Attribute gewohnt sind.

## Voraussetzungen

Die Regel benötigt `@ionic/core` im selben Projekt, um `node_modules/@ionic/core/dist/types/components.d.ts` lesen zu können. Ist das Paket nicht vorhanden, liefert sie ein leeres Ergebnis und meldet nichts.

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/ionic-attr-type-check.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/ionic-attr-type-check.ts)
