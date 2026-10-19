---
title: "Initialisation"
sourceRevision: "37ba1da1d28d1ac57abe2bf5a8227ee2f8f3b80eae8af0f65cd11f35881481fc"
---
Configurez `addIcons` après l’[installation](/docs/readme#installation). Consultez également [Utilisation](./usage.md).

Les environnements de build doivent installer les dépendances de développement : le code généré importe le runtime de ce package, qui est intégré au bundle de l’application.

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
+ import { initializeIonicons } from '@rdlabo/ionic-angular-collect-icons/runtime';
+ import * as useIcons from './use-icons';

  if (environment.production) {
    enableProdMode();
  }

+  void initializeIonicons(useIcons);
```

`initializeIonicons` enregistre les icônes collectées de manière synchrone. La fonction
`isDevMode()` d’Angular active ensuite le catalogue complet depuis un bundle isolé chargé à la demande
en développement. En production, l’application démarre sans télécharger ce bundle de catalogue.

Lorsqu’une exécution interactive du collecteur détecte l’initialiseur ternaire généré par
les anciennes versions, elle demande s’il faut le migrer. La réponse par défaut est **Yes** (Oui).
Choisir **No** (Non) laisse l’initialiseur inchangé. Les appels personnalisés existants à
`addIcons(...)` restent également inchangés. Consultez la
[migration](./migration.md#upgrade-the-icon-initializer) pour les détails de prévisualisation,
d’exécution non interactive et de reconnaissance de l’initialiseur.

#### 3. Supprimer les autres appels `addIcons` des constructeurs de classes

```diff
  @Component(/* ... */)
  export class ExampleComponent {
    constructor() {
-     addIcons(useIcons);
    }
  }
```
