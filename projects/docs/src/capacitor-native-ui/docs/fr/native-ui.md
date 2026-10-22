---
title: "Native UI"
sourceRevision: "e9a1cedfed8b18c585dc11052d77777508c04b0638c4dc1067f8daf5ee21d2a5"
---
# Native UI

Native UI est **officiellement pris en charge depuis la version 2.0.0**. L’ancien Native UI Shell Preview était inclus dans les versions 1.2.0 et 1.2.1 du thème ; ce guide décrit le package séparé et son API renommée. Consultez la [migration](migration.md#native-ui-naming-changes). Les [extensions](native-ui-extensions.md) locales à l’application restent expérimentales.

Native UI fournit des contrôles natifs de navigation et d’action autour du contenu Web d’une application Ionic. Le plugin Capacitor iOS facultatif affiche les contrôles Ionic fixes pris en charge avec UIKit ou SwiftUI et le matériau Liquid Glass du système. Contenu, défilement, état et routage restent dans la WebView Ionic.

Consultez le [fonctionnement de la projection](../README.md#how-projection-works) pour le modèle partagé DOM/présentation native. Cette page sert de référence aux contrôles et API. Pour une première installation et un exemple fonctionnel, commencez par la [configuration Ionic](setup.md) ou [HTML](framework-independent.md).

## Activer Native UI

Vous utilisez déjà le thème iOS ? Suivez [Ajouter Native UI à votre thème](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.0/packages/theme-ios27/docs/add-native-ui.md). Pour d’autres apparences Web, utilisez la [configuration Native UI](setup.md).

Installez le package natif comme dépendance directe pour que Capacitor le découvre :

```bash
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
npx cap sync ios
```

Conservez vos styles Web et activez Native UI une seule fois au démarrage. Le thème iOS 27 est facultatif :

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

void enableNativeUI();
```

`enableNativeUI()` lit aussi le rayon effectif du coin supérieur gauche de la WebView et l’applique aux transitions. Pour configurer uniquement la transition sans activer les contrôles natifs, appelez :

```ts
import { configureNativeTransition } from '@rdlabo/capacitor-native-ui';

await configureNativeTransition();
```

### Navigation et compilations natives

| Configuration | Action |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `iosTransitionAnimation` du thème | Conservez-la ; les transitions natives sont déjà coordonnées. |
| Animation Ionic par défaut ou personnalisée | Configurez l’[adaptateur de transition](migration.md#native-ui-transition-adapter). |
| Plugin installé ou mis à jour | Exécutez `npx cap sync ios`, puis recompilez l’application native. |
| SPM ou CocoaPods | Conservez votre gestionnaire de dépendances ; les deux sont pris en charge. |
| Migration facultative CocoaPods vers SPM | Exécutez `npx cap spm-migration-assistant`, puis liez le package généré `CapApp-SPM` à la cible dans Xcode. |
| Verre natif ordinaire | Nécessite Xcode 26+, Capacitor 8 et iOS 26+. |
| Web, Android, SSR ou ancien iOS | Conservent l’implémentation Web. |

Aucun enregistrement par page, liste de composants, callback natif ou contrôleur de vue Swift n’est requis.

Cette fonctionnalité s’active explicitement. Le point d’entrée ordinaire du thème `@rdlabo/ionic-theme-ios27` n’importe pas Capacitor. Les points d’entrée natifs nécessitent `@capacitor/core`, y compris dans les compilations navigateur. Capacitor détecte et compile tout de même les sources natives lors de la synchronisation si `@rdlabo/capacitor-native-ui` est une dépendance directe du projet, même sans appel à `enableNativeUI()`.

L’apparence native claire/sombre est résolue depuis le style calculé de chaque source. Consultez [Apparence claire et sombre](appearance.md) pour l’héritage du thème, les priorités, les mises à jour à chaud et le comportement partagé de Vertical Bars.

## Sélection et groupement dans la barre d’outils

Utilisez `controls` pour choisir sélection et groupement selon le placement :

```ts
const shell = await enableNativeUI({
  controls: {
    buttonGroup: 'verticalOnly',
    button: true,
    backButton: true,
  },
});
```

Ici, les actions ordinaires sont projetées individuellement et les actions admissibles du rail peuvent se regrouper. Les six champs acceptent `true`, `false`, `'horizontalOnly'` ou `'verticalOnly'` ; les champs omis valent `true`. Pour limiter tous les contrôles automatiques au rail, utilisez `controls: 'verticalOnly'`. Consultez les [valeurs de sélection par défaut](configuration.md#selection-defaults) pour le tableau complet.

`button` sélectionne les actions ordinaires dans ou hors d’un groupe, y compris les boutons de menu. `buttonGroup` regroupe seulement les actions déjà sélectionnées. Avec `buttonGroup: true, button: false`, aucune action ordinaire n’est projetée sans sélection explicite. `backButton` sélectionne indépendamment le retour, y compris dans `ion-buttons` ; les boutons de retour ne rejoignent jamais les groupes ordinaires.

`ionic.auto` active ou désactive la découverte Ionic automatique. Les sources explicites `data-native-ui` et les extensions restent indépendantes de `controls` et de `ionic.auto`.

Redémarrez le runtime pour modifier ces options de démarrage.

| Attribut | Placement | `true` | `false` |
| ---------------------- | ----------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| `data-horizontal-bars` | Ordinaire | Sélectionner l’action, ou autoriser le groupement sur `ion-buttons`. | Exclure l’action, ou désactiver le groupement sur `ion-buttons`. |
| `data-vertical-bars` | Rail vertical | Sélectionner l’action, ou autoriser le groupement sur `ion-buttons`. | Exclure l’action, ou désactiver le groupement sur `ion-buttons`. |

Sur un bouton ou bouton de retour, ces attributs contrôlent la sélection ; sur `ion-buttons`, uniquement le groupement. Aucun n’est hérité. Une valeur absente, invalide ou vide utilise le défaut `controls` correspondant. Les activations verticales et règles d’admissibilité sont détaillées dans [Vertical Bars](vertical-bars.md#explicit-action-selection-and-local-grouping).

```html
<ion-buttons data-horizontal-bars="false" data-vertical-bars="true">
  <ion-button fill="clear">First</ion-button>
  <ion-button fill="clear">Second</ion-button>
</ion-buttons>
```

Les actions horizontales ci-dessus sont projetées individuellement si elles sont admissibles.
L’attribut vertical autorise le groupement mais ne sélectionne pas les enfants textuels ;
ajoutez `data-vertical-bars="true"` à chaque bouton pour les sélectionner explicitement.

Ces réglages ne retirent pas le CSS et ne changent pas la disposition source. Si l’application retire
le style de verre du groupe source, `controls: { buttonGroup: 'verticalOnly' }` empêche aussi une
surface native de groupe partagée. Les exigences existantes de mode de composant, de barre fixe,
de remplissage/couleur et d’exclusion du shell restent applicables. Un bouton horizontal transparent
dans `ion-buttons` peut être projeté individuellement si le groupement est désactivé ou si
le groupe complet n’est pas admissible. Les boutons de retour ne deviennent jamais membres d’un groupe ordinaire.
Les remplacements horizontaux locaux sont réévalués à chaud ; le placement vertical conserve
ses règles par visite de page. `data-projection="source|system"` reste un réglage distinct
d’apparence verticale native.

La fonction autonome `enableVerticalControlArea()` utilise `controls` à `'verticalOnly'` par défaut. Les sources explicites et extensions restent indépendantes. Utilisez un seul point de démarrage par application.

## Balisage pris en charge

Le tableau ci-dessous décrit Native UI ordinaire. Vertical Bars utilise des [règles d’actions de barre d’outils](vertical-bars.md#toolbar-actions) distinctes.

| Composant Ionic                               | Apparence et position prises en charge                                                                        | Rendu natif                                                      |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `ion-button` | `fill="default"`, ou transparent dans un `ion-buttons` non groupé, dans une barre fixe d’en-tête/pied de page | `UIButton` de verre |
| `ion-buttons`                                 | Barre d’outils fixe, avec au moins deux enfants directs `ion-button` / `ion-menu-button` à remplissage clear partageant le verre du thème | Une surface `UIGlassEffect` avec des boutons natifs indépendants           |
| `ion-back-button`                             | Icône et couleur standard dans une barre d’outils d’en-tête ou de pied de page fixe                                                  | `UIButton` en verre utilisant le libellé et l’icône Ionic résolus                 |
| `ion-menu-button`                             | Barre d’outils fixe, dans le `ion-buttons` en verre du thème                                                       | `UIButton` en verre ; bascule du menu Ionic d’origine                          |
| `ion-tab-bar`                                 | Onglets fixes, éléments avec icône seule ou libellé seul, une icône par élément, badges point ou texte, sélection et état désactivé  | `UITabBar` et `UITabBarItem`                                         |
| `ion-segment`                                 | Barre d’outils fixe, non défilante, avec du texte **ou** une icône par élément                                              | `UISegmentedControl`                                                  |
| `ion-fab` / `ion-fab-button` / `ion-fab-list` | FAB en verre dans un emplacement fixe d’`ion-content` ; un bouton principal et des listes directionnelles facultatives                  | Un `UIButton` en verre persistant par bouton ; un groupe de synchronisation FAB |

Pour Native UI ordinaire, seuls les composants compatibles en mode iOS sont admissibles. Les variables du thème ne sont pas requises ; appeler `enableNativeUI()` active la projection. Vertical Bars explicitement activé est indépendant du mode, comme décrit ci-dessous. `ios-theme-disabled` et son ancien alias `ios26-disabled` sur un élément ou ancêtre l’excluent toujours. Désactiver le thème sur un item d’onglet/segment laisse tout son groupe Web.

### Exclure de la projection native

Utilisez `data-native-ui="disabled"` (ou la classe équivalente `native-ui-disabled`) pour désactiver uniquement Native UI iOS en conservant le thème Web. Cela exclut l’élément et tous ses descendants. Ajouter ou retirer cet attribut ou cette classe à l’exécution restaure automatiquement le Web ou réévalue l’admissibilité native.

Seule la valeur exacte `disabled` exclut ; une valeur vide ou inconnue n’exclut pas. Retirez l’attribut pour restaurer la projection Ionic automatique. Pour les contrôles HTML explicites, restaurez plutôt `data-native-ui="button"` ou `data-native-ui="back-button"`. Vous pouvez aussi placer `data-native-ui="disabled"` sur un parent pour exclure le sous-arbre en préservant les déclarations enfants. Retirez aussi `native-ui-disabled` si elle est présente. Cela ne désactive pas les clics ni ne change le thème Web. Le marqueur `data-native-ui-projected` est distinct et appartient au runtime ; l’application ne doit pas le définir. Pour l’ancien attribut, consultez la [migration](migration.md#native-ui-naming-changes).

```html
<ion-toolbar data-native-ui="disabled">
  <ion-button>Web glass button</ion-button>
</ion-toolbar>
```

En placement ordinaire, une exclusion explicite `data-native-ui="disabled"` ou `.native-ui-disabled` dans une surface partagée laisse cette surface et ses enfants Web, y compris groupes de boutons, barres d’onglets, segments et listes FAB. Cela diffère de la désactivation du groupement par `buttonGroup`. Exclure le FAB de recherche ou une partie du pied de recherche désactive l’intégration native de recherche ; la barre d’onglets peut rester native si elle est admissible.

### Prérequis de placement

L’apparence de verre seule ne suffit pas. La projection ordinaire exige des contrôles fixes :

| Contrôle ou emplacement | Admissibilité |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Boutons, retours, groupes de boutons de menu et segments | Barre d’outils directement dans `ion-header` ou `ion-footer`, sans ancêtre `ion-content` autour du contrôle. |
| Boutons directement dans un en-tête/pied, barres autonomes ou barres/en-têtes dans un contenu défilant | Restent Web. |
| FAB | Doit utiliser le slot fixe de `ion-content`. |
| Bouton de retour avec `.ios-theme-vertical-bars` actif | Peut être projeté hors d’une barre fixe, y compris dans le contenu routé ou un shell persistant. Vertical Bars ne nécessite pas le mode `ios`. |
| En-têtes repliés, contrôles exclus et pages quittées | Exclus. |
| Modale de premier plan pleine largeur | Peut participer à Vertical Bars ; les autres superpositions gardent leur disposition. |

Déplacer un contrôle projeté vers un emplacement exclu restaure le Web ; le remettre à sa place réévalue l’admissibilité. L’application choisit où activer Vertical Bars et quel mode Ionic utiliser.

### Disposition des onglets

| Disposition source | Résultat |
| -------------------------------------------------------------------- | --------------------------------------------------------------- |
| Items de largeur égale avec `layout="icon-top"` par défaut | Icône/libellé empilés nativement, y compris sur iPad et en paysage. |
| `icon-start`, `icon-end`, `icon-bottom`, `icon-hide` ou `label-hide` | Toute la barre reste Web. |
| Largeurs d’items inégales | Toute la barre reste Web. |
| Placement début, centre ou fin | Suit la barre source, y compris en RTL. |
| Illustration directionnelle `ion-icon` | Préserve son inversion RTL rendue. |

La barre native utilise localement les classes de taille horizontale compacte et verticale régulière sans changer celles de l’application. Taille et graisse des libellés suivent l’instantané Web.

### Groupement ordinaire de boutons

Ces règles s’appliquent hors de Vertical Bars :

| Source ou réglage | Résultat |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Bouton transparent dans `ion-buttons` | Peut être projeté individuellement. |
| Bouton autonome transparent, plein ou à contour | Reste Web. |
| Groupement actif avec au moins deux boutons transparents admissibles | Une surface native avec actions distinctes. Les boutons de menu peuvent la rejoindre. |
| Bouton de menu unique | Utilise le groupe parent comme surface. |
| Groupement désactivé, remplissages mixtes ou enfants incompatibles | Les actions admissibles peuvent rester individuelles. Les exclusions explicites suivent les règles de surfaces partagées ci-dessus. |
| Bouton de retour | Ne rejoint jamais un groupe d’actions ordinaire. |

### Contenu non pris en charge

Les cas suivants restent Web ; le plugin ne traduit pas le CSS arbitraire de l’application en styles UIKit :

| Zone | Configuration incompatible |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Boutons | Couleurs personnalisées ou icônes/couleurs de retour personnalisées. |
| Conteneurs | En-têtes repliables, barres dans du contenu défilant et contenu de modale ordinaire. Consultez la politique distincte des modales Vertical Bars ci-dessous. |
| Segments | Segments défilants/étendus et intégration segment-view. |
| Contenu | Slots complexes et fonctionnalités SVG incompatibles. |

### Arrière-plans et passages au repli

Le verre natif échantillonne le contenu Web effectivement dessiné derrière lui. Les arrière-plans de barre d’outils et le flou d’en-tête existants affectent toujours ce contenu. Pour faire défiler le contenu sous un en-tête, utilisez la disposition Ionic normale avec en-tête translucide et contenu plein écran ; le plugin ne déplace pas le contenu des pages et ne remplace pas un arrière-plan opaque de barre d’outils géré par l’application.

Lorsqu’une entrée Web possède le clavier logiciel, les contrôles ordinaires reviennent au rendu Web et leur admissibilité est réévaluée à sa fermeture. Cela couvre aussi les dispositions iPad où le clavier ne déplace pas la fenêtre d’affichage visuelle. Un champ de recherche natif conserve son propre clavier et sa surface de recherche native.

Lorsqu’un contrôle existant devient non pris en charge, sa source Web est dessinée avant le retrait de sa couverture native. Cela évite un passage à vide, mais les mises à jour Web/UIKit ne sont pas atomiques et peuvent se superposer brièvement. Ce comportement à la frontière diffère de la navigation ordinaire entre pages, où les onglets natifs partagés inchangés sont conservés.

## État et événements

### Actions de menu

Les boutons de menu utilisent l’icône par défaut ou configurée résolue par Ionic, ou une icône ou un libellé de slot pris en charge. L’activation native clique sur le `ion-menu-button` d’origine, en conservant le ciblage `menu`. Les types de bouton de menu non standard (`submit` / `reset`) restent sur le Web. `disabled`, `autoHide`, la disponibilité du menu et la visibilité du split-pane suivent le DOM réel. Ouvrir un menu restaure les contrôles Web et retire leurs couvertures natives ; le fermer reprojette les contrôles admissibles.

### Géométrie des onglets et mises à jour d’état

Le DOM gère libellés, SVG, placement, valeurs sélectionnées et comportement applicatif. `ion-tab-bar` est la référence de placement ; UIKit gère les marges internes et le dimensionnement du plateau.

| Source ou fenêtre | Comportement natif |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Rectangle de la barre source | Proposition de taille et ancrage, tenant compte du cadre externe plus grand d’UIKit. |
| `tab-bar-position-start`, `tab-bar-position-center`, `tab-bar-position-end` | Ancrage horizontal, y compris RTL ; les changements de classe sont réconciliés automatiquement. |
| `slot="bottom"` / `slot="top"` | Conserve le bord inférieur/supérieur correspondant. |
| Disposition empilée et typographie compatibles | Suivent l’instantané Web. UIKit peut limiter la largeur du contenu même avec un placement remplissant. |
| Mise à jour de badge ou titre | Conserve les identités natives et remesure au même ancrage. |
| Largeur ou hauteur native différente | Ne rejette pas la projection ; les icônes ne sont pas étirées pour forcer les largeurs CSS. |
| Disposition native non reconnue | Restaure le rendu Web. |

Les cibles d’apparence standard du thème Web sont :

| Mesure | Cible |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Fenêtre d’au moins 768px, 2 / 3 / 4 / 5 onglets | Largeurs proches de 188 / 274 / 336 / 414pt respectivement. Les fenêtres plus petites gardent les dimensions téléphone. |
| Hauteur de barre | 62pt |
| Hauteur de sélection / retrait | 54pt / 4pt |
| Boutons adjacents | Se chevauchent comme les contrôles UIKit. |

Ces cibles ne garantissent pas des polices, icônes ou libellés personnalisés identiques ; UIKit détermine la largeur intrinsèque. L’alignement est vérifié sur des captures de simulateur. Le plugin mesure le sous-arbre natif des onglets sans noms de classes privés ni corrections de retrait fixes.

Le runtime revérifie :

- Les changements structurels, racines shadow affectées et dimensions.
- Les événements de cycle de vie des pages et les superpositions.
- Les ancêtres `display: none`, `hidden`, classes de thème, suppressions de composants et changements d’état désactivé.

Les interactions natives sont vérifiées par rapport au DOM et à la révision actuels avant de cliquer sur l’élément Ionic d’origine.

### Formulaires et valeurs des segments

Pour les formulaires, conservez `ion-button type="submit"` et le gestionnaire d’envoi existant du formulaire. Un formulaire externe est toujours transmis via `[form]="formRef"`. Le plugin n’appelle pas `form.submit()`, n’ajoute pas de deuxième chemin d’envoi et ne modifie pas la responsabilité des formulaires Angular. Les valeurs des segments conservent leur type d’origine puisque le `ion-segment-button` d’origine est cliqué ; les changements de valeur programmatiques n’émettent pas d’`ionChange` synthétique.

### Texte et illustrations

Les libellés utilisent du texte natif. Les SVG statiques locaux et les SVG `ion-icon` résolus, y compris `name` et les changements de `name`, sont rasterisés à l’échelle d’affichage et mis en cache. La projection source conserve leurs couleurs ; la projection système des boutons de barre d’outils verticale utilise des icônes modèles teintées par SwiftUI. Les SVG d’onglets suivant la couleur du texte utilisent le rendu de modèle natif : icônes et libellés changent ainsi de couleur de sélection ensemble, sans attendre une nouvelle image du pont. Les images d’onglets multicolores conservent leurs couleurs d’origine. Les références externes, `<use>`, les animations, le HTML et les images intégrés, le texte SVG et les feuilles de style sont exclus. Les polices Web et les dispositions arbitraires de slots ne sont pas reproduites exactement.

### Toucher, badges et accessibilité

L’hôte natif n’accepte les entrées que dans les contrôles natifs. L’interaction et l’accessibilité des onglets sont fournies par le contrôle standard [UITabBar](https://developer.apple.com/documentation/uikit/uitabbar). Les zones vides transmettent les contacts à la WebView. Ionic iOS masque les badges vides par défaut. Un `ion-badge` vide mais visible devient un point de notification natif ; un badge non vide affiche son texte. Les couleurs de fond et de texte des badges viennent des styles calculés du DOM, y compris les palettes `color` d’Ionic. Les badges masqués ou retirés effacent le badge natif. Les onglets utilisent le contrôle d’onglets standard d’UIKit pour la sélection, le comportement tactile, les badges et l’accessibilité, en conservant l’identité des éléments pendant les mises à jour de sélection. UIKit gère la disposition des éléments dans la barre mesurée : le positionnement CSS arbitraire n’est donc pas reproduit. Les contrôles natifs exposent leurs noms, états désactivé et sélectionné, et badges à l’accessibilité ; leur source est masquée de l’accessibilité Web pendant la projection. Cela ne garantit pas un parcours VoiceOver identique entre Web et UIKit.

## Onglets avec recherche

Les enregistrements existants `attachTabBarSearchable(tabBar, fabButton, footer)` utilisent automatiquement la recherche native lorsque leur barre d’onglets inférieure et leurs contrôles de recherche en verre sont pris en charge. Aucune nouvelle option de composant, route, configuration native ou écouteur de page n’est requis. Les barres d’onglets ordinaires continuent d’utiliser `UITabBar` ; les groupes horizontaux avec recherche utilisent un `UITabBarController` persistant, `UITab` / `UISearchTab` et `UISearchController`. La WebView Capacitor d’origine continue d’afficher les résultats et de gérer la navigation.

Avec Vertical Bars, le rail natif conserve tous les onglets et leur sélection. `searchable` et `searchToolbarBehavior(.minimize)` de SwiftUI fournissent le bouton, le champ, le contrôle de fermeture et les transitions de recherche système dans la même surface de navigation native. Apple détermine leur position pour la disposition actuelle de l’appareil et donne le focus au champ natif à l’ouverture de la recherche système. Les événements de saisie, focus, effacement et envoi utilisent le même pont que la recherche horizontale. Dès l’activation de Vertical Bars, la projection Web place le bouton de recherche enregistré au-dessus des onglets verticaux visibles, ou au bas du rail si les onglets sont masqués, et transmet son activation au FAB d’origine. La recherche native remplace cette projection Web lorsqu’elle est disponible. La présentation Web de recherche conserve aussi les onglets verticaux.

L’enregistrement de la recherche ne contourne pas les restrictions de positionnement. Sa barre de recherche et son bouton de fermeture doivent être dans des barres d’outils de pied de page fixes. Son déclencheur doit appartenir à un `ion-fab[slot="fixed"]` directement dans `ion-content`, ou directement à la disposition `.ion-page` existante non défilante. Un conteneur dans du contenu défilant n’est pas un emplacement fixe.

Pour les onglets horizontaux, une fois une disposition de recherche compatible mesurée, Native UI conserve le contrôleur de recherche tant que l’enregistrement existe, y compris pendant une transition ou une indisponibilité temporaire (`available: false`). Un premier enregistrement sur une page masquée conserve les onglets ordinaires jusqu’à la mesure des contrôles de recherche. Le même contrôleur gère onglets au repos et recherche active. Au repos, sa vue s’ajuste à `ion-tab-bar` pour préserver la largeur source du plateau ordinaire. UIKit peut limiter celle des petits groupes. UIKit gère le placement du bouton de recherche à côté des onglets. S’il ne peut pas adapter un groupe horizontal à la disposition source, la recherche reste Web. Les onglets admissibles restent natifs sauf s’ils couvriraient le déclencheur Web ; les onglets qui le chevauchent restent aussi Web. Enregistrez avant la fin d’entrée de la page cible (par exemple dans `ionViewWillEnter`) ; la projection commence dès que les contrôles peuvent être mesurés.

L’ouverture de la recherche préserve l’onglet Ionic sélectionné et n’affiche pas automatiquement le clavier (`automaticallyActivatesSearch` reste désactivé). Touchez le champ ou appelez `ion-searchbar.setFocus()` pour le clavier. Pendant la recherche, Native UI fige la projection de disposition Web et maintient le redimensionnement Capacitor Keyboard à `none` ; UIKit gère l’interface onglets/recherche sans ajustement de cadre durant la session. La fermeture restaure les onglets à leur placement source. Les onglets natifs ordinaires gardent une sélection optimiste jusqu’au rattrapage de l’état Web `selected`. Les événements d’entrée et mises à jour applicatives de `value` traversent le pont jusqu’à fermeture. Le SVG résolu du déclencheur, son libellé accessible et l’icône de recherche proviennent d’Ionic, y compris `ion-icon name`.

Les modifications natives passent par les gestionnaires de saisie d’Ionic, en conservant le debounce d’`ionInput`, `ionChange`, `ionFocus`, `ionBlur` et `ionClear`. Les changements de `value` programmatiques n’émettent pas d’`ionInput` ; les corrections synchrones de l’application sont distinguées des entrées natives périmées. L’édition native gère le texte en composition et le curseur. Le retour via l’action de fermeture du pied de page conserve la valeur et n’émet ni `ionCancel` ni `ionClear`.

### Configuration de recherche prise en charge

| Zone | Prise en charge native | Reste Web |
| -------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Groupe de recherche | Onglets de recherche enregistrés avec barre de recherche de verre en mode iOS. | Barres autonomes générales et barres classiques. |
| Clavier et texte | Clavier de recherche standard et correction/majuscules par défaut. | Modes de saisie, indications de touche retour, longueurs min/max, autocomplétion, correction ou orthographe personnalisés. |
| Effacement/annulation | Effacement par défaut, sans bouton d’annulation interne. | Icônes d’effacement personnalisées ou bouton d’annulation interne. |
| État et focus | Synchronise `disabled`, `placeholder`, `value` et `setFocus()`. | Les configurations incompatibles utilisent le Web. |

### Durée de vie et récupération de la recherche

Le retrait de page, les superpositions, l’exclusion du thème et la perte de responsabilité native ferment la présentation native et conservent la dernière valeur synchronisée ou de l’application. Une recherche ultérieure repart de cet état fermé. L’enregistrement survit aux transitions de pages mises en cache ; il n’est pas nécessaire de le refaire à chaque retour. Les attentes du pont sont limitées. Si une demande d’ouverture perd le pont, son Enter en attente peut se terminer via l’animation Web existante. Un pont déconnecté ne peut pas récupérer des caractères natifs qui n’ont jamais été transmis à JavaScript.

Remplacer le `ion-searchbar` enregistré ou son entrée met fin à l’ancienne session d’édition. Le remplacement conserve sa propre valeur d’application et démarre une nouvelle session native à la réouverture.

Pendant son activation, Native UI supprime l’effet de bord de défilement supérieur de la WebView car Ionic dessine déjà celui de l’en-tête. Cela évite un second dégradé sombre lorsque les thèmes système et Web diffèrent. Le réglage original est restauré à la destruction.

Le contrôleur de recherche natif reste visible au-dessus de son propre clavier. Les autres contrôles projetés sont masqués lorsqu’une entrée Web ouvre le clavier. L’accessibilité et le comportement Réduire les animations d’UIKit s’appliquent aux contrôles standard ; l’équivalence complète du parcours VoiceOver n’est pas une garantie vérifiée.

## Comportement des FAB

Les FAB conservent `activated`, le `show` de chaque enfant, `close()` et les gestionnaires de clic d’origine d’Ionic. Les listes multiples, le développement initial, les petits boutons et `edge` utilisent la disposition mesurée de chaque bouton. Le côté natif reflète la visibilité décalée d’Ionic sans ajouter de minuteur ni de contrôleur d’ouverture/fermeture. Les changements d’icône du bouton principal produisent un fondu avec le `closeIcon` résolu ; Réduire les animations désactive ce fondu. Les instances de boutons FAB natifs persistent entre les mises à jour d’ouverture et de fermeture. Le FAB source reste projeté pendant les ouvertures et fermetures ordinaires.

### Admissibilité des FAB

Un seul enfant incompatible laisse tout le FAB Web, même lorsque sa liste est fermée.

| Zone | Pris en charge | Reste Web |
| ---------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| Apparence | Verre circulaire standard. | Boutons pleins colorés ou fonds/formes/animations d’hôte personnalisés. |
| Contenu | Texte et SVG/`ion-icon` statiques résolus, y compris inversion RTL. | Illustrations incompatibles. |
| Actions | Gestionnaires de clic originaux. | FAB submit/reset ou avec `href`. |
| Placement | `slot="fixed"` sur un enfant direct de `ion-content`. | Placement non fixe ou `slot="fixed"` sur un frère de page. |

Par exemple, la page de démo `floating-action-button-fixed` à fond rouge conserve son apparence Web.

Les déclarations personnalisées d’animation ou de transition de l’hôte sur le FAB, la liste ou le bouton maintiennent le groupe sur le Web jusqu’à leur suppression. Les transformations de boutons prennent en charge l’identité standard et scale(0) des enfants masqués, pas les mises à l’échelle personnalisées. Pour les enfants d’une liste `display:none`, les navigateurs peuvent renvoyer une transformation calculée `none` même si une transformation personnalisée est déclarée. Ces transformations sont vérifiées lorsque la disposition devient disponible ; tout le FAB revient alors au Web si nécessaire. Le plugin n’analyse pas les feuilles de style de l’application et n’ouvre pas temporairement les listes pour prédire une disposition masquée.

## Transitions et récupération

L’animation intégrée `iosTransitionAnimation` attend le retrait natif avant de commencer l’animation Web. Progression interactive et fin/annulation sont mises en file pendant ce retrait. Les onglets partagés immobiles sont conservés. Le premier rendu et les transitions sans constructeur d’animation sont couverts par le runtime et le cycle de vie Ionic. Les constructeurs Ionic par défaut et personnalisés peuvent utiliser la même intégration via `withNativeUITransition()`, exporté par `@rdlabo/ionic-theme-ios27`. Consultez [Raccorder votre animation de navigation](ionic-vertical-bars.md#2-connect-your-navigation-animation).

Les passages natif/Web ordinaires utilisent un fondu d’opacité de 180ms, y compris Vertical Bars dans les deux sens. Les visuels sortants ne reçoivent ni interaction ni focus d’accessibilité. La réduction des animations et les modales utilisent des passages immédiats ; les contrôleurs de recherche conservent leur transition UIKit.

Les changements d’onglet évitent le fondu Web/natif pour qu’un instantané UIKit en retrait ne reste pas sur l’onglet suivant. La détection compare l’URL du routeur à l’onglet encore sélectionné dans `ionViewWillLeave`, ainsi qu’aux événements DOM vanilla `ionTabsWillChange` / `ionTabsDidChange`. Les ajouts et retraits de pages de la pile conservent le passage normal de 180ms.

Les superpositions Ionic standard suspendent la projection native ordinaire jusqu’à fermeture. Vertical Bars suit une politique distincte :

| Surface ou condition | Comportement de Vertical Bars |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Toast Web, popover ordinaire ou ancien picker | Conserve le rail natif visible, actualisé et interactif. |
| Popover ouvert depuis un bouton Vertical Bars, rendu Web | Repasse le rail en projection Web jusqu’à fermeture, y compris en cas de rejet natif ou d’échec de préparation. |
| Alerte, action sheet ou chargement | Restaure le Web pour que la superposition et son fond assombri couvrent correctement les contrôles. |
| Menu | Conserve le comportement existant du rail natif. |
| Modale de premier plan pleine largeur | Projette les contrôles de la modale à la place de ceux de la page couverte. |
| Modale incompatible avec Vertical Bars | Restaure le Web. |
| Suspension explicite, disposition native indisponible, document masqué ou géométrie clavier/fenêtre incompatible | Préserve le repli existant. |

La projection native reprend seulement après fermeture de toutes les superpositions exigeant le Web. Le popover natif Vertical Bars activable ci-dessous conserve sa propre présentation SwiftUI et gestion d’entrée. Les configurations de recherche incompatibles utilisent l’animation Web existante et partagent cette responsabilité avec les gestes de verre Web. Les animations CSS des surfaces contenantes compatibles provoquent aussi un rendu Web temporaire.

Pendant le retrait, la source est restaurée et peut se dessiner avant le retrait de sa couverture native. Pendant l’acquisition, la source n’est masquée qu’après une réponse native réussie et actuelle. Les réponses retardées sont revalidées par contrôle : les contrôles admissibles existants conservent leur couverture native pendant le rattrapage des mises à jour de contenu. Seules les sources supprimées ou inadmissibles reviennent au Web ; les sources nouvellement acquises exigent un accusé de réception exact. Les mutations ordinaires de page n’appellent jamais l’opération globale d’effacement. Les instances et éléments d’onglets UIKit sont conservés, et les cadres ou sélections identiques ne sont pas réappliqués. Les activations en double ou périmées sont ignorées. WebKit et UIKit rendent toujours séparément : l’implémentation évite une image volontairement vide, sans garantir une composition atomique au niveau du système. Validez les transitions et superpositions personnalisées sur les simulateurs pris en charge par l’application avant le déploiement ; les systèmes de superposition inconnus ne relèvent pas du contrat d’intégration automatique.

Si une mise à jour du pont échoue ou expire, la projection native s’arrête et le Web est restauré. Elle ne se reconnecte pas automatiquement. `getStatus().reason` indique l’échec ; tant que le repli Web est actif, le handle public indique `state: 'web'`, pas `stopped`. Pour réessayer explicitement, appelez `destroy()` sur ce handle, puis à nouveau `enableNativeUI()`.

Un échec ou délai dépassé des appels obligatoires de démarrage retourne un handle de repli Web. Les métriques WebView facultatives peuvent échouer sans désactiver les contrôles natifs. `destroy()` attend le nettoyage ; les appels répétés partagent son achèvement. Une activation demandée pendant le nettoyage l’attend, même si l’application n’a pas attendu `destroy()`. Attendez ces promesses lorsque l’opération suivante dépend du nettoyage et gérez les rejets.

Pour le diagnostic ou la fermeture de l’application :

```ts
const shell = await enableNativeUI(); // les appels répétés partagent le runtime
console.log(shell.getStatus()); // état, nombre de contrôles projetés, nombre de mises à jour, raison de l’échec
await shell.destroy(); // restaurer le DOM, retirer les contrôles natifs et libérer les écouteurs et le cache
```

La projection s’active en appelant l’API de démarrage. Les réglages partiels remplacent les valeurs par défaut :

```ts
const shell = await enableNativeUI({ controls: { tabs: false } }); // projection Ionic automatique sauf les onglets
await shell.disableVerticalControlArea(); // conserver les contrôles natifs ordinaires
await shell.enableVerticalControlArea();
await shell.destroy(); // arrêter toute projection
```

Consultez [toutes les options](configuration.md) pour les défauts, le mode rail uniquement et les méthodes de cycle de vie. Pour les sources HTML explicites sans Ionic, consultez la [configuration indépendante du framework](framework-independent.md).

### Popovers ancrés à Vertical Bars

**La présentation native des popovers est réservée à Vertical Bars.** Elle exige une ancre `ion-button` acceptée par le rail natif ; activer `ionic.verticalBars.popover` ne rend pas natifs les popovers de barres ordinaires ou du corps. Cette fonctionnalité fonctionne aussi avec le runtime Vertical Bars autonome, sans Native UI complet.

Activez `ionic.verticalBars.popover` pour présenter des popovers depuis les `ion-button` acceptés par le rail natif. La projection automatique des boutons Ionic est active par défaut ; lorsque `ionic.auto` vaut `false`, marquez chaque ancre avec `data-native-ui="button"` :

```ts
await enableNativeUI({
  ionic: { verticalBars: { popover: true } },
});
```

La même option existe via `enableVerticalControlArea()`. Utilisez un `ion-popover` dont `trigger` désigne le bouton projeté, ou passez l’événement de clic à `PopoverController.create({ event, ... })`. Le bouton doit être accepté par Vertical Bars natif ; les boutons ordinaires, contrôles du corps et ancres absentes ou rejetées conservent le Web Ionic.

Lorsque Vertical Bars redevient Web, le runtime mesure les surfaces natives actuelles du retour, des actions et des onglets avant leur retrait. Le repli Web utilise ces rectangles et s’affiche avant suppression native. Les mesures sont liées aux sources et à la fenêtre ; si elles sont indisponibles, le CSS s’applique. Cela aligne placement et taille, mais le verre et les icônes Web peuvent différer des matériaux système.

Les contrôles natifs de la page restent projetés pendant préparation, présentation et fermeture. Si la même ancre native accepte un toucher pendant la fermeture Ionic, une activation est conservée puis revalidée après nettoyage ; les touchers répétés sont regroupés. Le relais prépare sa WebView enfant pendant l’initialisation Ionic du contenu, termine sans mouvement l’animation Web d’entrée derrière l’hôte source masqué et présente via le popover SwiftUI standard du bouton. Il ne redimensionne ni ne déplace la WebView source. Ionic conserve contrôleur, cycle de vie, gestionnaires actifs et données de fermeture ; le contenu actif passe temporairement dans le document enfant et est restauré au nettoyage.

Un seul popover est relayé à la fois. Un popover imbriqué ou une modale créée dans le document enfant est retransféré comme élément actif au document source avant fermeture de l’enfant, y compris les superpositions ajoutées hors du contenu relayé. Il continue comme superposition Web avec gestionnaires et données ; son événement de présentation n’est pas rejoué. Ouvrir une autre superposition ou un menu, quitter la page, suspendre le shell ou perdre la disposition native restaure le Web. Le relais de modales, feuilles et alertes n’est pas couvert.

La présentation native gère flèche, coins et animation ; les animations Web d’entrée/sortie personnalisées ne les remplacent pas. Le constructeur source d’entrée s’exécute une fois avec durée et délai nuls (y compris les animations enfants), en utilisant le rectangle natif pour le placement `reference="trigger"` par défaut et l’état visible pour le repli Web. `reference="event"` explicite conserve les coordonnées d’événement Ionic. Un `enterAnimation` explicite est respecté ; sinon le constructeur iOS du package est utilisé. Définissez `enterAnimation` sur la superposition pour un constructeur personnalisé au lieu de compter sur `popoverEnter` global. Les popovers Material Design (`md`) restent Web. Les dimensions initiales du contenu proviennent d’Ionic.

#### Conditions de repli des popovers

Le relais copie les styles du document et du shadow DOM du popover et préserve l’espacement des bordures du contenu. Avant présentation, il compare certaines propriétés calculées de disposition et d’apparence aux dimensions source.

| Condition | Résultat |
| --------------------------------------------------------- | ------------------------------ |
| Différences de style/disposition détectées | Restaure le popover Web actif. |
| Effets visuels d’ancêtres ou conteneurs de taille incompatibles | Restaure le popover Web actif. |
| Contenu dépassant 1 000 éléments | Restaure le popover Web actif. |
| Changement des attributs d’ancêtres reproduits ou des styles de l’en-tête source | Restaure le Web. |
| Échec de préparation ou ancre native indisponible | Restaure le popover Web. |

Un popover de bouton de rail revenant au Web y ramène également le rail jusqu’à sa fermeture. Cette vérification ne garantit pas la compatibilité avec du CSS arbitraire (pseudo-éléments et modifications CSSOM dynamiques compris), des requêtes liées au document ou une parité complète VoiceOver/clavier matériel.

### Suspension pour une superposition personnalisée

Pour une modale ou superposition personnalisée que Native UI ne détecte pas, obtenez une suspension avant présentation. Sa résolution signifie que les contrôles projetés sont redevenus Web. Libérez-la toujours après fermeture :

```ts
const suspension = await shell.suspend();

try {
  await modal.present();
  await modal.onDidDismiss();
} finally {
  await suspension.resume();
}
```

Les suspensions peuvent être imbriquées et `resume()` est idempotent. La projection native ne reprend qu’après la libération de toutes les suspensions actives, à partir du DOM actuel et non d’un instantané périmé.

Le matériau et l’apparence des contrôles natifs suivent la version d’iOS en cours d’exécution ; un appareil iOS 26 ne prend pas l’apparence d’iOS 27 simplement en installant ce thème.

## Prise en charge d’iPhone Duo

La prise en charge d’iPhone Duo, y compris Vertical Bars autonome, est stable à partir de la version 2.0.0.

Le point d’entrée autonome Vertical Control Area (`@rdlabo/capacitor-native-ui/vertical-bars`) fonctionne avec une disposition Web fournie par l’application. Le thème propose une [feuille de style de rail facultative](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.0/packages/theme-ios27/docs/vertical-bars-layout.md), `@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css`, utilisable sans toute l’apparence iOS 27. Appelez `enableNativeUI({ controls: 'verticalOnly' })` pour ce cas ; sa sélection par défaut vise les contrôles de la zone verticale. Une application appelant déjà `enableNativeUI()` doit conserver ce runtime unique plutôt que démarrer les deux. Consultez [Disposition de l’appareil et panneaux divisés](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.0/packages/theme-ios27/docs/vertical-bars-layout.md) pour la configuration complète, y compris posture de charnière et panneaux pour les applications n’utilisant pas ce shell.

Vertical Bars utilise un `TabView` et une barre d’outils SwiftUI dans le rail système. Ionic reste la source des libellés, icônes, états sélectionné/désactivé et actions. Consultez [Vertical Bars](vertical-bars.md) pour la disposition du rail, le repli natif et les superpositions prises en charge.

Dans Vertical Bars, la sélection automatique des `ion-button` de barre fixe nécessite un `ion-icon` ou SVG avec `slot="icon-only"` ; `data-vertical-bars="true"` peut sélectionner explicitement d’autres boutons compatibles. Tous les remplissages et couleurs Ionic sont admissibles ; les boutons d’envoi suivent la même règle. Ajoutez `.ios-theme-horizontal-only` au bouton ou à son groupe `ion-buttons` pour le conserver horizontal. Consultez les [actions de barre d’outils](vertical-bars.md#toolbar-actions) pour les règles de placement et d’exclusion.

**Apparence des boutons natifs :** les boutons verticaux utilisent `buttonProjection: 'system'` par défaut. Utilisez `source` pour projeter remplissage et couleurs Ionic, avec `data-projection="source|system"` ou les classes équivalentes `ios-theme-projection-source` / `ios-theme-projection-system` pour les exceptions locales. Ces réglages concernent seulement les actions natives verticales `ion-button` et `ion-menu-button`. Les contrôles horizontaux et clones Web conservent leur comportement. Consultez [Choisir l’apparence des boutons](vertical-bars.md#choose-button-appearance) pour les priorités et règles de remplissage.

Pour une configuration autonome conservant votre thème existant, consultez [iPhone Duo avec votre thème existant](ionic-vertical-bars.md).

## API Native UI

La référence générée ci-dessous documente le handle retourné par `enableNativeUI()`. Le pont Capacitor sous-jacent et son protocole d’instantanés sont des détails d’implémentation.

<docgen-index>

- [`enableVerticalControlArea()`](#enableverticalcontrolarea)
- [`disableVerticalControlArea()`](#disableverticalcontrolarea)
- [`markForCheck()`](#markforcheck)
- [`getStatus()`](#getstatus)
- [`suspend()`](#suspend)
- [`destroy()`](#destroy)
- [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

Un shell actif. Les changements de placement préservent tous les autres réglages de démarrage.

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

### markForCheck()

```typescript
markForCheck() => void
```

Planifie une nouvelle vérification des sources. Les appels sont regroupés ; les instantanés inchangés ne sont pas envoyés. Sans effet après destruction ou sans runtime.

---

### getStatus()

```typescript
getStatus() => NativeUIStatus
```

Renvoie l’état actuel de projection Web/native.

**Retour :** <code><a href="#nativeuistatus">NativeUIStatus</a></code>

---

### suspend()

```typescript
suspend() => Promise<NativeUISuspension>
```

Rétablit les contrôles projetés sur le Web jusqu’à la reprise du bail renvoyé.

**Retour :** <code>Promise&lt;<a href="#nativeuisuspension">NativeUISuspension</a>&gt;</code>

---

### destroy()

```typescript
destroy() => Promise<void>
```

Arrête la synchronisation, rétablit les contrôles Web et libère les ressources natives.

---

### Interfaces

#### NativeUIStatus

| Propriété            | Type                                        |
| --------------- | ------------------------------------------- |
| **`state`**     | <code>'native' \| 'stopped' \| 'web'</code> |
| **`projected`** | <code>number</code>                         |
| **`updates`**   | <code>number</code>                         |
| **`reason`**    | <code>string</code>                         |

#### NativeUISuspension

| Méthode     | Signature                    | Description                                                                                    |
| ---------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| **resume** | () =&gt; Promise&lt;void&gt; | Libère cette suspension. La projection native reprend lorsque toutes les suspensions actives sont libérées. |

</docgen-api>
