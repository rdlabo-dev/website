---
title: "Développement et publications"
sourceRevision: "f224b1d4469ecea5b16600e6297a2bf99637b89ceb2a7ee2c7ce5a3eb815d466"
---
# Développement et publications

## Développement

Les points d’entrée publics sont `src/index.ts` et `src/ionic.ts` ; les contrats partagés se trouvent dans `src/types.ts`. L’implémentation est regroupée par responsabilité :

- `src/native/` : transport du pont, sessions natives, démarrage et URL des ressources.
- `src/projection/` : transfert des images, propriété de la projection, événements et styles.
- `src/dom/` : géométrie, défilement, visibilité et coordination des superpositions.

`npm run build` regroupe `src/native/bootstrap.ts` dans `runtime/native-ui-engine.js`, le runtime WebView partagé. Android empaquette directement ce fichier comme ressource. La compilation le copie aussi dans `ios/Sources/WebViewNativeUIEngine/Resources`, car SwiftPM impose que les ressources soient dans le répertoire de la cible. Les deux fichiers générés sont versionnés pour que les consommateurs natifs n’aient pas besoin de Node.js. Modifiez les sources TypeScript, jamais les fichiers générés ; la CI contrôle leur régénération et vérifie le runtime inclus dans les archives npm et Maven.

Les tests navigateur reproduisent ces groupes sous `tests/`. `tests/cordova/` contient la fixture d’un véritable consommateur natif.

Utilisez Node.js 24, comme la CI. Depuis ce dépôt :

```sh
npm ci
npm run build
npm run lint
npx playwright install chromium
npm test
xcodebuild -scheme WebViewNativeUIEngine -destination 'platform=iOS Simulator,id=<booted simulator UUID>' test
```

Le lint combine la vérification TypeScript stricte, les règles recommandées standard ESLint/TypeScript et les contrôles typés des Promise pour `src`. Scripts et tests reçoivent un lint syntaxique ; Prettier gère le formatage. `npm run format` applique uniquement le formatage. Les données du pont et les doublures de test peuvent utiliser un `any` explicite ; la validation aux frontières en production reste nécessaire. Un `void` explicite marque un travail en arrière-plan, mais ne traite pas une Promise rejetée. Android utilise `lintRelease` avec les avertissements considérés comme erreurs en CI ; Swift est compilé et testé sur un simulateur iOS.

L’Engine est versionné indépendamment de ses consommateurs. L’ordre de publication est artefact Maven natif → Engine npm ; les consommateurs se mettent à jour séparément. Les publications npm vérifient la présence du POM et de l’AAR correspondants sur Maven Central avant publication. Aucune commande de compilation ou de test ne publie quoi que ce soit. Les tests couvrent le DOM standard, la géométrie fractionnaire/RTL, les ACK obsolètes, la propriété des images et le suivi natif du défilement WKWebView ; les tests des consommateurs restent responsables de l’intégration Ionic/SDK.

La configuration réservée à la CI, les commandes d’empaquetage et les sorties GitHub sont définies dans `.github/workflows/`. Les scripts conservent la compilation du runtime, les vérifications réutilisables des consommateurs/packages et la logique de publication testée (gestion des états Central et comparaison des artefacts npm).

## Publication Maven

Le workflow `Native UI Engine Maven Release` est déclenché manuellement sur `main` avec la version exacte du package Engine. Ce commit doit d’abord réussir la CI `Native UI Engine`. Le workflow signe un AAR, une archive source, la documentation API Kotlin générée et les métadonnées Maven, les téléverse une fois, puis se termine lorsque Central indique `PUBLISHING` ou `PUBLISHED`. L’identifiant du déploiement et les changements d’état sont consignés dans le résumé d’exécution. `PUBLISHING` signifie que la validation a réussi et que Central a accepté la publication ; cela ne garantit pas que les artefacts soient déjà téléchargeables. Ce workflow n’attend pas la distribution. La publication npm exige toujours que le POM et l’AAR correspondants soient disponibles sur Maven Central. Les coordonnées existantes ne sont jamais écrasées ; si un téléversement expire, inspectez le déploiement enregistré dans Central avant toute autre action.

Configurez les secrets Actions du dépôt avec `CENTRAL_USERNAME`, `CENTRAL_PASSWORD` (un jeton utilisateur Central), `MAVEN_SIGNING_KEY` (clé privée au format ASCII-armored) et `MAVEN_SIGNING_PASSWORD`. Central doit pouvoir accéder à la clé publique de signature. Les secrets GitHub sont limités à ce dépôt.

Pour vérifier l’empaquetage localement, exécutez `python3 scripts/native-ui-engine-release/verify.py` avec JDK 21, Android SDK 36 et GnuPG. Le script crée une clé temporaire, valide les signatures et sommes de contrôle, puis supprime son ZIP de test sans le téléverser. La publication reconstruit toujours des sorties propres avec la véritable clé de signature. Publiez l’artefact Maven avant la version npm correspondante, y compris pour les préversions.

## Configuration des publications pour les mainteneurs

Ce dépôt part de l’implémentation Engine fusionnée dans [ionic-theme-ios27 `b218d8b`](https://github.com/rdlabo-dev/ionic-theme-ios27/commit/b218d8bfe0c87c02addc668fee9c7aa333489486). L’extraction préserve cette implémentation ; la prise en charge de l’hôte Cordova est développée dans ce dépôt. Le package renommé commence à la version `0.0.1`. Publiez la même version pour npm, SwiftPM et Maven ; ne réutilisez pas les anciennes coordonnées du package.

L’organisation npm `webview-native-ui` et l’espace de noms Maven Central `io.github.webview-native-ui` sont enregistrés. Maintenez la publication de confiance npm pour `webview-native-ui/engine`, workflow `release.yml`, et configurez les secrets Maven ci-dessus dans ce dépôt. Déplacer les sources ne copie pas les identifiants d’accès.

1. Préparez la version suivante et ses notes sur `main` ; utilisez `npm run release` pour créer un tag standard `vX.Y.Z` et une publication GitHub. Gardez la publication GitHub en brouillon jusqu’à ce que Maven soit téléchargeable.
2. Une fois la CI réussie pour ce commit main, déclenchez `native-ui-engine-release.yml` avec la version exacte du package.
3. L’état Central `PUBLISHING` indique un téléversement accepté, pas la disponibilité en téléchargement. Lorsque le POM et l’AAR sont disponibles, publiez la publication GitHub préparée. `release.yml` vérifie le tag, la version du package, la CI et les artefacts Maven avant de publier sur npm (`next` pour les préversions, `latest` sinon).

Aucune commande de compilation ou de test ne publie un package. Les versions npm/Maven existantes ne sont jamais écrasées.

Pour relancer la vérification d’un tag existant, déclenchez `release.yml` avec ce tag. Il contrôle le commit initialement étiqueté et ignore la publication npm uniquement si le contenu du package existant correspond. Ne modifiez pas le tag. Les outils de publication utilisent npm fourni avec Node.js 24, comme la CI.
