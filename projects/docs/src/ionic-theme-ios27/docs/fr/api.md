---
title: "API"
sourceRevision: "2471f37ae68e410f46c88dcff67733da85884fe049f397d55eab58279d7dbba2"
---
Référence de l’API JavaScript exportée par `@rdlabo/ionic-theme-ios27` v1.2.0. Les points d’entrée CSS et Sass restent documentés dans le README.

## Effets

#### `function` registerTabBarEffect

`(targetElement: HTMLElement) => registeredEffect | undefined`

Enregistre l’effet de sélection Liquid Glass pour une barre d’onglets Ionic.

#### `function` registerSegmentEffect

`(targetElement: HTMLElement) => registeredEffect | undefined`

Enregistre l’effet de sélection Liquid Glass pour un segment Ionic.

#### `interface` registeredEffect

| Membre        | Type         | Description                                                    |
| ------------- | ------------ | -------------------------------------------------------------- |
| **`destroy`** | `() => void` | Supprime les écouteurs et les éléments d’effet créés lors de l’enregistrement. |

#### `interface` EffectScales

| Propriété         | Type     | Description               |
| ------------ | -------- | ------------------------- |
| **`small`**  | `string` | Petite échelle d’effet.       |
| **`medium`** | `string` | Échelle d’effet moyenne.      |
| **`large`**  | `string` | Grande échelle d’effet.       |
| **`xlarge`** | `string` | Très grande échelle d’effet. |

## Barre d’onglets avec recherche

#### `function` attachTabBarSearchable

`(ionTabBar: HTMLElement, ionFabButton: HTMLElement, ionFooter: HTMLElement) => TabBarSearchableFunction`

Attache la transition de la barre d’onglets avec recherche et renvoie son gestionnaire d’événements.

#### `enum` TabBarSearchableType

| Membre      | Valeur     | Description             |
| ----------- | --------- | ----------------------- |
| **`Enter`** | `"enter"` | Active le mode recherche. |
| **`Leave`** | `"leave"` | Quitte le mode recherche. |

#### `type alias` TabBarSearchableFunction

`(event: Event, type: TabBarSearchableType) => Promise<void>`

## Animations

#### `function` withNativeUIShellTransition

`(builder: AnimationBuilder) => AnimationBuilder`

Enveloppe un constructeur d’animation de navigation Ionic pour coordonner le retrait des contrôles natifs, la progression du glissement et l’annulation, tout en conservant l’animation renvoyée. Exporté depuis la racine du package et `/vertical-bars`. Enregistrez-le comme `navAnimation` ; utilisez une nouvelle `Animation` à chaque navigation. L’`iosTransitionAnimation` du package inclut déjà cet adaptateur. Consultez la [configuration avec un thème existant](/docs/iphone-duo-with-original-theme) pour les constructeurs Ionic par défaut et personnalisés.

#### `function` iosTransitionAnimation

`(navEl: HTMLElement, opts: TransitionOptions) => Animation`

Construit la transition de navigation iOS du package.

#### `function` setConfig

`(config: Partial<IosTransitionConfig>) => void`

Définit le rayon de la transition de page. Il vaut `0` par défaut ; les applications natives peuvent fournir le rayon mesuré de la WebView.

#### `interface` IosTransitionConfig

| Propriété         | Type     | Description                      |
| ------------ | -------- | -------------------------------- |
| **`radius`** | `number` | Rayon des coins de la transition de page.   |

#### `function` popoverEnterAnimation

`(baseEl: HTMLElement, opts?: any) => Animation`

Construit l’animation d’entrée des popovers iOS.

#### `function` popoverLeaveAnimation

`(baseEl: HTMLElement) => Animation`

Construit l’animation de sortie des popovers iOS.

## Barre de recherche

#### `function` supportSeachbarCancelButtonIcon

`(searchbar: HTMLIonSearchbarElement) => SearchbarCancelButtonIconSupport`

Prise en charge temporaire du rendu de `cancelButtonIcon` d’Ionic en mode iOS. Importez `Seachbar` avec cette orthographe, telle qu’exportée par le package. Transmettez un élément initialisé.

#### `interface` SearchbarCancelButtonIconSupport

| Membre | Type | Description |
| --- | --- | --- |
| **`refresh`** | `() => void` | Relire `cancelButtonIcon` après avoir changé la propriété JavaScript. |
| **`destroy`** | `() => void` | Supprimer l’observateur et l’icône insérée, puis restaurer le texte. |

## Native UI Shell (préversion)

Importez ces API et types depuis `@rdlabo/ionic-theme-ios27/native`. Consultez le [guide Native UI Shell](/docs/native-ui-shell) pour les prérequis et le comportement de repli.

#### `function` enableNativeUIShell

`(options?: NativeUIShellOptions) => Promise<NativeUIShellHandle>`

Appelez une seule fois au démarrage. Les appels répétés avec la même configuration partagent le moteur actif ; une configuration différente pendant son activité lève une erreur. Les environnements non pris en charge renvoient un handle dans l’état Web. Définissez `enabled: false` pour arrêter la projection active et utiliser les contrôles Web.

#### `function` configureNativeTransition

`() => Promise<WebViewMetrics>`

Lit le rayon de la WebView native et l’applique aux transitions de pages sans activer les contrôles natifs. Sur les autres plateformes, le rayon vaut `0`.

#### `interface` NativeUIShellOptions

Étend `VerticalControlAreaOptions` ; consultez les options de projection de boutons verticaux ci-dessous.

| Propriété           | Type                    | Description                                              |
| -------------- | ----------------------- | -------------------------------------------------------- |
| **`enabled`**  | `boolean`               | Activer globalement la projection native ; vaut `true` par défaut.   |
| **`controls`** | `NativeUIShellControls` | Lorsque cette option est définie, seuls les contrôles explicitement définis à `true` sont admissibles. |

#### `interface` NativeUIShellControls

| Propriété          | Type      | Description                              |
| ------------- | --------- | ---------------------------------------- |
| **`tabs`**    | `boolean` | Barres d’onglets et recherche native.              |
| **`toolbar`** | `boolean` | Boutons de barre d’outils, de retour et de menu.         |
| **`segment`** | `boolean` | Segments.                                |
| **`fab`**     | `boolean` | Boutons d’action flottants.                |

#### `interface` NativeUIShellHandle

| Membre | Type | Description |
| --- | --- | --- |
| **`getStatus`** | `() => NativeUIShellStatus` | Lire l’état actuel. |
| **`suspend`** | `() => Promise<NativeUIShellSuspension>` | Restaurer les contrôles sur le Web jusqu’à la reprise de la suspension. |
| **`destroy`** | `() => Promise<void>` | Restaurer le rendu Web et libérer les contrôles natifs et le moteur. |

#### `interface` NativeUIShellSuspension

| Membre | Type | Description |
| --- | --- | --- |
| **`resume`** | `() => Promise<void>` | Libérer cette suspension. La projection native reprend une fois toutes les suspensions actives libérées. |

#### `interface` WebViewMetrics

| Propriété         | Type     | Description                 |
| ------------ | -------- | --------------------------- |
| **`radius`** | `number` | Rayon des coins de la WebView native. |

#### `interface` NativeUIShellStatus

```ts
interface NativeUIShellStatus {
  state: 'web' | 'native' | 'stopped';
  projected: number;
  updates: number;
  reason?: string;
}
```

`projected` compte les contrôles projetés, `updates` les mises à jour, et `reason` explique le repli Web ou l’arrêt. Un moteur `stopped` ne se reconnecte pas automatiquement après une défaillance du pont ; détruisez le handle avant une nouvelle activation.

#### `type alias` NativeUIShellComponent

`'ion-button' | 'ion-buttons' | 'ion-back-button' | 'ion-menu-button' | 'ion-tab-bar' | 'ion-segment' | 'ion-fab'`

Union des balises de composants gérés par le moteur. Consultez le guide pour les conditions d’admissibilité de chaque composant.

## iPhone Duo / Vertical Control Area (préversion)

Importez ces API depuis `@rdlabo/ionic-theme-ios27/vertical-bars` ou `@rdlabo/ionic-theme-ios27/native`. Le point d’entrée autonome fonctionne sans le thème iOS 27 ni le Native UI Shell complet. Consultez [Prise en charge d’iPhone Duo](/docs/iphone-duo) pour la configuration, les prérequis de l’outillage et le repli Web.

#### `function` enableVerticalControlArea

`(options?: VerticalControlAreaOptions) => Promise<VerticalControlAreaHandle>`

Démarre le moteur uniquement pour les contrôles de la zone verticale. Démarrez ce moteur ou `enableNativeUIShell()`. Les appels répétés avec la même configuration le partagent ; une configuration active différente lève une erreur.

#### `interface` VerticalControlAreaOptions

| Propriété | Type | Description |
| --- | --- | --- |
| **`buttonProjection`** | `'source' \| 'system'` | Apparence des boutons verticaux natifs. Vaut `system` (SwiftUI) par défaut ; `source` projette le remplissage Ionic et les couleurs calculées. |
| **`buttonDefaultFill`** | `'solid' \| null` | Remplissage par défaut lorsqu’il est omis pour les boutons source hors d’`ion-buttons`. Vaut `null` par défaut, pour le verre du thème ; le groupe conserve le remplissage clear par défaut. |

N’affecte pas les contrôles horizontaux ni les clones Web. Consultez [Vertical Bars](/docs/vertical-bars#choose-button-appearance) pour les remplacements locaux `data-projection` et la priorité des remplissages. Définissez `buttonProjection: 'source'` pour conserver l’apparence des releases expérimentales.

#### `function` setVerticalControlAreaPlacement

`(placement: VerticalBarEdge | VerticalBarPlacement, rtl?: boolean) => void`

Applique le positionnement choisi par l’application au CSS et aux contrôles Web/natifs après le montage d’`ion-app`. Les bords logiques sont déterminés par l’attribut `dir` le plus proche ou un `rtl` explicite. Transmettez `null` pour restaurer la disposition ordinaire.


#### `function` applyFoldStateClasses

`(root: HTMLElement, fold: FoldState) => void`

Importez depuis `@rdlabo/ionic-theme-ios27/vertical-bars`. Transmettez l’état de `Foldable.getFoldState()` / `foldStateChange` pour appliquer exactement une des classes `ios-theme-fold-flat`, `ios-theme-fold-half-opened` et `ios-theme-fold-closed` à la racine. Applique aussi `ios-theme-fold-expanded` lorsque l’appareil est à moitié ouvert ou à plat avec une géométrie de charnière, et l’efface sinon. Conserve les autres classes. Ne s’abonne pas aux événements de l’appareil et ne change pas le `when` du split-pane. `FoldState` est la structure avec `state: 'flat' | 'half-opened' | 'closed'` et le champ facultatif `hingeBounds: { x: number; y: number; width: number; height: number }`.

#### `interface` VerticalControlAreaHandle

Étend `NativeUIShellHandle` avec `setPlacement`, la même fonction que `setVerticalControlAreaPlacement`.

| Membre | Type | Description |
| --- | --- | --- |
| **`setPlacement`** | `(placement: VerticalBarEdge \| VerticalBarPlacement, rtl?: boolean) => void` | Appliquer le positionnement aux contrôles Web et natifs. |

#### `type alias` VerticalBarEdge

`'leading' | 'trailing' | null`

Bord logique dans le sens de lecture ; `null` signifie l’absence de rail vertical.

#### `interface` VerticalBarPlacement

| Propriété | Type | Description |
| --- | --- | --- |
| **`edge`** | `VerticalBarEdge` | Bord logique du rail. |
| **`inset`** | `number` | Largeur explicite du rail en pixels CSS ; omise pour utiliser les règles CSS de zone sûre. |
| **`nativeEdge`** | `VerticalBarEdge` | Bord logique natif fourni par l’application. Null ou un bord non enregistré utilise un rail Web en mode verticalBarsOnly, ou la disposition ordinaire de Native UI Shell dans les autres cas. L’omission conserve la dernière valeur. |

#### `module` IonicNativeUIShell

Le plugin Capacitor inclus fournit les mesures de WebView pour le rendu. Il n’a pas d’implémentation Web ; protégez les appels avec `Capacitor.getPlatform() === 'ios'`. Utilisez `@erkamyaman/capacitor-foldable` dans l’application pour l’état de charnière et le positionnement des barres. Consultez [Prise en charge d’iPhone Duo](/docs/iphone-duo).

| Membre | Type | Description |
| --- | --- | --- |
| **`getWebViewMetrics`** | `() => Promise<WebViewMetrics>` | Lire le rayon effectif des coins de la WebView. |
| **`addListener`** | `(name: 'webViewMetricsChange', listener: (event: WebViewMetrics) => void) => Promise<PluginListenerHandle>` | S’abonner aux changements de mesures de WebView ; supprimer l’écouteur à la fin. |

Les méthodes d’instantané du pont et d’activation sont des détails d’implémentation internes. Les anciennes API `DeviceLayout`, `HingeStatus`, `getDeviceLayout()` et de suivi de disposition de l’appareil ont été supprimées.
