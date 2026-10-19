---
title: "Prise en charge d’OpenNext et vinext"
sourceRevision: f815343802c28850c0a4ea7420f4812a61fcc436813858b454f575229db30bc7
---

# Prise en charge d’OpenNext et vinext

OpenNext et vinext utilisent le profil de compatibilité Workers. La prise en charge dépend du lieu d’exécution de la requête ; le rendu distant ne démontre pas la compatibilité locale du framework. L’[exemple OpenNext autonome](../demo/opennext/README.md) sépare ces parcours et garde ses pilotes de tests hors de l’application.

## Exécution et configuration

- Avec D1 et le routage donnant priorité aux ressources, le Worker OpenNext généré s’exécute entièrement à distance. Configurez `worker: ".open-next/worker.js"`, `assetsExecution: "remote"` et le `remote.origin` HTTPS déployé. Aucun fichier applicatif serveur ni de système de fichiers virtuel n’est livré à l’appareil ; `workerFiles` est inutile pour cette configuration.
- L’exécution locale utilise le Worker généré dans un Dedicated Worker. Le profil réservé aux tests de l’exemple couvre les pages SSR publiques, l’hydratation client, les images/CSS statiques, les liens Next.js et les middlewares. Il ne fournit ni D1 ni ASSETS local.
- Le plugin Vite transforme les appels intégrés `require()` dans les fichiers ESM `.mjs` générés. C’est un réglage du build Capacitor ; le build Cloudflare reste indépendant.

Consultez l’[inventaire Node](compatibility.md) pour les restrictions restantes du runtime.

## Ce que fournit le runtime

| Surface | Implémentation |
| --- | --- |
| `cloudflare:workers` `env` | Le transport isolé définit un proxy à l’échelle du contexte global avant `worker.fetch` ; l’acheminement direct ne le définit pas. Il n’est pas propre à chaque requête et est indisponible pendant l’évaluation initiale des modules. Utilisez l’argument du gestionnaire si possible. |
| `cloudflare:workers` `DurableObject` | Classe de base permettant la résolution et la construction des sous-classes DO exportées d’OpenNext (queue, tag cache, cache purge). Aucun stockage DO ; configurez `open-next.config` avec `incrementalCache: "dummy"`, `tagCache: "dummy"`, `queue: "dummy"` pour les retirer. |
| `node:async_hooks` | Approximation d’ALS par portée (voir le contexte asynchrone ci-dessous). |
| `node:fs` / `node:fs/promises` | Système de fichiers virtuel en mémoire et en lecture seule. `readFile(Sync)`, `readdir(Sync)`, `existsSync`, `stat(Sync)`, `lstat(Sync)`, `realpathSync`, `promises.{readFile,readdir,stat,lstat,realpath,access}`. Les écritures lèvent une erreur. |
| `node:module` | `builtinModules`, `isBuiltin`, `createRequire` (`.json` du VFS uniquement ; les modules exécutables lèvent une erreur). |
| `node:stream/web` | Adaptateur de flux propre au module avec une solution de repli empaquetée pour les flux d’octets si l’hôte n’en dispose pas ; la parité complète avec les flux Workers reste non vérifiée. |
| `node:util` | Implémentation util propre au module et contrats partagés, avec les lacunes d’exports/moteur restantes répertoriées dans l’inventaire. |
| Autres `node:*` | Implémentations propres aux modules et solutions de repli par dépendances ; la table actuelle d’alias est `src/tooling/shared.ts`. Pouvoir importer ne signifie pas que le module entier est validé ; consultez l’inventaire Node. |

## Embarquer les fichiers tracés (`workerFiles`)

Pour un point d’entrée OpenNext `worker.js` généré et exécuté localement, les deux plugins de bundler collectent automatiquement les manifestes JSON `.next` et les fichiers `package.json` tracés. Le JavaScript généré, les source maps, les traces NFT et les sorties d’analyse de build ne sont pas embarqués comme données de système de fichiers. Les remplacements par un Worker distant ne collectent pas les fichiers serveur.

Les données applicatives supplémentaires lues via `node:fs` doivent figurer dans `workerFiles` sous forme de chemins de fichiers individuels (pas de répertoires) :

```ts
workersCapacitorPlugin({
  worker: ".open-next/worker.js",
  // Nécessaire uniquement si l’application lit des fichiers de données supplémentaires :
  workerFiles: ["./templates/email.txt"],
});
```

Le test natif local enveloppe le point d’entrée généré pour y attacher un pilote de test ; sa [configuration](../demo/tests/opennext/local/vite.config.ts) fournit donc explicitement les mêmes métadonnées. La découverte automatique s’applique aux points d’entrée OpenNext générés, pas aux modules enveloppes arbitraires ni aux données arbitraires de runtimes tiers.

Les recherches VFS normalisent les séparateurs et comparent les suffixes : les chemins absolus tracés sont donc résolus quel que soit le répertoire de compilation du bundle.

## Contexte asynchrone (la véritable frontière)

- Les plugins Vite/esbuild Capacitor abaissent les fonctions async et les générateurs en continuations Promise tout en préservant `await` au niveau supérieur. L’implémentation de compatibilité capture le contexte à l’enregistrement du callback et le restaure après chaque portée synchrone. Les portées async concurrentes et imbriquées utilisent des stores distincts ; la sérialisation des acheminements n’est plus nécessaire pour le contrat ALS partagé.
- Les callbacks async natifs non transformés passés à `run`/`exit` sont rejetés avant exécution, au lieu de laisser fuiter silencieusement le store d’une autre requête. Le code dynamique et les modules compilés ailleurs doivent participer à la même transformation.
- Les transformations et alias appartiennent uniquement au build Capacitor. Cloudflare conserve son `node:async_hooks` natif ; les sources de l’application Worker restent inchangées.
- Les modifications en mode direct affectent aussi le contexte global de l’interface. Préférez un Worker isolé pour les applications dépendant d’ALS. La validation native complète d’OpenNext reste distincte du contrat ALS partagé.

## Validation d’applications amont

La [fixture officielle de validation App Router](../demo/tests/upstream/opennext/README.md) épingle une application OpenNext amont et préserve ses sources et sa configuration. Elle couvre les Server Actions hydratées, les actions de formulaire avec redirections/paramètres de requête et le SSR différé avec un affichage de chargement Suspense. Les tests natifs exercent l’exécution distante du Worker et l’hydratation WebView via l’API publique ; ils ne démontrent pas la prise en charge locale des Server Actions. La base navigateur s’exécute séparément dans la CI. Consultez la fixture pour les commandes de reproduction et les limites des tests de proxy/streaming.

## Lacunes actuelles

- Les scénarios natifs de l’exemple couvrent les pages publiques et les parcours distants D1/session, pas les applications Next.js arbitraires ni les performances des builds release.
- **Bindings :** utilisez la [configuration des bindings distants](cloudflare-bindings.md) pour les services cloud ou un KV local explicite en mode direct. ASSETS reste exclusivement distant. Ces intégrations générales ne démontrent pas la compatibilité des caches/bindings d’OpenNext ; la configuration de vérification de base utilise des caches dummy.
- `createRequire` charge uniquement du `.json` ; les fichiers exécutables tracés doivent déjà être regroupés par OpenNext (c’est le cas).
- `/_next/image` utilise le binding IMAGES du Worker distant. La fixture `/images` vérifie une véritable transformation PNG vers WebP et les dimensions de sortie via le rendu natif. Le scénario HTTPS public vérifie aussi le binding IMAGES Cloudflare déployé sur un iPhone 15 Pro Max sous iOS 27.0.1 sans installer d’autorité de certification de test. Les loaders `cdn-cgi` personnalisés restent non vérifiés.
- L’hôte de documents préserve Origin/Fetch Metadata observés. iOS ne récupère un Origin de formulaire absent que pour un initiateur local vérifié de la frame principale ; les initiateurs opaques ou inconnus restent non fiables. Conservez la validation CSRF. L’exemple utilise un jeton aléatoire et un cookie `__Host-` Secure, HttpOnly.
- Le harnais natif OpenNext enregistre la taille du bundle, le temps entre lancement et hydratation (transport et outils de lancement inclus) et, si disponible, le RSS du processus hôte après hydratation dans `demo/artifacts/opennext-native/*-performance.json`. Ce sont des mesures Debug à échantillon unique ; l’artefact identifie l’environnement d’exécution. Le RSS physique iOS n’est pas collecté et est indiqué par `null`. Le RSS exclut les processus distincts de rendu WebView/GPU ; ce n’est ni la mémoire totale ni le pic mémoire de l’application. Les échantillons Pixel 8a Android 17 couvrent l’exécution locale et distante ; celui de l’iPhone 15 Pro Max utilise un Worker déployé et D1 en HTTPS public. Les distributions de temps de démarrage des builds release et les pics mémoire restent non vérifiés.
