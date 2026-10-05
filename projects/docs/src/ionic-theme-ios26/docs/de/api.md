---
title: "API"
sourceRevision: "652de45684635ff0a9f30ed5aa6326a7c29122a7dd0c370754a1825bcca165e7"
---
Referenz der von `@rdlabo/ionic-theme-ios26` v9.4.2 exportierten JavaScript-API. CSS- und Sass-Einstiegspunkte sind weiterhin im README dokumentiert.

## Effekte

#### `function` registerTabBarEffect

`(targetElement: HTMLElement) => registeredEffect | undefined`

Registriert den Liquid-Glass-Auswahleffekt für eine Ionic-Tab-Leiste.

#### `function` registerSegmentEffect

`(targetElement: HTMLElement) => registeredEffect | undefined`

Registriert den Liquid-Glass-Auswahleffekt für ein Ionic-Segment.

#### `interface` registeredEffect

| Mitglied        | Typ         | Beschreibung                                                    |
| ------------- | ------------ | -------------------------------------------------------------- |
| **`destroy`** | `() => void` | Entfernt Listener und Effektelemente, die durch die Registrierung erzeugt wurden. |

#### `interface` EffectScales

| Eigenschaft         | Typ     | Beschreibung               |
| ------------ | -------- | ------------------------- |
| **`small`**  | `string` | Kleine Effektskalierung.       |
| **`medium`** | `string` | Mittlere Effektskalierung.      |
| **`large`**  | `string` | Große Effektskalierung.       |
| **`xlarge`** | `string` | Sehr große Effektskalierung. |

## Durchsuchbare Tab-Leiste

#### `function` attachTabBarSearchable

`(ionTabBar: HTMLElement, ionFabButton: HTMLElement, ionFooter: HTMLElement) => TabBarSearchableFunction`

Bindet den Übergang für eine durchsuchbare Tab-Leiste an und gibt dessen Ereignishandler zurück.

#### `enum` TabBarSearchableType

| Mitglied      | Wert     | Beschreibung             |
| ----------- | --------- | ----------------------- |
| **`Enter`** | `"enter"` | Wechselt in den Suchmodus. |
| **`Leave`** | `"leave"` | Verlässt den Suchmodus. |

#### `type alias` TabBarSearchableFunction

`(event: Event, type: TabBarSearchableType) => Promise<void>`

## Animationen

#### `function` iosTransitionAnimation

`(navEl: HTMLElement, opts: TransitionOptions) => Animation`

Erstellt den iOS-Navigationsübergang des Pakets.

#### `function` popoverEnterAnimation

`(baseEl: HTMLElement, opts?: any) => Animation`

Erstellt die iOS-Popover-Eintrittsanimation.

#### `function` popoverLeaveAnimation

`(baseEl: HTMLElement) => Animation`

Erstellt die iOS-Popover-Austrittsanimation.
