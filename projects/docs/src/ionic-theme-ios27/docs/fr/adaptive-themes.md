---
title: "Utiliser les thèmes iOS 26, iOS 27 et MD3"
sourceRevision: 5a844ab11008cd1c9a36cb9bca3555a9698674b567a43a3c1219f3fb0f05cbfc
---
# Utiliser les thèmes iOS 26, iOS 27 et MD3

Utilisez cette configuration facultative pour sélectionner les styles iOS selon les capacités du navigateur ou utiliser MD3 en mode Material Design. Pour une apparence iOS 27 unique, suivez la [configuration du thème](setup.md). Ces étapes remplacent la configuration des styles et animations de ce guide.

## 1. Installer les thèmes

Installez les deux thèmes dans une application Ionic 8 ou 9 existante (`@ionic/core` 8.8.1 ou ultérieur) :

```bash
npm install @rdlabo/ionic-theme-ios26 @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

## 2. Charger les styles

Dans votre feuille de style Sass globale, par exemple `src/styles.scss`, chargez les styles selon les capacités du navigateur :

```scss
@use 'sass:meta';

@supports (overflow-anchor: auto) {
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect');
}

@supports (text-wrap: pretty) and (not (overflow-anchor: auto)) {
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect');
}
```

Si la compilation indique `Can't find stylesheet to import.` pour un appel à `meta.load-css()`, rendez `node_modules` accessible à Sass. Dans Angular, ajoutez ceci sous les `options` de build de l’application dans `angular.json` :

```json
"stylePreprocessorOptions": {
  "includePaths": ["node_modules"]
}
```

Vous pouvez aussi utiliser un chemin relatif depuis le fichier Sass contenant `meta.load-css()` vers le package installé, par exemple `../node_modules/@rdlabo/ionic-theme-ios27/src/styles/default-variables` depuis `src/styles.scss`. Adaptez le préfixe `../` à l’emplacement de votre fichier et appliquez le même changement à chaque import de thème.

### Quels styles sont sélectionnés ?

Les vérifications portent sur les capacités du navigateur, pas sur la version d’iOS :

| Capacité du navigateur en mode Ionic `ios` | Résultat |
| ---------------------------------------------------- | ------------------------------- |
| `overflow-anchor: auto` | Thème iOS 27. |
| `text-wrap: pretty`, sans `overflow-anchor: auto` | Thème iOS 26. |
| Aucune de ces fonctionnalités | Apparence iOS par défaut d’Ionic. |

L’exemple utilise le mode sombre par classe : chargez également la [palette sombre Ionic correspondante](https://ionicframework.com/docs/theming/dark-mode). Pour le mode système ou toujours sombre, remplacez les deux imports `-dark-class` par la variante correspondante ; consultez les [paires pour le mode sombre](setup.md#choose-one-dark-mode-pair). Les styles `md-remove-ios-class-effect` empêchent les classes propres à iOS d’affecter le mode Material Design.

## 3. Configurer les animations

Conservez les animations iOS 27 de transition de page et de popover pour les deux générations de styles. Déterminez ces options avant l’initialisation d’Ionic. Pour Angular :

```ts
import { isPlatform, provideIonicAngular } from '@ionic/angular/standalone'; // Ionic 8
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';

function loadIOSAnimations() {
  if (typeof CSS === 'undefined') return {};
  if (!CSS.supports('overflow-anchor: auto') && !CSS.supports('text-wrap: pretty')) return {};

  return {
    navAnimation: iosTransitionAnimation,
    popoverEnter: popoverEnterAnimation,
    popoverLeave: popoverLeaveAnimation,
  };
}

provideIonicAngular(isPlatform('ios') ? loadIOSAnimations() : {});
```

Avec Ionic 9 Angular, importez `isPlatform` et `provideIonicAngular` depuis `@ionic/angular`. React et Vue peuvent transmettre les mêmes options à `setupIonicReact` ou `IonicVue` pendant l’initialisation. Dans les applications rendues côté serveur, effectuez la sélection pendant l’initialisation dans le navigateur.

Le rayon de la transition de page vaut `0` par défaut. Les applications natives peuvent le mettre à jour après avoir mesuré la WebView :

```ts
import { setConfig } from '@rdlabo/ionic-theme-ios27';

setConfig({ radius });
```

## 4. Vérifier le thème

Testez sur iOS. Pour un aperçu sur ordinateur, définissez le mode Ionic sur `ios` dans la configuration d’initialisation de votre framework (par exemple `mode: 'ios'`).

Utilisez ce balisage pour prévisualiser les listes groupées avec retrait. Pour la structure de liste attendue par le thème, consultez [Utiliser ion-item-group](using-ion-item-group.md).

```html
<ion-list mode="ios" inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

## Utiliser le thème MD3

Installez les trois thèmes pour utiliser iOS 27 sur les versions compatibles de Safari, revenir à iOS 26 sur la génération précédente de Safari et utiliser MD3 lorsqu’Ionic fonctionne en mode Material Design. Les trois thèmes nécessitent `@ionic/core` 8.8.1 ou ultérieur :

```bash
npm install @rdlabo/ionic-theme-ios26 @rdlabo/ionic-theme-ios27 @rdlabo/ionic-theme-md3 @erkamyaman/capacitor-foldable
```

Conservez les deux thèmes iOS derrière les mêmes tests de fonctionnalités qu’à l’étape 2, puis chargez MD3 sans condition. L’emploi systématique de `meta.load-css()` conserve aussi les styles MD3 après les styles iOS conditionnels dans le CSS généré :

```scss
@use 'sass:meta';

@supports (overflow-anchor: auto) {
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect');
}

@supports (text-wrap: pretty) and (not (overflow-anchor: auto)) {
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect');
}

@include meta.load-css('@rdlabo/ionic-theme-md3/dist/css/default-variables.css');
@include meta.load-css('@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css');
```

Les styles iOS s’appliquent uniquement au mode `ios` d’Ionic, tandis que MD3 s’applique au mode `md`. La feuille de style `md-remove-ios-class-effect` de chaque branche iOS empêche les classes utilitaires propres à iOS d’affecter le mode MD. MD3 inclut déjà ses styles de listes avec retrait : ne chargez donc pas la feuille de style facultative `md-ion-list-inset` des packages iOS dans cette configuration.

Chargez aussi la palette sombre correspondante d’Ionic. L’exemple utilise le mode sombre par classe ; pour le mode système ou toujours sombre, choisissez la variante correspondante pour Ionic et les deux thèmes iOS.

Conservez la transition iOS 27 pour les deux générations de thèmes iOS et sélectionnez la transition MD3 en mode Material Design. Étendez la configuration d’animation ci-dessus comme suit :

```ts
import { isPlatform, provideIonicAngular } from '@ionic/angular/standalone'; // Ionic 8
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';
import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';

function loadAnimations() {
  if (!isPlatform('ios')) return { navAnimation: mdTransitionAnimation };
  if (typeof CSS === 'undefined') return {};
  if (!CSS.supports('overflow-anchor: auto') && !CSS.supports('text-wrap: pretty')) return {};

  return {
    navAnimation: iosTransitionAnimation,
    popoverEnter: popoverEnterAnimation,
    popoverLeave: popoverLeaveAnimation,
  };
}

provideIonicAngular(loadAnimations());
```

Avec Ionic 9 Angular, importez `isPlatform` et `provideIonicAngular` depuis `@ionic/angular`. React et Vue peuvent passer les mêmes options retournées à `setupIonicReact` ou `IonicVue`. Si Sass ne résout pas un package dans `meta.load-css()`, utilisez `stylePreprocessorOptions.includePaths` ou la configuration des chemins relatifs décrite ci-dessus.
