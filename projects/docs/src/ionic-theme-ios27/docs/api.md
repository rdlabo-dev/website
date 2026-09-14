---
title: API
---

Reference for the JavaScript API exported by `@rdlabo/ionic-theme-ios27` v0.1.0. CSS and Sass entry points remain documented in the README.

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

## Searchbar

#### `function` supportSeachbarCancelButtonIcon

`(searchbar: HTMLIonSearchbarElement) => SearchbarCancelButtonIconSupport`

Temporary rendering support for Ionic's `cancelButtonIcon` in iOS mode. Import `Seachbar` with this spelling, as exported by the package. Pass an initialized element.

#### `interface` SearchbarCancelButtonIconSupport

| Member | Type | Description |
| --- | --- | --- |
| **`refresh`** | `() => void` | Re-read `cancelButtonIcon` after changing the JavaScript property. |
| **`destroy`** | `() => void` | Remove the observer and inserted icon, restoring text content. |

## Native UI Shell (Experimental)

Import these APIs and types from `@rdlabo/ionic-theme-ios27/native`. See the [Native UI Shell guide](/docs/native-ui-shell) for requirements and fallback behavior.

#### `function` enableNativeUIShell

`() => Promise<NativeUIShellHandle>`

Call once at startup. Repeated calls share the active runtime. Unsupported environments return a handle in the Web state.

#### `interface` NativeUIShellHandle

| Member | Type | Description |
| --- | --- | --- |
| **`getStatus`** | `() => NativeUIShellStatus` | Read the current status. |
| **`destroy`** | `() => Promise<void>` | Restore Web rendering and release native controls and the runtime. |

#### `interface` NativeUIShellStatus

```ts
interface NativeUIShellStatus {
  state: 'web' | 'native' | 'stopped';
  projected: number;
  updates: number;
  reason?: string;
}
```

`projected` counts projected controls, `updates` counts updates, and `reason` explains Web fallback or stopping. A `stopped` runtime does not automatically reconnect after a bridge failure; destroy the handle before enabling again.

#### `type alias` NativeUIShellComponent

`'ion-button' | 'ion-buttons' | 'ion-back-button' | 'ion-menu-button' | 'ion-tab-bar' | 'ion-segment' | 'ion-fab'`

Union of component tags handled by the runtime. See the guide for individual eligibility requirements.
