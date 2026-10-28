---
title: "Intégrer une interface Workers dans une application native existante"
sourceRevision: "6a9d6426c879d890930515839872ba93b7af21a21e49f6f7798aa44b45619112"
---

# Intégrer une interface Workers dans une application native existante

Ajoutez vos pages Workers à un écran d’une application UIKit, SwiftUI ou Android existante. Conservez le point d’entrée, la navigation et l’écran racine natifs tout en réutilisant vos routes et votre rendu Workers dans la WebView du SDK.

Choisissez [iOS](#ios) ou [Android](#android) pour la configuration native. Les deux utilisent la [compilation Web partagée](#shared-web-build) ci-dessous et les mêmes options de runtime. Pour une nouvelle application mobile ou des plugins natifs généraux, utilisez l’[intégration Capacitor](integration.md).

Vous compilerez les ressources Web dans votre projet Web, ajouterez le SDK natif à votre application, puis ouvrirez et fermerez un écran Workers via son API native. Le SDK résout Capacitor en interne ; votre application native n’a besoin ni de configuration Capacitor ni de commandes CLI.

**0.1.7 :** installez `cf-workers-native@0.1.7` avec les [dépendances natives](#dependency-setup) correspondantes. Android nécessite la prise en charge de WebView `MULTI_PROFILE`. Utilisez la même version pour JavaScript et le SDK natif.

## Compilation Web partagée

L’application Workers utilise les mêmes sources Worker, options et [configuration Vite/esbuild](build-setup.md) que cf-workers-native. Sélectionnez l’entrée correspondant à la plateforme cible :

```ts
import { workersIOS } from "cf-workers-native/ios";

const app = workersIOS({
  baseURL: "https://worker.invalid",
  render: "/",
});
await app.ready;
```

Pour Android, importez `workersAndroid` depuis `cf-workers-native/android` avec les mêmes options. Les deux entrées retournent `ready`, `execution`, `drain()` et `dispose()`. Elles relient aussi la fermeture de l’écran natif à la destruction du runtime Worker. Conservez intact le répertoire de ressources généré, manifestes et fragments du runtime compris. Compilez les ressources Web dans le projet Web ou en CI ; le projet natif n’a besoin ni de npm, ni de `node_modules`, ni de commandes Capacitor CLI, ni de `capacitor.config.*`.

Créez une petite entrée Web pour chaque cible. Par exemple, utilisez l’initialisation `workersIOS` ci-dessus dans `src/main.ts` et ce fichier racine `index.html` :

```html
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Utilisez une configuration Vite mobile distincte :

```ts
// vite.mobile.config.ts
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "cf-workers-native/tooling/vite";

export default defineConfig({
  plugins: [workersCapacitorPlugin({ worker: "./src/worker.ts" })],
  build: { outDir: "dist-mobile" },
});
```

Exécutez `npx vite build --config vite.mobile.config.ts` dans le projet Web. Le nom du plugin reste `workersCapacitorPlugin` pour les trois hôtes. La politique par défaut conserve le Worker distant ; remplacez `https://worker.invalid` par l’origine du Worker déployé. Suivez le [guide du framework](build-setup.md#frameworks) pour les entrées Worker générées et les ressources publiques. Utilisez `workersAndroid` dans l’entrée Android ; conservez des sorties distinctes pour chaque cible.

Empaquetez **tout** le répertoire de sortie, y compris `index.html`, dans l’application native. Ne dirigez pas cette compilation vers la sortie de déploiement cloud et n’ajoutez pas ce plugin à la compilation Cloudflare. Les autorisations de routes locales et options d’authentification distante sont les mêmes que pour [Capacitor](integration.md). Le SDK démarre l’entrée embarquée ; `render: "/"` choisit la page Worker initiale. `ready` signale l’initialisation du runtime, pas la fin du chargement des scripts ou images.

## Configuration des dépendances

Il existe un seul package npm, `cf-workers-native`. Ses entrées `/ios`, `/android` et `/capacitor` sont des imports par sous-chemin, pas des packages distincts. Aucun point d’entrée du runtime n’existe à la racine du package. `WorkersIOS` est un produit SwiftPM ; `io.github.rdlabo:cf-workers-native-android` est un artefact Maven Android.

Installez la préversion npm dans le projet Web. Le tag `latest` inclut les préversions 0.x :

```sh
npm install --save-exact cf-workers-native@0.1.7
```

Utilisez l’ensemble de dépendances ci-dessous. npm 0.1.7 et SwiftPM `v0.1.7` partagent le commit de publication. Pour Capacitor, npm inclut l’implémentation native Android correspondante. Le SDK Android autonome est publié séparément sur Maven Central pour la même version :

| Composant | Dépendance |
| --- | --- |
| JavaScript | `cf-workers-native@0.1.7` |
| iOS | Tag SwiftPM `v0.1.7`, produit `WorkersIOS` |
| Android | `io.github.rdlabo:cf-workers-native-android:0.1.7` |

Pour le développement local du SDK, créez une archive du package JavaScript depuis le checkout correspondant :

```sh
# Dans le checkout du SDK :
npm install
npm pack

# Dans le projet Web :
npm install /path/to/cf-workers-native/cf-workers-native-0.1.7.tgz
```

`npm pack` lance la compilation via `prepack` ; le nom ci-dessus utilise la version source actuelle. Installez l’archive plutôt que le répertoire pour éviter un lien symbolique vers l’arborescence SDK, susceptible de créer des chemins récursifs pour une application située dans ce checkout. Utilisez la même révision Git pour le package Swift iOS et la publication Android. Installer la version publiée `workers-capacitor@0.1.1` ne fournit pas ces points d’entrée.

Lors d’une migration depuis l’ancien package npm, retirez la dépendance `workers-capacitor` avant d’installer `cf-workers-native` ; consultez les [étapes de migration](integration.md#migrating-from-the-old-npm-package). Conservez uniquement le package renommé dans le projet Web.

Le projet natif consomme uniquement les ressources générées et les dépendances natives. Les outils npm et de compilation du checkout source appartiennent à la compilation Web ou à la CI.

## iOS

Ajoutez `https://github.com/rdlabo-dev/cf-workers-native` comme package Swift épinglé au tag `v0.1.7` pour npm 0.1.7 (ou à la révision correspondante pour une compilation source), et sélectionnez le produit `WorkersIOS`. Le tag existant `v0.1.2` précède le renommage du package ; utilisez `v0.1.7` pour cette version. Utilisez Xcode 26 / Swift 6.2 ou ultérieur, conformément aux exigences des outils des dépendances natives. Ajoutez les ressources générées comme dossier de ressources, par exemple `WorkerWeb`, puis créez le contrôleur depuis ce répertoire sur l’acteur principal :

```swift
import WorkersIOS

let assets = Bundle.main.resourceURL!.appendingPathComponent("WorkerWeb")
let workers = try WorkersViewController(assets: assets)
workers.onStartupError = { message in
    // Affichez une erreur dans votre écran natif existant.
    print(message)
}
```

Utilisez l’intégration habituelle d’un contrôleur enfant UIKit ou présentez le contrôleur depuis l’écran existant. Avant de le retirer ou de le fermer, attendez sa fermeture :

```swift
try await workers.close()
```

La fermeture libère les ressources même si la destruction JavaScript échoue ; signalez cette erreur comme il convient dans votre application. Un contrôleur fermé est définitivement terminé. Créez-en un nouveau pour rouvrir l’écran Workers.

Pour SwiftUI, conservez le contrôleur pendant la durée de vie de la vue et intégrez `WorkersView(controller: workers)`. Le representable ferme son contrôleur lors du démontage. Le SDK fournit sa configuration Capacitor et enregistre le plugin Workers ; votre application n’enregistre pas de plugins et ne remplace pas son application delegate.

Un échec au démarrage du Worker libère le runtime intégré et signale `startupError` et `onStartupError`. Le SDK ne dépile ni ne remplace votre navigation native. Lors de la première apparition du contrôleur, le démarrage doit se terminer sous 30 secondes. Cela détecte aussi les scripts d’entrée absents ou défaillants qui ne peuvent pas signaler d’erreur depuis JavaScript. Une fermeture explicite annule la notification de démarrage en attente.

## Android

Ajoutez la publication Maven Android du SDK aux dépendances de l’application et le répertoire Web généré sous `src/main/assets/`, par exemple `worker-web`. La publication résout Capacitor et les autres dépendances natives. Utilisez `io.github.rdlabo:cf-workers-native-android:0.1.7` avec npm 0.1.7. Les anciens artefacts Maven ne remplacent pas le pont natif correspondant. Pour le développement local du SDK, utilisez la révision source correspondante et le [workflow de publication locale](development.md#android-maven-publication). Utilisez Java 21 et Android SDK 36, avec `ANDROID_HOME` pointant vers le SDK installé. Incluez `google()` et `mavenCentral()` dans les dépôts de dépendances de l’application. La dépendance Groovy est :

```groovy
dependencies {
    implementation 'io.github.rdlabo:cf-workers-native-android:0.1.7'
}
android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_21
        targetCompatibility JavaVersion.VERSION_21
    }
    packaging.resources {
        excludes += 'META-INF/INDEX.LIST'
        merges += 'META-INF/io.netty.versions.properties'
    }
}
```

Les règles de ressources combinent les métadonnées des dépendances réseau natives. Pour développer localement le SDK ou vérifier une publication, consultez le [consommateur Android indépendant](../demo/tests/native-embedding/android/README.md). Conservez le répertoire généré sous `src/main/assets/worker-web/`, avec `index.html` directement à l’intérieur.

Ouvrez l’écran géré par le SDK depuis votre Activity existante :

```java
import jp.rdlabo.workerscapacitor.WorkersNative;

if (WorkersNative.isSupported()) {
    WorkersNative.open(this, "worker-web");
} else {
    // Show an unsupported-WebView message in your existing native UI.
}
```

L’Activity existante peut rester une ComponentActivity. Le SDK possède son AppCompatActivity et sa WebView ; l’application ne change pas sa superclasse, n’initialise pas de pont Capacitor et n’enregistre pas le plugin Workers.

La WebView Android installée doit prendre en charge `MULTI_PROFILE` d’AndroidX WebKit. Vérifiez `WorkersNative.isSupported()` avant de proposer l’écran sur un appareil dont la compatibilité WebView est incertaine. `open()` lève `UnsupportedOperationException` si la fonction est indisponible ; mettre à jour la WebView de l’appareil peut l’activer.

Le SDK utilise un profil WebView persistant dédié pour ses cookies, son stockage et le routage Service Worker. Les cookies de session existants de l’hôte, le `CookieHandler` Java et le client Service Worker de l’hôte restent inchangés. Les cookies SDK sont séparés de ceux de l’hôte et persistent entre les ouvertures d’écran. Les plugins de base Capacitor à portée applicative ne sont pas enregistrés dans cet hôte.

Un seul écran SDK peut être actif à la fois. La recréation d’Activity attend que le runtime précédent libère sa responsabilité avant de démarrer son remplaçant. Le démarrage doit se terminer sous 30 secondes ; un échec ou démarrage incomplet ferme l’écran SDK et revient à l’Activity existante.

## Compatibilité

Utilisez l’ensemble compatible de dépendances JS/natives ci-dessus. Pour les compilations depuis les sources, utilisez des révisions correspondantes. Les nouveaux hôtes partagent le runtime et les outils cf-workers-native existants ; ils ne modifient pas les entrées de déploiement Cloudflare et n’ajoutent pas de déploiement Worker distant.

Pour des plugins natifs généraux, utilisez l’[intégration Capacitor](native-rendering-api.md) existante. Ces hôtes intégrés fournissent l’interface Workers et sa connexion au runtime.

## Vérification

Vérifiez un véritable parcours utilisateur dans l’application hôte : ouverture, navigation, envoi de formulaire, authentification, fermeture et réouverture. Sur iOS, testez le retrait UIKit ou le démontage SwiftUI ; sur Android, incluez rotation et recréation d’Activity. Confirmez que les sessions et parcours WebView existants de l’hôte fonctionnent toujours. Les cookies SDK Android utilisent un profil séparé : ne supposez pas qu’une connexion dans la WebView hôte soit transférée au SDK. Conservez l’authentification et l’autorisation existantes du Worker ; consultez les [consignes de sécurité partagées](integration.md#5-security-the-device-is-not-a-trusted-server).

Les consommateurs indépendants [iOS](../demo/tests/native-embedding/ios/README.md) et [Android](../demo/tests/native-embedding/android/README.md) fournissent des vérifications d’acceptation SDK reproductibles, notamment échec au démarrage, scripts d’entrée absents et bon fonctionnement au-delà du délai de démarrage. Ces contrôles couvrent simulateurs/émulateurs, pas le comportement sur appareil physique ni une mesure de désallocation de WebView. L’acceptation générale des frameworks dans les démos Capacitor ne prouve pas que tous leurs parcours ont aussi été testés dans ces hôtes intégrés.
