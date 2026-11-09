---
title: "Premiers pas"
sourceRevision: "2269ca687f2c56205745537237f10cc233b3c6b029361e54f3dcf330947d1242"
---
# Capacitor Native UI

Affichez les contrôles Web pris en charge avec UIKit et SwiftUI sur iOS, tout en conservant l’état, le routage et les gestionnaires de l’application dans la WebView. Utilisez le balisage Ionic existant ou des boutons HTML explicites ; des extensions expérimentales propres à l’application permettent d’ajouter du contenu SwiftUI ou Android Compose personnalisé.

Native UI s’active explicitement et est officiellement pris en charge depuis la version 2.0.0. Sur Android, dans les navigateurs et sur les anciennes versions d’iOS, les contrôles standard restent Web, tout comme les contrôles non pris en charge. Android prend en charge les extensions Compose expérimentales locales à l’application. Conservez les styles et la disposition de votre application ; le thème iOS est facultatif.

## Fonctionnement de la projection

Une **projection** est une autre présentation d’un contrôle Web. Votre application conserve l’élément DOM d’origine, l’état et les gestionnaires d’événements. Le plugin lit les libellés, icônes, états sélectionné/désactivé et géométries pris en charge, puis associe le contrôle rendu à cet élément source. Il ne transforme pas la page en écran natif et n’exécute pas une seconde copie de l’application.

| Source Web | Présentation projetée |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Lire les couleurs Material You d’Android | [Couleurs dynamiques Android](/docs/dynamic-colors) |
| Boutons, onglets et segments Ionic pris en charge | Contrôles UIKit/SwiftUI natifs sur iOS compatible |
| Boutons HTML et boutons de retour explicitement marqués | Boutons natifs sur iOS compatible |
| Contrôles admissibles placés dans Vertical Bars | Contrôles SwiftUI dans le rail système disponible ; sinon, rail Web |
| Élément DOM d’une extension locale | Contenu SwiftUI ou Compose enregistré par l’application, avec les props lues sur cet élément |

L’élément d’origine **reste dans le DOM** pendant la projection. Ses liaisons et gestionnaires restent attachés. Une fois la présentation native acceptée, le runtime masque visuellement la source, bloque les interactions directes du pointeur et la masque de l’accessibilité Web pour éviter deux copies interactives. La projection d’élément conserve sa boîte de disposition ; l’application ou le thème fournit l’espacement du rail. Un rail Web utilise de même la présentation Web de son adaptateur : disposition/clones Ionic ou boutons mandataires HTML dans votre `webHost`.

Par exemple, toucher un bouton Enregistrer projeté active le bouton Web d’origine. Son gestionnaire existant enregistre les données et met à jour l’état ; les changements DOM pris en charge actualisent ensuite la projection. Les onglets et autres contrôles transmettent aussi les actions via leurs adaptateurs source. Continuez à mettre à jour la source sans gérer d’état natif distinct. Pour les valeurs du lecteur qui changent sans mutation DOM, utilisez `markForCheck()`.

La projection change la présentation ; elle ne traduit pas du HTML ou CSS arbitraire en vues natives. Les contrôles natifs utilisent les données et styles pris en charge ; la reproduction d’une apparence Web personnalisée n’est pas garantie. Supprimer ou désactiver une source empêche toute nouvelle action valide. Si la projection est indisponible ou arrêtée, le runtime libère le masquage et la source retrouve sa présentation Web ou un rail Web disponible. Les états masqué/désactivé propres à votre application restent applicables.

La propriété Native suit la source et son contexte de projection, indépendamment de l’animation et de la disponibilité des images. La présentation, le déplacement et le redimensionnement d’une Modal, ainsi que la restauration des images, ne transfèrent pas une source acceptée vers le Web tant que sa projection reste admissible. Un transfert explicite vers le Web, une projection non prise en charge ou rejetée, une défaillance du runtime ou la fin de la source ou du contexte libère cette propriété. Un bouton désactivé reste le même contrôle appartenant à Native, avec la saisie désactivée.

Les superpositions Web bloquantes peuvent conserver des images préparées des boutons, segments, FAB et barres d’onglets natifs sous leur arrière-plan. Ces images gardent l’apparence native capturée et sont préparées après les mises à jour natives et les changements visuels regroupés. La capture de la plateforme peut différer de la composition en direct, notamment pour les reflets des contours Liquid Glass ; une reproduction des matériaux identique au pixel près n’est pas garantie. La préparation s’interrompt pendant un toucher ; la présentation utilise la dernière image terminée sans attendre la capture ni un accusé de réception du pont. L’absence d’image ne rend pas une source Native acceptée au Web. Les popovers natifs qui conservent leurs contrôles restent sur le chemin natif. Consultez [les règles de transfert](https://docs.rdlabo.dev/projects/capacitor-native-ui/docs/appearance#temporary-images-beneath-web-overlays) pour les déplacements, la restauration et les exclusions. Recompilez l’application native pour activer cette capacité ; les anciens binaires natifs conservent leur chemin existant.

## Choisir ce que vous voulez créer

| Objectif | Point de départ |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Afficher nativement des contrôles Ionic existants | [Configuration Ionic](/docs/setup) |
| Utiliser des boutons natifs sans Ionic | [Configuration HTML](/docs/framework-independent) |
| Ajouter un rail latéral à Ionic en conservant votre thème | [Vertical Bars pas à pas](/docs/ionic-vertical-bars) |
| Ajouter un rail latéral sans Ionic | [Configuration du rail HTML](/docs/framework-independent) |
| Ajouter des contrôles natifs à une application utilisant le thème iOS 27 | [Ajouter Native UI à votre thème](/ionic-theme-ios27/docs/add-native-ui) |
| Afficher du contenu SwiftUI ou Android Compose personnalisé | [Extensions locales à l’application (expérimentales)](/docs/native-ui-extensions) |

## Installer depuis npm

Nous utilisons [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable), un excellent plugin communautaire d’Erkam Yaman, comme intégration standard pour la disposition de l’appareil. Il expose l’état de pliage, la géométrie de la charnière, le placement des barres et les événements de changement, ce qui vous permet de contrôler l’adaptation de la disposition. Foldable fournit les données de l’appareil ; le thème fournit les utilitaires de disposition Web et Native UI projette les contrôles. Installez-le avec le package utilisé, puis raccordez ses événements dans votre application.

Installez Native UI et Foldable ensemble dans votre application Capacitor :

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Si vous utilisez aussi le thème iOS 27, installez ou mettez à jour les deux packages ensemble :

```sh
npm install @rdlabo/capacitor-native-ui @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

Native UI, le thème, Engine et Foldable sont versionnés indépendamment. Si vous utilisez le thème, choisissez une version de Native UI compatible avec la dépendance pair déclarée par le thème. Native UI inclut la dépendance npm Engine et lie ses bibliothèques natives via SwiftPM et Maven. Les utilisateurs de CocoaPods doivent aussi effectuer la [configuration du pod Engine local](https://github.com/webview-native-ui/engine/blob/v1.0.0/docs/getting-started/capacitor.md#cocoapods-compatibility-through-npm). Déclarez Native UI comme dépendance directe pour que Capacitor puisse détecter le plugin. Les commandes d’installation ajoutent Foldable comme dépendance applicative distincte. Installer ces paquets n’active pas les contrôles natifs ; le démarrage de l’application choisit la projection et raccorde la disposition de l’appareil.

Poursuivez avec la [configuration Ionic](/docs/setup), la [configuration HTML](/docs/framework-independent) ou les [extensions](/docs/native-ui-extensions). Après avoir configuré le démarrage, compilez les ressources Web, exécutez `npx cap sync` et recompilez l’application native. Aucun clonage du dépôt ni téléchargement d’archive n’est nécessaire.

Vous migrez les API natives intégrées au thème 1.2.0 ou 1.2.1 ? Suivez le [guide de migration](/docs/migration) pour les imports, la configuration et le projet natif.

## Prérequis

Le démarrage natif nécessite Capacitor 8 et un projet iOS ou Android. Les extensions Android nécessitent l’API 24+ et Kotlin/Compose. Le rendu natif ordinaire nécessite iOS 26+ et Xcode 26+. L’adaptateur Ionic déclare la compatibilité avec Ionic `>=8.8.1 <10`, avec une validation E2E automatisée sur Ionic 9 ; l’adaptateur HTML `/core` ne nécessite ni Ionic ni paquet de thème. [Vertical Bars](/docs/vertical-bars) et le [placement des extensions](/docs/native-ui-extensions#content-and-placement-are-independent) ont des exigences supplémentaires pour l’appareil.

Pour les contrôles standard, suivez le guide correspondant à votre balisage ; les adaptateurs Ionic et HTML utilisent des imports différents. Pour du contenu natif personnalisé, commencez directement par le [guide des extensions](/docs/native-ui-extensions).

## Référence

- [Contrôles Ionic pris en charge](/docs/native-ui#supported-markup) et comportement de repli.
- [Configuration](/docs/configuration) : valeurs par défaut, sélection des contrôles, mode rail uniquement et modifications à chaud.
- [Apparence claire et sombre](/docs/appearance) : hériter du thème Web, configurer le HTML personnalisé et comprendre l’apparence du rail partagé.
- [Vertical Bars](/docs/vertical-bars) : admissibilité, apparence et API du runtime.
- [Migration](/docs/migration) : noms des packages, imports et mise à jour du projet natif.

## Développement

```sh
npm ci
npm run build
npm test
npm run test:packages
```

L’implémentation partagée du DOM et du moteur de rendu est maintenue dans l’espace de travail local `packages/native-ui-core`. Ce dépôt gère l’enregistrement Capacitor et les adaptateurs hôtes. `android/src/main/java/shared-core` est généré depuis les sources locales de Core par `npm run sync:core` ; modifiez Core, pas cette copie. SwiftPM et CocoaPods compilent directement les sources Swift partagées dans `packages/native-ui-core/ios/Sources`. Les utilisateurs de SwiftPM basé sur Git n’ont pas besoin de Node.js. Les noms existants des modules natifs et des symboles Kotlin sont conservés pour les extensions locales à l’application.

La racine du dépôt reste le plugin npm : `src`, `ios`, `android` et `package.json` cohabitent. Ses tests unitaires TypeScript sont dans `tests` ; les tests Swift et Android restent avec le plugin. `examples/native-ui-html` montre son utilisation sans thème Ionic.

La compilation suit la structure d’un plugin Capacitor : TypeScript compile `src/index.ts` vers `dist/esm`, puis Rollup génère le bundle navigateur (`dist/plugin.js`) et le bundle CommonJS (`dist/plugin.cjs`). L’extension `.cjs` est nécessaire parce que ce paquet utilise `type: module`. Les sous-chemins ESM publics partagent les mêmes modules dans `dist/esm`. Exécutez `npm run watch` pour recompiler les changements TypeScript ou `npm run verify:web` pour les vérifications Web.

## Tester avec le thème Ionic

La démo Ionic complète, les tests de captures d’écran, les tests de transition du thème et les fixtures d’intégration du simulateur restent dans [ionic-theme-ios27](https://github.com/webview-native-ui/ionic-theme-ios27). Ils installent ce plugin comme dépendance npm. Ne dupliquez pas la démo ici.

Pour tester des changements non publiés, compilez et créez l’archive de ce dépôt :

```sh
npm run build
npm pack --ignore-scripts --pack-destination /tmp
```

Depuis un checkout du thème déjà migré, exécutez `npm run test:native-candidate -- /tmp/rdlabo-capacitor-native-ui-VERSION.tgz --e2e`. La commande crée une copie isolée, installe l’archive pour le thème et la démo, puis exécute les vérifications des paquets, les tests unitaires d’intégration, le build de production et les tests navigateur. Ajoutez `--simulator=UDID` pour exécuter les suites existantes du simulateur. Le checkout d’origine et ses fichiers de verrouillage sont préservés ; la copie temporaire reste disponible pour le diagnostic.

## Publications

Le plugin possède une version indépendante du thème. Exécutez `npm run release` depuis une branche main à jour lorsque vous êtes autorisé à publier. Le workflow du tag `vVERSION` publie uniquement ce plugin (`next` pour les préversions, `latest` pour les versions stables).

Épinglez Engine à la même version exacte dans les deux manifestes npm, `Package.swift`, le podspec et la dépendance Android Gradle, et mettez à jour le fichier de verrouillage en même temps. Une plage npm flottante peut résoudre un Engine plus récent que les dépendances natives et empêcher l’installation.

Avant la première publication, configurez le trusted publisher npm pour `webview-native-ui/capacitor-plugin`, le workflow `release.yml` et l’environnement `npm`. Configurez selon vos besoins la politique de revue de cet environnement GitHub. Les versions déjà publiées ne peuvent pas être republiées ; choisissez une nouvelle version pour la première publication depuis ce dépôt.

Ce dépôt a été extrait du commit `1831bde5` de `webview-native-ui/ionic-theme-ios27`. L’historique antérieur reste dans ce dépôt d’origine.

## Développer Core partagé

Core réside dans `packages/native-ui-core` dans ce dépôt. Exécutez `npm ci`, `npm run build` et `npm test` depuis la racine ; aucune publication ni aucun checkout distinct de Core n’est nécessaire. La compilation incorpore le JavaScript et les déclarations de Core dans l’archive du plugin. Core est un espace de travail privé, pas une dépendance npm publiée séparément.

Modifiez le TypeScript, le Swift et le Kotlin partagés dans `packages/native-ui-core`. `npm run sync:core` régénère la copie Android ; `npm run check:core` détecte les écarts. Les tests partagés du moteur de rendu et du DOM s’exécutent avec les tests des adaptateurs Capacitor via la commande de test racine. Les tests natifs de Core restent dans ses répertoires `ios` et `android`.

Les migrations Capacitor s’exécutent depuis la racine de ce dépôt. `package.json`, `Package.swift`, le podspec et `android/` conservent leurs emplacements habituels. Validez les builds natifs après les migrations de SDK ; conserver cette structure ne garantit pas la compatibilité avec les futurs outils de migration.

### Utilisateurs de Swift Package

Ajoutez `https://github.com/webview-native-ui/capacitor-plugin.git` dans Xcode et sélectionnez le produit `NativeUICore` pour utiliser `import NativeUICore` sans lier l’adaptateur Capacitor. Avant la publication de ce changement, sélectionnez la branche `refactor/extract-shared-core`. Les deux produits partagent les tags de publication du dépôt ; SwiftPM peut tout de même récupérer Capacitor lors de la résolution des dépendances du paquet.

Les applications Capacitor continuent d’utiliser le produit `RdlaboCapacitorNativeUi` et `import NativeUIPlugin`. Ce module réexporte Core ; les appels `NativeUI.register` existants utilisent donc le même état d’enregistrement que l’adaptateur. Le manifeste racine possède les deux cibles ; il n’existe pas de paquet Swift imbriqué distinct.

CocoaPods continue de compiler l’adaptateur et les sources partagées dans le pod existant du plugin. Ce changement ne publie pas de pod Core autonome et n’implémente pas d’adaptateur Cordova.

## Couleurs dynamiques Android

Lisez les couleurs Material You d’Android 12+ avec `getDynamicColorScheme()` et observez les notifications de reprise et de configuration avec `addDynamicColorListener()`. Importez les deux depuis `@rdlabo/capacitor-native-ui`. Les couleurs dynamiques constituent une API prise en charge, activée explicitement, indépendante de la projection Native UI et des extensions expérimentales locales à l’application.

Le plugin renvoie les palettes claire et sombre sans modifier le thème de l’Activity ni demander d’autorisations pour le fond d’écran. Les autres plateformes indiquent `available: false`. Le plugin n’applique pas de CSS ; les applications Ionic peuvent utiliser `enableDynamicColors` depuis `@rdlabo/ionic-theme-md3/dynamic-colors`.

Consultez les [couleurs dynamiques Android](/docs/dynamic-colors) pour l’installation, les contrats d’API, les notifications de changement, le nettoyage et l’intégration Ionic.
