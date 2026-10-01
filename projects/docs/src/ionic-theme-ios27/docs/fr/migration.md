---
title: "Migration"
sourceRevision: "faa1349bd2c073cb973ed6b69790c19a8aa4fd4a2a1bd085486ce08e8c60d099"
---
# Migration

## Adaptateur de transition Native UI Shell

Utilisez `withNativeUIShellTransition()` pour conserver votre animation de navigation Ionic existante tout en coordonnant les contrôles Native UI Shell.

- Si vous importez déjà `iosTransitionAnimation` depuis `@rdlabo/ionic-theme-ios27`, conservez la [configuration d’animation du package](./iphone-duo-with-original-theme.md#use-this-package%27s-ios-animation) ; aucun changement de configuration n’est nécessaire. Elle utilise désormais l’adaptateur partagé en interne : n’ajoutez pas d’autre enveloppe.
- Si vous utilisez l’animation par défaut d’Ionic sans option `navAnimation`, suivez [Conserver l’animation par défaut d’Ionic](./iphone-duo-with-original-theme.md#keep-ionic%27s-default-animation). L’exemple choisit le constructeur standard iOS ou MD selon le mode de transition.
- Si vous utilisez une animation de navigation personnalisée avec Native UI Shell ou la zone de contrôle verticale autonome, enveloppez votre constructeur existant lors de la configuration d’Ionic :

```diff
+ import { withNativeUIShellTransition } from '@rdlabo/ionic-theme-ios27/vertical-bars';

  const ionicConfig = {
-   navAnimation: existingTransition,
+   navAnimation: withNativeUIShellTransition(existingTransition),
  };
```

Fusionnez cette option dans votre configuration Ionic existante avant l’initialisation. L’adaptateur conserve les effets, la durée et la courbe d’accélération de l’animation, tout en coordonnant le retrait natif, la progression du glissement et l’annulation. Conservez vos imports de feuilles de style et le démarrage de Native UI Shell ou Vertical Control Area.

Utilisez l’adaptateur uniquement pour la navigation ; gardez les animations de modales et de popovers inchangées. Votre constructeur doit créer une nouvelle `Animation` pour chaque navigation, car Ionic la détruit ensuite. Conservez les événements de cycle de vie pour l’enregistrement des contrôles et les transitions sans animation. Si le constructeur personnalisé anime séparément un bouton de retour horizontal, excluez cet effet lorsque `.ios-theme-vertical-bars` est actif.

Consultez [Relier votre animation de navigation](./iphone-duo-with-original-theme.md#3.-connect-your-navigation-animation) pour la configuration et le périmètre pris en charge.

## Depuis le thème iOS 26

Pour une application utilisant `@rdlabo/ionic-theme-ios26`, la migration recommandée conserve ce package et ajoute `@rdlabo/ionic-theme-ios27`. La [configuration du README](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/readme#get-started) choisit les styles iOS 27 ou iOS 26 selon les capacités du navigateur et garde l’apparence iOS par défaut d’Ionic sur les navigateurs plus anciens.

### 1. Ajouter le nouveau package

Conservez le package iOS 26 et ajoutez iOS 27. Le nouveau thème nécessite `@ionic/core` 8.8.1 ou ultérieur, avec Ionic 8 ou 9.

```bash
npm install @rdlabo/ionic-theme-ios27
```

### 2. Rendre les styles adaptatifs

Remplacez les imports iOS 26 inconditionnels de votre feuille de style Sass globale par deux branches mutuellement exclusives. Cet exemple utilise le mode sombre par classe :

```diff
+ @use 'sass:meta';
+
- @use '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect.scss';
+ @supports (overflow-anchor: auto) {
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/default-variables');
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27');
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class');
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect');
+ }
+
+ @supports (text-wrap: pretty) and (not (overflow-anchor: auto)) {
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/default-variables');
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26');
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class');
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect');
+ }
```

Conservez la palette sombre correspondante d’Ionic. Pour le mode système ou toujours sombre, remplacez les deux imports `-dark-class` par la variante correspondante. Si vous utilisez `md-ion-list-inset`, chargez la feuille de style du package correspondant dans chaque branche. Les navigateurs ne prenant en charge aucune des deux fonctionnalités conservent le style par défaut d’Ionic.

### 3. Changer les animations

Remplacez l’import d’animation iOS 26 et conditionnez les animations iOS 27 aux mêmes fonctionnalités du navigateur. Déterminez les options avant l’initialisation d’Ionic :

```diff
- import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios26';
+ import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';
+
+ function loadIOSAnimations() {
+  if (typeof CSS === 'undefined') return {};
+  if (!CSS.supports('overflow-anchor: auto') && !CSS.supports('text-wrap: pretty')) return {};
+
+  return {
+    navAnimation: iosTransitionAnimation,
+    popoverEnter: popoverEnterAnimation,
+    popoverLeave: popoverLeaveAnimation,
+  };
+ }

  provideIonicAngular({
-  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
-  popoverEnter: isPlatform('ios') ? popoverEnterAnimation : undefined,
-  popoverLeave: isPlatform('ios') ? popoverLeaveAnimation : undefined,
+  ...(isPlatform('ios') ? loadIOSAnimations() : {}),
  });
```

Les animations iOS 27 de transition de page et de popover servent aux deux générations de styles. Les navigateurs plus anciens conservent les valeurs par défaut d’Ionic. L’exemple utilise Angular ; transmettez les mêmes options à `setupIonicReact` de React ou à `IonicVue` de Vue.

### 4. Mettre à jour les personnalisations

Renommez les variables de thème et classes de désactivation utilisées par votre application. Par exemple :

```diff
  ion-content {
-  --ios26-content-box-shadow-rgb: 0, 0, 0;
+  --ios-theme-content-box-shadow-rgb: 0, 0, 0;
  }

- <ion-button class="ios26-disabled">Standard Ionic button</ion-button>
+ <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

Les anciens noms restent des solutions de repli obsolètes. Vérifiez les écrans obtenus en modes clair et sombre sur les navigateurs pris en charge.

### iOS 27 uniquement

Pour passer entièrement à iOS 27, retirez le package iOS 26 et remplacez ses imports de feuilles de style et d’animations. Les changements de feuilles de style sont :

```diff
- @use '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/default-variables.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect.scss';
```

Remplacez l’import d’animation de `@rdlabo/ionic-theme-ios26` par `@rdlabo/ionic-theme-ios27` ; la configuration existante `isPlatform('ios')` peut rester. Consultez la [configuration iOS 27 uniquement](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/readme#use-only-the-ios-27-theme) du README. Les imports inconditionnels appliquent les nouveaux styles à tous les navigateurs utilisant le mode iOS d’Ionic.

## Noms iOS 27

Pour la branche iOS 27 ou une application exclusivement iOS 27, utilisez `@rdlabo/ionic-theme-ios27`. Ses feuilles de style sont `ionic-theme-ios27.scss` ou `ionic-theme-ios27.css`, avec les variantes `-dark-always`, `-dark-system` et `-dark-class`. Conservez les noms de feuilles de style iOS 26 dans la branche iOS 26 d’une configuration adaptative.

Utilisez les variables CSS `--ios-theme-*` indépendantes de la version. Les variables correspondantes `--ios26-*` restent prises en charge comme solutions de repli obsolètes. Lorsque les deux sont définies, le nouveau nom est prioritaire. Utilisez par exemple `--ios-theme-content-box-shadow-rgb` à la place de `--ios26-content-box-shadow-rgb`.

Pour désactiver le thème, utilisez la classe `ios-theme-disabled` indépendante de la version. La classe `ios26-disabled` reste prise en charge comme alias obsolète ; migrez le balisage existant lorsque cela vous convient.

Consultez [Balisage et classes spécifiques](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/special-markup) et [Variables par défaut](../src/styles/default-variables.scss) pour les noms actuels.

Les notes de migration antérieures sont conservées dans le [guide de migration iOS 26](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/migration).

## Apparence des boutons d’envoi

Les boutons d’envoi utilisent désormais la valeur de contraste standard de chaque couleur Ionic et un traitement directionnel des bords iOS 27. Retirez les variables de luminosité propres au thème.

```diff
  :root {
-  --ion-color-primary-brightness-rgb: 130, 255, 255;
-  --ion-color-primary-brightness: #96feff;
  }
```
