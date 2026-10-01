---
title: "API"
sourceRevision: "fdb452ac0c028a7ba6a73d252e10cd4430ed46da42c7c77f912d8838411a5c22"
---
Öffentliche Plugin-Schnittstelle für `@rdlabo/eslint-plugin-rules` v22.1.0. Ausführliche Optionen und Beispiele finden Sie auf den jeweiligen Regelseiten.

## Modul

#### `module` @rdlabo/eslint-plugin-rules

| Export        | Beschreibung                                  |
| ------------- | -------------------------------------------- |
| **`rules`**   | Alle Regelimplementierungen mit dem Regelnamen als Schlüssel. |
| **`configs`** | Wiederverwendbare Plugin-Konfigurationen.             |

## Regeln

#### `rule` Rule set

| Gruppe                | Regeln                                                                                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Komponentengrenzen | `component-property-use-readonly`, `deny-constructor-di`, `deny-soft-private-modifier`, `no-component-method-except-lifecycle`, `no-component-writable-signal`, `require-viewmodel` |
| Ionic-APIs           | `deny-element`, `deny-overlay-create`, `implements-ionic-lifecycle`, `ionic-attr-type-check`, `prefer-disable-handler`, `prefer-ionic-standalone`, `prefer-modal-launcher`, `require-ion-error-text`, `require-ion-item-group` |
| Formulare und Signals    | `no-reactive-forms`, `no-template-driven-forms`, `signal-use-as-signal`, `signal-use-as-signal-template`                                                                            |
| Kontrollfluss         | `restrict-try-block`                                                                                                                                                                |

## Workers-Zeitzonenregeln

`no-implicit-timezone`, `initialize-timezone-at-module-scope`
