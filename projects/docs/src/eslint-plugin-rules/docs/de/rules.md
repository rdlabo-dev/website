---
title: "Regeln"
sourceRevision: "27669712da5a182d81845acddfe966036a2230b920999de8b64a63b9e5203a6e"
---
# Regeln

Wählen Sie ein Preset als zusammenhängende Ausgangsrichtlinie oder aktivieren Sie einzelne Regeln. Die [Konfigurationsanleitung](./configuration.md) liefert vollständige Einrichtungsbeispiele für jeden Einstiegspunkt.

Das Paket stellt 22 Regeln bereit. „Ja“ kennzeichnet das Ionic-/Angular-Preset `rdlabo.configs.recommended`. „W“ kennzeichnet das frameworkunabhängige Preset `workers/recommended`. „TZ“ kennzeichnet das frameworkunabhängige Preset `workers-timezone/recommended`.

| Regel                                                                                      | Zweck                                                                            | Korrektur | Voreinstellung |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | :-: | :----: |
| [`component-property-use-readonly`](./rules/component-property-use-readonly.md)           | Verlangt `readonly` für unveränderliche Angular-Komponentenproperties.                      | Ja |  Ja   |
| [`deny-constructor-di`](./rules/deny-constructor-di.md)                                   | Verbietet Dependency Injection im Konstruktor. Zugunsten von `inject()` veraltet.      | Nein  |   Nein   |
| [`deny-element`](./rules/deny-element.md)                                                 | Weist konfigurierte HTML-Elemente wie Inline-Ionic-Overlays zurück.                    | Nein  |  Ja   |
| [`deny-overlay-create`](./rules/deny-overlay-create.md)                                   | Verbietet direkte `.create()`-Aufrufe an Modal- und Popover-Controllern.                | Nein  |  Ja   |
| [`deny-soft-private-modifier`](./rules/deny-soft-private-modifier.md)                     | Ersetzt TypeScript-`private` durch tatsächlich private `#`-Felder.                         | Ja |  Ja   |
| [`implements-ionic-lifecycle`](./rules/implements-ionic-lifecycle.md)                     | Verlangt das passende Interface für Angular- und Ionic-Lebenszyklusmethoden.            | Ja |  Ja   |
| [`initialize-timezone-at-module-scope`](./rules/initialize-timezone-at-module-scope.md)   | Hält die workers-timezone-Initialisierung an einer eindeutigen Stelle auf Modulebene.               | Nein  |   TZ   |
| [`ionic-attr-type-check`](./rules/ionic-attr-type-check.md)                               | Verlangt Property-Binding für nicht als Zeichenfolge vorliegende Ionic-Attribute.                          | Ja |  Ja   |
| [`no-component-method-except-lifecycle`](./rules/no-component-method-except-lifecycle.md) | Hält beliebige Methoden aus Angular-Komponenten heraus.                                  | Nein  |  Ja   |
| [`no-component-writable-signal`](./rules/no-component-writable-signal.md)                 | Hält veränderlichen Komponentenzustand in einem ViewModel, mit einer Ausnahme für Signal-Forms-Modelle. | Nein  |   Nein   |
| [`no-implicit-timezone`](./rules/no-implicit-timezone.md)                                 | Verhindert implizites Host-Zeitzonenverhalten in Date- und Intl-APIs.                 | Nein  |   TZ   |
| [`no-reactive-forms`](./rules/no-reactive-forms.md)                                       | Verbietet Reactive Forms zugunsten von Angular Signal Forms.                          | Nein  |   Nein   |
| [`no-template-driven-forms`](./rules/no-template-driven-forms.md)                         | Verbietet templategesteuerte Formulare außer für konfigurierte Interoperabilitätselemente.        | Nein  |   Nein   |
| [`prefer-disable-handler`](./rules/prefer-disable-handler.md)                             | Umschließt konfigurierte Ereignishandler, um doppelte asynchrone Aktionen zu verhindern.                 | Nein  |  Ja   |
| [`prefer-ionic-standalone`](./rules/prefer-ionic-standalone.md)                           | Bevorzugt Ionic-9-Standalone-Imports und verbietet `IonicModule`.                      | Ja |  Ja   |
| [`prefer-modal-launcher`](./rules/prefer-modal-launcher.md)                               | Beschränkt `presentModal`-Aufrufe auf `launch*`-Funktionen.                              | Nein  |  Ja   |
| [`require-ion-error-text`](./rules/require-ion-error-text.md)                             | Verlangt Ionic-Fehlertext an Validierungsbedienelementen.                                   | Nein  |  Ja   |
| [`require-ion-item-group`](./rules/require-ion-item-group.md)                             | Verlangt gruppierte Ionic-Listenelemente für iOS 26 und Material Design 3.                 | Ja |  Ja   |
| [`require-viewmodel`](./rules/require-viewmodel.md)                                       | Erzwingt die Zuständigkeit von Komponenten und die Grenze des `ViewModelStore`.                     | Nein  |  Ja   |
| [`restrict-try-block`](./rules/restrict-try-block.md)                                     | Hält `try`-Blöcke klein und schließt Promise-, RxJS- und Signal-Kontexte entsprechend der Richtlinie aus.  | Nein  | Ja, W |
| [`signal-use-as-signal-template`](./rules/signal-use-as-signal-template.md)               | Verlangt `()` beim Lesen von Angular-Signals in Templates.                            | Nein  |  Ja   |
| [`signal-use-as-signal`](./rules/signal-use-as-signal.md)                                 | Verlangt korrekte Signal-Lese- und Schreibzugriffe in TypeScript.                             | Ja |  Ja   |

## Regeldokumentation

Jede Regelseite dieser Dokumentation enthält Optionen sowie korrekte und inkorrekte Beispiele.

## Typgestützte Regeln

Aktivieren Sie `parserOptions.projectService` für Regeln, die TypeScript-Typen prüfen. Ohne typgestütztes Linting führt `restrict-try-block` weiterhin Syntaxprüfungen aus, überspringt jedoch die typabhängige Promise- und RxJS-Erkennung. `no-implicit-timezone` benötigt typgestütztes Linting. `initialize-timezone-at-module-scope` ist rein syntaktisch und benötigt keine Typinformationen.
