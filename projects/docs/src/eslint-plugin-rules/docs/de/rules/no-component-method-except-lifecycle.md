---
title: "no-component-method-except-lifecycle"
sourceRevision: "265b1e9474b4f864649a97b2e750d9acdd29c1fd66a9e49a6cf390f5ee117f2f"
---
# @rdlabo/rules/no-component-method-except-lifecycle

> Verbietet Methoden außerhalb des Lebenszyklus an `@Component`. Zulässige Lebenszyklusmethoden werden aus `implements` abgeleitet; Properties sind erlaubt.
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](../configuration.md) enthalten.

Diese Regel erzwingt schlanke Komponenten. Eine Komponente sollte Lebenszyklushooks, delegierte Ereignishandler und schreibgeschützte View-Properties enthalten. Beliebige Geschäftslogik sollte in einem ViewModel liegen, auf das die Komponente über ihre Property `vm` zugreift.

## Einzelheiten der Regel

Die Regel prüft Methoden innerhalb von Klassen mit `@Component`:

- `constructor`, Getter und Setter werden ignoriert.
- Methoden, deren Name zu einem in `implements` deklarierten Lebenszyklusinterface gehört, sind erlaubt, beispielsweise `ngOnInit` bei implementiertem `OnInit` oder `ionViewWillEnter` bei implementiertem `ViewWillEnter`.
- In `additionalAllowedMethods` aufgeführte Methoden sind erlaubt.
- Alle anderen Methodendefinitionen werden gemeldet.

Die Regel meldet auch Lebenszyklusmethoden ohne implementiertes passendes Interface. Beispielsweise wird eine Methode `ionViewWillEnter` ohne `implements ViewWillEnter` gemeldet.

## Unterstützte Lebenszyklusinterfaces

| Interface             | Methode                  |
| --------------------- | ----------------------- |
| `OnChanges`           | `ngOnChanges`           |
| `OnInit`              | `ngOnInit`              |
| `DoCheck`             | `ngDoCheck`             |
| `AfterContentInit`    | `ngAfterContentInit`    |
| `AfterContentChecked` | `ngAfterContentChecked` |
| `AfterViewInit`       | `ngAfterViewInit`       |
| `AfterViewChecked`    | `ngAfterViewChecked`    |
| `OnDestroy`           | `ngOnDestroy`           |
| `ViewWillEnter`       | `ionViewWillEnter`      |
| `ViewDidEnter`        | `ionViewDidEnter`       |
| `ViewWillLeave`       | `ionViewWillLeave`      |
| `ViewDidLeave`        | `ionViewDidLeave`       |
| `ViewWillUnload`      | `ionViewWillUnload`     |

## Beispiele

### Inkorrekt

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  open() {
    launchOtherPage(this.helper, {});
  }

  reload() {
    this.vm.reload$.next();
  }
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  ionViewWillEnter() {} // implements ViewWillEnter fehlt
}
```

### Korrekt

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage implements ViewWillEnter, ViewWillLeave, OnDestroy {
  readonly vm = new ViewModel(this);
  readonly open = () => launchOtherPage(this.helper, {});

  ionViewWillEnter() {
    this.vm.reload$.next();
  }

  ionViewWillLeave() {}
  ngOnDestroy() {}
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage implements ViewWillEnter {
  ionViewWillEnter() {}

  trackById(_index: number, item: { id: number }) {
    return item.id;
  }

  customHook() {}
}
```

```json
{
  "rules": {
    "@rdlabo/rules/no-component-method-except-lifecycle": [
      "error",
      {
        "additionalAllowedMethods": ["trackById", "customHook"]
      }
    ]
  }
}
```

## Optionen

```json
{
  "rules": {
    "@rdlabo/rules/no-component-method-except-lifecycle": [
      "error",
      {
        "additionalAllowedMethods": []
      }
    ]
  }
}
```

### `additionalAllowedMethods`

- Typ: `string[]`
- Standard: `[]`

Methodennamen, die zusätzlich zu Lebenszyklusmethoden erlaubt sind. Verwenden Sie dies für Hilfsmethoden wie `trackById`, die zum Template-Vertrag der Komponente gehören.

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel, wenn Komponenten in Ihrem Projekt schlank bleiben und Logik in ViewModels liegen soll. Sie ergänzt [`@rdlabo/rules/require-viewmodel`](./require-viewmodel.md).

## Siehe auch

- [`@rdlabo/rules/require-viewmodel`](./require-viewmodel.md)

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/no-component-method-except-lifecycle.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/no-component-method-except-lifecycle.ts)
