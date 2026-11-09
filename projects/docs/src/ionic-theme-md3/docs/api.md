---
title: API
---

Reference for the JavaScript API exported by `@rdlabo/ionic-theme-md3` v9.2.0. CSS entry points remain documented in the README.

## Animation

#### `function` mdTransitionAnimation

`(_: HTMLElement, opts: TransitionOptions) => Animation`

Builds the Material Design 3 navigation transition for Ionic.

## Dynamic colors

#### `function` enableDynamicColors

`(options: DynamicColorThemeOptions) => Promise<DynamicColorTheme>`

Applies the selected scheme to the document root. It owns the generated inline properties and dark class until cleanup. See [Android dynamic colors](/docs/dynamic-colors) for setup, lifecycle, and fallback behavior.

#### `function` materialToIonicColors

`(scheme: MaterialColorScheme) => IonicColorVariables`

Maps Material color roles to Ionic CSS variables.

#### `function` materialToMd3Colors

`(scheme: Partial<Record<MaterialColorRole, string>>) => IonicColorVariables`

Maps supplied Material color roles to MD3 CSS variables.

### Public color contracts

The public `materialColorRoles` array lists the supported roles. `MaterialColorRole` is its element type. A `MaterialColorScheme` requires the six roles below; other roles are optional.

```ts
type MaterialColorRole = (typeof materialColorRoles)[number];
interface MaterialColorScheme extends Partial<Record<MaterialColorRole, string>> {
  primary: string;
  secondary: string;
  tertiary: string;
  error: string;
  surface: string;
  onSurface: string;
}
type DynamicColorScheme = {
  available: false;
  systemDark: boolean;
} | {
  available: true;
  systemDark: boolean;
  light: MaterialColorScheme;
  dark: MaterialColorScheme;
};
type ColorMode = 'system' | 'light' | 'dark';
type IonicColorVariables = Record<string, string>;
```

The controller changes color mode, refreshes the scheme, and releases its listeners and owned styles.

```ts
interface DynamicColorThemeOptions {
  getScheme: () => Promise<DynamicColorScheme>;
  listen?: (listener: () => void) => Promise<{
    remove(): Promise<void>;
  }>;
  mode?: ColorMode;
  document?: Document;
  onError?: (error: unknown) => void;
}
interface DynamicColorTheme {
  setMode(mode: ColorMode): void;
  refresh(): Promise<void>;
  destroy(): Promise<void>;
}
```

## Toggle state icons

#### `function` applyToggleStateIcons

`(toggle: HTMLElement) => Promise<() => void>`

Adds Android Settings state icons to one rendered Ionic toggle. Ionic’s on/off labels take priority. The returned function removes the enhancement. See [Android Settings appearance](/docs/android-settings).
