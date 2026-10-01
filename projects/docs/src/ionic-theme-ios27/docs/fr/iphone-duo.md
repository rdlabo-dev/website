---
title: "Prise en charge d’iPhone Duo (préversion)"
sourceRevision: "af84778f250e7c9b7444b30416936c3b14e436e18ac674b210a123ba7582c3df"
---
# Prise en charge d’iPhone Duo (préversion)

Adaptez votre application Ionic à l’iPhone Duo : placez la navigation et les actions dans son rail système vertical et ajustez le panneau divisé selon l’ouverture et la fermeture de l’appareil. Le balisage Ionic existant reste la source des libellés, icônes, routes et gestionnaires de clic.

**Vous débutez ?** Commencez par [iPhone Duo avec votre thème existant](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme) pour prévisualiser la disposition latérale dans Chrome. Cette page explique les événements de l’appareil, le placement et les panneaux divisés. [Barres verticales](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars) documente la projection des contrôles et l’API d’exécution.

Disponible dans `1.2.0` en **préversion**, avec [Native UI Shell](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/native-ui-shell). Les API et comportements pris en charge peuvent changer avant le statut stable. Celui-ci est prévu après la sortie officielle de Xcode 27.1. Le véritable rail système et les informations de charnière nécessitent iOS 27.1 ou ultérieur et une application compilée avec Xcode 27.1 ou plus récent.

Ce package fournit deux éléments indépendants pour ce matériel. Chacun fonctionne **sans les feuilles de style du thème iOS 27** et **sans le Native UI Shell complet** :

- `dist/css/vertical-bars.css` — classes à activer explicitement pour réserver la zone sûre du rail, avec une propriété personnalisée enregistrée pour une largeur de panneau divisé pilotée par la posture.
- `enableVerticalControlArea()` — déplace les onglets et contrôles de barre d’outils admissibles dans la zone réservée. Sur Capacitor iOS, ils sont rendus par un `TabView` et une barre d’outils SwiftUI natifs ; ailleurs, ces mêmes contrôles apparaissent sous forme de clones Web.

L’état de l’appareil relève de [`@erkamyaman/capacitor-foldable`](https://github.com/erkamyaman/capacitor-foldable). L’**application** s’abonne à ses événements et choisit sa disposition. La **feuille de style et l’environnement d’exécution** de ce package appliquent cette décision en réservant l’espace, en projetant les contrôles et en adaptant le panneau divisé. Le thème ne surveille ni l’état de la charnière ni le placement des barres.

## Choisir ce que vous adoptez

Pour garder votre thème existant et ajouter seulement la prise en charge autonome, suivez [iPhone Duo avec votre thème existant](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme). Cette page couvre les règles communes de disposition selon l’appareil.

| Objectif                                             | Feuille de style          | Environnement d’exécution                                                            |
| ------------------------------------------------ | ------------------- | ------------------------------------------------------------------ |
| Posture de charnière uniquement (changements de disposition) | aucun | aucun — abonnez-vous directement à `Foldable` |
| Largeur de panneau divisé pilotée par la posture | `vertical-bars.css` | aucun — abonnez-vous directement à `Foldable` |
| Rail vertical pour les onglets et actions de barre d’outils       | `vertical-bars.css` | `enableVerticalControlArea()`                                      |
| Shell natif avec le rail                       | `vertical-bars.css` | `enableNativeUIShell()` — inclut la projection du rail |

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

La feuille de style ne modifie jamais à elle seule l’interface Ionic ordinaire ; chaque règle exige une classe à activer explicitement. Chargez-la sans condition — ces valeurs sont des entrées de simulation et de disposition, indépendantes des variables habituelles de zone sûre d’Ionic.

Le point d’entrée `/vertical-bars` importe `@capacitor/core` au chargement du module ; installez-le donc même pour un usage Web uniquement (c’est une dépendance pair facultative). Les applications qui souhaitent seulement la feuille de style et ses classes facultatives n’ont besoin de rien d’autre.

## Lire la disposition de l’appareil

Installez le plugin d’état de l’appareil dans l’application, puis synchronisez le projet natif :

```bash
npm install @erkamyaman/capacitor-foldable
npx cap sync
```

Utilisez Capacitor 8.5 ou ultérieur et compilez avec Xcode 27.1 ou plus récent pour les API iOS 27.1 de l’iPhone Duo. Cette dépendance est nécessaire pour la disposition pilotée par l’appareil, pas pour le CSS du thème, la simulation dans le navigateur ou la seule projection native des contrôles. N’importez pas le `ionic-tabs.css` du plugin avec la projection de rail de ce package ; les deux repositionneraient les mêmes onglets.

Une fois `ion-app` monté, transmettez l’état de l’appareil à `applyFoldStateClasses`. L’application gère les abonnements et leur nettoyage. Aucun environnement de projection n’est nécessaire pour une disposition pilotée par la posture.

```ts
import { Foldable } from '@erkamyaman/capacitor-foldable';
import { applyFoldStateClasses } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const root = document.querySelector('ion-app')!;
const listener = await Foldable.addListener('foldStateChange', (fold) => applyFoldStateClasses(root, fold));
applyFoldStateClasses(root, await Foldable.getFoldState());
```

Lors de la destruction du propriétaire dans l’application :

```ts
await listener.remove();
```

Abonnez-vous aux changements, puis lisez l’état actuel. Le même utilitaire traite les valeurs initiales et les événements.

`applyFoldStateClasses` conserve l’une des classes `ios-theme-fold-flat`, `ios-theme-fold-half-opened` et `ios-theme-fold-closed` sur la racine fournie, sans modifier les autres classes. Il définit également `ios-theme-fold-expanded` pour un état à moitié ouvert ou un état à plat avec géométrie de charnière. Un état à plat sans géométrie (y compris le repli Web) et un état fermé suppriment cette classe. L’utilitaire ne s’abonne pas au plugin et ne modifie pas la propriété `when` du panneau divisé Ionic.

Pour placer le rail, utilisez `setVerticalControlAreaPlacement` comme ci-dessous. Passez le bord logique signalé à la fois comme `edge` et `nativeEdge`, avec l’`inset` mesuré. Le bord de début correspond à la gauche physique en LTR et à la droite physique en RTL. Un bord null rétablit la disposition ordinaire ; un inset nul supprime la largeur explicite. Aucun appel de démarrage ou d’arrêt de surveillance n’est nécessaire.

Le rayon des coins de la WebView reste une question de rendu : `configureNativeTransition()` utilise l’API `getWebViewMetrics()` du shell indépendamment de `Foldable`.

**Migration :** les anciennes API du thème `DeviceLayout`, `HingeStatus`, `getDeviceLayout()`, `deviceLayoutChange` et de démarrage/arrêt de surveillance de la disposition ont été supprimées. Remplacez les abonnements de l’appareil par les API `Foldable` ci-dessus ; utilisez `getWebViewMetrics()` pour une lecture ponctuelle du rayon. Foldable peut déduire le placement des barres Duo des insets de zone sûre lorsque l’application est compilée sans le SDK iOS 27.1. Les données de charnière nécessitent encore le SDK plus récent. Les applications peuvent aussi demander un placement de rail fixe indépendamment du bord signalé.

## Réserver le rail vertical

Chargez `vertical-bars.css` comme indiqué plus haut. Pour la simulation par classes dans le navigateur, la gestion des zones sûres, le RTL et la disposition des superpositions, consultez [Réserver le rail vertical](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#reserve-the-vertical-rail). Sur l’appareil, l’utilitaire de placement ci-dessous applique les classes de disposition et l’inset mesuré.

## Projeter les contrôles dans le rail

Démarrez une seule fois l’environnement autonome après le montage de `ion-app` et appliquez le placement du plugin avec `setVerticalControlAreaPlacement` :

```ts
import { Foldable } from '@erkamyaman/capacitor-foldable';
import { setVerticalControlAreaPlacement, enableVerticalControlArea } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const rail = await enableVerticalControlArea();
const listener = await Foldable.addListener('barPlacementChange', ({ verticalBarEdge, inset }) =>
  setVerticalControlAreaPlacement({ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset }),
);
const { verticalBarEdge, inset } = await Foldable.getBarPlacement();
setVerticalControlAreaPlacement({ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset });
```

Lors de la destruction du propriétaire dans l’application :

```ts
await listener.remove();
await rail.destroy();
```

Fournissez `nativeEdge` lors de la lecture initiale et à chaque événement, afin que le moteur de rendu sache quel rail le système fournit réellement. L’`inset` mesuré est transmis tel quel plutôt que de supposer une largeur fixe. Les appareils sans rail signalé, y compris sur Web et Android, renvoient un bord null et gardent la disposition ordinaire. Pour la simulation dans le navigateur, utilisez [l’aperçu par classes](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#reserve-the-vertical-rail) sans connecter le placement de l’appareil.

Démarrez soit `enableVerticalControlArea()`, soit le `enableNativeUIShell()` complet — pas les deux. Si l’application utilise déjà Native UI Shell, gardez cet environnement et utilisez le même callback `setVerticalControlAreaPlacement`. Le propriétaire dans l’application supprime ses écouteurs et détruit son environnement à la fin de son cycle de vie.

Sur les versions iOS prises en charge, l’environnement transfère les onglets admissibles, la navigation de retour, les boutons de menu et les actions fixes de barre d’outils à un `TabView` et une barre d’outils SwiftUI natifs ; sur le Web, Android ou lorsque la projection native est indisponible, les clones Web restent le repli. Consultez [Actions de barre d’outils](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#toolbar-actions) pour l’admissibilité des contrôles.

### Actions de barre d’outils

Consultez [Barres verticales : actions de barre d’outils](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#toolbar-actions) pour le balisage admissible, le placement, l’apparence des boutons et les exceptions locales.

### Barre d’onglets

Consultez [Barres verticales : barre d’onglets](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#tab-bar) pour la navigation, les libellés et le comportement du repli Web.

## Adapter le panneau divisé

Pour un menu côte à côte sur iPhone Duo, activez sur `ion-split-pane` la disposition Réglages mesurée séparément. La barre latérale fait 320pt lorsque l’appareil est entièrement déplié et atteint le milieu de l’écran lorsqu’il est à moitié ouvert (50vw). L’application fournit la posture ; les deux états ont la même largeur de viewport, et une media query de largeur ne peut donc pas les distinguer :

```html
<ion-split-pane
  class="split-pane-fold-layout"
  contentId="main-content"
  when="(min-width: 900px)"
>
  <ion-menu contentId="main-content">...</ion-menu>
  <div id="main-content">...</div>
</ion-split-pane>
```

Définissez la largeur ordinaire du panneau divisé à 320pt dans la feuille de style de l’application et laissez la classe d’ouverture à moitié modifier uniquement sa largeur :

```css
ion-split-pane.split-pane-fold-layout {
  --ios-theme-menu-width: var(--ios-theme-split-pane-width);
  --side-width: var(--ios-theme-menu-width);
  --side-max-width: var(--ios-theme-menu-width);
  transition: --ios-theme-split-pane-width 300ms ease;
}
```

La propriété enregistrée `--ios-theme-split-pane-width` vaut `320px` par défaut. `applyFoldStateClasses` définit `ios-theme-fold-half-opened` sur `ion-app` ; la feuille de style définit ensuite à `50vw` uniquement les panneaux divisés descendants portant `split-pane-fold-layout`. Ajoutez une seule fois cette classe d’activation ; aucune liaison de classe dépendante de l’état n’est nécessaire. Les autres panneaux divisés conservent leur largeur existante.

Le `when` d’Ionic contrôle toujours si le menu est persistant. L’exemple choisit un seuil fixe de 900px. Si votre application nécessite des seuils différents pour les écrans pliés et ordinaires, utilisez la classe `ios-theme-fold-expanded` appliquée par l’utilitaire pour choisir cette politique dans votre code de disposition. L’utilitaire met seulement à jour les classes d’état, pas `when`. Cette disposition n’active pas Vertical Bars et ne déplace pas un menu en superposition.

## API Vertical Control Area

La référence du handle de l’environnement est maintenue dans [Barres verticales](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#vertical-control-area-api).
