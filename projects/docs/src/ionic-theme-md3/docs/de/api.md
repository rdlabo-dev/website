---
title: API
sourceRevision: "51faa9c97da38365c846c28f1bdb410d0615b95328c9f352e726f3d5c2bfd24d"
---

Referenz der von `@rdlabo/ionic-theme-md3` v9.2.0 exportierten JavaScript-API. Die CSS-Einstiegspunkte sind weiterhin in der README dokumentiert.

## Animation

#### `function` mdTransitionAnimation

`(_: HTMLElement, opts: TransitionOptions) => Animation`

Erstellt den Material Design 3-Navigationsübergang für Ionic.

## Dynamische Farben

#### `function` enableDynamicColors

`(options: DynamicColorThemeOptions) => Promise<DynamicColorTheme>`

Wendet das ausgewählte Farbschema auf das Dokumentwurzelelement an. Verwaltet die erzeugten Inline-Eigenschaften und die Dunkelmodusklasse bis zur Bereinigung. Einrichtung, Lebenszyklus und Fallback-Verhalten beschreibt [Dynamische Android-Farben](/docs/dynamic-colors).

#### `function` materialToIonicColors

`(scheme: MaterialColorScheme) => IonicColorVariables`

Wandelt Material-Farbrollen in Ionic-CSS-Variablen um.

#### `function` materialToMd3Colors

`(scheme: Partial<Record<MaterialColorRole, string>>) => IonicColorVariables`

Wandelt die angegebenen Material-Farbrollen in MD3-CSS-Variablen um.

### Öffentliche Farbverträge

Das öffentliche Array `materialColorRoles` führt die unterstützten Rollen auf. `MaterialColorRole` ist der Typ seiner Elemente. Ein `MaterialColorScheme` erfordert die sechs unten angegebenen Rollen; weitere Rollen sind optional.

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

Der Controller ändert den Farbmodus, aktualisiert das Farbschema und gibt seine Listener und die von ihm verwalteten Stile frei.

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

## Zustandssymbole für Schalter

#### `function` applyToggleStateIcons

`(toggle: HTMLElement) => Promise<() => void>`

Fügt einem bereits gerenderten Ionic-Schalter Android Settings-Zustandssymbole hinzu. Die Ein-/Aus-Beschriftungen von Ionic haben Vorrang. Die zurückgegebene Funktion entfernt die Erweiterung. Siehe [Android Settings-Darstellung](/docs/android-settings).
