---
title: "Making Ionic Themes Easier to Override: Rethinking !important and Shadow Parts in v9.1.0"
description: "How v9.1.0 of the iOS 26 and Material Design 3 themes makes Ionic styles easier to override by reducing !important, preferring public CSS custom properties, and fixing grouped Inset Lists."
zennSlug: ionic-theme-reusable-css-v9-1
emoji: "🧩"
publishedDate: "2026-09-04"
originalUrl: "https://zenn.dev/rdlabo/articles/ionic-theme-reusable-css-v9-1"
relatedLibraries:
  - ionic-theme-ios26
  - ionic-theme-md3
---

Consider a single `ion-radio-group` wrapping two Inset Lists. With the following natural Ionic markup, the Lists had a bug that broke their rounded corners and dividers.

```html
<ion-radio-group>
  <ion-list inset="true">...</ion-list>
  <ion-list inset="true">...</ion-list>
</ion-radio-group>
```

The starting point was [Issue #129](https://github.com/rdlabo-dev/ionic-theme-ios26/issues/129), reported by a user. Following the minimal reproduction revealed that simply fixing the rounded corners would not be enough. The theme's CSS had implicitly treated the DOM structure used in the demo as the one correct structure.

Users do not build their applications exactly like a theme demo. They combine standard Ionic components and, when necessary, adjust the appearance with application-level CSS. This bug prompted me to review whether the themes properly preserved that freedom throughout their styles.

I have therefore released `v9.1.0` of both the iOS 26 and Material Design 3 themes.

- [`@rdlabo/ionic-theme-ios26` v9.1.0](https://github.com/rdlabo-dev/ionic-theme-ios26/releases/tag/v9.1.0)
- [`@rdlabo/ionic-theme-md3` v9.1.0](https://github.com/rdlabo-dev/ionic-theme-md3/releases/tag/v9.1.0)

This update brings the following changes for users:

- Theme styles are easier to override from application CSS
- Ionic's standard `color` attribute no longer loses to the theme's default colors
- A Radio Group can wrap multiple Inset Lists without breaking their appearance
- Input and Textarea counters now fit correctly inside Inset Lists

This article explains how one Issue led me to reconsider the overall “strength” of the themes' CSS.

## Supporting a Radio Group around multiple Lists

Within an Inset List, the themes treat `ion-item-group`, `ion-reorder-group`, `ion-accordion-group`, and `ion-radio-group` as the same kind of structured Group.

Previously, the selector inspected the entire ancestor chain to avoid applying another set of rounded corners to a nested Group.

```scss
// Before
:is(#{$groups}):not(:is(#{$groups}) :is(#{$groups})) {
  // ...
}
```

In the structure from Issue #129, however, the outer `ion-radio-group` wraps two `ion-list` elements. Each List's `ion-item-group` therefore also became a “descendant of another Group,” excluding styles that it still needed.

The new selector no longer considers which elements appear outside the List. It targets only Groups that are direct children of each List.

```scss
// After
> :is(#{$groups}) {
  // ...
}
```

With this selector, Groups in each List receive their rounded corners and dividers even when an `ion-radio-group` wraps the Lists. Because it does not depend on the structure of the entire page, I could apply the same fix to both the iOS 26 and MD3 themes.

Reviewing the code from this perspective uncovered other places where the styles restricted the freedom of applications using the themes.

## Making the CSS easier for applications to override

### Keeping only the one necessary `!important`

A theme needs to deliver a consistent appearance as soon as it is loaded. If its CSS is too strong, however, even a small application-specific adjustment requires a stronger selector and yet another `!important`.

For example, if the theme fixes a maximum width as follows, application CSS loaded afterward still cannot override it naturally.

```scss
ion-action-sheet {
  --max-width: 640px !important;
}
```

In `v9.1.0`, I reduced the number of `!important` declarations in the distributed `src/styles` as follows.

| Theme | v9.0.2 | v9.1.0 |
| --- | ---: | ---: |
| Material Design 3 | 3 | 0 |
| iOS 26 | 13 | 1 |

The MD3 theme no longer uses `!important` for the maximum width of an Action Sheet, the border of an Outline field in an Inset List, or the icon size of a Button in a List.

The one declaration left in the iOS 26 theme controls the padding of a centered `ion-searchbar`. Waiting for the class that Ionic adds after initialization would let `transition: all` animate the padding from an incorrect initial value. I therefore kept this one declaration to hold the value steady before and after initialization, with a comment explaining why.

```scss
// Match before hydration as well, so Ionic's `transition: all`
// cannot animate through the inline value.
&:not(.searchbar-left-aligned) .searchbar-input-container input.searchbar-input {
  padding-inline-start: 2.4rem !important;
}
```

The goal is not to drive the count mechanically to zero. It is to remove declarations that have no defensible reason to be there and contain the justified exception in one place.

### Prefer public CSS custom properties to Shadow Parts

Ionic components are implemented as Web Components, and Ionic provides [CSS Shadow Parts](https://ionicframework.com/docs/theming/css-shadow-parts) for styling their internal elements.

Shadow Parts are a necessary API. When Ionic exposes a CSS custom property for the same purpose, however, a theme can use that public path instead.

The MD3 theme's Toggle, for example, previously set the track and handle backgrounds directly.

```scss
// Before
&.toggle-checked::part(track) {
  background: var(--ion-color-base);
}

&.toggle-checked::part(handle) {
  background: var(--ion-color-contrast);
}
```

In `v9.1.0`, the theme assigns values through properties exposed by Ionic.

```scss
// After
&.toggle-checked {
  --track-background-checked: var(--ion-color-base);
  --handle-background-checked: var(--ion-color-contrast);
}
```

The appearance remains the same, but applications can now override it through the same CSS custom properties. The theme also depends less on specific elements inside the Shadow DOM.

For this release, I cleaned up the Back Button, Range, Toggle, Item, and other components in the MD3 theme. In the iOS 26 theme, the review extended to Button, FAB, Modal, Popover, Range, Searchbar, Segment, Toast, and Toggle.

Eliminating Shadow Parts is not itself the objective. I use these three rules to decide which API to choose:

1. Use a CSS custom property when Ionic exposes one that matches the purpose
2. Use a Shadow Part when the public property would also change a different internal element
3. If no public property exists, use a Shadow Part only for the necessary scope

### Reusing only the layers needed for glass effects

The iOS 26 theme combines a background, blur, box shadow, and border in a Sass mixin to create its glass effects.

Previously, the mixin always emitted the complete effect. Even after moving a Popover's background to a CSS custom property, the mixin emitted the same background again on the Shadow Part. That required additional CSS to cancel an unnecessary declaration.

I added flags that let the mixin emit the background, box shadow, and border independently.

```scss
@mixin glass-background(
  // other parameters...
  $include-background: true,
  $include-box-shadow: true,
  $include-border: true
) {
  // Emit only the requested layers.
}
```

For a Popover, the theme now provides the background and box shadow through the host's `--background` and `--box-shadow`, while applying only effects such as blur to the Shadow Part.

Rather than always consuming a shared abstraction in its entirety, each component can now assemble only the layers it needs.

## Extending the same principles to Ionic APIs and supporting text

The review of CSS strength also uncovered places where theme defaults overrode colors explicitly selected by users.

For an `ion-note` outside an Inset List, I replaced the default color fixed through the regular `color` property with Ionic's `--color` property.

```scss
// Before
& > ion-note {
  color: var(--ion-color-medium-tint);
}

// After
& > ion-note {
  --color: var(--ion-color-medium-tint);
}
```

The Label and Icon in a List header now receive default colors only when `.ion-color` is absent. Ionic's standard declarations such as `color="primary"` and `color="danger"` therefore take priority as expected.

The other improvement concerns Input and Textarea counters. In `v9.0.0`, helper text and error text inside Inset Lists became part of the supporting-text layout. In `v9.1.0`, counters now participate in that existing layout as the same kind of content.

Whether an application uses Ionic's standard counter or `counterFormatter`, the lower area is no longer hidden and the borders of the Item and counter no longer overlap. Instead of adding a counter-specific exception, the theme handles elements with the same role through the same mechanism.

## Updating to v9.1.0

**This update requires no application-side markup changes.** To guard against visual regressions outside the intentionally corrected colors, disabled states, Radio Groups, and counters, I ran builds, component tests, computed-style checks, and light- and dark-mode visual regression tests.

Update the theme your application uses. If your application uses both themes for the iOS and MD modes, update both.

### iOS 26 theme

This theme supports `@ionic/core >=8.8.1 <10`.

```bash
npm install @rdlabo/ionic-theme-ios26@^9.1.0
```

### Material Design 3 theme

This theme supports `@ionic/core >=8.8.0 <10`.

```bash
npm install @rdlabo/ionic-theme-md3@^9.1.0
```

The implementation diffs, verification details, and related Pull Requests are available in each release note.

- [ionic-theme-ios26 v9.1.0 Release Notes](https://github.com/rdlabo-dev/ionic-theme-ios26/releases/tag/v9.1.0)
- [ionic-theme-md3 v9.1.0 Release Notes](https://github.com/rdlabo-dev/ionic-theme-md3/releases/tag/v9.1.0)

## One display bug prompted a review of the themes' overall strength

The Radio Group bug in Issue #129 could be fixed by changing a single selector. Without that minimal reproduction, however, I do not think I would have reviewed all the CSS that assumed the demo's DOM structure or obstructed application overrides at this point.

I would once again like to thank the reporter of Issue #129 for providing a concrete reproduction. If you encounter a problematic combination of components or styles that are difficult to override, please let me know by opening an Issue for the [iOS 26 theme](https://github.com/rdlabo-dev/ionic-theme-ios26/issues) or [MD3 theme](https://github.com/rdlabo-dev/ionic-theme-md3/issues).

A theme should provide good defaults and no more. Returning control beyond those defaults to Ionic's public APIs and the CSS cascade is also an important measure of quality for an open source theme.
