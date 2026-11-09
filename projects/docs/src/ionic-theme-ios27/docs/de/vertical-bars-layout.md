---
title: "Vertical Bars-Layout"
sourceRevision: "916b926c605374fb20a296eb4c8d591f00f9d4857ed9cb8e4e686f61d41d4491"
---

# Vertical Bars-Layout

Dieses optionale Theme-Stylesheet übernimmt Web-Abstände und Positionierung um eine vertikale Seitenleiste. Es lässt sich mit Ihrem bestehenden Theme verwenden, ohne die vollständige iOS-27-Darstellung zu laden. Natives Rendering und Zustandssynchronisierung stellt separat [Capacitor Native UI](/capacitor-native-ui/docs/vertical-bars) bereit.

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

Das folgende Layoutverhalten setzt dieses Stylesheet voraus. Für die native Laufzeit und Geräteposition folgen Sie der [Integrationsanleitung](/capacitor-native-ui/docs/ionic-vertical-bars).

## Die vertikale Leiste reservieren

Verwenden Sie für die Geräteeinrichtung das installierte Foldable-Plugin und wenden Sie Anfangsposition sowie Ereignisse über `setVerticalBarsLayout` an; folgen Sie der [Standardkonfiguration der Ionic-Seitenleiste](../../capacitor-native-ui/docs/ionic-vertical-bars.md). Die folgenden Klassen beschreiben die Layouteingaben des Stylesheets und die optionale Browsersimulation, keinen manuellen Einrichtungsschritt am Gerät.

Fügen Sie `.ios-theme-vertical-bars` zu `ion-app` hinzu, um den Leistenbereich auf der physischen rechten Seite zu reservieren, oder ergänzen Sie `.ios-theme-vertical-bars-left` für die physische linke Seite:

```html
<ion-app class="ios-theme-vertical-bars">...</ion-app>
```

Die Klassen sind physisch — `-left` bezeichnet immer den physischen linken Rand —, da CSS und der native Renderer mit physischen Koordinaten arbeiten. `setVerticalBarsLayout` übernimmt das vom Geräte-Plugin gemeldete logische `verticalBarEdge` und löst es anhand der Dokumentrichtung auf; eine RTL-App benötigt daher keine eigene Umrechnung.

### Breite der Seitenleiste

| Quelle | Reservierte Breite |
| --- | --- |
| Nur Klassen, einschließlich Chrome-Vorschauen | `80px`; kein natives Plugin erforderlich. |
| `setVerticalBarsLayout({ edge, inset })` | Der angegebene Abstand, auch unter `80px`. |
| Eigene CSS-Vorschau | Überschreiben Sie `--ios-theme-vertical-bars-safe-area-left` oder `--ios-theme-vertical-bars-safe-area-right`. |

### Platzierung der Web-Werkzeugleiste

Ohne Gerätegeometrie verwendet die Web-Leiste standardmäßig das gemessene Toolbar-Layout des iPhone-Duo-Außendisplays: einen oberen Ursprung von 174px, quadratische Steuerelemente mit 48px, 4px Abstand innerhalb einer Gruppe und 12px zwischen Gruppen. Die Steuerelemente liegen mindestens 24px vom physischen Rand entfernt oder zentriert im reservierten Bereich, wenn dies einen größeren Abstand erfordert. Diese Standardwerte gelten auch für Hintergrundelemente hinter einem Sheet-Modal. Ein Zurück-Button belegt einen Platz, gefolgt vom Gruppenabstand.

`--ios-theme-vertical-bars-toolbar-top` überschreibt den oberen Ursprung. Die Positionierung modaler Werkzeugleisten berücksichtigt weiterhin den Sheet-Versatz. Verfügbare native Messwerte haben Vorrang vor diesen Web-Vorgaben.

### Gerätelayoutwerte anwenden

Ermitteln Sie die Gerätewerte in der vorhandenen initialen Layoutbehandlung und im Foldable-Änderungshandler der Anwendung:

```ts
import { Foldable } from '@erkamyaman/capacitor-foldable';
import { resolveVerticalBarsLayout } from '@rdlabo/capacitor-native-ui/integration';
import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';

const metrics = await resolveVerticalBarsLayout(Foldable);
setVerticalBarsLayout(metrics);
```

Der Resolver verwendet den SDK-freien Integrationseinstieg von Native UI und startet keine native Projektion. Nutzen Sie vorhandene Abonnements für Platzierung, Faltstellung und Größenänderungen; der Resolver abonniert nichts und startet Native UI nicht. Falls sich Lesevorgänge überlappen können, verwerfen Sie veraltete Ergebnisse im vorhandenen Handler.

Der Resolver akzeptiert ein Objekt mit `getBarPlacement()` und `getReservedRegions()`, ohne von Foldable selbst abzuhängen. Er liefert die logischen Werte `edge`, `inset` und `toolbarTop`. Nicht unterstützte APIs und fehlgeschlagene Abfragen lassen diese Felder undefiniert. Der aktuelle Viewport und die Dokumentrichtung bestimmen die physische Leistenseite. Bereichsrechtecke verwenden CSS-Pixel des Viewports und enthalten ihre Ränder bereits.

**Aus Kompatibilitätsgründen verbleiben Standardwerte in `setVerticalBarsLayout`:** Fehlende Platzierung deaktiviert die Web-Leiste, ein ausgelassener Einzug behält die Leistenbreite des Stylesheets bei und ein ausgelassener Toolbar-Ursprung bewahrt bestehende CSS-/Inline-Anpassungen; nur ohne konfigurierten Wert gelten 174px. Beim Löschen der Geometrie oder Deaktivieren der Leiste wird die vorherige Inline-/CSS-Konfiguration nur wiederhergestellt, solange Inline-Wert und Priorität noch mit dem Schreibvorgang des Helfers übereinstimmen. Abweichende spätere Anwendungswerte bleiben erhalten; identische Anwendungsschreibvorgänge sind nicht von denen des Helfers unterscheidbar. Leere oder unbrauchbare reservierte Bereiche lassen `toolbarTop` undefiniert, statt eine Gerätemessung zu erfinden. Der gemessene Toolbar-Ursprung des Innendisplays beträgt 124px; übergeben Sie das Provider-Ergebnis, um ihn zu nutzen. Der feste Außendisplay-Fallback bildet die Innendisplay-Platzierung ohne Geometrie nicht nach.

Der Resolver ist eine API des Native UI-Adapters, keine Geräte-API des Themes oder der Engine. Dieses Beispiel benötigt eine Adapterversion, die `resolveVerticalBarsLayout` bereitstellt; in Capacitor Native UI 2.1.0 ist sie nicht verfügbar. Das Theme akzeptiert einfache Layoutwerte ohne Import eines Geräte-SDKs.

### Inhalts- und Overlay-Layout

| Fläche | Layout mit dem Leisten-Stylesheet |
| --- | --- |
| Router und Komponentenhintergründe | Belegen weiterhin den gesamten Viewport. |
| `ion-content` | Rückt seinen scrollenden Vordergrund ein. |
| `ion-toolbar` | Rückt den Containervordergrund ein. |
| `ion-fab` | Wird nur neben der System-UI angepasst. |
| `ion-modal`, das die aktive Leistenspalte überlappt | Wendet den Vordergrundeinzug an. Bei aktiver Laufzeit projiziert das oberste Modal geeignete Toolbar-Steuerelemente in seine eigene Leiste; Sheet-Leisten folgen beim Wechsel des Breakpoints den sichtbaren Grenzen. |
| Modal außerhalb der aktiven Leistenspalte | Behält seine Toolbar-Buttons und erhält keinen Seitenleisteneinzug. |
| `ion-menu` / `ion-popover` | Interne Vordergrundkomponenten behalten Ionics normale Safe-Area-Behandlung ohne die Konvertierung der Hauptseite. |
| Menü auf der Seite der System-UI | Behält seinen viewportfüllenden Animationshost; nur der sichtbare Container wird um den Einzug versetzt. |
| Menü auf der gegenüberliegenden Seite | Unverändert. |

Die entsprechende Ionic-Safe-Area-Variable wird innerhalb eingerückter Vordergrundkomponenten zurückgesetzt, damit Nachfahren den Abstand nicht erneut hinzufügen.

Die Eignung eines Modals richtet sich nach Layoutposition und Breite des Dialogs: Dialoge über der aktiven Leistenspalte projizieren geeignete Steuerelemente, einschließlich schwebender Sheets auf dem Außendisplay. Dialoge außerhalb dieser Spalte behalten ihre Toolbar-Steuerelemente. Präsentationstransformationen ändern diese Entscheidung nicht. Dialoge mit voller Breite behalten ihr bisheriges Verhalten, wenn kein Einzugswert angegeben ist. Links und rechts bleiben in RTL physische Koordinaten; Ionics `side="start"` und `side="end"` bleiben logisch.

Wenn das iOS-27-Theme geladen und `ios-theme-vertical-bars` oder `ios-theme-fold-expanded` auf `ion-app` aktiviert ist, lassen schwebende Karten- und Sheet-Modals auf jeder Seite mindestens 8px frei. Viewports ab 600px Höhe begrenzen ihre Breite auf 653px; niedrigere nutzen die verfügbare Breite minus 16px. Die maximale Höhe lässt über dem Modal mindestens 8px oder die obere Safe Area frei. Sheet-Breakpoints steuern weiterhin die sichtbare Höhe. Normale Dialoge großer Ansichten verwenden in diesen Layouts dieselbe Breite und denselben oberen Abstand. Übliche Telefon- und Tablet-Standardwerte bleiben unverändert, wenn keine der Layoutklassen aktiv ist.

Verwenden Sie Ionics Eigenschaften `--width`, `--max-width` und `--height` für anwendungsspezifische Größen. Eine explizite Vollbilddarstellung kann `--width: 100%`, `--max-width: none` und `--height: 100%` setzen; die Eignung für die Leiste richtet sich weiterhin nach der resultierenden Dialogbreite.

Der Modus ist unabhängig vom Komponentenmodus. Eine Anwendung kann unter iOS den Ionic-Modus `mode: 'md'` beibehalten und trotzdem Vertical Bars aktivieren. Keine Komponente benötigt `mode="ios"`.

## Layout-API

```ts
import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';

setVerticalBarsLayout({ edge: 'trailing', inset: 80 });
// Optional als nächste Argumente ein Stammelement und einen expliziten RTL-Wahrheitswert angeben.
setVerticalBarsLayout({ edge: null }); // gewöhnliches Web-Layout wiederherstellen
```

Der Helfer verändert ausschließlich Web-CSS und funktioniert ohne Capacitor oder Native UI-Start. Die Anwendung liefert den Gerätezustand und verwaltet Abonnements. Starten, Deaktivieren oder Zerstören von Native UI ändert weder diese Layoutklassen noch den reservierten Abstand. Nicht unterstützte native Seitenleisten behalten die gewählte Web-Seitenleiste; wählen Sie ausdrücklich `edge: null`, wenn die Anwendung stattdessen ein horizontales Layout benötigt.

## Das Gerätelayout auslesen

Die Standardbefehle zur Einrichtung von Theme und Native UI installieren Foldable als separate Anwendungsabhängigkeit. Synchronisieren Sie nach dem Erstellen der Web-Assets das native Projekt:

```bash
npx cap sync
```

Verwenden Sie für die iOS-27.1-APIs des iPhone Duo Capacitor 8.5 oder neuer und Xcode 27.1 oder neuer. Foldable liefert in der Standardeinrichtung Position und Faltstellung. Für die Browsersimulation lässt sich sein Abonnement vorübergehend durch feste Layoutwerte ersetzen. Importieren Sie `ionic-tabs.css` des Plugins nicht zusammen mit der Seitenleistenprojektion dieses Pakets; beide würden dieselben Tabs verschieben.

Übergeben Sie den Gerätezustand nach dem Einbinden von `ion-app` an `applyFoldStateClasses`. Die Anwendung verwaltet Abonnements und deren Bereinigung. Für das von der Scharnierstellung gesteuerte Layout ist keine Projektionslaufzeit erforderlich.

```ts
import { Foldable } from '@erkamyaman/capacitor-foldable';
import { applyFoldStateClasses } from '@rdlabo/ionic-theme-ios27';

const root = document.querySelector('ion-app')!;
const listener = await Foldable.addListener('foldStateChange', (fold) => applyFoldStateClasses(root, fold));
applyFoldStateClasses(root, await Foldable.getFoldState());
```

Beim Beenden der zuständigen Anwendungsinstanz:

```ts
await listener.remove();
```

Abonnieren Sie Änderungen und lesen Sie anschließend den aktuellen Zustand aus. Dieselbe Hilfsfunktion verarbeitet Anfangswerte und Ereignisse.

### Klassen für die Faltstellung

`applyFoldStateClasses` aktualisiert den angegebenen Stamm und erhält nicht betroffene Klassen:

| Klasse | Wird angewendet bei |
| --- | --- |
| `ios-theme-fold-flat` | Flacher Stellung. |
| `ios-theme-fold-half-opened` | Halb geöffneter Stellung. |
| `ios-theme-fold-closed` | Geschlossener Stellung. |
| `ios-theme-fold-expanded` | Halb geöffneter Stellung oder flacher Stellung mit Scharniergeometrie. Wird bei flacher Stellung ohne Geometrie (einschließlich Web-Fallback) sowie bei geschlossener Stellung entfernt. |

Nur eine der ersten drei Klassen bleibt erhalten. Der Helfer abonniert das Plugin nicht und ändert Ionics Split-Pane-Eigenschaft `when` nicht.

## Die geteilte Ansicht anpassen

Aktivieren Sie für ein nebeneinander angeordnetes Menü auf dem iPhone Duo das faltstellungsabhängige Layout des Themes auf `ion-split-pane`. Dieses Stylesheet verwendet standardmäßig `320px` bei vollständig aufgeklapptem Gerät und `50vw` bei halb geöffnetem Gerät. Das sind Theme-Standardwerte, keine Zusicherung der Breiten der Systemeinstellungen. Die Anwendung liefert die Faltstellung; beide Zustände können dieselbe Viewportbreite haben und lassen sich daher nicht mit einer Breiten-Media-Query unterscheiden:

```html
<ion-split-pane class="split-pane-fold-layout" contentId="main-content" when="(min-width: 900px)">
  <ion-menu contentId="main-content">...</ion-menu>
  <div id="main-content">...</div>
</ion-split-pane>
```

Verbinden Sie die Split-Pane-Breite im Anwendungs-Stylesheet mit der Theme-Variable und lassen Sie die Klasse für halb geöffnete Geräte nur den Breitenwert ändern:

```css
ion-split-pane.split-pane-fold-layout {
  --ios-theme-menu-width: var(--ios-theme-split-pane-width);
  --side-width: var(--ios-theme-menu-width);
  --side-max-width: var(--ios-theme-menu-width);
  transition: --ios-theme-split-pane-width 300ms ease;
}
```

Die registrierte Property `--ios-theme-split-pane-width` hat den Standardwert `320px`. `applyFoldStateClasses` setzt `ios-theme-fold-half-opened` auf `ion-app`. Das Stylesheet setzt daraufhin ausschließlich nachgeordnete Split Panes mit `split-pane-fold-layout` auf `50vw`. Fügen Sie diese aktivierende Klasse einmal hinzu; eine zustandsabhängige Klassenbindung ist nicht erforderlich. Andere Split Panes behalten ihre vorhandene Breite.

`ios-theme-fold-expanded` beschreibt die Nutzung des inneren Displays; es wählt keine Seitenleistenbreite. Ein vollständig aufgeklapptes Display behält die gewöhnliche Breite. Nur `ios-theme-fold-half-opened` wählt `50vw` für entsprechend aktivierte Split Panes.

Die Ionic-Property `when` steuert weiterhin, ob das Menü dauerhaft sichtbar ist. Das Beispiel wählt einen festen Breakpoint von 900px. Benötigt Ihre Anwendung unterschiedliche Breakpoints für gefaltete und gewöhnliche Displays, verwenden Sie die von der Hilfsfunktion gesetzte Klasse `ios-theme-fold-expanded`, um diese Entscheidung im Layoutcode der Anwendung zu treffen. Die Hilfsfunktion aktualisiert nur Zustandsklassen, nicht `when`. Dieses Layout aktiviert Vertical Bars nicht und verschiebt kein Overlay-Menü.

## Migration

Ersetzen Sie Plugin-Aufrufe von `setVerticalControlAreaPlacement` durch `setVerticalBarsLayout({ edge, inset })` aus dem Theme. Importieren Sie auch `applyFoldStateClasses` aus dem Theme. Entfernen Sie `nativeEdge`: Es meldet keine Verfügbarkeit mehr. Die alten Plugin-Helfer sind veraltet; aktualisieren Sie vorhandene Importe anhand der [Migrationsanleitung](../../capacitor-native-ui/docs/migration.md#web-layout-ownership).
