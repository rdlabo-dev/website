---
title: "Erste Schritte"
sourceRevision: "965a9413de92664d952937ab22329f1dc33e2e19691cfe4e6f8a08a2d15bd8e4"
---
# Ionic Theme Material Design 3

Eine CSS-/JS-Theme-Bibliothek, die das Designsystem Material Design 3 auf Ionic-Anwendungen anwendet.

<!-- rdlabo-docs-pick -->

![Ionic-Oberflächen im Material-Design-3-Theme mit aktualisierten Komponenten und Navigation](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-md3/v9.1.2/screenshots/md3.png)

<!-- /rdlabo-docs-pick -->

Die Demo finden Sie hier: https://ionic-theme-md3.rdlabo.dev/

Für die Kompatibilität mit `@rdlabo/ionic-theme-ios26` entwickelt, sodass ein gemeinsamer Markup-Baum beide Ionic-Modi gestalten kann.

## Installation

In einem bestehenden Ionic-Projekt:

```bash
npm install @rdlabo/ionic-theme-md3
```

Hinweis: **Wenn Sie @ionic/core@ < 8.8.0 verwenden**, verwenden Sie @rdlabo/ionic-theme-md3@1.0.2.

Importieren Sie außerdem das Theme in die Haupt-CSS-Datei Ihres Projekts, beispielsweise `src/styles.scss`.

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

### Optional: Das MD3- und iOS-26-Theme gemeinsam verwenden

Installieren Sie das iOS-26-Theme, um beide Ionic-Modi in derselben Anwendung zu gestalten.

Die aktuellen Versionen beider Themes benötigen `@ionic/core` ab 8.8.1. Aktualisieren Sie Ionic vor der Verwendung dieser Konfiguration, wenn Ihre Anwendung 8.8.0 oder eine ältere Version verwendet.

```bash
npm install @rdlabo/ionic-theme-ios26
```

Wenn Ihr globales Stylesheet Sass verwendet, initialisieren Sie die Themes in dieser Reihenfolge:

```scss
@use '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss' as ios26-vars;
@use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26.scss';
@use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class.scss';
@use '@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect.scss';
@use '@rdlabo/ionic-theme-md3/dist/css/default-variables.css' as md3-vars;
@use '@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css';
```

Das Beispiel verwendet den klassenbasierten dunklen Modus von Ionic. Ihr globales Stylesheet muss auch die passende dunkle Ionic-Palette laden, beispielsweise `@ionic/angular/css/palettes/dark.class.css` für Angular. Wählen Sie bei `dark-system` oder `dark-always` dieselbe Variante für die Ionic-Palette und das iOS-26-Theme. Siehe die [Dokumentation zum dunklen Modus](https://ionicframework.com/docs/theming/dark-mode) von Ionic. Die ausdrücklich gesetzten Namensräume `ios26-vars` und `md3-vars` verhindern, dass beide Variablenmodule denselben Standardnamensraum verwenden.

Konfigurieren Sie bei Installation beider Themes beide Übergangsimplementierungen:

```ts
import { isPlatform } from '@ionic/core'; // Oder @ionic/angular (Ionic 9), @ionic/angular/standalone (Ionic 8), @ionic/react, @ionic/vue
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios26';
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

- [Verwendung von ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/using-ion-item-group) — gemeinsames Markup für eingerückte Listen unter iOS 26 und MD3.
- [Spezielles Markup](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/special-markup) — ausdrücklich aktivierbare Komponentenkombinationen der Demo.
- [ESLint](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/eslint) — die Listenstruktur mit ESLint-Regeln prüfen.
- [Migration](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/migration) — notwendige Änderungen beim Aktualisieren des Theme-Markups.

## Verwandte Projekte

Wenn Sie eine umfassendere Implementierung von Material Design 3 benötigen, könnte Sie auch Folgendes interessieren:

- **[md3-for-ionic](https://github.com/danielkleebinder/md3-for-ionic)** von danielkleebinder

> **Hinweis:** Dieses Theme wurde gezielt für die Kompatibilität mit dem Designansatz von Ionic und `@rdlabo/ionic-theme-ios26` entwickelt. Es soll keine vollständige, streng originalgetreue Nachbildung von MD3 sein.

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

# Referenz-Screenshots aktualisieren (bei beabsichtigten UI-Änderungen)
npm run test:e2e:update
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
