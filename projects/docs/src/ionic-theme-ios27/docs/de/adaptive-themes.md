---
title: "iOS-26-, iOS-27- und MD3-Themes verwenden"
sourceRevision: "ac1e37e77410d613fcfbe1a547ac8a3f7bf020bbef0a8f95e5449908c4dae56b"
---
# iOS-26-, iOS-27- und MD3-Themes verwenden

Verwenden Sie diese optionale Einrichtung, wenn Browserfunktionen die iOS-Stile bestimmen sollen oder Sie MD3 im Material-Design-Modus wünschen. Für eine einheitliche iOS-27-Darstellung folgen Sie der [Theme-Einrichtung](setup.md). Diese Schritte ersetzen dort die Stylesheet- und Animationskonfiguration.

## 1. Themes installieren

Installieren Sie beide Themes in einer bestehenden Ionic-8- oder Ionic-9-Anwendung (`@ionic/core` ab 8.8.1):

```bash
npm install @rdlabo/ionic-theme-ios26 @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

## 2. Stylesheets laden

Laden Sie die Styles in Ihrem globalen Sass-Stylesheet, beispielsweise `src/styles.scss`, abhängig von den Browser-Fähigkeiten:

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

Falls die Kompilierung bei einem Aufruf von `meta.load-css()` den Fehler `Can't find stylesheet to import.` meldet, machen Sie `node_modules` für Sass verfügbar. Ergänzen Sie in Angular unter den Build-`options` der Anwendung in `angular.json` Folgendes:

```json
"stylePreprocessorOptions": {
  "includePaths": ["node_modules"]
}
```

Alternativ können Sie von der Sass-Datei mit `meta.load-css()` aus einen relativen Pfad zum installierten Paket verwenden, zum Beispiel `../node_modules/@rdlabo/ionic-theme-ios27/src/styles/default-variables` aus `src/styles.scss`. Passen Sie das Präfix `../` an den Speicherort Ihrer Datei an und ändern Sie alle Theme-Imports entsprechend.

### Welche Stile werden ausgewählt?

Die Prüfungen wählen anhand von Browserfunktionen aus, nicht anhand von iOS-Versionen:

| Browserfunktion im Ionic-Modus `ios` | Ergebnis |
| --- | --- |
| `overflow-anchor: auto` | iOS-27-Theme. |
| `text-wrap: pretty`, ohne `overflow-anchor: auto` | iOS-26-Theme. |
| Keine der beiden Funktionen | Ionics standardmäßige iOS-Darstellung. |

Das Beispiel verwendet den klassenbasierten Dunkelmodus: Laden Sie zusätzlich [Ionics passende dunkle Palette](https://ionicframework.com/docs/theming/dark-mode). Für den systemgesteuerten oder permanenten Dunkelmodus ersetzen Sie beide `-dark-class`-Importe durch die passende Variante; siehe [Dunkelmodus-Paare](setup.md#choose-one-dark-mode-pair). Die Stile aus `md-remove-ios-class-effect` verhindern, dass iOS-spezifische Klassen den Material-Design-Modus beeinflussen.

## 3. Animationen konfigurieren

Behalten Sie die iOS-27-Animationen für Seitenübergänge und Popovers für beide gestalteten Generationen bei. Ermitteln Sie diese Optionen, bevor Ionic initialisiert wird. Für Angular:

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

Importieren Sie für Ionic 9 Angular `isPlatform` und `provideIonicAngular` aus `@ionic/angular`. React und Vue können dieselben Optionen bei der Initialisierung an `setupIonicReact` beziehungsweise `IonicVue` übergeben. Führen Sie die Auswahl in serverseitig gerenderten Anwendungen während der Browser-Initialisierung aus.

Der Radius des Seitenübergangs ist standardmäßig `0`. Native Anwendungen können ihn nach dem Vermessen der WebView aktualisieren:

```ts
import { setConfig } from '@rdlabo/ionic-theme-ios27';

setConfig({ radius });
```

## 4. Theme prüfen

Testen Sie unter iOS. Setzen Sie bei der Vorschau auf dem Desktop den Ionic-Modus in Ihrer bestehenden Framework-Initialisierung auf `ios`, beispielsweise mit `mode: 'ios'`.

Mit diesem Markup können Sie die Darstellung eingerückter, gruppierter Listen ausprobieren. Die erwartete Listenstruktur beschreibt [ion-item-group verwenden](using-ion-item-group.md).

```html
<ion-list mode="ios" inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

## Zusammen mit dem MD3-Theme verwenden

Installieren Sie alle drei Themes, um iOS 27 auf unterstützten Safari-Versionen, iOS 26 als Rückfalloption auf der vorherigen Safari-Generation und MD3 im Material-Design-Modus von Ionic zu verwenden. Alle drei Themes benötigen `@ionic/core` ab 8.8.1:

```bash
npm install @rdlabo/ionic-theme-ios26 @rdlabo/ionic-theme-ios27 @rdlabo/ionic-theme-md3 @erkamyaman/capacitor-foldable
```

Laden Sie die beiden iOS-Themes weiterhin unter denselben Browserfunktionsprüfungen wie in Schritt 2 und MD3 anschließend ohne Bedingung. Die durchgehende Verwendung von `meta.load-css()` stellt außerdem sicher, dass die MD3-Stile im erzeugten CSS nach den bedingten iOS-Stilen stehen:

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

Die iOS-Styles gelten nur für den Ionic-Modus `ios`, MD3 dagegen für den Modus `md`. Das Stylesheet `md-remove-ios-class-effect` in jedem iOS-Zweig verhindert, dass ausschließlich für iOS gedachte Hilfsklassen den MD-Modus beeinflussen. MD3 enthält seine Styles für eingerückte Listen bereits. Laden Sie in dieser Konfiguration deshalb nicht zusätzlich das optionale Stylesheet `md-ion-list-inset` eines der iOS-Pakete.

Laden Sie auch die passende dunkle Ionic-Palette. Das Beispiel verwendet einen klassenbasierten dunklen Modus. Wählen Sie für einen systemgesteuerten oder dauerhaft dunklen Modus die passende Variante für Ionic und beide iOS-Themes.

Behalten Sie den iOS-27-Übergang für beide iOS-Theme-Generationen bei und wählen Sie im Material-Design-Modus den MD3-Übergang. Erweitern Sie die oben gezeigte Animationskonfiguration wie folgt:

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

Für Ionic 9 Angular importieren Sie `isPlatform` und `provideIonicAngular` aus `@ionic/angular`. React und Vue können dieselben zurückgegebenen Optionen an `setupIonicReact` beziehungsweise `IonicVue` übergeben. Kann Sass ein Paket in `meta.load-css()` nicht auflösen, verwenden Sie die oben beschriebene Konfiguration mit `stylePreprocessorOptions.includePaths` oder relativen Pfaden.