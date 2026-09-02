---
title: API
---

Public entry-point map for `@rdlabo/ionic-angular-kit` v22.0.0. The focused guide pages describe lifecycle and integration requirements; this page defines which package path owns each API family.

## Core

#### `module` @rdlabo/ionic-angular-kit

| API family     | Principal exports                                                   | Guide                                          |
| -------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| Storage        | `KitStorageService`, `kitClearStoragePreservingKeys`                | [Storage and Overlays](/docs/storage-overlays) |
| Overlay        | `provideKitOverlay`, `KitOverlayController`, `KitLoadingController` | [Storage and Overlays](/docs/storage-overlays) |
| Authentication | `provideKitAuth`, guard functions, `KitAuthAccessService`           | [Authentication and HTTP](/docs/auth-http)     |
| HTTP           | `provideKitHttp`, `kitAuthInterceptor`                              | [Authentication and HTTP](/docs/auth-http)     |
| Realtime       | `KitRealtimeConnection`, `KitRealtimeLivenessWatchdog`              | [Offline and Realtime](/docs/offline-realtime) |

## Optional entry points

#### `module` @rdlabo/ionic-angular-kit/offline

Offline repository, synchronized replica, outbox, request-policy, schema, identity, and recovery APIs. Use `provideOffline` or its focused provider variants as the composition root.

#### `module` @rdlabo/ionic-angular-kit/forms

`KitIonicFormField`, `provideKitIonicSignalForms`, `kitDefaultSignalFormErrorMessage`, `KIT_SIGNAL_FORM_ERROR_MESSAGE_RESOLVER`, and `KitSignalFormErrorMessageResolver` for adapting Angular 22 Signal Forms to Ionic controls. See [Forms](/docs/forms).

#### `module` @rdlabo/ionic-angular-kit/auth-firebase

Firebase authentication providers and typed sign-in, sign-up, linking, reauthentication, verification, password, and account-update functions.

#### `module` @rdlabo/ionic-angular-kit/auth-firebase/social

Apple and Facebook social authentication helpers and their response and option types.

#### `module` @rdlabo/ionic-angular-kit/app-update

`provideKitAppUpdate` and `KitAppUpdateService` for coordinated Angular service-worker updates.

#### `module` @rdlabo/ionic-angular-kit/live-update

`provideLiveUpdateReadiness` for coordinating Live Update startup readiness.

#### `module` @rdlabo/ionic-angular-kit/printer

PDF layout, DOM-to-PNG, preview, download, rotation, paper-size, and Brother Print settings helpers.

#### `module` @rdlabo/ionic-angular-kit/review

`kitRequestReview` and `KitRequestReviewOptions` for native review prompts.

#### `module` @rdlabo/ionic-angular-kit/theme

`provideKitTheme`, `KitThemeController`, `KitThemeConfig`, and `KitThemeMode` for persisted theme selection.
