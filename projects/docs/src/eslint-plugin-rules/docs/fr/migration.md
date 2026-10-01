---
title: "Migration"
sourceRevision: "8e98c0a10a993fbb25c7afc392ed1497e17d9e4283a290ff8b449a2d5f6bce3a"
---
# Guide de migration

## De 22.0 à 22.1

La version 22.1 active `require-ion-error-text` dans le preset recommandé. Par défaut, la règle vérifie les six contrôles Ionic qui prennent en charge `errorText`, uniquement lorsqu’ils lient Angular Signal Forms avec `[formField]`. Un `errorText` statique non vide ou une propriété liée `[errorText]` satisfait la règle.

Les applications utilisant `KitIonicFormField` de `@rdlabo/ionic-angular-kit/forms` peuvent activer le lint tenant compte de l’adaptateur après que chaque composant standalone concerné importe à la fois `FormField` d’Angular et l’adaptateur du kit :

```js
{
  files: ['**/*.html'],
  rules: {
    '@rdlabo/rules/require-ion-error-text': ['error', { formFieldProvidesErrorText: true }],
  },
}
```

Définissez `checkAll: true` seulement si l’application exige les messages d’erreur sur les contrôles pris en charge qui ne lient pas `[formField]` ; les filtres et contrôles de paramètres restent autrement volontairement hors du périmètre par défaut. `ignoreReadonly: true` s’applique uniquement avec `checkAll`, et seulement aux attributs `readonly` littéraux sur `ion-input` et `ion-textarea`. Les liaisons dynamiques `[readonly]` restent vérifiées.

## De 21.x à 22.x

La version 22 vise Angular 21 et 22 avec Ionic Framework 9. Les applications Ionic 8 doivent rester sur la version 21 de ce plugin.

### Dépendances

Commitez d’abord les modifications de votre application, puis exécutez l’outil officiel Ionic [`@ionic/migrate`](https://www.npmjs.com/package/@ionic/migrate) depuis la racine de l’application :

```sh
npx @ionic/migrate --dry-run
npx @ionic/migrate
```

Le migrateur détecte la version majeure Ionic installée, met à jour `@ionic/angular` et `@ionic/core` ensemble, applique les changements sûrs de v8 à v9 et affiche une liste des changements nécessitant des décisions manuelles. Examinez et testez son diff avant de poursuivre. La version 22 de ce plugin prend en charge Angular et Angular ESLint de 21 à 22.

### Imports Ionic Angular

Remplacez la règle supprimée `deny-import-from-ionic-module` par `prefer-ionic-standalone` :

```diff
- '@rdlabo/rules/deny-import-from-ionic-module': 'error'
+ '@rdlabo/rules/prefer-ionic-standalone': 'error'
```

Pour les applications Angular, le migrateur officiel déplace les imports NgModule existants de `@ionic/angular` vers `@ionic/angular/lazy` et les imports standalone de `@ionic/angular/standalone` vers la racine du package. Cela préserve l’architecture actuelle de l’application pendant la mise à niveau du framework.

Par exemple, le migrateur réalise automatiquement cette réécriture sûre d’import standalone :

```diff
- import { IonButton } from '@ionic/angular/standalone';
+ import { IonButton } from '@ionic/angular';
```

Ce plugin prend en charge uniquement les applications standalone Ionic 9. Le migrateur officiel signale `IonicModule` sans correction automatique, car la conversion d’une application NgModule exige des décisions d’architecture. Après son exécution, terminez la migration standalone Angular et importez les composants Ionic depuis la racine du package. Ne remplacez pas mécaniquement les chemins `@ionic/angular/lazy` : convertissez d’abord chaque consommateur NgModule en standalone, puis remplacez `IonicModule` par les composants Ionic précis qu’il utilise.

La nouvelle règle rejette le point d’entrée `@ionic/angular/lazy` fondé sur NgModule et `IonicModule`. Migrez vers un démarrage standalone avec `provideIonicAngular()` et importez directement les composants Ionic standalone :

```diff
- platformBrowserDynamic().bootstrapModule(AppModule);
+ bootstrapApplication(AppComponent, {
+   providers: [provideIonicAngular(config)],
+ });
```

Importez `provideIonicAngular` depuis `@ionic/angular`. Terminez la migration Angular de NgModule vers standalone avant de supprimer `IonicModule` ; dans un NgModule, il ne peut pas être remplacé sans risque par une correction automatique d’une ligne.

### Structure des listes du preset recommandé

La version 22 active également `require-ion-item-group` dans le preset recommandé.
Les modèles Ionic existants peuvent donc signaler de nouvelles erreurs lorsqu’un `ion-item`
dans `ion-list` n’est pas enveloppé par `ion-item-group`, `ion-reorder-group`,
`ion-radio-group` ou `ion-accordion` à l’intérieur de `ion-accordion-group`.

La règle applique des corrections automatiques sûres uniquement lorsqu’elle peut déterminer
la limite de groupe voulue. Les modèles réutilisables ou ambigus sont signalés sans être
modifiés. Les composants enveloppes sont vérifiés via leurs propres modèles ; un
élément personnalisé qui affiche une liste correctement groupée n’est donc pas considéré comme un
`ion-item` nu chez son appelant. Consultez
[`require-ion-item-group`](./rules/require-ion-item-group.md) pour les structures
prises en charge et les contraintes de correction.

### Correction automatique booléenne

Ionic 9 change `autocorrect` sur `ion-input` et `ion-searchbar` de `'on' | 'off'` en `boolean`. La règle `ionic-attr-type-check` corrige désormais l’ancienne forme textuelle :

```diff
- <ion-input autocorrect="off"></ion-input>
+ <ion-input [autocorrect]="false"></ion-input>
```

Le migrateur Ionic officiel traite automatiquement ce changement de v8 à v9. La règle reste utile pour détecter les valeurs textuelles anciennes ou nouvellement introduites après migration et lit les types des composants Ionic 9 ; elle suit donc aussi les autres changements de types de propriétés et de valeurs acceptées exposés par ces définitions. Exécutez ESLint avec `--fix`, examinez les modifications des modèles, puis exécutez le build et les tests Angular avant de commiter.
