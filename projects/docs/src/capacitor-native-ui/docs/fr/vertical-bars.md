---
title: "Vertical Bars"
sourceRevision: "b3ac4e0b65db8b409e3bab127acc4db715a286d1b69a48bcec1decab4ee6c632"
---
# Vertical Bars

Vertical Bars déplace les contrôles Ionic admissibles ou boutons HTML explicitement marqués dans un rail latéral tout en conservant les éléments originaux comme sources des libellés, icônes et comportements. Il fonctionne avec le thème iOS ou un thème Ionic existant, indépendamment de la posture de charnière et de Native UI complet.

Choisissez votre configuration avant cette référence :

- **Ionic avec un thème personnalisé ou par défaut :** [configuration du rail Ionic](ionic-vertical-bars.md#try-it-in-your-existing-ionic-app).
- **Sans Ionic :** [configuration HTML](framework-independent.md) puis [rail sur l’appareil](framework-independent.md#device-placement-for-vertical-bars). Utilisez `/core` et votre disposition ; la configuration Ionic ci-dessous ne s’applique pas.
- **Thème iOS 27 et Native UI existants :** [raccorder le placement de l’appareil](#use-with-capacitor-foldable) avec votre runtime actuel.

Cette page couvre l’intégration du plugin d’appareil, l’admissibilité, l’apparence native et les options du runtime. Pour les panneaux Ionic selon la posture, consultez [Disposition de l’appareil et panneaux divisés](../../theme-ios27/docs/vertical-bars-layout.md).

Vertical Bars et la prise en charge d’iPhone Duo sont stables à partir de la version 2.0.0.

Consultez la [configuration partagée](configuration.md) pour tous les défauts et les méthodes à chaud `rail.enableVerticalControlArea()` / `rail.disableVerticalControlArea()`. Les [contrôles HTML simples](framework-independent.md) utilisent les mêmes moteurs de rail natifs.

## Activer Vertical Bars

Installez Native UI et le plugin d’état Foldable requis comme dépendances directes :

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Pour Ionic, suivez la [configuration standard](ionic-vertical-bars.md) : chargez le CSS du rail, configurez la navigation, raccordez le placement initial Foldable et `barPlacementChange`, puis démarrez un runtime unique. L’[intégration ci-dessous](#use-with-capacitor-foldable) couvre aussi les runtimes existants et le CSS applicatif. Compilez le Web, exécutez `npx cap sync ios` et recompilez l’application native.

Un runtime seul ne réserve pas d’espace Web. Conservez l’abonnement à l’appareil pour la configuration standard ; le placement manuel appartient à l’[aperçu navigateur facultatif](ionic-vertical-bars.md#optional-browser-preview). Si Native UI est déjà actif, réutilisez-le au lieu de démarrer un autre runtime.

Le point d’entrée `/vertical-bars` nécessite `@capacitor/core`, y compris pour le navigateur. Le CSS de rail du thème seul ne nécessite aucun runtime natif. Pour la configuration native et les transitions, suivez le [guide avec thème existant](ionic-vertical-bars.md).

Sur Capacitor iOS pris en charge, les contrôles admissibles utilisent le rendu SwiftUI natif. Le Web, Android et les cas de projection native indisponible utilisent des clones Web. Un aperçu dans le navigateur peut vérifier la disposition et les actions, mais ne permet pas de comparer l’apparence native des boutons.

## Placement et disposition Web

L’application ou le thème gère espacement Web, positionnement du rail et styles de repli. Le plugin lit la disposition et le placement Ionic fournis ; il ne réserve pas lui-même d’espace au contenu. Avec le thème iOS27, utilisez `setVerticalBarsLayout({ edge, inset })`. Les applications uniquement natives utilisent leur CSS ; aucun utilitaire du thème n’est requis. La disponibilité native provient des métriques de l’appareil, indépendamment de la disposition Web.

La [feuille de style de rail facultative du thème](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.2/packages/theme-ios27/docs/vertical-bars-layout.md) fournit une disposition prête à l’emploi. Ses classes et variables n’imposent pas l’installation du package : l’application peut fournir un équivalent. Le runtime utilise actuellement `ios-theme-vertical-bars` sur `ion-app` pour identifier la disposition, quel que soit le fournisseur des styles.

## Utiliser avec Capacitor Foldable

[`@erkamyaman/capacitor-foldable`](https://github.com/erkamyaman/capacitor-foldable) est requis dans la configuration standard de Vertical Bars. Installez-le avec Native UI comme ci-dessus et raccordez son placement à votre disposition Web. Native UI ne s’abonne pas automatiquement à Foldable.

Les exemples nécessitent Foldable **8.3.3 ou ultérieur dans la version 8**, qui inclut `BarPlacement.inset`. Si votre application utilise une version plus ancienne, mettez-la à jour avec `npm install @erkamyaman/capacitor-foldable@^8.3.3`, puis synchronisez et recompilez l’application native.

| Responsable | Responsabilité |
| -------------------- | ------------------------------------------------------------------------------------------- |
| Foldable | Signaler l’état initial et les changements ultérieurs de placement/posture. |
| Application ou thème | Réserver l’espace Web et choisir la disposition selon le bord logique et le retrait mesuré. |
| Native UI | Vérifier indépendamment la disponibilité du rail natif et projeter les sources admissibles. |

### Avec la disposition de rail Ionic du thème

Après chargement de la [feuille de style du rail](../../theme-ios27/docs/vertical-bars-layout.md) et montage de `ion-app`, raccordez le placement et démarrez une seule fois le runtime :

```ts
import { Foldable, type BarPlacement } from '@erkamyaman/capacitor-foldable';
import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const applyPlacement = ({ verticalBarEdge, inset }: BarPlacement) => setVerticalBarsLayout({ edge: verticalBarEdge, inset });
const listener = await Foldable.addListener('barPlacementChange', applyPlacement);
applyPlacement(await Foldable.getBarPlacement());
const rail = await enableNativeUI({ controls: 'verticalOnly' });
```

Si un runtime est actif, conservez-le et ajoutez seulement l’abonnement. `setVerticalBarsLayout` résout les bords logiques en RTL ; un bord null restaure la disposition ordinaire. Utilisez le retrait mesuré plutôt qu’une largeur fixe. Conservez la feuille du thème ; `ionic-tabs.css` de Foldable n’est pas nécessaire ici.

À la destruction du propriétaire applicatif, retirez son abonnement et détruisez le runtime qu’il détient :

```ts
await listener.remove();
await rail.destroy();
```

### Avec du CSS applicatif ou sans Ionic

Utilisez le même abonnement `getBarPlacement()` / `barPlacementChange`, mais appliquez bord et retrait à votre CSS plutôt que d’appeler `setVerticalBarsLayout`. Un bord null doit restaurer l’espacement ordinaire. Pour Ionic, conservez les classes de rail décrites ci-dessus ; pour HTML simple, utilisez `/core` et la [configuration du rail sur l’appareil](framework-independent.md#device-placement-for-vertical-bars). Ni Foldable ni Native UI ne fournit le CSS applicatif. Les marqueurs de rail HTML restent actifs indépendamment du CSS ; pour ramener ces sources à leur position originale avec un bord null, appelez `disableVerticalControlArea()`, puis `enableVerticalControlArea()` lorsqu’un bord revient. Sérialisez ces changements avec vos mises à jour de disposition.

Séparez les mises à jour Web de la disponibilité native : ne passez pas le bord Foldable via l’option obsolète `nativeEdge`. Native UI lit lui-même cette capacité. Seul un aperçu facultatif dans le navigateur substitue un placement simulé à cet abonnement.

Pour une disposition guidée par la charnière, lisez `getFoldState()` et abonnez-vous séparément à `foldStateChange`. La posture ne sélectionne pas les contrôles et n’active pas le rail ; consultez l’[exemple d’abonnement de posture et de panneaux divisés](../../theme-ios27/docs/vertical-bars-layout.md#read-the-device-layout) du thème.

## Rendu natif

Sur iOS compatible, ajouter `.ios-theme-vertical-bars` ne change que les contrôles déplacés par le système dans le rail latéral physique. Native UI présente onglets admissibles, retour, boutons de menu et actions via un `TabView` et une barre SwiftUI dès application de la classe. Lorsque l’OS signale un bord — sur iPhone Duo lié à iOS 27.1 ou ultérieur — il doit correspondre au placement appliqué ; sinon le rail reste Web. Sans bord signalé, la projection conserve son repli Web. Une préférence ne peut pas activer un rail natif incompatible. SwiftUI gère placement adaptatif et Liquid Glass ; Ionic reste la source des libellés, icônes, états sélectionné/désactivé, routage, envoi de formulaires et clics.

La surface SwiftUI est découpée et ses interactions limitées au rail système. Le contenu Web reste visible et interactif hors de cette région physique. Le runtime actualise de façon optimiste la sélection avant de transmettre l’action à `ion-tab-button`, avec les mêmes protections d’événements et de révisions périmées que les autres contrôles. Les superpositions suivent la [disposition facultative du rail du thème](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.2/packages/theme-ios27/docs/vertical-bars-layout.md#reserve-the-vertical-rail) si cette feuille est utilisée ; les dispositions personnalisées relèvent de l’application.

### Popovers natifs (Vertical Bars uniquement)

La présentation native se limite aux popovers ancrés aux `ion-button` acceptés par Vertical Bars natif. Elle est disponible avec le runtime autonome ; Native UI complet n’est pas requis. Activez-la explicitement au démarrage (`popover` vaut `false` par défaut) :

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const rail = await enableNativeUI({
  controls: 'verticalOnly',
  ionic: { verticalBars: { popover: true } },
});
```

Utilisez un `ion-popover` dont `trigger` désigne le bouton projeté, ou passez son événement de clic à `PopoverController.create({ event, ... })`. Les popovers des barres ordinaires et du corps restent Web. Si un popover ancré au rail revient au Web, le rail aussi jusqu’à fermeture. Consultez le [comportement et les limites des popovers natifs](native-ui.md#popovers-anchored-to-vertical-bars).

## Actions de barre d’outils

Un `ion-back-button` standard peut être projeté depuis l’extérieur d’une barre d’outils fixe, y compris depuis le contenu routé ou un shell applicatif persistant. `ion-menu-button` et les autres actions de barre d’outils nécessitent une barre d’outils fixe.

Par défaut, un `ion-button` rejoint le rail s’il contient un `ion-icon` ou SVG avec `slot="icon-only"`. Il doit être dans une `ion-toolbar` fixe directement dans `ion-header` ou `ion-footer`, hors du `ion-content` défilant.

| Balisage d’icône | Placement |
| ---------------------------------------- | --------------------------- |
| `slot="icon-only"` | Rail vertical |
| `slot="start"`, `slot="end"` ou aucun slot | Barre d’outils horizontale d’origine |
| Aucune icône | Barre horizontale originale |

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

Une barre d’outils dont tout le contenu a été déplacé dans le rail se replie pendant la projection. Les barres contenant un titre, du texte direct, d’autres contenus ou un contrôle réservé à l’affichage horizontal restent visibles. L’arrêt de la projection restaure la barre d’outils d’origine.

### Sélectionner les actions et le groupement indépendamment

Utilisez `controls` pour configurer sélection et groupement. Chaque champ accepte `true`, `false`, `'horizontalOnly'` ou `'verticalOnly'`, avec `true` pour les champs omis. Utilisez `controls: 'verticalOnly'` pour toute sélection par défaut dans le rail. Les attributs locaux peuvent remplacer la sélection ; sources explicites et extensions restent indépendantes. Consultez [toutes les valeurs de sélection](configuration.md#selection-defaults).

| Option | Responsabilité | Ce qu’elle ne fait pas |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `button` | Sélectionner automatiquement les actions `ion-button` et `ion-menu-button` admissibles, dans ou hors de `ion-buttons`. | Ne sélectionne pas les boutons de retour. |
| `buttonGroup` | Autoriser le regroupement des actions sélectionnées de `ion-buttons` selon les règles existantes. | Ne sélectionne, n’active ni ne désactive aucun enfant. |
| `backButton` | Sélectionner automatiquement les `ion-back-button` admissibles, indépendamment du groupe parent. | Ne regroupe pas les retours avec les autres actions. |

Pour les boutons ordinaires à icône seule dans un groupe, sans attribut local :

| `buttonGroup` | `button` | Résultat |
| ------------- | -------- | ------------------------------------------------------------ |
| `true` | `true` | Les boutons admissibles sont projetés ensemble si le groupe est admissible. |
| `false` | `true` | Les boutons admissibles sont projetés individuellement. |
| `true` | `false` | Aucun bouton ordinaire projeté ; le groupement seul ne sélectionne rien. |
| `false` | `false` | Aucun bouton ordinaire projeté. |

Ces résultats concernent seulement les actions ordinaires. Retour, onglets et recherche native
sont indépendants. Par exemple, pour sélectionner uniquement le retour parmi les actions
de barre d’outils :

```ts
const rail = await enableNativeUI({
  controls: { buttonGroup: false, button: false, backButton: 'verticalOnly', tabs: 'verticalOnly', segment: false, fab: false },
});
```

Cela ne désactive ni la projection des onglets ni leur CSS de rail.

### Sélection explicite des actions et groupement local

Utilisez `data-vertical-bars="true|false"` sur l’élément dont vous voulez remplacer
le comportement. Cet attribut **n’est pas hérité**.

| Élément | `data-vertical-bars="true"` | `data-vertical-bars="false"` | Défaut si absent ou invalide |
| -------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------- | -------------------------------------------------- |
| `ion-button` / `ion-menu-button` | Sélectionne l’action, y compris les textes compatibles sans slot icon-only. | Exclut l’action du rail. | `controls.button` et règles automatiques de forme. |
| `ion-buttons` | Autorise le groupement d’actions déjà sélectionnées. | Projette les actions sélectionnées individuellement. | `controls.buttonGroup` et admissibilité du groupe. |
| `ion-back-button` | Sélectionne le retour indépendamment du groupe. | Exclut ce retour du rail. | `controls.backButton` et admissibilité du retour. |
| `ion-tab-bar` | Sélectionne les onglets admissibles et leur recherche native. | Désactive la sélection native des onglets du rail ; la disposition Web reste. | `controls.tabs` et admissibilité de la barre. |

L’attribut du groupe ne sélectionne ni n’exclut jamais ses enfants. Toutes les activations restent soumises aux exclusions structurelles et à la disponibilité du rail.

Les valeurs vides ou inconnues sont ignorées. Pour désactiver la sélection automatique
des actions et sélectionner explicitement un bouton textuel :

```ts
const rail = await enableNativeUI({
  controls: { buttonGroup: 'verticalOnly', button: false, backButton: false, tabs: 'verticalOnly', segment: false, fab: false },
});
```

```html
<ion-buttons>
  <ion-button data-vertical-bars="true">Save</ion-button>
  <ion-button>Cancel</ion-button>
</ion-buttons>
```

Seul Save se déplace ; Cancel reste horizontal. Ajouter
`data-vertical-bars="true"` au groupe ne sélectionnerait pas Cancel.

Pour grouper deux actions explicites même avec `buttonGroup: false` :

```html
<ion-buttons data-vertical-bars="true">
  <ion-button data-vertical-bars="true">Save</ion-button>
  <ion-button data-vertical-bars="true">Done</ion-button>
</ion-buttons>
```

Définissez l’attribut du groupe à `false` pour projeter les mêmes actions individuellement.
Le groupement conserve les règles existantes : tout le groupe doit être admissible,
et un bouton ordinaire unique est projeté seul. Un groupe contenant du contenu horizontal
projette ses actions sélectionnées individuellement. Le groupe source et ses
enfants non sélectionnés restent dans leur barre d’origine.

La sélection explicite exige toujours une barre fixe d’en-tête/pied de page.
Les exclusions du shell, classes horizontal-only et restrictions des superpositions s’appliquent toujours.
Placement et groupement sont capturés pour la visite de la page routée : les changements d’attribut
prennent effet après sortie et retour sur la page. Redémarrez le runtime pour modifier
les options de démarrage.

### Boutons de retour dans les groupes

Un `ion-back-button` reste une action de navigation même dans `ion-buttons`.
Il ignore `buttonGroup`, `button` et l’attribut `data-vertical-bars` du groupe.
Son propre attribut remplace `backButton`. Il utilise la position dédiée au retour,
jamais un groupe d’actions ordinaire, et n’est pas dupliqué comme action de barre d’outils.

```html
<ion-buttons data-vertical-bars="false">
  <!-- Toujours projeté si backButton vaut true. -->
  <ion-back-button></ion-back-button>
</ion-buttons>
```

Le conteneur DOM Ionic ne redéfinit pas le rôle de navigation. Le thème transmet
l’action de retour projetée à Ionic ; il ne remplace pas le routage Ionic par une
pile de navigation native. La disposition native reste gérée par le système.

L’admissibilité existante des retours s’applique toujours, notamment les règles d’icône/couleur
par défaut compatibles et de position dans la page. `data-native-ui="disabled"` sur un ancêtre,
`.ios-theme-horizontal-only` sur `ion-buttons` et les autres exclusions structurelles
restent des exclusions, distinctes du réglage de groupement.

### Placement et apparence

| Réglage | Valeurs | Responsabilité | S’applique à |
| -------------------------- | ----------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `data-native-ui` | `button`, `back-button`, `disabled` | Déclarer une source explicite ou exclure un sous-arbre. | [Sources explicites](framework-independent.md#2-mark-source-controls) ; `disabled` s’applique aussi aux ancêtres. |
| `data-native-ui-placement` | `element`, `rail` | Choisir la position originale ou demander le rail. | Sources explicites ; `element` maintient aussi les contrôles Ionic automatiques à leur position originale. |
| `data-vertical-bars` | `true`, `false` | Remplacer les défauts de sélection ou de groupement du rail. | Actions et groupes Ionic ci-dessus. |
| `data-horizontal-bars` | `true`, `false` | Remplacer les défauts de sélection ou groupement ordinaires. | [Contrôles Ionic ordinaires](native-ui.md#toolbar-selection-and-grouping). |
| `data-projection` | `system`, `source` | Choisir l’apparence native sans sélectionner d’action. | `ion-button` et `ion-menu-button` verticaux natifs ; hérité du `ion-buttons` le plus proche. |

Les attributs de sélection ne sont pas hérités. L’apparence suit la priorité bouton puis groupe décrite ci-dessous. Un attribut ne rend jamais compatible un balisage non pris en charge ni disponible un rail natif manquant.

Le rail partage une apparence claire/sombre entre ses contrôles. Consultez l’[apparence partagée de Vertical Bars](appearance.md#shared-vertical-bars-appearance) pour configurer votre thème Web.

### Choisir l’apparence des boutons

Utilisez `ionic.verticalBars.buttonProjection` pour choisir l’apparence native des boutons.

Pour les actions natives verticales `ion-button` et `ion-menu-button`, choisissez qui contrôle l’apparence :

| `buttonProjection` | Apparence |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `'system'` (par défaut) | SwiftUI habille les boutons et teinte leurs icônes. Remplissage, couleurs et bordures Ionic ne sont pas appliqués. |
| `'source'` | Projette le remplissage Ionic et les couleurs calculées compatibles décrits dans les [règles de remplissage source](#source-fill-rules). |

```ts
const rail = await enableNativeUI({ controls: 'verticalOnly', ionic: { verticalBars: { buttonProjection: 'source' } } });
```

`enableNativeUI()` et la fonction autonome `enableVerticalControlArea()` acceptent ces réglages dans `ionic.verticalBars`. Utilisez un seul runtime et détruisez-le avant redémarrage avec d’autres options. Les deux modes préservent actions, état désactivé et groupement. Les icônes désactivées utilisent l’apparence native désactivée. Ces réglages n’affectent ni contrôles horizontaux, ni sources, ni clones de repli Web ; comparez donc l’apparence sur iOS compatible.

### Remplacer les réglages de boutons ou groupes individuels

Utilisez `data-projection` pour les exceptions locales. Les classes existantes restent prises en charge :

| Attribut | Classe équivalente |
| -------------------------- | ----------------------------- |
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

Seules les actions natives verticales `ion-button` et `ion-menu-button` interprètent ces réglages. Les autres ancêtres, retours, onglets et FAB ne le font pas. Ils ne changent pas les styles Web. Pour laisser entièrement un contrôle ou sous-arbre Web, utilisez [`data-native-ui="disabled"`](native-ui.md#supported-markup).

### Règles de remplissage source

Pour un `ion-button` résolu en `source`, le remplissage est choisi séparément du mode de projection :

| Bouton | Remplissage effectif |
| ------------------------------------------------------ | ------------------- |
| `fill="clear"`, `"solid"` ou `"outline"` explicite | Valeur explicite |
| Remplissage omis ou `fill="default"` dans `ion-buttons` | `clear` |
| Remplissage omis ou `fill="default"` hors d’`ion-buttons` | `buttonDefaultFill` |

`verticalBars.buttonDefaultFill` accepte `'solid'` ou `'glass'` ; omettre équivaut à `'glass'`. Utilisez `'solid'` pour le dessin de bouton Ionic par défaut ou `'glass'` pour du verre. Il s’applique à chaque bouton résolu en `source`, y compris une exception locale sous un réglage global `system`.

```ts
// Garder le style système global ; les boutons source locaux utilisent le remplissage Ionic par défaut.
const rail = await enableNativeUI({ controls: 'verticalOnly', ionic: { verticalBars: { buttonDefaultFill: 'solid' } } });
```

```html
<!-- Dans une barre d’outils fixe, hors d’ion-buttons : le remplissage omis devient solid. -->
<ion-button data-projection="source" aria-label="Add">
  <ion-icon name="add-outline" slot="icon-only"></ion-icon>
</ion-button>
```

| Remplissage effectif | Apparence native en mode `source` |
| -------------- | ------------------------------------------------------------------- |
| `clear` | Couleur d’icône, sans fond de verre ; fonds CSS ignorés |
| `solid` | La couleur de fond calculée teinte un bouton de verre accentué |
| `outline` | Couleur et largeur de bordure calculées, avec verre natif |
| `null` | Verre natif avec les couleurs d’icône source |

Dans `ion-buttons`, définissez explicitement `fill="solid"` pour projeter un arrière-plan ; `buttonDefaultFill: 'solid'` ne remplace pas le remplissage clear par défaut du groupe. La teinte du Liquid Glass natif peut différer de la couleur CSS, surtout pour les fonds translucides. Avec le thème iOS, les `ion-buttons` ordinaires conservent la projection de groupe ; `ion-buttons.ios-theme-disabled` projette individuellement les boutons admissibles. Les réglages locaux de projection ne changent pas cette règle de regroupement.

## Barre d’onglets

Lorsque l’application contient `ion-tabs`, sa barre d’onglets se déplace dans la zone réservée et utilise l’espacement natif du bord Duo ; la valeur `slot` d’Ionic ne choisit pas une autre position. Sans projection native, le rail Web au repos affiche uniquement les icônes, comme la présentation native au repos. Lorsque l’utilisateur appuie et glisse sur ce rail, chaque onglet avec icône et libellé révèle son libellé pour que la destination envisagée reste identifiable. La barre d’onglets Web reçoit les entrées de pointeur dans la zone système simulée. Les onglets natifs et une barre Web restaurée apparaissent en fondu sur 180ms ; la disparition reste immédiate. Réduire les animations désactive ce fondu. Utilisez `ion-menu` si la navigation doit devenir une barre latérale ; ce mode ne convertit pas les onglets en menu. Les clones Web fonctionnent aussi sans `ion-tabs`. Désactiver le mode ou quitter la page retire la gestion native ou les clones Web et restaure leurs sources. Remplacez `--ios-theme-vertical-bars-toolbar-top` si les contrôles système simulés utilisent une autre disposition verticale.

## API Vertical Control Area

La référence générée ci-dessous documente le handle renvoyé par `enableVerticalControlArea()`.

<docgen-index>

- [`setPlacement(...)`](#setplacement)
- [`enableVerticalControlArea()`](#enableverticalcontrolarea)
- [`disableVerticalControlArea()`](#disableverticalcontrolarea)
- [Interfaces](#interfaces)
- [Alias de types](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### setPlacement(...)

```typescript
setPlacement(placement: VerticalBarEdge | VerticalBarPlacement, rtl?: boolean | undefined) => void
```

Ancien adaptateur CSS Web. Utilisez plutôt l’utilitaire setVerticalBarsLayout du thème.

| Paramètre           | Type                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **`placement`** | <code><a href="#verticalbaredge">VerticalBarEdge</a> \| <a href="#verticalbarplacement">VerticalBarPlacement</a></code> |
| **`rtl`**       | <code>boolean</code>                                                                                                    |

---

### enableVerticalControlArea()

```typescript
enableVerticalControlArea() => Promise<void>
```

Active la projection dans le rail disponible en préservant les autres réglages. Rejette après destruction.

---

### disableVerticalControlArea()

```typescript
disableVerticalControlArea() => Promise<void>
```

Restaure les sources du rail sur le Web sans arrêter les contrôles natifs ordinaires. Rejette après destruction.

---

### Interfaces

#### VerticalBarPlacement

| Propriété | Type | Description |
| ---------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **`edge`** | <code><a href="#verticalbaredge">VerticalBarEdge</a></code> | |
| **`inset`** | <code>number</code> | Largeur explicite du rail en pixels CSS ; omise pour utiliser les règles de zone de sécurité du CSS. |
| **`nativeEdge`** | <code><a href="#verticalbaredge">VerticalBarEdge</a></code> | Ignoré. La disponibilité native provient des propres métriques d’appareil du plugin. |

### Alias de types

#### VerticalBarEdge

Bord logique dans le sens de lecture, correspondant à UIVerticalBarEdge et capacitor-foldable.

<code>'leading' | 'trailing' | null</code>

</docgen-api>
