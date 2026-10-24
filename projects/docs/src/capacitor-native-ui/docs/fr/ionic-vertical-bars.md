---
title: "Ajouter Vertical Bars en conservant votre thème"
sourceRevision: 50766d325ac41dedc16a00c2f38f848fdb7a517c96b6873cceae558d21835a85
---
# Ajouter Vertical Bars en conservant votre thème

Conservez l’apparence existante de votre application et ajoutez Vertical Bars. Choisissez la configuration adaptée à ses composants, que vous utilisiez Angular, React, Vue ou un autre framework.

Consultez le [fonctionnement de la projection](../README.md#how-projection-works) pour comprendre la relation entre DOM source, contrôles projetés et actions. Choisissez ensuite votre configuration ci-dessous.

## Choisir votre configuration

| Votre application | Point de départ | Ajouts |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Composants Ionic avec votre thème, les styles Ionic par défaut ou un autre thème | [Configuration Ionic ci-dessous](#try-it-in-your-existing-ionic-app) | Placement Foldable, CSS de rail autonome et adaptateur Ionic Native UI. Conservez votre thème. |
| Aucun composant Ionic (HTML simple, React, Vue, Angular, etc.) | [Configuration HTML](framework-independent.md), puis [rail sur l’appareil](framework-independent.md#device-placement-for-vertical-bars) | `@rdlabo/capacitor-native-ui/core` et Foldable. L’application fournit la disposition du rail ; aucun package de thème. |
| Thème iOS 27 et Native UI déjà utilisés | [Raccorder le placement de l’appareil](vertical-bars.md#use-with-capacitor-foldable) | Réutilisez votre runtime existant. N’en démarrez pas un autre. |

**Sans Ionic, suivez le guide HTML plutôt que les étapes ci-dessous.** Vous n’avez besoin ni de `@rdlabo/ionic-theme-ios27`, ni de `vertical-bars.css`, ni de `ion-app`, ni des animations de navigation Ionic. Les boutons HTML et boutons de retour explicitement marqués sont pris en charge ; les onglets HTML arbitraires ne sont pas convertis automatiquement. Un aperçu dans le navigateur nécessite un `webHost` stylé par l’application ; le rail natif nécessite aussi du matériel et des logiciels iOS compatibles.

La suite concerne les **applications Ionic**. Les modes `ios` et `md` sont pris en charge. Les onglets et actions de barre d’outils compatibles se déplacent sur le côté ; le contenu et les contrôles horizontaux conservent leur apparence.

La prise en charge d’iPhone Duo et Vertical Bars est stable à partir de la version 2.0.0.

## Essayer dans votre application Ionic existante

### 1. Installer et charger la feuille de style autonome

Partez de votre application Ionic existante (Ionic `>=8.8.1 <10`, Capacitor 8.5 ou ultérieur). Les installations Foldable existantes doivent respecter le [prérequis de l’API de placement](vertical-bars.md#use-with-capacitor-foldable) : version 8.3.3 ou ultérieure dans la branche 8. Installez ensemble Native UI, le package de styles de disposition et le plugin d’état de l’appareil requis :

```bash
npm install @rdlabo/ionic-theme-ios27 @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Conservez vos imports de thème existants. Ajoutez ceci à votre fichier Sass global :

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

Les feuilles de style complètes du thème iOS 27 ne sont pas nécessaires. Conservez cette feuille à la place de `ionic-tabs.css` de Foldable ; charger les deux repositionnerait les mêmes onglets.

Nous adoptons [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) comme intégration standard de l’appareil parce qu’il expose placement, posture et changements en laissant les décisions de disposition à votre application. Transmettez son bord logique et son retrait mesuré à l’utilitaire du thème. Native UI vérifie indépendamment la disponibilité du rail natif.

### 2. Raccorder votre animation de navigation

Configurez `navAnimation` avant l’initialisation d’Ionic. Démarrer l’environnement du rail n’enregistre pas cette option. L’adaptateur prépare les contrôles natifs et coordonne la progression de la navigation et l’annulation tout en conservant votre animation de page existante.

#### Garder l’animation par défaut d’Ionic

Si vous n’avez pas configuré `navAnimation`, enveloppez les générateurs standard d’Ionic. Sélectionnez le générateur selon le `mode` de transition Ionic pour que `ios` et `md` gardent leur animation habituelle :

```ts
import { iosTransitionAnimation, mdTransitionAnimation, type AnimationBuilder } from '@ionic/core';
import { withNativeUITransition } from '@rdlabo/ionic-theme-ios27';

const defaultTransition: AnimationBuilder = (baseEl, opts) =>
  (opts.mode === 'ios' ? iosTransitionAnimation : mdTransitionAnimation)(baseEl, opts);

const ionicConfig = {
  navAnimation: withNativeUITransition(defaultTransition),
};
```

Fusionnez cette option avec votre configuration Ionic existante avant l’initialisation : passez-la à `provideIonicAngular()` d’Angular, à `setupIonicReact()` de React ou aux options du plugin `IonicVue` de Vue. Conservez vos imports de feuilles de style de thème. Aucune feuille de style du thème iOS 27 n’est requise.

#### Utiliser l’animation iOS du thème

Si vous utilisez déjà la transition iOS 27, conservez cette configuration. Elle inclut l’adaptateur natif et exclut l’effet horizontal du bouton de retour dans les dispositions verticales ; aucune enveloppe supplémentaire n’est nécessaire. Importer ce point d’entrée JavaScript ne charge pas les feuilles de style du thème.

```ts
import { iosTransitionAnimation } from '@rdlabo/ionic-theme-ios27';

const ionicConfig = {
  navAnimation: iosTransitionAnimation,
};
```

Appliquez cette option à votre configuration existante en mode iOS et conservez votre configuration MD.

#### Garder votre animation personnalisée

Si votre application utilise un autre générateur pour `navAnimation`, enveloppez-le :

```ts
import type { AnimationBuilder } from '@ionic/core';
import { withNativeUITransition } from '@rdlabo/ionic-theme-ios27';

// Transmettre le constructeur d’animation déjà utilisé par l’application.
const configureNavigation = (existingTransition: AnimationBuilder) => ({
  navAnimation: withNativeUITransition(existingTransition),
});
```

L’adaptateur renvoie l’`Animation` d’origine, en conservant ses effets, sa durée et sa courbe d’accélération. Utilisez-le seulement pour la navigation, pas pour les animations de modales ou de popovers. Le générateur doit renvoyer une nouvelle `Animation` à chaque navigation ; Ionic la détruit après la transition. Conservez les événements de cycle de vie pour l’enregistrement des contrôles et les transitions sans animation.

L’adaptateur conserve les cibles d’animation du générateur, y compris tout effet horizontal du bouton de retour. Si vous voulez la transition iOS 27 avec cet effet exclu dans les dispositions verticales, utilisez plutôt `iosTransitionAnimation` de `@rdlabo/ionic-theme-ios27` comme `navAnimation`. Elle inclut déjà l’adaptateur ; aucune enveloppe n’est donc nécessaire.

### 3. Raccorder le placement de l’appareil et démarrer les contrôles

Après montage de `ion-app`, abonnez-vous aux changements de placement, lisez le placement initial et démarrez un seul runtime. Conservez le balisage `ion-app` existant ; l’utilitaire applique ou retire les classes selon l’état de l’appareil :

```ts
import { Foldable, type BarPlacement } from '@erkamyaman/capacitor-foldable';
import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const applyPlacement = ({ verticalBarEdge, inset }: BarPlacement) => setVerticalBarsLayout({ edge: verticalBarEdge, inset });
const listener = await Foldable.addListener('barPlacementChange', applyPlacement);
applyPlacement(await Foldable.getBarPlacement());
const rail = await enableNativeUI({ controls: 'verticalOnly' });
```

| Placement de l’appareil | Disposition Web |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `leading` ou `trailing` | Réserve le retrait signalé sur ce bord logique. L’utilitaire résout le RTL. |
| `null`, y compris le repli navigateur | Restaure la disposition ordinaire ; aucun rail latéral forcé. |

À la destruction du propriétaire de l’application, retirez son écouteur et détruisez le runtime qu’il détient :

```ts
await listener.remove();
await rail.destroy();
```

Si Native UI est déjà actif, conservez ce runtime et ajoutez seulement l’abonnement au placement. Ne démarrez pas un second runtime. Pour une configuration partagée et du CSS géré par l’application, consultez l’[intégration Foldable](vertical-bars.md#use-with-capacitor-foldable).

### Moment de la disposition initiale

Exécutez l’étape 3 depuis la racine de l’application dès le montage de `ion-app` ; n’attendez pas les requêtes de données d’une page routée. `setVerticalBarsLayout()` nécessite cet élément et ne mémorise pas le placement fourni avant le montage. Confiez démarrage et nettoyage au même propriétaire, comme dans les [exemples de cycle de vie des frameworks](setup.md#place-startup-in-your-frameworks-app-root).

Le démarrage natif, le placement et le rendu sont asynchrones. La résolution de `enableNativeUI()` fournit le handle du runtime, sans garantir que les contrôles sont déjà projetés. Démarrer rapidement évite une attente ajoutée par l’application, mais la disposition Web initiale peut rester visible avant la projection native.

### 4. Compiler, synchroniser et exécuter sur iPhone Duo

Compilez les ressources Web de l’application, puis synchronisez le projet natif :

```sh
npx cap sync ios
```

Compilez avec Xcode 27.1 ou ultérieur et exécutez sur iPhone Duo sous iOS 27.1 ou ultérieur. Conservez votre intégration SPM ou CocoaPods ; consultez la [configuration Native UI](setup.md#4-build-sync-and-run).

**Résultat attendu lorsque l’appareil signale un rail :** la barre d’onglets existante et les actions admissibles des barres d’outils fixes passent sur le côté. Le contenu conserve son thème et réserve le retrait mesuré. Les rails iOS compatibles utilisent SwiftUI ; sinon, le rail Web reste affiché. Les appareils signalant un bord null conservent leur disposition ordinaire. Utilisez l’[aperçu facultatif dans le navigateur](#optional-browser-preview) pour simuler un rail sans signalement de l’appareil.

Conservez vos gestionnaires de clic, votre routage et vos associations de formulaire. Par défaut, les actions nécessitent un `ion-icon` ou SVG avec `slot="icon-only"` dans une barre d’outils fixe. Tous les remplissages (`default`, `clear`, `solid`, `outline`) suivent cette règle, y compris les boutons d’envoi. Les autres actions restent horizontales. Utilisez `.ios-theme-horizontal-only` sur un groupe `ion-buttons` ou un `ion-button` individuel pour garder une action horizontale.

### Facultatif : choisir l’apparence native des boutons

Consultez [Choisir l’apparence des boutons](vertical-bars.md#choose-button-appearance) pour les réglages et remplacements locaux.

La valeur par défaut est `system` : SwiftUI habille les boutons verticaux et teinte leurs icônes. Pour que votre thème fournisse leur remplissage et leurs couleurs, remplacez uniquement l’appel `enableNativeUI` de l’étape 3 par celui-ci ; conservez l’abonnement Foldable :

```ts
const rail = await enableNativeUI({
  controls: 'verticalOnly',
  ionic: { verticalBars: { buttonProjection: 'source', buttonDefaultFill: 'solid' } },
});
```

La valeur par défaut `solid` convient aux boutons Ionic ordinaires. Les boutons dans `ion-buttons` restent sans remplissage par défaut ; définissez explicitement `fill="solid"` pour projeter leur fond. Pour les exceptions ponctuelles, utilisez [les réglages locaux de projection](vertical-bars.md#override-individual-buttons-or-groups). Ces réglages affectent uniquement les boutons verticaux natifs ; les clones Web conservent leur apparence existante.

### Si le rail n’apparaît pas

| Observation | Vérification |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Disposition ordinaire | Vérifiez le bord signalé par Foldable. Un bord null conserve volontairement la disposition ordinaire. |
| Bord signalé mais sans espace latéral | Chargez `vertical-bars.css` et appliquez le placement initial et les événements `barPlacementChange` après montage de `ion-app`. |
| L’espace apparaît mais les contrôles restent horizontaux | Démarrez le runtime une fois. Utilisez des onglets existants ou des actions `slot="icon-only"` compatibles dans une barre fixe d’en-tête/pied de page. |
| Une action reste horizontale | Vérifiez son slot d’icône, son placement fixe et ses exclusions. Consultez les [prérequis des contrôles](vertical-bars.md#toolbar-actions). |

## Aperçu facultatif dans le navigateur

Pour tester localement la disposition sans signalement de l’appareil, omettez temporairement l’abonnement Foldable de l’étape 3 et appliquez un placement simulé après montage de `ion-app` :

```ts
setVerticalBarsLayout({ edge: 'trailing', inset: 80 });
```

Conservez la même feuille de style et un seul runtime Native UI. Utilisez `leading` pour prévisualiser l’autre bord logique, ou `null` pour restaurer la disposition ordinaire. L’utilitaire gère `ios-theme-vertical-bars` et sa variante gauche physique ; les classes manuelles ne font pas partie de la configuration de l’appareil. Consultez les [classes de disposition](../../theme-ios27/docs/vertical-bars-layout.md#reserve-the-vertical-rail) pour les aperçus uniquement CSS.

Les onglets du rail Web affichent leurs icônes et révèlent leurs libellés pendant l’appui et le glissement. L’aperçu navigateur vérifie la disposition et les actions Web, pas l’apparence SwiftUI native. Restaurez l’abonnement Foldable avant la compilation pour l’appareil.

## Utiliser la posture de charnière sans projeter de contrôles

Si votre thème existant a seulement besoin d’un panneau divisé piloté par la posture ou d’un changement de disposition, ne démarrez pas d’environnement de projection et n’ajoutez pas `.ios-theme-vertical-bars`. Transmettez les résultats de `Foldable.getFoldState()` et les événements `foldStateChange` à `applyFoldStateClasses(root, fold)`, puis supprimez l’écouteur une fois terminé. Il n’y a pas d’appel de surveillance distinct pour démarrer ou arrêter.

Consultez [Lire la disposition de l’appareil](../../theme-ios27/docs/vertical-bars-layout.md#read-the-device-layout) pour l’exemple d’abonnement, les valeurs null et la durée de vie de la surveillance. Consultez [Adapter le panneau divisé](../../theme-ios27/docs/vertical-bars-layout.md#adapt-the-split-pane) pour les règles de largeur à activer et l’état à moitié ouvert.

## Règles de disposition partagées et API

La gestion des zones de sécurité, superpositions, RTL, admissibilité, simulation Web et API du handle est décrite dans [Vertical Bars](vertical-bars.md). Consultez cette référence pour personnaliser la configuration ; ce n’est pas une étape d’installation supplémentaire.
