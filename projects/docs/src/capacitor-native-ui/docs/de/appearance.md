---
title: "Helle und dunkle Darstellung"
sourceRevision: "956b6155b6e41dd0886309d91aa56755ba6c7582f6f4d480c93f534984e04ec4"
---
# Helle und dunkle Darstellung

Native UI liest den berechneten Stil jedes projizierten Quellelements und übermittelt dessen helle/dunkle Darstellung an den nativen Renderer. Konfigurieren Sie die Darstellung im Web-CSS; es gibt keine separate native Dunkelmodus-Startoption.

## Auflösung der Darstellung

Die erste zutreffende Zeile gilt:

| Priorität | Berechneter Quellstil | Ergebnis |
| --- | --- | --- |
| 1 | Vom Theme geliefertes `--ios27-color-scheme` ist nicht leer | `dark` wählt dunkel; andere Werte wählen hell. Das iOS-27-Theme liefert diese Kennzeichnung über seine hellen und dunklen Stylesheets. |
| 2 | `--ion-background-color-rgb` liefert drei RGB-Kanäle | Leitet dunkel oder hell aus der Hintergrundhelligkeit ab. |
| 3 | CSS-`color-scheme` enthält nur `dark` oder nur `light` | Verwendet dieses Schema. `light dark` wählt keine eindeutige Darstellung. |
| 4 | Keine der vorstehenden Bedingungen | Verwendet die Systemeinstellung `prefers-color-scheme: dark`. |

Theme-Kennzeichnungen und Ionic-Hintergrundwerte haben Vorrang vor `color-scheme`. Die Änderung eines beliebigen CSS-Hintergrunds oder einer Textfarbe wählt keine native helle/dunkle Darstellung.

## An das Web-Theme anpassen

| Web-Einrichtung | Konfiguration |
| --- | --- |
| iOS-27-Theme | Laden Sie das passende [System-, Class- oder Always-Dunkelmodus-Paar](../../theme-ios27/docs/setup.md#choose-one-dark-mode-pair). Das Theme liefert die Darstellungskennzeichnung. |
| Ionic mit bestehendem Theme | Halten Sie `--ion-background-color-rgb` konsistent mit der aktiven Palette; ohne Theme-Kennzeichnung verwendet die native Darstellung diesen Wert. |
| HTML ohne diese Theme-Variablen | Setzen Sie passend zum aktiven Web-Theme `color-scheme: light` oder `color-scheme: dark`. |
| Systemgesteuerte HTML-Darstellung | Verwenden Sie CSS, das auf das System reagiert; ohne eindeutiges Schema fällt die native Darstellung auf die Systemeinstellung zurück. |

Beispielsweise kann eine reine HTML-App mit manueller Dunkelmodusklasse Folgendes deklarieren:

```css
:root {
  color-scheme: light;
}

:root.app-dark {
  color-scheme: dark;
}
```

Verwenden Sie dieselbe Klasse für die dunkle Palette Ihrer Anwendung. Das Beispiel setzt voraus, dass keine der höher priorisierten Theme-Variablen vorhanden ist. Klassen-/Stilmutationen und Änderungen der Systemdarstellung lösen bei aktiver Laufzeit eine erneute Auswertung aus. Rufen Sie bei Stiländerungen ohne beobachtete DOM-Mutation anschließend `shell.markForCheck()` auf.

## Gemeinsame Darstellung von Vertical Bars

Gewöhnliche Bedienelemente lösen ihre Darstellung anhand ihrer eigenen Quellstile auf. Vertical Bars verwendet eine gemeinsame native Leistendarstellung: **Wenn ein projiziertes Bedienelement dunkel ist, verwendet die gesamte Leiste die dunkle Darstellung**. Separate helle und dunkle Leistenbereiche werden nicht dargestellt. Verwenden Sie für Quellen derselben Leiste eine konsistente Web-Palette.

Die native helle/dunkle Darstellung wählt Systemmaterial und Bedienelementdarstellung; sie bildet kein beliebiges Anwendungs-CSS nach. Füllung und Tönung vertikaler Schaltflächen werden weiterhin über die separaten [Darstellungseinstellungen für Schaltflächen](vertical-bars.md#choose-button-appearance) gesteuert.

## Temporäre Bilder unter Web-Overlays

Wenn ein blockierendes Web-Overlay erfordert, dass native Bedienelemente den Vordergrund verlassen, kann die Laufzeit auf jeder ursprünglichen Web-Komponente oder ihrem Vertical Bars-Klon ein vorbereitetes Bild anzeigen. Dies ist eine visuelle Übergabe und kein weiteres interaktives Bedienelement. Ionic behält die Verantwortung für Lebenszyklus, Hintergrund, Fokus und Schließen des Overlays.

Quellverantwortung und Pixeldarstellung haben unterschiedliche Lebensdauern. Die Native-Verantwortung beginnt mit einer akzeptierten Projektion und bleibt über temporäre Bildanforderungen, Vorbereitung, Bewegung, Größenänderung und Wiederherstellung hinweg erhalten. Die Bildverantwortung bestimmt nur, welche Pixel derzeit aktive Native-Bedienelemente ersetzen. Ein verzögertes oder übersprungenes Lesen entscheidet nicht, die Quelle ins Web zurückzugeben. Ein durch die Anwendung gesetztes Verbergen außerhalb einer Bild- oder Übergangshaltephase beendet die aktuelle Eignung. Ein Modal, das die Leiste nicht mehr verwendet, beendet ebenfalls seine Native-Leistenauswahl.

Für die Übergabe gelten folgende Regeln:

1. Bereiten Sie Bilder nach einer akzeptierten nativen Aktualisierung vor und fassen Sie nachfolgende visuelle Änderungen zusammen. Nehmen Sie während einer Berührung keine Bilder auf. Behalten Sie das letzte fertige Bild, während sein Ersatz vorbereitet wird. Web-Klone erhalten den vorbereiteten Zustand vor dem Einfügen oder Layout und bleiben bis zur Übergabe als gesamte zusammengesetzte Ebene verborgen, damit ihr Erscheinungsbild nicht durch das aktive native Glas sichtbar wird.
2. Verwenden Sie bei der Darstellung das vorbereitete Bild erneut, ohne auf Erfassung, Kodierung, Dekodierung oder eine Bridge-Antwort zu warten. Verzögern Sie niemals den Klick der Anwendung und wiederholen Sie ihn nicht, um die Übergabe abzuschließen.
3. Platzieren Sie das Bild auf der Quellfläche unter dem Web-Hintergrund. Wenn ein Overlay sein `presentingElement` animiert, hängen Sie die vorbereitete reine Bildebene innerhalb dieses Elements ein, damit die Bilder dieselbe Transformation, Filterung und Beschneidung wie sein Hintergrund übernehmen. Verschieben Sie die tatsächlichen Ionic-Bedienelemente nicht. Konvertieren Sie akzeptierte Native-Grenzen zum bestehenden Bildziel des Renderers; lassen Sie dieses Ziel die Bewegung tragen, ohne pro Frame neu aufzunehmen oder Bedienelemente neu aufzubauen. Eine gemeinsame native Leiste benötigt Bilder aller ihrer zurücktretenden Bedienelemente.
4. Fordern Sie Bilder für flüssige Animationen an, wenn Bedienelemente während eines Übergangs nicht bedienbar sind. Darstellung und Schließen eines Modals folgen dieser Regel. Die Bilddarstellung überträgt keine Native-Quellverantwortung. Fehlende vorbereitete Bilder lassen diese Verantwortung bestehen; das Overlay kann aktive Bedienelemente unterdrücken, ohne eine interaktive Web-Kopie freizulegen. [Modal-Leistenbewegung](#modal-rail-movement) beschreibt Ziehen, Einrasten und Beschneidung.
5. Erstellen Sie bei der Rückkehr die nativen Bedienelemente an der aktuellen Position neu und entfernen Sie das Bild, nachdem die zugehörige native Aktualisierung akzeptiert wurde. Nur eine nach der Wiederherstellungsanforderung gestartete Aktualisierung, die jedes erfasste Bedienelement akzeptiert, darf die Rückkehr bestätigen. Richten Sie die Native-Darstellungsverantwortung vor dem Entfernen der Bilder ein, ohne Überblendung von Web zu Native. Eine ältere oder unvollständige Antwort darf eine neuere Übergabe nicht beenden. Entfernen Sie nur die temporäre Rückkehrkopie; halten Sie ein gültiges vorbereitetes Bild für sofortiges erneutes Öffnen bereit, bis sein Ersatz fertig ist. Das Verschieben einer gesamten vorübergehenden Fläche erhält ihr Bild, wenn Quellgrößen und Positionen relativ zu dieser Fläche unverändert bleiben; die Übergabe verwendet die aktuellen Zielkoordinaten. Änderungen innerhalb der Fläche oder an ihrem Erscheinungsbild machen den Cache ungültig. Ein Modal-Bild darf nur zu dem Modal zurückkehren, das es bereitgestellt hat.
6. Verwerfen Sie Bilder nach inkompatiblen Änderungen am Viewport, Layout oder Erscheinungsbild ihrer eigenen Quellen. Änderungen an einer anderen Fläche machen ein fertiges Bild nicht ungültig. Das Freigeben eines Bildes oder eine fehlgeschlagene Vorbereitung gibt seine Quelle nicht ins Web zurück. Native-Quellverantwortung endet nur bei ausdrücklicher Web-Übergabe, nicht mehr unterstützten oder ausgewählten Quellen, Native-Ablehnung oder Laufzeitfehler sowie beim Freigeben von Quelle oder Kontext. Ohne Bild kann ein Overlay aktive Native-Bedienelemente vorübergehend unterdrücken; dadurch wird die Web-Kopie nicht interaktiv.

Eine bereichsgebundene Aussetzung ohne Native-Navigation oder `runtime.suspend()` ohne `covered: true` fordert ausdrücklich Web-Darstellung an. Eine Native-Navigationsaussetzung behält ihre gewählte Quell-Lease auch dann, wenn ein Overlay die Wiedergabe unterbricht. Die Seitenauswahl kann bei `ionViewWillLeave` stoppen; Quellverantwortung endet nach dem Verlassen des Kontexts oder der Bestätigung des Native-Navigations-Commits. Der Kontext eines Modals endet bei `ionModalDidDismiss`, nicht beim Start seiner Schließanimation.

Hintergrundbedienelemente und Bedienelemente auf einem bewegten Modal verwenden denselben Bildlebenszyklus. Ihre Bildverantwortung bleibt getrennt, weil sie gleichzeitig auf unterschiedlichen Koordinatenflächen sichtbar sein können. Das Modal stellt seine verschobenen Rückkehrkoordinaten bereit; Komponentenadapter liefern native Grenzen und das Web-Renderingziel. Engine verwaltet das gemeinsame Bildübergabeprotokoll, die Koordinatenkonvertierung und das Entfernen von Kopien. Native UI liefert geeignete native Grenzen, entscheidet, welche vollständigen gemeinsamen Container verborgen werden dürfen, und wendet das normale native Layout sowie Aktualisierungsbestätigungen an. Komponentenadapter definieren keine eigenen Richtlinien für Erfassung, Übergabe oder Fehler. JavaScript aktualisiert die Attribute der Darstellungsverantwortung; dauerhaftes Laufzeit-CSS steuert Verbergen und Bildsichtbarkeit. Bildspezifische Stile enthalten nur Geometrie und Bild-URLs. Das Freigeben eines Bildes gibt daher niemals die Native-Darstellungsverantwortung für einen Web-Klon frei.

| Situation | Pfad |
| --- | --- |
| Natives Popover, das seine nativen Quellbedienelemente behält | Native Bedienelemente beibehalten; nicht einfrieren. |
| Blockierendes Web-Modal (einschließlich Card), Popover, Alert, Action Sheet, Loading oder Picker | Vorbereitete Hintergrundbilder verwenden, sofern verfügbar. |
| Sheet mit weiterhin interaktivem Hintergrund oder Overlay ohne Hintergrund | Bestehende aktive Darstellung beibehalten. |
| Menü, das Inhalt transformiert | Bestehenden Pfad beibehalten; keine festen Hintergrundbilder anwenden. |
| Toast | Bestehenden aktiven Pfad beibehalten. |

Ein verfügbares Bild berechtigt nicht dazu, den Deaktivierungszustand eines Bedienelements zu ändern, eine Aktion auszulösen, die Fokusbegrenzung zu umgehen oder ein Overlay zu verlängern. App-lokale Erweiterungen verwenden dieselbe Regel für vor dem Overlay vorbereitete Bilder; ihr Bild friert den zuletzt vorbereiteten Inhalt ein, während das Overlay Interaktionen verhindert. Prüfen Sie die Aufnahmetreue anhand des dargestellten nativen Materials einschließlich Unschärfe, bevor Sie die Bildübergabe für eine Komponente aktivieren.

## Modal-Leistenbewegung

Modal-Leistenbedienelemente verwenden die vom Theme-Layout bereitgestellte reservierte Werkzeugleistengrenze. Die Laufzeit wendet diese Regeln automatisch an; Anwendungen benötigen keine Drag-Listener oder Positionsaktualisierungen pro Frame.

| Modal-Zustand | Darstellung |
| --- | --- |
| Darstellung oder Schließen | Vorbereitetes Bild für den Übergang verwenden. |
| In Ruhe | Aktive Native-Bedienelemente verwenden. |
| Ziehen oder Einrasten, Werkzeugleiste an oder oberhalb der reservierten Grenze | Aktive Native-Bedienelemente an der Grenze halten. |
| Ziehen oder Einrasten, Werkzeugleiste unterhalb der reservierten Grenze | Vorbereitete Bilder verwenden, die sich mit dem Modal-Dialog bewegen. |

Darstellung und Schließen haben Vorrang vor den Bewegungsregeln. Eine Einrastanimation gehört bis zum Stillstand zur Bewegung. Stellt ein eigenes Layout keine verlässliche Grenzposition bereit, behält die Laufzeit den bestehenden bildfolgenden Pfad bei, ohne eine fixierte Grenze anzunehmen.

Bildziele liegen innerhalb des Modal-Dialogs, sodass dessen eigene Transformation sie mitführt. Native-Quellverantwortung verbleibt während Darstellung, Bewegung, Größenänderung und Bildwiederherstellung bei den akzeptierten Bedienelementen; sie endet, wenn der Modal-Kontext geschlossen wird oder eine andere ausdrückliche Freigabebedingung greift. Standard-, Card- und Sheet-Modals verwenden dieselbe Regel, wenn sie die Leiste überlappen. Ionics `ionViewWillLeave` stoppt die neue Seitenauswahl, entfernt aber keine bereits akzeptierten Bedienelemente, solange die aktuelle Modal-Richtlinie nicht interaktive Bilddarstellung verlangt, selbst wenn kein vorbereitetes Bild verfügbar ist. Ausdrückliche Web-Auswahl, Quellentfernung, Bindungsänderungen und Kontextende geben diese Bedienelemente weiterhin frei. Der Native-Renderer bleibt eingebunden, während seine Pixel verborgen sind. Eintritt und Rückkehr verwenden dieselbe Übergabe vorbereiteter Bilder wie andere Flächen. Temporäre Native-Kopien überbrücken Bestätigung und Web-Zeichnung; bewegte Bilder bleiben im Modal-Dialog. Bei verfügbaren Native-Grenzen wendet die Aktualisierung die Werkzeugleistenführung vor der Bestätigung ihres Layouts an; andernfalls wartet die Ausrichtung auf einen späteren Layoutdurchlauf. Die gemeinsame Übergabe entfernt Bilder bei der akzeptierten Aktualisierung, ohne Quellverantwortung zu ändern. Eine gemeinsame Leiste bleibt als Ganzes verborgen, solange Bildverantwortung für die Pixel eines ihrer Bedienelemente besteht.

Unterhalb der Grenze richtet sich die erste Leistenaktion am Mittelpunkt des Web-Werkzeugleistentitels aus. Native-Schaltflächengrenzen bestimmen die Ausrichtung; die geräteseitig reservierte Leistenoberkante ist ihre Untergrenze. Sind diese Grenzen verfügbar, richtet Native vor Bestätigung der Aktualisierung aus, sodass beim Einblenden keine unangepasste Geometrie sichtbar wird. Bildziele verwenden denselben Werkzeugleistenanker; nachfolgende Aktionen behalten den Native-Abstand, und das untere Modal-Layout bleibt an seinem Platz.

### Erscheinungsbild der Modal-Leistenbilder

Modal-Leistenübergaben erfassen Native-Renderer-Views ohne den umgebenden Fensterhintergrund. Transparente Pixel außerhalb der Schaltflächen verschmelzen mit der aktuellen Modal-Fläche, sodass diese Bilder keine DOM-Formbeschneidung benötigen. Dies gilt sowohl für eine ganze `ion-buttons`-Gruppe als auch für einzeln projizierte `ion-button`-Bedienelemente. Gewöhnliche Modal-Bedienelemente behalten ihren bestehenden Pfad.

Das Glasinnere kann weiterhin den erfassten Hintergrund enthalten; Reflexionen, Brechung, Schatten und Kantenlichter können von der aktiven Native-Darstellung abweichen. Es handelt sich nicht um ein Glasmaterial ohne Hintergrund. Seitenleisten und andere Flächen behalten die zusammengesetzte Fensteraufnahme einschließlich umgebender Schatten bei. Diese Übergabe erfordert zusammenpassende JavaScript- und native Implementierungen von Engine; allein die Aktualisierung des Web-Bundles aktualisiert nicht das native Übergabeprotokoll.
