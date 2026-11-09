---
title: "Utiliser ion-item-group"
sourceRevision: "cf42c4c83670a9128eafecfa9ec8f91412ddc4b83902958f5ab7c1d75ceee683"
---

# Utiliser `ion-item-group` dans les listes en retrait

Le thème MD3 utilise la même structure de liste en retrait que `@rdlabo/ionic-theme-ios27`, afin qu’un seul modèle fonctionne dans les deux modes Ionic. Quand `ion-list` utilise `inset="true"`, entourez les éléments d’un `ion-item-group` et gardez `ion-list-header` en dehors du groupe.

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

La structure commune sépare `ion-list-header` de la surface des éléments. Cela correspond à la disposition iOS 27 tout en permettant à MD3 de styliser le même balisage sans modèles propres à chaque plateforme.

Le thème procède donc ainsi :

- rend transparent l’arrière-plan du `ion-list` en retrait ;
- applique la surface des éléments à `ion-item-group` ;
- laisse `ion-list-header` en dehors de cette surface.

Pour les éléments sur deux lignes et les groupes d’en-têtes de section, consultez [Balisage particulier](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/special-markup).

## Dimensions et personnalisations

Les lignes MD groupées ont une hauteur minimale de 56px, ou 72px lorsqu’elles contiennent un bouton radio. Les éléments sur deux lignes utilisent un titre de 16px, une note de 14px et un remplissage de bloc de 16px ; leur hauteur augmente avec le contenu. Les titres utilisent la même hauteur de ligne normale que les éléments ordinaires : une note n’augmente donc pas l’espacement entre les lignes d’un titre replié. Les listes en retrait avec en-tête utilisent un en-tête de section de 56px et des espaces de 2px entre lignes groupées. Gardez l’en-tête hors de `ion-item-group`.

Utilisez les variables CSS publiques d’Ionic dans la feuille de style applicative chargée après le thème :

```css
ion-item.app-setting {
  --min-height: 64px;
}
```

Une hauteur minimale ne tronque pas les textes longs. Évitez les hauteurs de ligne fixes ou les transformations de position destinées à compenser une police d’appareil particulière. La note finale ordinaire d’Ionic (`slot="end"`) et les API de libellés radio/interrupteur conservent leur sens. La [police CSS par défaut](android-settings.md#default-font-css-only) respecte les polices définies par l’application. Le texte suit les métriques normales du navigateur sans compensation en pixels de l’appareil.
