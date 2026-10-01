---
title: "Utiliser ion-item-group"
sourceRevision: "c85fe1c35a1c85f3e25a13ba978ea1c822d20f5ecbe117e0d4f1f86a4da3e0a3"
---
# Utiliser `ion-item-group` dans les listes en retrait

Le thème MD3 utilise la même structure de liste en retrait que `@rdlabo/ionic-theme-ios26`, afin qu’un même template fonctionne dans les deux modes Ionic. Lorsqu’un `ion-list` utilise `inset="true"`, enveloppez ses éléments dans `ion-item-group` et gardez `ion-list-header` hors du groupe.

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

[Vérifier la structure des listes avec ESLint](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/eslint).

## Pourquoi ce conteneur est nécessaire

La structure partagée sépare `ion-list-header` de la surface des éléments. Elle correspond à la disposition iOS 26 tout en permettant à MD3 de styliser le même balisage sans templates propres aux plateformes.

Le thème procède donc ainsi :

- rend transparent l’arrière-plan du `ion-list` en retrait ;
- applique la surface des éléments à `ion-item-group` ;
- laisse `ion-list-header` en dehors de cette surface.

Pour les éléments sur deux lignes et les groupes d’en-têtes de section, consultez [Balisage particulier](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/special-markup).
