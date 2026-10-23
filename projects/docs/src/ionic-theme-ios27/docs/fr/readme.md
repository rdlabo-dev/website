---
title: "Premiers pas"
sourceRevision: "955c1cb5086ab0df89e19ea454d6313fbc891bfd8eb6352a456c82f02406c554"
---
# Ionic Theme iOS27

Installez avec `npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable`. Pour la version 1.x, consultez le [guide v1.2.1](https://github.com/rdlabo-dev/ionic-theme-ios27/tree/ios27-v1.2.1).
Un thème pour les applications Ionic qui apporte Liquid Glass et les animations d’iOS 27 au Web. Les applications Capacitor iOS peuvent aussi activer Native UI pour les contrôles pris en charge, avec une prise en charge officielle depuis la version 2.0.0.

**[Démo Ionic 9](https://ionic-theme-ios27.rdlabo.dev/) · [Démo Ionic 8](https://ionic8-theme-ios27.rdlabo.dev/) · [Guide d’installation](/docs/setup)**

<!-- rdlabo-docs-pick -->

<p>
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v2.0.2/screenshots/ios27-settings.png" width="32%" alt="Thème iOS 27 : réglages en mode clair avec une barre de recherche Liquid Glass" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v2.0.2/screenshots/ios27-settings-dark.png" width="32%" alt="Thème iOS 27 : réglages en mode sombre" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v2.0.2/screenshots/ios27-library.png" width="32%" alt="Thème iOS 27 : bibliothèque avec boutons et barre d’onglets Liquid Glass" />
</p>

<!-- /rdlabo-docs-pick -->

## Que souhaitez-vous faire ?

| Objectif | Guide |
| ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| Habiller une application Ionic existante | [Premiers pas](/docs/setup) |
| Choisir les styles iOS 26/27 et éventuellement MD3 | [Thèmes adaptatifs](/docs/adaptive-themes) |
| Ajouter des contrôles iOS natifs après avoir configuré le thème | [Ajouter Native UI](/docs/add-native-ui) |
| Ajouter un rail latéral à Ionic en conservant votre thème | [Vertical Bars pas à pas](/capacitor-native-ui/docs/ionic-vertical-bars) |
| Mettre à niveau une installation existante | [Migration](/docs/migration) |

## Premiers pas

Nous utilisons [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable), un excellent plugin communautaire d’Erkam Yaman, comme intégration standard pour la disposition de l’appareil. Il expose l’état de pliage, la géométrie de la charnière, le placement des barres et les événements de changement, ce qui vous permet de contrôler l’adaptation de la disposition. Foldable fournit les données de l’appareil ; le thème fournit les utilitaires de disposition Web et Native UI projette les contrôles. Installez-le avec le package utilisé, puis raccordez ses événements dans votre application.

Suivez le [guide en quatre étapes](/docs/setup) pour installer le thème, charger les styles, configurer les animations et prévisualiser votre premier écran. Il prend en charge Ionic 8.8.1 ou ultérieur dans les versions 8 ou 9, avec Angular, React et Vue. Aucun projet Capacitor natif n’est nécessaire dans le navigateur.

Le thème habille les barres d’outils, onglets, listes, boutons, recherches et superpositions, en clair et en sombre. Il n’active pas les contrôles natifs. Une fois le thème Web opérationnel, vous pouvez [ajouter Native UI](/docs/add-native-ui).

## Personnaliser votre application

- [Fonctionnalités](/docs/features) : variables CSS, Liquid Glass et imports sélectifs de composants.
- [Balisage et classes spécifiques](/docs/special-markup) : comportements de composants à activer explicitement.
- [Utiliser ion-item-group](/docs/using-ion-item-group) : balisage des listes en retrait.
- [Animation](/docs/animation) : effets sur les onglets, segments et recherches.
- [ESLint](/docs/eslint) : détecter les structures de liste non prises en charge.
- [Disposition Vertical Bars](/docs/vertical-bars-layout) : espacement, RTL, placement, posture et panneaux divisés.
