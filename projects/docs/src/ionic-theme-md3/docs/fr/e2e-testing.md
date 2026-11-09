---
title: "Tests E2E par captures d’écran"
sourceRevision: "3243fd490f863debf57d5e7974d310cfc70a9511efa4dc5b47186e978362703b"
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
npm run test:e2e          # Exécuter la suite
npm run test:e2e:ui       # Ouvrir le mode UI de Playwright
npm run test:e2e:debug    # Exécuter avec le débogueur Playwright
# Pour les changements de références acceptés, commentez /update-screenshots sur la PR.
```

Pour reproduire l’environnement Linux de la CI, exécutez les variantes Docker depuis `demo/` :

```bash
npm run test:e2e:docker
```

Les commandes Docker utilisent l’image Playwright épinglée dans `demo/package.json`.

## Analyser un échec

Une différence de capture peut être une régression ou une modification visuelle volontaire. Avant de mettre à jour une image de référence :

1. Examinez les images réelle, attendue et de différence dans `demo/test-results/`.
2. Vérifiez la route concernée en modes clair et sombre.
3. Confirmez que le changement du composant est intentionnel.
4. Demandez `/update-screenshots` sur la PR et examinez le commit généré par la CI.
   Vous pouvez lancer localement `test:e2e:update` / `test:e2e:docker:update` pour une investigation dans un checkout jetable ; ne commitez pas ces images comme références de PR.

Le rapport HTML est écrit dans `demo/playwright-report/` et peut être ouvert avec :

```bash
npx playwright show-report
```

## Étendre la couverture

Lors de l’ajout d’une route de démo ou d’une variante de superposition, mettez à jour `demo/e2e/screenshot.spec.ts` et régénérez les références concernées. Utilisez le workflow CI de mise à jour et examinez sa différence visuelle commitée.

Les pull requests exécutent le workflow E2E dans `.github/workflows/e2e-pull_request.yml` ; les pushes vers `main` exécutent `.github/workflows/e2e-main.yml`.

## Mettre à jour les références de PR

Pour un changement d’apparence intentionnel dans une PR, publiez `/update-screenshots` sur celle-ci. Le workflow vérifie les droits du collaborateur, génère les images dans le conteneur Playwright épinglé et les commite sur la branche de PR. Récupérez ce commit avant de poursuivre. Examinez les images en modes clair/sombre et excluez les changements inattendus des références. Les captures locales sont des éléments d’investigation, pas des références de remplacement pour ce workflow.

## Aperçus de documentation

La page Docs de la démo est générée depuis `docs/special-markup.md`. Après modification, exécutez `npm --prefix demo run docs:generate`, commitez le contenu généré et vérifiez `/main/docs` dans la démo en cours. `prestart` et `prebuild` le régénèrent également. Conservez les instructions de configuration dans les guides liés et le balisage de prévisualisation dans le Markdown source ; ne modifiez pas `docs-content.generated.ts` à la main.
