---
title: "Options de la CLI"
sourceRevision: "0c0e667cecb8e0467b291af34c978f30c68aa4b4087ef9de80a100788cb54a13"
---
Options de `npx @rdlabo/ionic-angular-collect-icons`. Le tableau synthétique se trouve sur la page [CLI API](https://docs.rdlabo.dev/projects/ionic-angular-collect-icons/docs/api).

### --dry-run [boolean]

Pour voir les modifications prévues sans les écrire dans les fichiers, définissez `true`. La valeur par défaut est `false`.

```bash
npx @rdlabo/ionic-angular-collect-icons --dry-run true
```

### --interactive [boolean]

Pour définir toutes les options de la CLI à l’aide d’invites interactives, définissez `true`. Cette option permet également d’inspecter uniquement les résultats d’une simulation.
La valeur par défaut est `false`.

```bash
npx @rdlabo/ionic-angular-collect-icons --interactive true
```

### --initialize [boolean]

Pour initialiser automatiquement l’enregistrement des icônes, utilisez l’option `--initialize`. La valeur par défaut est `false`. La CLI ajoute les lignes suivantes :

```diff
+ import { initializeIonicons } from '@rdlabo/ionic-angular-collect-icons/runtime';
+ import * as useIcons from './use-icons';

  if (environment.production) {
    enableProdMode();
  }

+  void initializeIonicons(useIcons);
```

La CLI ajoute ces lignes au fichier contenant `enableProdMode()`. Vous pouvez bien sûr aussi effectuer la configuration manuellement.

`--initialize` est nécessaire uniquement pour ajouter l’initialiseur à un projet qui n’en possède pas. La migration d’un initialiseur existant nécessite une confirmation distincte.

Elle supprime également les autres appels `addIcons` des constructeurs de classes.

```diff
  @Component(/* ... */)
  export class ExampleComponent {
    constructor() {
-     addIcons(useIcons);
    }
  }
```

```bash
npx @rdlabo/ionic-angular-collect-icons --initialize true
```

### --migrate [boolean]

Dans un terminal interactif, le collecteur demande confirmation avant d’appliquer chaque
migration de code source reconnue. **Yes** (Oui) est sélectionné par défaut ; **No** (Non) laisse
la cible de cette migration inchangée.

Utilisez cette option pour répondre explicitement, par exemple en CI ou dans un autre
environnement non interactif :

```bash
npx @rdlabo/ionic-angular-collect-icons --migrate true
```

Prévisualisez les différences générées sans écrire de fichiers :

```bash
npx @rdlabo/ionic-angular-collect-icons --migrate true --dry-run true
```

Par défaut, cette option n’est pas définie afin qu’une exécution interactive puisse demander confirmation.

### --project-path [string]

Pour préciser le chemin du projet, utilisez l’option `--project-path`. La valeur par défaut est le répertoire courant.

```bash
npx @rdlabo/ionic-angular-collect-icons --project-path /path/to/project
```

Les fichiers ciblés se trouvent dans le répertoire `src` du chemin indiqué.

- path/to/project + `src/**/*.ts`
- path/to/project + `src/**/*.html`

### --icon-path [string]

Par défaut, le fichier créé est `src/use-icons.ts` dans path/to/project. Pour choisir son nom, utilisez l’option `--icon-path`.

```bash
npx @rdlabo/ionic-angular-collect-icons  --icon-path src/other-use-icons.ts
```
