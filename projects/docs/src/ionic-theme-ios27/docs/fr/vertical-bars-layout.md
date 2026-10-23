---
title: "Disposition Vertical Bars"
sourceRevision: "d44ef6bac3a446d8c851aace15b7206a32031020192bc565a309a994b4d0d204"
---
# Disposition Vertical Bars

Cette feuille de style facultative du thème gère l’espacement et le positionnement Web autour d’un rail vertical. Elle peut accompagner votre thème existant sans charger toute l’apparence iOS 27. Le rendu natif et la synchronisation d’état sont fournis séparément par [Capacitor Native UI](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.2/packages/capacitor-native-ui/docs/vertical-bars.md).

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

Le comportement décrit ci-dessous suppose que cette feuille est chargée. Pour configurer le runtime natif et le placement sur l’appareil, suivez le [guide d’intégration](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.2/packages/capacitor-native-ui/docs/ionic-vertical-bars.md).

## Réserver le rail vertical

Pour configurer l’appareil, utilisez le plugin Foldable installé et appliquez son placement initial et ses événements avec `setVerticalBarsLayout` ; suivez la [configuration standard du rail Ionic](../../capacitor-native-ui/docs/ionic-vertical-bars.md). Les classes ci-dessous décrivent les entrées de disposition du CSS et la simulation facultative dans le navigateur, pas une étape manuelle de configuration de l’appareil.

Ajoutez `.ios-theme-vertical-bars` à `ion-app` pour réserver la zone de rail physiquement à droite, ou ajoutez également `.ios-theme-vertical-bars-left` pour utiliser le côté gauche physique :

```html
<ion-app class="ios-theme-vertical-bars">...</ion-app>
```

Les classes sont physiques — `-left` désigne toujours le bord gauche physique — car le CSS et le moteur de rendu natif utilisent des coordonnées physiques. `setVerticalBarsLayout` applique le `verticalBarEdge` logique signalé par le plugin selon la direction du document ; une application RTL n’a donc pas à effectuer sa propre conversion.

### Largeur du rail

| Source | Largeur réservée |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Classes seules, y compris les aperçus Chrome | `80px` ; aucun plugin natif requis. |
| `setVerticalBarsLayout({ edge, inset })` | Le retrait fourni, même inférieur à `80px`. |
| Aperçu CSS personnalisé | Remplacez `--ios-theme-vertical-bars-safe-area-left` ou `--ios-theme-vertical-bars-safe-area-right`. |

### Disposition du contenu et des superpositions

| Surface | Disposition avec la feuille de style du rail |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routeurs et arrière-plans des composants | Restent sur toute la fenêtre. |
| `ion-content` | Met en retrait son premier plan défilant. |
| `ion-toolbar` | Met en retrait le premier plan de son conteneur. |
| `ion-fab` | S’ajuste uniquement à côté de l’interface système. |
| `ion-modal` pleine largeur, y compris les feuilles | Applique le retrait au premier plan. Avec le runtime actif, la modale supérieure projette les contrôles admissibles de sa barre d’outils dans son propre rail ; les rails des feuilles suivent leurs limites visibles lorsque le palier change. |
| Modale centrée | Conserve les boutons de barre d’outils sans retrait du rail de page. |
| `ion-menu` / `ion-popover` | Les composants internes au premier plan conservent la gestion standard des zones de sécurité Ionic, sans conversion de la page principale. |
| Menu à côté de l’interface système | Conserve son hôte d’animation sur toute la fenêtre ; seul le conteneur visible est décalé du retrait. |
| Menu du côté opposé | Inchangé. |

La variable de zone de sécurité Ionic correspondante est réinitialisée dans les composants de premier plan en retrait pour éviter que leurs descendants ajoutent à nouveau ce retrait.

L’admissibilité d’une modale dépend de sa largeur visible, pas de la posture de la charnière ni du type de modale. Gauche et droite restent des coordonnées physiques en RTL ; `side="start"` et `side="end"` d’Ionic restent logiques.

Le mode est indépendant du mode des composants : une application peut garder `mode: 'md'` d’Ionic sur iOS tout en activant Vertical Bars. Aucun composant n’a besoin de `mode="ios"`.

## API de disposition

```ts
import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';

setVerticalBarsLayout({ edge: 'trailing', inset: 80 });
// Vous pouvez fournir ensuite un élément racine et un booléen RTL explicite.
setVerticalBarsLayout({ edge: null }); // restaurer la disposition Web ordinaire
```

L’utilitaire agit uniquement sur le CSS Web et fonctionne sans Capacitor ni démarrage de Native UI. L’application fournit l’état de l’appareil et gère les abonnements. Démarrer, désactiver ou détruire Native UI ne modifie ni ces classes ni le retrait réservé. Les rails natifs non pris en charge conservent le rail Web choisi ; choisissez explicitement `edge: null` pour revenir à une disposition horizontale.

## Lire la disposition de l’appareil

Les commandes standard d’installation du thème et de Native UI installent Foldable comme dépendance distincte de l’application. Après compilation des ressources Web, synchronisez le projet natif :

```bash
npx cap sync
```

Utilisez Capacitor 8.5 ou ultérieur et Xcode 27.1 ou ultérieur pour les API iOS 27.1 d’iPhone Duo. Foldable fournit placement et posture dans la configuration standard. La simulation dans le navigateur peut remplacer temporairement son abonnement par des valeurs fixes. N’importez pas `ionic-tabs.css` du plugin avec la projection de rail de ce package : les deux repositionneraient les mêmes onglets.

Une fois `ion-app` monté, transmettez l’état de l’appareil à `applyFoldStateClasses`. L’application gère les abonnements et leur nettoyage. Aucun environnement de projection n’est nécessaire pour une disposition pilotée par la posture.

```ts
import { Foldable } from '@erkamyaman/capacitor-foldable';
import { applyFoldStateClasses } from '@rdlabo/ionic-theme-ios27';

const root = document.querySelector('ion-app')!;
const listener = await Foldable.addListener('foldStateChange', (fold) => applyFoldStateClasses(root, fold));
applyFoldStateClasses(root, await Foldable.getFoldState());
```

Lors de la destruction du propriétaire dans l’application :

```ts
await listener.remove();
```

Abonnez-vous aux changements, puis lisez l’état actuel. Le même utilitaire traite les valeurs initiales et les événements.

### Classes de posture

`applyFoldStateClasses` met à jour la racine fournie en préservant les classes sans rapport :

| Classe | Appliquée lorsque |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `ios-theme-fold-flat` | Posture à plat. |
| `ios-theme-fold-half-opened` | Posture à demi ouverte. |
| `ios-theme-fold-closed` | Posture fermée. |
| `ios-theme-fold-expanded` | À demi ouvert, ou à plat avec géométrie de charnière. Retirée à plat sans géométrie (y compris le repli Web) et en posture fermée. |

Une seule des trois premières classes est conservée. L’utilitaire ne s’abonne pas au plugin et ne modifie pas la propriété `when` du panneau divisé Ionic.

## Adapter le panneau divisé

Pour un menu côte à côte sur iPhone Duo, activez la disposition du thème selon la posture sur `ion-split-pane`. Cette feuille de style utilise par défaut `320px` entièrement déplié et `50vw` à demi ouvert. Ce sont des valeurs du thème, sans garantie de correspondre à celles de l’app Réglages du système. L’application fournit la posture ; les deux états peuvent avoir la même largeur de fenêtre, qu’une requête média de largeur ne peut donc pas distinguer :

```html
<ion-split-pane class="split-pane-fold-layout" contentId="main-content" when="(min-width: 900px)">
  <ion-menu contentId="main-content">...</ion-menu>
  <div id="main-content">...</div>
</ion-split-pane>
```

Reliez la largeur du panneau divisé à la variable du thème dans la feuille de style de l’application, et laissez la classe à demi ouvert modifier uniquement cette largeur :

```css
ion-split-pane.split-pane-fold-layout {
  --ios-theme-menu-width: var(--ios-theme-split-pane-width);
  --side-width: var(--ios-theme-menu-width);
  --side-max-width: var(--ios-theme-menu-width);
  transition: --ios-theme-split-pane-width 300ms ease;
}
```

La propriété enregistrée `--ios-theme-split-pane-width` vaut `320px` par défaut. `applyFoldStateClasses` définit `ios-theme-fold-half-opened` sur `ion-app` ; la feuille de style définit ensuite à `50vw` uniquement les panneaux divisés descendants portant `split-pane-fold-layout`. Ajoutez une seule fois cette classe d’activation ; aucune liaison de classe dépendante de l’état n’est nécessaire. Les autres panneaux divisés conservent leur largeur existante.

`ios-theme-fold-expanded` décrit l’utilisation de l’écran intérieur ; elle ne choisit pas la largeur de la barre latérale. Un écran entièrement déplié conserve la largeur ordinaire. Seule `ios-theme-fold-half-opened` sélectionne `50vw` pour les panneaux ayant activé ce comportement.

Le `when` d’Ionic contrôle toujours si le menu est persistant. L’exemple choisit un seuil fixe de 900px. Si votre application nécessite des seuils différents pour les écrans pliés et ordinaires, utilisez la classe `ios-theme-fold-expanded` appliquée par l’utilitaire pour choisir cette politique dans votre code de disposition. L’utilitaire met seulement à jour les classes d’état, pas `when`. Cette disposition n’active pas Vertical Bars et ne déplace pas un menu en superposition.

## Migration

Remplacez les appels `setVerticalControlAreaPlacement` du plugin par `setVerticalBarsLayout({ edge, inset })` du thème. Déplacez aussi les imports `applyFoldStateClasses` vers le thème. Supprimez `nativeEdge` : il ne signale plus la disponibilité. Les anciens utilitaires du plugin sont obsolètes ; mettez à jour les imports avec le [guide de migration](../../capacitor-native-ui/docs/migration.md#web-layout-ownership).
