---
title: API
---

`@rdlabo/ionic-angular-kit` v21.7.0 のpublic entry point一覧です。Lifecycleと統合要件は各Guideで説明し、このページではAPI familyを所有するpackage pathを定義します。

## Core

#### `module` @rdlabo/ionic-angular-kit

| API family     | Principal exports                                                   | Guide                                       |
| -------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| Storage        | `KitStorageService`, `kitClearStoragePreservingKeys`                | [Storage・Overlay](/docs/storage-overlays)  |
| Overlay        | `provideKitOverlay`, `KitOverlayController`, `KitLoadingController` | [Storage・Overlay](/docs/storage-overlays)  |
| Authentication | `provideKitAuth`、Guard function、`KitAuthAccessService`            | [認証・HTTP](/docs/auth-http)               |
| HTTP           | `provideKitHttp`, `kitAuthInterceptor`                              | [認証・HTTP](/docs/auth-http)               |
| Realtime       | `KitRealtimeConnection`, `KitRealtimeLivenessWatchdog`              | [Offline・Realtime](/docs/offline-realtime) |

## Optional entry point

#### `module` @rdlabo/ionic-angular-kit/offline

Offline repository、同期Replica、Outbox、Request Policy、Schema、Identity、Recovery APIです。Composition Rootには `provideOffline` または用途別Providerを使います。

#### `module` @rdlabo/ionic-angular-kit/auth-firebase

Firebase Authentication Providerと、Sign-in、Sign-up、Link、Reauthentication、Verification、Password、Account更新の型付き関数です。

#### `module` @rdlabo/ionic-angular-kit/auth-firebase/social

Apple・Facebook Social Authentication helperとresponse・option typeです。

#### `module` @rdlabo/ionic-angular-kit/app-update

Native Application Update確認用の `provideKitAppUpdate` と `KitAppUpdateService` です。

#### `module` @rdlabo/ionic-angular-kit/live-update

Live Updateの起動準備を連携する `provideLiveUpdateReadiness` です。

#### `module` @rdlabo/ionic-angular-kit/printer

PDF Layout、DOM-to-PNG、Preview、Download、Rotation、Paper Size、Brother Print設定のhelperです。

#### `module` @rdlabo/ionic-angular-kit/review

Native Review Prompt用の `kitRequestReview` と `KitRequestReviewOptions` です。

#### `module` @rdlabo/ionic-angular-kit/theme

Theme選択を保存する `provideKitTheme`、`KitThemeController`、`KitThemeConfig`、`KitThemeMode` です。
