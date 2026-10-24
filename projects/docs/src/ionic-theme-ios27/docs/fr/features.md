---
title: "Fonctionnalités"
sourceRevision: 300d42b266dcc159c7503d5c859c6635d2e12fede351fe71919753380106099d
---
# Fonctionnalités

Personnalisez le thème avec les variables CSS et mixins Sass, ou adoptez-le composant par composant. Les activations propres au balisage sont documentées dans [Balisage et classes spécifiques](special-markup.md).

## Variables CSS

Plusieurs variables CSS permettent d’adapter les styles par défaut de la bibliothèque à votre design. Consultez ce fichier pour en savoir plus :
[Variables par défaut](../src/styles/default-variables.scss)

| Variable | Valeur par défaut | Fonction |
| ------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| `--ios-theme-menu-background-rgb` | Clair : `225, 230, 240` ; sombre : `26, 31, 34` | Composantes RGB de la surface du menu ; à définir sur `ion-menu`. |
| `--ios-theme-menu-background-opacity` | `0.96` | Opacité de la surface du menu ; à définir sur `ion-menu`. |
| `--ios-theme-button-press-duration` | `380ms` | Durée de la mise à l’échelle `:active` du bouton, avec un léger dépassement. |

Utilisez `--ios-theme-button-press-duration` plutôt que les variables partagées de durée de transition d’activation pour personnaliser la mise à l’échelle à l’appui.

## Mixin Liquid Glass

Importez les fichiers SCSS du package principal pour utiliser le mixin Liquid Glass.

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/utils/api.scss';

ion-textarea label.textarea-wrapper {
  @include api.glass-background;
}
```

## Native UI

Une fois votre thème opérationnel, [ajoutez Native UI](add-native-ui.md) pour afficher les contrôles fixes pris en charge avec UIKit et SwiftUI sur iOS. Conservez les styles du thème pour le contenu Web et les contrôles de repli. Native UI est officiellement pris en charge depuis la version 2.0.0 et reste à activer explicitement ; l’ajout des styles ne l’active pas.

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
