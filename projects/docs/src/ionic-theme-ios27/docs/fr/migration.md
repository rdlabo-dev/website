---
title: "Migration du thème"
sourceRevision: "8bafa4e67f3794af95d07aa55318d81efaf5ccb7b0d396e639d20d3fb32f7f0a"
---

# Migration du thème

Ce guide met à niveau le thème autonome et son intégration Capacitor. Pour adopter le thème fourni avec Cordova, consultez [Migrer une application existante vers Cordova](cordova.md#moving-an-existing-theme-app-to-this-integration).

## Mise à niveau depuis 2.1.0

Cette section décrit la même mise à niveau dans les guides du thème et de Native UI ; il suffit de suivre l’un des deux. Conservez les imports du thème, les feuilles de style et la configuration des animations existants. Native UI reste facultatif. S’il est activé, conservez votre appel à `enableNativeUI()`, la sélection des contrôles et le runtime à la racine de l’application. Il n’est pas nécessaire de répéter l’ancienne migration de séparation des packages décrite ci-dessous.

### Mettre à jour les dépendances

Pour les applications utilisant seulement le thème, mettez celui-ci à jour :

```sh
npm install @rdlabo/ionic-theme-ios27@latest
```

Pour les applications utilisant la géométrie du rail de l’appareil ou Native UI, mettez à jour les trois packages, y compris Foldable. Leurs versions sont indépendantes ; utilisez des versions compatibles selon la dépendance pair du thème :

```sh
npm install @rdlabo/ionic-theme-ios27@latest @rdlabo/capacitor-native-ui@latest @erkamyaman/capacitor-foldable@latest
```

L’import du résolveur ci-dessous fournit les valeurs de disposition sans activer la projection native. Les applications utilisant seulement le thème, sans rail de l’appareil, peuvent ignorer l’étape de géométrie.

### Mettre à jour la géométrie de l’appareil

Si votre application traduit directement `getBarPlacement()` en `setVerticalBarsLayout({ edge, inset })`, utilisez le résolveur pour inclure l’origine de la barre d’outils issue des régions réservées :

```diff
- import { Foldable, type BarPlacement } from '@erkamyaman/capacitor-foldable';
+ import { Foldable } from '@erkamyaman/capacitor-foldable';
+ import { resolveVerticalBarsLayout } from '@rdlabo/capacitor-native-ui/integration';
 import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';

- const applyPlacement = ({ verticalBarEdge, inset }: BarPlacement) =>
-   setVerticalBarsLayout({ edge: verticalBarEdge, inset });
- const listener = await Foldable.addListener('barPlacementChange', applyPlacement);
- applyPlacement(await Foldable.getBarPlacement());
+ const updateLayout = async () => {
+   setVerticalBarsLayout(await resolveVerticalBarsLayout(Foldable));
+ };
+ const listener = await Foldable.addListener('layoutChange', () => void updateLayout());
+ await updateLayout();
```

Remplacez l’ancien écouteur de placement au lieu d’ajouter un second chemin de mise à jour. Conservez `await listener.remove()` dans le nettoyage existant de l’application. Si vous avez déjà un gestionnaire `layoutChange`, appelez le résolveur à cet endroit. Conservez le raccordement `foldStateChange` / `applyFoldStateClasses` pour la posture ; le résolveur fournit uniquement la géométrie du rail.

Utilisez directement la disposition de rail indiquée, sans la conditionner à `isDeviceFoldable()`, à un nom d’appareil ou à des heuristiques de taille de viewport. Supprimez les contournements qui fixaient le haut de la barre d’outils pour imiter la géométrie de l’appareil. Les personnalisations CSS intentionnelles restent prises en charge. Les valeurs par défaut restent dans `setVerticalBarsLayout` du thème, pas dans le résolveur. La valeur par défaut pour l’écran externe est de 174px ; la géométrie fournie par l’appareil peut donner l’origine de l’écran interne, 124px. Consultez les [valeurs de disposition et le comportement de repli](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars-layout#apply-device-layout-values).

### Corrections des modales et apparence des boutons d’envoi

Les cartes et feuilles flottantes utilisent désormais leurs limites mesurées pour éviter le rail du Duo, et Native UI reconnaît correctement les dialogues flottants qui chevauchent ce rail. Cela corrige la disposition des modales et la gestion des contrôles natifs sans changement de code applicatif. Si vous aviez ajouté du CSS forçant la pleine largeur uniquement pour contourner ce bug, vous pouvez le supprimer. Conservez un dimensionnement plein écran explicite lorsqu’il répond à un besoin produit. Avec `ios-theme-vertical-bars` ou `ios-theme-fold-expanded` sur `ion-app`, les cartes et feuilles flottantes laissent au moins 8px de chaque côté. Les viewports d’au moins 600px de haut limitent leur largeur à 653px ; les plus courts utilisent la largeur disponible moins 16px. L’espace supérieur suit la zone sûre, avec un minimum de 8px. Les points d’arrêt des feuilles contrôlent toujours la hauteur visible. Le dimensionnement applicatif via `--width`, `--max-width` et `--height` reste pris en charge. Les valeurs habituelles pour téléphones et tablettes ne changent pas lorsqu’aucune classe de disposition n’est active.

Les boutons d’envoi Ionic à remplissage plein utilisent automatiquement un verre natif accentué :

```html
<ion-button type="submit" fill="solid">Save</ion-button>
```

La même apparence s’applique aux actions `.button-submit` existantes avec remplissage plein. Cette classe fournit le style, pas l’envoi du formulaire. Les remplissages clear et outline ne reçoivent pas l’accentuation d’envoi. Les déclarations explicites `data-native-ui="button-submit"` existantes restent prises en charge.

Les contrôles natifs conservent la responsabilité de leur présentation pendant la navigation, les animations de modales et les transferts d’images. Une image affichée dans la WebView reste la présentation de la projection native, et non un retour au bouton Web d’origine. Retestez puis supprimez les contournements propres aux transitions qui forcent ces contrôles à revenir au Web. Conservez les exclusions intentionnelles et la gestion des contrôles non pris en charge ou des échecs natifs ; aucun indicateur d’animation supplémentaire ni second runtime n’est nécessaire.

Vérifiez les deux côtés du rail, sa disparition, le pliage et la rotation, les présentations carte, feuille et plein écran, ainsi que les actions d’envoi pleines. Vérifiez aussi un iPhone ordinaire et le repli navigateur. Pour Cordova, utilisez l’[intégration fournie](https://github.com/webview-native-ui/cordova-plugin) ; son thème épinglé et les changements natifs arrivent par une publication du plugin Cordova, pas par ces commandes d’installation Capacitor.

## Séparation du package Native UI

Les styles et imports ordinaires des API du thème restent pris en charge. Si vous utilisiez les contrôles natifs via ce package, les points d’entrée `/native` et `/vertical-bars` ont été supprimés :

| Ancien import | Remplacement |
| ----------------------------------------- | ------------------------------------------- |
| `@rdlabo/ionic-theme-ios27/native` | `@rdlabo/capacitor-native-ui` |
| `@rdlabo/ionic-theme-ios27/vertical-bars` | `@rdlabo/capacitor-native-ui/vertical-bars` |

Ajoutez le package natif comme dépendance directe, mettez à jour les imports, recompilez les ressources Web et exécutez `npx cap sync ios`. Suivez le [guide de migration Native UI](/capacitor-native-ui/docs/migration) pour les paramètres de démarrage de la version 1.2.1 et les modifications du projet natif. Les applications utilisant uniquement le thème n’ont besoin ni de démarrage natif ni de configuration du plugin.

## Disposition de l’appareil dans la version 2.0

Installez Foldable avec le thème dans la configuration standard :

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

Remplacez les anciennes API de disposition par des abonnements Foldable :

| Ancienne API | Remplacement |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| `DeviceLayout`, `HingeStatus` | `BarPlacement`, `FoldState` et `HingeStatus` de `@erkamyaman/capacitor-foldable` |
| `getDeviceLayout()` | `Foldable.getBarPlacement()` et `Foldable.getFoldState()` |
| `deviceLayoutChange` | Écouteurs `barPlacementChange` et `foldStateChange` |
| Démarrer/arrêter la surveillance de la disposition | S’abonner avec `addListener()` ; retirer chaque écouteur au nettoyage |
| Lecture ponctuelle du rayon des coins de la WebView | `getWebViewMetrics()` de Native UI |

Appliquez le placement avec `setVerticalBarsLayout` et la posture avec `applyFoldStateClasses`, tous deux importés du thème. Lisez l’état initial en plus de vous abonner aux changements. Consultez la [disposition et les panneaux divisés](vertical-bars-layout.md#read-the-device-layout) et la [projection du rail](../../capacitor-native-ui/docs/vertical-bars.md#use-with-capacitor-foldable) pour la configuration actuelle. Installer les packages ne suffit pas pour s’abonner aux événements de l’appareil ou activer la projection.

## Depuis le thème iOS 26

Pour une application utilisant `@rdlabo/ionic-theme-ios26`, la migration recommandée conserve ce package et ajoute `@rdlabo/ionic-theme-ios27`. La [configuration des thèmes adaptatifs](adaptive-themes.md) choisit les styles iOS 27 ou iOS 26 selon les capacités du navigateur et conserve l’apparence iOS par défaut d’Ionic sur les navigateurs plus anciens.

### 1. Ajouter le nouveau package

Conservez le package iOS 26 et ajoutez iOS 27. Le nouveau thème nécessite `@ionic/core` 8.8.1 ou ultérieur, avec Ionic 8 ou 9.

```bash
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
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

Remplacez l’import d’animation `@rdlabo/ionic-theme-ios26` par `@rdlabo/ionic-theme-ios27` ; la configuration `isPlatform('ios')` existante peut rester. Consultez la [configuration iOS 27](setup.md). Les imports inconditionnels appliquent les nouveaux styles à tous les navigateurs utilisant le mode Ionic iOS.

## Noms iOS 27

Pour la branche iOS 27 ou une application exclusivement iOS 27, utilisez `@rdlabo/ionic-theme-ios27`. Ses feuilles de style sont `ionic-theme-ios27.scss` ou `ionic-theme-ios27.css`, avec les variantes `-dark-always`, `-dark-system` et `-dark-class`. Conservez les noms de feuilles de style iOS 26 dans la branche iOS 26 d’une configuration adaptative.

| Personnalisation | Nom actuel | Comportement historique |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Variables CSS | `--ios-theme-*`, par exemple `--ios-theme-content-box-shadow-rgb` | Les noms `--ios26-*` correspondants restent des replis obsolètes. Les noms actuels sont prioritaires si les deux sont définis. |
| Classe de désactivation du thème | `ios-theme-disabled` | `ios26-disabled` reste un alias obsolète ; migrez le balisage existant lorsque vous le pouvez. |

Utilisez les noms indépendants de la version pour les nouvelles personnalisations.

Consultez [Balisage et classes spécifiques](special-markup.md) et [Variables par défaut](../src/styles/default-variables.scss) pour les noms actuels.

Les notes de migration antérieures sont conservées dans le [guide de migration iOS 26](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/migration).

## Apparence des boutons d’envoi

Les boutons d’envoi utilisent désormais la valeur de contraste standard de chaque couleur Ionic et un traitement directionnel des bords iOS 27. Retirez les variables de luminosité propres au thème.

```diff
  :root {
-  --ion-color-primary-brightness-rgb: 130, 255, 255;
-  --ion-color-primary-brightness: #96feff;
  }
```
