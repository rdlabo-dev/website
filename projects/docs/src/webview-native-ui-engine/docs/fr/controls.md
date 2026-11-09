---
title: "Contrôles partagés pour les adaptateurs natifs"
sourceRevision: "df25f5115089f83ef851866adc2db0f16a2ce21ac4a1eed70cb497b56c35c2ba"
---
# Contrôles partagés pour les adaptateurs natifs

Le paquet Engine existant contient également l’implémentation des contrôles utilisée par Capacitor Native UI. Aucun paquet npm ni espace de travail supplémentaire n’est nécessaire.

- `@webview-native-ui/engine` : API de projection générique ; périmètre des dépendances inchangé.
- `@webview-native-ui/engine/controls` : runtime des contrôles et contrat de transport.
- `@webview-native-ui/engine/controls/ionic` : implémentation facultative des superpositions Ionic.
- `@webview-native-ui/engine/integration` : état unique partagé de l’intégration des transitions et de la recherche.

Un adaptateur crée une seule instance `createNativeUI({ plugin, getPlatform, isAvailable })` et la conserve pendant toute sa durée de vie. Le plugin implémente l’interface de transport `NativeUIPlugin`. L’adaptateur gère l’enregistrement de l’hôte, la répartition des appels de méthodes, la transmission aux écouteurs et les points d’entrée du cycle de vie ; l’Engine gère le rendu, la propriété du DOM, les confirmations des extensions et l’ordre du démontage. Cordova peut fournir ce même transport sans importer Capacitor. Le plugin Cordova Native UI lui-même fera l’objet d’une modification ultérieure.

SwiftPM expose le produit facultatif `WebViewNativeUIControls`, qui dépend de `WebViewNativeUIEngine`. CocoaPods expose `WebViewNativeUIControls` avec la même dépendance. Android expose l’artefact facultatif `io.github.webview-native-ui:controls` depuis `android/controls` ; il dépend d’`engine` et de Compose. Les consommateurs de l’Engine générique conservent leurs dépendances existantes et le SDK Android minimal 23. Controls nécessite Android API 24. Les adaptateurs natifs créent `NativeUIController` et transmettent les requêtes et événements. iOS reçoit des dictionnaires JSON et des closures de fin ; Android reçoit des JSONObjects.

Le thème Ionic importe directement l’intégration Engine. L’export d’intégration compatible Capacitor réexporte ce module. Résolvez une seule version de l’Engine dans l’application ; n’incluez pas de copie privée de l’intégration dans le thème ou l’adaptateur. Le point d’entrée `/controls` ne charge pas le runtime Ionic ; chargez `/controls/ionic` uniquement si vous activez les superpositions Ionic.

## Vérification et ordre de publication

Exécutez `npm run test:controls` pour les tests des contrôles migrés et `npm test` pour la projection générique. Le schéma SwiftPM `WebViewNativeUIEngine-Package` couvre les deux cibles natives. La tâche Android `:controls:testReleaseUnitTest` couvre l’analyseur d’instantanés migré. Les tests existants du transport Capacitor et du cycle de vie hébergé restent dans son dépôt, et le thème conserve la suite E2E réelle de la démo.

Compilez et vérifiez d’abord l’Engine, y compris les deux artefacts Maven signés dans le même bundle Central et les deux podspecs distribués par npm. Publiez les artefacts natifs et le paquet npm de l’Engine à la même version avant de mettre à jour les fichiers de verrouillage pour le registre de Capacitor et du thème. La vérification des versions candidates utilise des archives tarball npm locales et un chemin SwiftPM temporaire ou un dépôt Maven local ; ne commitez pas ces chemins temporaires.
