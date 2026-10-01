---
title: "Experimentelle Animation"
sourceRevision: "3a151b6af2683112d5aa2056c9bf094410a9c2ae7ee0da1a038704481d2917b4"
---
# Experimentelle Animation

Diese Hilfsfunktionen für Gesten und Animationen sind experimentell und optional. Das Theme funktioniert auch ohne sie.

## Glasscheibe mit `ion-tab-button` / `ion-segment-button`

Registrieren Sie ein Element `ion-tab-bar` oder `ion-segment`, um dessen Schaltflächen einen bewegten Auswahleffekt hinzuzufügen.

[![Glasscheiben-Animation auf ion-tab-button und ion-segment-button](https://i.gyazo.com/fafd726b520827f042c76b6c73abd81c.gif)](https://gyazo.com/fafd726b520827f042c76b6c73abd81c)

```ts
import { registerTabBarEffect, registerSegmentEffect } from '@rdlabo/ionic-theme-ios26';

/**
 * DOM-Elemente registrieren. Effekte werden mit Ionic Gesture und Ionic Animation angewendet.
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

## TabBarSearchable: Suche mit `ion-tab-bar` und `ion-fab-button`

Verwenden Sie die folgende Struktur innerhalb von `ion-tabs`, um eine Suchschaltfläche animiert in eine Suchwerkzeugleiste zu verwandeln.

[![TabBarSearchable-Animation, bei der sich die Suche von ion-fab-button in die Tab-Leiste erweitert](https://i.gyazo.com/06bc63f4a474f9f19f5b1d865f5c2a85.gif)](https://gyazo.com/06bc63f4a474f9f19f5b1d865f5c2a85)

```html
<ion-content>...</ion-content>
<ion-fab vertical="bottom" horizontal="end" slot="fixed">
  <ion-fab-button (click)="present($event)">
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
    <ion-searchbar (ionChange)="example($event)"></ion-searchbar>
  </ion-toolbar>
</ion-footer>
```

```ts
import { attachTabBarSearchable, TabBarSearchableType } from '@rdlabo/ionic-theme-ios26';
import type { TabBarSearchableFunction } from '@rdlabo/ionic-theme-ios26';

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
