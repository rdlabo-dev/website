---
title: "FAQ"
sourceRevision: "80e12f546e0f4958b322488056b54fde485e3405ab7a51e8d2c30cb9035d7906"
---
- Peut-on appeler addIcons dans main.ts ?

Oui. Consultez cette discussion : https://github.com/ionic-team/ionic-framework/issues/28445#issuecomment-1789028722

> Vous pouvez tout à fait les enregistrer dans main.ts ou app.component.ts. Vous pourrez ensuite les utiliser partout dans l’application. Cependant, la taille du bundle initial peut augmenter, car les icônes doivent être chargées dès le départ.

- Les tests unitaires sont-ils pris en charge ?

Si le lanceur de tests n’exécute pas `main.ts`, appelez `addIcons` depuis son fichier d’initialisation ou depuis chaque test. Pour les projets de style Karma qui utilisent encore `src/test.ts`, enregistrez les icônes dans ce fichier ; pour Vitest ou d’autres lanceurs, utilisez leur fichier d’initialisation.

- La liaison du nom d’icône est-elle prise en charge ?

Non, et nous ne prévoyons pas de la prendre en charge. Par exemple, ce type de code est difficile à analyser avant son affichage.

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

Pour ce type de traitement complexe, importez les icônes manuellement.

Si vous liez un nombre limité d’icônes, vous pouvez aussi ajouter un bloc dans votre template en guise d’indication.

```html
<!-- Cette astuce permet à ionic-angular-collect-icons
     d’inclure les icônes, sans jamais afficher ce bloc. -->
@if(false) {
<ion-icon name="home"></ion-icon>
<ion-icon name="people"></ion-icon>
}
```

Ce n’est pas idéal, mais cela permet de conserver l’automatisation.

- Pourquoi ne pas appeler addIcons dans chaque composant ?

Cela réduit les différences produites par la bibliothèque. Je ne souhaitais pas modifier chaque composant à chaque exécution ; je voulais garder les différences aussi petites que possible.
