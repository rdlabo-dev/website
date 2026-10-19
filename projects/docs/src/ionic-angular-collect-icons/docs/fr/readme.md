---
title: "Premiers pas"
sourceRevision: "50ecc78db9ea57048dcd53380996c570c16e4669f4fc6fe7f88a801d11ffda81"
---
# @rdlabo/ionic-angular-collect-icons

<!-- rdlabo-docs-omit -->

[![version npm](https://badge.fury.io/js/@rdlabo%2Fionic-angular-collect-icons.svg)](https://badge.fury.io/js/@rdlabo%2Fionic-angular-collect-icons)
[![Licence : MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<!-- /rdlabo-docs-omit -->

Collectez les noms `ion-icon` dans les templates et générez un enregistrement `addIcons` de production. Le développement peut enregistrer toutes les icônes ; la production inclut uniquement celles trouvées dans les templates.

Ce projet repose sur [ionic-team/ionic-angular-standalone-codemods](https://github.com/ionic-team/ionic-angular-standalone-codemods).

## Versions prises en charge

- Node.js >= 22
- Ionic Angular >= 9.0.0
- Angular >= 18.0.0
- TypeScript >= 5.4.0
- ionicons >= 8.0.0
- @angular-eslint/template-parser 21 ou 22

## Installation

```bash
npm install --save-dev \
  @rdlabo/ionic-angular-collect-icons \
  @angular-eslint/template-parser@^21
```

Utilisez plutôt `@angular-eslint/template-parser@^22` si le projet utilise Angular ESLint 22. Le parseur est une dépendance homologue afin que le collecteur utilise la même version majeure du parseur de templates Angular que le projet.

## Initialisation

Configurez `addIcons` et générez `src/use-icons.ts` :

```bash
npx @rdlabo/ionic-angular-collect-icons --initialize true
```

Vérifiez que `src/use-icons.ts` existe et que `main.ts` ou `app.config.ts` enregistre les icônes de production depuis ce fichier et les icônes de développement depuis `ionicons/icons`. Les étapes de configuration manuelle sont décrites dans [Initialisation](/docs/initialize).

## Vérifier le build

1. Ajoutez une icône statique à un template, par exemple `<ion-icon name="home"></ion-icon>`.
2. Exécutez `npx @rdlabo/ionic-angular-collect-icons` et vérifiez que l’export correspondant apparaît dans `src/use-icons.ts`.
3. Exécutez `npm run build`.

Automatisez le collecteur avec `prebuild` comme indiqué dans [Utilisation](/docs/usage). Les liaisons dynamiques `[name]` ne sont pas collectées : enregistrez ces icônes manuellement ([FAQ](/docs/faq)).

## Documentation

- [Initialisation](/docs/initialize) — configuration automatique ou manuelle de `addIcons`.
- [Utilisation](/docs/usage) — exécution du collecteur avant les builds de production.
- [Options de la CLI](/docs/options) — `--dry-run`, `--initialize`, chemins.
- [FAQ](/docs/faq) — tests, liaisons et `main.ts`.
- [Migration](/docs/migration) — vérifications Ionic Angular 8 → 9 pour les applications existantes.

<!-- rdlabo-docs-omit -->

**Documentation complète :** [https://docs.rdlabo.dev/projects/ionic-angular-collect-icons](https://docs.rdlabo.dev/projects/ionic-angular-collect-icons)

## Canaux de préversion

Une pull request ouverte et non marquée comme brouillon peut être publiée sur le dist-tag npm `beta` après la réussite de ses workflows `CI`, `Lint` et `Package Candidate`. Un propriétaire ou mainteneur du dépôt doit ajouter un commentaire dont le contenu intégral est :

```text
/beta
```

Cette demande autorise uniquement le SHA de tête de la pull request au moment de l’ajout du commentaire. Le workflow vérifie à nouveau les droits du propriétaire ou du mainteneur ainsi que le SHA de tête juste avant la publication. Tout nouveau commit nécessite une nouvelle réussite de la CI et un nouveau commentaire `/beta` du propriétaire ou du mainteneur. Les pull requests provenant de forks sont prises en charge. Celles qui modifient un workflow conditionnant la publication ne peuvent pas être publiées en beta tant que ces modifications ne sont pas intégrées dans `main`.

Les versions beta utilisent `<base>-beta.pr<PR number>.sha<12-character SHA>`. Le candidat est construit dans un workflow en lecture seule, sans identifiants de publication npm. Le workflow de publication privilégié publie uniquement l’artefact de package immuable validé, avec les scripts de cycle de vie désactivés. Un échec de notification ne peut pas invalider une publication npm réussie.

Lorsqu’une pull request est fusionnée dans `main`, elle est publiée automatiquement sur `beta` uniquement après la réussite de la CI requise et de `Package Candidate` pour ce commit de fusion exact. Les push directs vers `main` ne publient pas de candidat.

Seul `npm run release` crée un tag de version. Les tags stables `vX.Y.Z` sont publiés sur npm `latest` ; les tags de révision ou de préversion sont publiés sur `next`. Ni la publication sur `beta` ni celle sur `next` ne modifie le dist-tag npm `latest`.

## Mainteneurs

- [rdlabo](https://rdlabo.dev/)

## Licence

Ce projet est distribué sous [licence MIT](./LICENSE).

<!-- /rdlabo-docs-omit -->
