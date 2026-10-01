---
title: "Initialisation"
sourceRevision: "dd7527b567ce8a676662743a9f557b4d4a9b2116134e2cb107e4a21c4d684b4c"
---
Configurez `addIcons` après l’[installation](../README.md#installation). Consultez également [Utilisation](./usage.md).

### Configuration automatique

```bash
npx @rdlabo/ionic-angular-collect-icons --initialize true
```

Vous devez obtenir `src/use-icons.ts` et un enregistrement `addIcons` dans `main.ts` / `app.config.ts`.

### Configuration manuelle

#### 1. Exécuter la CLI

```bash
npx @rdlabo/ionic-angular-collect-icons
```

Cela génère `src/use-icons.ts`.

#### 2. Importer le fichier généré dans `main.ts` ou `app.config.ts` :

```diff
+ import { addIcons } from 'ionicons';
+ import * as allIcons from 'ionicons/icons';
+ import * as useIcons from './use-icons';

  if (environment.production) {
    enableProdMode();
  }

+  addIcons(environment.production ? useIcons : allIcons);
```

#### 3. Supprimer les autres appels `addIcons` des constructeurs de classes

```diff
  @Component(/* ... */)
  export class ExampleComponent {
    constructor() {
-     addIcons(useIcons);
    }
  }
```
