---
title: "Helle und dunkle Darstellung"
sourceRevision: 6da740af0bca08915348a7a2e67a2213f4ada9e2ec6678e05ec547069beba910
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