---
title: "Void React Pages"
sourceRevision: "95de7c234db503cdd1ba352d442e207d89418332047b8da48ad67fe26da4dcfb"
---

# Void React Pages

[Void](https://void.cloud/) compile des applications full-stack en Worker Cloudflare et ressources client. L’intégration ci-dessous cible **Void / @void/react 1.1.12, React Pages et D1**, avec ressources client embarquées et Worker distant existant. Des autorisations explicites de routes peuvent aussi distribuer des gestionnaires GET publics admissibles sur l’appareil.

## Porter votre application Void sur mobile

Continuez à développer avec Void et ajoutez une version iOS et Android pour vos utilisateurs. Ce guide raccorde le Worker et les ressources client déjà générés par Void à la compilation mobile.

Pour votre première application mobile, commencez par la [configuration Capacitor](integration.md#2-install-capacitor-and-this-package), puis utilisez la configuration Void ci-dessous dans sa compilation mobile distincte. Vous avez déjà une application native ? Suivez le [guide d’intégration iOS ou Android](native-embedding.md) et choisissez l’entrée du runtime de cet hôte avec la même configuration de compilation.

Les preuves d’acceptation ci-dessous couvrent l’intégration Capacitor ; intégrer Void dans une application native existante nécessite encore de vérifier les parcours de votre application.

## Compiler et connecter

Compilez d’abord normalement l’application Void existante, avec Node **24.21.0 ou ultérieur**. Conservez sa configuration `voidPlugin()` et `voidReact()`. Void produit `dist/ssr/index.js`, `dist/ssr/wrangler.json` et `dist/client/`.

Utilisez ces fichiers générés dans la configuration Vite 7 distincte de Capacitor. Ne modifiez ni la configuration Vite propre à Void ni sa version :

```ts
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "cf-workers-native/tooling/vite";

export default defineConfig({
  publicDir: "../dist/client",
  plugins: [
    workersCapacitorPlugin({
      worker: "../dist/ssr/index.js",
      workerConfig: "../dist/ssr/wrangler.json",
      assetsExecution: "remote",
    }),
  ],
  build: { outDir: "../www", emptyOutDir: true },
});
```

Ces chemins supposent que la racine du build Capacitor est un sous-répertoire de l’application tel que `capacitor/`. Séparez sa sortie du répertoire `dist/` de Void. La configuration générée fournit les bindings D1 et ASSETS ; il n’est pas nécessaire d’analyser `void.config.ts` ou de recopier manuellement les noms des bindings. Vérifiez dans le rapport `workers-capacitor-server.json` du build Capacitor que le mode d’exécution est `worker`.

Le point d’entrée Capacitor utilise l’API publique habituelle :

```ts
import { workersCapacitor } from "cf-workers-native/capacitor";

const runtime = workersCapacitor({
  baseURL: "https://worker.invalid/",
  remote: { origin: "https://your-deployed-worker.example" },
  render: "/",
});
await runtime.ready;
```

Le Worker existant traite les requêtes de pages, loaders et actions. L’accès D1 y reste. `publicDir` copie les ressources client générées dans l’application native ; l’hôte de documents sert leurs chemins exacts localement, donc hydratation et interactions utilisent le JavaScript et le CSS embarqués. `assetsExecution: "remote"` conserve le binding ASSETS du Worker distant ; cela n’empêche pas de servir les fichiers embarqués. Le `mode: "worker"` du rapport décrit l’exécution serveur, pas la livraison des ressources. L’hôte de documents affiche la réponse comme document ; consultez le [guide d’intégration](integration.md) pour l’installation Capacitor, l’authentification et le rendu. Le test natif utilise cette même configuration.

## Exécution de routes GET publiques

Les plugins reconnaissent la sortie générée de Void 1.1.12 exactement lorsque `execution` contient des autorisations GET explicites. Ils peuvent isoler les gestionnaires HTTP publics statiques et React Pages sans dépendance serveur. Les routes D1, mutations, requêtes avec Cookie ou Authorization, chemins dynamiques et internes au framework restent distants. Les middlewares, layouts et configurations head personnalisés empêchent cette optimisation. Les enregistrements inconnus sont rejetés plutôt que de perdre leur middleware.

Ajoutez des autorisations au plugin Capacitor, par exemple `execution: [{ method: "GET", path: "/about" }, { method: "GET", path: "/api/hello" }]`. Vérifiez `workers-capacitor-server.json` : `mode: "routes"` et le champ `remote` de chaque route expliquent le résultat. Une autorisation permet de distribuer le gestionnaire sélectionné et ses données fixes conservées ; elle ne prouve pas que ces données sont publiques. Utilisez l’URL HTTPS du Worker déployé comme `baseURL` pour les autres requêtes ; un `remote.origin` explicite peut remplacer cette destination.

Le test d’acceptation navigateur vérifie Vite et esbuild dans Chromium et WebKit, notamment exécution SSR/API publique, sélection distante et exclusion du code de base de données du JavaScript et des source maps. Après compilation de la bibliothèque, reproduisez-le avec `npm --prefix demo run test:void:routes`. L’acceptation native utilise Vite sur simulateur iOS 26.1 et émulateur Android API 36.1. Elle vérifie SSR public local, mise à jour d’état React hydraté, accès API local, sélection distante authentifiée, insertion par formulaire D1 avec assertion en base et navigation vers une page uniquement cliente. Exécutez les plateformes en série :

```sh
VOID_ROUTES=1 UPSTREAM_PLATFORM=ios UPSTREAM_DEVICE=<simulator-UUID> node --test demo/tests/void/native.test.mjs
VOID_ROUTES=1 UPSTREAM_PLATFORM=android UPSTREAM_DEVICE=<emulator-serial> node --test demo/tests/void/native.test.mjs
```

C’est un profil de routes générées, pas une compatibilité générale avec un runtime Void local. Les générateurs inconnus et configurations de routage incompatibles conservent la limite Worker distante.

## Pages SSR et pages uniquement côté client

`export const ssr = false` supprime le HTML du composant de page rendu sur le serveur. Cela ne rend **pas** un loader utilisant D1 sûr à exécuter sur l’appareil. Gardez cette requête distante : Void obtient les données du loader sur le Worker et le navigateur effectue le rendu du composant. Les pages SSR ordinaires reçoivent le HTML initial et sont hydratées avec les ressources client de Void. Aucun des deux cas n’impose de convertir l’application existante en SPA ou de remplacer ses formulaires par des appels d’API personnalisés.

## Périmètre de vérification

L’[exemple autonome](../demo/void/README.md) et ses tests couvrent le Worker généré dans workerd local avec D1, la compilation distante Capacitor et le transport fetch, le HTML SSR initial, l’hydratation React et une action de formulaire avec assertion en base dans Chromium et WebKit. Une page uniquement cliente réutilise le même loader D1 ; absente du HTML initial, elle apparaît après rendu client. Les tests vérifient aussi l’absence de schéma serveur et de SQL dans la compilation de l’appareil. Les composants client sont volontairement inclus.

Le test navigateur remplace la transmission réseau par workerd local. Le test natif (`demo/tests/void/native.test.mjs`) utilise HTTPS et l’API publique de documents pour tester le SSR avec D1, l’hydratation, une insertion par formulaire avec assertion en base de données et le rendu uniquement côté client sur un simulateur iOS 26.1 et un émulateur Android API 36.

Utilisez **1.1.12 ou ultérieur** pour la navigation Capacitor sur iOS. [Void 1.1.12](https://github.com/voidzero-dev/void/releases/tag/v1.1.12) inclut notre [correction de navigation Capacitor intégrée en amont](https://github.com/voidzero-dev/void/pull/485). Les tests utilisent les paquets 1.1.12 publiés sans modifier le routeur ni l’origine par défaut `capacitor://localhost` de Capacitor. Les versions antérieures à 1.1.12 rejettent ce schéma ; une réponse HTML initiale ne suffit pas à établir le bon fonctionnement de la navigation.

L’acceptation propre à Void sur appareil physique, l’intégration Cloudflare déployée, l’authentification de production, les événements de plugins natifs, Vue, Svelte, Solid, les autres bindings Void et l’exécution locale du Worker entier ne sont pas vérifiés.

Compilez le Worker et les ressources Capacitor à partir de la même compilation applicative. Déployer indépendamment des versions client/serveur différentes peut casser l’hydratation ou les actions ; une ancienne application installée doit rester compatible avec votre Worker déployé. Les chemins absents du bundle rejoignent toujours le Worker.

Embarquez uniquement des fichiers publics pouvant contourner authentification, middleware et règles d’en-têtes Worker. Capacitor n’applique ni `_headers` ni `_redirects` Cloudflare aux ressources embarquées. Vite ne respecte pas non plus `.assetsignore` généré par Void : y lister `.dev.vars` ou `wrangler.json` ne les exclut pas du bundle natif. Inspectez `dist/client` avant copie. S’il contient des fichiers exclus de la diffusion Cloudflare, préparez uniquement les ressources publiques souhaitées dans un répertoire distinct utilisé comme `publicDir`. N’incluez pas de données privées, sorties serveur, `_headers` ou `_redirects` dans les fichiers copiés. Le HTML prérendu n’est pas automatiquement sélectionné pour un rendu local. Cette configuration nécessite toujours une connexion pour les pages initiales et les opérations D1 ; ce n’est pas du SSR hors ligne.

L’authentification et l’autorisation restent à la charge de l’application. L’exemple ne possède aucune authentification et ne doit pas être déployé comme point d’accès aux données en production. La suppression du code serveur n’est pas un détecteur général de secrets ; n’intégrez jamais d’identifiants dans les pages client, les variables publiques ou la configuration Capacitor.
