---
title: "ion-item-group verwenden"
sourceRevision: "cf42c4c83670a9128eafecfa9ec8f91412ddc4b83902958f5ab7c1d75ceee683"
---

# `ion-item-group` in eingerückten Listen verwenden

Das MD3-Theme verwendet dieselbe Struktur eingerückter Listen wie `@rdlabo/ionic-theme-ios27`, sodass ein Template in beiden Ionic-Modi funktioniert. Umschließen Sie bei `ion-list` mit `inset="true"` die Einträge mit `ion-item-group` und lassen Sie `ion-list-header` außerhalb der Gruppe.

Die Beispiele verwenden frameworkunabhängiges Web-Component-Markup. Verwenden Sie in React oder Vue die entsprechende Komponenten- und Property-Syntax.

```html
<ion-list inset="true">
  <ion-list-header><ion-label>Connections</ion-label></ion-list-header>
  <ion-item-group>
    <ion-item>...</ion-item>
    <ion-item>...</ion-item>
  </ion-item-group>
</ion-list>
```

Für Listen ohne `inset="true"` ist kein Wrapper erforderlich.

[Die Listenstruktur mit ESLint prüfen](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/eslint).

## Warum der Wrapper erforderlich ist

Die gemeinsame Struktur trennt `ion-list-header` von der Fläche der Einträge. Dies entspricht dem iOS-27-Layout und erlaubt MD3, dasselbe Markup ohne plattformspezifische Templates zu gestalten.

Das Theme führt deshalb folgende Änderungen durch:

- Es macht den Hintergrund der eingerückten `ion-list` transparent;
- es weist `ion-item-group` die Fläche für die Elemente zu; und
- es belässt `ion-list-header` außerhalb dieser Fläche.

Zweizeilige Elemente und Gruppen mit Abschnittsüberschriften finden Sie unter [Spezielles Markup](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/special-markup).

## Größen und Anpassungen

Gruppierte MD-Zeilen haben eine Mindesthöhe von 56px beziehungsweise 72px mit Radio-Steuerelement. Zweizeilige Einträge verwenden 16px für den Titel, 14px für die Notiz und 16px Block-Padding; ihre Höhe wächst mit dem Inhalt. Titel nutzen dieselbe normale Zeilenhöhe wie gewöhnliche Einträge, sodass eine ergänzende Notiz den Abstand umgebrochener Titelzeilen nicht vergrößert. Eingerückte Listen mit Überschrift verwenden einen 56px hohen Abschnittskopf und 2px Abstände zwischen gruppierten Zeilen. Halten Sie die Überschrift außerhalb von `ion-item-group`.

Verwenden Sie Ionics öffentliche CSS-Variablen im nach dem Theme geladenen Anwendungsstylesheet:

```css
ion-item.app-setting {
  --min-height: 64px;
}
```

Eine Mindesthöhe schneidet langen Text nicht ab. Vermeiden Sie feste Zeilenhöhen oder Positionstransformationen zum Ausgleich einer bestimmten Geräteschrift. Ionics gewöhnliche nachgestellte Notiz (`slot="end"`) und die Label-APIs für Radio/Toggles behalten ihre Bedeutung. Die [CSS-Standardschrift](android-settings.md#default-font-css-only) respektiert Anwendungsschriften. Zeilentext folgt normalen Browsermetriken ohne Gerätepixel-Kompensation.
