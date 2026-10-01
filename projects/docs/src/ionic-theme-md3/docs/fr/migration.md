---
title: "Migration"
sourceRevision: "9f0427ecfff5a3db13e75a3c31fd6f20e6ed7bf04614497e5cd9b32392071207"
---
# Migration

Examinez chaque section plus récente que la version installée, dans l’ordre croissant. Par exemple, pour passer de 1.x à 9.0.0, effectuez les étapes de migration 2.0.0 avant d’examiner 9.0.0.

Chaque section répertorie uniquement les changements nécessitant une mise à jour du code ou de la configuration de l’application.

## Migrer vers 9.0.0

La version 9 aligne la version majeure du thème sur Ionic Framework 9. Elle n’introduit aucun changement incompatible supplémentaire au-delà de ceux décrits dans les sections de migration précédentes.

Ionic 8 et Ionic 9 restent tous deux pris en charge. La version 9 nécessite `@ionic/core >=8.8.0 <10`.

## Migrer vers 2.0.0

### Renommer `.header-item-group` en `.item-group-header`

La classe d’un `ion-item-group` utilisé comme en-tête de section a été renommée pour correspondre à l’élément qu’elle modifie. Remplacez chaque occurrence de `.header-item-group` dans les templates et styles de l’application.

```diff
- <ion-item-group class="header-item-group">
+ <ion-item-group class="item-group-header">
    ...
  </ion-item-group>
```

L’ancienne classe n’est plus stylisée par le thème. Ce renommage s’applique également au balisage partagé avec `@rdlabo/ionic-theme-ios26`.
