---
title: "Premiers pas"
sourceRevision: "a15bab5a14ca6b4756b8c5637a7402983104f4be9ac7105f92ec7a72c781e111"
---
# Ionic Theme iOS27

Un thème pour les applications Ionic qui apporte Liquid Glass et les animations d’iOS 27 au Web. Les applications Capacitor iOS peuvent aussi activer Native UI Shell, en préversion, pour les contrôles pris en charge.

**[Démo Ionic 9](https://ionic-theme-ios27.rdlabo.dev/) · [Démo Ionic 8](https://ionic8-theme-ios27.rdlabo.dev/) · [Documentation](https://docs.rdlabo.dev/projects/ionic-theme-ios27)**

<!-- rdlabo-docs-pick -->

<p>
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.2.1/screenshots/ios27-settings.png" width="32%" alt="Thème iOS 27 : Réglages en mode clair avec une barre de recherche Liquid Glass" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.2.1/screenshots/ios27-settings-dark.png" width="32%" alt="Thème iOS 27 : Réglages en mode sombre" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.2.1/screenshots/ios27-library.png" width="32%" alt="Thème iOS 27 : bibliothèque avec des boutons et une barre d’onglets Liquid Glass" />
</p>

<!-- /rdlabo-docs-pick -->

## Fonctionnalités

### Apporter l’apparence d’iOS 27 à Ionic

Donnez aux écrans Ionic habituels le langage visuel d’iOS 27 : Liquid Glass, barres d’outils et onglets stylisés, listes, boutons, recherche, superpositions, transitions de pages et apparences claires et sombres coordonnées. Découvrez le résultat dans la [démo Ionic 9](https://ionic-theme-ios27.rdlabo.dev/) et la [démo Ionic 8](https://ionic8-theme-ios27.rdlabo.dev/).

### Projeter votre interface Ionic dans une interface native

Sur Capacitor iOS, [Native UI Shell](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/native-ui-shell), facultatif, lit les contrôles fixes pris en charge dans votre balisage Ionic existant. Il est disponible en préversion dans `1.2.0`. Il projette leur texte, les images résolues des `ion-icon` ou les SVG statiques pris en charge, ainsi que l’état de sélection, dans des contrôles UIKit utilisant le Liquid Glass du système. Les modifications et actions natives passent par les composants Ionic d’origine : les présentations Web et native partagent donc une même définition d’interface. Le contenu des pages et le routage restent dans la WebView ; les dispositions non prises en charge conservent leur présentation Web.

**Glissement d’onglet sur iOS 27 :** le même écran Library avec Native UI Shell désactivé (Web) et activé (UIKit). Les deux captures ont été prises pendant le glissement de l’onglet sélectionné ; les panneaux inférieurs agrandissent le verre autour de la barre d’onglets.

[![Native UI Shell désactivé et activé pendant le même glissement d’onglet Library, avec les barres d’onglets agrandies](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.2.1/screenshots/native-ui-shell-drag/comparison.png)](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.2.1/screenshots/native-ui-shell-drag/comparison.png)

### S’adapter à l’appareil de l’utilisateur

Associez les thèmes iOS 26 et iOS 27 pour que les versions compatibles de Safari présentent le design de chaque génération : l’apparence iOS 26 aux utilisateurs d’iOS 26 et l’apparence iOS 27 aux utilisateurs d’iOS 27. La [configuration par défaut](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/readme#get-started) vérifie les fonctionnalités du navigateur pour choisir les **styles** correspondants ; elle ne lit pas la version d’iOS. Lorsque les deux packages sont installés, conservez l’animation iOS 27 pour la **transition de page**. Sur les versions d’iOS encore antérieures, l’apparence iOS par défaut d’Ionic reste utilisée lorsque Safari ne prend en charge aucune des deux fonctionnalités. Dans une application Capacitor iOS, le matériau UIKit de Native UI Shell suit la version d’iOS installée.

## Premiers pas

Installez les deux thèmes dans une application Ionic 8 ou 9 existante (`@ionic/core` 8.8.1 ou ultérieur) :

```bash
npm install @rdlabo/ionic-theme-ios26 @rdlabo/ionic-theme-ios27
```

Dans votre feuille de style Sass globale, par exemple `src/styles.scss`, chargez les styles selon les capacités du navigateur :

```scss
@use 'sass:meta';

@supports (overflow-anchor: auto) {
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect');
}

@supports (text-wrap: pretty) and (not (overflow-anchor: auto)) {
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect');
}
```

Si la compilation indique `Can't find stylesheet to import.` pour un appel à `meta.load-css()`, rendez `node_modules` accessible à Sass. Dans Angular, ajoutez ceci sous les `options` de build de l’application dans `angular.json` :

```json
"stylePreprocessorOptions": {
  "includePaths": ["node_modules"]
}
```

Vous pouvez aussi utiliser un chemin relatif depuis le fichier Sass contenant `meta.load-css()` vers le package installé, par exemple `../node_modules/@rdlabo/ionic-theme-ios27/src/styles/default-variables` depuis `src/styles.scss`. Adaptez le préfixe `../` à l’emplacement de votre fichier et appliquez le même changement à chaque import de thème.

Ces vérifications choisissent les styles selon les fonctionnalités du navigateur, pas selon la version d’iOS. Les navigateurs ne prenant en charge aucune des deux fonctionnalités conservent l’apparence iOS par défaut d’Ionic. L’exemple utilise le mode sombre par classe : chargez aussi la [palette sombre correspondante d’Ionic](https://ionicframework.com/docs/theming/dark-mode). Pour le mode système ou toujours sombre, remplacez les deux imports `-dark-class` par la variante correspondante. Les styles `md-remove-ios-class-effect` empêchent les classes propres à iOS d’affecter le mode Material Design.

### Configurer les animations

Conservez les animations iOS 27 de transition de page et de popover pour les deux générations de styles. Déterminez ces options avant l’initialisation d’Ionic. Pour Angular :

```ts
import { isPlatform, provideIonicAngular } from '@ionic/angular/standalone'; // Ionic 8
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';

function loadIOSAnimations() {
  if (typeof CSS === 'undefined') return {};
  if (!CSS.supports('overflow-anchor: auto') && !CSS.supports('text-wrap: pretty')) return {};

  return {
    navAnimation: iosTransitionAnimation,
    popoverEnter: popoverEnterAnimation,
    popoverLeave: popoverLeaveAnimation,
  };
}

provideIonicAngular(isPlatform('ios') ? loadIOSAnimations() : {});
```

Avec Ionic 9 Angular, importez `isPlatform` et `provideIonicAngular` depuis `@ionic/angular`. React et Vue peuvent transmettre les mêmes options à `setupIonicReact` ou `IonicVue` pendant l’initialisation. Dans les applications rendues côté serveur, effectuez la sélection pendant l’initialisation dans le navigateur.

Le rayon de la transition de page vaut `0` par défaut. Les applications natives peuvent le mettre à jour après avoir mesuré la WebView :

```ts
import { setConfig } from '@rdlabo/ionic-theme-ios27';

setConfig({ radius });
```

### Vérifier le thème

Testez sur iOS. Pour un aperçu sur ordinateur, définissez le mode Ionic sur `ios` dans la configuration d’initialisation de votre framework (par exemple `mode: 'ios'`).

Utilisez ce balisage pour prévisualiser les listes groupées avec retrait. Pour la structure de liste attendue par le thème, consultez [Utiliser ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/using-ion-item-group).

```html
<ion-list mode="ios" inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

## Configurations facultatives

### Prendre en charge iPhone Duo sans le thème iOS 27 (préversion)

Conservez votre thème Ionic existant et déplacez les onglets et les actions de barre d’outils compatibles dans une zone latérale verticale. **Commencez dans Chrome** avec une feuille de style, une classe d’application et `enableVerticalControlArea()` ; reliez ensuite la disposition aux événements de l’iPhone Duo pour le rail système et la position de la charnière.

L’état de l’appareil est fourni par [`@erkamyaman/capacitor-foldable`](https://github.com/erkamyaman/capacitor-foldable), installé dans votre application :

```bash
npm install @erkamyaman/capacitor-foldable
npx cap sync
```

Appliquez son état de pliage avec `applyFoldStateClasses(root, fold)` et la position de sa barre avec `setVerticalControlAreaPlacement({ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset })`. Le suivi de l’appareil n’est pas inclus dans le thème.

Suivez [iPhone Duo avec votre thème existant](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme) pour la prévisualisation dans le navigateur et la configuration iOS. Pour la projection des contrôles et l’API d’exécution, consultez [Vertical Bars](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars). Pour les événements de l’appareil et les panneaux divisés, consultez [Prise en charge d’iPhone Duo](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo). Disponible en préversion dans `1.2.0` ; les API et comportements pris en charge peuvent évoluer.

### Utiliser uniquement le thème iOS 27

Installez uniquement `@rdlabo/ionic-theme-ios27` et importez ses styles sans condition dans votre feuille de style globale :

```css
@import '@rdlabo/ionic-theme-ios27/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/md-remove-ios-class-effect.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27-dark-class.css';
```

Le dernier import utilise le mode sombre par classe ; pour un autre mode, choisissez la variante `-dark-system` ou `-dark-always` et la palette Ionic correspondante. Configurez les animations iOS 27 avec `isPlatform('ios')` comme ci-dessus, sans les vérifications de fonctionnalités du navigateur.

### Autres options

- **Contrôles natifs :** suivez le [guide de configuration de Native UI Shell](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/native-ui-shell). Les imports de feuilles de style seuls ne l’activent pas.
- **Listes avec retrait sur Android :** chargez si nécessaire la feuille de style `md-ion-list-inset` du package correspondant dans chaque branche `@supports`. Elle est déjà incluse dans `@rdlabo/ionic-theme-md3`.

### Utiliser avec le thème MD3

Installez les trois thèmes pour utiliser iOS 27 sur les versions compatibles de Safari, revenir à iOS 26 sur la génération précédente de Safari et utiliser MD3 lorsqu’Ionic fonctionne en mode Material Design. Les trois thèmes nécessitent `@ionic/core` 8.8.1 ou ultérieur :

```bash
npm install @rdlabo/ionic-theme-ios26 @rdlabo/ionic-theme-ios27 @rdlabo/ionic-theme-md3
```

Gardez les deux thèmes iOS derrière les mêmes vérifications de fonctionnalités du navigateur que la configuration par défaut, puis chargez MD3 sans condition. L’utilisation systématique de `meta.load-css()` maintient aussi les styles MD3 après les styles iOS conditionnels dans le CSS généré :

```scss
@use 'sass:meta';

@supports (overflow-anchor: auto) {
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect');
}

@supports (text-wrap: pretty) and (not (overflow-anchor: auto)) {
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect');
}

@include meta.load-css('@rdlabo/ionic-theme-md3/dist/css/default-variables.css');
@include meta.load-css('@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css');
```

Les styles iOS s’appliquent uniquement au mode `ios` d’Ionic, tandis que MD3 s’applique au mode `md`. La feuille de style `md-remove-ios-class-effect` de chaque branche iOS empêche les classes utilitaires propres à iOS d’affecter le mode MD. MD3 inclut déjà ses styles de listes avec retrait : ne chargez donc pas la feuille de style facultative `md-ion-list-inset` des packages iOS dans cette configuration.

Chargez aussi la palette sombre correspondante d’Ionic. L’exemple utilise le mode sombre par classe ; pour le mode système ou toujours sombre, choisissez la variante correspondante pour Ionic et les deux thèmes iOS.

Conservez la transition iOS 27 pour les deux générations de thèmes iOS et sélectionnez la transition MD3 en mode Material Design. Étendez la configuration d’animation ci-dessus comme suit :

```ts
import { isPlatform, provideIonicAngular } from '@ionic/angular/standalone'; // Ionic 8
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';
import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';

function loadAnimations() {
  if (!isPlatform('ios')) return { navAnimation: mdTransitionAnimation };
  if (typeof CSS === 'undefined') return {};
  if (!CSS.supports('overflow-anchor: auto') && !CSS.supports('text-wrap: pretty')) return {};

  return {
    navAnimation: iosTransitionAnimation,
    popoverEnter: popoverEnterAnimation,
    popoverLeave: popoverLeaveAnimation,
  };
}

provideIonicAngular(loadAnimations());
```

Avec Ionic 9 Angular, importez `isPlatform` et `provideIonicAngular` depuis `@ionic/angular`. React et Vue peuvent transmettre les mêmes options renvoyées à `setupIonicReact` ou `IonicVue`. Si Sass ne résout pas un package dans `meta.load-css()`, utilisez `stylePreprocessorOptions.includePaths` ou le chemin relatif décrit dans Premiers pas.

## Documentation

**Documentation complète :** [Ionic Theme iOS27](https://docs.rdlabo.dev/projects/ionic-theme-ios27)

- [Utiliser ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/using-ion-item-group) — balisage requis pour les listes avec retrait.
- [Balisage et classes spécifiques](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/special-markup) — balisage facultatif et classes utilitaires du thème.
- [ESLint](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/eslint) — vérifier la structure des listes avec les règles ESLint.
- [Fonctionnalités](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/features) — variables CSS, Liquid Glass, imports sélectifs et mode sombre.
- [Native UI Shell (préversion)](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/native-ui-shell) — projeter les contrôles, textes et icônes Ionic compatibles dans UIKit.
- [Vertical Bars (préversion)](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars) — disposition du rail latéral, admissibilité des contrôles, apparence des boutons natifs et API d’exécution.
- [Prise en charge d’iPhone Duo (préversion)](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo) — rail système vertical, position de la charnière et disposition en panneaux divisés ; utilisable sans le thème ni le shell.
- [iPhone Duo avec votre thème existant (préversion)](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme) — configuration autonome conservant votre thème Web existant.
- [Animations](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/animation) — effets des onglets, segments et recherches.
- [Migration depuis iOS 26](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/migration) — mise à niveau d’une application existante, avec changements de feuilles de style, classes et variables CSS.
- [Historique des migrations iOS 26](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/migration) — changements des versions majeures antérieures du package précédent.

<!-- rdlabo-docs-omit -->

**Thème iOS 26 :** consultez la [documentation iOS 26](https://docs.rdlabo.dev/projects/ionic-theme-ios26).

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

- [Démo Ionic 9](https://ionic-theme-ios27.rdlabo.dev) — version de référence
- [Démo Ionic 8](https://ionic8-theme-ios27.rdlabo.dev) — compatibilité

Le répertoire `demo/` contient l’application Angular utilisée par les deux déploiements. Pour l’exécuter localement :

```bash
cd demo
npm install
npm start
```

### Tests de régression visuelle

Playwright compare les captures des routes de démo en modes clair et sombre aux références enregistrées pour détecter les changements visuels involontaires. Ces tests de régression ne mesurent pas la ressemblance avec les écrans de référence iOS 27.

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

### Releases

Les tags stables `ios27-vX.Y.Z` publient sous npm `latest` via le [workflow de release](./.github/workflows/release.yml). Les mainteneurs créent les tags avec `npm run release`. Les candidats de pull request et de fusion utilisent le tag npm `beta` ; les tags de préversion utilisent `next`.

<!-- /rdlabo-docs-omit -->

<!-- rdlabo-docs-omit -->

## Mainteneurs

- [rdlabo](https://rdlabo.dev/)
<!-- /rdlabo-docs-omit -->
