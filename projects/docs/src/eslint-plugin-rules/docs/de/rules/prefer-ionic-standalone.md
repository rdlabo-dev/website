---
title: "prefer-ionic-standalone"
sourceRevision: "d1e69f615b017a0bc8d157bb605f84deb283c7c52988dd1fbb83c27a42db1fa0"
---
# @rdlabo/rules/prefer-ionic-standalone

> Bevorzugt die Ionic-9-Standalone-API und verbietet IonicModule sowie veraltete oder NgModule-basierte Einstiegspunkte.
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](../configuration.md) enthalten.
> - ✒️ Die Option `--fix` auf der [Befehlszeile](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) kann einige der von dieser Regel gemeldeten Probleme automatisch korrigieren.

Ionic 9 exportiert eigenständige Angular-Komponenten aus `@ionic/angular`. Diese Regel hält Anwendungen auf dieser API-Oberfläche, indem sie den veralteten Einstiegspunkt `@ionic/angular/standalone`, den NgModule-basierten Einstiegspunkt `@ionic/angular/lazy` und `IonicModule` selbst zurückweist.

## Einzelheiten der Regel

Die Regel prüft Imports, benannte Re-Exporte, Export-all-Deklarationen und Zugriffe auf `IonicModule` über einen Namespace-Import. Namespace-Zugriffe werden anhand des Gültigkeitsbereichs aufgelöst; eine überschattende lokale Variable mit demselben Namen wird daher nicht gemeldet.

## Beispiele

### Inkorrekt

```ts
import { IonButton } from '@ionic/angular/standalone';
import { IonInput } from '@ionic/angular/lazy';
import { IonicModule } from '@ionic/angular';
```

### Korrekt

```ts
import { IonButton, IonInput, ModalController, provideIonicAngular } from '@ionic/angular';
```

Benannte Imports und Re-Exporte aus `/standalone` und `/lazy` werden unter Beibehaltung der ursprünglichen Anführungszeichen automatisch auf `@ionic/angular` korrigiert. Side-Effect-Imports, Namespace-Imports und Deklarationen `export *` werden ohne Korrektur gemeldet, da ein Wechsel des Einstiegspunkts das Laufzeitverhalten verändern kann. Auch `IonicModule` wird ohne Korrektur gemeldet, da das Ersetzen von `IonicModule.forRoot()` und NgModule-Metadaten Änderungen auf Anwendungsebene erfordert.

## Optionen

Diese Regel besitzt keine Optionen. Konfigurieren Sie ihre Schwere in der ESLint-Konfiguration als `warn` oder `error`.

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel in Ionic-9-Angular-Anwendungen nach der Umstellung auf Standalone-Bootstrap. NgModule-Anwendungen sollten vor ihrer Aktivierung die Standalone-Migration abschließen, da `@ionic/angular/lazy` und `IonicModule` immer zurückgewiesen werden.

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/prefer-ionic-standalone.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/prefer-ionic-standalone.ts)
