---
title: "Erste Schritte"
sourceRevision: "32d9efd42dbd30ea717a525ef4eaeb764d6f607c15b697769b5a95866928716c"
---

# Ionic Theme Material Design 3

Ein CSS/JS-Theme für Ionic-Anwendungen mit Android Settings als visueller Referenz, das Ionics Komponenten-APIs und Farbsemantik bewahrt.

<!-- rdlabo-docs-pick -->

![Ionic-MD3-Theme mit der standardmäßigen Ionic-Palette unter Android 17](https://raw.githubusercontent.com/webview-native-ui/ionic-theme-md3/v9.2.0/screenshots/md3.png)

<!-- /rdlabo-docs-pick -->

Die Demo finden Sie hier: https://ionic-theme-md3.rdlabo.dev/

Für die Kompatibilität mit `@rdlabo/ionic-theme-ios27` entwickelt, sodass ein Markup-Baum beide Ionic-Modi gestalten kann.

## Installation

In einem bestehenden Ionic-Projekt:

```bash
npm install @rdlabo/ionic-theme-md3
```

Hinweis: **Wenn Sie @ionic/core@ < 8.8.0 verwenden**, verwenden Sie @rdlabo/ionic-theme-md3@1.0.2.

Importieren Sie das Theme in die Haupt-CSS-Datei Ihres Projekts (z. B. `src/styles.scss`) **nach Ionics Core-Stilen**. So greift die MD-Standardschrift, während die `--ion-font-family`-Anpassung der Anwendung erhalten bleibt.

```css
@import '@rdlabo/ionic-theme-md3/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css';
```

### Animationen konfigurieren

Wenn Sie nur das MD3-Theme installiert haben, konfigurieren Sie dessen Animation wie folgt.

```ts
import { isPlatform } from '@ionic/core'; // Oder @ionic/angular (Ionic 9), @ionic/angular/standalone (Ionic 8), @ionic/react, @ionic/vue
import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';

// Angular
provideIonicAngular({
    ...
    navAnimation: isPlatform('ios') ? undefined: mdTransitionAnimation,
});

// React
setupIonicReact({
    ...
    navAnimation: isPlatform('ios') ? undefined: mdTransitionAnimation,
});

// Vue
createApp(App)
    .use(IonicVue, {
        ...
        navAnimation: isPlatform('ios') ? undefined: mdTransitionAnimation,
})
```

### Das Theme prüfen

Testen Sie unter Android. Setzen Sie bei einer Desktop-Vorschau den Ionic-Modus in Ihrer bestehenden Framework-Initialisierung auf `md`, beispielsweise mit `mode: 'md'`.

Mit diesem Markup können Sie das Erscheinungsbild eingerückter gruppierter Listen ausprobieren. Die vom Theme erwartete Listenstruktur finden Sie unter [Verwendung von ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/using-ion-item-group).

```html
<ion-list mode="md" inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

### Android Settings-Darstellung

Das Theme bewahrt Ionics Farbsemantik und Schriftanpassungen der Anwendung. Standard-Toggles sind ohne Symbole. Die MD-Standardschrift nutzt lokal auf dem Gerät verfügbares Google Sans Flex mit üblichen Ersatzschriften und ist im Theme-CSS enthalten. Weder Schriftinitialisierungscode noch ein Capacitor-Plugin ist erforderlich. Zurück-Symbole bleiben Ionics Zuständigkeit.

Installation, Ersatzschriften und Komponenten-Anpassungen beschreibt [Android Settings-Darstellung](/docs/android-settings). Bestehende Nutzer sollten die [Migrationshinweise zu 9.2.0](/docs/migration#migrating-to-9.2.0%3A-android-settings-alignment) zu geänderten Toolbar-, Listen- und Toggle-Abmessungen lesen.

### Optional: MD3- und iOS-27-Themes gemeinsam verwenden

Installieren Sie das iOS-27-Theme, um beide Ionic-Modi in derselben Anwendung zu gestalten.

Die aktuellen Versionen beider Themes benötigen `@ionic/core` ab 8.8.1. Aktualisieren Sie Ionic vor der Verwendung dieser Konfiguration, wenn Ihre Anwendung 8.8.0 oder eine ältere Version verwendet.

```bash
npm install @rdlabo/ionic-theme-ios27
```

Wenn Ihr globales Stylesheet Sass verwendet, initialisieren Sie die Themes in dieser Reihenfolge:

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/default-variables.scss' as ios27-vars;
@use '@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27.scss';
@use '@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class.scss';
@use '@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect.scss';
@use '@rdlabo/ionic-theme-md3/dist/css/default-variables.css' as md3-vars;
@use '@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css';
```

Das Beispiel verwendet Ionics klassenbasierten Dunkelmodus. Ihr globales Stylesheet muss auch die entsprechende dunkle Ionic-Palette laden, etwa `@ionic/angular/css/palettes/dark.class.css` für Angular. Wählen Sie bei `dark-system` oder `dark-always` für Ionic-Palette und iOS-27-Theme dieselbe Variante. Siehe Ionics [Dunkelmodus-Dokumentation](https://ionicframework.com/docs/theming/dark-mode). Die expliziten Namensräume `ios27-vars` und `md3-vars` verhindern, dass beide Variablenmodule denselben Standardnamensraum verwenden.

Konfigurieren Sie bei Installation beider Themes beide Übergangsimplementierungen:

```ts
import { isPlatform } from '@ionic/core'; // oder @ionic/angular (Ionic 9), @ionic/angular/standalone (Ionic 8), @ionic/react, @ionic/vue
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';
import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';

// Angular
provideIonicAngular({
    ...
    navAnimation: isPlatform('ios') ? iosTransitionAnimation : mdTransitionAnimation,
    popoverEnter: isPlatform('ios') ? popoverEnterAnimation : undefined,
    popoverLeave: isPlatform('ios') ? popoverLeaveAnimation : undefined,
});

// React
setupIonicReact({
    ...
    navAnimation: isPlatform('ios') ? iosTransitionAnimation : mdTransitionAnimation,
    popoverEnter: isPlatform('ios') ? popoverEnterAnimation : undefined,
    popoverLeave: isPlatform('ios') ? popoverLeaveAnimation : undefined,
});

// Vue
createApp(App)
    .use(IonicVue, {
        ...
        navAnimation: isPlatform('ios') ? iosTransitionAnimation : mdTransitionAnimation,
        popoverEnter: isPlatform('ios') ? popoverEnterAnimation : undefined,
        popoverLeave: isPlatform('ios') ? popoverLeaveAnimation : undefined,
    });
```

## Dokumentation

- [Dynamische Android-Farben](/docs/dynamic-colors) — optionale Material You-Einrichtung, helle/dunkle Darstellung, Lebenszyklus und Rollenzuordnung.
- [Farbsystem](/docs/color-system) — Ionic-Palettenstandards, optionale Material-Rollen und Farbzuordnungen für Komponenten.
- [Android Settings-Darstellung](/docs/android-settings) — Standardgeometrie, CSS-Standardschriften und Ionic-Anpassungen.
- [ion-item-group verwenden](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/using-ion-item-group) — gemeinsames Markup für eingerückte Listen in iOS 27 und MD3.
- [Besonderes Markup](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/special-markup) — optionale Komponentenkombinationen der Demo.
- [ESLint](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/eslint) — Listenstruktur mit ESLint-Regeln prüfen.
- [Migration](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/migration) — erforderliche Änderungen beim Aktualisieren des Theme-Markups.

## Verwandte Projekte

Wenn Sie eine umfassendere Implementierung von Material Design 3 benötigen, könnte Sie auch Folgendes interessieren:

- **[md3-for-ionic](https://github.com/danielkleebinder/md3-for-ionic)** von danielkleebinder

> **Hinweis:** Dieses Theme ist gezielt auf Kompatibilität mit Ionics Designansatz und `@rdlabo/ionic-theme-ios27` ausgelegt; es soll MD3 nicht streng und vollständig nachbilden.

<!-- rdlabo-docs-omit -->

**Vollständige Dokumentation:** [https://docs.rdlabo.dev/projects/ionic-theme-md3](https://docs.rdlabo.dev/projects/ionic-theme-md3)

## Entwicklung und Tests

### JavaScript-Modul-Builds

Belassen Sie relative Imports im TypeScript-Quellcode ohne Dateiendung, entsprechend dem Quellcodestil von Ionic. Die gemeinsame CLI `rdlabo-build-theme` aus `@rdlabo/ionic-theme-utils` verwendet tsdown, um Imports beim Erzeugen von ESM-JavaScript und Typdeklarationen aufzulösen. Abhängigkeiten bleiben extern; die Quelldateien werden nicht umgeschrieben.

Führen Sie `npm run build && npm run test:esm` aus, um das npm-Tarball zu erstellen und mit der gemeinsamen CLI `rdlabo-check-esm` zu prüfen. Öffentliche JavaScript-Einstiegspunkte lassen sich in Node.js ohne DOM importieren. UI-Operationen benötigen weiterhin einen Browser oder eine unterstützte native Umgebung. Das Paket liefert ausschließlich ESM.

### Demo-Anwendung

Dieselbe Demo wird für beide unterstützten Ionic-Versionen bereitgestellt:

- [Ionic-9-Demo](https://ionic-theme-md3.rdlabo.dev) — maßgebliche Version
- [Ionic-8-Demo](https://ionic8-theme-md3.rdlabo.dev) — Kompatibilitätsversion

Das Verzeichnis `demo/` enthält die Angular-Anwendung für beide Bereitstellungen. So führen Sie sie lokal aus:

```bash
cd demo
npm install
npm start
```

### Visuelle Regressionstests

Wir verwenden Playwright für visuelle Regressionstests, um eine einheitliche Gestaltung über alle Komponenten hinweg sicherzustellen. Die Testsuite erstellt automatisch Screenshots aller Routen im hellen und dunklen Modus.

#### Tests ausführen

```bash
cd demo

# Alle E2E-Tests ausführen
npm run test:e2e

# Tests im UI-Modus ausführen (interaktiv)
npm run test:e2e:ui

# Tests debuggen
npm run test:e2e:debug

# Fordern Sie Referenzaktualisierungen für eine PR mit einem /update-screenshots-Kommentar an.
# Prüfen Sie die CI-generierten Änderungen vor der Übernahme.
```

### Kanäle für Vorabversionen

Ein offener Pull Request, der kein Entwurf ist, kann unter dem npm-Dist-Tag `beta` veröffentlicht werden, nachdem seine Workflows `Lint`, `E2E Screenshot Tests Pull Request` und `Package Candidate` erfolgreich waren. Ein Repository-Eigentümer oder Maintainer muss einen Kommentar hinzufügen, dessen vollständiger Inhalt lautet:

```text
/beta
```

Die Anforderung autorisiert ausschließlich den Head-SHA des Pull Requests zum Zeitpunkt des Kommentars. Der Workflow prüft Eigentümer- oder Maintainer-Berechtigung und Head-SHA unmittelbar vor der Veröffentlichung erneut. Jeder neue Commit macht die Anforderung ungültig, unabhängig von seinem Autor. Der neue SHA muss CI bestehen und einen neuen `/beta`-Kommentar eines Eigentümers oder Maintainers erhalten. Fork-Pull-Requests werden unterstützt. Pull Requests, die einen Workflow zur Freigabe von Veröffentlichungen ändern, können erst als Beta veröffentlicht werden, nachdem diese Workflow-Änderungen in `main` angekommen sind.

Beta-Versionen verwenden `<base>-beta.pr<PR number>.sha<12-character SHA>`. Der Pull Request erhält einen Kommentar mit der unveränderlichen Version und dem genauen `npm install`-Befehl.

Wird ein Pull Request in `main` gemergt, wird er erst dann automatisch unter dem npm-Dist-Tag `beta` veröffentlicht, wenn `Lint`, `E2E Screenshot Tests` und `Package Candidate` für genau diesen Merge-Commit erfolgreich sind. Direkte Pushes auf `main` veröffentlichen keinen Kandidaten. Merge-Kandidaten verwenden `<base>-beta.pr<PR number>.sha<12-character SHA>`; der gemergte Pull Request erhält den genauen Installationsbefehl.

Kandidatencode wird in einem schreibgeschützten Workflow ohne npm-Veröffentlichungszugangsdaten gebaut. Der privilegierte Release-Workflow checkt Pull-Request-Code niemals aus und führt ihn nicht aus. Er prüft Quellworkflow und Paketidentität erneut und veröffentlicht anschließend ausschließlich das unveränderliche gepackte Artefakt mit deaktivierten Lebenszyklusskripten. Der Kommentar mit dem Installationsbefehl ist eine separate Benachrichtigung nach bestem Bemühen und kann eine erfolgreiche npm-Veröffentlichung nicht ungültig machen.

Nur `npm run release` kann ein Release-Tag erstellen. Stabile Tags `vX.Y.Z` für Major-, Minor- oder Patch-Releases werden unter npm `latest` veröffentlicht; Revisions-/Vorabversions-Tags unter `next`. Weder die Veröffentlichung unter `beta` noch unter `next` verändert den npm-Dist-Tag `latest`.

<!-- /rdlabo-docs-omit -->

<!-- rdlabo-docs-omit -->

## Maintainer

- [rdlabo](https://rdlabo.dev/)
<!-- /rdlabo-docs-omit -->
