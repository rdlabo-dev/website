---
title: "API"
sourceRevision: "439f1b1f204c6f8e955732db332883e038ce9feaa98e88e93a7348441a2f8b6a"
---
Référence de l’API JavaScript exportée par `@rdlabo/ionic-theme-ios26` v9.4.1. Les points d’entrée CSS et Sass restent décrits dans le README.

## Effets

#### `function` registerTabBarEffect

`(targetElement: HTMLElement) => registeredEffect | undefined`

Enregistre l’effet de sélection Liquid Glass pour une barre d’onglets Ionic.

#### `function` registerSegmentEffect

`(targetElement: HTMLElement) => registeredEffect | undefined`

Enregistre l’effet de sélection Liquid Glass pour un segment Ionic.

#### `interface` registeredEffect

| Membre        | Type         | Description                                                    |
| ------------- | ------------ | -------------------------------------------------------------- |
| **`destroy`** | `() => void` | Supprime les écouteurs et les éléments d’effet créés lors de l’enregistrement. |

#### `interface` EffectScales

| Propriété         | Type     | Description               |
| ------------ | -------- | ------------------------- |
| **`small`**  | `string` | Petite échelle d’effet.       |
| **`medium`** | `string` | Échelle d’effet moyenne.      |
| **`large`**  | `string` | Grande échelle d’effet.       |
| **`xlarge`** | `string` | Très grande échelle d’effet. |

## Barre d’onglets avec recherche

#### `function` attachTabBarSearchable

`(ionTabBar: HTMLElement, ionFabButton: HTMLElement, ionFooter: HTMLElement) => TabBarSearchableFunction`

Attache la transition de la barre d’onglets avec recherche et renvoie son gestionnaire d’événements.

#### `enum` TabBarSearchableType

| Membre      | Valeur     | Description             |
| ----------- | --------- | ----------------------- |
| **`Enter`** | `"enter"` | Active le mode recherche. |
| **`Leave`** | `"leave"` | Quitte le mode recherche. |

#### `type alias` TabBarSearchableFunction

`(event: Event, type: TabBarSearchableType) => Promise<void>`

## Animations

#### `function` iosTransitionAnimation

`(navEl: HTMLElement, opts: TransitionOptions) => Animation`

Construit la transition de navigation iOS du package.

#### `function` popoverEnterAnimation

`(baseEl: HTMLElement, opts?: any) => Animation`

Construit l’animation d’entrée des popovers iOS.

#### `function` popoverLeaveAnimation

`(baseEl: HTMLElement) => Animation`

Construit l’animation de sortie des popovers iOS.
