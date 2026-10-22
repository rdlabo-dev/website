---
title: "Comportement du runtime"
sourceRevision: "3d5fb004c7011cd527e3a2e1bce736421505572bfb659489f3ed289a083bb45d"
---

# Comportement du runtime

Deux décisions sont distinctes : l’acheminement des bindings cloud choisit une exécution locale ou distante de la requête ; `prefer` choisit un environnement JavaScript local. Un Dedicated Web Worker local s’exécute sur l’appareil, pas sur Cloudflare.

## Intégration Fetch uniquement

Pour un frontend existant appelant des API Worker, configurez le Worker dans le [build Capacitor](build-setup.md) et omettez `render`. Initialisez avant de monter l’interface :

```ts
import { workersCapacitor } from "cf-workers-native/capacitor";

const runtime = workersCapacitor({
  baseURL: "https://api.example.com/api/",
});
await runtime.ready;

const response = await fetch("/api/hello");
```

L’interface existante conserve ses appels Fetch habituels. Les requêtes correspondantes utilisent le Worker local ou distant configuré ; celles hors du périmètre conservent le comportement Fetch normal. Pour les routes dépendant du cloud, configurez les bindings et l’origine distante avec le [guide d’intégration](integration.md).

## Préférence d’exécution

La valeur par défaut `prefer: "worker"` démarre un Dedicated Web Worker lorsqu’il est disponible et que l’`env` initial ne contient que des données simples. Si Worker est absent, si son constructeur signale SecurityError/NotSupportedError ou si `env` contient des méthodes/prototypes personnalisés/accesseurs (comme les bindings KV locaux), l’exécution directe est sélectionnée avant toute requête. `prefer: "direct"` charge le module direct sans créer de Worker. L’exécution directe constitue toujours la base disponible ; une erreur de module ou d’application ne signifie pas son indisponibilité.

Attendez `runtime.ready` et inspectez `runtime.execution` (`"worker"` ou `"direct"`) pour observer ce choix. Le code direct n’est importé dynamiquement que lorsqu’il est sélectionné. Le choix a lieu une seule fois : les échecs de script au démarrage et les erreurs de requêtes sont signalés, jamais rejoués dans l’autre environnement. Ce n’est pas une détection automatique de toutes les API Workers non prises en charge. Les modifications de `env` après sélection ne déclenchent aucun nouveau choix. La sélection Worker accepte de manière conservatrice les primitives, objets ordinaires et tableaux (y compris les cycles), sans propriétés personnalisées non énumérables ni prototypes nuls ; les autres types compatibles avec le clonage structuré sélectionnent aussi actuellement le mode direct.

## Initialisation et nettoyage

L’installation intercepte fetch de manière synchrone. Les requêtes en mode Worker attendent le démarrage ; les requêtes correspondantes pendant le chargement du module direct sont explicitement rejetées pour éviter les blocages liés à top-level-await. Attendez `runtime.ready` avant de lancer les requêtes de l’interface. Le runtime ne peut pas distinguer les appels d’initialisation des modules des appels concurrents de l’interface ; les deux sont donc rejetés pendant le chargement direct. `await runtime.ready` permet d’observer la réussite/l’échec du démarrage avant le rendu de l’interface. `await workersCapacitor(...)` **n’attend pas** le démarrage du Worker.

Une seule installation est prise en charge ; `await runtime.dispose()` restaure fetch, arrête le Dedicated Worker et attend le nettoyage asynchrone si nécessaire. L’arrêt rejette les appels locaux/lectures de corps inachevés et libère le suivi des tâches en arrière-plan.

## Sources Worker explicites

Les imports explicites de gestionnaires directs et les fabriques standard `new Worker(new URL(...), { type: "module" })` sont pris en charge. `prefer` exige la configuration du plugin ou une source explicite comportant à la fois `createWorker` et `loadDirect` ; il ne peut pas fabriquer un second candidat à partir d’un gestionnaire ou d’une fabrique seuls.

Les imports directs restent pris en charge : `import worker from "./worker"` fournit un objet avec `fetch` et s’exécute dans la portée globale de l’interface. Hono n’a pas besoin de plugin de build dans ce mode ; Workers Express exige toujours le plugin de compatibilité. Les sous-requêtes du Worker restent hors de l’interception de l’interface uniquement lorsque `runtime.execution` vaut `"worker"` ; le repli direct partage l’environnement global de l’interface.

Si le Worker ou l’une de ses dépendances utilise des extensions Workers (par exemple `Headers.getAll("set-cookie")` ou `Request.cf`) pendant l’évaluation des modules, configurez `worker` dans le plugin Vite/esbuild comme indiqué dans le [guide de configuration du build](build-setup.md). Le runtime installe ses API Web avant de charger ce point d’entrée et ses dépendances, dans les deux modes d’exécution. Avec un import statique direct, l’évaluation des modules a lieu avant que `workersCapacitor()` puisse initialiser ces API ; seuls les appels effectués après initialisation utilisent les implémentations installées. Pour du JavaScript simple, utilisez la [source `loadDirect`](build-setup.md#browser-es-modules-no-bundler) lorsque l’initialisation doit précéder l’évaluation des modules.

## Contrat d’URL

### Sélection des requêtes locales

L’adaptateur résout l’URL de la requête, puis vérifie son adresse et son chemin :

1. L’URL doit correspondre soit au **protocole et à l’hôte** de l’application en cours (port inclus), soit à l’origine configurée dans `baseURL`.
2. Son chemin doit être égal à la limite de chemin de `baseURL` ou se situer en dessous. Pour `/api/`, `/api` et `/api/hello` correspondent ; `/apiary` ne correspond pas.

Les requêtes correspondantes s’exécutent normalement dans le Worker local. Avec l’intégration des bindings cloud au build, le sélecteur généré peut les envoyer au Worker déployé existant avant l’exécution locale. L’adaptateur remplace l’origine par celle de `baseURL`, en préservant le chemin et la chaîne de requête. Le protocole seul ne sélectionne pas l’exécution locale : `capacitor://other-host/api/hello` ne correspond pas à une application exécutée à `capacitor://localhost`.

Avec les réglages Capacitor par défaut, `fetch("/api/hello")` suit ces parcours (sans surcharge `<base>` et avec `baseURL: "https://api.example.com/api/"`) :

| Plateforme | URL de requête résolue dans l’application | URL reçue par le Worker local |
| --- | --- | --- |
| iOS | `capacitor://localhost/api/hello` | `https://api.example.com/api/hello` |
| Android | `https://localhost/api/hello` | `https://api.example.com/api/hello` |

L’adaptateur utilise l’URL de l’application en cours ; les réglages personnalisés de schéma/nom d’hôte suivent donc la même comparaison. Sans limite distante générée, ce sont des appels JavaScript locaux ; aucune ligne n’envoie de requête HTTP à `api.example.com`. Les requêtes sélectionnées pour exécution distante utilisent au contraire `remote.origin`, avec l’origine de `baseURL` par défaut si elle est omise. Des options comme `getToken` peuvent être fournies sans origine. Les remplacements explicites doivent être des origines HTTPS valides et ne retombent jamais sur une autre valeur en cas d’échec de validation.

### Exemples de points d’accès

Pour `baseURL: "https://api.example.com/api/"` et une application servie à `https://localhost/` (sans surcharge `<base>`) :

| URL passée à `fetch()` | Point d’accès de la requête | Traitement par |
| --- | --- | --- |
| `/api/hello?name=A` | `https://api.example.com/api/hello?name=A` | Worker local |
| `https://api.example.com/api/hello` | `https://api.example.com/api/hello` | Worker local |
| `/api` | `https://api.example.com/api` | Worker local |
| `/apiary` | `https://localhost/apiary` | fetch d’origine |
| `/outside.txt` | `https://localhost/outside.txt` | fetch d’origine |
| `https://other.example/api/hello` | `https://other.example/api/hello` | fetch d’origine |

Pour l’exécution locale, le point d’accès est l’URL reçue par le gestionnaire Fetch du Worker ; aucune requête HTTP n’est envoyée à ce serveur.

Le chemin dans `baseURL` sélectionne un périmètre ; il **n’est pas ajouté** aux chemins des requêtes. Les chemins relatifs sont d’abord résolus par rapport à `document.baseURI` (y compris `<base href>`), ou à location en l’absence de document. Les URL de la même application (dont `capacitor://localhost` sur iOS) dans ce périmètre sont remappées vers l’origine de base. Ne définissez une URL de base racine que pour intercepter tous les fetch de la même application. Un 404/500 local ou une exception ne déclenche jamais de nouvelle tentative réseau. En mode Fetch uniquement, cet adaptateur fetch n’intercepte ni navigation de l’interface, ni XHR, ni images, ni autres WebViews. Avec `render`, un [pont natif de documents](native-rendering-api.md) distinct gère la navigation de documents, les formulaires et les requêtes de ressources pris en charge.

## Compatibilité et limites

### Comportement d’API vérifié

- Couvert : Hono et Workers Express GET/POST/HEAD, paramètres de requête et de route, corps JSON, middlewares, 404/500, requêtes concurrentes, entrée Request, URL logiques.
- L’option `env` injecte les valeurs fournies par l’appelant dans le second argument du gestionnaire fetch. En mode isolé, elle est clonée à chaque appel : les fonctions/objets de plugins natifs ne peuvent pas être passés et l’identité des objets n’est pas préservée. Aucune valeur secrète Wrangler ni objet de binding cloud n’est importé ; les plugins de build lisent la configuration des bindings pour choisir l’exécution locale ou distante. L’export nommé `cloudflare:workers` de `env` est un adaptateur partiel : le transport isolé actualise un proxy à l’échelle du contexte global avant l’acheminement, mais l’exécution directe ne le renseigne pas et l’initialisation des modules précède le premier acheminement. Utilisez l’argument `env` du gestionnaire pour un accès portable ; le proxy n’assure pas d’isolation par requête.
- `ctx.waitUntil()` suit les promesses sans retarder la réponse ; `runtime.drain()` les attend. Les erreurs vont à l’option `onBackgroundError` (par défaut : console). La suspension/l’arrêt par le système peut interrompre les tâches en attente.
- L’annulation Fetch rejette l’appelant et propage un signal. Elle ne peut pas arrêter de force un travail applicatif arbitraire. Les cookies, le suivi des redirections, le renseignement de `Response.url`, les politiques credentials/cache et l’application de CORS ne sont pas émulés pour les appels locaux.

Consultez [compatibilité et limites](compatibility.md) pour les modules Node incomplets, les API Workers, les services cloud et les restrictions du transport natif. Les [limites d’intégration des applications](compatibility.md#application-integration-limits) couvrent aussi Better Auth sur iOS, les passkeys, OAuth dans un navigateur externe, le routage Void, l’analytique réelle et la distinction entre contrôles sur simulateur et sur appareils physiques.

### Limites des frameworks et plateformes

- Le streaming des requêtes/réponses HTTP Workers et TCP natif sont couverts par des contrats partagés. Le service de fichiers, les WebSockets, les autres modules Node et la propagation du contexte asynchrone nécessitent leurs propres travaux de compatibilité ; l’inventaire consigne leur état. La couche de compatibilité n’est pas un runtime Node généraliste.
- `passThroughOnException`, WorkerEntrypoint/RPC et le format Service Worker ne sont pas pris en charge. Les champs Request propres à Workers ne sont couverts que là où l’inventaire de compatibilité le précise ; `Request.cf` est préservé localement et n’est pas renseigné avec des métadonnées réseau Cloudflare. L’évaluation du Worker ne doit pas appeler ses propres points d’accès locaux avant l’installation.
- La modification fetch de CapacitorHttp n’est pas testée ; laissez-la désactivée pour cette Preview. Le paquet inclut le transport TCP/TLS natif et les sources d’intégration de documents (iOS SPM / Android Gradle). Un navigateur ordinaire utilise Fetch du navigateur ; le rendu natif de documents exige Capacitor.

### Frontières de sécurité et de réseau

- Considérez tout ce qui est empaqueté dans l’application comme lisible par les utilisateurs. N’intégrez ni identifiants de base de données, ni jetons de service, ni autres secrets serveur.
- Pour les frontières d’exécution distante détectées, le build retire du bundle client les implémentations serveur, y compris leur SQL. Ce n’est pas un scanner général de secrets : inspectez le rapport de build généré et les ressources empaquetées avant livraison.
- Authentifiez et autorisez les requêtes sur le Worker déployé. `remote.getToken` peut fournir les identifiants bearer existants, et le rendu natif prend en charge les sessions Cookie gérées par le serveur ; la bibliothèque ne fournit pas de système d’authentification. Une URL configurée dans `remote.origin` ne protège pas le point d’accès.
- Le HTML généré par le Worker s’exécute avec l’accès aux plugins Capacitor de l’application. Ne rendez que du contenu applicatif de confiance ; n’utilisez pas cette intégration pour afficher des pages externes arbitraires.

Consultez les [consignes de sécurité de l’intégration](integration.md) pour la frontière client/serveur et les contrôles de migration.

Avec un import direct du Worker, les sous-requêtes correspondantes du Worker peuvent rentrer à nouveau dans le gestionnaire de l’interface. Dans Capacitor, le HTTP(S) sortant utilise le transport natif empaqueté, y compris lorsqu’il est relayé depuis un Dedicated Worker. Ce transport traite les en-têtes, les redirections et les octets de réponse hors de l’application de CORS du navigateur. Dans un navigateur ordinaire, les requêtes sortantes utilisent Fetch du navigateur et restent soumises à ses restrictions CORS et d’en-têtes. Aucun mode d’exécution n’est un isolat workerd.

### Transport Worker et durée de vie des ressources

Le transport isolé transmet les envois et réponses en blocs MessagePort pilotés par pull (les envois sont divisés à 64 KiB). Les gestionnaires d’envoi peuvent s’exécuter avant EOF ; l’annulation libère le lecteur d’envoi. Il préserve status/statusText/headers, l’annulation du corps, l’annulation après les en-têtes et la fin des tâches en arrière-plan. Les réponses invalides/utilisées/verrouillées et les réponses opaque/error de statut 0 sont rejetées. Les erreurs conservent leur nom/message, pas leur identité/pile ; les motifs d’abandon/annulation personnalisés ne sont pas transportés au Worker. Les corps de réponse non consommés retiennent des ressources jusqu’à consommation, annulation ou libération. `drain()` suit le travail en arrière-plan, pas la consommation des corps.

## Environnement d’exécution et contexte asynchrone

Le gestionnaire Worker d’origine reste le point d’entrée Cloudflare. Installez le plugin Vite/esbuild uniquement dans le build Capacitor/navigateur : ses alias sélectionnent les implémentations locales d’API ; le build Cloudflare conserve les `node:*` et `cloudflare:*` natifs. `getExecutionEnvironment()` (aussi disponible depuis `cf-workers-native/environment`) distingue Cloudflare Workers, les hôtes Capacitor natifs, les workers navigateur, les navigateurs et les contextes globaux inconnus. Un Dedicated Worker de navigateur n’est pas Cloudflare Workers. L’installation du runtime Capacitor dans Cloudflare Workers échoue avant toute modification des variables globales.

Les builds Capacitor abaissent les fonctions async et les générateurs, en préservant `await` au niveau des modules, afin que les portées AsyncLocalStorage soient restaurées immédiatement et que les continuations Promise conservent leurs propres stores. Les gestionnaires applicatifs ne nécessitent aucune modification. Les callbacks async natifs créés hors de ce pipeline de build (par exemple avec `eval`) sont rejetés comme callbacks de portée ALS. Cloudflare continue d’utiliser son implémentation native du contexte asynchrone.

Les réponses de documents sont récupérées progressivement sur iOS et Android. Les envois de documents natifs traversent encore une frontière avec mise en tampon et rejettent au-delà de 8 MiB avant concaténation ; utilisez le runtime Fetch uniquement pour les envois en streaming. Les lectures de flux KV LocalStorage décodent à la demande des blocs de taille limitée, mais l’API de stockage retourne nécessairement un enregistrement encodé complet. Ses limites synchrones de stockage/quota restent applicables.
