---
title: "Erste Schritte"
sourceRevision: 4484dc8e981ab5849c82ee0b4400cbf6959e5a026bad2c478d18078ab1583ccc
---
# Capacitor Native UI

Stellen Sie unterstützte Web-Bedienelemente unter iOS mit UIKit und SwiftUI dar, während Anwendungszustand, Routing und Handler in der WebView bleiben. Verwenden Sie bestehendes Ionic-Markup oder ausdrücklich gekennzeichnete HTML-Schaltflächen; eigene SwiftUI- oder Android-Compose-Inhalte lassen sich über experimentelle app-lokale Erweiterungen ergänzen.

Native UI muss ausdrücklich aktiviert werden und wird ab Version 2.0.0 offiziell unterstützt. Standardbedienelemente unter Android, in Browsern, unter älterem iOS sowie nicht unterstützte Bedienelemente behalten ihre Web-Darstellung. Android unterstützt experimentelle app-lokale Compose-Erweiterungen. Behalten Sie Stile und Layout Ihrer Anwendung; das iOS-Theme ist optional.

## Funktionsweise der Projektion

Eine **Projektion** ist eine weitere Darstellung eines Web-Bedienelements. Ihre Anwendung behält das ursprüngliche DOM-Element, den Zustand und die Ereignishandler. Das Plugin liest unterstützte Beschriftungen, Symbole, Auswahl-/Deaktivierungszustände und Geometrie und ordnet anschließend das dargestellte Bedienelement seinem Quellelement zu. Es wandelt die Seite nicht in einen nativen Bildschirm um und führt keine zweite Kopie Ihrer Anwendung aus.

| Web-Quelle | Projizierte Darstellung |
| --- | --- |
| Unterstützte Ionic-Schaltflächen, Tabs und Segmente | Native UIKit-/SwiftUI-Bedienelemente unter unterstütztem iOS |
| Ausdrücklich markierte HTML-Schaltflächen und Zurückschaltflächen | Native Schaltflächen unter unterstütztem iOS |
| Geeignete Bedienelemente in Vertical Bars | SwiftUI-Bedienelemente in der verfügbaren Systemleiste; andernfalls Web-Seitenleiste |
| DOM-Element einer app-lokalen Erweiterung | Von Ihrer App registrierte SwiftUI- oder Compose-Inhalte mit aus diesem Element gelesenen Props |

Das Originalelement **bleibt während der Projektion im DOM**. Bindungen und Handler bleiben verbunden. Sobald die native Darstellung akzeptiert wurde, blendet die Laufzeit die Quelle visuell aus, verhindert direkte Zeigerinteraktionen und verbirgt sie vor der Web-Barrierefreiheit, damit keine zwei interaktiven Kopien existieren. Elementprojektion erhält die Layoutbox der Quelle; die Abstände der Seitenleiste liefert Ihre App oder Ihr Theme. Eine Web-Seitenleiste verwendet entsprechend die Web-Darstellung ihres Adapters: Ionic-Layout/Klone oder HTML-Proxy-Schaltflächen in Ihrem `webHost`.

Beispielsweise aktiviert das Antippen einer projizierten Speichern-Schaltfläche die ursprüngliche Web-Schaltfläche. Ihr vorhandener Handler speichert und aktualisiert den Anwendungszustand; unterstützte DOM-Änderungen aktualisieren anschließend die Projektion. Auch Tabs und andere Bedienelemente leiten Aktionen über ihre Quelladapter weiter. Aktualisieren Sie weiterhin die Quelle, statt einen separaten nativen Zustand zu verwalten. Für Reader-Werte, die sich ohne DOM-Mutation ändern, verwenden Sie `markForCheck()`.

Projektion ändert die Darstellung; sie übersetzt kein beliebiges HTML oder CSS in native Ansichten. Native Bedienelemente verwenden unterstützte Daten und Stile; eine eigene Web-Darstellung wird nicht garantiert nachgebildet. Entfernen oder Deaktivieren einer Quelle verhindert weitere gültige Aktionen. Ist Projektion nicht verfügbar oder wird sie beendet, hebt die Laufzeit ihre Ausblendung auf und die Quelle kehrt zur Web-Darstellung oder einer verfügbaren Web-Seitenleiste zurück. Der eigene Sichtbarkeits-/Deaktivierungszustand Ihrer Anwendung gilt weiterhin.

## Wählen Sie Ihr Ziel

| Ziel | Einstieg |
| --- | --- |
| Bestehende Ionic-Bedienelemente nativ darstellen | [Ionic-Einrichtung](/docs/setup) |
| Native Schaltflächen ohne Ionic verwenden | [HTML-Einrichtung](/docs/framework-independent) |
| Ionic eine Seitenleiste hinzufügen und das Theme behalten | [Vertical Bars Schritt für Schritt](/docs/ionic-vertical-bars) |
| Eine Seitenleiste ohne Ionic hinzufügen | [HTML-Seitenleiste einrichten](/docs/framework-independent) |
| Native Bedienelemente zu einer bestehenden iOS-27-Theme-App hinzufügen | [Native UI zum Theme hinzufügen](/ionic-theme-ios27/docs/add-native-ui) |
| Eigene SwiftUI- oder Android-Compose-Inhalte darstellen | [App-lokale Erweiterungen (experimentell)](/docs/native-ui-extensions) |

## Von npm installieren

Als Standardintegration für das Gerätelayout verwenden wir [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable), ein hervorragendes Community-Plugin von Erkam Yaman. Es stellt Ihrer Anwendung Faltzustand, Scharniergeometrie, Leistenposition und Änderungsereignisse bereit, damit Sie die Layoutreaktionen steuern können. Foldable meldet den Gerätezustand, das Theme stellt Web-Layout-Helfer bereit und Native UI projiziert Bedienelemente. Installieren Sie es neben dem verwendeten Paket und verbinden Sie anschließend seine Ereignisse mit Ihrer App.

Installieren Sie Native UI und Foldable gemeinsam in Ihrer Capacitor-Anwendung:

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Wenn Sie auch das iOS-27-Theme verwenden, installieren oder aktualisieren Sie beide Pakete gemeinsam:

```sh
npm install @rdlabo/capacitor-native-ui @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

Theme und Native UI haben dieselbe Releaseversion; Foldable wird unabhängig versioniert. Deklarieren Sie Native UI als direkte Abhängigkeit, damit Capacitor das Plugin erkennen kann. Die Einrichtungsbefehle installieren Foldable als separate Anwendungsabhängigkeit. Die Installation dieser Pakete aktiviert keine nativen Bedienelemente; beim Anwendungsstart werden Projektion gewählt und Gerätelayout verbunden.

Fahren Sie mit [Ionic-Einrichtung](/docs/setup), [HTML-Einrichtung](/docs/framework-independent) oder [Erweiterungen](/docs/native-ui-extensions) fort. Erstellen Sie nach der Startkonfiguration die Web-Assets Ihrer Anwendung, führen Sie `npx cap sync` aus und erstellen Sie die native App erneut. Ein Repository-Checkout oder Archivdownload ist nicht erforderlich.

Sie migrieren von den in Theme 1.2.0 oder 1.2.1 enthaltenen nativen APIs? Die [Migrationsanleitung](/docs/migration) beschreibt Änderungen an Importen, Konfiguration und nativem Projekt.

## Anforderungen

Der native Start erfordert Capacitor 8 und ein iOS- oder Android-Projekt. Android-Erweiterungen benötigen API 24+ und Kotlin/Compose. Gewöhnliches natives Rendering erfordert iOS 26+ und Xcode 26+. Der Ionic-Adapter unterstützt Ionic `>=8.8.1 <10`; der HTML-Adapter unter `/core` benötigt weder Ionic noch ein Theme-Paket. Für [Vertical Bars](/docs/vertical-bars) und [Erweiterungspositionierung](/docs/native-ui-extensions#content-and-placement-are-independent) gelten zusätzliche Geräteanforderungen.

Für Standardbedienelemente folgen Sie der Einrichtungsanleitung für Ihr Markup; Ionic- und HTML-Adapter verwenden unterschiedliche Importe. Für eigene native Inhalte beginnen Sie direkt mit der [Erweiterungsanleitung](/docs/native-ui-extensions).

## Referenz

- [Unterstützte Ionic-Bedienelemente](/docs/native-ui#supported-markup) und Fallback-Verhalten.
- [Konfiguration](/docs/configuration): Standardwerte, ausgewählte Bedienelemente, reiner Seitenleistenmodus und laufende Änderungen.
- [Helle und dunkle Darstellung](/docs/appearance): Web-Theme übernehmen, eigenes HTML konfigurieren und die gemeinsame Seitenleistendarstellung verstehen.
- [Vertical Bars](/docs/vertical-bars): Eignung, Darstellung und Laufzeit-API.
- [Migration](/docs/migration): Paketnamen, Importe und Aktualisierung des nativen Projekts.