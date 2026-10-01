---
title: "Eine Lint-Regel beim Erkennen und Korrigieren von Code beobachten"
sourceRevision: "1bf99c55bfb6000d784ec3ebdb6176d49ff7e3a631cf08008d72e3299327ab5b"
---
Machen Sie eine Konvention ausführbar: Prüfen Sie ein privates TypeScript-Member, sehen Sie sich die Diagnosemeldungen an und lassen Sie ESLint es in ein privates JavaScript-Feld umwandeln. Diese Übung verwendet eine frameworkunabhängige Regel und lässt sich daher ohne Angular- oder Ionic-Anwendung ausprobieren.

## 1. Ein kleines Lint-Projekt erstellen

Verwenden Sie Node.js 24 und npm. Diese isolierte Übung verwendet ESLint 10. Prüfen Sie vor Änderungen an einer bestehenden Anwendung die [Anforderungen](../README.md).

```sh
mkdir eslint-rules-demo
cd eslint-rules-demo
npm init -y
npm pkg set type=module
npm install --save-dev @rdlabo/eslint-plugin-rules@22.1.0 eslint@10 typescript@6 typescript-eslint@8
```

Speichern Sie dies als `eslint.config.mjs`. Diese reine Syntaxregel benötigt weder ein TypeScript-Projekt noch typgestütztes Linting:

```js
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

export default tseslint.config({
  files: ['**/*.ts'],
  languageOptions: { parser: tseslint.parser },
  plugins: { '@rdlabo/rules': rdlabo },
  rules: { '@rdlabo/rules/deny-soft-private-modifier': 'error' },
});
```

## 2. Die Regel in Aktion sehen

Speichern Sie dies als `demo.ts`:

```ts
class Counter {
  private value = 0;

  increment() {
    return ++this.value;
  }
}

console.log(new Counter().increment());
```

```sh
npx eslint demo.ts
```

Zu erwarten sind ein Exit-Status ungleich null und zwei Diagnosemeldungen `@rdlabo/rules/deny-soft-private-modifier`: eine für die Deklaration und eine für den Member-Zugriff.

## 3. Die Korrektur anwenden und prüfen

```sh
npx eslint demo.ts --fix
npx eslint demo.ts
```

Der zweite Befehl sollte erfolgreich sein. Prüfen Sie `demo.ts`. Deklaration und Zugriff sollten nun ein privates JavaScript-Feld verwenden:

```ts
class Counter {
  #value = 0;

  increment() {
    return ++this.#value;
  }
}

console.log(new Counter().increment());
```

Dies demonstriert eine einzelne Regel, kein vollständiges Projekt-Preset. Nicht jede Regel besitzt eine automatische Korrektur. Prüfen Sie automatische Änderungen vor dem Committen.

## 4. Das passende Preset übernehmen

| Projektanforderung                           | Einstiegspunkt und Preset                        |
| -------------------------------------- | --------------------------------------------- |
| Angular-/Ionic-Komponenten und Templates | Paketwurzelpfad, `recommended`                   |
| Fehlergrenzen in Workers               | `/typescript`, `workers/recommended`          |
| Prüfungen auf Zeitzonenregressionen             | `/typescript`, `workers-timezone/recommended` |

Die beiden Workers-Presets müssen unabhängig aktiviert werden. Beginnen Sie für Zeitzonen mit [der gemeinsamen Bibliotheks- und Lint-Übung](https://docs.rdlabo.dev/projects/workers-timezone/docs/quickstart). Das Plugin meldet Codemuster; es implementiert keine Laufzeitkonvertierungen und ersetzt keine Anwendungstests.

Öffnen Sie [Konfiguration](./configuration.md) für die Angular-/Ionic- oder Workers-Einrichtung. Erhalten Sie beim Verteilen des Angular-Presets die TypeScript- und HTML-Selektoren und aktivieren Sie typgestütztes Linting für Regeln, die Typen prüfen. Führen Sie den Lint-Befehl Ihres Projekts in CI aus und nehmen Sie ihn in die Anweisungen für Mitwirkende und KI-Codeagenten auf.

Verwenden Sie den [Regelkatalog](./rules.md), um jeweils eine Richtlinie hinzuzufügen. Prüfen Sie [Migration](./migration.md), bevor Sie in einer bestehenden Anwendung ein neueres empfohlenes Preset aktivieren.
