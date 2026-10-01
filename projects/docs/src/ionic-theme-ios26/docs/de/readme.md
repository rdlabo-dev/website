---
title: "Erste Schritte"
sourceRevision: "3eadd65cd02410ef41489ff250bd3930153ba0b7da0aacbf6c27263674f25ff4"
---
# Ionic Theme iOS26

Eine CSS-/JS-Theme-Bibliothek, die das iOS26-Designsystem auf Ionic-Anwendungen anwendet.

<!-- rdlabo-docs-pick -->

![Ionic-Oberflächen im iOS-26-Design mit Liquid-Glass-Tab-Leiste, Listen und Bedienelementen](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios26-v9.4.1/screenshots/ios26.png)

<!-- /rdlabo-docs-pick -->

Die Demo finden Sie hier: https://ionic-theme-ios26.rdlabo.dev/

## Installation

In einem bestehenden Ionic-Projekt:

```bash
npm install @rdlabo/ionic-theme-ios26
```

Hinweis: **Wenn Sie @ionic/core@ < 8.8.1 verwenden**, verwenden Sie @rdlabo/ionic-theme-ios26@2.2.1.

Importieren Sie außerdem das Theme in die Haupt-CSS-Datei Ihres Projekts, beispielsweise `src/styles.scss`.

```css
@import '@rdlabo/ionic-theme-ios26/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26.css';

/**
 * Diese Datei gleicht die Auswirkungen geänderter Klassennamen für iOS26 aus.
 * Beispielsweise ist `ion-buttons ion-button[fill=default]` normalerweise nicht implementiert, kann jedoch für iOS26 erforderlich sein.
 * Diese Datei gleicht solche Auswirkungen aus.
 * Hinweis: Dieses Stylesheet ist nicht in `@rdlabo/ionic-theme-md3` enthalten.
 */
@import '@rdlabo/ionic-theme-ios26/dist/css/md-remove-ios-class-effect.css';

/**
 * Importieren Sie es, wenn Sie das Design von ion-item-group mit ion-list auch unter Android verwenden möchten.
 * Weitere Informationen: https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/using-ion-item-group
 * Hinweis: Dieses Stylesheet ist in `@rdlabo/ionic-theme-md3` enthalten.
 * @import '@rdlabo/ionic-theme-ios26/dist/css/md-ion-list-inset.css';
 */

/*
 * Unterstützung des dunklen Modus
 * Der dunkle Modus von Ionic wird unterstützt. Weitere Informationen: https://ionicframework.com/docs/theming/dark-mode
 * Immer verwenden:       @import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-always.css'
 * Systemmodus verwenden: @import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-system.css'
 * CSS-Klasse verwenden:  @import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-class.css'
 */
```

### Animationen konfigurieren

Wenn Sie nur das iOS-26-Theme installiert haben, konfigurieren Sie dessen Animationen wie folgt.

```ts
import { isPlatform } from '@ionic/core'; // Oder @ionic/angular (Ionic 9), @ionic/angular/standalone (Ionic 8), @ionic/react, @ionic/vue
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios26';

// Angular
provideIonicAngular({
    ...
    navAnimation: isPlatform('ios') ? iosTransitionAnimation: undefined,
    popoverEnter: isPlatform('ios') ? popoverEnterAnimation: undefined,
    popoverLeave: isPlatform('ios') ? popoverLeaveAnimation: undefined,
});

// React
setupIonicReact({
    ...
    navAnimation: isPlatform('ios') ? iosTransitionAnimation: undefined,
    popoverEnter: isPlatform('ios') ? popoverEnterAnimation: undefined,
    popoverLeave: isPlatform('ios') ? popoverLeaveAnimation: undefined,
});

// Vue
createApp(App)
    .use(IonicVue, {
        ...
        navAnimation: isPlatform('ios') ? iosTransitionAnimation: undefined,
        popoverEnter: isPlatform('ios') ? popoverEnterAnimation: undefined,
        popoverLeave: isPlatform('ios') ? popoverLeaveAnimation: undefined,
})
```

### Das Theme prüfen

Testen Sie unter iOS. Setzen Sie bei der Vorschau auf dem Desktop den Ionic-Modus in Ihrer bestehenden Framework-Initialisierung auf `ios`, beispielsweise mit `mode: 'ios'`.

Mit diesem Markup können Sie das Erscheinungsbild eingerückter gruppierter Listen ausprobieren. Die vom Theme erwartete Listenstruktur finden Sie unter [Verwendung von ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/using-ion-item-group).

```html
<ion-list mode="ios" inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

### Optional: Das iOS-26- und MD3-Theme gemeinsam verwenden

Installieren Sie das MD3-Theme, um beide Ionic-Modi in derselben Anwendung zu gestalten.

Die aktuellen Versionen beider Themes benötigen `@ionic/core` ab 8.8.1.

```bash
npm install @rdlabo/ionic-theme-md3
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

- [Verwendung von ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/using-ion-item-group) — erforderliches Markup für eingerückte Listen.
- [Spezielles Markup und Klassen](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/special-markup) — gezielt aktivierbares Markup und Hilfsklassen des Themes.
- [ESLint](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/eslint) — die Listenstruktur mit ESLint-Regeln prüfen.
- [Funktionen](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/features) — CSS-Variablen, Liquid Glass, selektive Imports und dunkler Modus.
- [Experimentelle Animation](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/experimental-animation) — Effekte für Tab-Leiste und Suche.
- [iOS 18](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/ios-18) — das Theme nur unter iOS 26 laden.
- [Migration](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/migration) — erforderliche Änderungen beim Aktualisieren von Hauptversionen.

<!-- rdlabo-docs-omit -->

**Vollständige Dokumentation:** [https://docs.rdlabo.dev/projects/ionic-theme-ios26](https://docs.rdlabo.dev/projects/ionic-theme-ios26)

## Entwicklung und Tests

### JavaScript-Modul-Builds

Belassen Sie relative Imports im TypeScript-Quellcode ohne Dateiendung, entsprechend dem Quellcodestil von Ionic. Die gemeinsame CLI `rdlabo-build-theme` aus `@rdlabo/ionic-theme-utils` verwendet tsdown, um Imports beim Erzeugen von ESM-JavaScript und Typdeklarationen aufzulösen. Abhängigkeiten bleiben extern; die Quelldateien werden nicht umgeschrieben.

Führen Sie `npm run build && npm run test:esm` aus, um das npm-Tarball zu erstellen und mit der gemeinsamen CLI `rdlabo-check-esm` zu prüfen. Öffentliche JavaScript-Einstiegspunkte lassen sich in Node.js ohne DOM importieren. UI-Operationen benötigen weiterhin einen Browser oder eine unterstützte native Umgebung. Das Paket liefert ausschließlich ESM.

### Demo-Anwendung

Dieselbe Demo wird für beide unterstützten Ionic-Versionen bereitgestellt:

- [Ionic-9-Demo](https://ionic-theme-ios26.rdlabo.dev) — maßgebliche Version
- [Ionic-8-Demo](https://ionic8-theme-ios26.rdlabo.dev) — Kompatibilitätsversion

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

Die Anforderung autorisiert ausschließlich den Head-SHA und Zielbranch des Pull Requests zum Zeitpunkt des Kommentars. Der Workflow prüft Eigentümer- oder Maintainer-Berechtigung, Head-SHA und Zielbranch unmittelbar vor der Veröffentlichung erneut. Jeder neue Commit oder Wechsel des Zielbranches macht die Anforderung ungültig. Der neue Zustand muss CI bestehen und einen neuen `/beta`-Kommentar eines Eigentümers oder Maintainers erhalten. Fork-Pull-Requests werden unterstützt. Pull Requests, die einen Workflow zur Freigabe von Veröffentlichungen ändern, können erst als Beta veröffentlicht werden, nachdem diese Workflow-Änderungen im Zielbranch angekommen sind.

Beta-Versionen verwenden `<base>-beta.pr<PR number>.sha<12-character SHA>`. Der Pull Request erhält einen Kommentar mit der unveränderlichen Version und dem genauen `npm install`-Befehl.

Wird ein Pull Request in `main` oder `ios26` gemergt, wird er erst dann automatisch unter dem npm-Dist-Tag `beta` veröffentlicht, wenn `Lint`, `E2E Screenshot Tests` und `Package Candidate` für genau diesen Merge-Commit erfolgreich sind. Direkte Pushes veröffentlichen keinen Kandidaten. Merge-Kandidaten verwenden `<base>-beta.pr<PR number>.sha<12-character SHA>`; der gemergte Pull Request erhält den genauen Installationsbefehl.

Kandidatencode wird in einem schreibgeschützten Workflow ohne npm-Veröffentlichungszugangsdaten gebaut. Der privilegierte Release-Workflow checkt Pull-Request-Code niemals aus und führt ihn nicht aus. Er prüft Quellworkflow und Paketidentität erneut und veröffentlicht anschließend ausschließlich das unveränderliche gepackte Artefakt mit deaktivierten Lebenszyklusskripten. Der Kommentar mit dem Installationsbefehl ist eine separate Benachrichtigung nach bestem Bemühen und kann eine erfolgreiche npm-Veröffentlichung nicht ungültig machen.

Nur `npm run release` kann ein Release-Tag erstellen. Stabile Tags `ios26-vX.Y.Z` für Major-, Minor- oder Patch-Releases werden unter npm `latest` veröffentlicht; Revisions-/Vorabversions-Tags unter `next`. Weder die Veröffentlichung unter `beta` noch unter `next` verändert den npm-Dist-Tag `latest`.

<!-- /rdlabo-docs-omit -->

<!-- rdlabo-docs-omit -->

## Maintainer

- [rdlabo](https://rdlabo.dev/)
<!-- /rdlabo-docs-omit -->
