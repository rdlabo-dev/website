---
title: "Configuration Cordova"
sourceRevision: "632cc17d693c442a94e91c595e10edb6c77e6f53158df62f69dca027ee1a7e0f"
---

# Configuration Cordova

Pour une application Cordova avec Ionic et Native UI, utilisez `@webview-native-ui/cordova-plugin`. Le plugin inclut le JavaScript, les types et le CSS du thème, déjà reliés à son intégration native. Aucun alias de bundler ni installation séparée de `@rdlabo/ionic-theme-ios27` ou `@rdlabo/capacitor-native-ui` n’est nécessaire.

Capacitor est l’hôte natif par défaut de cette documentation. Ce guide facultatif décrit les différences de package et de démarrage pour une application Ionic construite avec un bundler et utilisant Cordova. Le balisage, les styles et les helpers communs restent décrits dans les guides existants.

## 1. Installer le plugin Cordova

Depuis la racine de l’application Cordova :

```sh
cordova plugin add @webview-native-ui/cordova-plugin@0.1.1
```

Cette commande installe les ressources natives et JavaScript préparées et enregistre la dépendance npm. Si votre bundler Web constitue un projet npm séparé, installez-y la même version :

```sh
npm install @webview-native-ui/cordova-plugin@0.1.1
```

Si Cordova et votre bundler partagent un `package.json`, aucune seconde installation n’est nécessaire. Conservez les dépendances Ionic existantes. Consultez les [prérequis du plugin](https://github.com/webview-native-ui/cordova-plugin#requirements) pour Cordova, SwiftPM, Xcode et Android. Le rendu natif exige une version iOS prise en charge ; les contrôles Android standard conservent leur présentation Web.

`@erkamyaman/capacitor-foldable` est un plugin Capacitor et n’est pas requis par cette configuration Cordova. Le raccordement de disposition d’appareil propre à Capacitor dans les autres guides ne garantit pas la prise en charge de ces API sous Cordova.

## 2. Charger les styles du thème fourni

Conservez les styles de base d’Ionic, puis ajoutez ces imports à la feuille de style globale. Remplacez la palette sombre existante au lieu d’en charger plusieurs :

```css
@import '@ionic/core/css/palettes/dark.system.css';
@import '@webview-native-ui/cordova-plugin/theme/css/default-variables.css';
@import '@webview-native-ui/cordova-plugin/theme/css/ionic-theme-ios27.css';
@import '@webview-native-ui/cordova-plugin/theme/css/md-remove-ios-class-effect.css';
@import '@webview-native-ui/cordova-plugin/theme/css/ionic-theme-ios27-dark-system.css';
```

Pour un mode sombre manuel, utilisez plutôt `dark.class.css` et `ionic-theme-ios27-dark-class.css`, puis basculez `ion-palette-dark` sur `html`. Gardez les variantes Ionic et du thème appariées.

## 3. Configurer les animations Ionic

Importez les animations depuis le package Cordova et transmettez-les à votre initialisation Ionic existante avant de rendre l’application :

```ts
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@webview-native-ui/cordova-plugin/theme';

const ionicConfig = {
  mode: 'ios' as const,
  navAnimation: iosTransitionAnimation,
  popoverEnter: popoverEnterAnimation,
  popoverLeave: popoverLeaveAnimation,
};
```

Utilisez l’initialiseur existant de votre framework, comme expliqué dans [Configurer les animations Ionic](setup.md#3-configure-ionic-animations) ; n’initialisez pas Ionic deux fois. Pour conserver le mode Material Design sur Android, appliquez ces options uniquement à la configuration iOS. D’autres helpers, comme `attachTabBarSearchable`, sont aussi disponibles depuis `/theme` ; leur import ne les active pas automatiquement.

## 4. Démarrer Native UI quand Cordova et l’application sont prêts

Conservez `<script src="cordova.js"></script>` dans le HTML d’entrée Cordova. Enregistrez l’écouteur de disponibilité de l’appareil au démarrage et attendez que le framework monte `ion-app` avant d’activer Native UI :

```ts
import { enableNativeUI } from '@webview-native-ui/cordova-plugin';

const deviceReady = new Promise<void>((resolve) => {
  document.addEventListener('deviceready', () => resolve(), { once: true });
});

export async function startNativeUI(appMounted: Promise<void>) {
  await Promise.all([deviceReady, appMounted]);
  return enableNativeUI();
}
```

Fournissez `appMounted` depuis le cycle de montage de l’application, appelez `startNativeUI()` une seule fois et conservez le handle renvoyé. Appelez `await handle.destroy()` lorsque l’application cesse définitivement d’utiliser Native UI. Ne créez pas un runtime par page et n’appelez pas également `window.NativeUI.enableNativeUI()` avec ce démarrage basé sur npm. Les aperçus navigateur n’émettent pas `deviceready` de Cordova ; réservez ce chemin au build Cordova et prévisualisez le thème Web avec l’entrée navigateur habituelle.

Compilez les ressources Web dans le répertoire `www` de l’application Cordova, puis préparez et reconstruisez l’application native, par exemple :

```sh
cordova prepare ios
cordova build ios
```

Utilisez `android` pour un build Android après avoir satisfait ses prérequis. N’utilisez pas `npx cap sync` avec Cordova. Sur iOS, l’adaptateur désactive les retraits automatiques de la vue défilante ; appliquez les espacements de zone sûre dans le CSS de page comme indiqué dans le [guide du plugin](https://github.com/webview-native-ui/cordova-plugin#start-native-ui).

## Utiliser les guides communs du thème

Poursuivez avec le [balisage et les classes](special-markup.md), les [listes en retrait](using-ion-item-group.md), les [variables CSS et styles des composants](features.md) et les [helpers d’animation](animation.md). Leurs exemples utilisent par défaut le package de thème autonome. Appliquez ces substitutions pour la version du thème fournie avec votre plugin Cordova :

| Documentation standard | Équivalent Cordova |
| --- | --- |
| Imports JavaScript depuis `@rdlabo/ionic-theme-ios27` | `@webview-native-ui/cordova-plugin/theme` |
| Imports CSS depuis `@rdlabo/ionic-theme-ios27/dist/css/*` | `@webview-native-ui/cordova-plugin/theme/css/*` (inclure l’extension `.css`) |
| Démarrage Native UI depuis `@rdlabo/capacitor-native-ui` | Racine du package Cordova, avec le cycle de démarrage ci-dessus |
| Imports Sass depuis `@rdlabo/ionic-theme-ios27/src/styles/*` | Non inclus dans le package Cordova ; utiliser le CSS compilé et les variables CSS |

Le guide des [thèmes adaptatifs](adaptive-themes.md) utilise les sources Sass du thème autonome et ne s’applique pas tel quel à Cordova. Les concepts CSS de [disposition Vertical Bars](vertical-bars-layout.md) sont communs, mais son raccordement Capacitor Foldable nécessite une intégration propre à l’hôte. Suivez le périmètre de prise en charge du plugin Cordova plutôt que de copier les commandes natives Capacitor.

## Migrer une application existante vers cette intégration

Remplacez tous les imports JavaScript du thème depuis `@rdlabo/ionic-theme-ios27` par `@webview-native-ui/cordova-plugin/theme`, et les imports CSS depuis `@rdlabo/ionic-theme-ios27/dist/css/*` par `@webview-native-ui/cordova-plugin/theme/css/*`. Importez le démarrage de Native UI depuis la racine du package Cordova. Supprimez les anciens alias d’intégration et dépendances du thème/Capacitor lorsqu’ils ne sont plus utilisés. Conservez le balisage, les bindings et les gestionnaires des composants.

Utilisez les helpers et le CSS de la même version du thème fourni. Cordova 0.1.1 inclut le thème 2.1.0 ; installer un thème autonome plus récent ne met pas cette copie à jour. Vérifiez la version du thème et la révision Core dans `shared/ORIGIN.json` du package Cordova installé, puis mettez à jour le package Cordova pour recevoir les sources fournies plus récentes.

## Comportements pris en charge et vérification

Capacitor reste l’hôte principal pris en charge. Les comparaisons Cordova ont couvert Ionic 8.8.19 sur iOS 27.2 et Android API 35 : contrôles, onglets, superpositions, intégration du thème, mode sombre et arrêt/redémarrage. La recherche utilisait le repli Web du thème sur les deux hôtes. Ces vérifications ne garantissent ni la parité de recherche native, ni toutes les transitions de routeur de framework, ni les gestes interactifs de retour. La démo Ionic 9 Capacitor de ce dépôt n’est pas un test d’acceptation Cordova.

Si les helpers du thème ne se coordonnent pas avec les contrôles natifs, vérifiez que tous les imports utilisent `/theme`, qu’un seul runtime Native UI est démarré et que le bundle Web et le plugin natif ont la même version. Signalez les problèmes de pont, d’installation ou d’intégration fournie dans [cordova-plugin](https://github.com/webview-native-ui/cordova-plugin/issues) ; les corrections communes de style ou d’animation appartiennent à ce dépôt.
