---
title: "Spezielles Markup und Klassen"
sourceRevision: "65a973d7965cb24465fca814455c9cce1e4e500aa621532eeca227f0ba8ebecd"
---

# Spezielles Markup und Klassen

Das meiste Ionic-Markup funktioniert unverändert. Die folgenden Kombinationen werden vom Theme bereitgestellt und müssen ausdrücklich aktiviert werden.

## Primäre Absende-Schaltflächen

Gefüllte Absende-Schaltflächen verwenden den Kontrastwert der Ionic-Farbe für ihren Vordergrund. Die richtungsabhängige Gestaltung der Ränder folgt dem Erscheinungsbild hervorgehobener Schaltflächen in iOS 27 und benötigt keine zusätzliche Helligkeitsfarbe.

```html preview
<ion-button type="submit" color="primary">Submit</ion-button>
<ion-button class="button-submit" fill="solid" color="primary">Continue</ion-button>
```

Verwenden Sie `.button-submit`, wenn die Schaltfläche dieselbe Gestaltung benötigt, aber nicht `type="submit"` verwenden kann.

## Bevorzugte Overlay-Aktionen

Setzen Sie bei iOS-Alerts und Action Sheets `role: 'preferred'` für eine Schaltfläche, um einen gefüllten Hintergrund mit `--ion-color-primary` und Texte sowie Symbole mit `--ion-color-primary-contrast` zu erhalten. Während des Drückens verwendet der Hintergrund `--ion-color-primary-shade`. Dies ist eine Theme-Konvention auf Grundlage benutzerdefinierter Ionic-Schaltflächenrollen; die Aktion wird dadurch nicht automatisch ausgewählt oder ausgelöst. Beim Schließen wird die Rolle als `preferred` gemeldet.

```ts
buttons: [
  { text: 'Cancel', role: 'cancel' },
  { text: 'Continue', role: 'preferred' },
];
```

Wählen Sie die Rolle nach der Bedeutung der Aktion:

| Rolle | Darstellung und Verhalten |
| --- | --- |
| `preferred` | Gefüllte primäre Aktion; beim Schließen wird `preferred` gemeldet. Wählt oder aktiviert sie nicht automatisch. |
| Keine Rolle oder `default` | Normale Textfarbe. |
| `cancel` | Behält Ionics Abbruchverhalten. |
| `selected` | Behält den Auswahlzustand. |
| `destructive` | Verwendet `--ios-theme-destructive-color`. |
| `confirm` | Wird nicht als bevorzugt behandelt. Verwenden Sie `preferred` für eine empfohlene Aktion, nicht für jede Bestätigung. |

## Frei schwebende iPad-Sheets

Wählen Sie das Scrollverhalten des Sheets mit `expandToScroll`:

| Einstellung | iPad-Darstellung | Scrollen und Größenänderung |
| --- | --- | --- |
| `false` | Frei schwebende untere Ecken und 20px Abstand unten. | Der Inhalt scrollt am aktuellen Breakpoint; Ziehen am Griff ändert die Größe des Sheets. Ionic passt die sichtbare Seite an jedem Breakpoint an, damit CSS sie gestalten kann. |
| `true` (Standard) | Ionics am unteren Rand befestigtes Layout. | Scrollen erweitert das Sheet. |

## Position der Tab-Leiste

Wählen Sie eine Klasse auf einer iOS-`ion-tab-bar`, um die gesamte Leiste innerhalb ihrer Safe Area zu positionieren:

| Klasse | Position |
| --- | --- |
| `tab-bar-position-start` | Anfang der Leserichtung. |
| `tab-bar-position-center` | Mitte. |
| `tab-bar-position-end` | Ende der Leserichtung. |
| Keine | Bestehende Position unverändert. |

Alle drei Klassen unterstützen `slot="top"` und `slot="bottom"`, erhalten Breite und Druckanimation und berücksichtigen Start/Ende bei RTL.

```html
<ion-tab-bar slot="bottom" class="tab-bar-position-center">
  <ion-tab-button tab="home">Home</ion-tab-button>
  <ion-tab-button tab="settings">Settings</ion-tab-button>
</ion-tab-bar>
```

Diese Klassen verschieben kein separates `ion-fab`. Planen Sie bei der Wahl der Leistenposition Platz dafür ein.

## iPhone Duo unterstützen

Die Unterstützung für iPhone Duo einschließlich eigenständiger Vertical Bars ist ab Version 2.0.0 stabil.

Die Unterstützung für iPhone Duo — vertikale Systemleiste, Scharnierstellung und davon abhängiges Split-Pane-Layout — ist unabhängig vom iOS-27-Theme und der vollständigen Native UI. [Gerätelayout und Split Panes](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.2/packages/theme-ios27/docs/vertical-bars-layout.md) beschreibt die vollständige Einrichtung einschließlich Gerätelayout-Überwachung ohne Projektionslaufzeit.

Informationen zu Layoutklassen, geeigneten Bedienelementen und dem Aussehen nativer Schaltflächen finden Sie unter [Vertical Bars](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.2/packages/capacitor-native-ui/docs/vertical-bars.md).

Die eigenständige Einrichtung unter Beibehaltung Ihres Themes beschreibt [iPhone Duo mit Ihrem bestehenden Theme](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.2/packages/capacitor-native-ui/docs/ionic-vertical-bars.md).

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

Verwenden Sie für farbige Segmente die Ionic-Property `color`, beispielsweise `color="primary"` oder `color="secondary"`. Ionic verwendet die Grundfarbe der Palette für die leicht eingefärbte Bahn; Auswahlfläche und Beschriftungen bleiben neutral. Eine umgebende farbige Werkzeugleiste liefert nur dann Farben, wenn das Segment keine eigene Farbe hat. Das optionale bewegte Glas übernimmt die Farbe der Auswahlfläche. Benutzerdefinierte Ionic-Paletten funktionieren ohne zusätzliche Registrierung.

Fügen Sie `.segment-expand` hinzu, wenn die Segment-Schaltflächen die verfügbare Breite gleichmäßig aufteilen sollen. Bei Verwendung von `registerSegmentEffect` verändert die Klasse außerdem die Größe des Liquid Glass-Effekts.

### Segmentgröße und Verhalten beim Drücken

| Position | Mindesthöhe | Containerverhalten |
| --- | --- | --- |
| Im Inhalt | 32px | Kompakter, flacher Hintergrund und Indikator; äußere Grenzen bleiben fest. |
| Innerhalb von `ion-toolbar` | 48px | Glascontainer; äußerer Container skaliert beim Drücken. |
| `.segment-expand`, auch in einer Werkzeugleiste | 32px | Kompakter, flacher Hintergrund und Indikator; äußere Grenzen bleiben fest. |

Die optionale bewegliche Glaslinse ist unabhängig vom Containerhintergrund.

```html preview
<ion-segment class="segment-expand" value="new">
  <ion-segment-button value="new"><ion-label>New</ion-label></ion-segment-button>
  <ion-segment-button value="replied"><ion-label>Replied</ion-label></ion-segment-button>
</ion-segment>
```

## Klassische Suchleiste in einem Condense-Header

Das Theme gibt iOS-Suchleisten standardmäßig das Erscheinungsbild von iOS 27. Fügen Sie `.searchbar-classic` zu dem Suchfeld unter einem großen Titel in einem `ion-header` mit `collapse="condense"` hinzu. Es verwendet die herkömmliche gefüllte iOS-Darstellung und wird zusammen mit dem großen Titel eingeklappt, statt im fest positionierten Header zu verbleiben.

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

## Das Theme gezielt deaktivieren

Fügen Sie `.ios-theme-disabled` zu einer einzelnen Ionic-Komponente hinzu, wenn diese die standardmäßige iOS-Gestaltung von Ionic behalten soll.

`.ios26-disabled` ist veraltet, bleibt aber als Alias mit identischem Verhalten unterstützt. Verwenden Sie für neuen Code `.ios-theme-disabled`.

```html preview
<ion-button>iOS 27 theme</ion-button> <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

Das Hintergrundmodell eingerückter Listen beschreibt [`ion-item-group` verwenden](using-ion-item-group.md).