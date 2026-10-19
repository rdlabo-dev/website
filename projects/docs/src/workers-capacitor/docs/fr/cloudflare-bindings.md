---
title: "Bindings Cloudflare dans Capacitor"
sourceRevision: 2614065a1973822464f7a50d38788917803364e1b1784ffca10d870697dd2523
---

# Bindings Cloudflare dans Capacitor

Il s’agit d’un acheminement de requêtes HTTP, pas d’une implémentation cliente des services Cloudflare. Le build détecte les dépendances cloud et envoie la requête originale au Worker déployé existant **avant l’exécution des gestionnaires applicatifs locaux**. Le Worker utilise ses propres bindings, identifiants, RPC, stockage et cycle de vie. Il n’y a ni proxy public générique de bindings, ni bundle d’identifiants client, ni nouvelle tentative automatique, ni file d’attente hors ligne.

## Services distants

En plus de D1, Hyperdrive, R2, Service Bindings et des producteurs Queue, les plugins Vite et esbuild découvrent les déclarations Wrangler suivantes :

| Service | Configuration contenant le nom du binding |
| --- | --- |
| Durable Objects (y compris les espaces de noms Container) | `durable_objects.bindings[].name` |
| Workers AI | `ai.binding` |
| Vectorize | `vectorize[].binding` |
| AI Search | `ai_search[].binding`, `ai_search_namespaces[].binding` |
| Workflows | `workflows[].binding` |
| Analytics SQL | `analytics.binding` |
| Analytics Engine | `analytics_engine_datasets[].binding` |
| Browser Run | `browser.binding` |
| Images | `images.binding` |
| Stream / Media Transformations | `stream.binding`, `media.binding` |
| Rate Limiting | `ratelimits[].name` |
| mTLS | `mtls_certificates[].binding` |
| Secrets Store | `secrets_store_secrets[].binding` |
| Envoi d’e-mails | `send_email[].name` |
| Workers for Platforms | `dispatch_namespaces[].binding` |

JSON, JSONC, TOML et les environnements nommés sont pris en charge. Comme pour les bindings de services existants, les noms de tous les environnements sont considérés de manière conservatrice ; l’environnement réel du Worker déployé détermine les ressources exécutées. L’option de développement Wrangler `remote: false` ne rend pas un service cloud local dans Capacitor. Les identifiants de ressources, noms de modèles/index, certificats et valeurs secrètes ne sont pas copiés de Wrangler vers le client.

```ts
workersCapacitorPlugin({
  worker: "src/worker.ts",
  workerConfig: "wrangler.jsonc", // facultatif si découvert automatiquement
  remoteBindings: ["PAYMENT_SECRET", "FUTURE_SERVICE"],
  kvExecution: { SETTINGS: "local" },
});
```

`remoteBindings` ajoute des noms réservés au serveur, y compris les secrets ordinaires non répertoriés dans Wrangler et les bindings configurés par d’autres outils. Il ne remplace pas la découverte des services connus. Un nom ne peut pas aussi figurer dans `localBindings`. Fournissez `remote.origin` à `workersCapacitor`, comme pour les services distants existants. N’injectez pas de secrets serveur via `env` du runtime client ou les définitions du bundler.

Les objets de configuration inconnus contenant `binding`, ou les entrées `bindings` imbriquées utilisant `name` (par exemple `unsafe.bindings`), font échouer le build sauf si leurs noms figurent explicitement dans `remoteBindings`. Cette détection est structurelle, pas une validation complète du schéma Wrangler : les futurs formats de déclaration arbitraires et les secrets configurés uniquement dans le tableau de bord nécessitent toujours des noms explicites. Les valeurs `vars` et `define` ne sont ni interprétées comme des déclarations de bindings ni copiées dans env.

Une requête utilisant un binding distant s’exécute entièrement à distance, même si le même gestionnaire lit aussi un KV configuré localement. Les instances cloud sont utilisées pour toute la requête. Le repli conservateur vers le Worker entier préserve l’état partagé, les exports supplémentaires, les middlewares et la gestion des erreurs. Examinez le rapport généré `workers-capacitor-server.json`.

Les appels HTTP et RPC de Durable Object dans le gestionnaire HTTP original sont pris en charge par ce parcours d’acheminement. **Les upgrades WebSocket/HTTP ne sont pas pris en charge par ce transport** et sont explicitement rejetés. Utilisez une connexion distincte au Worker déployé pour les WebSockets ; cette version ne fournit pas de routage WebSocket automatique.

Les gestionnaires Cron configurés, les consommateurs Queue et les déclarations `exports` de Durable Objects ou de Workflows maintiennent le Worker entier à distance, y compris son gestionnaire HTTP. Le client ne simule ni événements planifiés, ni alarmes, ni étapes Workflow, ni consommation de files. Un gestionnaire Email ou un autre événement serveur sans déclaration de configuration détectable n’est pas automatiquement reconnu sur la seule base de sa finalité.

## Binding ASSETS distant

`assetsExecution: "remote"` est obligatoire lorsque Wrangler déclare une section `assets`. Tout le traitement des ressources reste sur le Worker déployé, y compris le traitement HTML, le routage SPA/404, les fichiers de contrôle, les requêtes par plage/conditionnelles et la sémantique du cache. Le client n’implémente pas ces API.

```ts
workersCapacitorPlugin({ worker: "src/worker.ts", assetsExecution: "remote" });
```

Le routage donnant priorité aux ressources ou basé sur des motifs (et les déclarations sans nom de binding) maintient toutes les requêtes à distance, afin que le code client ne puisse pas contourner l’ordre de routage déployé. Avec `run_worker_first: true` et un nom de binding, l’analyse conservatrice normale peut garder les routes indépendantes locales ; tout gestionnaire utilisant `env.ASSETS` s’exécute à distance. Rien du répertoire de ressources n’est automatiquement copié dans Capacitor.

**ASSETS local n’est ni implémenté ni exporté par cette modification.** Une future implémentation locale devra satisfaire le contrat ASSETS complet, y compris le traitement HTML, les fichiers de contrôle, le comportement conditionnel/par plage et la parité workerd/natif. `assetsExecution: "local"` échoue explicitement au lieu d’activer une implémentation partielle. L’hébergement existant des ressources de documents est une autre fonctionnalité et reste inchangé.

## Vérification et limites

La base pour le Worker applicatif est Miniflare `5.20261012.0-beta`, avec la date de compatibilité `2026-10-01`, sans indicateur supplémentaire de compatibilité applicative. L’unité nommée est l’acheminement HTTP généré au build, pas une émulation locale des API de bindings cloud.

- `npm test` : découverte des bindings, erreurs de politique, diagnostics des bindings inconnus, exclusion du code serveur, priorité du routage distant et rejet des upgrades.
- `npm run test:cloudflare-bindings` dans `demo` : HTTP, RPC et stockage Durable Object réels dans workerd, rejet d’autorisation sans changement d’état, ASSETS distant, inspection des artefacts Vite/esbuild, modes direct/Worker de Chromium/WebKit, routage donnant priorité au Worker ou aux ressources, et démarrage de développement Vite. Les requêtes utilisent un véritable serveur HTTPS local, pas une interception des routes du navigateur. Les réponses conditionnelles 304 sont observées avec le cache HTTP du navigateur désactivé par le serveur de test ; les réponses Range sont comparées à la même requête envoyée directement à workerd. Cela vérifie la transmission, pas une reproduction cliente du comportement du cache Cloudflare.
- Les services cloud AI, les index et Workflows sont vérifiés en tant que noms pour l’acheminement HTTP, pas comme API émulées ou tests payants de services réels. Les contrats de transport natif sont partagés avec les services distants existants.

Cache API, HTMLRewriter et ASSETS local sont des unités de compatibilité distinctes et inachevées ; le paquet ne les active pas dans les alias ou exports de production.

## Références

- [Configuration Wrangler](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Binding et routage des ressources](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Bindings AI Search](https://developers.cloudflare.com/workers/runtime-apis/bindings/ai-search/)
- [Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
