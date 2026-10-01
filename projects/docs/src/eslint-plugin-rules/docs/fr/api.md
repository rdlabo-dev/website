---
title: "API"
sourceRevision: "fdb452ac0c028a7ba6a73d252e10cd4430ed46da42c7c77f912d8838411a5c22"
---
Interface publique du plugin `@rdlabo/eslint-plugin-rules` v22.1.0. Les options détaillées et les exemples figurent sur chaque page de règle.

## Module

#### `module` @rdlabo/eslint-plugin-rules

| Export        | Description                                  |
| ------------- | -------------------------------------------- |
| **`rules`**   | Toutes les implémentations de règles, indexées par nom de règle. |
| **`configs`** | Configurations partageables du plugin.             |

## Règles

#### `rule` Rule set

| Groupe                | Règles                                                                                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Séparation des responsabilités des composants | `component-property-use-readonly`, `deny-constructor-di`, `deny-soft-private-modifier`, `no-component-method-except-lifecycle`, `no-component-writable-signal`, `require-viewmodel` |
| API Ionic           | `deny-element`, `deny-overlay-create`, `implements-ionic-lifecycle`, `ionic-attr-type-check`, `prefer-disable-handler`, `prefer-ionic-standalone`, `prefer-modal-launcher`, `require-ion-error-text`, `require-ion-item-group` |
| Formulaires et Signals    | `no-reactive-forms`, `no-template-driven-forms`, `signal-use-as-signal`, `signal-use-as-signal-template`                                                                            |
| Flux de contrôle         | `restrict-try-block`                                                                                                                                                                |

## Règles Workers de fuseaux horaires

`no-implicit-timezone`, `initialize-timezone-at-module-scope`
