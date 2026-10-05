---
title: "Premiers pas"
sourceRevision: "808a165977d4d68a03f58b3e5bb4d6fc71eb784946a39bac808acaa628c208bc"
---
# Ionic Theme iOS26

Bibliothèque de thème CSS/JS qui applique le système de design iOS26 aux applications Ionic.

<!-- rdlabo-docs-pick -->

![Écrans Ionic au thème iOS 26 avec barre d’onglets Liquid Glass, listes et contrôles](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios26-v9.4.2/screenshots/ios26.png)

<!-- /rdlabo-docs-pick -->

Démonstration : https://ionic-theme-ios26.rdlabo.dev/

## Installation

Dans un projet Ionic existant :

```bash
npm install @rdlabo/ionic-theme-ios26
```

Remarque : **si vous utilisez @ionic/core@ < 8.8.1**, utilisez @rdlabo/ionic-theme-ios26@2.2.1.

Importez ensuite le thème dans le fichier CSS principal de votre projet, par exemple `src/styles.scss`.

```css
@import '@rdlabo/ionic-theme-ios26/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26.css';

/**
 * Ce fichier neutralise les effets des changements de noms de classes pour iOS26.
 * Par exemple, `ion-buttons ion-button[fill=default]` n’est normalement pas implémenté, mais peut être nécessaire pour iOS26.
 * Ce fichier neutralise ces effets.
 * Remarque : cette feuille de style ne figure pas dans `@rdlabo/ionic-theme-md3`.
 */
@import '@rdlabo/ionic-theme-ios26/dist/css/md-remove-ios-class-effect.css';

/**
 * Importez cette feuille pour utiliser aussi le design de ion-item-group avec ion-list sur Android.
 * En savoir plus : https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/using-ion-item-group
 * Remarque : cette feuille de style figure dans `@rdlabo/ionic-theme-md3`.
 * @import '@rdlabo/ionic-theme-ios26/dist/css/md-ion-list-inset.css';
 */

/*
 * Prise en charge du mode sombre
 * Le mode sombre Ionic est pris en charge. En savoir plus : https://ionicframework.com/docs/theming/dark-mode
 * mode Always :    @import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-always.css'
 * mode System :    @import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-system.css'
 * mode CSS Class : @import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-class.css'
 */
```

### Configurer les animations

Si vous avez installé uniquement le thème iOS 26, configurez ses animations comme suit.

```ts
import { isPlatform } from '@ionic/core'; // ou @ionic/angular (Ionic 9), @ionic/angular/standalone (Ionic 8), @ionic/react, @ionic/vue
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios26';

// Angular
provideIonicAngular({
    ...
    navAnimation: isPlatform('ios') ? iosTransitionAnimation: undefined,
    popoverEnter: isPlatform('ios') ? popoverEnterAnimation: undefined,
    popoverLeave: isPlatform('ios') ? popoverLeaveAnimation: undefined,
});

// React
setupIonicReact({
    ...
    navAnimation: isPlatform('ios') ? iosTransitionAnimation: undefined,
    popoverEnter: isPlatform('ios') ? popoverEnterAnimation: undefined,
    popoverLeave: isPlatform('ios') ? popoverLeaveAnimation: undefined,
});

// Vue
createApp(App)
    .use(IonicVue, {
        ...
        navAnimation: isPlatform('ios') ? iosTransitionAnimation: undefined,
        popoverEnter: isPlatform('ios') ? popoverEnterAnimation: undefined,
        popoverLeave: isPlatform('ios') ? popoverLeaveAnimation: undefined,
})
```

### Vérifier le thème

Testez sur iOS. Pour un aperçu sur ordinateur, définissez le mode Ionic sur `ios` dans la configuration d’initialisation de votre framework (par exemple `mode: 'ios'`).

Utilisez ce balisage pour prévisualiser l’apparence d’une liste groupée en retrait. Consultez [Utiliser ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/using-ion-item-group) pour la structure de liste attendue par le thème.

```html
<ion-list mode="ios" inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

### Facultatif : associer les thèmes iOS 26 et MD3

Installez le thème MD3 pour appliquer les styles aux deux modes Ionic dans la même application.

Les versions actuelles des deux thèmes nécessitent `@ionic/core` 8.8.1 ou une version ultérieure.

```bash
npm install @rdlabo/ionic-theme-md3
```

Si votre feuille de style globale utilise Sass, initialisez les thèmes dans cet ordre :

```scss
@use '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss' as ios26-vars;
@use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26.scss';
@use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class.scss';
@use '@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect.scss';
@use '@rdlabo/ionic-theme-md3/dist/css/default-variables.css' as md3-vars;
@use '@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css';
```

L’exemple utilise le mode sombre Ionic activé par classe. Votre feuille de style globale doit également charger la palette sombre Ionic correspondante, par exemple `@ionic/angular/css/palettes/dark.class.css` pour Angular. Avec `dark-system` ou `dark-always`, choisissez la même variante pour la palette Ionic et le thème iOS 26. Consultez la [documentation du mode sombre](https://ionicframework.com/docs/theming/dark-mode) d’Ionic. Les espaces de noms explicites `ios26-vars` et `md3-vars` empêchent les deux modules de variables d’utiliser le même espace de noms par défaut.

Configurez les deux implémentations de transition lorsque les deux thèmes sont installés :

```ts
import { isPlatform } from '@ionic/core'; // ou @ionic/angular (Ionic 9), @ionic/angular/standalone (Ionic 8), @ionic/react, @ionic/vue
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios26';
import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';

// Angular
provideIonicAngular({
    ...
    navAnimation: isPlatform('ios') ? iosTransitionAnimation : mdTransitionAnimation,
    popoverEnter: isPlatform('ios') ? popoverEnterAnimation : undefined,
    popoverLeave: isPlatform('ios') ? popoverLeaveAnimation : undefined,
});

// React
setupIonicReact({
    ...
    navAnimation: isPlatform('ios') ? iosTransitionAnimation : mdTransitionAnimation,
    popoverEnter: isPlatform('ios') ? popoverEnterAnimation : undefined,
    popoverLeave: isPlatform('ios') ? popoverLeaveAnimation : undefined,
});

// Vue
createApp(App)
    .use(IonicVue, {
        ...
        navAnimation: isPlatform('ios') ? iosTransitionAnimation : mdTransitionAnimation,
        popoverEnter: isPlatform('ios') ? popoverEnterAnimation : undefined,
        popoverLeave: isPlatform('ios') ? popoverLeaveAnimation : undefined,
    });
```

## Documentation

- [Utiliser ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/using-ion-item-group) — balisage requis pour les listes en retrait.
- [Balisage et classes particuliers](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/special-markup) — balisage à activer explicitement et classes utilitaires du thème.
- [ESLint](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/eslint) — vérifier la structure des listes avec les règles ESLint.
- [Fonctionnalités](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/features) — variables CSS, Liquid Glass, importations sélectives et mode sombre.
- [Animation expérimentale](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/experimental-animation) — effets de barre d’onglets et de recherche.
- [iOS 18](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/ios-18) — charger le thème uniquement sur iOS 26.
- [Migration](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/migration) — changements requis lors des mises à niveau majeures.

<!-- rdlabo-docs-omit -->

**Documentation complète :** [https://docs.rdlabo.dev/projects/ionic-theme-ios26](https://docs.rdlabo.dev/projects/ionic-theme-ios26)

## Développement et tests

### Compilation des modules JavaScript

Conservez les imports relatifs sans extension dans le code source TypeScript, conformément au
style du code source d’Ionic. La CLI partagée `rdlabo-build-theme` de `@rdlabo/ionic-theme-utils` utilise
tsdown pour résoudre les imports lors de la génération du JavaScript ESM et des déclarations de types.
Les dépendances restent externes et les fichiers sources ne sont pas réécrits.

Exécutez `npm run build && npm run test:esm` pour compiler et vérifier l’archive npm avec
la CLI partagée `rdlabo-check-esm`. Les points d’entrée JavaScript publics peuvent être importés
dans Node.js sans DOM ; les opérations d’interface nécessitent toujours un navigateur ou un environnement
natif pris en charge. Le package est distribué uniquement au format ESM.

### Application de démonstration

La même démonstration est déployée avec les deux versions d’Ionic prises en charge :

- [Démonstration Ionic 9](https://ionic-theme-ios26.rdlabo.dev) — version de référence
- [Démonstration Ionic 8](https://ionic8-theme-ios26.rdlabo.dev) — compatibilité

Le répertoire `demo/` contient l’application Angular utilisée par les deux déploiements. Pour l’exécuter localement :

```bash
cd demo
npm install
npm start
```

### Tests de régression visuelle

Nous utilisons Playwright pour les tests de régression visuelle afin d’assurer des styles cohérents sur tous les composants. La suite capture automatiquement toutes les routes en mode clair et en mode sombre.

#### Exécuter les tests

```bash
cd demo

# Exécuter tous les tests E2E
npm run test:e2e

# Exécuter les tests en mode UI (interactif)
npm run test:e2e:ui

# Déboguer les tests
npm run test:e2e:debug

# Mettre à jour les captures de référence (modification volontaire de l’interface)
npm run test:e2e:update
```

### Canaux de préversion

Une pull request ouverte, non marquée comme brouillon, peut être publiée sous le dist-tag npm `beta` après la réussite de ses workflows `Lint`, `E2E Screenshot Tests Pull Request` et `Package Candidate`. Un propriétaire ou mainteneur du dépôt doit ajouter un commentaire dont le corps complet est :

```text
/beta
```

La demande autorise uniquement le SHA de tête et la branche de base de la pull request présents lors de l’ajout du commentaire. Le workflow vérifie de nouveau l’autorisation du propriétaire ou mainteneur, le SHA de tête et la branche de base juste avant la publication. Tout nouveau commit ou changement de cible invalide la demande ; le nouvel état doit réussir la CI et recevoir un nouveau commentaire `/beta` d’un propriétaire ou mainteneur. Les pull requests issues de forks sont prises en charge. Celles qui modifient un workflow conditionnant les versions ne peuvent pas être publiées en bêta avant l’intégration de ces changements dans leur branche cible.

Les versions bêta utilisent `<base>-beta.pr<PR number>.sha<12-character SHA>`. La pull request reçoit un commentaire contenant la version immuable et la commande `npm install` exacte.

Lorsqu’une pull request est fusionnée dans `main` ou `ios26`, elle est automatiquement publiée sous le dist-tag npm `beta` uniquement après la réussite de `Lint`, `E2E Screenshot Tests` et `Package Candidate` pour ce commit de fusion exact. Les pushes directs ne publient pas de candidat. Les candidats de fusion utilisent `<base>-beta.pr<PR number>.sha<12-character SHA>`, et la pull request fusionnée reçoit la commande d’installation exacte.

Le code candidat est construit dans un workflow en lecture seule sans identifiants de publication npm. Le workflow de publication privilégié ne récupère ni n’exécute jamais le code de la pull request ; il vérifie de nouveau le workflow source et l’identité du package, puis publie uniquement l’artefact immuable empaqueté, avec les scripts de cycle de vie désactivés. Le commentaire contenant la commande d’installation est une notification distincte fournie au mieux et ne peut pas invalider une publication npm réussie.

Seul `npm run release` peut créer un tag de version. Les tags stables `ios26-vX.Y.Z`, pour les versions majeures, mineures ou correctives, sont publiés sous npm `latest` ; les tags de révision ou de préversion sont publiés sous `next`. Ni les publications `beta` ni les publications `next` ne modifient le dist-tag npm `latest`.

<!-- /rdlabo-docs-omit -->

<!-- rdlabo-docs-omit -->

## Mainteneurs

- [rdlabo](https://rdlabo.dev/)
<!-- /rdlabo-docs-omit -->
