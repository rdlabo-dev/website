---
title: "Utiliser ion-item-group"
sourceRevision: "44a62b5b274ae6f731bff8ad66e5378b3882c2de93b42e86f2d03810f4511ca8"
---
# Utiliser `ion-item-group` dans les listes en retrait

La plupart du balisage Ionic fonctionne sans modification. Lorsqu’un `ion-list` utilise `inset="true"`, regroupez ses éléments dans `ion-item-group` et laissez `ion-list-header` en dehors du groupe.

Les exemples utilisent le balisage des Web Components, indépendant du framework. Dans React ou Vue, utilisez la syntaxe équivalente pour les composants et leurs propriétés.

```html
<ion-list inset="true">
  <ion-list-header><ion-label>Connections</ion-label></ion-list-header>
  <ion-item-group>
    <ion-item>...</ion-item>
    <ion-item>...</ion-item>
  </ion-item-group>
</ion-list>
```

Aucun conteneur supplémentaire n’est nécessaire pour les listes qui n’utilisent pas `inset="true"`.

[Vérifier la structure des listes avec ESLint](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/eslint).

## Pourquoi ce conteneur est nécessaire

Ionic applique normalement l’arrière-plan à `ion-list`, ce qui fait apparaître `ion-list-header` sur la même surface que les éléments. La disposition iOS 27 distingue l’en-tête de la surface des éléments.

![Comparaison des arrière-plans de listes avec retrait montrant pourquoi ion-item-group est requis](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios27-v1.2.0/screenshots/why-ion-list-inset.png)

Le thème procède donc ainsi :

- rend transparent l’arrière-plan du `ion-list` en retrait ;
- applique la surface des éléments à `ion-item-group` ;
- laisse `ion-list-header` en dehors de cette surface.

## Partager le balisage avec Material Design

`@rdlabo/ionic-theme-md3` prend en charge le même regroupement ; un seul modèle peut donc servir pour les deux modes Ionic.

Lorsqu’une application utilise ce package sans `@rdlabo/ionic-theme-md3`, importez la feuille de style facultative pour appliquer la même disposition groupée en mode Material :

```css
@import '@rdlabo/ionic-theme-ios27/dist/css/md-ion-list-inset.css';
```

Pour les éléments sur deux lignes et les groupes avec en-tête de section, consultez [Balisage et classes spécifiques](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/special-markup).
