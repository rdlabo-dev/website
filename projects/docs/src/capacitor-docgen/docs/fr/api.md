---
title: "API"
sourceRevision: "6063db1ed6b0df4e9594e0e60256d68159f3cda86556319e28461ba0c9adee8b"
---
Référence de l’API publique utilisable dans le code, exportée par `@rdlabo/capacitor-docgen` v0.4.1.

## Génération

#### `function` generate

`(opts: DocsGenerateOptions) => Promise<DocsGenerateResults>`

Analyse un projet TypeScript ou des fichiers d’entrée et écrit, si demandé, les sorties README et JSON.

#### `function` parse

`(opts: DocsParseOptions) => (api: string) => DocsData`

Crée une fonction de recherche dans les résultats d’analyse pour une API de plugin nommée.

## Sortie

#### `function` outputReadme

`(readmeFilePath: string, data: DocsData) => Promise<void>`

Met à jour les espaces réservés docgen dans un fichier README.

#### `function` outputJson

`(jsonFilePath: string, data: DocsData) => Promise<void>`

Écrit le modèle de documentation analysé au format JSON.

#### `function` replaceMarkdownPlaceholders

`(content: string, data: DocsData) => string`

Renvoie le Markdown avec le contenu de `<docgen-index>` et `<docgen-api>` remplacé.

## CLI

#### `function` run

`(config: { cwd: string; args: string[] }) => Promise<void>`

Exécute la commande docgen avec un répertoire de travail et une liste d’arguments explicites.

## Options

#### `interface` DocsParseOptions

| Propriété               | Type       | Description                             |
| ------------------ | ---------- | --------------------------------------- |
| **`tsconfigPath`** | `string`   | Chemin facultatif vers la configuration TypeScript. |
| **`inputFiles`**   | `string[]` | Liste explicite de fichiers source, facultative.         |

#### `interface` DocsGenerateOptions

| Propriété                   | Type       | Description                             |
| ---------------------- | ---------- | --------------------------------------- |
| **`api`**              | `string`   | Nom de l’interface principale du plugin.          |
| **`tsconfigPath`**     | `string`   | Chemin facultatif vers la configuration TypeScript. |
| **`inputFiles`**       | `string[]` | Liste explicite de fichiers source, facultative.         |
| **`outputJsonPath`**   | `string`   | Chemin de sortie JSON facultatif.              |
| **`outputReadmePath`** | `string`   | Chemin de sortie README facultatif.            |

#### `interface` DocsGenerateResults

Étend `DocsGenerateOptions` avec le résultat d’analyse `data: DocsData`.

## Modèle de documentation

#### `interface` DocsData

| Propriété                | Type                    | Description                                |
| ------------------- | ----------------------- | ------------------------------------------ |
| **`api`**           | `DocsInterface \| null` | API principale du plugin.                        |
| **`interfaces`**    | `DocsInterface[]`       | Interfaces analysées.                         |
| **`typeAliases`**   | `DocsTypeAlias[]`       | Alias de type analysés.                       |
| **`enums`**         | `DocsEnum[]`            | Énumérations analysées.                              |
| **`pluginConfigs`** | `DocsConfigInterface[]` | Interfaces de configuration Capacitor analysées. |
