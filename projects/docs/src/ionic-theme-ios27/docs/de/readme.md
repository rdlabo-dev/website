---
title: "Erste Schritte"
sourceRevision: "955c1cb5086ab0df89e19ea454d6313fbc891bfd8eb6352a456c82f02406c554"
---
# Ionic Theme iOS27

Installieren Sie das Paket mit `npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable`. Für 1.x verwenden Sie die [Anleitung für v1.2.1](https://github.com/rdlabo-dev/ionic-theme-ios27/tree/ios27-v1.2.1).
Ein Theme für Ionic-Anwendungen, das iOS 27 Liquid Glass und dessen Bewegungseffekte ins Web bringt. Capacitor-Anwendungen für iOS können zusätzlich Native UI für unterstützte Bedienelemente aktivieren; sie wird ab Version 2.0.0 offiziell unterstützt.

**[Ionic-9-Demo](https://ionic-theme-ios27.rdlabo.dev/) · [Ionic-8-Demo](https://ionic8-theme-ios27.rdlabo.dev/) · [Einrichtungsanleitung](/docs/setup)**

<!-- rdlabo-docs-pick -->

<p>
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v2.0.2/screenshots/ios27-settings.png" width="32%" alt="iOS-27-Theme: Einstellungen im hellen Modus mit einer Liquid Glass-Suchleiste" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v2.0.2/screenshots/ios27-settings-dark.png" width="32%" alt="iOS-27-Theme: Einstellungen im dunklen Modus" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v2.0.2/screenshots/ios27-library.png" width="32%" alt="iOS-27-Theme: Bibliothek mit Liquid Glass-Schaltflächen und Tab-Leiste" />
</p>

<!-- /rdlabo-docs-pick -->

## Was möchten Sie tun?

| Ziel | Anleitung |
| --- | --- |
| Eine bestehende Ionic-App gestalten | [Erste Schritte](/docs/setup) |
| iOS-26/27-Stile auswählen und optional MD3 verwenden | [Adaptive Themes](/docs/adaptive-themes) |
| Nach der Theme-Einrichtung native iOS-Bedienelemente hinzufügen | [Native UI hinzufügen](/docs/add-native-ui) |
| Ionic eine Seitenleiste hinzufügen und das eigene Theme behalten | [Vertical Bars Schritt für Schritt](/capacitor-native-ui/docs/ionic-vertical-bars) |
| Eine bestehende Installation aktualisieren | [Migration](/docs/migration) |

## Erste Schritte

Als Standardintegration für das Gerätelayout verwenden wir [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable), ein hervorragendes Community-Plugin von Erkam Yaman. Es stellt Ihrer Anwendung Faltzustand, Scharniergeometrie, Leistenposition und Änderungsereignisse bereit, damit Sie die Layoutreaktionen steuern können. Foldable meldet den Gerätezustand, das Theme stellt Web-Layout-Helfer bereit und Native UI projiziert Bedienelemente. Installieren Sie es neben dem verwendeten Paket und verbinden Sie anschließend seine Ereignisse mit Ihrer App.

Die [Einrichtung in vier Schritten](/docs/setup) führt durch Installation, Stylesheets, Animationen und die Vorschau des ersten Bildschirms. Unterstützt werden Ionic 8.8.1 oder neuer innerhalb von Ionic 8 oder 9, einschließlich Angular, React und Vue. Für die Nutzung im Browser ist kein natives Capacitor-Projekt erforderlich.

Das Theme gestaltet Werkzeugleisten, Tabs, Listen, Schaltflächen, Suche und Overlays mit heller und dunkler Darstellung. Es aktiviert keine nativen Bedienelemente. Sobald das Web-Theme funktioniert, können Sie optional [Native UI hinzufügen](/docs/add-native-ui).

## Ihre App anpassen

- [Funktionen](/docs/features): CSS-Variablen, Liquid Glass und selektive Komponentenimporte.
- [Spezielles Markup und Klassen](/docs/special-markup): optionales Komponentenverhalten.
- [ion-item-group verwenden](/docs/using-ion-item-group): Markup für eingerückte Listen.
- [Animation](/docs/animation): Tab-, Segment- und Sucheffekte.
- [ESLint](/docs/eslint): nicht unterstützte Listenstrukturen erkennen.
- [Vertical Bars-Layout](/docs/vertical-bars-layout): Abstände, RTL, Geräteposition, Faltstellung und Split Panes.