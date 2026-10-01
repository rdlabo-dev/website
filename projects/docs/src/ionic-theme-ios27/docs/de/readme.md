---
title: "Erste Schritte"
sourceRevision: "a280bb144b9c13f5698f1b6673789966874ad0fb68364a9dd93921984b35c1bb"
---
# Ionic Theme iOS27

Ein Theme für Ionic-Anwendungen, das iOS 27 Liquid Glass und dessen Bewegungseffekte ins Web bringt. Capacitor-Anwendungen für iOS können zusätzlich die als Vorschau verfügbare Native UI Shell für unterstützte Bedienelemente aktivieren.

**[Ionic-9-Demo](https://ionic-theme-ios27.rdlabo.dev/) · [Ionic-8-Demo](https://ionic8-theme-ios27.rdlabo.dev/) · [Dokumentation](https://docs.rdlabo.dev/projects/ionic-theme-ios27)**

<!-- rdlabo-docs-pick -->

<p>
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.2.0/screenshots/ios27-settings.png" width="32%" alt="iOS-27-Theme: Einstellungen im hellen Modus mit einer Liquid-Glass-Suchleiste" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.2.0/screenshots/ios27-settings-dark.png" width="32%" alt="iOS-27-Theme: Einstellungen im dunklen Modus" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.2.0/screenshots/ios27-library.png" width="32%" alt="iOS-27-Theme: Bibliothek mit Liquid-Glass-Schaltflächen und Tab-Leiste" />
</p>

<!-- /rdlabo-docs-pick -->

## Funktionen

### Das Erscheinungsbild von iOS 27 für Ionic

Geben Sie vertrauten Ionic-Oberflächen die Designsprache von iOS 27: Liquid Glass, gestaltete Werkzeugleisten und Tabs, Listen, Schaltflächen, Suche, Overlays, Seitenübergänge und aufeinander abgestimmte helle und dunkle Darstellungen. Das Ergebnis sehen Sie in der [Ionic-9-Demo](https://ionic-theme-ios27.rdlabo.dev/) und der [Ionic-8-Demo](https://ionic8-theme-ios27.rdlabo.dev/).

### Ihre Ionic-Oberfläche als native UI darstellen

Unter Capacitor iOS liest die optionale [Native UI Shell](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/native-ui-shell) unterstützte fest positionierte Bedienelemente aus Ihrem bestehenden Ionic-Markup. Sie ist in `1.2.0` als Vorschau verfügbar. Texte, aufgelöste `ion-icon`-Grafiken oder unterstützte statische SVGs sowie der Auswahlzustand werden in UIKit-Bedienelemente mit systemeigenem Liquid Glass übertragen. Änderungen und native Aktionen laufen über die ursprünglichen Ionic-Komponenten, sodass Web- und native Darstellung dieselbe UI-Definition verwenden. Seiteninhalt und Routing bleiben in der WebView; nicht unterstützte Layouts behalten ihre Web-Darstellung.

**Tab-Ziehen unter iOS 27:** Derselbe Library-Bildschirm mit deaktivierter Native UI Shell (Web) und aktivierter Native UI Shell (UIKit). Beide Aufnahmen entstanden beim Ziehen des ausgewählten Tabs; die unteren Ausschnitte vergrößern die Glasfläche um die Tab-Leiste.

[![Dieselbe Ziehbewegung am Library-Tab bei deaktivierter und aktivierter Native UI Shell, mit vergrößerten Tab-Leisten](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.2.0/screenshots/native-ui-shell-drag/comparison.png)](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.2.0/screenshots/native-ui-shell-drag/comparison.png)

### An das Gerät des Nutzers anpassen

Kombinieren Sie die Themes für iOS 26 und iOS 27, damit unterstützte Safari-Versionen das Design der jeweiligen Generation darstellen: das iOS-26-Erscheinungsbild für Nutzer von iOS 26 und das iOS-27-Erscheinungsbild für Nutzer von iOS 27. Die [Standardkonfiguration](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/readme#get-started) wählt die entsprechenden **Styles** anhand von Browser-Funktionsprüfungen aus; sie liest die iOS-Version nicht aus. Wenn beide Pakete installiert sind, verwenden Sie für den **Seitenübergang** weiterhin die iOS-27-Animation. Auf noch älteren iOS-Versionen bleibt die standardmäßige iOS-Darstellung von Ionic erhalten, wenn Safari keine der beiden Funktionen unterstützt. In einer Capacitor-iOS-Anwendung richtet sich das UIKit-Material der Native UI Shell nach der installierten iOS-Version.

## Erste Schritte

Installieren Sie beide Themes in einer bestehenden Ionic-8- oder Ionic-9-Anwendung (`@ionic/core` ab 8.8.1):

```bash
npm install @rdlabo/ionic-theme-ios26 @rdlabo/ionic-theme-ios27
```

Laden Sie die Styles in Ihrem globalen Sass-Stylesheet, beispielsweise `src/styles.scss`, abhängig von den Browser-Fähigkeiten:

```scss
@use 'sass:meta';

@supports (overflow-anchor: auto) {
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect');
}

@supports (text-wrap: pretty) and (not (overflow-anchor: auto)) {
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect');
}
```

Falls die Kompilierung bei einem Aufruf von `meta.load-css()` den Fehler `Can't find stylesheet to import.` meldet, machen Sie `node_modules` für Sass verfügbar. Ergänzen Sie in Angular unter den Build-`options` der Anwendung in `angular.json` Folgendes:

```json
"stylePreprocessorOptions": {
  "includePaths": ["node_modules"]
}
```

Alternativ können Sie von der Sass-Datei mit `meta.load-css()` aus einen relativen Pfad zum installierten Paket verwenden, zum Beispiel `../node_modules/@rdlabo/ionic-theme-ios27/src/styles/default-variables` aus `src/styles.scss`. Passen Sie das Präfix `../` an den Speicherort Ihrer Datei an und ändern Sie alle Theme-Imports entsprechend.

Diese Prüfungen wählen die Styles anhand von Browser-Funktionen aus, nicht anhand der iOS-Version. Browser ohne diese Funktionen behalten die standardmäßige iOS-Darstellung von Ionic. Das Beispiel verwendet einen klassenbasierten dunklen Modus: Laden Sie zusätzlich die [passende dunkle Ionic-Palette](https://ionicframework.com/docs/theming/dark-mode). Für einen systemgesteuerten oder dauerhaft dunklen Modus ersetzen Sie beide `-dark-class`-Imports durch die passende Variante. Die Styles `md-remove-ios-class-effect` verhindern, dass iOS-spezifische Klassen den Material-Design-Modus beeinflussen.

### Animationen konfigurieren

Behalten Sie die iOS-27-Animationen für Seitenübergänge und Popovers für beide gestalteten Generationen bei. Ermitteln Sie diese Optionen, bevor Ionic initialisiert wird. Für Angular:

```ts
import { isPlatform, provideIonicAngular } from '@ionic/angular/standalone'; // Ionic 8
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';

function loadIOSAnimations() {
  if (typeof CSS === 'undefined') return {};
  if (!CSS.supports('overflow-anchor: auto') && !CSS.supports('text-wrap: pretty')) return {};

  return {
    navAnimation: iosTransitionAnimation,
    popoverEnter: popoverEnterAnimation,
    popoverLeave: popoverLeaveAnimation,
  };
}

provideIonicAngular(isPlatform('ios') ? loadIOSAnimations() : {});
```

Importieren Sie für Ionic 9 Angular `isPlatform` und `provideIonicAngular` aus `@ionic/angular`. React und Vue können dieselben Optionen bei der Initialisierung an `setupIonicReact` beziehungsweise `IonicVue` übergeben. Führen Sie die Auswahl in serverseitig gerenderten Anwendungen während der Browser-Initialisierung aus.

Der Radius des Seitenübergangs ist standardmäßig `0`. Native Anwendungen können ihn nach dem Vermessen der WebView aktualisieren:

```ts
import { setConfig } from '@rdlabo/ionic-theme-ios27';

setConfig({ radius });
```

### Das Theme prüfen

Testen Sie unter iOS. Setzen Sie bei der Vorschau auf dem Desktop den Ionic-Modus in Ihrer bestehenden Framework-Initialisierung auf `ios`, beispielsweise mit `mode: 'ios'`.

Mit diesem Markup können Sie das Erscheinungsbild eingerückter gruppierter Listen ausprobieren. Die vom Theme erwartete Listenstruktur finden Sie unter [Verwendung von ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/using-ion-item-group).

```html
<ion-list mode="ios" inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

## Optionale Konfigurationen

### iPhone Duo ohne das iOS-27-Theme unterstützen (Vorschau)

Behalten Sie Ihr bestehendes Ionic-Theme bei und verschieben Sie Tabs und unterstützte Werkzeugleistenaktionen in einen vertikalen Seitenbereich. **Beginnen Sie in Chrome** mit einem Stylesheet, einer Anwendungsklasse und `enableVerticalControlArea()`. Verbinden Sie das Layout anschließend mit iPhone-Duo-Geräteereignissen für die Systemleiste und die Scharnierstellung.

Der Gerätezustand wird von [`@erkamyaman/capacitor-foldable`](https://github.com/erkamyaman/capacitor-foldable) bereitgestellt, das in Ihrer Anwendung installiert wird:

```bash
npm install @erkamyaman/capacitor-foldable
npx cap sync
```

Wenden Sie den Faltzustand mit `applyFoldStateClasses(root, fold)` und die Leistenposition mit `setVerticalControlAreaPlacement({ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset })` an. Die Geräteüberwachung ist nicht im Theme enthalten.

Die Browser-Vorschau und iOS-Konfiguration beschreibt [iPhone Duo mit Ihrem bestehenden Theme](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme). Informationen zur Übertragung von Bedienelementen und zur Laufzeit-API finden Sie unter [Vertical Bars](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars). Geräteereignisse und geteilte Ansichten behandelt [iPhone-Duo-Unterstützung](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo). Ab `1.2.0` als Vorschaufunktion verfügbar; APIs und unterstütztes Verhalten können sich ändern.

### Nur das iOS-27-Theme verwenden

Installieren Sie nur `@rdlabo/ionic-theme-ios27` und importieren Sie dessen Styles ohne Bedingungen in Ihr globales Stylesheet:

```css
@import '@rdlabo/ionic-theme-ios27/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/md-remove-ios-class-effect.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27-dark-class.css';
```

Der letzte Import verwendet den klassenbasierten dunklen Modus. Wählen Sie für einen anderen Modus die Variante `-dark-system` oder `-dark-always` und die passende Ionic-Palette. Konfigurieren Sie die iOS-27-Animationen wie oben mit `isPlatform('ios')`, jedoch ohne Browser-Funktionsprüfungen.

### Weitere Optionen

- **Native Bedienelemente:** Folgen Sie der [Einrichtungsanleitung für die Native UI Shell](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/native-ui-shell). Stylesheet-Imports allein aktivieren sie nicht.
- **Eingerückte Listen unter Android:** Laden Sie bei Bedarf das Stylesheet `md-ion-list-inset` des passenden Pakets innerhalb jedes `@supports`-Zweigs. In `@rdlabo/ionic-theme-md3` ist es bereits enthalten.

### Zusammen mit dem MD3-Theme verwenden

Installieren Sie alle drei Themes, um iOS 27 auf unterstützten Safari-Versionen, iOS 26 als Rückfalloption auf der vorherigen Safari-Generation und MD3 im Material-Design-Modus von Ionic zu verwenden. Alle drei Themes benötigen `@ionic/core` ab 8.8.1:

```bash
npm install @rdlabo/ionic-theme-ios26 @rdlabo/ionic-theme-ios27 @rdlabo/ionic-theme-md3
```

Beschränken Sie die beiden iOS-Themes auf dieselben Browser-Funktionsprüfungen wie in der Standardkonfiguration und laden Sie MD3 anschließend ohne Bedingung. Wenn Sie durchgehend `meta.load-css()` verwenden, stehen die MD3-Styles im erzeugten CSS außerdem nach den bedingten iOS-Styles:

```scss
@use 'sass:meta';

@supports (overflow-anchor: auto) {
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect');
}

@supports (text-wrap: pretty) and (not (overflow-anchor: auto)) {
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect');
}

@include meta.load-css('@rdlabo/ionic-theme-md3/dist/css/default-variables.css');
@include meta.load-css('@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css');
```

Die iOS-Styles gelten nur für den Ionic-Modus `ios`, MD3 dagegen für den Modus `md`. Das Stylesheet `md-remove-ios-class-effect` in jedem iOS-Zweig verhindert, dass ausschließlich für iOS gedachte Hilfsklassen den MD-Modus beeinflussen. MD3 enthält seine Styles für eingerückte Listen bereits. Laden Sie in dieser Konfiguration deshalb nicht zusätzlich das optionale Stylesheet `md-ion-list-inset` eines der iOS-Pakete.

Laden Sie auch die passende dunkle Ionic-Palette. Das Beispiel verwendet einen klassenbasierten dunklen Modus. Wählen Sie für einen systemgesteuerten oder dauerhaft dunklen Modus die passende Variante für Ionic und beide iOS-Themes.

Behalten Sie den iOS-27-Übergang für beide iOS-Theme-Generationen bei und wählen Sie im Material-Design-Modus den MD3-Übergang. Erweitern Sie die oben gezeigte Animationskonfiguration wie folgt:

```ts
import { isPlatform, provideIonicAngular } from '@ionic/angular/standalone'; // Ionic 8
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';
import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';

function loadAnimations() {
  if (!isPlatform('ios')) return { navAnimation: mdTransitionAnimation };
  if (typeof CSS === 'undefined') return {};
  if (!CSS.supports('overflow-anchor: auto') && !CSS.supports('text-wrap: pretty')) return {};

  return {
    navAnimation: iosTransitionAnimation,
    popoverEnter: popoverEnterAnimation,
    popoverLeave: popoverLeaveAnimation,
  };
}

provideIonicAngular(loadAnimations());
```

Importieren Sie für Ionic 9 Angular `isPlatform` und `provideIonicAngular` aus `@ionic/angular`. React und Vue können dieselben zurückgegebenen Optionen an `setupIonicReact` beziehungsweise `IonicVue` übergeben. Falls Sass ein Paket in `meta.load-css()` nicht auflösen kann, verwenden Sie `stylePreprocessorOptions.includePaths` oder die unter Erste Schritte beschriebene Konfiguration mit relativen Pfaden.

## Dokumentation

**Vollständige Dokumentation:** [Ionic Theme iOS27](https://docs.rdlabo.dev/projects/ionic-theme-ios27)

- [Verwendung von ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/using-ion-item-group) — erforderliches Markup für eingerückte Listen.
- [Spezielles Markup und Klassen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/special-markup) — gezielt aktivierbares Markup und Hilfsklassen des Themes.
- [ESLint](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/eslint) — die Listenstruktur mit ESLint-Regeln prüfen.
- [Funktionen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/features) — CSS-Variablen, Liquid Glass, selektive Imports und dunkler Modus.
- [Native UI Shell (Vorschau)](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/native-ui-shell) — unterstützte Ionic-Bedienelemente, Texte und Symbole in UIKit darstellen.
- [Vertical Bars (Vorschau)](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars) — Seitenleistenlayout, unterstützte Bedienelemente, Aussehen nativer Schaltflächen und Laufzeit-API.
- [iPhone-Duo-Unterstützung (Vorschau)](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo) — vertikale Systemleiste, Scharnierstellung und geteilte Ansichten; auch ohne Theme oder Shell nutzbar.
- [iPhone Duo mit Ihrem bestehenden Theme (Vorschau)](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme) — eigenständige Einrichtung unter Beibehaltung des vorhandenen Web-Themes.
- [Animation](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/animation) — Effekte für Tabs, Segmente und Suche.
- [Migration von iOS 26](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/migration) — Aktualisierung einer bestehenden Anwendung einschließlich Änderungen an Stylesheets, Klassen und CSS-Variablen.
- [Migrationsverlauf von iOS 26](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/migration) — frühere Änderungen der Hauptversionen des Vorgängerpakets.

<!-- rdlabo-docs-omit -->

**iOS-26-Theme:** Siehe die [iOS-26-Dokumentation](https://docs.rdlabo.dev/projects/ionic-theme-ios26).

## Entwicklung und Tests

### JavaScript-Modul-Builds

Belassen Sie relative Imports im TypeScript-Quellcode ohne Dateiendung, entsprechend dem Quellcodestil von Ionic. Die gemeinsame CLI `rdlabo-build-theme` aus `@rdlabo/ionic-theme-utils` verwendet tsdown, um Imports beim Erzeugen von ESM-JavaScript und Typdeklarationen aufzulösen. Abhängigkeiten bleiben extern; die Quelldateien werden nicht umgeschrieben.

Führen Sie `npm run build && npm run test:esm` aus, um das npm-Tarball zu erstellen und mit der gemeinsamen CLI `rdlabo-check-esm` zu prüfen. Öffentliche JavaScript-Einstiegspunkte lassen sich in Node.js ohne DOM importieren. UI-Operationen benötigen weiterhin einen Browser oder eine unterstützte native Umgebung. Das Paket liefert ausschließlich ESM.

### Demo-Anwendung

Dieselbe Demo wird für beide unterstützten Ionic-Versionen bereitgestellt:

- [Ionic-9-Demo](https://ionic-theme-ios27.rdlabo.dev) — maßgebliche Version
- [Ionic-8-Demo](https://ionic8-theme-ios27.rdlabo.dev) — Kompatibilitätsversion

Das Verzeichnis `demo/` enthält die Angular-Anwendung für beide Bereitstellungen. So führen Sie sie lokal aus:

```bash
cd demo
npm install
npm start
```

### Visuelle Regressionstests

Playwright vergleicht Screenshots der Demo-Routen im hellen und dunklen Modus mit gespeicherten Referenzbildern, um unbeabsichtigte visuelle Änderungen zu erkennen. Diese Regressionstests messen nicht die Ähnlichkeit mit iOS-27-Referenzansichten.

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

### Veröffentlichungen

Stabile Tags nach dem Muster `ios27-vX.Y.Z` werden über den [Release-Workflow](./.github/workflows/release.yml) mit dem npm-Tag `latest` veröffentlicht. Maintainer erstellen Release-Tags mit `npm run release`. Pull-Request- und Merge-Kandidaten verwenden den npm-Tag `beta`; Vorabversionen verwenden `next`.

<!-- /rdlabo-docs-omit -->

<!-- rdlabo-docs-omit -->

## Maintainer

- [rdlabo](https://rdlabo.dev/)
<!-- /rdlabo-docs-omit -->
