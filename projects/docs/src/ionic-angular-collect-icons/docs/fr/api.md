---
title: "CLI API"
sourceRevision: "ac6612cb51c6aaa89ce55ae8d992a9c60f808d72720db50cfa7a6572695bf3f5"
---
Référence de commande pour `@rdlabo/ionic-angular-collect-icons` v3.0.0.

## Commande

#### `command` npx @rdlabo/ionic-angular-collect-icons

Analyse les sources et templates Angular, puis écrit les Ionicons utilisés par l’application dans `src/use-icons.ts` par défaut.

| Option               | Type      | Description                                                                   | Valeur par défaut            |
| -------------------- | --------- | ----------------------------------------------------------------------------- | ------------------ |
| **`--dry-run`**      | `boolean` | Signale les modifications sans écrire de fichiers.                                        | `false`            |
| **`--interactive`**  | `boolean` | Recueille toutes les options au moyen d’invites et permet d’inspecter les résultats.           | `false`            |
| **`--initialize`**   | `boolean` | Ajoute l’initialisation `addIcons` et supprime les enregistrements dans les composants. | `false`            |
| **`--project-path`** | `string`  | Répertoire du projet dont l’arborescence `src` est analysée.                                | Répertoire courant  |
| **`--icon-path`**    | `string`  | Fichier d’enregistrement d’icônes généré.                                             | `src/use-icons.ts` |
