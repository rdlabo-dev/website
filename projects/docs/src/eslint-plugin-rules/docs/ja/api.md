---
title: API
---

`@rdlabo/eslint-plugin-rules` v22.1.0 のpublic plugin surfaceです。詳細なoptionと例は各Ruleページにあります。

## Module

#### `module` @rdlabo/eslint-plugin-rules

| Export        | Description                       |
| ------------- | --------------------------------- |
| **`rules`**   | Rule名をkeyにした全Rule実装です。 |
| **`configs`** | 共有可能なPlugin設定です。        |

## Rule

#### `rule` Rule set

| Group         | Rules                                                                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component境界 | `component-property-use-readonly`, `deny-constructor-di`, `deny-soft-private-modifier`, `no-component-method-except-lifecycle`, `no-component-writable-signal`, `require-viewmodel` |
| Ionic API     | `deny-element`, `deny-overlay-create`, `implements-ionic-lifecycle`, `ionic-attr-type-check`, `prefer-disable-handler`, `prefer-ionic-standalone`, `prefer-modal-launcher`, `require-ion-error-text`, `require-ion-item-group` |
| Form・Signal  | `no-reactive-forms`, `no-template-driven-forms`, `signal-use-as-signal`, `signal-use-as-signal-template`                                                                            |
| Control flow  | `restrict-try-block`                                                                                                                                                                |

## Workersのタイムゾーンルール

`no-implicit-timezone`, `initialize-timezone-at-module-scope`
