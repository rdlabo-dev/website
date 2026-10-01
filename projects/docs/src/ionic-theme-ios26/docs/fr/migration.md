---
title: "Migration"
sourceRevision: "5a4c28f9cae897fd53bc1ef9655924b939eda51ea08039d2645e53ba7c06ee2d"
---
# Migration

Examinez chaque section plus récente que la version actuellement installée, dans l’ordre croissant. Par exemple, pour passer de 1.x à 9.0.0, effectuez les étapes de migration 2.0.0 et 3.0.0 avant d’examiner 9.0.0.

Chaque section répertorie uniquement les changements nécessitant une mise à jour du code ou de la configuration de l’application.

## Migrer vers 9.2.0

### Noms du thème indépendants de la version

La classe de désactivation du thème et les variables CSS ont été renommées pour retirer la version de l’OS de leurs noms publics. Les anciens noms sont obsolètes ; utilisez les nouveaux dans le nouveau code et migrez les personnalisations existantes quand cela vous convient.

| Nom obsolète | Nouveau nom |
| --- | --- |
| `ios26-disabled` | `ios-theme-disabled` |
| `--ios26-content-box-shadow-rgb` | `--ios-theme-content-box-shadow-rgb` |
| `--ios26-*` (autres variables du thème) | `--ios-theme-*` (même suffixe) |

```diff
- <ion-button class="ios26-disabled">Standard Ionic button</ion-button>
+ <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

```diff
ion-content {
-  --ios26-content-box-shadow-rgb: 255, 255, 255;
+  --ios-theme-content-box-shadow-rgb: 255, 255, 255;
}
```

`ios26-disabled` reste pris en charge comme alias. Les anciennes variables CSS restent acceptées comme valeurs de repli, et la nouvelle variable est prioritaire lorsque les deux sont définies. Les applications existantes peuvent donc continuer à utiliser les noms obsolètes pendant la migration. Les noms des packages et les chemins des feuilles de style restent inchangés.

## Migrer vers 9.0.0

La version 9 aligne la version majeure du thème sur Ionic Framework 9. Elle n’introduit aucun changement incompatible supplémentaire au-delà de ceux décrits dans les sections de migration précédentes.

Ionic 8 et Ionic 9 restent tous deux pris en charge. La version 9 nécessite `@ionic/core >=8.8.1 <10`.

## Migrer vers 3.0.0

### Renommer `.header-item-group` en `.item-group-header`

La classe d’un `ion-item-group` utilisé comme en-tête de section a été renommée pour correspondre à l’élément qu’elle modifie. Remplacez chaque occurrence de `.header-item-group` dans les templates et styles de l’application.

```diff
- <ion-item-group class="header-item-group">
+ <ion-item-group class="item-group-header">
    ...
  </ion-item-group>
```

L’ancienne classe n’est plus stylisée par le thème. Ce renommage s’applique également au balisage partagé avec `@rdlabo/ionic-theme-md3`.

## Migrer vers 2.0.0

### Configurer `iosTransitionAnimation`

La version 2 nécessite la transition de navigation du package. Elle suit la transition iOS par défaut d’Ionic sans l’ancien comportement `animateBackButton()`, qui animait un grand titre vers le libellé du bouton Retour.

```ts
import { isPlatform } from '@ionic/core'; // ou @ionic/angular/standalone, @ionic/react, @ionic/vue
import { iosTransitionAnimation } from '@rdlabo/ionic-theme-ios26';

// Angular
provideIonicAngular({
  // ...
  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
});

// React
setupIonicReact({
  // ...
  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
});

// Vue
createApp(App).use(IonicVue, {
  // ...
  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
});
```

Avec cette transition configurée, `<ion-buttons><ion-back-button></ion-back-button></ion-buttons>` peut être utilisé sans les effets de transition indésirables de l’ancienne animation.

## Migrer vers 1.0.0

### Mettre à jour les chemins d’importation SCSS

Les fichiers sources ont été déplacés dans `src/styles` lors de l’ajout des fichiers JavaScript au package.

```diff
- @import '@rdlabo/ionic-theme-ios26/src/default-variables.scss';
+ @import '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss';
```

Les chemins CSS générés dans `dist` n’ont pas changé.

### Renommer `--ios26-color-background-rgb`

```diff
  :root {
-   --ios26-color-background-rgb: 255, 255, 255;
+   --ios26-content-box-shadow-rgb: 255, 255, 255;
  }
```

### Renommer les variables de luminosité

Remplacez chaque variable `--ion-color-*-brightness-rgb` par `--ion-color-*-brightness` et utilisez une valeur de couleur plutôt qu’une liste de canaux RGB.

```diff
  :root {
-   --ion-color-primary-brightness-rgb: 130, 255, 255;
+   --ion-color-primary-brightness: #96feff;
  }
```
