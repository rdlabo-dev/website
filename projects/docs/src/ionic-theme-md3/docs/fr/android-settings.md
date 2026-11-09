---
title: "Apparence Android Settings"
sourceRevision: "b01855a5b6b64a8aaeea578be975259eb9d608321bb81f66c7f583b8ef33a3a0"
---

# Apparence Android Settings

Le thème prend Android Settings comme référence visuelle tout en conservant les API des composants Ionic, les couleurs nommées et les styles de l’application. Il ne remplace pas les composants Ionic par des widgets Android. La référence mesurée est Pixel Settings sur Android 17 ; d’autres fabricants Android peuvent adopter des designs différents.

## Valeurs du thème et personnalisations applicatives

| Fonctionnalité | Valeur du thème | Personnalisation applicative |
| --- | --- | --- |
| Barre d’outils, listes groupées et contrôles | Dimensions alignées sur Android | Variables CSS Ionic et CSS applicatif |
| Curseur d’interrupteur | Sans icône d’état | `enableOnOffLabels` d’Ionic ou le helper d’icônes ci-dessous |
| Police | Google Sans Flex local, puis Roboto / Helvetica Neue / sans-serif | `--ion-font-family` d’Ionic |
| Flèche de retour | Icône configurée dans Ionic | Configuration d’icône d’Ionic ; aucune icône fournie par le thème |
| Palette | Intention des couleurs Ionic existante | Les couleurs de l’appareil sont une fonctionnalité distincte de [couleurs dynamiques](dynamic-colors.md) |

## Police par défaut, uniquement en CSS

Importez le thème principal **après les styles de base d’Ionic**, comme indiqué dans le [README](../README.md#installation). Sa typographie MD est incluse automatiquement ; aucune feuille de style, initialisation JavaScript, classe ni procédure de nettoyage supplémentaire n’est nécessaire.

Le thème définit `--ion-default-font` sur `html.md`. Le `--ion-font-family` d’Ionic continue de résoudre cette valeur par défaut, sauf si l’application fournit sa propre valeur :

```css
:root {
  --ion-font-family: 'My App Font', sans-serif;
}
```

Le thème n’écrase pas `--ion-font-family`. Pour une police propre à un composant, utilisez son style `font-family` habituel ; une propriété personnalisée locale n’affecte que les composants qui la consomment. La police racine par défaut d’iOS ne change pas. Un composant `md3-disabled` hérite de la police applicative comme les autres composants Ionic ; cette classe ne réinitialise pas la typographie de toute l’application.

L’alias de police locale résout `GoogleSansFlex-Regular` uniquement si l’appareil ou le navigateur le rend disponible. Aucun fichier de police n’est fourni ni téléchargé. Sinon, le navigateur utilise Roboto, Helvetica Neue ou sa police sans-serif générique. Les écritures non couvertes suivent le repli habituel du navigateur ou de la plateforme ; aucune police japonaise n’est imposée. Le même CSS fonctionne dans les WebViews natives et la démo navigateur.

Le thème ne surveille pas le DPR, n’arrondit pas le texte aux pixels physiques, ne remplace pas les métriques de police et n’impose pas d’axes de police variable. La disposition du texte suit donc la police, le navigateur et les paramètres utilisateur choisis. Le texte d’un TextView Android natif peut différer de celui d’une WebView ; reproduire les limites des glyphes d’un Pixel donné ne garantit pas la portabilité.

## Les boutons de retour restent des composants Ionic

Le thème ne fournit ni ne remplace l’icône de retour. Ionic gère l’icône par défaut, la configuration `backButtonIcon`, la propriété `icon` de chaque bouton, la navigation et l’accessibilité. Les applications peuvent utiliser directement ces API Ionic existantes.

Le thème définit l’espacement du bouton, sa cible tactile de 56px et sa zone circulaire peinte de 40px. Le cercle est transparent tant que son rôle de couleur facultatif n’est pas fourni ; voir le [système de couleurs](color-system.md). Les glyphes de Settings natif et d’Ionic peuvent différer ; reproduire la flèche native n’est pas une exigence du thème.

## Apparence du focus des Alert

Le thème MD supprime le contour du navigateur autour de la surface du dialogue lui-même. Ionic déplace toujours le focus dans l’Alert à l’ouverture et gère la navigation Tab, le confinement du focus et la fermeture. Les boutons d’action conservent leurs indicateurs de focus clavier. Les Alert `md3-disabled` et en mode iOS conservent l’apparence Ionic par défaut.

## Libellés des interrupteurs et icônes d’état facultatives

La piste par défaut mesure 52×28px, avec un curseur de 20px sans icônes croix/coche. Pour les libellés marche/arrêt d’Ionic, utilisez sa propriété publique :

```html
<ion-toggle enable-on-off-labels="true">Notifications</ion-toggle>
```

Les bindings de framework utilisent la propriété correspondante `enableOnOffLabels`. Les dimensions applicatives se personnalisent toujours avec les variables CSS Ionic :

```css
ion-toggle.app-toggle {
  --handle-width: 18px;
  --handle-height: 18px;
}
```

Les icônes croix/coche sont une variante distincte pour les applications qui en ont explicitement besoin :

```ts
import { applyToggleStateIcons } from '@rdlabo/ionic-theme-md3/toggle-state-icons';

const toggle = document.querySelector<HTMLElement>('ion-toggle')!;
const removeIcons = await applyToggleStateIcons(toggle);
// Lors du nettoyage :
removeIcons();
```

Appelez le helper après avoir créé et connecté l’interrupteur. Il attend l’enregistrement de l’élément personnalisé et `componentOnReady()` si disponible. Dans les builds sans cette méthode, attendez d’abord le rendu du Shadow DOM. Si la vue est détruite pendant l’attente, appelez immédiatement la fonction de nettoyage renvoyée.

Le helper ajoute un élément style au Shadow DOM de la Part publique handle. Il n’intercepte pas les propriétés du composant et n’observe pas le document. Les libellés Ionic sont prioritaires lorsque `enableOnOffLabels` est activé, y compris après des changements de propriété. `md3-disabled` et le mode iOS désactivent cette amélioration d’icônes. La démo n’attache pas ce helper automatiquement.

## Mise à niveau et vérification

Consultez les [notes de migration](migration.md#migrating-to-9.2.0%3A-android-settings-alignment) pour les changements de dimensions et le [balisage des listes groupées](using-ion-item-group.md) pour le dimensionnement. Les `color` explicites d’Ionic, l’état désactivé, les interactions et personnalisations locales conservent leur sens. Le [rapport de mesure](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/android17-pixel-pass1-2026-11-09.md) distingue les observations sur appareil physique des vérifications de régression navigateur ; il ne revendique ni égalité complète des rendus ni validation native sur tablette.
