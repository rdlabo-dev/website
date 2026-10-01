---
title: "Erste Schritte"
sourceRevision: "3f6662f334a27de4d8bcde24e0c9c7f864782efe3edcaf0bec4d000e5c476ead"
---
# @rdlabo/ionic-angular-scroll-header

Direktiven zum Ausblenden und Einblenden von Ionic-Headern beim Scrollen.

## Installation

```bash
npm install @rdlabo/ionic-angular-scroll-header
```

Importieren Sie das CSS der Direktiven global, beispielsweise in `styles.css`:

```css
@import '@rdlabo/ionic-angular-scroll-header/css/scroll-header.directive.css';
```

Beim virtuellen Scrollen mit CDK legen Sie außerdem einen begrenzten Viewport fest:

```css
cdk-virtual-scroll-viewport {
  width: 100%;
  height: 100%;
  .cdk-virtual-scroll-content-wrapper {
    padding-top: inherit;
  }
}
```

## Erster Erfolg: IonContent

Erstellen Sie eine Seite mit ausreichend scrollbaren Zeilen und einem Header, der den Viewport verlassen kann. Das vollständige Beispiel finden Sie unter [IonContent](https://docs.rdlabo.dev/projects/ionic-angular-scroll-header/docs/ion-content).

Scrollen Sie nach unten: Der Inhaltsheader wird ausgeblendet. Scrollen Sie nach oben: Er erscheint wieder. Safe-Area-Header und dauerhaft sichtbare native Header werden unter [Sicherer Bereich](https://docs.rdlabo.dev/projects/ionic-angular-scroll-header/docs/safe-area) beschrieben. CDK-Viewports verwenden [Virtuelles Scrollen](https://docs.rdlabo.dev/projects/ionic-angular-scroll-header/docs/virtual-scroll).

## Nach Header-Layout auswählen

| Ziel | Anleitung |
| --- | --- |
| Header auf IonContent ausblenden und einblenden | [IonContent](https://docs.rdlabo.dev/projects/ionic-angular-scroll-header/docs/ion-content) |
| Header mit virtuellem Scrollen über CDK abstimmen | [Virtuelles Scrollen](https://docs.rdlabo.dev/projects/ionic-angular-scroll-header/docs/virtual-scroll) |
| Einen nativen Header dauerhaft sichtbar halten | [Sicherer Bereich](https://docs.rdlabo.dev/projects/ionic-angular-scroll-header/docs/safe-area) |

<!-- rdlabo-docs-omit -->
**Vollständige Dokumentation:** [https://docs.rdlabo.dev/projects/ionic-angular-scroll-header](https://docs.rdlabo.dev/projects/ionic-angular-scroll-header)
<!-- /rdlabo-docs-omit -->
