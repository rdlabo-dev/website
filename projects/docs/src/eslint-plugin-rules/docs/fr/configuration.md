---
title: "Configuration"
sourceRevision: "3575aa7b31f199be541926b0e72c37308ea436b648ac41e67c7b78c90f5020aa"
---
# Configuration

Utilisez la racine du package pour Angular et Ionic, ou `/typescript` pour le code indépendant du framework. Commencez par la configuration de votre projet, puis activez seulement les politiques nécessaires. Consultez [le catalogue des règles](./rules.md) pour la couverture des presets et [le guide de migration](./migration.md) lors d’une mise à niveau.

## Angular et Ionic

La version 22 du plugin prend en charge Angular et Angular ESLint 21–22 avec Ionic Framework 9. Lors d’une mise à niveau depuis la version 21, examinez [le guide de migration](./migration.md) avant d’activer le nouveau preset recommandé.

Enregistrez le plugin, développez ses configurations recommandées au niveau supérieur, puis ajoutez les configurations Angular et TypeScript standard de votre projet.

```js
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const rdlabo = require('@rdlabo/eslint-plugin-rules');

module.exports = tseslint.config(
  {
    plugins: { '@rdlabo/rules': rdlabo },
  },
  ...rdlabo.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
);
```

Ne placez pas `rdlabo.configs.recommended` dans un `extends` limité à un périmètre de fichiers. L’utilitaire de configuration `typescript-eslint` remplacerait les sélecteurs `files` internes du preset et pourrait appliquer des règles réservées à TypeScript aux modèles.

### Couverture recommandée Angular et Ionic

Le preset active pour TypeScript les règles communes relatives aux Signals, aux responsabilités des composants, au cycle de vie, aux superpositions, à readonly et aux blocs try. Sa configuration HTML active la vérification des attributs Ionic, l’interdiction de certains éléments de superposition, la prévention des actions doubles, les messages d’erreur des contrôles de validation et le regroupement des éléments de listes.

Le preset TypeScript inclut `prefer-ionic-standalone`, qui exige les imports depuis la racine d’Ionic 9 et rejette `IonicModule` ainsi que les imports lazy fondés sur NgModule.

`deny-constructor-di` est obsolète et ne figure pas dans le preset. Préférez la migration Angular vers `inject()`.

## TypeScript indépendant d’un framework

Pour choisir des règles individuelles sans Angular ni Ionic, utilisez `eslint.config.mjs` avec le lint renseigné par les types. Installez les mêmes dépendances de configuration que celles de la section Workers ci-dessous et vérifiez que les fichiers TypeScript analysés appartiennent au `tsconfig.json` de votre projet.

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

export default tseslint.config({
  files: ['**/*.ts'],
  extends: [...tseslint.configs.recommendedTypeChecked],
  languageOptions: {
    parserOptions: { projectService: true, tsconfigRootDir: dirname(fileURLToPath(import.meta.url)) },
  },
  plugins: { '@rdlabo/rules': rdlabo },
  rules: {
    '@rdlabo/rules/deny-soft-private-modifier': 'error',
    '@rdlabo/rules/restrict-try-block': [
      'error',
      {
        allowPromise: false,
        allowPromiseResolve: true,
        allowRxjs: false,
        allowInSignal: false,
        maxLines: 3,
      },
    ],
  },
});
```

Le lint avec informations de types est nécessaire pour les vérifications complètes de Promise et RxJS dans `restrict-try-block`.

## Cloudflare Workers

Le point d’entrée `/typescript`, indépendant du framework, fournit deux presets qui s’activent séparément. Aucun n’est inclus dans le `recommended` Angular et aucun n’inclut l’autre.

| Preset                         | Règles et options                                                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `workers/recommended`          | `restrict-try-block` avec `{ allowPromise: false, allowPromiseResolve: true, allowRxjs: false, allowInSignal: false, maxLines: 3 }` |
| `workers-timezone/recommended` | `no-implicit-timezone` et `initialize-timezone-at-module-scope` (tous deux à `error`)                                                     |

Activez chaque preset séparément, ou combinez-les. Limitez les configurations `typescript-eslint` sensibles aux types à `**/*.ts`, afin que les outils analysant `eslint.config.mjs` ne demandent pas à `projectService` un projet TypeScript qui n’inclut pas ce fichier :

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir },
    },
    plugins: { '@rdlabo/rules': rdlabo },
  },
  ...rdlabo.configs['workers/recommended'],
  ...rdlabo.configs['workers-timezone/recommended'],
);
```

Installez les dépendances de configuration utilisées ci-dessus :

```sh
npm install --save-dev eslint @eslint/js typescript typescript-eslint @rdlabo/eslint-plugin-rules
```

`no-implicit-timezone` nécessite les informations de types. `initialize-timezone-at-module-scope` est syntaxique : un fichier peut omettre l’initialisation ; lorsqu’elle est présente, il ne peut y avoir qu’un emplacement autorisé dans ce fichier — pas un emplacement unique pour toute l’application, ni un appel obligatoire dans chaque module.

Le preset de fuseaux horaires complète [`@rdlabo/workers-timezone`](https://docs.rdlabo.dev/projects/workers-timezone/docs/readme) ; aucun package ne dépend de l’autre à l’exécution. Il signale les opérations identifiables statiquement, pas toutes les valeurs dynamiques de fuseau horaire. Consultez [no-implicit-timezone](./rules/no-implicit-timezone.md) et [initialize-timezone-at-module-scope](./rules/initialize-timezone-at-module-scope.md) pour la couverture et les limites exactes.

Le preset Workers n’inclut volontairement pas celui des fuseaux horaires ; les mises à jour de politique Workers générale n’activent donc pas implicitement les politiques de dates.
