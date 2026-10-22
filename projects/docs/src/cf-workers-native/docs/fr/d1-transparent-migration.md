---
title: "Workers utilisant D1 dans Capacitor"
sourceRevision: "93a65f3c1256094521c9e0115aea10abd629dd04532ed5ee91e8001d239b18dd"
---

# Workers utilisant D1 dans Capacitor

Utilisez le point d’entrée Worker existant et ses routes HTTP existantes. L’intégration au build garde les opérations serveur sur le Worker déployé et génère l’acheminement client ; les développeurs applicatifs n’ont pas à écrire une autre API REST, à remplacer les appels D1 par fetch ni à maintenir un second routeur.

## Configuration

```ts
// vite.config.ts — build Capacitor uniquement
import { workersCapacitorPlugin } from "cf-workers-native/tooling/vite";

export default {
  plugins: [workersCapacitorPlugin({ worker: "worker/src/index.ts" })],
};
```

Le plugin lit `d1_databases` dans la configuration Wrangler JSON/JSONC/TOML la plus proche du point d’entrée Worker, ou depuis la racine du build. Les noms de bindings des environnements nommés sont inclus. Les secrets de configuration et identifiants de bases de données ne sont pas copiés dans le client généré. Un chemin explicite `workerConfig` est relatif à la racine du build. Pour les autres outils de configuration, fournissez `d1Bindings: ["DB"]`. Le plugin esbuild accepte les mêmes options.

```ts
// Démarrage de l’application — le Worker métier reste inchangé
import { workersCapacitor } from "cf-workers-native/capacitor";

const runtime = workersCapacitor({
  baseURL: "https://local.invalid/",
  remote: {
    origin: "https://existing-worker.example.com",
    // Facultatif : connecter une session existante lorsque les requêtes ne contiennent pas déjà
    // leur en-tête Authorization. Ce n’est pas un nouveau système de connexion.
    getToken: () => existingSession.getToken(),
  },
});
await runtime.ready;

// L’URL et le contrat HTTP existants restent inchangés.
const response = await fetch("/api/counters/alice");
```

Le Worker déployé conserve son authentification, ses autorisations, sa validation des entrées, ses opérations métier et ses bindings D1 existants. Il n’y a ni point d’accès SQL générique, ni point d’accès par identifiant de requête, ni implémentation D1 cliente, ni API de migration de schéma, ni jeton de gestion Cloudflare dans le client. Le déploiement du serveur reste une action distincte.

## Sélection de l’exécution

La valeur par défaut `execution: "network"` conserve tout le Worker à distance. Pour autoriser des routes Hono indépendantes sur l’appareil, définissez un tableau `execution` dans le plugin, par exemple `execution: [{ method: "GET", path: "/" }]` si cet enregistrement et ses dépendances peuvent être distribués. L’analyse suivante s’applique à cette sélection explicite. Consultez la [configuration de l’exécution](cloudflare-bindings.md#choosing-execution).

Pour les applications Hono analysables statiquement, le compilateur suit imports et réexports locaux, utilitaires, routeurs montés, enregistrements chaînés et middlewares. Il génère un sélecteur utilisant les mêmes règles de correspondance Hono. Si une opération correspondante nécessite le serveur, toute la requête rejoint le Worker existant **avant l’exécution de tout middleware ou gestionnaire applicatif local**. Cela couvre aussi les passages au gestionnaire suivant et les routes qui se chevauchent. Les candidats locaux doivent également respecter le [contrat de distribution](cloudflare-bindings.md#what-can-move-to-the-device). Une fonction pure n’est pas automatiquement publique : les gestionnaires et dépendances protégés hors de ce contrat sont exclus du code client généré.

Les bindings D1, les valeurs serveur de `env`, les comportements inconnus de dépendances, les accès dynamiques aux propriétés et l’état mutable partagé avec les opérations serveur élargissent la frontière serveur. Un binding `env` peut rester explicitement local avec l’option de build `localBindings: ["LABEL"]` lorsqu’il est fourni via `workersCapacitor({ env })`. Un binding D1 ne peut pas être déclaré local. Une initialisation inconnue au niveau supérieur, l’acheminement interne du routeur, l’état global ambiant et l’état des cookies/en-têtes maintiennent aussi le Worker entier sur le serveur. L’analyse est volontairement conservatrice ; elle peut envoyer au serveur plus de travail qu’un humain ne pourrait en séparer sans risque.

Lorsque la séparation ne peut préserver la sémantique d’acheminement, le client généré délègue **toutes les requêtes au Worker existant** et ne contient aucune de ses implémentations applicatives. Cela inclut les gestionnaires Fetch généraux et Workers Express. Le build indique le motif plutôt que d’exiger une réécriture du Worker. Ce mode exige une connexion pour chaque requête interceptée ; il ne rend pas l’application existante disponible hors ligne. Il n’est jamais sélectionné en capturant une erreur D1 après l’exécution partielle d’une opération.

Pour les builds uniquement D1, les deux intégrations émettent `workers-capacitor-d1.json`, qui décrit le mode choisi et les enregistrements de routes/middlewares. Ce rapport est une métadonnée de diagnostic, pas un second routeur maintenu par les auteurs de l’application.

## Suppression du code et frontières d’exécution

Le compilateur génère le graphe local avant que le bundler crée les source maps client. Les gestionnaires retirés et leurs helpers inutilisés sont absents du code généré, y compris de `sourcesContent`. Le même graphe alimente l’exécution directe et Dedicated Worker. L’import séparé des modules Worker originaux dans le client est rejeté, car il contournerait leur suppression. Ne copiez pas manuellement les sources serveur, fichiers SQL/de migration ou maps serveur dans les ressources publiques ; ces fichiers ne font pas partie du graphe de modules généré. Utilisez un répertoire de sortie propre lors de l’empaquetage.

Le sélecteur et la connexion s’exécutent dans l’hôte dans les deux modes. Les callbacks de session restent dans l’hôte et ne sont pas clonés de manière structurée dans un Dedicated Worker. La requête passe directement par le transport sortant existant, même si l’origine distante chevauche l’URL d’interception locale. Aucune récursion fetch locale n’est utilisée. Les requêtes natives utilisent le transport TCP/TLS existant et les portées de sockets possédées. Les requêtes navigateur conservent CORS et mettent les corps d’envoi en tampon pour WebKit/HTTP/1. Les requêtes natives de documents en mode manuel conservent le streaming ; le mode follow de Fetch met un envoi en tampon pour permettre de rejouer son corps après un 307/308 de même origine.

Le chemin, la chaîne de requête, la méthode, le corps et le statut de réponse sont préservés. Un en-tête Authorization existant est réutilisé sauf si `getToken` est fourni. Dans ce cas, le jeton courant le remplace à chaque requête ; un jeton absent retire les anciens identifiants bearer.

Sur Capacitor natif, les sessions existantes à cookies gérés par le serveur utilisent le magasin de cookies système pour l’hôte distant. Set-Cookie est traité par l’hôte avant la redirection ; les cookies HttpOnly ne sont pas exposés au document rendu. La sémantique du chemin, de l’expiration et de déconnexion des cookies persistants est préservée. Les cookies du document local ne sont jamais transmis aveuglément. Les Workers dépendant des cookies s’exécutent entièrement sur le Worker déployé afin que connexion, profil et déconnexion partagent une même frontière de session. Les utilisateurs se connectent via la page de connexion existante ; les cookies d’un navigateur de bureau distinct ne sont pas importés. Utilisez `render: "/"` avec `remote: { origin }` pour afficher l’interface Worker existante.

Les redirections natives au sein de l’origine distante configurée conservent la sémantique HTTP : 303 transforme POST en GET, 307/308 préservent méthode/corps, et les redirections manuelles de documents sont remappées vers l’origine logique de l’application. Les chaînes de redirections sont limitées. Les redirections vers une autre origine sont rejetées avant l’envoi d’identifiants à cette origine. Les parcours OAuth/SSO externes nécessitent une intégration explicite de navigateur externe, non fournie ici. Les scripts client dépendant de la lecture des cookies distants non HttpOnly via le `document.cookie` local ne bénéficient pas non plus d’un pont.

Dans les navigateurs ordinaires, les requêtes distantes utilisent `credentials: "include"` ; le Worker déployé doit autoriser l’Origin réelle de l’application et les credentials dans les réponses CORS. Access-Control-Allow-Origin avec joker ne suffit pas. Les règles de confidentialité des cookies et SameSite du navigateur restent applicables. Les navigateurs masquent les destinations des redirections manuelles ; les redirections distantes y signalent donc une erreur explicite de non-prise en charge. La validation native des documents doit par conséquent être exécutée sur iOS/Android, et non déduite des tests d’API navigateur.

Les réponses 401 et échecs réseau sont retournés sans nouvelles tentatives automatiques ni repli local. L’annulation et la libération du runtime annulent les recherches d’identifiants/transports en attente ; un jeton tardif ne peut pas déclencher d’envoi après libération. La suppression du SQL réduit la divulgation de l’implémentation serveur ; elle ne remplace pas l’autorisation côté serveur et ne détecte pas les secrets arbitraires codés en dur dans du code applicatif autrement local.

## Sécurité du transport partagé et limites d’envoi

Les en-têtes `Origin` et `Referer` locaux à l’application sont remappés vers l’origine distante pour la navigation Worker existante. Ne considérez pas l’Origin réécrite seule comme preuve d’une intention utilisateur fiable. Conservez les contrôles de jetons CSRF de l’application lorsqu’ils existent et restreignez le contenu/la navigation WebView et l’accès au pont natif. HttpOnly masque les cookies aux scripts mais n’empêche pas des scripts compromis d’effectuer des requêtes authentifiées. Le transport natif des Cookie ne promet pas une protection SameSite ou CSRF équivalente à celle d’un navigateur.

Les envois navigateur et les envois Fetch natifs avec suivi des redirections sont mis en tampon jusqu’à 8 MiB par défaut. Configurez `remote.maxBufferedBodyBytes` avec un entier sûr non négatif (en octets). Dépasser la limite annule le producteur du corps et rejette avant l’envoi réseau ; zéro n’autorise que les corps vides. Les modes natifs de redirection manual/error conservent le streaming. Cela borne la mise en tampon du transport, pas l’utilisation totale du tas de l’application ni les corps déjà alloués par les appelants. Appliquez des limites applicatives avant d’allouer de gros envois ; utilisez les envois multipart R2 pour les objets plus volumineux.

Hyperdrive utilise le même transport ; consultez le [guide Hyperdrive](hyperdrive-transparent-migration.md) pour la configuration des bindings et les frontières supplémentaires liées aux bases de données.

## Vérification

`npm test` à la racine inclut les tests du compilateur/de la configuration et du runtime distant. Après compilation à la racine et installation des dépendances de la démo, exécutez :

```sh
cd demo
npm run test:d1-migration
```

L’intégration utilise un Worker Hono ordinaire inchangé et D1 dans workerd local. Elle vérifie le démarrage public via Vite/esbuild, Chromium/WebKit et les exécutions directe/isolée, tant sélectives que pour le Worker entier. Les contrôles incluent le comportement de lecture/écriture existant, l’état de la base, l’autorisation, 401 sans nouvelles tentatives, HEAD, les routes locales sans réseau et la suppression des marqueurs SQL/helpers du JS et des maps. La suite vérifie aussi le démarrage de développement Vite, le rejet des sources originales et la recompilation après modification d’un fichier. Elle est incluse dans le job CI de compatibilité.

La vérification native reproductible utilise un nouveau consommateur de tarball npm, un identifiant d’application indépendant, un serveur HTTPS local de test et un certificat de test approuvé uniquement par le simulateur/consommateur debug :

```sh
node demo/tests/experiments/d1/native-server.mjs
# Dans un autre shell, après npm run build :
node demo/tests/experiments/d1/native-prepare.mjs
node demo/tests/experiments/d1/native-run.mjs ios <simulator-uuid>
node demo/tests/experiments/d1/native-run.mjs android <emulator-serial>
```

Exécutez les plateformes séquentiellement, car la base de test est partagée. Android utilise par défaut Java 21 d’Android Studio ; `D1_JAVA_HOME` peut le remplacer. `native-prepare.mjs --refresh` réempaquette le candidat et met à jour ce même consommateur isolé. Les rapports, journaux, intégrité du paquet et instantanés de base côté serveur se trouvent dans `demo/artifacts/d1-native/`. Les rapports navigateur et bundles inspectés se trouvent dans `demo/artifacts/d1-integration/`.

Pour valider les sessions Cookie dans l’interface rendue, utilisez les mêmes scripts avec `--ui` :

```sh
node demo/tests/experiments/d1/native-server.mjs --ui
node demo/tests/experiments/d1/native-prepare.mjs --ui
node demo/tests/experiments/d1/native-run.mjs ios <simulator-uuid> --ui
node demo/tests/experiments/d1/native-run.mjs android <emulator-serial> --ui
```

Le consommateur d’interface indépendant utilise `render: "/ui/account"` et un Worker ordinaire sans imports Capacitor. Un pilote DOM réservé aux tests remplit les champs et active de véritables formulaires/liens dans la WebView rendue ; il ne remplace pas la navigation par des appels d’API. Le même Worker s’exécute dans workerd. Les tests vérifient les ressources CSS/JS, la connexion, une écriture D1 unique via POST/303/GET, la navigation vers le détail, la session persistante après redémarrage du processus, la déconnexion, puis un autre redémarrage restant non authentifié. Les instantanés D1 côté serveur, captures d’écran et rapports sont enregistrés dans `demo/artifacts/d1-native-ui/`. Exécutez les plateformes séquentiellement. `native-prepare.mjs --ui --refresh` met à jour ce consommateur à partir d’un nouveau tarball du paquet.
