---
title: "Options de la CLI"
sourceRevision: "906beb87d88e6f08bb73b97c8c674114348e12cb8d2ba64fec4eb200a176cc35"
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

Pour initialiser `addIcons` automatiquement, utilisez l’option `--initialize`. La valeur par défaut est `false`. La CLI ajoute les lignes suivantes :

```diff
+ import { addIcons } from 'ionicons';
+ import * as allIcons from 'ionicons/icons';
+ import * as useIcons from './use-icons';

  if (environment.production) {
    enableProdMode();
  }

+  addIcons(environment.production ? useIcons : allIcons);
```

La CLI ajoute ces lignes au fichier contenant `enableProdMode()`. Vous pouvez bien sûr aussi effectuer la configuration manuellement.

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
