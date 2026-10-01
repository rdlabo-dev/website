---
title: "Zone de sécurité"
sourceRevision: "1dfbfdfd3499605339d61d10d39d216305e99d1016bd3f3bf9ab450d9533236a"
---
En-têtes masqués préservant la zone de sécurité et en-têtes natifs toujours visibles.

Partez de l’en-tête sensible au défilement d’[IonContent](./ion-content.md), puis choisissez ci-dessous la structure d’en-tête adaptée à votre mise en page.

## Pourquoi définir un en-tête masqué pour la zone de sécurité ?

Il est bien sûr également possible de définir une zone de sécurité dans ion-content comme suit.

```css
ion-content {
  padding-top: var(--ion-safe-area-top, 0);
}
```

J’ai toutefois préféré définir explicitement ion-header et ion-toolbar pour la zone de sécurité.

## Il me faut aussi un en-tête toujours visible, en plus de celui qui suit le défilement et se masque

C’est possible : en ajoutant `native-header` au nom de classe, vous pouvez utiliser deux en-têtes avec un comportement plus fluide.

```diff
- <ion-header class="hidden"><ion-toolbar></ion-toolbar></ion-header>
+ <ion-header class="native-header">
+   <ion-toolbar><ion-title>Native Header</ion-title></ion-toolbar>
+ </ion-header>
```
