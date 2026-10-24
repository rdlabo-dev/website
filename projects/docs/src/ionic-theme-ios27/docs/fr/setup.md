---
title: "Configurer le thème iOS 27"
sourceRevision: 8a9782df49bd648a7aeb643c58ad6f10e3caaca346f8eacbd902375ff18215bb
---
# Configurer le thème iOS 27

Donnez l’apparence iOS 27 à une application Ionic existante en quatre étapes. Ce guide utilise le thème iOS 27 seul avec le mode sombre système. Pour sélectionner iOS 26/27 selon le navigateur ou utiliser MD3, consultez les [thèmes adaptatifs](adaptive-themes.md).

## Avant de commencer

Utilisez une application Ionic Angular, React ou Vue existante avec Ionic `>=8.8.1 <10`. Conservez les imports CSS de base d’Ionic. Les applications uniquement Web n’ont pas besoin de projet Capacitor natif.

## 1. Installer le thème et Foldable

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

[Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) est notre intégration standard pour l’état de l’appareil. Ses API de placement et de posture permettent à votre application de contrôler l’adaptation de la disposition ; après l’installation, raccordez les valeurs initiales et les événements de changement. Suivez le [guide de disposition](vertical-bars-layout.md) pour configurer celle de l’appareil.

## 2. Charger les styles

Ajoutez ces imports à votre feuille de style globale après les styles de base d’Ionic. Remplacez l’import d’une palette sombre Ionic existante au lieu d’en charger plusieurs :

```css
@import '@ionic/core/css/palettes/dark.system.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/md-remove-ios-class-effect.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27-dark-system.css';
```

### Choisir une paire pour le mode sombre

Utilisez une palette Ionic et une variante du thème correspondantes. Les chemins ci-dessous sont relatifs à `@ionic/core/css/palettes/` et `@rdlabo/ionic-theme-ios27/dist/css/` respectivement.

| Mode | Palette Ionic | Feuille de style du thème | Activation |
| ---------------------- | ----------------- | ----------------------------------- | ----------------------------------------------- |
| Système (exemple ci-dessus) | `dark.system.css` | `ionic-theme-ios27-dark-system.css` | Apparence du système. |
| Manuel | `dark.class.css` | `ionic-theme-ios27-dark-class.css` | Basculer `ion-palette-dark` sur la racine du document. |
| Toujours sombre | `dark.always.css` | `ionic-theme-ios27-dark-always.css` | Toujours actif. |

Si vous activez aussi Native UI, ces styles fournissent son marqueur d’apparence claire/sombre. Associez palette Ionic et variante du thème pour harmoniser contrôles Web et natifs. Consultez l’[héritage de l’apparence native](../../capacitor-native-ui/docs/appearance.md) pour l’ordre de résolution et le comportement du rail partagé.

## 3. Configurer les animations Ionic

Définissez ces options dans votre initialisation Ionic existante, avant le rendu de l’application :

```ts
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';

const ionicConfig = {
  mode: 'ios' as const,
  navAnimation: iosTransitionAnimation,
  popoverEnter: popoverEnterAnimation,
  popoverLeave: popoverLeaveAnimation,
};
```

Cet exemple utilise volontairement le mode `ios` pour afficher aussi le thème dans les navigateurs de bureau. Passez `ionicConfig` à l’initialiseur déjà utilisé par votre application :

| Framework | Application des options |
| ----------------- | ---------------------------------------------------------------------------- |
| Angular / Ionic 8 | `provideIonicAngular(ionicConfig)` importé depuis `@ionic/angular/standalone` |
| Angular / Ionic 9 | `provideIonicAngular(ionicConfig)` importé depuis `@ionic/angular` |
| React | `setupIonicReact(ionicConfig)` importé depuis `@ionic/react` |
| Vue | `app.use(IonicVue, ionicConfig)` avec `IonicVue` de `@ionic/vue` |

Fusionnez avec les options existantes ; n’initialisez pas Ionic deux fois. Pour conserver Material Design sur Android, gardez votre sélection du mode selon la plateforme et appliquez ces animations uniquement à la configuration iOS. Consultez les [thèmes adaptatifs](adaptive-themes.md) pour un exemple complet tenant compte de la plateforme.

## 4. Prévisualiser votre premier écran

Démarrez votre serveur de développement habituel et ouvrez une page existante. Ajoutez ce balisage dans son `ion-content` (avec la syntaxe de composants de votre framework) :

```html
<ion-list inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

Vous devriez voir un groupe en retrait aux bords arrondis. Basculez l’apparence du système entre clair et sombre, puis naviguez entre les pages pour observer la transition. Consultez [Utiliser ion-item-group](using-ion-item-group.md) pour la structure des listes.

| Si vous voyez… | Vérifiez… |
| ----------------------------------- | ------------------------------------------------------------- |
| Des contrôles Material Design sur ordinateur | Définissez `mode: 'ios'` dans l’initialiseur Ionic existant. |
| Des contrôles sans style | Chargez le thème globalement après les styles de base Ionic. |
| Un mélange de surfaces claires et sombres | Utilisez une palette Ionic et une variante sombre du thème correspondantes. |
| Les transitions de page par défaut | Passez les options d’animation avant l’initialisation d’Ionic. |

## Étapes suivantes

- [Personnaliser les styles et composants](features.md).
- [Ajouter Native UI](add-native-ui.md) pour les contrôles pris en charge d’une application Capacitor iOS. Installer le thème ne suffit pas à activer les contrôles natifs.
- [Ajouter Vertical Bars avec un thème existant](../../capacitor-native-ui/docs/ionic-vertical-bars.md).
- [Migrer une application existante](migration.md).
