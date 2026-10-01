---
title: "Erste Schritte"
sourceRevision: "4c7e4b85ed47b18b4f44ba797b12c033c3350b58e52e000b9b0575a0660d9973"
---
# @rdlabo/capacitor-docgen

Erstellen Sie eine Capacitor-Plugin-Dokumentation, die über TypeScript-`extends` geerbte Member enthält. Dieser Fork von Ionics [`@capacitor/docgen`](https://github.com/ionic-team/capacitor-docgen) wird unabhängig gepflegt.

## In einem kleinen Testprojekt ausprobieren

```sh
mkdir docgen-demo
cd docgen-demo
npm init -y
npm install --save-dev @rdlabo/capacitor-docgen@0.4.1
```

Installieren Sie das ursprüngliche `@capacitor/docgen` nicht im selben Projekt; beide Pakete stellen die ausführbare Datei `docgen` bereit.

Erstellen Sie `src/definitions.ts`:

```ts
export interface SharedOptions {
  requestId?: string;
}

export interface CreateOptions extends SharedOptions {
  value: string;
}

export interface MyPlugin {
  create(options: CreateOptions): Promise<void>;
}
```

Erstellen Sie `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true
  },
  "files": ["src/definitions.ts"]
}
```

Erstellen Sie `README.md` mit den Platzhaltern, die docgen aktualisiert:

```md
<docgen-index></docgen-index>

<docgen-api></docgen-api>
```

Führen Sie folgenden Befehl aus:

```sh
npx docgen --project tsconfig.json --api MyPlugin --output-readme README.md --output-json dist/docs.json
```

Die generierte Dokumentation für `CreateOptions` enthält sowohl `value` als auch `requestId`. Ändern Sie die TypeScript-Schnittstellen oder JSDoc-Kommentare, um den generierten Inhalt anzupassen; der Text außerhalb der Marker bleibt erhalten. Führen Sie nach Änderungen denselben Befehl erneut aus.

Für den Workflow eines bestehenden Plugins können Sie ein Skript in `package.json` ergänzen, zum Beispiel `"docgen": "docgen --api MyPlugin --output-readme README.md"`. Für dieses Testprojekt ist das optional.

## Dokumentation

- [Unterschiede zum ursprünglichen Projekt](https://docs.rdlabo.dev/projects/capacitor-docgen/docs/upstream-differences)

<!-- rdlabo-docs-omit -->
**Vollständige Dokumentation:** [https://docs.rdlabo.dev/projects/capacitor-docgen](https://docs.rdlabo.dev/projects/capacitor-docgen)

## CLI

Am einfachsten führen Sie `docgen` aus, indem Sie `@rdlabo/capacitor-docgen` als Entwicklungsabhängigkeit installieren und den Befehl zu den Skripten in `package.json` hinzufügen. Im folgenden Beispiel ist `HapticsPlugin` die primäre Schnittstelle:

```bash
docgen --api HapticsPlugin --output-readme README.md
```

| Option              | Alias | Beschreibung                                                                              |
|-------------------|-------|------------------------------------------------------------------------------------------|
| `--api`           | `-a`  | Name der primären Programmierschnittstelle. **Erforderlich**                  |
| `--output-readme` | `-r`  | Pfad zur zu aktualisierenden Markdown-Datei. Die Datei muss bereits vorhanden sein. **Erforderlich** |
| `--output-json`   | `-j`  | Pfad zum Schreiben der unverarbeiteten Dokumentationsdaten als JSON-Datei.                                          |
| `--project`       | `-p`  | Pfad zur `tsconfig.json`-Datei des Projekts, entsprechend der Option [project](https://www.typescriptlang.org/docs/handbook/compiler-options.html) der TypeScript-CLI. Standardmäßig versucht das Werkzeug, diese Datei zu finden. |


#### package.json-Skript

```json
{
  "scripts": {
    "docgen": "docgen --api HapticsPlugin --output-readme README.md"
  }
}
```

## API

Die API, die über die CLI verfügbar ist, kann auch aus `@rdlabo/capacitor-docgen` importiert werden.


## Weitere Ressourcen

- [Capacitor](https://capacitorjs.com/)
- [Capacitor Community Plugins](https://github.com/capacitor-community)
<!-- /rdlabo-docs-omit -->

<!-- rdlabo-docs-omit -->
## Vorabversionskanäle

Ein offener Pull Request, der kein Entwurf ist, kann unter dem npm-Dist-Tag `beta` veröffentlicht werden, nachdem seine Workflows `Validation` und `Package Candidate` erfolgreich abgeschlossen wurden. Ein Repository-Inhaber oder Maintainer muss einen Kommentar hinzufügen, dessen vollständiger Inhalt folgendermaßen lautet:

```text
/beta
```

Die Anfrage autorisiert ausschließlich den Head-SHA des Pull Requests zum Zeitpunkt des Kommentars. Unmittelbar vor der Veröffentlichung prüft der Workflow erneut die Berechtigung des Inhabers oder Maintainers und den Head-SHA. Nach jedem neuen Commit muss die CI erneut erfolgreich sein und ein Inhaber oder Maintainer einen neuen `/beta`-Kommentar hinzufügen. Pull Requests aus Forks werden unterstützt. Pull Requests, die einen Workflow für die Freigabe von Releases ändern, können erst als Beta veröffentlicht werden, nachdem diese Workflow-Änderungen in `main` übernommen wurden.

Beta-Versionen verwenden das Format `<base>-beta.pr<PR number>.sha<12-character SHA>`. Der Kandidat wird in einem Workflow mit ausschließlich lesenden Berechtigungen ohne npm-Veröffentlichungszugangsdaten gebaut. Der privilegierte Release-Workflow veröffentlicht nur das validierte unveränderliche Paketartefakt und deaktiviert dabei Lifecycle-Skripte. Ein Benachrichtigungsfehler kann eine erfolgreiche npm-Veröffentlichung nicht ungültig machen.

Wird ein Pull Request in `main` gemergt, wird er erst dann automatisch unter `beta` veröffentlicht, wenn die erforderliche CI und `Package Candidate` für genau diesen Merge-Commit erfolgreich abgeschlossen wurden. Direkte Pushes nach `main` veröffentlichen keinen Kandidaten.

Nur `npm run release` erstellt einen Release-Tag. Stabile `vX.Y.Z`-Tags werden auf npm unter `latest` veröffentlicht, Revisions- und Vorabversions-Tags unter `next`. Weder Veröffentlichungen unter `beta` noch unter `next` ändern den npm-Dist-Tag `latest`.

## Maintainer

- [rdlabo](https://rdlabo.dev/)
<!-- /rdlabo-docs-omit -->
