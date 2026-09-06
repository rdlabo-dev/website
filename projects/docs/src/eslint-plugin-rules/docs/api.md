---
title: API
---

Public plugin surface for `@rdlabo/eslint-plugin-rules` v22.1.0. Detailed options and examples are available on each rule page.

## Module

#### `module` @rdlabo/eslint-plugin-rules

| Export        | Description                                  |
| ------------- | -------------------------------------------- |
| **`rules`**   | All rule implementations keyed by rule name. |
| **`configs`** | Shareable plugin configurations.             |

## Rules

#### `rule` Rule set

| Group                | Rules                                                                                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component boundaries | `component-property-use-readonly`, `deny-constructor-di`, `deny-soft-private-modifier`, `no-component-method-except-lifecycle`, `no-component-writable-signal`, `require-viewmodel` |
| Ionic APIs           | `deny-element`, `deny-overlay-create`, `implements-ionic-lifecycle`, `ionic-attr-type-check`, `prefer-disable-handler`, `prefer-ionic-standalone`, `prefer-modal-launcher`, `require-ion-error-text`, `require-ion-item-group` |
| Forms and signals    | `no-reactive-forms`, `no-template-driven-forms`, `signal-use-as-signal`, `signal-use-as-signal-template`                                                                            |
| Control flow         | `restrict-try-block`                                                                                                                                                                |

## Workers timezone rules

`no-implicit-timezone`, `initialize-timezone-at-module-scope`
