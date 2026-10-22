---
title: "Bindings Cloudflare dans Capacitor"
sourceRevision: "d2281b85316376b091f522dc4555cec2c9a9be37939842b2f06daac4bb56a696"
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
});
```

`remoteBindings` ajoute des noms réservés au serveur, notamment les secrets ordinaires non déclarés dans Wrangler et les bindings configurés par d’autres outils. Il ne remplace pas la découverte des services connus. Un nom ne peut pas aussi apparaître dans `localBindings`. Définissez `baseURL` sur l’URL HTTPS du Worker déployé ; `remote.origin` sert uniquement à remplacer son origine. N’injectez pas de secrets serveur dans `env` du runtime client ou dans les définitions du bundler.

Les objets de configuration inconnus contenant `binding`, ou les entrées `bindings` imbriquées utilisant `name` (par exemple `unsafe.bindings`), font échouer le build sauf si leurs noms figurent explicitement dans `remoteBindings`. Cette détection est structurelle, pas une validation complète du schéma Wrangler : les futurs formats de déclaration arbitraires et les secrets configurés uniquement dans le tableau de bord nécessitent toujours des noms explicites. Les valeurs `vars` et `define` ne sont ni interprétées comme des déclarations de bindings ni copiées dans env.

Une requête utilisant un binding distant s’exécute entièrement à distance, même si le même gestionnaire lit aussi un KV configuré localement. Les instances cloud sont utilisées pour toute la requête. Le repli conservateur vers le Worker entier préserve l’état partagé, les exports supplémentaires, les middlewares et la gestion des erreurs. Examinez le rapport généré `workers-capacitor-server.json`.

### Choisir l’exécution

Les plugins Vite et esbuild acceptent deux formes d’`execution` : un mode pour tout le Worker (`"network"` ou `"local"`), ou un tableau d’autorisations de routes. Définissez-le sur le plugin de compilation, pas sur l’appel `workersCapacitor()` du runtime.

| Forme | Comportement |
| --- | --- |
| `execution: "network"` (par défaut) | Exécute tout le Worker sur le serveur déployé. Son implémentation est exclue du graphe Worker client. |
| `execution: [{ method: "GET", path: "/" }]` | Autorise la distribution des implémentations de routes sélectionnées et des dépendances conservées. Les dépendances serveur et limites incertaines maintiennent les requêtes à distance. |
| `execution: "local"` | Autorise la distribution de tout le Worker et de ses dépendances. Destiné aux applications autonomes ; sans analyse de séparation des routes ni repli distant automatique. |

Commencez avec l’entrée Worker existante et son URL HTTPS déployée comme `baseURL`. Aucune classification des routes n’est nécessaire pour porter l’application sur Capacitor. Les ressources publiques du client peuvent être embarquées alors que le Worker reste distant. Une fois l’application fonctionnelle, sélectionnez explicitement les routes distribuables si une exécution locale est nécessaire. Un préfixe REST tel que `/api/` ne prouve pas que les autres routes sont dépourvues de données privées.

Pour un Worker autonome dont tout le code peut être distribué sur l’appareil :

```ts
workersCapacitorPlugin({
  worker: "src/worker.ts",
  execution: "local",
});
```

Cette forme fonctionne sans analyse des routes Hono. Elle rejette les bindings réservés au serveur et les exigences de cycle de vie configurées. Elle n’émule ni D1 ni Firebase Admin, ne vérifie pas tous les identifiants non déclarés et ne garantit pas la compatibilité du runtime.

### Sélectionner des routes locales

Pour une application Hono existante, utilisez un tableau pour autoriser seulement certaines routes :

```ts
workersCapacitorPlugin({
  worker: "src/worker.ts",
  execution: [
    { method: "GET", path: "/" },
    { method: "*", path: "/app/*" },
  ],
});
```

La sélection porte sur les enregistrements Hono lors de la compilation, pas sur les URL entrantes. L’exemple autorise ces implémentations et leurs dépendances conservées :

| Enregistrement existant | Sélectionné ? |
| --- | --- |
| `app.get("/", handler)` | Oui |
| `app.get("/app", handler)` | Oui, comme dans Hono |
| `app.get("/app/home", handler)` | Oui |
| `app.post("/app/notes", handler)` | Oui |
| `app.get("/app/news/:id", handler)` | Oui ; Hono fait correspondre la valeur réelle du paramètre |
| `app.get("/application", handler)` | Non |
| `app.get("/api/news", handler)` | Non |

L’autorisation ne garantit pas l’exécution locale. Les dépendances serveur détectées, l’état partagé et les gestionnaires serveur ou middlewares qui se chevauchent peuvent maintenir une route sélectionnée à distance. Les requêtes inconnues ou non sélectionnées restent également distantes : l’exécution par tableau nécessite donc toujours une destination distante (`remote.origin` explicite ou l’origine de `baseURL`), même si tous les enregistrements actuels sont sélectionnés. Un tableau vide n’autorise aucune route.

Inspectez `remote` et `reason` dans le fichier généré `workers-capacitor-server.json` (ou `workers-capacitor-d1.json` pour les compilations D1 seules). Une sélection non vide sans gestionnaire local émet un avertissement. Une sélection ne correspondant à aucun enregistrement compatible dans un graphe Hono analysable fait échouer la compilation ; un graphe Worker incompatible utilise tout le Worker distant et en indique la raison.

Ce réglage ne crée pas de routes. `/app/missing` reste distant sauf si un enregistrement Hono existant et autorisé lui correspond. Un enregistrement générique sélectionné comme `app.get("/app/*", handler)` conserve la sémantique des requêtes Hono.

#### Syntaxe des chemins et méthodes

- Un chemin enregistré exact comme `"/about"`, `"/posts/:id"` ou `"/posts/:id{[0-9]+}"` autorise cet enregistrement. Hono gère la correspondance des URL.
- Un joker final sur un préfixe littéral, comme `"/app/*"`, autorise `/app` lui-même et les enregistrements sous `/app/`. Il ne sélectionne ni `/application` ni `/app-private`. Les préfixes statiques comme `/v1.0/*` et `/@me/*` sont pris en charge.
- `"*"` et `"/*"` sélectionnent tous les chemins enregistrés compatibles.
- Un `RegExp` JavaScript, par exemple `{ method: "GET", path: /^\/pages\// }`, teste le texte de l’enregistrement. Utilisez `^` et `$` pour ancrer les correspondances si nécessaire. Chaque comparaison commence à l’indice zéro, y compris avec `g` ou `y` ; l’expression fournie n’est pas modifiée.
- Une méthode HTTP en majuscules sélectionne les enregistrements de cette méthode. `method: "*"` inclut tous les enregistrements directs de méthodes HTTP compatibles et `app.all()`, mais n’autorise pas indépendamment les middlewares. Hono conserve sa sémantique de requête, notamment la gestion de HEAD via GET lorsqu’elle s’applique.

Les motifs autorisent aussi les enregistrements correspondants ajoutés dans de futures compilations. Une méthode `"*"` inclut les futures opérations POST et DELETE sur ces chemins. Utilisez des motifs précis si vous ne souhaitez pas cette autorisation de distribution plus large.

La sélection Hono prend en charge les enregistrements directs sur le routeur exporté. OpenNext utilise un [profil de compilation générée](opennext.md#route-execution) distinct, limité aux GET statiques et à certaines versions. Les routes montées (`app.route()`), `basePath` et `on()` ne sont pas résolus pour les autorisations. La compilation ne déduit pas les relations d’inclusion entre motifs Hono arbitraires : `"/posts/:id"` n’autorise pas un enregistrement distinct `"/posts/:slug"` ou `"/posts/123"`. Copiez le motif enregistré ou utilisez un joker sur préfixe littéral.

#### Mode Worker entier et sélection de toutes les routes

`execution: [{ method: "*", path: "*" }]` analyse et sépare toujours les routes, nécessite une connexion distante et préserve les limites serveur détectées. `execution: "local"` distribue tout le Worker sans cette analyse et peut fonctionner de manière autonome. Ne passez pas à `"local"` simplement pour contourner une erreur de sélection : cela autorise la distribution de toute l’implémentation de l’application.

#### Configuration TypeScript

Les deux points d’entrée des outils exportent les mêmes types :

```ts
import type { WorkerExecution } from "cf-workers-native/tooling/vite";

const execution = [
  { method: "GET", path: "/" },
  { method: "*", path: "/app/*" },
] as const satisfies WorkerExecution;
```

### Ce qui peut être transféré sur l’appareil

Le propriétaire de l’appareil peut lire et modifier le code embarqué, les source maps et les données fixes. L’exécution par tableau autorise explicitement la distribution des implémentations sélectionnées et de leurs dépendances conservées ; ce n’est ni un détecteur d’authentification ni un analyseur de secrets. Un gestionnaire lisant `settings.title` peut conserver des propriétés privées voisines dans `settings`. Une vérification de jeton codée en dur peut distribuer à la fois le jeton et les données protégées. Gardez ces implémentations sur le serveur plutôt que de les autoriser. Les méthodes HTTP, la pureté, la sortie HTML, `ssr: false` et le prérendu ne prouvent pas qu’un code convient à la distribution.

Les bindings serveur, dépendances d’exécution non résolues, états mutables partagés et routages incertains élargissent le périmètre distant. Un middleware ne peut accompagner une route sélectionnée que s’il transmet inconditionnellement par `await next()` ; les autres restent distants avec les gestionnaires qui les chevauchent. Les gestionnaires personnalisés d’erreur ou de page introuvable maintiennent l’exécution distante. La compilation supprime les implémentations distantes et leurs dépendances exclusives avant de produire les source maps client.

Ne placez pas de secrets dans `env` côté client, les définitions du bundler, `workerFiles` ou les ressources publiques. Ces entrées ne sont pas couvertes par l’exclusion des sources Worker. Les ressources client empaquetées séparément contournent aussi le routage Worker et doivent être publiques. Les opérations distantes nécessitent toujours authentification et autorisation serveur ; aucune forme d’exécution ne les remplace. KV et ASSETS sont distants par défaut en mode réseau. Les autres formes nécessitent des politiques de bindings explicites lorsque cela s’applique. Les structures Worker incompatibles utilisent le réseau avec la sélection de routes. OpenNext propose une [intégration limitée des compilations générées](opennext.md#route-execution) ; Void et les autres graphes de frameworks incompatibles restent distants.

Les appels HTTP et RPC de Durable Object dans le gestionnaire HTTP original sont pris en charge par ce parcours d’acheminement. **Les upgrades WebSocket/HTTP ne sont pas pris en charge par ce transport** et sont explicitement rejetés. Utilisez une connexion distincte au Worker déployé pour les WebSockets ; cette version ne fournit pas de routage WebSocket automatique.

Les gestionnaires Cron configurés, les consommateurs Queue et les déclarations `exports` de Durable Objects ou de Workflows maintiennent le Worker entier à distance, y compris son gestionnaire HTTP. Le client ne simule ni événements planifiés, ni alarmes, ni étapes Workflow, ni consommation de files. Un gestionnaire Email ou un autre événement serveur sans déclaration de configuration détectable n’est pas automatiquement reconnu sur la seule base de sa finalité.

## Binding ASSETS distant

`assetsExecution: "remote"` est requis pour la sélection de routes lorsque Wrangler déclare une section `assets` ; le mode réseau le sélectionne par défaut. Le traitement via le binding ASSETS reste sur le Worker déployé, notamment la gestion HTML, le routage SPA/404, les fichiers de contrôle, les requêtes conditionnelles/par plages et la sémantique du cache. Le client n’implémente pas ces API.

```ts
workersCapacitorPlugin({ worker: "src/worker.ts", assetsExecution: "remote" });
```

Le routage donnant priorité aux ressources ou fondé sur des motifs (ainsi que les déclarations sans nom de binding) conserve l’envoi Worker distant pour respecter l’ordre de routage déployé. Avec `run_worker_first: true` et un nom de binding, l’analyse prudente habituelle peut conserver localement les routes indépendantes explicitement sélectionnées ; tout gestionnaire utilisant `env.ASSETS` s’exécute à distance. Aucun contenu du répertoire de ressources n’est copié automatiquement dans Capacitor.

**ASSETS local n’est ni implémenté ni exporté par ce changement.** Une future implémentation devra respecter tout le contrat ASSETS, notamment HTML, fichiers de contrôle, requêtes conditionnelles/par plages et parité workerd/natif. `assetsExecution: "local"` échoue explicitement plutôt que d’activer une implémentation partielle. Les ressources de document embarquées sont distinctes : `publicDir` de Vite (ou les fichiers copiés avant compilation esbuild) enregistre des chemins locaux exacts qui contournent l’envoi Worker. Réservez cela aux fichiers publics ne nécessitant ni middleware serveur, ni autorisation, ni traitement Cloudflare des en-têtes/fichiers de contrôle. Les exemples [OpenNext](opennext.md#bundle-client-assets-alongside-remote-pages) et [Void](void.md) embarquent les scripts client tout en conservant leurs gestionnaires serveur à distance.

## Vérification et limites

La base pour le Worker applicatif est Miniflare `5.20261012.0-beta`, avec la date de compatibilité `2026-10-01`, sans indicateur supplémentaire de compatibilité applicative. L’unité nommée est l’acheminement HTTP généré au build, pas une émulation locale des API de bindings cloud.

- `npm test` : découverte des bindings, erreurs de politique, diagnostics de bindings inconnus, exclusion du code serveur, priorité du routage distant et rejet des upgrades. Les cas de distribution inspectent le JavaScript minifié et les source maps, notamment HTML/JSON protégé, configuration mêlant public/privé, branches d’utilitaires, valeurs ignorées et routes montées/chevauchantes.
- `npm run test:d1-migration` dans `demo` : vérifications d’envoi workerd/navigateur et compilations Vite/esbuild conservant le rendu public indépendant tout en excluant les données protégées de chaque ressource émise. La fixture protégée vérifie aussi le comportement Hono original : les requêtes non authentifiées reçoivent 401 et les requêtes authentifiées la réponse privée.
- `npm run test:cloudflare-bindings` dans `demo` : HTTP, RPC et stockage Durable Object réels sous workerd, refus d’autorisation sans changement d’état, ASSETS distant, inspection des artefacts Vite/esbuild, modes direct/Worker Chromium/WebKit, routages worker-first et asset-first, et démarrage du développement Vite. Les requêtes utilisent un véritable serveur HTTPS local, pas une interception de routes navigateur. Les réponses conditionnelles 304 sont observées avec le cache HTTP navigateur désactivé par le serveur de test ; les réponses Range sont comparées à la même requête directe à workerd. Cela vérifie la transmission, pas une recréation cliente du cache Cloudflare.
- L’IA cloud, les index et Workflows sont vérifiés comme noms d’envoi HTTP, pas comme API émulées ni tests payants de services réels. Les contrats de transport natif sont partagés avec les services distants existants.

Cache API, HTMLRewriter et ASSETS local sont des unités de compatibilité distinctes et inachevées ; le paquet ne les active pas dans les alias ou exports de production.

## Références

- [Configuration Wrangler](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Binding et routage des ressources](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Bindings AI Search](https://developers.cloudflare.com/workers/runtime-apis/bindings/ai-search/)
- [Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
