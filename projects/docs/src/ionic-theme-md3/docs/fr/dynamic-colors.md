---
title: "Couleurs dynamiques Android"
sourceRevision: "6ebe7b39be22337397e0e7b7a3e8058b446e8d1258bdbf1a1ee7fed47327ab34"
---
# Couleurs dynamiques Android

Les couleurs dynamiques sont prises en charge et facultatives. Android 12 et versions ultérieures fournissent des palettes Material claires et sombres ; ce paquet convertit leurs rôles avec les algorithmes du générateur de couleurs Ionic Docs. Les anciennes versions d’Android, iOS et le Web utilisent la palette Ionic existante et les couleurs par défaut des composants. Consultez le [système de couleurs](color-system.md) : les palettes Ionic suffisent à elles seules ; les rôles Material natifs ne font qu’affiner les tokens CSS facultatifs.

Importez les API `getDynamicColorScheme` et `addDynamicColorListener` depuis le point d’entrée racine de `@rdlabo/capacitor-native-ui`. Il n’est pas nécessaire d’activer la projection Native UI. Le helper de conversion du thème reste disponible dans `@rdlabo/ionic-theme-md3/dynamic-colors`.

## Exemple de couleurs sur un appareil

Pixel 8a sous Android 17, avec les couleurs Material You facultatives activées. Le thème par défaut fonctionne avec la palette propre à Ionic ; ces captures montrent l’intégration supplémentaire des couleurs natives en apparence claire et sombre.

<img src="../screenshots/android17-light.png" alt="Couleurs Material You facultatives en apparence claire" width="270"> <img src="../screenshots/android17-dark.png" alt="Couleurs Material You facultatives en apparence sombre" width="270">

## Configuration

Installez le thème et le fournisseur natif dans votre application Capacitor :

```sh
npm install @rdlabo/ionic-theme-md3 @rdlabo/capacitor-native-ui
npx cap sync android
npx cap run android
```

Les exports racine du plugin et le getter natif sont inclus dans la version 2.1.3 ; un ancien binaire natif (par exemple 2.1.1) doit être recompilé, et pas simplement recevoir du nouveau JavaScript. Utilisez le thème 9.2.0 ou ultérieur pour la correspondance décrite ci-dessous. Le [guide du plugin](/capacitor-native-ui/docs/dynamic-colors) documente la disponibilité, les types des rôles et les notifications natives.

Suivez l’[installation du thème](../README.md) pour l’ordre des feuilles de style Ionic et du thème. Incluez la palette sombre basée sur une classe dans votre feuille de style globale :

```scss
@import '@ionic/core/css/palettes/dark.class.css';
```

Pour Ionic Angular, `@ionic/angular/css/palettes/dark.class.css` est équivalent. Initialisez une seule fois au démarrage de l’application dans le navigateur, une fois le DOM créé. Ce helper écrit dans un document et ne doit pas s’exécuter lors du rendu serveur.

```ts
import { getDynamicColorScheme, addDynamicColorListener } from '@rdlabo/capacitor-native-ui';
import { enableDynamicColors } from '@rdlabo/ionic-theme-md3/dynamic-colors';

const theme = await enableDynamicColors({
  getScheme: getDynamicColorScheme,
  listen: addDynamicColorListener,
  mode: 'system',
  onError: console.error,
});

// Ces changements utilisent les palettes en cache sans appel natif.
theme.setMode('dark');
theme.setMode('light');
theme.setMode('system');

await theme.refresh(); // Actualisation explicite facultative du fond d’écran/de la palette.

// Lors du démontage de l’application, pas immédiatement après l’initialisation :
await theme.destroy(); // Désabonner et restaurer les propriétés/classe racines d’origine.
```

## Apparence et cycle de vie

N’importez pas également `dark.system.css` ou `dark.always.css` : ce contrôleur gère la classe `ion-palette-dark` sur `document.documentElement` et la propriété racine `color-scheme`. Placez les substitutions globales de palette sur cette racine ; les variables de body ou des composants individuels peuvent masquer les valeurs héritées de la racine.

- `system` (par défaut) : suit l’apparence de l’appareil.
- `light` : reste clair même si l’appareil passe en mode sombre.
- `dark` : reste sombre même si l’appareil passe en mode clair.

Les événements natifs de reprise/configuration, la reprise/visibilité du document et les changements d’apparence du navigateur déclenchent une actualisation. Les requêtes simultanées partagent une lecture du pont. Les deux palettes sont récupérées ensemble ; les palettes inchangées évitent la conversion et les propriétés inchangées évitent les écritures CSS. Les erreurs d’actualisation préservent la dernière palette fonctionnelle. Les échecs d’actualisation automatique sont transmis à `onError` ; un appel explicite à `theme.refresh()` est rejeté pour que l’appelant traite l’erreur. Les erreurs d’initialisation entraînent un rejet et un nettoyage. Un seul contrôleur peut exister par document. Appelez `destroy()` lors du démontage de l’application.

| Méthode du contrôleur | Comportement |
| --- | --- |
| `setMode(mode)` | Sélectionne `system`, `light` ou `dark` de manière synchrone avec les palettes en cache ; aucune lecture native. |
| `refresh()` | Relit les données et applique l’apparence sélectionnée ; rejette en cas d’échec. |
| `destroy()` | Supprime les écouteurs et restaure les propriétés en ligne et la classe sombre d’origine ; peut être rappelée sans risque. |

Lorsque `available` est false, le contrôleur préserve/restaure la palette de l’application tout en continuant à gérer l’apparence sélectionnée. Un échec d’initialisation rejette la promesse `enableDynamicColors()` et nettoie les écouteurs ; `onError` traite les erreurs d’actualisation automatique, pas celles de l’initialisation ni des appels explicites à `refresh()`. Ne laissez pas un second contrôleur d’apparence écrire les mêmes classe/propriétés racines. L’option facultative `document` cible un document précis du navigateur.

## Correspondance

| Rôle Material | Token Ionic |
| --- | --- |
| primary / secondary / tertiary | couleur nommée correspondante |
| error | danger |
| surfaceContainerLowest en clair / surfaceContainerLow en sombre (repli sur surface) | couleur de fond |
| surfaceContainerLow en clair / surfaceContainerHighest en sombre (repli sur surface) | light |
| outline (repli sur le point médian surface/onSurface) | medium |
| onSurface | dark |
| onSurface | couleur du texte |

Le pont natif fournit les rôles de couleur Material pris en charge pour les deux modes ; les six champs d’origine restent les entrées de compatibilité et les rôles supplémentaires sont facultatifs dans le contrat TypeScript. Les couleurs nommées génèrent la base, le RGB, le contraste, le RGB de contraste, la nuance sombre (shade) et la teinte claire (tint). Primary, secondary, tertiary et danger utilisent les rôles fournis `onPrimary`, `onSecondary`, `onTertiary` et `onError` pour le contraste et son RGB. Chaque rôle absent se replie sur la comparaison Ionic du rapport de contraste noir/blanc. La génération shade/tint et les palettes light/medium/dark conservent le calcul Ionic. Les composants MD3 utilisent également le rôle `on*` fourni lorsqu’il existe. Le fond et le texte génèrent des tokens distincts de step-50 à step-950 ; les anciens alias `--ion-color-step-*` sont également fournis. Success et warning conservent leurs valeurs Ionic existantes. Light, medium et dark suivent la palette neutre de l’appareil ; leurs valeurs RGB, contraste, shade et tint sont générées ensemble. La base claire utilise surfaceContainerLowest (blanc), tandis que la base sombre utilise surfaceContainerLow. Les anciennes palettes à six rôles se replient sur surface pour background/light et sur le point médian surface/onSurface pour medium.

Les surfaces claires par défaut restent blanches : Content, Menu, Toolbar, TabBar, Card, listes/éléments et Modal/Popover/Alert/ActionSheet. En mode sombre, les pages et les enveloppes des superpositions utilisent surfaceContainerLow, tandis que Toolbar, TabBar, Card et les listes/éléments utilisent surfaceContainerHigh. La palette nommée light utilise surfaceContainerHighest en mode sombre, préservant l’ordre des surfaces de page, de panneau et de couleur light au lieu de les uniformiser en noir. Ces rôles sont résolus dans chaque composant afin que les substitutions locales continuent de fonctionner. Sans rôles facultatifs, les variables de fond Ionic existantes restent le repli.

Les variantes Material explicites (cartes filled/outlined et boutons tonal/elevated), les champs de recherche, les indicateurs de chargement et les surfaces Toast inversées conservent leurs rôles dédiés. Les attributs color explicites et md3-disabled restent prioritaires sur la peinture par défaut des composants.

Les rôles natifs fournis deviennent aussi des tokens facultatifs `--md-sys-color-*` utilisés par les composants MD3. Les rôles facultatifs absents reviennent aux substitutions locales/utilisateur ou au repli CSS dérivé d’Ionic, y compris lors des changements de mode et des actualisations. Un `color="light"` explicite, par exemple, conserve le rôle Ionic light tout en suivant sa palette neutre générée depuis l’appareil.

Pour convertir sans modifier le DOM, utilisez `materialToIonicColors(scheme)` pour les variables Ionic et `materialToMd3Colors(partialRoles)` pour les tokens MD3 facultatifs. Les deux fonctions de conversion renvoient des tables de variables CSS de type `Record<string, string>`. `materialToIonicColors` exige les six rôles obligatoires de `MaterialColorScheme` ; `materialToMd3Colors` accepte tout sous-ensemble de noms `MaterialColorRole` et n’émet que les rôles fournis. Les entrées sont des chaînes opaques `#RRGGBB` ; une couleur fournie invalide lève `TypeError`. Aucune des fonctions n’écrit dans le DOM ni n’appelle le pont. Aucune dépendance à une bibliothèque de couleurs n’est utilisée à l’exécution. L’attribution des algorithmes et la licence amont figurent dans `THIRD_PARTY_NOTICES.md`.

## Dépannage et vérification

- **Aucune couleur dynamique :** Android 12 ou ultérieur est requis. Sur les autres plateformes, la palette Ionic reste active ; ce repli est attendu.
- **Getter natif non implémenté :** mettez à jour le plugin, synchronisez, recompilez et réinstallez l’application native. Mettre à jour les seuls fichiers Web ne suffit pas.
- **Conflits de mode sombre :** utilisez uniquement la palette sombre basée sur une classe et confiez la classe racine à un seul contrôleur. Recherchez les substitutions de body/composants qui masquent les variables racines.
- **Une actualisation échoue :** les échecs automatiques sont transmis à `onError` et conservent la dernière palette fonctionnelle. Interceptez les échecs des appels explicites à `refresh()` dans l’appelant.
- **Un composant ignore un rôle :** vérifiez son `color` explicite, `md3-disabled`, ses variables CSS et le [tableau des consommateurs](color-system.md#component-assignments).

La démo comprend des contrôles System / Light / Dark. Son adaptateur de pont typé prend aussi en charge les builds pour navigateur seul ; Android exige toujours un plugin natif contenant `getDynamicColorScheme`. Cet adaptateur relève de l’infrastructure de la démo, pas du modèle d’import public pour les applications.

Exécutez `npm run test:dynamic-colors` après avoir installé les dépendances racines et celles de la démo. Les tests d’images dans le navigateur utilisent des couleurs Android enregistrées et ne nécessitent donc pas d’appareil connecté. Les mises à jour des images de référence passent par la CI `/update-screenshots` de la PR.

La [modification des paires de premier plan](https://github.com/webview-native-ui/ionic-theme-md3/pull/67) a été vérifiée sur un Pixel 8a sous Android 17 : quatre boutons Ionic explicitement colorés correspondaient aux valeurs natives de fond/premier plan dans les deux modes. Les CI finales Ionic 8 et 9 ont chacune réussi 34 tests unitaires et 265 tests E2E sans résultat instable. Il s’agit d’une vérification des paires de couleurs, pas d’une validation complète de l’interface sur appareil ni du changement de fond d’écran.

## Notes de validation

Mesure historique de l’intégration (pas une validation complète du thème ; voir les [preuves de revue Android 16](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/android16-2026-11-07.md)). Vérifié sur un émulateur Android 15 (API 35) : les deux palettes natives correspondent aux tokens Ionic appliqués ; l’apparence system suit Android ; les modes explicites light/dark restent fixes lorsque le système change. Les E2E du navigateur couvrent la même politique d’apparence. Les tests unitaires couvrent les palettes modifiées, les notifications de reprise/configuration, l’invalidation en cours de traitement, la suppression des mises à jour inchangées, les erreurs et le démontage.

Lors de cette mesure historique de l’intégration, l’API étendue à 46 rôles a été vérifiée sur l’émulateur Android : chaque rôle natif correspondait à sa valeur `--md-sys-color-*`. Les tests navigateur Ionic 8 et 9 couvrent les replis Ionic seuls, les substitutions facultatives, les palettes de couleurs explicites et les désactivations par composant ; un test distinct désactive le JavaScript de l’application. La [CI de mise à jour des captures du 2026-11-07](https://github.com/webview-native-ui/ionic-theme-md3/actions/runs/42332891975) a vérifié 141 tests pour chacune des versions Ionic 8 et 9, dont 84 captures claires/sombres. Consultez la [revue de l’héritage des couleurs Ionic](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/ionic-color-inheritance-2026-11-07.md) pour cette correction historique de la politique de couleurs et son périmètre de vérification limité au navigateur.

Une mesure locale de l’API étendue dans une WebView (30 lectures natives séquentielles, 1 000 conversions après échauffement) a donné environ 9 ms de médiane / 21 ms de p90 pour l’acquisition et environ 0,6 ms pour convertir les deux palettes en variables Ionic et MD3. Ce sont des observations sur émulateur de débogage, pas des garanties de performance sur tous les appareils ; la conversion exclut le rendu CSS. Un thème Ionic seul ordinaire utilise directement le CSS, sans exécuter la conversion ni appeler le pont.

Le remplacement du fond d’écran sur appareil physique reste non vérifié. Un changement de préréglage commandé par le shell sur cet émulateur a redémarré la WebView sans modifier les valeurs de couleurs natives ; il n’a donc pas permis d’établir le comportement de bout en bout du changement de fond d’écran. Les paramètres de test ont été supprimés et le rétablissement de la palette d’origine a été confirmé.
