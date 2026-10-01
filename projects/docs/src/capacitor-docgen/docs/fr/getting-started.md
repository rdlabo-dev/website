---
title: "Premiers pas"
sourceRevision: "4c7e4b85ed47b18b4f44ba797b12c033c3350b58e52e000b9b0575a0660d9973"
---
# @rdlabo/capacitor-docgen

Générez une documentation de plugin Capacitor qui inclut les membres hérités via `extends` en TypeScript. Ce fork de [`@capacitor/docgen`](https://github.com/ionic-team/capacitor-docgen) d’Ionic est maintenu de manière indépendante.

## Essayer dans un petit projet de test

```sh
mkdir docgen-demo
cd docgen-demo
npm init -y
npm install --save-dev @rdlabo/capacitor-docgen@0.4.1
```

N’installez pas le package d’origine `@capacitor/docgen` dans le même projet ; les deux packages fournissent l’exécutable `docgen`.

Créez `src/definitions.ts` :

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

Créez `tsconfig.json` :

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

Créez `README.md` avec les espaces réservés que docgen met à jour :

```md
<docgen-index></docgen-index>

<docgen-api></docgen-api>
```

Exécutez :

```sh
npx docgen --project tsconfig.json --api MyPlugin --output-readme README.md --output-json dist/docs.json
```

La documentation générée pour `CreateOptions` inclut à la fois `value` et `requestId`. Modifiez les interfaces TypeScript ou les commentaires JSDoc pour changer le contenu généré ; le texte en dehors des marqueurs est conservé. Après les modifications, relancez la même commande.

Pour intégrer l’outil au processus d’un plugin existant, vous pouvez ajouter un script à `package.json`, par exemple `"docgen": "docgen --api MyPlugin --output-readme README.md"`. Ce script est facultatif pour ce projet de test.

## Documentation

- [Différences avec le projet d’origine](https://docs.rdlabo.dev/projects/capacitor-docgen/docs/upstream-differences)

<!-- rdlabo-docs-omit -->
**Documentation complète :** [https://docs.rdlabo.dev/projects/capacitor-docgen](https://docs.rdlabo.dev/projects/capacitor-docgen)

## CLI

Le moyen le plus simple d’exécuter `docgen` consiste à installer `@rdlabo/capacitor-docgen` comme dépendance de développement et à ajouter la commande aux scripts de `package.json`. Dans l’exemple ci-dessous, `HapticsPlugin` est l’interface principale :

```bash
docgen --api HapticsPlugin --output-readme README.md
```

| Option              | Alias | Description                                                                              |
|-------------------|-------|------------------------------------------------------------------------------------------|
| `--api`           | `-a`  | Nom de l’interface de programmation principale. **Obligatoire**                  |
| `--output-readme` | `-r`  | Chemin du fichier Markdown à mettre à jour. Ce fichier doit déjà exister. **Obligatoire** |
| `--output-json`   | `-j`  | Chemin où écrire les données brutes de documentation au format JSON.                                          |
| `--project`       | `-p`  | Chemin du fichier `tsconfig.json` du projet, comme l’option [project](https://www.typescriptlang.org/docs/handbook/compiler-options.html) de la CLI TypeScript. Par défaut, l’outil tente de trouver ce fichier. |


#### Script package.json

```json
{
  "scripts": {
    "docgen": "docgen --api HapticsPlugin --output-readme README.md"
  }
}
```

## API

L’API accessible depuis la CLI peut aussi être importée depuis `@rdlabo/capacitor-docgen`.


## Ressources connexes

- [Capacitor](https://capacitorjs.com/)
- [Capacitor Community Plugins](https://github.com/capacitor-community)
<!-- /rdlabo-docs-omit -->

<!-- rdlabo-docs-omit -->
## Canaux de préversion

Une pull request ouverte qui n’est pas en brouillon peut être publiée sous le dist-tag npm `beta` une fois les workflows `Validation` et `Package Candidate` réussis. Un propriétaire ou mainteneur du dépôt doit ajouter un commentaire dont le corps complet est :

```text
/beta
```

Cette demande n’autorise que le SHA de tête de la pull request qui existait au moment de l’ajout du commentaire. Le workflow revérifie les permissions du propriétaire ou mainteneur ainsi que le SHA de tête immédiatement avant la publication. Tout nouveau commit nécessite une nouvelle réussite de la CI et un nouveau commentaire `/beta` d’un propriétaire ou mainteneur. Les pull requests provenant de forks sont prises en charge. Celles qui modifient un workflow contrôlant les publications ne peuvent pas être publiées en bêta tant que ces modifications de workflow n’ont pas été intégrées à `main`.

Les versions bêta utilisent le format `<base>-beta.pr<PR number>.sha<12-character SHA>`. Le candidat est construit dans un workflow en lecture seule, sans identifiants de publication npm. Le workflow de publication privilégié ne publie que l’artefact de package immuable validé, avec les scripts de cycle de vie désactivés. Un échec de notification n’invalide pas une publication npm réussie.

Lorsqu’une pull request est fusionnée dans `main`, elle est automatiquement publiée sous `beta` uniquement après la réussite de la CI requise et de `Package Candidate` pour ce commit de fusion précis. Les pushes directs vers `main` ne publient pas de candidat.

Seul `npm run release` crée un tag de version. Les tags stables `vX.Y.Z` sont publiés sous `latest` sur npm ; les tags de révision ou de préversion sont publiés sous `next`. La publication sous `beta` ou `next` ne modifie jamais le dist-tag npm `latest`.

## Mainteneurs

- [rdlabo](https://rdlabo.dev/)
<!-- /rdlabo-docs-omit -->
