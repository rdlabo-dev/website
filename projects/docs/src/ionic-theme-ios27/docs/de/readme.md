---
title: "Erste Schritte"
sourceRevision: "138c167c785de29232c537752cccc8c87da59bf71b041a23374750b140ea51cb"
---

# Ionic Theme iOS27

Installieren Sie das Paket mit `npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable`. Für 1.x verwenden Sie die [Anleitung für v1.2.1](https://github.com/webview-native-ui/ionic-theme-ios27/tree/ios27-v1.2.1).
Ein Theme für Ionic-Anwendungen, das iOS 27 Liquid Glass und dessen Bewegungseffekte ins Web bringt. Capacitor-Anwendungen für iOS können zusätzlich Native UI für unterstützte Bedienelemente aktivieren; sie wird ab Version 2.0.0 offiziell unterstützt.

**[Ionic-9-Demo](https://ionic-theme-ios27.rdlabo.dev/) · [Einrichtungsanleitung](/docs/setup)**

<!-- rdlabo-docs-pick -->

<p>
  <img src="https://raw.githubusercontent.com/webview-native-ui/ionic-theme-ios27/c70beb9d1e5b39de696b2b2c47a3d9bc5ffcdfbe/screenshots/ios27-settings.png" width="32%" alt="iOS-27-Theme: Einstellungen im hellen Modus mit einer Liquid Glass-Suchleiste" />
  <img src="https://raw.githubusercontent.com/webview-native-ui/ionic-theme-ios27/c70beb9d1e5b39de696b2b2c47a3d9bc5ffcdfbe/screenshots/ios27-settings-dark.png" width="32%" alt="iOS-27-Theme: Einstellungen im dunklen Modus" />
  <img src="https://raw.githubusercontent.com/webview-native-ui/ionic-theme-ios27/c70beb9d1e5b39de696b2b2c47a3d9bc5ffcdfbe/screenshots/ios27-library.png" width="32%" alt="iOS-27-Theme: Bibliothek mit Liquid Glass-Schaltflächen und Tab-Leiste" />
</p>

<!-- /rdlabo-docs-pick -->

## Was möchten Sie tun?

| Ziel | Anleitung |
| --- | --- |
| Eine bestehende Ionic-App gestalten | [Erste Schritte](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/setup) |
| iOS-26/27-Stile und optional MD3 auswählen | [Adaptive Themes](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/adaptive-themes) |
| Native iOS-Steuerelemente zu einer Capacitor-App hinzufügen | [Native UI hinzufügen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/add-native-ui) |
| Ionic um eine Seitenleiste ergänzen und das eigene Theme behalten | [Vertical Bars Schritt für Schritt](https://docs.rdlabo.dev/projects/capacitor-native-ui/docs/ionic-vertical-bars) |
| Optional: Theme und Native UI mit Cordova nutzen | [Cordova einrichten](/docs/cordova) |
| Eine bestehende Installation aktualisieren | [Migration](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/migration) |

## Erste Schritte

Die Standardanleitungen verwenden das eigenständige Theme-Paket mit Capacitor als standardmäßigem nativen Host. Die reine Theme-Nutzung im Browser bleibt unterstützt. Für Cordova-Anwendungen beschreibt die optionale [Cordova-Anleitung](/docs/cordova) das mitgelieferte Theme und den hostspezifischen Start.

Als Standardintegration für das Gerätelayout verwenden wir [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable), ein hervorragendes Community-Plugin von Erkam Yaman. Es stellt Ihrer Anwendung Faltzustand, Scharniergeometrie, Leistenposition und Änderungsereignisse bereit, damit Sie die Layoutreaktionen steuern können. Foldable meldet den Gerätezustand, das Theme stellt Web-Layout-Helfer bereit und Native UI projiziert Bedienelemente. Installieren Sie es neben dem verwendeten Paket und verbinden Sie anschließend seine Ereignisse mit Ihrer App.

Die [Einrichtung in vier Schritten](/docs/setup) führt durch Installation, Stylesheets, Animationen und die Vorschau des ersten Bildschirms. Der deklarierte Ionic-Kompatibilitätsbereich ist `>=8.8.1 <10`, einschließlich Angular, React und Vue; die automatisierte E2E-Validierung verwendet Ionic 9. Für die Nutzung im Browser ist kein natives Capacitor-Projekt erforderlich.

Das Theme gestaltet Werkzeugleisten, Tabs, Listen, Schaltflächen, Suche und Overlays mit heller und dunkler Darstellung. Es aktiviert keine nativen Bedienelemente. Sobald das Web-Theme funktioniert, können Sie optional [Native UI hinzufügen](/docs/add-native-ui).

## Ihre App anpassen

- [Funktionen](/docs/features): CSS-Variablen, Liquid Glass und selektive Komponentenimporte.
- [Spezielles Markup und Klassen](/docs/special-markup): optionales Komponentenverhalten.
- [ion-item-group verwenden](/docs/using-ion-item-group): Markup für eingerückte Listen.
- [Animation](/docs/animation): Tab-, Segment- und Sucheffekte.
- [ESLint](/docs/eslint): nicht unterstützte Listenstrukturen erkennen.
- [Vertical Bars-Layout](/docs/vertical-bars-layout): Abstände, RTL, Geräteposition, Faltstellung und Split Panes.

## Zuständigkeiten der Repositorys

Das Capacitor-Plugin wird in [webview-native-ui/capacitor-plugin](https://github.com/webview-native-ui/capacitor-plugin) gepflegt. Dieses Repository verwaltet das Ionic-Theme, die kombinierte Demo, Browser-Screenshots und Simulator-Integrationstests. Die Demo installiert `@rdlabo/capacitor-native-ui` von npm; Theme-Releases veröffentlichen das Plugin nicht und ändern dessen Version nicht.

Das [Cordova-Plugin](https://github.com/webview-native-ui/cordova-plugin) wird separat gepflegt. Es verteilt eine festgelegte Kopie dieses Themes, deren Integrationsimporte mit Cordova verbunden sind. Gemeinsame Theme-Korrekturen gehören hierher; Cordova aktualisiert seine festgelegte Theme-Version in einem späteren Plugin-Release. Die Capacitor-Demo und die nachfolgenden Kandidatenprüfungen validieren Cordova nicht.

Um ein unveröffentlichtes Plugin-Archiv mit der echten Demo zu prüfen, führen Sie Folgendes aus:

```sh
npm run test:native-candidate -- /absolute/path/rdlabo-capacitor-native-ui-VERSION.tgz --e2e
```

Dies erstellt einen isolierten temporären Checkout und lässt Ihre Manifeste und Lockfiles unverändert. Ergänzen Sie `--shard=1/2` neben `--e2e`, um einen Playwright-Shard auszuführen; führen Sie alle Shards aus, um die gesamte Suite abzudecken. Jeder Shard umfasst weiterhin Paketprüfungen, Unit-Tests und den Produktionsbuild. Ergänzen Sie `--simulator=UDID` für die Simulator-Suiten für native UI, Suche und Ränder. Diagnoseinformationen und die temporäre Demo bleiben unter dem ausgegebenen Pfad erhalten. Plugin-spezifische Unit-Tests und native Bibliothekstests liegen im Plugin-Repository. Dessen CI testet jedes Kandidatenarchiv gegen den main-Branch dieses Repositorys.

## Wartung

Veröffentlichen Sie das Theme-Paket im Repository-Stamm mit `npm run release` von einem sauberen, aktuellen `main`. Der Workflow für `ios27-v…`-Tags veröffentlicht nur das Theme, mit `next` für Vorabversionen und `latest` für stabile Versionen.

Theme und Plugin werden unabhängig versioniert. Beim eigenständigen Paket `@rdlabo/ionic-theme-ios27` ist Capacitor Native UI eine erforderliche Peer-Abhängigkeit, damit Theme und Anwendung dieselbe Plugin-Instanz nutzen. npm 7+ installiert sie bei reinen Theme-Apps automatisch; bei anderen Paketmanagern müssen erforderliche Peer-Abhängigkeiten installiert werden. Apps mit nativen Steuerelementen müssen das Plugin zusätzlich direkt deklarieren, damit Capacitor es erkennt. Eine veröffentlichte npm-Version kann nicht überschrieben werden.
