---
title: "Règles"
sourceRevision: "8f305c99ed253ab51272e68d95e0de9d892480b6bb926f51be545cc5a99bce70"
---
# Règles

Choisissez un preset pour une politique de départ cohérente, ou activez des règles individuelles. Le [guide de configuration](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration) fournit des exemples complets pour chaque point d’entrée.

Le package expose 22 règles. « Oui » indique le preset Ionic/Angular `rdlabo.configs.recommended`. « W » indique le preset indépendant du framework `workers/recommended`. « TZ » indique le preset indépendant du framework `workers-timezone/recommended`.

| Règle                                                                                      | Objectif                                                                            | Correction | Preset |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | :-: | :----: |
| [`component-property-use-readonly`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/component-property-use-readonly)           | Exiger `readonly` sur les propriétés immuables des composants Angular.                      | Oui |  Oui   |
| [`deny-constructor-di`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/deny-constructor-di)                                   | Interdire l’injection de dépendances par constructeur. Obsolète au profit de `inject()`.      | Non  |   Non   |
| [`deny-element`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/deny-element)                                                 | Rejeter des éléments HTML configurés, comme les superpositions Ionic intégrées.                    | Non  |  Oui   |
| [`deny-overlay-create`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/deny-overlay-create)                                   | Interdire les appels directs à `.create()` sur les contrôleurs de modales et de popovers.                | Non  |  Oui   |
| [`deny-soft-private-modifier`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/deny-soft-private-modifier)                     | Remplacer `private` de TypeScript par des champs privés stricts `#`.                         | Oui |  Oui   |
| [`implements-ionic-lifecycle`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/implements-ionic-lifecycle)                     | Exiger l’interface correspondante pour les méthodes de cycle de vie Angular et Ionic.            | Oui |  Oui   |
| [`initialize-timezone-at-module-scope`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/initialize-timezone-at-module-scope)   | Garder l’initialisation workers-timezone à un emplacement clair au niveau du module.               | Non  |   TZ   |
| [`ionic-attr-type-check`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/ionic-attr-type-check)                               | Exiger la liaison de propriété pour les attributs Ionic non textuels.                          | Oui |  Oui   |
| [`no-component-method-except-lifecycle`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-component-method-except-lifecycle) | Garder les méthodes arbitraires hors des composants Angular.                                  | Non  |  Oui   |
| [`no-component-writable-signal`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-component-writable-signal)                 | Garder l’état modifiable des composants dans un ViewModel, avec une exception pour les modèles Signal Forms. | Non  |   Non   |
| [`no-implicit-timezone`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-implicit-timezone)                                 | Empêcher l’usage implicite du fuseau de l’hôte dans les API Date et Intl.                 | Non  |   TZ   |
| [`no-reactive-forms`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-reactive-forms)                                       | Interdire Reactive Forms au profit d’Angular Signal Forms.                          | Non  |   Non   |
| [`no-template-driven-forms`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-template-driven-forms)                         | Interdire les formulaires pilotés par modèle, sauf pour les éléments d’interopérabilité configurés.        | Non  |   Non   |
| [`prefer-disable-handler`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/prefer-disable-handler)                             | Envelopper les gestionnaires d’événements configurés pour prévenir les actions asynchrones en double.                 | Non  |  Oui   |
| [`prefer-ionic-standalone`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/prefer-ionic-standalone)                           | Préférer les imports standalone Ionic 9 et interdire `IonicModule`.                      | Oui |  Oui   |
| [`prefer-modal-launcher`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/prefer-modal-launcher)                               | Limiter les appels à `presentModal` aux fonctions `launch*`.                              | Non  |  Oui   |
| [`require-ion-error-text`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/require-ion-error-text)                             | Exiger les messages d’erreur Ionic sur les contrôles de validation.                                   | Non  |  Oui   |
| [`require-ion-item-group`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/require-ion-item-group)                             | Exiger le regroupement des éléments de listes Ionic pour iOS 26 et Material Design 3.                 | Oui |  Oui   |
| [`require-viewmodel`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/require-viewmodel)                                       | Imposer la responsabilité des composants et la séparation `ViewModelStore`.                     | Non  |  Oui   |
| [`restrict-try-block`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/restrict-try-block)                                     | Garder les blocs `try` courts et exclure les contextes Promise, RxJS et Signal selon la politique.  | Non  | Oui, W |
| [`signal-use-as-signal-template`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/signal-use-as-signal-template)               | Exiger `()` lors de la lecture de Signals Angular dans les modèles.                            | Non  |  Oui   |
| [`signal-use-as-signal`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/signal-use-as-signal)                                 | Exiger des lectures et écritures correctes des Signals dans TypeScript.                             | Oui |  Oui   |

## Documentation des règles

Chaque page de règle de cette documentation contient les options et des exemples corrects et incorrects.

## Règles fondées sur les types

Activez `parserOptions.projectService` pour les règles qui inspectent les types TypeScript. Sans informations de types, `restrict-try-block` effectue encore les vérifications syntaxiques, mais omet la détection de Promise et RxJS dépendante des types. `no-implicit-timezone` nécessite les informations de types. `initialize-timezone-at-module-scope` est purement syntaxique et n’a pas besoin de ces informations.
