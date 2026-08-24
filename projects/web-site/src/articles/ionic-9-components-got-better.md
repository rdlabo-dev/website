---
title: "Ionic 9 Is Here! Web Standardization Takes a Big Step Forward — Five Major Changes"
description: "Ionic Framework 9 highlights five changes that matter in day-to-day app development: rich Select options, Font Icons in ion-icon, ion-img deprecation, cleaner form controls, and more accessible sheet modal handles."
zennSlug: ionic-9-components-got-better
emoji: "🚀"
---

Ionic Framework 9 has been released.

https://ionic.io/blog/announcing-ionic-framework-9

The announcement centers on React Router 6 and Vue Router 5 support, Angular 18 through 22 support, a Select that can handle rich content, Font Icon support, and a new migration tool. Each is a major-update-sized change.

From that list, this article picks five changes that directly affect app development and user experience.

1. `ion-select-option` now supports rich content
2. `ion-icon` supports Font Icons
3. `ion-img` has finished its job and hands off to the browser-standard `img`
4. Input, Textarea, and Searchbar behavior and internal DOM are cleaned up
5. Sheet modal handle interaction expands beyond drag alone

Web standardization is symbolized by the move from `ion-img` to native `img`. But Ionic 9 also advances component extensibility, API consistency, and accessibility together. Let's walk through all five changes in order.

## 1. Select options go from "plain text" to "small UI"

First, the most visually obvious new feature in Ionic 9: `ion-select-option` now supports rich content.

Until now, what you could show in a Select Option was basically plain text only.

```html
<ion-select-option value="train">Train</ion-select-option>
```

For prefectures or simple statuses, that is enough. But if you want to pick an assignee while seeing a profile photo, show product photos alongside prices, or display travel time and amenities for each mode of transport, it suddenly feels cramped.

In Ionic 9, you can place images, Avatars, Icons, Badges, and more in the start and end slots of `ion-select-option`. You can also use `description` to show a second line of supplementary information below the label.

```html
<ion-select label="Transportation" interface="modal">
  <ion-select-option
    value="train"
    description="Reserved seat · Wi-Fi"
  >
    <ion-icon
      slot="start"
      name="train"
      size="large"
      aria-hidden="true"
    ></ion-icon>

    <span>Train</span>

    <ion-badge slot="end" color="tertiary">
      ¥6,400
    </ion-badge>
  </ion-select-option>
</ion-select>
```

Here is how it looks in action.

![](/images/ionic-9-components-got-better/select-rich-content.gif)

> Source: Converted to GIF from the [demo video](https://ionic.io/blog/wp-content/uploads/2026/08/Demo1_SelectRichContent.mp4) in the Ionic blog post "[Announcing Ionic Framework 9](https://ionic.io/blog/announcing-ionic-framework-9)"

This is not a modal-only feature. It works across all four Select interfaces Ionic provides: `alert`, `action-sheet`, `popover`, and `modal`. You can pick the opening style that fits the screen size and use case while reusing the same Option markup.

Options are no longer just a vertical list of strings. With standard components alone, you can build Selects like these:

- Assignee selection with Avatar, name, and department
- Product selection with thumbnail, product name, and price
- Payment method selection with Icon, payment method, and availability
- Country selection with flag, country name, and country code

Screens that used to make you give up on Select and build a custom Modal can come back within `ion-select`. You keep value management, keyboard interaction, focus handling, and device-appropriate overlays—the things Select is good at—while increasing the amount of information shown. That is the appealing part.

### Rich content must be enabled explicitly

`description` works without extra configuration. On the other hand, markup passed into slots is not rendered by default. In an Angular standalone setup, enable `innerHTMLTemplatesEnabled` in Ionic Config.

```ts
provideIonicAngular({
  innerHTMLTemplatesEnabled: true,
});
```

If this setting stays `false`, markup inside an Option is treated as plain text. This is an app-wide setting that affects not only Select but also Alert, Toast, and more. Do not pipe untrusted strings through directly; always sanitize values from external sources or user input appropriately. See the official [Security documentation](https://ionicframework.com/docs/techniques/security#enabling-custom-html-parsing-via-innerhtml) for details.

Note that the rich display appears inside the interface after you open Select. Once you choose an option and close Select, the field shows only the Option's plain text—the start and end slots and `description` are not included.

When open, show enough information to choose. When closed, show the selected value concisely. That switch is a good balance for keeping the form from feeling heavy overall.

## 2. `ion-icon` can now use Font Icons

When you think of icons in Ionic, you think of Ionicons. Pass an icon name or SVG to `ion-icon` and display it in a form that fits both iOS and Material Design. It is a familiar combination in Ionic apps.

On the other hand, many teams adopt Font Awesome, Bootstrap Icons, Material Symbols, Phosphor Icons, or similar as a project-wide design system. Until now, you could not treat those Font Icons the same way as `ion-icon`.

In Ionic 9, loaded Font Icons can be placed directly inside `ion-icon`.

For Bootstrap Icons, first install the package and load the stylesheet.

```shell
npm install bootstrap-icons
```

```css
/* global.css */
@import 'bootstrap-icons/font/bootstrap-icons.css';
```

```html
<ion-icon color="primary" aria-hidden="true">
  <i class="bi bi-house-fill"></i>
</ion-icon>
```

The same applies in a Button's start slot or anywhere you used to place Ionicons.

```html
<ion-button fill="outline" color="danger">
  <ion-icon slot="start" aria-hidden="true">
    <i class="bi bi-trash-fill"></i>
  </ion-icon>
  Delete
</ion-button>
```

Wrapping with `ion-icon` lets you keep using Ionic's `color`, `size`, and when needed, reversal via `flip-rtl`. You can align the app's Icon API while choosing an icon set that matches the product design system.

However, Font Icon size is adjusted with `font-size`, like a font—not with SVG `width` and `height`.

```css
ion-icon.large-font-icon {
  font-size: 32px;
}
```

Ionic 9 also lets you place custom SVG markup directly in an `ion-icon` slot, in addition to loading external SVG via `src`.

```html
<ion-icon aria-label="Custom icon">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <!-- Custom path -->
  </svg>
</ion-icon>
```

Whether you use Ionicons, another icon library, or custom SVG, you can handle the difference through the shared container of `ion-icon` instead of scattering it across UI code. For teams that want to adapt Ionic's look to their theme and brand, this is a very practical extension.

## 3. `ion-img` finishes its job and returns its role to web standards

`ion-img` is deprecated and will be removed in Ionic 10.

`ion-img` was a component that took on lazy image loading when browsers did not have it. But today's browsers have `loading="lazy"`.

So in Ionic 9, you rewrite like this.

```diff html
-<ion-img src="/assets/image.png" alt="Product image"></ion-img>
+<img
+  src="/assets/image.png"
+  alt="Product image"
+  loading="lazy"
+/>
```

This is less about losing functionality and more about the browser catching up, so Ionic's thin wrapper is no longer needed. You can express the same intent in HTML alone, and developers who do not know Ionic can still read the code. You do not need to think about Web Components internals either.

You can style it directly too.

```diff css
-ion-img::part(image) {
-  border-radius: 8px;
-}
+img {
+  border-radius: 8px;
+}
```

Event names also return to standards. Replace `ionImgDidLoad` with `load` and `ionError` with `error`. However, native `load` and `error` do not bubble. If you relied on event delegation on a parent element, you need to listen on each `img` or use the capture phase.

```ts
parent.addEventListener('load', handler, true);
```

Also, `ionImgWillLoad`, which fired just before lazy loading started, has no direct native replacement. If you really need that timing, use `IntersectionObserver`.

Rather than holding on to a custom component forever, Ionic lets go when the platform can take over. Deprecating `ion-img` is a forward-looking exit that fits Ionic as a framework built on web technology.

## 4. Input, Textarea, and Searchbar behavior becomes more straightforward

This section looks at form-related changes as one group. API types, label behavior, Textarea height, and the internal DOM that supports them were cleaned up together. Each change may look small on its own, but they add up because these are components you touch every day.

### `autocorrect` is finally a boolean

Until Ionic 8, `autocorrect` on `ion-input` and `ion-searchbar` was `"on" | "off"`. In Ionic 9, both are `boolean`, and the default is `false`.

Watch out for Ionic's boolean property conversion here.

```html
<!-- true in Ionic 9 -->
<ion-input autocorrect="off"></ion-input>
```

When you pass a value as an attribute to an Ionic boolean property, everything except the string `"false"` converts to `true`. So if you leave `autocorrect="off"` out of habit, autocorrect turns on—the opposite of what you intended.

If you want it disabled, remove the attribute. To enable it, use property binding in Angular.

```diff html
-<ion-input autocorrect="on"></ion-input>
+<ion-input [autocorrect]="true"></ion-input>

-<ion-searchbar autocorrect="off"></ion-searchbar>
+<ion-searchbar></ion-searchbar>
```

In React, use `autocorrect={true}`. In Vue, use `:autocorrect="true"`.

Moving from an on/off string API to a boolean that frameworks can type-check is a small surface change, but it aligns template type checking with runtime meaning—a satisfying improvement.

### Floating labels look at input state, not decoration

On `ion-input` and `ion-textarea`, floating label behavior changed too.

Previously, a label could float automatically just because start or end slots had content. In Ionic 9, slot content alone does not make the label float.

The label moves when either of these is true:

- The form control has focus
- The form control has a value

It no longer reacts to icons or buttons beside the field—it looks at whether the user is about to enter input or has already entered a value. Label position and form state now align more naturally.

```html
<ion-input label="Email address" label-placement="floating">
  <ion-icon
    slot="start"
    name="mail-outline"
    aria-hidden="true"
  ></ion-icon>
</ion-input>
```

This Input does not push the label up just because a mail icon is present. The label moves the moment you focus, and it stays there if a value remains. What the user is visually tracking matches what the component shows.

### Textarea height is aligned too

In Material Design mode, `ion-textarea` now has a minimum height of `72px`. With the default number of rows, height is the same regardless of `fill` or `labelPlacement`.

Previously, depending on the combination of `fill` and `labelPlacement`, minimum height was either `44px` or `56px`. In Ionic 9, for the default row count with no slots, the minimum height baseline aligns to `72px`. That makes it easier to create rhythm when stacking forms vertically.

However, `72px` is taller than two lines of text, so in `md` mode both `rows="1"` and `rows="2"` render at `72px`. Screens that explicitly relied on `rows` for a smaller height need a check.

To return to the previous height, override with a custom class at higher specificity.

```html
<ion-textarea class="compact-textarea" rows="1"></ion-textarea>
```

```css
ion-textarea.compact-textarea {
  min-height: 44px;
}
```

### Internal DOM is organized into "central input" and "front/back decoration"

Supporting the floating label improvements on `ion-input` and `ion-textarea` is a reorganization of internal DOM structure.

For Input, three regions were added:

```text
.input-start
.input-control
.input-end
```

The label and native `input` go into the central `.input-control`. The start slot moves to `.input-start`, and the end slot and clear button move to `.input-end`.

```diff css
-ion-input .input-wrapper .native-wrapper { }
+ion-input .input-control .native-wrapper { }

-ion-input .input-wrapper .native-wrapper [slot="start"] { }
+ion-input .input-start [slot="start"] { }

-ion-input .input-wrapper .native-wrapper .input-clear-icon { }
+ion-input .input-end .input-clear-icon { }
```

Textarea follows the same idea. `.textarea-wrapper-inner` is removed, and `.textarea-control` is added in the center. `.start-slot-wrapper` and `.end-slot-wrapper` are renamed to `.textarea-start` and `.textarea-end` respectively.

```diff css
-ion-textarea .textarea-wrapper-inner .native-wrapper { }
+ion-textarea .textarea-control .native-wrapper { }

-ion-textarea .start-slot-wrapper [slot="start"] { }
+ion-textarea .textarea-start [slot="start"] { }

-ion-textarea .end-slot-wrapper [slot="end"] { }
+ion-textarea .textarea-end [slot="end"] { }
```

Because this is internal DOM, if you use only the public API you rarely need to think about it. On the other hand, if E2E tests or custom themes depend on internal classes, you need to revisit selectors.

Looking at the structure, it is more than a class rename. The label and input body are grouped as a "control," and icons and buttons are split into front and back regions. That makes it easier to move the label with input state even when slots are present.

It is not a breaking change in the public API, but internal structure and on-screen meaning are closer together.

## 5. Sheet modal handle interaction expands beyond drag

Sheet modals have a short line—a handle—that suggests they can be dragged. In Ionic 9, the default for `handleBehavior` on `ion-modal` changed from `"none"` to `"cycle"`.

```html
<ion-modal
  [initialBreakpoint]="0.5"
  [breakpoints]="[0, 0.5, 1]"
  [handle]="true"
></ion-modal>
```

This handle is now focusable. When activated via click, keyboard, or screen reader, it moves through the configured breakpoints in order.

This is close to native iOS sheet behavior. And more importantly, users who find drag difficult get the same functionality.

You could already drag the handle to move the sheet. What Ionic 9 adds is a path to activate the handle itself and switch breakpoints. Without fine drag gestures, you can move the same sheet step by step from click, keyboard, or a screen reader.

If you want the handle to remain drag-only as before, you can explicitly set it back to `none`. With `none`, drag still works.

```html
<ion-modal handle-behavior="none"></ion-modal>
```

Changing the default opens handle activation to assistive technology. That is a welcome change.

## Three things to check when migrating

Separate from the five changes above, here are changes worth confirming when upgrading from Ionic 8.

### Select's `ionChange` fires only when the value actually changes

In Ionic 9, `ionChange` on `ion-select` fires only when the selected value actually changes. On alert and action sheet before, it also fired when you confirmed an Option that was already selected.

If you need to detect confirmation with the same value or overlay dismissal, use `ionDismiss` or the underlying Alert / Action Sheet `didDismiss` instead of `ionChange`.

### Check supported browsers

Ionic 9's minimum browser support is Chrome 89, Chrome for Android 89, Edge 89, Firefox 75, Safari 16, and iOS 16. If your project has `browserslist` or `.browserslistrc`, confirm your targets align.

Being able to update supported browsers to modern ones is part of why `ion-img` could return its role to web standards.

### Capacitor 7+ is officially supported

Ionic 9 officially supports Capacitor 7 and later. Fallbacks to older native detection for Capacitor 2 were also removed. Apps on older Capacitor versions need Capacitor updates in the migration plan—not Ionic alone.

## Start the upgrade with the migration tool

Ionic 9 also ships a migration tool for major updates.

```shell
npx @ionic/migrate
```

It auto-fixes safe changes such as Angular import paths, removing `~` from CSS imports, and rewriting React Router from `component` to `element`. For items it cannot automate, it points to the target file, line number, and relevant section of the upgrade guide.

If you do not want to rewrite immediately, start with `--dry-run`.

```shell
npx @ionic/migrate --dry-run
```

The tool generally will not run on a dirty working tree. Commit first, then review the diff afterward—that flow is part of the design. Ionic 9's stance here is also: do not let upgrading become a "melt the weekend" task.

## What Ionic 9's evolution looks like through these five changes

The changes covered here share a common thread.

Select Option can carry small UI while keeping the reassurance of a standard component. `ion-icon` becomes a container that accepts icon libraries beyond Ionicons and custom SVG. `ion-img` returns its role to web standards, and form control types and structure are organized into shapes that are easier to understand. Sheet modals can switch breakpoints from click, keyboard, and screen readers in addition to drag.

Rather than stacking new abstractions, Ionic removes abstractions that are no longer needed and makes existing UI feel more natural.

Ionic 9 may be an update that is hard to convey in screenshots alone. But when you write code, touch forms, and operate sheets, you notice fewer small friction points one by one.

Oh, nice change. It is a release that carefully reduces those small friction points.

When migrating, also review the official [update guide](https://ionicframework.com/docs/updating/9-0) and the [complete list of breaking changes](https://github.com/ionic-team/ionic-framework/blob/main/BREAKING.md#version-9x).
