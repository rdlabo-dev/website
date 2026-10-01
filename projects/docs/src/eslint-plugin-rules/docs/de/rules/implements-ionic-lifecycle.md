---
title: "implements-ionic-lifecycle"
sourceRevision: "04ce3fd4069d74289379764632ea85cb35a8d0a563d801e96fb0e6cc9c555106"
---
# @rdlabo/rules/implements-ionic-lifecycle

> Dieses Plugin empfiehlt die Implementierung der Ionic-Lebenszyklusinterfaces.
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](../configuration.md) enthalten.
> - ✒️ Die Option `--fix` auf der [Befehlszeile](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) kann einige der von dieser Regel gemeldeten Probleme automatisch korrigieren.

Ionic stellt Framework-Lebenszyklusmethoden wie `ionViewWillEnter` und `ionViewDidLeave` bereit. Deklariert eine Komponente diese Methoden, sollte sie außerdem das entsprechende Interface (`ViewWillEnter`, `ViewDidEnter`, `ViewWillLeave`, `ViewDidLeave`) implementieren, damit TypeScript den Vertrag prüfen kann. Diese Regel erzwingt diese Zuordnung und kann die `implements`-Klausel automatisch korrigieren.

## Einzelheiten der Regel

Diese Regel prüft mit `@Component` dekorierte Klassen. Sie sucht nach Methodendefinitionen mit den Namen von Ionic-Lebenszyklusmethoden:

- `ionViewWillEnter` -> `ViewWillEnter`
- `ionViewDidEnter` -> `ViewDidEnter`
- `ionViewWillLeave` -> `ViewWillLeave`
- `ionViewDidLeave` -> `ViewDidLeave`

Wenn eine Methode vorhanden ist und ihr passendes Interface fehlt, meldet die Regel dies. Beim Korrigieren eines fehlenden Interfaces ersetzt sie die gesamte `implements`-Klausel durch die zu den verwendeten Methoden passenden Ionic-Lebenszyklusinterfaces. Dabei können andere Interfaces wie `OnInit` entfernt werden. Prüfen Sie daher die Korrektur und stellen Sie alle weiterhin benötigten Nicht-Ionic-Interfaces wieder her. Sind sämtliche erforderlichen Interfaces bereits vorhanden, werden zusätzliche Lebenszyklusinterfaces weder gemeldet noch entfernt.

- Die Regel prüft keine Klassen, die keine Komponenten sind.
- Ist der Klassenrumpf leer, implementiert aber Lebenszyklusinterfaces, entfernt die Regel die überholte `implements`-Klausel.
- Die Regel meldet jede korrigierbare Gruppe nur einmal, um überlappende Korrekturen zu vermeiden.

## Beispiele

### Inkorrekt

```ts
@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage {
  ionViewWillEnter() {}
  ionViewWillLeave() {}
}
```

```ts
@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage implements ViewDidEnter, ViewDidLeave {
  ionViewWillEnter() {}
  ionViewWillLeave() {}
}
```

### Korrekt

```ts
import { ViewWillEnter, ViewWillLeave } from '@ionic/angular';

@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage implements ViewWillEnter, ViewWillLeave {
  ionViewWillEnter() {}
  ionViewWillLeave() {}
}
```

```ts
@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage implements ViewDidEnter, ViewDidLeave {
  ionViewDidEnter() {}
  ionViewDidLeave() {}
}
```

## Optionen

Diese Regel besitzt keine Optionen.

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel in jedem Ionic-Angular-Projekt. Sie hält die `implements`-Klausel beim Hinzufügen, Umbenennen oder Entfernen von Lebenszyklusmethoden korrekt und eignet sich gut für `--fix`.

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/implements-ionic-lifecycle.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/implements-ionic-lifecycle.ts)
