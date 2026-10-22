---
title: "Prise en charge d’OpenNext et vinext"
sourceRevision: "480fa53a9a952f620a11d1e5dc698108c9148bc7ed06f06c14c3ea8ae9568c83"
---

# Prise en charge d’OpenNext et vinext

OpenNext et vinext utilisent le profil de compatibilité Workers. La prise en charge dépend du lieu d’exécution de la requête ; le rendu distant ne démontre pas la compatibilité locale du framework. L’[exemple OpenNext autonome](../demo/opennext/README.md) sépare ces parcours et garde ses pilotes de tests hors de l’application.

L’exemple par défaut utilise Next.js 16.4.2. La séparation des routes conserve aussi le profil de compatibilité exact Next.js 15.5.28 avec OpenNext 1.20.12. Cela ne prolonge pas la maintenance amont de Next.js 15. Pour cette ancienne version, compilez avec `next build` et `opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion` ; l’isolation des routes applique la même exception de période de support uniquement à 15.5.28. Utilisez `next build --webpack` pour 16.4.2 ; sa vérification de support reste active. Les middleware/proxy Node et formats de compilation inconnus restent entièrement distants.

## Exécution et configuration

### Exécution des routes

Pour la sortie App Router d’OpenNext 1.20.12 avec Next.js 16.4.2 compilée avec `next build --webpack`, les plugins Vite et esbuild peuvent séparer les routes GET statiques explicitement sélectionnées. Faites pointer `worker` vers le Worker généré ordinaire ; aucun script de préparation supplémentaire ni wrapper Worker n’est requis :

```ts
workersCapacitorPlugin({
  worker: "../.open-next/worker.js",
  assetsExecution: "remote",
  execution: [
    { method: "GET", path: "/" },
    { method: "GET", path: "/api/message" },
  ],
});
```

Le plugin utilise les sorties `.next` et `.open-next` existantes pour générer une entrée locale distincte. Il n’exécute pas `next build` et n’écrase pas le Worker déployé. Les autorisations portent sur les chemins d’enregistrement ; jokers et RegExp suivent les mêmes règles que les autorisations Hono. La correspondance réelle des requêtes reste exacte pour les routes statiques compatibles.

Les routes couvertes par un middleware, routes dynamiques/groupées, chemins non sélectionnés, méthodes autres que GET, requêtes porteuses d’identifiants et requêtes du protocole Next restent distants. La navigation RSC, Server Actions et l’exécution locale des middlewares ne sont pas prises en charge par cette séparation. Le rapport explique les enregistrements maintenus à distance. Si la sortie sélectionnée nécessite encore un environnement Cloudflare, toute la sélection reste distante.

Cette intégration accepte la configuration standard `defineCloudflareConfig` avec `incrementalCache`, `tagCache` et `queue` à `"dummy"`. Les autres versions, configurations OpenNext personnalisées, réécritures/en-têtes/redirections personnalisées/chemins de base Next et données d’environnement générées non publiques restent distantes. Conservez le Worker d’origine déployé et configurez `remote.origin` du runtime comme d’habitude. Les fichiers de runtime générés doivent rester à côté de l’entrée Worker.

L’autorisation d’une route inclut son implémentation et ses dépendances conservées. Ce n’est pas une détection de secrets : examinez le code partagé et les données fixes avant d’autoriser leur distribution. Le plugin isole les clés de prévisualisation/action connues générées par Next dans la sortie locale ; cela n’assainit pas des identifiants applicatifs arbitraires. Les `workerFiles` explicites et ressources publiques copiées restent sous la responsabilité de l’application.

La [fixture d’exécution des routes](../demo/tests/opennext/split/README.md) couvre Vite/esbuild et Chromium/WebKit. L’acceptation native de la séparation couvre iOS 26.1 et Android API 36.1, notamment hydratation, navigation RSC vers le Worker distant, événements de plugins natifs, sessions HttpOnly, modifications de formulaires D1, rejet CSRF, sessions expirées, persistance après redémarrage et déconnexion. Le scénario de routes HTTPS public passe aussi sur iPhone 15 Pro Max sous iOS 27.0.1 avec un Worker et D1 dédiés ; l’expiration est vérifiée dans les scénarios workerd locaux. Utilisez `OPENNEXT_SPLIT=1` avec le lanceur natif. La [fixture de décalage des versions](../demo/tests/opennext/releases/README.md) prépare des compilations client/Worker séparées pour tester un déploiement HTTP/formulaire compatible ; cela ne prouve pas la compatibilité de closures Server Action conservées ou de modifications incompatibles d’API/schéma.

### Exécution du Worker entier

- Avec D1 et un routage asset-first, le Worker OpenNext généré s’exécute entièrement à distance pour les requêtes non servies par les ressources embarquées. Configurez `worker: ".open-next/worker.js"`, `assetsExecution: "remote"` et l’URL HTTPS déployée `remote.origin`. L’application serveur est exclue du bundle de l’appareil. Ne définissez pas `workerFiles` : les fichiers explicitement choisis restent distribués et sont inutiles ici.
- L’exécution locale utilise le Worker généré dans un Dedicated Worker. Le profil réservé aux tests de l’exemple couvre pages SSR publiques, hydratation client, images/CSS statiques, liens Next.js et middlewares. Il ne fournit ni D1 ni ASSETS local. Cela démontre une exécution, pas un AppShell distribuable : le JavaScript serveur généré peut encore contenir du code réservé au serveur et des clés générées par Next. Retirer les métadonnées du système de fichiers ne rend pas ce JavaScript sûr à distribuer.
- Le plugin Vite transforme les appels `require()` intégrés aux fichiers ESM `.mjs` générés. C’est un réglage de compilation Capacitor ; la compilation Cloudflare reste indépendante.

### Embarquer des ressources client avec les pages distantes

Dans la configuration Vite Capacitor, faites pointer `publicDir` vers la sortie de ressources OpenNext existante. L’exemple utilise un chemin absolu résolu relativement au fichier de configuration :

```ts
export default defineConfig({
  root: here("."),
  publicDir: here("../.open-next/assets"),
  plugins: [
    workersCapacitorPlugin({
      worker: here("../.open-next/worker.js"),
      assetsExecution: "remote",
    }),
  ],
  build: { outDir: here("../www"), emptyOutDir: true },
});
```

Consultez la [configuration complète](../demo/opennext/capacitor/vite.config.ts) pour les imports et `here`. Le JavaScript `/_next/static/`, le CSS et les images publiques embarqués sont servis par Capacitor. HTML, navigation RSC, middleware, sessions, opérations D1 et `/_next/image` restent sur le Worker. Hydratation et événements client s’exécutent dans la WebView avec les scripts embarqués. Le `mode: "worker"` du rapport décrit le gestionnaire serveur ; cela ne signifie pas que toutes les ressources sont distantes.

Utilisez la même compilation applicative pour le Worker déployé et les ressources embarquées, et préservez la compatibilité avec les anciennes applications installées lors des mises à jour. Les chemins absents retombent sur le Worker. Copiez uniquement des ressources publiques pouvant contourner authentification serveur et règles d’en-têtes ; Capacitor n’implémente ni `_headers` ni `_redirects` Cloudflare pour les fichiers embarqués. Ni `publicDir` de Vite ni une simple copie esbuild ne respecte `.assetsignore`. Vérifiez que la copie ne contient que des fichiers publics ; si elle inclut des fichiers exclus de la diffusion Cloudflare, préparez uniquement les ressources publiques souhaitées dans un répertoire distinct. Ne copiez ni server-functions ni cache de prérendu dans `publicDir`. Une page prérendue peut encore nécessiter middleware, redirections ou revalidation ; le prérendu seul ne sélectionne donc pas une page pour l’exécution locale. Les requêtes initiales nécessitent toujours une connexion.

Avec esbuild, copiez la sortie de ressources publiques dans le répertoire Capacitor **avant** d’appeler `build()` avec `workersCapacitorPlugin`. Le plugin inclut les fichiers existants dans le manifeste des ressources de documents. Séparez le `index.html` de démarrage des pages du framework et évitez les collisions de chemins. Aucune API supplémentaire de ressources n’est nécessaire.

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

## Fichiers explicites du runtime (`workerFiles`)

Les répertoires de compilation serveur ne sont pas copiés dans le système de fichiers de l’appareil. Une extension `.json` ne prouve pas qu’un fichier est public : les manifestes Next.js peuvent contenir des clés et configurations générées côté serveur. Le moteur local testé n’a pas besoin de ces fichiers à côté de son code embarqué.

Les données publiques de l’application lues via `node:fs` peuvent être sélectionnées dans `workerFiles` par chemins individuels (pas des répertoires). Ces fichiers sont distribués tels quels ; choisissez uniquement les données destinées à tous les utilisateurs :

```ts
workersCapacitorPlugin({
  worker: "./src/worker.ts",
  execution: "local", // Uniquement pour le code et les dépendances autorisés sur tous les appareils.
  // Données publiques lues par ce Worker local :
  workerFiles: ["./templates/email.txt"],
});
```

Les recherches VFS normalisent les séparateurs et comparent les suffixes : les chemins absolus tracés sont donc résolus quel que soit le répertoire de compilation du bundle.

## Contexte asynchrone (la véritable frontière)

- Les plugins Vite/esbuild Capacitor abaissent les fonctions async et les générateurs en continuations Promise tout en préservant `await` au niveau supérieur. L’implémentation de compatibilité capture le contexte à l’enregistrement du callback et le restaure après chaque portée synchrone. Les portées async concurrentes et imbriquées utilisent des stores distincts ; la sérialisation des acheminements n’est plus nécessaire pour le contrat ALS partagé.
- Les callbacks async natifs non transformés passés à `run`/`exit` sont rejetés avant exécution, au lieu de laisser fuiter silencieusement le store d’une autre requête. Le code dynamique et les modules compilés ailleurs doivent participer à la même transformation.
- Les transformations et alias appartiennent uniquement au build Capacitor. Cloudflare conserve son `node:async_hooks` natif ; les sources de l’application Worker restent inchangées.
- Les modifications en mode direct affectent aussi le contexte global de l’interface. Préférez un Worker isolé pour les applications dépendant d’ALS. La validation native complète d’OpenNext reste distincte du contrat ALS partagé.

## Validation d’applications amont

La [fixture officielle de validation App Router](../demo/tests/upstream/opennext/README.md) épingle une application OpenNext amont et préserve ses sources et sa configuration. Elle couvre les Server Actions hydratées, les actions de formulaire avec redirections/paramètres de requête et le SSR différé avec un affichage de chargement Suspense. Les tests natifs exercent l’exécution distante du Worker et l’hydratation WebView via l’API publique ; ils ne démontrent pas la prise en charge locale des Server Actions. La base navigateur s’exécute séparément dans la CI. Consultez la fixture pour les commandes de reproduction et les limites des tests de proxy/streaming.

## Lacunes actuelles

- Les scénarios natifs de l’exemple couvrent les pages publiques et les flux D1/session distants, pas des applications Next.js arbitraires ni les performances de builds release.
- **Bindings :** utilisez la [configuration des bindings distants](cloudflare-bindings.md) pour les services cloud ou KV local explicite en mode direct. ASSETS reste uniquement distant. Ces intégrations générales ne prouvent pas la compatibilité des caches/bindings OpenNext ; la configuration de vérification utilise des caches factices.
- `createRequire` charge uniquement `.json` ; les fichiers exécutables tracés doivent déjà être empaquetés par OpenNext (ils le sont).
- `/_next/image` utilise le binding IMAGES du Worker distant. La fixture `/images` vérifie une véritable transformation PNG vers WebP et les dimensions via le rendu natif. Le scénario HTTPS public vérifie aussi le binding Cloudflare IMAGES déployé sur iPhone 15 Pro Max sous iOS 27.0.1 sans installer d’autorité de certification de test. Les loaders `cdn-cgi` personnalisés restent non vérifiés.
- L’hôte de documents préserve Origin/Fetch Metadata observés. iOS reconstitue une origine de formulaire absente uniquement pour un initiateur local vérifié de frame principale ; les initiateurs opaques ou inconnus restent non fiables. Conservez la validation CSRF. L’exemple utilise un jeton aléatoire et un cookie `__Host-` Secure, HttpOnly.
- L’acceptation native vérifie le fonctionnement. Les anciens artefacts uniques de durée Debug, taille de bundle et RSS du processus hôte étaient exploratoires, pas des seuils de régression ; le banc fonctionnel ne les collecte plus. Les distributions de démarrage release et les pics mémoire restent non vérifiés.
