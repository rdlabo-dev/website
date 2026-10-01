---
title: "Voir une règle de lint détecter et corriger du code"
sourceRevision: "1bf99c55bfb6000d784ec3ebdb6176d49ff7e3a631cf08008d72e3299327ab5b"
---
Rendez une convention exécutable : examinez un membre privé TypeScript, observez les diagnostics et laissez ESLint le convertir en champ privé JavaScript. Cet exercice utilise une règle indépendante du framework ; vous pouvez donc l’essayer sans créer d’application Angular ou Ionic.

## 1. Créer un petit projet de lint

Utilisez Node.js 24 et npm. Cet exercice isolé utilise ESLint 10 ; consultez les [prérequis](../README.md) avant de modifier une application existante.

```sh
mkdir eslint-rules-demo
cd eslint-rules-demo
npm init -y
npm pkg set type=module
npm install --save-dev @rdlabo/eslint-plugin-rules@22.1.0 eslint@10 typescript@6 typescript-eslint@8
```

Enregistrez ceci dans `eslint.config.mjs`. Cette règle purement syntaxique ne nécessite ni projet TypeScript ni lint avec informations de types :

```js
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

export default tseslint.config({
  files: ['**/*.ts'],
  languageOptions: { parser: tseslint.parser },
  plugins: { '@rdlabo/rules': rdlabo },
  rules: { '@rdlabo/rules/deny-soft-private-modifier': 'error' },
});
```

## 2. Voir la règle en action

Enregistrez ceci dans `demo.ts` :

```ts
class Counter {
  private value = 0;

  increment() {
    return ++this.value;
  }
}

console.log(new Counter().increment());
```

```sh
npx eslint demo.ts
```

Attendez-vous à un code de sortie non nul et à deux diagnostics `@rdlabo/rules/deny-soft-private-modifier` : un pour la déclaration et un pour l’accès au membre.

## 3. Appliquer et examiner la correction

```sh
npx eslint demo.ts --fix
npx eslint demo.ts
```

La deuxième commande doit réussir. Examinez `demo.ts` : la déclaration et l’accès doivent maintenant utiliser un champ privé JavaScript :

```ts
class Counter {
  #value = 0;

  increment() {
    return ++this.#value;
  }
}

console.log(new Counter().increment());
```

Il s’agit de la démonstration d’une règle, pas d’un preset complet de projet. Toutes les règles ne proposent pas de correction automatique. Examinez les modifications automatiques avant de les commiter.

## 4. Adopter le bon preset

| Besoin du projet                           | Point d’entrée et preset                        |
| -------------------------------------- | --------------------------------------------- |
| Composants et modèles Angular/Ionic | Racine du package, `recommended`                   |
| Limites de gestion des erreurs Workers               | `/typescript`, `workers/recommended`          |
| Vérifications de régression des fuseaux horaires             | `/typescript`, `workers-timezone/recommended` |

Les deux presets Workers s’activent séparément. Pour les fuseaux horaires, commencez par [l’exercice associant bibliothèque et lint](https://docs.rdlabo.dev/projects/workers-timezone/docs/quickstart). Le plugin signale des motifs de code ; il n’implémente pas les conversions à l’exécution et ne remplace pas les tests de l’application.

Ouvrez [Configuration](./configuration.md) pour la configuration Angular/Ionic ou Workers. Conservez les sélecteurs TypeScript et HTML lors de l’expansion du preset Angular et activez le lint avec informations de types pour les règles qui inspectent les types. Exécutez la commande de lint de votre projet dans la CI et incluez-la dans les instructions aux contributeurs et aux assistants de développement IA.

Utilisez [le catalogue des règles](./rules.md) pour ajouter une politique à la fois. Consultez [Migration](./migration.md) avant d’activer un preset recommandé plus récent dans une application existante.
