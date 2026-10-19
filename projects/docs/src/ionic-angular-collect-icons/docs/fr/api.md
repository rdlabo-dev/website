---
title: "CLI API"
sourceRevision: "c17cbbf13f8fa5a84be602a7bcd8bc69cbf8b31420f41a8124ba8482e0eb1d15"
---
Référence de commande pour `@rdlabo/ionic-angular-collect-icons` v3.0.2.

## Commande

#### `command` npx @rdlabo/ionic-angular-collect-icons

Analyse les sources et templates Angular, puis écrit les Ionicons utilisés par l’application dans `src/use-icons.ts` par défaut.

| Option               | Type      | Description                                                                   | Valeur par défaut            |
| -------------------- | --------- | ----------------------------------------------------------------------------- | ------------------ |
| **`--dry-run`**      | `boolean` | Signale les modifications sans écrire de fichiers.                                        | `false`            |
| **`--interactive`**  | `boolean` | Recueille toutes les options au moyen d’invites et permet d’inspecter les résultats.           | `false`            |
| **`--initialize`**   | `boolean` | Ajoute l’initialisation `initializeIonicons` et supprime les enregistrements dans les composants. | `false`            |
| **`--migrate`** | `boolean` | Accepte ou refuse explicitement les migrations de code source reconnues ; demande confirmation dans un terminal interactif si l’option n’est pas définie. | Non définie |
| **`--project-path`** | `string`  | Répertoire du projet dont l’arborescence `src` est analysée.                                | Répertoire courant  |
| **`--icon-path`**    | `string`  | Fichier d’enregistrement d’icônes généré.                                             | `src/use-icons.ts` |
