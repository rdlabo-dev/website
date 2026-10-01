---
title: "Essayer ensemble les conversions de fuseau horaire et ESLint"
sourceRevision: "9ed437287a41f0f96e3a8f3fbb0779e4ffcc3044c42031334e6626391c130e28"
---
Un même instant peut appartenir à des dates calendaires différentes. Observez d’abord cette différence, puis faites signaler par ESLint le code qui utilise par erreur le fuseau horaire de l’hôte.

## 1. Installer les deux packages

Nécessite Node.js 24 et npm.

```sh
mkdir timezone-demo
cd timezone-demo
npm init -y
npm pkg set type=module
npm install @rdlabo/workers-timezone@0.12.2
npm install --save-dev @rdlabo/eslint-plugin-rules@22.1.0 eslint@10 @eslint/js@10 typescript@6 typescript-eslint@8 tsx@4
```

## 2. Observer le changement de date calendaire

Enregistrez ce code dans `demo.ts`. Initialisez le fuseau horaire de l’application une seule fois à la portée du module ; transmettez un fuseau par appel pour les conversions propres à l’utilisateur.

```ts
import { initializeTimezone, toLocalDate, toLocalDateTime } from '@rdlabo/workers-timezone';

initializeTimezone({ timeZone: 'Asia/Tokyo' });
const instant = new Date('2026-01-01T15:00:00Z');
console.log(toLocalDateTime(instant));
console.log(toLocalDate(instant, 'America/New_York'));
```

```sh
npx tsx demo.ts
```

```text
2026-01-02 00:00:00
2026-01-01
```

Le même instant correspond au 2 janvier à Tokyo et au 1er janvier à New York. Ajoutez un argument de fuseau horaire explicite pour une autre ville afin d’explorer cette différence.

## 3. Rendre une régression accidentelle visible

Enregistrez ceci dans `tsconfig.json` pour permettre au lint typé de trouver `demo.ts` :

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true
  },
  "include": ["demo.ts"]
}
```

Enregistrez ceci dans `eslint.config.mjs`. Limitez la configuration tenant compte des types aux fichiers TypeScript :

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

Vérifiez l’exemple correct :

```sh
npx eslint demo.ts
```

La commande doit se terminer avec succès, sans diagnostic. Ajoutez ensuite cette ligne volontairement incorrecte à `demo.ts` :

```ts
console.log(instant.getDate());
```

```sh
npx eslint demo.ts
```

Un état de sortie non nul et `@rdlabo/rules/no-implicit-timezone` sont attendus. `getDate()` lit le jour local de l’hôte et contourne le fuseau horaire de l’application. Remplacez uniquement la ligne ajoutée par :

```ts
console.log(toLocalDate(instant));
```

```sh
npx eslint demo.ts
npx tsx demo.ts
```

Le lint doit de nouveau réussir ; la dernière ligne ajoutée affiche `2026-01-02`.

## 4. Utiliser ces outils dans l’application

Suivez la [configuration de l’application](../README.md) pour choisir le fuseau horaire par défaut, puis [activez ESLint dans la CI](./eslint.md). Consultez [Fuseaux horaires et dates calendaires](./timezones.md) pour les paramètres par utilisateur, l’heure d’été et la séparation avec la base de données.
