---
title: "no-reactive-forms"
sourceRevision: "e73d066bf1195ba8807642d0250421327219473a241bbf2937ef868fe60301e3"
---
# @rdlabo/rules/no-reactive-forms

> Interdire Angular Reactive Forms au profit de Signal Forms.

Cette règle aide à migrer d’Angular Reactive Forms vers `@angular/forms/signals`. Reactive Forms nécessite un état modifiable `FormControl` / `FormGroup`, souvent partagé entre composants et services, ce qui rend l’origine des changements difficile à suivre. Signal Forms garde l’état des formulaires dans des Signals ; le graphe de dépendances est donc explicite et réactif par défaut.

Utilisez cette règle pour empêcher l’introduction de nouveau code Reactive Forms pendant l’adoption de Signal Forms.

## Détails de la règle

Cette règle signale trois motifs :

1. **Imports nommés des API Reactive Forms depuis `@angular/forms`**
   Tout import des noms suivants est signalé :

   `AbstractControl`, `FormArray`, `FormArrayName`, `FormBuilder`, `FormControl`, `FormControlDirective`, `FormControlName`, `FormGroup`, `FormGroupDirective`, `FormGroupName`, `FormRecord`, `NonNullableFormBuilder`, `ReactiveFormsModule`, `UntypedFormArray`, `UntypedFormBuilder`, `UntypedFormControl`, `UntypedFormGroup`, `Validators`.

2. **Imports de namespace ou par défaut depuis `@angular/forms`**
   `import * as forms from '@angular/forms'` et `import forms from '@angular/forms'` sont signalés, car ils peuvent contourner les vérifications des API nommées.

3. **Liaisons de modèle Reactive Forms**
   Les liaisons suivantes sont signalées dans les modèles Angular :
   `formControl`, `formControlName`, `formGroup`, `formGroupName`, `formArrayName`.

`FormsModule` et `ngModel` restent volontairement hors du périmètre de cette règle. Utilisez [`@rdlabo/rules/no-template-driven-forms`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-template-driven-forms) pour les restreindre.

## Exemples

### Incorrect

```ts
// TypeScript : import des API Reactive Forms
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import * as forms from '@angular/forms';
const control = new forms.FormControl('');
```

```html
<!-- Modèle : liaisons Reactive Forms -->
<form [formGroup]="userForm">
  <input formControlName="name" />
</form>
```

### Correct

```ts
import { signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';

const userModel = signal({ name: '' });
const userForm = form(userModel, (path) => {
  required(path.name);
});
```

```html
<!-- Modèle : liaison de champ Signal Forms -->
<input [formField]="userForm.name" />
```

## Options

Cette règle n’a pas d’options.

## Quand l’activer

Activez cette règle dans les projets Angular qui ont adopté Signal Forms ou qui migrent depuis Reactive Forms. Vous pouvez l’activer avec `@rdlabo/rules/no-template-driven-forms` pour couvrir les deux styles de formulaires.

## Voir aussi

- [`@rdlabo/rules/no-template-driven-forms`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-template-driven-forms)
- [`@rdlabo/rules/no-component-writable-signal`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-component-writable-signal)

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.1/src/rules/no-reactive-forms.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.1/tests/rules/no-reactive-forms.ts)
