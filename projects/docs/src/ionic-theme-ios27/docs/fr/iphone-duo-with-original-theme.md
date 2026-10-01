---
title: "iPhone Duo avec votre thème existant (préversion)"
sourceRevision: "d57e8b71bcd0719317f88e68e7e6202bedc90beb6a0ce1e374d2a4003003431f"
---
# iPhone Duo avec votre thème existant (préversion)

Ajoutez une zone de navigation verticale à votre application Ionic en conservant son thème existant. Les onglets et actions de barre d’outils pris en charge se déplacent sur le côté de l’écran ; votre contenu et vos contrôles horizontaux gardent leur apparence actuelle. Les modes Ionic `ios` et `md` sont tous deux pris en charge.

**Essayez d’abord dans Chrome.** Vous pouvez prévisualiser la disposition avec les contrôles Web avant de configurer un iPhone Duo ou un build iOS. Sur Capacitor iOS pris en charge, le même balisage Ionic fournit des contrôles SwiftUI natifs dans le rail système.

Disponible dans `1.2.0` en **préversion**. Les API et comportements pris en charge peuvent changer.

## Essayer dans votre application Ionic existante

### 1. Installer et charger la feuille de style autonome

Ce guide suppose une application Ionic existante avec Ionic `>=8.8.1 <10` et Capacitor Core `>=8 <9`. Conservez votre installation Capacitor 8 existante. Si l’application utilise une autre version majeure de Capacitor, migrez ensemble ses packages Core, CLI et de plateformes avant de suivre ce guide. Pour une application Web sans Capacitor, installez également `@capacitor/core@^8` ; le point d’entrée JavaScript en a besoin même dans Chrome.

```bash
npm install @rdlabo/ionic-theme-ios27@1.2.0
```

Conservez vos imports de thème existants. Ajoutez ceci à votre fichier Sass global :

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

Le point d’entrée JavaScript autonome nécessite `@capacitor/core` même dans Chrome. Les feuilles de style du thème iOS 27 ne sont pas requises.

### 2. Activer la disposition latérale dans votre application

Ajoutez la classe à la racine existante de votre application et gardez le contenu à l’intérieur :

```html
<ion-app class="ios-theme-vertical-bars">
  <!-- Conservez ici vos pages, onglets et contrôles de barre d’outils existants. -->
</ion-app>
```

L’aperçu réserve `80px` à droite physiquement. Pour prévisualiser le côté gauche, ajoutez aussi `ios-theme-vertical-bars-left`.

### 3. Connecter votre animation de navigation

Configurez `navAnimation` avant l’initialisation d’Ionic. Démarrer l’environnement du rail n’enregistre pas cette option. L’adaptateur attend le retrait des contrôles natifs et coordonne la progression du balayage et l’annulation tout en conservant votre animation existante.

#### Garder l’animation par défaut d’Ionic

Si vous n’avez pas configuré `navAnimation`, enveloppez les générateurs standard d’Ionic. Sélectionnez le générateur selon le `mode` de transition Ionic pour que `ios` et `md` gardent leur animation habituelle :

```ts
import { iosTransitionAnimation, mdTransitionAnimation, type AnimationBuilder } from '@ionic/core';
import { withNativeUIShellTransition } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const defaultTransition: AnimationBuilder = (baseEl, opts) =>
  (opts.mode === 'ios' ? iosTransitionAnimation : mdTransitionAnimation)(baseEl, opts);

const ionicConfig = {
  navAnimation: withNativeUIShellTransition(defaultTransition),
};
```

Fusionnez cette option avec votre configuration Ionic existante avant l’initialisation : passez-la à `provideIonicAngular()` d’Angular, à `setupIonicReact()` de React ou aux options du plugin `IonicVue` de Vue. Conservez vos imports de feuilles de style de thème. Aucune feuille de style du thème iOS 27 n’est requise.

#### Utiliser l’animation iOS de ce package

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
import { withNativeUIShellTransition } from '@rdlabo/ionic-theme-ios27/vertical-bars';

// Transmettre le constructeur d’animation déjà utilisé par l’application.
const configureNavigation = (existingTransition: AnimationBuilder) => ({
  navAnimation: withNativeUIShellTransition(existingTransition),
});
```

L’adaptateur renvoie l’`Animation` d’origine, en conservant ses effets, sa durée et sa courbe d’accélération. Utilisez-le seulement pour la navigation, pas pour les animations de modales ou de popovers. Le générateur doit renvoyer une nouvelle `Animation` à chaque navigation ; Ionic la détruit après la transition. Conservez les événements de cycle de vie pour l’enregistrement des contrôles et les transitions sans animation.

L’adaptateur conserve les cibles d’animation du générateur, y compris tout effet horizontal du bouton de retour. Si vous voulez la transition iOS 27 avec cet effet exclu dans les dispositions verticales, utilisez plutôt `iosTransitionAnimation` de `@rdlabo/ionic-theme-ios27` comme `navAnimation`. Elle inclut déjà l’adaptateur ; aucune enveloppe n’est donc nécessaire.

### 4. Démarrer les contrôles après le montage de la racine de l’application

Appelez ceci une seule fois au démarrage de votre application, une fois `ion-app` présent dans le DOM :

```ts
import { enableVerticalControlArea } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const rail = await enableVerticalControlArea();
```

**Résultat attendu :** votre barre d’onglets existante se déplace sur le côté et les boutons fixes de barre d’outils contenant un `ion-icon` ou SVG avec `slot="icon-only"` y apparaissent aussi. Le contenu conserve son thème existant et laisse de la place aux contrôles. Le rail d’onglets Web affiche les icônes ; un appui suivi d’un glissement révèle les libellés des onglets.

Utilisez vos gestionnaires de clic Ionic, vos routes et vos associations de formulaires existants. Tous les remplissages de bouton (`default`, `clear`, `solid` et `outline`) suivent la même règle `icon-only`, y compris les boutons de soumission. Les actions sans ce slot restent horizontales. Ajoutez `.ios-theme-horizontal-only` à un groupe `ion-buttons` ou à un `ion-button` individuel pour garder une action dans la barre d’outils horizontale.

Lors de la destruction du propriétaire dans l’application, appelez `await rail.destroy()` pour rétablir les contrôles d’origine et libérer l’environnement. Si vous utilisez déjà `enableNativeUIShell()`, gardez cet environnement et suivez [le guide de placement partagé](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo#project-controls-into-the-rail).

### Facultatif : choisir l’apparence native des boutons

`buttonProjection` et les réglages locaux de projection sont disponibles dans `1.2.0`. Consultez [Choisir l’apparence des boutons](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#choose-button-appearance) pour la disponibilité et les détails de migration.

La nouvelle valeur par défaut est `system` : SwiftUI définit le style des boutons verticaux et teinte leurs icônes. Pour que votre thème existant fournisse leur remplissage et leurs couleurs, utilisez :

```ts
const rail = await enableVerticalControlArea({ buttonProjection: 'source', buttonDefaultFill: 'solid' });
```

La valeur par défaut `solid` convient aux boutons Ionic ordinaires. Les boutons dans `ion-buttons` restent sans remplissage par défaut ; définissez explicitement `fill="solid"` pour projeter leur fond. Pour les exceptions ponctuelles, utilisez [les réglages locaux de projection](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#override-individual-buttons-or-groups). Ces réglages affectent uniquement les boutons verticaux natifs ; les clones Web conservent leur apparence existante.

### Si l’aperçu n’apparaît pas

| Ce que vous voyez | Ce qu’il faut vérifier |
| --- | --- |
| Aucun espace sur le côté | Chargez `vertical-bars.css` et placez la classe sur `ion-app`. |
| L’espace apparaît, mais les contrôles restent horizontaux | Démarrez `enableVerticalControlArea()` après le montage de la racine de l’application. Utilisez les onglets existants ou les actions `slot="icon-only"` dans une barre d’outils fixe d’en-tête ou de pied de page. |
| Une action reste horizontale | Vérifiez la présence de `slot="icon-only"` sur l’icône et d’une barre d’outils fixe hors du contenu défilant. Les contrôles explicitement exclus et ceux des modales centrées restent horizontaux ; `fill` et `type="submit"` n’empêchent pas le déplacement. Consultez [les prérequis des contrôles](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#toolbar-actions). |

## Connecter un iPhone Duo

Installez [`@erkamyaman/capacitor-foldable`](https://github.com/erkamyaman/capacitor-foldable) pour l’état de l’appareil :

```bash
npm install @erkamyaman/capacitor-foldable
npx cap sync ios
```

Utilisez Capacitor 8.5 ou ultérieur et compilez avec Xcode 27.1 ou plus récent pour le placement réel du rail et la posture de charnière sur iOS 27.1. Native UI Shell utilise Swift Package Manager ; les applications CocoaPods existantes peuvent suivre [la configuration de Native UI Shell](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/native-ui-shell#enable-the-shell). Gardez le `vertical-bars.css` de ce package ; le `ionic-tabs.css` du plugin d’appareil n’est pas nécessaire avec notre projection de rail.

Remplacez le démarrage réservé au navigateur par [la configuration du placement sur appareil](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo#project-controls-into-the-rail). Celle-ci transmet les valeurs initiales et les événements `barPlacementChange` à `setVerticalControlAreaPlacement({ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset })`, avec les abonnements et leur nettoyage gérés dans votre application.

Passez à la fois le bord demandé et le bord natif, avec l’inset mesuré par Foldable. L’API de placement résout le RTL. Un bord null rétablit la disposition ordinaire.

Sur iOS pris en charge, les contrôles du rail utilisent le rendu SwiftUI natif ; votre style Web personnalisé continue de s’appliquer au contenu ordinaire et aux contrôles horizontaux. Le Web et Android utilisent des clones Web.

## Utiliser la posture de charnière sans projeter de contrôles

Si votre thème existant a seulement besoin d’un panneau divisé piloté par la posture ou d’un changement de disposition, ne démarrez pas d’environnement de projection et n’ajoutez pas `.ios-theme-vertical-bars`. Transmettez les résultats de `Foldable.getFoldState()` et les événements `foldStateChange` à `applyFoldStateClasses(root, fold)`, puis supprimez l’écouteur une fois terminé. Il n’y a pas d’appel de surveillance distinct pour démarrer ou arrêter.

Consultez [Lire la disposition de l’appareil](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo#read-the-device-layout) pour l’exemple d’abonnement, les valeurs null et la durée de vie de la surveillance. Consultez [Adapter le panneau divisé](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo#adapt-the-split-pane) pour les règles de largeur à activer et l’état à moitié ouvert.

## Règles de disposition partagées et API

La gestion des zones sûres, les superpositions, le RTL, l’admissibilité des contrôles, la simulation Web et l’API du handle sont documentés dans [Barres verticales](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars). Ces règles s’appliquent aussi à cette configuration autonome.
