---
title: "restrict-try-block"
sourceRevision: "85b249d8d46a2a9fdce6ec03dad33be3234b989024ddcf1eb3aab26ddb3cc216"
---
# @rdlabo/rules/restrict-try-block

> Restreindre les contextes Promise, RxJS et Angular Signal, les échappatoires `Promise.resolve()` et les lignes physiques de code dans les blocs try.
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).

`try/catch` doit protéger une petite opération synchrone pouvant réellement lever une erreur. Placer du travail asynchrone, des blocs longs ou des callbacks réactifs dans `try` brouille les limites de gestion des erreurs et peut absorber ou mal aiguiller les erreurs. Cette règle impose ces contraintes.

## Détails de la règle

La règle vérifie chaque bloc `try` et signale par défaut :

- `await` ou tout autre usage de Promise/thenable dans `try`
- `Promise.resolve()` n’importe où (même hors d’un `try`) comme échappatoire
- Des types ou opérations RxJS dans `try`
- Un bloc `try` dans un callback `computed()` ou `effect()`
- Un bloc `try` dépassant 3 lignes physiques de code

Pour les vérifications limitées à un `try`, seul le corps du `try` est inspecté. Les clauses `catch` et `finally` sont exclues. Les fonctions, classes et instructions `try` imbriquées sont des limites d’exécution distinctes et ne sont pas attribuées au bloc externe. La vérification de `Promise.resolve()` s’applique à tout le fichier.

La détection des Promise-like et de RxJS utilise les informations de types TypeScript lorsqu’elles sont disponibles. Sans ces informations, ces vérifications sont omises plutôt que d’arrêter ESLint ; les vérifications syntaxiques de `await`, `Promise.resolve()`, du contexte Angular Signal et du nombre de lignes continuent. Configurez `parserOptions.projectService` pour une application complète de la règle.

## Options

```json
{
  "rules": {
    "@rdlabo/rules/restrict-try-block": [
      "error",
      {
        "allowPromise": false,
        "allowPromiseResolve": false,
        "allowRxjs": false,
        "allowInSignal": false,
        "maxLines": 3
      }
    ]
  }
}
```

### `allowPromise`

- Type : `boolean`
- Valeur par défaut : `false`

Autoriser Promise/thenable dans `try`.

### `allowPromiseResolve`

- Type : `boolean`
- Valeur par défaut : `false`

Désactiver la vérification de `Promise.resolve()` dans tout le fichier. Dans un corps `try`, `allowPromise: true` est également nécessaire, car l’appel constitue indépendamment un traitement Promise-like.

### `allowRxjs`

- Type : `boolean`
- Valeur par défaut : `false`

Autoriser RxJS dans `try`.

### `allowInSignal`

- Type : `boolean`
- Valeur par défaut : `false`

Autoriser les blocs `try` dans les callbacks `computed()` ou `effect()`.

### `maxLines`

- Type : `number | false`
- Valeur par défaut : `3`

Nombre maximal de lignes physiques de code dans un bloc `try`. Définissez `false` pour désactiver la vérification de taille. Les accolades externes, commentaires et lignes vides sont exclus ; une ligne distincte contenant un autre token compte une fois.

## Exemples

### Incorrect

```ts
async function run() {
  try {
    await work();
  } catch {}
}
```

```ts
try {
  Promise.resolve(1).catch(() => 0);
} catch {}
```

```ts
import { of } from 'rxjs';

try {
  of(1).pipe().subscribe();
} catch {}
```

```ts
import { computed } from '@angular/core';

const value = computed(() => {
  try {
    return JSON.parse('1');
  } catch {
    return 0;
  }
});
```

```ts
try {
  first();
  second();
  third();
  fourth();
} catch {}
```

### Correct

```ts
function parse(source: string) {
  try {
    return JSON.parse(source);
  } catch {
    return null;
  }
}
```

```ts
async function run() {
  try {
    doWork();
  } catch {
    await recover();
  } finally {
    cleanup();
  }
}
```

```ts
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

of(1)
  .pipe(catchError(() => of(0)))
  .subscribe();
```

### Assouplir une vérification

```json
{
  "rules": {
    "@rdlabo/rules/restrict-try-block": [
      "error",
      {
        "allowPromise": true,
        "allowPromiseResolve": true,
        "allowRxjs": true,
        "allowInSignal": true,
        "maxLines": false
      }
    ]
  }
}
```

## Quand l’activer

Activez cette règle dans tout projet où `try/catch` doit être une limite de gestion des erreurs courte et explicite. Elle est particulièrement utile dans le code Angular Signal et lors d’une migration depuis une gestion des erreurs très fondée sur Promise/RxJS.

La vérification de `Promise.resolve()` reconnaît le `Promise` global non masqué et `globalThis.Promise` explicite, y compris avec la notation statique entre crochets. Elle ne suit volontairement pas les alias. Un `Promise` local déclaré ou importé, ou un `globalThis` masqué, n’est pas traité comme l’API native.

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/restrict-try-block.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/restrict-try-block.ts)
