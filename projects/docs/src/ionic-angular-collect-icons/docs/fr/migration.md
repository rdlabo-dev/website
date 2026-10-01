---
title: "Migration"
sourceRevision: "c4b917f0d294c34f78b9db694644d90f3e006aa2c4faa1980fc82160bd8594ca"
---
# Guide de migration

## Migrer vers Ionic Angular 9

Cette version cible Ionic Angular 9 et suit les
[changements incompatibles d’Ionic Framework 9](https://github.com/ionic-team/ionic-framework/blob/main/BREAKING.md#version-9x).

### Prérequis

- Ionic Angular 9 ou version ultérieure
- Angular 18 ou version ultérieure
- Capacitor 7 ou version ultérieure pour les applications natives
- TypeScript 5.4 ou version ultérieure
- Ionicons 8 ou version ultérieure
- Node.js 22 ou version ultérieure

### Exécuter l’outil officiel de migration

Ionic recommande son outil officiel de migration. Commitez d’abord les modifications
actuelles de l’application : cet outil modifie les fichiers sur place et exige un arbre de travail Git
propre afin que le commit permette d’examiner ou d’annuler les changements.

Exécutez-le depuis la racine de l’application Ionic :

```bash
npx @ionic/migrate
```

L’outil détecte la version majeure d’Ionic installée, met les dépendances à jour,
applique les corrections automatiques sûres, formate les fichiers modifiés, réinstalle les dépendances
et affiche une liste des changements à examiner manuellement.

Pour prévisualiser la migration sans écrire de fichiers, exécutez :

```bash
npx @ionic/migrate --dry-run
```

Une fois la migration officielle terminée, mettez ce collecteur à jour et vérifiez que
les versions des dépendances obtenues respectent les prérequis ci-dessus :

```bash
npm install --save-dev @rdlabo/ionic-angular-collect-icons@latest
```

Les sections suivantes expliquent les principaux changements d’Ionic Angular 9 à vérifier
dans les différences générées et dans la liste de vérifications manuelles de l’outil.

### Terminer la migration standalone

Ionic 9 exporte les composants Angular standalone depuis `@ionic/angular`. Remplacez
le point d’entrée standalone d’Ionic 8 :

```diff
- import { IonApp, IonIcon, provideIonicAngular } from '@ionic/angular/standalone';
+ import { IonApp, IonIcon, provideIonicAngular } from '@ionic/angular';
```

L’outil officiel peut déplacer les importations NgModule vers `@ionic/angular/lazy` pour
préserver l’architecture applicative pendant la mise à niveau du framework. Considérez
cela comme une étape intermédiaire, et non comme l’objectif standalone. Terminez la
migration standalone d’Angular, puis importez chaque composant Ionic depuis
`@ionic/angular`. Ne remplacez pas mécaniquement les importations `/lazy` avant d’avoir
converti les consommateurs NgModule correspondants.

### Remplacer `IonicModule` après la migration standalone

`IonicModule` est obsolète dans Ionic 9, mais sa suppression nécessite des changements
d’architecture à l’échelle de l’application. Convertissez l’application au démarrage standalone,
déplacez la configuration Ionic vers `provideIonicAngular()` et importez
les composants Ionic standalone utilisés par chaque consommateur :

```diff
- platformBrowserDynamic().bootstrapModule(AppModule);
+ bootstrapApplication(AppComponent, {
+   providers: [provideIonicAngular(config)],
+ });
```

Importez `provideIonicAngular` depuis `@ionic/angular`. Ne remplacez pas
`IonicModule.forRoot()` par un simple changement de fournisseur dans le même
NgModule ; terminez d’abord la migration NgModule-vers-standalone.

### Utiliser une résolution de modules compatible avec exports

Ionic 9 publie les sous-chemins de package via `exports`. Les applications doivent utiliser
la résolution bundler par défaut d’Angular :

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022"
  }
}
```

Remplacez les importations CSS de style webpack utilisant `~` :

```diff
- @import '~@ionic/angular/css/core.css';
+ @import '@ionic/angular/css/core.css';
```

### Exécuter le collecteur d’icônes

Initialisez l’enregistrement d’icônes généré si l’application ne l’a pas encore
fait :

```bash
npx @rdlabo/ionic-angular-collect-icons --initialize true
```

Continuez à exécuter le collecteur avant les builds de production comme indiqué dans le
[guide d’utilisation](./usage.md).

### Examiner les autres changements d’Ionic 9

Le collecteur repère les usages de `ion-icon` dans les templates Angular et met à jour ses propres
fichiers d’enregistrement des icônes. Il ne dépend ni du comportement des composants Ionic ni de leur
DOM interne ; ces changements d’Ionic 9 ne nécessitent donc pas de modifications propres au
collecteur. Les applications doivent toutefois examiner les notes officielles de migration,
en particulier les nouvelles versions minimales des navigateurs et plateformes mobiles, ainsi que ces changements :

- Les applications natives nécessitent Capacitor 7+ et iOS 16+.
- Les navigateurs de bureau pris en charge sont Chrome 89+, Safari 16+, Edge 89+ et Firefox 75+.
- `ion-input` et `ion-searchbar` utilisent désormais une propriété booléenne `autocorrect`.
- Les anciens composants de sélection et `PickerController` ont été supprimés.
- Les poignées des fenêtres modales en feuille utilisent désormais `handleBehavior="cycle"` par défaut.
- `ion-nav` ne s’intègre plus à `ion-router`.
- `ion-select` émet `ionChange` uniquement lorsque sa valeur change.
- Le DOM interne et les points de personnalisation des styles d’input, select et textarea ont changé.
- Les applications Angular 21 utilisent par défaut la détection des changements sans zone.

Après la migration, exécutez les commandes de lint, de test et de build de production de l’application
et vérifiez visuellement les styles personnalisés des composants Ionic.
