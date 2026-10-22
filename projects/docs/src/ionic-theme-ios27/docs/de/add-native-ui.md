---
title: "Native UI zum Theme hinzufügen"
sourceRevision: "a9909ada19ace5edc87271c464f3195938dadab5aefd3d5b499bc0e37b111c8f"
---
# Native UI zum Theme hinzufügen

Sie verwenden bereits `@rdlabo/ionic-theme-ios27`? Ergänzen Sie native Bedienelemente unter iOS und behalten Sie Theme-Stile, Web-Inhalte und Routing. Nicht unterstützte Bedienelemente, Browser und Android behalten ihre Web-Darstellung.

Beginnen Sie mit der [Theme-Einrichtung](setup.md), falls das Theme noch nicht konfiguriert ist. Für eine andere Web-Darstellung folgen Sie stattdessen der [Native UI-Einrichtung](../../capacitor-native-ui/docs/setup.md).

Unter [Funktionsweise der Projektion](../../capacitor-native-ui/README.md#how-projection-works) erfahren Sie, wie native Bedienelemente mit Ihrem Web-DOM und Ihren Handlern verbunden bleiben.

## 1. Das native Plugin installieren

Diese Anleitung setzt eine Capacitor-8-Anwendung mit einem iOS-Projekt voraus. Reine Web-Nutzer des Themes benötigen weiterhin kein Capacitor; native iOS-Bedienelemente erfordern jedoch zunächst dieses native Projekt. Die unterstützten Versionen von Ionic, iOS und Xcode finden Sie unter [Native UI-Anforderungen](../../capacitor-native-ui/README.md#requirements).

Aktualisieren Sie Theme und Native UI gemeinsam, damit ihre Versionen übereinstimmen, und installieren Sie Foldable als separate Anwendungsabhängigkeit:

```sh
npm install @rdlabo/ionic-theme-ios27 @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Behalten Sie Ihre bestehenden Theme-Stylesheets. Capacitors standardmäßige Plugin-Erkennung benötigt eine direkte Abhängigkeit; die allein über das Theme installierte Kopie registriert das native Plugin nicht.

## 2. Native Bedienelemente aktivieren

Aktivieren Sie die Shell einmal beim Anwendungsstart, nachdem `ion-app` eingebunden wurde:

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const shell = await enableNativeUI();
```

Rufen Sie beim Auflösen der verantwortlichen Anwendungsinstanz `await shell.destroy()` auf; erzeugen Sie keine Shell pro Seite. Verbinden Sie Start und Bereinigung anhand der [App-Root-Beispiele für Angular, React oder Vue](../../capacitor-native-ui/docs/setup.md#place-startup-in-your-frameworks-app-root).

Behalten Sie `navAnimation: iosTransitionAnimation` aus dem Theme-Paket. Diese Animation koordiniert native Bedienelemente bereits bei Seitenübergängen und Zurückgesten; umschließen Sie sie nicht erneut. Für eigene Animationen folgen Sie den [Anweisungen zum Übergangsadapter](../../capacitor-native-ui/docs/migration.md#native-ui-transition-adapter).

Die Installation des Plugins oder die Konfiguration der Theme-Animationen aktiviert keine nativen Bedienelemente. Die Anwendung aktiviert sie mit dem obigen Startaufruf.

## 3. Synchronisieren und unter iOS ausführen

Erstellen Sie Ihre Web-Assets und führen Sie anschließend Folgendes aus:

```sh
npx cap sync ios
```

Starten Sie die App auf einem unterstützten iOS-Gerät oder Simulator. Geeignete fixierte Bedienelemente sollten nativ dargestellt werden und weiterhin ihre vorhandenen Handler aufrufen. Navigieren Sie vorwärts und zurück und prüfen Sie anschließend dieselbe App im Browser auf den Web-Fallback. Bleibt unter unterstütztem iOS alles im Web, prüfen Sie direkte Abhängigkeit, Startaufruf, Synchronisierung und erneuten nativen Build. Unter [unterstützte Bedienelemente](../../capacitor-native-ui/docs/native-ui.md#supported-markup) finden Sie geeignetes Markup und das Web-Fallback-Verhalten. Behalten Sie die Theme-Stile für Web-Inhalte und nicht projizierte Bedienelemente.

## Optional: Vertical Bars

Für eine Seitenleiste folgen Sie der [Standardkonfiguration für Vertical Bars](../../capacitor-native-ui/docs/ionic-vertical-bars.md): Laden Sie das Layout-Stylesheet und verbinden Sie Anfangsposition sowie Ereignisse des installierten Foldable-Plugins. Die Shell enthält die Laufzeit für die Seitenleiste; ein weiterer Startaufruf ist nicht nötig. Der Standardstart wählt bereits horizontale und seitliche Bedienelemente aus; behalten Sie ihn beim Hinzufügen einer Seitenleiste zur bestehenden nativen Oberfläche. Verwenden Sie `enableNativeUI({ controls: 'verticalOnly' })` nur, wenn die automatische Projektion auf die Seitenleiste beschränkt sein soll. Siehe [Konfigurationsoptionen](../../capacitor-native-ui/docs/configuration.md).

## Eine bestehende native Integration aktualisieren

Wenn Sie native APIs bisher aus dem Theme-Paket importiert haben, folgen Sie der [Migration nativer Importe](../../capacitor-native-ui/docs/migration.md#2-replace-native-imports) und der [Migration des nativen Projekts](../../capacitor-native-ui/docs/migration.md#3-sync-the-native-project). Behalten Sie gewöhnliche Theme-Importe und Stylesheets.