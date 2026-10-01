---
title: "no-template-driven-forms"
sourceRevision: "7fdd7720e8618bbf936ef12da94f6fbdae76c15fba7ed49559ff0fd277eabf87"
---
# @rdlabo/rules/no-template-driven-forms

> Interdire les formulaires pilotés par modèle, sauf les liaisons `ngModel` sur les éléments explicitement autorisés.

Cette règle restreint les formulaires pilotés par modèle dans les modèles Angular. `ngForm` et `ngModelGroup` sont toujours rejetés, car ils portent un état de formulaire modifiable dans le modèle. `ngModel` est également rejeté, sauf sur un élément explicitement autorisé pour une liaison de vue Ionic inadaptée à Signal Forms.

Un élément autorisé est une exception d’interopérabilité, pas une recommandation d’utiliser les formulaires pilotés par modèle. Les formulaires de soumission doivent utiliser Signal Forms même lorsqu’ils contiennent un élément autorisé.

## Détails de la règle

La règle s’exécute sur les modèles Angular et vérifie trois motifs :

1. **`ngModel` sur un élément absent de `allowedElements`**
   Signale `ngModel`, `[(ngModel)]` et `[ngModel]` sur les éléments dont le nom de balise ne figure pas dans la liste autorisée. Une sortie `(ngModelChange)` isolée n’est pas inspectée.

2. **Attribut `ngModelGroup`**
   Signale tout attribut `ngModelGroup` sur tout élément.

3. **Référence ou directive `ngForm`**
   Signale `<form #form="ngForm">` et `<div ngForm>`.

La règle n’utilise pas les informations de types ; elle travaille uniquement sur l’AST du modèle analysé.

## Exemples

### Incorrect

```html
<!-- ngModel sur un champ ordinaire -->
<input [(ngModel)]="name" />

<!-- Référence ngForm -->
<form #form="ngForm"></form>

<!-- Directive ngModelGroup -->
<div ngModelGroup="address"></div>
```

### Correct

```html
<!-- Liaison de champ Signal Forms -->
<input [formField]="userForm.name" />

<!-- ngModel autorisé sur ion-searchbar pour une liaison de vue -->
<ion-searchbar [(ngModel)]="query"></ion-searchbar>
```

## Options

```json
{
  "rules": {
    "@rdlabo/rules/no-template-driven-forms": [
      "error",
      {
        "allowedElements": ["ion-searchbar", "ion-segment", "ion-radio-group", "ion-select", "ion-range", "ion-toggle", "ion-checkbox", "ion-input-otp"]
      }
    ]
  }
}
```

### `allowedElements`

- Type : `string[]`
- Valeur par défaut : `[]`

Noms des balises d’éléments autorisés à utiliser `ngModel`. Cette option est destinée aux composants Ionic qui exposent une valeur via `ngModel` par commodité de vue, comme `ion-searchbar` ou `ion-toggle`. Même lorsqu’un élément est autorisé, `ngModelGroup` et `ngForm` restent signalés.

## Quand l’activer

Activez cette règle lorsqu’un projet migre vers Angular Signal Forms mais nécessite encore des liaisons `ngModel` limitées pour certains composants de vue Ionic. Ne la désactivez que si un projet s’engage pleinement dans Reactive Forms et ne prévoit pas d’adopter Signal Forms.

## Voir aussi

- [`@rdlabo/rules/no-reactive-forms`](./no-reactive-forms.md)

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/no-template-driven-forms.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/no-template-driven-forms.ts)
