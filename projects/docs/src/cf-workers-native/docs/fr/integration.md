---
title: "Intégrer une application Workers existante à Capacitor"
sourceRevision: "d9069246d07a30958643fd7296f5a4818302aca6fe484341d87d1209e8eac02b"
---

# Intégrer une application Workers existante à Capacitor

Pour une application [iOS](native-embedding.md#ios) ou [Android](native-embedding.md#android) existante, utilisez le guide d’intégration native. Ce guide concerne une application Capacitor, y compris sa création au démarrage d’un projet mobile ou l’utilisation de plugins Capacitor généraux.

Portez vos pages Workers existantes dans une application iOS et Android avec Capacitor. Ajoutez une compilation mobile, raccordez l’entrée Worker et utilisez Capacitor pour l’enveloppe native et les plugins. Conservez votre compilation cloud, votre rendu, vos routes, votre logique métier et votre authentification.

Suivez vous-même le [workflow](#workflow) ci-dessous ou donnez le [prompt d’intégration](#prompt-to-give-your-ai-assistant) à un assistant ayant accès au dépôt de votre application.

Le principal critère de réussite est une application native fonctionnelle avec un effort d’intégration minimal, pas une nouvelle architecture applicative. Conservez les documents HTML, liens et formulaires ordinaires là où l’application les utilise. La conversion en SPA, un nouveau routeur client, une refonte d’App Shell, la séparation SSR/API et l’ajout d’hydratation ne sont pas des prérequis.

## Comment les pages Worker existantes arrivent à l’écran

Avec `render`, la bibliothèque fournit la réponse du Worker comme réponse à une requête de document WebView. La WebView rend ce HTML comme une page, exécute ses scripts et charge ses ressources. L’application n’a pas à insérer du HTML dans un DOM existant ni à l’afficher dans une iframe.

```text
WebView opens /notes at the app's local origin
  → the library receives the document request
  → generated dispatch selects local or remote execution
      local:  the existing Fetch handler runs on the device
      remote: the request goes to the existing deployed Worker
  → response status, headers and HTML body return through the document bridge
  → WebView renders the page
```

Les deux parcours d’exécution utilisent le même mécanisme de réponse documentaire. Une page utilisant D1 peut conserver son authentification, sa requête et son SSR sur le Worker distant ; une page indépendante compatible peut être rendue localement. Le build peut sélectionner le Worker entier pour l’exécution distante lorsqu’une séparation sûre est impossible. Il s’agit d’acheminement de requêtes, pas du déplacement individuel des opérations D1 entre runtimes.

Suivre un lien ordinaire produit la requête de document suivante via le même mécanisme. Les soumissions de formulaires prises en charge et les redirections de même origine conservent aussi la navigation documentaire. Les scripts client existants peuvent fournir l’interaction ou l’hydratation lorsque le framework les utilise. Les ressources empaquetées contournent le routeur Worker ; les autres requêtes suivent le routage configuré. Préservez le modèle de pages existant de l’application avant d’envisager une refonte.

Sur iOS, le pont utilise `WKURLSchemeHandler` ; sur Android, un Service Worker. La page visible conserve l’URL locale de l’application (normalement `capacitor://localhost` sur iOS et `https://localhost` sur Android), tandis que le Worker reçoit son URL logique HTTP(S). Il s’agit de rendu natif de documents, pas d’un onglet de navigateur distant ni d’un serveur HTTP local. Consultez le [guide de rendu natif](native-rendering-api.md) pour les limites des formulaires, redirections, ressources et cycles de vie ; cela ne garantit pas chaque fonctionnalité de navigateur ou de framework.

## Instruction à donner à votre assistant IA

```text
Follow https://github.com/rdlabo-dev/cf-workers-native/blob/v0.1.2/docs/integration.md
to bring this app to iOS and Android with cf-workers-native.
Preserve its pages, routes and authentication; verify it on the target platforms.
```

Fournissez les plateformes cibles, l’identifiant/le nom de l’application et, si disponible, une origine Worker de test existante. L’assistant doit déduire les points d’entrée, le framework et les scripts du dépôt, en ne demandant que les choix produit manquants ou les accès qu’il ne peut pas déduire.

## Procédure

Suivez les étapes de sécurité et de vérification ci-dessous. Les déploiements cloud et la publication de l’application nécessitent une autorisation explicite de l’utilisateur.

1. Inspectez l’application et sélectionnez le rendu HTML natif ou l’intégration Fetch uniquement.
2. Installez Capacitor et ce paquet dans l’application.
3. Configurez le build natif et connectez le Worker existant.
4. Vérifiez que le comportement reste inchangé ; ne corrigez que les incompatibilités démontrées.
5. Contrôlez la sécurité et vérifiez le parcours réel de l’application.

## 1. Inspecter l’application et choisir l’intégration

Commencez par l’[inventaire des intégrations de frameworks](build-setup.md#frameworks). Angular SSR sur Workers n’est pas encore vérifié ; la prise en charge de l’outil de build ne démontre pas celle du framework. Pour Void, suivez son guide du point d’entrée généré et ses exigences de version.

Lisez le point d’entrée Worker, les scripts de build, la configuration Wrangler, les routes de pages, les middlewares et le code d’authentification. Consignez ces décisions dans le plan d’implémentation, plutôt que d’ajouter un document permanent de suivi :

- Quelles routes produisent du HTML, du JSON et des ressources statiques ?
- Quelles pages nécessitent D1, d’autres bindings, des secrets ou une session avant le rendu ?
- Quelles dépendances peuvent s’exécuter localement et lesquelles nécessitent le Worker déployé existant ?
- Qu’est-ce qui authentifie les appels d’API, et où sont imposées la propriété et l’autorisation ?
- La navigation demande-t-elle davantage de contenu rendu côté serveur ? Incluez les mises en page imbriquées, les redirections, les requêtes de données du framework et les mutations, pas seulement la première page.
- Quelles ressources et API de runtime doivent être disponibles localement ?

Préservez le build cloud existant. Ajoutez l’intégration Vite ou esbuild uniquement au build Capacitor. N’ajoutez pas de serveur HTTP Node, ne remplacez pas le contrôleur natif, n’intégrez pas d’iframe et n’importez pas les fichiers de transport internes de la bibliothèque dans le code applicatif.

Choisissez l’intégration minimale qui préserve l’application :

- **Frontend existant appelant les API Worker :** conservez-le et initialisez le runtime Fetch-only avant son montage. Aucune migration de rendu n’est requise.
- **Worker retournant du HTML (Hono/TSX, Workers Express, OpenNext) :** utilisez le rendu natif de documents avec `render`. Préservez son routeur et son rendu lorsqu’ils sont pris en charge.
- **Requêtes dépendant du cloud :** configurez l’exécution distante et inspectez le rapport de compilation. Conservez le gestionnaire existant. L’envoi distant du Worker entier est un repli de compatibilité ; il n’impose pas le téléchargement distant de toutes les ressources client. Embarquez la sortie client publique du framework lorsque c’est sûr et vérifiez séparément les requêtes de ressources.

## 2. Installer Capacitor et ce paquet

Utilisez Capacitor 8 et des paquets de plateformes compatibles. Préparez les SDK des plateformes avec le [guide d’installation de Capacitor](https://capacitorjs.com/docs/getting-started). Dans le paquet de l’application (réutilisez sa configuration Capacitor existante, le cas échéant) :

```sh
npm install @capacitor/core@8 @capacitor/ios@8 @capacitor/android@8
npm install -D @capacitor/cli@8 typescript
npx cap init
```

Pour l’exemple Vite ci-dessous, installez `vite@7` en dépendance de développement s’il n’est pas déjà présent. Conservez une configuration esbuild existante prise en charge plutôt que d’ajouter Vite.

Définissez l’identifiant/nom de l’application et `webDir: "www"`. Utilisez Swift Package Manager pour iOS ; cette bibliothèque n’inclut pas d’intégration CocoaPods. Le package renommé attend sa publication ; utilisez l’archive source ci-dessous jusque-là. Après publication, installez la préversion 0.1.2 depuis npm :

```sh
npm install cf-workers-native@0.1.2
```

Pour compiler depuis les sources, créez plutôt une archive du package depuis un checkout de ce dépôt :

```sh
# Dans le checkout du SDK :
npm install
npm pack

# Dans le package de l’application :
npm install /path/to/cf-workers-native/cf-workers-native-0.1.2.tgz
```

`npm pack` lance la compilation du SDK via `prepack`. Installez l’archive générée plutôt que le répertoire du checkout : une installation de répertoire peut créer un lien symbolique vers l’arborescence du SDK, y compris un chemin récursif si l’application se trouve dans ce checkout. Le nom d’archive ci-dessus utilise la version source actuelle.

Le package installé se nomme `cf-workers-native` ; le répertoire du checkout peut conserver le nom du dépôt. L’ancienne préversion publiée `workers-capacitor@0.1.1` utilise l’ancien nom et ne fournit pas les imports présentés ici. Conservez la même révision source pour les dépendances JavaScript et natives.

### Migrer depuis l’ancien package npm

Si votre application dépend déjà de `workers-capacitor`, retirez-le avant d’installer le package renommé. Conserver les deux peut amener Capacitor à découvrir et enregistrer deux fois le même plugin natif. Dans le package applicatif, avec la préversion 0.1.2 :

```sh
npm uninstall workers-capacitor
npm install cf-workers-native@0.1.2
```

Remplacez les imports du runtime de `workers-capacitor` par `cf-workers-native/capacitor`, et les autres sous-chemins par le préfixe `cf-workers-native`. Recompilez les ressources Web mobiles avec la commande existante, puis exécutez `npx cap sync` pour régénérer les dépendances natives des plugins. Les nouvelles applications suivent directement les étapes d’installation ci-dessus.

Avant de compiler une cible native, vérifiez les [prérequis SDK natifs et les règles de ressources Gradle Android](development.md#capacitor-native-demo). Les règles de ressources Android appartiennent au fichier `android/app/build.gradle` de l’application.

Gardez Capacitor et les projets natifs dans le paquet de l’application, pas dans l’arbre des sources de la bibliothèque. Réutilisez les dépendances et scripts existants plutôt que de créer inutilement une seconde application.

## 3. Configurer et compiler l’application native

Pour une application rendue par le Worker, ajoutez ces fichiers à côté du Worker existant :

```text
src/worker.ts             Existing Worker entry
capacitor/index.html     Runtime bootstrap only
capacitor/main.ts        Runtime initialization
capacitor/vite.config.ts Separate native build
capacitor.config.ts      webDir: "www"
```

```html
<!-- capacitor/index.html -->
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Application</title>
  </head>
  <body>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
```

```ts
// capacitor/vite.config.ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "cf-workers-native/tooling/vite";
const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  root: here("."),
  base: "/",
  plugins: [
    workersCapacitorPlugin({
      worker: here("../src/worker.ts"),
      workerConfig: here("../wrangler.jsonc"),
    }),
  ],
  build: { outDir: here("../www"), emptyOutDir: true, target: "es2022" },
});
```

Cet exemple utilise Vite. Pour un build esbuild existant, utilisez plutôt la [configuration esbuild](build-setup.md#esbuild). N’introduisez pas Vite uniquement pour remplacer un build pris en charge. L’ESM navigateur simple est disponible pour du JavaScript compatible navigateur, mais ne prépare pas automatiquement les ressources de documents natifs.

Adaptez les chemins à l’application réelle. Pour OpenNext, le point d’entrée est le fichier généré `.open-next/worker.js` ; compilez-le d’abord et configurez explicitement ASSETS distant s’il est utilisé. La configuration supplémentaire est décrite dans le [guide des bindings](cloudflare-bindings.md).

```ts
// capacitor/main.ts — configuration du document local
import { workersCapacitor } from "cf-workers-native/capacitor";
const runtime = workersCapacitor({
  baseURL: "https://your-worker.example.com/",
  render: "/",
});
await runtime.ready;
```

Pour les routes distantes ou l’exécution distante du Worker entier, la destination vaut par défaut `new URL(baseURL).origin`. Définissez `remote.origin` uniquement si la destination déployée diffère de cette origine logique. Les options d’authentification comme `remote: { getToken: async () => getExistingSessionToken() }` ne nécessitent pas de répéter l’URL ; la gestion de session appartient toujours à l’application.

Le chemin de `baseURL` reste la limite d’interception, pas un préfixe ajouté aux requêtes. Les compilations purement locales restent locales. Les destinations distantes doivent utiliser HTTPS. Les intégrations existantes avec un `baseURL` logique fictif doivent le remplacer par l’URL déployée ou conserver un `remote.origin` explicite : son omission choisit désormais l’origine de `baseURL` au lieu d’échouer faute de configuration. Un remplacement explicite invalide est rejeté, pas remplacé. L’origine applicative reste `capacitor://localhost` sur iOS et normalement `https://localhost` sur Android. Consultez le [contrat d’URL](runtime.md#url-contract).

`render` sélectionne le rendu natif de documents, liens et formulaires inclus ; ce n’est pas une option spécifique aux formulaires. Pour un frontend existant compilé séparément, omettez `render`, initialisez le runtime Fetch uniquement avant le montage de l’interface et utilisez un périmètre `baseURL` réservé à l’API tel que `https://your-worker.example.com/api/`. Gardez ce frontend hors du périmètre de l’API. Le point d’entrée du plugin doit être le Worker API correspondant ; inspectez aussi son rapport d’acheminement distant.

Compilez et installez (n’ajoutez chaque plateforme native qu’une fois) :

```sh
npx vite build --config capacitor/vite.config.ts
npx cap add ios
npx cap add android
npx cap sync
npx cap run ios
# Ou : npx cap run android
```

Compilez avant chaque synchronisation. Le rendu de documents utilise des ressources empaquetées, pas le serveur de développement Vite. Consultez le [rendu natif](native-rendering-api.md) pour le cycle de vie et les ressources.

## 4. Préserver le comportement et ne corriger que les incompatibilités réelles

Compilez et exécutez l’entrée existante avant de proposer une refonte. Configurez ses bindings et sa connexion au Worker existant avec le [guide des bindings distants](cloudflare-bindings.md). `remote.origin` (ou l’origine de `baseURL` s’il est omis) fournit la destination ; il ne classe pas les routes. Le plugin génère l’envoi à partir de l’application et de sa configuration.

Vérifiez l’initialisation du client aussi bien que la sortie SSR. Une bibliothèque cliente qui déduit un point d’accès HTTP(S) de `window.location.origin` peut rejeter le schéma iOS `capacitor://` avant la fin de l’hydratation. La [fixture flare-stack-blog épinglée](../demo/tests/upstream/flare-stack-blog/README.md) reproduit cela avec Better Auth. Si la bibliothèque accepte un point d’accès HTTPS explicite, validez cette configuration avec l’authentification, les cookies et le routage ; l’exécution distante du Worker ne change pas à elle seule l’origine de la page visible. N’usurpez pas l’origine et ne désactivez pas les contrôles d’authentification pour faire réussir l’initialisation.

| Application existante | Première approche d’intégration | Frontière à vérifier |
| --- | --- | --- |
| Hono / TSX retournant du HTML | Conservez `export default app`, les modèles, routes et formulaires ; utilisez `render` | Les gestionnaires compatibles rendent localement sans serveur HTTP en écoute |
| Workers Express | Conservez le point d’entrée gestionnaire Fetch Workers et les routes existantes | La prise en charge de Workers Express est distincte de celle d’applications serveur Node.js arbitraires |
| Requête D1 suivie de SSR | Gardez la requête et la réponse HTML ensemble ; acheminez la requête vers le Worker existant | D1 reste distant ; aucune réécriture SQL vers fetch ni nouveau point d’accès JSON n’est requis |
| Middleware de session protégeant les pages | Conservez les middlewares et sessions gérées par le serveur | Les dépendances Cookie/état partagé peuvent sélectionner l’exécution distante du Worker entier |
| Next.js / OpenNext | Compilez la sortie cloud existante et sélectionnez `.open-next/worker.js` | Les dépendances cloud peuvent maintenir le Worker généré entier à distance |
| ASSETS cloud | Configurez `assetsExecution: "remote"` | ASSETS local n’est pas implémenté ; conservez le comportement cloud existant des ressources |

La valeur par défaut `execution: "network"` conserve le Worker existant sur le serveur. Ne demandez pas à l’utilisateur d’énumérer les routes avant que l’intégration de base fonctionne. Si une exécution locale est nécessaire, un tableau `execution` autorise explicitement la distribution des implémentations sélectionnées et des dépendances conservées. Les enregistrements Hono et un [profil limité de compilation générée OpenNext](opennext.md#route-execution) prennent en charge cette sélection. La compilation préserve les limites serveur et peut conserver tout le Worker à distance si la séparation est incertaine. Inspectez `workers-capacitor-d1.json` ou `workers-capacitor-server.json` ; une sélection non vide sans gestionnaire local émet un avertissement.

Les motifs sélectionnent des enregistrements, pas les URL entrantes. Hono utilise ses motifs enregistrés ; le profil OpenNext compatible sélectionne des chemins statiques. `/app/*` inclut `/app` lui-même et ses descendants correspondants ; les motifs peuvent aussi autoriser de futurs enregistrements. Vérifiez ce périmètre avant d’utiliser `method: "*"`. Ne déduisez jamais une permission de distribution de GET, du HTML, d’un préfixe REST ou de l’absence de binding connu. Une application autonome peut utiliser explicitement `execution: "local"`, qui distribue tout le Worker sans analyse des routes. Ne l’utilisez pas pour contourner les limites protégées. Consultez la [configuration de l’exécution](cloudflare-bindings.md#choosing-execution).

Par exemple, une page qui authentifie l’utilisateur, interroge D1 et retourne du HTML SSR peut conserver toute cette séquence sur le Worker déployé. L’appareil affiche la réponse et utilise le modèle d’interaction existant de l’application. Cela nécessite une connexion ; cela ne rend pas D1 disponible localement. Consultez l’[acheminement D1](d1-transparent-migration.md) et l’[exemple OpenNext](../demo/opennext/README.md). L’exécution distante est une manière prise en charge de préserver l’application, pas une migration incomplète nécessitant une refonte ultérieure.

### Next.js : distinguer le rendu de l’exécution des données

`dynamic(..., { ssr: false })` désactive le prérendu serveur pour ce Client Component. Son JavaScript le rend dans la WebView. Cela ne désactive pas le traitement serveur de toute la page, ne déplace pas les requêtes de base de données sur l’appareil et ne crée pas automatiquement d’API distante. Consultez le [chargement à la demande de Next.js](https://nextjs.org/docs/app/guides/lazy-loading).

Inspectez le lieu réel d’exécution de chaque requête avant de proposer des modifications :

| Emplacement de la requête existante | Comportement à préserver |
| --- | --- |
| `useQuery`, SWR ou code client appelant une API HTTP | La WebView exécute le code client ; l’API traite ses opérations serveur. Préservez le point d’accès et l’authentification existants. |
| Server Component parent ou `getServerSideProps` interrogeant D1 | La requête reste dépendante du serveur même si un composant enfant a `ssr: false`. Utilisez l’acheminement distant des requêtes pris en charge. |
| Accès D1 direct importé dans le code client | Cela ne peut pas s’exécuter dans la WebView. `ssr: false` ne le transforme pas en appel HTTP ; identifiez la frontière invalide avant d’effectuer une correction ciblée. |

Pour une application déjà structurée comme rendu client → requête API → D1, conservez cette structure. N’ajoutez pas une autre couche d’API, ne forcez pas SSR et ne remplacez pas sa bibliothèque de requêtes pour intégrer Capacitor. Si la requête utilise Server Actions ou un autre transport de framework au lieu d’une API HTTP ordinaire, vérifiez ce transport au regard des limites documentées du framework plutôt que de supposer une prise en charge identique.

Ne déduisez pas un SSR réel d’un indicateur, d’une réponse HTTP 200 ou d’une chaîne trouvée dans le corps de la réponse. Vérifiez que le contenu attendu existe sous forme d’éléments du document avant l’exécution des scripts de page ; du texte dans les scripts ou des données RSC sérialisées ne constituent pas du HTML rendu. Le HTML initial seul ne distingue pas un prérendu au build d’un SSR à la requête. Consultez les métadonnées de build du framework pour les routes prérendues et vérifiez le rendu à la requête avec de nouvelles valeurs dépendant de la requête présentes dans les éléments du document. Sans cette preuve, signalez un HTML initial dont le moment de rendu est inconnu. Comparez ensuite avec JavaScript activé et observez les requêtes d’API/de framework. Une page peut contenir à la fois une mise en page rendue côté serveur et des zones de données uniquement côté client. Consignez le résultat par zone et route testée, pas comme une étiquette SSR universelle pour toute l’application.

Embarquez les ressources client publiques via `publicDir` de Vite, ou copiez-les dans la sortie esbuild avant compilation. L’hôte de documents sert ces chemins exacts localement même si les gestionnaires serveur restent distants. Copiez uniquement les fichiers ne nécessitant ni autorisation ni middleware serveur ; les fichiers de contrôle Cloudflare ne s’appliquent pas localement. Consultez les configurations [OpenNext](opennext.md#bundle-client-assets-alongside-remote-pages) et [Void](void.md). Maintenez la compatibilité entre versions serveur et client embarqué, y compris pour les anciennes applications installées.

Le rendu des composants et l’acheminement Worker sont des décisions distinctes. L’intégration au build n’interprète pas `ssr: false` comme une instruction de route locale. Un Worker OpenNext généré avec des dépendances cloud peut toujours sélectionner l’exécution distante du Worker entier pour les documents initiaux et les requêtes d’API. Inspectez le rapport de build et testez les requêtes réelles ; un écran rendu côté client ne démontre pas à lui seul un démarrage local ou une disponibilité hors ligne.

### Lorsque la configuration ne suffit pas

Reproduisez l’échec et déterminez s’il provient de la configuration, des limites documentées de la bibliothèque ou des hypothèses de l’application. Corrigez d’abord la configuration. Si une modification applicative est nécessaire, limitez-la au comportement en échec et vérifiez que le comportement cloud est préservé.

- **Contrôles CSRF fondés uniquement sur Origin :** les en-têtes observés sont préservés ; iOS ne récupère l’Origin manquante d’un formulaire qu’à partir d’un initiateur local vérifié de la frame principale. D’autres requêtes peuvent l’omettre. Conservez une protection CSRF, comme la validation de jetons ; ne la désactivez jamais.
- **Redirections d’authentification externes :** le transport distant rejette les redirections vers une autre origine. Utilisez une [intégration explicite d’authentification par navigateur externe](../demo/authentication/README.md) si l’application l’exige ; ne remplacez pas son fournisseur d’identité uniquement pour éviter cette frontière.
- **Passkeys/WebAuthn :** le rendu du HTML distant conserve l’origine locale du document. Une authentification réussie dans le navigateur ne démontre pas la prise en charge de l’enregistrement natif ou de PRF. Validez le domaine de la partie de confiance, l’intégration des identifiants de la plateforme et l’association application/domaine ; ne contournez pas les contrôles d’origine. La [fixture pknotes](../demo/tests/upstream/pknotes/README.md) documente la frontière native actuelle.
- **Comportement de runtime ou de framework non pris en charge :** consultez l’[inventaire de compatibilité](compatibility.md) et les [limites d’OpenNext](opennext.md). Démontrez la fonctionnalité en échec avant de remplacer des dépendances ou de changer le rendu. Un import ou une réponse SSR réussis ne démontrent pas une prise en charge complète du framework.

Signalez explicitement les limites non résolues. Ne les masquez pas par des données vides, des réussites simulées ou des nouvelles tentatives automatiques susceptibles de répéter des écritures.

### Optimisation ultérieure facultative : rendu initial local

Ne poursuivez cette voie que si l’application exige un démarrage local ou une amélioration mesurée après réussite de l’intégration de base. Un SSR existant compatible peut s’exécuter dans le Worker local, produisant du HTML avant l’interaction client ou l’hydratation. Le SSR mérite d’être préservé ; l’exécution locale n’implique pas un rendu uniquement côté client.

Si ce moteur de rendu attend des données distantes, séparer un App Shell rendu localement des requêtes de données authentifiées est un refactoring applicatif possible. Il n’est pas automatique et sort du travail d’intégration par défaut. Préservez les modèles, la navigation et l’autorisation, et mesurez l’apparition du contenu utile et des contrôles utilisables avant d’annoncer un gain de vitesse. Pour Next.js, l’hydratation seule ne supprime pas les dépendances serveur ; consultez les [limites d’OpenNext](opennext.md). Ne convertissez pas l’application cloud en export statique et n’ajoutez pas de nouvelles API uniquement pour terminer ce guide.

### Fichiers déclarés réservés au serveur

Utilisez `serverOnly` dans le plugin Vite ou esbuild de Capacitor pour interdire la distribution de modules ou fichiers sources précis :

```ts
workersCapacitorPlugin({
  worker: "./src/worker.ts",
  execution: [{ method: "GET", path: "/public" }],
  serverOnly: ["./src/server/signing.ts", "./secrets/test-key.pem"],
  remoteBindings: ["SIGNING_KEY"],
});
```

Les déclarations sont des chemins exacts de fichiers existants, relatifs à la racine Vite ou à `absWorkingDir` d’esbuild (cwd par défaut) ; les chemins absolus conviennent aussi. Répertoires et globs ne sont pas des déclarations. Les alias par liens symboliques résolvent le même fichier protégé. `remoteBindings` déclare des noms de bindings serveur ; `serverOnly` protège des fichiers qui n’accèdent pas nécessairement à un binding. Aucune déclaration ne contient de secret ni ne récupère d’identifiants de production.

`network` continue d’exclure le code Worker. `local` échoue si ses imports embarqués incluent un fichier déclaré. Avec les autorisations de routes, une dépendance déclarée maintient le Worker distant : l’implémentation actuelle conserve prudemment tout le Worker plutôt que de tenter une séparation à travers cette limite de fichier. Si `serverOnly` est fourni, l’optimisation des frameworks générés utilise l’analyse générique prudente. Une autorisation de route ne remplace jamais une interdiction de fichier.

Les imports client directs/transitifs séparés, `workerFiles`, les copies du répertoire public Vite (liens symboliques compris) et les imports ordinaires de ressources Vite/esbuild ne peuvent pas inclure un fichier déclaré. Vite vérifie aussi les entrées suivies des ressources CSS/HTML intégrées et les références statiques `new URL(..., import.meta.url)`, alias compris. Une inclusion interdite fait échouer la compilation en indiquant le chemin source, pas son contenu. La règle s’applique aussi dans le Dedicated Worker généré.

Il s’agit d’une limite de distribution des compilations de production, pas d’un analyseur général de secrets. Elle couvre les fichiers consommés par ces plugins et la gestion intégrée des imports/ressources du bundler. Les plugins personnalisés ou scripts externes injectant/copiant des données sans provenance source, les artefacts précompilés contenant déjà le contenu transformé d’un fichier et les fichiers ajoutés après compilation nécessitent une revue distincte. Les définitions du bundler et `env` client ne sont pas analysés pour détecter des secrets non déclarés. Les clés publiques de vérification et configurations restent autorisées sauf déclaration explicite ; une variable nommée `KEY` seule n’est pas rejetée.

La fixture synthétique exécutable `demo/tests/build/server-only.test.ts` compile un Worker important un module privé, prouve l’absence de son marqueur dans les JS/maps/fichiers mobiles autorisés et vérifie le rejet d’imports/copies clients dans les deux adaptateurs. Après `npm run build`, lancez-la avec `cd demo && npx vitest run --config tests/vitest.build.config.ts tests/build/server-only.test.ts`. Conservez les identifiants serveur réels dans le stockage/bindings serveur et obtenez ceux des utilisateurs à l’exécution via le flux d’authentification existant décrit ci-dessous.

## 5. Sécurité : l’appareil n’est pas un serveur de confiance

### Ce que le build supprime

Avec la frontière distante générée au build, les gestionnaires serveur et leurs helpers inutilisés, y compris leur SQL, sont retirés du graphe de modules client avant la génération des source maps. Le mode distant pour le Worker entier omet l’implémentation applicative. C’est une **exclusion à la compilation**, pas une suppression des sources originales ni un assainisseur SQL à l’exécution. Consultez la [suppression du code](d1-transparent-migration.md#code-removal-and-execution-boundaries).

Elle ne détecte pas tous les secrets codés en dur. Les fichiers copiés manuellement dans les ressources publiques, `workerFiles`, les définitions de bundler, `env` du client, les journaux et les imports client sans rapport peuvent toujours exposer des données sensibles. Inspectez le JS empaqueté, les maps et les ressources. Ne contournez jamais la suppression en important séparément le module serveur original.

### Authentifier et autoriser les opérations distantes

Pour les données privées et les écritures, le Worker doit valider une session ou un jeton bearer et autoriser chaque opération. Obtenez l’identifiant utilisateur depuis l’identité vérifiée, pas depuis un champ de requête non fiable. Limitez les requêtes de base de données au propriétaire ou locataire autorisé. Testez que l’utilisateur A ne peut ni lire ni modifier les enregistrements de l’utilisateur B.

CORS, un point d’accès caché, la suppression du SQL, un identifiant fourni par l’appareil et une clé d’API partagée embarquée ne sont pas de l’authentification. Conservez l’authentification existante si disponible ; cette bibliothèque transporte les identifiants mais n’émet pas d’identités et n’impose pas de politique. Les points d’accès publics en lecture peuvent rester volontairement publics avec des limites appropriées.

### Utilisateurs anonymes sans interface de connexion

Pour une application sans authentification existante, Firebase Anonymous Authentication est une option pour les identités invitées. Il crée un UID sans écran d’inscription ; préservez la session existante au lieu de créer un nouveau compte à chaque lancement. Consultez le [guide Firebase de connexion anonyme](https://firebase.google.com/docs/auth/web/anonymous-auth).

Connectez l’instance d’authentification initialisée côté hôte via `remote.getToken` :

```ts
remote: {
  origin: "https://your-worker.example.com",
  getToken: async () => {
    const user = auth.currentUser; // authentification Firebase initialisée avant le démarrage
    if (!user) throw new Error("Authentication required");
    return user.getIdToken(); // Actualise les jetons expirés via le SDK
  },
}
```

Il s’agit de pseudo-code de connexion, pas d’un adaptateur Firebase embarqué. Ne l’utilisez que si l’application ne dispose pas d’authentification existante et si une identité invitée convient à sa politique d’accès. Restaurez la session existante avant de décider si une connexion anonyme est nécessaire ; conditionnez les requêtes protégées à la disponibilité de l’authentification et traitez explicitement les échecs. Si l’application possède déjà un écran local public de chargement, l’authentification n’a pas à le bloquer. Cela n’exige pas l’ajout d’un nouvel App Shell.

Gardez la récupération de jetons dans l’hôte, pas dans le Worker isolé. Les pages de documents natifs et l’hôte du runtime ont des contextes JavaScript distincts ; une instance Firebase côté page n’est pas automatiquement celle de l’hôte. Android initialise l’hôte séparément. Un jeton présent uniquement dans la closure de l’interface initiale y est indisponible. Restaurez les identifiants dans l’hôte sans répéter une connexion interactive, ou échangez le jeton du fournisseur contre la session HttpOnly du Worker existant ; l’[exemple de navigateur externe](../demo/authentication/README.md) illustre cette dernière solution.

Le serveur doit vérifier la signature, l’expiration, l’émetteur et l’audience du projet selon les [exigences Firebase de vérification des ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens), avec un vérificateur compatible Workers ; décoder les claims JWT ne suffit pas. Les Firebase Security Rules ne protègent pas D1 : implémentez l’autorisation dans le Worker.

Une identité anonyme ne prouve ni une personne réelle, ni un appareil fiable, ni l’installation officielle d’une application. N’importe qui peut créer un compte invité. Limitez les privilèges invités, les débits de requêtes et les opérations coûteuses ; fournissez une liaison de compte si les données doivent survivre à la perte des identifiants locaux. Envisagez [App Check](https://firebase.google.com/docs/app-check) pour la protection contre les abus, séparément de l’authentification utilisateur. Cette bibliothèque ne fournit ni attestation native ni validation App Check.

[Cloudflare Access](https://developers.cloudflare.com/workers/configuration/cloudflare-access/) est une alternative pour des audiences à accès contrôlé comme les applications internes, pas un service d’identité invitée interchangeable. N’embarquez jamais un secret partagé de jeton de service Access dans une application distribuée.

### Considérer le code et les données empaquetés comme extractibles

Les bundles Capacitor peuvent être inspectés. N’intégrez pas de jetons de gestion Cloudflare, clés privées de comptes de service, identifiants de bases de données ou jetons de services privilégiés dans le JS, les sources natives, les valeurs `.env` compilées dans l’application ou les fichiers embarqués. L’obfuscation ne sécurise pas un secret. Les identifiants/configurations publics du client sont distincts des identifiants serveur et ne doivent pas servir de preuve de confiance.

Les identifiants utilisateur nécessitent expiration, traitement de révocation/déconnexion et stockage adapté à la plateforme. Le stockage protégé par le système réduit l’exposition mais ne rend pas fiable un appareil compromis. Évitez de journaliser les jetons et réponses privées ; effacez les données mises en cache propres à l’utilisateur lors des changements de compte. Le Worker distant ne doit retourner que les données que l’appelant est autorisé à recevoir.

Le HTML distant exécute ses scripts client dans la WebView documentaire de l’application ; les appels de plugins en proviennent, pas du Worker distant. Vérifiez les appels de plugins personnalisés, les résultats et la réception des événements natifs depuis la page rendue après navigation. iOS crée un contrôleur documentaire Capacitor distinct ; on ne suppose donc pas que les instances de plugins enregistrées manuellement et les écouteurs de l’hôte original soient transférés. Android conserve la WebView visible de l’application. Le [scénario de validation native](../demo/tests/README.md#native-plugin-calls-from-remote-pages) vérifie un plugin de paquet enregistré automatiquement, y compris les résultats d’appels, événements natifs et erreurs après navigation et relancement. Les nouveaux documents enregistrent de nouveaux écouteurs ; les anciens écouteurs de page ne survivent pas au remplacement du document. Les cycles de vie arbitraires de plugins personnalisés et l’enregistrement manuel dans l’hôte restent hors de cette couverture.

Les documents natifs ont accès aux plugins Capacitor : échappez le contenu non fiable et ne rendez pas du HTML arbitraire comme du code applicatif. Pour l’authentification par cookies, conservez la protection CSRF. Les en-têtes Origin et Fetch Metadata observés sont préservés. Pour un formulaire de frame principale iOS dont l’Origin manque, le pont natif ne la récupère qu’à partir d’une origine de sécurité WebKit locale vérifiée. Les initiateurs en bac à sable ou inconnus ne se voient pas attribuer cette origine. D’autres requêtes natives peuvent toujours omettre Origin ; conservez la protection CSRF et ne considérez jamais Origin comme de l’authentification. Les redirections vers des origines externes sont rejetées ; OAuth/SSO exige une intégration explicite de navigateur externe. Consultez les [frontières du transport distant](d1-transparent-migration.md).

## 6. Vérifier l’application existante dans Capacitor

La validation signifie que l’application existante fonctionne via le nouveau point d’entrée et la nouvelle configuration, chaque modification du code applicatif étant justifiée par une incompatibilité démontrée. Comparez le parcours natif à l’application cloud existante ; ne faites pas d’une refonte du rendu ou d’une amélioration des performances une condition de l’intégration.

Testez les plateformes iOS et Android cibles avec un véritable parcours utilisateur :

- Lancez l’application et vérifiez la page initiale existante, les scripts, styles, images et interactions. Vérifiez l’hydratation uniquement si l’application l’utilise.
- Suivez les liens, revenez en arrière, soumettez les formulaires et suivez les redirections de même origine. Testez le comportement existant des liens profonds lorsque pertinent.
- Authentifiez-vous, lisez des données privées, effectuez une seule mise à jour, relancez et déconnectez-vous. Vérifiez l’état de la base et le comportement de la session, y compris l’isolation par rapport au compte précédent.
- Rejetez les identifiants absents/expirés/falsifiés et les accès entre utilisateurs. Vérifiez la protection CSRF des mutations authentifiées par cookies.
- Déconnectez ou ralentissez le backend. Signalez la dépendance à la connexion du mode d’exécution choisi et vérifiez des échecs explicites sans fausse réussite ni écritures répétées. Le démarrage local n’est pas requis pour une application dont le Worker entier est distant.
- Inspectez les rapports de build et les ressources empaquetées : l’acheminement local/distant correspond à la configuration choisie, les SQL/helpers serveur exclus sont absents et aucun identifiant privilégié n’a été embarqué.
- Exécutez les tests cloud existants de l’application pour vérifier que l’intégration n’a pas changé son comportement serveur. Les tests navigateur ne remplacent pas les tests natifs de navigation/session.

Rapportez les fichiers d’intégration ajoutés, chaque modification applicative nécessaire et son motif, les commandes exécutées, les plateformes testées, les frontières d’exécution et les limites restantes. Distinguez les contrôles sur simulateur/émulateur de ceux sur appareil physique, et l’exécution distante de la compatibilité locale. Sans backend de test déployé ou SDK natif disponible, indiquez ce qui a pu ou non être vérifié plutôt que d’affirmer que tout est terminé.
