---
title: "Migration"
sourceRevision: "c9a566bbe8c8f7d9e82e979376ca021c8fb262697714a6ac30a9f932c31f19fa"
---

# Migration

Examinez chaque section plus récente que la version installée, dans l’ordre croissant. Par exemple, pour passer de 1.x à 9.0.0, effectuez les étapes de migration 2.0.0 avant d’examiner 9.0.0.

Chaque section répertorie uniquement les changements nécessitant une mise à jour du code ou de la configuration de l’application.

## Migration vers 9.2.0 : alignement sur Android Settings

Aucune migration de modèle n’est nécessaire. Avant d’adopter cette mise à jour, examinez le CSS applicatif qui compense les anciennes dimensions du thème :

| Composant | Ancien thème | Thème mis à jour |
| --- | --- | --- |
| Interrupteur standard | Piste 52×32px, curseur 24px | Piste 52×28px, curseur 20px |
| Titre de barre d’outils ordinaire | 20px ; remplissage initial de 4px près des contrôles de début | 22px / ligne 28px ; remplissage initial 12px |
| Titre d’élément en retrait sur deux lignes | 18.4px, graisse 500 | 16px, graisse 400 ; note 14px |
| Hauteur minimale d’un élément groupé | 48px | 56px ; lignes avec bouton radio 72px |
| Listes en retrait avec en-tête | Marge/remplissage supplémentaire de liste | En-tête 56px ; sans marge/remplissage de bloc supplémentaire |

Ce sont des valeurs par défaut, pas des hauteurs de contenu fixes. Le retour à la ligne et les personnalisations de dimensions restent disponibles. Consultez les [dimensions des listes](using-ion-item-group.md#sizing-and-overrides) et [Apparence Android Settings](android-settings.md) pour des exemples.

La démo n’ajoute plus automatiquement les icônes croix/coche. Les applications appelant explicitement `applyToggleStateIcons` conservent ce comportement ; pour supprimer les icônes, retirez l’appel et exécutez son nettoyage. `enableOnOffLabels` d’Ionic reste pris en charge.

Le thème principal inclut désormais sa police MD par défaut en CSS. Chargez-le après les styles de base d’Ionic. Les personnalisations `--ion-font-family` existantes restent prioritaires ; sans police applicative, le navigateur utilise Google Sans Flex local si disponible, puis la pile de repli habituelle. Aucun helper TypeScript ni feuille de style supplémentaire n’est requis. Vérifiez les retours à la ligne sur les appareils et langues pris en charge ; les polices ne sont pas fournies.

Les icônes de retour restent gérées par Ionic. Les couleurs nommées, la correspondance Material You et les icônes personnalisées par bouton conservent leur sens.

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
