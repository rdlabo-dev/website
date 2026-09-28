---
title: API
---

Reference for the JavaScript API exported by `@rdlabo/ionic-theme-ios27` v1.2.0-3. CSS and Sass entry points remain documented in the README.

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

#### `function` withNativeUIShellTransition

`(builder: AnimationBuilder) => AnimationBuilder`

Wraps an Ionic navigation animation builder to coordinate native control retirement, swipe progress, and cancellation while preserving the returned animation. Exported from the package root and `/vertical-bars`. Register it as `navAnimation`; use a fresh `Animation` for each navigation. The package's `iosTransitionAnimation` already includes this adapter. See [existing-theme setup](/docs/iphone-duo-with-original-theme) for Ionic's default and custom builders.

#### `function` iosTransitionAnimation

`(navEl: HTMLElement, opts: TransitionOptions) => Animation`

Builds the package's iOS navigation transition.

#### `function` setConfig

`(config: Partial<IosTransitionConfig>) => void`

Sets the page-transition radius. It defaults to `0`; native apps can supply the measured WebView radius.

#### `interface` IosTransitionConfig

| Prop         | Type     | Description                      |
| ------------ | -------- | -------------------------------- |
| **`radius`** | `number` | Page-transition corner radius.   |

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

`(options?: NativeUIShellOptions) => Promise<NativeUIShellHandle>`

Call once at startup. Repeated calls with the same configuration share the active runtime; a different configuration while it is active throws. Unsupported environments return a handle in the Web state. Set `enabled: false` to stop active projection and use Web controls.

#### `function` configureNativeTransition

`() => Promise<WebViewMetrics>`

Reads the native WebView radius and applies it to page transitions without enabling native controls. On other platforms, the radius is `0`.

#### `interface` NativeUIShellOptions

| Prop           | Type                    | Description                                              |
| -------------- | ----------------------- | -------------------------------------------------------- |
| **`enabled`**  | `boolean`               | Enable native projection globally; defaults to `true`.   |
| **`controls`** | `NativeUIShellControls` | When set, only controls explicitly set to `true` qualify. |

#### `interface` NativeUIShellControls

| Prop          | Type      | Description                              |
| ------------- | --------- | ---------------------------------------- |
| **`tabs`**    | `boolean` | Tab bars and native search.              |
| **`toolbar`** | `boolean` | Toolbar, back, and menu buttons.         |
| **`segment`** | `boolean` | Segments.                                |
| **`fab`**     | `boolean` | Floating action buttons.                |

#### `interface` NativeUIShellHandle

| Member | Type | Description |
| --- | --- | --- |
| **`getStatus`** | `() => NativeUIShellStatus` | Read the current status. |
| **`suspend`** | `() => Promise<NativeUIShellSuspension>` | Restore controls to the Web until the lease is resumed. |
| **`destroy`** | `() => Promise<void>` | Restore Web rendering and release native controls and the runtime. |

#### `interface` NativeUIShellSuspension

| Member | Type | Description |
| --- | --- | --- |
| **`resume`** | `() => Promise<void>` | Release this suspension. Native projection resumes after all active suspensions are released. |

#### `interface` WebViewMetrics

| Prop         | Type     | Description                 |
| ------------ | -------- | --------------------------- |
| **`radius`** | `number` | Native WebView corner radius. |

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

## iPhone Duo / Vertical Control Area (Experimental)

Import these APIs from `@rdlabo/ionic-theme-ios27/vertical-bars` or `@rdlabo/ionic-theme-ios27/native`. The standalone entry point works without the iOS 27 theme or the full Native UI Shell. See [iPhone Duo support](/docs/iphone-duo) for setup, toolchain requirements, and Web fallback.

#### `function` enableVerticalControlArea

`() => Promise<VerticalControlAreaHandle>`

Starts the runtime for controls in the vertical area only. Start either this runtime or `enableNativeUIShell()`. Repeated calls with the same configuration share it; a different active configuration throws.

#### `function` setVerticalControlAreaPlacement

`(placement: VerticalBarEdge | VerticalBarPlacement, rtl?: boolean) => void`

Applies the application's chosen placement to CSS and Web/native controls after `ion-app` is mounted. Logical edges resolve through the nearest `dir` attribute or explicit `rtl`. Pass `null` to restore ordinary layout.

#### `interface` VerticalControlAreaHandle

Extends `NativeUIShellHandle` with `setPlacement`, the same function as `setVerticalControlAreaPlacement`.

| Member | Type | Description |
| --- | --- | --- |
| **`setPlacement`** | `(placement: VerticalBarEdge \| VerticalBarPlacement, rtl?: boolean) => void` | Apply placement to Web and native controls. |

#### `type alias` VerticalBarEdge

`'leading' | 'trailing' | null`

Logical edge in the reading direction; `null` means no vertical rail.

#### `interface` VerticalBarPlacement

| Prop | Type | Description |
| --- | --- | --- |
| **`edge`** | `VerticalBarEdge` | Logical rail edge. |
| **`inset`** | `number` | Explicit rail width in CSS pixels; omitted to use CSS safe-area rules. |
| **`nativeEdge`** | `VerticalBarEdge` | Native logical edge supplied by the application. Null or an unregistered edge uses a Web rail in verticalBarsOnly mode, or the ordinary Native UI Shell layout otherwise. Omission preserves the last value. |

#### `module` IonicNativeUIShell

The bundled Capacitor plugin provides WebView metrics for rendering. It has no Web implementation; guard calls with `Capacitor.getPlatform() === 'ios'`. Use `@erkamyaman/capacitor-foldable` in the application for hinge state and bar placement. See [iPhone Duo support](/docs/iphone-duo).

| Member | Type | Description |
| --- | --- | --- |
| **`getWebViewMetrics`** | `() => Promise<WebViewMetrics>` | Read the effective WebView corner radius. |
| **`addListener`** | `(name: 'webViewMetricsChange', listener: (event: WebViewMetrics) => void) => Promise<PluginListenerHandle>` | Subscribe to WebView metric changes; remove the listener when finished. |

Bridge snapshot and activation methods are internal implementation details. The former `DeviceLayout`, `HingeStatus`, `getDeviceLayout()`, and device-layout monitoring APIs have been removed.
