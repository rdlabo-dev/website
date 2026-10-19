---
title: "Void React Pages"
sourceRevision: 974c3f831f1e1a7f302fed9a277d899aeae20f7069e4fe5875bcf63bb5b7fd61
---

# Void React Pages

[Void](https://void.cloud/) compile les applications full-stack en un Cloudflare Worker et des ressources client. L’intégration ci-dessous cible **Void / @void/react 1.1.12, React Pages et D1**, avec le Worker distant existant. Cette configuration prend en charge iOS et Android par l’exécution distante du Worker. La compatibilité du runtime Void en local n’est pas établie.

## Compiler et connecter

Compilez d’abord normalement l’application Void existante, avec Node **24.21.0 ou ultérieur**. Conservez sa configuration `voidPlugin()` et `voidReact()`. Void produit `dist/ssr/index.js`, `dist/ssr/wrangler.json` et `dist/client/`.

Utilisez ces fichiers générés dans la configuration Vite 7 distincte de Capacitor. Ne modifiez ni la configuration Vite propre à Void ni sa version :

```ts
workersCapacitorPlugin({
  worker: "../dist/ssr/index.js",
  workerConfig: "../dist/ssr/wrangler.json",
  assetsExecution: "remote",
});
```

Ces chemins supposent que la racine du build Capacitor est un sous-répertoire de l’application tel que `capacitor/`. Séparez sa sortie du répertoire `dist/` de Void. La configuration générée fournit les bindings D1 et ASSETS ; il n’est pas nécessaire d’analyser `void.config.ts` ou de recopier manuellement les noms des bindings. Vérifiez dans le rapport `workers-capacitor-server.json` du build Capacitor que le mode d’exécution est `worker`.

Le point d’entrée Capacitor utilise l’API publique habituelle :

```ts
import { workersCapacitor } from "workers-capacitor";

const runtime = workersCapacitor({
  baseURL: "https://worker.invalid/",
  remote: { origin: "https://your-deployed-worker.example" },
  render: "/",
});
await runtime.ready;
```

Le Worker existant traite à distance les requêtes de pages, les loaders, les actions et les ressources. L’accès à D1 reste sur ce Worker. L’hôte de documents de la bibliothèque affiche la réponse sous forme de document ; consultez le [guide d’intégration](integration.md) pour l’installation de Capacitor, l’authentification et le rendu de documents. Le test natif utilise cette même configuration.

## Pages SSR et pages uniquement côté client

`export const ssr = false` supprime le HTML du composant de page rendu sur le serveur. Cela ne rend **pas** un loader utilisant D1 sûr à exécuter sur l’appareil. Gardez cette requête distante : Void obtient les données du loader sur le Worker et le navigateur effectue le rendu du composant. Les pages SSR ordinaires reçoivent le HTML initial et sont hydratées avec les ressources client de Void. Aucun des deux cas n’impose de convertir l’application existante en SPA ou de remplacer ses formulaires par des appels d’API personnalisés.

## Périmètre de vérification

L’[exemple autonome](../demo/void/README.md) et ses tests couvrent le Worker généré dans workerd local avec D1, le build distant Capacitor et le transport fetch, le HTML SSR initial, l’hydratation React et une action de formulaire avec assertion en base de données sous Chromium et WebKit. Une page uniquement côté client réutilise le même loader D1 : absente du HTML initial, elle apparaît après le rendu client. Les tests vérifient aussi l’absence du schéma et du code applicatif serveur dans le build pour l’appareil.

Le test navigateur remplace la transmission réseau par workerd local. Le test natif (`demo/tests/void/native.test.mjs`) utilise HTTPS et l’API publique de documents pour tester le SSR avec D1, l’hydratation, une insertion par formulaire avec assertion en base de données et le rendu uniquement côté client sur un simulateur iOS 26.1 et un émulateur Android API 36.

Utilisez **1.1.12 ou ultérieur** pour la navigation Capacitor sur iOS. [Void 1.1.12](https://github.com/voidzero-dev/void/releases/tag/v1.1.12) inclut notre [correction de navigation Capacitor intégrée en amont](https://github.com/voidzero-dev/void/pull/485). Les tests utilisent les paquets 1.1.12 publiés sans modifier le routeur ni l’origine par défaut `capacitor://localhost` de Capacitor. Les versions antérieures à 1.1.12 rejettent ce schéma ; une réponse HTML initiale ne suffit pas à établir le bon fonctionnement de la navigation.

La validation de Void sur appareil physique, l’intégration Cloudflare déployée, l’authentification en production, les événements des plugins natifs, Vue, Svelte, Solid, les autres bindings Void et l’exécution locale ne sont pas vérifiés.

L’authentification et l’autorisation restent à la charge de l’application. L’exemple ne possède aucune authentification et ne doit pas être déployé comme point d’accès aux données en production. La suppression du code serveur n’est pas un détecteur général de secrets ; n’intégrez jamais d’identifiants dans les pages client, les variables publiques ou la configuration Capacitor.
