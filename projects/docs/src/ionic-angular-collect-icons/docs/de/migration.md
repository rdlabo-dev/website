---
title: "Migration"
sourceRevision: "8f924038c0f47c377f5128cccef98553d2b3b58b7610939139e05e7616353501"
---
# Migrationsanleitung

## Den Symbolinitialisierer aktualisieren

Dieser Abschnitt gilt beim Upgrade von Version 3.0.1 oder früher auf eine Version, die `initializeIonicons` bereitstellt.

Ältere Versionen erzeugten einen Namespace-Import für den vollständigen Ionicons-Katalog:

```ts
import { addIcons } from "ionicons";
import * as allIcons from "ionicons/icons";
import * as useIcons from "./use-icons";

addIcons(environment.production ? useIcons : allIcons);
```

Obwohl der Produktionszweig zur Laufzeit `useIcons` auswählte, konnte der Namespace-Import den vollständigen Katalog weiterhin in optimierten Anwendungsbundles behalten. Das Paket stellt jetzt eine Browser-Laufzeit bereit, die Tree-Shaking im Abhängigkeitsgraphen für die Produktion ermöglicht.

Aktualisieren Sie zunächst das Paket und führen Sie den Collector anschließend in einem interaktiven Terminal aus:

```bash
npm install --save-dev @rdlabo/ionic-angular-collect-icons@latest
npx @rdlabo/ionic-angular-collect-icons
```

Build-Umgebungen müssen Entwicklungsabhängigkeiten installieren, da der erzeugte Anwendungscode beim Kompilieren die Browser-Laufzeit importiert. Diese wird anschließend in das Anwendungsbundle aufgenommen.

Wenn die CLI diesen erzeugten Initialisierer erkennt, fragt sie, ob er migriert werden soll. **Yes** (Ja) ist vorausgewählt. Bei **No** (Nein) bleibt der Initialisierer unverändert und die normale Symbolsammlung wird fortgesetzt.

Um zunächst eine Vorschau des Quellcode-Diffs zu sehen, wählen Sie **No** (Nein) und führen Sie Folgendes aus:

```bash
npx @rdlabo/ionic-angular-collect-icons --migrate true --dry-run true
```

Bestätigen Sie die Migration für CI oder eine andere nicht interaktive Umgebung ausdrücklich mit `--migrate true`. Ohne dieses Flag bleibt der Initialisierer unverändert. Nach der Bestätigung entsteht folgender Code:

```ts
import { initializeIonicons } from "@rdlabo/ionic-angular-collect-icons/runtime";
import * as useIcons from "./use-icons";

void initializeIonicons(useIcons);
```

`initializeIonicons` registriert die gesammelten Symbole synchron. Angulars `isDevMode()` lädt anschließend in der Entwicklung den vollständigen Katalog aus einem isolierten, bei Bedarf geladenen Bundle. In der Produktion startet die Anwendung, ohne dieses Katalogbundle herunterzuladen.

Die bestätigte Migration schreibt nur den von älteren Versionen erzeugten ternären Initialisierer um:

```ts
addIcons(environment.production ? useIcons : allIcons);
```

Auch die Import-Bindungen müssen der bekannten erzeugten Struktur entsprechen. Andere `addIcons(...)`-Aufrufe und Imports, die benutzerdefinierter Anwendungscode verwendet, bleiben erhalten. Das Migrationstool erkennt sowohl den alten erzeugten Pfad ohne Präfix wie `"use-icons"` als auch dessen kanonische relative Form `"./use-icons"` und schreibt nach der Migration die kanonische Form.
Wenn `--migrate true` ausdrücklich angefordert wird, wird auch die übliche Form `addIcons(useIcons)` aktualisiert, aber nur, wenn `useIcons` der Namespace-Import für die konfigurierte erzeugte Symboldatei ist. Wurde der Initialisierer angepasst, ersetzen Sie den Import und den Aufruf manuell und behalten Sie benutzerdefinierte Registrierungen separat bei.

Um die Laufzeitintegration rückgängig zu machen und dabei Tree-Shaking für Produktionsbundles zu erhalten, ersetzen Sie ihren Import und Aufruf durch:

```ts
import { addIcons } from "ionicons";
import * as useIcons from "./use-icons";

addIcons(useIcons);
```

Dieser Rückbau registriert in der Entwicklung nicht den vollständigen Katalog. Stellen Sie den alten Namespace-Import `allIcons` nicht wieder her, da er die Ursache der Regression beim Produktionsbundle ist.

Führen Sie nach der Migration die Tests der nutzenden Anwendung und einen optimierten Produktions-Build aus. Die Bundle-Statistik sollte im initialen Graphen nur die von `use-icons.ts` exportierten Symbole enthalten. Der vollständige Ionicons-Katalog darf als separater, bei Bedarf geladener Chunk erscheinen, darf aber in der Produktion beim Start nicht heruntergeladen werden.

## Migration auf Ionic Angular 9

Diese Version richtet sich an Ionic Angular 9 und folgt den [inkompatiblen Änderungen von Ionic Framework 9](https://github.com/ionic-team/ionic-framework/blob/main/BREAKING.md#version-9x).

### Voraussetzungen

- Ionic Angular ab 9
- Angular ab 18
- Capacitor ab 7 für native Anwendungen
- TypeScript ab 5.4
- Ionicons ab 8
- Node.js ab 22

### Das offizielle Migrationstool ausführen

Ionic empfiehlt sein offizielles Migrationstool. Committen Sie zuerst die aktuellen Änderungen Ihrer Anwendung. Das Tool bearbeitet Dateien direkt und benötigt einen sauberen Git-Arbeitsbaum, damit der Commit zum Prüfen oder Rückgängigmachen seiner Änderungen verwendet werden kann.

Führen Sie es im Wurzelverzeichnis der Ionic-Anwendung aus:

```bash
npx @ionic/migrate
```

Das Migrationstool erkennt die installierte Ionic-Hauptversion, aktualisiert Abhängigkeiten, wendet sichere automatische Korrekturen an, formatiert geänderte Dateien, installiert Abhängigkeiten neu und gibt eine Checkliste der manuell zu prüfenden Änderungen aus.

Führen Sie für eine Vorschau der Migration ohne Schreiben von Dateien Folgendes aus:

```bash
npx @ionic/migrate --dry-run
```

Aktualisieren Sie nach Abschluss der offiziellen Migration diesen Collector und prüfen Sie, dass die resultierenden Abhängigkeitsversionen die oben genannten Anforderungen erfüllen:

```bash
npm install --save-dev @rdlabo/ionic-angular-collect-icons@latest
```

Die weiteren Abschnitte erklären die wichtigen Änderungen von Ionic Angular 9, die im erzeugten Diff und in der Checkliste des Migrationstools manuell zu prüfen sind.

### Die Standalone-Migration abschließen

Ionic 9 exportiert eigenständige Angular-Komponenten aus `@ionic/angular`. Ersetzen Sie den Standalone-Einstiegspunkt von Ionic 8:

```diff
- import { IonApp, IonIcon, provideIonicAngular } from '@ionic/angular/standalone';
+ import { IonApp, IonIcon, provideIonicAngular } from '@ionic/angular';
```

Das offizielle Migrationstool kann NgModule-Imports nach `@ionic/angular/lazy` verschieben, um die Anwendungsarchitektur während der Framework-Aktualisierung zu erhalten. Betrachten Sie dies als Zwischenzustand, nicht als Ziel der Standalone-Migration. Schließen Sie die Angular-Standalone-Migration ab und importieren Sie anschließend jede Ionic-Komponente aus `@ionic/angular`. Schreiben Sie `/lazy`-Imports nicht mechanisch um, bevor deren NgModule-Verbraucher konvertiert wurden.

### `IonicModule` nach der Standalone-Migration ersetzen

`IonicModule` ist in Ionic 9 veraltet. Das Entfernen erfordert jedoch Architekturänderungen auf Anwendungsebene. Stellen Sie die Anwendung auf Standalone-Bootstrap um, verschieben Sie die Ionic-Konfiguration nach `provideIonicAngular()` und importieren Sie die von jedem Verbraucher verwendeten eigenständigen Ionic-Komponenten:

```diff
- platformBrowserDynamic().bootstrapModule(AppModule);
+ bootstrapApplication(AppComponent, {
+   providers: [provideIonicAngular(config)],
+ });
```

Importieren Sie `provideIonicAngular` aus `@ionic/angular`. Ersetzen Sie `IonicModule.forRoot()` nicht durch eine einzelne Provider-Zeile im selben NgModule. Schließen Sie zuerst die Migration von NgModule auf Standalone ab.

### Modulauflösung mit Unterstützung für exports verwenden

Ionic 9 veröffentlicht Paketunterpfade über `exports`. Anwendungen sollten die standardmäßige Bundler-Auflösung von Angular verwenden:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022"
  }
}
```

Ersetzen Sie CSS-Imports im webpack-Stil mit `~`:

```diff
- @import '~@ionic/angular/css/core.css';
+ @import '@ionic/angular/css/core.css';
```

### Den Icon-Collector ausführen

Initialisieren Sie die erzeugte Symbolregistrierung, falls die Anwendung dies noch nicht getan hat:

```bash
npx @rdlabo/ionic-angular-collect-icons --initialize true
```

Führen Sie den Collector weiterhin vor Produktions-Builds aus, wie in der [Verwendungsanleitung](./usage.md) beschrieben.

### Weitere Änderungen von Ionic 9 prüfen

Der Collector findet `ion-icon`-Verwendungen in Angular-Templates und aktualisiert seine eigenen Dateien für die Symbolregistrierung. Er hängt weder vom Verhalten der Ionic-Komponenten noch von deren internem DOM ab. Diese Ionic-9-Änderungen erfordern daher keine collectorspezifischen Codeänderungen. Nutzende Anwendungen müssen dennoch die offiziellen Migrationshinweise prüfen, besonders die neuen Mindestversionen für Browser und mobile Plattformen sowie folgende Änderungen:

- Native Anwendungen benötigen Capacitor ab 7 und iOS ab 16.
- Unterstützte Desktop-Browser sind Chrome ab 89, Safari ab 16, Edge ab 89 und Firefox ab 75.
- `ion-input` und `ion-searchbar` verwenden jetzt eine boolesche Property `autocorrect`.
- Die älteren Picker-Komponenten und `PickerController` wurden entfernt.
- Sheet-Modal-Griffe verwenden jetzt standardmäßig `handleBehavior="cycle"`.
- `ion-nav` ist nicht mehr mit `ion-router` integriert.
- `ion-select` erzeugt `ionChange` nur, wenn sich sein Wert ändert.
- Das interne DOM und die Styling-Anknüpfungspunkte von Input, Select und Textarea wurden geändert.
- Angular-21-Anwendungen verwenden standardmäßig zonenlose Änderungserkennung.

Führen Sie nach der Migration die Lint-, Test- und Produktions-Build-Befehle der Anwendung aus und prüfen Sie angepasste Ionic-Komponentenstyles visuell.
