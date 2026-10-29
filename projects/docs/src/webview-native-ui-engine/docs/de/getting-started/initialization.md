---
title: "Grundlegende Initialisierung"
sourceRevision: "55b35c15a1050e71982b5937734839562c86c9252cc3ac4451fad5da632c0f9c"
---
# Eine native Ansichtsregistrierung initialisieren

Beginnen Sie mit `NativeUIProjection`, wenn ein Plugin eine native Ansicht und einen zugehörigen Web-Container besitzt. Die Registrierung startet die Laufzeit, bindet diesen Container und koordiniert Bildübergabe und Wiederherstellung. Für diesen Weg benötigen Sie keine Renderer-APIs.

Verwenden Sie den [Capacitor](capacitor.md)- oder [Cordova](cordova.md)-Leitfaden für die Installation von Abhängigkeiten, Plugin-Lebenszyklus-Hooks und Benachrichtigungsweiterleitung. Die folgenden Beispiele zeigen die kleinste Registrierung innerhalb dieser Hooks, gefolgt von den erforderlichen Eingaben. Nach der Initialisierung beschreibt der Konfigurationsleitfaden optionales Verhalten; erweiterte APIs haben einen eigenen Einstiegspunkt.

Beispielsweise zeichnet ein Plugin bereits eine native Tab-Leiste, aber die Anwendung öffnet darüber ein Web-Einstellungs-Sheet. Registrieren Sie die Leiste und ihren Fallback-Navigationshost, damit die Engine die aufgenommene Leiste unter diesem Sheet platzieren und native Eingaben beim Schließen wiederherstellen kann. Das Plugin behält seine bestehende API zur Tab-Auswahl.

## Minimale Initialisierung

Erstellen und behalten Sie eine Registrierung, nachdem Ihr Renderer seine native Ansicht angehängt hat. Der Selektor darf einen erst später eingefügten DOM-Container finden, aber die native Darstellung wartet, bis dieser Container existiert. Geben Sie ihm eine [unterstützte Layoutbox](../reference/containers.md).

In einem Capacitor-Swift-Plugin, innerhalb von `load()` oder des bestehenden Renderer-Initialisierers:

```swift
projection = try NativeUIProjection(
    webView: bridge?.webView,
    plugin: jsName,
    projectionSelector: "#native-ui-fallback",
    view: { [weak self] in self?.nativeView }
)
```

Installieren Sie in einem Capacitor-Kotlin-Plugin den gemeinsamen Kanal in `load()` **vor der ersten WebView-Navigation**. Die Registrierung kann später erstellt werden, sobald ihre Ansicht bereitsteht:

```kotlin
NativeUIProjection.install(bridge.webView)
projection = NativeUIProjection(
    window = activity.window,
    webView = bridge.webView,
    plugin = pluginHandle.id,
    projectionSelector = "#native-ui-fallback",
    view = { nativeView }
)
```

Beide Snippets gehören in die Fehlerbehandlung des Integrationsleitfadens; behalten Sie bei fehlgeschlagener Initialisierung den bestehenden Web-Fallback bei. `projection` und `nativeView` sind Eigenschaften Ihres Plugins. Geben Sie die Registrierung mit `destroy()` unter iOS oder `close()` unter Android frei, wenn dieser Renderer entfernt wird. Alle nativen Lebenszyklusaufrufe laufen im UI-Thread.

Cordova verwendet dieselbe Registrierung mit `runtime: .cordova` / `runtime = Runtime.CORDOVA` sowie seiner eigenen WebView und Plugin-Identität. Folgen Sie dem [Cordova-Leitfaden](cordova.md) für diese Hooks und den Ressourcenhandler unter Android.

## Erforderliche Eingaben

| Eingabe | Plattformen | Was sie identifiziert und warum |
| --- | --- | --- |
| `webView` | iOS / Android | Die WebView der Anwendung, der Zieldokument und Bridge gehören. Swift akzeptiert eine optionale Referenz, sodass eine fehlende WebView einen Fehler in der Initialisierungsfehlerbehandlung auslöst. |
| `plugin` | iOS / Android | Die bestehende Plugin-Identität ordnet Benachrichtigungen diesem Plugin statt einem anderen Engine-Verbraucher zu. Capacitor: `jsName` unter iOS, `pluginHandle.id` unter Android. Cordova: der konfigurierte Dienstname. |
| `projectionSelector` | iOS / Android | Ein CSS-Selektor, der beim Beginn der Darstellung genau einen bestehenden Web-Container findet. Er gibt dem Bild das richtige Layout und die richtige Overlay-Ebene; ein natives Rechteck kann diese DOM-Ebene nicht bestimmen. |
| `view` | iOS / Android | Ein Callback, der die aktuelle native Ansicht des Renderers oder bei deren Fehlen nil/null zurückgibt. Geben Sie die aktuelle Ansicht innerhalb dieser Renderer-Lebensdauer zurück. Beim Ersetzen des Renderers geben Sie dessen Registrierung frei und erstellen eine neue; Layout und normale Sichtbarkeit gehören dem Plugin. |
| `window` | Android | Das Fenster mit WebView und nativer Oberfläche, erforderlich für zusammengesetzte Aufnahme und Interaktionsverfolgung. |

Diese Eingaben legen Zuständigkeiten fest. Sie teilen der Engine nicht mit, wann Inhalte geändert werden oder wann ein Anwendungsübergang die Darstellung verändern soll.

## Weiter: Veränderliche UI konfigurieren

Die minimale Registrierung legt Zuständigkeiten fest. Fahren Sie mit [optionalen Einstellungen](../configuration/README.md) für Ereignisverknüpfung, Wertübertragung, Aufnahme und Fehlerstrategie fort. Jede Einstellung nennt ihren Standardwert und ihren Einsatzfall. Lesen Sie [erweiterte APIs](../advanced/README.md) nur, wenn Ihr Renderer bereits Batches, Positionierung oder Aktualisierungsabgleich verwaltet.

[Dokumentationsübersicht](../README.md)
