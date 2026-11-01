---
title: "deny-overlay-create"
sourceRevision: "0569ce7e261407d1b9dff03d7e11e0cd60bb16fb9f74f3c4e8dcdfc38790016e"
---
# @rdlabo/rules/deny-overlay-create

> Interdire `.create()` sur ModalController / PopoverController ; ouvrir les superpositions via des lanceurs.
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration).

Cette règle empêche la création directe de superpositions Ionic via les appels `.create()` des contrôleurs. Dans l’architecture rdlabo, les superpositions doivent être ouvertes via des fonctions de lancement et un utilitaire partagé `presentModal` / `presentPopover`. Cela centralise leur logique et découple le site d’appel de l’API du contrôleur.

## Détails de la règle

La règle détecte les appels `.create()` dont le destinataire est un `ModalController` ou `PopoverController` (ou un autre contrôleur configuré). Elle résout le contrôleur à travers plusieurs motifs :

- `this.modalCtrl.create()`
- `modalCtrl.create()` (où `modalCtrl` vaut `inject(ModalController)`)
- `inject(ModalController).create()`
- Paramètre de constructeur `constructor(private modalCtrl: ModalController)`
- Propriété de classe typée `ModalController`

Les autres contrôleurs de superposition, comme `LoadingController`, `AlertController`, `ToastController` et `ActionSheetController`, ne sont pas interdits par défaut, car leur utilisation directe peut être volontaire.

## Options

```json
{
  "rules": {
    "@rdlabo/rules/deny-overlay-create": [
      "error",
      {
        "deny": ["ModalController", "PopoverController"]
      }
    ]
  }
}
```

### `deny`

- Type : `string[]`
- Valeur par défaut : `["ModalController", "PopoverController"]`

Noms des classes de contrôleurs dont les appels `.create()` doivent être interdits. Utilisez un tableau vide pour désactiver la règle.

## Exemples

### Incorrect

```ts
export class ExamplePage {
  readonly #modalCtrl = inject(ModalController);

  async open() {
    await this.#modalCtrl.create({ component: OtherPage });
  }
}
```

```ts
export async function open(modalCtrl: ModalController) {
  await modalCtrl.create({ component: OtherPage });
}
```

```ts
export class ExamplePage {
  constructor(private modalCtrl: ModalController) {}

  async open() {
    await this.modalCtrl.create({ component: OtherPage });
  }
}
```

### Correct

```ts
export const launchOtherPage = (overlay: Helper, props: Props) => {
  return overlay.presentModal(OtherPage, props);
};
```

```ts
export class ExamplePage {
  readonly #loadingCtrl = inject(LoadingController);

  async showLoading() {
    await this.#loadingCtrl.create({ message: '...' });
  }
}
```

```ts
export class ExamplePage {
  readonly #modalCtrl = inject(ModalController);

  dismiss(data?: unknown) {
    this.#modalCtrl.dismiss(data);
  }
}
```

## Quand l’activer

Activez cette règle dans les projets Ionic qui suivent le modèle de lanceur et utilisent un utilitaire de superposition partagé. Elle s’associe à [`@rdlabo/rules/prefer-modal-launcher`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/prefer-modal-launcher) et [`@rdlabo/rules/deny-element`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/deny-element).

## Voir aussi

- [`@rdlabo/rules/prefer-modal-launcher`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/prefer-modal-launcher)
- [`@rdlabo/rules/deny-element`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/deny-element)

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.1/src/rules/deny-overlay-create.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.1/tests/rules/deny-overlay-create.ts)
