---
title: "Règles"
sourceRevision: "27669712da5a182d81845acddfe966036a2230b920999de8b64a63b9e5203a6e"
---
# Règles

Choisissez un preset pour une politique de départ cohérente, ou activez des règles individuelles. Le [guide de configuration](./configuration.md) fournit des exemples complets pour chaque point d’entrée.

Le package expose 22 règles. « Oui » indique le preset Ionic/Angular `rdlabo.configs.recommended`. « W » indique le preset indépendant du framework `workers/recommended`. « TZ » indique le preset indépendant du framework `workers-timezone/recommended`.

| Règle                                                                                      | Objectif                                                                            | Correction | Preset |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | :-: | :----: |
| [`component-property-use-readonly`](./rules/component-property-use-readonly.md)           | Exiger `readonly` sur les propriétés immuables des composants Angular.                      | Oui |  Oui   |
| [`deny-constructor-di`](./rules/deny-constructor-di.md)                                   | Interdire l’injection de dépendances par constructeur. Obsolète au profit de `inject()`.      | Non  |   Non   |
| [`deny-element`](./rules/deny-element.md)                                                 | Rejeter des éléments HTML configurés, comme les superpositions Ionic intégrées.                    | Non  |  Oui   |
| [`deny-overlay-create`](./rules/deny-overlay-create.md)                                   | Interdire les appels directs à `.create()` sur les contrôleurs de modales et de popovers.                | Non  |  Oui   |
| [`deny-soft-private-modifier`](./rules/deny-soft-private-modifier.md)                     | Remplacer `private` de TypeScript par des champs privés stricts `#`.                         | Oui |  Oui   |
| [`implements-ionic-lifecycle`](./rules/implements-ionic-lifecycle.md)                     | Exiger l’interface correspondante pour les méthodes de cycle de vie Angular et Ionic.            | Oui |  Oui   |
| [`initialize-timezone-at-module-scope`](./rules/initialize-timezone-at-module-scope.md)   | Garder l’initialisation workers-timezone à un emplacement clair au niveau du module.               | Non  |   TZ   |
| [`ionic-attr-type-check`](./rules/ionic-attr-type-check.md)                               | Exiger la liaison de propriété pour les attributs Ionic non textuels.                          | Oui |  Oui   |
| [`no-component-method-except-lifecycle`](./rules/no-component-method-except-lifecycle.md) | Garder les méthodes arbitraires hors des composants Angular.                                  | Non  |  Oui   |
| [`no-component-writable-signal`](./rules/no-component-writable-signal.md)                 | Garder l’état modifiable des composants dans un ViewModel, avec une exception pour les modèles Signal Forms. | Non  |   Non   |
| [`no-implicit-timezone`](./rules/no-implicit-timezone.md)                                 | Empêcher l’usage implicite du fuseau de l’hôte dans les API Date et Intl.                 | Non  |   TZ   |
| [`no-reactive-forms`](./rules/no-reactive-forms.md)                                       | Interdire Reactive Forms au profit d’Angular Signal Forms.                          | Non  |   Non   |
| [`no-template-driven-forms`](./rules/no-template-driven-forms.md)                         | Interdire les formulaires pilotés par modèle, sauf pour les éléments d’interopérabilité configurés.        | Non  |   Non   |
| [`prefer-disable-handler`](./rules/prefer-disable-handler.md)                             | Envelopper les gestionnaires d’événements configurés pour prévenir les actions asynchrones en double.                 | Non  |  Oui   |
| [`prefer-ionic-standalone`](./rules/prefer-ionic-standalone.md)                           | Préférer les imports standalone Ionic 9 et interdire `IonicModule`.                      | Oui |  Oui   |
| [`prefer-modal-launcher`](./rules/prefer-modal-launcher.md)                               | Limiter les appels à `presentModal` aux fonctions `launch*`.                              | Non  |  Oui   |
| [`require-ion-error-text`](./rules/require-ion-error-text.md)                             | Exiger les messages d’erreur Ionic sur les contrôles de validation.                                   | Non  |  Oui   |
| [`require-ion-item-group`](./rules/require-ion-item-group.md)                             | Exiger le regroupement des éléments de listes Ionic pour iOS 26 et Material Design 3.                 | Oui |  Oui   |
| [`require-viewmodel`](./rules/require-viewmodel.md)                                       | Imposer la responsabilité des composants et la séparation `ViewModelStore`.                     | Non  |  Oui   |
| [`restrict-try-block`](./rules/restrict-try-block.md)                                     | Garder les blocs `try` courts et exclure les contextes Promise, RxJS et Signal selon la politique.  | Non  | Oui, W |
| [`signal-use-as-signal-template`](./rules/signal-use-as-signal-template.md)               | Exiger `()` lors de la lecture de Signals Angular dans les modèles.                            | Non  |  Oui   |
| [`signal-use-as-signal`](./rules/signal-use-as-signal.md)                                 | Exiger des lectures et écritures correctes des Signals dans TypeScript.                             | Oui |  Oui   |

## Documentation des règles

Chaque page de règle de cette documentation contient les options et des exemples corrects et incorrects.

## Règles fondées sur les types

Activez `parserOptions.projectService` pour les règles qui inspectent les types TypeScript. Sans informations de types, `restrict-try-block` effectue encore les vérifications syntaxiques, mais omet la détection de Promise et RxJS dépendante des types. `no-implicit-timezone` nécessite les informations de types. `initialize-timezone-at-module-scope` est purement syntaxique et n’a pas besoin de ces informations.
