---
title: "Prendre en charge iOS 18"
sourceRevision: "031ef850391abdff1da4137ea654ca9f4ae75c93bbad742a0bb076b5678ebb82"
---
# Prendre en charge iOS 18

## Comment éviter de charger le thème sur iOS 18

Pour charger un fichier de thème uniquement lorsque l’appareil de l’utilisateur fonctionne sous iOS 26 et laisser le thème iOS Ionic par défaut aux utilisateurs d’iOS 18, ajoutez une condition de prise en charge à votre `import`.

```css
@import '@rdlabo/ionic-theme-ios26/dist/css/default-variables.css' supports(text-wrap: pretty);
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26.css' supports(text-wrap: pretty);
@import '@rdlabo/ionic-theme-ios26/dist/css/md-remove-ios-class-effect.css' supports(text-wrap: pretty);
@import '@rdlabo/ionic-theme-ios26/dist/css/md-ion-list-inset.css' supports(text-wrap: pretty);
```
