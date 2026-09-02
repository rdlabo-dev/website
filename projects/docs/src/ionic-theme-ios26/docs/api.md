---
title: API
---

Reference for the JavaScript API exported by `@rdlabo/ionic-theme-ios26` v9.1.0. CSS and Sass entry points remain documented in the README.

## Effects

#### `function` registerTabBarEffect

`(targetElement: HTMLElement) => registeredEffect | undefined`

Registers the liquid-glass selection effect for an Ionic tab bar.

#### `function` registerSegmentEffect

`(targetElement: HTMLElement) => registeredEffect | undefined`

Registers the liquid-glass selection effect for an Ionic segment.

#### `interface` registeredEffect

| Member        | Type         | Description                                                    |
| ------------- | ------------ | -------------------------------------------------------------- |
| **`destroy`** | `() => void` | Removes listeners and effect elements created by registration. |

#### `interface` EffectScales

| Prop         | Type     | Description               |
| ------------ | -------- | ------------------------- |
| **`small`**  | `string` | Small effect scale.       |
| **`medium`** | `string` | Medium effect scale.      |
| **`large`**  | `string` | Large effect scale.       |
| **`xlarge`** | `string` | Extra-large effect scale. |

## Searchable tab bar

#### `function` attachTabBarSearchable

`(ionTabBar: HTMLElement, ionFabButton: HTMLElement, ionFooter: HTMLElement) => TabBarSearchableFunction`

Attaches the searchable tab-bar transition and returns its event handler.

#### `enum` TabBarSearchableType

| Member      | Value     | Description             |
| ----------- | --------- | ----------------------- |
| **`Enter`** | `"enter"` | Enters searchable mode. |
| **`Leave`** | `"leave"` | Leaves searchable mode. |

#### `type alias` TabBarSearchableFunction

`(event: Event, type: TabBarSearchableType) => Promise<void>`

## Animations

#### `function` iosTransitionAnimation

`(navEl: HTMLElement, opts: TransitionOptions) => Animation`

Builds the package's iOS navigation transition.

#### `function` popoverEnterAnimation

`(baseEl: HTMLElement, opts?: any) => Animation`

Builds the iOS popover enter animation.

#### `function` popoverLeaveAnimation

`(baseEl: HTMLElement) => Animation`

Builds the iOS popover leave animation.
