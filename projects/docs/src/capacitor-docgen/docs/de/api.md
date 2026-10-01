---
title: "API"
sourceRevision: "6063db1ed6b0df4e9594e0e60256d68159f3cda86556319e28461ba0c9adee8b"
---
Referenz der öffentlichen programmatischen API, die `@rdlabo/capacitor-docgen` v0.4.1 exportiert.

## Generierung

#### `function` generate

`(opts: DocsGenerateOptions) => Promise<DocsGenerateResults>`

Analysiert ein TypeScript-Projekt oder Eingabedateien und schreibt optional README- und JSON-Ausgaben.

#### `function` parse

`(opts: DocsParseOptions) => (api: string) => DocsData`

Erstellt eine Nachschlagefunktion für Parserergebnisse einer benannten Plugin-API.

## Ausgabe

#### `function` outputReadme

`(readmeFilePath: string, data: DocsData) => Promise<void>`

Aktualisiert die docgen-Platzhalter in einer README-Datei.

#### `function` outputJson

`(jsonFilePath: string, data: DocsData) => Promise<void>`

Schreibt das eingelesene Dokumentationsmodell als JSON.

#### `function` replaceMarkdownPlaceholders

`(content: string, data: DocsData) => string`

Gibt Markdown zurück, in dem die Inhalte von `<docgen-index>` und `<docgen-api>` ersetzt wurden.

## CLI

#### `function` run

`(config: { cwd: string; args: string[] }) => Promise<void>`

Führt den docgen-Befehl mit ausdrücklich angegebenem Arbeitsverzeichnis und einer Argumentliste aus.

## Optionen

#### `interface` DocsParseOptions

| Eigenschaft               | Typ       | Beschreibung                             |
| ------------------ | ---------- | --------------------------------------- |
| **`tsconfigPath`** | `string`   | Optionaler Pfad zur TypeScript-Konfiguration. |
| **`inputFiles`**   | `string[]` | Optionale, ausdrücklich angegebene Quelldateien.         |

#### `interface` DocsGenerateOptions

| Eigenschaft                   | Typ       | Beschreibung                             |
| ---------------------- | ---------- | --------------------------------------- |
| **`api`**              | `string`   | Name der primären Plugin-Schnittstelle.          |
| **`tsconfigPath`**     | `string`   | Optionaler Pfad zur TypeScript-Konfiguration. |
| **`inputFiles`**       | `string[]` | Optionale, ausdrücklich angegebene Quelldateien.         |
| **`outputJsonPath`**   | `string`   | Optionaler JSON-Ausgabepfad.              |
| **`outputReadmePath`** | `string`   | Optionaler README-Ausgabepfad.            |

#### `interface` DocsGenerateResults

Erweitert `DocsGenerateOptions` um das Parserergebnis `data: DocsData`.

## Dokumentationsmodell

#### `interface` DocsData

| Eigenschaft                | Typ                    | Beschreibung                                |
| ------------------- | ----------------------- | ------------------------------------------ |
| **`api`**           | `DocsInterface \| null` | Primäre Plugin-API.                        |
| **`interfaces`**    | `DocsInterface[]`       | Eingelesene Schnittstellen.                         |
| **`typeAliases`**   | `DocsTypeAlias[]`       | Eingelesene Typaliase.                       |
| **`enums`**         | `DocsEnum[]`            | Eingelesene Enumerationen.                              |
| **`pluginConfigs`** | `DocsConfigInterface[]` | Eingelesene Capacitor-Konfigurationsschnittstellen. |
