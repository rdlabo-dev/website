---
title: "deny-element"
sourceRevision: "15b7371e233c9c398e7eb47c237103ff023955d473ebcb929aa6a95051241a62"
---
# @rdlabo/rules/deny-element

> Ce plugin interdit l’utilisation de certaines balises HTML.
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).

Cette règle empêche l’utilisation d’éléments précis dans les modèles Angular. Elle sert couramment à interdire les composants de superposition intégrés comme `<ion-modal>`, `<ion-popover>`, `<ion-toast>`, `<ion-alert>`, `<ion-loading>`, `<ion-picker>` et `<ion-action-sheet>`, qui doivent être présentés via des méthodes de lancement ou des services dédiés plutôt que déclarés dans le modèle.

## Détails de la règle

La règle s’exécute sur les fichiers de modèles `.html` et signale tout élément dont le nom de balise figure dans la liste `elements` configurée. Elle parcourt l’AST du modèle, y compris la syntaxe de contrôle Angular comme `@if`, `@for`, `@else` et les branches imbriquées `then` / `else`.

- Les fichiers `.spec.html` sont ignorés pour ne pas affecter les tests.
- Sans option explicite, la règle utilise sa liste par défaut d’éléments de superposition Ionic. Lorsqu’un objet d’options est fourni, son schéma exige un tableau `elements`.

## Options

```json
{
  "rules": {
    "@rdlabo/rules/deny-element": [
      "error",
      {
        "elements": ["ion-modal", "ion-popover", "ion-toast", "ion-alert", "ion-loading", "ion-picker", "ion-action-sheet"]
      }
    ]
  }
}
```

### `elements`

- Type : `string[]`
- Valeur par défaut : `ion-modal`, `ion-popover`, `ion-toast`, `ion-alert`, `ion-loading`, `ion-picker`, `ion-action-sheet`

Tableau des noms de balises à interdire. La règle compare ces noms au type de nœud `Element` de l’AST de modèle Angular ; elle vérifie donc l’élément lui-même et sa présence dans les branches de contrôle.

## Exemples

### Incorrect

```html
<ion-modal></ion-modal>

<div>
  <ion-toast></ion-toast>
  <ion-alert></ion-alert>
</div>
```

```html
@if (showModal) {
<ion-modal>Modal content</ion-modal>
}
```

### Correct

```html
<ion-button (click)="presentModal()">Open</ion-button>
```

```html
@for (item of items; track item.id) {
<ion-card>
  <ion-card-header>{{ item.name }}</ion-card-header>
</ion-card>
}
```

## Quand l’activer

Activez cette règle dans les projets qui utilisent le modèle de lanceur pour les superpositions. Elle s’associe à [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md) et [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md) pour garder la logique des modales et des superpositions hors du modèle.

## Voir aussi

- [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md)
- [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md)

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/deny-element.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/deny-element.ts)
