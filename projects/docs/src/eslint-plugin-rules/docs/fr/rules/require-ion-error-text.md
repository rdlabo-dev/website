---
title: "require-ion-error-text"
sourceRevision: "b5655ad7d1a36b7b555213f3b06d3fc93738fe621982d15f2c7391098b7b286f"
---
# @rdlabo/rules/require-ion-error-text

> Exiger une source errorText pour les contrôles de validation Ionic.
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).

Exige une source pour `errorText` sur les contrôles Ionic participant à la validation Angular Signal Forms.

## Détails de la règle

La règle vérifie ces contrôles Ionic dans les fichiers de modèles Angular :

- `ion-input`
- `ion-textarea`
- `ion-select`
- `ion-checkbox`
- `ion-radio-group`
- `ion-toggle`

Par défaut, un contrôle pris en charge n’est vérifié que s’il lie Angular Signal Forms avec `[formField]`. Il doit utiliser l’une de ces sources de message d’erreur :

- Un `errorText` statique non vide
- Une propriété liée `[errorText]`
- `KitIonicFormField`, lorsque `formFieldProvidesErrorText` est activé

`[attr.errorText]` n’est pas accepté, car Ionic expose `errorText` comme propriété du composant. Une valeur statique vide ou composée uniquement d’espaces est également rejetée. Les fichiers `.spec.html` sont ignorés.

## Options

```json
{
  "rules": {
    "@rdlabo/rules/require-ion-error-text": [
      "error",
      {
        "formFieldProvidesErrorText": true,
        "checkAll": false,
        "ignoreReadonly": false
      }
    ]
  }
}
```

### `formFieldProvidesErrorText`

- Type : `boolean`
- Valeur par défaut : `false`

Lorsque l’option vaut `true`, un contrôle pris en charge avec `[formField]` peut omettre `errorText`, car `KitIonicFormField` le fournit. N’activez cette option qu’après que chaque composant standalone concerné importe `KitIonicFormField` et que l’application installe `provideKitIonicSignalForms()`.

Cette option déclare que l’adaptateur est installé ; la règle n’inspecte pas les imports des composants ni les providers de l’application. Un `errorText` explicite mais vide reste une erreur au lieu d’utiliser l’adaptateur en repli.

### `checkAll`

- Type : `boolean`
- Valeur par défaut : `false`

Lorsque l’option vaut `true`, la règle vérifie aussi les contrôles pris en charge sans `[formField]`. Cette vérification s’active explicitement, car les filtres, champs de recherche et contrôles de paramètres ne participent pas nécessairement à la validation.

### `ignoreReadonly`

- Type : `boolean`
- Valeur par défaut : `false`

Lorsque `checkAll` et `ignoreReadonly` valent tous deux `true`, les `ion-input` et `ion-textarea` avec un attribut `readonly` littéral sont ignorés. Une liaison dynamique `[readonly]` reste vérifiée, car le contrôle peut devenir modifiable à l’exécution.

## Exemples

### Incorrect

```html
<ion-input [formField]="fields.name"></ion-input>
```

```html
<ion-textarea [formField]="fields.description" errorText="   "></ion-textarea>
```

```html
<ion-select [formField]="fields.category" [attr.errorText]="categoryError"></ion-select>
```

Avec `checkAll: true`, un contrôle pris en charge sans `[formField]` nécessite aussi une source de message d’erreur :

```html
<ion-toggle></ion-toggle>
```

### Correct

```html
<ion-input [formField]="fields.name" errorText="Name is required."></ion-input>
```

```html
<ion-textarea [formField]="fields.description" [errorText]="descriptionError()"></ion-textarea>
```

Avec `formFieldProvidesErrorText: true` et l’adaptateur du kit installé :

```html
<ion-select [formField]="fields.category"></ion-select>
```

Avec `checkAll: true` et `ignoreReadonly: true` :

```html
<ion-input readonly></ion-input>
```

Les contrôles non pris en charge comme `ion-searchbar` restent hors du périmètre de la règle :

```html
<ion-searchbar [formField]="fields.query"></ion-searchbar>
```

## Quand l’activer

Activez cette règle dans les applications Ionic Angular utilisant l’API `errorText` d’Ionic pour les retours de validation. Le périmètre par défaut convient aux applications Angular Signal Forms, car il vérifie les contrôles liés à la validation sans imposer de messages d’erreur aux contrôles d’interface sans rapport.

Utilisez `formFieldProvidesErrorText` lorsque l’application délègue les messages de validation génériques à `@rdlabo/ionic-angular-kit`. Utilisez `checkAll` uniquement si l’application exige que chaque contrôle Ionic pris en charge déclare une source de message d’erreur.

La règle signale uniquement ; elle ne corrige pas automatiquement la politique de validation de l’application ni la configuration de l’adaptateur.

## Voir aussi

- [Intégration Signal Forms de `@rdlabo/ionic-angular-kit`](https://github.com/rdlabo-dev/ionic-angular-library/blob/main/projects/kit/docs/forms.md)

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.1/src/rules/require-ion-error-text.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.1/tests/rules/require-ion-error-text.ts)
