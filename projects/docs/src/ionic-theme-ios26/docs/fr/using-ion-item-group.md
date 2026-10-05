---
title: "Utiliser ion-item-group"
sourceRevision: "5bda77202eea71f1d5002868580811632b3c279b0689c46ad535fbcd01aab66d"
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

[Vérifier la structure des listes avec ESLint](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/eslint).

## Pourquoi ce conteneur est nécessaire

Ionic attribue normalement son arrière-plan à `ion-list`, ce qui place visuellement `ion-list-header` dans la même surface que les éléments. La disposition iOS 26 traite séparément l’en-tête et la surface des éléments.

![Comparaison des arrière-plans de listes en retrait montrant pourquoi ion-item-group est requis](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/ios26-v9.4.2/screenshots/why-ion-list-inset.png)

Le thème procède donc ainsi :

- rend transparent l’arrière-plan du `ion-list` en retrait ;
- applique la surface des éléments à `ion-item-group` ;
- laisse `ion-list-header` en dehors de cette surface.

## Partager le balisage avec Material Design

`@rdlabo/ionic-theme-md3` prend en charge le même regroupement ; un seul modèle peut donc servir pour les deux modes Ionic.

Lorsqu’une application utilise ce package sans `@rdlabo/ionic-theme-md3`, importez la feuille de style facultative pour appliquer la même disposition groupée en mode Material :

```css
@import '@rdlabo/ionic-theme-ios26/dist/css/md-ion-list-inset.css';
```

Pour les éléments sur deux lignes et les groupes d’en-têtes de section, consultez [Balisage et classes particuliers](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/special-markup).
