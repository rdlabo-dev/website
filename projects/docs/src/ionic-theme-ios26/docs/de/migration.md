---
title: "Migration"
sourceRevision: "5a4c28f9cae897fd53bc1ef9655924b939eda51ea08039d2645e53ba7c06ee2d"
---
# Migration

Prüfen Sie alle Abschnitte, die neuer als die derzeit installierte Version sind, in aufsteigender Reihenfolge. Führen Sie beispielsweise beim Wechsel von 1.x auf 9.0.0 zuerst die Migrationsschritte für 2.0.0 und 3.0.0 aus, bevor Sie 9.0.0 prüfen.

Jeder Abschnitt enthält ausschließlich Änderungen, die Anpassungen am Anwendungscode oder an der Konfiguration erfordern.

## Migration auf 9.2.0

### Versionsunabhängige Theme-Namen

Die Klasse zum Deaktivieren des Themes und die CSS-Variablen wurden umbenannt, um die Betriebssystemversion aus ihren öffentlichen Namen zu entfernen. Die alten Namen sind veraltet. Verwenden Sie in neuem Code die neuen Namen und migrieren Sie bestehende Anpassungen bei Gelegenheit.

| Veralteter Name | Neuer Name |
| --- | --- |
| `ios26-disabled` | `ios-theme-disabled` |
| `--ios26-content-box-shadow-rgb` | `--ios-theme-content-box-shadow-rgb` |
| `--ios26-*` (weitere Theme-Variablen) | `--ios-theme-*` (gleiches Suffix) |

```diff
- <ion-button class="ios26-disabled">Standard Ionic button</ion-button>
+ <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

```diff
ion-content {
-  --ios26-content-box-shadow-rgb: 255, 255, 255;
+  --ios-theme-content-box-shadow-rgb: 255, 255, 255;
}
```

`ios26-disabled` bleibt als Alias unterstützt. Alte CSS-Variablen bleiben als Rückfalloptionen unterstützt; sind beide gesetzt, hat die neue Variable Vorrang. Bestehende Anwendungen können deshalb während der Migration die veralteten Namen weiterverwenden. Paketnamen und Stylesheet-Pfade bleiben unverändert.

## Migration auf 9.0.0

Version 9 gleicht die Hauptversion des Themes an Ionic Framework 9 an. Sie führt keine zusätzlichen inkompatiblen Änderungen über die in früheren Migrationsabschnitten beschriebenen hinaus ein.

Ionic 8 und Ionic 9 bleiben beide unterstützt. Version 9 benötigt `@ionic/core >=8.8.1 <10`.

## Migration auf 3.0.0

### `.header-item-group` in `.item-group-header` umbenennen

Die Klasse für eine als Abschnittsüberschrift verwendete `ion-item-group` wurde umbenannt, um mit dem von ihr angepassten Element übereinzustimmen. Ersetzen Sie jedes Vorkommen von `.header-item-group` in Anwendungstemplates und Styles.

```diff
- <ion-item-group class="header-item-group">
+ <ion-item-group class="item-group-header">
    ...
  </ion-item-group>
```

Die alte Klasse wird vom Theme nicht mehr gestaltet. Diese Umbenennung gilt auch für Markup, das gemeinsam mit `@rdlabo/ionic-theme-md3` verwendet wird.

## Migration auf 2.0.0

### `iosTransitionAnimation` konfigurieren

Version 2 benötigt den Navigationsübergang des Pakets. Er folgt dem standardmäßigen Ionic-iOS-Übergang ohne das überholte Verhalten von `animateBackButton()`, das einen großen Titel in die Beschriftung der Zurück-Schaltfläche animierte.

```ts
import { isPlatform } from '@ionic/core'; // Oder @ionic/angular/standalone, @ionic/react, @ionic/vue
import { iosTransitionAnimation } from '@rdlabo/ionic-theme-ios26';

// Angular
provideIonicAngular({
  // ...
  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
});

// React
setupIonicReact({
  // ...
  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
});

// Vue
createApp(App).use(IonicVue, {
  // ...
  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
});
```

Mit diesem konfigurierten Übergang lässt sich `<ion-buttons><ion-back-button></ion-back-button></ion-buttons>` ohne die unerwünschten Übergangseffekte der alten Animation verwenden.

## Migration auf 1.0.0

### SCSS-Importpfade aktualisieren

Die Quelldateien wurden nach `src/styles` verschoben, als JavaScript-Dateien zum Paket hinzukamen.

```diff
- @import '@rdlabo/ionic-theme-ios26/src/default-variables.scss';
+ @import '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss';
```

Die Pfade des erzeugten CSS unter `dist` änderten sich nicht.

### `--ios26-color-background-rgb` umbenennen

```diff
  :root {
-   --ios26-color-background-rgb: 255, 255, 255;
+   --ios26-content-box-shadow-rgb: 255, 255, 255;
  }
```

### Helligkeitsvariablen umbenennen

Ersetzen Sie jede Variable `--ion-color-*-brightness-rgb` durch `--ion-color-*-brightness` und verwenden Sie einen Farbwert statt einer Liste von RGB-Kanälen.

```diff
  :root {
-   --ion-color-primary-brightness-rgb: 130, 255, 255;
+   --ion-color-primary-brightness: #96feff;
  }
```
