---
title: "Native UI"
sourceRevision: "e9a1cedfed8b18c585dc11052d77777508c04b0638c4dc1067f8daf5ee21d2a5"
---

# Native UI

Native UI wird **ab Version 2.0.0 offiziell unterstützt**. Die frühere Native UI Shell Preview war in den Theme-Versionen 1.2.0 und 1.2.1 enthalten; diese Anleitung beschreibt das separate Paket und seine umbenannte API. Siehe [Migration](migration.md#native-ui-naming-changes). App-lokale [Erweiterungen](native-ui-extensions.md) bleiben experimentell.

Native UI ergänzt eine Ionic-App um native Navigations- und Aktionsbedienelemente rund um ihre Web-Inhalte. Das optionale Capacitor-iOS-Plugin stellt unterstützte fixierte Ionic-Bedienelemente mit UIKit oder SwiftUI und dem systemeigenen Liquid Glass-Material dar. Seiteninhalt, Scrollen, Anwendungszustand und Routing bleiben in Ionics WebView.

Die [Funktionsweise der Projektion](../README.md#how-projection-works) beschreibt das gemeinsame DOM- und native Darstellungsmodell. Diese Seite ist die Referenz für unterstützte Bedienelemente und APIs. Für Erstinstallation und ein funktionierendes Beispiel beginnen Sie mit [Ionic-Einrichtung](setup.md) oder [HTML-Einrichtung](framework-independent.md).

## Native UI aktivieren

Sie verwenden bereits das iOS-Theme? Folgen Sie [Native UI zum Theme hinzufügen](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.0/packages/theme-ios27/docs/add-native-ui.md). Für andere Web-Darstellungen verwenden Sie die [Native UI-Einrichtung](setup.md).

Installieren Sie das native Paket als direkte Anwendungsabhängigkeit, damit Capacitor es erkennen kann:

```bash
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
npx cap sync ios
```

Behalten Sie Ihre Web-Stile und aktivieren Sie Native UI einmal beim Anwendungsstart. Das iOS-27-Theme ist optional:

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

void enableNativeUI();
```

`enableNativeUI()` liest auch den wirksamen oberen linken Eckenradius der WebView und wendet ihn auf Seitenübergänge an. Um nur den Übergang zu konfigurieren, ohne native Bedienelemente zu aktivieren, rufen Sie Folgendes auf:

```ts
import { configureNativeTransition } from '@rdlabo/capacitor-native-ui';

await configureNativeTransition();
```

### Navigation und native Builds

| Einrichtung | Aktion |
| --- | --- |
| `iosTransitionAnimation` des Themes | Beibehalten; native Übergänge sind bereits koordiniert. |
| Ionic-Standardanimation oder eigene Animation | [Übergangsadapter](migration.md#native-ui-transition-adapter) konfigurieren. |
| Plugin installiert oder aktualisiert | `npx cap sync ios` ausführen und native App neu erstellen. |
| SPM oder CocoaPods | Bestehenden Abhängigkeitsmanager behalten; beide werden unterstützt. |
| Optionale Migration von CocoaPods zu SPM | `npx cap spm-migration-assistant` ausführen und das generierte `CapApp-SPM`-Paket mit dem App-Target in Xcode verknüpfen. |
| Gewöhnliches natives Glas | Erfordert Xcode 26+, Capacitor 8 und iOS 26+. |
| Web, Android, SSR oder älteres iOS | Web-Implementierung beibehalten. |

Weder Registrierung je Seite noch Komponentenliste, nativer Callback oder Swift-View-Controller sind erforderlich.

Diese Funktion muss ausdrücklich aktiviert werden. Der gewöhnliche Theme-Einstiegspunkt `@rdlabo/ionic-theme-ios27` importiert Capacitor nicht. Native Laufzeiteinstiegspunkte benötigen `@capacitor/core`, auch in Browser-Builds. Capacitor-Sync erkennt und erstellt native Quellen weiterhin, wenn `@rdlabo/capacitor-native-ui` eine direkte Abhängigkeit eines Capacitor-Projekts ist, selbst wenn die Anwendung `enableNativeUI()` nicht aufruft.

Die native helle/dunkle Darstellung wird aus dem berechneten Stil jedes Quellelements aufgelöst. Theme-Vererbung, Priorität, laufende Aktualisierungen und gemeinsames Vertical Bars-Verhalten beschreibt [Helle und dunkle Darstellung](appearance.md).

## Werkzeugleistenauswahl und Gruppierung

Verwenden Sie `controls`, um Auswahl und Gruppierung anhand der Position festzulegen:

```ts
const shell = await enableNativeUI({
  controls: {
    buttonGroup: 'verticalOnly',
    button: true,
    backButton: true,
  },
});
```

Hier werden gewöhnliche Werkzeugleistenaktionen einzeln projiziert und geeignete Seitenleistenaktionen können gruppiert werden. Alle sechs Bedienelementfelder akzeptieren `true`, `false`, `'horizontalOnly'` oder `'verticalOnly'`; ausgelassene Felder sind `true`. Verwenden Sie `controls: 'verticalOnly'`, um alle automatischen Bedienelemente nur in der Seitenleiste zu wählen. Die vollständige Tabelle steht unter [Auswahlstandards](configuration.md#selection-defaults).

`button` wählt gewöhnliche Aktionen innerhalb oder außerhalb einer Gruppe einschließlich Menüschaltflächen. `buttonGroup` gruppiert nur bereits ausgewählte Aktionen. Mit `buttonGroup: true, button: false` wird ohne explizite Auswahl keine gewöhnliche Aktion projiziert. `backButton` wählt Zurücknavigation unabhängig, einschließlich Zurückschaltflächen in `ion-buttons`; diese werden nie Teil gewöhnlicher Gruppen.

`ionic.auto` aktiviert oder deaktiviert automatische Ionic-Erkennung. Explizite `data-native-ui`-Quellen und Erweiterungen bleiben von `controls` und `ionic.auto` unabhängig.

Starten Sie die Laufzeit neu, um diese Startoptionen zu ändern.

| Attribut | Gilt für | `true` | `false` |
| --- | --- | --- | --- |
| `data-horizontal-bars` | Gewöhnliche Position | Aktion auswählen oder Gruppierung auf `ion-buttons` erlauben. | Aktion ausschließen oder Gruppierung auf `ion-buttons` deaktivieren. |
| `data-vertical-bars` | Vertikale Seitenleiste | Aktion auswählen oder Gruppierung auf `ion-buttons` erlauben. | Aktion ausschließen oder Gruppierung auf `ion-buttons` deaktivieren. |

Auf einer Schaltfläche/Zurückschaltfläche steuern diese Attribute die Auswahl; auf `ion-buttons` nur die Gruppierung. Keines wird vererbt. Fehlende, ungültige oder leere Werte verwenden den passenden `controls`-Standard. Explizite Aktivierungen vertikaler Aktionen und ihre Eignungsregeln beschreibt [Vertical Bars](vertical-bars.md#explicit-action-selection-and-local-grouping).

```html
<ion-buttons data-horizontal-bars="false" data-vertical-bars="true">
  <ion-button fill="clear">First</ion-button>
  <ion-button fill="clear">Second</ion-button>
</ion-buttons>
```

Die obigen horizontalen Aktionen werden bei sonstiger Eignung einzeln projiziert.
Das vertikale Attribut erlaubt Gruppierung, wählt jedoch nicht die reinen Textkinder aus;
ergänzen Sie auf jeder Schaltfläche `data-vertical-bars="true"`, um sie ausdrücklich auszuwählen.

Diese Einstellungen entfernen kein CSS und ändern das Quelllayout nicht. Entfernt die App die Glasgestaltung der Quellgruppe, verhindert `controls: { buttonGroup: 'verticalOnly' }` zusätzlich eine gemeinsame native Gruppenfläche. Bestehende Anforderungen an Komponentenmodus, feste Werkzeugleiste, Füllung/Farbe und Shell-Ausschluss gelten weiterhin. Eine horizontale transparente Schaltfläche innerhalb von `ion-buttons` kann einzeln projiziert werden, wenn Gruppierung deaktiviert oder die Gesamtgruppe ungeeignet ist. Zurückschaltflächen werden niemals gewöhnliche Gruppenmitglieder. Horizontale lokale Überschreibungen werden laufend neu ausgewertet; vertikale Positionierung behält ihre Regeln je Seitenbesuch. `data-projection="source|system"` bleibt eine separate Einstellung der nativen vertikalen Darstellung.

Das eigenständige `enableVerticalControlArea()` setzt `controls` standardmäßig auf `'verticalOnly'`. Explizite Quellen und Erweiterungen bleiben unabhängig. Verwenden Sie einen Starteinstiegspunkt pro Anwendung.

## Unterstütztes Markup

Die folgende Tabelle beschreibt gewöhnliche Native UI. Vertical Bars verwendet die separaten [Werkzeugleistenaktionsregeln](vertical-bars.md#toolbar-actions).

| Ionic-Komponente | Unterstützte Darstellung und Position | Natives Rendering |
| --- | --- | --- |
| `ion-button` | `fill="default"` oder transparent innerhalb ungruppierter `ion-buttons`, in einer festen Kopf-/Fußwerkzeugleiste | Glas-`UIButton` |
| `ion-buttons` | Feste Werkzeugleiste, mindestens zwei direkte transparente `ion-button`-/`ion-menu-button`-Kinder mit gemeinsamer Theme-Glasfläche | Eine `UIGlassEffect`-Fläche mit unabhängigen nativen Schaltflächen |
| `ion-back-button` | Standardsymbol und -farbe in einer festen Kopf-/Fußwerkzeugleiste | Glas-`UIButton` mit aufgelöster Ionic-Beschriftung/-Symbol |
| `ion-menu-button` | Feste Werkzeugleiste innerhalb der Theme-Glas-`ion-buttons` | Glas-`UIButton`; ursprüngliches Ionic-Menüumschalten |
| `ion-tab-bar` | Feste Tabs, reine Symbol-/Texteinträge, ein Symbol pro Eintrag, Punkt-/Text-Badges, Auswahl- und Deaktivierungszustand | `UITabBar` und `UITabBarItem` |
| `ion-segment` | Feste Werkzeugleiste, nicht scrollbar, Text **oder** ein Symbol pro Eintrag | `UISegmentedControl` |
| `ion-fab` / `ion-fab-button` / `ion-fab-list` | Glas-FAB im festen Slot von `ion-content`; eine Hauptschaltfläche und optionale gerichtete Listen | Permanenter Glas-`UIButton` pro Schaltfläche; eine FAB-Synchronisierungsgruppe |

Für gewöhnliche Native UI sind nur unterstützte Komponenten im iOS-Modus geeignet. Theme-Variablen sind nicht erforderlich; `enableNativeUI()` aktiviert native Projektion. Explizit aktivierte Vertical Bars sind wie unten beschrieben modusunabhängig. `ios-theme-disabled` und das ältere `ios26-disabled` auf einem Element oder Vorfahren schließen es immer aus. Ein deaktiviertes Theme auf einem Tab-/Segmenteintrag belässt die gesamte Gruppe im Web.

### Native Projektion deaktivieren

Verwenden Sie `data-native-ui="disabled"` oder die gleichwertige Klasse `native-ui-disabled`, um nur iOS Native UI zu deaktivieren und das Web-Theme zu behalten. Dies schließt das Element und alle Nachfahren aus. Laufendes Hinzufügen oder Entfernen des Attributs oder der Klasse stellt automatisch Web-Rendering wieder her oder prüft die native Eignung erneut.

Nur der exakte Wert `disabled` deaktiviert; leere oder unbekannte Werte deaktivieren nicht. Entfernen Sie das Attribut, um automatische Ionic-Projektion wiederherzustellen. Stellen Sie bei explizit deklarierten HTML-Bedienelementen stattdessen den ursprünglichen Wert `data-native-ui="button"` oder `data-native-ui="back-button"` wieder her. Alternativ deaktiviert `data-native-ui="disabled"` auf einem Elternteil den Teilbaum und erhält die Deklarationen der Kinder. Entfernen Sie gegebenenfalls auch `native-ui-disabled`. Dies deaktiviert keine Klicks und ändert das Web-Theme nicht. Die laufzeiteigene Markierung `data-native-ui-projected` ist separat; Anwendungen sollten sie nicht setzen. Das frühere Ausschlussattribut beschreibt die [Migration](migration.md#native-ui-naming-changes).

```html
<ion-toolbar data-native-ui="disabled">
  <ion-button>Web glass button</ion-button>
</ion-toolbar>
```

Bei gewöhnlicher Position belässt ein expliziter Ausschluss durch `data-native-ui="disabled"` oder `.native-ui-disabled` innerhalb einer gemeinsamen Fläche diese Fläche samt Kindern im Web, einschließlich Schaltflächengruppen, Tab-Leisten, Segmenten und FAB-Listen. Dies unterscheidet sich vom Deaktivieren der Gruppierung mit `buttonGroup`. Ein Ausschluss des Such-FAB oder eines Teils der Suchfußzeile deaktiviert native Suchintegration; die Tab-Leiste kann bei Eignung weiterhin nativ gerendert werden.

### Anforderungen an die Position

Glasdarstellung allein reicht nicht. Gewöhnliche Projektion benötigt fixierte Bedienelemente:

| Bedienelement oder Position | Eignung |
| --- | --- |
| Schaltflächen, Zurückschaltflächen, Menüschaltflächengruppen und Segmente | Werkzeugleiste direkt in `ion-header` oder `ion-footer`, ohne umgebenden `ion-content`-Vorfahren. |
| Schaltflächen direkt in Kopf-/Fußzeile, eigenständige Werkzeugleisten oder Werkzeugleisten/Kopfzeilen in scrollendem Inhalt | Bleiben im Web. |
| FAB | Muss den festen Slot von `ion-content` verwenden. |
| Zurückschaltfläche bei aktivem `.ios-theme-vertical-bars` | Kann außerhalb fester Werkzeugleisten projiziert werden, auch in geroutetem Inhalt oder dauerhafter App-Shell. Vertical Bars benötigt keinen `ios`-Modus. |
| Eingeklappte Kopfzeilen, ausgeschlossene Bedienelemente und verlassene Seiten | Ausgeschlossen. |
| Vordergrundmodal voller Breite | Kann an Vertical Bars teilnehmen; andere Overlay-Flächen behalten ihr eigenes Layout. |

Das Verschieben eines projizierten Bedienelements an eine ausgeschlossene Position stellt Web-Rendering wieder her; Zurückverschieben prüft die Eignung erneut. Die Anwendung wählt, wo sie Vertical Bars aktiviert und welchen Ionic-Komponentenmodus sie verwendet.

### Tab-Layout

| Quelllayout | Ergebnis |
| --- | --- |
| Gleich breite Einträge mit Standard `layout="icon-top"` | Natives gestapeltes Symbol-/Beschriftungslayout, auch auf iPad und im Querformat. |
| `icon-start`, `icon-end`, `icon-bottom`, `icon-hide` oder `label-hide` | Gesamte Tab-Leiste bleibt im Web. |
| Ungleiche Eintragsbreiten | Gesamte Tab-Leiste bleibt im Web. |
| Anfangs-, Mittel- oder Endposition | Folgt der Quellleiste, einschließlich RTL. |
| Gerichtete `ion-icon`-Grafik | Erhält ihre gerenderte RTL-Spiegelung. |

Die native Leiste verwendet lokal kompakte horizontale und reguläre vertikale Größenklassen, ohne die Größenklasse der App zu ändern. Beschriftungsgröße und -gewicht folgen dem Web-Snapshot.

### Gewöhnliche Schaltflächengruppierung

Diese Regeln gelten außerhalb von Vertical Bars:

| Quelle oder Einstellung | Ergebnis |
| --- | --- |
| Transparente Schaltfläche in `ion-buttons` | Kann einzeln projiziert werden. |
| Eigenständige transparente, gefüllte oder umrandete Schaltfläche | Bleibt im Web. |
| Gruppierung aktiviert, mindestens zwei geeignete transparente Schaltflächen | Eine native Fläche mit getrennten Aktionen. Menüschaltflächen können teilnehmen. |
| Einzelne Menüschaltfläche | Verwendet ihre übergeordnete Gruppe als Fläche. |
| Gruppierung deaktiviert, gemischte Füllungen oder nicht unterstützte Gruppenkinder | Geeignete Aktionen können weiterhin einzeln projiziert werden. Explizite Teilbaumausschlüsse folgen den obigen Regeln gemeinsamer Flächen. |
| Zurückschaltfläche | Wird niemals Teil einer gewöhnlichen Aktionsgruppe. |

### Nicht unterstützte Inhalte

Folgendes bleibt im Web; das Plugin übersetzt kein beliebiges Anwendungs-CSS in UIKit-Stile:

| Bereich | Nicht unterstützte Konfiguration |
| --- | --- |
| Schaltflächen | Eigene Schaltflächenfarben oder eigene Zurücksymbole/-farben. |
| Container | Einklappende Kopfzeilen, Werkzeugleisten in scrollendem Inhalt und gewöhnlicher Modal-Inhalt. Siehe separate Vertical Bars-Modal-Regel unten. |
| Segmente | Scrollbare/erweiterte Segmente und Segment-View-Integration. |
| Inhalt | Komplexe Slots und nicht unterstützte SVG-Funktionen. |

### Hintergründe und Fallback-Übergaben

Natives Glas nimmt den tatsächlich dahinter gezeichneten Web-Inhalt als Grundlage. Bestehende Werkzeugleistenhintergründe und Header-Unschärfe beeinflussen diesen Inhalt weiterhin. Damit Inhalt unter einem Header scrollt, verwenden Sie das normale Ionic-Layout mit durchscheinendem Header und Vollbildinhalt. Das Plugin verschiebt Seiteninhalt nicht und überschreibt keinen von der Anwendung festgelegten undurchsichtigen Werkzeugleistenhintergrund.

Solange eine Web-Eingabe die Bildschirmtastatur verwendet, kehren gewöhnliche Bedienelemente zur Web-Darstellung zurück. Beim Schließen werden sie erneut geprüft. Dies gilt auch für iPad-Layouts, in denen die Tastatur den visuellen Viewport nicht verschiebt. Ein natives Suchfeld behält seine eigene native Tastatur und Suchfläche.

Wenn ein vorhandenes Bedienelement nicht mehr unterstützt wird, wird seine Web-Quelle gezeichnet, bevor die native Abdeckung entfernt wird. Dies vermeidet eine leere Übergabe. Web-/UIKit-Aktualisierungen sind jedoch nicht atomar und können sich kurz überlappen. Dieses Verhalten an der Grenze unterscheidet sich von gewöhnlicher Seitennavigation, bei der unveränderte gemeinsam genutzte native Tabs erhalten bleiben.

## Zustand und Ereignisse

### Menüaktionen

Menüschaltflächen verwenden das aufgelöste Standardsymbol oder konfigurierte Symbol von Ionic beziehungsweise ein unterstütztes Slot-Symbol oder eine Slot-Beschriftung. Die native Aktivierung klickt auf das ursprüngliche `ion-menu-button` und erhält die Zielauswahl über `menu`. Nicht standardmäßige Menüschaltflächentypen (`submit` / `reset`) bleiben im Web. `disabled`, `autoHide`, Menüverfügbarkeit und Sichtbarkeit der geteilten Ansicht folgen dem tatsächlichen DOM. Das Öffnen eines Menüs stellt Web-Bedienelemente wieder her und entfernt deren native Abdeckungen. Beim Schließen werden geeignete Bedienelemente erneut projiziert.

### Tab-Geometrie und Zustandsaktualisierungen

Das DOM bestimmt Beschriftungen, SVG-Inhalte, Position, ausgewählte Werte und Anwendungsverhalten. `ion-tab-bar` selbst ist die Positionsreferenz; UIKit bestimmt innere Abstände und die Größe der Glasfläche.

| Quelle oder Viewport | Natives Verhalten |
| --- | --- |
| Rechteck der Quellleiste | Größenvorschlag und Positionsanker unter Berücksichtigung von UIKit-Rahmen mit größerem Außenmaß. |
| `tab-bar-position-start`, `tab-bar-position-center`, `tab-bar-position-end` | Horizontaler Anker einschließlich RTL; Klassenänderungen werden automatisch abgeglichen. |
| `slot="bottom"` / `slot="top"` | Erhält die jeweilige untere/obere Kante. |
| Unterstütztes gestapeltes Layout und Beschriftungstypografie | Folgen dem Web-Snapshot. UIKit kann die Inhaltsbreite auch bei füllender Positionierung begrenzen. |
| Badge- oder Titelaktualisierungen | Erhalten native Eintragsidentitäten und messen am selben Anker erneut. |
| Andere native Breite oder Höhe | Führt nicht zur Ablehnung; Symbole werden nicht auf CSS-Eintragsbreiten gestreckt. |
| Nicht erkanntes natives Layout | Stellt Web-Rendering wieder her. |

Die Standard-Zielwerte der Web-Theme-Darstellung sind:

| Messgröße | Zielwert |
| --- | --- |
| Viewport mindestens 768px breit, 2 / 3 / 4 / 5 Tabs | Breiten der Glasfläche etwa 188 / 274 / 336 / 414pt. Kleinere Viewports behalten Telefongrößen. |
| Leistenhöhe | 62pt |
| Auswahlhöhe / Einrückung | 54pt / 4pt |
| Benachbarte Schaltflächen | Überlappen wie UIKit-Bedienelemente. |

Diese Ziele garantieren keine identischen eigenen Schriften, Symbole oder Beschriftungen; UIKit bestimmt die intrinsische Breite. Symbol- und Beschriftungsausrichtung werden anhand von Simulator-Screenshots geprüft. Das Plugin vermisst den nativen Tab-Teilbaum ohne private Klassennamen oder feste Abstandskorrekturen.

Die Laufzeit prüft erneut:

- Strukturänderungen, betroffene Shadow Roots und Größen.
- Seitenlebenszyklusereignisse und Overlays.
- `display: none`, `hidden` und Theme-Klassen von Vorfahren, Komponentenentfernung und Änderungen des Deaktivierungszustands.

Native Berührungsereignisse werden vor dem Klicken auf das ursprüngliche Ionic-Element gegen aktuelles DOM und Revision geprüft.

### Formulare und Segmentwerte

Behalten Sie bei Formularen `ion-button type="submit"` und den vorhandenen Submit-Handler des Formulars bei. Ein externes Formular wird weiterhin als `[form]="formRef"` übergeben. Das Plugin ruft `form.submit()` nicht auf, ergänzt keinen zweiten Absendeweg und verändert nicht die Zuständigkeit für Angular-Formulare. Segmentwerte behalten ihren ursprünglichen Typ, da das ursprüngliche `ion-segment-button` angeklickt wird. Programmatische Wertänderungen erzeugen kein künstliches `ionChange`.

### Text und Grafiken

Beschriftungen verwenden nativen Text. Lokale statische SVGs und aufgelöste `ion-icon`-SVGs einschließlich `name` und Änderungen an `name` werden mit der Bildschirmauflösung rasterisiert und zwischengespeichert. Die quellengetreue Projektion erhält ihre Farben; die Systemprojektion vertikaler Werkzeugleisten-Schaltflächen verwendet von SwiftUI eingefärbte Vorlagensymbole. Tab-SVGs, die der Textfarbe folgen, verwenden natives Template-Rendering. Dadurch wechseln Symbole und Beschriftungen ihre Auswahlfarbe gemeinsam, ohne auf ein weiteres Bridge-Bild zu warten. Mehrfarbige Tab-Grafiken behalten ihre ursprünglichen Farben. Externe Referenzen, `<use>`, Animationen, eingebettetes HTML/Bilder, SVG-Text und Stylesheets sind ausgeschlossen. Web-Schriftarten und beliebige Slot-Layouts werden nicht exakt nachgebildet.

### Berührung, Badges und Barrierefreiheit

Der native Host nimmt Eingaben nur innerhalb nativer Bedienelemente entgegen. Tab-Interaktion und Barrierefreiheit werden durch das normale [UITabBar](https://developer.apple.com/documentation/uikit/uitabbar)-Bedienelement bereitgestellt. Leere Bereiche leiten Berührungen an die WebView weiter. Ionic iOS blendet leere Badges standardmäßig aus. Ein leeres sichtbares `ion-badge` wird zu einem nativen Benachrichtigungspunkt; ein nicht leeres Badge zeigt seinen Text an. Hintergrund- und Textfarben von Badges stammen aus den berechneten DOM-Styles einschließlich der Ionic-`color`-Paletten. Ausgeblendete oder entfernte Badges entfernen das native Badge. Tabs verwenden das Standard-Tab-Bedienelement von UIKit für Auswahl, Touch-Verhalten, Badges und Barrierefreiheit und erhalten die Elementidentität bei Auswahlaktualisierungen. UIKit bestimmt das Elementlayout innerhalb der vermessenen Leiste; beliebige CSS-Elementplatzierung wird daher nicht nachgebildet. Native Bedienelemente stellen Namen, Deaktivierungs-/Auswahlmerkmale und Badges für die Barrierefreiheit bereit. Während der Projektion wird die Quelle vor der Web-Barrierefreiheit verborgen. Dies garantiert keine identische VoiceOver-Reihenfolge zwischen Web und UIKit.

## Durchsuchbare Tabs

Vorhandene Registrierungen mit `attachTabBarSearchable(tabBar, fabButton, footer)` verwenden automatisch native Suche, wenn ihre untere Tab-Leiste und die Glas-Suchbedienelemente unterstützt werden. Es sind keine neue Komponentenoption, Route, native Einrichtung oder Seiten-Listener erforderlich. Gewöhnliche Tab-Leisten verwenden weiterhin `UITabBar`; horizontale durchsuchbare Gruppen verwenden einen dauerhaften `UITabBarController`, `UITab` / `UISearchTab` und `UISearchController`. Die ursprüngliche Capacitor-WebView rendert weiterhin Ergebnisse und verarbeitet die Navigation.

Bei Vertical Bars erhält die native Leiste sämtliche Tabs und ihre Auswahl. SwiftUIs `searchable` und `searchToolbarBehavior(.minimize)` stellen System-Suchschaltfläche, Suchfeld, Schließbedienelement und Übergänge innerhalb derselben nativen Navigationsfläche bereit. Apple bestimmt ihre Platzierung für das aktuelle Gerätelayout und fokussiert das native Feld beim Öffnen der Systemsuche. Eingabe-, Fokus-, Löschen- und Absendeereignisse verwenden dieselbe Bridge wie die horizontale Suche. Sobald Vertical Bars aktiviert ist, platziert die Web-Projektion die registrierte Suchschaltfläche über den sichtbaren vertikalen Tabs oder am unteren Leistenende, wenn die Tabs ausgeblendet sind, und leitet die Aktivierung an das ursprüngliche FAB weiter. Native Suche ersetzt diese Web-Projektion, sobald sie verfügbar ist. Auch die Web-Suchdarstellung erhält die vertikalen Tabs.

Die Suchregistrierung umgeht keine Platzierungsbeschränkungen. Ihre Suchleiste und Schließen-Schaltfläche müssen in fest positionierten Footer-Werkzeugleisten liegen. Ihr Auslöser muss zu einem `ion-fab[slot="fixed"]` direkt innerhalb von `ion-content` oder direkt zum vorhandenen nicht scrollenden `.ion-page`-Layout gehören. Ein Wrapper innerhalb scrollenden Inhalts ist kein fester Slot.

Bei horizontalen Tabs behält Native UI nach dem Vermessen eines unterstützten Suchlayouts den Suchcontroller während der gesamten Registrierung, auch bei Seitenübergängen oder vorübergehender Nichtverfügbarkeit (`available: false`). Eine Erstregistrierung auf einer versteckten Seite behält gewöhnliche Tabs, bis die Suchbedienelemente messbar sind. Derselbe Controller verwaltet ruhende Tabs und aktive Suche. Im Ruhezustand wird seine Ansicht an die Quell-`ion-tab-bar` angepasst, um deren gewöhnliche Glasflächenbreite zu erhalten. UIKit kann die Breite kleiner Tab-Gruppen begrenzen. UIKit bestimmt die Position der Suchschaltfläche neben den Tabs. Passt eine horizontale Suchgruppe nicht in das Quelllayout, bleibt die Suche im Web. Geeignete Tabs bleiben nativ, solange sie den Web-Suchauslöser nicht überdecken würden; überlappende Tabs bleiben ebenfalls im Web. Registrieren Sie vor Abschluss des Seiteneintritts, etwa in `ionViewWillEnter`; die Projektion beginnt, sobald die Suchbedienelemente messbar sind.

Das Öffnen der Suche erhält den ausgewählten Ionic-Tab und zeigt nicht automatisch die Tastatur (`automaticallyActivatesSearch` bleibt aus). Tippen Sie auf das Feld oder rufen Sie `ion-searchbar.setFocus()` auf, um die Tastatur zu öffnen. Während aktiver Suche friert Native UI die Web-Layoutprojektion ein und hält Capacitor-Keyboard-Resize auf `none`; UIKit verwaltet Tab-/Suchoberfläche während der Sitzung ohne Rahmenanpassung. Das Schließen stellt gewöhnliche Tabs an ihrer Quellposition wieder her. Gewöhnliche native Tabs behalten eine optimistische Auswahl, bis der Web-Zustand `selected` nachgezogen hat. Eingabeereignisse und `value`-Aktualisierungen der Anwendung passieren die Bridge bis zum Schließen weiter. Aufgelöstes SVG, zugängliche Beschriftung und Suchsymbol des Auslösers werden aus Ionic projiziert, einschließlich `ion-icon name`.

Native Bearbeitungen laufen über die Ionic-Eingabehandler und erhalten die Entprellung von `ionInput` sowie `ionChange`, `ionFocus`, `ionBlur` und `ionClear`. Programmatische `value`-Änderungen erzeugen kein `ionInput`; synchrone Anwendungskorrekturen werden von veralteten nativen Eingaben unterschieden. Die native Bearbeitung verwaltet markierten Text und den Cursor. Die Rückkehr über die Schließen-Aktion des Footers erhält den Wert und erzeugt weder `ionCancel` noch `ionClear`.

### Unterstützte Suchkonfiguration

| Bereich | Native Unterstützung | Bleibt im Web |
| --- | --- | --- |
| Suchgruppe | Registrierte suchfähige Tabs mit Glas-Suchleiste im iOS-Modus. | Allgemeine eigenständige und klassische Suchleisten. |
| Tastatur- und Texteinstellungen | Standard-Suchtastatur und standardmäßige Autokorrektur/Großschreibung. | Eigene Eingabemodi, Return-Key-Hinweise, Mindest-/Maximallänge, Autocomplete-, Autokorrektur- oder Rechtschreibprüfungseinstellungen. |
| Leeren/Abbrechen | Standard-Löschbedienelement, keine interne Abbruchschaltfläche. | Eigene Löschsymbole oder interne Abbruchschaltfläche. |
| Zustand und Fokus | Synchronisiert `disabled`, `placeholder`, `value` und `setFocus()`. | Nicht unterstützte Gruppenkonfigurationen verwenden Web-Rendering. |

### Suchlebensdauer und Wiederherstellung

Das Verlassen einer Seite, Overlays, Theme-Ausschlüsse und der Verlust nativer Zuständigkeit schließen die native Darstellung und erhalten den zuletzt synchronisierten beziehungsweise von der Anwendung gesetzten Wert. Eine spätere Suche beginnt in diesem geschlossenen Zustand. Die Registrierung bleibt über Übergänge zwischengespeicherter Seiten hinweg erhalten; eine erneute Registrierung bei jeder Rückkehr ist nicht erforderlich. Wartezeiten der Bridge sind begrenzt. Verliert eine Öffnungsanforderung die Bridge, kann ihr ausstehender Eintritt über die vorhandene Web-Animation abgeschlossen werden. Eine getrennte Bridge kann native Zeichen, die nie an JavaScript geliefert wurden, nicht wiederherstellen.

Das Ersetzen der registrierten `ion-searchbar` oder ihres Eingabefelds beendet die alte Bearbeitungssitzung. Das neue Element behält seinen eigenen Anwendungswert und beginnt beim erneuten Öffnen eine neue native Sitzung.

Bei Aktivierung unterdrückt Native UI den oberen Scrollkanteneffekt der WebView, da Ionic die Kopfkante bereits zeichnet. Dies verhindert einen zweiten dunklen Verlauf bei unterschiedlichen OS- und Web-Themes. Beim Zerstören wird die ursprüngliche Einstellung wiederhergestellt.

Der native Suchcontroller bleibt über seiner eigenen Tastatur sichtbar. Andere projizierte Bedienelemente werden ausgeblendet, wenn eine Web-Eingabe die Tastatur öffnet. Für Standardbedienelemente gelten die UIKit-eigene Barrierefreiheit und das Verhalten bei reduzierter Bewegung. Vollständige VoiceOver-Navigation ist keine geprüfte Garantie für Gleichwertigkeit.

## FAB-Verhalten

FABs behalten `activated`, das `show` jedes Kindes, `close()` und die ursprünglichen Klickhandler von Ionic bei. Mehrere Listen, anfängliches Aufklappen, kleine Schaltflächen und `edge` verwenden das vermessene Layout jeder Schaltfläche. Die native Seite bildet die gestaffelte Sichtbarkeit von Ionic ab, ohne einen weiteren Timer oder eine eigene Öffnen-/Schließen-Steuerung hinzuzufügen. Änderungen am Hauptschaltflächensymbol werden mit dem aufgelösten `closeIcon` überblendet. Reduzierte Bewegung deaktiviert diese Überblendung. Native FAB-Schaltflächeninstanzen bleiben über Öffnen-/Schließen-Aktualisierungen hinweg bestehen. Das Quell-FAB bleibt während des normalen Öffnens und Schließens durchgehend projiziert.

### FAB-Eignung

Ein einziges nicht unterstütztes Kind belässt den gesamten FAB im Web, auch bei geschlossener Liste.

| Bereich | Unterstützt | Bleibt im Web |
| --- | --- | --- |
| Darstellung | Standardmäßiges kreisförmiges Glas. | Farbige gefüllte Schaltflächen oder eigene Host-Hintergründe/-Formen/-Bewegung. |
| Inhalt | Text und aufgelöstes statisches SVG/`ion-icon`, einschließlich RTL-Spiegelung. | Nicht unterstützte Grafiken. |
| Aktionen | Ursprüngliche Klickhandler. | Submit-/Reset- oder `href`-FABs. |
| Position | `slot="fixed"` auf einem direkten Kind von `ion-content`. | Nicht fixierte Position oder `slot="fixed"` auf einem Seitengeschwister. |

Beispielsweise behält die Demo-Seite `floating-action-button-fixed` mit rotem Hintergrund ihre Web-Darstellung.

Benutzerdefinierte Host-Animationen oder Transition-Deklarationen am FAB, an der Liste oder an einer Schaltfläche belassen die Gruppe im Web, bis sie entfernt werden. Schaltflächen-Transforms unterstützen die normale Identität und scale(0) für ausgeblendete Kinder, aber keine eigenen Skalierungen. Für Kinder innerhalb einer Liste mit `display:none` können Browser den berechneten Transform als `none` melden, obwohl ein eigener Transform deklariert ist. Solche Transforms werden geprüft, sobald Layoutinformationen verfügbar sind. Falls erforderlich kehrt dann das gesamte FAB ins Web zurück. Das Plugin analysiert keine Anwendungs-Stylesheets und öffnet Listen nicht vorübergehend, um verborgenes Layout vorherzusagen.

## Übergänge und Wiederherstellung

Die integrierte `iosTransitionAnimation` wartet vor dem Web-Animationsstart auf die native Auflösung. Interaktiver Fortschritt und Abschluss/Abbruch werden währenddessen eingereiht. Unbewegte gemeinsame Tabs bleiben erhalten. Erstes Rendering und Übergänge ohne Animationsbuilder werden von Startlaufzeit und Ionic-Lebenszyklusereignissen abgedeckt. Standard-Ionic- und eigene Navigationsbuilder können dieselbe Integration über das von `@rdlabo/ionic-theme-ios27` exportierte `withNativeUITransition()` verwenden. Die Einrichtung beschreibt [Navigationsanimation verbinden](ionic-vertical-bars.md#2-connect-your-navigation-animation).

Gewöhnliche native/Web-Übergaben verwenden eine gemeinsame 180ms-Deckkraftüberblendung, einschließlich Vertical Bars in beide Richtungen. Ausgehende Darstellungen erhalten weder Eingaben noch Barrierefreiheitsfokus. Reduce Motion und Modal-Darstellung verwenden sofortige Übergaben; Suchcontroller behalten ihre UIKit-gesteuerten Übergänge.

Beim Tab-Wechsel entfällt die Web-/native Überblendung, damit ein auslaufender UIKit-Snapshot nicht über dem nächsten Tab stehen bleibt. Die Erkennung vergleicht die Router-URL mit dem noch ausgewählten Tab in `ionViewWillLeave` sowie mit den Vanilla-DOM-Ereignissen `ionTabsWillChange` / `ionTabsDidChange`. Beim Hinzufügen und Entfernen von Seiten im Stapel bleibt die normale 180ms-Übergabe erhalten.

Standard-Ionic-Overlays setzen gewöhnliche native Projektion bis zum Schließen aus. Vertical Bars verwendet eine separate Regel:

| Fläche oder Bedingung | Vertical Bars-Verhalten |
| --- | --- |
| Web-Toast, gewöhnliches Popover oder älteres Picker-Overlay | Native Seitenleiste sichtbar, aktuell und interaktiv halten. |
| Von einer Vertical Bars-Schaltfläche geöffnetes Web-Popover | Seitenleiste bis zum Schließen auf Web-Projektion zurückführen, auch bei nativer Ablehnung oder Vorbereitungsfehler. |
| Alert, Action Sheet oder Loading | Web-Rendering wiederherstellen, damit Overlay und abgedunkelter Hintergrund die Bedienelemente korrekt bedecken. |
| Menü | Bestehendes natives Seitenleistenverhalten beibehalten. |
| Vordergrundmodal voller Breite | Modal-Bedienelemente statt der bedeckten Seite projizieren. |
| Modal ohne Vertical Bars-Unterstützung | Web-Rendering wiederherstellen. |
| Explizite Aussetzung, nicht verfügbares natives Layout, verstecktes Dokument oder nicht unterstützte Tastatur-/Viewportgeometrie | Bestehendes Fallback-Verhalten erhalten. |

Native Projektion wird erst wieder aufgenommen, wenn alle Overlays geschlossen sind, die Web-Rendering erfordern. Das unten beschriebene optionale native Vertical Bars-Popover behält seine eigene SwiftUI-Darstellung und Eingabebehandlung. Nicht unterstützte Such-Tab-Konfigurationen verwenden die bestehende Web-Animation und teilen diese Zuständigkeit mit Web-Glasgesten. CSS-Bewegung unterstützter umschließender Flächen führt ebenfalls vorübergehend zu Web-Rendering.

Beim Entfernen nativer Elemente wird die Quelle wiederhergestellt und darf gezeichnet werden, bevor ihre native Abdeckung entfernt wird. Beim Übernehmen wird die Quelle erst nach einer erfolgreichen und aktuellen nativen Antwort ausgeblendet. Verzögerte Antworten werden für jedes Bedienelement erneut geprüft: Bereits geeignete Bedienelemente behalten ihre native Abdeckung, während Inhaltsaktualisierungen nachziehen. Nur entfernte oder ungeeignete Quellen kehren ins Web zurück; neu übernommene Quellen benötigen eine exakte Bestätigung. Gewöhnliche Seitenänderungen rufen nie die globale Löschoperation auf. UIKit-Tab-Instanzen und -Elemente bleiben erhalten; identische Rahmen und Auswahlen werden nicht erneut angewendet. Doppelte oder veraltete Aktivierungen werden verworfen. WebKit und UIKit rendern weiterhin getrennt. Die Implementierung vermeidet absichtlich leere Frames, bietet jedoch keine Garantie für atomare Komposition auf Betriebssystemebene. Prüfen Sie eigene Übergänge und Overlays vor der Einführung auf den von der Anwendung unterstützten Simulatoren. Unbekannte Overlay-Systeme fallen nicht unter den Vertrag der automatischen Integration.

Schlägt ein Bridge-Update fehl oder läuft in einen Timeout, endet native Projektion und Web-Rendering wird wiederhergestellt. Es erfolgt keine automatische Wiederverbindung. `getStatus().reason` meldet den Fehler; bei aktivem Web-Fallback meldet das öffentliche Handle `state: 'web'`, nicht `stopped`. Für einen bewussten Neuversuch rufen Sie am Handle `destroy()` und anschließend erneut `enableNativeUI()` auf.

Fehler oder Timeouts notwendiger Start-Bridge-Aufrufe liefern ein Web-Fallback-Handle. Optionale WebView-Metriken dürfen fehlschlagen, ohne native Bedienelemente zu deaktivieren. `destroy()` wartet auf die Bereinigung; wiederholte Aufrufe teilen deren Abschluss. Eine während laufender Bereinigung angeforderte neue Aktivierung wartet darauf, auch wenn die Anwendung `destroy()` ohne await aufruft. Warten Sie auf diese Promises, wenn der nächste Anwendungsschritt von der Bereinigung abhängt, und behandeln Sie Ablehnungen.

Für Diagnosen oder das Beenden der Anwendung:

```ts
const shell = await enableNativeUI(); // wiederholte Aufrufe teilen die Laufzeit
console.log(shell.getStatus()); // Zustand, Anzahl projizierter Bedienelemente, Aktualisierungsanzahl, Fehlergrund
await shell.destroy(); // DOM wiederherstellen, native Bedienelemente entfernen und Listener/Cache freigeben
```

Projektion wird durch die Start-API aktiviert. Partielle Einstellungen überschreiben Standardwerte:

```ts
const shell = await enableNativeUI({ controls: { tabs: false } }); // automatische Ionic-Projektion außer Tabs
await shell.disableVerticalControlArea(); // gewöhnliche native Bedienelemente behalten
await shell.enableVerticalControlArea();
await shell.destroy(); // gesamte Projektion beenden
```

Standardwerte, reine Seitenleistennutzung und Lebenszyklusmethoden finden Sie unter [alle Konfigurationsoptionen](configuration.md). Explizite HTML-Quellen ohne Ionic beschreibt die [frameworkunabhängige Einrichtung](framework-independent.md).

### An Vertical Bars verankerte Popover

**Native Popover-Darstellung ist ausschließlich für Vertical Bars verfügbar.** Sie benötigt einen akzeptierten nativen Vertical Bars-`ion-button`-Anker; `ionic.verticalBars.popover` macht gewöhnliche Werkzeugleisten- oder Inhalts-Popover nicht nativ. Die Funktion arbeitet auch mit der eigenständigen Vertical Bars-Laufzeit, ohne vollständige Native UI zu aktivieren.

Aktivieren Sie `ionic.verticalBars.popover`, um Popover von akzeptierten nativen Vertical Bars-`ion-button`-Bedienelementen darzustellen. Automatische Ionic-Schaltflächenprojektion ist standardmäßig aktiv; wenn `ionic.auto` auf `false` gesetzt ist, markieren Sie einzelne Anker mit `data-native-ui="button"`:

```ts
await enableNativeUI({
  ionic: { verticalBars: { popover: true } },
});
```

Dieselbe Option ist über `enableVerticalControlArea()` verfügbar. Verwenden Sie ein `ion-popover`, dessen `trigger` die projizierte Schaltfläche identifiziert, oder übergeben Sie deren Klickereignis an `PopoverController.create({ event, ... })`. Die Schaltfläche muss von nativen Vertical Bars akzeptiert sein; gewöhnliche Werkzeugleistenschaltflächen, Inhaltsbedienelemente sowie fehlende oder abgelehnte Anker behalten Ionics Web-Darstellung.

Kehren Vertical Bars zum Web-Rendering zurück, vermisst die Laufzeit vor ihrer Auflösung die aktuellen nativen Zurückschaltflächen, Werkzeugleistenaktionen und Tab-Flächen. Der Web-Fallback verwendet diese Rechtecke und zeichnet vor der nativen Entfernung. Messungen sind an Quellelemente und Viewport gebunden; fehlen sie, gilt das CSS-Layout. Dies gleicht Position und Größe an, doch Web-Glas und Symbolrendering können weiterhin von Systemmaterialien abweichen.

Die nativen Bedienelemente der Seite bleiben während Vorbereitung, Darstellung und Schließen projiziert. Akzeptiert derselbe native Anker während Ionics Schließvorgang einen Tipp, wird eine Aktivierung behalten und nach der Bereinigung erneut geprüft; wiederholte Tipps werden zusammengefasst. Die Weiterleitung bereitet ihre untergeordnete WebView während Ionics Inhaltsinitialisierung vor, schließt die Web-Eintrittsanimation ohne Bewegung hinter dem versteckten Quellhost ab und stellt über das standardmäßige SwiftUI-Popover der Schaltfläche dar. Sie ändert weder Größe noch Elternstruktur der Quell-WebView. Ionic behält Controller, Lebenszyklus, aktive Anwendungshandler und Schließdaten; der aktive Inhalt wandert vorübergehend ins untergeordnete Dokument und wird bei der Bereinigung zurückgeführt.

Es wird jeweils nur ein Popover weitergeleitet. Ein im untergeordneten Dokument erzeugtes verschachteltes Popover oder Modal wird vor dessen Schließen als aktives Element ins Quelldokument verschoben, einschließlich außerhalb des weitergeleiteten Inhalts angehängter Overlays. Es läuft mit seinen Handlern und Schließdaten als Web-Overlay weiter; sein Darstellungsereignis wird nicht wiederholt. Ein weiteres Overlay oder Menü, Seitenwechsel, Shell-Aussetzung oder Verlust des nativen Layouts stellt Web-Rendering wieder her. Modal-, Sheet- und Alert-Weiterleitung gehören nicht zu dieser Funktion.

Native Darstellung bestimmt Pfeil, Ecken und Animation; eigene Web-Eintritts-/Austrittsanimationen ersetzen diese nicht. Der Quell-Eintrittsbuilder läuft einmal mit Dauer und Verzögerung null, einschließlich Kindanimationen, und verwendet für das Standardlayout `reference="trigger"` das native Ankerrechteck sowie den sichtbaren Zustand für Web-Fallback. Explizites `reference="event"` erhält Ionics Ereigniskoordinaten-Semantik. Eine explizite `enterAnimation` wird berücksichtigt; sonst gilt der iOS-Popover-Builder dieses Pakets. Setzen Sie für einen eigenen Builder `enterAnimation` am Overlay, statt sich auf die globale `popoverEnter`-Konfiguration zu verlassen. Material-Design-Popover (`md`) behalten Ionics Web-Darstellung. Die anfänglichen Inhaltsmaße stammen von Ionic.

#### Popover-Fallback-Bedingungen

Die Weiterleitung kopiert Dokument- und Popover-Shadow-Stile und erhält Inhaltsrandabstände. Vor der Darstellung vergleicht sie ausgewählte berechnete Layout- und Darstellungseigenschaften bei den Quelldimensionen.

| Bedingung | Ergebnis |
| --- | --- |
| Erkannte Stil-/Layoutunterschiede | Stellt das aktive Web-Popover wieder her. |
| Nicht unterstützte visuelle Vorfahreneffekte oder Größencontainer | Stellt das aktive Web-Popover wieder her. |
| Inhalt über 1.000 Elemente | Stellt das aktive Web-Popover wieder her. |
| Änderungen gespiegelter Vorfahrenattribute oder Quell-Head-Stile | Stellt Web-Rendering wieder her. |
| Vorbereitung fehlgeschlagen oder nativer Anker nicht verfügbar | Stellt das Web-Popover wieder her. |

Ein auf Web zurückfallendes Seitenleisten-Popover führt auch die Leiste bis zum Schließen auf Web-Projektion zurück. Diese Kompatibilitätsprüfung garantiert weder beliebiges CSS einschließlich Pseudoelementen und dynamischen CSSOM-Änderungen noch dokumentgebundene Abfragen oder vollständige VoiceOver-/Hardwaretastatur-Gleichwertigkeit.

### Eigene Overlays aussetzen

Fordern Sie vor der Darstellung eines eigenen Modals oder Overlays, das Native UI nicht erkennen kann, eine Aussetzung an. Eine aufgelöste Aussetzung bedeutet, dass projizierte Bedienelemente zum Web-Rendering zurückgekehrt sind. Geben Sie sie nach dem Schließen immer frei:

```ts
const suspension = await shell.suspend();

try {
  await modal.present();
  await modal.onDidDismiss();
} finally {
  await suspension.resume();
}
```

Unterbrechungen können verschachtelt werden, und `resume()` ist idempotent. Die native Projektion wird erst fortgesetzt, wenn sämtliche aktiven Unterbrechungen freigegeben sind. Dabei wird das aktuelle DOM anstelle eines veralteten Snapshots verwendet.

Natives Material und Aussehen der Bedienelemente folgen der laufenden iOS-Version. Ein iOS-26-Gerät erhält nicht allein durch die Installation dieses Themes das Erscheinungsbild von iOS 27.

## iPhone Duo unterstützen

Die Unterstützung für iPhone Duo einschließlich eigenständiger Vertical Bars ist ab Version 2.0.0 stabil.

Der eigenständige Vertical Control Area-Einstiegspunkt (`@rdlabo/capacitor-native-ui/vertical-bars`) arbeitet mit anwendungsseitigem Web-Layout. Das Theme-Paket bietet ein [optionales Seitenleisten-Stylesheet](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.0/packages/theme-ios27/docs/vertical-bars-layout.md), `@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css`, das ohne die vollständige iOS-27-Darstellung nutzbar ist. Rufen Sie dafür `enableNativeUI({ controls: 'verticalOnly' })` auf; die Standardauswahl zielt auf Bedienelemente im vertikalen Bereich. Apps, die bereits `enableNativeUI()` aufrufen, sollten diese eine Laufzeit behalten, statt beide zu starten. [Gerätelayout und Split Panes](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.0/packages/theme-ios27/docs/vertical-bars-layout.md) beschreibt die vollständige Einrichtung, einschließlich Scharnierstellung und Split-Pane-Layout für Apps ganz ohne diese Shell.

Vertical Bars verwendet eine SwiftUI-`TabView` und Werkzeugleiste in der Systemseitenleiste. Ionic bleibt Quelle für Beschriftungen, Symbole, Auswahl-/Deaktivierungszustand und Aktionen. Seitenleistenlayout, nativen Fallback und unterstützte Overlays beschreibt [Vertical Bars](vertical-bars.md).

In Vertical Bars erfordert automatische Auswahl von `ion-button`-Aktionen fester Werkzeugleisten ein `ion-icon` oder SVG mit `slot="icon-only"`; `data-vertical-bars="true"` kann andere unterstützte Schaltflächen ausdrücklich auswählen. Alle Füllungen und Ionic-Farben sind geeignet; Submit-Schaltflächen folgen derselben Positionsregel. Ergänzen Sie `.ios-theme-horizontal-only` an einer Schaltfläche oder ihrer `ion-buttons`-Gruppe, um sie horizontal zu belassen. Positions- und Ausschlussregeln stehen unter [Werkzeugleistenaktionen](vertical-bars.md#toolbar-actions).

**Native Schaltflächendarstellung:** Native vertikale Schaltflächen verwenden standardmäßig `buttonProjection: 'system'`. Verwenden Sie `source`, um Ionic-Füllung und -Farben zu projizieren, mit `data-projection="source|system"` oder den gleichwertigen Klassen `ios-theme-projection-source` / `ios-theme-projection-system` für lokale Ausnahmen. Diese Einstellungen betreffen nur native vertikale `ion-button`- und `ion-menu-button`-Aktionen. Horizontale Bedienelemente und Web-Klone behalten ihr Verhalten. Priorität und Füllregeln beschreibt [Schaltflächendarstellung auswählen](vertical-bars.md#choose-button-appearance).

Die eigenständige Einrichtung unter Beibehaltung Ihres Themes beschreibt [iPhone Duo mit Ihrem bestehenden Theme](ionic-vertical-bars.md).

## Native UI-API

Die generierte Referenz unten dokumentiert das von `enableNativeUI()` zurückgegebene Handle. Die zugrunde liegende Capacitor-Bridge und ihr Bedienelement-Snapshot-Protokoll sind Implementierungsdetails.

<docgen-index>

- [`enableVerticalControlArea()`](#enableverticalcontrolarea)
- [`disableVerticalControlArea()`](#disableverticalcontrolarea)
- [`markForCheck()`](#markforcheck)
- [`getStatus()`](#getstatus)
- [`suspend()`](#suspend)
- [`destroy()`](#destroy)
- [Schnittstellen](#interfaces)

</docgen-index>

<docgen-api>
<!--Die JSDoc-Kommentare in der Quelldatei aktualisieren und docgen erneut ausführen, um die folgende Dokumentation zu aktualisieren-->

Eine laufende Shell. Positionsänderungen erhalten alle anderen Starteinstellungen.

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

### markForCheck()

```typescript
markForCheck() => void
```

Plant eine erneute Quellprüfung. Aufrufe werden gebündelt; unveränderte Snapshots werden nicht gesendet. Nach destroy oder ohne Laufzeit ohne Wirkung.

---

### getStatus()

```typescript
getStatus() => NativeUIStatus
```

Gibt den aktuellen Projektionszustand von Web und nativer Darstellung zurück.

**Rückgabe:** <code><a href="#nativeuistatus">NativeUIStatus</a></code>

---

### suspend()

```typescript
suspend() => Promise<NativeUISuspension>
```

Stellt projizierte Bedienelemente im Web wieder her, bis die zurückgegebene Freigabe fortgesetzt wird.

**Rückgabe:** <code>Promise&lt;<a href="#nativeuisuspension">NativeUISuspension</a>&gt;</code>

---

### destroy()

```typescript
destroy() => Promise<void>
```

Stoppt die Synchronisierung, stellt Web-Bedienelemente wieder her und gibt native Ressourcen frei.

---

### Interfaces

#### NativeUIStatus

| Eigenschaft            | Typ                                        |
| --------------- | ------------------------------------------- |
| **`state`**     | <code>'native' \| 'stopped' \| 'web'</code> |
| **`projected`** | <code>number</code>                         |
| **`updates`**   | <code>number</code>                         |
| **`reason`**    | <code>string</code>                         |

#### NativeUISuspension

| Methode     | Signatur                    | Beschreibung                                                                                    |
| ---------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| **resume** | () =&gt; Promise&lt;void&gt; | Gibt diese Unterbrechung frei. Die native Projektion wird fortgesetzt, nachdem alle aktiven Unterbrechungen freigegeben wurden. |

</docgen-api>
