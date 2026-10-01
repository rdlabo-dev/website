---
title: "Erste Schritte"
sourceRevision: "5db1ec860d9abfb95cac70d42596928a725515dd0b1c36d183444b8b4db3fa97"
---
# @rdlabo/eslint-plugin-rules

<!-- rdlabo-docs-omit -->

[![npm-Version](https://badge.fury.io/js/%40rdlabo%2Feslint-plugin-rules.svg)](https://badge.fury.io/js/%40rdlabo%2Feslint-plugin-rules)
[![Lizenz: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- /rdlabo-docs-omit -->

Gemeinsame Codekonventionen für Angular- und Ionic-Anwendungen mit frameworkunabhängigen TypeScript-Presets für Cloudflare Workers. Erkennen Sie inkonsistente Komponentengrenzen, Template-Verwendung und implizite Zeitzonenoperationen beim Linting, bevor sie die Codeprüfung erreichen.

[Lint-Erkennung und automatische Korrektur ausprobieren](./docs/quickstart.md), in einem kleinen TypeScript-Projekt ohne Installation von Angular oder Ionic.

## Installation

Installieren Sie das Plugin als Entwicklungsabhängigkeit in einem ESLint-Projekt:

```sh
npm install --save-dev @rdlabo/eslint-plugin-rules
```

Installieren Sie für Angular- und Ionic-Regeln auch die unten aufgeführten entsprechenden Framework-Peer-Abhängigkeiten. Die vollständige Einrichtung beschreibt [Konfiguration](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration).

## Voraussetzungen

| Paket                           | Unterstützte Version             |
| --------------------------------- | ----------------------------- |
| Node.js                           | ab 20                   |
| ESLint                            | ab 9                    |
| `@typescript-eslint/utils`        | ab 8.33, vor 9       |
| `@angular-eslint/template-parser` | 21.x oder 22.x                  |
| `@ionic/angular`                  | 9.x bei Verwendung von Ionic-Regeln |
| `@ionic/core`                     | 9.x bei Verwendung von Ionic-Regeln |

## Einen Einstiegspunkt wählen

| Voreinstellung                         | Einstiegspunkt                              | Zweck                                                |
| ------------------------------ | ---------------------------------------- | ------------------------------------------------------ |
| `recommended`                  | `@rdlabo/eslint-plugin-rules`            | Angular- und Ionic-Konventionen für TypeScript und HTML  |
| `workers/recommended`          | `@rdlabo/eslint-plugin-rules/typescript` | Ausdrücklich aktivierbare Workers-Richtlinie für `try/catch`                      |
| `workers-timezone/recommended` | `@rdlabo/eslint-plugin-rules/typescript` | Ausdrücklich aktivierbare ergänzende Richtlinie für `@rdlabo/workers-timezone` |

Das Angular-Preset `recommended` wird mit dem Paketwurzelpfad ausgeliefert. Die beiden Workers-Presets auf `/typescript` müssen unabhängig aktiviert werden; keines enthält das andere. Kombinieren Sie für Zeitzonenkonvertierungen und -prüfungen mit [`@rdlabo/workers-timezone`](https://docs.rdlabo.dev/projects/workers-timezone/docs/readme). Flat-Config-Selektoren und Ionic-Listenstruktur beschreibt [Konfiguration](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration).

## Dokumentation

- [Konfiguration](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration) — eine Einrichtung für Angular/Ionic, TypeScript oder Workers übernehmen.
- [Regeln](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules) — Preset-Abdeckung, Optionen und Beispiele vergleichen.
- [Migrationsanleitung](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/migration) — eine bestehende Installation aktualisieren.

<!-- rdlabo-docs-omit -->

**Vollständige Dokumentation:** [https://docs.rdlabo.dev/projects/eslint-plugin-rules](https://docs.rdlabo.dev/projects/eslint-plugin-rules)

## Dieses Projekt unterstützen

Gefällt Ihnen dieses Projekt? Ihre Unterstützung hält es am Leben und ermöglicht sein Wachstum. Mit Sponsoring tragen Sie direkt zu neuen Funktionen, Verbesserungen und Wartung bei.

[Sponsor werden](https://github.com/sponsors/rdlabo)

## Kanäle für Vorabversionen

Ein offener Pull Request, der kein Entwurf ist, kann unter dem npm-Dist-Tag `beta` veröffentlicht werden, nachdem seine Workflows `CI` und `Package Candidate` erfolgreich waren. Ein Repository-Eigentümer oder Maintainer muss einen Kommentar hinzufügen, dessen vollständiger Inhalt lautet:

```text
/beta
```

Die Anforderung autorisiert ausschließlich den Head-SHA des Pull Requests zum Zeitpunkt des Kommentars. Der Workflow prüft Eigentümer- oder Maintainer-Berechtigung und Head-SHA unmittelbar vor der Veröffentlichung erneut. Jeder neue Commit benötigt erneut erfolgreiche CI und einen neuen `/beta`-Kommentar eines Eigentümers oder Maintainers. Fork-Pull-Requests werden unterstützt. Pull Requests, die einen Workflow zur Freigabe von Veröffentlichungen ändern, können erst als Beta veröffentlicht werden, nachdem diese Änderungen in `main` angekommen sind.

Beta-Versionen verwenden `<base>-beta.pr<PR number>.sha<12-character SHA>`. Der Kandidat wird in einem schreibgeschützten Workflow ohne npm-Veröffentlichungszugangsdaten gebaut. Der privilegierte Release-Workflow veröffentlicht nur das validierte unveränderliche Paketartefakt mit deaktivierten Lebenszyklusskripten. Ein Benachrichtigungsfehler kann eine erfolgreiche npm-Veröffentlichung nicht ungültig machen.

Wird ein Pull Request in `main` gemergt, wird er erst dann automatisch unter `beta` veröffentlicht, wenn die erforderliche CI und `Package Candidate` für genau diesen Merge-Commit erfolgreich sind. Direkte Pushes auf `main` veröffentlichen keinen Kandidaten.

Nur `npm run release` erstellt ein Release-Tag. Stabile Tags `vX.Y.Z` werden unter npm `latest` veröffentlicht; Revisions-/Vorabversions-Tags unter `next`. Weder die Veröffentlichung unter `beta` noch unter `next` verändert den npm-Dist-Tag `latest`.

## Maintainer

- [rdlabo](https://rdlabo.dev/)

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Einzelheiten finden Sie in der Datei [LICENSE](./LICENSE).
<!-- /rdlabo-docs-omit -->
