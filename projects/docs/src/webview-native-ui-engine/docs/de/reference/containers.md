---
title: "Unterstützte Projektionscontainer"
sourceRevision: "2b43932d67b363d7b94387fa7a9040a0c925ee4962f62b0c30bd2debf064a431"
---

# Unterstützte Projektionscontainer

Wählen Sie das vorhandene DOM-Element, das den vorgesehenen Ort und die Web-Ebene der nativen Fläche belegt. Diese Tabellen gelten für `projectionSelector` und das an `createWebProjectionScope` übergebene Element, sowohl für Capacitor als auch für Cordova.

**⭕️** bedeutet, dass das Element unter den genannten Bedingungen das projizierte Bild der Engine aufnehmen kann. **❌** bedeutet, dass es kein unterstütztes direktes Ziel ist; wählen Sie stattdessen einen geeigneten umschließenden Container. Dies ist ein Vertrag für die DOM-Darstellung, keine Zusage, dass die Engine das native Bedienelement, die Interaktionen oder Animationen dieser Komponente implementiert. Die Eignung für native Aufnahmen ist eine separate Voraussetzung.

## Gemeinsame Anforderungen

- Stellen Sie ein verbundenes HTML-Element mit einer nicht fragmentierten Layoutbox mit einer Größe größer als null bereit. Größe, Platzierung und Ebene liegen bei der Anwendung. Verwenden Sie für Inline-Hosts `display: inline-block` oder `block` und geben Sie ihnen die vorgesehenen Abmessungen.
- `projectionSelector` verwendet CSS-Selektoren des Dokuments (ID, Klasse, Attribut oder Nachfahre). Er muss genau ein Element treffen und dringt nicht in Shadow DOM ein. Ein fehlendes Element kann später erstellt werden; bei keinem oder mehreren Treffern bleibt Native ausgeblendet.
- Das vorgehaltene Bild wird in den offenen ShadowRoot des Elements eingefügt, andernfalls als Kind im Light DOM. Geschlossene Shadow-Inhalte müssen die Sichtbarkeit des Hosts erben und einen Slot bereitstellen, der das Bild anzeigen kann.
- Ein Overlay, eingeklapptes Element oder eine inaktive Seite ist nur geeignet, solange eine sichtbare Layoutbox vorhanden ist. Erzwingen Sie nicht die Darstellung verborgener Konfigurationselemente, nur um sie als Ziele zu nutzen.
- Beschneidung, Deckkraft, Transformationen und Filter des Hosts und seiner Vorfahren wirken weiterhin auf das Bild. Das Bild ist nicht interaktiv und friert das aufgenommene Erscheinungsbild ein. Siehe die [Projektionsreferenz](projection.md#dom-and-native-surface-requirements) für native Aufnahmegrenzen und den [Renderer-Leitfaden](../advanced/web-projection.md) für Ausschlüsse von DOM-Mutationsbeobachtern.

## HTML-Container

| Containerelement | Beispiel | Unterstützung | Hinweise |
| --------------------------------------------------------- | -------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Blockcontainer | `div`, `section`, `nav`, `article`, `header`, `footer` | ⭕️ | Geben Sie dem Container die vorgesehene Größe und Web-Ebene. |
| Inline-Container | `span`, `a`, `label` | ⭕️ | Verwenden Sie `inline-block` oder `block`; umgebrochener Inline-Text ist keine einzelne Projektionsfläche. |
| Schaltfläche | `button` | ⭕️ | Die ursprüngliche Schaltfläche, Listener und Werte bleiben erhalten; das Bild empfängt keine Klicks. |
| Eigenes Element ohne Shadow DOM | `native-ad` | ⭕️ | Stellen Sie eine Layoutbox bereit und erlauben Sie ein Bild als Kind. |
| Eigenes Element mit offenem Shadow DOM | `native-control` | ⭕️ | Die Engine fügt das Bild direkt in die offene Wurzel ein und blendet während der Projektion Fallback-Inhalte aus. |
| Eigenes Element mit geschlossenem Shadow DOM und geeignetem Slot | `native-control` mit einem Standardslot | ⭕️ | Das Bild muss im Slot sichtbar dargestellt werden; interne Inhalte müssen die Sichtbarkeit des Hosts erben. Die Engine kann innerhalb der geschlossenen Wurzel keine Regeln erzwingen. |
| Eigenes Element mit unzugänglichem Darstellungsinhalt | Geschlossene Wurzel ohne geeigneten Slot | ❌ | Verwenden Sie einen äußeren Container; ein Bild im Light DOM würde nicht dargestellt. |
| Natives Formularsteuerelement | `select`, `input`, `textarea` | ❌ | Direkte Gültigkeitsbereiche werden abgelehnt. Umschließen Sie das Steuerelement; Wert und Listener bleiben erhalten. |
| Ersetztes Medium oder Zeichenfläche | `img`, `canvas`, `video`, `audio`, `iframe`, `embed`, `object` | ❌ | Direkte Gültigkeitsbereiche werden abgelehnt. Verwenden Sie einen Container um den Inhalt. |
| Leeres Element | `br`, `hr`, `area`, `base`, `link`, `meta`, `source`, `track`, `wbr` | ❌ | Direkte Gültigkeitsbereiche werden abgelehnt; diese Elemente können kein projiziertes Bild enthalten. |
| Konfigurationselement oder Element mit besonderer Kinddarstellung | `option`, `optgroup`, `template` | ❌ | Das Bestehen einer HTMLElement-Prüfung macht ein Bild als Kind nicht darstellbar. Verwenden Sie einen normalen Container. |
| Nicht-HTML-Element | `svg`, SVG `g`, MathML `math` | ❌ | Verwenden Sie einen HTML-Wrapper, nicht den SVG-/MathML-Knoten selbst. |
| Element ohne nutzbare Box | `display: none`, `display: contents`, Größe null | ❌ | Wählen Sie einen sichtbaren Container mit den vorgesehenen Abmessungen. |
| Pseudoelement | `::before`, `::after` | ❌ | Keine DOM-Elemente und nicht als Gültigkeitsbereich auswählbar. Beide bleiben für das CSS der Anwendung verfügbar. |

## Ionic-Elemente

Das folgende Inventar umfasst jede Komponente im [Ionic-API-Index](https://ionicframework.com/docs/api), mit einer Zeile pro Element. Es wurde gegen `@ionic/core` **9.0.9** geprüft; `ion-icon` wird von Ionicons bereitgestellt. Die letzte Tabelle führt die zusätzliche interne Komponente dieser Version separat auf.

Eigene Ionic-Elemente sind nicht die ähnlich benannten HTML-Elemente: `ion-select`, `ion-input`, `ion-textarea` und `ion-img` können Bildcontainer sein, die HTML-Elemente `select`, `input`, `textarea` und `img` hingegen nicht. Jedes ⭕️ unten setzt weiterhin die obigen gemeinsamen Layoutbedingungen und den üblichen Ionic-Elternkontext der Komponente voraus.

### Schaltflächen und Werkzeugleiste

| Containerelement | Beispiel | Unterstützung | Hinweise |
| ------------------- | ------------------------------- | ------- | ------------------------------------------------------------------------------------ |
| `ion-button` | `ion-button#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-buttons` | `ion-buttons#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-back-button` | `ion-back-button#native-slot` | ⭕️ | Benötigt ein Rücksprungziel oder defaultHref, um sichtbar zu bleiben. |
| `ion-menu-button` | `ion-menu-button#native-slot` | ⭕️ | Benötigt ein verfügbares Menü oder autoHide=false. |
| `ion-toolbar` | `ion-toolbar#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-header` | `ion-header#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-footer` | `ion-footer#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-title` | `ion-title#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-ripple-effect` | `ion-ripple-effect#native-slot` | ⭕️ | Eine aufgenommene dekorative Fläche, keine Schaltfläche. Bevorzugen Sie für ein Bedienelement die zugehörige Schaltfläche. |

### Formulare und Auswahl

| Containerelement | Beispiel | Unterstützung | Hinweise |
| --------------------------- | --------------------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `ion-checkbox` | `ion-checkbox#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-input` | `ion-input#native-slot` | ⭕️ | Der Host wird unterstützt; sein internes HTML-input ist kein Ziel. |
| `ion-input-otp` | `ion-input-otp#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-input-password-toggle` | `ion-input-password-toggle#native-slot` | ⭕️ | Innerhalb von ion-input verwenden; geben Sie dem Host eine inline-block-Box, um Versätze durch die Inline-Grundlinie zu vermeiden. |
| `ion-textarea` | `ion-textarea#native-slot` | ⭕️ | Der Host wird unterstützt; sein internes HTML-textarea ist kein Ziel. |
| `ion-radio` | `ion-radio#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-radio-group` | `ion-radio-group#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-range` | `ion-range#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-searchbar` | `ion-searchbar#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-select` | `ion-select#native-slot` | ⭕️ | Der Host wird unterstützt. Sein separat angezeigtes Optionen-Overlay ist nicht Teil des Hostbildes. |
| `ion-select-option` | `ion-select-option#native-slot` | ❌ | Konfiguration für ion-select; keine eigenständige gerenderte Box. Wählen Sie stattdessen ion-select. |
| `ion-toggle` | `ion-toggle#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-datetime` | `ion-datetime#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-datetime-button` | `ion-datetime-button#native-slot` | ⭕️ | Verbinden Sie das vorgesehene ion-datetime; die geöffnete Auswahl ist eine separate Fläche. |
| `ion-picker` | `ion-picker#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-picker-column` | `ion-picker-column#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-picker-column-option` | `ion-picker-column-option#native-slot` | ⭕️ | Eine gerenderte Auswahloption, anders als das nicht gerenderte ion-select-option. Behalten Sie ihren picker-column-Elternknoten. |

### Inhalt und Layout

| Containerelement | Beispiel | Unterstützung | Hinweise |
| ----------------- | ---------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| `ion-app` | `ion-app#native-slot` | ⭕️ | Zielt auf die gesamte appgroße Box, nicht auf ein verschachteltes Bedienelement. |
| `ion-content` | `ion-content#native-slot` | ⭕️ | Zielt auf die äußere Inhaltsfläche; wählen Sie für ein einzelnes scrollendes Bedienelement stattdessen dessen eigenen Container. |
| `ion-grid` | `ion-grid#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-row` | `ion-row#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-col` | `ion-col#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-split-pane` | `ion-split-pane#native-slot` | ⭕️ | Zielt auf das gesamte geteilte Layout; wählen Sie für einen Bereich einen Kindcontainer. |

### Karten, Text und Medien

| Containerelement | Beispiel | Unterstützung | Hinweise |
| ------------------- | ------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| `ion-card` | `ion-card#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-card-content` | `ion-card-content#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-card-header` | `ion-card-header#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-card-title` | `ion-card-title#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-card-subtitle` | `ion-card-subtitle#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-text` | `ion-text#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-label` | `ion-label#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-note` | `ion-note#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-badge` | `ion-badge#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-chip` | `ion-chip#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-avatar` | `ion-avatar#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-thumbnail` | `ion-thumbnail#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-img` | `ion-img#native-slot` | ⭕️ | Wählen Sie den Ionic-Host, nicht das interne HTML-img. Warten Sie auf die vorgesehene Bildgröße. |
| `ion-icon` | `ion-icon#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-skeleton-text` | `ion-skeleton-text#native-slot` | ⭕️ | Das Bild erhält einen aufgenommenen Zustand; es setzt die Indikatoranimation nicht fort. |
| `ion-spinner` | `ion-spinner#native-slot` | ⭕️ | Das Bild erhält einen aufgenommenen Zustand; es setzt die Indikatoranimation nicht fort. |
| `ion-progress-bar` | `ion-progress-bar#native-slot` | ⭕️ | Das Bild erhält einen aufgenommenen Zustand; es setzt die Indikatoranimation nicht fort. |

### Listen und Gesten

| Containerelement | Beispiel | Unterstützung | Hinweise |
| ----------------------------- | ----------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| `ion-accordion` | `ion-accordion#native-slot` | ⭕️ | Zielt auf die aktuelle Akkordeonbox; Änderungen beim Aufklappen erfordern eine Geometrieaktualisierung. |
| `ion-accordion-group` | `ion-accordion-group#native-slot` | ⭕️ | Zielt auf die Gruppenbox einschließlich ihres aktuellen Aufklappzustands. |
| `ion-list` | `ion-list#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-list-header` | `ion-list-header#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-item` | `ion-item#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-item-divider` | `ion-item-divider#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-item-group` | `ion-item-group#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-item-sliding` | `ion-item-sliding#native-slot` | ⭕️ | Zielt auf die gesamte verschiebbare Zeile; das Bild implementiert die Wischgeste nicht. |
| `ion-item-options` | `ion-item-options#native-slot` | ⭕️ | Nur solange die Optionen durch das übergeordnete verschiebbare Element eingeblendet sind. |
| `ion-item-option` | `ion-item-option#native-slot` | ⭕️ | Nur solange der übergeordnete item-options-Knoten eingeblendet ist. |
| `ion-infinite-scroll` | `ion-infinite-scroll#native-slot` | ⭕️ | Benötigt eine sichtbare Box mit Größe größer als null; Laden und Scrollverhalten bleiben bei Ionic. |
| `ion-infinite-scroll-content` | `ion-infinite-scroll-content#native-slot` | ⭕️ | Das Bild friert den aktuellen Ladeindikator ein. |
| `ion-refresher` | `ion-refresher#native-slot` | ⭕️ | Nur im sichtbaren aktiven Zustand innerhalb von ion-content; der verborgene Ruhezustand ist nicht geeignet. |
| `ion-refresher-content` | `ion-refresher-content#native-slot` | ⭕️ | Innerhalb eines aktiven refresher verwenden; das Bild friert den aktuellen Indikator ein. |
| `ion-reorder` | `ion-reorder#native-slot` | ⭕️ | Behalten Sie den item-/reorder-group-Kontext; das Bild implementiert das Ziehen nicht. |
| `ion-reorder-group` | `ion-reorder-group#native-slot` | ⭕️ | Zielt auf die gesamte Gruppe; Reihenfolge und Ziehverhalten bleiben bei Ionic. |

### Navigation und Tabs

| Containerelement | Beispiel | Unterstützung | Hinweise |
| --------------------- | --------------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| `ion-breadcrumb` | `ion-breadcrumb#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-breadcrumbs` | `ion-breadcrumbs#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-nav` | `ion-nav#native-slot` | ⭕️ | Zielt auf den Navigationsviewport; verwenden Sie für eine seitenspezifische Fläche den Container der aktuellen Seite. |
| `ion-nav-link` | `ion-nav-link#native-slot` | ⭕️ | Geben Sie diesem Aktionswrapper eine inline-block-/block-Box. |
| `ion-router` | `ion-router#native-slot` | ❌ | Routingkonfiguration, keine sichtbare Fläche. Wählen Sie den Container der gerenderten Seite. |
| `ion-router-link` | `ion-router-link#native-slot` | ⭕️ | Geben Sie diesem Aktionswrapper eine inline-block-/block-Box. |
| `ion-router-outlet` | `ion-router-outlet#native-slot` | ⭕️ | Zielt auf den Outlet-Viewport; verwenden Sie für seitenspezifische Platzierung den Container der aktiven Seite. |
| `ion-route` | `ion-route#native-slot` | ❌ | Routendefinition, keine sichtbare Fläche. Wählen Sie den Container der gerenderten Seite. |
| `ion-route-redirect` | `ion-route-redirect#native-slot` | ❌ | Weiterleitungsdefinition, keine sichtbare Fläche. Wählen Sie den Container der gerenderten Seite. |
| `ion-tabs` | `ion-tabs#native-slot` | ⭕️ | Zielt auf den Tabs-Viewport. Verwenden Sie ion-tab-bar, wenn nur die Leiste gemeint ist. |
| `ion-tab` | `ion-tab#native-slot` | ⭕️ | Nur der aktive sichtbare Tab ist geeignet. |
| `ion-tab-bar` | `ion-tab-bar#native-slot` | ⭕️ | Die Leiste ist eine Fläche; verwenden Sie ion-tab-button für einzelne Tabs. |
| `ion-tab-button` | `ion-tab-button#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-segment` | `ion-segment#native-slot` | ⭕️ | Das Segment ist eine Fläche; verwenden Sie ion-segment-button für ein einzelnes Bedienelement. |
| `ion-segment-button` | `ion-segment-button#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-segment-view` | `ion-segment-view#native-slot` | ⭕️ | Zielt auf den View-Viewport; einzelne Seiten verwenden ion-segment-content. |
| `ion-segment-content` | `ion-segment-content#native-slot` | ⭕️ | Verwenden Sie die sichtbare Segmentseite, keine Seite außerhalb des Bildschirms. |

### Overlays, Menüs und FAB

| Containerelement | Beispiel | Unterstützung | Hinweise |
| ------------------ | ------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `ion-action-sheet` | `ion-action-sheet#native-slot` | ⭕️ | Nur während der Anzeige. Zielt auf die Hostbox des Overlays, nicht automatisch auf dessen inneres Panel; bevorzugen Sie für ein einzelnes Bedienelement einen Container innerhalb des Overlays. |
| `ion-alert` | `ion-alert#native-slot` | ⭕️ | Nur während der Anzeige. Zielt auf die Hostbox des Overlays, nicht automatisch auf dessen inneres Panel; bevorzugen Sie für ein einzelnes Bedienelement einen Container innerhalb des Overlays. |
| `ion-modal` | `ion-modal#native-slot` | ⭕️ | Nur während der Anzeige. Zielt auf die Hostbox des Overlays, nicht automatisch auf dessen inneres Panel; bevorzugen Sie für ein einzelnes Bedienelement einen Container innerhalb des Overlays. |
| `ion-popover` | `ion-popover#native-slot` | ⭕️ | Nur während der Anzeige. Zielt auf die Hostbox des Overlays, nicht automatisch auf dessen inneres Panel; bevorzugen Sie für ein einzelnes Bedienelement einen Container innerhalb des Overlays. |
| `ion-loading` | `ion-loading#native-slot` | ⭕️ | Nur während der Anzeige. Zielt auf die Hostbox des Overlays, nicht automatisch auf dessen inneres Panel; bevorzugen Sie für ein einzelnes Bedienelement einen Container innerhalb des Overlays. |
| `ion-toast` | `ion-toast#native-slot` | ⭕️ | Nur während der Anzeige. Zielt auf die Hostbox des Overlays, nicht automatisch auf dessen inneres Panel; bevorzugen Sie für ein einzelnes Bedienelement einen Container innerhalb des Overlays. |
| `ion-backdrop` | `ion-backdrop#native-slot` | ⭕️ | Eine dekorative abdeckende Fläche. Dies konfiguriert weder Overlay-Erkennung noch native Z-Reihenfolge. |
| `ion-menu` | `ion-menu#native-slot` | ⭕️ | Nur während der Anzeige mit sichtbarer Box; Öffnen/Schließen bleibt bei Ionic. |
| `ion-menu-toggle` | `ion-menu-toggle#native-slot` | ⭕️ | Benötigt sichtbaren Inhalt; verwenden Sie inline-block/block und berücksichtigen Sie autoHide. |
| `ion-fab` | `ion-fab#native-slot` | ⭕️ | Verwenden Sie den sichtbaren Host mit seiner vorgesehenen Layoutbox. |
| `ion-fab-button` | `ion-fab-button#native-slot` | ⭕️ | Die Schaltfläche ist unabhängig von ihrer übergeordneten FAB-Gruppe eine Fläche. |
| `ion-fab-list` | `ion-fab-list#native-slot` | ⭕️ | Nur im ausgeklappten Zustand; behalten Sie den ion-fab-Elternknoten und die seitliche Platzierung bei. |

### Interne Komponente

| Containerelement | Beispiel | Unterstützung | Hinweise |
| ------------------ | ------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `ion-select-modal` | Interner Inhalt des Auswahl-Overlays | ❌ | In Ionic 9.0.9 enthalten, aber kein öffentlicher Zielvertrag. Wählen Sie den öffentlichen ion-select-Host oder einen anwendungseigenen Container. |

## Ein nicht unterstütztes Element umschließen

Wählen Sie `#seat-projection`, nicht das HTML-`select`:

```html
<span id="seat-projection" style="display: inline-block; width: 12rem; height: 2.75rem">
  <select aria-label="Seat" style="width: 100%; height: 100%">
    <option>Any seat</option>
  </select>
</span>
```

DOM, Wert und Ereignislistener des Steuerelements überleben die Übergabe; das vorbereitete Bild nimmt keine Eingaben an. Natives Verhalten und Anwendungsereignisse bleiben beim Plugin. Optionale [Wertbindungen](../configuration/values.md) übertragen native Werte auf den ausgewählten Host. Beim obigen Wrapper ist dieser Host das span, nicht das innere select; der Komponentenadapter des Wrappers muss übertragene Werte an sein Steuerelement weiterleiten.

## Verifikationsumfang

Temporäre Chromium- und WebKit-Prüfungen testen das Ionic-Inventar mit expliziter Layoutbox, erforderlichen Eltern und sichtbaren Zuständen. Ein vorbereitetes einfarbiges Bild prüft Platzierung und sichtbare Pixelabdeckung; die Prüfungen kontrollieren auch den Erhalt von Identität/Werten ursprünglicher Kinder und das Entfernen von Engine-Bildern beim Abbau. Konfigurationselemente werden auf das Fehlen einer darstellbaren Box geprüft. Die refresher-Prüfung wählt dessen aktiven CSS-Zustand; sie validiert die Ziehgeste nicht. Animierte Ladeindikatoren können sich zwischen Vorher-/Nachher-Aufnahmen verändern.

In beiden Browsern hatten alle 90 unterstützten öffentlichen Ionic-Elemente eine gemessene Bildrahmenabweichung von null, vollständige einfarbige Abdeckung im untersuchten Innenbereich, erhaltene ursprüngliche Kinder/Werte und nach der Zerstörung kein verbleibendes Engine-Bild. Die vier öffentlichen Konfigurationselemente hatten keine darstellbare Box. Die interne Komponente wurde ebenfalls geprüft, bleibt aber außerhalb des unterstützten öffentlichen Vertrags. HTML-Prüfungen decken 41 Element-/Layoutkombinationen einschließlich offener und geschlossener Shadow Roots ab.

Dies sind Prüfungen von DOM-Containern, keine Tests nativer Aufnahmen, der SDK-Eignung oder sämtlicher Ionic-Interaktionen. Sie garantieren nicht jedes Theme, jede Implementierung geschlossener Shadow Roots oder jedes Anwendungsstylesheet. Die Prüfungen gehören nicht zur permanenten Testsuite der Bibliothek.
