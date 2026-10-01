---
title: "iPhone-Duo-Unterstützung (Vorschau)"
sourceRevision: "af84778f250e7c9b7444b30416936c3b14e436e18ac674b210a123ba7582c3df"
---
# iPhone-Duo-Unterstützung (Vorschau)

Passen Sie Ihre Ionic-Anwendung an iPhone Duo an: Platzieren Sie Navigation und Aktionen in dessen vertikaler Systemleiste und passen Sie die geteilte Ansicht beim Öffnen und Schließen des Geräts an. Bestehendes Ionic-Markup bleibt die Quelle für Beschriftungen, Symbole, Routing und Klickhandler.

**Neu hier?** Beginnen Sie mit [iPhone Duo mit Ihrem bestehenden Theme](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme), um das seitliche Layout in Chrome auszuprobieren. Diese Seite erklärt Geräteereignisse, Platzierung und geteilte Ansichten. [Vertical Bars](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars) dokumentiert die Projektion von Bedienelementen und die Laufzeit-API.

In `1.2.0` neben der [Native UI Shell](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/native-ui-shell) als **Vorschaufunktion** verfügbar. APIs und unterstütztes Verhalten können sich bis zur stabilen Version ändern. Der stabile Status ist nach der offiziellen Veröffentlichung von Xcode 27.1 geplant. Die tatsächliche Systemleiste und die Erfassung der Scharnierstellung erfordern iOS ab 27.1 sowie eine mit Xcode ab 27.1 gebaute Anwendung.

Dieses Paket stellt für diese Hardware zwei voneinander unabhängige Teile bereit. Beide funktionieren **ohne die Stylesheets des iOS-27-Themes** und **ohne die vollständige Native UI Shell**:

- `dist/css/vertical-bars.css` — ausdrücklich aktivierbare Klassen, die die Safe Area der Leiste reservieren, sowie eine registrierte benutzerdefinierte Property für eine von der Scharnierstellung gesteuerte Breite der geteilten Ansicht.
- `enableVerticalControlArea()` — verschiebt geeignete Tabs und Werkzeugleisten-Bedienelemente in den reservierten Bereich. Unter Capacitor iOS werden sie durch eine native SwiftUI-`TabView` und Werkzeugleiste gerendert. Auf allen anderen Plattformen erscheinen dieselben Bedienelemente als Web-Klone.

Der Gerätezustand wird von [`@erkamyaman/capacitor-foldable`](https://github.com/erkamyaman/capacitor-foldable) verwaltet. Die **Anwendung** abonniert dessen Ereignisse und wählt ihr Layout. **Stylesheet und Laufzeit** dieses Pakets setzen diese Entscheidung um, indem sie Platz reservieren, Bedienelemente projizieren und die geteilte Ansicht anpassen. Das Theme überwacht weder Scharnierzustand noch Leistenplatzierung.

## Den gewünschten Umfang wählen

Um Ihr bestehendes Theme beizubehalten und nur die eigenständige Unterstützung hinzuzufügen, folgen Sie [iPhone Duo mit Ihrem bestehenden Theme](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme). Diese Seite behandelt die gemeinsamen Regeln für das Gerätelayout.

| Ziel                                             | Stylesheet          | Laufzeit                                                            |
| ------------------------------------------------ | ------------------- | ------------------------------------------------------------------ |
| Nur Scharnierstellung (Layoutwechsel) | keine | keine — `Foldable` direkt abonnieren |
| Von der Scharnierstellung gesteuerte Breite der geteilten Ansicht | `vertical-bars.css` | keine — `Foldable` direkt abonnieren |
| Vertikale Leiste für Tabs und Werkzeugleistenaktionen       | `vertical-bars.css` | `enableVerticalControlArea()`                                      |
| Native Shell mit Leiste                       | `vertical-bars.css` | `enableNativeUIShell()` — enthält die Leistenprojektion |

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

Das Stylesheet verändert normale Ionic-Oberflächen niemals von selbst. Jede Regel benötigt eine ausdrücklich aktivierende Klasse. Laden Sie es ohne Bedingung. Diese Werte sind Simulations- und Layouteingaben, unabhängig von den normalen Safe-Area-Variablen von Ionic.

Der Einstiegspunkt `/vertical-bars` importiert `@capacitor/core` beim Laden des Moduls. Installieren Sie es deshalb auch für reine Web-Nutzung; es ist eine optionale Peer-Abhängigkeit. Anwendungen, die nur das Stylesheet und seine aktivierbaren Klassen benötigen, brauchen nichts weiter.

## Das Gerätelayout auslesen

Installieren Sie das Gerätezustands-Plugin in der Anwendung und synchronisieren Sie anschließend das native Projekt:

```bash
npm install @erkamyaman/capacitor-foldable
npx cap sync
```

Verwenden Sie Capacitor ab 8.5 und erstellen Sie den Build mit Xcode ab 27.1 für die iOS-27.1-APIs von iPhone Duo. Die Abhängigkeit wird für das gerätegesteuerte Layout benötigt, nicht für das Theme-CSS, die Browsersimulation oder die native Projektion allein. Importieren Sie nicht zusätzlich das `ionic-tabs.css` des Plugins zusammen mit der Leistenprojektion dieses Pakets; beide würden dieselben Tabs verschieben.

Übergeben Sie den Gerätezustand nach dem Einbinden von `ion-app` an `applyFoldStateClasses`. Die Anwendung verwaltet Abonnements und deren Bereinigung. Für das von der Scharnierstellung gesteuerte Layout ist keine Projektionslaufzeit erforderlich.

```ts
import { Foldable } from '@erkamyaman/capacitor-foldable';
import { applyFoldStateClasses } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const root = document.querySelector('ion-app')!;
const listener = await Foldable.addListener('foldStateChange', (fold) => applyFoldStateClasses(root, fold));
applyFoldStateClasses(root, await Foldable.getFoldState());
```

Beim Beenden der zuständigen Anwendungsinstanz:

```ts
await listener.remove();
```

Abonnieren Sie Änderungen und lesen Sie anschließend den aktuellen Zustand aus. Dieselbe Hilfsfunktion verarbeitet Anfangswerte und Ereignisse.

`applyFoldStateClasses` setzt genau eine der Klassen `ios-theme-fold-flat`, `ios-theme-fold-half-opened` und `ios-theme-fold-closed` auf dem übergebenen Wurzelelement und erhält andere Klassen. Bei halb geöffneter Stellung oder flacher Stellung mit Scharniergeometrie setzt es außerdem `ios-theme-fold-expanded`. Eine flache Stellung ohne Geometrie einschließlich des Web-Fallbacks sowie eine geschlossene Stellung entfernen diese Klasse. Die Hilfsfunktion abonniert das Plugin nicht und ändert die Split-Pane-Property `when` von Ionic nicht.

Verwenden Sie zur Leistenplatzierung `setVerticalControlAreaPlacement` wie unten gezeigt. Übergeben Sie die gemeldete logische Kante sowohl als `edge` als auch als `nativeEdge` zusammen mit dem gemessenen `inset`. Die führende Kante ist bei LTR die physische linke und bei RTL die physische rechte. Eine null-Kante stellt das gewöhnliche Layout wieder her; ein Inset von null entfernt die ausdrücklich gesetzte Breite. Aufrufe zum Starten oder Stoppen der Überwachung sind nicht erforderlich.

Der WebView-Eckenradius bleibt eine Frage der Darstellung: `configureNativeTransition()` verwendet unabhängig von `Foldable` die Shell-API `getWebViewMetrics()`.

**Migration:** Die bisherigen APIs des Themes für `DeviceLayout`, `HingeStatus`, `getDeviceLayout()`, `deviceLayoutChange` sowie zum Starten und Stoppen der Geräte-Layout-Überwachung wurden entfernt. Ersetzen Sie Geräteabonnements durch die oben genannten `Foldable`-APIs und verwenden Sie `getWebViewMetrics()` für einmalige Messungen der Radien. Wenn die App ohne das iOS-27.1-SDK gebaut wird, kann Foldable die Position der Duo-Leisten aus den Safe-Area-Abständen ableiten. Scharnierdaten erfordern weiterhin das neuere SDK. Apps können außerdem unabhängig von der gemeldeten Kante eine feste Leistenposition anfordern.

## Die vertikale Leiste reservieren

Laden Sie `vertical-bars.css` wie oben gezeigt. Klassenbasierte Browsersimulation, Safe-Area-Behandlung, RTL und Overlay-Layout beschreibt [Die vertikale Leiste reservieren](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#reserve-the-vertical-rail). Auf dem Gerät wendet die folgende Platzierungshilfe die Layoutklassen und den gemessenen Innenabstand an.

## Bedienelemente in die Leiste projizieren

Starten Sie die eigenständige Laufzeit einmal nach dem Einbinden von `ion-app` und wenden Sie die vom Plugin gemeldete Platzierung mit `setVerticalControlAreaPlacement` an:

```ts
import { Foldable } from '@erkamyaman/capacitor-foldable';
import { setVerticalControlAreaPlacement, enableVerticalControlArea } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const rail = await enableVerticalControlArea();
const listener = await Foldable.addListener('barPlacementChange', ({ verticalBarEdge, inset }) =>
  setVerticalControlAreaPlacement({ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset }),
);
const { verticalBarEdge, inset } = await Foldable.getBarPlacement();
setVerticalControlAreaPlacement({ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset });
```

Beim Beenden der zuständigen Anwendungsinstanz:

```ts
await listener.remove();
await rail.destroy();
```

Übergeben Sie `nativeEdge` sowohl beim ersten Auslesen als auch bei jedem Ereignis, damit der Renderer weiß, welche Leiste das System tatsächlich bereitstellt. Der gemessene `inset` wird weitergereicht, statt eine feste Breite anzunehmen. Geräte ohne gemeldete Leiste einschließlich Web und Android liefern eine null-Kante und behalten das normale Layout. Verwenden Sie für die Browsersimulation die [klassenbasierte Vorschau](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#reserve-the-vertical-rail), ohne die Geräteplatzierung anzubinden.

Starten Sie entweder `enableVerticalControlArea()` oder die vollständige `enableNativeUIShell()`, nicht beide. Wenn die Anwendung bereits die Native UI Shell verwendet, behalten Sie diese Laufzeit bei und verwenden Sie denselben Callback `setVerticalControlAreaPlacement`. Die zuständige Anwendungsinstanz entfernt beim Beenden ihre Listener und zerstört ihre Laufzeit.

Auf unterstützten iOS-Versionen übergibt die Laufzeit geeignete Tabs, Zurück-Navigation, Menüschaltflächen und Aktionen fest positionierter Werkzeugleisten an eine native SwiftUI-`TabView` und Werkzeugleiste. Unter Web, Android oder bei nicht verfügbarer nativer Projektion bleiben Web-Klone die Rückfalloption. Die Eignung von Bedienelementen beschreibt [Werkzeugleistenaktionen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#toolbar-actions).

### Werkzeugleistenaktionen

Geeignetes Markup, Platzierung, Schaltflächendarstellung und lokale Überschreibungen finden Sie unter [Vertical Bars: Werkzeugleistenaktionen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#toolbar-actions).

### Tab-Leiste

Navigation, Beschriftungen und das Verhalten der Web-Rückfalloption beschreibt [Vertical Bars: Tab-Leiste](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#tab-bar).

## Die geteilte Ansicht anpassen

Aktivieren Sie für ein nebeneinander angeordnetes Menü auf iPhone Duo an `ion-split-pane` das separat vermessene Settings-Layout. Die Seitenleiste ist vollständig aufgeklappt 320pt breit und reicht bei halb geöffnetem Gerät bis zur Bildschirmmitte (50vw). Die Anwendung liefert die Scharnierstellung. Beide Zustände haben dieselbe Viewport-Breite; eine Media Query anhand der Breite kann sie daher nicht unterscheiden:

```html
<ion-split-pane
  class="split-pane-fold-layout"
  contentId="main-content"
  when="(min-width: 900px)"
>
  <ion-menu contentId="main-content">...</ion-menu>
  <div id="main-content">...</div>
</ion-split-pane>
```

Setzen Sie die normale Split-Pane-Breite im Anwendungs-Stylesheet auf 320pt und lassen Sie die Klasse für die halb geöffnete Stellung ausschließlich den Breitenwert ändern:

```css
ion-split-pane.split-pane-fold-layout {
  --ios-theme-menu-width: var(--ios-theme-split-pane-width);
  --side-width: var(--ios-theme-menu-width);
  --side-max-width: var(--ios-theme-menu-width);
  transition: --ios-theme-split-pane-width 300ms ease;
}
```

Die registrierte Property `--ios-theme-split-pane-width` hat den Standardwert `320px`. `applyFoldStateClasses` setzt `ios-theme-fold-half-opened` auf `ion-app`. Das Stylesheet setzt daraufhin ausschließlich nachgeordnete Split Panes mit `split-pane-fold-layout` auf `50vw`. Fügen Sie diese aktivierende Klasse einmal hinzu; eine zustandsabhängige Klassenbindung ist nicht erforderlich. Andere Split Panes behalten ihre vorhandene Breite.

Die Ionic-Property `when` steuert weiterhin, ob das Menü dauerhaft sichtbar ist. Das Beispiel wählt einen festen Breakpoint von 900px. Benötigt Ihre Anwendung unterschiedliche Breakpoints für gefaltete und gewöhnliche Displays, verwenden Sie die von der Hilfsfunktion gesetzte Klasse `ios-theme-fold-expanded`, um diese Entscheidung im Layoutcode der Anwendung zu treffen. Die Hilfsfunktion aktualisiert nur Zustandsklassen, nicht `when`. Dieses Layout aktiviert Vertical Bars nicht und verschiebt kein Overlay-Menü.

## API des vertikalen Steuerbereichs

Die Referenz des Laufzeit-Handles wird unter [Vertical Bars](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#vertical-control-area-api) gepflegt.
