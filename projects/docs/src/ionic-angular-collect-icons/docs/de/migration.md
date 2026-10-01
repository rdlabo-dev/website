---
title: "Migration"
sourceRevision: "c4b917f0d294c34f78b9db694644d90f3e006aa2c4faa1980fc82160bd8594ca"
---
# Migrationsanleitung

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
