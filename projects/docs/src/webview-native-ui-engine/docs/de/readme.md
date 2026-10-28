---
title: "Erste Schritte"
sourceRevision: "c10edf558ec44d9e398f969293726ae7d5f6ae7e9c2af424b45a82fa9d2619cb"
---
# WebView Native UI Engine

**Bringen Sie Web-Oberflächen über die native Ebene.**

_Visuell durch nahtlose Projektion vom nativen Rendering ins Web._

![Konzeptdarstellung eines Web-Overlays über einer nativen Fläche und WebView-Inhalten](docs/assets/hero.png)

_Konzeptdarstellung. Bei der Anzeige eines Overlays wird das native Erscheinungsbild in die Web-Ebene projiziert._

Entwickeln Sie WebView-Apps, in denen native Bedienelemente und Web-Inhalte dieselben scrollenden Ansichten, Übergänge und Overlays teilen.

## Über die WebView-Grenze hinaus

WebView-Apps verbinden flexible Web-Layouts mit dem Zugriff auf native Plattformfunktionen. Native Oberflächen und Webseiten liegen jedoch in getrennten Rendering-Ebenen. Ein über der WebView platziertes natives Bedienelement nimmt nicht automatisch am Scrollen, Beschneiden oder an der Stapelreihenfolge des DOM teil. Ein Web-Modal kann es nicht einfach durch einen höheren `z-index` überdecken.

Diese Grenze zu überbrücken erfordert mehr als einen Bridge-Aufruf. Platzierung, Erscheinungsbild, Eingaben, Rendering und Wiederherstellung müssen auf jeder Plattform zwischen zwei Rendering-Systemen koordiniert werden. Diese Koordination für jede Komponente neu zu entwickeln, macht ansonsten nützliche Designs aufwendig in Auslieferung und Wartung.

WebView Native UI Engine macht diese Arbeit wiederverwendbar. Anwendungen können native Oberflächen mit Web-gesteuerten Ansichten und Interaktionen kombinieren und dabei die Mechanismen teilen, die die Darstellung zwischen beiden Ebenen übertragen. Ziel ist, die Möglichkeiten von WebView-Apps zu erweitern und deren praktische Auslieferung zu erleichtern.

## Was damit möglich wird

- **Native Oberflächen in Web-gestalteten Ansichten.** Kombinieren Sie native Werkzeugleisten, Tab-Leisten, Wiedergabesteuerungen und geeignete SDK-Ansichten mit DOM-Layout und Navigation der Anwendung.
- **Web-Overlays neben nativen Inhalten.** Zeigen Sie Modals und andere Overlays über nativen Flächen an und kehren Sie nach deren Schließen zur interaktiven nativen Oberfläche zurück.
- **Scrollen und Übergänge mit nativem Erscheinungsbild.** Bewegen Sie das erfasste Erscheinungsbild einer nativen Fläche durch die Web-Ebene, ohne ihren Stil in CSS nachzubauen.
- **Gemeinsame Infrastruktur für Komponenten und Plattformen.** Verwenden Sie denselben Projektions- und Wiederherstellungslebenszyklus auf iOS und Android, statt ihn in jeder Integration separat zu implementieren.

## Der Ansatz

Verwenden Sie die aktive native Ansicht dort, wo sie hingehört, und eine vorbereitete visuelle Projektion im DOM, wenn die Web-Ebene die Darstellung übernehmen muss. Stellen Sie die interaktive native Ansicht wieder her, sobald sie erneut übernehmen kann. Ein vorhandener DOM-Container gibt der Web-Projektion ihren Platz im Layout und in der Ebenenstruktur der Anwendung.

Die Engine koordiniert diese Übergabe; der integrierende Renderer erstellt und positioniert weiterhin seine Ansichten. Ein projiziertes Bild bewahrt das Erscheinungsbild, keine Live-Interaktion oder Videos. Die Verfügbarkeit der Aufnahme und die Layoutunterstützung bestimmen, wann eine Projektion möglich ist; andernfalls greift ein expliziter Fallback. Den genauen Vertrag und die Grenzen beschreibt das [Projektionsverhalten](/docs/projection).

## Integration

Anwendungen erhalten diese Fähigkeiten durch Plugins, die die Engine integrieren. Autoren von Capacitor- und Cordova-Plugins fügen sie als Bibliotheksabhängigkeit hinzu und behalten ihre nativen Bedienelemente und öffentlichen APIs. Dieselbe Engine unterstützt iOS und Android. Ionic und Angular sind nicht erforderlich; die Koordination von Ionic-Overlays ist optional.

- [Anleitung für Capacitor-Plugins](/docs/capacitor-plugin) — Abhängigkeiten installieren und Registrierung, Ereignisse sowie Bereinigung zum bestehenden Plugin hinzufügen.
- [Anleitung für Cordova-Plugins](/docs/cordova-plugin) — dieselbe Engine in Cordovas Lebenszyklus und Ressourcenhandler integrieren, ohne Capacitor-Abhängigkeit.

Die native Registrierung startet die Web-Laufzeit; für die Basisintegration benötigen Anwendungen keinen separaten Engine-Initialisierer. Behalten Sie die normale API und die Benachrichtigungen Ihres Plugins bei.

Die aktuelle API befindet sich vor Version 1.0. Verwenden Sie übereinstimmende, festgeschriebene Engine-Versionen für npm und native Abhängigkeiten. Android-Platzierung erfordert API 23 oder neuer; zusammengesetzte Momentaufnahmen sind ab API 26 verfügbar.

## Weiterführende Informationen

- [Unterstützte Projektionscontainer](/docs/projection-containers) — unterstützte HTML- und Ionic-Ziele, Größenbedingungen und Beispiele für umschließende Container.
- [Projektionsverhalten und erweiterte Integration](/docs/projection) — DOM-Anforderungen, Lebenszyklus, Fallback-Richtlinien, optionale Ionic-Unterstützung und untergeordnete APIs.
- [Entwicklung und Veröffentlichungen](/docs/maintenance) — Repositorystruktur, Validierung und Veröffentlichung.

## Lizenz

[MIT](LICENSE). Kommerzielle Nutzung, Änderung und Weiterverteilung sind unter Einhaltung der Hinweis- und Namensnennungspflichten der Lizenz erlaubt. Die Lizenz der Engine verändert nicht die Lizenzen abhängiger Anwendungen oder Plugins.
