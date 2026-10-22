---
title: "Rendu natif de documents avec workersCapacitor"
sourceRevision: "fb40d9796a7c86fce2b93c980a9f13be31ecdb851c3b1b43b565763b26fdbc50"
---

# Rendu natif de documents avec workersCapacitor

Le paquet inclut la connexion native pour Capacitor 8 (vérifiée avec 8.5.3). iOS utilise Swift Package Manager ; Android utilise Gradle. CocoaPods n’est pas inclus dans cette Preview.

Pour une application native existante sans configuration Capacitor, consultez l’[intégration dans une application native](native-embedding.md).

## Installation

Installez le paquet dans votre application Capacitor en suivant les [étapes d’installation de la Preview](integration.md#2-install-capacitor-and-this-package).

Configurez le Worker dans le plugin Vite/esbuild et appelez `workersCapacitor({ baseURL, render: "/" })`. Compilez les ressources web avant la synchronisation :

```sh
npm run build
npx cap sync
npx cap run ios # ou android
```

La CLI Capacitor découvre et enregistre le plugin natif. L’application conserve son Activity/ViewController habituel ; aucun enregistrement manuel ni copie de sources natives n’est nécessaire. L’API navigateur Fetch uniquement reste disponible sans installer Capacitor.

## Point d’entrée de l’application

```ts
import { workersCapacitor } from "cf-workers-native/capacitor";

const app = workersCapacitor({
  baseURL: "https://worker.invalid",
  render: "/",
});
await app.ready;
```

`render` est le chemin initial du document local. Omettez-le pour conserver le comportement Fetch uniquement existant. Le mode document nécessite une **origine** HTTP(S) comme `baseURL`, sans préfixe de chemin d’API. Le Worker reçoit des URL sous cette origine logique ; la page visible conserve son URL locale Capacitor (`capacitor://` par défaut sur iOS, `https://` par défaut sur Android). L’acheminement généré peut sélectionner l’exécution locale ou le Worker distant configuré avant d’appeler un gestionnaire ; les deux parcours retournent un document via le même pont natif. Les échecs locaux ne sont pas retentés à distance et aucun serveur HTTP local n’est démarré. Consultez la [configuration de l’exécution distante](integration.md#3-configure-and-build-the-native-application).

Hono et Workers Express utilisent la même frontière `worker.fetch(request, env, ctx)`. Leurs routeurs applicatifs retournent du HTML complet pour les pages et du JSON pour les API. L’adaptateur n’ajoute pas de routeur applicatif. Les options existantes `worker`, `env`, `prefer`, `drain()` et la gestion des erreurs en arrière-plan continuent de s’appliquer à l’hôte du runtime.

`ready` signifie que le Worker et la connexion native sont initialisés. Cela ne signifie pas que toutes les images ou tous les scripts de page ont fini de charger. `await app.dispose()` libère la connexion de documents et le runtime. La libération Fetch uniquement peut aussi être asynchrone pendant la libération des ressources réseau, d’un module chargé à la demande ou d’un ancien enregistrement de document Android. Utilisez toujours `await app.dispose()` lorsque le nettoyage doit se terminer avant une réinitialisation. Les erreurs de démarrage des documents restaurent l’implémentation fetch d’origine ; les erreurs de démarrage du Worker Fetch uniquement continuent de rejeter les requêtes locales jusqu’à libération explicite.

## iOS Safe Area

Les WebViews de documents Worker utilisent par défaut les marges de contenu `automatic` lorsque `ios.contentInset` est omis. Une valeur explicite dans `capacitor.config.ts` ou `capacitor.config.json` est prioritaire, avec les options existantes de Capacitor : `automatic`, `scrollableAxes`, `never` ou `always`.

Pour une application qui gère Safe Area en CSS et nécessite un contenu bord à bord :

```ts
const config: CapacitorConfig = {
  // Autres réglages Capacitor...
  ios: { contentInset: "never" },
};
```

Exécutez `npx cap sync ios` après modification de ce réglage. Cette valeur par défaut s’applique à la vue native de documents Worker ; la WebView Fetch uniquement ordinaire conserve le comportement normal de Capacitor. Aucune nouvelle option `workersCapacitor` n’est nécessaire.

## Plugins natifs

Choisissez une fonction utile à vos utilisateurs, comme prendre une photo, ouvrir la feuille de partage ou ressentir un retour après une action. Parcourez les [plugins Capacitor officiels](https://capacitorjs.com/docs/apis) et suivez l’installation et la configuration des permissions du plugin choisi.

1. Installez dans votre application une version du plugin compatible avec Capacitor 8, configurez les permissions iOS/Android requises, recompilez les ressources web et exécutez `npx cap sync`.
2. Appelez le plugin depuis le JavaScript client de la page en réponse à une action utilisateur. Gardez ces appels hors du SSR et des gestionnaires Worker : la fonction native appartient à l’appareil. Pour une page rendue à distance, incluez le JavaScript du plugin dans le build client de cette page et son paquet natif dans l’application Capacitor.
3. Vérifiez la fonction sur chaque plateforme cible, y compris le refus de permission, le départ de la page puis le retour, et la reprise de l’application. Enregistrez les écouteurs de page à son montage et retirez-les à son démontage ; un nouveau document exige de nouveaux écouteurs. Si la même page s’exécute sur le web, fournissez le comportement web pris en charge par le plugin ou une interface alternative.

Consultez [Using Plugins](https://capacitorjs.com/docs/basics/using-plugins) pour le parcours Capacitor et les [limites du cycle de vie des plugins](integration.md#treat-packaged-code-and-data-as-extractable) pour l’hôte de documents de cette bibliothèque.

## Configuration du build

Le plugin Vite ou esbuild existant prépare automatiquement les ressources de documents :

```ts
workersCapacitorPlugin({
  worker: "./workers/hono.tsx", // Ou le point d’entrée Workers Express.
});
```

Seul `render` sélectionne le rendu de documents à l’exécution ; cela n’a aucun rapport avec l’utilisation de `form[action]` par l’application. Les builds incluent les petites ressources internes même pour les applications Fetch uniquement, mais n’enregistrent pas de Service Worker et ne démarrent pas de rendu natif de documents tant que `render` n’est pas défini.

Pour le rendu natif, utilisez Vite avec `base: '/'` et compilez avant copy/sync de Capacitor. Le serveur de développement Vite reste disponible pour le développement Fetch uniquement ; le rendu natif de documents nécessite des ressources empaquetées. esbuild écrit les ressources à côté de son `outfile` ou dans `outdir` (les builds en mémoire `write: false` ne préparent pas les ressources de documents natifs). Placez les fichiers statiques copiés séparément dans le répertoire de sortie avant compilation afin qu’ils apparaissent dans le manifeste des ressources.

Le fichier généré `workers-capacitor-assets.json` identifie les ressources empaquetées, qui contournent le routeur Worker. Tous les autres chemins locaux atteignent le Worker. Android utilise `workers-capacitor-sw.js` pour les Request/Response et la gestion des redirections natives du navigateur. Ces noms de fichiers désignent des ressources d’implémentation, pas des imports applicatifs. Une configuration ESM brute doit fournir elle-même le fichier SW et le manifeste de ressources équivalents ; l’intégration automatique des ressources couvre actuellement Vite et esbuild.

## Implémentation native

- iOS conserve le contrôleur applicatif ordinaire. Le plugin conserve sa WebView existante comme hôte du runtime et ajoute un contrôleur interne de documents. Son gestionnaire de schéma est enregistré avant la création de la WebView de documents. L’hôte appelle le même gestionnaire Fetch via le transport Worker existant de la bibliothèque.
- Android conserve l’Activity ordinaire et la WebView visible. Le plugin crée un hôte persistant avec le mode hôte interne du bootstrap embarqué. Un Service Worker transmet les requêtes à cet hôte et sert les réponses via la navigation normale du navigateur. Le bootstrap s’exécute de nouveau dans l’hôte ; les effets de bord du démarrage applicatif ne doivent donc pas être placés après ou à côté du démarrage du runtime.
- Les sources natives du paquet se trouvent sous `native/`. `Package.swift` et le projet de bibliothèque Android sont inclus dans le tarball npm. Les hooks de mesure/rapport se trouvent sous `demo/tests/` ; ils ne font pas partie de l’implémentation native.

Aucun remplacement d’Activity/ViewController applicatif, iframe, Turbo ou remplacement du DOM HTML n’est requis. Le cycle de vie à deux WebViews est interne à l’adaptateur.

## Périmètre et limites

Il s’agit d’une version Preview. Le rendu de documents est exclusivement natif ; le démarrage de documents dans un navigateur ordinaire/Electron/Tauri n’est pas implémenté. Le comportement navigateur Fetch uniquement existant reste inchangé. Les corps de réponse sont lus par blocs de taille limitée ; les envois de documents restent mis en tampon avec une limite de 8 MiB. Le cache HTTP est désactivé pour les réponses Worker. Les redirections externes sont rejetées. Sur iOS, le pont Fetch côté page modélise les métadonnées de redirection avec des propriétés JavaScript plutôt qu’avec les slots internes de Response du navigateur. Le complément iOS pour les formulaires multipart couvre les soumissions POST locales dans la même fenêtre ; les fenêtres nommées et les cibles iframe ne sont pas prises en charge. Les en-têtes Origin et Fetch Metadata observés sont préservés. Lorsque iOS omet l’Origin d’un formulaire, le pont ne la récupère qu’à partir d’une origine de sécurité WebKit locale vérifiée de la frame principale. Les initiateurs opaques ou inconnus restent non fiables. D’autres requêtes natives peuvent toujours omettre Origin ; conservez une protection CSRF, par exemple un jeton validé. Origin n’est pas une authentification.

Le cycle de vie natif hôte/enfant, les délais maximaux des requêtes en attente et la libération explicite sont implémentés. L’arrêt/relancement du processus applicatif, l’arrière-plan/premier plan, les réinstallations de mise à jour des ressources sans effacement de données et l’arrêt suivi d’une réinitialisation sont couverts par la fixture native empaquetée, dont certains scénarios sur appareils physiques. Validez votre application sur ses appareils cibles ; la récupération après crash de WebView, la pression mémoire et les comportements arbitraires du cycle de vie des plugins tiers restent hors de cette couverture.

## Démo et validation

[demo/rendering](../demo/rendering) contient des exemples lisibles Hono/TSX et Workers Express : HTML racine, liens, POST suivi d’une redirection 303 et point d’accès JSON. La démo Fetch uniquement normale reste distincte.

`tests/unit/documents.test.ts` teste le point d’entrée public, les erreurs de démarrage, la restauration, la libération et le routage. Les tests Service Worker couvrent les octets POST, le remappage des redirections et les modifications du manifeste de ressources après mise à jour. Vite et esbuild compilent tous deux le point d’entrée public dans `demo/tests/build/documents.test.ts`.

La fixture empaquetée de validation native dans `demo/tests/fixtures/apps/packaged-native` appelle la même API publique. Une enveloppe Worker réservée aux tests ajoute le pilote de test navigateur au HTML retourné. Elle est installée depuis un véritable tarball dans un consommateur indépendant, puis utilise les commandes ordinaires `cap add`/`cap sync`. Aucun code natif ni enregistrement n’est modifié. Consultez `demo/tests/README.md` pour les commandes de reproduction.

### Arrêt et frontière de confiance

L’arrêt Android et l’échec de démarrage désactivent et désenregistrent uniquement le Service Worker de cette bibliothèque. Le démarrage Fetch uniquement efface aussi un ancien enregistrement de document ; attendez `ready` avant d’utiliser l’application. Les pages déjà contrôlées passent à la gestion native des requêtes sans attendre une navigation. L’état désactivé persiste après l’arrêt du Service Worker au repos. Les anciens transports sans protocole d’arrêt exigent un rechargement après désenregistrement. `dispose()` en mode Android Fetch uniquement peut retourner une promesse pendant cette migration.

Un Service Worker applicatif existant à la portée racine n’est pas écrasé. Le rendu de documents signale un conflit à la place. Les autres enregistrements applicatifs ne sont pas retirés lors du nettoyage.

Le Worker embarqué et le HTML qu’il produit sont du code applicatif de confiance. Les pages s’exécutent à l’origine locale Capacitor et peuvent accéder aux plugins natifs de l’application, comme du HTML empaqueté. Le rendu n’est pas un bac à sable pour du HTML non fiable ; les applications doivent échapper les valeurs non fiables et ne doivent pas rendre du HTML distant arbitraire comme des pages applicatives de confiance. Ce modèle de confiance s’applique à iOS et Android.

### Liens absolus d’articles

Les liens ordinaires de la frame principale vers l’origine configurée dans `baseURL` naviguent vers le chemin de document local correspondant, en préservant la chaîne de requête et le fragment. Faites correspondre `baseURL` à l’origine Worker de l’application lorsqu’elle génère des liens absolus. Les liens relatifs conservent leur comportement normal.

Le gestionnaire respecte les clics traités par le framework, les touches modificatrices, les téléchargements et les cibles autres que self. Il ne réécrit pas les origines externes, les liens d’iframe, les actions absolues de formulaires ni la navigation programmatique arbitraire. Android exige la prise en charge des scripts de début de document de la WebView pour ce comportement ; iOS utilise le script de début de document existant.
