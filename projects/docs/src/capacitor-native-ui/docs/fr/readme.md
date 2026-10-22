---
title: "Premiers pas"
sourceRevision: "5b1080643e44c921f2c200442ac1c0a89719126504e28243ae2092df43c2817a"
---
# Capacitor Native UI

Affichez les contrôles Web pris en charge avec UIKit et SwiftUI sur iOS, tout en conservant l’état, le routage et les gestionnaires de l’application dans la WebView. Utilisez le balisage Ionic existant ou des boutons HTML explicites ; des extensions expérimentales propres à l’application permettent d’ajouter du contenu SwiftUI ou Android Compose personnalisé.

Native UI s’active explicitement et est officiellement pris en charge depuis la version 2.0.0. Sur Android, dans les navigateurs et sur les anciennes versions d’iOS, les contrôles standard restent Web, tout comme les contrôles non pris en charge. Android prend en charge les extensions Compose expérimentales locales à l’application. Conservez les styles et la disposition de votre application ; le thème iOS est facultatif.

## Fonctionnement de la projection

Une **projection** est une autre présentation d’un contrôle Web. Votre application conserve l’élément DOM d’origine, l’état et les gestionnaires d’événements. Le plugin lit les libellés, icônes, états sélectionné/désactivé et géométries pris en charge, puis associe le contrôle rendu à cet élément source. Il ne transforme pas la page en écran natif et n’exécute pas une seconde copie de l’application.

| Source Web | Présentation projetée |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Boutons, onglets et segments Ionic pris en charge | Contrôles UIKit/SwiftUI natifs sur iOS compatible |
| Boutons HTML et boutons de retour explicitement marqués | Boutons natifs sur iOS compatible |
| Contrôles admissibles placés dans Vertical Bars | Contrôles SwiftUI dans le rail système disponible ; sinon, rail Web |
| Élément DOM d’une extension locale | Contenu SwiftUI ou Compose enregistré par l’application, avec les props lues sur cet élément |

L’élément d’origine **reste dans le DOM** pendant la projection. Ses liaisons et gestionnaires restent attachés. Une fois la présentation native acceptée, le runtime masque visuellement la source, bloque les interactions directes du pointeur et la masque de l’accessibilité Web pour éviter deux copies interactives. La projection d’élément conserve sa boîte de disposition ; l’application ou le thème fournit l’espacement du rail. Un rail Web utilise de même la présentation Web de son adaptateur : disposition/clones Ionic ou boutons mandataires HTML dans votre `webHost`.

Par exemple, toucher un bouton Enregistrer projeté active le bouton Web d’origine. Son gestionnaire existant enregistre les données et met à jour l’état ; les changements DOM pris en charge actualisent ensuite la projection. Les onglets et autres contrôles transmettent aussi les actions via leurs adaptateurs source. Continuez à mettre à jour la source sans gérer d’état natif distinct. Pour les valeurs du lecteur qui changent sans mutation DOM, utilisez `markForCheck()`.

La projection change la présentation ; elle ne traduit pas du HTML ou CSS arbitraire en vues natives. Les contrôles natifs utilisent les données et styles pris en charge ; la reproduction d’une apparence Web personnalisée n’est pas garantie. Supprimer ou désactiver une source empêche toute nouvelle action valide. Si la projection est indisponible ou arrêtée, le runtime libère le masquage et la source retrouve sa présentation Web ou un rail Web disponible. Les états masqué/désactivé propres à votre application restent applicables.

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

Le thème et Native UI partagent le même numéro de version ; Foldable suit son propre versionnement. Déclarez Native UI comme dépendance directe pour que Capacitor découvre le plugin. Les commandes d’installation ajoutent Foldable comme dépendance distincte de l’application. Installer ces packages n’active pas les contrôles natifs ; le démarrage de l’application choisit la projection et raccorde la disposition de l’appareil.

Poursuivez avec la [configuration Ionic](/docs/setup), la [configuration HTML](/docs/framework-independent) ou les [extensions](/docs/native-ui-extensions). Après avoir configuré le démarrage, compilez les ressources Web, exécutez `npx cap sync` et recompilez l’application native. Aucun clonage du dépôt ni téléchargement d’archive n’est nécessaire.

Vous migrez les API natives intégrées au thème 1.2.0 ou 1.2.1 ? Suivez le [guide de migration](/docs/migration) pour les imports, la configuration et le projet natif.

## Prérequis

Le démarrage natif nécessite Capacitor 8 et un projet iOS ou Android. Les extensions Android nécessitent l’API 24+ et Kotlin/Compose. Le rendu natif ordinaire nécessite iOS 26+ et Xcode 26+. L’adaptateur Ionic prend en charge Ionic `>=8.8.1 <10` ; l’adaptateur HTML `/core` ne nécessite ni Ionic ni thème. [Vertical Bars](/docs/vertical-bars) et le [placement des extensions](/docs/native-ui-extensions#content-and-placement-are-independent) ont des exigences matérielles supplémentaires.

Pour les contrôles standard, suivez le guide correspondant à votre balisage ; les adaptateurs Ionic et HTML utilisent des imports différents. Pour du contenu natif personnalisé, commencez directement par le [guide des extensions](/docs/native-ui-extensions).

## Référence

- [Contrôles Ionic pris en charge](/docs/native-ui#supported-markup) et comportement de repli.
- [Configuration](/docs/configuration) : valeurs par défaut, sélection des contrôles, mode rail uniquement et modifications à chaud.
- [Apparence claire et sombre](/docs/appearance) : hériter du thème Web, configurer le HTML personnalisé et comprendre l’apparence du rail partagé.
- [Vertical Bars](/docs/vertical-bars) : admissibilité, apparence et API du runtime.
- [Migration](/docs/migration) : noms des packages, imports et mise à jour du projet natif.
