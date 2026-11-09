---
title: "Premiers pas"
sourceRevision: "138c167c785de29232c537752cccc8c87da59bf71b041a23374750b140ea51cb"
---

# Ionic Theme iOS27

Installez avec `npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable`. Pour la version 1.x, consultez le [guide v1.2.1](https://github.com/webview-native-ui/ionic-theme-ios27/tree/ios27-v1.2.1).
Un thème pour les applications Ionic qui apporte Liquid Glass et les animations d’iOS 27 au Web. Les applications Capacitor iOS peuvent aussi activer Native UI pour les contrôles pris en charge, avec une prise en charge officielle depuis la version 2.0.0.

**[Démo Ionic 9](https://ionic-theme-ios27.rdlabo.dev/) · [Guide d’installation](/docs/setup)**

<!-- rdlabo-docs-pick -->

<p>
  <img src="https://raw.githubusercontent.com/webview-native-ui/ionic-theme-ios27/c70beb9d1e5b39de696b2b2c47a3d9bc5ffcdfbe/screenshots/ios27-settings.png" width="32%" alt="Thème iOS 27 : réglages en mode clair avec une barre de recherche Liquid Glass" />
  <img src="https://raw.githubusercontent.com/webview-native-ui/ionic-theme-ios27/c70beb9d1e5b39de696b2b2c47a3d9bc5ffcdfbe/screenshots/ios27-settings-dark.png" width="32%" alt="Thème iOS 27 : réglages en mode sombre" />
  <img src="https://raw.githubusercontent.com/webview-native-ui/ionic-theme-ios27/c70beb9d1e5b39de696b2b2c47a3d9bc5ffcdfbe/screenshots/ios27-library.png" width="32%" alt="Thème iOS 27 : bibliothèque avec boutons et barre d’onglets Liquid Glass" />
</p>

<!-- /rdlabo-docs-pick -->

## Que souhaitez-vous faire ?

| Objectif | Guide |
| --- | --- |
| Habiller une application Ionic existante | [Premiers pas](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/setup) |
| Choisir les styles iOS 26/27 et éventuellement MD3 | [Thèmes adaptatifs](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/adaptive-themes) |
| Ajouter des contrôles iOS natifs à une application Capacitor | [Ajouter Native UI](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/add-native-ui) |
| Ajouter un rail latéral à Ionic en conservant votre thème | [Vertical Bars pas à pas](https://docs.rdlabo.dev/projects/capacitor-native-ui/docs/ionic-vertical-bars) |
| Facultatif : utiliser le thème et Native UI avec Cordova | [Configuration Cordova](/docs/cordova) |
| Mettre à niveau une installation existante | [Migration](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/migration) |

## Premiers pas

Les guides standard utilisent le package de thème autonome, avec Capacitor comme hôte natif par défaut. L’utilisation du thème seul dans le navigateur reste prise en charge. Pour une application Cordova, consultez le [guide Cordova](/docs/cordova) facultatif, qui décrit le thème fourni et le démarrage propre à cet hôte.

Nous utilisons [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable), un excellent plugin communautaire d’Erkam Yaman, comme intégration standard pour la disposition de l’appareil. Il expose l’état de pliage, la géométrie de la charnière, le placement des barres et les événements de changement, ce qui vous permet de contrôler l’adaptation de la disposition. Foldable fournit les données de l’appareil ; le thème fournit les utilitaires de disposition Web et Native UI projette les contrôles. Installez-le avec le package utilisé, puis raccordez ses événements dans votre application.

Suivez le [guide en quatre étapes](/docs/setup) pour installer le thème, charger les styles, configurer les animations et prévisualiser votre premier écran. La plage de compatibilité Ionic déclarée est `>=8.8.1 <10`, avec Angular, React et Vue ; la validation E2E automatisée cible Ionic 9. Aucun projet Capacitor natif n’est nécessaire dans le navigateur.

Le thème habille les barres d’outils, onglets, listes, boutons, recherches et superpositions, en clair et en sombre. Il n’active pas les contrôles natifs. Une fois le thème Web opérationnel, vous pouvez [ajouter Native UI](/docs/add-native-ui).

## Personnaliser votre application

- [Fonctionnalités](/docs/features) : variables CSS, Liquid Glass et imports sélectifs de composants.
- [Balisage et classes spécifiques](/docs/special-markup) : comportements de composants à activer explicitement.
- [Utiliser ion-item-group](/docs/using-ion-item-group) : balisage des listes en retrait.
- [Animation](/docs/animation) : effets sur les onglets, segments et recherches.
- [ESLint](/docs/eslint) : détecter les structures de liste non prises en charge.
- [Disposition Vertical Bars](/docs/vertical-bars-layout) : espacement, RTL, placement, posture et panneaux divisés.

## Périmètre des dépôts

Le plugin Capacitor est maintenu dans [webview-native-ui/capacitor-plugin](https://github.com/webview-native-ui/capacitor-plugin). Ce dépôt gère le thème Ionic, la démo combinée, les captures du navigateur et les tests d’intégration sur simulateur. La démo installe `@rdlabo/capacitor-native-ui` depuis npm ; les publications du thème ne publient pas le plugin et n’en modifient pas la version.

Le [plugin Cordova](https://github.com/webview-native-ui/cordova-plugin) est maintenu séparément. Il distribue une copie épinglée de ce thème dont les imports d’intégration sont reliés à Cordova. Les corrections communes du thème appartiennent à ce dépôt ; Cordova met à jour la version épinglée lors d’une publication ultérieure du plugin. La démo Capacitor et les vérifications des archives candidates ci-dessous ne valident pas Cordova.

Pour vérifier une archive de plugin non publiée avec la démo réelle, exécutez :

```sh
npm run test:native-candidate -- /absolute/path/rdlabo-capacitor-native-ui-VERSION.tgz --e2e
```

Cette commande crée un checkout temporaire isolé sans modifier vos manifestes ni fichiers de verrouillage. Ajoutez `--shard=1/2` avec `--e2e` pour exécuter un shard Playwright ; exécutez tous les shards pour couvrir la suite complète. Chaque shard conserve les vérifications de package, les tests unitaires et le build de production. Ajoutez `--simulator=UDID` pour les suites sur simulateur d’interface native, de recherche et de bords. Les diagnostics et la démo temporaire sont conservés au chemin affiché. Les tests unitaires propres au plugin et les tests de bibliothèque native se trouvent dans son dépôt. Sa CI teste chaque archive candidate avec la branche main de ce dépôt.

## Maintenance

Publiez le package de thème racine avec `npm run release` depuis une branche `main` propre et à jour. Le workflow des tags `ios27-v…` publie uniquement le thème, avec `next` pour les préversions et `latest` pour les versions stables.

Les versions du thème et du plugin sont indépendantes. Pour le package autonome `@rdlabo/ionic-theme-ios27`, Capacitor Native UI est une dépendance pair obligatoire afin que le thème et l’application partagent une seule instance du plugin. npm 7+ l’installe automatiquement pour les applications utilisant seulement le thème ; les autres gestionnaires doivent installer les dépendances pairs obligatoires. Les applications avec des contrôles natifs doivent aussi déclarer directement le plugin pour sa détection par Capacitor. Une version npm publiée ne peut pas être écrasée.
