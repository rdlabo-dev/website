---
title: "no-reactive-forms"
sourceRevision: "96444cfdcc19d491565c8f5476942560117d1e84ee132a1b338872d3c0a155a1"
---
# @rdlabo/rules/no-reactive-forms

> Verbietet Angular Reactive Forms zugunsten von Signal Forms.

Diese Regel unterstützt die Migration von Angular Reactive Forms zu `@angular/forms/signals`. Reactive Forms benötigen veränderlichen Zustand in `FormControl` / `FormGroup`, der häufig zwischen Komponenten und Diensten geteilt wird. Dadurch lässt sich der Ursprung von Zustandsänderungen schwerer verfolgen. Signal Forms halten Formularzustand in Signals, sodass der Abhängigkeitsgraph ausdrücklich und standardmäßig reaktiv ist.

Verwenden Sie diese Regel, um neuen Reactive-Forms-Code während der Einführung von Signal Forms zu verhindern.

## Einzelheiten der Regel

Diese Regel meldet drei Muster:

1. **Benannte Imports von Reactive-Forms-APIs aus `@angular/forms`**
   Jeder Import der folgenden Namen wird gemeldet:

   `AbstractControl`, `FormArray`, `FormArrayName`, `FormBuilder`, `FormControl`, `FormControlDirective`, `FormControlName`, `FormGroup`, `FormGroupDirective`, `FormGroupName`, `FormRecord`, `NonNullableFormBuilder`, `ReactiveFormsModule`, `UntypedFormArray`, `UntypedFormBuilder`, `UntypedFormControl`, `UntypedFormGroup`, `Validators`.

2. **Namespace- oder Default-Imports aus `@angular/forms`**
   `import * as forms from '@angular/forms'` und `import forms from '@angular/forms'` werden gemeldet, da sie die Prüfungen benannter APIs umgehen können.

3. **Reactive-Forms-Bindungen im Template**
   Folgende Bindungen werden in Angular-Templates gemeldet:
   `formControl`, `formControlName`, `formGroup`, `formGroupName`, `formArrayName`.

`FormsModule` und `ngModel` liegen bewusst außerhalb des Umfangs dieser Regel. Verwenden Sie zur Einschränkung dieser APIs [`@rdlabo/rules/no-template-driven-forms`](./no-template-driven-forms.md).

## Beispiele

### Inkorrekt

```ts
// TypeScript: Import von Reactive-Forms-APIs
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import * as forms from '@angular/forms';
const control = new forms.FormControl('');
```

```html
<!-- Template: Reactive-Forms-Bindungen -->
<form [formGroup]="userForm">
  <input formControlName="name" />
</form>
```

### Korrekt

```ts
import { signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';

const userModel = signal({ name: '' });
const userForm = form(userModel, (path) => {
  required(path.name);
});
```

```html
<!-- Template: Signal-Forms-Feldbindung -->
<input [formField]="userForm.name" />
```

## Optionen

Diese Regel besitzt keine Optionen.

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel in Angular-Projekten, die Signal Forms übernommen haben oder von Reactive Forms migrieren. Sie lässt sich zusammen mit `@rdlabo/rules/no-template-driven-forms` aktivieren, um beide Formulararten abzudecken.

## Siehe auch

- [`@rdlabo/rules/no-template-driven-forms`](./no-template-driven-forms.md)
- [`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md)

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/no-reactive-forms.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/no-reactive-forms.ts)
