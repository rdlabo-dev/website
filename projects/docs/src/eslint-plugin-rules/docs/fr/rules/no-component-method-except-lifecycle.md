---
title: "no-component-method-except-lifecycle"
sourceRevision: "265b1e9474b4f864649a97b2e750d9acdd29c1fd66a9e49a6cf390f5ee117f2f"
---
# @rdlabo/rules/no-component-method-except-lifecycle

> Interdire les méthodes hors cycle de vie sur `@Component`. Les méthodes de cycle de vie autorisées sont déduites de `implements` (les propriétés sont autorisées).
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).

Cette règle impose des Components légers. Un Component doit contenir des hooks de cycle de vie, des gestionnaires d’événements délégués et des propriétés de vue en lecture seule. La logique métier arbitraire doit résider dans un ViewModel, accessible par la propriété `vm` du Component.

## Détails de la règle

La règle vérifie les méthodes des classes décorées avec `@Component` :

- `constructor`, les getters et les setters sont ignorés.
- Les méthodes dont le nom correspond à une interface de cycle de vie déclarée dans `implements` sont autorisées (par exemple `ngOnInit` lorsque `OnInit` est implémenté, ou `ionViewWillEnter` lorsque `ViewWillEnter` est implémenté).
- Les méthodes figurant dans `additionalAllowedMethods` sont autorisées.
- Toutes les autres définitions de méthode sont signalées.

La règle signale également les méthodes de cycle de vie utilisées sans implémenter l’interface correspondante. Par exemple, une méthode `ionViewWillEnter` sans `implements ViewWillEnter` est signalée.

## Interfaces de cycle de vie prises en charge

| Interface             | Méthode                  |
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

## Exemples

### Incorrect

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
  ionViewWillEnter() {} // implements ViewWillEnter manque
}
```

### Correct

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

## Options

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

- Type : `string[]`
- Valeur par défaut : `[]`

Noms des méthodes autorisées en plus des méthodes de cycle de vie. Utilisez cette option pour des utilitaires comme `trackById` qui font partie du contrat du modèle du Component.

## Quand l’activer

Activez cette règle lorsqu’un projet veut garder des Components légers et déplacer la logique dans des ViewModels. Elle s’associe à [`@rdlabo/rules/require-viewmodel`](./require-viewmodel.md).

## Voir aussi

- [`@rdlabo/rules/require-viewmodel`](./require-viewmodel.md)

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/no-component-method-except-lifecycle.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/no-component-method-except-lifecycle.ts)
