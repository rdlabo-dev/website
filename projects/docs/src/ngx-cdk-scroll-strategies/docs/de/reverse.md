---
title: "Umgekehrtes Scrollen"
sourceRevision: "ba7c1bf9f5146241ac971c0fb431e8fa3408816803cef56ec91ed2b0bde3a274"
---
Rufen Sie dies nach der [Installation](../README.md#installation) auf.

> Übernehmen Sie das Datenmodell, das `dynamicSize`-Computed, `trackBy` und die Viewport-Imports aus der [einfachen Verwendung](./simple.md). Diese Seite ergänzt CSS für die umgekehrte Anordnung und `[isReverse]="true"` für eine Chat-Liste.

- Demo: https://rdlabo-ionic-angular-library.netlify.app/main/scroll-strategies/reverse
- Quellcode: https://github.com/rdlabo-dev/ionic-angular-library/tree/v22.0.3/projects/demo/src/app/scroll-strategies/pages/scroll-reverse

Fügen Sie für umgekehrtes Scrollen die Direktive `isReverse` zum Element `cdk-virtual-scroll-viewport` hinzu.

```html
<cdk-virtual-scroll-viewport
  [itemDynamicSizes]="dynamicSize()"
  [isReverse]="true"
  minBufferPx="900"
  maxBufferPx="1350"
>
  <div class="reverse-items">
    <div
      *cdkVirtualFor="let item of items(); trackBy: trackByFn"
      class="dynamic-item"
      [style.height.px]="item.itemSize"
    >
      itemSize: {{ item.itemSize }}
    </div>
  </div>
</cdk-virtual-scroll-viewport>
```

Ergänzen Sie das CSS für `cdk-virtual-scroll-viewport.reverse-scroll` in einer globalen CSS-Datei wie `styles.css`.

```css
cdk-virtual-scroll-viewport {
  width: 100%;
  height: 320px;

  /* Die Klasse .reverse-scroll wird von dieser Direktive hinzugefügt. */
  &.reverse-scroll {
    display: flex;
    flex-direction: column-reverse;

    .cdk-virtual-scroll-content-wrapper {
      top: auto;
      bottom: 0;
    }
  }
}
```

Fügen Sie außerdem einen Wrapper für die Elemente hinzu. Die Klasse `div.reverse-items` ist ein Beispiel; die konkrete Gestaltung können Sie selbst wählen.

```css
div.reverse-items {
  height: 100%;
  display: flex;
  flex-direction: column-reverse;

  position: relative;
  bottom: 0;
}
```

**Beim umgekehrten Scrollen funktioniert measureScrollOffset von CdkVirtualScrollViewport nicht. Verwenden Sie stattdessen scrollOffset dieser Direktive.**
https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.3/projects/scroll-strategies/src/lib/dynamic-size-virtual-scroll-strategy.ts

Die umgekehrte Anordnung verwendet negative native `scrollTop`-Werte. `scrollToIndex()` nimmt wie üblich einen logischen Elementindex entgegen und wandelt dessen kumulierten Versatz intern in diese native Koordinate um.

### Optional

Dieses Paket enthält einen Hilfsdienst, der die Entwicklung mit Virtual Scroll vereinfacht.

```ts
import { DynamicSizeVirtualScrollService } from '@rdlabo/ngx-cdk-scroll-strategies';
```

Weitere Informationen: https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.3/projects/scroll-strategies/src/lib/dynamic-size-virtual-scroll.service.ts
