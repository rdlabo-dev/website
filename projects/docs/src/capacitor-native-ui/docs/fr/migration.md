---
title: "Migration"
sourceRevision: "5e81ee4cba053730d861acf21e890711ac63f36439bbf2bd5f0847cffb1b69b4"
---
# Migration

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

## Migrer depuis la version 1.2.1

Ce guide concerne les applications utilisant `@rdlabo/ionic-theme-ios27` **1.2.1**, y compris Native UI Shell Preview et Vertical Control Area autonome.

- **Thème seul :** mettez à jour le package de thème. Les imports existants, chemins CSS/Sass et imports d’animation restent valides ; aucun démarrage natif requis.
- **Native UI ou Vertical Control Area :** installez directement le package natif, remplacez les imports et réglages ci-dessous, puis synchronisez Capacitor et recompilez l’application native.

Native UI passe de la préversion à une prise en charge officielle en version 2.0.0. Les extensions expérimentales sont décrites dans le [guide actuel des extensions](native-ui-extensions.md) ; ce guide couvre les contrôles et la configuration publiés en 1.2.1.

## Séparation du package Native UI

Pour une nouvelle intégration native, suivez la [configuration Native UI](setup.md) ou, si vous utilisez déjà le thème iOS, [Ajouter Native UI à votre thème](/ionic-theme-ios27/docs/add-native-ui). Les étapes ci-dessous concernent les applications existantes migrant les noms de packages et les projets natifs.

Le thème et les contrôles natifs résident désormais dans des packages distincts. Choisissez les dépendances selon les comportements utilisés :

| Comportement de l’application | Package à utiliser directement |
| ------------------------------------------------------ | ----------------------------- |
| Styles du thème, comportement Web Ionic et animations du thème | `@rdlabo/ionic-theme-ios27` |
| Native UI ou Vertical Control Area autonome | `@rdlabo/capacitor-native-ui` |
| Styles du thème et contrôles natifs | Les deux packages |

Le thème gère l’apparence et le comportement des éléments Web Ionic. Native UI projette les contrôles pris en charge dans des vues iOS natives et coordonne leur cycle de vie avec la navigation Web. Native UI fonctionne sans le thème iOS 27 ; son installation n’applique aucun style du thème. Les contrôles standard restent Web sur Android et dans les navigateurs ; Android peut afficher des [extensions Compose locales](native-ui-extensions.md#2b-register-compose-content-on-android).

Le thème utilise en interne l’intégration partagée de transition/recherche du package natif. Cette dépendance n’active pas automatiquement les contrôles natifs. Les applications qui les utilisent doivent déclarer directement le package natif pour que Capacitor découvre le plugin.

### 1. Mettre à jour les dépendances de l’application

Le thème et Native UI sont versionnés indépendamment. Si vous utilisez les deux, choisissez une version de Native UI compatible avec la dépendance pair déclarée par le thème. Les commandes ci-dessous installent aussi [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) comme dépendance distincte pour les données de placement et de posture. Foldable a son propre versionnement.

Pour une application utilisant seulement le thème, mettez à jour ce package. Conservez les imports et chemins CSS/Sass existants ; aucun démarrage natif ni configuration du plugin n’est nécessaire.

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

Pour une application utilisant le thème et les contrôles natifs, installez les deux comme dépendances directes :

```sh
npm install @rdlabo/ionic-theme-ios27 @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Pour des contrôles natifs avec votre apparence Web existante, suivez [Native UI seul](setup.md). Installez directement le package natif et conservez vos styles Web. Le plugin n’a plus besoin des variables du thème pour sélectionner les contrôles compatibles ; la disposition Web relève de l’application ou du thème. Le démarrage natif nécessite Capacitor 8. L’adaptateur Ionic nécessite Ionic 8.8.1 ou ultérieur dans les versions 8 ou 9 ; `/core` ne nécessite pas Ionic.

### 2. Remplacer les imports natifs

| Ancien import | Remplacement |
| ----------------------------------------- | ------------------------------------------- |
| `@rdlabo/ionic-theme-ios27/native` | `@rdlabo/capacitor-native-ui` |
| `@rdlabo/ionic-theme-ios27/vertical-bars` | `@rdlabo/capacitor-native-ui/vertical-bars` |

Mettez à jour les imports de valeurs et de types, y compris les imports différés, alias de test et configurations de bundler. Les anciens points d’entrée `/native` et `/vertical-bars` du thème ont été supprimés ; aucun alias de compatibilité n’existe.

```diff
- import { enableNativeUIShell } from '@rdlabo/ionic-theme-ios27/native';
+ import { enableNativeUI } from '@rdlabo/capacitor-native-ui';
```

Conservez le balisage des contrôles ; vérifiez les [changements des options de démarrage](#startup-options), notamment les valeurs par défaut des objets `controls` partiels. Le point d’entrée ordinaire `@rdlabo/ionic-theme-ios27`, les chemins CSS/Sass et les imports d’animation restent inchangés. Pour les animations de navigation personnalisées, consultez les [instructions de l’adaptateur de transition](#native-ui-transition-adapter) ci-dessous.

### 3. Synchroniser le projet natif

Après mise à jour des dépendances et imports, recompilez les ressources Web avec votre commande habituelle, puis exécutez :

```sh
npx cap sync ios
```

Le plugin Capacitor est désormais fourni par le package natif. Retirez les copies liées manuellement de l’ancien package Swift du thème pour que seul le nouveau fournisse le plugin. Le package/produit Swift et le pod CocoaPods sont maintenant `RdlaboCapacitorNativeUi` ; le module Swift est `NativeUIPlugin`. Le nom du pont Capacitor est désormais `NativeUI` en JavaScript, iOS et Android. Synchronisez chaque plateforme utilisée et recompilez l’application native. Une mise à jour OTA/Web seule ne peut pas migrer un binaire installé contenant seulement l’ancien plugin. Faites correspondre les versions JavaScript et natives.

Utilisez l’intégration générée par Capacitor pour la dépendance npm ; aucun clonage du dépôt ni package Swift lié manuellement n’est nécessaire.

### 4. Vérifier la migration

- Vérifiez que les applications natives déclarent directement `@rdlabo/capacitor-native-ui`, puis compilez et confirmez l’absence d’imports des points d’entrée supprimés.
- Compilez et lancez l’application iOS après synchronisation. Vérifiez contrôles natifs, navigation/gestes de retour et restauration des contrôles Web après nettoyage.
- Vérifiez la présentation Web dans le navigateur et sur Android selon les plateformes prises en charge, ainsi que l’apparence du thème.
- Vérifiez que les types de contrôles précédemment désactivés le restent après expansion des réglages partiels de la préversion. Testez groupement, actions sélectionnées individuellement et retour dans les dispositions horizontale et verticale.

## Changements de noms Native UI

Le package séparé utilise partout les noms Native UI. Ces renommages sont incompatibles ; les anciens noms ne sont pas des alias. Les noms précédents ci-dessous correspondent à la préversion 1.2.1 publiée.

| Ancien nom | Nouveau nom |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `enableNativeUIShell()` | `enableNativeUI()` |
| `NativeUIShellOptions`, `NativeUIShellHandle`, `NativeUIShellStatus`, `NativeUIShellSuspension`, `NativeUIShellControls`, `NativeUIShellComponent` | `NativeUIOptions`, `NativeUIHandle`, `NativeUIStatus`, `NativeUISuspension`, `NativeUIControls`, `NativeUIComponent` |
| `IonicNativeUIShell` (export du plugin et enregistrement du pont) | `NativeUI` |
| `withNativeUIShellTransition()` | `withNativeUITransition()` (toujours exporté par le thème) |
| `IonicNativeUIShellPlugin` (module Swift/classe native) | `NativeUIPlugin` |
| `RdlaboIonicThemeIos27` (package/produit SPM) | `RdlaboCapacitorNativeUi` |
| `data-shell="disabled"` | `data-native-ui="disabled"` |
| `.ios-theme-shell-disabled` | `.native-ui-disabled` |

Les attributs/événements du runtime sont internes, pas des réglages : `data-native-ui-shell` devient `data-native-ui-projected`, les autres attributs `data-native-ui-shell-*` deviennent `data-native-ui-*`, les événements `nativeUIShell*` deviennent `nativeUI*` et les classes `.ios-theme-native-ui-shell-*` deviennent `.native-ui-*`. Mettez à jour les tests ou diagnostics qui les inspectent. **Conservez les déclarations sources explicites comme `data-native-ui="button"`** ; le marqueur de projection est distinct et géré par le runtime.

## Adaptateur de transition Native UI

L’adaptateur de transition Ionic appartient désormais à `@rdlabo/ionic-theme-ios27`. Remplacez l’import 1.2.1 de `withNativeUIShellTransition` depuis `@rdlabo/ionic-theme-ios27/vertical-bars` par `withNativeUITransition` depuis la racine du thème. Les applications uniquement natives peuvent utiliser directement `shell.suspend()` et son `resume()` retourné.

Utilisez `withNativeUITransition()` pour conserver votre animation de navigation Ionic tout en coordonnant les contrôles Native UI.

- Si vous importez déjà `iosTransitionAnimation` depuis `@rdlabo/ionic-theme-ios27`, conservez la [configuration d’animation du package](ionic-vertical-bars.md#use-the-themes-ios-animation) ; aucun changement de configuration n’est nécessaire. Elle utilise désormais l’adaptateur partagé en interne : n’ajoutez pas d’autre enveloppe.
- Si vous utilisez l’animation par défaut d’Ionic sans option `navAnimation`, suivez [Conserver l’animation par défaut d’Ionic](ionic-vertical-bars.md#keep-ionics-default-animation). L’exemple choisit le constructeur standard iOS ou MD selon le mode de transition.
- Si vous utilisez une animation personnalisée avec Native UI ou Vertical Control Area autonome, enveloppez votre constructeur lors de la configuration Ionic :

```diff
+ import { withNativeUITransition } from '@rdlabo/ionic-theme-ios27';

  const ionicConfig = {
-   navAnimation: existingTransition,
+   navAnimation: withNativeUITransition(existingTransition),
  };
```

Fusionnez cette option dans la configuration Ionic existante avant initialisation. L’adaptateur préserve les effets, la durée et la courbe d’accélération de l’animation tout en coordonnant le retrait natif, la progression du balayage et l’annulation. Conservez les imports de styles et le démarrage Native UI ou Vertical Control Area.

Utilisez l’adaptateur uniquement pour la navigation ; gardez les animations de modales et de popovers inchangées. Votre constructeur doit créer une nouvelle `Animation` pour chaque navigation, car Ionic la détruit ensuite. Conservez les événements de cycle de vie pour l’enregistrement des contrôles et les transitions sans animation. Si le constructeur personnalisé anime séparément un bouton de retour horizontal, excluez cet effet lorsque `.ios-theme-vertical-bars` est actif.

Consultez [Relier votre animation de navigation](ionic-vertical-bars.md#2-connect-your-navigation-animation) pour la configuration et le périmètre pris en charge.

## Options de démarrage

En 1.2.1, fournir `controls` activait **uniquement les champs à `true`**. Dans la nouvelle API, les champs omis valent `true`, même dans un objet partiel. Développez votre ancienne sélection lors de la migration.

| 1.2.1 | Nouvelle configuration |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sans `controls` | Sans `controls` : tous les types compatibles restent sélectionnés par défaut. |
| `controls: {}` | `controls: false` désactive la sélection par défaut ; `ionic: { auto: false }` désactive toute découverte Ionic. |
| `controls.toolbar` | Affectez l’ancienne valeur toolbar à `controls.buttonGroup`, `controls.button` et `controls.backButton`. |
| `controls.tabs`, `.segment`, `.fab` | Noms inchangés, mais utilisez explicitement `false` pour les champs auparavant omis. |
| `buttonProjection` | `ionic.verticalBars.buttonProjection` |
| `buttonDefaultFill: null` | `ionic.verticalBars.buttonDefaultFill: 'glass'` (également le défaut) |
| `buttonDefaultFill: 'solid'` | `ionic.verticalBars.buttonDefaultFill: 'solid'` |
| `verticalBarsOnly: true` | `controls: 'verticalOnly'` pour la sélection par défaut dans le rail. Pour une sélection partielle, utilisez `'verticalOnly'` sur chaque type activé et `false` sur les autres. |
| `enabled: false` | Ne démarrez pas le runtime, ou appelez `destroy()` sur le handle actif. |

Les anciens noms d’options sont supprimés, sans alias. Le point d’entrée autonome `enableVerticalControlArea()` reste disponible avec `controls` à `'verticalOnly'` par défaut ; ses réglages d’apparence passent aussi sous `ionic.verticalBars`. Utilisez un seul point de démarrage par application.

### Conserver une configuration limitée aux onglets

```diff
- import { enableNativeUIShell } from '@rdlabo/ionic-theme-ios27/native';
+ import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

- const shell = await enableNativeUIShell({
-   controls: { tabs: true },
-   buttonProjection: 'source',
-   buttonDefaultFill: null,
+ const shell = await enableNativeUI({
+   controls: {
+     buttonGroup: false,
+     button: false,
+     backButton: false,
+     tabs: true,
+     segment: false,
+     fab: false,
+   },
+   ionic: {
+     verticalBars: { buttonProjection: 'source', buttonDefaultFill: 'glass' },
+   },
  });
```

### Sélectionner les contrôles selon leur placement

Les six champs acceptent `boolean | 'horizontalOnly' | 'verticalOnly'`. Une valeur scalaire de `controls` s’applique à tous. Horizontal et vertical désignent le placement ordinaire et le rail, pas l’orientation ou le modèle de l’appareil.

```ts
const shell = await enableNativeUI({ controls: 'verticalOnly' });
```

Ce sont des valeurs de sélection par défaut, pas un périmètre strict. Les sources explicites `data-native-ui` et les attributs locaux `data-horizontal-bars="true"` / `data-vertical-bars="true"` peuvent activer la projection même si le défaut correspondant est `false`. Retirez le marqueur explicite ou utilisez `data-native-ui="disabled"` pour laisser une source sur le Web. `ionic.auto: false` désactive la découverte Ionic automatique, y compris les activations locales, mais conserve les déclarations explicites.

`buttonGroup` contrôle seulement le groupement. Il ne sélectionne pas les enfants : `buttonGroup: true, button: false` ne projette aucune action ordinaire sans sélection explicite. `backButton` contrôle indépendamment le retour, y compris dans `ion-buttons`. Consultez [tous les réglages](configuration.md) pour la matrice complète et le [groupement de barre d’outils](native-ui.md#toolbar-selection-and-grouping) pour les remplacements locaux.

## Responsabilité de la disposition Web

Importez `setVerticalBarsLayout` et `applyFoldStateClasses` depuis `@rdlabo/ionic-theme-ios27` pour le CSS du thème. Remplacez `setVerticalControlAreaPlacement({ edge, nativeEdge, inset })` par `setVerticalBarsLayout({ edge, inset })`. Native UI lit désormais la disponibilité dans ses propres métriques ; `nativeEdge` est ignoré par l’utilitaire de compatibilité obsolète. Le démarrage normal, la désactivation du rail et le nettoyage ne retirent pas les classes du thème ni l’espace Web réservé. Un rail natif indisponible conserve la disposition Web ; l’application doit choisir elle-même une disposition horizontale si elle la souhaite. Les applications uniquement natives peuvent conserver leur propre CSS.
