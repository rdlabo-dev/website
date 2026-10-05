---
title: "Vertical Bars (Vorschau)"
headingAliases: { 'vertikale-leisten-aktivieren': 'vertical-bars-aktivieren' }
sourceRevision: "8c5a60399c6c97dee637a7a81a038d84e15845669ba59194ee2020a30f0e1c71"
---
# Vertical Bars (Vorschau)

Die Funktion Vertical Bars verschiebt geeignete Ionic-Navigation und Aktionen in eine Seitenleiste. Die ursprünglichen Komponenten bleiben die Quelle für Beschriftungen, Symbole und Verhalten. Dies funktioniert mit diesem Theme oder einem vorhandenen Ionic-Theme, unabhängig von der Scharnierstellung und der vollständigen Native UI Shell.

Verwenden Sie diese Seite für Layout, Eignung der Bedienelemente, Aussehen nativer Schaltflächen und Laufzeit-API. Geräteereignisse und geteilte Ansichten beschreibt [iPhone-Duo-Unterstützung](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo). Für eine schrittweise Browser-Vorschau und native Einrichtung beginnen Sie mit [iPhone Duo mit Ihrem bestehenden Theme](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme).

In `1.2.0` als **Vorschaufunktion** verfügbar. APIs und unterstütztes Verhalten können sich ändern.

## Vertical Bars aktivieren

Laden Sie das ausdrücklich aktivierbare Stylesheet:

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

Starten Sie nach dem Einbinden von `ion-app` eine Laufzeit:

```ts
import { enableVerticalControlArea } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const rail = await enableVerticalControlArea();
```

Fügen Sie für die Browsersimulation die folgende Layoutklasse hinzu oder [wenden Sie die Geräteplatzierung an](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo#project-controls-into-the-rail) für ein iPhone Duo. Die Anwendung verwaltet Platzierung und Bereinigung. Rufen Sie beim Beenden der zuständigen Instanz `await rail.destroy()` auf. Wenn Sie bereits `enableNativeUIShell()` verwenden, behalten Sie diese Laufzeit bei; Vertical Bars ist darin enthalten. Starten Sie nicht beide.

Der Einstiegspunkt `/vertical-bars` benötigt `@capacitor/core`, auch in Browser-Builds. Reine CSS-Nutzung benötigt keine Laufzeit. Folgen Sie für die native Einrichtung und Navigationsübergänge der [Anleitung für bestehende Themes](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme).

Unter unterstütztem Capacitor iOS werden geeignete Bedienelemente nativ mit SwiftUI gerendert. Web, Android und nicht verfügbare native Projektion verwenden Web-Klone. Eine Browser-Vorschau kann Layout und Aktionen prüfen, aber nicht das native Schaltflächenaussehen vergleichen.

## Die vertikale Leiste reservieren

Fügen Sie `.ios-theme-vertical-bars` zu `ion-app` hinzu, um den Leistenbereich auf der physischen rechten Seite zu reservieren, oder ergänzen Sie `.ios-theme-vertical-bars-left` für die physische linke Seite:

```html
<ion-app class="ios-theme-vertical-bars">...</ion-app>
```

Die Klassen sind physisch: `-left` bedeutet immer die physische linke Kante, da CSS und nativer Renderer in physischen Koordinaten arbeiten. `setVerticalControlAreaPlacement` wendet die vom Geräte-Plugin gemeldete logische `verticalBarEdge` an und löst sie anhand der Dokumentrichtung auf. Eine RTL-Anwendung benötigt deshalb keine eigene Umrechnung.

Für die Entwicklung in Chrome ist kein natives Plugin erforderlich. Die Klasse allein reserviert `80px` zur Simulation von iPhone Duo. Wenn `setVerticalControlAreaPlacement` `{ edge, nativeEdge, inset }` erhält, ersetzt der Innenabstand die Rückfallbreite, auch wenn er kleiner als `80px` ist. Überschreiben Sie `--ios-theme-vertical-bars-safe-area-left` oder `--ios-theme-vertical-bars-safe-area-right`, um ein anderes Layout zu simulieren.

Dadurch bleiben Router und Komponentenhintergründe über den gesamten Viewport gespannt. `ion-content` verschiebt seinen scrollenden Vordergrund, `ion-toolbar` den Container-Vordergrund. `ion-fab` wird nur angepasst, wenn es neben der Systemoberfläche liegt. Die entsprechende Ionic-Safe-Area-Variable wird innerhalb dieser Vordergrundkomponenten zurückgesetzt, damit Nachfahren den Innenabstand nicht erneut hinzufügen.

`ion-modal` wendet dieselbe Vordergrundkorrektur an, wenn sein sichtbarer Dialog die gesamte Viewport-Breite einnimmt. Bei aktivierter Laufzeit des vertikalen Steuerbereichs projiziert außerdem das oberste Modal über die volle Breite geeignete Werkzeugleisten-Schaltflächen in seine eigene Leiste. Zentrierte Dialoge behalten ihre Werkzeugleisten-Schaltflächen und erhalten keinen Seitenleisten-Innenabstand. Dies umfasst Sheet-Modals über die volle Breite: Ihre Leiste folgt den sichtbaren Sheet-Grenzen bei Breakpoint-Änderungen. Die Eignung richtet sich nach der sichtbaren Dialogbreite, nicht nach der Scharnierstellung oder dem Modal-Typ. `ion-menu` und `ion-popover` werden als separate Flächen behandelt. Ihre internen Vordergrundkomponenten erhalten keine Umrechnung der Hauptseite und behalten die normale Safe-Area-Behandlung von Ionic. Ein neben der Systemoberfläche angezeigtes Menü behält den vollflächigen Animations-Host von Ionic und verschiebt nur seinen sichtbaren Container um den entsprechenden Innenabstand. Ein Menü von der Gegenseite bleibt unverändert. Links und rechts bleiben in RTL physische Koordinaten; die Ionic-Werte `side="start"` und `side="end"` bleiben logisch.

Der Modus ist unabhängig vom Komponentenmodus. Eine Anwendung kann unter iOS den Ionic-Modus `mode: 'md'` beibehalten und trotzdem Vertical Bars aktivieren. Keine Komponente benötigt `mode="ios"`.

## Native Darstellung

Auf unterstützten iOS-Versionen verändert `.ios-theme-vertical-bars` nur Bedienelemente, die das System in die physische Seitenleiste verlegt. Sobald die Klasse angewendet ist, stellt die Native UI Shell geeignete Tabs, Zurück-Navigation, Menüschaltflächen und Werkzeugleistenaktionen über eine SwiftUI-`TabView` und Werkzeugleiste dar. Wenn das Betriebssystem eine Leistenkante meldet — auf iPhone Duo bei Verknüpfung gegen iOS ab 27.1 — muss sie mit der angewendeten Platzierung übereinstimmen. Eine widersprüchliche Meldung belässt die Leiste im Web. Ältere Toolchains, die keine Kante melden können, vertrauen direkt auf die DOM-Platzierung. SwiftUI bestimmt adaptive Platzierung und Liquid-Glass-Aussehen. Ionic bleibt die Quelle für Beschriftungen, Symbole, Auswahl-/Deaktivierungszustand, Routing, Formularübermittlung und Klickhandler.

Die SwiftUI-Fläche wird auf die Systemleiste zugeschnitten; auch die Trefferprüfung ist auf diese beschränkt. Web-Inhalt bleibt außerhalb dieses physischen Bereichs sichtbar und bedienbar. Die Laufzeit aktualisiert die Tab-Auswahl optimistisch, bevor sie die Aktion an das ursprüngliche `ion-tab-button` weiterleitet. Dabei gelten derselbe Ereignisschutz und derselbe Schutz vor veralteten Revisionen wie bei anderen nativen Bedienelementen. Das Overlay-Layout folgt den [Regeln zur Leistenreservierung](#reserve-the-vertical-rail).


## Werkzeugleistenaktionen

Ein normales `ion-back-button` kann von außerhalb einer fest positionierten Werkzeugleiste projiziert werden, auch aus geroutetem Inhalt oder einer dauerhaften Anwendungshülle. `ion-menu-button` und andere Werkzeugleistenaktionen benötigen eine fest positionierte Werkzeugleiste.

Ein `ion-button` wandert in die Leiste, wenn es ein `ion-icon` oder SVG mit `slot="icon-only"` enthält. Die Schaltfläche muss in einer fest positionierten `ion-toolbar` direkt innerhalb von `ion-header` oder `ion-footer` und außerhalb eines scrollenden `ion-content` liegen.

| Symbol-Markup | Platzierung |
| --- | --- |
| `slot="icon-only"` | Vertikale Leiste |
| `slot="start"`, `slot="end"` oder kein Slot | Ursprüngliche horizontale Werkzeugleiste |
| Kein Symbol | Ursprüngliche horizontale Werkzeugleiste |

```html
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="end">
      <ion-button aria-label="Done">
        <ion-icon name="checkmark-outline" slot="icon-only"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
```

Alle Füllungen (`default`, `clear`, `solid` und `outline`) und Ionic-Farben folgen dieser Platzierungsregel. Behalten Sie zugängliche Namen und die ursprünglichen Klick- oder Formular-Submit-Handler an den Quellschaltflächen bei. `type="submit"` und `.button-submit` wählen keine andere Platzierung.

Die Regel gilt für einzelne Schaltflächen und Schaltflächen innerhalb von `ion-buttons`, sowohl auf normalen Seiten als auch im obersten Modal über die volle Breite. Zentrierte Modals, Menüs und Popovers behalten ihr eigenes Werkzeugleistenlayout. Fügen Sie `.ios-theme-horizontal-only` zu einer Gruppe oder einzelnen Schaltfläche hinzu, um sie horizontal zu belassen. Die Platzierung wird beim Eintritt einer gerouteten Seite gewählt. Das Ändern des Inhalts oder Symbol-Slots einer vorhandenen Schaltfläche verschiebt sie erst zwischen Werkzeugleiste und Leiste, wenn die Seite verlassen und erneut geöffnet wird.

Eine Werkzeugleiste, deren gesamter Inhalt in die seitliche Leiste verschoben wurde, wird während der Projektion eingeklappt. Werkzeugleisten mit einem Titel, direktem Text, anderen Inhalten oder einem ausschließlich horizontal angezeigten Bedienelement bleiben sichtbar. Beim Aufheben der Projektion wird die ursprüngliche Werkzeugleiste wiederhergestellt.

### Das Aussehen von Schaltflächen wählen

`buttonProjection` und die folgenden lokalen Projektionseinstellungen sind in `1.2.0` verfügbar.

Wählen Sie für native vertikale `ion-button`- und `ion-menu-button`-Aktionen, wer das Aussehen bestimmt:

| `buttonProjection` | Erscheinungsbild |
| --- | --- |
| `'system'` (Standard) | SwiftUI gestaltet die Schaltflächen und färbt ihre Symbole. Ionic-Füllungen, -Farben und -Rahmen werden nicht angewendet. |
| `'source'` | Projiziert die unterstützten Ionic-Füllungen und berechneten Farben gemäß [Regeln für quellengetreue Füllungen](#source-fill-rules). |

```ts
const rail = await enableVerticalControlArea({ buttonProjection: 'source' });
```

Sowohl `enableVerticalControlArea()` als auch `enableNativeUIShell()` akzeptieren diese Option. Verwenden Sie eine einzige Laufzeit und zerstören Sie diese vor dem Neustart mit anderen Optionen. Beide Modi erhalten Aktionen, Deaktivierungszustand und Gruppierung. Deaktivierte Symbole verwenden die native Darstellung für den deaktivierten Zustand. Diese Darstellungseinstellungen betreffen weder horizontale Bedienelemente noch Quellelemente oder Web-Rückfallklone. Vergleichen Sie das native Aussehen daher auf unterstütztem iOS.

**Migration von experimentellen Versionen:** Der Standard wechselt von quellengetreuer Gestaltung zu `system`. Setzen Sie `buttonProjection: 'source'`, um das bisherige Projektionsverhalten beizubehalten.

### Einzelne Schaltflächen oder Gruppen überschreiben

Verwenden Sie `data-projection` für lokale Ausnahmen. Bestehende Klassen bleiben unterstützt:

| Attribut | Gleichwertige Klasse |
| --- | --- |
| `data-projection="source"` | `ios-theme-projection-source` |
| `data-projection="system"` | `ios-theme-projection-system` |

```html
<ion-buttons data-projection="source">
  <ion-button fill="solid" aria-label="Add">
    <ion-icon name="add-outline" slot="icon-only"></ion-icon>
  </ion-button>
  <ion-button data-projection="system" aria-label="Search">
    <ion-icon name="search-outline" slot="icon-only"></ion-icon>
  </ion-button>
</ion-buttons>
```

Die erste passende Einstellung hat Vorrang:

1. Die lokale Einstellung der Schaltfläche.
2. Die lokale Einstellung ihrer nächstgelegenen `ion-buttons`.
3. Die Startoption `buttonProjection` oder, falls diese fehlt, `system`.

Auf demselben Element hat ein gültiger `data-projection`-Wert Vorrang vor den Klassen. Leere oder unbekannte Werte werden ignoriert. Ohne gültiges Attribut gewinnt `system`, wenn beide Klassen vorhanden sind. Das Entfernen eines Attributs greift auf die Klassen des Elements und danach auf die nächsthöhere Ebene zurück. Attribut- und Klassenänderungen gelten ohne Neustart der Laufzeit; Gruppierung und Platzierung bleiben unverändert.

Nur native vertikale `ion-button`- und `ion-menu-button`-Aktionen werten diese Einstellungen aus. Andere Vorfahren, Zurück-Schaltflächen, Tabs und FABs tun dies nicht. Sie verändern die Web-Gestaltung nicht. Um ein Bedienelement oder einen Unterbaum vollständig im Web zu belassen, verwenden Sie [`data-shell="disabled"`](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/native-ui-shell#supported-markup).

### Regeln für quellengetreue Füllungen

Für ein zu `source` aufgelöstes `ion-button` wird die Füllung unabhängig vom Projektionsmodus gewählt:

| Schaltfläche | Wirksame Füllung |
| --- | --- |
| Ausdrückliches `fill="clear"`, `"solid"` oder `"outline"` | Der ausdrücklich gesetzte Wert |
| Fehlende Füllung oder `fill="default"` innerhalb von `ion-buttons` | `clear` |
| Fehlende Füllung oder `fill="default"` außerhalb von `ion-buttons` | `buttonDefaultFill` |

`buttonDefaultFill` akzeptiert ausschließlich `'solid'` oder `null`; das Weglassen entspricht `null`. Verwenden Sie `'solid'` für das Standard-Schaltflächendesign von Ionic oder `null` für das standardmäßige Glasdesign dieses Themes. Dies gilt für jede zu `source` aufgelöste Schaltfläche, einschließlich einer lokalen Ausnahme unter einer globalen Einstellung `system`.

```ts
// System-Styling global beibehalten; lokale Quellbuttons verwenden den Standard-Fill von Ionic.
const rail = await enableVerticalControlArea({ buttonDefaultFill: 'solid' });
```

```html
<!-- In einer festen Toolbar außerhalb von ion-buttons: Ohne fill wird solid verwendet. -->
<ion-button data-projection="source" aria-label="Add">
  <ion-icon name="add-outline" slot="icon-only"></ion-icon>
</ion-button>
```

| Wirksame Füllung | Native Darstellung im Modus `source` |
| --- | --- |
| `clear` | Symbolfarbe ohne Glashintergrund; CSS-Hintergründe werden ignoriert |
| `solid` | Die berechnete Hintergrundfarbe färbt eine hervorgehobene Glasschaltfläche |
| `outline` | Berechnete Rahmenfarbe und -breite mit nativem Glas |
| `null` | Natives Glas mit den Symbolfarben der Quelle |

Setzen Sie innerhalb von `ion-buttons` ausdrücklich `fill="solid"`, um einen Hintergrund zu projizieren. `buttonDefaultFill: 'solid'` überschreibt nicht den transparenten Standardhintergrund der Gruppe. Die Färbung nativen Liquid Glass kann von der CSS-Farbe abweichen, insbesondere bei durchscheinenden Hintergründen. Mit dem iOS-Theme behalten normale `ion-buttons` die Gruppenprojektion bei; `ion-buttons.ios-theme-disabled` projiziert geeignete Schaltflächen einzeln. Lokale Projektionseinstellungen ändern diese Gruppierungsregel nicht.

## Tab-Leiste

Enthält die Anwendung `ion-tabs`, wandert deren Tab-Leiste in den reservierten Bereich und verwendet die nativen Duo-Randabstände. Der Ionic-Wert `slot` wählt keine andere Position. Ohne native Projektion zeigt die ruhende Web-Leiste nur Symbole und entspricht damit der ruhenden nativen Darstellung. Beim Drücken und Ziehen über diese Leiste zeigen alle Tabs mit Symbol und Beschriftung ihren Text, damit das ausstehende Ziel erkennbar bleibt. Die Web-Tab-Leiste nimmt Zeigereingaben im simulierten Systembereich entgegen. Native Tabs und eine wiederhergestellte Web-Tab-Leiste werden über 180ms eingeblendet; das Ausblenden erfolgt sofort. Reduzierte Bewegung deaktiviert diese Einblendung. Verwenden Sie `ion-menu`, wenn die Navigation zu einer Seitenleiste werden soll; dieser Modus wandelt Tabs nicht in ein Menü um. Web-Klone funktionieren auch ohne `ion-tabs`. Das Deaktivieren des Modus oder Verlassen der Seite entfernt die native Zuständigkeit beziehungsweise Web-Klone und stellt deren Quellen wieder her. Überschreiben Sie `--ios-theme-vertical-bars-toolbar-top`, wenn die simulierten Systembedienelemente ein anderes vertikales Layout verwenden.

## API des vertikalen Steuerbereichs

Die folgende generierte Referenz dokumentiert das von `enableVerticalControlArea()` zurückgegebene Handle.

<docgen-index>

* [`setPlacement(...)`](#setplacement)
* [`getStatus()`](#getstatus)
* [`suspend()`](#suspend)
* [`destroy()`](#destroy)
* [Interfaces](#interfaces)
* [Typaliase](#type-aliases)

</docgen-index>

<docgen-api>
<!--Die JSDoc-Kommentare in der Quelldatei aktualisieren und docgen erneut ausführen, um die folgende Dokumentation zu aktualisieren-->

### setPlacement(...)

```typescript
setPlacement(placement: VerticalBarEdge | VerticalBarPlacement, rtl?: boolean | undefined) => void
```

Wendet die von der Anwendung gewählte Platzierung sowohl auf Web- als auch auf native Bedienelemente an.

| Parameter           | Typ                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **`placement`** | <code><a href="#verticalbaredge">VerticalBarEdge</a> \| <a href="#verticalbarplacement">VerticalBarPlacement</a></code> |
| **`rtl`**       | <code>boolean</code>                                                                                                    |

--------------------


### getStatus()

```typescript
getStatus() => NativeUIShellStatus
```

Gibt den aktuellen Projektionszustand von Web und nativer Darstellung zurück.

**Rückgabe:** <code><a href="#nativeuishellstatus">NativeUIShellStatus</a></code>

--------------------


### suspend()

```typescript
suspend() => Promise<NativeUIShellSuspension>
```

Stellt projizierte Bedienelemente im Web wieder her, bis die zurückgegebene Freigabe fortgesetzt wird.

**Rückgabe:** <code>Promise&lt;<a href="#nativeuishellsuspension">NativeUIShellSuspension</a>&gt;</code>

--------------------


### destroy()

```typescript
destroy() => Promise<void>
```

Stoppt die Synchronisierung, stellt Web-Bedienelemente wieder her und gibt native Ressourcen frei.

--------------------


### Interfaces


#### VerticalBarPlacement

| Eigenschaft             | Typ                                                        | Beschreibung                                                                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`edge`**       | <code><a href="#verticalbaredge">VerticalBarEdge</a></code> |                                                                                                                                                                                                                                   |
| **`inset`**      | <code>number</code>                                         | Ausdrückliche Leistenbreite in CSS-Pixeln; weglassen, um die Safe-Area-Regeln des Stylesheets zu verwenden.                                                                                                                                               |
| **`nativeEdge`** | <code><a href="#verticalbaredge">VerticalBarEdge</a></code> | Native logische Kante, die das Geräte-Plugin der Anwendung meldet. Null oder eine nicht registrierte Kante verwendet im Modus verticalBarsOnly eine Web-Leiste, andernfalls das gewöhnliche Native-UI-Shell-Layout. Wird der Wert weggelassen, bleibt der zuletzt übergebene Wert erhalten. |


#### NativeUIShellStatus

| Eigenschaft            | Typ                                        |
| --------------- | ------------------------------------------- |
| **`state`**     | <code>'native' \| 'stopped' \| 'web'</code> |
| **`projected`** | <code>number</code>                         |
| **`updates`**   | <code>number</code>                         |
| **`reason`**    | <code>string</code>                         |


#### NativeUIShellSuspension

| Methode     | Signatur                    | Beschreibung                                                                                    |
| ---------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| **resume** | () =&gt; Promise&lt;void&gt; | Gibt diese Unterbrechung frei. Die native Projektion wird fortgesetzt, nachdem alle aktiven Unterbrechungen freigegeben wurden. |


### Typaliase


#### VerticalBarEdge

Logische Kante in Leserichtung, entsprechend UIVerticalBarEdge und capacitor-foldable.

<code>'leading' | 'trailing' | null</code>

</docgen-api>
