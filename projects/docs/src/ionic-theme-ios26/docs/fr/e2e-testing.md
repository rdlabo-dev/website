---
title: "Tests E2E par captures d’écran"
sourceRevision: "36c551fdceca8117e6a2c28a49f3b0e573a461d91a526be517018f0727c235a1"
---
# Tests E2E par captures d’écran

Ce guide destiné aux mainteneurs explique comment exécuter la suite de régression visuelle Playwright de la démonstration iOS26. La suite couvre chaque entrée déclarée dans `demo/e2e/screenshot.spec.ts`, en mode clair et sombre. Les variantes de superposition sont générées à partir des tableaux partagés de `demo/src/app/overlay-types.ts`.

## Exécuter la suite

Installez d’abord les dépendances de la démonstration :

```bash
cd demo
npm install
```

Choisissez ensuite la commande correspondant à la tâche :

```bash
npm run test:e2e          # Exécuter la suite de tests
npm run test:e2e:ui       # Ouvrir Playwright en mode UI
npm run test:e2e:debug    # Exécuter avec le débogueur Playwright
npm run test:e2e:update   # Régénérer les images de référence pour les modifications intentionnelles
```

Pour reproduire l’environnement Linux de la CI, exécutez les variantes Docker depuis `demo/` :

```bash
npm run test:e2e:docker
npm run test:e2e:docker:update
```

Les commandes Docker utilisent l’image Playwright épinglée dans `demo/package.json`.

## Analyser un échec

Une différence de capture peut être une régression ou une modification visuelle volontaire. Avant de mettre à jour une image de référence :

1. Examinez les images réelle, attendue et de différence dans `demo/test-results/`.
2. Vérifiez la route concernée en mode clair et sombre.
3. Confirmez que la modification du composant est volontaire.
4. Régénérez l’image de référence avec `npm run test:e2e:update`, ou utilisez la variante Docker pour reproduire le rendu de la CI.

Le rapport HTML est écrit dans `demo/playwright-report/` et peut être ouvert avec :

```bash
npx playwright show-report
```

## Étendre la couverture

Lorsque vous ajoutez une route de démonstration ou une variante de superposition, mettez à jour `demo/e2e/screenshot.spec.ts` et régénérez les images de référence concernées. Ne commitez les nouvelles références qu’après avoir examiné la différence visuelle.

Les pull requests ciblant `main` ou `ios26` exécutent le workflow E2E de `.github/workflows/e2e-pull_request.yml` ; les pushes sur l’une ou l’autre branche exécutent `.github/workflows/e2e-main.yml`. GitHub compile la référence de fusion de la pull request avec sa branche cible ; une pull request vers `ios26` part donc des captures iOS 26. Les changements de captures volontairement commités dans la pull request sont ensuite testés dans ce résultat de fusion. La commande `/update-screenshots` charge sa procédure de mise à jour depuis la branche cible et commite les captures régénérées sur la branche de la pull request.
