---
title: "initialize-timezone-at-module-scope"
sourceRevision: "3b9c0e2623e87a6e14be59382f7eaaf333d9acb63fc70906a437f4319cbe26e4"
---
# @rdlabo/rules/initialize-timezone-at-module-scope

> Garder l’initialisation de @rdlabo/workers-timezone à un emplacement clair au niveau du module.

`initializeTimezone()` configure une instance de module et ne doit pas être déplacé dans une requête, un tenant, un callback ou le cycle de vie d’une classe. La règle suit les imports nommés, leurs alias et les imports de namespace de `@rdlabo/workers-timezone`.

## Détails de la règle

Les emplacements suivants sont autorisés :

- Une instruction d’expression directe au niveau du module
- Un initialiseur direct de variable au niveau du module
- Un initialiseur de variable exportée au niveau du module

Les fonctions, gestionnaires de requêtes, IIFE, blocs de contrôle, blocs statiques de classes, expressions imbriquées et exports par défaut sont signalés. Un fichier peut omettre complètement l’initialisation ; la règle exige seulement qu’il n’y ait au plus qu’un emplacement autorisé lorsqu’elle est présente. Si un fichier comporte plusieurs emplacements d’initialisation par ailleurs valides, chacun est signalé.

ESLint analyse un fichier à la fois. La règle garantit au plus un emplacement clair par fichier, pas un emplacement unique dans toute l’application.

### Incorrect

```ts
import { initializeTimezone } from '@rdlabo/workers-timezone';

export default {
  fetch() {
    initializeTimezone({ timeZone: 'Asia/Tokyo' });
  },
};
```

### Correct

```ts
import { initializeTimezone } from '@rdlabo/workers-timezone';

export const timezone = initializeTimezone({ timeZone: 'Asia/Tokyo' });
```

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.1/src/rules/initialize-timezone-at-module-scope.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.1/tests/rules/initialize-timezone-at-module-scope.ts)
