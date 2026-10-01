---
title: "deny-constructor-di"
sourceRevision: "9ca98a52c5bc8e79bb0e8e336c53c1c6159a31f42b18a72bb65e98744adc687b"
---
# @rdlabo/rules/deny-constructor-di

> Dieses Plugin verbietet Dependency Injection im Konstruktor.

Diese Regel meldet Konstruktorparameter-Properties, die für Dependency Injection verwendet werden, beispielsweise `constructor(private readonly auth: AuthService)`. Die Angular-Funktion `inject()` ist der moderne Weg, Abhängigkeiten in Standalone-Komponenten und Diensten anzufordern. Sie vermeidet Konstruktor-Boilerplate und macht DI ausdrücklich sichtbar.

## Einzelheiten der Regel

Die Regel prüft Klassenkonstruktoren und meldet jeden Parameter vom Typ `TSParameterProperty`, also einen Parameter mit einem Modifikator wie `public`, `private` oder `readonly`. Diese Parameter werden zu Klassenfeldern und werden für DI verwendet.

- Gewöhnliche Konstruktorparameter ohne Modifikatoren sind erlaubt.
- Die Regel korrigiert nicht automatisch. Sie müssen Konstruktor-DI manuell durch `inject()` ersetzen.

## Beispiele

### Inkorrekt

```ts
@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
})
export class SigninPage {
  constructor(
    private store: Store<IApp>,
    public readonly navCtrl: NavController,
  ) {}
}
```

### Korrekt

```ts
import { inject } from '@angular/core';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
})
export class SigninPage {
  private readonly store = inject(Store<IApp>);
  private readonly navCtrl = inject(NavController);
}
```

```ts
// Konstruktorparameter außerhalb der Dependency Injection sind erlaubt
export class LogManager {
  constructor(logDomain: string) {
    this.logDomain = logDomain;
  }
}
```

## Optionen

Diese Regel besitzt keine Optionen.

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese optionale Regel, wenn ein Projekt Angular-Abhängigkeiten über `inject()` statt über Konstruktorparameter-Properties beziehen soll. Gewöhnliche Konstruktorparameter bleiben erlaubt, da die Regel ausschließlich `TSParameterProperty`-Knoten meldet.

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/deny-constructor-di.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/deny-constructor-di.ts)
