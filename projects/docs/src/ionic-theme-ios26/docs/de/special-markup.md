---
title: "Besonderes Markup und Klassen"
sourceRevision: "1cf00d7a1d33ef40392eeef516073a5372ddb011225b1cb8bf71da061f8cbded"
---
# Besonderes Markup und Klassen

Das meiste Ionic-Markup funktioniert unverändert. Die folgenden Kombinationen werden vom Theme bereitgestellt und müssen ausdrücklich aktiviert werden.

## Primäre Absende-Schaltflächen

Gefüllte primäre Absende-Schaltflächen verwenden `--ion-color-primary-brightness` für Vordergrund und Randgestaltung. Definieren Sie einen Wert mit ausreichendem Kontrast zu Ihrer Primärfarbe.

```css
:root {
  --ion-color-primary-brightness: #96feff;
}
```

```html preview
<ion-button type="submit" color="primary">Submit</ion-button>
<ion-button class="button-submit" fill="solid" color="primary">Continue</ion-button>
```

Verwenden Sie `.button-submit`, wenn die Schaltfläche dieselbe Gestaltung benötigt, aber nicht `type="submit"` verwenden kann.

## Bevorzugte Overlay-Aktionen

Setzen Sie bei iOS-Alerts und Action Sheets `role: 'preferred'` für eine Schaltfläche, um einen gefüllten Hintergrund mit `--ion-color-primary` und Texte sowie Symbole mit `--ion-color-primary-contrast` zu erhalten. Während des Drückens verwendet der Hintergrund `--ion-color-primary-shade`. Dies ist eine Theme-Konvention auf Grundlage benutzerdefinierter Ionic-Schaltflächenrollen; die Aktion wird dadurch nicht automatisch ausgewählt oder ausgelöst. Beim Schließen wird die Rolle als `preferred` gemeldet.

```ts
const buttons = [
  { text: 'Cancel', role: 'cancel' },
  { text: 'Continue', role: 'preferred' },
];
```

Schaltflächen ohne Rolle oder mit `default` behalten die normale Textfarbe. `cancel` behält das Abbruchverhalten von Ionic, `selected` bleibt ein Auswahlzustand, und `destructive` verwendet `--ios-theme-destructive-color`. Eine vorhandene Rolle `confirm` wird nicht als bevorzugt behandelt. Verwenden Sie `preferred` für die empfohlene Aktion, nicht einfach für jede Aktion, die eine Auswahl bestätigt.

Das Theme folgt der zentrierten, unverankerten `UIAlertController`-Darstellung, die unter iOS 26.1/26.5 vermessen wurde. Verwenden Sie `ion-popover` für ein verankertes Menü. `ios-theme-disabled` / `ios26-disabled` erhalten die ursprüngliche Ionic-Darstellung. Lange Inhalte bleiben scrollbar. Optionale vermessene Animation-Builder beschreibt [Experimentelle Animation](./experimental-animation.md). CSS allein ersetzt die Eintritts-/Austrittsanimationen von Ionic nicht.

## Position der Tab-Leiste

Fügen Sie `tab-bar-position-start`, `tab-bar-position-center` oder `tab-bar-position-end` zu einer iOS-`ion-tab-bar` hinzu, um die gesamte Leiste innerhalb ihrer Safe Area zu positionieren. Diese Klassen funktionieren mit `slot="top"` und `slot="bottom"` und erhalten die Leistenbreite und Druckanimation. Anfang und Ende folgen der Textrichtung und werden in RTL vertauscht. Ohne Klasse verwendet das Theme seine Standardposition.

```html
<ion-tab-bar slot="bottom" class="tab-bar-position-center">
  <ion-tab-button tab="home">Home</ion-tab-button>
  <ion-tab-button tab="settings">Settings</ion-tab-button>
</ion-tab-bar>
```

Diese Klassen verschieben kein separates `ion-fab`. Planen Sie bei der Wahl der Leistenposition Platz dafür ein.

## Zweizeilige Elemente in eingerückten Listen

Platzieren Sie ein `ion-label` ohne Slot unmittelbar neben einem `ion-note` ohne Slot, um ein zweizeiliges Element darzustellen. Umschließen Sie die Elemente bei Verwendung des iOS-Hintergrunds für eingerückte Listen mit `ion-item-group`; belassen Sie `ion-list-header` außerhalb der Gruppe.

```html preview
<ion-list inset="true">
  <ion-list-header>
    <ion-label>Connections</ion-label>
  </ion-list-header>
  <ion-item-group>
    <ion-item>
      <ion-label>Network &amp; internet</ion-label>
      <ion-note>Mobile, Wi-Fi, hotspot</ion-note>
    </ion-item>
  </ion-item-group>
</ion-list>
```

Verwenden Sie stattdessen `slot="end"` für `ion-note`, wenn die normale Anordnung mit einer nachgestellten Notiz gewünscht ist.

## Abschnittsüberschriften in eingerückten Listen

Fügen Sie `.item-group-header` zu einer `ion-item-group` hinzu, um das zentrierte Symbol mit Titel und Beschreibung zu erzeugen, das am Anfang der Komponenten-Demoseiten verwendet wird.

Dies ist eine einleitende Gruppe. Platzieren Sie gewöhnliche Listenelemente in einer separaten, nachfolgenden `ion-item-group`.

```html preview
<ion-list inset="true">
  <ion-item-group class="item-group-header">
    <ion-item>
      <ion-label>
        <ion-icon name="list" style="background: var(--ion-color-primary)"></ion-icon>
        <h2>Lists</h2>
        <ion-text>Inset-list examples</ion-text>
      </ion-label>
    </ion-item>
  </ion-item-group>
  <ion-item-group>
    <ion-item><ion-label>First item</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

## Segmente über die gesamte Breite

Fügen Sie `.segment-style-glass` hinzu, um einem Segment dieselbe Glasfläche und dieselbe Gestaltung der Auswahlmarkierung wie der Tab-Leiste zu geben. Die Klasse erhält die vorhandenen Segmentabmessungen und Textfarben, unterstützt scrollbare Segmente und berücksichtigt die öffentliche Ionic-Property `--background`.

```html
<ion-segment class="segment-style-glass" value="available">
  <ion-segment-button value="available">Available</ion-segment-button>
  <ion-segment-button value="away">Away</ion-segment-button>
</ion-segment>
```

Fügen Sie `.segment-expand` hinzu, wenn die Segment-Schaltflächen die verfügbare Breite gleichmäßig aufteilen sollen. Bei Verwendung von `registerSegmentEffect` verändert die Klasse außerdem die Größe des Liquid-Glass-Effekts.

```html preview
<ion-segment class="segment-expand" value="new">
  <ion-segment-button value="new"><ion-label>New</ion-label></ion-segment-button>
  <ion-segment-button value="replied"><ion-label>Replied</ion-label></ion-segment-button>
</ion-segment>
```

## Klassische Suchleiste in einem Condense-Header

Das Theme gibt iOS-Suchleisten standardmäßig das Erscheinungsbild von iOS 26. Fügen Sie `.searchbar-classic` zum Suchfeld unter einem großen Titel in einem `ion-header` mit `collapse="condense"` hinzu. Es verwendet die herkömmliche gefüllte iOS-Darstellung und wird zusammen mit dem großen Titel eingeklappt, statt im fest positionierten Header zu verbleiben.

Platzieren Sie es in einer Werkzeugleiste mit einer Farbe, beispielsweise `color="light"`. Der klassische Hintergrund wird aus dem Kontrastwert dieser Farbe abgeleitet.

Das Beispiel verwendet die standardmäßige einklappbare Struktur für große Titel von Ionic. Scrollen Sie die Vorschau, um den großen Titel einzuklappen und den fest positionierten Header anzuzeigen.

```html preview
<div class="ion-page">
  <ion-header translucent="true">
    <ion-toolbar color="light">
      <ion-title>Search</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light" fullscreen="true">
    <ion-header collapse="condense">
      <ion-toolbar color="light">
        <ion-title size="large">Search</ion-title>
      </ion-toolbar>
      <ion-toolbar color="light">
        <ion-searchbar class="searchbar-classic" placeholder="Filter results"></ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-list inset="true">
      <ion-item-group>
        <ion-item><ion-label>Recent item 1</ion-label></ion-item>
        <ion-item><ion-label>Recent item 2</ion-label></ion-item>
        <ion-item><ion-label>Recent item 3</ion-label></ion-item>
        <ion-item><ion-label>Recent item 4</ion-label></ion-item>
        <ion-item><ion-label>Recent item 5</ion-label></ion-item>
        <ion-item><ion-label>Recent item 6</ion-label></ion-item>
        <ion-item><ion-label>Recent item 7</ion-label></ion-item>
        <ion-item><ion-label>Recent item 8</ion-label></ion-item>
        <ion-item><ion-label>Recent item 9</ion-label></ion-item>
        <ion-item><ion-label>Recent item 10</ion-label></ion-item>
      </ion-item-group>
    </ion-list>
  </ion-content>
</div>
```

Der Wrapper `.ion-page` lässt diese eingebettete Vorschau wie eine vollständige geroutete Seite funktionieren. Eine Anwendung mit `ion-router-outlet` erhält diesen Seitencontainer normalerweise automatisch. Die eingerückte Liste und ihre Elemente liefern lediglich genügend Inhalt zur Demonstration des Scrollens; `.searchbar-classic` benötigt sie nicht.

## Werkzeugleisten mit Suchleiste

Fügen Sie `.toolbar-searchbar` hinzu, wenn eine `ion-toolbar` eine Suchleiste mit Schaltflächen am Anfang oder Ende kombiniert. Die Klasse zentriert die Bedienelemente in den Slots und passt die Abstände um das Suchfeld an.

```html preview
<ion-toolbar class="toolbar-searchbar">
  <ion-buttons slot="start">
    <ion-button>Cancel</ion-button>
  </ion-buttons>
  <ion-searchbar></ion-searchbar>
</ion-toolbar>
```

## Das Theme gezielt deaktivieren

Fügen Sie `.ios-theme-disabled` zu einer einzelnen Ionic-Komponente hinzu, wenn diese die standardmäßige iOS-Gestaltung von Ionic behalten soll.

```html preview
<ion-button>iOS 26 theme</ion-button> <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

Das Hintergrundmodell eingerückter Listen beschreibt [Verwendung von `ion-item-group`](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/using-ion-item-group).

`ios26-disabled` bleibt als veralteter Alias für `ios-theme-disabled` unterstützt.
