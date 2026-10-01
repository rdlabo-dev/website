---
title: "Safe Area"
sourceRevision: "1dfbfdfd3499605339d61d10d39d216305e99d1016bd3f3bf9ab450d9533236a"
---
Verborgene Safe-Area-Header und dauerhaft sichtbare native Header.

Beginnen Sie mit dem scrollabhängigen Header unter [IonContent](./ion-content.md) und wählen Sie dann die folgende Header-Struktur passend zu Ihrem Layout.

## Warum ist ein verborgener Header für die Safe Area nötig?

Natürlich lässt sich eine Safe Area auch wie folgt in ion-content festlegen.

```css
ion-content {
  padding-top: var(--ion-safe-area-top, 0);
}
```

Ich habe es jedoch vorgezogen, ion-header und ion-toolbar ausdrücklich für die Safe Area einzurichten.

## Ich benötige neben dem scrollabhängig ausgeblendeten Header auch einen dauerhaft sichtbaren Header

Das ist möglich: Mit `native-header` im Klassennamen lassen sich zwei Header geschmeidiger kombinieren.

```diff
- <ion-header class="hidden"><ion-toolbar></ion-toolbar></ion-header>
+ <ion-header class="native-header">
+   <ion-toolbar><ion-title>Native Header</ion-title></ion-toolbar>
+ </ion-header>
```
