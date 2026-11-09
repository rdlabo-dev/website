---
title: "Système de couleurs"
sourceRevision: "95393078f806a13505d7d20cae6753b00b7e6538e69cc591c91a7a4f1215553a"
---

# Système de couleurs

Le thème fonctionne avec la seule palette de couleurs standard d’Ionic. Il n’exige ni JavaScript, ni plugin Capacitor, ni schéma Material complet. Les rôles de couleur Material supplémentaires affinent facultativement le même design de composants.

## Valeurs par défaut avec Ionic seul

Importez les styles Ionic habituels et ce thème. Définissez comme d’habitude les couleurs nommées Ionic (contraste compris), les arrière-plans et les textes. Les palettes claire et sombre suivent les mêmes règles ; il n’existe pas de palette MD3 distincte codée en dur.

Les composants ordinaires conservent l’intention des couleurs Ionic existantes. Le contenu et le menu utilisent `--ion-background-color` ; barre d’outils, carte, élément et barre d’onglets conservent leurs variables Ionic de fond/texte et leurs chaînes de repli habituelles. Aucune teinte de surface neutre n’est générée pour les cartes, pages, listes ou superpositions ordinaires. Les attributs `color` explicites et les personnalisations `--background` / `--color` restent disponibles. Les rôles Material facultatifs affinent explicitement la palette Ionic sous-jacente. Les personnalisations de composant `--background` / `--color` gardent le dernier mot.

Un rôle Material facultatif n’affine que les composants qui le consomment. Les rôles non spécifiés retombent sur les couleurs Ionic du composant ; fournir un seul rôle n’active pas toute une palette neutre générée. Les modes clair et sombre utilisent le même mécanisme.

Les variantes explicites (`.md3-tonal`, `.md3-elevated`, `.md3-filled`, `.md3-outlined`, `.md3-selected`) demandent volontairement des traitements de couleur supplémentaires. Leurs couleurs manquantes de conteneur/contour peuvent être dérivées de la palette Ionic par mélange CSS. Cette dérivation concerne les variantes demandées et ne modifie pas tous les composants sans couleur. Les contrôles accentués conservent primary/contrast d’Ionic si les paires Material facultatives d’accent/conteneur sont absentes.

## Rôles facultatifs

Personnalisez uniquement les rôles nécessaires, sur la racine ou un conteneur local :

```css
.my-section {
  --md-sys-color-secondary-container: #d8e2ff;
  --md-sys-color-on-secondary-container: #001a41;
}

.ion-palette-dark .my-section {
  --md-sys-color-secondary-container: #243e68;
  --md-sys-color-on-secondary-container: #d8e2ff;
}
```

Lorsque vous changez une paire de rôles premier plan/arrière-plan, fournissez les deux ensemble. Les rôles omis suivent toujours Ionic. Aucune inscription distincte ni schéma complet n’est nécessaire.

Material You est un fournisseur facultatif de ces valeurs. Consultez les [couleurs dynamiques](dynamic-colors.md) pour l’acquisition native et le contrôle d’apparence. Le fournisseur préserve les rôles Material `on*` pour MD3 ; les couleurs nommées Ionic utilisent les `onPrimary`, `onSecondary`, `onTertiary` et `onError` fournis comme valeurs de contraste, avec le calcul Ionic comme repli par rôle. Shade et tint conservent les calculs Ionic. L’API native expose aussi des rôles fixed/inverse facultatifs pour les composants personnalisés.

Pour vos composants Sass, importez `utils/colors` depuis le chemin exporté `src/styles` du package et utilisez `color(secondary-container)` sous l’espace de noms du module. La fonction produit un rôle facultatif et le même repli Ionic. Elle accepte les rôles de `utils/_colors.scss` et fait échouer le build Sass sur un rôle inconnu. Ses replis de conteneur générés visent les variantes explicitement demandées ; les composants ordinaires conservent leurs chaînes Ionic. Pour du CSS simple, utilisez le même motif `var(--md-sys-color-..., ...)` avec un repli Ionic.

## Attribution aux composants

Pour les surfaces ordinaires, **Base** désigne `surface-container-lowest` en mode clair et `surface-container-low` en mode sombre. **Panel** désigne `surface-container-lowest` en clair et `surface-container-high` en sombre. Les rôles absents conservent le repli de fond Ionic du composant. Les surfaces claires par défaut restent ainsi blanches ; `color="light"` est un choix de palette distinct (`surface-container-low` en clair, `surface-container-highest` en sombre), pas un alias de tous les fonds par défaut.

Le tableau indique les consommateurs de rôles Material facultatifs. En l’absence d’un rôle, le composant conserve le repli Ionic décrit ci-dessus.

| Composant / variante | Arrière-plan | Premier plan / détail |
| --- | --- | --- |
| bouton plein | primary | on-primary |
| bouton tonal (`md3-tonal`, remplissage plein) | secondary-container | on-secondary-container |
| bouton surélevé (`md3-elevated`, remplissage plein) | surface-container-low | primary |
| bouton à contour / textuel | transparent | primary ; bordure outline pour le contour |
| carte (surélevée par défaut) | Panel | on-surface ; sous-titre on-surface-variant |
| carte pleine (`md3-filled`) | surface-container-highest | on-surface |
| carte à contour (`md3-outlined`) | surface | on-surface ; bordure outline-variant |
| FAB | primary-container | on-primary-container |
| puce / puce sélectionnée (`md3-selected`) | surface-container-low / secondary-container | on-surface-variant / on-secondary-container |
| contenu / menu | Base | on-surface |
| barre d’outils | Panel | on-surface |
| liste / élément ordinaire | Panel | on-surface |
| élément de liste en retrait | Panel ; surface avant le repli Ionic si le rôle panel est absent | on-surface ; espace transparent de 2px |
| barre de navigation | Panel | on-surface-variant ; indicateur sélectionné secondary-container / icône sélectionnée on-secondary-container |
| segment | surface héritée | primary sélectionné ; on-surface-variant non sélectionné |
| champ de recherche | surface-container-high ; surface-container-highest dans une barre d’outils/un élément sombre sans couleur | on-surface ; icône on-surface-variant ; comportement de placeholder Ionic |
| interrupteur, case à cocher, radio, progression, curseur | surface neutre ou secondary-container quand désactivé/inactif ; primary quand sélectionné | on-primary, outline ou on-surface-variant correspondant |
| saisie de texte | fond de l’état de remplissage Ionic | on-surface ; focus primary ; état invalide error |
| modale / popover | Base | texte Ionic ; composants imbriqués avec leurs propres rôles ; options du popover select partageant le fond de la superposition |
| feuille d’actions | Base | actions on-surface ; action recommandée primary ; destructrice error ; titre on-surface-variant |
| alerte | Base | on-surface ; recommandée primary/on-primary ; destructrice error/on-error ; annulation à contour |
| chargement / date-heure / sélecteur | surface-container-high | on-surface ; actions/spinner primary |
| snackbar/toast | inverse-surface | inverse-on-surface ; actions inverse-primary |

Le `color="..."` Ionic existant reste un choix explicite de palette ; ces valeurs MD3 ne le remplacent pas. `md3-disabled` exclut un composant du style MD3. Les variables CSS existantes par composant peuvent toujours remplacer le rôle choisi via la cascade normale. Les classes de variante n’affectent que l’apparence ; `md3-selected` n’implémente ni sélection ni état d’accessibilité.

```html
<ion-button class="md3-tonal" fill="solid">Tonal action</ion-button>
<ion-card class="md3-filled">Filled card</ion-card>
<ion-button color="danger">Explicit Ionic danger palette</ion-button>
```

La page Color palette de la démo compare le résultat Ionic seul avec des rôles supplémentaires fournis localement. Les tests navigateur vérifient les deux apparences, les changements Ionic locaux, le retrait des rôles facultatifs, les couleurs explicites, les exclusions et un document avec le JavaScript applicatif désactivé.

Android 17 Settings est la référence visuelle ; les recommandations Material apportent des informations complémentaires. Les rôles base/panel ci-dessus affinent les surfaces ordinaires sans remplacer l’intention des couleurs Ionic. Sans ces rôles, les fonds Ionic ne changent pas. Les groupes conservent des coins extérieurs de 20px et des espaces de 2px. Ces attributions nomment des rôles facultatifs ; elles n’impliquent pas de couleurs de surface générées pour les rôles omis.

Les boutons de retour de barre d’outils à icône seule conservent une cible tactile de 56px et un cercle de 40px. Celui-ci est transparent par défaut ; fournir `--md-sys-color-surface-container-highest` le colore. Une barre d’outils explicitement colorée conserve un fond de bouton transparent et le premier plan contrasté d’Ionic. Définissez `--md3-back-background` sur le bouton pour personnaliser son fond. Les interrupteurs sans icône utilisent une piste de 52×28px et un curseur de 20px, mesurés sur le panneau Internet du Pixel Android 17. L’installation CSS seule conserve le curseur normal d’Ionic et son API `enableOnOffLabels`. L’interrupteur standard et la démo utilisent un curseur sans icône. Le `md3-disabled` de composant et les couleurs Ionic explicites restent disponibles.

La typographie, les responsabilités des boutons de retour Ionic et les icônes d’état des interrupteurs sont décrites dans [Apparence Android Settings](android-settings.md). Elles ne modifient pas la palette et ne nécessitent pas les couleurs de l’appareil.

Les couleurs et dimensions du thème fonctionnent sans helpers JavaScript facultatifs ni plugin Capacitor. Pour un range sur une surface HTML arbitraire, définissez `--md3-range-gap-color` sur la couleur de cette surface ; les conteneurs Ionic standard fournissent automatiquement leur fond.

Pour les dimensions mesurées des dialogues sur tablette, les coins, le comportement du clavier et les captures natives historiques de référence, consultez la [revue tablette Android 17](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/android17-tablet-2026-11-07.md). Pour la correction ultérieure des couleurs Ionic par défaut et sa vérification navigateur, consultez la [revue d’héritage des couleurs Ionic](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/ionic-color-inheritance-2026-11-07.md).

## Dimensions des Alert sur tablette

Les Alert de tablettes larges suivent les proportions mesurées d’Android 17 Settings : 85 % en portrait et 65 % en paysage. Lors de la saisie sur tablette Android, cette largeur est conservée quand l’IME redimensionne le viewport. Les fenêtres de taille téléphone gardent la disposition Ionic adaptée au contenu.

Utilisez les propriétés publiques de dimensionnement pour personnaliser un dialogue. Pour une Alert créée par contrôleur, définissez `cssClass: 'app-alert'` et placez une règle qualifiée par le composant dans la feuille de style globale de l’application après le thème :

```css
ion-alert.app-alert {
  --width: 400px;
  --max-width: min(400px, calc(100vw - 32px));
}
```

Les bindings de style en ligne fonctionnent également. Les contraintes CSS minimales/maximales habituelles s’appliquent toujours, et `md3-disabled` restaure les dimensions par défaut d’Ionic.
