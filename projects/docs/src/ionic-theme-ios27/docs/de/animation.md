---
title: "Animation"
sourceRevision: 165b184fd4cd2f23315982e52bcd68ea1061be29e4fbe39be0f4029a50c2715d
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
   * Wenn das registrierte DOM-Element entfernt wird, etwa bei Seitennavigation,
   * müssen Geste und Animation zerstört werden. Dies entfernt auch die Ereignislistener.
   * Bei Bedarf können Sie sie erneut registrieren.
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
searchbar.showCancelButton = 'focus'; // 'always' und 'never' funktionieren ebenfalls
searchbar.cancelButtonIcon = closeOutline;
searchbar.clearIcon = closeOutline;
searchbar.cancelButtonText = 'Close search'; // zugänglicher Name der Symbolschaltfläche
const effect = supportSeachbarCancelButtonIcon(searchbar);

// Nach einer Änderung der JavaScript-Eigenschaft cancelButtonIcon effect.refresh() aufrufen.
// Beim Zerstören der Komponente/Seite:
// effect.destroy();
```

### Registrierung und Ausschlüsse

Registrieren Sie das Ionic-Element nach seiner Initialisierung, beispielsweise in Angulars `ngAfterViewInit`.

| Bedingung | Verhalten |
| --- | --- |
| Unterstützte Suchleiste im iOS-Modus | Behält Ionics Schaltfläche und Ereignishandler bei; `destroy()` stellt den Textinhalt wieder her. |
| MD-Modus, `searchbar-classic`, `ios-theme-disabled` oder `ios26-disabled` | Der Helfer wird nicht angewendet. |
| `animated` / `prefers-reduced-motion` | Werden von der CSS-Animation berücksichtigt. |
| CSS-Anpassung | `--background`, `--box-shadow`, `--border-radius` und `--cancel-button-color` bleiben verfügbar. |

### Schaltflächen zum Leeren und Abbrechen

| Schaltfläche | Ionic-Darstellungseinstellungen | Aktion |
| --- | --- | --- |
| Leeren | `clearIcon`, `showClearButton`, `--clear-button-color` | Leert die Eingabe und behält den Eingabefokus. |
| Abbrechen | `cancelButtonIcon`, `--cancel-button-color` | Beendet die Suche. |

Beide können gleichzeitig neben der Eingabe erscheinen. Setzen Sie `clearIcon` und `cancelButtonIcon` für eine einheitliche Darstellung auf dasselbe Symbol.

Beide externen Glasschaltflächen sind im Ruhezustand 44px groß und vergrößern sich beim Drücken. Reduzierte Bewegung deaktiviert die Skalierung. Die Schaltfläche zum Leeren erscheint außerhalb des Textfelds; Ionic stellt die Symbole bereit.

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
      <!-- ion-icon name wird dynamisch von der Animation gesetzt -->
      <ion-button fill="default"><ion-icon slot="icon-only"></ion-icon> </ion-button>
    </ion-buttons>
    <!-- Benutzerdefinierte Ereignisse wie `ionChange` setzen. -->
    <ion-searchbar aria-label="Search" (ionChange)="example($event)"></ion-searchbar>
  </ion-toolbar>
</ion-footer>
```

```ts
import { attachTabBarSearchable, TabBarSearchableType } from '@rdlabo/ionic-theme-ios27';
import type { TabBarSearchableFunction } from '@rdlabo/ionic-theme-ios27';

let searchableFun: TabBarSearchableFunction | undefined;
const initialize = () => {
  // attachTabBarSearchable ist zustandsbehaftet. Pro Seite initialisieren.
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
