---
title: "Funktionen"
sourceRevision: "cc7b0d9801f399dd2244c38b41d5478f193813bfd0cd502ef7ed5091cdb1eed6"
---
# Funktionen

Passen Sie das Theme mit CSS-Variablen und Sass-Mixins an oder übernehmen Sie es schrittweise für einzelne Komponenten. Markupspezifische Aktivierungen sind unter [Spezielles Markup und Klassen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/special-markup) dokumentiert.

## CSS-Variablen

Zur Anpassung der Standard-Styles der Bibliothek an Ihr Design stehen mehrere CSS-Variablen bereit. Einzelheiten finden Sie in dieser Datei:
[Standardvariablen](../src/styles/default-variables.scss)

Für Menüs setzt `--ios-theme-menu-background-rgb` die RGB-Kanäle der Fläche (hell: `225, 230, 240`; dunkel: `26, 31, 34`). `--ios-theme-menu-background-opacity` steuert die Deckkraft und hat den Standardwert `0.96`. Beide sind öffentliche Anpassungsvariablen und können auf `ion-menu` gesetzt werden.

Die Skalierung beim Drücken einer Schaltfläche folgt `:active` mit einem leichten Überschwingen. Legen Sie die Dauer mit `--ios-theme-button-press-duration` (Standard: `380ms`) fest, statt die gemeinsamen Variablen für die Dauer aktivierter Übergänge zu verwenden.

## Liquid-Glass-Mixin

Importieren Sie die SCSS-Dateien aus dem Hauptpaket, um das Liquid-Glass-Mixin zu verwenden.

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/utils/api.scss';

ion-textarea label.textarea-wrapper {
  @include api.glass-background;
}
```

## Native UI Shell (Vorschau)

Capacitor-iOS-Anwendungen können die optionale [Native UI Shell](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/native-ui-shell) verwenden, um unterstützte fest positionierte Ionic-Bedienelemente mit UIKit und systemeigenem Liquid Glass zu rendern. Sie ist in `1.2.0` als Vorschau verfügbar. Inhalt und Anwendungslogik bleiben in der WebView; Ionic verwaltet Routing und Seitenübergänge. Die Anleitung erklärt den Ursprung des hybriden Ansatzes bei Basecamp und Capacitor, die Einrichtung, unterstützte Bedienelemente und das Web-Rückfallverhalten.

## Selektive Komponenten-Imports

Für eine schrittweise Einführung können Sie einzelne Komponenten statt der vollständigen Theme-Datei importieren.

```css
@import '@rdlabo/ionic-theme-ios27/dist/css/utils/translucent';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-action-sheet';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-alert';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-button';
/* Importieren Sie die übrigen Komponenten, die Ihre Anwendung verwendet. */
```

### Dunkler Modus mit einzelnen Komponenten

Verwenden Sie SCSS, wenn Sie einzelne Komponenten mit Unterstützung des dunklen Modus importieren, da sich die Selektoren zwischen dauerhaftem, systemgesteuertem und klassenbasiertem Modus unterscheiden.

Dauerhaft:

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

Systemgesteuert:

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

Klassenbasiert:

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

## Interaktive Beispiele

[Gerenderte Beispiele in der Demo ansehen](https://ionic-theme-ios27.rdlabo.dev/main/docs).
