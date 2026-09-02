---
title: API
---

`@rdlabo/ionic-theme-ios26` v9.1.0 が公開するJavaScript APIのリファレンスです。CSSとSassのentry pointはREADMEで説明します。

## Effect

#### `function` registerTabBarEffect

`(targetElement: HTMLElement) => registeredEffect | undefined`

Ionic Tab BarにLiquid Glassの選択effectを登録します。

#### `function` registerSegmentEffect

`(targetElement: HTMLElement) => registeredEffect | undefined`

Ionic SegmentにLiquid Glassの選択effectを登録します。

#### `interface` registeredEffect

| Member        | Type         | Description                                            |
| ------------- | ------------ | ------------------------------------------------------ |
| **`destroy`** | `() => void` | 登録時に作成したlistenerとeffect elementを削除します。 |

#### `interface` EffectScales

| Prop         | Type     | Description                     |
| ------------ | -------- | ------------------------------- |
| **`small`**  | `string` | Small effectのscaleです。       |
| **`medium`** | `string` | Medium effectのscaleです。      |
| **`large`**  | `string` | Large effectのscaleです。       |
| **`xlarge`** | `string` | Extra Large effectのscaleです。 |

## Searchable Tab Bar

#### `function` attachTabBarSearchable

`(ionTabBar: HTMLElement, ionFabButton: HTMLElement, ionFooter: HTMLElement) => TabBarSearchableFunction`

Searchable Tab Barのtransitionを設定し、event handlerを返します。

#### `enum` TabBarSearchableType

| Member      | Value     | Description                   |
| ----------- | --------- | ----------------------------- |
| **`Enter`** | `"enter"` | Searchable modeへ入ります。   |
| **`Leave`** | `"leave"` | Searchable modeから戻ります。 |

#### `type alias` TabBarSearchableFunction

`(event: Event, type: TabBarSearchableType) => Promise<void>`

## Animation

#### `function` iosTransitionAnimation

`(navEl: HTMLElement, opts: TransitionOptions) => Animation`

PackageのiOS navigation transitionを生成します。

#### `function` popoverEnterAnimation

`(baseEl: HTMLElement, opts?: any) => Animation`

iOS Popoverのenter animationを生成します。

#### `function` popoverLeaveAnimation

`(baseEl: HTMLElement) => Animation`

iOS Popoverのleave animationを生成します。
