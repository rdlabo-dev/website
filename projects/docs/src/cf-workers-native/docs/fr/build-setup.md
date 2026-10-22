---
title: "Configuration du build"
sourceRevision: "c8207e44e81bc309f7ec6f13387ef9b4f048d9a56d3bcaa0e35b952a2cf149a0"
---

# Configuration du build

Choisissez d’abord le framework de votre application, puis configurez l’outil de compilation utilisé pour son intégration iOS, Android ou Capacitor. Le guide du framework identifie le point d’entrée Worker et les limites d’exécution ; le plugin de compilation relie cette entrée à l’application mobile. Conservez une compilation Cloudflare distincte.

Utilisez une configuration et un répertoire de sortie distincts pour la compilation mobile. Le plugin lit le point d’entrée serveur et la configuration de déploiement ; il génère une copie mobile sans réécrire ces entrées. Vite rejette les environnements SSR/serveur et les configurations contenant le plugin Cloudflare Vite. Les deux outils rejettent les répertoires de sortie contenant des entrées serveur connues et les liens existants dans ces répertoires afin d’éviter les écritures à travers ceux-ci. Ne réutilisez pas un répertoire de déploiement Cloudflare arbitraire comme sortie mobile : le plugin ne peut pas identifier tous les répertoires personnalisés. La compilation des routes OpenNext utilise un répertoire jetable dans `node_modules/.cache/workers-capacitor/opennext`, hors de `.next` et `.open-next`.

Ces limites de compilation préservent le déploiement Cloudflare existant. Les choix explicites du client, comme l’exécution locale, l’origine distante et `getToken`, contrôlent toujours les requêtes qui l’atteignent et l’authentification du client ; ils ne modifient ni les routes, ni l’autorisation, ni les bindings du serveur.

## Choisir le point d’entrée du runtime

Le plugin du bundler reste `workersCapacitorPlugin` pour tous les hôtes. Seul l’import du runtime applicatif change ; le code Worker et les options d’exécution sont partagés.

| Hôte | Import du runtime | Configuration native |
| --- | --- | --- |
| iOS | `workersIOS` depuis `cf-workers-native/ios` | [UIKit / SwiftUI](native-embedding.md#ios) |
| Android | `workersAndroid` depuis `cf-workers-native/android` | [Application Android existante](native-embedding.md#android) |
| Capacitor | `workersCapacitor` depuis `cf-workers-native/capacitor` | [Application Capacitor](integration.md) |

Utilisez `cf-workers-native@0.1.2` avec les dépendances natives correspondantes ; consultez la [configuration des dépendances](native-embedding.md#dependency-setup). Compilez l’entrée correspondant à chaque cible, puis empaquetez tout le répertoire de sortie. Les exemples Capacitor ci-dessous utilisent `workersCapacitor` ; les mêmes options s’appliquent à `workersIOS` et `workersAndroid` dans leurs hôtes SDK.

## Frameworks

Les intégrations suivantes disposent d’exemples et de résultats de vérification. La prise en charge se limite aux chemins d’exécution décrits ici ; consultez les [limites de compatibilité](compatibility.md) pour les restrictions d’API et d’application.

| Framework | Exécution et périmètre vérifié | Configuration |
| --- | --- | --- |
| Hono | Gestionnaires Fetch et pages HTML locaux ; routage, formulaires et comportement requête/réponse testés dans les fixtures Hono. Les requêtes dépendant du cloud utilisent l’envoi distant. | [Entrée Hono](#hono), [exemple de rendu natif](../demo/rendering) |
| Workers Express | Exécution locale via `cloudflare:node` ; fixtures API et rendu HTML. Les requêtes dépendant du cloud utilisent l’envoi distant. | [Entrée Workers Express](#workers-express), [exemple de rendu natif](../demo/rendering) |
| Void React Pages | SSR, loaders et actions sur le Worker distant ; hydratation et formulaires dans la WebView. Utilisez Void / @void/react 1.1.12 ou ultérieur ; les packages 1.1.12 publiés passent les tests d’acceptation sur simulateur iOS et émulateur Android. | [Configuration et vérification Void](void.md) |
| Next.js / OpenNext | Exécution réseau par défaut. Les compilations générées compatibles peuvent sélectionner des routes GET statiques en local tout en conservant D1, middleware et requêtes du protocole Next à distance ; consultez les limites de version et de configuration. | [Configuration et limites OpenNext](opennext.md) |

### Hono

Connectez le gestionnaire Fetch existant de l’application. Par exemple :

```ts
import { Hono } from "hono";

const app = new Hono();
app.get("/", (c) => c.html("<h1>Hello from Hono</h1>"));
app.get("/api/hello", (c) => c.json({ hello: "world" }));
export default app;
```

Faites pointer l’option `worker` du plugin [Vite](#vite) ou [esbuild](#esbuild) sur ce point d’entrée. Utilisez `render: "/"` pour les pages gérées par le Worker, ou omettez `render` pour intégrer un frontend existant à l’API. Suivez le [guide d’intégration de l’application](integration.md) pour la configuration Capacitor, les bindings cloud et l’authentification.

Commencez avec `execution: "network"` par défaut et définissez `baseURL` sur l’URL HTTPS du Worker déployé. Les requêtes distantes utilisent son origine, sauf si vous définissez explicitement `remote.origin` sur une autre origine déployée. Pour autoriser la distribution de certaines implémentations sur l’appareil, définissez `execution` comme tableau de routes. Les chemins Hono tels que `/app/*` sont pris en charge. L’autorisation inclut les données conservées des dépendances et ne remplace pas les limites serveur détectées. Consultez la [sélection des routes locales](cloudflare-bindings.md#selecting-local-routes).

### Workers Express

L’exemple utilise le véritable paquet `express` et le style de point d’entrée Workers :

```ts
import express from "express";
import { httpServerHandler } from "cloudflare:node";

const app = express();
app.use(express.json());
app.get("/api/hello", (_req, res) => res.json({ hello: "world" }));
app.listen(3000);
export default httpServerHandler({ port: 3000 });
```

Utilisez le plugin [Vite](#vite) ou [esbuild](#esbuild) uniquement dans la compilation mobile/navigateur, jamais dans celle de Cloudflare. Il fournit des adaptateurs `node:http` et `node:net` compatibles Workers avec des polyfills navigateur ; l’[inventaire de compatibilité](compatibility.md) répertorie la base et les modules vérifiés. `listen(3000)` enregistre un gestionnaire en mémoire, pas un port TCP d’écoute. Le plugin prend en charge Hono et Workers Express ; le code du framework reste inchangé.

La valeur par défaut `execution: "network"` conserve tout le Worker à distance. Définissez `baseURL` dans `workersCapacitor()` sur l’URL HTTPS du Worker déployé ; définissez `remote.origin` uniquement si l’origine distante doit différer de celle de `baseURL`. Pour une application Express volontairement autonome, ajoutez `execution: "local"` aux options du plugin Vite ou esbuild ci-dessous. Cela autorise la distribution de toute l’implémentation Worker et de ses données fixes conservées sur l’appareil ; ne l’utilisez pas avec des secrets serveur. Les bindings serveur configurés font échouer la compilation `local`. Consultez les [politiques d’exécution](cloudflare-bindings.md#choosing-execution).

#### Types TypeScript

Le paquet fournit le type `cloudflare:node` pour son adaptateur `httpServerHandler` pris en charge. Pour un build navigateur sans déclarations de types Workers existantes, ajoutez-le à `compilerOptions.types` dans `tsconfig.json` :

```json
{ "compilerOptions": { "types": ["cf-workers-native/cloudflare/apis/types"] } }
```

Conservez les autres types déjà utilisés par votre projet. Ce point d’entrée ne fournit que des types ; ne l’importez pas à l’exécution. Les projets ayant des types Workers générés doivent conserver ces déclarations. Aucun fichier `cloudflare.d.ts` ou `client.d.ts` propre à l’application n’est nécessaire.

### Angular sur Workers

Cette intégration n’est pas encore vérifiée. La cible est une **application Angular SSR existante déployée sur Cloudflare Workers**, en préservant son rendu, son routage et son hydratation lors du portage vers Capacitor. Une configuration dédiée du point d’entrée Worker et un exemple de validation sont encore nécessaires avant de pouvoir l’annoncer comme prise en charge.

La prise en charge de Vite ou d’esbuild ne suffit pas à établir celle d’Angular SSR. L’intégration Fetch uniquement d’un frontend distinct est un autre cas d’usage.

## Outils

Ces versions concernent la compilation mobile distincte. La compilation cloud existante du framework peut utiliser un autre outil ou une autre version ; conservez-la et raccordez son Worker généré comme décrit dans le guide du framework.

| Build | Configuration | Entrée |
| --- | --- | --- |
| Vite 7 | Plugin `cf-workers-native/tooling/vite` | Points d’entrée Worker TypeScript / JavaScript, y compris les sorties de frameworks décrites ci-dessus |
| esbuild 0.28 | Plugin `cf-workers-native/tooling/esbuild` | Points d’entrée Worker TypeScript / JavaScript, y compris les sorties de frameworks décrites ci-dessus |
| Modules ES du navigateur | Source Worker explicite ci-dessous | JavaScript compatible navigateur uniquement |

Les autres bundlers ne sont pas actuellement pris en charge. Ajoutez ces plugins uniquement à la compilation mobile/navigateur, jamais à celle de Cloudflare.

### Vite

Ajoutez le plugin à la configuration Vite mobile/navigateur :

```ts
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "cf-workers-native/tooling/vite";

export default defineConfig({
  plugins: [workersCapacitorPlugin({ worker: "./src/worker.ts" })],
});
```

`src/worker.ts` est le point d’entrée de votre application existante qui exporte un gestionnaire Fetch (par exemple `export default app` de Hono), pas un module de transport de la bibliothèque. Le chemin `worker` du plugin est relatif à la racine Vite (les chemins absolus fonctionnent aussi). Le plugin connecte ce point d’entrée à l’import habituel du paquet ; aucun import spécial ni fichier source généré n’est nécessaire dans le code applicatif.

### esbuild

Pour esbuild, utilisez le même code applicatif avec cette configuration de build :

```js
import { build } from "esbuild";
import { workersCapacitorPlugin } from "cf-workers-native/tooling/esbuild";

await build({
  entryPoints: ["src/main.ts"],
  outdir: "www",
  bundle: true,
  format: "esm",
  platform: "browser",
  plugins: [workersCapacitorPlugin({ worker: "./src/worker.ts" })],
});
```

Le chemin du point d’entrée est relatif à `absWorkingDir` (ou au répertoire courant). Servez tout le répertoire de sortie, y compris les ressources Worker émises et les modules directs chargés à la demande. La compilation du Worker utilise les transformations de compatibilité du plugin ; les plugins applicatifs supplémentaires ne sont pas appliqués au bundle Worker. Une sortie ESM navigateur avec `outdir` ou `outfile` est obligatoire. Les points d’entrée Worker doivent être regroupés en un seul fichier JavaScript ; les ressources CSS/fichiers distinctes ne sont pas prises en charge.

### Modules ES du navigateur (sans bundler)

Ce parcours concerne l’intégration Fetch uniquement et ne prépare pas automatiquement les ressources de documents natifs. Sans bundler, copiez le répertoire `dist` du paquet dans votre répertoire public `lib` et utilisez des imports relatifs de modules ES ordinaires :

```js
// main.js (chargé avec <script type="module">)
import { workersCapacitor } from "./lib/index.js";

const runtime = workersCapacitor({
  baseURL: "https://api.example.com/api/",
  worker: {
    createWorker: () =>
      new Worker(new URL("./worker-entry.js", import.meta.url), {
        type: "module",
      }),
    loadDirect: async () => (await import("./worker.js")).default,
  },
});
await runtime.ready;
```

```js
// worker-entry.js
import { serve } from "./lib/browser/isolated/transport.js";
import worker from "./worker.js";
serve(worker);
```

`worker.js` exporte le gestionnaire Fetch existant. Toutes ses dépendances doivent aussi être des modules ES compatibles navigateur avec des URL résolubles. Ce parcours ne transforme ni TypeScript, ni les imports npm nus, ni les API Node, ni les imports `cloudflare:*`. L’équivalent public empaqueté de `lib/browser/isolated/transport.js` est `cf-workers-native/browser/isolated`.
