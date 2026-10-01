---
title: "Animation"
sourceRevision: "f68a688e70ca4672d3a1e30ab2c1602d1453a7c376a0522e41254ec0927a4eb1"
---
# Animation

Diese Hilfsfunktionen für Gesten und Animationen sind produktionsreif und optional. Das Theme funktioniert auch ohne sie.

## Glasscheibe mit `ion-tab-button` / `ion-segment-button`

Registrieren Sie ein Element `ion-tab-bar` oder `ion-segment`, um dessen Schaltflächen einen bewegten Auswahleffekt hinzuzufügen.

`registerTabBarEffect` berücksichtigt `prefers-reduced-motion`, auch bei Änderungen während einer geöffneten Seite. Reduzierte Bewegung entfernt die bewegte Linse und die Tab-Skalierung, erhält jedoch die normale Ionic-Auswahl. Wird sie deaktiviert, kehrt der optionale Effekt zurück, bis die Registrierung zerstört wird.

`registerSegmentEffect` ergänzt lediglich eine visuelle Ebene. Ionic verwaltet weiterhin Auswahl, Ziehen, Tastaturbedienung und Ereignisse. Ein nicht ausgewähltes Segment beginnt die Linsenbewegung beim Loslassen. Ein ausgewähltes Segment vergrößert sich an Ort und Stelle, auch bei kurzem Antippen. Die Bewegung folgt Messungen der iOS-27-Darstellungsebene. Reduzierte Bewegung überspringt diesen optionalen Effekt; die native Glasbrechung wird mit CSS angenähert.

[![Glasscheiben-Animation auf ion-tab-button und ion-segment-button](https://i.gyazo.com/fafd726b520827f042c76b6c73abd81c.gif)](https://gyazo.com/fafd726b520827f042c76b6c73abd81c)

```ts
import { registerTabBarEffect, registerSegmentEffect } from '@rdlabo/ionic-theme-ios27';

/**
 * Initialisierte Ionic-DOM-Elemente registrieren.
 */
const tabBar = document.querySelector<HTMLElement>('ion-tab-bar');
const segment = document.querySelector<HTMLElement>('ion-segment');
const registeredTabBarEffect = tabBar ? registerTabBarEffect(tabBar) : undefined;
const registeredSegmentEffect = segment ? registerSegmentEffect(segment) : undefined;

const destroy = () => {
  /**
   * Wenn das registrierte DOM-Element entfernt wird, etwa durch Seitennavigation,
   * müssen Geste und Animation zerstört werden. Dadurch werden auch die Ereignis-Listener entfernt.
   * Bei Bedarf können sie erneut registriert werden.
   */
  registeredTabBarEffect?.destroy();
  registeredSegmentEffect?.destroy();
};
```

## Abbrechen-Symbol der Suchleiste

Ionic 8 und 9 rendern `cancelButtonIcon` nur im Material-Design-Modus. Registrieren Sie eine Suchleiste, um dieselbe Property im iOS-Modus zu verwenden. Ohne diese optionale Hilfsfunktion behält das Theme die Abbrechen-Schaltfläche mit Text von Ionic bei.

Dies ist eine vorübergehende Rendering-Anpassung. Sie soll entfernt werden, sobald die unterstützten Ionic-Versionen `cancelButtonIcon` im iOS-DOM rendern. Ist bereits ein Symbol vorhanden, wird nichts eingefügt. Tastaturbedienung, Fokus, Barrierefreiheitsattribute der Schaltfläche und Abbrechen-/Löschen-Verhalten werden nicht verändert; dafür bleibt Ionic zuständig. CSS-Design und Animationen sind unabhängig von der Hilfsfunktion und gelten auch für ein von Ionic selbst gerendertes Symbol.

```ts
import { supportSeachbarCancelButtonIcon } from '@rdlabo/ionic-theme-ios27';
import { closeOutline } from 'ionicons/icons';

const searchbar = document.querySelector<HTMLIonSearchbarElement>('ion-searchbar')!;
searchbar.animated = true;
searchbar.showCancelButton = 'focus'; // 'always' und 'never' sind ebenfalls möglich
searchbar.cancelButtonIcon = closeOutline;
searchbar.clearIcon = closeOutline;
searchbar.cancelButtonText = 'Close search'; // Zugänglicher Name des Icon-Buttons
const effect = supportSeachbarCancelButtonIcon(searchbar);

// Nach einer Änderung der JavaScript-Eigenschaft cancelButtonIcon effect.refresh() aufrufen.
// Beim Zerstören der Komponente oder Seite:
// effect.destroy();
```

Registrieren Sie die Funktion nach der Initialisierung des Ionic-Elements, beispielsweise in `ngAfterViewInit` von Angular. Sie erhält die Ionic-Schaltfläche und ihre Ereignishandler; `destroy()` stellt ihren Textinhalt wieder her. Sie gilt nicht für Suchleisten im MD-Modus oder mit `searchbar-classic`, `ios-theme-disabled` beziehungsweise `ios26-disabled`. Die CSS-Animation folgt `animated` und berücksichtigt `prefers-reduced-motion`. Normale CSS-Variablen der Suchleiste wie `--background`, `--box-shadow`, `--border-radius` und `--cancel-button-color` bleiben verfügbar.

Die Löschen-Schaltfläche verwendet dasselbe 44px-Glasdesign und erscheint neben der Eingabe. Sie verwendet `clearIcon`, `showClearButton` und `--clear-button-color` von Ionic. Beim Löschen bleibt die Eingabe fokussiert; Abbrechen beendet die Suche. Löschen und Abbrechen können gleichzeitig angezeigt werden. Setzen Sie `clearIcon` und `cancelButtonIcon` auf dasselbe Symbol, um beiden dasselbe Aussehen zu geben.

Beide externen Glasschaltflächen verwenden die zentrierte Druckfeder der iOS-27-Abbrechen-Schaltfläche, verkleinert auf den verfügbaren Innenabstand von 8px, ohne den Rahmen abzuschneiden: 44px im Ruhezustand, 57,2px beim Gedrückthalten und etwa 58,26px beim Überschwingen (nativ: 60px gehalten, Spitzenwert 61,29px). Druck- und Loslasskurven folgen UIKit-Messungen der Darstellungsebene im iPhone-18-Pro-Simulator. Reduzierte Bewegung deaktiviert die Skalierung. Dieses gemeinsame externe Löschdesign unterscheidet sich bewusst von der kleinen, nicht expandierenden Löschen-Schaltfläche im UIKit-Textfeld. Ionic liefert die Symbole; die Glyphenpixel sind daher nicht identisch mit SF Symbols.

Beim Gedrückthalten wird der Glashintergrund undurchsichtig und die Symboldeckkraft beträgt 0,55; seine konfigurierte Farbe bleibt erhalten. Verwenden Sie `--background-activated`, um den gedrückten Hintergrund unabhängig von `--background` anzupassen.

## TabBarSearchable: Suche mit `ion-tab-bar` und `ion-fab-button`

Verwenden Sie die folgende Struktur innerhalb von `ion-tabs`, um eine Suchschaltfläche animiert in eine Suchwerkzeugleiste zu verwandeln.

[![TabBarSearchable-Animation, bei der sich die Suche von ion-fab-button in die Tab-Leiste erweitert](https://i.gyazo.com/06bc63f4a474f9f19f5b1d865f5c2a85.gif)](https://gyazo.com/06bc63f4a474f9f19f5b1d865f5c2a85)

```html
<ion-content>...</ion-content>
<ion-fab vertical="bottom" horizontal="end" slot="fixed">
  <ion-fab-button aria-label="Search" (click)="present($event)">
    <ion-icon name="search"></ion-icon>
  </ion-fab-button>
</ion-fab>
<ion-footer [translucent]="true">
  <ion-toolbar>
    <ion-buttons slot="start">
      <!-- name von ion-icon wird durch die Animation dynamisch gesetzt -->
      <ion-button fill="default"><ion-icon slot="icon-only"></ion-icon> </ion-button>
    </ion-buttons>
    <!-- Benutzerdefinierte Ereignisse wie `ionChange`. -->
    <ion-searchbar aria-label="Search" (ionChange)="example($event)"></ion-searchbar>
  </ion-toolbar>
</ion-footer>
```

```ts
import { attachTabBarSearchable, TabBarSearchableType } from '@rdlabo/ionic-theme-ios27';
import type { TabBarSearchableFunction } from '@rdlabo/ionic-theme-ios27';

let searchableFun: TabBarSearchableFunction | undefined;
const initialize = () => {
  // attachTabBarSearchable hat Zustand und sollte pro Seite initialisiert werden.
  const tabBar = document.querySelector<HTMLElement>('ion-tab-bar');
  const fabButton = document.querySelector<HTMLElement>('ion-fab-button');
  const footer = document.querySelector<HTMLElement>('ion-footer');
  if (!tabBar || !fabButton || !footer) {
    return;
  }
  searchableFun = attachTabBarSearchable(tabBar, fabButton, footer);
};

const present = (event: Event) => {
  searchableFun!(event, TabBarSearchableType.Enter);
};

const dismiss = (event: Event) => {
  searchableFun!(event, TabBarSearchableType.Leave);
};
```
