---
title: "ion-item-group verwenden"
sourceRevision: "c85fe1c35a1c85f3e25a13ba978ea1c822d20f5ecbe117e0d4f1f86a4da3e0a3"
---
# `ion-item-group` in eingerückten Listen verwenden

Das MD3-Theme verwendet dieselbe Struktur eingerückter Listen wie `@rdlabo/ionic-theme-ios26`. Dadurch funktioniert ein Template über beide Ionic-Modi hinweg. Wenn eine `ion-list` mit `inset="true"` verwendet wird, umschließen Sie ihre Elemente mit `ion-item-group` und belassen Sie `ion-list-header` außerhalb der Gruppe.

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

Die gemeinsame Struktur trennt `ion-list-header` von der Elementfläche. Dies entspricht dem iOS-26-Layout und erlaubt MD3, dasselbe Markup ohne plattformspezifische Templates zu gestalten.

Das Theme führt deshalb folgende Änderungen durch:

- Es macht den Hintergrund der eingerückten `ion-list` transparent;
- es weist `ion-item-group` die Fläche für die Elemente zu; und
- es belässt `ion-list-header` außerhalb dieser Fläche.

Zweizeilige Elemente und Gruppen mit Abschnittsüberschriften finden Sie unter [Spezielles Markup](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/special-markup).
