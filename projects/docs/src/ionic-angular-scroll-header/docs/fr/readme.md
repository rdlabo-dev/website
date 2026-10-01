---
title: "Premiers pas"
sourceRevision: "3f6662f334a27de4d8bcde24e0c9c7f864782efe3edcaf0bec4d000e5c476ead"
---
# @rdlabo/ionic-angular-scroll-header

Directives qui masquent et révèlent les en-têtes Ionic pendant le défilement.

## Installation

```bash
npm install @rdlabo/ionic-angular-scroll-header
```

Importez globalement le CSS de la directive, par exemple dans `styles.css` :

```css
@import '@rdlabo/ionic-angular-scroll-header/css/scroll-header.directive.css';
```

Si vous utilisez le défilement virtuel CDK, définissez également un viewport de taille délimitée :

```css
cdk-virtual-scroll-viewport {
  width: 100%;
  height: 100%;
  .cdk-virtual-scroll-content-wrapper {
    padding-top: inherit;
  }
}
```

## Premier résultat : IonContent

Créez une page contenant suffisamment de lignes pour défiler et un en-tête pouvant sortir du viewport. Consultez l’exemple complet dans [IonContent](https://docs.rdlabo.dev/projects/ionic-angular-scroll-header/docs/ion-content).

Faites défiler vers le bas : l’en-tête du contenu disparaît. Faites défiler vers le haut : il réapparaît. Les zones de sécurité et les en-têtes natifs toujours visibles sont décrits dans [Zone de sécurité](https://docs.rdlabo.dev/projects/ionic-angular-scroll-header/docs/safe-area). Les viewports CDK utilisent [Défilement virtuel](https://docs.rdlabo.dev/projects/ionic-angular-scroll-header/docs/virtual-scroll).

## Choisir selon la disposition de l’en-tête

| Objectif | Guide |
| --- | --- |
| Masquer et révéler les en-têtes sur IonContent | [IonContent](https://docs.rdlabo.dev/projects/ionic-angular-scroll-header/docs/ion-content) |
| Coordonner les en-têtes avec le défilement virtuel CDK | [Défilement virtuel](https://docs.rdlabo.dev/projects/ionic-angular-scroll-header/docs/virtual-scroll) |
| Garder un en-tête natif toujours visible | [Zone de sécurité](https://docs.rdlabo.dev/projects/ionic-angular-scroll-header/docs/safe-area) |

<!-- rdlabo-docs-omit -->
**Documentation complète :** [https://docs.rdlabo.dev/projects/ionic-angular-scroll-header](https://docs.rdlabo.dev/projects/ionic-angular-scroll-header)
<!-- /rdlabo-docs-omit -->
