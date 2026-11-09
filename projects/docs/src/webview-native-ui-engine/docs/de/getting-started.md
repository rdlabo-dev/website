---
title: "Erste Schritte"
sourceRevision: "e0cb1e5d66f43833d78bf2f23945d89821bba9fbfe7e62a451fb632edbe114b2"
---
# Über die WebView hinaus.

**Native UI nahtlos in Web-Apps integrieren.**

Entwickeln Sie Ihre Ansichten mit der Flexibilität des Webs und den Steuerelementen und Funktionen nativer Plattformen. WebView Native UI Engine verbindet sie zu einem einheitlichen Erlebnis, während Ihre Web-Layouts und Navigation erhalten bleiben.

## Web UI. Native UI. Ein Erlebnis.

Eine native Komponente sollte sich wie ein Teil der umgebenden Ansicht verhalten. Zum Beispiel:

- **Gemeinsam scrollen.** Eine native Anzeige bewegt sich mit dem umgebenden Web-Inhalt, während der Leser durch einen Feed scrollt.
- **Ebenen gemeinsam nutzen.** Ein Web-Alert erscheint über nativen Navigationselementen. Nach dem Schließen stehen diese wieder für native Interaktionen bereit.

Scrollen und Overlays sind Beispiele für ein größeres Ziel: Web UI und Native UI während des gesamten Lebenszyklus einer Ansicht koexistieren zu lassen.

![Konzeptansicht eines Web-Overlays über einer nativen Oberfläche und WebView-Inhalten](docs/assets/hero.png)

_Konzeptansicht einer Overlay-Darstellung. Die Engine projiziert das native Erscheinungsbild in die Web-Ebene; sie ordnet die tatsächliche native Ansicht nicht innerhalb des DOM neu an._

https://github.com/user-attachments/assets/2768f014-7325-49c7-b848-25052756c36d

Native Steuerelemente unter einem Web-Alert, gefolgt von einer nativen Anzeige, die mit dem Web-Inhalt scrollt. Aufgenommen im iOS Simulator.

## Für Plugin-Entwickler konzipiert

WebView Native UI Engine ist eine Bibliothek für **Entwickler von Capacitor- und Cordova-Plugins**. Integrieren Sie sie in ein Plugin, um native Komponenten in Web-gesteuerte Ansichten einzubinden, ohne dass jede Anwendung die Koordination zwischen Darstellungsebenen selbst entwickeln muss.

Eine native Ansicht über einer WebView nimmt nicht automatisch am Scrollen, Beschneiden oder an der Stapelreihenfolge des DOM teil. Ein Web-Modal kann sie nicht einfach mit einem höheren `z-index` überdecken. Die Engine koordiniert die Darstellung über diese Grenze hinweg, damit Sie sich auf die Steuerelemente und nativen Fähigkeiten Ihres Plugins konzentrieren können.

Verwenden Sie sie für Symbolleisten, Tab-Leisten, Steuerelemente und aufnehmbare SDK-Ansichten. Behalten Sie Ihre bestehende Plugin-API und Geschäftslogik bei; Anwendungen erhalten diese Fähigkeiten durch die von ihnen verwendeten Plugins.

## Funktionsweise

Das Plugin stellt eine native Ansicht und einen DOM-Container bereit, der ihren Platz im Web-Layout definiert. Die Engine koordiniert DOM-Messungen, unterstützte native Scroll-Verfolgung und die Übergabe zwischen nativer und Web-Darstellung.

Wenn die Web-Ebene die Darstellung übernehmen muss, zeigt die Engine ein vorbereitetes Bild der nativen Komponente in diesem Container an. Sobald die native Darstellung wieder möglich ist, koordiniert sie die Platzierung und Wiederherstellung der interaktiven Ansicht.

Das Bild ist eine vorübergehende visuelle Projektion, kein zweites interaktives Steuerelement. Es leitet keine Klicks weiter und spielt keine Live-Videos ab. Aufnahmebedingungen und plattformspezifische Darstellungsgrenzen gelten weiterhin, einschließlich abweichender Liquid Glass-Glanzlichter. Ist kein geeignetes Bild verfügbar, verwendet die Integration ihren konfigurierten Web-Fallback. Lesen Sie vor der Auswahl einer Komponente die [Konzepte und Grenzen](docs/concepts.md) und die [Plattformunterstützung](docs/reference/platforms.md).

## Mit der Entwicklung beginnen

Die Engine unterstützt **iOS und Android**. Ionic und Angular sind optional. Beginnen Sie mit einer nativen Ansicht und ihrem DOM-Container und verbinden Sie anschließend die für Ihre UI benötigten Lebenszyklusbenachrichtigungen. Die Integrationsleitfäden behandeln den Laufzeitstart und die optionale Framework-Unterstützung.

| Einstieg | Zweck |
| --- | --- |
| [Grundlegende Initialisierung](docs/getting-started/initialization.md) | Eine native Ansicht und ihren DOM-Container mit der minimal erforderlichen Einrichtung registrieren. |
| [Capacitor-Plugin-Leitfaden](docs/getting-started/capacitor.md) | Die Engine mit einem vorhandenen Capacitor-Plugin verbinden. |
| [Cordova-Plugin-Leitfaden](docs/getting-started/cordova.md) | Denselben Lebenszyklus über die nativen Hooks von Cordova nutzen. |
| [Dokumentation](docs/README.md) | Optionale Einstellungen, Renderer-APIs und Referenzen nach dem zu lösenden Problem finden. |

Verwenden Sie übereinstimmende Engine-Versionen in npm und den nativen Abhängigkeiten und behalten Sie die Abhängigkeits-Lockdateien für reproduzierbare Builds bei. Die Android-Platzierung benötigt API 23+; zusammengesetzte Schnappschüsse sind ab API 26 verfügbar.

## Optionale Ionic-Integration

Für Ionic-Anwendungen mit einem Engine-fähigen Plugin verbindet der Einstiegspunkt `@webview-native-ui/engine/ionic` Ionic-Overlay-Lebenszyklusereignisse mit der nativen Projektion:

```ts
import { enableSupportIonicOverlays } from '@webview-native-ui/engine/ionic';

enableSupportIonicOverlays();
```

Rufen Sie ihn einmal beim Anwendungsstart auf, sofern Ihr Plugin ihn nicht bereits aktiviert. Anwendungen, die ihn direkt importieren, benötigen `@webview-native-ui/engine` als direkte Abhängigkeit. Diese gemeinsame Framework-Integration koordiniert die Abdeckung zwischen Plugins; jedes Plugin behält die Kontrolle über seine eigene Darstellungs-API. Einrichtung, unterstützte Overlays und Renderer-Hilfsfunktionen beschreibt die [Ionic-Overlay-Unterstützung](docs/configuration/ionic-overlays.md).

## Mitwirken

Entwicklung, Prüfung und Veröffentlichung des Repositorys beschreibt [Entwicklung und Releases](docs/maintenance.md).

## Lizenz

[MIT](LICENSE). Kommerzielle Nutzung, Änderungen und Weiterverbreitung sind unter Einhaltung der Hinweis- und Namensnennungspflichten der Lizenz erlaubt. Die Lizenz der Engine ändert nicht die Lizenzen der Anwendungen oder Plugins, die von ihr abhängen.

Die optionale gemeinsame Steuerelement-Laufzeit und die Zuständigkeitsgrenzen der Adapter beschreibt [Gemeinsame Steuerelemente](docs/controls.md).
