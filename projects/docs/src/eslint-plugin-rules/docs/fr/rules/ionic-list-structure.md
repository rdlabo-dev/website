---
title: ionic-list-structure
sourceRevision: "39d275048a99df10f9e12c55c650bfd7b3bbb66b878298a3836a5074ac26066b"
---

# @rdlabo/rules/ionic-list-structure

> Éviter les lignes Ionic contenant uniquement une note et les en-têtes placés après les éléments de liste.
>
> - ⭐️ Cette règle est incluse dans le preset Flat Config [`rdlabo.configs.recommended`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration).

## Détails de la règle

Cette règle signale deux erreurs de structure dans les modèles Angular :

- Un `ion-item` dont le seul enfant est un `ion-note` (en ignorant les espaces et les commentaires). Le texte explicatif doit se trouver en dehors de l’élément et de son groupe, sans le fond ni l’espacement de la ligne.
- Un `ion-list-header` précédé d’un `ion-item` ou d’un `ion-item-group` dans la même `ion-list`. Fermez la liste précédente et commencez une nouvelle liste pour la section suivante.

La vérification des en-têtes parcourt les éléments enveloppants et les blocs de contrôle de flux Angular. Les listes imbriquées suivent leurs éléments indépendamment. La vérification suit l’ordre du code source, y compris les éléments conditionnels ; elle n’évalue pas les conditions à l’exécution. La vérification des notes se limite volontairement aux enfants directs. Les notes accompagnant des libellés, des valeurs ou des contrôles restent valides.

Les diagnostics expliquent le problème de mise en page et la structure attendue. Aucune correction automatique ni suggestion n’est proposée, car le choix des limites des listes et le déplacement du contenu projeté nécessitent le contexte de l’application.

### Incorrect

```html
<ion-list>
  <ion-item-group>
    <ion-item><ion-note>Request bookings require approval.</ion-note></ion-item>
  </ion-item-group>
  <ion-list-header>Another section</ion-list-header>
</ion-list>
```

### Correct

```html
<ion-list>
  <ion-item-group>
    <ion-item><ion-label>Booking method</ion-label><ion-note slot="end">Request</ion-note></ion-item>
  </ion-item-group>
  <ion-note>Request bookings require approval.</ion-note>
</ion-list>
<ion-list>
  <ion-list-header>Another section</ion-list-header>
  <ion-item-group>
    <ion-item>Another setting</ion-item>
  </ion-item-group>
</ion-list>
```

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.2/src/rules/ionic-list-structure.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.2/tests/rules/ionic-list-structure.ts)
