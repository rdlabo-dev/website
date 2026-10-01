---
title: "Vérifier l’intégration du kit avec ESLint"
sourceRevision: "621cfef57d9f6b603d1075c99817d1188aa4668c85888ef1d43096f94e106dfb"
---
Assurez la cohérence des lanceurs de fenêtres modales, des gestionnaires d’actions asynchrones et des erreurs de formulaire à mesure que votre application Ionic Angular évolue. `@rdlabo/eslint-plugin-rules` vérifie les formes d’appel compatibles avec `@rdlabo/ionic-angular-kit`.

## Activer les contrôles utilisés

Dans une application Ionic Angular 9 où Angular / Angular ESLint 21–22 est configuré :

```sh
npm install --save-dev @rdlabo/eslint-plugin-rules@22
```

Ajoutez ces entrées à `eslint.config.mjs` en conservant vos contrôles existants. Elles activent quatre règles ciblées ; choisissez celles qui correspondent aux fonctions du kit utilisées dans votre application.

```js
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules';

export default tseslint.config(
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    processor: angular.processInlineTemplates,
    plugins: { '@rdlabo/rules': rdlabo },
    rules: {
      '@rdlabo/rules/deny-overlay-create': 'error',
      '@rdlabo/rules/prefer-modal-launcher': 'error',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angular.templateParser },
    plugins: { '@rdlabo/rules': rdlabo },
    rules: {
      '@rdlabo/rules/prefer-disable-handler': 'error',
      '@rdlabo/rules/require-ion-error-text': 'error',
    },
  },
);
```

Ces règles sont également incluses dans `rdlabo.configs.recommended`.

## Créer les fenêtres modales dans un lanceur

`deny-overlay-create` signale les appels `.create()` sur `ModalController` et `PopoverController`. `prefer-modal-launcher` vérifie que les appels à `presentModal` se trouvent dans des fonctions `launch*`.

Avec `overlay` et `DetailPage` issus de votre [configuration des overlays](./storage-overlays.md), le code suivant est signalé :

```ts
export const openDetail = () => overlay.presentModal(DetailPage);
```

Utilisez un lanceur :

```ts
export const launchDetail = () => overlay.presentModal(DetailPage);
```

## Encapsuler les actions asynchrones

`prefer-disable-handler` signale une action non encapsulée :

```html
<ion-button type="button" (click)="vm.refresh()">Refresh</ion-button>
```

Exposez l’utilitaire `disableHandler` du kit dans votre composant ou ViewModel, puis transmettez-lui l’événement et le travail asynchrone :

```ts
import { disableHandler } from '@rdlabo/ionic-angular-kit';

// Dans le composant ou le ViewModel :
readonly disableHandler = disableHandler;
```

```html
<ion-button type="button" (click)="vm.disableHandler($event, vm.refresh())">Refresh</ion-button>
```

La règle vérifie l’appel d’encapsulation, pas le comportement du travail asynchrone. Gardez les actions d’envoi dans le `(submit)` du formulaire avec `ion-button type="submit"`.

## Adapter la règle à l’adaptateur Signal Forms

Par défaut, `require-ion-error-text` exige une source de texte d’erreur sur les contrôles Ionic dotés de `[formField]`.

Pour les applications Angular 22 utilisant [Kit Signal Forms](./forms.md), importez `FormField` et `KitIonicFormField` dans chaque composant concerné et installez `provideKitIonicSignalForms()`. Remplacez ensuite cette entrée dans les `rules` de la configuration HTML :

```js
'@rdlabo/rules/require-ion-error-text': [
  'error',
  { formFieldProvidesErrorText: true },
],
```

Cette option déclare que l’adaptateur fournit le texte d’erreur ; ESLint ne vérifie ni ses importations ni ses fournisseurs.

## Ajouter les règles ViewModel si vous utilisez cette architecture

Si votre application utilise une architecture `ViewModelStore`, ajoutez [require-viewmodel](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/require-viewmodel) et [no-component-writable-signal](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-component-writable-signal). Configurez-les en fonction de la classe de base ViewModel de votre application ; `ViewModelStore` n’est pas exporté par le kit.

## Exécuter les contrôles dans la CI

Après l’installation des dépendances, exécutez en local et dans la CI :

```sh
npx eslint 'src/**/*.{ts,html}' --max-warnings 0
```

Adaptez le chemin des sources à votre application. Consultez la [configuration ESLint](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration) pour l’ensemble des règles recommandées et les [options des règles](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules) pour les autres conventions.
