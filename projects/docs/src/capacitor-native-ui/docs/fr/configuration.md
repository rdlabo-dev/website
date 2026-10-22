---
title: "Configurer Native UI"
sourceRevision: "db88d5020c11e414684703be1833e5c8ecdd0c8c631ffa15263925943070e80f"
---
# Configurer Native UI

Cette page décrit les réglages. Commencez par le [fonctionnement de la projection](../README.md#how-projection-works), puis la [configuration Ionic](setup.md) ou [HTML](framework-independent.md) pour l’installation.

Appelez `enableNativeUI()` une seule fois après le montage du DOM de l’application. Les contrôles Ionic et HTML explicitement marqués partagent les moteurs Swift standard. Le thème est facultatif ; la disposition Web, les zones de sécurité et l’espacement relèvent de l’application ou du thème.

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const shell = await enableNativeUI();
```

Sans Ionic, importez la même API depuis `@rdlabo/capacitor-native-ui/core`. Ce point d’entrée ne charge pas l’intégration facultative des popovers Ionic. Consultez le [HTML simple](framework-independent.md).

## Comportement par plateforme

| Fonctionnalité | iOS compatible | Android | Navigateur / ancien iOS |
| --------------------------------------- | ----------------------------------------- | --------------------- | --------------------- |
| Contrôles Ionic automatiques (`ionic.auto`) | Natifs | Contrôles Web d’origine | Contrôles Web d’origine |
| Boutons d’élément explicites | Natifs | Contrôles Web d’origine | Contrôles Web d’origine |
| Extensions d’élément | SwiftUI | Kotlin / Compose | Contenu Web d’origine |
| Vertical Bars | Natif si disponible ; sinon rail Web | Rail Web | Rail Web |
| Extensions `tab-accessory` | Uniquement avec un hôte d’onglets iOS compatible | Contenu Web d’origine | Contenu Web d’origine |

Les rails Web nécessitent la disposition de rail Ionic ou un `webHost` HTML géré par l’application. Aucun réglage ne crée une capacité matérielle.

Pour le mode clair/sombre issu du HTML, consultez [Apparence claire et sombre](appearance.md). L’apparence se configure en CSS Web, pas par une option de démarrage.

## Tous les réglages

`controls` choisit les valeurs par défaut de sélection et de groupement. `verticalBars` configure le rail. `ionic` configure la découverte et l’apparence Ionic. Les champs omis de `controls` valent `true`, y compris dans les objets partiels.

```ts
const shell = await enableNativeUI({
  root: document.body,
  controls: {
    buttonGroup: true,
    button: true,
    backButton: true,
    tabs: true,
    segment: true,
    fab: true,
  },
  verticalBars: {
    enabled: true,
    // Facultatif : placement: { edge: 'trailing', webHost: appOwnedHost },
  },
  extensions: [],
  ionic: {
    auto: true,
    verticalBars: {
      buttonProjection: 'system',
      buttonDefaultFill: 'glass',
      popover: false,
    },
  },
  debug: false,
});
```

### Valeurs de sélection par défaut

Chaque contrôle accepte `ControlProjection`. `controls` accepte lui-même ces valeurs comme raccourci pour les six champs.

| Valeur | Placement ordinaire | Placement dans le rail vertical |
| ------------------ | ------------------ | ----------------------- |
| `true` (par défaut) | Sélectionné | Sélectionné |
| `false` | Non sélectionné | Non sélectionné |
| `'horizontalOnly'` | Sélectionné | Non sélectionné |
| `'verticalOnly'` | Non sélectionné | Sélectionné |

Horizontal et vertical décrivent le **placement du contrôle**, pas l’orientation de l’écran ni le modèle d’appareil. Ces valeurs ne déplacent aucun contrôle, ne fournissent aucune capacité manquante et ne rendent pas admissible un balisage non pris en charge.

| Contrôle | Responsabilité |
| ------------- | -------------------------------------------------------------------------------- |
| `buttonGroup` | Regrouper les actions déjà sélectionnées lorsque le groupe est admissible. Ne sélectionne jamais les enfants. |
| `button` | Sélectionner les boutons ordinaires et les boutons de menu Ionic. |
| `backButton` | Sélectionner la navigation arrière, indépendamment du groupe parent. |
| `tabs` | Sélectionner les onglets et leur présentation de recherche enregistrée. |
| `segment` | Sélectionner les segments pris en charge. |
| `fab` | Sélectionner les boutons d’action flottants pris en charge. |

Les attributs locaux `data-horizontal-bars="true|false"` et `data-vertical-bars="true|false"` remplacent la sélection par défaut correspondante. Sur `ion-buttons`, ils contrôlent uniquement le groupement. Les sources explicites `data-native-ui` sont indépendantes de ces valeurs. Les exclusions structurelles et la disponibilité du rail restent applicables. Consultez la [sélection et le groupement dans la barre d’outils](native-ui.md#toolbar-selection-and-grouping).

### Autres réglages

| Réglage | Défaut | Signification |
| -------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root` | `document.body` | Sous-arbre source connecté. Les contrôles extérieurs ne sont pas projetés. |
| `verticalBars.enabled` | `true` | Autoriser la projection dans le rail disponible. |
| `verticalBars.placement` | omis | `{ edge: 'leading' \| 'trailing', webHost?: HTMLElement }` facultatif. Le bord est une préférence, pas une déclaration de capacité. |
| `extensions` | `[]` | **Expérimental.** Extensions SwiftUI / Compose propres à l’application. Indépendantes de `controls` et `ionic.auto` ; l’application décide quand son lecteur retourne du contenu. |
| `ionic.auto` | `true` | Activer la découverte Ionic automatique. `false` la désactive, y compris les activations locales de disposition. Les sources explicites `data-native-ui` et les extensions restent indépendantes. |
| `ionic.verticalBars.buttonProjection` | `'system'` | `'system'` utilise le style natif ; `'source'` projette les styles Ionic pris en charge. Les remplacements d’apparence locaux sont prioritaires. |
| `ionic.verticalBars.buttonDefaultFill` | `'glass'` | `'glass'` ou `'solid'` pour les boutons Ionic autonomes en style source sans remplissage explicite. Les remplissages explicites et le défaut transparent dans les groupes sont prioritaires. |
| `ionic.verticalBars.popover` | `false` | Activer les popovers Ionic ancrés aux boutons natifs du rail. Nécessite le point d’entrée Ionic et ses dépendances pair facultatives. |
| `debug` | `false` | Journaliser les sources et raisons de repli dans la console de développement. |

### Hôte du rail de repli HTML

`webHost` est un rail HTML de repli facultatif dont l’application définit le style. Ses exigences sont :

- Être connecté au même document que `root`.
- Être extérieur à `root` ; aucun des deux éléments ne doit contenir l’autre.
- Être stylé et positionné par l’application, y compris l’espace réservé au contenu.

Utilisez un `root` limité, comme votre `<main>`, avec un hôte frère ; le `document.body` par défaut ne peut pas avoir un tel hôte. Sans hôte, les rails HTML indisponibles laissent les contrôles d’origine visibles. La disposition de rail Ionic utilise son propre adaptateur de repli.

Le HTML prend actuellement en charge les boutons et boutons de retour. Les lecteurs d’onglets, segments et FAB restent des adaptateurs Ionic ; activer leurs réglages ne déduit pas de structures équivalentes d’un HTML arbitraire.

## Configurations courantes

```ts
// Ionic ou HTML : tous les contrôles compatibles, rail actif par défaut.
const shell = await enableNativeUI();

// Variante : sélection automatique limitée au rail.
const railOnly = await enableNativeUI({ controls: 'verticalOnly' });

// Variante : sélectionner automatiquement les onglets uniquement.
const tabsOnly = await enableNativeUI({
  controls: { buttonGroup: false, button: false, backButton: false, tabs: true, segment: false, fab: false },
});
```

Ces configurations sont des alternatives : démarrez un seul shell. Répéter un démarrage avec des réglages équivalents retourne son handle ; des réglages différents nécessitent de détruire le shell précédent.

`controls: false` désactive toute sélection et tout groupement par défaut, mais les attributs locaux peuvent encore les activer. `ionic: { auto: false }` désactive au contraire toute découverte Ionic automatique. Aucun des deux ne désactive les sources HTML explicites ni les extensions.

`verticalBars.enabled: false` laisse les contrôles du rail sur le Web, quelle que soit la sélection. Les contrôles ordinaires ne sont pas affectés. `data-native-ui-placement="element"` conserve la position originale d’un contrôle explicite, même avec `controls: 'verticalOnly'`. Pour les groupes Ionic, placez l’attribut sur tout le groupe `ion-buttons` afin que sa surface native partagée ait un seul placement.

## Sélectionner explicitement des contrôles dans une application Ionic personnalisée

Désactivez la projection Ionic automatique en conservant le rail natif et vos extensions personnalisées :

```ts
const shell = await enableNativeUI({
  root: document.querySelector<HTMLElement>('#content')!,
  ionic: { auto: false },
  verticalBars: {
    enabled: true,
    placement: {
      edge: 'trailing',
      webHost: document.querySelector<HTMLElement>('#rail')!,
    },
  },
  extensions: [myExtension],
});
```

```html
<main id="content">
  <ion-button>Keep this on the Web</ion-button>
  <ion-button data-native-ui="button" data-native-ui-placement="rail">Project this action</ion-button>
  <button data-native-ui="button">Project at its original position</button>
</main>
<aside id="rail" aria-label="Actions"></aside>
```

Conservez les gestionnaires d’origine sur chaque source. Un `ion-button` explicite utilise le lecteur standard de boutons : les règles de contenu et de style s’appliquent toujours ; l’attribut ne rend pas un balisage arbitraire compatible. `data-native-ui-placement="rail"` demande le rail système disponible. Stylisez le `webHost` facultatif et réservez l’espace dans votre application ; sans lui, les rails explicites indisponibles laissent leurs sources visibles. Les contrôles Ionic non marqués restent Web. Un groupe automatique contenant une source explicite reste Web pour éviter de la couvrir deux fois.

Les sources intégrées explicites prennent en charge les éléments individuels `button`, `ion-button` et `[role="button"]` avec `data-native-ui="button"` ou `"back-button"`. Cela n’active pas les lecteurs propres à Ionic pour les `ion-back-button`, `ion-menu-button`, groupes, onglets, segments ou FAB existants. Gardez la projection automatique pour le type concerné, utilisez un bouton explicite standard avec votre gestionnaire de clic, ou enregistrez une extension pour une interface personnalisée.

`verticalBars.enabled` régit toujours la disponibilité du rail. Pour laisser une source sur le Web, retirez son marqueur explicite ou utilisez `data-native-ui="disabled"`.

## Modifier l’utilisation du rail après le démarrage

```ts
await shell.disableVerticalControlArea();
await shell.enableVerticalControlArea();
```

Ces méthodes modifient `verticalBars.enabled` sur ce shell en préservant apparence, contrôles et placement. Elles retirent la projection existante avant de transférer la responsabilité, sans créer d’autre shell. Les appels sont sérialisés. Après `destroy()`, ces deux méthodes rejettent l’appel.

```ts
const lease = await shell.suspend(); // restaurer temporairement tous les contrôles Web
await lease.resume();
await shell.destroy(); // arrêter le shell et restaurer les sources
```

Désactiver la projection du rail ne retire pas le CSS de l’application et ne modifie pas son espacement. Mettez à jour votre propre disposition avec ce réglage si nécessaire.

## Demander une vérification après un changement non observé

```ts
shell.markForCheck();
```

Utilisez cette méthode après modification d’une propriété ou d’un état du lecteur sans mutation DOM. Elle planifie une vérification, regroupe les demandes répétées et envoie uniquement les instantanés natifs modifiés. Elle retourne `void` ; elle n’attend pas la fin native et ne rend pas le DOM de votre framework. Les appels après destruction sont ignorés. Consultez les [vérifications et l’observation des sources](native-ui-extensions.md#schedule-a-source-check).

## Comprendre pourquoi une source reste Web

Ajoutez temporairement `debug: true` à vos options de démarrage existantes, puis recompilez l’application Web. Ne démarrez pas un second shell pour activer le diagnostic :

```ts
const shell = await enableNativeUI({ debug: true, extensions: [myExtension] });
console.info(shell.getStatus());
```

Ouvrez la console de développement de la WebView et filtrez sur `[Native UI]`. Les diagnostics incluent la source DOM lorsqu’elle est disponible. Chaque raison est journalisée une seule fois par source pendant cette activation, évitant que le défilement ou les appels `markForCheck()` répétés saturent la console. Les props, données d’action et messages d’exception de l’application ne sont pas journalisés.

| Diagnostic | Vérification |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `web-fallback` | Compatibilité de la plateforme, enregistrement du plugin, synchronisation et recompilation native. |
| `unregistered-extension` | Le nom d’enregistrement natif correspond à la définition DOM et l’enregistrement précède le démarrage. Les nouvelles sources sont également vérifiées. |
| `reader-error` / `invalid-props` | Implémentation du lecteur, valeurs JSON uniquement et limite de 64K. |
| `unsupported-placement` / `missing-tab-owner` | Plateforme et hôte d’onglets natif propriétaire d’un accessoire. |
| `source-hidden` / `source-clipped` / `source-focused` | Visibilité, découpage/ancêtres transformés ou descendant Web ayant le focus. |
| `reader-opt-out` | Votre lecteur a retourné null. |
| `unsupported-control` | Balisage pris en charge, nom accessible, placement fixe et styles. |
| `native-rejected` | Décodage natif des props, placement ou compatibilité de l’appareil. Le pont signale le rejet, pas l’exception native. |

`getStatus()` résume le shell ; ce n’est pas un diagnostic par élément. La navigation normale, la suspension et le contenu non pris en charge peuvent volontairement conserver la présentation Web. Désactivez le débogage après l’enquête ; il ne modifie pas l’admissibilité à la projection.

## Applications existantes

La fonction autonome `enableVerticalControlArea()` utilise `'verticalOnly'` comme sélection par défaut. Son utilitaire `setPlacement()` est un adaptateur CSS Web obsolète ; utilisez `setVerticalBarsLayout({ edge, inset })` du thème pour la disposition Web. La disponibilité native provient des métriques de l’appareil du plugin.

Consultez la [migration depuis 1.2.1](migration.md) pour la séparation des packages, les options supprimées et les changements de valeurs par défaut des objets de contrôles partiels.
