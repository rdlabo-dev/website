---
title: "Configuration du build"
sourceRevision: 316c7e29f6060cdd927aa021bad5b1b210ae8525f1c76add44fd7f862758c532
---

# Configuration du build

Choisissez d’abord le framework de votre application, puis configurez l’outil de build utilisé pour son intégration Capacitor. Le guide du framework identifie le point d’entrée du Worker et la frontière d’exécution ; le plugin de l’outil connecte ce point d’entrée à l’application mobile. Gardez le build Cloudflare existant séparé.

## Frameworks

Les intégrations suivantes disposent d’exemples et de résultats de vérification. La prise en charge se limite aux chemins d’exécution décrits ici ; consultez les [limites de compatibilité](compatibility.md) pour les restrictions d’API et d’application.

| Framework | Exécution et périmètre vérifié | Configuration |
| --- | --- | --- |
| Hono | Gestionnaires Fetch et pages HTML locaux ; les fixtures Hono testent le routage, les formulaires et le comportement des requêtes/réponses. Les requêtes dépendant du cloud utilisent l’acheminement distant. | [Point d’entrée Hono](#hono), [exemple de rendu natif](../demo/rendering) |
| Workers Express | Exécution locale via `cloudflare:node` ; fixtures d’API et de rendu HTML. Les requêtes dépendant du cloud utilisent l’acheminement distant. | [Point d’entrée Workers Express](#workers-express), [exemple de rendu natif](../demo/rendering) |
| Void React Pages | SSR, loaders et actions sur le Worker distant ; hydratation client et formulaires dans la WebView. Utilisez Void / @void/react 1.1.12 ou ultérieur ; les paquets 1.1.12 publiés réussissent la validation sur simulateur iOS et émulateur Android. | [Configuration et vérification de Void](void.md) |
| Next.js / OpenNext | L’exemple avec D1 utilise le Worker distant entier. Un profil local distinct vérifie les pages SSR publiques, l’hydratation, les liens et les ressources ; il ne démontre pas la prise en charge locale de D1 ou d’ASSETS. | [Configuration et limites d’OpenNext](opennext.md) |

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

Utilisez le plugin [Vite](#vite) ou [esbuild](#esbuild) uniquement dans le build Capacitor/navigateur, jamais dans le build Cloudflare. Il fournit des adaptateurs `node:http` et `node:net` compatibles Workers, ainsi que des polyfills navigateur ; l’[inventaire de compatibilité](compatibility.md) consigne la base et les modules vérifiés. `listen(3000)` enregistre un gestionnaire en mémoire, pas un port TCP en écoute. Le plugin prend en charge Hono et Workers Express ; le code du framework reste inchangé.

#### Types TypeScript

Le paquet fournit le type `cloudflare:node` pour son adaptateur `httpServerHandler` pris en charge. Pour un build navigateur sans déclarations de types Workers existantes, ajoutez-le à `compilerOptions.types` dans `tsconfig.json` :

```json
{ "compilerOptions": { "types": ["workers-capacitor/cloudflare/apis/types"] } }
```

Conservez les autres types déjà utilisés par votre projet. Ce point d’entrée ne fournit que des types ; ne l’importez pas à l’exécution. Les projets ayant des types Workers générés doivent conserver ces déclarations. Aucun fichier `cloudflare.d.ts` ou `client.d.ts` propre à l’application n’est nécessaire.

### Angular sur Workers

Cette intégration n’est pas encore vérifiée. La cible est une **application Angular SSR existante déployée sur Cloudflare Workers**, en préservant son rendu, son routage et son hydratation lors du portage vers Capacitor. Une configuration dédiée du point d’entrée Worker et un exemple de validation sont encore nécessaires avant de pouvoir l’annoncer comme prise en charge.

La prise en charge de Vite ou d’esbuild ne suffit pas à établir celle d’Angular SSR. L’intégration Fetch uniquement d’un frontend distinct est un autre cas d’usage.

## Outils

Ces versions concernent le build Capacitor distinct. Le build cloud existant d’un framework peut utiliser un autre outil ou une autre version ; conservez-le et connectez son Worker généré comme décrit dans le guide du framework.

| Build | Configuration | Entrée |
| --- | --- | --- |
| Vite 7 | Plugin `workers-capacitor/tooling/vite` | Points d’entrée Worker TypeScript / JavaScript, y compris les sorties de frameworks décrites ci-dessus |
| esbuild 0.28 | Plugin `workers-capacitor/tooling/esbuild` | Points d’entrée Worker TypeScript / JavaScript, y compris les sorties de frameworks décrites ci-dessus |
| Modules ES du navigateur | Source Worker explicite ci-dessous | JavaScript compatible navigateur uniquement |

Les autres bundlers ne sont pas actuellement pris en charge. Ajoutez ces plugins uniquement au build Capacitor/navigateur, jamais au build Cloudflare.

### Vite

Ajoutez le plugin à la configuration Vite Capacitor/navigateur :

```ts
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "workers-capacitor/tooling/vite";

export default defineConfig({
  plugins: [workersCapacitorPlugin({ worker: "./src/worker.ts" })],
});
```

`src/worker.ts` est le point d’entrée de votre application existante qui exporte un gestionnaire Fetch (par exemple `export default app` de Hono), pas un module de transport de la bibliothèque. Le chemin `worker` du plugin est relatif à la racine Vite (les chemins absolus fonctionnent aussi). Le plugin connecte ce point d’entrée à l’import habituel du paquet ; aucun import spécial ni fichier source généré n’est nécessaire dans le code applicatif.

### esbuild

Pour esbuild, utilisez le même code applicatif avec cette configuration de build :

```js
import { build } from "esbuild";
import { workersCapacitorPlugin } from "workers-capacitor/tooling/esbuild";

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

`worker.js` exporte le gestionnaire Fetch existant. Toutes ses dépendances doivent aussi être des modules ES compatibles navigateur avec des URL résolubles. Ce parcours ne transforme ni TypeScript, ni les imports npm nus, ni les API Node, ni les imports `cloudflare:*`. L’équivalent public empaqueté de `lib/browser/isolated/transport.js` est `workers-capacitor/browser/isolated`.
