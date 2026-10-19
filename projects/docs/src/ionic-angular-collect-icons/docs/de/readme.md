---
title: "Erste Schritte"
sourceRevision: "50ecc78db9ea57048dcd53380996c570c16e4669f4fc6fe7f88a801d11ffda81"
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

## Vorabversionskanäle

Ein offener Pull Request, der kein Entwurf ist, kann unter dem npm-Dist-Tag `beta` veröffentlicht werden, nachdem seine Workflows `CI`, `Lint` und `Package Candidate` erfolgreich abgeschlossen wurden. Ein Repository-Eigentümer oder Maintainer muss einen Kommentar hinzufügen, dessen vollständiger Inhalt wie folgt lautet:

```text
/beta
```

Die Anfrage autorisiert nur den Head-SHA des Pull Requests zum Zeitpunkt des Kommentars. Unmittelbar vor der Veröffentlichung prüft der Workflow die Berechtigung des Eigentümers oder Maintainers sowie den Head-SHA erneut. Jeder neue Commit erfordert erneut erfolgreiche CI-Prüfungen und einen neuen `/beta`-Kommentar eines Eigentümers oder Maintainers. Pull Requests aus Forks werden unterstützt. Pull Requests, die einen Workflow zur Freigabe von Veröffentlichungen ändern, können erst als Beta veröffentlicht werden, wenn diese Workflow-Änderungen in `main` übernommen wurden.

Beta-Versionen verwenden `<base>-beta.pr<PR number>.sha<12-character SHA>`. Der Kandidat wird in einem schreibgeschützten Workflow ohne npm-Zugangsdaten für Veröffentlichungen gebaut. Der privilegierte Release-Workflow veröffentlicht ausschließlich das validierte unveränderliche Paketartefakt mit deaktivierten Lebenszyklus-Skripten. Ein Benachrichtigungsfehler kann eine erfolgreiche npm-Veröffentlichung nicht ungültig machen.

Wird ein Pull Request in `main` zusammengeführt, erfolgt die automatische Veröffentlichung unter `beta` erst, nachdem die erforderliche CI und `Package Candidate` für genau diesen Merge-Commit erfolgreich abgeschlossen wurden. Direkte Pushes auf `main` veröffentlichen keinen Kandidaten.

Nur `npm run release` erstellt ein Release-Tag. Stabile `vX.Y.Z`-Tags werden auf npm unter `latest` veröffentlicht; Revisions- und Vorabversions-Tags unter `next`. Weder Veröffentlichungen unter `beta` noch unter `next` ändern das npm-Dist-Tag `latest`.

## Maintainer

- [rdlabo](https://rdlabo.dev/)

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](./LICENSE).

<!-- /rdlabo-docs-omit -->
