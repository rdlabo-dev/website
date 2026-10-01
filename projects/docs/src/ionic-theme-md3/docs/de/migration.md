---
title: "Migration"
sourceRevision: "9f0427ecfff5a3db13e75a3c31fd6f20e6ed7bf04614497e5cd9b32392071207"
---
# Migration

Prüfen Sie alle Abschnitte, die neuer als die derzeit installierte Version sind, in aufsteigender Reihenfolge. Führen Sie beispielsweise beim Wechsel von 1.x auf 9.0.0 zuerst die Migrationsschritte für 2.0.0 aus, bevor Sie 9.0.0 prüfen.

Jeder Abschnitt enthält ausschließlich Änderungen, die Anpassungen am Anwendungscode oder an der Konfiguration erfordern.

## Migration auf 9.0.0

Version 9 gleicht die Hauptversion des Themes an Ionic Framework 9 an. Sie führt keine zusätzlichen inkompatiblen Änderungen über die in früheren Migrationsabschnitten beschriebenen hinaus ein.

Ionic 8 und Ionic 9 bleiben beide unterstützt. Version 9 benötigt `@ionic/core >=8.8.0 <10`.

## Migration auf 2.0.0

### `.header-item-group` in `.item-group-header` umbenennen

Die Klasse für eine als Abschnittsüberschrift verwendete `ion-item-group` wurde umbenannt, um mit dem von ihr angepassten Element übereinzustimmen. Ersetzen Sie jedes Vorkommen von `.header-item-group` in Anwendungstemplates und Styles.

```diff
- <ion-item-group class="header-item-group">
+ <ion-item-group class="item-group-header">
    ...
  </ion-item-group>
```

Die alte Klasse wird vom Theme nicht mehr gestaltet. Diese Umbenennung gilt auch für Markup, das gemeinsam mit `@rdlabo/ionic-theme-ios26` verwendet wird.
