---
title: "Thème"
sourceRevision: "40fb446dcf00c070708e98c90222fdbc4a9a19513d0914184a9009b30a261cb3"
---
Personnalisez les couleurs de l’éditeur après l’[installation](../README.md#installation).

Les couleurs par défaut sont définies dans la feuille de style de la bibliothèque. Remplacez-les avec des variables CSS :

```scss
:root {
  --ion-photo-editor-background: #2a2a2a;
  --ion-photo-editor-background-tint: #414141;

  --ion-photo-editor-color: #f0f0f0;
  --ion-photo-editor-color-tint: #dbdbdb;

  --ion-photo-editor-primary: #4d8dff;
  --ion-photo-editor-danger: #f24c58;
  --ion-photo-editor-success: #2dd55b;

  --ion-photo-editor-header-button-color-on-light: #222428;
  --ion-photo-editor-header-button-color-on-dark: #f4f5f8;
}
```

Référence du code source : [`core.scss`](https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.3/projects/photo-editor/src/lib/pages/core.scss).

## Palette de couleurs de la barre d’outils

`PhotoEditorPage` et `PhotoViewerPage` nécessitent `toolbarColorScheme: 'light' | 'dark'` dans les `componentProps` de la fenêtre modale. Choisissez `dark` pour un `ion-toolbar` sombre/noir et `light` pour une barre claire/blanche. L’application doit choisir, car la bibliothèque ne peut pas déduire de façon fiable l’apparence finale de la barre depuis le CSS, sa translucidité ou les modifications de thème à l’exécution.

Pour `@rdlabo/ionic-theme-ios26` v3, importez la feuille de style d’intégration facultative après le thème iOS 26 et les styles du mode sombre :

```scss
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26.css';
@import '@ionic/angular/css/palettes/dark.class.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-class.css';
@import '@rdlabo/ionic-angular-photo-editor/css/ios26-header-button-color-scheme.css';
```

Utilisez plutôt l’importation de mode sombre Always ou System appropriée, si nécessaire. La feuille de style d’intégration de l’éditeur de photos doit rester en dernier afin que sa palette d’en-tête locale puisse remplacer celle de l’application. Les applications qui n’utilisent pas le thème iOS 26 ne doivent pas importer cette feuille facultative ; elles bénéficient uniquement de la bascule normale de couleur de premier plan des boutons Ionic.
