---
title: "Tests E2E par captures d’écran"
sourceRevision: "1555314f99e0502204b03550523bb6a91937d7079b5ba92f7214b596ce6bb937"
---
# Tests E2E par captures d’écran

Ce guide de maintenance explique l’exécution de la suite de régression visuelle Playwright pour la démonstration Material Design 3. La suite couvre toutes les entrées déclarées dans `demo/e2e/screenshot.spec.ts` en modes clair et sombre. Les variantes d’overlays sont générées depuis les tableaux partagés de `demo/src/app/overlay-types.ts`.

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

Les pull requests exécutent le workflow E2E dans `.github/workflows/e2e-pull_request.yml` ; les pushes vers `main` exécutent `.github/workflows/e2e-main.yml`.
