---
title: "Migration"
sourceRevision: "8e98c0a10a993fbb25c7afc392ed1497e17d9e4283a290ff8b449a2d5f6bce3a"
---
# Migrationsanleitung

## 22.0 auf 22.1

Version 22.1 aktiviert `require-ion-error-text` im empfohlenen Preset. Standardmäßig prüft die Regel die sechs Ionic-Bedienelemente mit Unterstützung für `errorText` nur dann, wenn sie Angular Signal Forms über `[formField]` binden. Ein nicht leerer statischer `errorText` oder ein per Property gebundener `[errorText]` erfüllt die Regel.

Anwendungen mit `KitIonicFormField` aus `@rdlabo/ionic-angular-kit/forms` können adapterbewusstes Linting aktivieren, nachdem jede betreffende Standalone-Komponente sowohl Angulars `FormField` als auch den Kit-Adapter importiert:

```js
{
  files: ['**/*.html'],
  rules: {
    '@rdlabo/rules/require-ion-error-text': ['error', { formFieldProvidesErrorText: true }],
  },
}
```

Setzen Sie `checkAll: true` nur, wenn die Anwendung Fehlertexte auch an unterstützten Bedienelementen ohne `[formField]`-Bindung verlangt. Filter- und Einstellungsbedienelemente liegen sonst bewusst außerhalb des Standardumfangs. `ignoreReadonly: true` gilt nur mit `checkAll` und nur für literale `readonly`-Attribute an `ion-input` und `ion-textarea`. Dynamische `[readonly]`-Bindungen werden weiterhin geprüft.

## 21.x auf 22.x

Version 22 richtet sich an Angular 21 und 22 mit Ionic Framework 9. Ionic-8-Anwendungen müssen auf Version 21 dieses Plugins bleiben.

### Abhängigkeiten

Committen Sie zuerst Ihre Anwendungsänderungen und führen Sie anschließend das offizielle Ionic-Tool [`@ionic/migrate`](https://www.npmjs.com/package/@ionic/migrate) im Anwendungswurzelverzeichnis aus:

```sh
npx @ionic/migrate --dry-run
npx @ionic/migrate
```

Das Migrationstool erkennt die installierte Ionic-Hauptversion, aktualisiert `@ionic/angular` und `@ionic/core` gemeinsam, wendet sichere Änderungen von v8 auf v9 an und gibt eine Checkliste für Änderungen mit manuellen Entscheidungen aus. Prüfen und testen Sie den Diff, bevor Sie fortfahren. Version 22 dieses Plugins unterstützt Angular und Angular ESLint 21 bis 22.

### Ionic-Angular-Imports

Ersetzen Sie die entfernte Regel `deny-import-from-ionic-module` durch `prefer-ionic-standalone`:

```diff
- '@rdlabo/rules/deny-import-from-ionic-module': 'error'
+ '@rdlabo/rules/prefer-ionic-standalone': 'error'
```

Bei Angular-Anwendungen verschiebt das offizielle Migrationstool bestehende NgModule-Imports aus `@ionic/angular` nach `@ionic/angular/lazy` und Standalone-Imports aus `@ionic/angular/standalone` zum Paketwurzelpfad. Dadurch bleibt die derzeitige Anwendungsarchitektur während der Framework-Aktualisierung erhalten.

Beispielsweise führt das Migrationstool diese sichere Anpassung von Standalone-Imports automatisch aus:

```diff
- import { IonButton } from '@ionic/angular/standalone';
+ import { IonButton } from '@ionic/angular';
```

Dieses Plugin unterstützt ausschließlich Ionic-9-Standalone-Anwendungen. Das offizielle Migrationstool meldet `IonicModule` ohne automatische Korrektur, da die Umstellung einer NgModule-Anwendung Architekturentscheidungen erfordert. Schließen Sie nach seiner Ausführung die Angular-Standalone-Migration ab und importieren Sie Ionic-Komponenten aus dem Paketwurzelpfad. Ersetzen Sie `@ionic/angular/lazy`-Pfade nicht mechanisch. Stellen Sie zuerst jeden NgModule-Verbraucher auf Standalone um und ersetzen Sie anschließend `IonicModule` durch die konkret verwendeten Ionic-Komponenten.

Die neue Regel weist den NgModule-basierten Einstiegspunkt `@ionic/angular/lazy` und `IonicModule` zurück. Migrieren Sie auf Standalone-Bootstrap mit `provideIonicAngular()` und importieren Sie eigenständige Ionic-Komponenten direkt:

```diff
- platformBrowserDynamic().bootstrapModule(AppModule);
+ bootstrapApplication(AppComponent, {
+   providers: [provideIonicAngular(config)],
+ });
```

Importieren Sie `provideIonicAngular` aus `@ionic/angular`. Schließen Sie die Angular-Migration von NgModule auf Standalone ab, bevor Sie `IonicModule` entfernen. Es lässt sich innerhalb eines NgModule nicht sicher durch eine einzeilige automatische Korrektur ersetzen.

### Listenstruktur im empfohlenen Preset

Version 22 aktiviert außerdem `require-ion-item-group` im empfohlenen Preset. Bestehende Ionic-Templates können daher neue Fehler melden, wenn ein `ion-item` innerhalb einer `ion-list` nicht von `ion-item-group`, `ion-reorder-group`, `ion-radio-group` oder `ion-accordion` innerhalb einer `ion-accordion-group` umschlossen ist.

Die Regel wendet sichere automatische Korrekturen nur an, wenn sie die beabsichtigte Gruppengrenze bestimmen kann. Wiederverwendbare oder mehrdeutige Templates werden gemeldet, ohne sie zu verändern. Wrapper-Komponenten werden anhand ihrer eigenen Templates geprüft. Ein benutzerdefiniertes Element, das eine gültige gruppierte Liste rendert, wird deshalb beim Aufrufer nicht als ungruppiertes `ion-item` behandelt. Unterstützte Strukturen und Einschränkungen der Korrektur beschreibt [`require-ion-item-group`](./rules/require-ion-item-group.md).

### Boolesches autocorrect

Ionic 9 ändert `autocorrect` an `ion-input` und `ion-searchbar` von `'on' | 'off'` zu `boolean`. Die Regel `ionic-attr-type-check` korrigiert jetzt die alte Zeichenfolgenform:

```diff
- <ion-input autocorrect="off"></ion-input>
+ <ion-input [autocorrect]="false"></ion-input>
```

Das offizielle Ionic-Migrationstool verarbeitet diese Änderung von v8 auf v9 automatisch. Die Regel bleibt nützlich, um nach der Migration alte oder neu eingeführte Zeichenfolgenwerte zu erkennen. Sie liest die Ionic-9-Komponententypen und folgt dadurch auch weiteren Änderungen von Property-Typen und zulässigen Werten in diesen Definitionen. Führen Sie ESLint mit `--fix` aus, prüfen Sie die resultierenden Template-Änderungen und führen Sie vor dem Committen den Angular-Build und die Tests aus.
