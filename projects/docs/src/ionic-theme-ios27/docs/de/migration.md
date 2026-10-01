---
title: "Migration"
sourceRevision: "faa1349bd2c073cb973ed6b69790c19a8aa4fd4a2a1bd085486ce08e8c60d099"
---
# Migration

## Übergangsadapter der Native UI Shell

Verwenden Sie `withNativeUIShellTransition()`, um Ihre bestehende Ionic-Navigationsanimation beizubehalten und gleichzeitig die Bedienelemente der Native UI Shell zu koordinieren.

- Wenn Sie bereits `iosTransitionAnimation` aus `@rdlabo/ionic-theme-ios27` importieren, behalten Sie die [Animationskonfiguration des Pakets](./iphone-duo-with-original-theme.md#use-this-package%27s-ios-animation) bei; eine Konfigurationsänderung ist nicht erforderlich. Sie verwendet jetzt intern den gemeinsamen Adapter. Fügen Sie keinen weiteren Wrapper hinzu.
- Wenn Sie die Standardanimation von Ionic ohne eine Option `navAnimation` verwenden, folgen Sie [Die Standardanimation von Ionic beibehalten](./iphone-duo-with-original-theme.md#keep-ionic%27s-default-animation). Das Beispiel wählt anhand des Übergangsmodus den normalen iOS- oder MD-Builder von Ionic.
- Wenn Sie eine eigene Navigationsanimation mit der Native UI Shell oder dem eigenständigen vertikalen Steuerbereich verwenden, umschließen Sie Ihren vorhandenen Builder bei der Ionic-Konfiguration:

```diff
+ import { withNativeUIShellTransition } from '@rdlabo/ionic-theme-ios27/vertical-bars';

  const ionicConfig = {
-   navAnimation: existingTransition,
+   navAnimation: withNativeUIShellTransition(existingTransition),
  };
```

Ergänzen Sie diese Option vor der Initialisierung in Ihrer vorhandenen Ionic-Konfiguration. Der Adapter erhält Effekte, Dauer und Easing der Animation und koordiniert gleichzeitig das Entfernen nativer Elemente, Wischfortschritt und Abbruch. Behalten Sie Ihre vorhandenen Theme-Stylesheet-Imports und den Start der Native UI Shell beziehungsweise des vertikalen Steuerbereichs bei.

Verwenden Sie den Adapter nur für Navigation. Lassen Sie Modal- und Popover-Animationen unverändert. Ihr Builder muss für jede Navigation eine neue `Animation` erzeugen, da Ionic sie danach zerstört. Behalten Sie Lebenszyklusereignisse für die Registrierung von Bedienelementen und Übergänge ohne Animation bei. Wenn der eigene Builder eine horizontale Zurück-Schaltfläche separat animiert, schließen Sie diesen Effekt bei aktivem `.ios-theme-vertical-bars` aus.

Einrichtung und unterstützten Umfang beschreibt [Ihre Navigationsanimation verbinden](./iphone-duo-with-original-theme.md#3.-connect-your-navigation-animation).

## Vom iOS-26-Theme

Für eine Anwendung mit `@rdlabo/ionic-theme-ios26` empfiehlt sich eine Migration, die dieses Paket beibehält und `@rdlabo/ionic-theme-ios27` ergänzt. Die [README-Konfiguration](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/readme#get-started) wählt iOS-27- oder iOS-26-Styles anhand der Browser-Fähigkeiten und belässt auf älteren Browsern die standardmäßige iOS-Darstellung von Ionic.

### 1. Das neue Paket hinzufügen

Behalten Sie das iOS-26-Paket bei und ergänzen Sie iOS 27. Das neue Theme benötigt `@ionic/core` ab 8.8.1 (Ionic 8 oder 9).

```bash
npm install @rdlabo/ionic-theme-ios27
```

### 2. Die Styles adaptiv gestalten

Ersetzen Sie unbedingte iOS-26-Imports in Ihrem globalen Sass-Stylesheet durch zwei einander ausschließende Zweige. Dieses Beispiel verwendet den klassenbasierten dunklen Modus:

```diff
+ @use 'sass:meta';
+
- @use '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect.scss';
+ @supports (overflow-anchor: auto) {
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/default-variables');
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27');
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class');
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect');
+ }
+
+ @supports (text-wrap: pretty) and (not (overflow-anchor: auto)) {
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/default-variables');
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26');
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class');
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect');
+ }
```

Behalten Sie die passende dunkle Ionic-Palette bei. Ersetzen Sie für einen systemgesteuerten oder dauerhaft dunklen Modus beide `-dark-class`-Imports durch die passende Variante. Wenn Sie `md-ion-list-inset` verwenden, laden Sie das Stylesheet des entsprechenden Pakets innerhalb jedes Zweigs. Browser ohne diese Funktionen behalten die Standardgestaltung von Ionic.

### 3. Die Animationen wechseln

Ersetzen Sie den iOS-26-Animationsimport und aktivieren Sie die iOS-27-Animationen anhand derselben Browser-Funktionen. Ermitteln Sie die Optionen vor der Initialisierung von Ionic:

```diff
- import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios26';
+ import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';
+
+ function loadIOSAnimations() {
+  if (typeof CSS === 'undefined') return {};
+  if (!CSS.supports('overflow-anchor: auto') && !CSS.supports('text-wrap: pretty')) return {};
+
+  return {
+    navAnimation: iosTransitionAnimation,
+    popoverEnter: popoverEnterAnimation,
+    popoverLeave: popoverLeaveAnimation,
+  };
+ }

  provideIonicAngular({
-  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
-  popoverEnter: isPlatform('ios') ? popoverEnterAnimation : undefined,
-  popoverLeave: isPlatform('ios') ? popoverLeaveAnimation : undefined,
+  ...(isPlatform('ios') ? loadIOSAnimations() : {}),
  });
```

Die iOS-27-Seitenübergangs- und Popover-Animationen werden für beide gestalteten Generationen verwendet. Ältere Browser behalten die Ionic-Standardwerte. Das Beispiel verwendet Angular; übergeben Sie dieselben Optionen an `setupIonicReact` von React oder `IonicVue` von Vue.

### 4. Anpassungen aktualisieren

Benennen Sie die von Ihrer Anwendung verwendeten Theme-Variablen und deaktivierenden Klassen um. Zum Beispiel:

```diff
  ion-content {
-  --ios26-content-box-shadow-rgb: 0, 0, 0;
+  --ios-theme-content-box-shadow-rgb: 0, 0, 0;
  }

- <ion-button class="ios26-disabled">Standard Ionic button</ion-button>
+ <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

Die alten Namen bleiben als veraltete Rückfalloptionen erhalten. Prüfen Sie die resultierenden Oberflächen im hellen und dunklen Modus auf den unterstützten Browsern.

### Nur iOS 27

Um vollständig auf iOS 27 umzustellen, entfernen Sie das iOS-26-Paket und ersetzen Sie dessen Stylesheet- und Animationsimports. Die Stylesheet-Änderungen lauten:

```diff
- @use '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/default-variables.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect.scss';
```

Ändern Sie den Animationsimport von `@rdlabo/ionic-theme-ios26` auf `@rdlabo/ionic-theme-ios27`. Die bestehende Konfiguration mit `isPlatform('ios')` kann bleiben. Siehe die [Konfiguration nur für iOS 27](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/readme#use-only-the-ios-27-theme) im README. Unbedingte Imports wenden die neuen Styles in jedem Browser mit Ionic-iOS-Modus an.

## Benennung für iOS 27

Verwenden Sie im iOS-27-Zweig oder in einer reinen iOS-27-Anwendung `@rdlabo/ionic-theme-ios27`. Seine Stylesheets heißen `ionic-theme-ios27.scss` beziehungsweise `ionic-theme-ios27.css`, einschließlich der Varianten `-dark-always`, `-dark-system` und `-dark-class`. Behalten Sie bei adaptiver Konfiguration die iOS-26-Stylesheet-Namen im iOS-26-Zweig bei.

Verwenden Sie die versionsunabhängigen CSS-Variablen `--ios-theme-*`. Die entsprechenden Variablen `--ios26-*` bleiben als veraltete Rückfalloptionen unterstützt. Sind beide gesetzt, hat der neue Name Vorrang. Verwenden Sie beispielsweise `--ios-theme-content-box-shadow-rgb` statt `--ios26-content-box-shadow-rgb`.

Verwenden Sie zum Deaktivieren des Themes die versionsunabhängige Klasse `ios-theme-disabled`. Die Klasse `ios26-disabled` bleibt als veralteter Alias unterstützt. Migrieren Sie vorhandenes Markup bei Gelegenheit.

Die aktuellen Namen finden Sie unter [Spezielles Markup und Klassen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/special-markup) und [Standardvariablen](../src/styles/default-variables.scss).

Frühere Migrationshinweise bleiben in der [iOS-26-Migrationsanleitung](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/migration) erhalten.

## Aussehen von Absende-Schaltflächen

Absende-Schaltflächen verwenden jetzt den Standard-Kontrastwert jeder Ionic-Farbe und eine richtungsabhängige iOS-27-Randgestaltung. Entfernen Sie die themespezifischen Helligkeitsvariablen.

```diff
  :root {
-  --ion-color-primary-brightness-rgb: 130, 255, 255;
-  --ion-color-primary-brightness: #96feff;
  }
```
