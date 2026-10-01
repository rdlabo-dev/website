---
title: "prefer-disable-handler"
sourceRevision: "43d51116211dd913b8385aafc04fe7deb330a753afb578d4f9a83f90cae4edeb"
---
# @rdlabo/rules/prefer-disable-handler

> Exiger une méthode enveloppe (par défaut : disableHandler($event, work)) sur les liaisons élément/événement configurées pour empêcher les doubles appuis pendant un travail asynchrone
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).

Lorsqu’un utilisateur appuie sur un bouton qui déclenche un travail asynchrone, le contrôle doit être désactivé jusqu’à sa fin. Sinon, un second appui peut déclencher l’action à nouveau. Cette règle impose la syntaxe d’appel enveloppe pour les liaisons `(event)` configurées. L’implémentation de l’enveloppe doit désactiver l’interface et traiter correctement la valeur de travail.

## Détails de la règle

La règle s’exécute sur les modèles Angular. Pour chaque `BoundEvent` correspondant à une cible configurée, l’expression du gestionnaire doit appeler une méthode enveloppe avec au moins deux arguments :

1. Le paramètre d’événement (`$event` par défaut).
2. Une expression de travail passée à l’enveloppe.

Par exemple, `(click)="vm.disableHandler($event, vm.save())"` est valide. `(click)="vm.save()"` est signalé. La règle n’inspecte pas le type du deuxième argument et ne vérifie pas qu’il renvoie une Promise.

La règle autorise également les appels directs à des méthodes d’événement comme `$event.stopPropagation()` et `$event.preventDefault()` (configurable avec `allowEventMethods`).

Par défaut, la règle cible :

- `click` sur `<ion-button>` et `<button>`
- `submit` sur tout élément

Elle ignore les fichiers `.spec.html`.

## Options

```json
{
  "rules": {
    "@rdlabo/rules/prefer-disable-handler": [
      "error",
      {
        "method": "disableHandler",
        "eventParam": "$event",
        "targets": [{ "events": ["click"], "elements": ["ion-button", "button"] }, { "events": ["submit"] }],
        "allowEventMethods": ["stopPropagation", "preventDefault"]
      }
    ]
  }
}
```

### `method`

- Type : `string`
- Valeur par défaut : `"disableHandler"`

Nom de la méthode enveloppe attendu dans l’expression du gestionnaire.

### `eventParam`

- Type : `string`
- Valeur par défaut : `"$event"`

Premier argument à passer à la méthode enveloppe.

### `targets`

- Type : `Target[]`
- Valeur par défaut : `[{ events: ['click'], elements: ['ion-button', 'button'] }, { events: ['submit'] }]`

Chaque cible précise quels événements et éléments exigent l’enveloppe. `elements` est facultatif ; lorsqu’il est omis, la règle s’applique à tout élément pour ces événements.

### `allowEventMethods`

- Type : `string[]`
- Valeur par défaut : `["stopPropagation", "preventDefault"]`

Méthodes d’événement autorisées sans enveloppe. Par exemple, `(click)="$event.stopPropagation()"` est valide.

## Exemples

### Incorrect

```html
<ion-button (click)="vm.save()">Save</ion-button>
```

```html
<form (submit)="vm.save()"></form>
```

```html
<ion-button (click)="vm.disableHandler(vm.save())">missing $event</ion-button>
```

### Correct

```html
<ion-button (click)="vm.disableHandler($event, vm.save())">Save</ion-button>
```

```html
<form (submit)="vm.disableHandler($event, vm.save())">
  <ion-button type="submit">Save</ion-button>
</form>
```

```html
<ion-button (click)="$event.stopPropagation()"></ion-button>
```

### Configuration personnalisée

```html
<ion-input (ionComplete)="vm.disableHandler($event, vm.join())"></ion-input>
```

```json
{
  "rules": {
    "@rdlabo/rules/prefer-disable-handler": [
      "error",
      {
        "targets": [{ "events": ["ionComplete"], "elements": ["ion-input"] }]
      }
    ]
  }
}
```

## Quand l’activer

Activez cette règle dans les projets Ionic/Angular où les actions utilisateur déclenchent des opérations asynchrones comme des appels API, une navigation ou la présentation de modales. Elle s’associe à [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md) et [`@rdlabo/rules/deny-element`](./deny-element.md) pour centraliser la logique des superpositions.

## Voir aussi

- [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md)
- [`@rdlabo/rules/deny-element`](./deny-element.md)

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/prefer-disable-handler.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/prefer-disable-handler.ts)
