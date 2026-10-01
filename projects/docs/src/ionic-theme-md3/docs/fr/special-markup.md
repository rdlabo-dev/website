---
title: "Balisage particulier"
sourceRevision: "3b31b2420e9692b0118e0915efec785864e0af1db4e105e64081048df9205c38"
---
# Balisage particulier

La plupart du balisage Ionic fonctionne sans modification. Les combinaisons ci-dessous sont des activations explicites utiles lorsqu’un même template utilise aussi `@rdlabo/ionic-theme-ios26`.

## Éléments de liste en retrait sur deux lignes

Placez un `ion-label` sans slot immédiatement à côté d’un `ion-note` sans slot pour afficher un élément sur deux lignes. Utilisez plutôt `slot="end"` sur `ion-note` pour la disposition standard avec note finale.

```html preview
<ion-list inset="true">
  <ion-item-group>
    <ion-item>
      <ion-label>Network &amp; internet</ion-label>
      <ion-note>Mobile, Wi-Fi, hotspot</ion-note>
    </ion-item>
  </ion-item-group>
</ion-list>
```

## Boutons carrés

Ajoutez `.button-square` lorsqu’un bouton doit avoir des coins plus carrés. Cette classe fonctionne avec les boutons textuels et les boutons à icône seule.

```html preview
<ion-button class="button-square" fill="solid">Continue</ion-button>
<ion-button class="button-square" fill="solid">
  <ion-icon name="add" slot="icon-only"></ion-icon>
</ion-button>
```

## En-têtes de section des listes en retrait

Ajoutez `.item-group-header` à un `ion-item-group` pour créer l’icône centrée, le titre et la description affichés en haut des pages de démonstration des composants.

Il s’agit d’un groupe d’introduction. Placez les éléments de liste ordinaires dans un autre `ion-item-group` qui le suit.

```html preview
<ion-list inset="true">
  <ion-item-group class="item-group-header">
    <ion-item>
      <ion-label>
        <ion-icon name="list" style="background: var(--ion-color-primary)"></ion-icon>
        <h2>Lists</h2>
        <ion-text>Inset-list examples</ion-text>
      </ion-label>
    </ion-item>
  </ion-item-group>
  <ion-item-group>
    <ion-item><ion-label>First item</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

## Désactiver le thème

Ajoutez `.md3-disabled` à un composant Ionic pour conserver les styles Material standard d’Ionic.

```html preview
<ion-button fill="solid">MD3 theme</ion-button> <ion-button class="md3-disabled" fill="solid">Standard Ionic</ion-button>
```
