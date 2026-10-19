---
title: "workers-capacitor"
sourceRevision: 5a65f057d592de2bdf4585abd0f47b718ed69db00f4a7d448c4394703898ee86
---

# workers-capacitor

Bringen Sie Cloudflare Workers-Anwendungen auf iOS und Android.

workers-capacitor verbindet vorhandene Cloudflare Workers-Anwendungen mit Capacitor. So können Sie Ihre Seiten, Routen und Anwendungslogik mit minimalen Änderungen in einer iOS- oder Android-App wiederverwenden. Ihre Webanwendung bleibt auf Workers; parallel können Sie eine mobile Version für die Veröffentlichung im App Store und bei Google Play vorbereiten.

[Void 1.1.12](https://github.com/voidzero-dev/void/releases/tag/v1.1.12) unterstützt jetzt die Navigation mit Capacitor unter iOS! Mit diesem Update können Sie Ihre Void-App mithilfe von workers-capacitor auf iOS und Android bringen. [Mit Void beginnen](/docs/void).

## Ihre App auf das Smartphone bringen

Beginnen Sie mit Ihrer vorhandenen App. Die [Integrationsanleitung](/docs/integration) führt Sie von Ihrem bestehenden Workers-Projekt bis zum Öffnen auf iOS oder Android. Falls dies Ihre erste mobile App ist, beschreibt sie auch die Einrichtung von Capacitor.

0.1.0 ist eine Preview-Version. Folgen Sie den Installationsschritten in der Anleitung; die APIs können sich vor einer stabilen Version noch ändern.

Wenn Sie einen KI-Coding-Assistenten verwenden, öffnen Sie Ihr Anwendungsrepository und geben Sie ihm diesen Prompt:

```text
Follow https://github.com/rdlabo-dev/workers-capacitor/blob/v0.1.0/docs/integration.md
to bring this app to iOS and Android with workers-capacitor.
Preserve its pages, routes and authentication; verify it on the target platforms.
```

Wählen Sie den passenden Weg für Ihre App:

- [Void React Pages + D1](/docs/void)
- [Hono und Workers Express](/docs/build-setup#frameworks)
- [Next.js / OpenNext](/docs/opennext)

## Ihre vertraute App weiterentwickeln

Arbeiten Sie weiter mit Ihren vorhandenen Seiten, Formularen und Routen. [Capacitor](https://capacitorjs.com/) macht Ihre Weboberfläche zu einer installierbaren mobilen App; workers-capacitor verbindet Ihren vorhandenen Worker damit.

Ihre Datenbank kann bleiben, wo sie ist. Anfragen, die D1 oder andere Cloud-Dienste benötigen, werden auf Ihrem vorhandenen bereitgestellten Worker ausgeführt. Unterstützter Code kann dagegen auf dem Gerät laufen. Einzelheiten finden Sie unter [Build-Einrichtung](/docs/build-setup) und [Ausführungsrichtlinien](/docs/cloudflare-bindings).

Wenn Sie bereits ein separates Frontend haben, behalten Sie dessen vorhandene API-Aufrufe mit der [reinen Fetch-Integration](/docs/runtime#fetch-only-integration) bei.

## Nächste Schritte

Ihre App ist auf dem Bildschirm! Passen Sie sie nun Schritt für Schritt an:

1. Machen Sie Ihre App auf dem Startbildschirm und beim Öffnen leicht erkennbar. Fügen Sie anhand der [Capacitor-Anleitung für Assets](https://capacitorjs.com/docs/guides/splash-screens-and-icons) Ihr eigenes Symbol und Ihren Splashscreen hinzu. Erstellen und starten Sie die App anschließend erneut, um die Änderungen zu sehen.
2. Sorgen Sie für eine angenehm bedienbare Oberfläche. Prüfen Sie, dass Schaltflächen ausreichend Abstand zur Notch und zum Home-Indikator haben; passen Sie bei Bedarf die [iOS Safe Area](/docs/native-rendering-api#ios-safe-area) an.
3. Ermöglichen Sie Fotos, das Teilen von Inhalten oder haptisches Feedback nach einer Aktion. Wählen Sie eine passende Funktion und ergänzen Sie sie mit einem [Capacitor-Plugin](/docs/native-rendering-api#native-plugins).
4. Wenn wiederholte Builds und Store-Uploads zeitaufwendig werden, kann [Capawesome Cloud](https://capawesome.io/docs/cloud/getting-started/) diese Schritte automatisieren. Die zugehörige Anleitung führt Sie durch die Einrichtung.

## Vor der Veröffentlichung

Belassen Sie Geheimnisse auf dem Server und authentifizieren Sie Anfragen aus der App. Beachten Sie die [Sicherheitshinweise](/docs/integration#5-security-the-device-is-not-a-trusted-server), prüfen Sie die [bekannten Einschränkungen](/docs/compatibility) und testen Sie Ihre App auf den Zielplattformen.

## Erkunden und mitwirken

- [Integration anderer Apps ansehen](/docs/demo/README)
- [Laufzeitverhalten](/docs/runtime) · [API für natives Rendering](/docs/native-rendering-api)
- [Entwicklung und Tests](/docs/development) · [Verifizierungsumfang](/docs/demo/tests/README)
- [Mitwirken](/docs/CONTRIBUTING)

## Lizenz

[MIT](LICENSE).
