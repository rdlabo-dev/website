---
title: "iOS 18 unterstützen"
sourceRevision: "031ef850391abdff1da4137ea654ca9f4ae75c93bbad742a0bb076b5678ebb82"
---
# iOS 18 unterstützen

## Das Laden des Themes unter iOS 18 verhindern

Wenn Sie eine Theme-Datei nur auf Geräten mit iOS 26 laden möchten und Nutzer von iOS 18 das standardmäßige Ionic-iOS-Theme erhalten sollen, können Sie Ihrem `import` eine supports-Bedingung hinzufügen.

```css
@import '@rdlabo/ionic-theme-ios26/dist/css/default-variables.css' supports(text-wrap: pretty);
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26.css' supports(text-wrap: pretty);
@import '@rdlabo/ionic-theme-ios26/dist/css/md-remove-ios-class-effect.css' supports(text-wrap: pretty);
@import '@rdlabo/ionic-theme-ios26/dist/css/md-ion-list-inset.css' supports(text-wrap: pretty);
```
