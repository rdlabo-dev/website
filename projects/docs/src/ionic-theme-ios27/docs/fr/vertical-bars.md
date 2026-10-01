---
title: "Vertical Bars (préversion)"
sourceRevision: "0daed02571bc73ffce840b233aa934d67360c82d05c9fbe30550b1461854d732"
---
# Vertical Bars (préversion)

Vertical Bars déplace la navigation et les actions Ionic admissibles dans un rail latéral en gardant les composants d’origine comme source des libellés, icônes et comportements. Il fonctionne avec ce thème ou un thème Ionic existant, indépendamment de la posture de charnière et du Native UI Shell complet.

Utilisez cette page pour la disposition, l’admissibilité des contrôles, l’apparence native des boutons et l’API d’exécution. Pour les événements de l’appareil et les panneaux divisés, consultez [Prise en charge de l’iPhone Duo](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo). Pour un aperçu dans le navigateur et une configuration native étape par étape, commencez par [iPhone Duo avec votre thème existant](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme).

Disponible dans `1.2.0` en **préversion**. Les API et comportements pris en charge peuvent changer.

## Activer Vertical Bars

Chargez la feuille de style à activer explicitement :

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

Une fois `ion-app` monté, démarrez un seul environnement :

```ts
import { enableVerticalControlArea } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const rail = await enableVerticalControlArea();
```

Ajoutez la classe de disposition ci-dessous pour la simulation dans le navigateur, ou [appliquez le placement de l’appareil](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo#project-controls-into-the-rail) pour un iPhone Duo. L’application gère le placement et le nettoyage : appelez `await rail.destroy()` lorsque son propriétaire est détruit. Si vous utilisez déjà `enableNativeUIShell()`, gardez cet environnement ; il inclut Vertical Bars. Ne démarrez pas les deux.

Le point d’entrée `/vertical-bars` nécessite `@capacitor/core`, y compris dans les builds navigateur. L’utilisation du CSS seul ne nécessite aucun environnement d’exécution. Pour la configuration native et les transitions de navigation, suivez [le guide du thème existant](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme).

Sur Capacitor iOS pris en charge, les contrôles admissibles utilisent le rendu SwiftUI natif. Le Web, Android et les cas de projection native indisponible utilisent des clones Web. Un aperçu dans le navigateur peut vérifier la disposition et les actions, mais ne permet pas de comparer l’apparence native des boutons.

## Réserver le rail vertical

Ajoutez `.ios-theme-vertical-bars` à `ion-app` pour réserver la zone de rail physiquement à droite, ou ajoutez également `.ios-theme-vertical-bars-left` pour utiliser le côté gauche physique :

```html
<ion-app class="ios-theme-vertical-bars">...</ion-app>
```

Les classes sont physiques — `-left` désigne toujours le bord gauche physique — car le CSS et le moteur de rendu natif travaillent en coordonnées physiques. `setVerticalControlAreaPlacement` applique le `verticalBarEdge` logique signalé par le plugin d’appareil et le résout selon la direction du document ; une application RTL n’a donc pas besoin d’effectuer sa propre conversion.

Pour le développement dans Chrome, aucun plugin natif n’est nécessaire — la classe seule réserve `80px` pour simuler l’iPhone Duo. Lorsque `setVerticalControlAreaPlacement` reçoit `{ edge, nativeEdge, inset }`, l’inset remplace la largeur de repli même s’il est inférieur à `80px`. Redéfinissez `--ios-theme-vertical-bars-safe-area-left` ou `--ios-theme-vertical-bars-safe-area-right` pour simuler une autre disposition.

Cela garde les routeurs et les fonds de composants sur tout le viewport. `ion-content` déplace son premier plan défilant, `ion-toolbar` déplace le premier plan de son conteneur et `ion-fab` s’ajuste seulement lorsqu’il est placé à côté de l’interface système. La variable de zone sûre Ionic correspondante est réinitialisée dans ces composants de premier plan pour que les descendants n’ajoutent pas de nouveau l’inset.

`ion-modal` applique la même correction de premier plan lorsque sa boîte de dialogue visible occupe toute la largeur du viewport. Lorsque l’environnement Vertical Control Area est activé, la modale la plus haute sur toute la largeur projette également les boutons de barre d’outils admissibles dans son propre rail ; les dialogues centrés gardent leurs boutons et ne reçoivent aucun inset de rail de page. Cela inclut les feuilles modales pleine largeur : leur rail suit les limites visibles de la feuille à mesure que le point d’arrêt change. L’admissibilité dépend de la largeur visible du dialogue, pas de la posture de charnière ni du type de modale. `ion-menu` et `ion-popover` sont traités comme des surfaces distinctes : leurs composants internes de premier plan ne reçoivent pas la conversion de page principale et conservent la gestion standard des zones sûres d’Ionic. Un menu présenté à côté de l’interface système garde l’hôte d’animation Ionic sur tout le viewport et décale uniquement son conteneur visible de l’inset correspondant ; un menu du côté opposé ne change pas. Gauche et droite restent des coordonnées physiques en RTL, tandis que `side="start"` et `side="end"` d’Ionic restent logiques.

Le mode est indépendant du mode des composants : une application peut garder `mode: 'md'` d’Ionic sur iOS tout en activant Vertical Bars. Aucun composant n’a besoin de `mode="ios"`.

## Rendu natif

Sur les versions iOS prises en charge, ajouter `.ios-theme-vertical-bars` modifie seulement les contrôles que le système déplace dans le rail latéral physique. Une fois la classe appliquée, Native UI Shell présente les onglets admissibles, la navigation de retour, les boutons de menu et les actions de barre d’outils via un `TabView` et une barre d’outils SwiftUI. Lorsque le système signale un bord de rail — sur iPhone Duo lié à iOS 27.1 ou ultérieur — il doit correspondre au placement appliqué ; en cas de désaccord, le rail reste sur le Web. Les anciens outils qui ne peuvent pas signaler de bord se fient directement au placement DOM. SwiftUI gère leur placement adaptatif et leur apparence Liquid Glass ; Ionic reste la source des libellés, icônes, états sélectionnés/désactivés, routes, soumissions de formulaires et gestionnaires de clic.

La surface SwiftUI est découpée et ne reçoit les interactions que dans le rail système. Le contenu Web reste visible et interactif hors de cette zone physique. L’environnement met à jour la sélection des onglets de manière optimiste avant de transmettre l’action au `ion-tab-button` d’origine, avec les mêmes protections d’événements et de révisions périmées que les autres contrôles natifs. La disposition des superpositions suit [les règles de réservation du rail](#reserve-the-vertical-rail).


## Actions de barre d’outils

Un `ion-back-button` standard peut être projeté depuis l’extérieur d’une barre d’outils fixe, y compris depuis le contenu routé ou un shell applicatif persistant. `ion-menu-button` et les autres actions de barre d’outils nécessitent une barre d’outils fixe.

Un `ion-button` se déplace dans le rail lorsqu’il contient un `ion-icon` ou SVG avec `slot="icon-only"`. Le bouton doit être dans un `ion-toolbar` fixe placé directement dans `ion-header` ou `ion-footer`, hors du `ion-content` défilant.

| Balisage d’icône | Placement |
| --- | --- |
| `slot="icon-only"` | Rail vertical |
| `slot="start"`, `slot="end"` ou aucun slot | Barre d’outils horizontale d’origine |
| Aucune icône | Barre d’outils horizontale d’origine |

```html
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="end">
      <ion-button aria-label="Done">
        <ion-icon name="checkmark-outline" slot="icon-only"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
```

Tous les remplissages (`default`, `clear`, `solid` et `outline`) et couleurs Ionic suivent cette règle de placement. Gardez les noms accessibles et les gestionnaires de clic ou de soumission de formulaire d’origine sur les boutons sources. `type="submit"` et `.button-submit` ne sélectionnent pas un placement différent.

La règle s’applique aux boutons individuels et à ceux contenus dans `ion-buttons`, sur les pages ordinaires et dans la modale pleine largeur la plus haute. Les modales centrées, menus et popovers gardent leur propre disposition de barre d’outils. Ajoutez `.ios-theme-horizontal-only` à un groupe ou un bouton individuel pour le garder horizontal. Le placement est choisi lorsqu’une page routée entre ; changer le contenu ou le slot d’icône d’un bouton existant ne le déplace pas entre barre d’outils et rail avant que la page sorte puis entre de nouveau.

### Choisir l’apparence des boutons

`buttonProjection` et les réglages locaux de projection ci-dessous sont disponibles dans `1.2.0`.

Pour les actions natives verticales `ion-button` et `ion-menu-button`, choisissez qui contrôle l’apparence :

| `buttonProjection` | Apparence |
| --- | --- |
| `'system'` (par défaut) | SwiftUI stylise les boutons et teinte leurs icônes. Le remplissage, les couleurs et les bordures Ionic ne sont pas appliqués. |
| `'source'` | Projette le remplissage Ionic pris en charge et les couleurs calculées décrits dans [Règles de remplissage source](#source-fill-rules). |

```ts
const rail = await enableVerticalControlArea({ buttonProjection: 'source' });
```

`enableVerticalControlArea()` et `enableNativeUIShell()` acceptent tous deux cette option. Utilisez un seul moteur et détruisez-le avant de redémarrer avec d’autres options. Les deux modes conservent les actions, l’état désactivé et les groupes. Ces réglages d’apparence n’affectent ni les contrôles horizontaux, ni les éléments sources, ni les clones Web de repli : comparez donc l’apparence native sur les versions d’iOS prises en charge.

**Migration depuis les releases expérimentales :** le réglage par défaut passe du style source à `system`. Définissez `buttonProjection: 'source'` pour conserver le comportement de projection précédent.

### Remplacer les réglages de boutons ou groupes individuels

Utilisez `data-projection` pour les exceptions locales. Les classes existantes restent prises en charge :

| Attribut | Classe équivalente |
| --- | --- |
| `data-projection="source"` | `ios-theme-projection-source` |
| `data-projection="system"` | `ios-theme-projection-system` |

```html
<ion-buttons data-projection="source">
  <ion-button fill="solid" aria-label="Add">
    <ion-icon name="add-outline" slot="icon-only"></ion-icon>
  </ion-button>
  <ion-button data-projection="system" aria-label="Search">
    <ion-icon name="search-outline" slot="icon-only"></ion-icon>
  </ion-button>
</ion-buttons>
```

Le premier réglage correspondant est retenu :

1. Le réglage local du bouton.
2. Le réglage local de son `ion-buttons` le plus proche.
3. L’option `buttonProjection` du démarrage, ou `system` si elle est omise.

Sur un même élément, une valeur valide de `data-projection` est prioritaire sur les classes. Les valeurs vides ou inconnues sont ignorées. Sans attribut valide, `system` l’emporte si les deux classes sont présentes. Retirer un attribut fait revenir aux classes de l’élément, puis au niveau supérieur suivant. Les changements d’attribut et de classe s’appliquent sans redémarrer le moteur ; le regroupement et le positionnement restent inchangés.

Seules les actions natives verticales `ion-button` et `ion-menu-button` interprètent ces réglages. Les autres ancêtres, boutons de retour, onglets et FAB ne le font pas. Ils ne modifient pas les styles Web. Pour conserver entièrement un contrôle ou un sous-arbre sur le Web, utilisez [`data-shell="disabled"`](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/native-ui-shell#supported-markup).

### Règles de remplissage source

Pour un `ion-button` résolu en `source`, le remplissage est choisi séparément du mode de projection :

| Bouton | Remplissage effectif |
| --- | --- |
| `fill="clear"`, `"solid"` ou `"outline"` explicite | La valeur explicite |
| Remplissage omis ou `fill="default"` dans `ion-buttons` | `clear` |
| Remplissage omis ou `fill="default"` hors d’`ion-buttons` | `buttonDefaultFill` |

`buttonDefaultFill` n’accepte que `'solid'` ou `null` ; l’omission équivaut à `null`. Utilisez `'solid'` pour le design de bouton par défaut d’Ionic, ou `null` pour le design en verre par défaut de ce thème. Il s’applique à tout bouton résolu en `source`, y compris une exception locale sous un réglage global `system`.

```ts
// Garder le style système global ; les boutons source locaux utilisent le remplissage Ionic par défaut.
const rail = await enableVerticalControlArea({ buttonDefaultFill: 'solid' });
```

```html
<!-- Dans une barre d’outils fixe, hors d’ion-buttons : le remplissage omis devient solid. -->
<ion-button data-projection="source" aria-label="Add">
  <ion-icon name="add-outline" slot="icon-only"></ion-icon>
</ion-button>
```

| Remplissage effectif | Apparence native en mode `source` |
| --- | --- |
| `clear` | Couleur de l’icône, sans arrière-plan en verre ; les arrière-plans CSS sont ignorés |
| `solid` | La couleur de fond calculée teinte un bouton en verre mis en avant |
| `outline` | Couleur et largeur de bordure calculées, avec verre natif |
| `null` | Verre natif avec les couleurs d’icône de la source |

Dans `ion-buttons`, définissez explicitement `fill="solid"` pour projeter un arrière-plan ; `buttonDefaultFill: 'solid'` ne remplace pas le remplissage clear par défaut du groupe. La teinte du Liquid Glass natif peut différer de la couleur CSS, surtout pour les fonds translucides. Avec le thème iOS, les `ion-buttons` ordinaires conservent la projection de groupe ; `ion-buttons.ios-theme-disabled` projette individuellement les boutons admissibles. Les réglages locaux de projection ne changent pas cette règle de regroupement.

## Barre d’onglets

Lorsque l’application contient `ion-tabs`, sa barre d’onglets se déplace dans la zone réservée et utilise l’espacement natif du bord Duo ; la valeur `slot` d’Ionic ne choisit pas une autre position. Sans projection native, le rail Web au repos affiche uniquement les icônes, comme la présentation native au repos. Lorsque l’utilisateur appuie et glisse sur ce rail, chaque onglet avec icône et libellé révèle son libellé pour que la destination envisagée reste identifiable. La barre d’onglets Web reçoit les entrées de pointeur dans la zone système simulée. Les onglets natifs et une barre Web restaurée apparaissent en fondu sur 180ms ; la disparition reste immédiate. Réduire les animations désactive ce fondu. Utilisez `ion-menu` si la navigation doit devenir une barre latérale ; ce mode ne convertit pas les onglets en menu. Les clones Web fonctionnent aussi sans `ion-tabs`. Désactiver le mode ou quitter la page retire la gestion native ou les clones Web et restaure leurs sources. Remplacez `--ios-theme-vertical-bars-toolbar-top` si les contrôles système simulés utilisent une autre disposition verticale.

## API Vertical Control Area

La référence générée ci-dessous documente le handle renvoyé par `enableVerticalControlArea()`.

<docgen-index>

* [`setPlacement(...)`](#setplacement)
* [`getStatus()`](#getstatus)
* [`suspend()`](#suspend)
* [`destroy()`](#destroy)
* [Interfaces](#interfaces)
* [Alias de types](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### setPlacement(...)

```typescript
setPlacement(placement: VerticalBarEdge | VerticalBarPlacement, rtl?: boolean | undefined) => void
```

Applique le positionnement choisi par l’application aux contrôles Web et natifs.

| Paramètre           | Type                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **`placement`** | <code><a href="#verticalbaredge">VerticalBarEdge</a> \| <a href="#verticalbarplacement">VerticalBarPlacement</a></code> |
| **`rtl`**       | <code>boolean</code>                                                                                                    |

--------------------


### getStatus()

```typescript
getStatus() => NativeUIShellStatus
```

Renvoie l’état actuel de projection Web/native.

**Renvoie :** <code><a href="#nativeuishellstatus">NativeUIShellStatus</a></code>

--------------------


### suspend()

```typescript
suspend() => Promise<NativeUIShellSuspension>
```

Rétablit les contrôles projetés sur le Web jusqu’à la reprise du bail renvoyé.

**Renvoie :** <code>Promise&lt;<a href="#nativeuishellsuspension">NativeUIShellSuspension</a>&gt;</code>

--------------------


### destroy()

```typescript
destroy() => Promise<void>
```

Arrête la synchronisation, rétablit les contrôles Web et libère les ressources natives.

--------------------


### Interfaces


#### VerticalBarPlacement

| Propriété             | Type                                                        | Description                                                                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`edge`**       | <code><a href="#verticalbaredge">VerticalBarEdge</a></code> |                                                                                                                                                                                                                                   |
| **`inset`**      | <code>number</code>                                         | Largeur explicite du rail en pixels CSS ; omise pour utiliser les règles de zone sûre de la feuille de style.                                                                                                                                               |
| **`nativeEdge`** | <code><a href="#verticalbaredge">VerticalBarEdge</a></code> | Bord logique natif signalé par le plugin d’appareil de l’application. Null ou un bord non enregistré utilise un rail Web en mode verticalBarsOnly, ou la disposition ordinaire de Native UI Shell dans les autres cas. L’omission conserve la dernière valeur fournie. |


#### NativeUIShellStatus

| Propriété            | Type                                        |
| --------------- | ------------------------------------------- |
| **`state`**     | <code>'native' \| 'stopped' \| 'web'</code> |
| **`projected`** | <code>number</code>                         |
| **`updates`**   | <code>number</code>                         |
| **`reason`**    | <code>string</code>                         |


#### NativeUIShellSuspension

| Méthode     | Signature                    | Description                                                                                    |
| ---------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| **resume** | () =&gt; Promise&lt;void&gt; | Libère cette suspension. La projection native reprend lorsque toutes les suspensions actives sont libérées. |


### Alias de types


#### VerticalBarEdge

Bord logique dans le sens de lecture, correspondant à UIVerticalBarEdge et capacitor-foldable.

<code>'leading' | 'trailing' | null</code>

</docgen-api>
