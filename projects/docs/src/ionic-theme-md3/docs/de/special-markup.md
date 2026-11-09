---
title: "Besonderes Markup"
sourceRevision: "3728e6e1b03ebd988f193aafaf6d13fc5c05cd2337a964e7d3752d16f74d0d72"
---

# Besonderes Markup

Das meiste Ionic-Markup funktioniert unverändert. Gemeinsames Markup hat in `@rdlabo/ionic-theme-ios27` und diesem Theme dieselbe Bedeutung; die Darstellung folgt der aktiven Plattform. Android Settings ist die visuelle Referenz für MD3. Gemeinsames Markup fordert auf Android keine iOS-Glass-Darstellung an.

## Absende-Schaltflächen

Verwenden Sie `type="submit"` für eine echte Formularübermittlung. Ist eine Übermittlung über ein Formular unmöglich, kennzeichnet `type="button" class="button-submit"` die gleichwertige Aktion; die Klasse beschreibt nur das Aussehen, ohne abzusenden, zu validieren oder einen Handler einzurichten. Nutzen Sie für eine gefüllte primäre Aktion Ionics öffentliches `fill="solid"`. MD3 stellt solide Buttons bereits mit dem base/contrast-Paar der Palette dar; beide Formen sehen daher unter Android ohne zusätzlichen Effekt oder JavaScript-Helfer gleich aus.

```html preview
<ion-button type="submit" fill="solid" color="primary">Submit</ion-button>
<ion-button type="button" class="button-submit" fill="solid" color="primary">Continue</ion-button>
```

Explizite Ionic-Farben, der deaktivierte Zustand und `fill="clear"` / `fill="outline"` behalten ihre normale Bedeutung. Die Klasse erzwingt keine andere Füllung.

## Empfohlene Overlay-Aktionen

Verwenden Sie bei Alerts und Action Sheets entsprechend der iOS-27-Konvention `role: 'preferred'` für die empfohlene Aktion. Das Aussehen folgt dem Zweck des Overlays: Ein Alert nutzt eine gefüllte primary/on-primary-Aktion; ein Action Sheet behält dieselbe volle Zeilenbreite wie die übrigen Optionen und betont Text/Symbol mit primary-Farbe und mittlerer Schriftstärke. Die Cancel-Gruppe ist durch Abstand und Trennlinie von den Optionen getrennt. Farben stammen aus der Ionic-Palette, sofern keine optionalen Material-Rollen angegeben sind. Normale/standardmäßige Aktionen bleiben Textaktionen; `confirm` allein fordert keine Hervorhebung an. Abbrechen, Auswählen und destruktive Rollen bleiben von der Empfehlung getrennt.

```ts
buttons: [
  { text: 'Cancel', role: 'cancel' },
  { text: 'Continue', role: 'preferred' },
];
```

Diese benutzerdefinierte Ionic-Rolle wählt oder startet keine Aktion automatisch. Der Button-Handler läuft normal, und die Schließmeldung enthält `preferred`; behandeln Sie diese Rolle ausdrücklich, wenn die Anwendung Schließergebnisse auswertet. `cancel` behält Ionics Abbruchverhalten bei. Ersetzen Sie `cancel`, `selected` oder `destructive` nicht allein zur Farbänderung durch `preferred`.

## Zweizeilige Elemente in eingerückten Listen

Platzieren Sie ein `ion-label` ohne Slot direkt neben einem `ion-note` ohne Slot, um einen zweizeiligen Eintrag darzustellen. Umschließen Sie eingerückte Einträge mit `ion-item-group` und halten Sie `ion-list-header` außerhalb. Verwenden Sie `slot="end"` auf `ion-note` für die normale nachgestellte Notiz.

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

## Android Settings-Steuerelemente

Der Standard-Toggle enthält keine Symbole. Ionics `enableOnOffLabels` bleibt verfügbar, wenn die Anwendung ausdrücklich Beschriftungen anfordert:

```html preview
<ion-list inset="true">
  <ion-item-group>
    <ion-item><ion-toggle justify="space-between">Notifications</ion-toggle></ion-item>
    <ion-item>
      <ion-toggle justify="space-between" enable-on-off-labels="true">Notifications with on/off labels</ion-toggle>
    </ion-item>
  </ion-item-group>
</ion-list>
```

Das Theme verwendet eine 52×28px große Spur und einen 20px großen Schieber. Gruppierte Zeilen haben eine Mindesthöhe von 56px beziehungsweise 72px für Radio-Zeilen; längerer Inhalt darf wachsen. Verwenden Sie Ionics öffentliche CSS-Variablen zur Größenanpassung und behalten Sie die [gemeinsame Listenstruktur](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/using-ion-item-group) bei.

Das Haupttheme liefert eine reine CSS-Standardschrift für MD: lokales Google Sans Flex, falls verfügbar, sonst normale Ersatzschriften. Das `--ion-font-family` der Anwendung hat Vorrang. Zurück-Symbole verwaltet Ionic; das Theme enthält keinen Ersatz. Standardschriften, Ersatzschriften und Anwendungsanpassungen beschreibt [Android Settings-Darstellung](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/android-settings). Lesen Sie beim Aktualisieren von Apps mit eigenen Abmessungen die [Migrationsanleitung](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/migration). Diese Optionen bewahren die Bedeutung der Ionic-Palette und explizite Komponenteneigenschaften.

## Plattformspezifische Erweiterungen

Die gemeinsame Struktur funktioniert ohne plattformspezifische Templates. Die iOS-spezifischen `segment-style-glass`, `searchbar-classic`, schwebenden iPad-Sheets und iOS-Tabbar-Positionierungen sind keine Android-Darstellungsanforderungen. MD3 behält Ionics Verhalten für Segmente, Suchleisten, Modals und Tab-Leisten bei. `.button-square` ist eine optionale MD3-Formerweiterung, keine erforderliche gemeinsame Markup-Konvention.

## Das Theme gezielt deaktivieren

Fügen Sie `.md3-disabled` zu einer einzelnen Ionic-Komponente hinzu, wenn diese die standardmäßige Material-Gestaltung von Ionic behalten soll.

```html preview
<ion-button fill="solid">MD3 theme</ion-button> <ion-button class="md3-disabled" fill="solid">Standard Ionic</ion-button>
```
