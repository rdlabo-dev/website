---
title: "Premiers pas"
sourceRevision: "3e9bc955d3157e9d292e2679edaa72d1b438a6d6d1ff5b0523be180c5f3f5775"
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

## Mainteneurs

- [rdlabo](https://rdlabo.dev/)

## Licence

Ce projet est distribué sous [licence MIT](./LICENSE).

<!-- /rdlabo-docs-omit -->
