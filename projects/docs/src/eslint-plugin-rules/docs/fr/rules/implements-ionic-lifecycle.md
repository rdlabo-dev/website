---
title: "implements-ionic-lifecycle"
sourceRevision: "04ce3fd4069d74289379764632ea85cb35a8d0a563d801e96fb0e6cc9c555106"
---
# @rdlabo/rules/implements-ionic-lifecycle

> Ce plugin recommande d’implémenter les interfaces de cycle de vie Ionic.
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).
> - ✒️ L’option `--fix` de la [ligne de commande](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) peut corriger automatiquement certains problèmes signalés par cette règle.

Ionic fournit des méthodes de cycle de vie de framework comme `ionViewWillEnter` et `ionViewDidLeave`. Lorsqu’un Component déclare ces méthodes, il doit aussi implémenter l’interface correspondante (`ViewWillEnter`, `ViewDidEnter`, `ViewWillLeave`, `ViewDidLeave`) pour que TypeScript vérifie le contrat de types. Cette règle impose cette association et peut corriger automatiquement la clause `implements`.

## Détails de la règle

Cette règle vérifie les classes décorées avec `@Component`. Elle recherche les définitions de méthodes nommées d’après les méthodes de cycle de vie Ionic :

- `ionViewWillEnter` -> `ViewWillEnter`
- `ionViewDidEnter` -> `ViewDidEnter`
- `ionViewWillLeave` -> `ViewWillLeave`
- `ionViewDidLeave` -> `ViewDidLeave`

Si une méthode est présente et que son interface correspondante manque, la règle la signale. Pour corriger une interface manquante, elle remplace toute la clause `implements` par les interfaces Ionic correspondant aux méthodes utilisées. Cela peut supprimer des interfaces sans rapport, comme `OnInit` ; examinez donc la correction et rétablissez toute interface non Ionic encore nécessaire à la classe. Si toutes les interfaces requises sont déjà présentes, les interfaces de cycle de vie supplémentaires ne sont ni signalées ni supprimées.

- La règle ne vérifie pas les classes qui ne sont pas des Components.
- Si le corps de la classe est vide mais qu’elle implémente des interfaces de cycle de vie, la règle supprime la clause `implements` obsolète.
- La règle ne signale qu’une fois chaque groupe corrigeable pour éviter les corrections qui se chevauchent.

## Exemples

### Incorrect

```ts
@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage {
  ionViewWillEnter() {}
  ionViewWillLeave() {}
}
```

```ts
@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage implements ViewDidEnter, ViewDidLeave {
  ionViewWillEnter() {}
  ionViewWillLeave() {}
}
```

### Correct

```ts
import { ViewWillEnter, ViewWillLeave } from '@ionic/angular';

@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage implements ViewWillEnter, ViewWillLeave {
  ionViewWillEnter() {}
  ionViewWillLeave() {}
}
```

```ts
@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage implements ViewDidEnter, ViewDidLeave {
  ionViewDidEnter() {}
  ionViewDidLeave() {}
}
```

## Options

Cette règle n’a pas d’options.

## Quand l’activer

Activez cette règle dans tout projet Ionic Angular. Elle maintient la précision de la clause `implements` lors de l’ajout, du renommage ou de la suppression de méthodes de cycle de vie et fonctionne bien avec `--fix`.

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/implements-ionic-lifecycle.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/implements-ionic-lifecycle.ts)
