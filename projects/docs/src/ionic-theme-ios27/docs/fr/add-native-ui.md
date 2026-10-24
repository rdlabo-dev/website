---
title: "Ajouter Native UI à votre thème"
sourceRevision: 8e6c0dea9827316d87519226cd6ce439b7156f5411c429a78ba814a14754a5cd
---
# Ajouter Native UI à votre thème

Vous utilisez déjà `@rdlabo/ionic-theme-ios27` ? Ajoutez des contrôles natifs sur iOS tout en conservant vos styles, votre contenu Web et votre routage. Les contrôles non pris en charge, les navigateurs et Android conservent leur apparence Web.

Commencez par la [configuration du thème](setup.md) si vous ne l’avez pas encore configuré. Si vous utilisez une autre apparence Web, suivez la [configuration de Native UI](../../capacitor-native-ui/docs/setup.md).

Consultez le [fonctionnement de la projection](../../capacitor-native-ui/README.md#how-projection-works) pour comprendre comment les contrôles natifs restent reliés à votre DOM Web et à vos gestionnaires.

## 1. Installer le plugin natif

Ce guide suppose une application Capacitor 8 avec un projet iOS. Les utilisateurs du thème uniquement sur le Web peuvent continuer sans Capacitor ; l’ajout de contrôles iOS natifs nécessite d’abord ce projet natif. Consultez les [prérequis de Native UI](../../capacitor-native-ui/README.md#requirements) pour les versions d’Ionic, iOS et Xcode prises en charge.

Mettez à jour le thème et Native UI ensemble pour aligner leurs versions, et installez Foldable comme dépendance distincte de l’application :

```sh
npm install @rdlabo/ionic-theme-ios27 @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Conservez vos feuilles de style existantes. La découverte standard des plugins Capacitor nécessite une dépendance directe ; la copie installée uniquement par le thème n’enregistre pas le plugin natif.

## 2. Activer les contrôles natifs

Activez le Shell une seule fois au démarrage de l’application, après le montage de `ion-app` :

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const shell = await enableNativeUI();
```

Appelez `await shell.destroy()` à la destruction du propriétaire de l’application ; ne créez pas un shell par page. Utilisez les [exemples de composant racine Angular, React ou Vue](../../capacitor-native-ui/docs/setup.md#place-startup-in-your-frameworks-app-root) pour raccorder démarrage et nettoyage.

Conservez `navAnimation: iosTransitionAnimation` du package de thème. Cette animation coordonne déjà les contrôles natifs pendant les transitions de page et les gestes de retour ; ne l’enveloppez pas à nouveau. Avec une animation personnalisée, suivez les [instructions de l’adaptateur de transition](../../capacitor-native-ui/docs/migration.md#native-ui-transition-adapter).

Installer le plugin ou configurer les animations du thème n’active pas les contrôles natifs. L’application les active avec l’appel de démarrage ci-dessus.

## 3. Synchroniser et exécuter sur iOS

Compilez vos ressources Web, puis exécutez :

```sh
npx cap sync ios
```

Exécutez l’application sur un appareil ou simulateur iOS pris en charge. Les contrôles fixes admissibles doivent adopter la présentation native tout en invoquant leurs gestionnaires existants. Naviguez dans les deux sens, puis vérifiez la même application dans un navigateur pour confirmer le repli Web. Si tout reste Web sur un iOS compatible, vérifiez la dépendance directe, l’appel de démarrage, la synchronisation et la recompilation native. Consultez les [contrôles pris en charge](../../capacitor-native-ui/docs/native-ui.md#supported-markup) pour le balisage admissible et le repli Web. Conservez les styles du thème pour le contenu Web et les contrôles non projetés.

## Facultatif : Vertical Bars

Pour un rail latéral, suivez la [configuration standard de Vertical Bars](../../capacitor-native-ui/docs/ionic-vertical-bars.md) : chargez la feuille de style de disposition et raccordez le placement initial et les événements du plugin Foldable installé. Le Shell inclut le runtime du rail ; aucun appel de démarrage supplémentaire n’est nécessaire. Le démarrage par défaut sélectionne déjà les contrôles horizontaux et ceux du rail ; conservez-le pour ajouter un rail à votre interface native existante. Utilisez `enableNativeUI({ controls: 'verticalOnly' })` uniquement pour limiter la projection automatique au rail. Consultez les [options de configuration](../../capacitor-native-ui/docs/configuration.md).

## Mettre à niveau une intégration native existante

Si vous importiez auparavant les API natives depuis le thème, suivez la [migration des imports natifs](../../capacitor-native-ui/docs/migration.md#2-replace-native-imports) et la [migration du projet natif](../../capacitor-native-ui/docs/migration.md#3-sync-the-native-project). Conservez les imports et feuilles de style ordinaires du thème.
