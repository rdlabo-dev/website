---
title: "Native UI Shell (préversion)"
sourceRevision: "32aae8c2b668ab41cc77be12bcaa2e37ee23417ddc60830bffb6cc76d82c6fb2"
---
# Native UI Shell (préversion)

Native UI Shell est disponible en **préversion** dans `1.2.0`. Son API et les contrôles pris en charge peuvent évoluer avant la stabilisation. Celle-ci est prévue après la sortie officielle de Xcode 27.1.

Native UI Shell donne à une application Ionic des contrôles natifs de navigation et d’action autour de son contenu Web. Le plugin Capacitor iOS facultatif affiche les contrôles Ionic fixes pris en charge avec UIKit ou SwiftUI et le matériau Liquid Glass du système. Le contenu des pages, le défilement, l’état de l’application et le routage restent dans la WebView Ionic.

## Origine

Basecamp a décrit cette approche hybride dans [Hybrid sweet spot: Native navigation, web content](https://signalvnoise.com/posts/3743-hybrid-sweet-spot-native-navigation-web-content) le 8 mai 2014 : conserver le contenu Web au cœur de l’application et utiliser l’interface native lorsqu’elle améliore l’expérience. L’[annonce de Capacitor 1.0.0 Alpha](https://ionic.io/blog/announcing-capacitor-1-0-0-alpha), le 27 février 2018, incluait explicitement **Native UI Shell** dans sa feuille de route et renvoyait à cet article. L’association d’une interface native et de contenu Web faisait partie de l’orientation de Capacitor dès le départ.

Ce package reprend cette idée pour Ionic et Liquid Glass. Le balisage Ionic existant définit le shell : les contrôles de barre d’outils admissibles, les onglets, les FAB fixes et les onglets avec recherche obtiennent une présentation native. UIKit gère leur apparence et leurs interactions ; le pont synchronise l’état du DOM et renvoie les actions aux composants Ionic d’origine. Ionic conserve la pile de navigation, les transitions de pages et la logique de l’application. Le shell couvre uniquement les contrôles fixes pris en charge décrits ci-dessous.

## Activer le shell

Après avoir installé le CSS du thème décrit dans le README, activez le shell une seule fois au démarrage de l’application :

```ts
import { enableNativeUIShell } from '@rdlabo/ionic-theme-ios27/native';

void enableNativeUIShell();
```

`enableNativeUIShell()` lit aussi le rayon effectif du coin supérieur gauche de la WebView et l’applique aux transitions de pages. Pour configurer uniquement la transition sans activer les contrôles natifs, appelez :

```ts
import { configureNativeTransition } from '@rdlabo/ionic-theme-ios27/native';

await configureNativeTransition();
```

Conservez le réglage existant `navAnimation: iosTransitionAnimation`. Aucun enregistrement par page, aucune liste de composants, aucun callback natif ni contrôleur de vue Swift n’est requis. Exécutez `npx cap sync ios` après l’installation ou la mise à jour du package. Le plugin natif utilise Swift Package Manager (SPM). Pour une application CocoaPods existante, exécutez `npx cap spm-migration-assistant` et reliez le package généré `CapApp-SPM` à la cible de l’application dans Xcode. Compilez avec Xcode 26 ou ultérieur et Capacitor 8 ; le verre natif nécessite iOS 26 ou ultérieur. Le Web, Android, SSR et les versions antérieures d’iOS conservent l’implémentation Web.

Cette fonctionnalité doit être activée explicitement. Le point d’entrée ordinaire du package n’importe pas Capacitor, et `@capacitor/core` est une dépendance pair facultative. Les sources natives sont néanmoins détectées et compilées par la synchronisation Capacitor lorsque ce package est installé dans un projet Capacitor, même si l’application n’appelle pas `enableNativeUIShell()`.

L’apparence native suit le CSS de thème appliqué par classe, selon le système ou toujours sombre. Les changements de thème système sont synchronisés tant que le moteur est actif.

## Balisage pris en charge

Le tableau ci-dessous décrit Native UI Shell ordinaire. Vertical Bars utilise les [règles distinctes des actions de barre d’outils](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#toolbar-actions).

| Composant Ionic                               | Apparence et position prises en charge                                                                        | Rendu natif                                                      |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `ion-button`                                  | `fill="default"`, verre standard, dans une barre d’outils d’en-tête ou de pied de page fixe                                        | `UIButton` en verre                                                      |
| `ion-buttons`                                 | Barre d’outils fixe, avec au moins deux enfants directs `ion-button` / `ion-menu-button` à remplissage clear partageant le verre du thème | Une surface `UIGlassEffect` avec des boutons natifs indépendants           |
| `ion-back-button`                             | Icône et couleur standard dans une barre d’outils d’en-tête ou de pied de page fixe                                                  | `UIButton` en verre utilisant le libellé et l’icône Ionic résolus                 |
| `ion-menu-button`                             | Barre d’outils fixe, dans le `ion-buttons` en verre du thème                                                       | `UIButton` en verre ; bascule du menu Ionic d’origine                          |
| `ion-tab-bar`                                 | Onglets fixes, éléments avec icône seule ou libellé seul, une icône par élément, badges point ou texte, sélection et état désactivé  | `UITabBar` et `UITabBarItem`                                         |
| `ion-segment`                                 | Barre d’outils fixe, non défilante, avec du texte **ou** une icône par élément                                              | `UISegmentedControl`                                                  |
| `ion-fab` / `ion-fab-button` / `ion-fab-list` | FAB en verre dans un emplacement fixe d’`ion-content` ; un bouton principal et des listes directionnelles facultatives                  | Un `UIButton` en verre persistant par bouton ; un groupe de synchronisation FAB |

Pour Native UI Shell ordinaire, seuls les composants en mode iOS avec les variables du thème installées sont admissibles. Vertical Bars activé explicitement ne dépend pas du mode, comme décrit ci-dessous. `ios-theme-disabled` et l’ancien `ios26-disabled` sur un élément ou un ancêtre l’excluent toujours. Si le thème est désactivé sur un élément d’onglet ou de segment, tout son groupe reste sur le Web.

Utilisez `data-shell="disabled"`, ou la classe équivalente `ios-theme-shell-disabled`, pour désactiver uniquement Native UI Shell iOS tout en conservant le thème Web. L’élément et tous ses descendants sont exclus. Ajouter ou retirer l’attribut ou la classe à l’exécution restaure automatiquement le rendu Web ou réévalue l’admissibilité native.

Seule la valeur exacte `disabled` désactive la projection ; une valeur vide ou inconnue est ignorée. Retirez l’attribut pour réactiver la projection. Si la classe est aussi présente, retirez les deux. Cela ne désactive pas les clics et ne change pas le thème Web. L’attribut de données est disponible dans `1.2.0`.

```html
<ion-toolbar data-shell="disabled">
  <ion-button>Web glass button</ion-button>
</ion-toolbar>
```

Si un enfant d’une surface native partagée désactive la projection, toute la surface reste sur le Web : cela concerne les groupes de boutons, les barres d’onglets, les segments et les listes FAB. Désactiver la projection du FAB de recherche ou d’une partie du pied de page de recherche désactive l’intégration de recherche native ; la barre d’onglets peut encore être native si elle reste admissible.

Le positionnement est requis même avec une apparence en verre. Dans Native UI Shell ordinaire, les boutons, boutons de retour, groupes de boutons de menu et segments nécessitent une barre d’outils directement dans `ion-header` ou `ion-footer`, sans ancêtre `ion-content` autour du contrôle. Les boutons directement dans un en-tête ou pied de page, les barres d’outils autonomes et les barres d’outils ou en-têtes imbriqués dans du contenu défilant restent sur le Web. Les FAB sans `slot="fixed"` aussi. Déplacer un contrôle projeté vers un emplacement exclu restaure son rendu Web ; le déplacer à nouveau réévalue son admissibilité. Lorsque `.ios-theme-vertical-bars` est activé, un `ion-back-button` standard peut être projeté dans la zone de contrôle verticale depuis l’extérieur d’une barre d’outils fixe, y compris depuis le contenu routé ou un shell d’application persistant. L’application choisit où activer ce mode et quel mode de composant Ionic utiliser ; la projection Vertical Bars ne nécessite pas les classes du mode `ios`. Les en-têtes repliés, les contrôles ayant désactivé la projection et les pages quittées sont exclus. Les modales de premier plan sur toute la largeur peuvent participer à Vertical Bars comme décrit ci-dessous ; les autres surfaces de superposition conservent leur disposition.

Les onglets natifs acceptent des éléments de largeur égale avec le réglage Ionic par défaut `layout="icon-top"`. La barre native utilise localement les classes de taille horizontale compacte et verticale normale pour conserver les icônes et libellés superposés du Web sur iPad et en paysage. Cela ne change pas la classe de taille de l’application. La taille et la graisse des libellés suivent l’instantané Web. Les autres dispositions Ionic explicites (`icon-start`, `icon-end`, `icon-bottom`, `icon-hide`, `label-hide`) et les largeurs inégales maintiennent toute la barre d’onglets sur le Web. Les positions start, center et end suivent le `ion-tab-bar` d’origine, y compris en RTL. Les images directionnelles `ion-icon` conservent leur retournement RTL rendu.

En dehors de Vertical Bars, les boutons autonomes à remplissage clear, solid et outline sont exclus. Un groupe `ion-buttons` en verre avec au moins deux boutons clear est projeté comme une seule surface ; ses enfants gardent des actions distinctes. Les boutons de menu peuvent aussi partager ce groupe. Un bouton de menu seul utilise son `ion-buttons` parent comme surface de verre : aucun verre Web ne reste sous le bouton natif. Un bouton de menu hors de ce verre du thème reste sur le Web. Les remplissages mixtes, les enfants non pris en charge ou un enfant au thème désactivé maintiennent le groupe sur le Web. Les boutons clear seuls restent sur le Web. Les couleurs de boutons personnalisées, les icônes et couleurs de retour personnalisées, les en-têtes repliables, les barres d’outils dans du contenu défilant, le contenu des modales, les segments défilants ou développés et l’intégration segment-view restent sur le Web. Les slots complexes et les fonctionnalités SVG non prises en charge reviennent aussi au Web. Le plugin ne traduit pas le CSS arbitraire de l’application en styles UIKit.

Le verre natif échantillonne le contenu Web effectivement dessiné derrière lui. Les arrière-plans de barre d’outils et le flou d’en-tête existants affectent toujours ce contenu. Pour faire défiler le contenu sous un en-tête, utilisez la disposition Ionic normale avec en-tête translucide et contenu plein écran ; le plugin ne déplace pas le contenu des pages et ne remplace pas un arrière-plan opaque de barre d’outils géré par l’application.

Lorsqu’une entrée Web possède le clavier logiciel, les contrôles ordinaires reviennent au rendu Web et leur admissibilité est réévaluée à sa fermeture. Cela couvre aussi les dispositions iPad où le clavier ne déplace pas la fenêtre d’affichage visuelle. Un champ de recherche natif conserve son propre clavier et sa surface de recherche native.

Lorsqu’un contrôle existant devient non pris en charge, sa source Web est dessinée avant le retrait de sa couverture native. Cela évite un passage à vide, mais les mises à jour Web/UIKit ne sont pas atomiques et peuvent se superposer brièvement. Ce comportement à la frontière diffère de la navigation ordinaire entre pages, où les onglets natifs partagés inchangés sont conservés.

## État et événements

Les boutons de menu utilisent l’icône par défaut ou configurée résolue par Ionic, ou une icône ou un libellé de slot pris en charge. L’activation native clique sur le `ion-menu-button` d’origine, en conservant le ciblage `menu`. Les types de bouton de menu non standard (`submit` / `reset`) restent sur le Web. `disabled`, `autoHide`, la disponibilité du menu et la visibilité du split-pane suivent le DOM réel. Ouvrir un menu restaure les contrôles Web et retire leurs couvertures natives ; le fermer reprojette les contrôles admissibles.

Le DOM est la source des libellés, du contenu SVG, du positionnement, des valeurs sélectionnées et du comportement de l’application. La référence de positionnement est `ion-tab-bar` lui-même. Le contenu natif des onglets utilise ce rectangle comme proposition de taille et ancre de placement, en tenant compte du cadre extérieur plus grand d’UITabBar : `tab-bar-position-start`, `tab-bar-position-center` et `tab-bar-position-end` contrôlent l’ancre horizontale, y compris en RTL ; `slot="bottom"` conserve le bord inférieur et `slot="top"` le bord supérieur. Les changements de classe sont réconciliés automatiquement. UIKit gère les marges internes et les dimensions de la surface, tandis que la disposition superposée prise en charge et la typographie des libellés suivent le Web. UIKit peut limiter la largeur du contenu même avec un positionnement qui remplit l’espace. Sur les fenêtres d’affichage d’au moins 768px, le thème Web limite les barres standard de deux, trois, quatre et cinq éléments près des mesures de surfaces superposées sur iPad : 188, 274, 336 et 414pt. Les fenêtres plus petites conservent les dimensions du téléphone. La barre standard mesure 62pt de haut, avec une sélection de 54pt et un retrait de 4pt. Les boutons voisins se chevauchent comme les contrôles UIKit ; l’alignement des icônes et libellés est vérifié avec des captures du simulateur. Ces mesures sont des objectifs d’apparence par défaut, pas une garantie pour les polices, icônes ou libellés personnalisés ; UIKit détermine toujours sa largeur intrinsèque. Une largeur ou hauteur native différente ne rejette pas la projection. Les mises à jour des badges et titres conservent l’identité des éléments natifs et remesurent la surface à la même ancre. Le plugin n’étire pas les icônes et ne modifie pas les contrôles internes UIKit pour imposer les largeurs CSS des éléments. Il mesure le sous-arbre contenant les contrôles d’onglets natifs sans noms de classes privés ni corrections de retrait fixes ; une disposition inconnue restaure le rendu Web. Le moteur surveille les changements de structure, les racines shadow concernées, le dimensionnement, les événements de cycle de vie des pages et les superpositions. Les changements d’ancêtres `display: none`, de `hidden`, de classes de thème, de suppression de composants et d’état désactivé sont réconciliés automatiquement. Les événements tactiles natifs sont vérifiés par rapport au DOM actuel et à la révision avant de cliquer sur l’élément Ionic d’origine.

Pour les formulaires, conservez `ion-button type="submit"` et le gestionnaire d’envoi existant du formulaire. Un formulaire externe est toujours transmis via `[form]="formRef"`. Le plugin n’appelle pas `form.submit()`, n’ajoute pas de deuxième chemin d’envoi et ne modifie pas la responsabilité des formulaires Angular. Les valeurs des segments conservent leur type d’origine puisque le `ion-segment-button` d’origine est cliqué ; les changements de valeur programmatiques n’émettent pas d’`ionChange` synthétique.

Les libellés utilisent du texte natif. Les SVG statiques locaux et les SVG `ion-icon` résolus, y compris `name` et les changements de `name`, sont rasterisés à l’échelle d’affichage et mis en cache. La projection source conserve leurs couleurs ; la projection système des boutons de barre d’outils verticale utilise des icônes modèles teintées par SwiftUI. Les SVG d’onglets suivant la couleur du texte utilisent le rendu de modèle natif : icônes et libellés changent ainsi de couleur de sélection ensemble, sans attendre une nouvelle image du pont. Les images d’onglets multicolores conservent leurs couleurs d’origine. Les références externes, `<use>`, les animations, le HTML et les images intégrés, le texte SVG et les feuilles de style sont exclus. Les polices Web et les dispositions arbitraires de slots ne sont pas reproduites exactement.

L’hôte natif n’accepte les entrées que dans les contrôles natifs. L’interaction et l’accessibilité des onglets sont fournies par le contrôle standard [UITabBar](https://developer.apple.com/documentation/uikit/uitabbar). Les zones vides transmettent les contacts à la WebView. Ionic iOS masque les badges vides par défaut. Un `ion-badge` vide mais visible devient un point de notification natif ; un badge non vide affiche son texte. Les couleurs de fond et de texte des badges viennent des styles calculés du DOM, y compris les palettes `color` d’Ionic. Les badges masqués ou retirés effacent le badge natif. Les onglets utilisent le contrôle d’onglets standard d’UIKit pour la sélection, le comportement tactile, les badges et l’accessibilité, en conservant l’identité des éléments pendant les mises à jour de sélection. UIKit gère la disposition des éléments dans la barre mesurée : le positionnement CSS arbitraire n’est donc pas reproduit. Les contrôles natifs exposent leurs noms, états désactivé et sélectionné, et badges à l’accessibilité ; leur source est masquée de l’accessibilité Web pendant la projection. Cela ne garantit pas un parcours VoiceOver identique entre Web et UIKit.

## Onglets avec recherche

Les enregistrements existants `attachTabBarSearchable(tabBar, fabButton, footer)` utilisent automatiquement la recherche native lorsque leur barre d’onglets inférieure et leurs contrôles de recherche en verre sont pris en charge. Aucune nouvelle option de composant, route, configuration native ou écouteur de page n’est requis. Les barres d’onglets ordinaires continuent d’utiliser `UITabBar` ; les groupes horizontaux avec recherche utilisent un `UITabBarController` persistant, `UITab` / `UISearchTab` et `UISearchController`. La WebView Capacitor d’origine continue d’afficher les résultats et de gérer la navigation.

Avec Vertical Bars, le rail natif conserve tous les onglets et leur sélection. `searchable` et `searchToolbarBehavior(.minimize)` de SwiftUI fournissent le bouton, le champ, le contrôle de fermeture et les transitions de recherche système dans la même surface de navigation native. Apple détermine leur position pour la disposition actuelle de l’appareil et donne le focus au champ natif à l’ouverture de la recherche système. Les événements de saisie, focus, effacement et envoi utilisent le même pont que la recherche horizontale. Dès l’activation de Vertical Bars, la projection Web place le bouton de recherche enregistré au-dessus des onglets verticaux visibles, ou au bas du rail si les onglets sont masqués, et transmet son activation au FAB d’origine. La recherche native remplace cette projection Web lorsqu’elle est disponible. La présentation Web de recherche conserve aussi les onglets verticaux.

L’enregistrement de la recherche ne contourne pas les restrictions de positionnement. Sa barre de recherche et son bouton de fermeture doivent être dans des barres d’outils de pied de page fixes. Son déclencheur doit appartenir à un `ion-fab[slot="fixed"]` directement dans `ion-content`, ou directement à la disposition `.ion-page` existante non défilante. Un conteneur dans du contenu défilant n’est pas un emplacement fixe.

Pour les onglets horizontaux, tant qu’un enregistrement est actif, Native UI Shell conserve le contrôleur de recherche même pendant une transition ou lorsque la page est temporairement indisponible (`available: false`). Le même contrôleur gère les onglets au repos et la recherche active. Au repos, sa vue est ajustée au `ion-tab-bar` source pour préserver la largeur d’origine du plateau d’onglets ordinaire. UIKit peut limiter cette largeur pour les petits groupes d’onglets. UIKit gère le placement du bouton de recherche à côté des onglets. Enregistrez la recherche avant la fin de l’entrée de la page de destination (par exemple dans `ionViewWillEnter`) pour éviter d’afficher d’abord des onglets ordinaires puis de les remplacer lors de la première visite.

L’ouverture de la recherche conserve l’onglet Ionic sélectionné et n’affiche pas automatiquement le clavier (`automaticallyActivatesSearch` reste désactivé). Touchez le champ ou appelez `ion-searchbar.setFocus()` pour afficher le clavier. Pendant la recherche, Native UI Shell fige la projection de la disposition Web et maintient le redimensionnement de Capacitor Keyboard à `none` ; UIKit gère les contrôles d’onglets et de recherche sans réajuster leurs cadres pendant la session. La fermeture de la recherche rétablit les onglets ordinaires à leur emplacement source. Les onglets natifs ordinaires gardent une sélection optimiste jusqu’à la mise à jour de l’état `selected` du Web. Les événements de saisie et les mises à jour de `value` de l’application continuent à passer par le pont jusqu’à la fermeture de la recherche. Le SVG résolu du déclencheur, son libellé d’accessibilité et l’icône de recherche sont projetés depuis Ionic, y compris `ion-icon name`.

Les modifications natives passent par les gestionnaires de saisie d’Ionic, en conservant le debounce d’`ionInput`, `ionChange`, `ionFocus`, `ionBlur` et `ionClear`. Les changements de `value` programmatiques n’émettent pas d’`ionInput` ; les corrections synchrones de l’application sont distinguées des entrées natives périmées. L’édition native gère le texte en composition et le curseur. Le retour via l’action de fermeture du pied de page conserve la valeur et n’émet ni `ionCancel` ni `ionClear`.

La première configuration de recherche prise en charge utilise des barres de recherche en verre en mode iOS, avec le clavier de recherche standard, le contrôle d’effacement par défaut, sans bouton d’annulation interne et avec les réglages par défaut d’autocorrection et de capitalisation. Les modes de saisie personnalisés, les indications de touche de retour, les longueurs minimale/maximale, l’autocomplétion, l’autocorrection, la correction orthographique, les icônes d’effacement et les barres de recherche classiques restent sur le Web. `disabled`, `placeholder`, `value` et `setFocus()` sont synchronisés pour les groupes compatibles. Les barres de recherche autonomes générales ne font pas partie de cette fonctionnalité.

Le retrait de page, les superpositions, l’exclusion du thème et la perte de responsabilité native ferment la présentation native et conservent la dernière valeur synchronisée ou de l’application. Une recherche ultérieure repart de cet état fermé. L’enregistrement survit aux transitions de pages mises en cache ; il n’est pas nécessaire de le refaire à chaque retour. Les attentes du pont sont limitées. Si une demande d’ouverture perd le pont, son Enter en attente peut se terminer via l’animation Web existante. Un pont déconnecté ne peut pas récupérer des caractères natifs qui n’ont jamais été transmis à JavaScript.

Remplacer le `ion-searchbar` enregistré ou son entrée met fin à l’ancienne session d’édition. Le remplacement conserve sa propre valeur d’application et démarre une nouvelle session native à la réouverture.

Lorsqu’il est activé, Native UI Shell supprime l’effet de bord supérieur de défilement de la WebView, car Ionic dessine déjà le bord de l’en-tête. Cela évite un deuxième dégradé sombre lorsque les thèmes du système et du Web diffèrent. Le réglage d’origine est restauré à la destruction.

Le contrôleur de recherche natif reste visible au-dessus de son propre clavier. Les autres contrôles projetés sont masqués lorsqu’une entrée Web ouvre le clavier. L’accessibilité et le comportement Réduire les animations d’UIKit s’appliquent aux contrôles standard ; l’équivalence complète du parcours VoiceOver n’est pas une garantie vérifiée.

## Transitions et récupération

Les FAB conservent `activated`, le `show` de chaque enfant, `close()` et les gestionnaires de clic d’origine d’Ionic. Les listes multiples, le développement initial, les petits boutons et `edge` utilisent la disposition mesurée de chaque bouton. Le côté natif reflète la visibilité décalée d’Ionic sans ajouter de minuteur ni de contrôleur d’ouverture/fermeture. Les changements d’icône du bouton principal produisent un fondu avec le `closeIcon` résolu ; Réduire les animations désactive ce fondu. Les instances de boutons FAB natifs persistent entre les mises à jour d’ouverture et de fermeture. Le FAB source reste projeté pendant les ouvertures et fermetures ordinaires.

La prise en charge des FAB couvre l’apparence standard circulaire en verre, le texte et le contenu statique SVG/`ion-icon` résolu, y compris le miroir des icônes en RTL. Un enfant non pris en charge maintient tout le FAB dans le rendu Web, même lorsque sa liste est fermée. Les boutons solid colorés, les FAB submit/reset ou href, les arrière-plans, formes ou animations de l’hôte personnalisés, les positions hors d’un emplacement fixe et les images non prises en charge restent Web. Par exemple, la page de démo `floating-action-button-fixed` à fond rouge conserve son apparence Web. Un FAB à emplacement fixe doit être un enfant direct d’`ion-content` ; un attribut `slot="fixed"` sur un frère de la page n’est pas un slot de contenu.

Les déclarations personnalisées d’animation ou de transition de l’hôte sur le FAB, la liste ou le bouton maintiennent le groupe sur le Web jusqu’à leur suppression. Les transformations de boutons prennent en charge l’identité standard et scale(0) des enfants masqués, pas les mises à l’échelle personnalisées. Pour les enfants d’une liste `display:none`, les navigateurs peuvent renvoyer une transformation calculée `none` même si une transformation personnalisée est déclarée. Ces transformations sont vérifiées lorsque la disposition devient disponible ; tout le FAB revient alors au Web si nécessaire. Le plugin n’analyse pas les feuilles de style de l’application et n’ouvre pas temporairement les listes pour prédire une disposition masquée.

L’`iosTransitionAnimation` intégré attend le retrait natif avant de démarrer l’animation Web. La progression interactive et la fin ou l’annulation sont mises en attente pendant ce retrait. Les onglets partagés immobiles sont conservés. Le premier rendu et les transitions sans constructeur d’animation sont couverts par le moteur de démarrage et les événements de cycle de vie Ionic. Les constructeurs de navigation Ionic par défaut et personnalisés peuvent utiliser la même intégration via `withNativeUIShellTransition()`, exporté depuis la racine du package et `/vertical-bars`. Consultez [Relier votre animation de navigation](./iphone-duo-with-original-theme.md#3.-connect-your-navigation-animation) pour la configuration.

Les changements d’onglet évitent le fondu Web/natif pour qu’un instantané UIKit en retrait ne reste pas sur l’onglet suivant. La détection compare l’URL du routeur à l’onglet encore sélectionné dans `ionViewWillLeave`, ainsi qu’aux événements DOM vanilla `ionTabsWillChange` / `ionTabsDidChange`. Les ajouts et retraits de pages de la pile conservent le passage normal de 180ms.

Les superpositions Ionic standard suspendent la projection native jusqu’à leur fermeture. Les configurations non prises en charge d’onglets avec recherche utilisent l’animation Web existante et partagent cette gestion avec les gestes de verre Web. Les animations CSS des surfaces englobantes prises en charge provoquent aussi un rendu Web temporaire.

Pendant le retrait, la source est restaurée et peut se dessiner avant le retrait de sa couverture native. Pendant l’acquisition, la source n’est masquée qu’après une réponse native réussie et actuelle. Les réponses retardées sont revalidées par contrôle : les contrôles admissibles existants conservent leur couverture native pendant le rattrapage des mises à jour de contenu. Seules les sources supprimées ou inadmissibles reviennent au Web ; les sources nouvellement acquises exigent un accusé de réception exact. Les mutations ordinaires de page n’appellent jamais l’opération globale d’effacement. Les instances et éléments d’onglets UIKit sont conservés, et les cadres ou sélections identiques ne sont pas réappliqués. Les activations en double ou périmées sont ignorées. WebKit et UIKit rendent toujours séparément : l’implémentation évite une image volontairement vide, sans garantir une composition atomique au niveau du système. Validez les transitions et superpositions personnalisées sur les simulateurs pris en charge par l’application avant le déploiement ; les systèmes de superposition inconnus ne relèvent pas du contrat d’intégration automatique.

Si une mise à jour du pont échoue ou expire, le moteur s’arrête et restaure le rendu Web. Il ne se reconnecte pas automatiquement. `getStatus()` indique `stopped` et sa raison ; pour réessayer délibérément, appelez `destroy()` sur ce handle puis à nouveau `enableNativeUIShell()`.

Pour le diagnostic ou la fermeture de l’application :

```ts
const shell = await enableNativeUIShell(); // les appels répétés partagent le moteur
console.log(shell.getStatus()); // état, nombre de contrôles projetés, nombre de mises à jour, raison de l’échec
await shell.destroy(); // restaurer le DOM, retirer les contrôles natifs et libérer les écouteurs et le cache
```

La projection est activée globalement par défaut. Limitez-la à certains composants Ionic si l’application ne souhaite qu’une partie du shell natif, ou désactivez-la globalement en conservant le même chemin de configuration :

```ts
const shell = await enableNativeUIShell({
  enabled: true,
  controls: {
    tabs: true,
  },
});

// Équivaut à laisser Native UI Shell désactivé ; tous les contrôles restent sur le Web.
const disabledShell = await enableNativeUIShell({ enabled: false });
```

Omettre `controls` active tous les contrôles pris en charge pour conserver la compatibilité. Lorsque `controls` est présent, seules les entrées définies à `true` sont admissibles au rendu natif. Les entrées disponibles sont `tabs`, `toolbar`, `segment` et `fab`.

Pour une modale ou superposition personnalisée que Native UI Shell ne peut pas détecter, obtenez une suspension avant de la présenter. Une suspension résolue signifie que les contrôles projetés sont revenus au rendu Web. Libérez-la toujours après la fermeture :

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

## Prendre en charge iPhone Duo (préversion)

La prise en charge d’iPhone Duo, y compris Vertical Bars en mode autonome sans Native UI Shell, est disponible en **préversion** dans `1.2.0`, avec Native UI Shell. Ses API et comportements pris en charge peuvent évoluer.

Le point d’entrée autonome Vertical Control Area (`@rdlabo/ionic-theme-ios27/vertical-bars`) et `dist/css/vertical-bars.css` fonctionnent sans charger le thème iOS 27. Appelez `enableVerticalControlArea()` pour ce cas ; il ne projette que les contrôles placés dans la zone verticale. Les applications appelant déjà `enableNativeUIShell()` doivent conserver ce moteur unique plutôt que lancer les deux. Consultez [Prise en charge d’iPhone Duo](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo) pour la configuration complète, avec position de la charnière et panneaux divisés des applications n’utilisant pas du tout ce shell.

Vertical Bars utilise un `TabView` et une barre d’outils SwiftUI dans le rail système. Ionic reste la source des libellés, icônes, états sélectionné/désactivé et actions. Consultez [Vertical Bars](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars) pour la disposition du rail, le repli natif et les superpositions prises en charge.

Dans Vertical Bars, les actions `ion-button` de barre d’outils fixe nécessitent un `ion-icon` ou SVG avec `slot="icon-only"`. Tous les remplissages et couleurs Ionic sont admissibles ; les boutons d’envoi suivent la même règle de positionnement. Ajoutez `.ios-theme-horizontal-only` à un bouton ou à son groupe `ion-buttons` pour le garder horizontal. Consultez [Actions de barre d’outils](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#toolbar-actions) pour les règles de positionnement et d’exclusion.

**Apparence des boutons natifs :** dans `1.2.0`, les boutons verticaux natifs utilisent par défaut `buttonProjection: 'system'`. Utilisez `source` pour projeter le remplissage et les couleurs Ionic, avec `data-projection="source|system"` ou les classes équivalentes `ios-theme-projection-source` / `ios-theme-projection-system` pour les exceptions locales. Ces réglages ne concernent que les actions natives verticales `ion-button` et `ion-menu-button`. Les contrôles horizontaux et clones Web gardent leur comportement existant. Consultez [Choisir l’apparence des boutons](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#choose-button-appearance) pour la migration, les priorités et les règles de remplissage.

Pour une configuration autonome conservant votre thème existant, consultez [iPhone Duo avec votre thème existant](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme).

## API Native UI Shell

La référence générée ci-dessous documente le handle renvoyé par `enableNativeUIShell()`. Le pont Capacitor sous-jacent et son protocole de snapshots des contrôles sont des détails d’implémentation.

<docgen-index>

* [`getStatus()`](#getstatus)
* [`suspend()`](#suspend)
* [`destroy()`](#destroy)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

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

</docgen-api>

## Organisation du code source

Chaque module TypeScript de [`src/native/components`](../src/native/components) déclare sa balise Ionic et son lecteur DOM. `components/index.ts` combine ces exports pour former les sélecteurs de découverte et le type de composant. Les mesures DOM partagées, les données d’éléments et le rendu SVG résident dans `src/native/shared` ; `runtime.ts` gère la synchronisation, les transferts de visibilité et les événements de cycle de vie.

Sur iOS, [`Components`](../ios/Sources/IonicNativeUIShellPlugin/Components) gère la création et la mise à jour des contrôles UIKit ainsi que les noms de composants. `ShellButton` partage l’implémentation native utilisée par les boutons ordinaires, de retour et de menu. `Shared` gère la vue hôte, les snapshots typés, la géométrie, les couleurs et le cache d’images. Capacitor décode chaque snapshot complet une seule fois avec `Decodable` ; les moteurs de rendu consomment des modèles typés et comparent le contenu avec `Equatable`. Les lots invalides sont rejetés avant de modifier les contrôles visibles. `IonicNativeUIShellPlugin.swift` coordonne les appels Capacitor, les révisions et la durée de vie des vues natives.

## Démonstration et vérification

La démonstration comprend une page `native-ui-shell` pour tester les contrôles fixes. Depuis la racine du dépôt, compilez la bibliothèque et exécutez les tests navigateur :

```sh
npm ci
npm run build
cd demo
npm ci
npx --no-install playwright install chromium
npx --no-install playwright test e2e/native-ui-shell.spec.ts e2e/native-ui-shell-edge.spec.ts
```

Pour les tests d’interaction et de placement natifs, utilisez Xcode 26 ou ultérieur, XcodeGen et un simulateur iOS 26+ démarré. Depuis la racine du dépôt, exécutez `sh scripts/verify-native-ui-shell.sh SIMULATOR_UDID`. Cette commande compile également une application consommatrice indépendante avec Swift Package Manager depuis le package npm. Exécutez `sh scripts/verify-native-search.sh SIMULATOR_UDID` pour l’intégration des onglets avec recherche, ou ajoutez `edge` à cette commande pour les cas limites de placement, navigation et clavier. Les scripts indiquent l’emplacement de leurs artefacts de test locaux.

Les contrôleurs de recherche conservent leur transition gérée par UIKit et sont exclus du fondu d’acquisition des contrôles ordinaires.
