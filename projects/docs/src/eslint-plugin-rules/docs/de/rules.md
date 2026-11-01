---
title: "Regeln"
sourceRevision: "8f305c99ed253ab51272e68d95e0de9d892480b6bb926f51be545cc5a99bce70"
---
# Regeln

Wählen Sie ein Preset als zusammenhängende Ausgangsrichtlinie oder aktivieren Sie einzelne Regeln. Die [Konfigurationsanleitung](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration) liefert vollständige Einrichtungsbeispiele für jeden Einstiegspunkt.

Das Paket stellt 22 Regeln bereit. „Ja“ kennzeichnet das Ionic-/Angular-Preset `rdlabo.configs.recommended`. „W“ kennzeichnet das frameworkunabhängige Preset `workers/recommended`. „TZ“ kennzeichnet das frameworkunabhängige Preset `workers-timezone/recommended`.

| Regel                                                                                      | Zweck                                                                            | Korrektur | Voreinstellung |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | :-: | :----: |
| [`component-property-use-readonly`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/component-property-use-readonly)           | Verlangt `readonly` für unveränderliche Angular-Komponentenproperties.                      | Ja |  Ja   |
| [`deny-constructor-di`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/deny-constructor-di)                                   | Verbietet Dependency Injection im Konstruktor. Zugunsten von `inject()` veraltet.      | Nein  |   Nein   |
| [`deny-element`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/deny-element)                                                 | Weist konfigurierte HTML-Elemente wie Inline-Ionic-Overlays zurück.                    | Nein  |  Ja   |
| [`deny-overlay-create`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/deny-overlay-create)                                   | Verbietet direkte `.create()`-Aufrufe an Modal- und Popover-Controllern.                | Nein  |  Ja   |
| [`deny-soft-private-modifier`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/deny-soft-private-modifier)                     | Ersetzt TypeScript-`private` durch tatsächlich private `#`-Felder.                         | Ja |  Ja   |
| [`implements-ionic-lifecycle`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/implements-ionic-lifecycle)                     | Verlangt das passende Interface für Angular- und Ionic-Lebenszyklusmethoden.            | Ja |  Ja   |
| [`initialize-timezone-at-module-scope`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/initialize-timezone-at-module-scope)   | Hält die workers-timezone-Initialisierung an einer eindeutigen Stelle auf Modulebene.               | Nein  |   TZ   |
| [`ionic-attr-type-check`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/ionic-attr-type-check)                               | Verlangt Property-Binding für nicht als Zeichenfolge vorliegende Ionic-Attribute.                          | Ja |  Ja   |
| [`no-component-method-except-lifecycle`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-component-method-except-lifecycle) | Hält beliebige Methoden aus Angular-Komponenten heraus.                                  | Nein  |  Ja   |
| [`no-component-writable-signal`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-component-writable-signal)                 | Hält veränderlichen Komponentenzustand in einem ViewModel, mit einer Ausnahme für Signal-Forms-Modelle. | Nein  |   Nein   |
| [`no-implicit-timezone`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-implicit-timezone)                                 | Verhindert implizites Host-Zeitzonenverhalten in Date- und Intl-APIs.                 | Nein  |   TZ   |
| [`no-reactive-forms`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-reactive-forms)                                       | Verbietet Reactive Forms zugunsten von Angular Signal Forms.                          | Nein  |   Nein   |
| [`no-template-driven-forms`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-template-driven-forms)                         | Verbietet templategesteuerte Formulare außer für konfigurierte Interoperabilitätselemente.        | Nein  |   Nein   |
| [`prefer-disable-handler`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/prefer-disable-handler)                             | Umschließt konfigurierte Ereignishandler, um doppelte asynchrone Aktionen zu verhindern.                 | Nein  |  Ja   |
| [`prefer-ionic-standalone`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/prefer-ionic-standalone)                           | Bevorzugt Ionic-9-Standalone-Imports und verbietet `IonicModule`.                      | Ja |  Ja   |
| [`prefer-modal-launcher`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/prefer-modal-launcher)                               | Beschränkt `presentModal`-Aufrufe auf `launch*`-Funktionen.                              | Nein  |  Ja   |
| [`require-ion-error-text`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/require-ion-error-text)                             | Verlangt Ionic-Fehlertext an Validierungsbedienelementen.                                   | Nein  |  Ja   |
| [`require-ion-item-group`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/require-ion-item-group)                             | Verlangt gruppierte Ionic-Listenelemente für iOS 26 und Material Design 3.                 | Ja |  Ja   |
| [`require-viewmodel`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/require-viewmodel)                                       | Erzwingt die Zuständigkeit von Komponenten und die Grenze des `ViewModelStore`.                     | Nein  |  Ja   |
| [`restrict-try-block`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/restrict-try-block)                                     | Hält `try`-Blöcke klein und schließt Promise-, RxJS- und Signal-Kontexte entsprechend der Richtlinie aus.  | Nein  | Ja, W |
| [`signal-use-as-signal-template`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/signal-use-as-signal-template)               | Verlangt `()` beim Lesen von Angular-Signals in Templates.                            | Nein  |  Ja   |
| [`signal-use-as-signal`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/signal-use-as-signal)                                 | Verlangt korrekte Signal-Lese- und Schreibzugriffe in TypeScript.                             | Ja |  Ja   |

## Regeldokumentation

Jede Regelseite dieser Dokumentation enthält Optionen sowie korrekte und inkorrekte Beispiele.

## Typgestützte Regeln

Aktivieren Sie `parserOptions.projectService` für Regeln, die TypeScript-Typen prüfen. Ohne typgestütztes Linting führt `restrict-try-block` weiterhin Syntaxprüfungen aus, überspringt jedoch die typabhängige Promise- und RxJS-Erkennung. `no-implicit-timezone` benötigt typgestütztes Linting. `initialize-timezone-at-module-scope` ist rein syntaktisch und benötigt keine Typinformationen.
