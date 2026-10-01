---
title: "Détecter les erreurs de fuseau horaire avec ESLint"
sourceRevision: "66b3cbb9eb67eda2713293b99c52480b8051271990b81416d16e37235befe02f"
---
Faites respecter la même règle de fuseau horaire au nouveau code Cloudflare Workers. Associez `@rdlabo/workers-timezone` à `@rdlabo/eslint-plugin-rules` pour détecter les opérations `Date` / `Intl` dans le fuseau de l’hôte et les initialisations à la portée d’une requête.

Pour une démonstration exécutable des deux packages, commencez par [Essayer les conversions et le lint](./quickstart.md).

## Activer le préréglage associé

Cet exemple utilise Node.js 24. Dans une application utilisant `@rdlabo/workers-timezone`, installez les dépendances de lint :

```sh
npm install --save-dev eslint@10 @eslint/js@10 typescript@6 typescript-eslint@8 @rdlabo/eslint-plugin-rules@22
```

Ajoutez le préréglage de fuseau horaire et le lint typé à `eslint.config.mjs`. Les fichiers TypeScript contrôlés doivent être inclus dans le `tsconfig.json` de l’application.

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

export default tseslint.config(
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
      },
    },
    plugins: { '@rdlabo/rules': rdlabo },
  },
  ...rdlabo.configs['workers-timezone/recommended'],
);
```

Conservez vos entrées de configuration existantes lors de l’intégration. Le préréglage distinct `workers/recommended` n’active pas les contrôles de fuseau horaire.

## Détecter une date locale de l’hôte

Ce code lit la date calendaire de l’hôte au lieu de celle de votre application :

```ts
const instant = new Date('2026-01-01T15:00:00Z');
console.log(instant.getDate());
```

Utilisez la bibliothèque pour choisir le fuseau horaire calendaire :

```ts
import { toLocalDate } from '@rdlabo/workers-timezone';

const instant = new Date('2026-01-01T15:00:00Z');
console.log(toLocalDate(instant, 'Asia/Tokyo'));
// 2026-01-02
```

`no-implicit-timezone` signale également les appels de formatage `Intl` pris en charge qui ne précisent pas `timeZone`. Les méthodes UTC et `toISOString()` restent disponibles pour les opérations fondées sur les instants.

## Initialiser hors des requêtes

`initialize-timezone-at-module-scope` signale ce code :

```ts
import { initializeTimezone } from '@rdlabo/workers-timezone';

export function handleRequest() {
  initializeTimezone({ timeZone: 'Asia/Tokyo' });
}
```

Initialisez plutôt pendant l’évaluation du module :

```ts
import { initializeTimezone } from '@rdlabo/workers-timezone';

initializeTimezone({ timeZone: 'Asia/Tokyo' });
```

Pour le fuseau horaire d’un utilisateur, transmettez un argument explicite à la conversion. La règle d’initialisation vérifie chaque fichier ; elle n’impose pas une initialisation unique dans toute l’application.

## Exécuter les contrôles dans la CI

Après l’installation des dépendances, exécutez :

```sh
npx eslint 'src/**/*.ts' --max-warnings 0
```

Adaptez le chemin des sources à votre application. Conservez les tests de fuseau horaire pour l’heure d’été et les limites calendaires : les contrôles statiques couvrent les opérations reconnaissables, pas toutes les valeurs dynamiques.

Consultez la [règle Date / Intl](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/no-implicit-timezone), la [règle d’initialisation](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/initialize-timezone-at-module-scope) et le [comportement des fuseaux horaires](./timezones.md).
