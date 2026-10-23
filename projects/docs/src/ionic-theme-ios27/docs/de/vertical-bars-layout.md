---
title: "Vertical Bars-Layout"
sourceRevision: "0e2871e8ff357cc5d356056d3c55cb326bc58bcc5e7668c75181fcc2d4e46b74"
---
# Vertical Bars-Layout

Dieses optionale Theme-Stylesheet übernimmt Web-Abstände und Positionierung um eine vertikale Seitenleiste. Es lässt sich mit Ihrem bestehenden Theme verwenden, ohne die vollständige iOS-27-Darstellung zu laden. Natives Rendering und Zustandssynchronisierung stellt separat [Capacitor Native UI](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.1/packages/capacitor-native-ui/docs/vertical-bars.md) bereit.

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

Das folgende Layoutverhalten setzt dieses Stylesheet voraus. Für die native Laufzeit und Geräteposition folgen Sie der [Integrationsanleitung](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.1/packages/capacitor-native-ui/docs/ionic-vertical-bars.md).

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

### Inhalts- und Overlay-Layout

| Fläche | Layout mit dem Seitenleisten-Stylesheet |
| --- | --- |
| Router und Komponentenhintergründe | Füllen weiterhin den Viewport. |
| `ion-content` | Rückt seinen scrollenden Vordergrund ein. |
| `ion-toolbar` | Rückt den Vordergrund seines Containers ein. |
| `ion-fab` | Wird nur neben der Systemoberfläche angepasst. |
| `ion-modal` in voller Breite, einschließlich Sheets | Rückt den Vordergrund ein. Bei aktiver Laufzeit projiziert das oberste Modal geeignete Werkzeugleisten-Bedienelemente in seine eigene Seitenleiste; Sheet-Leisten folgen beim Breakpointwechsel den sichtbaren Grenzen. |
| Zentriertes Modal | Behält Werkzeugleistenschaltflächen und erhält keinen Abstand für die Seitenleiste der Seite. |
| `ion-menu` / `ion-popover` | Interne Vordergrundkomponenten behalten Ionics standardmäßige Safe-Area-Behandlung ohne die Umrechnung der Hauptseite. |
| Menü neben der Systemoberfläche | Behält seinen viewportfüllenden Animations-Host; nur der sichtbare Container wird um den Abstand versetzt. |
| Menü auf der Gegenseite | Unverändert. |

Die entsprechende Ionic-Safe-Area-Variable wird innerhalb eingerückter Vordergrundkomponenten zurückgesetzt, damit Nachfahren den Abstand nicht erneut hinzufügen.

Die Eignung eines Modals richtet sich nach seiner sichtbaren Dialogbreite, nicht nach Scharnierstellung oder Modaltyp. Links und rechts bleiben bei RTL physische Koordinaten; Ionics `side="start"` und `side="end"` bleiben logisch.

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