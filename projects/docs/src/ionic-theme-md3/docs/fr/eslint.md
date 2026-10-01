---
title: "Assurer la cohérence des listes avec ESLint"
sourceRevision: "a3d0d718ec8b415a3e0c08b2dbac02b13aa70f076e889212c9dd7fcd96d3424d"
---
Détectez les groupes de liste manquants avant leur affichage. Dans les applications Ionic Angular, `@rdlabo/eslint-plugin-rules` vérifie le balisage utilisé par Material Design 3.

## Activer la vérification des listes

Cette configuration vise Ionic Angular 9 avec Angular / Angular ESLint 21–22. Installez la version 22 du plugin dans une application où Angular ESLint est déjà configuré :

```sh
npm install --save-dev @rdlabo/eslint-plugin-rules@22
```

Ajoutez le plugin à la configuration HTML existante dans `eslint.config.mjs` (ou à la configuration CommonJS équivalente). Conservez `angular.processInlineTemplates` dans la configuration TypeScript pour vérifier aussi les modèles intégrés :

```js
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules';

export default tseslint.config(
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    processor: angular.processInlineTemplates,
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angular.templateParser },
    plugins: { '@rdlabo/rules': rdlabo },
    rules: {
      '@rdlabo/rules/require-ion-item-group': 'error',
    },
  },
);
```

Fusionnez ces entrées avec votre configuration existante pour conserver ses autres vérifications. Vous utilisez déjà `rdlabo.configs.recommended` ? Cette règle y figure.

## Voir les problèmes détectés

Ce modèle est signalé :

```html
<ion-list [inset]="true">
  <ion-item>Notifications</ion-item>
</ion-list>
```

Regroupez les éléments et importez `IonItemGroup` dans le composant standalone :

```html
<ion-list [inset]="true">
  <ion-item-group>
    <ion-item>Notifications</ion-item>
  </ion-item-group>
</ion-list>
```

La règle vérifie tous les éléments `ion-list`, y compris les listes sans retrait. Les groupes de boutons radio, de réorganisation et d’accordéons sont également pris en charge. Elle vérifie les modèles Angular ; elle n’inspecte pas les modèles React ou Vue.

Consultez [Utiliser ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/using-ion-item-group) pour des exemples de disposition et la [référence de la règle](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/require-ion-item-group) pour les structures prises en charge et les corrections automatiques.

## Maintenir la vérification

Exécutez cette commande localement et dans la CI après avoir installé les dépendances :

```sh
npx eslint 'src/**/*.{ts,html}' --max-warnings 0
```

Si votre projet Angular utilise un autre répertoire source, adaptez le chemin. Conservez une vérification visuelle de l’espacement, des couleurs et des transitions ; cette règle vérifie la structure des listes.
