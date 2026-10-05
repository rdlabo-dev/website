---
title: "Premiers pas"
sourceRevision: "967fe0a84fc0efa0aa536056f83be42f3f140e1fdd0e5deb300b40e69f5fe500"
---
# Ionic Theme Material Design 3

Bibliothèque de thème CSS/JS qui applique le système de design Material Design 3 aux applications Ionic.

<!-- rdlabo-docs-pick -->

![Écrans Ionic au thème Material Design 3 avec composants et navigation mis à jour](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-md3/v9.1.3/screenshots/md3.png)

<!-- /rdlabo-docs-pick -->

Démonstration : https://ionic-theme-md3.rdlabo.dev/

Conçu pour être compatible avec `@rdlabo/ionic-theme-ios26`, afin qu’un même arbre de balisage permette de styliser les deux modes Ionic.

## Installation

Dans un projet Ionic existant :

```bash
npm install @rdlabo/ionic-theme-md3
```

Remarque : **si vous utilisez @ionic/core@ < 8.8.0**, utilisez @rdlabo/ionic-theme-md3@1.0.2.

Importez ensuite le thème dans le fichier CSS principal de votre projet, par exemple `src/styles.scss`.

```css
@import '@rdlabo/ionic-theme-md3/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css';
```

### Configurer les animations

Si vous avez installé uniquement le thème MD3, configurez son animation comme suit.

```ts
import { isPlatform } from '@ionic/core'; // ou @ionic/angular (Ionic 9), @ionic/angular/standalone (Ionic 8), @ionic/react, @ionic/vue
import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';

// Angular
provideIonicAngular({
    ...
    navAnimation: isPlatform('ios') ? undefined: mdTransitionAnimation,
});

// React
setupIonicReact({
    ...
    navAnimation: isPlatform('ios') ? undefined: mdTransitionAnimation,
});

// Vue
createApp(App)
    .use(IonicVue, {
        ...
        navAnimation: isPlatform('ios') ? undefined: mdTransitionAnimation,
})
```

### Vérifier le thème

Testez sur Android. Pour un aperçu sur ordinateur, définissez le mode Ionic sur `md` dans la configuration d’initialisation actuelle de votre framework, par exemple `mode: 'md'`.

Utilisez ce balisage pour prévisualiser l’apparence d’une liste groupée en retrait. Consultez [Utiliser ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/using-ion-item-group) pour la structure attendue par le thème.

```html
<ion-list mode="md" inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

### Facultatif : associer les thèmes MD3 et iOS 26

Installez le thème iOS 26 pour appliquer les styles aux deux modes Ionic dans la même application.

Les versions actuelles des deux thèmes nécessitent `@ionic/core` 8.8.1 ou une version ultérieure. Mettez Ionic à niveau avant cette configuration si votre application utilise 8.8.0 ou une version antérieure.

```bash
npm install @rdlabo/ionic-theme-ios26
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

- [Utiliser ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/using-ion-item-group) — balisage commun des listes en retrait pour iOS 26 et MD3.
- [Balisage particulier](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/special-markup) — combinaisons de composants à activer explicitement utilisées dans la démonstration.
- [ESLint](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/eslint) — vérifier la structure des listes avec les règles ESLint.
- [Migration](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/migration) — changements requis lors de la mise à jour du balisage du thème.

## Projets connexes

Si vous avez besoin d’une implémentation plus complète de Material Design 3, ce projet peut aussi vous intéresser :

- **[md3-for-ionic](https://github.com/danielkleebinder/md3-for-ionic)** de danielkleebinder

> **Remarque :** ce thème est conçu spécialement pour être compatible avec l’approche de design d’Ionic et `@rdlabo/ionic-theme-ios26` ; il ne vise pas à reproduire strictement et intégralement MD3.

<!-- rdlabo-docs-omit -->

**Documentation complète :** [https://docs.rdlabo.dev/projects/ionic-theme-md3](https://docs.rdlabo.dev/projects/ionic-theme-md3)

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

- [Démonstration Ionic 9](https://ionic-theme-md3.rdlabo.dev) — version de référence
- [Démonstration Ionic 8](https://ionic8-theme-md3.rdlabo.dev) — compatibilité

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

La demande autorise uniquement le SHA de tête de la pull request présent lors de l’ajout du commentaire. Le workflow vérifie de nouveau l’autorisation du propriétaire ou mainteneur et le SHA de tête juste avant la publication. Tout nouveau commit invalide la demande, quel que soit son auteur ; le nouveau SHA doit réussir la CI et recevoir un nouveau commentaire `/beta` d’un propriétaire ou mainteneur. Les pull requests issues de forks sont prises en charge. Celles qui modifient un workflow conditionnant les versions ne peuvent pas être publiées en bêta avant l’intégration de ces changements dans `main`.

Les versions bêta utilisent `<base>-beta.pr<PR number>.sha<12-character SHA>`. La pull request reçoit un commentaire contenant la version immuable et la commande `npm install` exacte.

Lorsqu’une pull request est fusionnée dans `main`, elle est automatiquement publiée sous le dist-tag npm `beta` uniquement après la réussite de `Lint`, `E2E Screenshot Tests` et `Package Candidate` pour ce commit de fusion exact. Les pushes directs vers `main` ne publient pas de candidat. Les candidats de fusion utilisent `<base>-beta.pr<PR number>.sha<12-character SHA>`, et la pull request fusionnée reçoit la commande d’installation exacte.

Le code candidat est construit dans un workflow en lecture seule sans identifiants de publication npm. Le workflow de publication privilégié ne récupère ni n’exécute jamais le code de la pull request ; il vérifie de nouveau le workflow source et l’identité du package, puis publie uniquement l’artefact immuable empaqueté, avec les scripts de cycle de vie désactivés. Le commentaire contenant la commande d’installation est une notification distincte fournie au mieux et ne peut pas invalider une publication npm réussie.

Seul `npm run release` peut créer un tag de version. Les tags stables `vX.Y.Z`, pour les versions majeures, mineures ou correctives, sont publiés sous npm `latest` ; les tags de révision ou de préversion sont publiés sous `next`. Ni les publications `beta` ni les publications `next` ne modifient le dist-tag npm `latest`.

<!-- /rdlabo-docs-omit -->

<!-- rdlabo-docs-omit -->

## Mainteneurs

- [rdlabo](https://rdlabo.dev/)
<!-- /rdlabo-docs-omit -->
