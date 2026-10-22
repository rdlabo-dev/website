---
title: "Theme-Migration"
sourceRevision: "244725aff2ee6a242f6a70f611c239f390ce7a3fc3a89e57aab181b8450af7d4"
---

# Theme-Migration

## Aufteilung in ein eigenes Native UI-Paket

Theme-Stile und gewöhnliche Theme-API-Importe werden weiterhin unterstützt. Wenn Sie native Bedienelemente bisher über dieses Paket verwendet haben: Die Einstiegspunkte `/native` und `/vertical-bars` wurden entfernt:

| Bisheriger Import | Ersatz |
| --- | --- |
| `@rdlabo/ionic-theme-ios27/native` | `@rdlabo/capacitor-native-ui` |
| `@rdlabo/ionic-theme-ios27/vertical-bars` | `@rdlabo/capacitor-native-ui/vertical-bars` |

Fügen Sie das native Paket als direkte Anwendungsabhängigkeit hinzu, aktualisieren Sie Importe, erstellen Sie die Web-Assets erneut und führen Sie `npx cap sync ios` aus. Die [Native UI-Migrationsanleitung](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.0/packages/capacitor-native-ui/docs/migration.md) beschreibt Starteinstellungen aus 1.2.1 und Änderungen am nativen Projekt. Reine Theme-Apps benötigen weder nativen Start noch Plugin-Einrichtung.

## Gerätelayout in 2.0

Installieren Sie Foldable im Rahmen der Standardeinrichtung neben dem Theme:

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

Ersetzen Sie die bisherigen Gerätelayout-APIs durch Foldable-Abonnements:

| Bisherige API | Ersatz |
| --- | --- |
| `DeviceLayout`, `HingeStatus` | `BarPlacement`, `FoldState` und `HingeStatus` aus `@erkamyaman/capacitor-foldable` |
| `getDeviceLayout()` | `Foldable.getBarPlacement()` und `Foldable.getFoldState()` |
| `deviceLayoutChange` | Listener für `barPlacementChange` und `foldStateChange` |
| Gerätelayout-Überwachung starten/beenden | Mit `addListener()` abonnieren; bei der Bereinigung jeden Listener entfernen |
| WebView-Eckenradius einmalig lesen | `getWebViewMetrics()` von Native UI |

Wenden Sie die Position mit `setVerticalBarsLayout` und die Faltstellung mit `applyFoldStateClasses` an; beide werden aus dem Theme importiert. Lesen Sie neben dem Abonnieren von Änderungen auch den Anfangszustand. Die aktuelle Einrichtung beschreiben [Gerätelayout und Split Panes](vertical-bars-layout.md#read-the-device-layout) und [Seitenleistenprojektion](../../capacitor-native-ui/docs/vertical-bars.md#use-with-capacitor-foldable). Die Paketinstallation allein abonniert keine Geräteereignisse und aktiviert keine Projektion.

## Vom iOS-26-Theme

Für eine App mit `@rdlabo/ionic-theme-ios26` empfiehlt sich, dieses Paket zu behalten und `@rdlabo/ionic-theme-ios27` hinzuzufügen. Die [adaptive Theme-Einrichtung](adaptive-themes.md) wählt iOS-27- oder iOS-26-Stile anhand der Browserfunktionen und lässt älteren Browsern Ionics standardmäßige iOS-Darstellung.

### 1. Das neue Paket hinzufügen

Behalten Sie das iOS-26-Paket bei und ergänzen Sie iOS 27. Das neue Theme benötigt `@ionic/core` ab 8.8.1 (Ionic 8 oder 9).

```bash
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
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

Ändern Sie den Animationsimport von `@rdlabo/ionic-theme-ios26` zu `@rdlabo/ionic-theme-ios27`; die vorhandene Konfiguration mit `isPlatform('ios')` kann bleiben. Siehe [iOS-27-Einrichtung](setup.md). Unbedingte Importe wenden die neuen Stile in jedem Browser mit Ionics iOS-Modus an.

## Benennung für iOS 27

Verwenden Sie im iOS-27-Zweig oder in einer reinen iOS-27-Anwendung `@rdlabo/ionic-theme-ios27`. Seine Stylesheets heißen `ionic-theme-ios27.scss` beziehungsweise `ionic-theme-ios27.css`, einschließlich der Varianten `-dark-always`, `-dark-system` und `-dark-class`. Behalten Sie bei adaptiver Konfiguration die iOS-26-Stylesheet-Namen im iOS-26-Zweig bei.

| Anpassung | Aktueller Name | Bisheriges Verhalten |
| --- | --- | --- |
| CSS-Variablen | `--ios-theme-*`, beispielsweise `--ios-theme-content-box-shadow-rgb` | Die entsprechenden `--ios26-*`-Namen bleiben veraltete Fallbacks. Sind beide gesetzt, gewinnt der aktuelle Name. |
| Klasse zum Deaktivieren des Themes | `ios-theme-disabled` | `ios26-disabled` bleibt ein veralteter Alias; migrieren Sie bestehendes Markup bei Gelegenheit. |

Verwenden Sie für neue Anpassungen die versionsunabhängigen Namen.

Die aktuellen Namen finden Sie unter [Spezielles Markup und Klassen](special-markup.md) und [Standardvariablen](../src/styles/default-variables.scss).

Frühere Migrationshinweise bleiben in der [iOS-26-Migrationsanleitung](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/migration) erhalten.

## Aussehen von Absende-Schaltflächen

Absende-Schaltflächen verwenden jetzt den Standard-Kontrastwert jeder Ionic-Farbe und eine richtungsabhängige iOS-27-Randgestaltung. Entfernen Sie die themespezifischen Helligkeitsvariablen.

```diff
  :root {
-  --ion-color-primary-brightness-rgb: 130, 255, 255;
-  --ion-color-primary-brightness: #96feff;
  }
```
