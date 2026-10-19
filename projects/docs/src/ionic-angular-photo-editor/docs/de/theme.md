---
title: "Theme"
sourceRevision: "59f095d99d81841807f10cbc30cd2b374811078bbeb77bc7d8c2c96aead55225"
---
Überschreiben Sie die Editorfarben nach der [Installation](/docs/readme#installation).

Die Standardfarben sind im Stylesheet der Bibliothek definiert. Überschreiben Sie sie mit CSS-Variablen:

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

Quellreferenz: [`core.scss`](https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.6/projects/photo-editor/src/lib/pages/core.scss).

## Farbschema der Toolbar

`PhotoEditorPage` und `PhotoViewerPage` erfordern `toolbarColorScheme: 'light' | 'dark'` in den `componentProps` des modalen Dialogs. Wählen Sie `dark` für eine dunkle bzw. schwarze `ion-toolbar` und `light` für eine helle bzw. weiße Toolbar. Die nutzende Anwendung muss diese Auswahl treffen, da die Bibliothek das endgültige Aussehen nicht zuverlässig aus CSS, Transparenz oder Theme-Überschreibungen zur Laufzeit ableiten kann.

Für `@rdlabo/ionic-theme-ios26` v3 importieren Sie das optionale Integrations-Stylesheet nach dem iOS-26-Theme und den Dark-Mode-Stilen:

```scss
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26.css';
@import '@ionic/angular/css/palettes/dark.class.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-class.css';
@import '@rdlabo/ionic-angular-photo-editor/css/ios26-header-button-color-scheme.css';
```

Verwenden Sie gegebenenfalls stattdessen den passenden Dark-Mode-Import Always oder System. Das Integrations-Stylesheet des Fotoeditors muss zuletzt stehen, damit sein lokales Header-Farbschema das umgebende Anwendungsschema überschreiben kann. Anwendungen ohne iOS-26-Theme sollten dieses optionale Stylesheet nicht importieren; sie erhalten ausschließlich die gewöhnliche Umschaltung der Vordergrundfarbe von Ionic-Schaltflächen.
