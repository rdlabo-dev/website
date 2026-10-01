---
title: "Einheitliche Listen mit ESLint sicherstellen"
sourceRevision: "968c903f335ddd7ce9f0af1fa6f96a4b2925b4e87fb88ae75507704026766a49"
---
Erkennen Sie fehlende Listengruppen, bevor sie auf dem Bildschirm erscheinen. In Ionic-Angular-Anwendungen prüft `@rdlabo/eslint-plugin-rules` das für iOS 26 verwendete Markup.

## Die Listenprüfung aktivieren

Diese Konfiguration richtet sich an Ionic Angular 9 mit Angular / Angular ESLint 21–22. Installieren Sie Plugin 22 in einer Anwendung, in der Angular ESLint bereits eingerichtet ist:

```sh
npm install --save-dev @rdlabo/eslint-plugin-rules@22
```

Fügen Sie das Plugin zur bestehenden HTML-Konfiguration in `eslint.config.mjs` oder der entsprechenden CommonJS-Konfiguration hinzu. Behalten Sie `angular.processInlineTemplates` in der TypeScript-Konfiguration bei, damit auch Inline-Templates geprüft werden:

```js
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules';

export default tseslint.config(
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    processor: angular.processInlineTemplates,
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angular.templateParser },
    plugins: { '@rdlabo/rules': rdlabo },
    rules: {
      '@rdlabo/rules/require-ion-item-group': 'error',
    },
  },
);
```

Ergänzen Sie diese Einträge in Ihrer bestehenden Konfiguration, damit deren weitere Prüfungen erhalten bleiben. Verwenden Sie bereits `rdlabo.configs.recommended`? Darin ist diese Regel enthalten.

## Was die Prüfung erkennt

Dieses Template wird beanstandet:

```html
<ion-list [inset]="true">
  <ion-item>Notifications</ion-item>
</ion-list>
```

Gruppieren Sie die Elemente und importieren Sie `IonItemGroup` in der Standalone-Komponente:

```html
<ion-list [inset]="true">
  <ion-item-group>
    <ion-item>Notifications</ion-item>
  </ion-item-group>
</ion-list>
```

Die Regel prüft alle `ion-list`-Elemente einschließlich nicht eingerückter Listen. Radio-, Reorder- und Accordion-Gruppen werden ebenfalls unterstützt. Sie prüft Angular-Templates, jedoch keine React- oder Vue-Templates.

Layoutbeispiele finden Sie unter [Verwendung von ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/using-ion-item-group). Unterstützte Strukturen und automatische Korrekturen beschreibt die [Regelreferenz](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/require-ion-item-group).

## Die Prüfung dauerhaft ausführen

Führen Sie nach der Installation der Abhängigkeiten lokal und in CI Folgendes aus:

```sh
npx eslint 'src/**/*.{ts,html}' --max-warnings 0
```

Passen Sie den Pfad an, wenn Ihr Angular-Projekt ein anderes Quellverzeichnis verwendet. Prüfen Sie Abstände, Farben und Übergänge weiterhin visuell; diese Regel prüft die Listenstruktur.
