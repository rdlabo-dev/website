---
title: "ion-item-group verwenden"
sourceRevision: "6480211a0fc46b565282cfe154aae64f22ff53e2e9dd7a1073bb54b5290131de"
---
# `ion-item-group` in eingerückten Listen verwenden

Das meiste Ionic-Markup funktioniert unverändert. Wenn eine `ion-list` mit `inset="true"` verwendet wird, umschließen Sie ihre Elemente mit `ion-item-group` und belassen Sie `ion-list-header` außerhalb der Gruppe.

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

[Die Listenstruktur mit ESLint prüfen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/eslint).

## Warum der Wrapper erforderlich ist

Ionic weist normalerweise `ion-list` den Hintergrund zu. Dadurch erscheint `ion-list-header` auf derselben Fläche wie die Listenelemente. Das iOS-27-Layout behandelt die Überschrift und die Elementfläche getrennt.

![Vergleich der Hintergründe eingerückter Listen zur Erklärung des erforderlichen ion-item-group-Wrappers](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.2.1/screenshots/why-ion-list-inset.png)

Das Theme führt deshalb folgende Änderungen durch:

- Es macht den Hintergrund der eingerückten `ion-list` transparent;
- es weist `ion-item-group` die Fläche für die Elemente zu; und
- es belässt `ion-list-header` außerhalb dieser Fläche.

## Dasselbe Markup für Material Design verwenden

`@rdlabo/ionic-theme-md3` unterstützt dasselbe gruppierte Markup, sodass sich eine Vorlage für beide Ionic-Modi verwenden lässt.

Wenn eine Anwendung dieses Paket ohne `@rdlabo/ionic-theme-md3` verwendet, importieren Sie das optionale Stylesheet, um dieselbe gruppierte Anordnung im Material-Modus anzuwenden:

```css
@import '@rdlabo/ionic-theme-ios27/dist/css/md-ion-list-inset.css';
```

Zweizeilige Elemente und Gruppen mit Abschnittsüberschriften finden Sie unter [Spezielles Markup und Klassen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/special-markup).
