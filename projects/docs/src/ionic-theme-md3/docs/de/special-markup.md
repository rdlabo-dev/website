---
title: "Besonderes Markup"
sourceRevision: "3b31b2420e9692b0118e0915efec785864e0af1db4e105e64081048df9205c38"
---
# Besonderes Markup

Das meiste Ionic-Markup funktioniert unverändert. Die folgenden Kombinationen müssen ausdrücklich aktiviert werden und sind nützlich, wenn dasselbe Template auch `@rdlabo/ionic-theme-ios26` verwendet.

## Zweizeilige Elemente in eingerückten Listen

Platzieren Sie ein `ion-label` ohne Slot unmittelbar neben einem `ion-note` ohne Slot, um ein zweizeiliges Element darzustellen. Verwenden Sie stattdessen `slot="end"` für `ion-note`, wenn die normale Anordnung mit einer nachgestellten Notiz gewünscht ist.

```html preview
<ion-list inset="true">
  <ion-item-group>
    <ion-item>
      <ion-label>Network &amp; internet</ion-label>
      <ion-note>Mobile, Wi-Fi, hotspot</ion-note>
    </ion-item>
  </ion-item-group>
</ion-list>
```

## Eckige Schaltflächen

Fügen Sie `.button-square` hinzu, wenn eine Schaltfläche eckigere Kanten haben soll. Dies funktioniert sowohl für Textschaltflächen als auch für reine Symbolschaltflächen.

```html preview
<ion-button class="button-square" fill="solid">Continue</ion-button>
<ion-button class="button-square" fill="solid">
  <ion-icon name="add" slot="icon-only"></ion-icon>
</ion-button>
```

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

## Das Theme gezielt deaktivieren

Fügen Sie `.md3-disabled` zu einer einzelnen Ionic-Komponente hinzu, wenn diese die standardmäßige Material-Gestaltung von Ionic behalten soll.

```html preview
<ion-button fill="solid">MD3 theme</ion-button> <ion-button class="md3-disabled" fill="solid">Standard Ionic</ion-button>
```
