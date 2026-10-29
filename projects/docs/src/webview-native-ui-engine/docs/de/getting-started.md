---
title: "Erste Schritte"
sourceRevision: "ea28b5c74bdb210658ad501762687d1202480f4895ec5d485047f4a696e3a670"
---
# WebView Native UI Engine

**Bringen Sie Web UI über die native Ebene.**

_Visuell, durch nahtlose Projektion von Native ins Web._

![Schematische Ansicht eines Web-Overlays über einer nativen Oberfläche und WebView-Inhalten](docs/assets/hero.png)

_Schematische Ansicht. Das native Erscheinungsbild wird während der Overlay-Darstellung in die Web-Ebene projiziert._

Entwickeln Sie WebView-Apps, in denen native Steuerelemente und Web-Inhalte dieselben scrollenden Ansichten, Übergänge und Overlays teilen.

## Über die WebView-Grenze hinaus

WebView-Apps verbinden die flexiblen Layouts des Webs mit dem Zugriff auf native Plattformfunktionen. Native UI und die Webseite liegen jedoch in getrennten Darstellungsebenen. Ein über der WebView platziertes natives Steuerelement nimmt nicht automatisch am Scrollen, Beschneiden oder an der Stapelreihenfolge des DOM teil. Ein Web-Modal kann es nicht einfach mit einem höheren `z-index` überdecken.

Das Überschreiten dieser Grenze erfordert mehr als einen Bridge-Aufruf. Positionierung, Erscheinungsbild, Eingaben, Rendering und Wiederherstellung müssen auf jeder Plattform über zwei Darstellungssysteme hinweg koordiniert werden. Diese Koordination für jede Komponente neu aufzubauen, macht ansonsten nützliche Designs aufwendig in Entwicklung und Wartung.

WebView Native UI Engine macht diese Arbeit wiederverwendbar. Anwendungen können native UI mit Web-gesteuerten Ansichten und Interaktionen verbinden und dabei die Mechanismen teilen, die die Darstellung zwischen beiden Ebenen verschieben. Ziel ist, die Möglichkeiten von WebView-Apps zu erweitern und ihre praktische Umsetzung zu erleichtern.

## Was dadurch möglich wird

- **Native UI in Web-gestalteten Ansichten.** Kombinieren Sie native Toolbars, Tab-Leisten, Player-Steuerelemente und geeignete SDK-Ansichten mit DOM-Layout und Navigation der Anwendung.
- **Web-Overlays, die mit nativen Inhalten koexistieren.** Stellen Sie Modals und andere Overlays über nativen Oberflächen dar und kehren Sie beim Schließen zur interaktiven nativen UI zurück.
- **Scrollen und Übergänge mit nativem Erscheinungsbild.** Führen Sie das aufgenommene Erscheinungsbild der nativen Oberfläche durch Bewegungen in der Web-Ebene, ohne dessen Stil in CSS nachzubauen.
- **Gemeinsame Infrastruktur über Komponenten und Plattformen hinweg.** Verwenden Sie unter iOS und Android denselben Projektions- und Wiederherstellungslebenszyklus, statt ihn in jeder Integration separat zu implementieren.

## Der Ansatz

Verwenden Sie die aktive native Ansicht dort, wo sie hingehört, und eine vorbereitete visuelle Projektion im DOM, wenn die Web-Ebene die Darstellung übernehmen muss. Stellen Sie die interaktive native Ansicht wieder her, sobald sie erneut übernehmen kann. Ein bestehender DOM-Container gibt der Web-Projektion ihren Platz im Layout und in der Ebenenstruktur der Anwendung.

Die Engine koordiniert diese Übergabe; der integrierende Renderer erstellt und positioniert weiterhin seine Ansichten. Ein projiziertes Bild bewahrt das Erscheinungsbild, keine direkte Interaktion und kein Video. Aufnahmeverfügbarkeit und Layoutunterstützung bestimmen, wann eine Projektion nutzbar ist, mit einem expliziten Fallback, wenn sie nicht möglich ist. Den genauen Vertrag und seine Grenzen beschreiben [Konzepte und Grenzen](docs/concepts.md).

## Ihren Einstieg wählen

Anwendungen erhalten diese Fähigkeiten durch Plugins, die die Engine integrieren. Plugin-Autoren behalten ihre bestehenden nativen Steuerelemente und öffentlichen APIs; die Engine koordiniert native und Web-Darstellung. Sie unterstützt iOS und Android mit Capacitor oder Cordova. Ionic und Angular sind nicht erforderlich.

| Einstieg | Zweck |
| --- | --- |
| [Dokumentation](docs/README.md) | Lesereihenfolge: grundlegende Initialisierung, optionales Verhalten, erweiterte APIs und Referenz. |
| [Konzepte und Grenzen](docs/concepts.md) | Entscheiden, ob Projektion zu Ihrer Komponente passt. |
| [Grundlegende Initialisierung](docs/getting-started/initialization.md) | Minimale Einrichtung und erforderliche Eingaben vor der Framework-spezifischen Integration. |

Die native Registrierung startet die Web-Laufzeit; die Basisintegration benötigt keinen separaten anwendungsseitigen Engine-Initialisierer. Die API liegt vor Version 1.0: Pinnen Sie übereinstimmende Engine-Versionen für npm und native Abhängigkeiten. Android-Positionierung erfordert API 23+, zusammengesetzte Snapshots sind ab API 26+ verfügbar.

## Referenz und Beiträge

Das [Dokumentationsverzeichnis](docs/README.md) verlinkt Konfiguration, erweiterte APIs, Containerunterstützung und Plattformverträge. Zur Repository-Entwicklung und Veröffentlichung siehe [Entwicklung und Veröffentlichungen](docs/maintenance.md).

## Lizenz

[MIT](LICENSE). Kommerzielle Nutzung, Änderung und Weiterverteilung sind unter Beachtung der Lizenzhinweis- und Namensnennungspflichten erlaubt. Die Lizenz der Engine ändert nicht die Lizenzen der Anwendungen oder Plugins, die von ihr abhängen.
