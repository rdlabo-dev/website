---
title: Rules
---

The package exposes 22 rules. “Yes” marks the Ionic/Angular `rdlabo.configs.recommended` preset. “TZ” marks the framework-independent `workers-timezone/recommended` preset.

| Rule | Purpose | Fix | Preset |
| --- | --- | :-: | :-: |
| [`component-property-use-readonly`](/eslint-plugin-rules/docs/rules/component-property-use-readonly) | Require `readonly` on immutable Angular component properties. | Yes | Yes |
| [`deny-constructor-di`](/eslint-plugin-rules/docs/rules/deny-constructor-di) | Disallow constructor dependency injection. Deprecated in favor of `inject()`. | No | No |
| [`deny-element`](/eslint-plugin-rules/docs/rules/deny-element) | Reject configured HTML elements, such as inline Ionic overlays. | No | Yes |
| [`deny-overlay-create`](/eslint-plugin-rules/docs/rules/deny-overlay-create) | Disallow direct `.create()` calls on modal and popover controllers. | No | Yes |
| [`deny-soft-private-modifier`](/eslint-plugin-rules/docs/rules/deny-soft-private-modifier) | Replace TypeScript `private` with hard-private `#` fields. | Yes | Yes |
| [`implements-ionic-lifecycle`](/eslint-plugin-rules/docs/rules/implements-ionic-lifecycle) | Require the matching interface for Angular and Ionic lifecycle methods. | Yes | Yes |
| [`initialize-timezone-at-module-scope`](/eslint-plugin-rules/docs/rules/initialize-timezone-at-module-scope) | Keep workers-timezone initialization at one clear module-level site. | No | TZ |
| [`ionic-attr-type-check`](/eslint-plugin-rules/docs/rules/ionic-attr-type-check) | Require property binding for non-string Ionic attributes. | Yes | Yes |
| [`no-component-method-except-lifecycle`](/eslint-plugin-rules/docs/rules/no-component-method-except-lifecycle) | Keep arbitrary methods out of Angular components. | No | Yes |
| [`no-component-writable-signal`](/eslint-plugin-rules/docs/rules/no-component-writable-signal) | Keep writable component state in a ViewModel. | No | No |
| [`no-implicit-timezone`](/eslint-plugin-rules/docs/rules/no-implicit-timezone) | Prevent implicit host-timezone behavior across Date and Intl APIs. | No | TZ |
| [`no-reactive-forms`](/eslint-plugin-rules/docs/rules/no-reactive-forms) | Disallow Reactive Forms in favor of Angular Signal Forms. | No | No |
| [`no-template-driven-forms`](/eslint-plugin-rules/docs/rules/no-template-driven-forms) | Disallow template-driven forms except configured interoperability elements. | No | No |
| [`prefer-disable-handler`](/eslint-plugin-rules/docs/rules/prefer-disable-handler) | Wrap configured event handlers to prevent duplicate async actions. | No | Yes |
| [`prefer-ionic-standalone`](/eslint-plugin-rules/docs/rules/prefer-ionic-standalone) | Prefer Ionic standalone imports and disallow `IonicModule`. | Yes | Yes |
| [`prefer-modal-launcher`](/eslint-plugin-rules/docs/rules/prefer-modal-launcher) | Restrict `presentModal` calls to `launch*` functions. | No | Yes |
| [`require-ion-error-text`](/eslint-plugin-rules/docs/rules/require-ion-error-text) | Require an errorText source on Ionic Signal Forms validation controls. | No | Yes |
| [`require-ion-item-group`](/eslint-plugin-rules/docs/rules/require-ion-item-group) | Require grouped Ionic list items for iOS 26 and Material Design 3. | Yes | Yes |
| [`require-viewmodel`](/eslint-plugin-rules/docs/rules/require-viewmodel) | Enforce component ownership and the `ViewModelStore` boundary. | No | Yes |
| [`restrict-try-block`](/eslint-plugin-rules/docs/rules/restrict-try-block) | Keep `try` blocks small and exclude Promise, RxJS, and Signal contexts by policy. | No | Yes / Workers |
| [`signal-use-as-signal-template`](/eslint-plugin-rules/docs/rules/signal-use-as-signal-template) | Require `()` when reading Angular Signals in templates. | No | Yes |
| [`signal-use-as-signal`](/eslint-plugin-rules/docs/rules/signal-use-as-signal) | Require correct Signal reads and writes in TypeScript. | Yes | Yes |

## Typed rules

Enable `parserOptions.projectService` for rules that inspect TypeScript types. `no-implicit-timezone` requires typed linting so unrelated objects with Date-like method names are not reported.
