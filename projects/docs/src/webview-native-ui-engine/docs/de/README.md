---
title: "Dokumentationsübersicht"
sourceRevision: "89d93b28716c579e0f214dd6295f82a48c0db142e66d1fbcb768d8accb6ac73f"
---
# Dokumentation

Entwickeln Sie Web-gesteuerte Ansichten mit nativen Steuerelementen und Funktionen. Diese Leitfäden erklären, wie Sie die Engine in ein Plugin integrieren, damit Web UI und Native UI koexistieren können. Beginnen Sie mit [dem gemeinsamen Modell](concepts.md): wie eine native Komponente in ein Web-Layout eingebunden ist, welche Ebene sie darstellt und wie die Interaktion zur aktiven Ansicht zurückkehrt. Scrollen und Overlays sind Beispiele dieser Koordination, keine getrennten Integrationsmodelle.

Wählen Sie anschließend die kleinste Integration, die zu Ihren Zuständigkeiten passt. Registrieren Sie eine native Ansicht und ihren DOM-Container, verbinden Sie die benötigten Lebenszyklusbenachrichtigungen und ergänzen Sie erweiterte APIs nur dann, wenn Sie bereits die Bündelung oder Platzierung eines Renderers verwalten.

## Nach dem zu lösenden Problem auswählen

| Fall | Einstieg | Grund |
| --- | --- | --- |
| Eine geeignete native SDK-Ansicht gehört in einen scrollenden Web-Feed | [Grundlegende Registrierung](getting-started/initialization.md) und [Plattformgrenzen](reference/platforms.md) | Binden Sie sie an ihren DOM-Container; native Verfolgung oder vorübergehende Bilddarstellung hängen von Plattform und Layout ab. |
| Ein Web-Modal muss die native Tab-Leiste eines Plugins überdecken | [Grundlegende Registrierung](getting-started/initialization.md), dann der Framework-Integrationsleitfaden | Registrieren Sie die Ansicht und ihren DOM-Host und verbinden Sie den Overlay-Lebenszyklus; die Engine koordiniert Übergabe und Wiederherstellung. |
| Ein verborgener Fallback kehrt mit der alten Schalterauswahl zurück | [Wertbindungen](configuration/values.md) | Übertragen Sie aktuelle native Daten auf den Fallback-Host, unabhängig davon, wo er dargestellt wird. |
| Toolbar-Schaltflächen im Hintergrund und Modal-Schaltflächen im Vordergrund benötigen unterschiedliche Übergabelebensdauern | [Renderer-Oberflächen](advanced/renderer.md) | Trennen Sie Besitzer, damit das Schließen einer Oberfläche nicht die Steuerelemente einer anderen wiederherstellt. |
| Ein bestehender Renderer überlappt Aktualisierungen oder verliert eine native Bestätigung | [Aktualisierungswarteschlange](advanced/update-queue.md) | Serialisieren Sie Durchläufe mit aktuellem Zustand und gleichen Sie die Verbindung ab, ohne Benutzeraktionen erneut auszuführen. |

Die vollständige Lesereihenfolge folgt. Überspringen Sie erweiterte APIs, sofern Ihr Renderer die in ihren Fällen beschriebene Arbeit nicht übernimmt.

## 1. Den Ansatz verstehen

[Konzepte und Grenzen](concepts.md) erklärt, was Projektion ermöglicht, wie sie sich von aktiver nativer UI und Web-Fallback unterscheidet und welche Zuständigkeiten beim Plugin bleiben.

## 2. Initialisieren und integrieren

Lesen Sie [grundlegende Initialisierung](getting-started/initialization.md) für den minimalen Aufruf und erforderliche Eingaben. Wählen Sie dann einen Plattform-/Framework-Leitfaden:

- [Capacitor-Plugin](getting-started/capacitor.md): Abhängigkeiten, native Plugin-Hooks, Ereignisweiterleitung und Abbau.
- [Cordova-Plugin](getting-started/cordova.md): dieselbe Registrierung mit Cordova-Start und Ressourcenbehandlung.

Keiner der beiden Wege benötigt einen zweiten anwendungsseitigen Engine-Wrapper oder die erweiterten Renderer-APIs.

## 3. Optionales Verhalten ergänzen

[Registrierungseinstellungen](configuration/README.md) führt Standardwerte und die Situationen auf, die jede Option erfordern. Lesen Sie nur die relevanten Einzelheiten:

- [Benachrichtigungen](configuration/events.md): Der Engine Änderungen von Erscheinungsbild oder Darstellung melden.
- [Wertbindungen](configuration/values.md): Komponentendaten des Fallback-Hosts mit dem nativen Zustand abgleichen.
- [Aufnahmezeitpunkt](configuration/capture.md): Bildpunkte vorbereiten, nachdem sich das native Erscheinungsbild stabilisiert hat.
- [Ionic-Overlays](configuration/ionic-overlays.md): Ionic-Abdeckung mit einem gemeinsamen Anwendungsinitialisierer verbinden.
- [Benutzerdefinierte Web-Overlays](configuration/pause-resume.md): pause/resume aus einem Plugin erneut exportieren, damit Anwendungen ihre eigenen Overlays damit einrahmen können.

## 4. Erweiterte APIs bei eigenem Renderer verwenden

[Wählen Sie eine erweiterte API](advanced/README.md), bevor Sie eine hinzufügen. Diese Leitfäden behandeln verschiedene Anforderungen bestehender Renderer; sie bilden keine Abfolge erforderlicher Einrichtungsschritte.

- [Seiten- und Modal-Oberflächen](advanced/renderer.md)
- [Untergeordnete Web-Projektion und Batches](advanced/web-projection.md)
- [Native Übergabe und Scroll-Bindungen](advanced/native-handoff.md)
- [Aufgeschobene Android-Positionierung](advanced/android-placement.md)
- [Serialisierung und Wiederherstellung von Aktualisierungen](advanced/update-queue.md)

## Referenz

Prüfen Sie mit diesen Seiten Verträge und unterstütztes Verhalten bei der Implementierung beider Wege:

- [Projektionsvertrag und Lebensdauer](reference/projection.md)
- [HTML- und Ionic-Containerunterstützung](reference/containers.md)
- [Beobachtbare Darstellungsabsicht](reference/state.md)
- [Aufnahme- und Plattformgrenzen](reference/platforms.md)

## Beiträge

[Entwicklung und Veröffentlichungen](maintenance.md) beschreibt Repository-Struktur, lokale Prüfung, CI und Veröffentlichung. Für die Verwendung der Engine ist dies nicht erforderlich.
