---
title: "Erste Schritte"
sourceRevision: "5ad5a6a30781a674ba7f71d3d357bc8ef98b93cf51f2c5e260b9528db462cfdc"
---

# cf-workers-native

**Bringen Sie Ihre mit Workers oder Void entwickelte App auf iOS und Android.**

Erreichen Sie Menschen, die den Browser bevorzugen, und Menschen, die im Store nach Apps suchen. Bieten Sie neben Ihrer Web-App eine mobile App an, damit Ihre Nutzer die passende Plattform wählen können.

## Den Weg zur mobilen App wählen

- **In eine bestehende iOS-App einbetten**
  Ergänzen Sie einen Workers-basierten Bildschirm in Ihrer UIKit- oder SwiftUI-App. [iOS-Anleitung](/docs/native-embedding#ios).
- **In eine bestehende Android-App einbetten**
  Ergänzen Sie einen Workers-basierten Bildschirm in Ihrer bestehenden Android-App. [Android-Anleitung](/docs/native-embedding#android).
- **Eine neue mobile App erstellen**
  Erstellen Sie mit Capacitor eine iOS- und Android-App zur Verteilung über App Store und Google Play. [Capacitor-Anleitung](/docs/integration).

[Dokumentation](/docs/README) · [Beispiele](/docs/demo/README)

## Ihre vertraute App weiterentwickeln

- **Seiten und Abläufe wiederverwenden.** Bringen Sie Worker-gerendertes HTML, Links und Formulare in eine mobile WebView. Behalten Sie das Renderingmodell der Anwendung; eine SPA-Neuentwicklung ist keine Voraussetzung.
- **Ihrer App eine mobile Präsenz geben.** Erstellen Sie mit Capacitor eine iOS- und Android-App oder integrieren Sie Workers-Seiten in eine bereits vorhandene native App.
- **Das Backend auf Workers behalten.** D1, Servergeheimnisse und cloudabhängige Logik bleiben auf dem bereitgestellten Worker. Der separate mobile Build lässt Ihre Cloudflare-Deployment-Eingaben unverändert.
- **Ausführung auf dem Gerät auswählen.** Beginnen Sie mit der standardmäßigen Netzwerkausführung. Wählen Sie im unterstützten Umfang ausdrücklich öffentliche Routen zur lokalen Ausführung und bündeln Sie Client-Assets mit der App.

Lokale Ausführung hat [Kompatibilitätsgrenzen](/docs/compatibility). Cloudgestützte Seiten benötigen weiterhin eine Verbindung; das Bündeln ihrer Client-Assets macht sie nicht zu Offlineanwendungen.

## Mit Ihrem Framework beginnen

| Workers-Anwendung | Was Sie übernehmen können | Anleitung |
| --- | --- | --- |
| **Hono** | Fetch-Handler und HTML-Seiten einschließlich Links und Formularen | [Hono-Einrichtung](/docs/build-setup#hono) |
| **Workers Express** | API-Handler und HTML-Antworten über den Workers-Einstiegspunkt | [Express-Einrichtung](/docs/build-setup#workers-express) |
| **Void React Pages** | Worker-gerenderte Seiten, Hydration und D1-gestützte Formulare | [Void-Einrichtung](/docs/void) |
| **Next.js / OpenNext** | Vom bereitgestellten Worker versorgte Seiten mit lokaler Routenauswahl für unterstützte Builds | [OpenNext-Einrichtung](/docs/opennext) |

Jede Anleitung beschreibt getestete Versionen und Grenzen. Sie haben bereits ein separates Frontend, das Worker-APIs aufruft? Behalten Sie es und verwenden Sie die [Fetch-only-Integration](/docs/runtime#fetch-only-integration).

## Ihre App auf das Smartphone bringen

Installieren Sie das gemeinsame JavaScript-Paket in Ihrem Webprojekt:

Die Veröffentlichung des umbenannten Pakets wird vorbereitet. Bis es auf npm verfügbar ist, verwenden Sie die [Quell-Tarball-Anleitung](/docs/native-embedding#dependency-setup). Nach Veröffentlichung:

```sh
npm install cf-workers-native@0.1.2
```

Der mobile Einstiegspunkt wählt den Host. Beispielsweise beginnt ein iOS-Web-Einstiegspunkt mit:

```ts
import { workersIOS } from "cf-workers-native/ios";

const app = workersIOS({
  baseURL: "https://your-worker.example.com/",
  render: "/",
});
await app.ready;
```

Verwenden Sie für die anderen Hosts `workersAndroid` aus `cf-workers-native/android` oder `workersCapacitor` aus `cf-workers-native/capacitor`. Alle drei teilen dieselben Laufzeitoptionen und [Vite-/esbuild-Werkzeuge](/docs/build-setup).

Dieser Einstiegspunkt ist ein Teil der Einrichtung: Verbinden Sie den bestehenden Worker mit einem **separaten mobilen Build** und verpacken Sie dessen Ausgabe anschließend mit Ihrem gewählten nativen Host. Die [Einbettungsanleitung](/docs/native-embedding) und die [Capacitor-Anleitung](/docs/integration) beschreiben den gesamten Weg. Erstellen Sie bei einer bestehenden nativen App die Web-Assets im Webprojekt oder in CI; das native Projekt benötigt weder Capacitor-CLI-Befehle noch -Konfiguration.

**0.1.2 ist eine Preview.** APIs können sich ändern. Android-Einbettung benötigt derzeit WebView-`MULTI_PROFILE`-Unterstützung und ein lokal erstelltes SDK-Artefakt; ein öffentliches Maven-Release ist noch nicht verfügbar. Lesen Sie vor der Integration die [nativen Anforderungen](/docs/native-embedding#dependency-setup). Sie aktualisieren von `workers-capacitor`? Folgen Sie den [Migrationsschritten](/docs/integration#migrating-from-the-old-npm-package).

## Mit Ihrem KI-Assistenten entwickeln

Öffnen Sie Ihr Anwendungsrepository und geben Sie Ihrem Assistenten diesen Prompt; ersetzen Sie das Ziel durch **iOS**, **Android** oder **Capacitor**:

```text
Read https://github.com/rdlabo-dev/cf-workers-native/blob/v0.1.2/README.md
and the integration guide for our target: <iOS, Android or Capacitor>.
Bring this Workers application to that target using cf-workers-native@0.1.2.
Preserve its pages, routes, authentication and Cloudflare deployment configuration.
For an existing native app, preserve its entry point and navigation.
Verify the actual user flows on the target platform and report remaining limits.
```

## Für Ihre Nutzer vorbereiten

Prüfen Sie einen echten Ablauf vom Start bis zur Abmeldung: Seite laden, navigieren, Formular absenden, App erneut öffnen und Verhalten ohne Netzwerk prüfen. Belassen Sie Geheimnisse auf dem Worker und erzwingen Sie dort Authentifizierung und Autorisierung. Die [Integrationscheckliste](/docs/integration#6-verify-the-existing-application-in-capacitor) und [Prüfungen nativer Einbettung](/docs/native-embedding#verification) erklären die nötigen Kontrollen.

Verwenden Sie bei einer bestehenden nativen App deren Releaseablauf. Für Capacitor fahren Sie mit [Safe Areas und nativen Plugins](/docs/native-rendering-api) fort. Store-Einreichung und Prüfung bleiben Teil des Releaseprozesses Ihrer Anwendung.

## Erkunden und mitwirken

[Dokumentation](/docs/README) · [Beispiele](/docs/demo/README) · [Kompatibilität](/docs/compatibility) · [Entwicklung](/docs/development) · [Mitwirken](/docs/CONTRIBUTING)

## Lizenz

[MIT](LICENSE).
