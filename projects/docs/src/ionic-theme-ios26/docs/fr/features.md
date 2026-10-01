---
title: "Fonctionnalités"
sourceRevision: "74235de7cf7fbb6870195cee92bf2d3698b624d7d849de90444950ccc39f4af8"
---
# Fonctionnalités

Personnalisez le thème avec des variables CSS et des mixins Sass, ou adoptez-le un composant à la fois. Les activations liées au balisage sont décrites dans [Balisage et classes particuliers](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/special-markup).

## Variables CSS

Plusieurs variables CSS permettent d’adapter les styles par défaut de la bibliothèque à votre design. Consultez ce fichier pour en savoir plus :
https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios26-v9.4.1/src/styles/default-variables.scss

## Mixin Liquid Glass

Importez les fichiers SCSS du package principal pour utiliser le mixin Liquid Glass.

```scss
@use '@rdlabo/ionic-theme-ios26/src/styles/utils/api.scss';

ion-textarea label.textarea-wrapper {
  @include api.glass-background;
}
```

## Imports sélectifs de composants

Pour adopter le thème progressivement, vous pouvez importer des composants individuellement plutôt que le fichier du thème complet.

```css
@import '@rdlabo/ionic-theme-ios26/dist/css/utils/translucent';
@import '@rdlabo/ionic-theme-ios26/dist/css/components/ion-action-sheet';
@import '@rdlabo/ionic-theme-ios26/dist/css/components/ion-alert';
@import '@rdlabo/ionic-theme-ios26/dist/css/components/ion-button';
/* Importez les autres composants utilisés par votre application. */
```

### Mode sombre avec des composants individuels

Utilisez SCSS pour importer sélectivement les composants avec prise en charge du mode sombre, car les sélecteurs diffèrent entre les modes Always, System et Class.

Toujours :

```scss
@use '@rdlabo/ionic-theme-ios26/src/styles/utils/theme-dark';

:root {
  @include theme-dark.default-variables;
}
@include theme-dark.ion-button;
@include theme-dark.ion-fab;
@include theme-dark.ion-tabs;
@include theme-dark.ion-segment;
```

Système :

```scss
@use '@rdlabo/ionic-theme-ios26/src/styles/utils/theme-dark';

@media (prefers-color-scheme: dark) {
  :root {
    @include theme-dark.default-variables;
  }
  @include theme-dark.ion-button;
  @include theme-dark.ion-fab;
  @include theme-dark.ion-tabs;
  @include theme-dark.ion-segment;
}
```

Classe :

```scss
@use '@rdlabo/ionic-theme-ios26/src/styles/utils/theme-dark';

.ion-palette-dark {
  @include theme-dark.default-variables;
  @include theme-dark.ion-button;
  @include theme-dark.ion-fab;
  @include theme-dark.ion-tabs;
  @include theme-dark.ion-segment;
}
```

## Exemples interactifs

[Parcourir les exemples rendus dans la démonstration](https://ionic-theme-ios26.rdlabo.dev/main/docs).
