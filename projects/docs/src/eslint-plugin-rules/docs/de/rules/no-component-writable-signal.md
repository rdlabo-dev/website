---
title: "no-component-writable-signal"
sourceRevision: "33dc0d0718b1f568596cd52600d5b2340c60ec7a0c9d64f9e5ea7a74155195df"
---
# @rdlabo/rules/no-component-writable-signal

> Hält veränderlichen Komponentenzustand im ViewModel, außer Modellen für `form()` von Angular Signal Forms.

Diese Regel erzwingt eine klare Grenze zwischen Angular-Komponenten und ViewModels. Komponenten sollten Templates schreibgeschützten abgeleiteten Zustand bereitstellen. Veränderlicher Zustand sollte in einem ViewModel liegen, damit Änderungen zentralisiert und testbar sind. Das einzige erlaubte veränderliche Signal einer Komponente ist eines, das direkt als Modell an `form()` von Signal Forms übergeben wird.

## Einzelheiten der Regel

Diese Regel untersucht mit `@Component` dekorierte Klassen und meldet Klassenproperties, die mit `signal()` oder `linkedSignal()` aus `@angular/core` initialisiert werden, außer dieselbe Property wird als erstes Argument an `form()` aus `@angular/forms/signals` übergeben.

- `computed()` und `effect()` bleiben Aufgaben der Komponente und werden nicht gemeldet.
- Klassen, die keine Komponenten sind, werden ignoriert.
- Alias- und Namespace-Imports aus `@angular/core` und `@angular/forms/signals` werden erkannt.
- Gleichnamige lokale Hilfsfunktionen werden ignoriert, da die Regel die Herkunft des Imports prüft.

Die Signal-Forms-Ausnahme erkennt nur einen Komponentenproperty-Initialisierer wie `readonly pageForm = form(this.model)`. Wird das Signal innerhalb einer Methode an `form()` übergeben, entsteht keine Ausnahme; die veränderliche Signal-Property wird daher weiterhin gemeldet.

## Beispiele

### Inkorrekt

```ts
import { Component, signal } from '@angular/core';

@Component({ template: '' })
class Page {
  readonly isLoading = signal(false); // Wird gemeldet: In das ViewModel verschieben
}
```

```ts
import { Component, signal } from '@angular/core';
import { form } from '@angular/forms/signals';

@Component({ template: '' })
class Page {
  readonly model = signal({ name: '' });
  readonly loading = signal(false); // Wird gemeldet
  readonly pageForm = form(this.model);
}
```

### Korrekt

```ts
import { Component, computed } from '@angular/core';
import { form } from '@angular/forms/signals';
import { PageViewModel } from './page.viewmodel';

@Component({ template: '' })
class Page {
  private readonly vm = new PageViewModel(this);
  readonly isLoading = this.vm.isLoading; // Schreibgeschützte Ansicht des ViewModel-Zustands
  readonly model = this.vm.model;
  readonly pageForm = form(this.model);
  readonly title = computed(() => this.model().name);
}
```

```ts
import { Component, signal as writable } from '@angular/core';
import { form as signalForm } from '@angular/forms/signals';

@Component({ template: '' })
class Page {
  readonly data = writable({ name: '' });
  readonly pageForm = signalForm(this.data); // data ist das Signal-Forms-Modell
}
```

## Optionen

Diese Regel besitzt keine Optionen.

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel, wenn Ihr Projekt das ViewModel-Muster mit `@rdlabo/rules/require-viewmodel` verwendet. Sie stellt sicher, dass Komponentenproperties schreibgeschützte Sichten auf gemeinsamen Zustand sind, und verhindert direkte Zustandsänderungen durch Komponenten.

## Siehe auch

- [`@rdlabo/rules/require-viewmodel`](./require-viewmodel.md)
- [`@rdlabo/rules/no-reactive-forms`](./no-reactive-forms.md)

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/no-component-writable-signal.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/no-component-writable-signal.ts)
