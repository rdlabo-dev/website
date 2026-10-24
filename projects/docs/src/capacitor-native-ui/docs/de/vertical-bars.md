---
title: "Vertical Bars"
sourceRevision: 692105738a7f4a3877baed82ffe0c24438aff3645fe32403dcf1294b2d17e5ce
---

# Vertical Bars

Vertical Bars verschiebt geeignete Ionic-Bedienelemente oder ausdrücklich markierte HTML-Schaltflächen in eine Seitenleiste und behält die Originalelemente als Quelle von Beschriftungen, Symbolen und Verhalten. Es funktioniert mit dem iOS-Theme oder einem vorhandenen Ionic-Theme, unabhängig von Scharnierstellung und vollständiger Native UI.

Wählen Sie vor der Nutzung dieser Referenz Ihre Einrichtung:

- **Ionic mit eigenem oder Standardtheme:** [Ionic-Seitenleisteneinrichtung](ionic-vertical-bars.md#try-it-in-your-existing-ionic-app).
- **Ohne Ionic:** [HTML-Einrichtung](framework-independent.md) und deren [Geräteseitenleisteneinrichtung](framework-independent.md#device-placement-for-vertical-bars). Verwenden Sie `/core` und Ihr eigenes Layout; die folgende Ionic-Einrichtung gilt nicht.
- **Bestehendes iOS-27-Theme und Native UI:** [Gerätepositionierung verbinden](#use-with-capacitor-foldable) mit Ihrer bestehenden Laufzeit.

Diese Seite behandelt Geräte-Plugin-Integration, Bedienelementeignung, native Darstellung und Laufzeitoptionen. Faltstellungsabhängige Ionic-Split-Panes beschreibt [Gerätelayout und Split Panes](../../theme-ios27/docs/vertical-bars-layout.md).

Vertical Bars und Unterstützung für iPhone Duo sind ab Version 2.0.0 stabil.

Alle Standardwerte und die laufenden Methoden `rail.enableVerticalControlArea()` / `rail.disableVerticalControlArea()` finden Sie unter [gemeinsame Konfiguration](configuration.md). [Reine HTML-Bedienelemente](framework-independent.md) verwenden dieselben nativen Seitenleistenrenderer.

## Vertical Bars aktivieren

Installieren Sie Native UI und das benötigte Foldable-Gerätezustands-Plugin als direkte Anwendungsabhängigkeiten:

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Folgen Sie für Ionic der [Standardeinrichtung](ionic-vertical-bars.md): Seitenleisten-CSS laden, Navigation konfigurieren und Foldables Anfangsposition sowie `barPlacementChange`-Ereignisse vor dem Start einer Laufzeit verbinden. Die [Integration unten](#use-with-capacitor-foldable) behandelt auch bestehende Laufzeiten und anwendungseigenes CSS. Erstellen Sie Web-Assets, führen Sie `npx cap sync ios` aus und erstellen Sie die native App erneut.

Eine Laufzeit allein reserviert keinen Web-Platz. Behalten Sie für die Standardeinrichtung das Geräteabonnement; manuelle Positionierung gehört zur [optionalen Browservorschau](ionic-vertical-bars.md#optional-browser-preview). Ist Native UI bereits aktiv, verwenden Sie sie wieder, statt eine weitere Laufzeit zu starten.

Der Einstiegspunkt `/vertical-bars` benötigt `@capacitor/core`, auch in Browser-Builds. Die ausschließliche Nutzung des Theme-Seitenleisten-CSS benötigt keine native Laufzeit. Für native Einrichtung und Navigationsübergänge folgen Sie der [Anleitung für bestehende Themes](ionic-vertical-bars.md).

Unter unterstütztem Capacitor iOS werden geeignete Bedienelemente nativ mit SwiftUI gerendert. Web, Android und nicht verfügbare native Projektion verwenden Web-Klone. Eine Browser-Vorschau kann Layout und Aktionen prüfen, aber nicht das native Schaltflächenaussehen vergleichen.

## Position und Web-Layout

Anwendung oder Theme verantworten Web-Abstände, Seitenleistenposition und Fallback-Stile. Das Plugin liest das bereitgestellte Ionic-Layout und die Position; es reserviert selbst keinen Platz für Web-Inhalte. Verwenden Sie mit dem iOS27-Theme dessen Helfer `setVerticalBarsLayout({ edge, inset })`. Rein native Anwendungen verwenden eigenes CSS; kein Theme-Helfer nötig. Native Verfügbarkeit stammt unabhängig vom Web-Layout aus Gerätemetriken.

Das [optionale Seitenleisten-Stylesheet des Themes](/ionic-theme-ios27/docs/vertical-bars-layout) liefert ein fertiges Layout. Seine Klassen und CSS-Variablen zwingen nicht zur Installation des Theme-Pakets: Anwendungen können ein gleichwertiges Layout selbst liefern. Die Laufzeit erkennt das Seitenleistenlayout derzeit anhand von `ios-theme-vertical-bars` auf `ion-app`, unabhängig vom Anbieter der Stile.

## Mit Capacitor Foldable verwenden

[`@erkamyaman/capacitor-foldable`](https://github.com/erkamyaman/capacitor-foldable) ist in der Standardkonfiguration von Vertical Bars erforderlich. Installieren Sie es wie oben mit Native UI und verbinden Sie seine Geräteposition mit Ihrem Web-Layout. Native UI abonniert Foldable nicht automatisch.

Die Positionsbeispiele benötigen Foldable **8.3.3 oder neuer innerhalb von Version 8**, einschließlich `BarPlacement.inset`. Verwendet Ihre App eine ältere Version, aktualisieren Sie mit `npm install @erkamyaman/capacitor-foldable@^8.3.3` und synchronisieren sowie erstellen Sie die native App anschließend neu.

| Zuständig | Verantwortung |
| --- | --- |
| Foldable | Anfänglichen Gerätezustand und spätere Positions-/Faltstellungsänderungen melden. |
| Anwendung oder Theme | Web-Platz reservieren und das Layout anhand gemeldeter logischer Kante und gemessenem Abstand wählen. |
| Native UI | Native Seitenleistenverfügbarkeit unabhängig prüfen und geeignete Quellbedienelemente projizieren. |

### Mit dem Ionic-Seitenleistenlayout des Themes

Verbinden Sie nach dem Laden des [Seitenleisten-Stylesheets](../../theme-ios27/docs/vertical-bars-layout.md) und dem Einbinden von `ion-app` die Geräteposition und starten Sie die Laufzeit einmal:

```ts
import { Foldable, type BarPlacement } from '@erkamyaman/capacitor-foldable';
import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const applyPlacement = ({ verticalBarEdge, inset }: BarPlacement) => setVerticalBarsLayout({ edge: verticalBarEdge, inset });
const listener = await Foldable.addListener('barPlacementChange', applyPlacement);
applyPlacement(await Foldable.getBarPlacement());
const rail = await enableNativeUI({ controls: 'verticalOnly' });
```

Ist bereits eine Laufzeit aktiv, behalten Sie sie und ergänzen Sie nur das Positionsabonnement. `setVerticalBarsLayout` löst logische Kanten für RTL auf; null als Kante stellt das gewöhnliche Web-Layout wieder her. Verwenden Sie den gemessenen Abstand statt einer festen Breite. Behalten Sie das Theme-Seitenleisten-Stylesheet; Foldables `ionic-tabs.css` ist für diese Integration nicht erforderlich.

Entfernen Sie beim Auflösen der verantwortlichen Anwendungsinstanz ihr Abonnement und zerstören Sie die von ihr verwaltete Laufzeit:

```ts
await listener.remove();
await rail.destroy();
```

### Mit anwendungseigenem CSS oder ohne Ionic

Verwenden Sie dasselbe Abonnement von `getBarPlacement()` / `barPlacementChange`, wenden Sie Kante und Abstand jedoch auf eigenes CSS an, statt `setVerticalBarsLayout` aufzurufen. null als Kante bedeutet, dass Ihr Layout gewöhnliche Abstände wiederherstellen sollte. Behalten Sie für Ionic die oben beschriebenen Seitenleistenklassen; für reines HTML verwenden Sie `/core` und die [Geräteseitenleisteneinrichtung](framework-independent.md#device-placement-for-vertical-bars). Weder Foldable noch Native UI liefert das Anwendungs-CSS. Explizite HTML-Seitenleistenmarkierungen bleiben unabhängig von CSS aktiv; um diese Quellen bei null als Kante an ihre ursprüngliche Position zurückzuführen, rufen Sie `disableVerticalControlArea()` auf und bei Rückkehr einer Kante `enableVerticalControlArea()`. Serialisieren Sie diese Änderungen mit Ihren Layoutaktualisierungen.

Trennen Sie Web-Layoutaktualisierungen von nativer Verfügbarkeit: Übergeben Sie Foldables Kante nicht über die veraltete Option `nativeEdge`. Native UI liest diese Fähigkeit selbst. Nur eine optionale Browser-Layoutvorschau ersetzt dieses Abonnement durch simulierte Positionierung.

Lesen Sie für scharnierabhängiges Inhaltslayout separat `getFoldState()` und abonnieren Sie `foldStateChange`. Die Scharnierstellung wählt keine Bedienelemente und aktiviert keine Seitenleiste; siehe [Faltstellungsabonnement und Split-Pane-Beispiel](../../theme-ios27/docs/vertical-bars-layout.md#read-the-device-layout) des Themes.

## Native Darstellung

Unter unterstützten iOS-Versionen ändert `.ios-theme-vertical-bars` nur Bedienelemente, die das System in die physische Seitenleiste versetzt. Native UI stellt geeignete Tabs, Zurücknavigation, Menüschaltflächen und Werkzeugleistenaktionen nach dem Anwenden der Klasse über eine SwiftUI-`TabView` und Werkzeugleiste dar. Meldet das OS eine Seitenleistenkante — auf iPhone Duo mit Verknüpfung gegen iOS 27.1 oder neuer —, muss diese zur angewendeten Position passen; eine abweichende Meldung belässt die Seitenleiste im Web. Ohne vom Gerät gemeldete Kante bleibt der Web-Fallback. Eine Positionspräferenz aktiviert keine nicht unterstützte native Seitenleiste. SwiftUI bestimmt adaptive Position und Liquid Glass-Darstellung; Ionic bleibt Quelle für Beschriftungen, Symbole, Auswahl-/Deaktivierungszustand, Routing, Formularübermittlung und Klickhandler.

Die SwiftUI-Fläche wird auf die Systemseitenleiste zugeschnitten und nur dort auf Treffer geprüft. Web-Inhalt bleibt außerhalb dieses physischen Bereichs sichtbar und interaktiv. Die Laufzeit aktualisiert die Tab-Auswahl optimistisch, bevor sie die Aktion an das ursprüngliche `ion-tab-button` weiterleitet, mit demselben Ereignis- und Schutz vor veralteten Revisionen wie andere native Bedienelemente. Bei Verwendung des optionalen Stylesheets folgt das Overlay-Layout dem [Theme-Seitenleistenlayout](/ionic-theme-ios27/docs/vertical-bars-layout#reserve-the-vertical-rail); eigene Layouts bleiben Aufgabe der Anwendung.

### Native Popover (nur Vertical Bars)

Native Popover-Darstellung ist auf Popover beschränkt, die an akzeptierten nativen Vertical Bars-`ion-button`-Bedienelementen verankert sind. Sie ist mit der eigenständigen Vertical Bars-Laufzeit verfügbar; vollständige Native UI ist nicht erforderlich. Aktivieren Sie sie ausdrücklich beim Laufzeitstart (`popover` ist standardmäßig `false`):

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const rail = await enableNativeUI({
  controls: 'verticalOnly',
  ionic: { verticalBars: { popover: true } },
});
```

Verwenden Sie ein `ion-popover`, dessen `trigger` die projizierte Schaltfläche identifiziert, oder übergeben Sie deren Klickereignis an `PopoverController.create({ event, ... })`. Gewöhnliche Werkzeugleisten- und Inhalts-Popover bleiben im Web. Fällt ein seitenleistenverankertes Popover auf Web-Rendering zurück, kehrt auch die Leiste bis zum Schließen zur Web-Projektion zurück. Siehe [Verhalten und Einschränkungen nativer Popover](native-ui.md#popovers-anchored-to-vertical-bars).

## Werkzeugleistenaktionen

Ein normales `ion-back-button` kann von außerhalb einer fest positionierten Werkzeugleiste projiziert werden, auch aus geroutetem Inhalt oder einer dauerhaften Anwendungshülle. `ion-menu-button` und andere Werkzeugleistenaktionen benötigen eine fest positionierte Werkzeugleiste.

Standardmäßig wechselt ein `ion-button` in die Seitenleiste, wenn es ein `ion-icon` oder SVG mit `slot="icon-only"` enthält. Die Schaltfläche muss in einer festen `ion-toolbar` direkt innerhalb von `ion-header` oder `ion-footer` außerhalb scrollenden `ion-content` liegen.

| Symbol-Markup | Position |
| --- | --- |
| `slot="icon-only"` | Vertikale Seitenleiste |
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

### Aktionen und Gruppierung unabhängig auswählen

Konfigurieren Sie mit `controls` Werkzeugleistenauswahl und Gruppierung. Jedes Feld akzeptiert `true`, `false`, `'horizontalOnly'` oder `'verticalOnly'`; ausgelassene Felder sind standardmäßig `true`. Verwenden Sie `controls: 'verticalOnly'` für die gesamte Standardauswahl in der Seitenleiste. Lokale Attribute können Auswahl überschreiben; explizite Quellen und Erweiterungen bleiben unabhängig. Siehe [alle Auswahlstandards](configuration.md#selection-defaults).

| Option | Verantwortung | Was sie nicht tut |
| --- | --- | --- |
| `button` | Geeignete `ion-button`- und `ion-menu-button`-Aktionen innerhalb oder außerhalb von `ion-buttons` automatisch auswählen. | Wählt keine Zurückschaltflächen. |
| `buttonGroup` | Ausgewählte Aktionen in `ion-buttons` bei erfüllten bestehenden Gruppierungsregeln als Gruppe projizieren lassen. | Wählt, aktiviert oder deaktiviert keine Kindaktion. |
| `backButton` | Geeignete `ion-back-button` unabhängig von ihrer Elterngruppe automatisch auswählen. | Gruppiert Zurückschaltflächen nicht mit anderen Aktionen. |

Für gewöhnliche reine Symbolschaltflächen in einer Gruppe ohne lokale Attribute:

| `buttonGroup` | `button` | Ergebnis |
| --- | --- | --- |
| `true` | `true` | Geeignete Schaltflächen werden bei geeigneter Gruppe gemeinsam projiziert. |
| `false` | `true` | Geeignete Schaltflächen werden einzeln projiziert. |
| `true` | `false` | Keine gewöhnlichen Schaltflächen werden projiziert; Gruppierung allein wählt nichts. |
| `false` | `false` | Keine gewöhnlichen Schaltflächen werden projiziert. |

Diese Ergebnisse betreffen nur gewöhnliche Aktionen. Zurücknavigation, Tabs und native Suche sind unabhängig. Um unter den Werkzeugleistenaktionen beispielsweise nur Zurücknavigation auszuwählen:

```ts
const rail = await enableNativeUI({
  controls: { buttonGroup: false, button: false, backButton: 'verticalOnly', tabs: 'verticalOnly', segment: false, fab: false },
});
```

Dies deaktiviert weder Tab-Projektion noch Tab-Seitenleisten-CSS.

### Explizite Aktionsauswahl und lokale Gruppierung

Verwenden Sie `data-vertical-bars="true|false"` auf dem Element, dessen Verhalten Sie überschreiben möchten. Das Attribut wird **nicht vererbt**.

| Element | `data-vertical-bars="true"` | `data-vertical-bars="false"` | Standard bei fehlendem oder ungültigem Wert |
| --- | --- | --- | --- |
| `ion-button` / `ion-menu-button` | Aktion auswählen, einschließlich unterstützter Textaktionen ohne icon-only-Slot. | Aktion aus der Seitenleiste ausschließen. | `controls.button` und automatische Formregeln. |
| `ion-buttons` | Gruppierung bereits ausgewählter Aktionen erlauben. | Ausgewählte Aktionen einzeln projizieren. | `controls.buttonGroup` und Gruppierungseignung. |
| `ion-back-button` | Zurücknavigation unabhängig von ihrer Gruppe auswählen. | Diese Zurückschaltfläche aus der Seitenleiste ausschließen. | `controls.backButton` und Zurückschaltflächeneignung. |
| `ion-tab-bar` | Geeignete Seitenleisten-Tabs und ihre native Suchdarstellung auswählen. | Native Seitenleisten-Tab-Auswahl deaktivieren; bestehendes Web-Layout bleibt. | `controls.tabs` und Tab-Leisteneignung. |

Das Gruppenattribut wählt seine Kinder niemals aus und schließt sie nicht aus. Alle Aktivierungen unterliegen weiterhin strukturellen Ausschlüssen und Seitenleistenverfügbarkeit.

Leere oder unbekannte Attributwerte werden ignoriert. So deaktivieren Sie automatische Aktionsauswahl und wählen eine Textschaltfläche ausdrücklich aus:

```ts
const rail = await enableNativeUI({
  controls: { buttonGroup: 'verticalOnly', button: false, backButton: false, tabs: 'verticalOnly', segment: false, fab: false },
});
```

```html
<ion-buttons>
  <ion-button data-vertical-bars="true">Save</ion-button>
  <ion-button>Cancel</ion-button>
</ion-buttons>
```

Nur Save wird verschoben; Cancel bleibt in der horizontalen Werkzeugleiste. `data-vertical-bars="true"` auf der Gruppe würde Cancel nicht auswählen.

So gruppieren Sie zwei ausdrücklich ausgewählte Aktionen auch bei `buttonGroup: false`:

```html
<ion-buttons data-vertical-bars="true">
  <ion-button data-vertical-bars="true">Save</ion-button>
  <ion-button data-vertical-bars="true">Done</ion-button>
</ion-buttons>
```

Setzen Sie das Gruppenattribut auf `false`, um dieselben Aktionen einzeln zu projizieren. Die bestehenden Eignungsregeln bleiben: Die gesamte Gruppe muss geeignet sein und eine einzelne gewöhnliche Schaltfläche wird allein projiziert. Eine Gruppe mit horizontalem Inhalt projiziert ihre ausgewählten Aktionen einzeln. Quellgruppe und nicht ausgewählte Kinder bleiben in ihrer ursprünglichen Werkzeugleiste.

Explizite Aktionsauswahl benötigt weiterhin eine feste Kopf-/Fußwerkzeugleiste. Shell-Ausschlüsse, horizontal-only-Klassen und Overlay-Einschränkungen gelten weiterhin. Position und Gruppierung werden für den Besuch der gerouteten Seite erfasst: Attributänderungen wirken nach Verlassen und erneutem Betreten. Starten Sie die Laufzeit neu, um Startoptionen zu ändern.

### Zurückschaltflächen innerhalb von Gruppen

Ein `ion-back-button` bleibt auch innerhalb von `ion-buttons` eine Navigationsaktion. Es ignoriert `buttonGroup`, `button` und das `data-vertical-bars`-Attribut der Gruppe. Sein eigenes Attribut überschreibt `backButton`. Es verwendet die dedizierte Zurückposition, niemals eine gewöhnliche Aktionsgruppe, und wird nicht als Werkzeugleistenaktion dupliziert.

```html
<ion-buttons data-vertical-bars="false">
  <!-- Wird weiterhin projiziert, wenn backButton true ist. -->
  <ion-back-button></ion-back-button>
</ion-buttons>
```

Der Ionic-DOM-Container definiert die Navigationsrolle nicht neu. Das Theme leitet die projizierte Zurückaktion an Ionic weiter; es ersetzt Ionic-Routing nicht durch einen nativen Navigationsstapel. Natives Layout bleibt systemverwaltet.

Bestehende Eignungsregeln für Zurückschaltflächen gelten weiterhin, einschließlich unterstütztem Standardsymbol/-farbe und Seitenpositionsregeln. `data-native-ui="disabled"` auf Vorfahren, `.ios-theme-horizontal-only` auf `ion-buttons` und andere strukturelle Ausschlüsse bleiben wirksam; sie unterscheiden sich von der Gruppierungseinstellung.

### Position und Darstellung

| Einstellung | Werte | Verantwortung | Gilt für |
| --- | --- | --- | --- |
| `data-native-ui` | `button`, `back-button`, `disabled` | Explizite Quelle deklarieren oder Teilbaum ausschließen. | [Explizite Quellelemente](framework-independent.md#2-mark-source-controls); `disabled` gilt auch für Vorfahren. |
| `data-native-ui-placement` | `element`, `rail` | Ursprüngliche Elementposition wählen oder Seitenleiste anfordern. | Explizite Quellen; `element` hält auch automatische Ionic-Bedienelemente an ihrer ursprünglichen Position. |
| `data-vertical-bars` | `true`, `false` | Standardwerte für Seitenleistenauswahl oder Gruppierung überschreiben. | Oben aufgeführte Ionic-Aktionen und Gruppen. |
| `data-horizontal-bars` | `true`, `false` | Standardwerte für Auswahl oder Gruppierung an gewöhnlicher Position überschreiben. | [Gewöhnliche Ionic-Bedienelemente](native-ui.md#toolbar-selection-and-grouping). |
| `data-projection` | `system`, `source` | Native Darstellung wählen, ohne eine Aktion auszuwählen. | Native vertikale `ion-button` und `ion-menu-button`; vom nächsten `ion-buttons` geerbt. |

Auswahlattribute werden nicht vererbt. Darstellung folgt der unten beschriebenen Priorität Schaltfläche vor Gruppe. Ein Attribut macht niemals nicht unterstütztes Markup oder eine fehlende native Seitenleiste verfügbar.

Die Seitenleiste teilt eine helle/dunkle Darstellung über alle projizierten Bedienelemente. Beachten Sie beim Konfigurieren des Web-Themes [gemeinsame Vertical Bars-Darstellung](appearance.md#shared-vertical-bars-appearance).

### Das Aussehen von Schaltflächen wählen

Verwenden Sie `ionic.verticalBars.buttonProjection`, um die native Schaltflächendarstellung zu wählen.

Wählen Sie für native vertikale `ion-button`- und `ion-menu-button`-Aktionen, wer das Aussehen bestimmt:

| `buttonProjection` | Darstellung |
| --- | --- |
| `'system'` (Standard) | SwiftUI gestaltet Schaltflächen und tönt ihre Symbole. Ionic-Füllung, -Farben und -Ränder werden nicht angewendet. |
| `'source'` | Projiziert unterstützte Ionic-Füllung und berechnete Farben gemäß [Quellfüllregeln](#source-fill-rules). |

```ts
const rail = await enableNativeUI({ controls: 'verticalOnly', ionic: { verticalBars: { buttonProjection: 'source' } } });
```

`enableNativeUI()` und das eigenständige `enableVerticalControlArea()` akzeptieren diese Einstellungen innerhalb von `ionic.verticalBars`. Verwenden Sie eine Laufzeit und zerstören Sie sie vor einem Neustart mit anderen Optionen. Beide Modi erhalten Aktionen, Deaktivierungszustand und Gruppierung. Deaktivierte Symbole verwenden die native deaktivierte Darstellung. Diese Einstellungen betreffen keine horizontalen Bedienelemente, Quellelemente oder Web-Fallback-Klone; vergleichen Sie das native Aussehen daher unter unterstütztem iOS.

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

Nur native vertikale `ion-button`- und `ion-menu-button`-Aktionen werten diese Einstellungen aus. Andere Vorfahren, Zurückschaltflächen, Tabs und FABs tun dies nicht. Die Einstellungen ändern keine Web-Stile. Um ein Bedienelement oder einen Teilbaum vollständig im Web zu belassen, verwenden Sie [`data-native-ui="disabled"`](native-ui.md#supported-markup).

### Regeln für quellengetreue Füllungen

Für ein zu `source` aufgelöstes `ion-button` wird die Füllung unabhängig vom Projektionsmodus gewählt:

| Schaltfläche | Wirksame Füllung |
| --- | --- |
| Explizites `fill="clear"`, `"solid"` oder `"outline"` | Expliziter Wert |
| Fehlendes fill oder `fill="default"` innerhalb von `ion-buttons` | `clear` |
| Fehlendes fill oder `fill="default"` außerhalb von `ion-buttons` | `buttonDefaultFill` |

`verticalBars.buttonDefaultFill` akzeptiert `'solid'` oder `'glass'`; Auslassen entspricht `'glass'`. Verwenden Sie `'solid'` für Ionics Standardschaltflächendesign oder `'glass'` für ein Glasdesign. Dies gilt für jede zu `source` aufgelöste Schaltfläche, einschließlich lokaler Ausnahmen unter einer globalen `system`-Einstellung.

```ts
// Systemgestaltung global behalten; lokale Quellschaltflächen verwenden Ionics Standardfüllung.
const rail = await enableNativeUI({ controls: 'verticalOnly', ionic: { verticalBars: { buttonDefaultFill: 'solid' } } });
```

```html
<!-- In einer festen Werkzeugleiste außerhalb von ion-buttons: Fehlendes fill wird zu solid aufgelöst. -->
<ion-button data-projection="source" aria-label="Add">
  <ion-icon name="add-outline" slot="icon-only"></ion-icon>
</ion-button>
```

| Wirksame Füllung | Native Darstellung im `source`-Modus |
| --- | --- |
| `clear` | Symbolfarbe ohne Glashintergrund; CSS-Hintergründe werden ignoriert |
| `solid` | Berechnete Hintergrundfarbe tönt eine hervorgehobene Glasschaltfläche |
| `outline` | Berechnete Randfarbe und -breite mit nativem Glas |
| `null` | Natives Glas mit Quellsymbolfarben |

Setzen Sie innerhalb von `ion-buttons` ausdrücklich `fill="solid"`, um einen Hintergrund zu projizieren. `buttonDefaultFill: 'solid'` überschreibt nicht den transparenten Standardhintergrund der Gruppe. Die Färbung nativen Liquid Glass kann von der CSS-Farbe abweichen, insbesondere bei durchscheinenden Hintergründen. Mit dem iOS-Theme behalten normale `ion-buttons` die Gruppenprojektion bei; `ion-buttons.ios-theme-disabled` projiziert geeignete Schaltflächen einzeln. Lokale Projektionseinstellungen ändern diese Gruppierungsregel nicht.

## Tab-Leiste

Enthält die Anwendung `ion-tabs`, wandert deren Tab-Leiste in den reservierten Bereich und verwendet die nativen Duo-Randabstände. Der Ionic-Wert `slot` wählt keine andere Position. Ohne native Projektion zeigt die ruhende Web-Leiste nur Symbole und entspricht damit der ruhenden nativen Darstellung. Beim Drücken und Ziehen über diese Leiste zeigen alle Tabs mit Symbol und Beschriftung ihren Text, damit das ausstehende Ziel erkennbar bleibt. Die Web-Tab-Leiste nimmt Zeigereingaben im simulierten Systembereich entgegen. Native Tabs und eine wiederhergestellte Web-Tab-Leiste werden über 180ms eingeblendet; das Ausblenden erfolgt sofort. Reduzierte Bewegung deaktiviert diese Einblendung. Verwenden Sie `ion-menu`, wenn die Navigation zu einer Seitenleiste werden soll; dieser Modus wandelt Tabs nicht in ein Menü um. Web-Klone funktionieren auch ohne `ion-tabs`. Das Deaktivieren des Modus oder Verlassen der Seite entfernt die native Zuständigkeit beziehungsweise Web-Klone und stellt deren Quellen wieder her. Überschreiben Sie `--ios-theme-vertical-bars-toolbar-top`, wenn die simulierten Systembedienelemente ein anderes vertikales Layout verwenden.

## API des vertikalen Steuerbereichs

Die folgende generierte Referenz dokumentiert das von `enableVerticalControlArea()` zurückgegebene Handle.

<docgen-index>

- [`setPlacement(...)`](#setplacement)
- [`enableVerticalControlArea()`](#enableverticalcontrolarea)
- [`disableVerticalControlArea()`](#disableverticalcontrolarea)
- [Schnittstellen](#interfaces)
- [Typ-Aliase](#type-aliases)

</docgen-index>

<docgen-api>
<!--Die JSDoc-Kommentare in der Quelldatei aktualisieren und docgen erneut ausführen, um die folgende Dokumentation zu aktualisieren-->

### setPlacement(...)

```typescript
setPlacement(placement: VerticalBarEdge | VerticalBarPlacement, rtl?: boolean | undefined) => void
```

Veralteter Web-CSS-Adapter. Verwenden Sie stattdessen den Theme-Helfer setVerticalBarsLayout.

| Parameter           | Typ                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **`placement`** | <code><a href="#verticalbaredge">VerticalBarEdge</a> \| <a href="#verticalbarplacement">VerticalBarPlacement</a></code> |
| **`rtl`**       | <code>boolean</code>                                                                                                    |

---

### enableVerticalControlArea()

```typescript
enableVerticalControlArea() => Promise<void>
```

Aktiviert Seitenleistenprojektion, sofern verfügbar, und erhält andere Einstellungen. Wird nach destroy abgewiesen.

---

### disableVerticalControlArea()

```typescript
disableVerticalControlArea() => Promise<void>
```

Stellt Seitenleistenquellen im Web wieder her, ohne gewöhnliche native Bedienelemente zu stoppen. Wird nach destroy abgewiesen.

---

### Interfaces

#### VerticalBarPlacement

| Eigenschaft | Typ | Beschreibung |
| --- | --- | --- |
| **`edge`** | <code><a href="#verticalbaredge">VerticalBarEdge</a></code> | |
| **`inset`** | <code>number</code> | Explizite Seitenleistenbreite in CSS-Pixeln; ausgelassen gelten die Safe-Area-Regeln des Stylesheets. |
| **`nativeEdge`** | <code><a href="#verticalbaredge">VerticalBarEdge</a></code> | Ignoriert. Native Verfügbarkeit stammt aus den eigenen Gerätemetriken des Plugins. |

### Typaliase

#### VerticalBarEdge

Logische Kante in Leserichtung, entsprechend UIVerticalBarEdge und capacitor-foldable.

<code>'leading' | 'trailing' | null</code>

</docgen-api>
