---
title: "Native UI sans Ionic"
sourceRevision: "7d3c0376671c9bae4784347e501acc366c338fa9a737caf4a3bc66507735dd01"
---
# Native UI sans Ionic

Ajoutez des boutons natifs à une application Web existante sans Ionic ni CSS du thème. Conservez libellés, état et gestionnaires de clic sur des éléments HTML ordinaires. Les boutons standard n’exigent aucun enregistrement Swift personnalisé.

Utilisez une application Capacitor 8 avec un projet iOS, Xcode 26+ et un appareil ou simulateur iOS 26+. Les navigateurs et Android conservent les contrôles Web. Pour du contenu Android natif personnalisé, utilisez les [extensions Kotlin/Compose](native-ui-extensions.md#2b-register-compose-content-on-android).

Commencez par le [fonctionnement de la projection](../README.md#how-projection-works) : l’élément HTML reste la source tandis que les contrôles natifs ou mandataires Web assurent sa présentation.

**Vous voulez seulement Vertical Bars ?** Suivez la [configuration du placement sur l’appareil](#device-placement-for-vertical-bars), avec les étapes 1 à 4 ci-dessous. Réutilisez le runtime de l’étape 3 sans préférence de placement fixe. Retirez les marqueurs explicites des boutons à conserver sur le Web. Vous n’avez besoin ni d’Ionic, ni de `@rdlabo/ionic-theme-ios27`, ni de `vertical-bars.css`.

Pour Vertical Bars dans une application utilisant `ion-tabs`, `ion-toolbar` ou d’autres composants Ionic avec un thème personnalisé, utilisez la [configuration Ionic de Vertical Bars](ionic-vertical-bars.md#try-it-in-your-existing-ionic-app). Le framework (Angular, React ou Vue) ne détermine pas à lui seul l’adaptateur à utiliser.

## 1. Installer le plugin

[Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) est notre intégration standard pour l’état de l’appareil. Ses API de placement et de posture permettent à l’application de contrôler l’adaptation de la disposition ; l’installation est suivie du raccordement des valeurs initiales et des événements de changement.

Conservez votre installation Capacitor existante et ajoutez Native UI et Foldable ensemble :

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Le point d’entrée `/core` nécessite `@capacitor/core`, sans dépendance Ionic. Pour une application actuellement limitée au navigateur, configurez son projet Capacitor 8 iOS avant d’exécuter des contrôles natifs.

## 2. Marquer les contrôles sources

```html
<main id="app">
  <button type="button" data-native-ui="button" data-native-ui-placement="element">Add</button>
  <button type="button" data-native-ui="back-button" data-native-ui-placement="rail">Back</button>
</main>
<aside id="rail" aria-label="Navigation"></aside>
```

| Attribut | Valeur | Effet |
| -------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `data-native-ui` | `button` | Projeter un bouton d’action standard. |
| `data-native-ui` | `back-button` | Projeter un bouton de retour standard. Le gestionnaire de clic source gère la navigation ; le plugin n’appelle jamais `history.back()`. |
| `data-native-ui` | `disabled` | Exclure l’élément et son sous-arbre de la projection. |
| `data-native-ui-placement` | `element` (par défaut) | Utiliser le rectangle de l’élément source. |
| `data-native-ui-placement` | `rail` | Demander Vertical Bars ; utiliser l’hôte Web facultatif lorsque le rail natif est indisponible. |

Appliquez `button` et `back-button` à `<button>`, à `ion-button` explicitement marqué ou aux éléments exposant `role="button"` et un comportement de clic. Le HTML non marqué n’est jamais déduit comme contrôle. `data-native-ui-placement` choisit le placement d’une source déclarée ; il n’active pas la projection d’un élément HTML non marqué.

Conservez les données et le comportement du contrôle sur sa source :

| Propriété source | Comportement de projection |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Nom accessible | Résolu depuis `aria-labelledby`, puis `aria-label`, puis le texte. |
| Illustration | Utilise le SVG statique pris en charge. |
| État désactivé | Respecte `disabled`, un fieldset désactivé et `aria-disabled="true"`. |
| Visibilité et périmètre | Les sources masquées, retirées, exclues ou hors périmètre sont retirées de la projection ; les actions périmées sont rejetées. |
| Gestionnaires de l’application | Restent sur l’élément original. |

Les actions natives et mandataires Web cliquent sur l’élément original. Un `<button type="submit">` ordinaire conserve donc son comportement de formulaire. Utilisez `type="button"` pour les actions qui ne doivent pas soumettre. Le pont natif ne préserve pas les privilèges d’activation utilisateur du navigateur pour les API comme l’ouverture de fenêtres.

## 3. Démarrer après le montage des contrôles

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui/core';

const shell = await enableNativeUI({
  root: document.querySelector<HTMLElement>('#app')!,
});
```

Appelez une seule fois après création de la racine source. Conservez le handle et appelez `await shell.destroy()` à la destruction de cette racine. Le plugin n’ajoute ni espacement de page ni règles de zone de sécurité ; conservez votre CSS. Pour Angular, React ou Vue, utilisez les [exemples de cycle de vie de la racine](setup.md#place-startup-in-your-frameworks-app-root) avec l’import `/core`. Pour la navigation animée, utilisez la [suspension jusqu’à la fin ou l’annulation](setup.md#navigation-without-the-theme).

### Harmoniser le thème HTML

Pour un thème HTML personnalisé, déclarez `color-scheme: light` ou `color-scheme: dark` dans le CSS qui sélectionne la palette Web. Les seules couleurs de fond ne sélectionnent pas l’apparence native. Consultez [Apparence claire et sombre](appearance.md) pour un exemple de bascule manuelle, les priorités en présence des variables Ionic/thème et le comportement du rail partagé.

## 4. Compiler et exécuter sur iOS

Compilez l’application Web, exécutez `npx cap sync ios` et lancez le projet iOS depuis Xcode. Avec la configuration de l’étape 3, Add apparaît à sa position source et invoque son gestionnaire de clic original. Back demande le rail natif signalé par l’appareil lorsqu’il est disponible ; raccordez le placement ci-dessous pour synchroniser l’espacement Web. Dans le navigateur, ce même bouton reste Web. Le HTML non marqué reste inchangé.

Si un bouton reste Web sur un iOS compatible, vérifiez sa visibilité dans la racine configurée, son nom accessible, la synchronisation de la dépendance directe du plugin et la recompilation iOS.

Dans une application utilisant aussi Ionic, définissez `ionic: { auto: false }` pour projeter uniquement les sources explicites et extensions enregistrées. Consultez la [projection Ionic sélective](configuration.md#select-controls-explicitly-in-a-customized-ionic-app).

## Placement sur l’appareil pour Vertical Bars

Foldable est déjà inclus dans l’installation standard de l’étape 1. Raccordez-le à votre disposition comme suit.

Réutilisez le runtime de l’étape 3 **sans `verticalBars.placement`**. Native UI suit alors le bord signalé par l’appareil ; un `edge: 'trailing'` fixe le contraindrait et pourrait rejeter un rail situé au début.

Suivez l’[intégration Foldable](vertical-bars.md#with-application-owned-css-or-without-ionic) :

1. Abonnez-vous à `barPlacementChange`, puis lisez `getBarPlacement()` pour le bord et le retrait initiaux.
2. Appliquez le bord et le retrait au CSS de votre application. Si le bord est null, restaurez l’espacement ordinaire et appelez `shell.disableVerticalControlArea()` ; lorsqu’un bord revient, appelez `shell.enableVerticalControlArea()`. Sérialisez ces changements avec les mises à jour de disposition.
3. Au nettoyage, retirez l’écouteur et détruisez le runtime détenu par cette application.

Conservez les marqueurs sources explicites de l’étape 2 ; ils déclarent les contrôles et leur placement demandé. Pour projeter seulement Back, retirez `data-native-ui="button"` d’Add. `controls` ne désactive pas les déclarations explicites. Sans hôte de rail Web, les contrôles de rail natif indisponibles restent à leur position Web d’origine. Le package du thème n’est pas requis.

## Aperçu facultatif du rail dans le navigateur

Pour prévisualiser la disposition uniquement dans le navigateur, utilisez temporairement ce rail Web fixe à la place de l’appel de l’étape 3 et de l’abonnement à l’appareil. Ne recopiez pas ce placement fixe dans la configuration standard de l’appareil. Appelez une seule fois après montage de la racine source et de l’hôte, puis `await shell.destroy()` à la destruction de leur propriétaire :

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui/core';

const shell = await enableNativeUI({
  root: document.querySelector<HTMLElement>('#app')!,
  verticalBars: {
    placement: {
      edge: 'trailing',
      webHost: document.querySelector<HTMLElement>('#rail')!,
    },
  },
});
```

Le plugin utilise la disponibilité du rail signalée par l’appareil et résout leading/trailing selon la direction du document. Une préférence de placement ne force jamais un rail système incompatible. Un rejet natif restaure le Web. Avec `webHost`, les contrôles HTML explicitement marqués pour le rail disposent de mandataires Web si la projection native est indisponible. Sinon, les originaux restent visibles. L’application stylise et positionne l’hôte, et réserve l’espace du contenu. L’hôte doit être extérieur à la racine source.

Le balisage explicite choisit le placement : Back rejoint le rail d’aperçu et Add reste à sa position originale. Désactiver la projection du rail restaure les contrôles originaux et retire les mandataires Web sans détruire la projection native ordinaire. Avant de compiler pour un appareil, restaurez le runtime de l’étape 3 et l’abonnement Foldable ci-dessus.

L’adaptateur HTML prend actuellement en charge les boutons et boutons de retour. Les structures HTML arbitraires d’onglets, segments, barres de recherche et FAB ne sont pas traduites. Les adaptateurs Ionic continuent à prendre en charge leurs contrôles existants. Les extensions d’élément personnalisées utilisent la même racine délimitée ; le placement d’extension `tab-accessory` nécessite toujours une barre d’onglets Ionic propriétaire.

## Exemple

L’[exemple HTML simple](https://github.com/rdlabo-dev/ionic-theme-ios27/tree/ios27-v2.0.0/examples/native-ui-html) présente Add, une navigation Home/Details/Back sans routeur, la projection facultative dans un rail Web et le nettoyage. Il n’utilise ni Ionic ni CSS du thème.
