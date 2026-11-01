---
title: "Helle und dunkle Darstellung"
sourceRevision: "0d27ef0b11abb98f9364c0d16619ce91158b179981d807356d1e6e2bfd521a77"
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

Für die Übergabe gelten folgende Regeln:

1. Bereiten Sie Bilder nach einer akzeptierten nativen Aktualisierung vor und fassen Sie nachfolgende visuelle Änderungen zusammen. Nehmen Sie während einer Berührung keine Bilder auf. Behalten Sie das letzte fertige Bild, während sein Ersatz vorbereitet wird. Web-Klone erhalten den vorbereiteten Zustand vor dem Einfügen oder Layout und bleiben bis zur Übergabe als gesamte zusammengesetzte Ebene verborgen, damit ihr Erscheinungsbild nicht durch das aktive native Glas sichtbar wird.
2. Verwenden Sie bei der Darstellung das vorbereitete Bild erneut, ohne auf Erfassung, Kodierung, Dekodierung oder eine Bridge-Antwort zu warten. Verzögern Sie niemals den Klick der Anwendung und wiederholen Sie ihn nicht, um die Übergabe abzuschließen.
3. Platzieren Sie das Bild auf der Quellfläche unter dem Web-Hintergrund. Wenn ein Overlay sein `presentingElement` animiert, hängen Sie die vorbereitete reine Bildebene innerhalb dieses Elements ein, damit die Bilder dieselbe Transformation, Filterung und Beschneidung wie sein Hintergrund übernehmen. Verschieben Sie die tatsächlichen Ionic-Bedienelemente nicht. Konvertieren Sie die Koordinaten einmal vor der Animation; eine Positions- oder Farbsynchronisierung pro Frame ist nicht nötig. Eine gemeinsame native Leiste benötigt Bilder aller ihrer zurücktretenden Bedienelemente.
4. Lassen Sie beim Bewegen eines Sheets dessen Web-Fläche das Bild mitführen. Senden Sie nicht für jeden Animationsframe eine native Positionsaktualisierung.
5. Erstellen Sie bei der Rückkehr die nativen Bedienelemente an der aktuellen Position neu und entfernen Sie das Bild, nachdem die zugehörige native Aktualisierung akzeptiert wurde. Nur eine nach der Wiederherstellungsanforderung gestartete Aktualisierung, die jedes erfasste Bedienelement akzeptiert, darf die Rückkehr bestätigen. Richten Sie die Native-Darstellungsverantwortung vor dem Entfernen der Bilder ein, ohne Überblendung von Web zu Native. Eine ältere oder unvollständige Antwort darf eine neuere Übergabe nicht beenden. Entfernen Sie nur die temporäre Rückkehrkopie; halten Sie ein gültiges vorbereitetes Bild für sofortiges erneutes Öffnen bereit, bis sein Ersatz fertig ist. Das Verschieben einer gesamten vorübergehenden Fläche erhält ihr Bild, wenn Quellgrößen und Positionen relativ zu dieser Fläche unverändert bleiben; die Übergabe verwendet die aktuellen Zielkoordinaten. Änderungen innerhalb der Fläche oder an ihrem Erscheinungsbild machen den Cache ungültig. Ein Modal-Bild darf nur zu dem Modal zurückkehren, das es bereitgestellt hat.
6. Verwerfen Sie Bilder nach inkompatiblen Änderungen am Viewport, Layout oder Erscheinungsbild ihrer eigenen Quellen. Änderungen an einer anderen Fläche machen ein fertiges Bild nicht ungültig. Fehlende Bilder und Bridge-Fehler müssen die Darstellungsverantwortung an die bestehende Web-Darstellung zurückgeben, statt Eingaben zu blockieren oder ein veraltetes Bild unbegrenzt anzuzeigen.

Hintergrundbedienelemente und Bedienelemente auf einem bewegten Modal verwenden denselben Bildlebenszyklus. Ihre Bildverantwortung bleibt getrennt, weil sie gleichzeitig auf unterschiedlichen Koordinatenflächen sichtbar sein können. Das Modal stellt seine verschobenen Rückkehrkoordinaten bereit; Komponentenadapter liefern native Grenzen und das Web-Renderingziel. Engine verwaltet das gemeinsame Bildübergabeprotokoll, die Koordinatenkonvertierung und das Entfernen von Kopien. Native UI liefert geeignete native Grenzen, entscheidet, welche vollständigen gemeinsamen Container verborgen werden dürfen, und wendet das normale native Layout sowie Aktualisierungsbestätigungen an. Komponentenadapter definieren keine eigenen Richtlinien für Erfassung, Übergabe oder Fehler. JavaScript aktualisiert die Attribute der Darstellungsverantwortung; dauerhaftes Laufzeit-CSS steuert Verbergen und Bildsichtbarkeit. Bildspezifische Stile enthalten nur Geometrie und Bild-URLs. Das Freigeben eines Bildes gibt daher niemals die Native-Darstellungsverantwortung für einen Web-Klon frei.

| Situation | Pfad |
| --- | --- |
| Natives Popover, das seine nativen Quellbedienelemente behält | Native Bedienelemente beibehalten; nicht einfrieren. |
| Blockierendes Web-Modal (einschließlich Card), Popover, Alert, Action Sheet, Loading oder Picker | Vorbereitete Hintergrundbilder verwenden, sofern verfügbar. |
| Sheet mit weiterhin interaktivem Hintergrund oder Overlay ohne Hintergrund | Bestehende aktive Darstellung beibehalten. |
| Menü, das Inhalt transformiert | Bestehenden Pfad beibehalten; keine festen Hintergrundbilder anwenden. |
| Toast | Bestehenden aktiven Pfad beibehalten. |

Ein verfügbares Bild berechtigt nicht dazu, den Deaktivierungszustand eines Bedienelements zu ändern, eine Aktion auszulösen, die Fokusbegrenzung zu umgehen oder ein Overlay zu verlängern. App-lokale Erweiterungen verwenden dieselbe Regel für vor dem Overlay vorbereitete Bilder; ihr Bild friert den zuletzt vorbereiteten Inhalt ein, während das Overlay Interaktionen verhindert. Prüfen Sie die Aufnahmetreue anhand des dargestellten nativen Materials einschließlich Unschärfe, bevor Sie die Bildübergabe für eine Komponente aktivieren.
