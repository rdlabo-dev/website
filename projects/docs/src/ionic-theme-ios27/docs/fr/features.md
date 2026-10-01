---
title: "Fonctionnalités"
sourceRevision: "cc7b0d9801f399dd2244c38b41d5478f193813bfd0cd502ef7ed5091cdb1eed6"
---
# Fonctionnalités

Personnalisez le thème avec les variables CSS et mixins Sass, ou adoptez-le composant par composant. Les activations propres au balisage sont documentées dans [Balisage et classes spécifiques](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/special-markup).

## Variables CSS

Plusieurs variables CSS permettent d’adapter les styles par défaut de la bibliothèque à votre design. Consultez ce fichier pour en savoir plus :
[Variables par défaut](../src/styles/default-variables.scss)

Pour les menus, `--ios-theme-menu-background-rgb` définit les composantes RGB de la surface : `225, 230, 240` en clair, `26, 31, 34` en sombre. `--ios-theme-menu-background-opacity` contrôle l’opacité et vaut `0.96` par défaut. Ces deux variables publiques de personnalisation peuvent être définies sur `ion-menu`.

La mise à l’échelle à l’appui des boutons suit `:active` avec un léger dépassement. Définissez `--ios-theme-button-press-duration`, par défaut `380ms`, pour personnaliser sa durée plutôt que les variables partagées de durée de transition d’activation.

## Mixin Liquid Glass

Importez les fichiers SCSS du package principal pour utiliser le mixin Liquid Glass.

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/utils/api.scss';

ion-textarea label.textarea-wrapper {
  @include api.glass-background;
}
```

## Native UI Shell (préversion)

Les applications Capacitor iOS peuvent utiliser [Native UI Shell](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/native-ui-shell), facultatif, pour afficher les contrôles Ionic fixes compatibles avec UIKit et le Liquid Glass système. Il est disponible en préversion dans `1.2.0`. Le contenu et la logique de l’application restent dans la WebView ; Ionic gère le routage et les transitions de pages. Le guide explique les origines de l’approche hybride chez Basecamp et Capacitor, la configuration, les contrôles pris en charge et le repli Web.

## Imports sélectifs de composants

Pour adopter le thème progressivement, vous pouvez importer des composants individuellement plutôt que le fichier du thème complet.

```css
@import '@rdlabo/ionic-theme-ios27/dist/css/utils/translucent';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-action-sheet';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-alert';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-button';
/* Importez les autres composants utilisés par votre application. */
```

### Mode sombre avec des composants individuels

Utilisez SCSS pour importer sélectivement les composants avec prise en charge du mode sombre, car les sélecteurs diffèrent entre les modes Always, System et Class.

Toujours :

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/utils/theme-dark';

:root {
  @include theme-dark.default-variables;
}
@include theme-dark.ion-list;
@include theme-dark.ion-button;
@include theme-dark.ion-fab;
@include theme-dark.ion-tabs;
@include theme-dark.ion-segment;
```

Système :

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/utils/theme-dark';

@media (prefers-color-scheme: dark) {
  :root {
    @include theme-dark.default-variables;
  }
  @include theme-dark.ion-list;
  @include theme-dark.ion-button;
  @include theme-dark.ion-fab;
  @include theme-dark.ion-tabs;
  @include theme-dark.ion-segment;
}
```

Classe :

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/utils/theme-dark';

.ion-palette-dark {
  @include theme-dark.default-variables;
  @include theme-dark.ion-list;
  @include theme-dark.ion-button;
  @include theme-dark.ion-fab;
  @include theme-dark.ion-tabs;
  @include theme-dark.ion-segment;
}
```

## Exemples interactifs

[Parcourir les exemples rendus dans la démo](https://ionic-theme-ios27.rdlabo.dev/main/docs).
