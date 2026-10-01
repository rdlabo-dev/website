---
title: "Erste Schritte"
sourceRevision: "3e9bc955d3157e9d292e2679edaa72d1b438a6d6d1ff5b0523be180c5f3f5775"
---
# @rdlabo/ionic-angular-collect-icons

<!-- rdlabo-docs-omit -->

[![npm-Version](https://badge.fury.io/js/@rdlabo%2Fionic-angular-collect-icons.svg)](https://badge.fury.io/js/@rdlabo%2Fionic-angular-collect-icons)
[![Lizenz: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<!-- /rdlabo-docs-omit -->

Sammelt `ion-icon`-Namen aus Templates und erzeugt eine `addIcons`-Registrierung für die Produktion. In der Entwicklung können alle Symbole registriert werden; Produktions-Builds enthalten nur die in Templates gefundenen Symbole.

Dieses Projekt basiert auf [ionic-team/ionic-angular-standalone-codemods](https://github.com/ionic-team/ionic-angular-standalone-codemods).

## Unterstützte Versionen

- Node.js >= 22
- Ionic Angular >= 9.0.0
- Angular >= 18.0.0
- TypeScript >= 5.4.0
- ionicons >= 8.0.0
- @angular-eslint/template-parser 21 oder 22

## Installation

```bash
npm install --save-dev \
  @rdlabo/ionic-angular-collect-icons \
  @angular-eslint/template-parser@^21
```

Verwenden Sie stattdessen `@angular-eslint/template-parser@^22`, wenn das nutzende Projekt Angular ESLint 22 verwendet. Der Parser ist eine Peer-Abhängigkeit, damit der Collector dieselbe Hauptversion des Angular-Template-Parsers wie das nutzende Projekt verwendet.

## Initialisierung

Verdrahten Sie `addIcons` und erzeugen Sie `src/use-icons.ts`:

```bash
npx @rdlabo/ionic-angular-collect-icons --initialize true
```

Prüfen Sie, dass `src/use-icons.ts` vorhanden ist und `main.ts` oder `app.config.ts` Produktionssymbole aus dieser Datei sowie Entwicklungssymbole aus `ionicons/icons` registriert. Die manuelle Einrichtung beschreibt [Initialisierung](/docs/initialize).

## Den Build prüfen

1. Fügen Sie einem Template ein statisches Symbol hinzu, zum Beispiel `<ion-icon name="home"></ion-icon>`.
2. Führen Sie `npx @rdlabo/ionic-angular-collect-icons` aus und prüfen Sie, dass der passende Export in `src/use-icons.ts` erscheint.
3. Führen Sie `npm run build` aus.

Automatisieren Sie den Collector wie unter [Verwendung](/docs/usage) gezeigt mit `prebuild`. Dynamische `[name]`-Bindungen werden nicht gesammelt. Registrieren Sie diese Symbole manuell ([FAQ](/docs/faq)).

## Dokumentation

- [Initialisierung](/docs/initialize) — automatische oder manuelle Verdrahtung von `addIcons`.
- [Verwendung](/docs/usage) — den Collector vor Produktions-Builds ausführen.
- [CLI-Optionen](/docs/options) — `--dry-run`, `--initialize`, Pfade.
- [FAQ](/docs/faq) — Tests, Bindungen und `main.ts`.
- [Migration](/docs/migration) — Prüfungen für bestehende Anwendungen beim Wechsel von Ionic Angular 8 auf 9.

<!-- rdlabo-docs-omit -->

**Vollständige Dokumentation:** [https://docs.rdlabo.dev/projects/ionic-angular-collect-icons](https://docs.rdlabo.dev/projects/ionic-angular-collect-icons)

## Maintainer

- [rdlabo](https://rdlabo.dev/)

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](./LICENSE).

<!-- /rdlabo-docs-omit -->
