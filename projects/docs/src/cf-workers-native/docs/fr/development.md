---
title: "Développement et tests"
sourceRevision: "bc6ebc0f71acf6b1daf4adccc489ac4f98835fcd3916b8a2c630bd220922c275"
---

# Développement et tests

Nécessite Node 22.18+ (22.x) ou 24.11+, npm et les SDK natifs pour les tests natifs. La publication du paquet, la création de PR et le déploiement cloud ne font pas partie de ces commandes.

## Tests de la bibliothèque et du paquet

```sh
npm install
npm run build
npm run typecheck
npm test
npx playwright install chromium
npm run test:package
```

## Démo et tests d’intégration

Suivez le [guide de configuration de la démo](../demo/README.md) pour connaître les fichiers à configurer et la procédure d’exécution de l’application.

La démo est un projet npm indépendant dans `demo/`, avec son propre manifeste de paquet. Les fichiers de verrouillage des dépendances sont générés localement et ne sont pas commités. Capacitor, Hono, Express, les projets natifs et les tests d’intégration appartiennent à ce projet. Il consomme la bibliothèque compilée via `file:..` ; ce n’est pas un workspace npm.

La structure de la démo sépare les sources applicatives des outils :

```text
demo/
  src/
    main.ts         Runtime initialization and Worker HTML display
    workers/        Hono and Express application code
  tests/
    validation/     Validation page, runners, contracts and Worker entries
    fixtures/
      apps/         Runtime and build-tool test apps
      workers/      Test-only Worker handlers
    scripts/        Node.js helpers that build test apps
    ...             Automated tests and Playwright/Vitest configurations
  ios/, android/    Native projects
```

`demo/src/main.ts` initialise le runtime et affiche le HTML retourné par la route `/` du Worker. Hono est sélectionné par défaut ; l’entrée Express commentée dans `demo/vite.config.ts` montre comment basculer. Les tests navigateur compilent et affichent la même démo avec chaque Worker. La page distincte `demo/tests/validation/` exécute des contrôles de compatibilité ; elle dispose de son propre build et est servie séparément par les tests navigateur. Les sources applicatives n’importent jamais de code de validation. Ses contrôles HTTP partagés se trouvent dans `demo/tests/validation/contracts/http.ts` et sont réutilisés par les tests des outils de build et du runtime.

Les Workers applicatifs sont organisés sous `demo/src/workers/<framework>/<scenario>.ts`. Les exemples Hono et Express rendent chacun du HTML sur `/` et exposent `/api/hello` en JSON. Cet exemple Fetch uniquement insère le HTML retourné dans la page existante ; il ne s’agit pas du parcours natif de rendu de documents et il ne fournit ni navigation, ni exécution des scripts retournés, ni gestion des formulaires. Pour les documents gérés par le Worker sur iOS/Android, `demo/rendering` utilise `workersCapacitor({ baseURL, render: "/" })` avec l’intégration native empaquetée. Les cas plus étendus de routage et de gestion des erreurs se trouvent dans `demo/tests/fixtures/workers/{hono,express}/standard.ts` ; les fixtures de runtime et de bindings se trouvent aussi sous `demo/tests/fixtures/workers/`.

```sh
cd demo
npm install
npm run typecheck
npm run build
npx playwright install chromium webkit
npm run test:browser
npm run test:workers
npm run test:runtime
npm run test:runtime:dev
npm run test:build-tools
```

`npm run test:build-tools` dans `demo` vérifie Vite et esbuild avec Hono et Express, ainsi que l’ESM navigateur sans bundler, dans les deux modes d’exécution sous Chromium et WebKit.

`test:workers` exécute les tests Vitest de `demo/tests/workers/` contre **workerd local**, via `createTestHarness` de Wrangler. Hono et Express ont chacun deux contrôles pour le Worker de démo et dix contrôles de fixtures de contrats couvrant le comportement d’API vérifié dans la WebView. Ce n’est pas un déploiement Cloudflare réel. Pour filtrer les tests, utilisez par exemple `npm run test:workers -- -t hono`. `test:package` installe un véritable tarball npm dans un nouveau projet consommateur temporaire et vérifie les types du paquet ainsi que l’exécution directe et isolée des frameworks, sans alias/polyfills écrits à la main.

## Développement Cloudflare local

La configuration de la CLI Cloudflare se trouve dans `demo/cloudflare.config.ts`. Depuis `demo/`, exécutez `npx cf build --mode hono` ou `npx cf build --mode express` pour compiler le Worker correspondant ; utilisez `npx cf dev --mode hono` (ou `express`) pour le développement local. La version installée de `cf` est actuellement bêta. Wrangler reste une dépendance de développement pour le bundler de la CLI et le harnais de tests ; les tests utilisent les mêmes réglages de compatibilité et vérifient les Workers d’exemple comme les fixtures de contrats distinctes.

## Void React Pages + D1

Utilisez Void / @void/react 1.1.12 ou ultérieur pour la navigation Capacitor sur iOS et Android. L’exemple épingle Void / @void/react 1.1.12. Ses tests iOS et Android exigent une hydratation réussie, la soumission de formulaires, la persistance D1 et la navigation uniquement côté client avec les paquets publiés sans correctifs. Consultez l’[intégration Void](void.md) pour la configuration et le périmètre de vérification.

## OpenNext + D1

[`demo/opennext`](../demo/opennext/README.md) est une application Next.js autonome avec sessions reposant sur D1, formulaires ordinaires et ressources statiques. Son build Capacitor normal envoie les requêtes au Worker existant. Des tests distincts exercent les pages publiques localement, afin qu’une réussite distante ne soit pas comptée comme prise en charge locale d’OpenNext. Consultez la [configuration et les limites d’OpenNext](opennext.md).

## Consommateurs d’intégration native

Ces consommateurs indépendants vérifient qu’une application native existante peut utiliser le SDK sans configuration applicative Capacitor. Compilez d’abord la bibliothèque, puis suivez :

1. [iOS : consommateur UIKit et SwiftUI](../demo/tests/native-embedding/ios/README.md).
2. [Android : consommateur ComponentActivity via Maven uniquement](../demo/tests/native-embedding/android/README.md).

Ils testent navigation, POST, fermeture/réouverture et échec au démarrage. Ils vérifient aussi le délai de disponibilité, la recréation d’Activity Android et la préservation des cookies et du Service Worker de l’hôte Android. Les ressources générées et publications locales sont des sorties de fixtures, pas des artefacts de publication. Le workflow `Native embedding` exécute les deux plateformes séparément du workflow de compatibilité existant.

## Démonstration native Capacitor

Le build natif nécessite Xcode 26 / Swift 6.2 ou ultérieur et Java 21. Le cadrage des requêtes HTTP/1.1 et l’analyse des réponses s’exécutent en JavaScript/WebAssembly. Le plugin natif fournit les entrées/sorties d’octets TCP/TLS et l’intégration WebView ; iOS utilise Network.framework sans AsyncHTTPClient ni Swift NIO. Android utilise Netty pour TCP/TLS, sans son codec HTTP. Les corps de réponses HTTPS nécessitent un cadrage Content-Length ou chunked ; les corps HTTPS délimités par EOF échouent explicitement, car le pont natif d’octets ne peut distinguer une fermeture authentifiée d’une troncature. Consultez la [frontière native](compatibility.md). Pour Android, ajoutez les règles de ressources suivantes dans `android {}` du fichier `android/app/build.gradle` de l’application (déjà présentes dans la démo) :

```groovy
packaging.resources {
    excludes += 'META-INF/INDEX.LIST'
    merges += 'META-INF/io.netty.versions.properties'
}
```

Elles combinent les métadonnées des dépendances Netty ; la bibliothèque ne modifie pas la configuration Gradle de l’application.

Exécutez les commandes suivantes depuis `demo/`, après compilation de ses ressources web :

```sh
npm run sync
npm run ios
npm run android
```

Android nécessite Java 21+. La démo ouvre l’exemple Hono minimal. Pour l’application de validation distincte à 26 contrôles, exécutez `npm run test:native:prepare -- validation`, puis les mêmes commandes sync/ios/android. Cela remplace les ressources générées `dist/` ; exécutez `npm run build` et `npm run sync` pour restaurer l’application d’exemple. Aucun `server.url` ni serveur de développement n’est configuré dans Capacitor. Les résultats apparaissent dans l’interface et sous `POC_RESULT` dans la console native. Les tests navigateur réexécutent en plus 18 contrôles d’API avec le réseau désactivé.

## Intégration continue

Consultez le [coût d’exécution des tests](test-execution-time.md) pour les durées CI de référence, la consolidation de la préparation et les limites des mesures.

La CI exécute en parallèle les vérifications de bibliothèque/types, les contrats workerd locaux, l’intégration Chromium/WebKit, un consommateur neuf d’archive npm et neuf scénarios d’applications Android. Les vérifications sur simulateur iOS s’exécutent séparément. Consultez [CI et protection des merges](../CONTRIBUTING.md#ci-and-regression-protection) pour le contrôle de publication `CI`, la réutilisation des résultats de PR vérifiés sur main et les limites de vérification. La CI ne bloque pas les merges.

## Publication Maven Android

Utilisez la [compilation de publication autonome](../scripts/android-release/README.md) pour préparer et vérifier le SDK Android indépendamment d’une application Capacitor. La CI d’intégration native vérifie un bundle signé avec une clé jetable et compile un consommateur indépendant depuis ce dépôt Maven. La publication réelle sur Central nécessite un espace de noms vérifié, une clé de signature et une publication explicite.
