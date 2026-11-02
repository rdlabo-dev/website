---
title: "Funktionen"
sourceRevision: "6324ec631ef8a9b8ef7758fade47b06f43c5875a7451029c44ee482324c0e15b"
---
# Funktionen

Passen Sie das Theme mit CSS-Variablen und Sass-Mixins an oder übernehmen Sie es schrittweise für einzelne Komponenten. Markupspezifische Aktivierungen sind unter [Spezielles Markup und Klassen](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/special-markup) dokumentiert.

## CSS-Variablen

Zur Anpassung der Standard-Styles der Bibliothek an Ihr Design stehen mehrere CSS-Variablen bereit. Einzelheiten finden Sie in dieser Datei:
https://github.com/webview-native-ui/ionic-theme-ios27/blob/ios26-v9.4.2/src/styles/default-variables.scss

## Liquid-Glass-Mixin

Importieren Sie die SCSS-Dateien aus dem Hauptpaket, um das Liquid-Glass-Mixin zu verwenden.

```scss
@use '@rdlabo/ionic-theme-ios26/src/styles/utils/api.scss';

ion-textarea label.textarea-wrapper {
  @include api.glass-background;
}
```

## Selektive Komponenten-Imports

Für eine schrittweise Einführung können Sie einzelne Komponenten statt der vollständigen Theme-Datei importieren.

```css
@import '@rdlabo/ionic-theme-ios26/dist/css/utils/translucent';
@import '@rdlabo/ionic-theme-ios26/dist/css/components/ion-action-sheet';
@import '@rdlabo/ionic-theme-ios26/dist/css/components/ion-alert';
@import '@rdlabo/ionic-theme-ios26/dist/css/components/ion-button';
/* Importieren Sie die übrigen Komponenten, die Ihre Anwendung verwendet. */
```

### Dunkler Modus mit einzelnen Komponenten

Verwenden Sie SCSS, wenn Sie einzelne Komponenten mit Unterstützung des dunklen Modus importieren, da sich die Selektoren zwischen dauerhaftem, systemgesteuertem und klassenbasiertem Modus unterscheiden.

Dauerhaft:

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

Systemgesteuert:

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

Klassenbasiert:

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

## Interaktive Beispiele

[Gerenderte Beispiele in der Demo ansehen](https://ionic-theme-ios26.rdlabo.dev/main/docs).
