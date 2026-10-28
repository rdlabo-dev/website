---
title: "Erste Schritte"
sourceRevision: "ae63d20966a0317f4311f27fb1a17d946b93c2b341d0d31831fa8fb881ae0df8"
---

# cf-workers-native

**Bringen Sie Ihre mit Workers oder Void entwickelte App auf iOS und Android.**

Erreichen Sie Menschen, die den Browser bevorzugen, und Menschen, die im Store nach Apps suchen. Bieten Sie neben Ihrer Web-App eine mobile App an, damit Ihre Nutzer die passende Plattform wählen können.

## Ihre Web-App kann eine mobile Version haben

Wenn Ihre Web-App auf Cloudflare Workers läuft, können Sie eine iOS- und Android-App ergänzen, die auf ihren bestehenden Seiten und ihrem Backend aufbaut. Beispielsweise kann eine Void-App mit D1-gestützten Formularen ihre Loader, Aktionen und Datenbank auf Workers behalten, während die mobile App ihre Seiten anzeigt und ihre öffentlichen JavaScript- und CSS-Dateien bündelt.

cf-workers-native verbindet Ihre Workers-Anwendung mit einer mobilen App auf Basis von Capacitor. Capacitor liefert die iOS- und Android-Projekte und den Zugriff auf native Plugins. Sie ergänzen einen separaten mobilen Build und testen die Abläufe Ihrer Anwendung; Ihre Web-App entwickeln und veröffentlichen Sie weiterhin auf Cloudflare.

**Hier beginnen: [Ihre bestehende App um eine mobile Version ergänzen](/docs/integration).** Eine bestehende native App ist nicht erforderlich. Die Anleitung führt von der Auswahl des Worker-Einstiegspunkts bis zur Ausführung Ihrer Seiten auf einem Simulator oder Emulator.

## Ein Beispiel passend zu Ihrer App ansehen

| Ihre Ausgangslage | Beispiel zum Ausprobieren | Was das Beispiel zeigt |
| --- | --- | --- |
| Von einem Worker ausgelieferte HTML-Seiten | [Hono-/Express-Seiten](/docs/demo/rendering/README) | Seitennavigation, Formulare und Weiterleitungen in einer mobilen App. |
| Eine App mit Void React Pages und D1 | [Void-+D1-Beispiel](/docs/demo/void/README) | Serverseitig gerenderte Seiten, React-Interaktion und ein Formular, das in D1 schreibt. |
| Eine über OpenNext bereitgestellte Next.js-App | [OpenNext-Beispiel](/docs/demo/opennext/README) | Anbindung generierter Seiten und Assets an einen mobilen Build; beachten Sie dessen Versions- und Funktionsgrenzen. |

Dies sind Beispiele und Test-Fixtures, keine Berichte über Kundendeployments. Jede Anleitung nennt die verifizierten Aspekte. Beginnen Sie mit dem Ablauf, der Ihrem am nächsten kommt, und erproben Sie ihn anschließend mit Ihrer eigenen App.

## Was bleibt und was hinzukommt

- **Seiten und Backend behalten.** Verwenden Sie unterstütztes HTML, Links, Formulare und Clientinteraktionen wieder. D1, Servergeheimnisse und cloudabhängige Logik bleiben auf Workers.
- **Einen mobilen Build ergänzen.** Verbinden Sie Ihren Worker und öffentliche Assets mit einer Capacitor-App mit eigenem Namen und eigener Anwendungs-ID.
- **Die mobile Nutzung prüfen.** Testen Sie Anmeldung, Navigation, Datenänderungen, erneutes Öffnen und die Wiederherstellung der Verbindung in Ihrer Anwendung.
- **Die Verteilung vorbereiten.** Konfigurieren Sie Signierung und Storeinformationen im Ablauf der nativen Anwendung. Store-Einreichung und Prüfung bleiben separate Schritte.

Lassen Sie Anfragen zunächst auf Ihrem bereits bereitgestellten Worker ausführen. Cloudgestützte Seiten benötigen eine Verbindung. Gebündelte Client-Assets machen sie nicht zu Offlineanwendungen. Optionale lokale Ausführung beschreiben die [Ausführungsanleitung](/docs/cloudflare-bindings#choosing-execution) und die [Kompatibilitätsgrenzen](/docs/compatibility).

## Mit Ihrem Framework beginnen

| Workers-Anwendung | Was Sie übernehmen können | Anleitung |
| --- | --- | --- |
| **Hono** | Fetch-Handler und HTML-Seiten einschließlich Links und Formularen | [Hono-Einrichtung](/docs/build-setup#hono) |
| **Workers Express** | API-Handler und HTML-Antworten über den Workers-Einstiegspunkt | [Express-Einrichtung](/docs/build-setup#workers-express) |
| **Void React Pages** | Worker-gerenderte Seiten, Hydration und D1-gestützte Formulare | [Void-Einrichtung](/docs/void) |
| **Next.js / OpenNext** | Vom bereitgestellten Worker versorgte Seiten mit lokaler Routenauswahl für unterstützte Builds | [OpenNext-Einrichtung](/docs/opennext) |

Jede Anleitung beschreibt getestete Versionen und Grenzen. Sie haben bereits ein separates Frontend, das Worker-APIs aufruft? Behalten Sie es und verwenden Sie die [Fetch-only-Integration](/docs/runtime#fetch-only-integration).

## Mit Ihrer App ausprobieren

Sie benötigen den Quellcode der Anwendung, ihren Worker-Build und eine Test-Worker-URL für cloudgestützte Abläufe. iOS benötigt macOS und Xcode; Android benötigt die Android-Entwicklungswerkzeuge. Die [Einrichtungsanleitung](/docs/integration#before-you-start) verlinkt die Plattformvoraussetzungen.

Installieren Sie das Paket in Ihrem Webprojekt und folgen Sie anschließend der [vollständigen mobilen Einrichtung](/docs/integration#workflow):

```sh
npm install --save-exact cf-workers-native@0.1.7
```

Die Installation allein erzeugt kein mobiles Projekt. Die Anleitung beschreibt das Hinzufügen von Capacitor, die Konfiguration des mobilen Builds und die Ausführung auf iOS oder Android. Ihr erstes Ziel ist eine bestehende Seite, ein Link zu einer weiteren Seite und ein funktionierendes Formular oder eine Datenaktion auf einem Simulator oder Emulator.

**Alle 0.x-Releases sind Preview-Releases**, auch die unter dem npm-Tag `latest`. APIs können sich ändern. Prüfen Sie die Eignung vor der Verteilung anhand der tatsächlichen Abläufe Ihrer App. Sie aktualisieren von `workers-capacitor`? Folgen Sie den [Migrationsschritten](/docs/integration#migrating-from-the-old-npm-package).

## Mit Ihrem KI-Assistenten entwickeln

Öffnen Sie Ihr Anwendungsrepository und geben Sie Ihrem Assistenten diesen Prompt:

```text
Read https://github.com/rdlabo-dev/cf-workers-native/blob/v0.1.8/docs/integration.md.
Add an iOS and Android version of this Workers web app using cf-workers-native@0.1.7
and Capacitor. Preserve the existing pages, backend and Cloudflare deployment configuration.
Use an existing test Worker for cloud-backed requests; ask before any cloud deployment.
Start by verifying one page, navigation and a form or data action on a simulator/emulator.
Then verify the app's authentication and main user flow, and report remaining limits.
```

Geben Sie, soweit vorhanden, App-Namen, Anwendungs-ID und Test-Worker-URL an.

## Sie haben bereits eine native App?

Betten Sie einen Workers-basierten Bildschirm in Ihre bestehende [UIKit-/SwiftUI-App](/docs/native-embedding#ios) oder [Android-App](/docs/native-embedding#android) ein. Diese Integrationen verwenden die nativen SDKs und einen gemeinsamen Web-Build. Die [Einrichtung der Abhängigkeiten](/docs/native-embedding#dependency-setup) beschreibt die zueinander passenden npm-, SwiftPM- und Maven-Versionen sowie die Anforderungen an Android WebView.

## Für Ihre Nutzer vorbereiten

Prüfen Sie einen echten Ablauf vom Start bis zur Abmeldung: Seite laden, navigieren, Formular absenden, App erneut öffnen und Verhalten ohne Netzwerk prüfen. Belassen Sie Geheimnisse auf dem Worker und erzwingen Sie dort Authentifizierung und Autorisierung. Die [Integrationscheckliste](/docs/integration#6-verify-the-existing-application-in-capacitor) und [Prüfungen nativer Einbettung](/docs/native-embedding#verification) erklären die nötigen Kontrollen.

Verwenden Sie bei einer bestehenden nativen App deren Releaseablauf. Für Capacitor fahren Sie mit [Safe Areas und nativen Plugins](/docs/native-rendering-api) fort. Store-Einreichung und Prüfung bleiben Teil des Releaseprozesses Ihrer Anwendung.

## Erkunden und mitwirken

[Dokumentation](/docs/README) · [Beispiele](/docs/demo/README) · [Kompatibilität](/docs/compatibility) · [Entwicklung](/docs/development) · [Mitwirken](/docs/CONTRIBUTING)

## Lizenz

[MIT](LICENSE).
