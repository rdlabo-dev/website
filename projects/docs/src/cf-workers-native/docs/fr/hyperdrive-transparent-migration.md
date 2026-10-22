---
title: "Workers utilisant Hyperdrive dans Capacitor"
sourceRevision: "3bd74381f2f8b48f2d4bc20323a0d3d3bde1d0ff6399f26e302eb6c9271578ca"
---

# Workers utilisant Hyperdrive dans Capacitor

Réutilisez le point d’entrée Worker, les routes, le pilote de base de données et le SQL existants. Le build Capacitor génère l’acheminement HTTP des opérations serveur vers le Worker déployé :

```text
Capacitor: POST /api/orders
  → HTTPS https://existing-worker.example/api/orders
  → existing Worker authentication, authorization and validation
  → existing database driver → Hyperdrive → PostgreSQL or MySQL
  → existing HTTP response → Capacitor
```

Le client envoie la requête HTTP existante, pas du SQL ni un protocole de base de données. Le binding, les identifiants, le pooling et le cache d’Hyperdrive restent sur Cloudflare. Ce paquet n’émule pas Hyperdrive, ne connecte pas l’appareil mobile à la base d’origine, ne crée pas de point d’accès SQL générique et ne déploie pas le serveur.

## Configuration

Conservez la configuration Wrangler existante avec les entrées `hyperdrive` (environnements nommés inclus). Le plugin Vite/esbuild ne lit que les noms de bindings ; les identifiants et valeurs de `localConnectionString` ne sont pas copiés vers le client.

```ts
// vite.config.ts de Capacitor
import { workersCapacitorPlugin } from "cf-workers-native/tooling/vite";
export default {
  plugins: [workersCapacitorPlugin({ worker: "worker/src/index.ts" })],
};
```

La configuration Wrangler JSON, JSONC ou TOML la plus proche du point d’entrée Worker est utilisée, avec repli vers la racine du build. Pour sélectionner un autre fichier, utilisez `workerConfig` (relatif à la racine du build). Pour les autres outils de configuration, fournissez `hyperdriveBindings: ["HYPERDRIVE"]`. Les valeurs explicites `d1Bindings` et `hyperdriveBindings` remplacent la découverte uniquement pour leur propre type de binding. D1 et Hyperdrive peuvent coexister. Une liste vide explicite désactive la découverte pour ce type ; ne la désactivez pas pour les bindings serveur réellement utilisés par le Worker.

```ts
import { workersCapacitor } from "cf-workers-native/capacitor";
const runtime = workersCapacitor({
  baseURL: "https://local.invalid/",
  remote: {
    origin: "https://existing-worker.example",
    // Facultatif : utiliser la session utilisateur existante de l’application.
    getToken: () => existingSession.getToken(),
  },
});
await runtime.ready;
const response = await fetch("/api/orders", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ productId: "example", quantity: 1 }),
});
```

Le Worker déployé a toujours besoin de sa configuration Hyperdrive normale, d’un pilote pris en charge et de ses indicateurs de compatibilité. Consultez les guides Cloudflare [MySQL](https://developers.cloudflare.com/hyperdrive/examples/connect-to-mysql/) et [PostgreSQL](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/). Le code ORM existant suit la même frontière ; cela ne certifie pas chaque ORM ou version de pilote.

## Exécution et suppression du code

La valeur par défaut `execution: "network"` conserve tout le Worker à distance. Pour autoriser des routes Hono indépendantes sur l’appareil, définissez un tableau `execution` dans le plugin, par exemple `execution: [{ method: "GET", path: "/" }]` si cet enregistrement et ses dépendances peuvent être distribués. L’analyse suivante s’applique à cette sélection explicite. Consultez la [configuration de l’exécution](cloudflare-bindings.md#choosing-execution).

Les routes Hono analysables statiquement et indépendantes des opérations serveur peuvent rester locales si elles respectent aussi le [contrat de distribution](cloudflare-bindings.md#what-can-move-to-the-device). Lorsqu’une opération correspondante nécessite Hyperdrive, toute la requête rejoint le Worker existant avant l’exécution d’un middleware applicatif local. Les utilitaires importés et imports de pilotes serveur sont supprimés avec leurs gestionnaires avant la génération du JavaScript client et des source maps. Les modes direct et Dedicated Worker utilisent la même limite générée.

Un pool de connexions au niveau supérieur, un état mutable partagé, des dépendances Cookie, une initialisation inconnue ou un routage incertain peuvent exiger que le Worker entier reste distant. Les gestionnaires Fetch généraux utilisent la délégation du Worker entier. Le build avertit de sa décision et émet `workers-capacitor-server.json` avec le mode, le motif et les enregistrements de routes. Les builds uniquement D1 conservent `workers-capacitor-d1.json` pour compatibilité. Les bindings Hyperdrive ne peuvent pas être déclarés dans `localBindings`.

Les transactions et le nettoyage des connexions restent dans le gestionnaire serveur existant. Les réponses 401 et échecs réseau ne déclenchent ni nouvelles tentatives automatiques ni repli local. Une réponse en échec peut néanmoins suivre une écriture déjà validée ; les applications nécessitant des nouvelles tentatives utilisateur sûres doivent implémenter leur politique d’idempotence existante côté serveur. La délégation du Worker entier exige une connexion pour chaque requête interceptée.

## Frontières de sécurité

- `remote.origin` doit être une origine HTTPS, sans identifiants, chemin, chaîne de requête ni fragment. Les redirections doivent rester dans cette origine ; OAuth/SSO externe nécessite une intégration distincte.
- Le serveur doit authentifier les utilisateurs et autoriser l’accès à chaque ressource. Le routage client et la suppression du SQL ne sont pas des contrôles d’autorisation. Gardez la liaison des paramètres, la validation des entrées et les permissions appropriées de base de données dans le Worker.
- Utilisez des identifiants limités à l’utilisateur. Ne placez jamais d’identifiants de base de données ou de jetons de gestion Cloudflare dans `env` du client, les callbacks de jetons, les journaux ou les ressources publiques. La suppression du code généré n’analyse pas les fichiers publics copiés manuellement et ne détecte pas les secrets arbitraires codés en dur dans du code autrement local.
- Les sessions Cookie natives utilisent le magasin de cookies de l’hôte distant. `Set-Cookie` est traité par l’hôte et retiré de la réponse de page. HttpOnly empêche l’accès du script au Cookie, pas les requêtes authentifiées par des scripts compromis.
- L’adaptateur remappe `Origin`/`Referer` locaux à l’application vers l’origine distante pour la navigation Worker existante. Le serveur ne peut donc pas considérer l’Origin remappée seule comme preuve d’une intention utilisateur fiable. Conservez les contrôles de jetons CSRF de l’application lorsqu’ils existent, restreignez le contenu/la navigation WebView et l’accès au pont natif, et évaluez XSS et CSRF dans l’application réelle. Ce n’est pas une garantie de protection SameSite/CSRF équivalente à celle d’un navigateur dans le transport natif.
- Les navigateurs ordinaires exigent toujours CORS avec credentials et respectent leurs politiques Cookie. Les redirections distantes manuelles du navigateur ne sont pas prises en charge.
- Les envois navigateur et les envois Fetch natifs avec suivi des redirections sont mis en tampon. Le transport partagé est plafonné par défaut à 8 MiB, configurable via `remote.maxBufferedBodyBytes`. Les corps dépassant la limite sont rejetés avant acheminement. Les modes natifs de redirection manual/error utilisent le streaming. Ce plafond ne borne pas la mémoire totale de l’application ; appliquez des limites applicatives avant d’allouer de gros corps.

Le transport partagé et le comportement Cookie sont détaillés dans le [guide D1](d1-transparent-migration.md). Hyperdrive ajoute la reconnaissance des bindings au build ; il n’ajoute pas de transport distinct d’identifiants ou de réseau.

## Vérification

`npm test` couvre la découverte JSON/JSONC/TOML et des environnements nommés, les surcharges mixtes D1 et Hyperdrive, le rejet des bindings locaux, la découverte des configurations imbriquées, la suppression du code pilote/helper/SQL et le repli dû à un pool au niveau supérieur.

Pour l’intégration navigateur, compilez le paquet, installez les dépendances de la démo et fournissez une **base MySQL de test dédiée et jetable**. La suite crée `private_counters` et réinitialise ses lignes `alice`/`bob` ; ne la faites jamais pointer vers des données applicatives. Exécutez ensuite :

```sh
npm run build
cd demo
HYPERDRIVE_TEST_MYSQL_URL='mysql://root:hyperdrive-test-only@127.0.0.1:3306/hyperdrive_test' npm run test:hyperdrive-migration
```

Le même Worker de fixture non modifié s’exécute dans workerd avec un binding Hyperdrive local et mysql2 contre un véritable MySQL. Les requêtes HTTPS du navigateur sont interceptées par le harnais de test et acheminées vers ce Worker local. Les tests couvrent Vite/esbuild, Chromium/WebKit, direct/Dedicated Worker, la délégation sélective/du Worker entier, les recompilations de développement Vite, l’autorisation, une mise à jour de base par requête, HEAD, les routes locales sans réseau et l’absence de marqueurs SQL/pilote/configuration dans le JS client et les source maps. Les rapports sont écrits dans `demo/artifacts/hyperdrive-integration/`. La CI fournit son propre service MySQL.

Cela vérifie le binding Hyperdrive local et le comportement de la base, pas le pooling/cache Hyperdrive de production ni HTTPS sur appareil physique. Les imports PostgreSQL/ORM sont couverts pour leur suppression par le compilateur, pas pour des requêtes PostgreSQL réelles. La validation native D1 antérieure couvre le transport partagé ; elle ne constitue pas un résultat de validation native Hyperdrive. Le déploiement serveur, les identifiants de production et les appareils physiques ne font pas partie de cette vérification.
