---
title: "Migration"
sourceRevision: "8f924038c0f47c377f5128cccef98553d2b3b58b7610939139e05e7616353501"
---
# Guide de migration

## Mettre à niveau l’initialiseur d’icônes

Cette section s’applique lors d’une mise à niveau depuis la version 3.0.1 ou une version antérieure vers une version qui fournit `initializeIonicons`.

Les anciennes versions généraient une importation d’espace de noms pour le catalogue Ionicons complet :

```ts
import { addIcons } from "ionicons";
import * as allIcons from "ionicons/icons";
import * as useIcons from "./use-icons";

addIcons(environment.production ? useIcons : allIcons);
```

Même si la branche de production sélectionnait `useIcons` à l’exécution, cette importation pouvait conserver le catalogue complet dans les bundles optimisés de l’application. Le package fournit désormais un runtime pour navigateur qui permet l’élimination du code inutilisé dans le graphe de dépendances de production.

Mettez d’abord le package à jour, puis exécutez le collecteur dans un terminal interactif :

```bash
npm install --save-dev @rdlabo/ionic-angular-collect-icons@latest
npx @rdlabo/ionic-angular-collect-icons
```

Les environnements de build doivent installer les dépendances de développement, car le code généré importe le runtime pour navigateur pendant la compilation. Ce runtime est ensuite intégré au bundle de l’application.

Lorsqu’elle détecte cet initialiseur généré, la CLI demande s’il faut le migrer. **Yes** (Oui) est sélectionné par défaut. Choisir **No** (Non) laisse l’initialiseur inchangé et poursuit la collecte normale des icônes.

Pour prévisualiser d’abord les différences de code source, choisissez **No** (Non), puis exécutez :

```bash
npx @rdlabo/ionic-angular-collect-icons --migrate true --dry-run true
```

Pour la CI ou tout autre environnement non interactif, approuvez explicitement la migration avec `--migrate true`. Sans cette option, l’initialiseur reste inchangé. Après approbation, le code obtenu est :

```ts
import { initializeIonicons } from "@rdlabo/ionic-angular-collect-icons/runtime";
import * as useIcons from "./use-icons";

void initializeIonicons(useIcons);
```

`initializeIonicons` enregistre les icônes collectées de manière synchrone. La fonction `isDevMode()` d’Angular charge ensuite le catalogue complet depuis un bundle isolé chargé à la demande en développement. En production, l’application démarre sans télécharger ce bundle de catalogue.

La migration confirmée réécrit uniquement l’initialiseur ternaire généré par les anciennes versions :

```ts
addIcons(environment.production ? useIcons : allIcons);
```

Les liaisons d’importation doivent également correspondre à la structure générée connue. Les autres appels `addIcons(...)` et les importations utilisés par le code personnalisé de l’application sont conservés. L’outil reconnaît aussi bien l’ancien chemin généré sans préfixe, comme `"use-icons"`, que sa forme relative canonique `"./use-icons"`, et écrit la forme canonique après migration.
Lorsque `--migrate true` est demandé explicitement, la forme conventionnelle `addIcons(useIcons)` est également mise à niveau, uniquement si `useIcons` est l’importation d’espace de noms du fichier d’icônes généré configuré. Si l’initialiseur a été personnalisé, remplacez manuellement l’importation et l’appel, et conservez séparément les enregistrements personnalisés.

Pour annuler l’intégration du runtime tout en conservant l’élimination du code inutilisé dans les bundles de production, remplacez son importation et son appel par :

```ts
import { addIcons } from "ionicons";
import * as useIcons from "./use-icons";

addIcons(useIcons);
```

Ce retour en arrière n’enregistre pas le catalogue complet en développement. Ne rétablissez pas l’ancienne importation d’espace de noms `allIcons`, car elle est à l’origine de la régression de taille du bundle de production.

Après la migration, exécutez les tests de l’application utilisatrice et un build de production optimisé. Les statistiques du bundle doivent contenir uniquement les icônes exportées par `use-icons.ts` dans le graphe initial. Le catalogue Ionicons complet peut apparaître dans un fragment séparé chargé à la demande, mais la production ne doit pas le télécharger au démarrage.

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
