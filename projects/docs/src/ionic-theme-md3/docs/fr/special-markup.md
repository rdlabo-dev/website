---
title: "Balisage particulier"
sourceRevision: "3728e6e1b03ebd988f193aafaf6d13fc5c05cd2337a964e7d3752d16f74d0d72"
---

# Balisage particulier

La plupart du balisage Ionic fonctionne sans modification. Le balisage commun a le même sens dans `@rdlabo/ionic-theme-ios27` et ce thème ; son apparence suit la plateforme active. Android Settings est la référence visuelle MD3. Le balisage commun ne demande pas une apparence Glass d’iOS sur Android.

## Boutons d’envoi

Utilisez `type="submit"` pour un véritable envoi de formulaire. Si l’envoi par formulaire est impossible, `type="button" class="button-submit"` identifie l’action équivalente ; la classe décrit uniquement l’apparence, sans envoyer, valider ni installer de gestionnaire. Pour une action principale pleine, utilisez l’attribut public Ionic `fill="solid"`. MD3 affiche déjà les boutons pleins avec la paire base/contrast de la palette : les deux formes partagent donc la même apparence Android sans effet supplémentaire ni helper JavaScript.

```html preview
<ion-button type="submit" fill="solid" color="primary">Submit</ion-button>
<ion-button type="button" class="button-submit" fill="solid" color="primary">Continue</ion-button>
```

Les couleurs Ionic explicites, l’état désactivé et `fill="clear"` / `fill="outline"` conservent leur sens habituel. La classe n’impose pas un autre remplissage.

## Actions recommandées des superpositions

Pour les alertes et feuilles d’actions, utilisez `role: 'preferred'` pour l’action recommandée, conformément au thème iOS 27. L’apparence suit la fonction de la superposition : une Alert utilise une action pleine primary/on-primary ; une Action Sheet conserve la même ligne pleine largeur que les autres choix et accentue texte et icône avec la couleur primary et une graisse medium. Son groupe Cancel est séparé des choix par un espacement et un séparateur. Les couleurs viennent de la palette Ionic, sauf si des rôles Material facultatifs sont fournis. Les actions ordinaires/par défaut restent textuelles ; `confirm` seul ne demande pas d’accentuation. Les rôles d’annulation, de sélection et de destruction restent distincts de la recommandation.

```ts
buttons: [
  { text: 'Cancel', role: 'cancel' },
  { text: 'Continue', role: 'preferred' },
];
```

Ce rôle Ionic personnalisé ne sélectionne ni n’exécute automatiquement une action. Le gestionnaire du bouton s’exécute normalement et la fermeture signale `preferred` ; traitez ce rôle explicitement si l’application examine le résultat de fermeture. `cancel` conserve le comportement d’annulation Ionic. Ne remplacez pas `cancel`, `selected` ou `destructive` par `preferred` uniquement pour changer leur couleur.

## Éléments de liste en retrait sur deux lignes

Placez un `ion-label` sans slot immédiatement à côté d’un `ion-note` sans slot pour afficher un élément sur deux lignes. Entourez les éléments en retrait d’un `ion-item-group` et gardez `ion-list-header` à l’extérieur. Utilisez `slot="end"` sur `ion-note` pour la disposition habituelle de note finale.

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

## Contrôles Android Settings

L’interrupteur standard est sans icône. `enableOnOffLabels` d’Ionic reste disponible lorsque l’application demande explicitement des libellés :

```html preview
<ion-list inset="true">
  <ion-item-group>
    <ion-item><ion-toggle justify="space-between">Notifications</ion-toggle></ion-item>
    <ion-item>
      <ion-toggle justify="space-between" enable-on-off-labels="true">Notifications with on/off labels</ion-toggle>
    </ion-item>
  </ion-item-group>
</ion-list>
```

Le thème utilise une piste de 52×28px et un curseur de 20px. Les lignes groupées ont une hauteur minimale de 56px, ou 72px pour les boutons radio ; le contenu long peut agrandir la ligne. Utilisez les variables CSS publiques d’Ionic pour le dimensionnement et conservez la [structure de liste commune](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/using-ion-item-group).

Le thème principal fournit une police MD par défaut uniquement en CSS : Google Sans Flex local si disponible, sinon les polices de repli standard. Le `--ion-font-family` de l’application est prioritaire. Ionic gère les icônes de retour ; le thème n’en fournit pas de remplacement. Consultez [Apparence Android Settings](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/android-settings) pour les polices par défaut, les replis et les personnalisations. Lisez le [guide de migration](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/migration) avant de mettre à jour une application aux dimensions personnalisées. Ces options préservent l’intention de la palette Ionic et les propriétés explicites des composants.

## Extensions propres aux plateformes

La structure commune ci-dessus fonctionne sans modèles propres à une plateforme. Les éléments iOS `segment-style-glass`, `searchbar-classic`, les feuilles flottantes iPad et le placement des barres d’onglets iOS ne sont pas des exigences visuelles Android. MD3 conserve le comportement Ionic des segments, barres de recherche, modales et barres d’onglets. `.button-square` est une extension de forme MD3 facultative, pas une convention de balisage commun obligatoire.

## Désactiver le thème

Ajoutez `.md3-disabled` à un composant Ionic pour conserver les styles Material standard d’Ionic.

```html preview
<ion-button fill="solid">MD3 theme</ion-button> <ion-button class="md3-disabled" fill="solid">Standard Ionic</ion-button>
```
