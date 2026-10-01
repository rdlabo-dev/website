---
title: "FAQ"
sourceRevision: "80e12f546e0f4958b322488056b54fde485e3405ab7a51e8d2c30cb9035d7906"
---
- Kann addIcons in main.ts ausgeführt werden?

Ja. Siehe diesen Issue: https://github.com/ionic-team/ionic-framework/issues/28445#issuecomment-1789028722

> Sie können die Symbole in main.ts oder app.component.ts registrieren und anschließend überall in Ihrer Anwendung verwenden. Die Größe des initialen Bundles kann jedoch zunehmen, da die Symbole vorab geladen werden müssen.

- Werden Unit-Tests unterstützt?

Wenn der Testrunner `main.ts` nicht ausführt, rufen Sie `addIcons` aus der Test-Setup-Datei oder aus einzelnen Tests auf. Registrieren Sie die Symbole bei Karma-Projekten, die noch `src/test.ts` verwenden, dort. Verwenden Sie für Vitest oder andere Runner deren jeweilige Setup-Datei.

- Werden gebundene Symbolnamen unterstützt?

Nein; eine Unterstützung ist auch nicht geplant. Bei Code wie dem folgenden lässt sich beispielsweise erst bei der Anzeige zuverlässig nachvollziehen, welches Symbol verwendet wird.

```ts
@Component({
  selector: "app-example",
  template: ` <ion-icon [name]="iconName"></ion-icon> `,
})
export class ExampleComponent {
  iconName = "add";

  ionViewWillEnter() {
    setTimeout(() => {
      this.iconName = "remove";
    }, 1000);
  }
}
```

Importieren Sie bei einer solchen komplexen Verarbeitung die Symbole manuell.

Alternativ können Sie bei einer begrenzten Zahl gebundener Symbole einen Block als „Hinweis“ in Ihr Template einfügen.

```html
<!-- Dieser Trick sorgt dafür, dass ionic-angular-collect-icons
     die Icons einbezieht; der Block wird jedoch niemals gerendert. -->
@if(false) {
<ion-icon name="home"></ion-icon>
<ion-icon name="people"></ion-icon>
}
```

Das ist nicht ideal, hilft aber dabei, die Automatisierung beizubehalten.

- Warum nicht addIcons in jeder Komponente aufrufen?

Damit sollen die durch die Bibliothek erzeugten Änderungen möglichst klein bleiben. Ich wollte nicht, dass sich bei jedem Durchlauf jede Komponente ändert, sondern den Diff so klein wie möglich halten.
