---
title: "prefer-modal-launcher"
sourceRevision: "8077ab47ad12a9ed2e0ab7c03d8062b5c1565a9e6da439cce7214b8058d68a93"
---
# @rdlabo/rules/prefer-modal-launcher

> Exiger que les appels à `presentModal` se trouvent dans une fonction de lancement `launch*`.
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).

Les modales et feuilles doivent être présentées via une fonction de lancement dédiée exportée depuis la page cible. Cela découple les sites d’appel des détails de construction et uniformise l’API des modales dans l’application. Cette règle garantit que `presentModal` (ou les autres méthodes de présentation configurées) n’est appelé que dans des fonctions dont le nom correspond au motif de lanceur.

## Détails de la règle

La règle vérifie les nœuds `CallExpression` pour des appels comme `presentModal`, `helper.presentModal(...)` ou `overlay.presentSheet(...)`. Si l’appel n’est pas dans une fonction de lancement, il est signalé.

Une fonction de lancement est une fonction dont le nom correspond à l’expression régulière configurée (`^launch` par défaut). La règle examine :

- `function launchXxx(...)`
- `const launchXxx = (...)`
- `class Foo { launchXxx = (...) }`
- `class Foo { launchXxx() {} }`
  Les fonctions imbriquées sont également prises en compte ; par exemple, une fonction fléchée `run` dans `launchExamplePage` est autorisée.

## Options

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

- Type : `string[]`
- Valeur par défaut : `["presentModal"]`

Noms des méthodes de présentation à restreindre.

### `launcherNamePattern`

- Type : `string`
- Valeur par défaut : `"^launch"`

Chaîne d’expression régulière. Les appels aux méthodes de présentation doivent se trouver dans une fonction dont le nom correspond à ce motif.

## Exemples

### Incorrect

```ts
export class ExamplePage {
  readonly helper = inject(HelperService);

  async open() {
    await this.helper.presentModal(OtherPage, {}); // hors d’un lanceur
  }
}
```

```ts
export class ExamplePage {
  readonly launchOtherPage = this.helper.presentModal(OtherPage, {}); // pas une fonction
}
```

```ts
export async function openModal(overlay: Helper) {
  await overlay.presentModal(ExamplePage, {}); // le nom ne correspond pas à ^launch
}
```

### Correct

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

### Configuration personnalisée

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

## Quand l’activer

Activez cette règle dans les projets Ionic/Angular utilisant le modèle de lanceur pour les modales, feuilles et autres superpositions. Elle s’associe à [`@rdlabo/rules/deny-element`](./deny-element.md) et [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md).

## Voir aussi

- [`@rdlabo/rules/deny-element`](./deny-element.md)
- [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md)

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/prefer-modal-launcher.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/prefer-modal-launcher.ts)
