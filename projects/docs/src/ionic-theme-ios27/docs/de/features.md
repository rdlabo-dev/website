---
title: "Funktionen"
sourceRevision: "ca9e70202f746ec210d577177059d7b8f96a8287aa69cdec05a3c35940ac0f33"
---

# Funktionen

Passen Sie das Theme mit CSS-Variablen und Sass-Mixins an oder übernehmen Sie es komponentenweise. Markup-spezifische Optionen beschreibt [Spezielles Markup und Klassen](special-markup.md).

## CSS-Variablen

Zur Anpassung der Standard-Styles der Bibliothek an Ihr Design stehen mehrere CSS-Variablen bereit. Einzelheiten finden Sie in dieser Datei:
[Standardvariablen](../src/styles/default-variables.scss)

| Variable | Standard | Zweck |
| --- | --- | --- |
| `--ios-theme-menu-background-rgb` | Hell: `225, 230, 240`; dunkel: `26, 31, 34` | RGB-Kanäle der Menüfläche; auf `ion-menu` setzen. |
| `--ios-theme-menu-background-opacity` | `0.96` | Deckkraft der Menüfläche; auf `ion-menu` setzen. |
| `--ios-theme-button-press-duration` | `380ms` | Dauer der `:active`-Skalierung einer Schaltfläche mit leichtem Überschwingen. |

Verwenden Sie zum Anpassen der Skalierung beim Drücken `--ios-theme-button-press-duration` statt der gemeinsam genutzten Variablen für die Aktivierungsübergangsdauer.

## Liquid Glass-Mixin

Importieren Sie die SCSS-Dateien aus dem Hauptpaket, um das Liquid Glass-Mixin zu verwenden.

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/utils/api.scss';

ion-textarea label.textarea-wrapper {
  @include api.glass-background;
}
```

## Native UI

Sobald Ihr Theme funktioniert, können Sie [Native UI hinzufügen](add-native-ui.md), um unterstützte fixierte Bedienelemente unter iOS mit UIKit und SwiftUI darzustellen. Behalten Sie die Theme-Stile für Web-Inhalte und Fallback-Bedienelemente. Native UI wird ab Version 2.0.0 offiziell unterstützt und muss weiterhin ausdrücklich aktiviert werden; Stylesheets allein aktivieren sie nicht.

## Selektive Komponenten-Imports

Für eine schrittweise Einführung können Sie einzelne Komponenten statt der vollständigen Theme-Datei importieren.

```css
@import '@rdlabo/ionic-theme-ios27/dist/css/utils/translucent';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-action-sheet';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-alert';
@import '@rdlabo/ionic-theme-ios27/dist/css/components/ion-button';
/* Import the remaining components your application uses. */
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
