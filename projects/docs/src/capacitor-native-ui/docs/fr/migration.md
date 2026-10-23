---
title: "Migration"
sourceRevision: "c5e31b375d303760fafac9b9a60184ffdce39307fef4b8aaccb8d48ac70184b6"
---
# Migration

## Migrer depuis la version 1.2.1

Ce guide concerne les applications utilisant `@rdlabo/ionic-theme-ios27` **1.2.1**, y compris Native UI Shell Preview et Vertical Control Area autonome.

- **Thème seul :** mettez à jour le package de thème. Les imports existants, chemins CSS/Sass et imports d’animation restent valides ; aucun démarrage natif requis.
- **Native UI ou Vertical Control Area :** installez directement le package natif, remplacez les imports et réglages ci-dessous, puis synchronisez Capacitor et recompilez l’application native.

Native UI passe de la préversion à une prise en charge officielle en version 2.0.0. Les extensions expérimentales sont décrites dans le [guide actuel des extensions](native-ui-extensions.md) ; ce guide couvre les contrôles et la configuration publiés en 1.2.1.

## Séparation du package Native UI

Pour une nouvelle intégration native, suivez la [configuration Native UI](setup.md) ou, si vous utilisez déjà le thème iOS, [Ajouter Native UI à votre thème](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.1/packages/theme-ios27/docs/add-native-ui.md). Les étapes ci-dessous concernent les applications existantes migrant les noms de packages et les projets natifs.

Le thème et les contrôles natifs résident désormais dans des packages distincts. Choisissez les dépendances selon les comportements utilisés :

| Comportement de l’application | Package à utiliser directement |
| ------------------------------------------------------ | ----------------------------- |
| Styles du thème, comportement Web Ionic et animations du thème | `@rdlabo/ionic-theme-ios27` |
| Native UI ou Vertical Control Area autonome | `@rdlabo/capacitor-native-ui` |
| Styles du thème et contrôles natifs | Les deux packages |

Le thème gère l’apparence et le comportement des éléments Web Ionic. Native UI projette les contrôles pris en charge dans des vues iOS natives et coordonne leur cycle de vie avec la navigation Web. Native UI fonctionne sans le thème iOS 27 ; son installation n’applique aucun style du thème. Les contrôles standard restent Web sur Android et dans les navigateurs ; Android peut afficher des [extensions Compose locales](native-ui-extensions.md#2b-register-compose-content-on-android).

Le thème utilise en interne l’intégration partagée de transition/recherche du package natif. Cette dépendance n’active pas automatiquement les contrôles natifs. Les applications qui les utilisent doivent déclarer directement le package natif pour que Capacitor découvre le plugin.

### 1. Mettre à jour les dépendances de l’application

Lorsque vous utilisez le thème et Native UI ensemble, mettez-les à jour vers la même version. Les commandes ci-dessous installent aussi [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) comme dépendance distincte pour les données de placement et de posture. Foldable a son propre versionnement.

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
