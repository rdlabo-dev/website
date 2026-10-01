---
title: "component-property-use-readonly"
sourceRevision: "aa55325bb731d532f0305106d69bdffa7e50fa62c1ef8d4b4b829e84531c9abe"
---
# @rdlabo/rules/component-property-use-readonly

> Avertit lorsqu’une propriété devrait être readonly
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).
> - ✒️ L’option `--fix` de la [ligne de commande](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) peut corriger automatiquement certains problèmes signalés par cette règle.

Cette règle exige le modificateur `readonly` pour les propriétés qui ne contiennent pas de fonction déclarées par les composants Angular. Elle signale les propriétés initialisées, non initialisées, statiques, calculées, décorées, privées TypeScript et privées strictes, et peut ajouter `readonly` automatiquement.

## Détails de la règle

Seules les classes décorées avec `@Component()` sont vérifiées. Les méthodes, getters, setters, propriétés de fonctions fléchées, propriétés d’expressions de fonction, propriétés déjà `readonly` et propriétés d’autres classes sont ignorés.

## Options

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

- Type : `boolean`
- Valeur par défaut : `false`

Lorsque l’option vaut `true`, les propriétés déclarées avec le modificateur TypeScript `private` et les propriétés privées ECMAScript `#` sont ignorées. Les propriétés publiques, protégées et statiques restent vérifiées.

## Exemples

### Incorrect

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

### Correct

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

Avec `ignorePrivateProperties: true`, les propriétés privées peuvent rester modifiables :

```ts
@Component({
  selector: 'app-example',
  template: '<div>example</div>',
})
export class ExampleComponent {
  private privateProp = 1; // aucune erreur
  #secretProp = 2; // aucune erreur
  public readonly publicProp = 3;
}
```

## Quand l’activer

Activez cette règle lorsque les propriétés des composants doivent exposer des références stables et que l’état modifiable est géré via des Signals ou un ViewModel.

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/component-property-use-readonly.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/component-property-use-readonly.ts)
